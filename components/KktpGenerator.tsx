'use client';

import React, { useState } from 'react';
import { 
  FileText, Sparkles, Download, Copy, Check, Printer, 
  BookmarkCheck, CheckCircle2, FileDown, Table, Layers, ArrowRight, AlertTriangle
} from 'lucide-react';
import { DocumentExportToolbar } from '@/components/DocumentExportToolbar';
import { FormattedGeneratorOutput } from '@/components/FormattedGeneratorOutput';
import { escapeHtml, markdownToCleanHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

interface KktpGeneratorProps {
  currentClassGrade?: number;
  classNameTitle?: string;
}

const PRESET_KKTP_TEMPLATES = [
  {
    label: 'PJOK Fase B (Kelas 4) - Kebugaran Jasmani (Semester Ganjil)',
    satuanPendidikan: 'SD Negeri Nusantara 01',
    namaMapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelasFase: 'Kelas 4 / Fase B',
    semester: 'Ganjil',
    tahunPelajaran: '2024/2025',
    babMateri: 'Bab 3: Aktivitas Kebugaran Jasmani Terkait Kesehatan',
    daftarTujuanPembelajaran: `1. Murid dapat menyebutkan 3 komponen utama kebugaran jasmani (daya tahan, kekuatan, kelincahan) dengan tepat melalui pengamatan gambar/video.
2. Murid dapat menjelaskan prosedur latihan daya tahan kardiorespirasi (lari bolak-balik 4x5 meter) dengan runtut saat berdiskusi.
3. Murid dapat mempraktikkan latihan sirkuit kebugaran (push-up bertumpu lutut, sit-up 30 detik, loncat tali) sesuai teknik gerak yang aman.
4. Murid dapat menganalisis perubahan denyut nadi sebelum dan setelah melakukan latihan fisik secara jujur dalam lembar observasi.
5. Murid dapat mengevaluasi tingkat kelelahan diri (skala RPE) dan menentukan waktu istirahat yang aman saat aktivitas lapangan.
6. Murid dapat merancang kombinasi 3 gerakan pemanasan dan pendinginan mandiri untuk dipraktikkan bersama kelompok.`,
  },
  {
    label: 'PJOK Fase C (Kelas 5) - Permainan Bola Besar (Semester Ganjil)',
    satuanPendidikan: 'SD Negeri Nusantara 01',
    namaMapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelasFase: 'Kelas 5 / Fase C',
    semester: 'Ganjil',
    tahunPelajaran: '2024/2025',
    babMateri: 'Bab 1: Pola Gerak Dasar Permainan Bola Besar (Sepak Bola & Bola Voli)',
    daftarTujuanPembelajaran: `1. Murid dapat menjelaskan teknik dasar menendang dan menghentikan bola menggunakan kaki bagian dalam dengan benar.
2. Murid dapat mempraktikkan variasi passing bawah dan passing atas bola voli secara berpasangan dengan koordinasi yang baik.
3. Murid dapat menerapkan pola gerak menggiring dan mengoper bola dalam permainan sepak bola mini sesuai peraturan modifikasi.
4. Murid dapat menganalisis kesalahan gerak posisi tangan saat melakukan passing bawah bola voli melalui pengamatan rekaman teman.
5. Murid dapat mengevaluasi sportivitas dan kerja sama kelompok dalam pertandingan modifikasi secara reflektif.`,
  },
  {
    label: 'PJOK Fase D (Kelas 7) - Tes Kebugaran TKJI (Semester Genap)',
    satuanPendidikan: 'SMP Merdeka Belajar',
    namaMapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelasFase: 'Kelas 7 / Fase D',
    semester: 'Genap',
    tahunPelajaran: '2024/2025',
    babMateri: 'Bab 5: Pengukuran & Evaluasi Kebugaran Jasmani Siswa (TKJI)',
    daftarTujuanPembelajaran: `1. Murid dapat mengidentifikasi 5 item baterai tes kebugaran jasmani Indonesia (TKJI) usia 13–15 tahun beserta fungsinya.
2. Murid dapat mempraktikkan prosedur tes gantung angkat tubuh (pull-up) dan loncat tegak (vertical jump) sesuai standar baku.
3. Murid dapat mengukur dan mencatat hasil tes lari sprint 50 meter dan lari jarak sedang 800 meter secara akurat.
4. Murid dapat menganalisis skor total dan mengelompokkan profil kebugaran pribadi ke dalam tabel norma TKJI nasional.
5. Murid dapat merancang program latihan fisik mandiri 3 kali per minggu untuk meningkatkan komponen kebugaran yang masih kurang.`,
  },
];

export function KktpGenerator({ currentClassGrade, classNameTitle }: KktpGeneratorProps) {
  const [satuanPendidikan, setSatuanPendidikan] = useState(PRESET_KKTP_TEMPLATES[0].satuanPendidikan);
  const [namaMapel, setNamaMapel] = useState(PRESET_KKTP_TEMPLATES[0].namaMapel);
  const [kelasFase, setKelasFase] = useState(classNameTitle ? `${classNameTitle} / Fase B` : PRESET_KKTP_TEMPLATES[0].kelasFase);
  const [semester, setSemester] = useState('Ganjil');
  const [tahunPelajaran, setTahunPelajaran] = useState('2024/2025');
  const [babMateri, setBabMateri] = useState(PRESET_KKTP_TEMPLATES[0].babMateri);
  const [daftarTujuanPembelajaran, setDaftarTujuanPembelajaran] = useState(PRESET_KKTP_TEMPLATES[0].daftarTujuanPembelajaran);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Apply template
  const applyTemplate = (tpl: typeof PRESET_KKTP_TEMPLATES[0]) => {
    setSatuanPendidikan(tpl.satuanPendidikan);
    setNamaMapel(tpl.namaMapel);
    setKelasFase(tpl.kelasFase);
    setSemester(tpl.semester);
    setTahunPelajaran(tpl.tahunPelajaran);
    setBabMateri(tpl.babMateri);
    setDaftarTujuanPembelajaran(tpl.daftarTujuanPembelajaran);
    setResult(null);
    setWarning(null);
  };

  // Reset / Clear
  const handleReset = () => {
    setDaftarTujuanPembelajaran('');
    setBabMateri('');
    setResult(null);
    setWarning(null);
  };

  // Generate KKTP
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!daftarTujuanPembelajaran) return;

    setLoading(true);
    setResult(null);
    setWarning(null);

    try {
      const res = await postJsonSafe<{ result?: string; warning?: string }>(
        '/api/gemini/generate-kktp',
        {
          satuanPendidikan,
          namaMapel,
          kelasFase,
          semester,
          tahunPelajaran,
          babMateri,
          daftarTujuanPembelajaran,
        }
      );

      if (res.data?.result) {
        setResult(res.data.result);
        setWarning(res.data.warning || null);
      } else {
        setWarning(res.error || 'Gagal memproses dokumen KKTP. Silakan coba kembali.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Build HTML for Word / PDF / Print export
  const buildExportHtml = (): string => {
    if (!result) return '';

    return `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>KKTP - ${namaMapel} ${kelasFase}</title>
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
          body {
            font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.35;
            color: #111827;
            margin: 15mm;
          }
          h1 {
            font-size: 15pt;
            font-weight: bold;
            text-align: center;
            color: #065f46;
            margin-bottom: 2pt;
          }
          h2 {
            font-size: 12pt;
            font-weight: bold;
            text-align: center;
            color: #047857;
            margin-top: 2pt;
            margin-bottom: 12pt;
          }
          h3 {
            font-size: 11pt;
            font-weight: bold;
            color: #1f2937;
            margin-top: 10pt;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8pt;
            margin-bottom: 12pt;
            font-size: 9pt;
          }
          th {
            background-color: #047857;
            color: #ffffff;
            font-weight: bold;
            padding: 5pt;
            border: 1pt solid #047857;
            text-align: center;
          }
          td {
            padding: 5pt;
            border: 1pt solid #9ca3af;
            vertical-align: top;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .identity-box {
            background-color: #f0fdf4;
            border: 1.5pt solid #059669;
            padding: 8pt 14pt;
            margin-bottom: 12pt;
            border-radius: 4pt;
          }
          ol, ul {
            margin-top: 4pt;
            margin-bottom: 6pt;
            padding-left: 16pt;
          }
          li {
            margin-bottom: 3pt;
          }
        </style>
      </head>
      <body>
        <div class="kop">
          <h2>KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)</h2>
          <h3>${escapeHtml(satuanPendidikan)} &bull; ${escapeHtml(namaMapel)}</h3>
        </div>
        <div class="identity-box">
          <table class="identity-table" style="border:none; margin:0; width:100%; font-size:9.5pt;">
            <tr style="background:transparent;"><td style="border:none; font-weight:bold; width:130pt;">Satuan Pendidikan</td><td style="border:none;">: ${escapeHtml(satuanPendidikan)}</td></tr>
            <tr style="background:transparent;"><td style="border:none; font-weight:bold;">Mata Pelajaran</td><td style="border:none;">: ${escapeHtml(namaMapel)}</td></tr>
            <tr style="background:transparent;"><td style="border:none; font-weight:bold;">Kelas / Fase</td><td style="border:none;">: ${escapeHtml(kelasFase)}</td></tr>
            <tr style="background:transparent;"><td style="border:none; font-weight:bold;">Semester / Tahun Ajaran</td><td style="border:none;">: Semester ${escapeHtml(semester)} / ${escapeHtml(tahunPelajaran)}</td></tr>
            <tr style="background:transparent;"><td style="border:none; font-weight:bold;">Bab &amp; Materi Pokok</td><td style="border:none;">: ${escapeHtml(babMateri)}</td></tr>
          </table>
        </div>
        ${markdownToCleanHtml(result)}
      </body>
      </html>
    `;
  };

  const handleCopyText = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 font-black">
              <Table className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                  Asesmen Kurikulum Merdeka
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-300">4 Kategori Interval Nilai Deskriptif</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                Generator TP - KKTP (Kriteria Ketercapaian Tujuan Pembelajaran)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rancang rubrik interval nilai operasional: Perlu Bimbingan (0–68), Cukup (68–78), Baik (79–89), dan Sangat Baik (90–100) lengkap dengan ekspor Word (.doc).
              </p>
            </div>
          </div>

          {result && (
            <div className="flex flex-wrap items-center gap-2">
              <DocumentExportToolbar
                title={`KKTP - ${namaMapel} ${kelasFase}`}
                filenameBase={`KKTP_${namaMapel}_${kelasFase}_Semester_${semester}`}
                getHtmlContent={buildExportHtml}
                orientation="landscape"
              />
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Presets */}
        <div className="mt-5 pt-4 border-t border-slate-700/80">
          <span className="text-xs font-bold text-slate-300 block mb-2">
            Pilih Template KKTP Siap Pakai (1-Klik):
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_KKTP_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="text-xs bg-slate-900/90 hover:bg-teal-500/15 text-slate-300 hover:text-teal-300 border border-slate-700 hover:border-teal-500/40 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium flex items-center gap-1.5"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>{tpl.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={handleReset}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium"
            >
              Reset / Custom TP
            </button>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGenerate} className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl space-y-4">
        {/* Identitas Section */}
        <div className="pb-3 border-b border-slate-700">
          <span className="text-xs uppercase font-extrabold tracking-wider text-teal-400">
            1. Identitas Dokumen KKTP
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs mt-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Satuan Pendidikan:</label>
              <input
                type="text"
                required
                value={satuanPendidikan}
                onChange={(e) => setSatuanPendidikan(e.target.value)}
                placeholder="Contoh: SD Negeri Nusantara 01"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Mata Pelajaran ({'{TULISKAN NAMA MATA PELAJARAN}'}):</label>
              <input
                type="text"
                required
                value={namaMapel}
                onChange={(e) => setNamaMapel(e.target.value)}
                placeholder="Contoh: Pendidikan Jasmani, Olahraga, dan Kesehatan"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Kelas dan Fase ({'{TULISKAN KELAS DAN FASE}'}):</label>
              <input
                type="text"
                required
                value={kelasFase}
                onChange={(e) => setKelasFase(e.target.value)}
                placeholder="Contoh: Kelas 4 / Fase B"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Semester ({'{GANJIL/GENAP}'}):</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Tahun Pelajaran:</label>
              <input
                type="text"
                value={tahunPelajaran}
                onChange={(e) => setTahunPelajaran(e.target.value)}
                placeholder="Contoh: 2024/2025"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Bab & Materi Pokok:</label>
              <input
                type="text"
                required
                value={babMateri}
                onChange={(e) => setBabMateri(e.target.value)}
                placeholder="Contoh: Bab 3 Kebugaran Jasmani Terkait Kesehatan"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Daftar Tujuan Pembelajaran */}
        <div className="text-xs pt-1">
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-300 font-bold block">
              Daftar Tujuan Pembelajaran (TP) Lengkap ({'{CANTUMKAN DAFTAR TUJUAN PEMBELAJARAN LENGKAP YANG DIMILIKI}'}):
            </label>
            <span className="text-[11px] text-teal-400 font-medium">
              Bisa langsung disalin dari hasil menu &quot;Generator CP-ATP&quot;
            </span>
          </div>
          <textarea
            required
            rows={6}
            value={daftarTujuanPembelajaran}
            onChange={(e) => setDaftarTujuanPembelajaran(e.target.value)}
            placeholder="Tuliskan atau tempel daftar Tujuan Pembelajaran yang dimiliki secara berurutan..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 outline-none focus:border-teal-500 text-xs leading-relaxed font-sans"
          />
        </div>

        {/* 4 Intervals Notification */}
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
            <span className="font-black block">Perlu Bimbingan</span>
            <span className="text-[11px] text-slate-400">0 – 68</span>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <span className="font-black block">Cukup</span>
            <span className="text-[11px] text-slate-400">68 – 78</span>
          </div>
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300">
            <span className="font-black block">Baik</span>
            <span className="text-[11px] text-slate-400">79 – 89</span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <span className="font-black block">Sangat Baik</span>
            <span className="text-[11px] text-slate-400">90 – 100</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-700">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Tabel memuat deskripsi operasional performa murid pada setiap interval nilai</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Menyusun Tabel KKTP & Deskripsi 4 Interval...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Tabel KKTP Interval Nilai</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Result Container */}
      {result && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                Dokumen Hasil Asesmen KKTP
              </span>
              <h3 className="text-base font-black text-white">
                Tabel Kriteria Ketercapaian Tujuan Pembelajaran ({namaMapel} • {kelasFase})
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <DocumentExportToolbar
                title={`KKTP - ${namaMapel} ${kelasFase}`}
                filenameBase={`KKTP_${namaMapel}_${kelasFase}_Semester_${semester}`}
                getHtmlContent={buildExportHtml}
                orientation="landscape"
              />
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin!' : 'Salin Semua'}</span>
              </button>
            </div>
          </div>

          {warning && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{warning}</span>
            </div>
          )}

          {/* Render Result Content */}
          <FormattedGeneratorOutput
            markdown={result}
            docTitle="KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)"
            docSubtitle={`${namaMapel} • ${kelasFase} • Semester ${semester} (${tahunPelajaran})`}
            metaRows={[
              { label: 'Satuan Pendidikan', value: satuanPendidikan },
              { label: 'Mata Pelajaran', value: namaMapel },
              { label: 'Kelas / Fase', value: kelasFase },
              { label: 'Semester / Tahun', value: `Semester ${semester} / ${tahunPelajaran}` },
              { label: 'Bab / Materi Pokok', value: babMateri },
            ]}
            accent="teal"
            landscapeHint
            showSignatureFooter
          />

          <div className="flex justify-end pt-2">
            <DocumentExportToolbar
              title={`KKTP - ${namaMapel} ${kelasFase}`}
              filenameBase={`KKTP_${namaMapel}_${kelasFase}_Semester_${semester}`}
              getHtmlContent={buildExportHtml}
              orientation="landscape"
            />
          </div>
        </div>
      )}
    </div>
  );
}
