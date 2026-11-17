'use client';

import React, { useState, useEffect } from 'react';
import { 
  Presentation, Sparkles, Download, Copy, Check, ChevronLeft, 
  ChevronRight, Maximize2, Minimize2, Eye, Palette, Layers, 
  FileText, Printer, HelpCircle, Target, Lightbulb, Dumbbell, 
  BookOpen, Compass, Award, Heart, MessageSquare, ExternalLink,
  RefreshCw, CheckCircle2, Bookmark, Flame, Zap
} from 'lucide-react';
import { SlideItem, PresentationData, getFallbackPresentationData } from '@/lib/slide-presentation';
import { DocumentExportToolbar } from '@/components/DocumentExportToolbar';
import { buildStandardWordHtml, escapeHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

export function SlidePresentationGenerator() {
  // Form states
  const [namaGuru, setNamaGuru] = useState<string>('Guru PJOK SD Negeri Kalimantong');
  const [mapel, setMapel] = useState<string>('Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)');
  const [kelas, setKelas] = useState<string>('Kelas V (Fase C)');
  const [sekolah, setSekolah] = useState<string>('SD Negeri Kalimantong');
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState<string>(
    'Peserta didik dapat memahami dan mempraktikkan variasi gerak dasar menendang dan menghentikan bola dengan kaki bagian dalam secara terarah, berpasangan, dan sportif.'
  );
  const [jumlahSubmateri, setJumlahSubmateri] = useState<number>(2);
  const [temaWarna, setTemaWarna] = useState<'teal' | 'ocean' | 'sunset' | 'purple' | 'emerald'>('teal');

  // Presentation playback states
  const [presentation, setPresentation] = useState<PresentationData>(() =>
    getFallbackPresentationData(namaGuru, mapel, kelas, sekolah, tujuanPembelajaran)
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(true);
  const [showCanvaHints, setShowCanvaHints] = useState<boolean>(true);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isExportingPptx, setIsExportingPptx] = useState<boolean>(false);

  const currentSlide: SlideItem = presentation.slides[currentSlideIndex] || presentation.slides[0];

  // Quick preset loader
  const handleLoadPreset = (preset: 'sepakbola' | 'senam' | 'kebugaran' | 'ipas' | 'matematika') => {
    if (preset === 'sepakbola') {
      setMapel('PJOK');
      setKelas('Kelas V (Fase C)');
      setTujuanPembelajaran(
        'Peserta didik dapat memahami dan mempraktikkan variasi gerak dasar menendang dan menghentikan bola dengan kaki bagian dalam secara terarah, berpasangan, dan sportif.'
      );
      setJumlahSubmateri(2);
      setTemaWarna('teal');
    } else if (preset === 'senam') {
      setMapel('PJOK');
      setKelas('Kelas IV (Fase B)');
      setTujuanPembelajaran(
        'Peserta didik mampu mempraktikkan variasi pola gerak dominan senam lantai meliputi guling depan (forward roll) dengan awalan jongkok dan sikap keseimbangan statis secara aman dan berani.'
      );
      setJumlahSubmateri(2);
      setTemaWarna('ocean');
    } else if (preset === 'kebugaran') {
      setMapel('PJOK');
      setKelas('Kelas VI (Fase C)');
      setTujuanPembelajaran(
        'Peserta didik dapat mengidentifikasi dan melakukan latihan peningkatan daya tahan jantung paru (aerobik) dan kelincahan melalui sirkuit latihan interval berpasangan.'
      );
      setJumlahSubmateri(2);
      setTemaWarna('sunset');
    } else if (preset === 'ipas') {
      setMapel('IPAS (Ilmu Pengetahuan Alam dan Sosial)');
      setKelas('Kelas V (Fase C)');
      setTujuanPembelajaran(
        'Peserta didik dapat menganalisis hubungan antar makhluk hidup pada suatu ekosistem dalam bentuk rantai makanan dan jaring-jaring makanan serta dampaknya bagi keseimbangan alam.'
      );
      setJumlahSubmateri(2);
      setTemaWarna('emerald');
    } else if (preset === 'matematika') {
      setMapel('Matematika');
      setKelas('Kelas VII (Fase D)');
      setTujuanPembelajaran(
        'Peserta didik dapat memahami konsep bilangan bulat positif dan negatif, membandingkannya pada garis bilangan, dan menyelesaikan operasi penjumlahan serta pengurangan dalam konteks kehidupan nyata.'
      );
      setJumlahSubmateri(2);
      setTemaWarna('purple');
    }
  };

  // Generate presentation via API
  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await postJsonSafe<{ data?: PresentationData }>(
        '/api/gemini/generate-slides',
        {
          namaGuru,
          mapel,
          kelas,
          sekolah,
          tujuanPembelajaran,
          jumlahSubmateri,
          temaWarna,
        }
      );
      if (res.data?.data) {
        setPresentation(res.data.data);
        setCurrentSlideIndex(0);
      } else {
        const fallback = getFallbackPresentationData(namaGuru, mapel, kelas, sekolah, tujuanPembelajaran);
        setPresentation(fallback);
        setCurrentSlideIndex(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlideIndex((prev) => Math.min(presentation.slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentation.slides.length, isFullscreen]);

  // Export real PowerPoint (.pptx) via server route
  const handleExportPPTX = async () => {
    setIsExportingPptx(true);
    try {
      const res = await fetch('/api/export-pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presentation, temaWarna }),
      });

      if (!res.ok) throw new Error('Gagal mengekspor file PPTX');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Presentasi_Canva_${presentation.mapel.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pptx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export PPTX:', err);
    } finally {
      setIsExportingPptx(false);
    }
  };

  // Copy Canva Bulk Create CSV / Table
  const handleCopyCanvaBulkCreate = () => {
    let tsv = 'Nomor Slide\tJudul Slide\tSubjudul / Poin Utama\tIde Visual Canva\tKeyword Elemen Canva\tCatatan Guru\n';
    presentation.slides.forEach((s) => {
      const bulletsText = s.bullets ? s.bullets.join(' | ') : s.questionPrompt || '';
      tsv += `${s.id}\t${s.title.replace(/\t/g, ' ')}\t${bulletsText.replace(/\t/g, ' ')}\t${s.visualIdea.replace(/\t/g, ' ')}\t${s.canvaKeywordTag.replace(/\t/g, ' ')}\t${s.speakerNotes.replace(/\t/g, ' ')}\n`;
    });
    navigator.clipboard.writeText(tsv);
    setCopiedType('canva-bulk');
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Copy Canva Magic Design Prompt
  const handleCopyMagicDesignPrompt = () => {
    const promptText = `Desain presentasi PowerPoint Canva profesional bertema modern edukasi untuk mata pelajaran ${presentation.mapel} kelas ${presentation.kelas} di ${presentation.sekolah}.
Judul Materi: "${presentation.judulMateri}"
Tujuan Pembelajaran: ${presentation.tujuanPembelajaran}
Gaya Visual: Bersih, dinamis, ilustratif, ramah peserta didik dengan palet warna ${temaWarna}.
Struktur Slide:
- Slide 1: Cover Judul (${presentation.judulMateri}) oleh ${presentation.guru}
- Slide 2: Pertanyaan Pemantik Rasa Ingin Tahu
- Slide 3: Tujuan Pembelajaran
- Slide 4-13: Materi Pembelajaran Berurutan (${jumlahSubmateri} Submateri dengan mini aktivitas & contoh)
- Slide 14: Pertanyaan Refleksi Kritis
- Slide 15: Rangkuman & Kesimpulan
- Slide 16: Pesan Motivasi & Penutup Terima Kasih.`;

    navigator.clipboard.writeText(promptText);
    setCopiedType('canva-magic');
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Copy Full Markdown Outline
  const handleCopyMarkdown = () => {
    let md = `# PRESENTASI PEMBELAJARAN INTERAKTIF CANVA & PPT\n`;
    md += `**Mata Pelajaran:** ${presentation.mapel}\n`;
    md += `**Kelas / Fase:** ${presentation.kelas}\n`;
    md += `**Satuan Pendidikan:** ${presentation.sekolah}\n`;
    md += `**Guru Penyusun:** ${presentation.guru}\n`;
    md += `**Tujuan Pembelajaran:** ${presentation.tujuanPembelajaran}\n\n---\n\n`;

    presentation.slides.forEach((s) => {
      md += `## Slide ${s.id}: ${s.title} (${s.type.toUpperCase()})\n`;
      if (s.submateriTag) md += `*${s.submateriTag}*\n`;
      if (s.subtitle) md += `### ${s.subtitle}\n`;
      if (s.questionPrompt) md += `> **Pertanyaan Pemantik:** ${s.questionPrompt}\n\n`;
      if (s.bullets && s.bullets.length > 0) {
        s.bullets.forEach((b) => {
          md += `- ${b}\n`;
        });
      }
      if (s.activityBox) {
        md += `\n**Tantangan Aktivitas (${s.activityBox.duration}):** ${s.activityBox.instruction}\n`;
      }
      if (s.keyConcept) md += `\n**Konsep Kunci:** ${s.keyConcept}\n`;
      md += `\n🎨 **Ide Visual Canva:** ${s.visualIdea}\n`;
      md += `🔍 **Keyword Canva:** \`${s.canvaKeywordTag}\`\n`;
      md += `🗣️ **Catatan Guru:** ${s.speakerNotes}\n\n---\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedType('markdown');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const buildExportHtml = () => {
    const slidesRows = presentation.slides
      .map((s) => {
        const detailParts: string[] = [];
        if (s.subtitle) detailParts.push(`<em>${escapeHtml(s.subtitle)}</em>`);
        if (s.questionPrompt) detailParts.push(`<strong>Pemantik:</strong> ${escapeHtml(s.questionPrompt)}`);
        if (s.bullets && s.bullets.length > 0) {
          detailParts.push(s.bullets.map((b, i) => `${i + 1}. ${escapeHtml(b)}`).join('<br/>'));
        }
        if (s.activityBox) {
          detailParts.push(`<strong>Aktivitas (${escapeHtml(s.activityBox.duration)}):</strong> ${escapeHtml(s.activityBox.instruction)}`);
        }
        if (s.keyConcept) detailParts.push(`<strong>Konsep Kunci:</strong> ${escapeHtml(s.keyConcept)}`);

        return `
        <tr>
          <td style="text-align:center;"><strong>${s.id}</strong><br/><small>${escapeHtml(s.type.toUpperCase())}</small></td>
          <td><strong>${escapeHtml(s.title)}</strong>${s.submateriTag ? `<br/><small>${escapeHtml(s.submateriTag)}</small>` : ''}</td>
          <td>${detailParts.join('<br/>') || '-'}</td>
          <td>${escapeHtml(s.visualIdea)}<br/><small>Keyword: ${escapeHtml(s.canvaKeywordTag)}</small></td>
          <td>${escapeHtml(s.speakerNotes)}</td>
        </tr>`;
      })
      .join('');

    const bodyHtml = `
      <div class="kop">
        <h2>HANDOUT &amp; NASKAH SLIDE PRESENTASI PEMBELAJARAN</h2>
        <h3>${escapeHtml(presentation.judulMateri || presentation.mapel)}</h3>
        <p>${escapeHtml(presentation.sekolah)} &bull; ${escapeHtml(presentation.kelas)}</p>
      </div>
      <table class="meta-table">
        <tr><td style="width:150px;"><strong>Mata Pelajaran</strong></td><td>: ${escapeHtml(presentation.mapel)}</td><td style="width:130px;"><strong>Kelas / Fase</strong></td><td>: ${escapeHtml(presentation.kelas)}</td></tr>
        <tr><td><strong>Guru Pengampu</strong></td><td>: ${escapeHtml(presentation.guru)}</td><td><strong>Jumlah Slide</strong></td><td>: ${presentation.slides.length} Slide</td></tr>
        <tr><td><strong>Tujuan Pembelajaran</strong></td><td colspan="3">: ${escapeHtml(presentation.tujuanPembelajaran)}</td></tr>
      </table>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:45px;">Slide</th>
            <th style="width:140px;">Judul &amp; Bagian</th>
            <th>Materi / Poin Utama Slide</th>
            <th style="width:140px;">Ide Visual Canva</th>
            <th style="width:140px;">Catatan Guru</th>
          </tr>
        </thead>
        <tbody>${slidesRows}</tbody>
      </table>
    `;

    return buildStandardWordHtml({
      title: `Handout Slide Presentasi - ${presentation.mapel}`,
      bodyHtml,
      orientation: 'landscape',
    });
  };

  // Theme gradient mapping
  const themeStyles = {
    teal: {
      heroBg: 'bg-gradient-to-br from-teal-900 via-slate-900 to-emerald-950',
      badgeBg: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
      slideDark: 'bg-gradient-to-br from-teal-900 via-slate-950 to-emerald-950 text-white',
      slideLight: 'bg-slate-900 text-slate-100 border border-teal-500/20',
      accentText: 'text-teal-400',
      accentBg: 'bg-teal-500',
      cardHighlight: 'bg-teal-950/60 border-teal-500/30 text-teal-200',
    },
    ocean: {
      heroBg: 'bg-gradient-to-br from-sky-900 via-slate-900 to-blue-950',
      badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
      slideDark: 'bg-gradient-to-br from-sky-900 via-slate-950 to-blue-950 text-white',
      slideLight: 'bg-slate-900 text-slate-100 border border-sky-500/20',
      accentText: 'text-sky-400',
      accentBg: 'bg-sky-500',
      cardHighlight: 'bg-sky-950/60 border-sky-500/30 text-sky-200',
    },
    sunset: {
      heroBg: 'bg-gradient-to-br from-amber-900 via-slate-900 to-rose-950',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      slideDark: 'bg-gradient-to-br from-amber-900 via-slate-950 to-rose-950 text-white',
      slideLight: 'bg-slate-900 text-slate-100 border border-amber-500/20',
      accentText: 'text-amber-400',
      accentBg: 'bg-amber-500',
      cardHighlight: 'bg-amber-950/60 border-amber-500/30 text-amber-200',
    },
    purple: {
      heroBg: 'bg-gradient-to-br from-purple-900 via-slate-900 to-fuchsia-950',
      badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      slideDark: 'bg-gradient-to-br from-purple-900 via-slate-950 to-fuchsia-950 text-white',
      slideLight: 'bg-slate-900 text-slate-100 border border-purple-500/20',
      accentText: 'text-purple-400',
      accentBg: 'bg-purple-500',
      cardHighlight: 'bg-purple-950/60 border-purple-500/30 text-purple-200',
    },
    emerald: {
      heroBg: 'bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      slideDark: 'bg-gradient-to-br from-emerald-900 via-slate-950 to-teal-950 text-white',
      slideLight: 'bg-slate-900 text-slate-100 border border-emerald-500/20',
      accentText: 'text-emerald-400',
      accentBg: 'bg-emerald-500',
      cardHighlight: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-200',
    },
  };

  const activeTheme = themeStyles[temaWarna] || themeStyles.teal;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`${activeTheme.heroBg} border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl`}>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${activeTheme.badgeBg}`}>
              <Presentation className="w-3.5 h-3.5" />
              <span>Generator Slide Canva & PowerPoint Interaktif</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              Bahan Ajar Slide Presentasi Canva & PPTX
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Buat presentasi pembelajaran interaktif terstruktur: <strong>Slide Judul, Slide Pemantik, Tujuan Pembelajaran, 5–6 Slide per Submateri, Refleksi Kritis, Kesimpulan, dan Penutup</strong>. Lengkap dengan panduan ide visual Canva, kata kunci elemen, dan unduhan file <strong>PowerPoint (.pptx) asli</strong>.
            </p>
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <DocumentExportToolbar
              filename={`Handout_Slide_${presentation.mapel}`}
              title={`Handout Slide Presentasi - ${presentation.mapel}`}
              getHtmlContent={buildExportHtml}
              orientation="landscape"
              compact
            />
            <button
              onClick={handleExportPPTX}
              disabled={isExportingPptx}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPptx ? 'Membuat PPTX...' : 'Download PPTX'}</span>
            </button>

            <button
              onClick={handleCopyCanvaBulkCreate}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              title="Salin tabel data untuk fitur Canva Bulk Create"
            >
              {copiedType === 'canva-bulk' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedType === 'canva-bulk' ? 'Tersalin!' : 'Canva Bulk'}</span>
            </button>

            <button
              onClick={handleCopyMagicDesignPrompt}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs transition-all cursor-pointer"
              title="Salin prompt untuk Canva Magic Design"
            >
              {copiedType === 'canva-magic' ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
              <span>Prompt Canva</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Setup vs Live Presentation Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Preset Configuration */}
        <div className="lg:col-span-4 space-y-4 no-print">
          {/* Quick Presets */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Preset Cepat Bahan Ajar</span>
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">1-Klik Siap</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleLoadPreset('sepakbola')}
                className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-teal-500/50 transition-all flex items-center justify-between cursor-pointer"
              >
                <span>⚽ PJOK: Menendang & Mengontrol Bola (Kls V)</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('senam')}
                className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-sky-500/50 transition-all flex items-center justify-between cursor-pointer"
              >
                <span>🤸 PJOK: Senam Lantai Guling Depan (Kls IV)</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('kebugaran')}
                className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-amber-500/50 transition-all flex items-center justify-between cursor-pointer"
              >
                <span>🏃 PJOK: Kebugaran Jasmani & Sirkuit (Kls VI)</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('ipas')}
                className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-emerald-500/50 transition-all flex items-center justify-between cursor-pointer"
              >
                <span>🌿 IPAS: Rantai Makanan & Ekosistem (Kls V)</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Form Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span>Identitas & Tujuan Pembelajaran</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nama Guru Pengampu</label>
                <input
                  type="text"
                  value={namaGuru}
                  onChange={(e) => setNamaGuru(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="Contoh: Guru PJOK SD Negeri Kalimantong"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={mapel}
                    onChange={(e) => setMapel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder="Contoh: PJOK"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Kelas / Fase</label>
                  <input
                    type="text"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder="Contoh: Kelas V (Fase C)"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Satuan Pendidikan / Sekolah</label>
                <input
                  type="text"
                  value={sekolah}
                  onChange={(e) => setSekolah(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="Contoh: SD Negeri Kalimantong"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Tujuan Pembelajaran (Basis Materi Slide)
                </label>
                <textarea
                  rows={4}
                  value={tujuanPembelajaran}
                  onChange={(e) => setTujuanPembelajaran(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 font-medium text-xs leading-relaxed focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="Tuliskan tujuan pembelajaran lengkap..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Jumlah Submateri</label>
                  <select
                    value={jumlahSubmateri}
                    onChange={(e) => setJumlahSubmateri(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value={1}>1 Submateri (10-11 Slide)</option>
                    <option value={2}>2 Submateri (15-16 Slide)</option>
                    <option value={3}>3 Submateri (20-22 Slide)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Tema Warna Canva</label>
                  <select
                    value={temaWarna}
                    onChange={(e) => setTemaWarna(e.target.value as 'teal' | 'ocean' | 'sunset' | 'purple' | 'emerald')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="teal">Teal & Emerald Modern</option>
                    <option value="ocean">Ocean Blue & Cyan</option>
                    <option value="sunset">Sunset Coral & Amber</option>
                    <option value="purple">Purple & Magenta Tech</option>
                    <option value="emerald">Emerald Eco Nature</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Menyusun Struktur Slide AI...' : 'Buat Presentasi Canva & PPTX'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 16:9 Widescreen Canva Slide Presentation Viewer */}
        <div className="lg:col-span-8 space-y-4">
          {/* Slide Player Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 no-print">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentSlideIndex === 0}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 cursor-pointer transition-all"
                title="Slide Sebelumnya (Panah Kiri)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-xs font-mono font-bold text-white">
                  Slide {currentSlideIndex + 1}
                </span>
                <span className="text-xs text-slate-500">/</span>
                <span className="text-xs font-mono text-slate-400">
                  {presentation.slides.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCurrentSlideIndex((prev) => Math.min(presentation.slides.length - 1, prev + 1))}
                disabled={currentSlideIndex === presentation.slides.length - 1}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 cursor-pointer transition-all"
                title="Slide Selanjutnya (Panah Kanan / Spasi)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <span className="hidden sm:inline text-xs text-slate-400 font-medium ml-2 truncate max-w-xs">
                {currentSlide.submateriTag || currentSlide.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  showSpeakerNotes
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Tampilkan Catatan Guru saat Mengajar"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Catatan Guru</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCanvaHints(!showCanvaHints)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  showCanvaHints
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Tampilkan Panduan Elemen & Keyword Canva"
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Ide Canva</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyMarkdown()}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Salin Outline Teks Lengkap"
              >
                {copiedType === 'markdown' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 16:9 Widescreen Canva Slide Canvas */}
          <div
            className={`w-full aspect-video rounded-2xl shadow-2xl overflow-hidden relative flex flex-col justify-between p-6 sm:p-10 select-none transition-all duration-300 ${
              currentSlide.type === 'title' || currentSlide.type === 'closing'
                ? activeTheme.slideDark
                : 'bg-slate-950 text-slate-100 border border-slate-800'
            }`}
          >
            {/* Top Bar inside Slide */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800/80 text-teal-300 border border-teal-500/30">
                  {currentSlide.submateriTag ||
                    (currentSlide.type === 'title' ? 'SLIDE JUDUL' :
                     currentSlide.type === 'hook' ? 'SLIDE PEMANTIK' :
                     currentSlide.type === 'objective' ? 'TUJUAN PEMBELAJARAN' :
                     currentSlide.type === 'activity' ? 'MINI AKTIVITAS' :
                     currentSlide.type === 'reflection' ? 'SLIDE REFLEKSI' :
                     currentSlide.type === 'summary' ? 'KESIMPULAN' : 'SLIDE PENUTUP')}
                </span>

                {currentSlide.type === 'title' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 hidden sm:inline">
                    Canva 16:9 HD
                  </span>
                )}
              </div>

              <div className="text-right text-[10px] sm:text-xs text-slate-400 font-medium">
                {presentation.sekolah} • {presentation.kelas}
              </div>
            </div>

            {/* Slide Body Content */}
            <div className="my-auto z-10 space-y-4">
              {currentSlide.type === 'title' ? (
                // Title Slide Layout
                <div className="space-y-3 sm:space-y-4 max-w-3xl">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{presentation.mapel}</span>
                  </span>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    {currentSlide.title}
                  </h1>
                  {currentSlide.subtitle && (
                    <p className="text-sm sm:text-base text-teal-100/90 font-medium max-w-2xl leading-relaxed">
                      {currentSlide.subtitle}
                    </p>
                  )}
                  <div className="pt-4 border-t border-teal-500/30 flex items-center gap-4 text-xs sm:text-sm text-teal-200">
                    <div>
                      <span className="text-teal-400/80 text-[10px] block uppercase font-bold">Guru Pengampu</span>
                      <strong>{presentation.guru}</strong>
                    </div>
                    <div className="h-6 w-px bg-teal-500/30" />
                    <div>
                      <span className="text-teal-400/80 text-[10px] block uppercase font-bold">Sekolah</span>
                      <strong>{presentation.sekolah}</strong>
                    </div>
                  </div>
                </div>
              ) : currentSlide.type === 'closing' ? (
                // Closing Slide Layout
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                    <Heart className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white">
                    {currentSlide.title}
                  </h2>
                  {currentSlide.subtitle && (
                    <p className="text-sm sm:text-base text-teal-200 font-medium">
                      {currentSlide.subtitle}
                    </p>
                  )}
                  {currentSlide.bullets && currentSlide.bullets.length > 0 && (
                    <p className="text-xs sm:text-sm italic text-amber-300 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
                      {currentSlide.bullets[0]}
                    </p>
                  )}
                  {currentSlide.keyConcept && (
                    <div className="text-xs text-slate-300 font-mono whitespace-pre-line pt-2">
                      {currentSlide.keyConcept}
                    </div>
                  )}
                </div>
              ) : (
                // Standard Content Slide Layout
                <div className="space-y-4 max-w-3xl">
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                      {currentSlide.title}
                    </h2>
                    {currentSlide.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                        {currentSlide.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Question Prompt (Hook / Pemantik) */}
                  {currentSlide.questionPrompt && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm text-amber-200 flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="font-semibold leading-relaxed">
                        {currentSlide.questionPrompt}
                      </p>
                    </div>
                  )}

                  {/* Bullet Points */}
                  {currentSlide.bullets && currentSlide.bullets.length > 0 && (
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                      {currentSlide.bullets.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Mini Activity Challenge Box */}
                  {currentSlide.activityBox && (
                    <div className="bg-teal-500/15 border border-teal-500/40 rounded-xl p-3.5 text-xs sm:text-sm text-teal-100 space-y-1">
                      <div className="flex items-center justify-between text-teal-300 font-bold text-xs">
                        <span className="flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-amber-400" />
                          <span>TANTANGAN MINI AKTIVITAS</span>
                        </span>
                        <span className="bg-teal-950 px-2 py-0.5 rounded border border-teal-500/30 font-mono text-[10px]">
                          {currentSlide.activityBox.duration}
                        </span>
                      </div>
                      <p className="leading-relaxed text-slate-200">
                        {currentSlide.activityBox.instruction}
                      </p>
                    </div>
                  )}

                  {/* Key Concept Bottom Tag */}
                  {currentSlide.keyConcept && !currentSlide.activityBox && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-[11px] sm:text-xs text-teal-300">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>Kunci:</strong> {currentSlide.keyConcept}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Slide Footer */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80 pt-3 z-10">
              <span>Bahan Ajar Interaktif • {presentation.guru}</span>
              <div className="flex items-center gap-3">
                <span>Tekan ◄ / ► untuk ganti slide</span>
                <span className="font-mono font-bold text-slate-400">
                  {currentSlideIndex + 1} of {presentation.slides.length}
                </span>
              </div>
            </div>

            {/* Subtle decorative background circle */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />
          </div>

          {/* Canva Elements Guide & Speaker Notes Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Canva Visual Idea & Element Search Keywords */}
            {showCanvaHints && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-400" />
                    <h4 className="font-bold text-slate-200">Ide Visual Canva (Slide {currentSlideIndex + 1})</h4>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentSlide.canvaKeywordTag);
                      setCopiedType('keyword');
                      setTimeout(() => setCopiedType(null), 2000);
                    }}
                    className="text-[10px] text-purple-300 hover:text-purple-200 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded cursor-pointer"
                  >
                    {copiedType === 'keyword' ? '✓ Tersalin' : 'Salin Keyword'}
                  </button>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  {currentSlide.visualIdea}
                </p>

                <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-semibold">Cari di Canva Elements:</span>
                  <code className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-teal-300 font-mono border border-slate-800">
                    {currentSlide.canvaKeywordTag}
                  </code>
                </div>
              </div>
            )}

            {/* Teacher Speaker Notes */}
            {showSpeakerNotes && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-400" />
                  <h4 className="font-bold text-slate-200">Catatan Guru (Speaker Notes)</h4>
                </div>
                <p className="text-slate-300 leading-relaxed italic bg-slate-950 p-3 rounded-xl border border-slate-800">
                  &ldquo;{currentSlide.speakerNotes}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Slide Thumbnails Navigation Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2 no-print">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                <span>Navigasi Seluruh Slide ({presentation.slides.length} Slide)</span>
              </span>
              <span className="text-[11px] text-slate-400">Klik thumbnail untuk melompat langsung</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {presentation.slides.map((s, idx) => {
                const isActive = idx === currentSlideIndex;
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`shrink-0 w-28 text-left p-2 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300 ring-2 ring-teal-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="font-bold">#{s.id}</span>
                      <span className="truncate max-w-[50px] uppercase text-[9px] text-slate-500">
                        {s.type}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-200 line-clamp-2 leading-tight">
                      {s.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
