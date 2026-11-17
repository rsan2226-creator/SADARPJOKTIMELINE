'use client';

import React, { useState } from 'react';
import { 
  FileText, Sparkles, Download, Copy, Check, Printer, 
  RotateCcw, BookOpen, Layers, CheckCircle2, BookmarkCheck, 
  HelpCircle, ChevronRight, FileDown, AlertTriangle
} from 'lucide-react';
import { DocumentExportToolbar } from '@/components/DocumentExportToolbar';
import { FormattedGeneratorOutput } from '@/components/FormattedGeneratorOutput';
import { escapeHtml, markdownToCleanHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

interface CpAtpGeneratorProps {
  currentClassGrade?: number;
  classNameTitle?: string;
}

const PRESET_TEMPLATES = [
  {
    label: 'PJOK Fase B (Kelas 4) - Kebugaran Jasmani',
    namaMapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelas: 'Kelas 4',
    fase: 'Fase B',
    materiPokok: 'Bab 3: Kebugaran Jasmani Terkait Kesehatan\n- Subbab A: Latihan Daya Tahan Jantung-Paru (Lari Bolak-Balik / Shuttle Run)\n- Subbab B: Latihan Kekuatan & Daya Tahan Otot (Push-up modifikasi, Sit-up)\n- Subbab C: Pengukuran Sederhana Denyut Nadi Istirahat & Denyut Nadi Latihan',
    capaianPembelajaran: `Pada akhir fase B, peserta didik dapat menunjukkan kemampuan dalam memvariasikan dan mengombinasikan berbagai aktivitas pola gerak dasar dan keterampilan gerak secara mandiri (tanpa meniru contoh) dilandasi dengan penerapan prosedur gerak yang benar, menerapkan prosedur aktivitas jasmani untuk pengembangan kebugaran dan pola perilaku hidup sehat, menunjukkan perilaku bertanggung jawab personal dan sosial dalam jangka waktu tertentu secara konsisten, serta mendukung nilai-nilai aktivitas jasmani.`,
  },
  {
    label: 'PJOK Fase C (Kelas 5) - Permainan Bola Besar & Atletik',
    namaMapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelas: 'Kelas 5',
    fase: 'Fase C',
    materiPokok: 'Bab 1: Variasi dan Kombinasi Pola Gerak Dasar Permainan Bola Besar (Sepak Bola & Bola Voli)\n- Subbab A: Menendang dan Menghentikan Bola dengan Berbagai Bagian Kaki\n- Subbab B: Passing Bawah dan Passing Atas Bola Voli Berpasangan\n- Subbab C: Penerapan Taktik Sederhana & Sportivitas dalam Permainan Modifikasi',
    capaianPembelajaran: `Pada akhir fase C, peserta didik dapat menunjukkan kemampuan dalam mempraktikkan modifikasi berbagai aktivitas pola gerak dasar dan keterampilan gerak, dilandasi dengan penerapan konsep dan prinsip gerak yang benar, menerapkan konsep dan prinsip aktivitas jasmani untuk pengembangan kebugaran jasmani, serta pola perilaku hidup sehat, menunjukkan perilaku tanggung jawab personal dan sosial yang dilandasi nilai-nilai aktivitas jasmani secara konsisten, serta menyenangi aktivitas jasmani.`,
  },
  {
    label: 'PJOK Fase D (Kelas 7) - Tes Kebugaran Jasmani (TKJI)',
    namaMapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelas: 'Kelas 7',
    fase: 'Fase D',
    materiPokok: 'Bab 5: Pengukuran & Evaluasi Kebugaran Jasmani (TKJI Remaja)\n- Subbab A: Konsep 5 Komponen Kebugaran Jasmani (Kecepatan, Kekuatan, Daya Ledak, Daya Tahan)\n- Subbab B: Prosedur Pengukuran Baterai Tes TKJI Usia 13-15 Tahun\n- Subbab C: Analisis Profil Kebugaran Pribadi dan Perancangan Program Latihan Remedial Mandiri',
    capaianPembelajaran: `Pada akhir fase D, peserta didik dapat menunjukkan kemampuan dalam mempraktikkan keterampilan gerak spesifik sebagai hasil analisis pengetahuan yang benar, melakukan latihan aktivitas jasmani dan kebugaran untuk kesehatan sesuai dengan prinsip latihan, menunjukkan perilaku tanggung jawab personal dan sosial serta memonitornya secara mandiri, selain itu juga dapat menganalisis nilai-nilai aktivitas jasmani.`,
  },
];

export function CpAtpGenerator({ currentClassGrade, classNameTitle }: CpAtpGeneratorProps) {
  const [namaMapel, setNamaMapel] = useState('Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)');
  const [kelas, setKelas] = useState(classNameTitle || 'Kelas 4');
  const [fase, setFase] = useState('Fase B');
  const [materiPokok, setMateriPokok] = useState(PRESET_TEMPLATES[0].materiPokok);
  const [capaianPembelajaran, setCapaianPembelajaran] = useState(PRESET_TEMPLATES[0].capaianPembelajaran);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Apply template
  const applyTemplate = (template: typeof PRESET_TEMPLATES[0]) => {
    setNamaMapel(template.namaMapel);
    setKelas(template.kelas);
    setFase(template.fase);
    setMateriPokok(template.materiPokok);
    setCapaianPembelajaran(template.capaianPembelajaran);
    setResult(null);
    setWarning(null);
  };

  // Reset form
  const handleReset = () => {
    setNamaMapel('');
    setKelas('');
    setFase('');
    setMateriPokok('');
    setCapaianPembelajaran('');
    setResult(null);
    setWarning(null);
  };

  // Generate CP-ATP
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capaianPembelajaran || !materiPokok) return;

    setLoading(true);
    setResult(null);
    setWarning(null);

    try {
      const res = await postJsonSafe<{ result?: string; warning?: string }>(
        '/api/gemini/generate-cp-atp',
        {
          namaMapel,
          kelas,
          fase,
          capaianPembelajaran,
          materiPokok,
        }
      );

      if (res.data?.result) {
        setResult(res.data.result);
        setWarning(res.data.warning || null);
      } else {
        setWarning(res.error || 'Gagal memproses dokumen CP-ATP. Silakan coba kembali.');
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
        <title>CP dan ATP - ${namaMapel} ${kelas}</title>
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
            font-size: 11pt;
            line-height: 1.4;
            color: #111827;
            margin: 15mm;
          }
          h1 {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            color: #047857;
            margin-bottom: 4pt;
          }
          h2 {
            font-size: 13pt;
            font-weight: bold;
            color: #065f46;
            border-bottom: 1.5pt solid #047857;
            padding-bottom: 3pt;
            margin-top: 14pt;
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
            margin-top: 10pt;
            margin-bottom: 14pt;
            font-size: 9.5pt;
          }
          th {
            background-color: #047857;
            color: #ffffff;
            font-weight: bold;
            padding: 6pt;
            border: 1pt solid #047857;
            text-align: center;
          }
          td {
            padding: 6pt;
            border: 1pt solid #9ca3af;
            vertical-align: top;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .meta-box {
            background-color: #f0fdf4;
            border: 1pt solid #a7f3d0;
            padding: 8pt 12pt;
            margin-bottom: 14pt;
            border-radius: 4pt;
          }
          ul, ol {
            margin-top: 4pt;
            margin-bottom: 6pt;
            padding-left: 18pt;
          }
          li {
            margin-bottom: 3pt;
          }
        </style>
      </head>
      <body>
        <div class="kop">
          <h2>CAPAIAN PEMBELAJARAN (CP) &amp; ALUR TUJUAN PEMBELAJARAN (ATP)</h2>
          <h3>${escapeHtml(namaMapel)} &bull; ${escapeHtml(kelas)} (${escapeHtml(fase)})</h3>
        </div>
        <div class="meta-box">
          <table class="meta-table" style="border:none; margin:0; width:100%;">
            <tr style="background:transparent;"><td style="border:none; font-weight:bold; width:140pt;">Mata Pelajaran</td><td style="border:none;">: ${escapeHtml(namaMapel)}</td></tr>
            <tr style="background:transparent;"><td style="border:none; font-weight:bold;">Kelas / Fase</td><td style="border:none;">: ${escapeHtml(kelas)} / ${escapeHtml(fase)}</td></tr>
            <tr style="background:transparent;"><td style="border:none; font-weight:bold;">Buku Paket / Materi</td><td style="border:none;">: ${escapeHtml(materiPokok.replace(/\n/g, ', '))}</td></tr>
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
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  Kurikulum Merdeka • Perangkat Ajar
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-300">Format ABCD, SOLO & DPL</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                Generator Capaian & Alur Tujuan Pembelajaran (CP - ATP)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Uraikan Capaian Pembelajaran menjadi 5–6 TP berjenjang (Fondasi ke HOTS), taksonomi SOLO, Materi Pokok, dan Dimensi Profil Lulusan dengan ekspor Word (.doc).
              </p>
            </div>
          </div>

          {result && (
            <div className="flex flex-wrap items-center gap-2">
              <DocumentExportToolbar
                title={`CP dan ATP - ${namaMapel} ${kelas}`}
                filenameBase={`CP_ATP_${namaMapel}_${kelas}`}
                getHtmlContent={buildExportHtml}
                orientation="portrait"
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
            Pilih Template Siap Pakai Kurikulum Merdeka (1-Klik):
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
              Reset / Custom
            </button>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGenerate} className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Nama Mata Pelajaran ({'{NAMA MAPEL}'}):</label>
            <input
              type="text"
              required
              value={namaMapel}
              onChange={(e) => setNamaMapel(e.target.value)}
              placeholder="Contoh: Pendidikan Jasmani, Olahraga, dan Kesehatan"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Kelas ({'{KELAS}'}):</label>
            <input
              type="text"
              required
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              placeholder="Contoh: Kelas 4, Kelas 5, Kelas 7..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Fase ({'{FASE}'}):</label>
            <select
              value={fase}
              onChange={(e) => setFase(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold outline-none focus:border-emerald-500 cursor-pointer"
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

        <div className="text-xs">
          <label className="text-slate-300 font-bold block mb-1">
            Capaian Pembelajaran (CP) Resmi ({'{TULISKAN CAPAIAN PEMBELAJARAN DI SINI}'}):
          </label>
          <textarea
            required
            rows={4}
            value={capaianPembelajaran}
            onChange={(e) => setCapaianPembelajaran(e.target.value)}
            placeholder="Salin teks Capaian Pembelajaran resmi dari BSKAP di sini..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 text-xs leading-relaxed"
          />
        </div>

        <div className="text-xs">
          <label className="text-slate-300 font-bold block mb-1">
            Materi Pembelajaran Sesuai Buku Paket (Bab dan Subbab) ({'{TULISKAN MATERI DISINI (BAB DAN SUBBAB)}'}):
          </label>
          <textarea
            required
            rows={3}
            value={materiPokok}
            onChange={(e) => setMateriPokok(e.target.value)}
            placeholder="Contoh: Bab 3 Kebugaran Jasmani - Subbab A Lari Shuttle Run, Subbab B Kekuatan Otot..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 text-xs leading-relaxed"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-700">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Format 5 Kolom: CP • TP (Formula ABCD) • Taksonomi SOLO • Materi Pokok • Dimensi Profil Lulusan</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Menyusun CP-ATP & Matriks 5 Kolom...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Dokumen CP-ATP & Matriks</span>
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
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Dokumen Hasil Perumusan
              </span>
              <h3 className="text-base font-black text-white">
                Capaian & Alur Tujuan Pembelajaran ({namaMapel} • {kelas} • {fase})
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <DocumentExportToolbar
                title={`CP dan ATP - ${namaMapel} ${kelas}`}
                filenameBase={`CP_ATP_${namaMapel}_${kelas}`}
                getHtmlContent={buildExportHtml}
                orientation="portrait"
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
            docTitle="DOKUMEN CAPAIAN PEMBELAJARAN (CP) & ALUR TUJUAN PEMBELAJARAN (ATP)"
            docSubtitle={`${namaMapel} • ${kelas} (${fase})`}
            metaRows={[
              { label: 'Mata Pelajaran', value: namaMapel },
              { label: 'Kelas / Fase', value: `${kelas} / ${fase}` },
              { label: 'Materi Pokok / Buku', value: materiPokok.replace(/\n+/g, ', ') },
            ]}
            accent="emerald"
            showSignatureFooter
          />

          <div className="flex justify-end pt-2">
            <DocumentExportToolbar
              title={`CP dan ATP - ${namaMapel} ${kelas}`}
              filenameBase={`CP_ATP_${namaMapel}_${kelas}`}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
            />
          </div>
        </div>
      )}
    </div>
  );
}
