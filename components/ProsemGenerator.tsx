'use client';

import React, { useState } from 'react';
import { 
  Calendar, Sparkles, Copy, Check, CheckCircle2, School, Edit3, Printer
} from 'lucide-react';
import { ProsemRow } from '@/app/api/gemini/generate-prosem/route';
import { DocumentExportToolbar } from '@/components/DocumentExportToolbar';
import { escapeHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

interface ProsemMonthDef {
  name: string;
  weeks: {
    key: string;
    num: number;
    isEfektif: boolean;
    labelNote?: string;
  }[];
}

// Exact weekly structure as specified in prompt:
// Ganjil: Juli = 2 & 2, Ags = 4 & 0, Sep = 2 & 2 (STS mgg 3,4), Okt = 4 & 0, Nov = 4 & 0, Des = 2 & 2 (SAS mgg 1,2)
const GANJIL_MONTHS: ProsemMonthDef[] = [
  {
    name: 'Juli',
    weeks: [
      { key: 'Juli_1', num: 1, isEfektif: false, labelNote: 'Libur Akhir Tahun Pelajaran' },
      { key: 'Juli_2', num: 2, isEfektif: false, labelNote: 'MPLS / Persiapan Ajaran Baru' },
      { key: 'Juli_3', num: 3, isEfektif: true },
      { key: 'Juli_4', num: 4, isEfektif: true },
    ],
  },
  {
    name: 'Agustus',
    weeks: [
      { key: 'Agustus_1', num: 1, isEfektif: true },
      { key: 'Agustus_2', num: 2, isEfektif: true },
      { key: 'Agustus_3', num: 3, isEfektif: true },
      { key: 'Agustus_4', num: 4, isEfektif: true },
    ],
  },
  {
    name: 'September',
    weeks: [
      { key: 'September_1', num: 1, isEfektif: true },
      { key: 'September_2', num: 2, isEfektif: true },
      { key: 'September_3', num: 3, isEfektif: false, labelNote: 'Asesmen Sumatif Tengah Semester (STS) Ganjil' },
      { key: 'September_4', num: 4, isEfektif: false, labelNote: 'Asesmen Sumatif Tengah Semester (STS) Ganjil' },
    ],
  },
  {
    name: 'Oktober',
    weeks: [
      { key: 'Oktober_1', num: 1, isEfektif: true },
      { key: 'Oktober_2', num: 2, isEfektif: true },
      { key: 'Oktober_3', num: 3, isEfektif: true },
      { key: 'Oktober_4', num: 4, isEfektif: true },
    ],
  },
  {
    name: 'November',
    weeks: [
      { key: 'November_1', num: 1, isEfektif: true },
      { key: 'November_2', num: 2, isEfektif: true },
      { key: 'November_3', num: 3, isEfektif: true },
      { key: 'November_4', num: 4, isEfektif: true },
    ],
  },
  {
    name: 'Desember',
    weeks: [
      { key: 'Desember_1', num: 1, isEfektif: false, labelNote: 'Asesmen Sumatif Akhir Semester (SAS) Ganjil' },
      { key: 'Desember_2', num: 2, isEfektif: false, labelNote: 'Asesmen Sumatif Akhir Semester (SAS) Ganjil' },
      { key: 'Desember_3', num: 3, isEfektif: true, labelNote: 'Remedial & Cadangan' },
      { key: 'Desember_4', num: 4, isEfektif: true, labelNote: 'Porseni & Pembagian Rapor' },
    ],
  },
];

// Genap: Jan = 4 & 0, Feb = 4 & 0, Mar = 0 & 4 (STS mgg 1,2, Libur Ramadhan), Apr = 5 & 0, Mei = 4 & 0, Jun = 2 & 2 (SAT mgg 1,2)
const GENAP_MONTHS: ProsemMonthDef[] = [
  {
    name: 'Januari',
    weeks: [
      { key: 'Januari_1', num: 1, isEfektif: true },
      { key: 'Januari_2', num: 2, isEfektif: true },
      { key: 'Januari_3', num: 3, isEfektif: true },
      { key: 'Januari_4', num: 4, isEfektif: true },
    ],
  },
  {
    name: 'Februari',
    weeks: [
      { key: 'Februari_1', num: 1, isEfektif: true },
      { key: 'Februari_2', num: 2, isEfektif: true },
      { key: 'Februari_3', num: 3, isEfektif: true },
      { key: 'Februari_4', num: 4, isEfektif: true },
    ],
  },
  {
    name: 'Maret',
    weeks: [
      { key: 'Maret_1', num: 1, isEfektif: false, labelNote: 'Asesmen Sumatif Tengah Semester (STS) Genap' },
      { key: 'Maret_2', num: 2, isEfektif: false, labelNote: 'Asesmen Sumatif Tengah Semester (STS) Genap' },
      { key: 'Maret_3', num: 3, isEfektif: false, labelNote: 'Libur Awal Ramadhan' },
      { key: 'Maret_4', num: 4, isEfektif: false, labelNote: 'Pondok Ramadhan & Karakter' },
    ],
  },
  {
    name: 'April',
    weeks: [
      { key: 'April_1', num: 1, isEfektif: true },
      { key: 'April_2', num: 2, isEfektif: true },
      { key: 'April_3', num: 3, isEfektif: true },
      { key: 'April_4', num: 4, isEfektif: true },
      { key: 'April_5', num: 5, isEfektif: true },
    ],
  },
  {
    name: 'Mei',
    weeks: [
      { key: 'Mei_1', num: 1, isEfektif: true },
      { key: 'Mei_2', num: 2, isEfektif: true },
      { key: 'Mei_3', num: 3, isEfektif: true },
      { key: 'Mei_4', num: 4, isEfektif: true },
    ],
  },
  {
    name: 'Juni',
    weeks: [
      { key: 'Juni_1', num: 1, isEfektif: false, labelNote: 'Asesmen Sumatif Akhir Tahun (SAT) Genap' },
      { key: 'Juni_2', num: 2, isEfektif: false, labelNote: 'Asesmen Sumatif Akhir Tahun (SAT) Genap' },
      { key: 'Juni_3', num: 3, isEfektif: true, labelNote: 'Porseni & Evaluasi Fisik' },
      { key: 'Juni_4', num: 4, isEfektif: true, labelNote: 'Penyerahan Rapor Kenaikan Kelas' },
    ],
  },
];

export function ProsemGenerator() {
  // Identity states
  const [namaSekolah, setNamaSekolah] = useState('SD Negeri Kalimantong');
  const [namaMapel, setNamaMapel] = useState('Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)');
  const [kelas, setKelas] = useState('Kelas V (Lima)');
  const [fase, setFase] = useState('Fase C');
  const [tahunPelajaran, setTahunPelajaran] = useState('2026/2027');
  const [alokasiJpPerMinggu, setAlokasiJpPerMinggu] = useState<number>(4);

  // Signatures
  const [kepalaSekolah, setKepalaSekolah] = useState('H. A. Kadir, S.Pd., M.Pd.');
  const [nipKepalaSekolah, setNipKepalaSekolah] = useState('19680512 199303 1 008');
  const [guruMapel, setGuruMapel] = useState('Guru PJOK SD Negeri Kalimantong');
  const [nipGuru, setNipGuru] = useState('19880724 201503 1 003');
  const [titimangsa, setTitimangsa] = useState('Kalimantong, 13 Juli 2026');

  // Input PROTA Text
  const [protaText, setProtaText] = useState(
    `SEMESTER GANJIL:
- Bab 1: Permainan Bola Besar (Sepak Bola & Bola Voli) - 16 JP (4 pertemuan)
- Bab 2: Permainan Bola Kecil (Kasti / Rounders) - 12 JP (3 pertemuan)
- Bab 3: Aktivitas Atletik Dasar (Lari Jarak Pendek 40m & Lompat Jauh) - 16 JP (4 pertemuan)
- Bab 4: Kebugaran Jasmani Terkait Kesehatan & Baterai Tes TKJI - 20 JP (5 pertemuan)
- Cadangan, Remedial, dan Evaluasi Akhir Semester - 8 JP (2 pertemuan)

SEMESTER GENAP:
- Bab 5: Senam Lantai Ketangkasan (Guling Depan & Keseimbangan Statis) - 16 JP (4 pertemuan)
- Bab 6: Aktivitas Gerak Berirama (SKJ & Langkah Kaki Variatif) - 16 JP (4 pertemuan)
- Bab 7: Aktivitas Air & Prosedur Keselamatan di Kolam Renang - 20 JP (5 pertemuan)
- Bab 8: Kebersihan Alat Reproduksi & Pola Hidup Bersih Sehat (PHBS) - 16 JP (4 pertemuan)
- Cadangan, Remedial, dan Evaluasi Akhir Tahun - 8 JP (2 pertemuan)`
  );

  // Execution states
  const [loading, setLoading] = useState(false);
  const [ganjilRows, setGanjilRows] = useState<ProsemRow[] | null>(null);
  const [genapRows, setGenapRows] = useState<ProsemRow[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<'print' | 'edit'>('print');

  // Check if transition class (Kelas 1, 7, 10)
  const isKelasTransisi = /\b(1|7|10|I|VII|X)\b/i.test(kelas);

  // Generate PROSEM via AI route
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await postJsonSafe<{ ganjilRows?: ProsemRow[]; genapRows?: ProsemRow[] }>(
        '/api/gemini/generate-prosem',
        {
          namaSekolah,
          namaMapel,
          kelas,
          fase,
          tahunPelajaran,
          alokasiJpPerMinggu,
          protaText,
          kepalaSekolah,
          nipKepalaSekolah,
          guruMapel,
          nipGuru,
          titimangsa,
        }
      );

      if (res.data?.ganjilRows && res.data?.genapRows) {
        setGanjilRows(res.data.ganjilRows);
        setGenapRows(res.data.genapRows);
      }
    } finally {
      setLoading(false);
    }
  };

  // Row update handlers
  const handleUpdateGanjilRow = (index: number, field: keyof ProsemRow, value: unknown) => {
    if (!ganjilRows) return;
    const updated = [...ganjilRows];
    updated[index] = { ...updated[index], [field]: value };
    setGanjilRows(updated);
  };

  const handleUpdateGenapRow = (index: number, field: keyof ProsemRow, value: unknown) => {
    if (!genapRows) return;
    const updated = [...genapRows];
    updated[index] = { ...updated[index], [field]: value };
    setGenapRows(updated);
  };

  const handleCellDistGanjil = (rowIndex: number, weekKey: string, val: number) => {
    if (!ganjilRows) return;
    const updated = [...ganjilRows];
    const dist = { ...updated[rowIndex].distribution };
    if (val > 0) {
      dist[weekKey] = val;
    } else {
      delete dist[weekKey];
    }
    updated[rowIndex] = { ...updated[rowIndex], distribution: dist };
    setGanjilRows(updated);
  };

  const handleCellDistGenap = (rowIndex: number, weekKey: string, val: number) => {
    if (!genapRows) return;
    const updated = [...genapRows];
    const dist = { ...updated[rowIndex].distribution };
    if (val > 0) {
      dist[weekKey] = val;
    } else {
      delete dist[weekKey];
    }
    updated[rowIndex] = { ...updated[rowIndex], distribution: dist };
    setGenapRows(updated);
  };

  // Build HTML for Word / PDF / Print export in LANDSCAPE orientation
  const buildExportHtml = (): string => {
    if (!ganjilRows || !genapRows) return '';

    const renderWordRows = (rows: ProsemRow[], monthsDef: ProsemMonthDef[]) => {
      return rows
        .map((r) => {
          const weekTds = monthsDef
            .flatMap((m) =>
              m.weeks.map((w) => {
                if (!w.isEfektif) {
                  return `<td style="border:1pt solid #000; padding:4pt 2pt; text-align:center; background-color:#e2e8f0; color:#64748b; font-size:8pt;">-</td>`;
                }
                const val = r.distribution[w.key];
                return `<td style="border:1pt solid #000; padding:4pt 2pt; text-align:center; font-weight:bold; font-size:9pt; ${val ? 'background-color:#dcfce7; color:#15803d;' : ''}">${val || ''}</td>`;
              })
            )
            .join('');

          return `
            <tr style="${r.isCadangan ? 'background-color:#fef9c3; font-weight:bold;' : ''}">
              <td style="border:1pt solid #000; padding:5pt; font-size:9pt; vertical-align:top;">${escapeHtml(r.unitBab)}</td>
              <td style="border:1pt solid #000; padding:5pt; font-size:9pt; vertical-align:top;">${escapeHtml(r.topikKonten)}</td>
              <td style="border:1pt solid #000; padding:5pt; font-size:9pt; text-align:center; vertical-align:top;">${escapeHtml(r.pertemuanKe)}</td>
              <td style="border:1pt solid #000; padding:5pt; font-size:9pt; text-align:center; vertical-align:top; font-weight:bold;">${r.alokasiWaktu} JP</td>
              ${weekTds}
              <td style="border:1pt solid #000; padding:5pt; font-size:8.5pt; vertical-align:top;">${escapeHtml(r.keterangan || '')}</td>
            </tr>
          `;
        })
        .join('');
    };

    const totalJpGanjil = ganjilRows.reduce((a, b) => a + (Number(b.alokasiWaktu) || 0), 0);
    const totalJpGenap = genapRows.reduce((a, b) => a + (Number(b.alokasiWaktu) || 0), 0);
    const totalJpTahunan = totalJpGanjil + totalJpGenap;

    return `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>PROSEM - ${namaMapel} ${kelas}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page WordSection1 {
            size: 297mm 210mm;
            margin: 12mm 10mm 12mm 10mm;
            mso-page-orientation: landscape;
          }
          div.WordSection1 {
            page: WordSection1;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 10pt;
            line-height: 1.25;
            color: #000000;
          }
          h1 {
            font-size: 13pt;
            font-weight: bold;
            text-align: center;
            margin: 0 0 3pt 0;
            text-transform: uppercase;
          }
          h2 {
            font-size: 11pt;
            font-weight: bold;
            text-align: center;
            margin: 0 0 10pt 0;
            text-transform: uppercase;
          }
          table.meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8pt;
            font-size: 9.5pt;
          }
          table.meta-table td {
            padding: 1.5pt 0;
            border: none;
            vertical-align: top;
          }
          table.prosem-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16pt;
            font-size: 8.5pt;
          }
          table.prosem-table thead {
            display: table-header-group;
          }
          table.prosem-table tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          table.prosem-table th {
            background-color: #f1f5f9;
            color: #000000;
            font-weight: bold;
            text-align: center;
            padding: 4pt 2pt;
            border: 1pt solid #000000;
            font-size: 8.5pt;
          }
          .non-effective-th {
            background-color: #cbd5e1 !important;
            color: #1e293b;
          }
          .total-row td {
            background-color: #e2e8f0;
            font-weight: bold;
            border: 1pt solid #000000;
            padding: 5pt;
            font-size: 9pt;
          }
          table.sig-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15pt;
            font-size: 10pt;
            page-break-inside: avoid;
          }
          table.sig-table td {
            border: none;
            vertical-align: top;
            padding: 0;
          }
          .page-break {
            page-break-before: always;
          }
        </style>
      </head>
      <body>
        <div class="WordSection1">
          <!-- SEMESTER GANJIL TABLE -->
          <h1>PROGRAM SEMESTER (PROSEM) TAHUN PELAJARAN ${tahunPelajaran}</h1>
          <h2>SEMESTER I (GANJIL) • KURIKULUM MERDEKA</h2>

          <table class="meta-table">
            <tr>
              <td style="width: 140pt; font-weight: bold;">Satuan Pendidikan</td>
              <td style="width: 10pt;">:</td>
              <td style="width: 280pt;">${namaSekolah}</td>
              <td style="width: 140pt; font-weight: bold;">Tahun Pelajaran</td>
              <td style="width: 10pt;">:</td>
              <td>${tahunPelajaran}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Mata Pelajaran</td>
              <td>:</td>
              <td>${namaMapel}</td>
              <td style="font-weight: bold;">Alokasi Waktu per Minggu</td>
              <td>:</td>
              <td>${alokasiJpPerMinggu} Jam Pelajaran (JP)</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Kelas / Fase</td>
              <td>:</td>
              <td>${kelas} / ${fase}</td>
              <td style="font-weight: bold;">Total Pekan Efektif Ganjil</td>
              <td>:</td>
              <td>18 Pekan Efektif (${totalJpGanjil} JP)</td>
            </tr>
          </table>

          <table class="prosem-table" border="1">
            <thead>
              <tr>
                <th rowspan="2" style="width: 100pt;">Unit / BAB</th>
                <th rowspan="2" style="width: 150pt;">Topik / Konten</th>
                <th rowspan="2" style="width: 32pt;">Pert. Ke-</th>
                <th rowspan="2" style="width: 38pt;">Alokasi Waktu</th>
                <th colspan="4">Juli</th>
                <th colspan="4">Agustus</th>
                <th colspan="4">September</th>
                <th colspan="4">Oktober</th>
                <th colspan="4">November</th>
                <th colspan="4">Desember</th>
                <th rowspan="2" style="width: 110pt;">Keterangan</th>
              </tr>
              <tr>
                <!-- Juli (2 & 2) -->
                <th class="non-effective-th" style="width: 16pt;">1</th>
                <th class="non-effective-th" style="width: 16pt;">2</th>
                <th style="width: 16pt;">3</th>
                <th style="width: 16pt;">4</th>
                <!-- Agustus (4 & 0) -->
                <th style="width: 16pt;">1</th>
                <th style="width: 16pt;">2</th>
                <th style="width: 16pt;">3</th>
                <th style="width: 16pt;">4</th>
                <!-- September (2 & 2) -->
                <th style="width: 16pt;">1</th>
                <th style="width: 16pt;">2</th>
                <th class="non-effective-th" style="width: 16pt;">3</th>
                <th class="non-effective-th" style="width: 16pt;">4</th>
                <!-- Oktober (4 & 0) -->
                <th style="width: 16pt;">1</th>
                <th style="width: 16pt;">2</th>
                <th style="width: 16pt;">3</th>
                <th style="width: 16pt;">4</th>
                <!-- November (4 & 0) -->
                <th style="width: 16pt;">1</th>
                <th style="width: 16pt;">2</th>
                <th style="width: 16pt;">3</th>
                <th style="width: 16pt;">4</th>
                <!-- Desember (2 & 2) -->
                <th class="non-effective-th" style="width: 16pt;">1</th>
                <th class="non-effective-th" style="width: 16pt;">2</th>
                <th style="width: 16pt;">3</th>
                <th style="width: 16pt;">4</th>
              </tr>
            </thead>
            <tbody>
              ${renderWordRows(ganjilRows, GANJIL_MONTHS)}
              <tr class="total-row">
                <td colspan="3" style="text-align: right; text-transform: uppercase;">JUMLAH ALOKASI WAKTU SEMESTER I (GANJIL)</td>
                <td style="text-align: center;">${totalJpGanjil} JP</td>
                <td colspan="24" style="text-align: center; font-size: 8pt; color: #475569;">
                  Total 18 Pekan Efektif × ${alokasiJpPerMinggu} JP = ${totalJpGanjil} JP (Pekan Tidak Efektif: Juli mgg 1-2, Sep mgg 3-4 [STS], Des mgg 1-2 [SAS])
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <br class="page-break" />

          <!-- SEMESTER GENAP TABLE (BERADA DI BAWAH PROSEM GANJIL) -->
          <h1>PROGRAM SEMESTER (PROSEM) TAHUN PELAJARAN ${tahunPelajaran}</h1>
          <h2>SEMESTER II (GENAP) • KURIKULUM MERDEKA</h2>

          <table class="meta-table">
            <tr>
              <td style="width: 140pt; font-weight: bold;">Satuan Pendidikan</td>
              <td style="width: 10pt;">:</td>
              <td style="width: 280pt;">${namaSekolah}</td>
              <td style="width: 140pt; font-weight: bold;">Tahun Pelajaran</td>
              <td style="width: 10pt;">:</td>
              <td>${tahunPelajaran}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Mata Pelajaran</td>
              <td>:</td>
              <td>${namaMapel}</td>
              <td style="font-weight: bold;">Alokasi Waktu per Minggu</td>
              <td>:</td>
              <td>${alokasiJpPerMinggu} Jam Pelajaran (JP)</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Kelas / Fase</td>
              <td>:</td>
              <td>${kelas} / ${fase}</td>
              <td style="font-weight: bold;">Total Pekan Efektif Genap</td>
              <td>:</td>
              <td>19 Pekan Efektif (${totalJpGenap} JP)</td>
            </tr>
          </table>

          <table class="prosem-table" border="1">
            <thead>
              <tr>
                <th rowspan="2" style="width: 100pt;">Unit / BAB</th>
                <th rowspan="2" style="width: 150pt;">Topik / Konten</th>
                <th rowspan="2" style="width: 32pt;">Pert. Ke-</th>
                <th rowspan="2" style="width: 38pt;">Alokasi Waktu</th>
                <th colspan="4">Januari</th>
                <th colspan="4">Februari</th>
                <th colspan="4">Maret</th>
                <th colspan="5">April</th>
                <th colspan="4">Mei</th>
                <th colspan="4">Juni</th>
                <th rowspan="2" style="width: 110pt;">Keterangan</th>
              </tr>
              <tr>
                <!-- Januari (4 & 0) -->
                <th style="width: 16pt;">1</th>
                <th style="width: 16pt;">2</th>
                <th style="width: 16pt;">3</th>
                <th style="width: 16pt;">4</th>
                <!-- Februari (4 & 0) -->
                <th style="width: 16pt;">1</th>
                <th style="width: 16pt;">2</th>
                <th style="width: 16pt;">3</th>
                <th style="width: 16pt;">4</th>
                <!-- Maret (0 & 4) -->
                <th class="non-effective-th" style="width: 16pt;">1</th>
                <th class="non-effective-th" style="width: 16pt;">2</th>
                <th class="non-effective-th" style="width: 16pt;">3</th>
                <th class="non-effective-th" style="width: 16pt;">4</th>
                <!-- April (5 & 0) -->
                <th style="width: 16pt;">1</th>
                <th style="width: 16pt;">2</th>
                <th style="width: 16pt;">3</th>
                <th style="width: 16pt;">4</th>
                <th style="width: 16pt;">5</th>
                <!-- Mei (4 & 0) -->
                <th style="width: 16pt;">1</th>
                <th style="width: 16pt;">2</th>
                <th style="width: 16pt;">3</th>
                <th style="width: 16pt;">4</th>
                <!-- Juni (2 & 2) -->
                <th class="non-effective-th" style="width: 16pt;">1</th>
                <th class="non-effective-th" style="width: 16pt;">2</th>
                <th style="width: 16pt;">3</th>
                <th style="width: 16pt;">4</th>
              </tr>
            </thead>
            <tbody>
              ${renderWordRows(genapRows, GENAP_MONTHS)}
              <tr class="total-row">
                <td colspan="3" style="text-align: right; text-transform: uppercase;">JUMLAH ALOKASI WAKTU SEMESTER II (GENAP)</td>
                <td style="text-align: center;">${totalJpGenap} JP</td>
                <td colspan="25" style="text-align: center; font-size: 8pt; color: #475569;">
                  Total 19 Pekan Efektif × ${alokasiJpPerMinggu} JP = ${totalJpGenap} JP (Pekan Tidak Efektif: Mar mgg 1-4 [STS/Ramadhan], Jun mgg 1-2 [SAT])
                </td>
                <td></td>
              </tr>
              <tr style="background-color:#cbd5e1; font-weight:bold; font-size:9.5pt;">
                <td colspan="3" style="text-align: right; text-transform: uppercase; border:1.5pt solid #000; padding:6pt;">TOTAL ALOKASI WAKTU SATU TAHUN (SEMESTER I + II)</td>
                <td style="text-align: center; border:1.5pt solid #000; padding:6pt;">${totalJpTahunan} JP</td>
                <td colspan="26" style="border:1.5pt solid #000; padding:6pt; text-align:center;">
                  37 Pekan Efektif Belajar Tahunan (${totalJpTahunan} Jam Pelajaran)
                </td>
              </tr>
            </tbody>
          </table>

          <table class="sig-table">
            <tr>
              <td style="width: 50%;">
                Mengetahui,<br>
                Kepala ${escapeHtml(namaSekolah)}<br><br><br><br><br>
                <strong><u>${escapeHtml(kepalaSekolah)}</u></strong><br>
                NIP. ${escapeHtml(nipKepalaSekolah)}
              </td>
              <td style="width: 50%; text-align: left; padding-left: 50pt;">
                ${escapeHtml(titimangsa)}<br>
                Guru Mata Pelajaran PJOK<br><br><br><br><br>
                <strong><u>${escapeHtml(guruMapel)}</u></strong><br>
                NIP. ${escapeHtml(nipGuru)}
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;
  };

  const handleCopySummary = () => {
    if (!ganjilRows || !genapRows) return;
    const text = `PROSEM ${namaMapel} ${kelas} - Smt 1: ${ganjilRows.length} baris, Smt 2: ${genapRows.length} baris`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 font-black">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                  Kurikulum Merdeka • Program Semester
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-300">Format Horizontal Bulanan &amp; Blok Pekan Efektif</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                Generator Program Semester (PROSEM)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Petakan Bab, Topik, Pertemuan, dan Alokasi JP ke kolom horizontal Juli–Desember (Ganjil 18 Pekan) dan Januari–Juni (Genap 19 Pekan) lengkap dengan blok warna pekan tidak efektif (STS, SAS, Libur) serta ekspor Word Lanskap siap pakai.
              </p>
            </div>
          </div>

          {ganjilRows && (
            <div className="flex flex-wrap items-center gap-2">
              <DocumentExportToolbar
                title={`PROSEM - ${namaMapel} ${kelas}`}
                filenameBase={`PROSEM_${namaMapel}_${kelas}_${tahunPelajaran}`}
                getHtmlContent={buildExportHtml}
                orientation="landscape"
              />
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin' : 'Salin Info'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Legend / Status Rule Overview */}
        <div className="mt-5 pt-4 border-t border-slate-700/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
            <span className="font-bold text-rose-300 block mb-1">Rincian Pekan Semester Ganjil (18 Pekan Efektif):</span>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-300">
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Juli: 2 Efektif (mgg 3,4) • 2 Tidak</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Ags: 4 Efektif</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Sep: 2 Efektif • 2 STS (mgg 3,4)</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Okt: 4 Efektif</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Nov: 4 Efektif</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Des: 2 Efektif • 2 SAS (mgg 1,2)</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
            <span className="font-bold text-pink-300 block mb-1">Rincian Pekan Semester Genap (19 Pekan Efektif):</span>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-300">
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Jan: 4 Efektif</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Feb: 4 Efektif</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Mar: 0 Efektif (4 Tidak: STS &amp; Ramadhan)</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Apr: 5 Efektif</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Mei: 4 Efektif</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Jun: 2 Efektif • 2 SAT (mgg 1,2)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGenerate} className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Parameter Dokumen &amp; Sinkronisasi Data PROTA
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Total Alokasi Mingguan: <strong className="text-rose-400">{alokasiJpPerMinggu} JP/Minggu</strong>
          </span>
        </div>

        {/* Identity Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Satuan Pendidikan:</label>
            <input
              type="text"
              required
              value={namaSekolah}
              onChange={(e) => setNamaSekolah(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Mata Pelajaran:</label>
            <input
              type="text"
              required
              value={namaMapel}
              onChange={(e) => setNamaMapel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Kelas &amp; Fase:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-rose-500"
              />
              <input
                type="text"
                required
                value={fase}
                onChange={(e) => setFase(e.target.value)}
                className="w-24 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-rose-500"
              />
            </div>
            {!isKelasTransisi && (
              <span className="text-[10px] text-slate-400 mt-1 block">
                *Bukan kelas 1/7/10: MPLS tidak dimunculkan di keterangan
              </span>
            )}
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Alokasi JP per Minggu:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={10}
                required
                value={alokasiJpPerMinggu}
                onChange={(e) => setAlokasiJpPerMinggu(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold outline-none focus:border-rose-500"
              />
              <span className="text-slate-400 font-bold">JP</span>
            </div>
          </div>
        </div>

        {/* Input PROTA Text */}
        <div className="text-xs">
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-300 font-bold block">
              Data Program Tahunan (PROTA) yang akan Dipetakan ke PROSEM:
            </label>
            <span className="text-[11px] text-slate-400">
              Salin dari Generator PROTA atau ketik daftar bab dan alokasi JP
            </span>
          </div>
          <textarea
            required
            rows={5}
            value={protaText}
            onChange={(e) => setProtaText(e.target.value)}
            placeholder="Salin atau ketik rincian Bab, Topik, dan alokasi JP per semester dari PROTA..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 outline-none focus:border-rose-500 leading-relaxed"
          />
        </div>

        {/* Signatures & Titimangsa */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Titimangsa:</label>
            <input
              type="text"
              value={titimangsa}
              onChange={(e) => setTitimangsa(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Kepala Sekolah &amp; NIP:</label>
            <input
              type="text"
              value={kepalaSekolah}
              onChange={(e) => setKepalaSekolah(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-rose-500 mb-1"
            />
            <input
              type="text"
              value={nipKepalaSekolah}
              onChange={(e) => setNipKepalaSekolah(e.target.value)}
              placeholder="NIP Kepala Sekolah"
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-2 text-slate-300 text-[11px] outline-none"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Guru Mapel PJOK &amp; NIP:</label>
            <input
              type="text"
              value={guruMapel}
              onChange={(e) => setGuruMapel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-rose-500 mb-1"
            />
            <input
              type="text"
              value={nipGuru}
              onChange={(e) => setNipGuru(e.target.value)}
              placeholder="NIP Guru Mapel"
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-2 text-slate-300 text-[11px] outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-700">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Format Horizontal: Unit/Bab • Topik • Pertemuan Ke- • Alokasi Waktu • Kolom Bulan &amp; Minggu • Keterangan</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-slate-950 font-black text-xs shadow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Memetakan PROTA ke Kolom Horizontal PROSEM...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Tabel PROSEM Ganjil &amp; Genap</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Render Tables when generated */}
      {ganjilRows && genapRows && (
        <div className="space-y-8">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-800/90 rounded-2xl border border-slate-700">
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                Dokumen Siap Pakai
              </span>
              <h3 className="text-base font-black text-white">
                Program Semester (PROSEM) {namaMapel} • {kelas} • {tahunPelajaran}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewMode('print')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    previewMode === 'print'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Dokumen Siap Cetak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    previewMode === 'edit'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Distribusi Pekan</span>
                </button>
              </div>
              <DocumentExportToolbar
                title={`PROSEM - ${namaMapel} ${kelas}`}
                filenameBase={`PROSEM_${namaMapel}_${kelas}_${tahunPelajaran}`}
                getHtmlContent={buildExportHtml}
                orientation="landscape"
              />
            </div>
          </div>

          {previewMode === 'print' ? (
            <div className="space-y-8">
              {/* PRINT SHEET SEMESTER I (GANJIL) */}
              <div className="print-sheet bg-white text-slate-900 rounded-xl border border-slate-300 shadow-2xl p-6 sm:p-8 font-serif text-xs leading-snug">
                <div className="text-center border-b-[3px] border-double border-slate-900 pb-2.5 mb-4">
                  <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-slate-900">
                    PROGRAM SEMESTER (PROSEM) TAHUN PELAJARAN {tahunPelajaran}
                  </h4>
                  <p className="text-xs font-bold uppercase text-slate-700 mt-0.5">
                    SEMESTER I (GANJIL) • KURIKULUM MERDEKA
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-[11px] mb-4 font-sans bg-slate-50 border border-slate-300 rounded-lg p-2.5">
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700 w-36 shrink-0">Satuan Pendidikan</span>
                    <span>: {namaSekolah}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700 w-36 shrink-0">Tahun Pelajaran</span>
                    <span>: {tahunPelajaran}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700 w-36 shrink-0">Mata Pelajaran</span>
                    <span>: {namaMapel}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700 w-36 shrink-0">Alokasi per Minggu</span>
                    <span className="tabular-nums">: {alokasiJpPerMinggu} Jam Pelajaran (JP)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700 w-36 shrink-0">Kelas / Fase</span>
                    <span>: {kelas} / {fase}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700 w-36 shrink-0">Total Pekan Efektif</span>
                    <span className="font-bold tabular-nums">
                      : 18 Pekan Efektif ({ganjilRows.reduce((a, b) => a + (Number(b.alokasiWaktu) || 0), 0)} JP)
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[10.5px] border-collapse border border-slate-900 font-sans">
                    <thead>
                      <tr className="bg-slate-200/80 text-slate-900 font-bold">
                        <th rowSpan={2} className="border border-slate-900 px-2 py-1.5 text-left min-w-[120px]">Unit / BAB</th>
                        <th rowSpan={2} className="border border-slate-900 px-2 py-1.5 text-left min-w-[170px]">Topik / Konten</th>
                        <th rowSpan={2} className="border border-slate-900 px-1.5 py-1.5 text-center w-12">Pert. Ke-</th>
                        <th rowSpan={2} className="border border-slate-900 px-1.5 py-1.5 text-center w-14">Alokasi</th>
                        {GANJIL_MONTHS.map((m) => (
                          <th key={m.name} colSpan={m.weeks.length} className="border border-slate-900 px-1 py-1 text-center font-bold">
                            {m.name}
                          </th>
                        ))}
                        <th rowSpan={2} className="border border-slate-900 px-2 py-1.5 text-left min-w-[110px]">Keterangan</th>
                      </tr>
                      <tr className="bg-slate-100 text-[10px] font-bold">
                        {GANJIL_MONTHS.flatMap((m) =>
                          m.weeks.map((w) => (
                            <th
                              key={w.key}
                              title={w.labelNote || 'Pekan Efektif'}
                              className={`border border-slate-900 px-1 py-0.5 text-center w-6 tabular-nums ${
                                !w.isEfektif ? 'bg-slate-300 text-slate-700' : ''
                              }`}
                            >
                              {w.num}
                            </th>
                          ))
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {ganjilRows.map((row, rIdx) => (
                        <tr key={rIdx} className={row.isCadangan ? 'bg-amber-50 font-semibold' : rIdx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                          <td className="border border-slate-900 px-2 py-1.5 align-top font-semibold">{row.unitBab}</td>
                          <td className="border border-slate-900 px-2 py-1.5 align-top">{row.topikKonten}</td>
                          <td className="border border-slate-900 px-1.5 py-1.5 text-center align-top tabular-nums">{row.pertemuanKe}</td>
                          <td className="border border-slate-900 px-1.5 py-1.5 text-center align-top font-bold tabular-nums">{row.alokasiWaktu} JP</td>
                          {GANJIL_MONTHS.flatMap((m) =>
                            m.weeks.map((w) => {
                              if (!w.isEfektif) {
                                return (
                                  <td key={w.key} className="border border-slate-900 px-1 py-1 text-center bg-slate-200 text-slate-500">
                                    -
                                  </td>
                                );
                              }
                              const val = row.distribution[w.key];
                              return (
                                <td
                                  key={w.key}
                                  className={`border border-slate-900 px-1 py-1 text-center align-middle tabular-nums font-bold ${
                                    val ? 'bg-emerald-100 text-emerald-900' : ''
                                  }`}
                                >
                                  {val || ''}
                                </td>
                              );
                            })
                          )}
                          <td className="border border-slate-900 px-2 py-1.5 align-top text-[10px]">
                            {row.keterangan || (row.isCadangan ? 'Pekan Cadangan & Remedial' : '')}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-200/80 font-bold">
                        <td colSpan={3} className="border border-slate-900 px-2.5 py-2 text-right uppercase">
                          Jumlah Alokasi Waktu Semester I (Ganjil)
                        </td>
                        <td className="border border-slate-900 px-1.5 py-2 text-center tabular-nums">
                          {ganjilRows.reduce((a, b) => a + (Number(b.alokasiWaktu) || 0), 0)} JP
                        </td>
                        <td colSpan={25} className="border border-slate-900 px-2 py-2 text-center text-[10px] text-slate-700">
                          18 Pekan Efektif × {alokasiJpPerMinggu} JP (Tidak Efektif: Jul mgg 1–2, Sep mgg 3–4 [STS], Des mgg 1–2 [SAS])
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PRINT SHEET SEMESTER II (GENAP) */}
              <div className="print-sheet bg-white text-slate-900 rounded-xl border border-slate-300 shadow-2xl p-6 sm:p-8 font-serif text-xs leading-snug">
                <div className="text-center border-b-[3px] border-double border-slate-900 pb-2.5 mb-4">
                  <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-slate-900">
                    PROGRAM SEMESTER (PROSEM) TAHUN PELAJARAN {tahunPelajaran}
                  </h4>
                  <p className="text-xs font-bold uppercase text-slate-700 mt-0.5">
                    SEMESTER II (GENAP) • KURIKULUM MERDEKA
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-[11px] mb-4 font-sans bg-slate-50 border border-slate-300 rounded-lg p-2.5">
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700 w-36 shrink-0">Satuan Pendidikan</span>
                    <span>: {namaSekolah}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700 w-36 shrink-0">Tahun Pelajaran</span>
                    <span>: {tahunPelajaran}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700 w-36 shrink-0">Mata Pelajaran</span>
                    <span>: {namaMapel}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700 w-36 shrink-0">Alokasi per Minggu</span>
                    <span className="tabular-nums">: {alokasiJpPerMinggu} Jam Pelajaran (JP)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700 w-36 shrink-0">Kelas / Fase</span>
                    <span>: {kelas} / {fase}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700 w-36 shrink-0">Total Pekan Efektif</span>
                    <span className="font-bold tabular-nums">
                      : 19 Pekan Efektif ({genapRows.reduce((a, b) => a + (Number(b.alokasiWaktu) || 0), 0)} JP)
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[10.5px] border-collapse border border-slate-900 font-sans">
                    <thead>
                      <tr className="bg-slate-200/80 text-slate-900 font-bold">
                        <th rowSpan={2} className="border border-slate-900 px-2 py-1.5 text-left min-w-[120px]">Unit / BAB</th>
                        <th rowSpan={2} className="border border-slate-900 px-2 py-1.5 text-left min-w-[170px]">Topik / Konten</th>
                        <th rowSpan={2} className="border border-slate-900 px-1.5 py-1.5 text-center w-12">Pert. Ke-</th>
                        <th rowSpan={2} className="border border-slate-900 px-1.5 py-1.5 text-center w-14">Alokasi</th>
                        {GENAP_MONTHS.map((m) => (
                          <th key={m.name} colSpan={m.weeks.length} className="border border-slate-900 px-1 py-1 text-center font-bold">
                            {m.name}
                          </th>
                        ))}
                        <th rowSpan={2} className="border border-slate-900 px-2 py-1.5 text-left min-w-[110px]">Keterangan</th>
                      </tr>
                      <tr className="bg-slate-100 text-[10px] font-bold">
                        {GENAP_MONTHS.flatMap((m) =>
                          m.weeks.map((w) => (
                            <th
                              key={w.key}
                              title={w.labelNote || 'Pekan Efektif'}
                              className={`border border-slate-900 px-1 py-0.5 text-center w-6 tabular-nums ${
                                !w.isEfektif ? 'bg-slate-300 text-slate-700' : ''
                              }`}
                            >
                              {w.num}
                            </th>
                          ))
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {genapRows.map((row, rIdx) => (
                        <tr key={rIdx} className={row.isCadangan ? 'bg-amber-50 font-semibold' : rIdx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                          <td className="border border-slate-900 px-2 py-1.5 align-top font-semibold">{row.unitBab}</td>
                          <td className="border border-slate-900 px-2 py-1.5 align-top">{row.topikKonten}</td>
                          <td className="border border-slate-900 px-1.5 py-1.5 text-center align-top tabular-nums">{row.pertemuanKe}</td>
                          <td className="border border-slate-900 px-1.5 py-1.5 text-center align-top font-bold tabular-nums">{row.alokasiWaktu} JP</td>
                          {GENAP_MONTHS.flatMap((m) =>
                            m.weeks.map((w) => {
                              if (!w.isEfektif) {
                                return (
                                  <td key={w.key} className="border border-slate-900 px-1 py-1 text-center bg-slate-200 text-slate-500">
                                    -
                                  </td>
                                );
                              }
                              const val = row.distribution[w.key];
                              return (
                                <td
                                  key={w.key}
                                  className={`border border-slate-900 px-1 py-1 text-center align-middle tabular-nums font-bold ${
                                    val ? 'bg-emerald-100 text-emerald-900' : ''
                                  }`}
                                >
                                  {val || ''}
                                </td>
                              );
                            })
                          )}
                          <td className="border border-slate-900 px-2 py-1.5 align-top text-[10px]">
                            {row.keterangan || (row.isCadangan ? 'Pekan Cadangan & Remedial' : '')}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-200/80 font-bold">
                        <td colSpan={3} className="border border-slate-900 px-2.5 py-2 text-right uppercase">
                          Jumlah Alokasi Waktu Semester II (Genap)
                        </td>
                        <td className="border border-slate-900 px-1.5 py-2 text-center tabular-nums">
                          {genapRows.reduce((a, b) => a + (Number(b.alokasiWaktu) || 0), 0)} JP
                        </td>
                        <td colSpan={26} className="border border-slate-900 px-2 py-2 text-center text-[10px] text-slate-700">
                          19 Pekan Efektif × {alokasiJpPerMinggu} JP (Tidak Efektif: Mar mgg 1–4 [STS/Ramadhan], Jun mgg 1–2 [SAT])
                        </td>
                      </tr>
                      <tr className="bg-slate-300 font-black">
                        <td colSpan={3} className="border border-slate-900 px-2.5 py-2 text-right uppercase">
                          Total Alokasi Waktu Satu Tahun (Semester I + II)
                        </td>
                        <td className="border border-slate-900 px-1.5 py-2 text-center tabular-nums">
                          {ganjilRows.reduce((a, b) => a + (Number(b.alokasiWaktu) || 0), 0) +
                            genapRows.reduce((a, b) => a + (Number(b.alokasiWaktu) || 0), 0)}{' '}
                          JP
                        </td>
                        <td colSpan={26} className="border border-slate-900 px-2 py-2 text-center text-[11px]">
                          37 Pekan Efektif Belajar Tahunan
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-8 pt-4 text-xs font-sans text-slate-900">
                  <div>
                    <p>Mengetahui,</p>
                    <p>Kepala {namaSekolah}</p>
                    <div className="h-16" />
                    <p className="font-bold underline">{kepalaSekolah}</p>
                    <p className="tabular-nums">NIP. {nipKepalaSekolah}</p>
                  </div>
                  <div className="pl-12">
                    <p>{titimangsa}</p>
                    <p>Guru Mata Pelajaran PJOK</p>
                    <div className="h-16" />
                    <p className="font-bold underline">{guruMapel}</p>
                    <p className="tabular-nums">NIP. {nipGuru}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* TABLE 1: SEMESTER GANJIL */}
              <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <h3 className="text-base font-black text-white">
                    1. PROGRAM SEMESTER (PROSEM) — SEMESTER I (GANJIL)
                  </h3>
                  <span className="text-xs font-mono tabular-nums font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20">
                    Total: 18 Pekan Efektif ({ganjilRows.reduce((a, b) => a + (Number(b.alokasiWaktu) || 0), 0)} JP)
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-700 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-300 font-bold border-b border-slate-700">
                        <th rowSpan={2} className="p-2.5 border-r border-slate-700 min-w-[150px]">Unit / BAB</th>
                        <th rowSpan={2} className="p-2.5 border-r border-slate-700 min-w-[220px]">Topik / Konten</th>
                        <th rowSpan={2} className="p-2.5 border-r border-slate-700 text-center w-16">Pert. Ke-</th>
                        <th rowSpan={2} className="p-2.5 border-r border-slate-700 text-center w-20">Alokasi (JP)</th>
                        {GANJIL_MONTHS.map((m) => (
                          <th
                            key={m.name}
                            colSpan={m.weeks.length}
                            className="p-1.5 text-center border-r border-slate-700 bg-slate-950/60 font-extrabold text-slate-200"
                          >
                            {m.name}
                          </th>
                        ))}
                        <th rowSpan={2} className="p-2.5 min-w-[160px]">Keterangan</th>
                      </tr>
                      <tr className="bg-slate-900/80 text-[11px] text-slate-400 font-semibold border-b border-slate-700">
                        {GANJIL_MONTHS.flatMap((m) =>
                          m.weeks.map((w) => (
                            <th
                              key={w.key}
                              title={w.labelNote || (w.isEfektif ? 'Pekan Efektif' : 'Pekan Tidak Efektif')}
                              className={`p-1 text-center w-8 border-r border-slate-800 tabular-nums ${
                                !w.isEfektif ? 'bg-slate-700/80 text-amber-300 font-bold' : ''
                              }`}
                            >
                              {w.num}
                            </th>
                          ))
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {ganjilRows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            row.isCadangan ? 'bg-amber-500/10' : ''
                          }`}
                        >
                          <td className="p-2 border-r border-slate-800/80 align-top font-medium text-slate-200">
                            {row.unitBab}
                          </td>
                          <td className="p-2 border-r border-slate-800/80 align-top text-slate-100">
                            {row.topikKonten}
                          </td>
                          <td className="p-2 border-r border-slate-800/80 text-center align-top font-mono tabular-nums font-bold text-slate-300">
                            {row.pertemuanKe}
                          </td>
                          <td className="p-2 border-r border-slate-800/80 text-center align-top font-mono tabular-nums font-bold text-rose-300">
                            {row.alokasiWaktu} JP
                          </td>
                          {GANJIL_MONTHS.flatMap((m) =>
                            m.weeks.map((w) => {
                              const val = row.distribution[w.key];
                              if (!w.isEfektif) {
                                return (
                                  <td
                                    key={w.key}
                                    title={w.labelNote}
                                    className="p-1 border-r border-slate-800/80 text-center bg-slate-800/90 text-slate-500 font-bold"
                                  >
                                    •
                                  </td>
                                );
                              }
                              return (
                                <td
                                  key={w.key}
                                  className={`p-1 border-r border-slate-800/80 text-center align-middle ${
                                    val ? 'bg-emerald-500/20 font-mono tabular-nums font-black text-emerald-300' : ''
                                  }`}
                                >
                                  <input
                                    type="text"
                                    value={val || ''}
                                    onChange={(e) =>
                                      handleCellDistGanjil(rIdx, w.key, Number(e.target.value) || 0)
                                    }
                                    placeholder=""
                                    className="w-full text-center bg-transparent outline-none text-xs font-bold tabular-nums"
                                  />
                                </td>
                              );
                            })
                          )}
                          <td className="p-2 align-top text-slate-400 text-[11px]">
                            {row.keterangan || (row.isCadangan ? 'Pekan Cadangan & Remedial' : '')}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-900 font-bold border-t border-slate-700">
                        <td colSpan={3} className="p-2.5 text-right uppercase text-slate-300 border-r border-slate-800">
                          Total Alokasi Semester I (Ganjil):
                        </td>
                        <td className="p-2.5 text-center font-mono tabular-nums font-black text-rose-400 border-r border-slate-800">
                          {ganjilRows.reduce((a, b) => a + (Number(b.alokasiWaktu) || 0), 0)} JP
                        </td>
                        <td colSpan={24} className="p-2.5 text-center text-[11px] text-slate-400 border-r border-slate-800">
                          18 Pekan Efektif Terdistribusi Sempurna
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABLE 2: SEMESTER GENAP (BERADA DI BAWAH PROSEM GANJIL) */}
              <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <h3 className="text-base font-black text-white">
                    2. PROGRAM SEMESTER (PROSEM) — SEMESTER II (GENAP)
                  </h3>
                  <span className="text-xs font-mono tabular-nums font-bold text-pink-400 bg-pink-500/10 px-3 py-1 rounded-lg border border-pink-500/20">
                    Total: 19 Pekan Efektif ({genapRows.reduce((a, b) => a + (Number(b.alokasiWaktu) || 0), 0)} JP)
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-700 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-300 font-bold border-b border-slate-700">
                        <th rowSpan={2} className="p-2.5 border-r border-slate-700 min-w-[150px]">Unit / BAB</th>
                        <th rowSpan={2} className="p-2.5 border-r border-slate-700 min-w-[220px]">Topik / Konten</th>
                        <th rowSpan={2} className="p-2.5 border-r border-slate-700 text-center w-16">Pert. Ke-</th>
                        <th rowSpan={2} className="p-2.5 border-r border-slate-700 text-center w-20">Alokasi (JP)</th>
                        {GENAP_MONTHS.map((m) => (
                          <th
                            key={m.name}
                            colSpan={m.weeks.length}
                            className="p-1.5 text-center border-r border-slate-700 bg-slate-950/60 font-extrabold text-slate-200"
                          >
                            {m.name}
                          </th>
                        ))}
                        <th rowSpan={2} className="p-2.5 min-w-[160px]">Keterangan</th>
                      </tr>
                      <tr className="bg-slate-900/80 text-[11px] text-slate-400 font-semibold border-b border-slate-700">
                        {GENAP_MONTHS.flatMap((m) =>
                          m.weeks.map((w) => (
                            <th
                              key={w.key}
                              title={w.labelNote || (w.isEfektif ? 'Pekan Efektif' : 'Pekan Tidak Efektif')}
                              className={`p-1 text-center w-8 border-r border-slate-800 tabular-nums ${
                                !w.isEfektif ? 'bg-slate-700/80 text-amber-300 font-bold' : ''
                              }`}
                            >
                              {w.num}
                            </th>
                          ))
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {genapRows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            row.isCadangan ? 'bg-amber-500/10' : ''
                          }`}
                        >
                          <td className="p-2 border-r border-slate-800/80 align-top font-medium text-slate-200">
                            {row.unitBab}
                          </td>
                          <td className="p-2 border-r border-slate-800/80 align-top text-slate-100">
                            {row.topikKonten}
                          </td>
                          <td className="p-2 border-r border-slate-800/80 text-center align-top font-mono tabular-nums font-bold text-slate-300">
                            {row.pertemuanKe}
                          </td>
                          <td className="p-2 border-r border-slate-800/80 text-center align-top font-mono tabular-nums font-bold text-pink-300">
                            {row.alokasiWaktu} JP
                          </td>
                          {GENAP_MONTHS.flatMap((m) =>
                            m.weeks.map((w) => {
                              const val = row.distribution[w.key];
                              if (!w.isEfektif) {
                                return (
                                  <td
                                    key={w.key}
                                    title={w.labelNote}
                                    className="p-1 border-r border-slate-800/80 text-center bg-slate-800/90 text-slate-500 font-bold"
                                  >
                                    •
                                  </td>
                                );
                              }
                              return (
                                <td
                                  key={w.key}
                                  className={`p-1 border-r border-slate-800/80 text-center align-middle ${
                                    val ? 'bg-emerald-500/20 font-mono tabular-nums font-black text-emerald-300' : ''
                                  }`}
                                >
                                  <input
                                    type="text"
                                    value={val || ''}
                                    onChange={(e) =>
                                      handleCellDistGenap(rIdx, w.key, Number(e.target.value) || 0)
                                    }
                                    placeholder=""
                                    className="w-full text-center bg-transparent outline-none text-xs font-bold tabular-nums"
                                  />
                                </td>
                              );
                            })
                          )}
                          <td className="p-2 align-top text-slate-400 text-[11px]">
                            {row.keterangan || (row.isCadangan ? 'Pekan Cadangan & Remedial' : '')}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-900 font-bold border-t border-slate-700">
                        <td colSpan={3} className="p-2.5 text-right uppercase text-slate-300 border-r border-slate-800">
                          Total Alokasi Semester II (Genap):
                        </td>
                        <td className="p-2.5 text-center font-mono tabular-nums font-black text-pink-400 border-r border-slate-800">
                          {genapRows.reduce((a, b) => a + (Number(b.alokasiWaktu) || 0), 0)} JP
                        </td>
                        <td colSpan={25} className="p-2.5 text-center text-[11px] text-slate-400 border-r border-slate-800">
                          19 Pekan Efektif Terdistribusi Sempurna
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Export Bar */}
          <div className="flex justify-end pt-2">
            <DocumentExportToolbar
              title={`PROSEM - ${namaMapel} ${kelas}`}
              filenameBase={`PROSEM_${namaMapel}_${kelas}_${tahunPelajaran}`}
              getHtmlContent={buildExportHtml}
              orientation="landscape"
            />
          </div>
        </div>
      )}
    </div>
  );
}
