'use client';

import React, { useState } from 'react';
import { 
  CalendarDays, Sparkles, Download, Copy, Check, Plus, Trash2, 
  RotateCcw, BookmarkCheck, CheckCircle2, AlertCircle, FileDown,
  Layers, Clock, School, ShieldCheck, Edit3, Monitor, Printer
} from 'lucide-react';
import { ProtaRow } from '@/app/api/gemini/generate-prota/route';
import { DocumentExportToolbar } from '@/components/DocumentExportToolbar';
import { escapeHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

interface ProtaPreset {
  label: string;
  namaMapel: string;
  kelas: string;
  fase: string;
  tahunPelajaran: string;
  jpPerMinggu: number;
  pekanSmt1: number;
  pekanSmt2: number;
  babSemester1: string;
  babSemester2: string;
  tujuanPembelajaran: string;
}

const PRESET_TEMPLATES: ProtaPreset[] = [
  {
    label: 'PJOK Kelas V (Fase C) - 5 JP/Pekan (Total 185 JP)',
    namaMapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelas: 'Kelas V (Lima)',
    fase: 'Fase C',
    tahunPelajaran: '2026/2027',
    jpPerMinggu: 5,
    pekanSmt1: 18,
    pekanSmt2: 19,
    babSemester1: `Bab 1: Variasi & Kombinasi Pola Gerak Dasar Permainan Bola Besar (Sepak Bola & Bola Voli)
Bab 2: Variasi & Kombinasi Pola Gerak Dasar Permainan Bola Kecil (Kasti / Rounders)
Bab 3: Aktivitas Atletik Dasar (Lari Jarak Pendek 40m & Lompat Jauh Gaya Jongkok)
Bab 4: Kebugaran Jasmani Terkait Kesehatan & Baterai Tes TKJI`,
    babSemester2: `Bab 5: Senam Lantai Ketangkasan (Guling Depan & Keseimbangan Statis)
Bab 6: Aktivitas Gerak Berirama (Senam Kesegaran Jasmani & Langkah Kaki)
Bab 7: Aktivitas Air & Prosedur Keselamatan Diri di Air (Gaya Dada Modifikasi)
Bab 8: Pemeliharaan Kebersihan Alat Reproduksi & Pola Hidup Bersih Sehat (PHBS)`,
    tujuanPembelajaran: `1.1 Murid dapat mempraktikkan variasi dan kombinasi pola gerak dasar menendang, menghentikan, dan menggiring bola sepak dengan kontrol terarah dan sportif.
1.2 Murid dapat mempraktikkan keterampilan passing bawah dan passing atas bola voli secara berpasangan dengan koordinasi tepat.
2.1 Murid dapat mempraktikkan lempar tangkap dan memukul bola kasti/rounders dengan akurasi terarah dan mematuhi aturan modifikasi.
2.2 Murid dapat menerapkan kerja sama dan taktik regu pemukul serta regu penjaga dalam permainan kasti.
3.1 Murid dapat mempraktikkan start jongkok, ayunan lengan, dan langkah sprint 40 meter dengan teknik yang benar.
3.2 Murid dapat mempraktikkan awalan, tumpuan balok, melayang, dan mendarat pada lompat jauh gaya jongkok secara aman.
4.1 Murid dapat mempraktikkan sirkuit latihan daya tahan jantung-paru (shuttle run) dan kekuatan otot (sit up, push up).
4.2 Murid dapat mengukur kebugaran pribadi melalui tes TKJI serta mencatat lonjakan denyut nadi latihan.
5.1 Murid dapat mempraktikkan variasi guling depan di atas matras dengan awalan berdiri atau jongkok secara aman.
5.2 Murid dapat mempraktikkan sikap lilin dan berdiri satu kaki menyerupai pesawat untuk melatih keseimbangan statis.
6.1 Murid dapat mempraktikkan variasi langkah biasa, langkah rapat, dan langkah keseimbangan mengikuti ketukan musik.
6.2 Murid dapat merangkai kombinasi langkah kaki dan ayunan lengan dalam koreografi senam kreasi sederhana secara kompak.
7.1 Murid dapat menunjukkan gerakan meluncur, pernapasan ritmis, dan gerakan tungkai renang di kolam dangkal dengan percaya diri.
7.2 Murid dapat mengidentifikasi etika keselamatan kolam renang dan pertolongan sederhana pada kram air.
8.1 Murid dapat menganalisis pentingnya menjaga kebersihan alat reproduksi pada masa pubertas dan merawat pakaian dalam.
8.2 Murid dapat menganalisis gizi seimbang, pola tidur cukup, dan bahaya zat adiktif bagi kesehatan fisik.`,
  },
  {
    label: 'PJOK Kelas IV (Fase B) - 4 JP/Pekan (Total 148 JP)',
    namaMapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelas: 'Kelas IV (Empat)',
    fase: 'Fase B',
    tahunPelajaran: '2026/2027',
    jpPerMinggu: 4,
    pekanSmt1: 18,
    pekanSmt2: 19,
    babSemester1: `Bab 1: Pola Gerak Dasar Lokomotor, Non-Lokomotor & Manipulatif Permainan Invasi (Sepak Bola)
Bab 2: Pola Gerak Dasar Permainan Net (Bola Voli Modifikasi)
Bab 3: Gerak Dasar Atletik Jalan Cepat & Lari Jarak Pendek
Bab 4: Kebugaran Jasmani Dasar & Pengenalan Denyut Nadi`,
    babSemester2: `Bab 5: Pola Gerak Dominan Senam Lantai (Bertumpu, Berguling)
Bab 6: Aktivitas Gerak Berirama Meniru Gerakan Hewan & Tumbuhan
Bab 7: Pengenalan Aktivitas Air & Gerakan Mengapung
Bab 8: Mengenal Pola Makanan Sehat dan Bergizi Seimbang`,
    tujuanPembelajaran: `1.1 Murid dapat mempraktikkan gerak menendang dan menghentikan bola dengan kaki bagian dalam secara mandiri.
1.2 Murid dapat mempraktikkan menggiring bola melewati rintangan corong dengan koordinasi baik.
2.1 Murid dapat mempraktikkan passing bawah bola voli modifikasi dengan posisi lutut menekuk tepat.
3.1 Murid dapat mempraktikkan jalan cepat dan lari cepat menempuh jarak 30 meter dengan semangat.
4.1 Murid dapat melakukan latihan kekuatan otot lengan dan perut sederhana serta menghitung denyut nadi setelah beraktivitas.
5.1 Murid dapat mempraktikkan guling ke samping dan guling depan dengan bantuan guru di atas matras.
6.1 Murid dapat mempraktikkan gerak langkah berirama meniru alam dan hewan diiringi tepuk tangan.
7.1 Murid dapat mempraktikkan gerak memasukkan muka ke air dan mengapung dengan memegang tepi kolam.
8.1 Murid dapat menjelaskan jenis makanan bergizi 4 sehat 5 sempurna dan manfaatnya bagi pertumbuhan tubuh.`,
  },
];

export function ProtaGenerator() {
  // Identity state
  const [namaSekolah, setNamaSekolah] = useState('SD Negeri Kalimantong');
  const [namaMapel, setNamaMapel] = useState('Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)');
  const [kelas, setKelas] = useState('Kelas V (Lima)');
  const [fase, setFase] = useState('Fase C');
  const [tahunPelajaran, setTahunPelajaran] = useState('2026/2027');
  const [jpPerMinggu, setJpPerMinggu] = useState<number>(5);
  const [pekanSmt1, setPekanSmt1] = useState<number>(18);
  const [pekanSmt2, setPekanSmt2] = useState<number>(19);

  // Content inputs
  const [babSemester1, setBabSemester1] = useState(PRESET_TEMPLATES[0].babSemester1);
  const [babSemester2, setBabSemester2] = useState(PRESET_TEMPLATES[0].babSemester2);
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState(PRESET_TEMPLATES[0].tujuanPembelajaran);

  // Signatures
  const [kepalaSekolah, setKepalaSekolah] = useState('H. A. Kadir, S.Pd., M.Pd.');
  const [nipKepalaSekolah, setNipKepalaSekolah] = useState('19680512 199303 1 008');
  const [guruMapel, setGuruMapel] = useState('Guru PJOK SD Negeri Kalimantong');
  const [nipGuru, setNipGuru] = useState('19880724 201503 1 003');
  const [titimangsa, setTitimangsa] = useState('Kalimantong, 13 Juli 2026');

  // Execution states
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ProtaRow[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<'print' | 'edit'>('print');

  // Calculations
  const targetJpSmt1 = pekanSmt1 * jpPerMinggu;
  const targetJpSmt2 = pekanSmt2 * jpPerMinggu;
  const targetTotalJp = targetJpSmt1 + targetJpSmt2;

  const currentTotalSmt1 = rows
    ? rows.filter((r) => r.semester === 'I (Ganjil)').reduce((acc, r) => acc + (Number(r.alokasiWaktu) || 0), 0)
    : 0;
  const currentTotalSmt2 = rows
    ? rows.filter((r) => r.semester === 'II (Genap)').reduce((acc, r) => acc + (Number(r.alokasiWaktu) || 0), 0)
    : 0;
  const currentTotalTahunan = currentTotalSmt1 + currentTotalSmt2;

  // Apply template
  const applyTemplate = (tpl: ProtaPreset) => {
    setNamaMapel(tpl.namaMapel);
    setKelas(tpl.kelas);
    setFase(tpl.fase);
    setTahunPelajaran(tpl.tahunPelajaran);
    setJpPerMinggu(tpl.jpPerMinggu);
    setPekanSmt1(tpl.pekanSmt1);
    setPekanSmt2(tpl.pekanSmt2);
    setBabSemester1(tpl.babSemester1);
    setBabSemester2(tpl.babSemester2);
    setTujuanPembelajaran(tpl.tujuanPembelajaran);
    setRows(null);
  };

  // Reset
  const handleReset = () => {
    setNamaMapel('Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)');
    setKelas('');
    setFase('');
    setBabSemester1('');
    setBabSemester2('');
    setTujuanPembelajaran('');
    setRows(null);
  };

  // Generate PROTA
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await postJsonSafe<{ rows?: ProtaRow[] }>(
        '/api/gemini/generate-prota',
        {
          namaSekolah,
          namaMapel,
          kelas,
          fase,
          tahunPelajaran,
          jpPerMinggu,
          pekanSmt1,
          pekanSmt2,
          babSemester1,
          babSemester2,
          tujuanPembelajaran,
          kepalaSekolah,
          nipKepalaSekolah,
          guruMapel,
          nipGuru,
          titimangsa,
        }
      );

      if (res.data?.rows && Array.isArray(res.data.rows)) {
        setRows(res.data.rows);
      }
    } finally {
      setLoading(false);
    }
  };

  // Row operations
  const handleUpdateRow = (index: number, field: keyof ProtaRow, value: string | number | boolean) => {
    if (!rows) return;
    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      [field]: field === 'alokasiWaktu' ? Number(value) : value,
    };
    setRows(updated);
  };

  const handleAddRow = (semester: 'I (Ganjil)' | 'II (Genap)') => {
    if (!rows) return;
    const newRow: ProtaRow = {
      noBabAtp: `${rows.length + 1}`,
      bab: semester === 'I (Ganjil)' ? 'Bab Baru Semester I' : 'Bab Baru Semester II',
      tujuanPembelajaran: 'Murid dapat...',
      materi: 'Materi pokok baru',
      alokasiWaktu: jpPerMinggu,
      semester,
      isCadangan: false,
    };
    setRows([...rows, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    if (!rows) return;
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  // Build HTML for Word / PDF / Print export with Portrait orientation
  const buildExportHtml = (): string => {
    if (!rows || rows.length === 0) return '';

    const smt1Rows = rows.filter((r) => r.semester === 'I (Ganjil)');
    const smt2Rows = rows.filter((r) => r.semester === 'II (Genap)');
    const totalSmt1 = smt1Rows.reduce((a, b) => a + (Number(b.alokasiWaktu) || 0), 0);
    const totalSmt2 = smt2Rows.reduce((a, b) => a + (Number(b.alokasiWaktu) || 0), 0);
    const totalTahunan = totalSmt1 + totalSmt2;

    const renderTableRows = (list: ProtaRow[]) => {
      return list
        .map(
          (r) => `
        <tr style="${r.isCadangan ? 'background-color:#fef9c3; font-weight:bold;' : ''}">
          <td style="border:1pt solid #000; padding:6pt 8pt; text-align:center; vertical-align:top; font-size:9.5pt;">${escapeHtml(r.noBabAtp)}</td>
          <td style="border:1pt solid #000; padding:6pt 8pt; vertical-align:top; font-size:9.5pt;">${escapeHtml(r.bab)}</td>
          <td style="border:1pt solid #000; padding:6pt 8pt; vertical-align:top; font-size:9.5pt;">${escapeHtml(r.tujuanPembelajaran)}</td>
          <td style="border:1pt solid #000; padding:6pt 8pt; vertical-align:top; font-size:9.5pt;">${escapeHtml(r.materi)}</td>
          <td style="border:1pt solid #000; padding:6pt 8pt; text-align:center; vertical-align:top; font-size:9.5pt; font-weight:bold;">${r.alokasiWaktu} JP</td>
          <td style="border:1pt solid #000; padding:6pt 8pt; text-align:center; vertical-align:top; font-size:9.5pt;">${escapeHtml(r.semester)}</td>
        </tr>
      `
        )
        .join('');
    };

    return `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>PROTA - ${escapeHtml(namaMapel)} ${escapeHtml(kelas)}</title>
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
            margin: 18mm 15mm 18mm 15mm;
            mso-page-orientation: portrait;
          }
          div.WordSection1 {
            page: WordSection1;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.35;
            color: #000000;
          }
          h1 {
            font-size: 14pt;
            font-weight: bold;
            text-align: center;
            margin: 0 0 4pt 0;
            text-transform: uppercase;
          }
          h2 {
            font-size: 12pt;
            font-weight: bold;
            text-align: center;
            margin: 0 0 14pt 0;
            text-transform: uppercase;
          }
          table.meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12pt;
            font-size: 10.5pt;
          }
          table.meta-table td {
            padding: 2.5pt 0;
            border: none;
            vertical-align: top;
          }
          table.prota-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14pt;
            font-size: 9.5pt;
          }
          table.prota-table thead {
            display: table-header-group;
          }
          table.prota-table tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          table.prota-table th {
            background-color: #f1f5f9;
            color: #000000;
            font-weight: bold;
            text-align: center;
            padding: 6pt 4pt;
            border: 1pt solid #000000;
            font-size: 9.5pt;
          }
          .subtotal-row td {
            background-color: #e2e8f0;
            font-weight: bold;
            border: 1pt solid #000000;
            padding: 6pt 8pt;
            font-size: 9.5pt;
          }
          .total-row td {
            background-color: #cbd5e1;
            font-weight: bold;
            border: 1.5pt solid #000000;
            padding: 7pt 8pt;
            font-size: 10pt;
          }
          table.sig-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20pt;
            font-size: 11pt;
            page-break-inside: avoid;
          }
          table.sig-table td {
            border: none;
            vertical-align: top;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div class="WordSection1">
          <h1>PROGRAM TAHUNAN (PROTA)</h1>
          <h2>KURIKULUM MERDEKA TAHUN PELAJARAN ${escapeHtml(tahunPelajaran)}</h2>

          <table class="meta-table">
            <tr>
              <td style="width: 160pt; font-weight: bold;">Satuan Pendidikan</td>
              <td style="width: 12pt;">:</td>
              <td>${escapeHtml(namaSekolah)}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Mata Pelajaran</td>
              <td>:</td>
              <td>${escapeHtml(namaMapel)}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Kelas / Fase</td>
              <td>:</td>
              <td>${escapeHtml(kelas)} / ${escapeHtml(fase)}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Tahun Pelajaran</td>
              <td>:</td>
              <td>${escapeHtml(tahunPelajaran)}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Alokasi Waktu per Minggu</td>
              <td>:</td>
              <td>${jpPerMinggu} Jam Pelajaran (JP) / Minggu</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Total Alokasi Waktu 1 Tahun</td>
              <td>:</td>
              <td>${totalTahunan} JP (${pekanSmt1} Pekan Smt I + ${pekanSmt2} Pekan Smt II)</td>
            </tr>
          </table>

          <table class="prota-table" border="1">
            <thead>
              <tr>
                <th style="width: 55pt;">No Bab/ATP</th>
                <th style="width: 110pt;">Bab</th>
                <th style="width: 190pt;">Tujuan Pembelajaran</th>
                <th style="width: 120pt;">Materi</th>
                <th style="width: 55pt;">Alokasi Waktu</th>
                <th style="width: 60pt;">Semester</th>
              </tr>
            </thead>
            <tbody>
              <!-- SEMESTER 1 -->
              ${renderTableRows(smt1Rows)}
              <tr class="subtotal-row">
                <td colspan="4" style="text-align: right; text-transform: uppercase;">JUMLAH ALOKASI WAKTU SEMESTER I (GANJIL)</td>
                <td style="text-align: center;">${totalSmt1} JP</td>
                <td style="text-align: center;">I</td>
              </tr>

              <!-- SEMESTER 2 -->
              ${renderTableRows(smt2Rows)}
              <tr class="subtotal-row">
                <td colspan="4" style="text-align: right; text-transform: uppercase;">JUMLAH ALOKASI WAKTU SEMESTER II (GENAP)</td>
                <td style="text-align: center;">${totalSmt2} JP</td>
                <td style="text-align: center;">II</td>
              </tr>

              <!-- TOTAL 1 TAHUN -->
              <tr class="total-row">
                <td colspan="4" style="text-align: right; text-transform: uppercase;">TOTAL ALOKASI WAKTU SATU TAHUN PELAJARAN</td>
                <td style="text-align: center;">${totalTahunan} JP</td>
                <td style="text-align: center;">I &amp; II</td>
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
              <td style="width: 50%; text-align: left; padding-left: 20pt;">
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

  const handleCopyMarkdown = () => {
    if (!rows) return;
    const text = rows
      .map((r) => `${r.noBabAtp}\t${r.bab}\t${r.tujuanPembelajaran}\t${r.materi}\t${r.alokasiWaktu} JP\t${r.semester}`)
      .join('\n');
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
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 font-black">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                  Kurikulum Merdeka • Administrasi Guru
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-300">Format 6 Kolom + Alokasi Cadangan</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                Generator Program Tahunan (PROTA)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Susun alokasi waktu per bab dan ATP secara otomatis berdasar beban pekan semester (18 Pekan Smt 1 + 19 Pekan Smt 2), lengkap dengan cadangan dan ekspor Word (.doc) Portrait siap pakai.
              </p>
            </div>
          </div>

          {rows && (
            <div className="flex flex-wrap items-center gap-2">
              <DocumentExportToolbar
                title={`PROTA - ${namaMapel} ${kelas}`}
                filenameBase={`PROTA_${namaMapel}_${kelas}_${tahunPelajaran}`}
                getHtmlContent={buildExportHtml}
                orientation="portrait"
              />
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin' : 'Salin Data'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Presets */}
        <div className="mt-5 pt-4 border-t border-slate-700/80">
          <span className="text-xs font-bold text-slate-300 block mb-2">
            Pilih Template Siap Pakai Kurikulum Merdeka (1-Klik Isi Lengkap):
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="text-xs bg-slate-900/90 hover:bg-indigo-500/15 text-slate-300 hover:text-indigo-300 border border-slate-700 hover:border-indigo-500/40 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium flex items-center gap-1.5"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>{tpl.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={handleReset}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium"
            >
              Kosongkan / Custom
            </button>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGenerate} className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Identitas &amp; Parameter Alokasi Waktu PROTA
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Total Target: <strong className="text-indigo-400">{targetTotalJp} JP</strong> ({pekanSmt1} Pekan + {pekanSmt2} Pekan × {jpPerMinggu} JP)
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
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Mata Pelajaran ({'{NAMA MAPEL}'}):</label>
            <input
              type="text"
              required
              value={namaMapel}
              onChange={(e) => setNamaMapel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Kelas ({'{KELAS}'}):</label>
            <input
              type="text"
              required
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              placeholder="Contoh: Kelas V (Lima)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Fase ({'{FASE}'}):</label>
            <select
              value={fase}
              onChange={(e) => setFase(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="Fase A (Kelas 1-2)">Fase A (Kelas 1-2)</option>
              <option value="Fase B (Kelas 3-4)">Fase B (Kelas 3-4)</option>
              <option value="Fase C (Kelas 5-6)">Fase C (Kelas 5-6)</option>
              <option value="Fase D (Kelas 7-9)">Fase D (Kelas 7-9)</option>
              <option value="Fase E (Kelas 10)">Fase E (Kelas 10)</option>
              <option value="Fase F (Kelas 11-12)">Fase F (Kelas 11-12)</option>
            </select>
          </div>
        </div>

        {/* Calculation Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-700/80">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Tahun Pelajaran ({'{TAHUN}'}):</label>
            <input
              type="text"
              required
              value={tahunPelajaran}
              onChange={(e) => setTahunPelajaran(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Alokasi Tiap Minggu (JP):</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={10}
                required
                value={jpPerMinggu}
                onChange={(e) => setJpPerMinggu(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold outline-none focus:border-indigo-500"
              />
              <span className="text-slate-400 font-bold">JP</span>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Pekan Smt 1 (Default: 18):</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={10}
                max={25}
                required
                value={pekanSmt1}
                onChange={(e) => setPekanSmt1(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold outline-none focus:border-indigo-500"
              />
              <span className="text-slate-400 text-[11px] whitespace-nowrap">(= {targetJpSmt1} JP)</span>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Pekan Smt 2 (Default: 19):</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={10}
                max={25}
                required
                value={pekanSmt2}
                onChange={(e) => setPekanSmt2(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold outline-none focus:border-indigo-500"
              />
              <span className="text-slate-400 text-[11px] whitespace-nowrap">(= {targetJpSmt2} JP)</span>
            </div>
          </div>
        </div>

        {/* Input Bab & ATP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">
              Daftar Bab Semester 1 (Ganjil):
            </label>
            <textarea
              required
              rows={4}
              value={babSemester1}
              onChange={(e) => setBabSemester1(e.target.value)}
              placeholder="Contoh: Bab 1: Permainan Bola Besar&#10;Bab 2: Permainan Bola Kecil&#10;Bab 3: Atletik..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">
              Daftar Bab Semester 2 (Genap):
            </label>
            <textarea
              required
              rows={4}
              value={babSemester2}
              onChange={(e) => setBabSemester2(e.target.value)}
              placeholder="Contoh: Bab 5: Senam Lantai&#10;Bab 6: Gerak Berirama&#10;Bab 7: Aktivitas Air..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="text-slate-300 font-bold block mb-1">
            Tujuan Pembelajaran Lengkap (Diambil dari ATP):
          </label>
          <textarea
            required
            rows={5}
            value={tujuanPembelajaran}
            onChange={(e) => setTujuanPembelajaran(e.target.value)}
            placeholder="Salin atau ketik seluruh Tujuan Pembelajaran (ATP) di sini..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Signatures & Titimangsa Toggleable */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Titimangsa Dokumen:</label>
            <input
              type="text"
              value={titimangsa}
              onChange={(e) => setTitimangsa(e.target.value)}
              placeholder="Contoh: Kalimantong, 13 Juli 2026"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Nama Kepala Sekolah &amp; NIP:</label>
            <input
              type="text"
              value={kepalaSekolah}
              onChange={(e) => setKepalaSekolah(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500 mb-1"
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
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500 mb-1"
            />
            <input
              type="text"
              value={nipGuru}
              onChange={(e) => setNipGuru(e.target.value)}
              placeholder="NIP Guru PJOK"
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-2 text-slate-300 text-[11px] outline-none"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-700">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Format 6 Kolom: No Bab/ATP • Bab • Tujuan Pembelajaran • Materi • Alokasi Waktu • Semester</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-slate-950 font-black text-xs shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Menyusun Tabel PROTA &amp; Perhitungan Alokasi JP...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Tabel PROTA Lengkap</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Result Table */}
      {rows && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-5">
          {/* Top Status & Metrics */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Hasil Penyusunan Program Tahunan
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-300">
                  {namaSekolah}
                </span>
              </div>
              <h3 className="text-base font-black text-white">
                PROTA {namaMapel} — {kelas} ({tahunPelajaran})
              </h3>
            </div>

            {/* Quick Metrics Comparison */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 ${
                currentTotalSmt1 === targetJpSmt1
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                <span>Smt 1:</span>
                <span className="font-mono">{currentTotalSmt1}/{targetJpSmt1} JP</span>
                {currentTotalSmt1 === targetJpSmt1 && <Check className="w-3.5 h-3.5" />}
              </div>

              <div className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 ${
                currentTotalSmt2 === targetJpSmt2
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                <span>Smt 2:</span>
                <span className="font-mono">{currentTotalSmt2}/{targetJpSmt2} JP</span>
                {currentTotalSmt2 === targetJpSmt2 && <Check className="w-3.5 h-3.5" />}
              </div>

              <div className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 ${
                currentTotalTahunan === targetTotalJp
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                <span>Total 1 Tahun:</span>
                <span className="font-mono">{currentTotalTahunan}/{targetTotalJp} JP</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewMode('edit')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    previewMode === 'edit'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Mode Edit</span>
                </button>
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
                  <span>Pratinjau Siap Cetak</span>
                </button>
              </div>
              <DocumentExportToolbar
                title={`PROTA - ${namaMapel} ${kelas}`}
                filenameBase={`PROTA_${namaMapel}_${kelas}_${tahunPelajaran}`}
                getHtmlContent={buildExportHtml}
                orientation="portrait"
              />
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {previewMode === 'print' ? (
            <div className="print-sheet bg-white text-slate-900 rounded-xl border border-slate-300 shadow-2xl p-6 sm:p-10 font-serif text-xs leading-relaxed">
              <div className="text-center border-b-2 border-double border-slate-900 pb-3 mb-5">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-slate-900">
                  PROGRAM TAHUNAN (PROTA)
                </h4>
                <p className="text-xs font-bold uppercase text-slate-700 mt-0.5">
                  KURIKULUM MERDEKA TAHUN PELAJARAN {tahunPelajaran}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-xs mb-5 font-sans">
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
                  <span className="tabular-nums">: {jpPerMinggu} Jam Pelajaran (JP)</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-slate-700 w-36 shrink-0">Kelas / Fase</span>
                  <span>: {kelas} / {fase}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-slate-700 w-36 shrink-0">Total Alokasi 1 Tahun</span>
                  <span className="font-bold tabular-nums">: {currentTotalTahunan} JP ({pekanSmt1} + {pekanSmt2} Pekan)</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-slate-900 font-sans">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold">
                      <th className="border border-slate-900 px-2.5 py-2 text-center w-20">No Bab/ATP</th>
                      <th className="border border-slate-900 px-2.5 py-2 text-left w-40">Bab</th>
                      <th className="border border-slate-900 px-2.5 py-2 text-left">Tujuan Pembelajaran</th>
                      <th className="border border-slate-900 px-2.5 py-2 text-left w-44">Materi</th>
                      <th className="border border-slate-900 px-2.5 py-2 text-center w-24">Alokasi Waktu</th>
                      <th className="border border-slate-900 px-2.5 py-2 text-center w-24">Semester</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows
                      .filter((r) => r.semester === 'I (Ganjil)')
                      .map((r, i) => (
                        <tr key={`p1-${i}`} className={r.isCadangan ? 'bg-amber-50 font-semibold' : i % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                          <td className="border border-slate-900 px-2.5 py-2 text-center align-top tabular-nums font-bold">{r.noBabAtp}</td>
                          <td className="border border-slate-900 px-2.5 py-2 align-top">{r.bab}</td>
                          <td className="border border-slate-900 px-2.5 py-2 align-top whitespace-pre-line">{r.tujuanPembelajaran}</td>
                          <td className="border border-slate-900 px-2.5 py-2 align-top">{r.materi}</td>
                          <td className="border border-slate-900 px-2.5 py-2 text-center align-top font-bold tabular-nums">{r.alokasiWaktu} JP</td>
                          <td className="border border-slate-900 px-2.5 py-2 text-center align-top">{r.semester}</td>
                        </tr>
                      ))}
                    <tr className="bg-slate-200/80 font-bold">
                      <td colSpan={4} className="border border-slate-900 px-3 py-2 text-right uppercase">
                        Jumlah Alokasi Waktu Semester I (Ganjil)
                      </td>
                      <td className="border border-slate-900 px-2.5 py-2 text-center tabular-nums">{currentTotalSmt1} JP</td>
                      <td className="border border-slate-900 px-2.5 py-2 text-center">I</td>
                    </tr>
                    {rows
                      .filter((r) => r.semester === 'II (Genap)')
                      .map((r, i) => (
                        <tr key={`p2-${i}`} className={r.isCadangan ? 'bg-amber-50 font-semibold' : i % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                          <td className="border border-slate-900 px-2.5 py-2 text-center align-top tabular-nums font-bold">{r.noBabAtp}</td>
                          <td className="border border-slate-900 px-2.5 py-2 align-top">{r.bab}</td>
                          <td className="border border-slate-900 px-2.5 py-2 align-top whitespace-pre-line">{r.tujuanPembelajaran}</td>
                          <td className="border border-slate-900 px-2.5 py-2 align-top">{r.materi}</td>
                          <td className="border border-slate-900 px-2.5 py-2 text-center align-top font-bold tabular-nums">{r.alokasiWaktu} JP</td>
                          <td className="border border-slate-900 px-2.5 py-2 text-center align-top">{r.semester}</td>
                        </tr>
                      ))}
                    <tr className="bg-slate-200/80 font-bold">
                      <td colSpan={4} className="border border-slate-900 px-3 py-2 text-right uppercase">
                        Jumlah Alokasi Waktu Semester II (Genap)
                      </td>
                      <td className="border border-slate-900 px-2.5 py-2 text-center tabular-nums">{currentTotalSmt2} JP</td>
                      <td className="border border-slate-900 px-2.5 py-2 text-center">II</td>
                    </tr>
                    <tr className="bg-slate-300 font-black">
                      <td colSpan={4} className="border border-slate-900 px-3 py-2.5 text-right uppercase">
                        Total Alokasi Waktu Satu Tahun Pelajaran
                      </td>
                      <td className="border border-slate-900 px-2.5 py-2.5 text-center tabular-nums">{currentTotalTahunan} JP</td>
                      <td className="border border-slate-900 px-2.5 py-2.5 text-center">I &amp; II</td>
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
                <div className="pl-6">
                  <p>{titimangsa}</p>
                  <p>Guru Mata Pelajaran PJOK</p>
                  <div className="h-16" />
                  <p className="font-bold underline">{guruMapel}</p>
                  <p className="tabular-nums">NIP. {nipGuru}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Interactive Editable Table */
            <div className="overflow-x-auto border border-slate-700 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-200 font-bold border-b border-slate-700">
                    <th className="p-3 text-center w-24 border-r border-slate-700/80">No Bab/ATP</th>
                    <th className="p-3 min-w-[180px] border-r border-slate-700/80">Bab</th>
                    <th className="p-3 min-w-[280px] border-r border-slate-700/80">Tujuan Pembelajaran</th>
                    <th className="p-3 min-w-[180px] border-r border-slate-700/80">Materi</th>
                    <th className="p-3 text-center w-28 border-r border-slate-700/80">Alokasi Waktu</th>
                    <th className="p-3 text-center w-28 border-r border-slate-700/80">Semester</th>
                    <th className="p-3 text-center w-12">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/70">
                  {/* Semester 1 Section */}
                  <tr className="bg-slate-950/80">
                    <td colSpan={7} className="p-2.5 px-4 font-black text-indigo-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
                      SEMESTER I (GANJIL) • Target: {targetJpSmt1} JP ({pekanSmt1} Pekan)
                    </td>
                  </tr>
                  {rows
                    .filter((r) => r.semester === 'I (Ganjil)')
                    .map((row) => {
                      const originalIndex = rows.indexOf(row);
                      return (
                        <tr
                          key={originalIndex}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            row.isCadangan ? 'bg-amber-500/10' : ''
                          }`}
                        >
                          <td className="p-2 text-center align-top border-r border-slate-700/70">
                            <input
                              type="text"
                              value={row.noBabAtp}
                              onChange={(e) => handleUpdateRow(originalIndex, 'noBabAtp', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-center font-mono tabular-nums font-bold text-slate-300 text-xs outline-none focus:border-indigo-500"
                            />
                            {row.isCadangan && (
                              <span className="block mt-1 text-[9px] uppercase font-bold text-amber-400 bg-amber-500/20 rounded px-1 py-0.5">
                                Cadangan
                              </span>
                            )}
                          </td>
                          <td className="p-2 align-top border-r border-slate-700/70">
                            <textarea
                              rows={2}
                              value={row.bab}
                              onChange={(e) => handleUpdateRow(originalIndex, 'bab', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 resize-none font-medium"
                            />
                          </td>
                          <td className="p-2 align-top border-r border-slate-700/70">
                            <textarea
                              rows={3}
                              value={row.tujuanPembelajaran}
                              onChange={(e) => handleUpdateRow(originalIndex, 'tujuanPembelajaran', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-100 outline-none focus:border-indigo-500 resize-none leading-relaxed"
                            />
                          </td>
                          <td className="p-2 align-top border-r border-slate-700/70">
                            <textarea
                              rows={2}
                              value={row.materi}
                              onChange={(e) => handleUpdateRow(originalIndex, 'materi', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500 resize-none"
                            />
                          </td>
                          <td className="p-2 text-center align-top border-r border-slate-700/70">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                step={1}
                                min={1}
                                value={row.alokasiWaktu}
                                onChange={(e) => handleUpdateRow(originalIndex, 'alokasiWaktu', e.target.value)}
                                className="w-16 bg-slate-900 border border-slate-800 rounded p-1.5 text-center font-mono tabular-nums font-bold text-indigo-300 text-xs outline-none focus:border-indigo-500"
                              />
                              <span className="text-[11px] font-bold text-slate-400">JP</span>
                            </div>
                          </td>
                          <td className="p-2 text-center align-top border-r border-slate-700/70">
                            <select
                              value={row.semester}
                              onChange={(e) => handleUpdateRow(originalIndex, 'semester', e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs outline-none cursor-pointer"
                            >
                              <option value="I (Ganjil)">I (Ganjil)</option>
                              <option value="II (Genap)">II (Genap)</option>
                            </select>
                          </td>
                          <td className="p-2 text-center align-top">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(originalIndex)}
                              title="Hapus Baris"
                              className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  <tr className="bg-slate-900/90 font-bold border-t border-b border-slate-700">
                    <td colSpan={4} className="p-3 text-right uppercase text-slate-300 border-r border-slate-700/70">
                      JUMLAH ALOKASI WAKTU SEMESTER I (GANJIL):
                    </td>
                    <td className="p-3 text-center font-mono tabular-nums font-extrabold text-indigo-400 text-sm border-r border-slate-700/70">
                      {currentTotalSmt1} JP
                    </td>
                    <td colSpan={2} className="p-3 text-left">
                      <button
                        type="button"
                        onClick={() => handleAddRow('I (Ganjil)')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambah TP Smt 1</span>
                      </button>
                    </td>
                  </tr>

                  {/* Semester 2 Section */}
                  <tr className="bg-slate-950/80">
                    <td colSpan={7} className="p-2.5 px-4 font-black text-sky-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
                      SEMESTER II (GENAP) • Target: {targetJpSmt2} JP ({pekanSmt2} Pekan)
                    </td>
                  </tr>
                  {rows
                    .filter((r) => r.semester === 'II (Genap)')
                    .map((row) => {
                      const originalIndex = rows.indexOf(row);
                      return (
                        <tr
                          key={originalIndex}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            row.isCadangan ? 'bg-amber-500/10' : ''
                          }`}
                        >
                          <td className="p-2 text-center align-top border-r border-slate-700/70">
                            <input
                              type="text"
                              value={row.noBabAtp}
                              onChange={(e) => handleUpdateRow(originalIndex, 'noBabAtp', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-center font-mono tabular-nums font-bold text-slate-300 text-xs outline-none focus:border-sky-500"
                            />
                            {row.isCadangan && (
                              <span className="block mt-1 text-[9px] uppercase font-bold text-amber-400 bg-amber-500/20 rounded px-1 py-0.5">
                                Cadangan
                              </span>
                            )}
                          </td>
                          <td className="p-2 align-top border-r border-slate-700/70">
                            <textarea
                              rows={2}
                              value={row.bab}
                              onChange={(e) => handleUpdateRow(originalIndex, 'bab', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-sky-500 resize-none font-medium"
                            />
                          </td>
                          <td className="p-2 align-top border-r border-slate-700/70">
                            <textarea
                              rows={3}
                              value={row.tujuanPembelajaran}
                              onChange={(e) => handleUpdateRow(originalIndex, 'tujuanPembelajaran', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-100 outline-none focus:border-sky-500 resize-none leading-relaxed"
                            />
                          </td>
                          <td className="p-2 align-top border-r border-slate-700/70">
                            <textarea
                              rows={2}
                              value={row.materi}
                              onChange={(e) => handleUpdateRow(originalIndex, 'materi', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-300 outline-none focus:border-sky-500 resize-none"
                            />
                          </td>
                          <td className="p-2 text-center align-top border-r border-slate-700/70">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                step={1}
                                min={1}
                                value={row.alokasiWaktu}
                                onChange={(e) => handleUpdateRow(originalIndex, 'alokasiWaktu', e.target.value)}
                                className="w-16 bg-slate-900 border border-slate-800 rounded p-1.5 text-center font-mono tabular-nums font-bold text-sky-300 text-xs outline-none focus:border-sky-500"
                              />
                              <span className="text-[11px] font-bold text-slate-400">JP</span>
                            </div>
                          </td>
                          <td className="p-2 text-center align-top border-r border-slate-700/70">
                            <select
                              value={row.semester}
                              onChange={(e) => handleUpdateRow(originalIndex, 'semester', e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs outline-none cursor-pointer"
                            >
                              <option value="I (Ganjil)">I (Ganjil)</option>
                              <option value="II (Genap)">II (Genap)</option>
                            </select>
                          </td>
                          <td className="p-2 text-center align-top">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(originalIndex)}
                              title="Hapus Baris"
                              className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  <tr className="bg-slate-900/90 font-bold border-t border-b border-slate-700">
                    <td colSpan={4} className="p-3 text-right uppercase text-slate-300 border-r border-slate-700/70">
                      JUMLAH ALOKASI WAKTU SEMESTER II (GENAP):
                    </td>
                    <td className="p-3 text-center font-mono tabular-nums font-extrabold text-sky-400 text-sm border-r border-slate-700/70">
                      {currentTotalSmt2} JP
                    </td>
                    <td colSpan={2} className="p-3 text-left">
                      <button
                        type="button"
                        onClick={() => handleAddRow('II (Genap)')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-[11px] font-semibold border border-sky-500/30 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambah TP Smt 2</span>
                      </button>
                    </td>
                  </tr>

                  {/* Grand Total */}
                  <tr className="bg-slate-950 font-black border-t-2 border-indigo-500/50">
                    <td colSpan={4} className="p-4 text-right uppercase text-white tracking-wider border-r border-slate-700/70">
                      TOTAL ALOKASI WAKTU 1 TAHUN PELAJARAN:
                    </td>
                    <td className="p-4 text-center font-mono tabular-nums font-black text-indigo-300 text-base border-r border-slate-700/70">
                      {currentTotalTahunan} JP
                    </td>
                    <td colSpan={2} className="p-4 text-slate-400 font-bold text-center tabular-nums">
                      {pekanSmt1 + pekanSmt2} Pekan Efektif
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Validation Notice */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs text-slate-300">
                <span>Alokasi Waktu per baris telah disesuaikan dengan kelipatan alokasi mingguan (<strong>{jpPerMinggu} JP</strong>) dan memuat baris Cadangan/Asesmen Akhir di setiap akhir semester.</span>
              </div>
            </div>

            <DocumentExportToolbar
              title={`PROTA - ${namaMapel} ${kelas}`}
              filenameBase={`PROTA_${namaMapel}_${kelas}_${tahunPelajaran}`}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
            />
          </div>
        </div>
      )}
    </div>
  );
}
