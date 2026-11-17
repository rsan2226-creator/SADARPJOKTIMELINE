'use client';

import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Download, Copy, Check, RotateCcw, 
  BookmarkCheck, CheckCircle2, FileDown, School, Layers, 
  FileText, Award, UserCheck, Dumbbell, AlertTriangle
} from 'lucide-react';
import { DocumentExportToolbar } from '@/components/DocumentExportToolbar';
import { FormattedGeneratorOutput } from '@/components/FormattedGeneratorOutput';
import { markdownToCleanHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

interface RpmPreset {
  label: string;
  penyusun: string;
  sekolah: string;
  tahunAjaran: string;
  semester: string;
  mataPelajaran: string;
  kelasFase: string;
  bab: string;
  topik: string;
  alokasiWaktu: string;
  capaianPembelajaran: string;
  kepalaSekolah: string;
}

const PRESET_TEMPLATES: RpmPreset[] = [
  {
    label: 'PJOK Kelas V (Fase C) - Bab 1 Permainan Bola Besar (8 Pertemuan)',
    penyusun: 'Guru PJOK SD Negeri Kalimantong',
    sekolah: 'SD Negeri Kalimantong',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    mataPelajaran: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelasFase: 'Kelas V / Fase C',
    bab: 'Bab 1: Variasi dan Kombinasi Gerak Dasar Permainan Bola Besar',
    topik: 'Menendang, Menghentikan, Menggiring Bola Sepak & Passing Bawah Bola Voli',
    alokasiWaktu: '16x40 Menit (8 Pertemuan)',
    capaianPembelajaran: 'Peserta didik dapat menunjukkan kemampuan dalam mempraktikkan modifikasi berbagai aktivitas pola gerak dasar dan keterampilan gerak, dilandasi dengan penerapan konsep dan prinsip gerak yang benar, serta menerapkan konsep aktivitas jasmani untuk pengembangan kebugaran jasmani.',
    kepalaSekolah: 'Nasrudin, S.Pd., M.Pd.',
  },
  {
    label: 'PJOK Kelas IV (Fase B) - Bab 3 Kebugaran Jasmani (8 Pertemuan)',
    penyusun: 'Guru PJOK SD Negeri Kalimantong',
    sekolah: 'SD Negeri Kalimantong',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    mataPelajaran: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelasFase: 'Kelas IV / Fase B',
    bab: 'Bab 3: Kebugaran Jasmani Terkait Kesehatan & Daya Tahan',
    topik: 'Latihan Sirkuit Kebugaran, Lari Shuttle Run, Kekuatan Otot & Denyut Nadi',
    alokasiWaktu: '16x40 Menit (8 Pertemuan)',
    capaianPembelajaran: 'Peserta didik dapat menunjukkan kemampuan dalam menerapkan prosedur aktivitas jasmani untuk pengembangan kebugaran dan pola perilaku hidup sehat, serta menunjukkan perilaku bertanggung jawab personal dan sosial.',
    kepalaSekolah: 'Nasrudin, S.Pd., M.Pd.',
  },
  {
    label: 'Matematika Kelas V (Fase C) - Bab 1 Bilangan Bulat (8 Pertemuan)',
    penyusun: 'Guru Kelas V SD Negeri Kalimantong',
    sekolah: 'SD Negeri Kalimantong',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    mataPelajaran: 'Matematika',
    kelasFase: 'Kelas V / Fase C',
    bab: 'Bab 1: Bilangan Bulat',
    topik: 'Membaca, Menulis, Membandingkan dan Operasi Hitung Bilangan Bulat',
    alokasiWaktu: '16x40 Menit (8 Pertemuan)',
    capaianPembelajaran: 'Peserta didik dapat membaca, menulis, membandingkan, serta melakukan operasi penjumlahan dan pengurangan bilangan bulat dalam kehidupan nyata.',
    kepalaSekolah: 'Nasrudin, S.Pd., M.Pd.',
  },
];

export function RpmGenerator() {
  const [penyusun, setPenyusun] = useState(PRESET_TEMPLATES[0].penyusun);
  const [sekolah, setSekolah] = useState(PRESET_TEMPLATES[0].sekolah);
  const [tahunAjaran, setTahunAjaran] = useState(PRESET_TEMPLATES[0].tahunAjaran);
  const [semester, setSemester] = useState(PRESET_TEMPLATES[0].semester);
  const [mataPelajaran, setMataPelajaran] = useState(PRESET_TEMPLATES[0].mataPelajaran);
  const [kelasFase, setKelasFase] = useState(PRESET_TEMPLATES[0].kelasFase);
  const [bab, setBab] = useState(PRESET_TEMPLATES[0].bab);
  const [topik, setTopik] = useState(PRESET_TEMPLATES[0].topik);
  const [alokasiWaktu, setAlokasiWaktu] = useState(PRESET_TEMPLATES[0].alokasiWaktu);
  const [capaianPembelajaran, setCapaianPembelajaran] = useState(PRESET_TEMPLATES[0].capaianPembelajaran);

  // Signatures
  const [kepalaSekolah, setKepalaSekolah] = useState('Nasrudin, S.Pd., M.Pd.');
  const [nipKepalaSekolah, setNipKepalaSekolah] = useState('19720415 199803 1 004');
  const [nipGuru, setNipGuru] = useState('19880724 201503 1 003');
  const [titimangsa, setTitimangsa] = useState('Kalimantong, 13 Juli 2026');

  // Execution states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Apply template
  const applyTemplate = (tpl: RpmPreset) => {
    setPenyusun(tpl.penyusun);
    setSekolah(tpl.sekolah);
    setTahunAjaran(tpl.tahunAjaran);
    setSemester(tpl.semester);
    setMataPelajaran(tpl.mataPelajaran);
    setKelasFase(tpl.kelasFase);
    setBab(tpl.bab);
    setTopik(tpl.topik);
    setAlokasiWaktu(tpl.alokasiWaktu);
    setCapaianPembelajaran(tpl.capaianPembelajaran);
    setKepalaSekolah(tpl.kepalaSekolah);
    setResult(null);
    setWarning(null);
  };

  const handleReset = () => {
    setPenyusun('Guru SD Negeri Kalimantong');
    setMataPelajaran('');
    setBab('');
    setTopik('');
    setCapaianPembelajaran('');
    setResult(null);
    setWarning(null);
  };

  // Generate RPM
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setWarning(null);

    try {
      const res = await postJsonSafe<{ result?: string; warning?: string }>(
        '/api/gemini/generate-rpm',
        {
          penyusun,
          sekolah,
          tahunAjaran,
          semester,
          mataPelajaran,
          kelasFase,
          bab,
          topik,
          alokasiWaktu,
          capaianPembelajaran,
          kepalaSekolah,
          nipKepalaSekolah,
          nipGuru,
          titimangsa,
        }
      );

      if (res.data?.result) {
        setResult(res.data.result);
        setWarning(res.data.warning || null);
      } else {
        setWarning(
          res.error ||
            'Gagal memproses dokumen RPM dari server. Silakan coba klik ulang beberapa saat lagi.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Build HTML for Word / PDF / Print export in PORTRAIT orientation
  const buildExportHtml = (): string => {
    if (!result) return '';

    return `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>RPM - ${mataPelajaran} ${bab}</title>
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
            margin: 20mm 20mm 20mm 20mm;
            mso-page-orientation: portrait;
          }
          div.WordSection1 {
            page: WordSection1;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.4;
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
          h3 {
            font-size: 11pt;
            font-weight: bold;
            margin-top: 14pt;
            margin-bottom: 6pt;
            text-transform: uppercase;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8pt;
            margin-bottom: 14pt;
            font-size: 10pt;
          }
          th {
            background-color: #f1f5f9;
            color: #000000;
            font-weight: bold;
            padding: 6pt;
            border: 1pt solid #000000;
            text-align: center;
          }
          td {
            padding: 6pt;
            border: 1pt solid #000000;
            vertical-align: top;
          }
          ol, ul {
            margin-top: 4pt;
            margin-bottom: 6pt;
            padding-left: 20pt;
          }
          li {
            margin-bottom: 3pt;
          }
          .lkpd-container {
            border: 1.5pt solid #000000;
            padding: 14pt;
            margin-top: 14pt;
            margin-bottom: 14pt;
          }
        </style>
      </head>
      <body>
        <div class="WordSection1">
          ${markdownToCleanHtml(result)}
        </div>
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
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 font-black">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                  Pembelajaran Mendalam (Deep Learning) • 1 BAB
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-300">Format Tabel 2 Kolom + 8 Pertemuan + LKPD</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                Generator Perencanaan Pembelajaran Mendalam (RPM 1 BAB)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rancang RPM 1 Bab (16x40 Menit / 8 Pertemuan) berbasis 3 tahapan (Memahami, Mengaplikasikan, Merefleksi), prinsip Mindful, Meaningful &amp; Joyful, rubrik asesmen lengkap, dan LKPD siap unduh Word Portrait.
              </p>
            </div>
          </div>

          {result && (
            <div className="flex flex-wrap items-center gap-2">
              <DocumentExportToolbar
                title={`RPM 1 BAB - ${mataPelajaran} ${bab}`}
                filenameBase={`RPM_1_BAB_${mataPelajaran}_${kelasFase}`}
                getHtmlContent={buildExportHtml}
                orientation="portrait"
              />
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin' : 'Salin Semua'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Presets */}
        <div className="mt-5 pt-4 border-t border-slate-700/80">
          <span className="text-xs font-bold text-slate-300 block mb-2">
            Pilih Template Siap Pakai RPM 1 Bab (1-Klik Isi Cepat):
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="text-xs bg-slate-900/90 hover:bg-purple-500/15 text-slate-300 hover:text-purple-300 border border-slate-700 hover:border-purple-500/40 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium flex items-center gap-1.5"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-purple-400" />
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
            <School className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Identitas Dokumen &amp; Bab Perencanaan
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Alokasi Waktu: <strong className="text-purple-400">{alokasiWaktu}</strong>
          </span>
        </div>

        {/* Grid Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Penyusun / Guru:</label>
            <input
              type="text"
              required
              value={penyusun}
              onChange={(e) => setPenyusun(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Satuan Pendidikan:</label>
            <input
              type="text"
              required
              value={sekolah}
              onChange={(e) => setSekolah(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Mata Pelajaran:</label>
            <input
              type="text"
              required
              value={mataPelajaran}
              onChange={(e) => setMataPelajaran(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Kelas &amp; Fase:</label>
            <input
              type="text"
              required
              value={kelasFase}
              onChange={(e) => setKelasFase(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Tahun Ajaran &amp; Semester:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-purple-500"
              />
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Bab Pembelajaran:</label>
            <input
              type="text"
              required
              value={bab}
              onChange={(e) => setBab(e.target.value)}
              placeholder="Contoh: Bab 1: Permainan Bola Besar"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Topik Utama:</label>
            <input
              type="text"
              required
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder="Contoh: Menendang, Menghentikan, dan Passing"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="text-slate-300 font-bold block mb-1">
            Capaian Pembelajaran (CP) Yang Dianalisis:
          </label>
          <textarea
            required
            rows={3}
            value={capaianPembelajaran}
            onChange={(e) => setCapaianPembelajaran(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500 leading-relaxed"
          />
        </div>

        {/* Kepala Sekolah Nasrudin, S.Pd., M.Pd. per request */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Kepala Sekolah (Sesuai Ketentuan):</label>
            <input
              type="text"
              required
              value={kepalaSekolah}
              onChange={(e) => setKepalaSekolah(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">NIP Kepala Sekolah &amp; Guru:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nipKepalaSekolah}
                onChange={(e) => setNipKepalaSekolah(e.target.value)}
                placeholder="NIP Kepala Sekolah"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-purple-500"
              />
              <input
                type="text"
                value={nipGuru}
                onChange={(e) => setNipGuru(e.target.value)}
                placeholder="NIP Guru"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Titimangsa Dokumen:</label>
            <input
              type="text"
              value={titimangsa}
              onChange={(e) => setTitimangsa(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-700">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Format Lengkap: Tabel 2 Kolom (A–E) • Tanda Tangan Nasrudin, S.Pd., M.Pd. • 5 Lampiran &amp; LKPD Utuh</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-black text-xs shadow-lg shadow-purple-500/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Menyusun RPM 1 BAB &amp; Lembar LKPD...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Dokumen RPM 1 BAB &amp; LKPD</span>
              </>
            )}
          </button>
        </div>
      </form>

      {warning && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{warning}</span>
        </div>
      )}

      {/* Generated Result Container */}
      {result && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                Dokumen Hasil Perumusan
              </span>
              <h3 className="text-base font-black text-white">
                Perencanaan Pembelajaran Mendalam (RPM 1 BAB) — {bab} ({alokasiWaktu})
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <DocumentExportToolbar
                title={`RPM 1 BAB - ${mataPelajaran} ${bab}`}
                filenameBase={`RPM_1_BAB_${mataPelajaran}_${kelasFase}`}
                getHtmlContent={buildExportHtml}
                orientation="portrait"
              />
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin' : 'Salin Semua'}</span>
              </button>
            </div>
          </div>

          {/* Render Result Content */}
          <FormattedGeneratorOutput
            markdown={result}
            docTitle={`RENCANA PEMBELAJARAN MENDALAM (RPM) — ${bab}`}
            docSubtitle={`${sekolah} • ${mataPelajaran} • ${kelasFase}`}
            accent="purple"
          />

          <div className="flex justify-end pt-2">
            <DocumentExportToolbar
              title={`RPM 1 BAB - ${mataPelajaran} ${bab}`}
              filenameBase={`RPM_1_BAB_${mataPelajaran}_${kelasFase}`}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
            />
          </div>
        </div>
      )}
    </div>
  );
}
