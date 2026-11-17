'use client';

import React, { useState, useMemo } from 'react';
import { 
  CalendarRange, FileDown, Copy, Check, Sparkles, Plus, 
  Trash2, Printer, RefreshCw, Calculator, BookmarkCheck, ArrowRight,
  Calendar, CheckCircle2, FileText, Layers, Settings2, Edit3
} from 'lucide-react';
import { DocumentExportToolbar } from '@/components/DocumentExportToolbar';
import { escapeHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

interface MonthlyPekanRow {
  no: number;
  bulan: string;
  jumlahPekan: number;
  pekanEfektif: number;
  pekanTidakEfektif: number;
  keterangan: string;
}

interface InactiveActivityRow {
  no: number;
  uraianKegiatan: string;
  jumlahPekan: number;
  keterangan: string;
}

const PRESET_CALENDARS = [
  {
    label: 'Kalender Standar 2026/2027 (Semester Ganjil)',
    semester: 'Ganjil' as const,
    tahunPelajaran: '2026/2027',
    tanggalDokumen: 'Kalimantong, 13 Juli 2026',
    catatanKalender: `- 1–11 Juli 2026: Libur Akhir Tahun Pelajaran 2025/2026 (2 Pekan)
- 13–15 Juli 2026: Masa Pengenalan Lingkungan Sekolah (MPLS) (1 Pekan)
- 17 Agustus 2026: Libur Nasional HUT Kemerdekaan RI Ke-81
- 21–26 September 2026: Asesmen Sumatif Tengah Semester (STS) Ganjil (1 Pekan)
- 30 November – 5 Desember 2026: Asesmen Sumatif Akhir Semester (SAS) Ganjil (1 Pekan)
- 7–12 Desember 2026: Pengolahan Nilai & Remedial
- 18 Desember 2026: Pembagian Rapor Semester Ganjil (1 Pekan)
- 21–31 Desember 2026: Libur Akhir Semester Ganjil & Cuti Bersama Natal (2 Pekan)`,
  },
  {
    label: 'Kalender Standar 2026/2027 (Semester Genap)',
    semester: 'Genap' as const,
    tahunPelajaran: '2026/2027',
    tanggalDokumen: 'Kalimantong, 4 Januari 2027',
    catatanKalender: `- 1–2 Januari 2027: Libur Tahun Baru Masehi (1 Pekan)
- 4 Januari 2027: Hari Pertama Masuk Sekolah Semester Genap
- 1–6 Maret 2027: Libur Awal Puasa Ramadhan 1448 H (1 Pekan)
- 22–27 Maret 2027: Asesmen Sumatif Tengah Semester (STS) Genap (1 Pekan)
- 29 Maret – 9 April 2027: Libur Hari Raya Idul Fitri 1448 H & Cuti Bersama (2 Pekan)
- 7–12 Juni 2027: Asesmen Sumatif Akhir Tahun (SAT) Kenaikan Kelas (1 Pekan)
- 14–19 Juni 2027: Remedial & Pengolahan Rapor (1 Pekan)
- 25 Juni 2027: Pembagian Rapor Kenaikan Kelas & Libur Akhir Tahun (1 Pekan)`,
  },
  {
    label: 'Format Kalender Kustom / Sekolah Inklusi',
    semester: 'Ganjil' as const,
    tahunPelajaran: '2026/2027',
    tanggalDokumen: 'Kalimantong, 13 Juli 2026',
    catatanKalender: `Catatan Agenda Khusus:
- Pekan 1-2 Juli: Libur Kenaikan Kelas
- Pekan 3 Juli: MPLS & Pemetaan Kebugaran Awal Siswa
- Pekan 4 September: Asesmen Sumatif Tengah Semester
- Pekan 2 Desember: Asesmen Sumatif Akhir Semester
- Pekan 3 Desember: Class Meeting & Olahraga Gembira
- Pekan 4-5 Desember: Pembagian Rapor & Libur Semester`,
  },
];

const DEFAULT_GANJIL_MONTHS: MonthlyPekanRow[] = [
  { no: 1, bulan: 'Juli', jumlahPekan: 5, pekanEfektif: 2, pekanTidakEfektif: 3, keterangan: 'Libur Akhir Semester & MPLS' },
  { no: 2, bulan: 'Agustus', jumlahPekan: 4, pekanEfektif: 4, pekanTidakEfektif: 0, keterangan: 'Pembelajaran Efektif (HUT RI)' },
  { no: 3, bulan: 'September', jumlahPekan: 4, pekanEfektif: 3, pekanTidakEfektif: 1, keterangan: 'Asesmen Sumatif Tengah Semester (STS)' },
  { no: 4, bulan: 'Oktober', jumlahPekan: 5, pekanEfektif: 5, pekanTidakEfektif: 0, keterangan: 'Pembelajaran Efektif' },
  { no: 5, bulan: 'November', jumlahPekan: 4, pekanEfektif: 4, pekanTidakEfektif: 0, keterangan: 'Pembelajaran Efektif' },
  { no: 6, bulan: 'Desember', jumlahPekan: 4, pekanEfektif: 0, pekanTidakEfektif: 4, keterangan: 'Asesmen Akhir Semester & Libur Semester' },
];

const DEFAULT_GANJIL_INACTIVE: InactiveActivityRow[] = [
  { no: 1, uraianKegiatan: 'Libur Akhir Tahun Pelajaran 2025/2026', jumlahPekan: 2, keterangan: 'Pekan 1 - 2 Juli 2026' },
  { no: 2, uraianKegiatan: 'Masa Pengenalan Lingkungan Sekolah (MPLS)', jumlahPekan: 1, keterangan: 'Pekan 3 Juli 2026' },
  { no: 3, uraianKegiatan: 'Asesmen Sumatif Tengah Semester (STS) Ganjil', jumlahPekan: 1, keterangan: 'Pekan 4 September 2026' },
  { no: 4, uraianKegiatan: 'Asesmen Sumatif Akhir Semester (SAS) Ganjil', jumlahPekan: 1, keterangan: 'Pekan 2 Desember 2026' },
  { no: 5, uraianKegiatan: 'Pengolahan Nilai & Pembagian Rapor Ganjil', jumlahPekan: 1, keterangan: 'Pekan 3 Desember 2026' },
  { no: 6, uraianKegiatan: 'Libur Semester Ganjil', jumlahPekan: 2, keterangan: 'Pekan 4 - 5 Desember 2026' },
];

const DEFAULT_GENAP_MONTHS: MonthlyPekanRow[] = [
  { no: 1, bulan: 'Januari', jumlahPekan: 5, pekanEfektif: 4, pekanTidakEfektif: 1, keterangan: 'Tahun Baru / Awal Masuk Genap' },
  { no: 2, bulan: 'Februari', jumlahPekan: 4, pekanEfektif: 4, pekanTidakEfektif: 0, keterangan: 'Pembelajaran Efektif' },
  { no: 3, bulan: 'Maret', jumlahPekan: 4, pekanEfektif: 2, pekanTidakEfektif: 2, keterangan: 'Libur Awal Ramadhan & STS Genap' },
  { no: 4, bulan: 'April', jumlahPekan: 5, pekanEfektif: 3, pekanTidakEfektif: 2, keterangan: 'Libur Hari Raya Idul Fitri' },
  { no: 5, bulan: 'Mei', jumlahPekan: 4, pekanEfektif: 4, pekanTidakEfektif: 0, keterangan: 'Pembelajaran Efektif / Ujian Sekolah' },
  { no: 6, bulan: 'Juni', jumlahPekan: 4, pekanEfektif: 2, pekanTidakEfektif: 2, keterangan: 'SAS Genap & Libur Akhir Semester' },
];

const DEFAULT_GENAP_INACTIVE: InactiveActivityRow[] = [
  { no: 1, uraianKegiatan: 'Libur Awal Semester Genap & Tahun Baru', jumlahPekan: 1, keterangan: 'Pekan 1 Januari 2027' },
  { no: 2, uraianKegiatan: 'Libur Awal Puasa Ramadhan', jumlahPekan: 1, keterangan: 'Pekan 1 Maret 2027' },
  { no: 3, uraianKegiatan: 'Asesmen Sumatif Tengah Semester (STS) Genap', jumlahPekan: 1, keterangan: 'Pekan 4 Maret 2027' },
  { no: 4, uraianKegiatan: 'Libur Hari Raya Idul Fitri & Cuti Bersama', jumlahPekan: 2, keterangan: 'Pekan 1 - 2 April 2027' },
  { no: 5, uraianKegiatan: 'Asesmen Sumatif Akhir Tahun (SAT) & Remedial', jumlahPekan: 1, keterangan: 'Pekan 2 Juni 2027' },
  { no: 6, uraianKegiatan: 'Pembagian Rapor & Libur Kenaikan Kelas', jumlahPekan: 1, keterangan: 'Pekan 4 Juni 2027' },
];

export function RpeGenerator() {
  // Informasi Identitas sesuai prompt pengguna
  const [namaSekolah, setNamaSekolah] = useState('SD Negeri Kalimantong');
  const [kelas, setKelas] = useState('V');
  const [jpPerPekan, setJpPerPekan] = useState<number>(4);
  const [mataPelajaran, setMataPelajaran] = useState('Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [tahunPelajaran, setTahunPelajaran] = useState('2026/2027');
  const [tanggalDokumen, setTanggalDokumen] = useState('Kalimantong, 13 Juli 2026');
  const [kepalaSekolah, setKepalaSekolah] = useState('Ahmad Fauzi, S.Pd., M.Pd.');
  const [nipKepalaSekolah, setNipKepalaSekolah] = useState('19780512 200501 1 008');
  const [guruMapel, setGuruMapel] = useState('Budi Santoso, S.Pd.Jas');
  const [nipGuru, setNipGuru] = useState('19840315 200902 1 004');

  // Input Kalender Akademik untuk generator
  const [catatanKalender, setCatatanKalender] = useState(PRESET_CALENDARS[0].catatanKalender);

  // Tabel State
  const [monthRows, setMonthRows] = useState<MonthlyPekanRow[]>(DEFAULT_GANJIL_MONTHS);
  const [inactiveRows, setInactiveRows] = useState<InactiveActivityRow[]>(DEFAULT_GANJIL_INACTIVE);
  const [ringkasanAnalisis, setRingkasanAnalisis] = useState<string>(
    'Hasil analisis kalender pendidikan menunjukkan 18 pekan efektif dengan total 72 JP. Alokasi waktu ini memadai untuk menuntaskan capaian pembelajaran PJOK semester ganjil.'
  );

  const [loadingAI, setLoadingAI] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<'print' | 'edit'>('print');

  // Switch Semester
  const handleSemesterChange = (newSemester: 'Ganjil' | 'Genap') => {
    setSemester(newSemester);
    if (newSemester === 'Ganjil') {
      setMonthRows(DEFAULT_GANJIL_MONTHS);
      setInactiveRows(DEFAULT_GANJIL_INACTIVE);
      setTanggalDokumen('Kalimantong, 13 Juli 2026');
      setCatatanKalender(PRESET_CALENDARS[0].catatanKalender);
    } else {
      setMonthRows(DEFAULT_GENAP_MONTHS);
      setInactiveRows(DEFAULT_GENAP_INACTIVE);
      setTanggalDokumen('Kalimantong, 4 Januari 2027');
      setCatatanKalender(PRESET_CALENDARS[1].catatanKalender);
    }
  };

  // Calculations
  const totalJumlahPekan = useMemo(() => monthRows.reduce((a, b) => a + Number(b.jumlahPekan || 0), 0), [monthRows]);
  const totalPekanEfektif = useMemo(() => monthRows.reduce((a, b) => a + Number(b.pekanEfektif || 0), 0), [monthRows]);
  const totalPekanTidakEfektif = useMemo(() => monthRows.reduce((a, b) => a + Number(b.pekanTidakEfektif || 0), 0), [monthRows]);
  const totalInactiveKegiatan = useMemo(() => inactiveRows.reduce((a, b) => a + Number(b.jumlahPekan || 0), 0), [inactiveRows]);
  const jumlahJamEfektif = totalPekanEfektif * jpPerPekan;

  // Edit Monthly Row
  const updateMonthRow = (index: number, field: keyof MonthlyPekanRow, value: string | number) => {
    setMonthRows((prev) => {
      const next = [...prev];
      const row = { ...next[index], [field]: value };
      if (field === 'jumlahPekan' || field === 'pekanEfektif') {
        const jPekan = Number(field === 'jumlahPekan' ? value : row.jumlahPekan) || 0;
        const pEfektif = Number(field === 'pekanEfektif' ? value : row.pekanEfektif) || 0;
        row.pekanTidakEfektif = Math.max(0, jPekan - pEfektif);
      }
      next[index] = row;
      return next;
    });
  };

  // Edit Inactive Row
  const updateInactiveRow = (index: number, field: keyof InactiveActivityRow, value: string | number) => {
    setInactiveRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addInactiveRow = () => {
    setInactiveRows((prev) => [
      ...prev,
      {
        no: prev.length + 1,
        uraianKegiatan: 'Kegiatan Khusus / Libur Tambahan',
        jumlahPekan: 1,
        keterangan: 'Pekan...',
      },
    ]);
  };

  const removeInactiveRow = (index: number) => {
    setInactiveRows((prev) => prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, no: i + 1 })));
  };

  // AI Generator Action
  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAI(true);

    try {
      const res = await postJsonSafe<{
        monthRows?: MonthlyPekanRow[];
        inactiveRows?: InactiveActivityRow[];
        ringkasanAnalisis?: string;
      }>('/api/gemini/generate-rpe', {
        namaSekolah,
        kelas,
        jpPerPekan,
        mataPelajaran,
        semester,
        tahunPelajaran,
        tanggalDokumen,
        kepalaSekolah,
        nipKepalaSekolah,
        guruMapel,
        nipGuru,
        catatanKalender,
      });

      if (res.data?.monthRows && res.data.monthRows.length > 0) {
        setMonthRows(res.data.monthRows);
      }
      if (res.data?.inactiveRows && res.data.inactiveRows.length > 0) {
        setInactiveRows(res.data.inactiveRows);
      }
      if (res.data?.ringkasanAnalisis) {
        setRingkasanAnalisis(res.data.ringkasanAnalisis);
      }
    } finally {
      setLoadingAI(false);
    }
  };

  // Build HTML for Word / PDF / Print export with Portrait Orientation
  const buildExportHtml = (): string => {
    const isGanjil = semester === 'Ganjil';
    const sectionLetter = isGanjil ? 'A' : 'B';

    return `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Rincian Pekan Efektif - ${escapeHtml(namaSekolah)}</title>
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
            size: 210mm 297mm;
            margin: 18mm 18mm 18mm 18mm;
            mso-header-margin: 15mm;
            mso-footer-margin: 15mm;
            mso-page-orientation: portrait;
          }
          div.WordSection1 {
            page: WordSection1;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11.5pt;
            line-height: 1.3;
            color: #000000;
          }
          .title-doc {
            text-align: center;
            font-weight: bold;
            font-size: 13pt;
            margin-bottom: 2pt;
            text-transform: uppercase;
          }
          .subtitle-doc {
            text-align: center;
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 14pt;
            text-transform: uppercase;
          }
          .identitas-table {
            width: 100%;
            border: none;
            margin-bottom: 12pt;
            font-size: 11pt;
          }
          .identitas-table td {
            border: none;
            padding: 2pt 4pt;
          }
          .section-heading {
            font-weight: bold;
            font-size: 11.5pt;
            margin-top: 10pt;
            margin-bottom: 4pt;
          }
          .section-subheading {
            font-size: 11pt;
            font-weight: bold;
            margin-top: 8pt;
            margin-bottom: 4pt;
          }
          .rpe-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4pt;
            margin-bottom: 12pt;
            font-size: 10.5pt;
          }
          .rpe-table thead {
            display: table-header-group;
          }
          .rpe-table tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .rpe-table th {
            border: 1pt solid #000000;
            padding: 5pt;
            text-align: center;
            font-weight: bold;
            background-color: #f1f5f9;
          }
          .rpe-table td {
            border: 1pt solid #000000;
            padding: 4pt 6pt;
            vertical-align: top;
          }
          .rpe-table tbody tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .rpe-table tr.total-row td {
            font-weight: bold;
            background-color: #e2e8f0;
          }
          .formula-box {
            margin-top: 4pt;
            margin-bottom: 10pt;
            padding: 6pt 10pt;
            background-color: #f8fafc;
            border: 1pt solid #94a3b8;
            line-height: 1.45;
            font-size: 11pt;
          }
          .ttd-table {
            width: 100%;
            border: none;
            margin-top: 22pt;
            font-size: 11pt;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .ttd-table td {
            border: none;
            vertical-align: top;
            padding: 2pt 4pt;
          }
        </style>
      </head>
      <body>
        <div class="WordSection1">
          <div class="title-doc">RINCIAN PEKAN EFEKTIF</div>
          <div class="subtitle-doc">TAHUN PELAJARAN ${escapeHtml(tahunPelajaran)}</div>

          <table class="identitas-table">
            <tr>
              <td style="width: 130pt;">Nama Sekolah</td>
              <td style="width: 15pt;">:</td>
              <td>${escapeHtml(namaSekolah)}</td>
            </tr>
            <tr>
              <td>Kelas</td>
              <td>:</td>
              <td>${escapeHtml(kelas)}</td>
            </tr>
            <tr>
              <td>Semester</td>
              <td>:</td>
              <td>${escapeHtml(semester)}</td>
            </tr>
            <tr>
              <td>Mata Pelajaran</td>
              <td>:</td>
              <td>${escapeHtml(mataPelajaran)}</td>
            </tr>
          </table>

          <div class="section-heading">${sectionLetter}. PERHITUNGAN ALOKASI WAKTU</div>
          
          <div class="section-subheading">1. Jumlah Pekan dalam Satu Semester</div>
          <table class="rpe-table">
            <thead>
              <tr>
                <th rowspan="2" style="width: 28pt;">No</th>
                <th rowspan="2" style="width: 85pt;">Bulan</th>
                <th rowspan="2" style="width: 60pt;">Jumlah<br>Pekan</th>
                <th colspan="2">Pekan</th>
                <th rowspan="2">Keterangan</th>
              </tr>
              <tr>
                <th style="width: 60pt;">Efektif</th>
                <th style="width: 65pt;">Tidak Efektif</th>
              </tr>
            </thead>
            <tbody>
              ${monthRows
                .map(
                  (r) => `
                <tr>
                  <td style="text-align: center;">${r.no}</td>
                  <td>${escapeHtml(r.bulan)}</td>
                  <td style="text-align: center;">${r.jumlahPekan}</td>
                  <td style="text-align: center;">${r.pekanEfektif}</td>
                  <td style="text-align: center;">${r.pekanTidakEfektif}</td>
                  <td>${escapeHtml(r.keterangan || '')}</td>
                </tr>
              `
                )
                .join('')}
              <tr class="total-row">
                <td colspan="2" style="text-align: center;">Jumlah</td>
                <td style="text-align: center;">${totalJumlahPekan}</td>
                <td style="text-align: center;">${totalPekanEfektif}</td>
                <td style="text-align: center;">${totalPekanTidakEfektif}</td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div class="section-subheading">2. Pekan Tidak Efektif</div>
          <table class="rpe-table">
            <thead>
              <tr>
                <th style="width: 28pt;">No.</th>
                <th>Uraian Kegiatan</th>
                <th style="width: 90pt;">Jumlah (Pekan)</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${inactiveRows
                .map(
                  (r) => `
                <tr>
                  <td style="text-align: center;">${r.no}</td>
                  <td>${escapeHtml(r.uraianKegiatan)}</td>
                  <td style="text-align: center;">${r.jumlahPekan}</td>
                  <td>${escapeHtml(r.keterangan || '')}</td>
                </tr>
              `
                )
                .join('')}
              <tr class="total-row">
                <td colspan="2" style="text-align: center;">Jumlah</td>
                <td style="text-align: center;">${totalInactiveKegiatan}</td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div class="section-subheading">3. Jumlah Pekan Efektif</div>
          <div class="formula-box">
            Jumlah Pekan Efektif = Jumlah Pekan dalam Semester – Jumlah Pekan Tidak Efektif<br>
            Jumlah Pekan Efektif = <b>${totalJumlahPekan}</b> Pekan – <b>${totalPekanTidakEfektif}</b> Pekan = <b>${totalPekanEfektif} Pekan</b>
          </div>

          <div class="section-subheading">4. Jumlah Jam Efektif</div>
          <div class="formula-box">
            Jumlah Jam Efektif = Jumlah Pekan Efektif × JP Per Pekan<br>
            Jumlah Jam Efektif = <b>${totalPekanEfektif}</b> × <b>${jpPerPekan}</b> = <b>${jumlahJamEfektif} Jam Pelajaran (JP)</b>
          </div>

          <table class="ttd-table">
            <tr>
              <td style="width: 50%;"></td>
              <td style="width: 50%; text-align: left;">${escapeHtml(tanggalDokumen)}</td>
            </tr>
            <tr>
              <td style="text-align: left;">
                Mengetahui,<br>
                Kepala Sekolah
                <div style="height: 55pt;"></div>
                <u><b>${escapeHtml(kepalaSekolah)}</b></u><br>
                NIP. ${escapeHtml(nipKepalaSekolah)}
              </td>
              <td style="text-align: left;">
                <br>
                Guru Kelas / Mapel
                <div style="height: 55pt;"></div>
                <u><b>${escapeHtml(guruMapel)}</b></u><br>
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
    const text = `RINCIAN PEKAN EFEKTIF
TAHUN PELAJARAN ${tahunPelajaran}
Nama Sekolah : ${namaSekolah}
Kelas : ${kelas}
Semester : ${semester}
Mata Pelajaran : ${mataPelajaran}
JP Per Pekan : ${jpPerPekan} JP

1. Total Pekan Semester: ${totalJumlahPekan} Pekan
2. Total Pekan Efektif: ${totalPekanEfektif} Pekan
3. Total Pekan Tidak Efektif: ${totalPekanTidakEfektif} Pekan
4. Total Jam Pelajaran Efektif: ${jumlahJamEfektif} JP (${totalPekanEfektif} Pekan × ${jpPerPekan} JP)

${tanggalDokumen}
Kepala Sekolah: ${kepalaSekolah} (NIP. ${nipKepalaSekolah})
Guru Mapel: ${guruMapel} (NIP. ${nipGuru})`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Generator */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 font-black">
              <CalendarRange className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  Generator Alokasi Waktu Pembelajaran
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-300">Format Resmi Portrait (A4)</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                Generator Rincian Pekan Efektif (RPE)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Analisis kalender pendidikan, hitung pekan & jam efektif belajar, susun rincian kegiatan tidak efektif, dan ekspor ke Word (.doc) portrait siap pakai.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DocumentExportToolbar
              title={`Rincian Pekan Efektif - ${namaSekolah}`}
              filenameBase={`RPE_${namaSekolah}_Kelas_${kelas}_Semester_${semester}`}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
            />
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>

        {/* Semester & KPI Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-700/80">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 font-bold block">Pilih Semester:</span>
            <div className="flex items-center justify-center gap-1 mt-1">
              <button
                type="button"
                onClick={() => handleSemesterChange('Ganjil')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  semester === 'Ganjil'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Ganjil (Jul–Des)
              </button>
              <button
                type="button"
                onClick={() => handleSemesterChange('Genap')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  semester === 'Genap'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Genap (Jan–Jun)
              </button>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 font-bold block">Total Pekan Semester</span>
            <div className="text-xl font-black text-white mt-0.5 font-mono">{totalJumlahPekan} Pekan</div>
            <span className="text-[10px] text-slate-400">Total kalender 6 bulan</span>
          </div>

          <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-center">
            <span className="text-[11px] text-emerald-400 font-bold block">Pekan Efektif</span>
            <div className="text-xl font-black text-white mt-0.5 font-mono">{totalPekanEfektif} Pekan</div>
            <span className="text-[10px] text-emerald-400 font-semibold">{totalPekanTidakEfektif} pekan tidak efektif</span>
          </div>

          <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20 text-center">
            <span className="text-[11px] text-cyan-400 font-bold block">Total Jam Efektif (JP)</span>
            <div className="text-xl font-black text-cyan-300 mt-0.5 font-mono">{jumlahJamEfektif} JP</div>
            <span className="text-[10px] text-slate-400 font-semibold">{totalPekanEfektif} Pekan × {jpPerPekan} JP</span>
          </div>
        </div>
      </div>

      {/* Generator Form Input Box */}
      <form onSubmit={handleGenerateAI} className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black text-white">Parameter Generator & Kalender Akademik</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Berdasarkan Prompt & Kalender Pendidikan</span>
        </div>

        {/* Identitas Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Nama Sekolah:</label>
            <input
              type="text"
              required
              value={namaSekolah}
              onChange={(e) => setNamaSekolah(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Kelas:</label>
            <input
              type="text"
              required
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              placeholder="Contoh: V, IV, VI..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">JP Per Minggu/Pekan:</label>
            <input
              type="number"
              min={1}
              max={12}
              required
              value={jpPerPekan}
              onChange={(e) => setJpPerPekan(Number(e.target.value) || 1)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Tahun Pelajaran:</label>
            <input
              type="text"
              required
              value={tahunPelajaran}
              onChange={(e) => setTahunPelajaran(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-300 font-bold block mb-1">Mata Pelajaran:</label>
            <input
              type="text"
              required
              value={mataPelajaran}
              onChange={(e) => setMataPelajaran(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-300 font-bold block mb-1">Tempat & Tanggal Pengesahan:</label>
            <input
              type="text"
              required
              value={tanggalDokumen}
              onChange={(e) => setTanggalDokumen(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Nama Kepala Sekolah:</label>
            <input
              type="text"
              value={kepalaSekolah}
              onChange={(e) => setKepalaSekolah(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">NIP Kepala Sekolah:</label>
            <input
              type="text"
              value={nipKepalaSekolah}
              onChange={(e) => setNipKepalaSekolah(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Nama Guru Mata Pelajaran:</label>
            <input
              type="text"
              value={guruMapel}
              onChange={(e) => setGuruMapel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">NIP Guru:</label>
            <input
              type="text"
              value={nipGuru}
              onChange={(e) => setNipGuru(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Input Kalender Pendidikan / Agenda Khusus */}
        <div className="text-xs pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
            <label className="text-slate-300 font-bold block">
              Catatan Kalender Pendidikan / Agenda Kegiatan Sekolah:
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Pilih Preset Kalender:</span>
              {PRESET_CALENDARS.slice(0, 2).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleSemesterChange(p.semester);
                    setCatatanKalender(p.catatanKalender);
                  }}
                  className="text-[10px] bg-slate-900 hover:bg-amber-500/15 text-amber-300 border border-slate-700 px-2 py-0.5 rounded cursor-pointer"
                >
                  {p.semester}
                </button>
              ))}
            </div>
          </div>
          <textarea
            rows={4}
            value={catatanKalender}
            onChange={(e) => setCatatanKalender(e.target.value)}
            placeholder="Tuliskan atau tempel rincian tanggal kalender pendidikan sekolah Anda (hari libur, MPLS, STS, SAS, pembagian rapor)..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500 text-xs leading-relaxed font-mono"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-700">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>AI akan memetakan otomatis pekan efektif per bulan dan rekapitulasi pekan tidak efektif</span>
          </div>

          <button
            type="submit"
            disabled={loadingAI}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loadingAI ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Menganalisis Kalender & Menghitung RPE...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Dokumen RPE Otomatis</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Hasil Pratinjau Dokumen RPE Sesuai Format Resmi */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-700">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              Hasil Generator Rincian Pekan Efektif
            </span>
            <h3 className="text-base font-black text-white">
              Rincian Pekan Efektif ({semester} • {tahunPelajaran})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setPreviewMode('print')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
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
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  previewMode === 'edit'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Tabel</span>
              </button>
            </div>
            <DocumentExportToolbar
              title={`Rincian Pekan Efektif - ${namaSekolah}`}
              filenameBase={`RPE_${namaSekolah}_Kelas_${kelas}_Semester_${semester}`}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
            />
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>
          </div>
        </div>

        {/* Ringkasan Analisis AI Box */}
        {ringkasanAnalisis && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 leading-relaxed">
            <strong className="text-amber-400 font-bold block mb-0.5">Analisis Alokasi Pembelajaran:</strong>
            {ringkasanAnalisis}
          </div>
        )}

        {previewMode === 'print' ? (
          <div className="print-sheet bg-white text-slate-900 rounded-xl border border-slate-300 shadow-2xl p-6 sm:p-10 font-serif text-xs leading-relaxed">
            {/* Kop Dokumen Resmi */}
            <div className="text-center border-b-2 border-double border-slate-900 pb-3 mb-5">
              <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-slate-900">
                RINCIAN PEKAN EFEKTIF
              </h4>
              <p className="text-xs font-bold uppercase text-slate-700 mt-0.5">
                TAHUN PELAJARAN {tahunPelajaran}
              </p>
            </div>

            {/* Identitas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-xs mb-5 font-sans bg-slate-50/80 border border-slate-300 rounded-lg p-3">
              <div className="flex gap-2">
                <span className="font-bold text-slate-700 w-32 shrink-0">Nama Sekolah</span>
                <span>: {namaSekolah}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-slate-700 w-32 shrink-0">Semester</span>
                <span>: {semester}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-slate-700 w-32 shrink-0">Kelas</span>
                <span>: {kelas}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-slate-700 w-32 shrink-0">Mata Pelajaran</span>
                <span>: {mataPelajaran}</span>
              </div>
            </div>

            <div className="font-sans space-y-5">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wide text-slate-900 mb-2">
                  {semester === 'Ganjil' ? 'A' : 'B'}. PERHITUNGAN ALOKASI WAKTU
                </h5>

                {/* Tabel 1 */}
                <p className="text-xs font-bold text-slate-800 mb-1.5">
                  1. Jumlah Pekan dalam Satu Semester
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse border border-slate-900">
                    <thead>
                      <tr className="bg-slate-200/80 text-slate-900 font-bold text-center">
                        <th rowSpan={2} className="border border-slate-900 px-2 py-2 w-10">No</th>
                        <th rowSpan={2} className="border border-slate-900 px-2.5 py-2 w-32">Bulan</th>
                        <th rowSpan={2} className="border border-slate-900 px-2 py-2 w-24">Jumlah<br />Pekan</th>
                        <th colSpan={2} className="border border-slate-900 px-2 py-1.5">Pekan</th>
                        <th rowSpan={2} className="border border-slate-900 px-2.5 py-2">Keterangan</th>
                      </tr>
                      <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                        <th className="border border-slate-900 px-2 py-1.5 w-24">Efektif</th>
                        <th className="border border-slate-900 px-2 py-1.5 w-28">Tidak Efektif</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthRows.map((r, idx) => (
                        <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                          <td className="border border-slate-900 px-2 py-1.5 text-center tabular-nums font-bold">{r.no}</td>
                          <td className="border border-slate-900 px-2.5 py-1.5 font-semibold">{r.bulan}</td>
                          <td className="border border-slate-900 px-2 py-1.5 text-center tabular-nums">{r.jumlahPekan}</td>
                          <td className="border border-slate-900 px-2 py-1.5 text-center tabular-nums font-bold">{r.pekanEfektif}</td>
                          <td className="border border-slate-900 px-2 py-1.5 text-center tabular-nums">{r.pekanTidakEfektif}</td>
                          <td className="border border-slate-900 px-2.5 py-1.5">{r.keterangan || '-'}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-200/90 font-bold text-slate-900">
                        <td colSpan={2} className="border border-slate-900 px-2.5 py-2 text-center uppercase">Jumlah</td>
                        <td className="border border-slate-900 px-2 py-2 text-center tabular-nums">{totalJumlahPekan}</td>
                        <td className="border border-slate-900 px-2 py-2 text-center tabular-nums">{totalPekanEfektif}</td>
                        <td className="border border-slate-900 px-2 py-2 text-center tabular-nums">{totalPekanTidakEfektif}</td>
                        <td className="border border-slate-900 px-2.5 py-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel 2 */}
              <div>
                <p className="text-xs font-bold text-slate-800 mb-1.5">
                  2. Pekan Tidak Efektif
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse border border-slate-900">
                    <thead>
                      <tr className="bg-slate-200/80 text-slate-900 font-bold text-center">
                        <th className="border border-slate-900 px-2 py-2 w-10">No.</th>
                        <th className="border border-slate-900 px-2.5 py-2 text-left">Uraian Kegiatan</th>
                        <th className="border border-slate-900 px-2 py-2 w-32">Jumlah (Pekan)</th>
                        <th className="border border-slate-900 px-2.5 py-2 text-left">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inactiveRows.map((r, idx) => (
                        <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                          <td className="border border-slate-900 px-2 py-1.5 text-center tabular-nums font-bold">{idx + 1}</td>
                          <td className="border border-slate-900 px-2.5 py-1.5">{r.uraianKegiatan}</td>
                          <td className="border border-slate-900 px-2 py-1.5 text-center tabular-nums font-bold">{r.jumlahPekan}</td>
                          <td className="border border-slate-900 px-2.5 py-1.5">{r.keterangan || '-'}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-200/90 font-bold text-slate-900">
                        <td colSpan={2} className="border border-slate-900 px-2.5 py-2 text-center uppercase">Jumlah</td>
                        <td className="border border-slate-900 px-2 py-2 text-center tabular-nums">{totalInactiveKegiatan}</td>
                        <td className="border border-slate-900 px-2.5 py-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rumus 3 & 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 border border-slate-900 rounded-lg p-3 space-y-1">
                  <p className="font-bold text-slate-900">3. Jumlah Pekan Efektif</p>
                  <p className="text-slate-600">
                    Jumlah Pekan Efektif = Jumlah Pekan dalam Semester – Jumlah Pekan Tidak Efektif
                  </p>
                  <p className="font-bold text-slate-900 tabular-nums pt-0.5">
                    = {totalJumlahPekan} Pekan – {totalPekanTidakEfektif} Pekan = <span className="underline">{totalPekanEfektif} Pekan</span>
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-900 rounded-lg p-3 space-y-1">
                  <p className="font-bold text-slate-900">4. Jumlah Jam Efektif</p>
                  <p className="text-slate-600">
                    Jumlah Jam Efektif = Jumlah Pekan Efektif × JP Per Pekan
                  </p>
                  <p className="font-bold text-slate-900 tabular-nums pt-0.5">
                    = {totalPekanEfektif} Pekan × {jpPerPekan} JP = <span className="underline">{jumlahJamEfektif} Jam Pelajaran (JP)</span>
                  </p>
                </div>
              </div>

              {/* Tanda Tangan Resmi */}
              <div className="grid grid-cols-2 gap-8 mt-6 pt-4 text-xs text-slate-900">
                <div>
                  <p>Mengetahui,</p>
                  <p>Kepala Sekolah</p>
                  <div className="h-14" />
                  <p className="font-bold underline">{kepalaSekolah}</p>
                  <p className="tabular-nums">NIP. {nipKepalaSekolah}</p>
                </div>
                <div className="pl-6">
                  <p>{tanggalDokumen}</p>
                  <p>Guru Kelas / Mapel</p>
                  <div className="h-14" />
                  <p className="font-bold underline">{guruMapel}</p>
                  <p className="tabular-nums">NIP. {nipGuru}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabel 1: Jumlah Pekan dalam Satu Semester (Mode Edit) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                  1. Jumlah Pekan dalam Satu Semester ({semester})
                </h4>
                <span className="text-[11px] text-slate-400">Dapat diedit langsung pada kotak angka</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-300 font-bold border-b border-slate-700">
                      <th className="p-3 w-12 text-center border-r border-slate-700/80">No</th>
                      <th className="p-3 w-28 border-r border-slate-700/80">Bulan</th>
                      <th className="p-3 w-28 text-center border-r border-slate-700/80">Jumlah Pekan</th>
                      <th className="p-3 w-28 text-center border-r border-slate-700/80">Pekan Efektif</th>
                      <th className="p-3 w-28 text-center border-r border-slate-700/80">Pekan Tidak Efektif</th>
                      <th className="p-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {monthRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-750/50">
                        <td className="p-3 text-center text-slate-400 font-mono tabular-nums font-bold border-r border-slate-700/70">{r.no}</td>
                        <td className="p-3 font-bold text-white border-r border-slate-700/70">{r.bulan}</td>
                        <td className="p-3 text-center border-r border-slate-700/70">
                          <input
                            type="number"
                            min={0}
                            value={r.jumlahPekan}
                            onChange={(e) => updateMonthRow(idx, 'jumlahPekan', Number(e.target.value) || 0)}
                            className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center text-white font-mono tabular-nums font-bold"
                          />
                        </td>
                        <td className="p-3 text-center border-r border-slate-700/70">
                          <input
                            type="number"
                            min={0}
                            value={r.pekanEfektif}
                            onChange={(e) => updateMonthRow(idx, 'pekanEfektif', Number(e.target.value) || 0)}
                            className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center text-emerald-400 font-mono tabular-nums font-bold"
                          />
                        </td>
                        <td className="p-3 text-center font-mono tabular-nums font-bold text-amber-400 border-r border-slate-700/70">
                          {r.pekanTidakEfektif}
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={r.keterangan}
                            onChange={(e) => updateMonthRow(idx, 'keterangan', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-slate-200 text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900/90 font-black text-white text-xs border-t-2 border-slate-700">
                      <td colSpan={2} className="p-3 text-center uppercase tracking-wide text-amber-400 border-r border-slate-700/70">
                        Jumlah
                      </td>
                      <td className="p-3 text-center font-mono tabular-nums text-sm text-white border-r border-slate-700/70">{totalJumlahPekan}</td>
                      <td className="p-3 text-center font-mono tabular-nums text-sm text-emerald-400 border-r border-slate-700/70">{totalPekanEfektif}</td>
                      <td className="p-3 text-center font-mono tabular-nums text-sm text-amber-400 border-r border-slate-700/70">{totalPekanTidakEfektif}</td>
                      <td className="p-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabel 2: Pekan Tidak Efektif (Mode Edit) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                  2. Rincian Pekan Tidak Efektif
                </h4>
                <button
                  type="button"
                  onClick={addInactiveRow}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kegiatan</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-300 font-bold border-b border-slate-700">
                      <th className="p-3 w-12 text-center border-r border-slate-700/80">No.</th>
                      <th className="p-3 min-w-[240px] border-r border-slate-700/80">Uraian Kegiatan</th>
                      <th className="p-3 w-32 text-center border-r border-slate-700/80">Jumlah (Pekan)</th>
                      <th className="p-3 min-w-[200px] border-r border-slate-700/80">Keterangan</th>
                      <th className="p-3 w-12 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {inactiveRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-750/50">
                        <td className="p-3 text-center text-slate-400 font-mono tabular-nums font-bold border-r border-slate-700/70">{idx + 1}</td>
                        <td className="p-3 border-r border-slate-700/70">
                          <input
                            type="text"
                            value={r.uraianKegiatan}
                            onChange={(e) => updateInactiveRow(idx, 'uraianKegiatan', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-white font-medium"
                          />
                        </td>
                        <td className="p-3 text-center border-r border-slate-700/70">
                          <input
                            type="number"
                            min={0}
                            value={r.jumlahPekan}
                            onChange={(e) => updateInactiveRow(idx, 'jumlahPekan', Number(e.target.value) || 0)}
                            className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center text-amber-400 font-mono tabular-nums font-bold"
                          />
                        </td>
                        <td className="p-3 border-r border-slate-700/70">
                          <input
                            type="text"
                            value={r.keterangan}
                            onChange={(e) => updateInactiveRow(idx, 'keterangan', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-slate-200"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeInactiveRow(idx)}
                            className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900/90 font-black text-white text-xs border-t-2 border-slate-700">
                      <td colSpan={2} className="p-3 text-center uppercase tracking-wide text-rose-400 border-r border-slate-700/70">
                        Jumlah
                      </td>
                      <td className="p-3 text-center font-mono tabular-nums text-sm text-amber-400 border-r border-slate-700/70">
                        {totalInactiveKegiatan}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rumus Alokasi Waktu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 text-sm block">3. Jumlah Pekan Efektif</span>
                <p className="text-slate-400 font-mono">
                  Jumlah Pekan Efektif = Jumlah Pekan dalam Semester – Jumlah Pekan Tidak Efektif
                </p>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono tabular-nums font-bold text-sm">
                  Jumlah Pekan Efektif = {totalJumlahPekan} Pekan – {totalPekanTidakEfektif} Pekan = <span className="text-white text-base underline decoration-emerald-400">{totalPekanEfektif} Pekan</span>
                </div>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 text-sm block">4. Jumlah Jam Efektif</span>
                <p className="text-slate-400 font-mono">
                  Jumlah Jam Efektif = Jumlah Pekan Efektif × JP Per Pekan
                </p>
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono tabular-nums font-bold text-sm">
                  Jumlah Jam Efektif = {totalPekanEfektif} × {jpPerPekan} = <span className="text-white text-base underline decoration-cyan-400">{jumlahJamEfektif} Jam Pelajaran (JP)</span>
                </div>
              </div>
            </div>

            {/* Tanda Tangan */}
            <div className="pt-4 border-t border-slate-700/80 grid grid-cols-2 text-xs text-center text-slate-300">
              <div>
                <span className="text-slate-400 block mb-1">Mengetahui,</span>
                <span className="font-bold text-white block">Kepala Sekolah</span>
                <div className="h-14"></div>
                <span className="font-bold text-white underline block">{kepalaSekolah}</span>
                <span className="text-[11px] text-slate-400 font-mono">NIP. {nipKepalaSekolah}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">{tanggalDokumen}</span>
                <span className="font-bold text-white block">Guru Mata Pelajaran</span>
                <div className="h-14"></div>
                <span className="font-bold text-white underline block">{guruMapel}</span>
                <span className="text-[11px] text-slate-400 font-mono">NIP. {nipGuru}</span>
              </div>
            </div>
          </div>
        )}

        {/* Download Word / PDF / Cetak A4 & F4 */}
        <div className="flex justify-end pt-3 border-t border-slate-700/80">
          <DocumentExportToolbar
            title={`Rincian Pekan Efektif - ${namaSekolah}`}
            filenameBase={`RPE_${namaSekolah}_Kelas_${kelas}_Semester_${semester}`}
            getHtmlContent={buildExportHtml}
            orientation="portrait"
          />
        </div>
      </div>
    </div>
  );
}
