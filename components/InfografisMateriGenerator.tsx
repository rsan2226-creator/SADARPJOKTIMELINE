'use client';

import React, { useState, useRef } from 'react';
import { 
  Sparkles, Download, FileText, Copy, Check, 
  Palette, Eye, ZoomIn, ZoomOut, RefreshCw, Layers, 
  LayoutGrid, Compass, Lightbulb, AlertTriangle, ArrowRight, 
  BookOpen, CheckCircle2, Trophy, Target, ShieldCheck, 
  Dumbbell, Quote, Hash, Filter, HelpCircle, FileImage, 
  Share2, ArrowLeftRight, CheckSquare, Brain
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { 
  InfografisMateriData, 
  getFallbackInfografisMateriData, 
  DAFTAR_30_FORMAT_INFOGRAFIS,
  FormatInfografisInfo,
  InfografisCard
} from '@/lib/infografis-materi-types';
import { DocumentExportToolbar } from './DocumentExportToolbar';
import { escapeHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

type ColorPaletteMode = 'vibrant' | 'mint' | 'sunset' | 'clean';

interface PresetItem {
  label: string;
  mapel: string;
  kelasFase: string;
  topik: string;
  format: string;
}

const PRESETS: PresetItem[] = [
  {
    label: '⚽ PJOK SD: Passing Sepak Bola',
    mapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelasFase: 'Kelas V / Fase C',
    topik: 'Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola',
    format: 'STEP-BY-STEP GUIDE',
  },
  {
    label: '🏃 PJOK SMP: Kebugaran Jasmani & TKJI',
    mapel: 'PJOK',
    kelasFase: 'Kelas VII / Fase D',
    topik: 'Latihan Daya Tahan Kardiorespirasi dan Analisis Zona Denyut Nadi Latihan',
    format: 'ROADMAP',
  },
  {
    label: '🏐 PJOK SMA: Taktik Serangan Bola Voli',
    mapel: 'PJOK',
    kelasFase: 'Kelas XI / Fase F',
    topik: 'Analisis dan Evaluasi Taktik Penyerangan dan Penempatan Posisi Bola Voli',
    format: 'COMPARISON CARD',
  },
  {
    label: '🌿 IPAS SD: Ekosistem & Rantai Makanan',
    mapel: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    kelasFase: 'Kelas V / Fase C',
    topik: 'Rantai Makanan dan Keseimbangan Aliran Energi pada Ekosistem Sawah',
    format: 'CYCLE DIAGRAM',
  },
  {
    label: '📐 Matematika: Operasi Pecahan & Desimal',
    mapel: 'Matematika',
    kelasFase: 'Kelas V / Fase C',
    topik: 'Operasi Penjumlahan dan Pengurangan Pecahan Berbeda Penyebut',
    format: 'CHEATSHEET',
  },
];

export function InfografisMateriGenerator() {
  const [mapel, setMapel] = useState<string>('Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)');
  const [kelasFase, setKelasFase] = useState<string>('Kelas V / Fase C');
  const [topik, setTopik] = useState<string>('Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola');
  const [selectedFormat, setSelectedFormat] = useState<string>('auto');
  const [catatanTambahan, setCatatanTambahan] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'analisis' | 'ringkasan'>('visual');
  const [palette, setPalette] = useState<ColorPaletteMode>('vibrant');
  const [zoomScale, setZoomScale] = useState<number>(0.85);
  const [formatModalOpen, setFormatModalOpen] = useState<boolean>(false);
  const [formatFilter, setFormatFilter] = useState<string>('');

  const [infografisData, setInfografisData] = useState<InfografisMateriData>(() =>
    getFallbackInfografisMateriData()
  );

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleApplyPreset = (p: PresetItem) => {
    setMapel(p.mapel);
    setKelasFase(p.kelasFase);
    setTopik(p.topik);
    setSelectedFormat(p.format);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await postJsonSafe<{ data?: InfografisMateriData }>(
        '/api/gemini/generate-infografis-materi',
        {
          mapel,
          kelasFase,
          topik,
          formatPilihan: selectedFormat,
          catatanTambahan,
        }
      );
      if (res.data?.data) {
        setInfografisData(res.data.data);
      } else {
        setInfografisData(getFallbackInfografisMateriData(mapel, kelasFase, topik));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(canvasRef.current, {
        quality: 0.98,
        pixelRatio: 2, // High resolution (300 DPI equivalent)
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `Infografis_${infografisData.identitas.judulInfografis.replace(/\s+/g, '_')}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exporting PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyText = () => {
    const text = `
# ${infografisData.identitas.judulInfografis}
${infografisData.identitas.subjudul}
Mata Pelajaran: ${infografisData.identitas.mataPelajaran} | ${infografisData.identitas.kelasFase}
Format Infografis: ${infografisData.identitas.formatTerpilih}

## KONSEP UTAMA
${infografisData.analisisMateri.konsepUtama}

## RANGKUMAN KARTU MATERI
${infografisData.kartuInfografis.map(c => `
### ${c.ikon} ${c.judul} [${c.tag || ''}]
${c.highlightText ? `> ${c.highlightText}\n` : ''}
${c.poinList?.map(p => `- ${p}`).join('\n') || ''}
${c.langkahList?.map(l => `${l.nomor}. ${l.judul}: ${l.deskripsi}`).join('\n') || ''}
${c.itemPerbandingan?.map(p => `- ${p.judulA}: ${p.deskripsiA} VS ${p.judulB}: ${p.deskripsiB}`).join('\n') || ''}
${c.istilahList?.map(i => `- ${i.kata}: ${i.definisi}`).join('\n') || ''}
`).join('\n')}

## KESALAHAN UMUM YANG PERLU DIHINDARI:
${infografisData.analisisMateri.kesalahanUmum.map(k => `- ${k}`).join('\n')}

## TAKEAWAY KUNCI:
${infografisData.takeawayKunci.map(t => `- ${t}`).join('\n')}

Kata Mutiara: "${infografisData.identitas.kataMutiara}"
Tagar: ${infografisData.tagarMemori.join(' ')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildExportHtml = () => {
    const d = infografisData;
    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${escapeHtml(d.identitas.judulInfografis)}</title>
        <style>
          @page { size: A4 portrait; margin: 1.5cm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; line-height: 1.45; font-size: 10.5pt; }
          .header { text-align: center; border-bottom: 3px double #0d9488; padding-bottom: 8px; margin-bottom: 14px; }
          .header h1 { font-size: 16pt; margin: 0; color: #0f766e; }
          .card { border: 1px solid #cbd5e1; background-color: #f8fafc; border-radius: 8px; padding: 12px; margin-bottom: 12px; page-break-inside: avoid; }
          .card-title { font-weight: bold; font-size: 11.5pt; color: #0d9488; margin-bottom: 6px; }
          .badge { background-color: #ccfbf1; color: #0f766e; padding: 2px 6px; border-radius: 4px; font-size: 9pt; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; break-inside: avoid; }
          th, td { border: 1px solid #475569; padding: 6px 8px; font-size: 9.5pt; vertical-align: top; }
          th { background-color: #e2e8f0; text-align: left; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${escapeHtml(d.identitas.judulInfografis)}</h1>
          <p>${escapeHtml(d.identitas.subjudul)}</p>
          <p><strong>${escapeHtml(d.identitas.mataPelajaran)}</strong> &bull; ${escapeHtml(d.identitas.kelasFase)} &bull; <span class="badge">${escapeHtml(d.identitas.formatTerpilih)}</span></p>
        </div>

        <div class="card">
          <div class="card-title">Konsep Utama Materi</div>
          <p>${escapeHtml(d.analisisMateri.konsepUtama)}</p>
        </div>

        ${d.kartuInfografis.map(c => `
          <div class="card">
            <div class="card-title">${escapeHtml(c.ikon)} ${escapeHtml(c.judul)}</div>
            ${c.highlightText ? `<p><em>${escapeHtml(c.highlightText)}</em></p>` : ''}
            ${c.poinList ? `<ul>${c.poinList.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>` : ''}
            ${c.langkahList ? `<ol>${c.langkahList.map(l => `<li><strong>${escapeHtml(l.judul)}:</strong> ${escapeHtml(l.deskripsi)}</li>`).join('')}</ol>` : ''}
            ${c.itemPerbandingan ? `
              <table>
                <tbody>
                  ${c.itemPerbandingan.map(p => `
                    <tr>
                      <td style="width:50%;"><strong>${escapeHtml(p.judulA)}</strong><br/>${escapeHtml(p.deskripsiA)}</td>
                      <td style="width:50%;"><strong>${escapeHtml(p.judulB)}</strong><br/>${escapeHtml(p.deskripsiB)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
            ${c.istilahList ? `<ul>${c.istilahList.map(i => `<li><strong>${escapeHtml(i.kata)}:</strong> ${escapeHtml(i.definisi)}</li>`).join('')}</ul>` : ''}
          </div>
        `).join('')}

        <div class="card" style="background-color: #fef2f2; border-color: #fecaca;">
          <div class="card-title" style="color: #b91c1c;">Kesalahan Umum yang Wajib Dihindari</div>
          <ul>
            ${d.analisisMateri.kesalahanUmum.map(k => `<li>${escapeHtml(k)}</li>`).join('')}
          </ul>
        </div>

        <p style="text-align: center; font-style: italic; color: #475569; margin-top: 20px;">
          ${escapeHtml(d.identitas.kataMutiara)}
        </p>
      </body>
      </html>
    `;
  };

  // Card theme helper
  const getCardClasses = (warna: string) => {
    switch (warna) {
      case 'teal':
        return {
          cardBg: 'bg-teal-50/70 border-teal-200',
          headerBg: 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white',
          tagBg: 'bg-teal-100 text-teal-800',
          highlight: 'bg-teal-100/70 text-teal-950 border-teal-300',
        };
      case 'emerald':
        return {
          cardBg: 'bg-emerald-50/70 border-emerald-200',
          headerBg: 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white',
          tagBg: 'bg-emerald-100 text-emerald-800',
          highlight: 'bg-emerald-100/70 text-emerald-950 border-emerald-300',
        };
      case 'sky':
        return {
          cardBg: 'bg-sky-50/70 border-sky-200',
          headerBg: 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white',
          tagBg: 'bg-sky-100 text-sky-800',
          highlight: 'bg-sky-100/70 text-sky-950 border-sky-300',
        };
      case 'amber':
        return {
          cardBg: 'bg-amber-50/70 border-amber-200',
          headerBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
          tagBg: 'bg-amber-100 text-amber-800',
          highlight: 'bg-amber-100/70 text-amber-950 border-amber-300',
        };
      case 'rose':
        return {
          cardBg: 'bg-rose-50/70 border-rose-200',
          headerBg: 'bg-gradient-to-r from-rose-600 to-pink-500 text-white',
          tagBg: 'bg-rose-100 text-rose-800',
          highlight: 'bg-rose-100/70 text-rose-950 border-rose-300',
        };
      case 'purple':
        return {
          cardBg: 'bg-purple-50/70 border-purple-200',
          headerBg: 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white',
          tagBg: 'bg-purple-100 text-purple-800',
          highlight: 'bg-purple-100/70 text-purple-950 border-purple-300',
        };
      case 'indigo':
      default:
        return {
          cardBg: 'bg-indigo-50/70 border-indigo-200',
          headerBg: 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white',
          tagBg: 'bg-indigo-100 text-indigo-800',
          highlight: 'bg-indigo-100/70 text-indigo-950 border-indigo-300',
        };
    }
  };

  const filteredFormats = DAFTAR_30_FORMAT_INFOGRAFIS.filter(f =>
    f.nama.toLowerCase().includes(formatFilter.toLowerCase()) ||
    f.deskripsi.toLowerCase().includes(formatFilter.toLowerCase()) ||
    f.cocokUntuk.toLowerCase().includes(formatFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Title */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-cyan-950 border border-teal-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 font-black shadow-lg shadow-teal-500/20">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                30 Pilihan Format Visual &bull; Cetak A4 Portrait &bull; Gambar HD
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Generator Materi Ajar Infografis
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Ubah materi ajar tebal menjadi rangkuman visual infografis yang <strong className="text-teal-300">ringkas, sistematis, mudah dipahami</strong>, dan ramah Gen Z. Lengkap dengan 10 parameter analisis materi, pilihan 30 format infografis edukatif, serta ekspor langsung ke <strong className="text-cyan-300">Gambar HD (.PNG)</strong>, Word, dan Cetak A4.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto shrink-0 no-print">
            <button
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/25 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Merender HD...' : 'Download Gambar HD (.PNG)'}</span>
            </button>
            <DocumentExportToolbar
              filename={`Infografis_${infografisData.identitas.judulInfografis.replace(/\s+/g, '_')}`}
              title={infografisData.identitas.judulInfografis || 'Infografis Materi'}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters & Config (5 cols) vs Infografis Preview (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4 no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-400" />
                <h2 className="font-bold text-sm text-white">Parameter Infografis</h2>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full font-medium">
                Sistematis & Visual
              </span>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Muat Contoh Cepat:</span>
                <span className="text-[10px] text-slate-500">1-Klik</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-colors font-medium cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MAPEL & KELAS/FASE */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Mata Pelajaran (MAPEL)
                </label>
                <input
                  type="text"
                  value={mapel}
                  onChange={(e) => setMapel(e.target.value)}
                  placeholder="Contoh: PJOK, IPAS, Matematika"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Kelas / Fase Capaian
                </label>
                <input
                  type="text"
                  value={kelasFase}
                  onChange={(e) => setKelasFase(e.target.value)}
                  placeholder="Contoh: Kelas V / Fase C"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Pilihan Format Infografis
                </label>
                <button
                  type="button"
                  onClick={() => setFormatModalOpen(true)}
                  className="w-full bg-slate-950 hover:bg-slate-800 border border-teal-500/40 rounded-xl px-2.5 py-2 text-xs text-teal-300 font-bold flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="truncate">
                    {selectedFormat === 'auto' ? '🤖 Rekomendasi AI (Auto)' : selectedFormat}
                  </span>
                  <span className="text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">
                    30 Format
                  </span>
                </button>
              </div>
            </div>

            {/* TOPIK / MATERI */}
            <div className="space-y-1 text-xs">
              <label className="text-[11px] font-medium text-slate-300 block">
                Topik / Materi Pembelajaran
              </label>
              <textarea
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                rows={2}
                placeholder="Tuliskan topik materi yang ingin dirangkum menjadi infografis..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none leading-relaxed font-semibold text-teal-300"
              />
            </div>

            {/* Catatan Tambahan (Opsional) */}
            <div className="space-y-1 text-xs">
              <label className="text-[11px] font-medium text-slate-300 block">
                Fokus Penekanan Khusus (Opsional)
              </label>
              <input
                type="text"
                value={catatanTambahan}
                onChange={(e) => setCatatanTambahan(e.target.value)}
                placeholder="Contoh: Sorot rumus cepat, sertakan tips keselamatan, dll."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !topik.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Merancang Infografis Edukatif & Rangkuman...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Materi Ajar Infografis</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Info Box: Prinsip Desain */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Standar Infografis Edukatif (Section A-F):
            </span>
            <ul className="space-y-1 text-[11px] leading-relaxed pl-1">
              <li>&bull; <strong>Kejelasan & Keringkasan</strong>: Hindari paragraf panjang, gunakan poin kunci.</li>
              <li>&bull; <strong>Format Tepat</strong>: Dipilih secara analitis dari 30 model infografis.</li>
              <li>&bull; <strong>Ukuran A4 Portrait</strong>: Layout 21 × 29,7 cm proporsional siap cetak atau sebar.</li>
              <li>&bull; <strong>Gaya Visual</strong>: Modern + Colorful + Clean + Edukatif + Fun.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Visual Infografis Canvas & Tabs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 no-print">
            {/* View Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('visual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'visual'
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Infografis A4 Visual</span>
              </button>
              <button
                onClick={() => setActiveTab('analisis')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'analisis'
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Analisis 10 Parameter</span>
              </button>
              <button
                onClick={() => setActiveTab('ringkasan')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ringkasan'
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Rangkuman Teks</span>
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs text-slate-300">
              <button
                onClick={() => setZoomScale(Math.max(0.5, zoomScale - 0.1))}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                title="Perkecil"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-10 text-center font-bold text-teal-400">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale(Math.min(1.2, zoomScale + 0.1))}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                title="Perbesar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              title="Salin Rangkuman Teks"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
            </button>
          </div>

          {/* TAB 1: VISUAL A4 INFOGRAFIS */}
          {activeTab === 'visual' && (
            <div className="overflow-x-auto p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col items-center justify-start min-h-[850px]">
              <div 
                style={{ 
                  transform: `scale(${zoomScale})`, 
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out'
                }}
                className="flex flex-col items-center"
              >
                {/* A4 CANVAS (210mm x 297mm) */}
                <div 
                  ref={canvasRef}
                  className="w-[210mm] min-h-[297mm] bg-white text-slate-800 p-[12mm] shadow-2xl rounded-sm box-border relative flex flex-col justify-between"
                  style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
                >
                  {/* Top Colorful Header Gradient Border */}
                  <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-teal-500 via-cyan-400 to-indigo-500"></div>

                  <div>
                    {/* Header Banner */}
                    <div className="border-b-2 border-slate-200 pb-3 mb-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-600 via-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md font-black text-2xl shrink-0">
                            <Dumbbell className="w-7 h-7" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                                {infografisData.identitas.mataPelajaran} &bull; {infografisData.identitas.kelasFase}
                              </span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                                {infografisData.identitas.formatTerpilih}
                              </span>
                            </div>
                            <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase mt-0.5 leading-snug">
                              {infografisData.identitas.judulInfografis}
                            </h1>
                            <p className="text-xs font-semibold text-slate-600">
                              {infografisData.identitas.subjudul}
                            </p>
                          </div>
                        </div>

                        {/* Top Badge */}
                        <div className="text-right flex flex-col items-end shrink-0">
                          <div className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-[10px] font-bold text-teal-800 flex items-center gap-1 shadow-2xs">
                            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                            <span>RANGKUMAN VISUAL A4</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-medium mt-1">SADARPJOK Media</span>
                        </div>
                      </div>

                      {/* Konsep Utama Callout Box */}
                      <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-teal-50/90 via-sky-50/70 to-indigo-50/90 border border-teal-200/90 shadow-2xs flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-teal-600 text-white shrink-0 mt-0.5">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                          <span className="text-[10px] uppercase font-black tracking-wider text-teal-800 block">
                            🎯 Konsep Esensial (Must-Know Concept):
                          </span>
                          <p className="text-slate-800 font-semibold mt-0.5 leading-relaxed">
                            {infografisData.analisisMateri.konsepUtama}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Infographic Cards Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {infografisData.kartuInfografis.map((card, idx) => {
                        const style = getCardClasses(card.warnaCard);
                        const isFullWidth = card.tipeKonten === 'langkah' || card.tipeKonten === 'perbandingan' || card.itemPerbandingan?.length;

                        return (
                          <div
                            key={card.id || idx}
                            className={`rounded-xl border ${style.cardBg} overflow-hidden shadow-2xs flex flex-col justify-between ${
                              isFullWidth ? 'col-span-2' : 'col-span-1'
                            }`}
                          >
                            {/* Card Header */}
                            <div className={`px-3 py-2 flex items-center justify-between ${style.headerBg}`}>
                              <div className="flex items-center gap-2">
                                <span className="text-base leading-none">{card.ikon}</span>
                                <h3 className="font-bold text-xs tracking-tight">{card.judul}</h3>
                              </div>
                              {card.tag && (
                                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                                  {card.tag}
                                </span>
                              )}
                            </div>

                            {/* Card Body */}
                            <div className="p-3 text-xs text-slate-800 space-y-2 flex-1">
                              {/* Highlight text if any */}
                              {card.highlightText && (
                                <div className={`p-2 rounded-lg text-[11px] font-bold border ${style.highlight}`}>
                                  💡 {card.highlightText}
                                </div>
                              )}

                              {/* Poin List */}
                              {card.poinList && card.poinList.length > 0 && (
                                <ul className="space-y-1">
                                  {card.poinList.map((p, pIdx) => (
                                    <li key={pIdx} className="flex items-start gap-1.5 text-[11px] leading-snug">
                                      <span className="text-teal-600 font-bold shrink-0 mt-0.5">•</span>
                                      <span>{p}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {/* Langkah-langkah Step by Step */}
                              {card.langkahList && card.langkahList.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                                  {card.langkahList.map((l, lIdx) => (
                                    <div 
                                      key={lIdx} 
                                      className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between text-center"
                                    >
                                      <div>
                                        <div className="w-5 h-5 mx-auto rounded-full bg-teal-500 text-white font-extrabold text-[10px] flex items-center justify-center mb-1">
                                          {l.nomor}
                                        </div>
                                        <strong className="block text-[10px] text-slate-900 leading-tight mb-0.5">
                                          {l.judul}
                                        </strong>
                                      </div>
                                      <p className="text-[9px] text-slate-600 leading-tight">
                                        {l.deskripsi}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Perbandingan Visual */}
                              {card.itemPerbandingan && card.itemPerbandingan.length > 0 && (
                                <div className="space-y-2 pt-1">
                                  {card.itemPerbandingan.map((item, cIdx) => (
                                    <div key={cIdx} className="grid grid-cols-2 gap-2 text-[11px]">
                                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950">
                                        <strong className="block text-emerald-800 font-bold mb-0.5">
                                          ✅ {item.judulA}
                                        </strong>
                                        <p className="text-[10px] leading-snug">{item.deskripsiA}</p>
                                      </div>
                                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-950">
                                        <strong className="block text-rose-800 font-bold mb-0.5">
                                          ❌ {item.judulB}
                                        </strong>
                                        <p className="text-[10px] leading-snug">{item.deskripsiB}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Istilah Glosarium */}
                              {card.istilahList && card.istilahList.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                  {card.istilahList.map((ist, iIdx) => (
                                    <div key={iIdx} className="p-2 rounded-lg bg-white border border-slate-200 text-[10px]">
                                      <span className="font-extrabold text-teal-800 block">{ist.kata}</span>
                                      <p className="text-slate-600 text-[9px] leading-tight mt-0.5">{ist.definisi}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Alert: Kesalahan Umum */}
                    {infografisData.analisisMateri.kesalahanUmum && infografisData.analisisMateri.kesalahanUmum.length > 0 && (
                      <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-rose-900 mb-1">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>Peringatan! Kesalahan Umum yang Wajib Dihindari:</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-rose-900">
                          {infografisData.analisisMateri.kesalahanUmum.map((k, kIdx) => (
                            <div key={kIdx} className="flex items-start gap-1">
                              <span className="text-rose-600 font-bold shrink-0">•</span>
                              <span className="leading-snug">{k}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Canvas Footer */}
                  <div className="border-t-2 border-slate-200 pt-3 mt-auto">
                    {/* Kata Mutiara / Motivasi */}
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center mb-2">
                      <p className="text-xs font-bold text-slate-800 italic">
                        {infografisData.identitas.kataMutiara}
                      </p>
                    </div>

                    {/* Tagar Memori & Watermark */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex flex-wrap gap-1">
                        {infografisData.tagarMemori.map((tag, tIdx) => (
                          <span key={tIdx} className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 font-bold text-[9px]">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="font-semibold text-slate-400">
                        A4 Format &bull; Siap Belajar Sebelum Ulangan & Aktivitas Mandiri
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANALISIS 10 PARAMETER MATERI */}
          {activeTab === 'analisis' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4 text-xs text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-sm text-white">Analisis Materi (Bagian A Sesuai Standar Prompt)</h3>
                </div>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold">
                  10 Parameter Identifikasi
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <strong className="text-teal-400 block font-bold text-xs">1. Konsep Utama:</strong>
                  <p className="text-slate-200 leading-relaxed">{infografisData.analisisMateri.konsepUtama}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <strong className="text-teal-400 block font-bold text-xs">2. Submateri Penting:</strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-200">
                    {infografisData.analisisMateri.submateriPenting.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <strong className="text-teal-400 block font-bold text-xs">3. Istilah Kunci:</strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {infografisData.analisisMateri.istilahKunci.map((ist, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="font-bold text-cyan-300">{ist.istilah}:</span> {ist.artiSingkat}
                      </div>
                    ))}
                  </div>
                </div>

                {infografisData.analisisMateri.rumusAtauAturan && infografisData.analisisMateri.rumusAtauAturan.length > 0 && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-teal-400 block font-bold text-xs">4. Rumus atau Aturan Penting:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-slate-200">
                      {infografisData.analisisMateri.rumusAtauAturan.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {infografisData.analisisMateri.langkahProsedur && infografisData.analisisMateri.langkahProsedur.length > 0 && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-teal-400 block font-bold text-xs">5. Langkah / Prosedur:</strong>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-200">
                      {infografisData.analisisMateri.langkahProsedur.map((l, idx) => (
                        <li key={idx}>{l}</li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <strong className="text-teal-400 block font-bold text-xs">7. Contoh Relevan:</strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-200">
                    {infografisData.analisisMateri.contohRelevan.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-rose-900/40 space-y-1 text-rose-200">
                  <strong className="text-rose-400 block font-bold text-xs">9. Kesalahan Umum yang Perlu Dihindari:</strong>
                  <ul className="list-disc pl-4 space-y-1">
                    {infografisData.analisisMateri.kesalahanUmum.map((k, idx) => (
                      <li key={idx}>{k}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <strong className="text-teal-400 block font-bold text-xs">10. Kata Kunci Memori:</strong>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {infografisData.analisisMateri.kataKunciMemori.map((kw, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-extrabold text-xs">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RINGKASAN TEKS LENGKAP */}
          {activeTab === 'ringkasan' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span>Rangkuman Belajar Ringkas (Poin-Poin)</span>
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1 text-teal-400 hover:text-teal-300 font-bold cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin Semua'}</span>
                </button>
              </div>
              <div className="space-y-4 text-xs text-slate-200 leading-relaxed font-sans p-2">
                <div>
                  <h4 className="text-sm font-bold text-teal-300 mb-1">
                    {infografisData.identitas.judulInfografis}
                  </h4>
                  <p className="text-slate-400">{infografisData.identitas.subjudul}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-white block mb-1">Inti Konsep:</strong>
                  <p>{infografisData.analisisMateri.konsepUtama}</p>
                </div>

                <div>
                  <strong className="text-white block mb-2">Poin-Poin Kunci Rangkuman:</strong>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-300">
                    {infografisData.takeawayKunci.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 30 FORMAT INFOGRAFIS */}
      {formatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-teal-400" />
                  <span>Katalog 30 Format Infografis Edukatif</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Pilih format yang paling cocok dengan karakter materi yang Anda ajarkan
                </p>
              </div>
              <button
                onClick={() => setFormatModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Filter Search */}
            <div className="p-3 border-b border-slate-800 bg-slate-950">
              <input
                type="text"
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                placeholder="Cari format (misal: Cheatsheet, Mind Map, Timeline, Flowchart)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* Grid 30 Formats */}
            <div className="p-4 overflow-y-auto space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option Auto */}
              <button
                type="button"
                onClick={() => {
                  setSelectedFormat('auto');
                  setFormatModalOpen(false);
                }}
                className={`col-span-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  selectedFormat === 'auto'
                    ? 'bg-teal-500/20 border-teal-500 text-teal-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-2xl">🤖</div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-bold text-white">REKOMENDASI AI OTOMATIS (AUTO-DETECT)</strong>
                    <span className="text-[9px] bg-teal-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded">
                      DIREKOMENDASIKAN
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    AI menganalisis karakteristik materi ajar Anda dan secara cerdas memilih 1 format utama yang paling efektif dari ke-30 pilihan.
                  </p>
                </div>
              </button>

              {filteredFormats.map((fmt) => {
                const isSelected = selectedFormat === fmt.nama;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => {
                      setSelectedFormat(fmt.nama);
                      setFormatModalOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-teal-500/20 border-teal-500 text-teal-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{fmt.ikon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-teal-400 font-mono font-bold">#{fmt.nomor}</span>
                        <strong className="text-xs font-bold text-white truncate">{fmt.nama}</strong>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                        {fmt.deskripsi}
                      </p>
                      <span className="inline-block mt-1 text-[9px] text-teal-300/80 italic">
                        Cocok: {fmt.cocokUntuk}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setFormatModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
