'use client';

import React, { useState } from 'react';
import { 
  Target, Sparkles, Download, Copy, Check, RotateCcw, 
  BookmarkCheck, CheckCircle2, FileDown, School, Layers, 
  Clock, Dumbbell, Award, HelpCircle, AlertTriangle
} from 'lucide-react';
import { DocumentExportToolbar } from '@/components/DocumentExportToolbar';
import { FormattedGeneratorOutput } from '@/components/FormattedGeneratorOutput';
import { markdownToCleanHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

interface RpmTpPreset {
  label: string;
  penyusun: string;
  sekolah: string;
  tahunAjaran: string;
  semester: string;
  mataPelajaran: string;
  kelasFase: string;
  topik: string;
  alokasiWaktu: string;
  capaianPembelajaran: string;
  tujuanPembelajaran: string;
  kepalaSekolah: string;
}

const PRESET_TEMPLATES: RpmTpPreset[] = [
  {
    label: 'PJOK Kelas V (Fase C) - Kombinasi Gerak Bola Sepak (6x40 Menit / 3 Pertemuan)',
    penyusun: 'Guru PJOK SD Negeri Kalimantong',
    sekolah: 'SD Negeri Kalimantong',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    mataPelajaran: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelasFase: 'Kelas V / Fase C',
    topik: 'Kombinasi Pola Gerak Dasar Menendang, Menghentikan, dan Menggiring Bola Sepak',
    alokasiWaktu: '6x40 Menit (3 Pertemuan)',
    capaianPembelajaran: 'Peserta didik dapat menunjukkan kemampuan dalam mempraktikkan modifikasi berbagai aktivitas pola gerak dasar dan keterampilan gerak dilandasi dengan penerapan konsep dan prinsip gerak yang benar.',
    tujuanPembelajaran: 'Murid dapat mempraktikkan variasi dan kombinasi gerak dasar menendang, menghentikan, dan menggiring bola dengan kontrol akurat serta menerapkan kerja sama sportif dalam permainan sepak bola modifikasi.',
    kepalaSekolah: 'Nasrudin, S.Pd., M.Pd.',
  },
  {
    label: 'PJOK Kelas IV (Fase B) - Sirkuit Kebugaran Jasmani (6x40 Menit / 3 Pertemuan)',
    penyusun: 'Guru PJOK SD Negeri Kalimantong',
    sekolah: 'SD Negeri Kalimantong',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    mataPelajaran: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelasFase: 'Kelas IV / Fase B',
    topik: 'Latihan Sirkuit Kebugaran Jasmani Daya Tahan Jantung-Paru dan Kekuatan Otot',
    alokasiWaktu: '6x40 Menit (3 Pertemuan)',
    capaianPembelajaran: 'Peserta didik dapat menunjukkan kemampuan dalam menerapkan prosedur aktivitas jasmani untuk pengembangan kebugaran jasmani dan pola perilaku hidup sehat.',
    tujuanPembelajaran: 'Murid dapat mempraktikkan latihan sirkuit kebugaran jasmani (shuttle run, sit up, push up) serta mengukur denyut nadi latihan dengan sikap mandiri dan disiplin.',
    kepalaSekolah: 'Nasrudin, S.Pd., M.Pd.',
  },
  {
    label: 'Matematika Kelas V (Fase C) - Bilangan Bulat (6x40 Menit / 3 Pertemuan)',
    penyusun: 'Guru Kelas V SD Negeri Kalimantong',
    sekolah: 'SD Negeri Kalimantong',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    mataPelajaran: 'Matematika',
    kelasFase: 'Kelas V / Fase C',
    topik: 'Membaca, Menulis, dan Membandingkan Bilangan Bulat Positif dan Negatif',
    alokasiWaktu: '6x40 Menit (3 Pertemuan)',
    capaianPembelajaran: 'Peserta didik dapat membaca, menulis, dan membandingkan bilangan bulat dalam konteks garis bilangan dan situasi nyata kehidupan sehari-hari.',
    tujuanPembelajaran: 'Murid dapat membaca, menulis, membandingkan, serta mengurutkan bilangan bulat positif dan negatif pada garis bilangan dalam memecahkan masalah kontekstual dengan penalaran kritis.',
    kepalaSekolah: 'Nasrudin, S.Pd., M.Pd.',
  },
];

export function RpmTpGenerator() {
  const [penyusun, setPenyusun] = useState(PRESET_TEMPLATES[0].penyusun);
  const [sekolah, setSekolah] = useState(PRESET_TEMPLATES[0].sekolah);
  const [tahunAjaran, setTahunAjaran] = useState(PRESET_TEMPLATES[0].tahunAjaran);
  const [semester, setSemester] = useState(PRESET_TEMPLATES[0].semester);
  const [mataPelajaran, setMataPelajaran] = useState(PRESET_TEMPLATES[0].mataPelajaran);
  const [kelasFase, setKelasFase] = useState(PRESET_TEMPLATES[0].kelasFase);
  const [topik, setTopik] = useState(PRESET_TEMPLATES[0].topik);
  const [alokasiWaktu, setAlokasiWaktu] = useState(PRESET_TEMPLATES[0].alokasiWaktu);
  const [capaianPembelajaran, setCapaianPembelajaran] = useState(PRESET_TEMPLATES[0].capaianPembelajaran);
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState(PRESET_TEMPLATES[0].tujuanPembelajaran);

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
  const applyTemplate = (tpl: RpmTpPreset) => {
    setPenyusun(tpl.penyusun);
    setSekolah(tpl.sekolah);
    setTahunAjaran(tpl.tahunAjaran);
    setSemester(tpl.semester);
    setMataPelajaran(tpl.mataPelajaran);
    setKelasFase(tpl.kelasFase);
    setTopik(tpl.topik);
    setAlokasiWaktu(tpl.alokasiWaktu);
    setCapaianPembelajaran(tpl.capaianPembelajaran);
    setTujuanPembelajaran(tpl.tujuanPembelajaran);
    setKepalaSekolah(tpl.kepalaSekolah);
    setResult(null);
    setWarning(null);
  };

  const handleReset = () => {
    setPenyusun('Guru SD Negeri Kalimantong');
    setMataPelajaran('');
    setTopik('');
    setCapaianPembelajaran('');
    setTujuanPembelajaran('');
    setResult(null);
    setWarning(null);
  };

  // Generate RPM 1 TP
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setWarning(null);

    try {
      const res = await postJsonSafe<{ result?: string; warning?: string }>(
        '/api/gemini/generate-rpm-tp',
        {
          penyusun,
          sekolah,
          tahunAjaran,
          semester,
          mataPelajaran,
          kelasFase,
          topik,
          alokasiWaktu,
          capaianPembelajaran,
          tujuanPembelajaran,
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
            'Gagal memproses dokumen RPM 1 TP dari server. Silakan coba klik ulang beberapa saat lagi.'
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
        <title>RPM 1 TP - ${mataPelajaran} ${topik}</title>
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
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  Pembelajaran Mendalam (Deep Learning) • 1 Tujuan Pembelajaran
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-300">Format 6x40 Menit (3 Pertemuan)</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                Generator RPM Berdasarkan 1 Tujuan Pembelajaran (RPM 1 TP)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rancang RPM fokus 1 Tujuan Pembelajaran yang diuraikan mendalam ke dalam 3 pertemuan (Memahami, Mengaplikasikan, Merefleksi) berprinsip Mindful, Meaningful, dan Joyful, lengkap dengan rubrik asesmen dan LKPD utuh siap unduh Word Portrait.
              </p>
            </div>
          </div>

          {result && (
            <div className="flex flex-wrap items-center gap-2">
              <DocumentExportToolbar
                title={`RPM 1 TP - ${mataPelajaran} ${topik}`}
                filenameBase={`RPM_1_TP_${mataPelajaran}_${kelasFase}`}
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
            Pilih Template Siap Pakai RPM 1 TP (1-Klik Isi Cepat):
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="text-xs bg-slate-900/90 hover:bg-emerald-500/15 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium flex items-center gap-1.5"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
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
            <School className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Identitas Dokumen &amp; 1 Tujuan Pembelajaran (TP)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Alokasi Waktu: <strong className="text-emerald-400">{alokasiWaktu}</strong>
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
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Satuan Pendidikan:</label>
            <input
              type="text"
              required
              value={sekolah}
              onChange={(e) => setSekolah(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Mata Pelajaran:</label>
            <input
              type="text"
              required
              value={mataPelajaran}
              onChange={(e) => setMataPelajaran(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Kelas &amp; Fase:</label>
            <input
              type="text"
              required
              value={kelasFase}
              onChange={(e) => setKelasFase(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-emerald-500"
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
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-emerald-500"
              />
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Topik Pembelajaran:</label>
            <input
              type="text"
              required
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder="Contoh: Kombinasi Menendang, Menghentikan, dan Menggiring Bola"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Alokasi Waktu:</label>
            <input
              type="text"
              required
              value={alokasiWaktu}
              onChange={(e) => setAlokasiWaktu(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="text-slate-300 font-bold block mb-1">
            Capaian Pembelajaran (CP) Yang Menjadi Dasar:
          </label>
          <textarea
            required
            rows={2}
            value={capaianPembelajaran}
            onChange={(e) => setCapaianPembelajaran(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 leading-relaxed"
          />
        </div>

        <div className="text-xs">
          <label className="text-slate-300 font-bold block mb-1">
            1 Tujuan Pembelajaran (TP) Terpadu untuk Seluruh Pertemuan:
          </label>
          <textarea
            required
            rows={3}
            value={tujuanPembelajaran}
            onChange={(e) => setTujuanPembelajaran(e.target.value)}
            placeholder="Awali dengan 'Murid...', contoh: Murid dapat mempraktikkan variasi dan kombinasi gerak..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 leading-relaxed font-semibold text-emerald-300"
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
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-emerald-500"
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
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={nipGuru}
                onChange={(e) => setNipGuru(e.target.value)}
                placeholder="NIP Guru"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Titimangsa Dokumen:</label>
            <input
              type="text"
              value={titimangsa}
              onChange={(e) => setTitimangsa(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-700">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Format Lengkap: 1 TP untuk 3 Pertemuan • Tanda Tangan Nasrudin, S.Pd., M.Pd. • 5 Lampiran &amp; LKPD Utuh</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Menyusun RPM 1 TP (3 Pertemuan) &amp; LKPD...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Dokumen RPM 1 TP &amp; LKPD</span>
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
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Dokumen Hasil Perumusan
              </span>
              <h3 className="text-base font-black text-white">
                RPM 1 TP ({alokasiWaktu}) — {topik}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <DocumentExportToolbar
                title={`RPM 1 TP - ${mataPelajaran} ${topik}`}
                filenameBase={`RPM_1_TP_${mataPelajaran}_${kelasFase}`}
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
            docTitle={`RPM 1 TUJUAN PEMBELAJARAN — ${topik}`}
            docSubtitle={`${sekolah} • ${mataPelajaran} • ${kelasFase}`}
            accent="emerald"
          />

          <div className="flex justify-end pt-2">
            <DocumentExportToolbar
              title={`RPM 1 TP - ${mataPelajaran} ${topik}`}
              filenameBase={`RPM_1_TP_${mataPelajaran}_${kelasFase}`}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
            />
          </div>
        </div>
      )}
    </div>
  );
}
