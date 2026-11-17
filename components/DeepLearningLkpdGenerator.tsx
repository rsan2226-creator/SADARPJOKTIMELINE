'use client';

import React, { useState, useRef } from 'react';
import { 
  Sparkles, Copy, Check, 
  FileImage, RefreshCw, CheckCircle2, Star, Heart, Target, 
  HelpCircle, Layers, BookOpen, Compass, Zap, Trophy, Clock, 
  User, School, CheckSquare, Lightbulb, Dumbbell, ShieldCheck, 
  Smile, Eye, MessageSquare, PenTool, Image as ImageIcon,
  ChevronRight, BookMarked, Award, ExternalLink
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { 
  DeepLearningLkpdData, 
  getFallbackDeepLearningLkpd, 
  JENIS_LKPD_LIST, 
  JenisLkpdType 
} from '@/lib/deep-learning-lkpd-types';
import { DocumentExportToolbar } from './DocumentExportToolbar';
import { escapeHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

export function DeepLearningLkpdGenerator() {
  // Form input states
  const [mapel, setMapel] = useState<string>('Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)');
  const [kelasFase, setKelasFase] = useState<string>('Kelas V / Fase C');
  const [topikMateri, setTopikMateri] = useState<string>('Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola');
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState<string>(
    'Peserta didik dapat menganalisis letak kaki tumpu, mempraktikkan operan dan kontrol bola mendatar berpasangan secara presisi, serta merefleksikan kerja sama tim.'
  );
  const [alokasiWaktu, setAlokasiWaktu] = useState<string>('2 × 40 Menit');
  const [konteksKehidupanNyata, setKonteksKehidupanNyata] = useState<string>(
    'Bermain sepak bola mini di lapangan rumput sekolah bersama teman sebaya saat jam olahraga atau sore hari.'
  );
  const [karakteristikPesertaDidik, setKarakteristikPesertaDidik] = useState<string>(
    'Peserta didik usia 10-11 tahun yang sangat aktif kinestetik, antusias pada tantangan visual bergambar, dan menyukai permainan kompetitif berpasangan.'
  );
  const [jumlahHalaman, setJumlahHalaman] = useState<number>(2);
  const [jenisLkpd, setJenisLkpd] = useState<JenisLkpdType>('LKPD PEMECAHAN MASALAH');

  // Generator & UI states
  const [lkpdData, setLkpdData] = useState<DeepLearningLkpdData>(() =>
    getFallbackDeepLearningLkpd(mapel, kelasFase, topikMateri, tujuanPembelajaran, jenisLkpd)
  );
  const [activeTab, setActiveTab] = useState<'lembar' | 'prompt-gambar' | 'kunci-jawaban' | 'rubrik'>('lembar');
  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Ref for high-res PNG export
  const sheetPrintRef = useRef<HTMLDivElement>(null);

  // Current selected LKPD info
  const selectedLkpdInfo = JENIS_LKPD_LIST.find((j) => j.id === jenisLkpd) || JENIS_LKPD_LIST[5];

  // Quick preset loader
  const handleLoadPreset = (preset: 'sepakbola' | 'kebugaran' | 'senam' | 'tts' | 'ipas') => {
    if (preset === 'sepakbola') {
      setMapel('PJOK');
      setKelasFase('Kelas V / Fase C');
      setTopikMateri('Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola');
      setTujuanPembelajaran(
        'Peserta didik dapat menganalisis letak kaki tumpu, mempraktikkan operan dan kontrol bola mendatar berpasangan secara presisi, serta merefleksikan kerja sama tim.'
      );
      setJenisLkpd('LKPD PEMECAHAN MASALAH');
      setJumlahHalaman(2);
      setKonteksKehidupanNyata('Bermain sepak bola mini di lapangan rumput sekolah bersama teman.');
    } else if (preset === 'kebugaran') {
      setMapel('PJOK');
      setKelasFase('Kelas VI / Fase C');
      setTopikMateri('Pengukuran Kebugaran Jasmani dan Sirkuit Latihan Interval');
      setTujuanPembelajaran(
        'Peserta didik dapat membaca dan mengolah data denyut nadi istirahat vs denyut nadi latihan sirkuit, membandingkan efisiensi aerobik, dan menyimpulkan profil kebugaran fisiknya.'
      );
      setJenisLkpd('LKPD ANALISIS DATA');
      setJumlahHalaman(2);
      setKonteksKehidupanNyata('Menghitung denyut nadi setelah berlari mengelilingi lapangan sekolah.');
    } else if (preset === 'senam') {
      setMapel('PJOK');
      setKelasFase('Kelas IV / Fase B');
      setTopikMateri('Rangkaian Gerak Dominan Senam Lantai Guling Depan (Forward Roll)');
      setTujuanPembelajaran(
        'Peserta didik dapat menyusun dan mengurutkan tahapan gerak guling depan dari posisi awal, tolakan, pendaratan tengkuk, hingga berdiri tegak secara aman dan berani.'
      );
      setJenisLkpd('LKPD URUTAN/SEQUENCING');
      setJumlahHalaman(2);
      setKonteksKehidupanNyata('Melakukan aktivitas senam di atas matras empuk di aula sekolah.');
    } else if (preset === 'tts') {
      setMapel('PJOK');
      setKelasFase('Kelas V / Fase C');
      setTopikMateri('Kosakata & Konsep Kebugaran Jasmani serta Komponen Fisik');
      setTujuanPembelajaran(
        'Peserta didik dapat menemukan dan menuliskan istilah penting kebugaran jasmani (daya tahan, kelenturan, kelincahan, kekuatan) melalui teka-teki silang mendatar dan menurun.'
      );
      setJenisLkpd('LKPD TEKA-TEKI SILANG (TTS)');
      setJumlahHalaman(1);
      setKonteksKehidupanNyata('Mengenal istilah olahraga yang sering didengar di televisi dan perlombaan.');
    } else if (preset === 'ipas') {
      setMapel('IPAS');
      setKelasFase('Kelas V / Fase C');
      setTopikMateri('Rantai Makanan dan Keseimbangan Jaring-Jaring Ekosistem');
      setTujuanPembelajaran(
        'Peserta didik dapat menganalisis alur perpindahan energi makanan melalui komik cerita bergambar dan memecahkan masalah ledakan hama belalang di sawah.'
      );
      setJenisLkpd('LKPD CERITA BERGAMBAR');
      setJumlahHalaman(2);
      setKonteksKehidupanNyata('Mengamati sawah di sekitar lingkungan desa dan hewan yang hidup di sana.');
    }
  };

  // Generate LKPD via Gemini API
  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await postJsonSafe<{ data?: DeepLearningLkpdData }>(
        '/api/gemini/generate-lkpd-deep-learning',
        {
          mapel,
          kelasFase,
          topikMateri,
          tujuanPembelajaran,
          alokasiWaktu,
          konteksKehidupanNyata,
          karakteristikPesertaDidik,
          jumlahHalaman,
          jenisLkpd,
        }
      );
      if (res.data?.data) {
        setLkpdData(res.data.data);
        setActivePageNum(1);
      } else {
        const fallback = getFallbackDeepLearningLkpd(mapel, kelasFase, topikMateri, tujuanPembelajaran, jenisLkpd);
        setLkpdData(fallback);
        setActivePageNum(1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Export High-Res Image (PNG) via html-to-image
  const handleExportPNG = async () => {
    if (!sheetPrintRef.current) return;
    setIsExportingImage(true);
    try {
      const dataUrl = await toPng(sheetPrintRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `LKPD_DeepLearning_Hal${activePageNum}_${lkpdData.identitas.mataPelajaran.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export PNG error:', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  // Build Word/PDF export HTML
  const buildExportHtml = () => {
    const d = lkpdData;
    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${escapeHtml(d.identitas.judulLkpd)}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #1e293b; }
        h1 { font-size: 15pt; color: #0f766e; text-align: center; margin-bottom: 3px; }
        h2 { font-size: 12.5pt; color: #0369a1; border-bottom: 2px solid #0284c7; padding-bottom: 3px; margin-top: 15px; }
        h3 { font-size: 11pt; color: #0f172a; margin-top: 10px; }
        table { border-collapse: collapse; width: 100%; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; break-inside: avoid; }
        th, td { border: 1px solid #000000; padding: 6px; vertical-align: top; }
        th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
        .box-info { border: 1px solid #cbd5e1; padding: 10px; background-color: #f8fafc; border-radius: 6px; margin-bottom: 12px; }
        .card-page { border: 1px solid #cbd5e1; background-color: #ffffff; padding: 12px; margin-bottom: 15px; border-radius: 6px; }
        .quote-box { background: #f0fdfa; border-left: 4px solid #0d9488; padding: 8px 12px; margin: 8px 0; font-style: italic; }
        .garis-jawaban { border-bottom: 1px dashed #94a3b8; height: 35px; margin-bottom: 8px; }
      </style>
      </head>
      <body>
        <h1>${escapeHtml(d.identitas.judulLkpd)}</h1>
        <p style="text-align:center; font-weight:bold; color:#475569; margin:2px 0;">JENIS: ${escapeHtml(d.identitas.jenisLkpd)} • ${escapeHtml(d.identitas.mataPelajaran)} • ${escapeHtml(d.identitas.kelasFase)}</p>
        <p style="text-align:center; color:#64748b; font-size:10pt;">Alokasi Waktu: ${escapeHtml(d.identitas.alokasiWaktu)} • Konteks: ${escapeHtml(d.identitas.konteksKehidupanNyata)}</p>
        <hr/>

        <div class="box-info">
          <strong>Identitas Siswa:</strong> Nama: ___________________________  No. Absen: ______  Kelas: ${escapeHtml(d.identitas.kelasFase)}  Tanggal: ____________
        </div>

        <h2>1. TUJUAN PEMBELAJARAN</h2>
        <ul>${d.tujuanPembelajaran.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>

        <h2>2. KETERKAITAN PEMBELAJARAN MENDALAM</h2>
        <p><strong>Berkesadaran (Mindful):</strong> ${escapeHtml(d.keterkaitanDeepLearning.mindful)}</p>
        <p><strong>Bermakna (Meaningful):</strong> ${escapeHtml(d.keterkaitanDeepLearning.meaningful)}</p>
        <p><strong>Menggembirakan (Joyful):</strong> ${escapeHtml(d.keterkaitanDeepLearning.joyful)}</p>

        <h2>3. LEMBAR KERJA PESERTA DIDIK (LKPD SIAP PAKAI)</h2>
        ${d.halamanList.map(h => `
          <div class="card-page">
            <h3>HALAMAN ${h.halamanNomor}: ${escapeHtml(h.judulHalaman)}</h3>
            <p><strong>Instruksi:</strong> ${escapeHtml(h.instruksiUtama)}</p>
            <div class="quote-box">💡 <strong>Mindful Prompt:</strong> ${escapeHtml(h.mindfulPrompt)}</div>
            <p><strong>Stimulus / Deskripsi Gambar:</strong> ${escapeHtml(h.stimulusVisualDeskripsi)}</p>

            ${h.aktivitasLevel1 ? `
              <h4>${escapeHtml(h.aktivitasLevel1.judul)}</h4>
              <p>${escapeHtml(h.aktivitasLevel1.deskripsi)}</p>
              <ul>${h.aktivitasLevel1.tugas.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
              <div class="garis-jawaban"></div>
            ` : ''}

            ${h.aktivitasLevel2 ? `
              <h4>${escapeHtml(h.aktivitasLevel2.judul)}</h4>
              <p>${escapeHtml(h.aktivitasLevel2.deskripsi)}</p>
              <ul>${h.aktivitasLevel2.tugas.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
              <div class="garis-jawaban"></div>
            ` : ''}

            ${h.aktivitasLevel3 ? `
              <h4>${escapeHtml(h.aktivitasLevel3.judul)}</h4>
              <p>${escapeHtml(h.aktivitasLevel3.deskripsi)}</p>
              <ul>${h.aktivitasLevel3.tugas.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
              <div class="garis-jawaban"></div>
            ` : ''}

            <h4>Analisis & Diskusi Rekan:</h4>
            <ul>${h.analisisDanDiskusi.pertanyaan.map(q => `<li>${escapeHtml(q)}</li>`).join('')}</ul>
            <div class="garis-jawaban"></div>

            <p><strong>Sebelum dan sesudah belajar, apa yang berubah dari pemahamanmu?</strong></p>
            <div class="quote-box">${escapeHtml(h.kesimpulanDanRefleksi.sebelumSesudahBelajar)}</div>
          </div>
        `).join('')}

        <h2>4. PROMPT GAMBAR AI LENGKAP</h2>
        ${d.daftarPromptGambar.map(p => `
          <div class="box-info">
            <p><strong>GAMBAR ${p.nomor} — ${escapeHtml(p.fungsiPedagogis)}</strong></p>
            <p><em>Prompt AI:</em> ${escapeHtml(p.promptReadyAi)}</p>
            <p><small>Objek: ${escapeHtml(p.objekUtama)} | Komposisi: ${escapeHtml(p.komposisi)} | Gaya: ${escapeHtml(p.gayaVisual)}</small></p>
          </div>
        `).join('')}

        <h2>5. KUNCI JAWABAN & INDIKATOR</h2>
        ${d.kunciJawaban.map(k => `
          <p><strong>Hal. ${k.nomorHalaman} (${escapeHtml(k.aktivitas)}):</strong><br/>
          Jawaban Objektif: ${escapeHtml(k.jawabanObjektif)}<br/>
          <em>Indikator Jawaban Terbuka: ${escapeHtml(k.indikatorJawabanTerbuka)}</em></p>
        `).join('')}

        <h2>6. RUBRIK PENILAIAN PEMBELAJARAN MENDALAM</h2>
        <table border="1" cellpadding="6" style="border-collapse:collapse; width:100%; font-size:10pt;">
          <thead>
            <tr bgcolor="#f1f5f9">
              <th>Aspek Penilaian</th><th>Skor 4 (Sangat Baik)</th><th>Skor 3 (Baik)</th><th>Skor 2 (Cukup)</th><th>Skor 1 (Bimbingan)</th>
            </tr>
          </thead>
          <tbody>
            ${d.rubrikPenilaian.map(r => `
              <tr>
                <td><strong>${escapeHtml(r.aspek)}</strong></td>
                <td>${escapeHtml(r.skor4)}</td><td>${escapeHtml(r.skor3)}</td><td>${escapeHtml(r.skor2)}</td><td>${escapeHtml(r.skor1)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body></html>
    `;
  };

  // Copy full markdown
  const handleCopyMarkdown = () => {
    let md = `# ${lkpdData.identitas.judulLkpd}\n\n`;
    md += `**Mata Pelajaran:** ${lkpdData.identitas.mataPelajaran}\n`;
    md += `**Kelas/Fase:** ${lkpdData.identitas.kelasFase}\n`;
    md += `**Topik:** ${lkpdData.identitas.topikMateri}\n`;
    md += `**Jenis LKPD:** ${lkpdData.identitas.jenisLkpd}\n`;
    md += `**Alokasi Waktu:** ${lkpdData.identitas.alokasiWaktu}\n\n`;

    md += `## Keterkaitan Pembelajaran Mendalam\n`;
    md += `- **Mindful:** ${lkpdData.keterkaitanDeepLearning.mindful}\n`;
    md += `- **Meaningful:** ${lkpdData.keterkaitanDeepLearning.meaningful}\n`;
    md += `- **Joyful:** ${lkpdData.keterkaitanDeepLearning.joyful}\n\n---\n\n`;

    lkpdData.halamanList.forEach((h) => {
      md += `### Halaman ${h.halamanNomor}: ${h.judulHalaman}\n`;
      md += `> **Instruksi:** ${h.instruksiUtama}\n`;
      md += `> **Mindful Prompt:** ${h.mindfulPrompt}\n\n`;
      md += `**Stimulus Gambar:** ${h.stimulusVisualDeskripsi}\n\n`;
      if (h.aktivitasLevel1) {
        md += `#### ${h.aktivitasLevel1.judul}\n${h.aktivitasLevel1.deskripsi}\n`;
        h.aktivitasLevel1.tugas.forEach((t) => (md += `- ${t}\n`));
        md += `*Ruang Jawaban:* ${h.aktivitasLevel1.ruangJawaban}\n\n`;
      }
      if (h.aktivitasLevel2) {
        md += `#### ${h.aktivitasLevel2.judul}\n${h.aktivitasLevel2.deskripsi}\n`;
        h.aktivitasLevel2.tugas.forEach((t) => (md += `- ${t}\n`));
        md += `*Ruang Jawaban:* ${h.aktivitasLevel2.ruangJawaban}\n\n`;
      }
      if (h.aktivitasLevel3) {
        md += `#### ${h.aktivitasLevel3.judul}\n${h.aktivitasLevel3.deskripsi}\n`;
        h.aktivitasLevel3.tugas.forEach((t) => (md += `- ${t}\n`));
        md += `*Ruang Jawaban:* ${h.aktivitasLevel3.ruangJawaban}\n\n`;
      }
      md += `**Sebelum dan sesudah belajar, apa yang berubah dari pemahamanmu?**\n`;
      md += `*${h.kesimpulanDanRefleksi.sebelumSesudahBelajar}*\n\n---\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedType('markdown');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const currentPage = lkpdData.halamanList.find((h) => h.halamanNomor === activePageNum) || lkpdData.halamanList[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900/50 via-teal-900/40 to-cyan-900/40 border border-teal-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-teal-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Expert Deep Learning LKPD Generator • 17 Pilihan Jenis</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              LKPD Pembelajaran Mendalam (Deep Learning)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Kembangkan LKPD bergambar siap pakai yang berkesadaran (<strong>Mindful</strong>), bermakna (<strong>Meaningful</strong>), dan menggembirakan (<strong>Joyful</strong>). Dilengkapi 17 pola pedagogis, diferensiasi Level 1–3, prompt gambar AI spesifik, kunci jawaban, dan rubrik asesmen lengkap.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportPNG}
              disabled={isExportingImage}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <FileImage className="w-4 h-4" />
              <span>{isExportingImage ? 'Memproses Gambar...' : 'Download Gambar HD (PNG)'}</span>
            </button>

            <DocumentExportToolbar
              filename={`LKPD_DeepLearning_${lkpdData.identitas.mataPelajaran.replace(/[^a-zA-Z0-9]/g, '_')}`}
              title={lkpdData.identitas.judulLkpd || 'LKPD Deep Learning'}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Form Setup vs Interactive LKPD Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-4 space-y-4 no-print">
          {/* Quick Presets */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Preset Cepat Deep Learning</span>
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">1-Klik Siap</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleLoadPreset('sepakbola')}
                className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-teal-500/50 transition-all cursor-pointer"
              >
                ⚽ <strong>PJOK: Menendang & Kontrol Bola</strong> (Pemecahan Masalah)
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('kebugaran')}
                className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-emerald-500/50 transition-all cursor-pointer"
              >
                🏃 <strong>PJOK: Kebugaran Jasmani Denyut Nadi</strong> (Analisis Data)
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('senam')}
                className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-indigo-500/50 transition-all cursor-pointer"
              >
                🤸 <strong>PJOK: Senam Lantai Guling Depan</strong> (Urutan / Sequencing)
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('tts')}
                className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-purple-500/50 transition-all cursor-pointer"
              >
                🧩 <strong>PJOK: Istilah & Konsep Fisik</strong> (Teka-Teki Silang / TTS)
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('ipas')}
                className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-amber-500/50 transition-all cursor-pointer"
              >
                🌿 <strong>IPAS: Rantai Makanan & Ekosistem</strong> (Cerita Bergambar)
              </button>
            </div>
          </div>

          {/* Form Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-teal-400" />
              <span>Data Pembelajaran Mendalam</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {/* Jenis LKPD Dropdown (17 Pilihan) */}
              <div>
                <label className="text-[11px] font-bold text-teal-300 block mb-1">
                  Jenis LKPD (Pilih salah satu dari 17 jenis):
                </label>
                <select
                  value={jenisLkpd}
                  onChange={(e) => setJenisLkpd(e.target.value as JenisLkpdType)}
                  className="w-full bg-slate-950 border border-teal-500/40 rounded-xl px-3 py-2 text-slate-100 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {JENIS_LKPD_LIST.map((j) => (
                    <option key={j.id} value={j.id} className="bg-slate-900 text-slate-100">
                      {j.label}
                    </option>
                  ))}
                </select>

                {/* Pattern info badge */}
                <div className="mt-1.5 bg-teal-950/60 border border-teal-500/30 rounded-lg p-2 text-[10.5px] text-teal-200">
                  <span className="font-bold text-teal-300 block">Pola Pedagogis:</span>
                  <span className="font-mono text-[9.5px]">{selectedLkpdInfo.pola}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={mapel}
                    onChange={(e) => setMapel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Kelas / Fase</label>
                  <input
                    type="text"
                    value={kelasFase}
                    onChange={(e) => setKelasFase(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Topik / Materi</label>
                <input
                  type="text"
                  value={topikMateri}
                  onChange={(e) => setTopikMateri(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Tujuan Pembelajaran</label>
                <textarea
                  rows={2}
                  value={tujuanPembelajaran}
                  onChange={(e) => setTujuanPembelajaran(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 font-medium text-xs leading-relaxed focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Alokasi Waktu</label>
                  <input
                    type="text"
                    value={alokasiWaktu}
                    onChange={(e) => setAlokasiWaktu(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Jumlah Halaman</label>
                  <select
                    value={jumlahHalaman}
                    onChange={(e) => setJumlahHalaman(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value={1}>1 Halaman A4</option>
                    <option value={2}>2 Halaman A4</option>
                    <option value={3}>3 Halaman A4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Konteks Kehidupan Nyata</label>
                <input
                  type="text"
                  value={konteksKehidupanNyata}
                  onChange={(e) => setKonteksKehidupanNyata(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="Contoh: Bermain sepak bola mini di lapangan rumput sekolah"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Karakteristik Peserta Didik</label>
                <input
                  type="text"
                  value={karakteristikPesertaDidik}
                  onChange={(e) => setKarakteristikPesertaDidik(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="Contoh: Usia 10-11 tahun aktif kinestetik"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Merancang LKPD Deep Learning AI...' : 'Generate LKPD Deep Learning'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Output System */}
        <div className="lg:col-span-8 space-y-4">
          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 no-print">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('lembar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'lembar'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Lembar LKPD Siap Pakai</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('prompt-gambar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'prompt-gambar'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Prompt Gambar AI ({lkpdData.daftarPromptGambar.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('kunci-jawaban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'kunci-jawaban'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Kunci Jawaban</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('rubrik')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'rubrik'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Rubrik Penilaian</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1 bg-slate-800 rounded-lg cursor-pointer"
                title="Salin Seluruh Naskah Markdown"
              >
                {copiedType === 'markdown' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin Markdown</span>
              </button>
            </div>
          </div>

          {/* TAB 1: LEMBAR LKPD SIAP PAKAI (A4 PORTRAIT) */}
          {activeTab === 'lembar' && (
            <div className="space-y-3">
              {/* Page Selector Bar if > 1 page */}
              {lkpdData.halamanList.length > 1 && (
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 no-print">
                  <span className="text-xs text-slate-400 font-medium">Navigasi Halaman Lembar LKPD:</span>
                  <div className="flex items-center gap-1.5">
                    {lkpdData.halamanList.map((h) => (
                      <button
                        key={h.halamanNomor}
                        onClick={() => setActivePageNum(h.halamanNomor)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          activePageNum === h.halamanNomor
                            ? 'bg-teal-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Halaman {h.halamanNomor}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Printable A4 Portrait Paper Sheet */}
              <div className="overflow-x-auto bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-6 flex justify-center items-start shadow-inner">
                <div
                  ref={sheetPrintRef}
                  id="deep-learning-lkpd-sheet"
                  className="w-[210mm] min-h-[297mm] bg-white text-slate-800 p-8 sm:p-10 shadow-2xl relative flex flex-col justify-between font-sans print:shadow-none print:w-full print:p-6"
                  style={{ boxSizing: 'border-box' }}
                >
                  {/* Decorative Border */}
                  <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-500" />
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-600" />

                  {/* Top Header */}
                  <div className="border-b-2 border-slate-200 pb-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md">
                          <BookMarked className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                              Pembelajaran Mendalam (Deep Learning)
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {lkpdData.identitas.jenisLkpd}
                            </span>
                          </div>
                          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                            {lkpdData.identitas.judulLkpd}
                          </h1>
                          <p className="text-xs font-bold text-teal-700">
                            {lkpdData.identitas.topikMateri} • {lkpdData.identitas.kelasFase}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-slate-700 block">
                          Hal. {currentPage.halamanNomor} dari {lkpdData.halamanList.length}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {lkpdData.identitas.alokasiWaktu}
                        </span>
                      </div>
                    </div>

                    {/* Identitas Diri Siswa (Halaman 1) */}
                    {currentPage.halamanNomor === 1 && (
                      <div className="mt-3 grid grid-cols-4 gap-2 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Nama Lengkap Siswa:</span>
                          <div className="border-b border-dotted border-slate-400 h-5 mt-0.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">No. Absen:</span>
                          <div className="border-b border-dotted border-slate-400 h-5 mt-0.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Kelas / Fase:</span>
                          <strong className="text-slate-800 text-[11px] block mt-0.5">{lkpdData.identitas.kelasFase}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Hari / Tanggal:</span>
                          <div className="border-b border-dotted border-slate-400 h-5 mt-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Keterkaitan 3 Prinsip Deep Learning (Halaman 1) */}
                  {currentPage.halamanNomor === 1 && (
                    <div className="grid grid-cols-3 gap-2 mb-3.5 text-[10px]">
                      <div className="bg-sky-50 border border-sky-200 rounded-xl p-2">
                        <strong className="text-sky-900 block font-bold mb-0.5">🧠 BERKESADARAN (Mindful)</strong>
                        <p className="text-slate-700 leading-snug line-clamp-3">
                          {lkpdData.keterkaitanDeepLearning.mindful}
                        </p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2">
                        <strong className="text-emerald-900 block font-bold mb-0.5">🌱 BERMAKNA (Meaningful)</strong>
                        <p className="text-slate-700 leading-snug line-clamp-3">
                          {lkpdData.keterkaitanDeepLearning.meaningful}
                        </p>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-2">
                        <strong className="text-amber-900 block font-bold mb-0.5">🎉 MENGGEMBIRAKAN (Joyful)</strong>
                        <p className="text-slate-700 leading-snug line-clamp-3">
                          {lkpdData.keterkaitanDeepLearning.joyful}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Judul & Instruksi Halaman */}
                  <div className="space-y-3 flex-1 mb-4">
                    <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h2 className="text-sm font-black text-teal-950">
                          {currentPage.judulHalaman}
                        </h2>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-200/60 px-2 py-0.5 rounded-full">
                          Instruksi Utama
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {currentPage.instruksiUtama}
                      </p>
                    </div>

                    {/* Mindful Prompt Box */}
                    <div className="bg-amber-50/80 border-l-4 border-amber-500 rounded-r-xl p-2.5 text-xs text-amber-950 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-amber-900 block">Pertanyaan Berkesadaran (Mindful Prompt):</strong>
                        <p className="italic text-[11px] mt-0.5 font-semibold text-slate-800">
                          &ldquo;{currentPage.mindfulPrompt}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Stimulus Visual Box (Non-Table, Pedagogis) */}
                    <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                          <span>Stimulus Visual Pedagogis:</span>
                        </div>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                          Stimulus Berpikir
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                        {currentPage.stimulusVisualDeskripsi}
                      </p>
                    </div>

                    {/* Aktivitas Berjenjang (Level 1, 2, 3) */}
                    {currentPage.aktivitasLevel1 && (
                      <div className="border border-sky-200 bg-sky-50/40 rounded-xl p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between font-bold text-sky-950">
                          <span>{currentPage.aktivitasLevel1.judul}</span>
                          <span className="text-[9.5px] bg-sky-200 text-sky-800 px-2 py-0.5 rounded-full">
                            Eksplorasi
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {currentPage.aktivitasLevel1.deskripsi}
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-800 font-medium">
                          {currentPage.aktivitasLevel1.tugas.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                        <div className="mt-1 h-9 border-b border-dashed border-slate-300 flex items-end">
                          <span className="text-[9.5px] text-slate-400 italic">
                            Ruang Jawaban: {currentPage.aktivitasLevel1.ruangJawaban}
                          </span>
                        </div>
                      </div>
                    )}

                    {currentPage.aktivitasLevel2 && (
                      <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between font-bold text-emerald-950">
                          <span>{currentPage.aktivitasLevel2.judul}</span>
                          <span className="text-[9.5px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                            Tantangan Konsep
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {currentPage.aktivitasLevel2.deskripsi}
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-800 font-medium">
                          {currentPage.aktivitasLevel2.tugas.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                        <div className="mt-1 h-9 border-b border-dashed border-slate-300 flex items-end">
                          <span className="text-[9.5px] text-slate-400 italic">
                            Ruang Jawaban: {currentPage.aktivitasLevel2.ruangJawaban}
                          </span>
                        </div>
                      </div>
                    )}

                    {currentPage.aktivitasLevel3 && (
                      <div className="border border-purple-200 bg-purple-50/40 rounded-xl p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between font-bold text-purple-950">
                          <span>{currentPage.aktivitasLevel3.judul}</span>
                          <span className="text-[9.5px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                            Tantangan Lanjutan
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {currentPage.aktivitasLevel3.deskripsi}
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-800 font-medium">
                          {currentPage.aktivitasLevel3.tugas.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                        <div className="mt-1 h-9 border-b border-dashed border-slate-300 flex items-end">
                          <span className="text-[9.5px] text-slate-400 italic">
                            Ruang Jawaban: {currentPage.aktivitasLevel3.ruangJawaban}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Analisis & Diskusi Rekan */}
                    <div className="border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-xs space-y-1">
                      <strong className="text-slate-800 font-bold block text-[11px]">
                        Diskusi Kolaborasi Bersama Teman:
                      </strong>
                      <ul className="list-disc list-inside text-[10.5px] text-slate-700">
                        {currentPage.analisisDanDiskusi.pertanyaan.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                      <div className="h-6 border-b border-dotted border-slate-300" />
                    </div>

                    {/* Refleksi Sebelum vs Sesudah Belajar */}
                    <div className="bg-teal-50 border border-teal-200 rounded-xl p-2.5 text-xs space-y-1">
                      <strong className="text-teal-900 font-bold block text-[11px]">
                        Sebelum dan sesudah belajar, apa yang berubah dari pemahamanmu?
                      </strong>
                      <p className="italic text-[10.5px] text-slate-700 bg-white p-2 rounded border border-teal-100">
                        &ldquo;{currentPage.kesimpulanDanRefleksi.sebelumSesudahBelajar}&rdquo;
                      </p>
                      <span className="text-[10px] text-teal-800 font-medium block">
                        {currentPage.kesimpulanDanRefleksi.refleksiDiri}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Footer (Titimangsa & Penilaian) */}
                  <div className="border-t-2 border-slate-200 pt-3 flex items-center justify-between text-xs text-slate-600">
                    <span className="text-[10.5px]">
                      {lkpdData.identitas.judulLkpd} • Kurikulum Merdeka
                    </span>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <span className="text-[10px] block text-slate-400">Nilai Guru</span>
                        <div className="w-14 h-6 border border-slate-300 rounded flex items-center justify-center font-bold text-teal-700 text-xs">
                          A+
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] block text-slate-400">Paraf Guru</span>
                        <div className="w-16 h-6 border-b border-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROMPT GAMBAR AI LENGKAP */}
          {activeTab === 'prompt-gambar' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-teal-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Daftar Prompt Gambar AI (Print Ready 300 DPI)</h3>
                    <p className="text-xs text-slate-400">
                      Prompt spesifik tanpa teks tulisan siap ditempelkan ke AI image generator (Gemini, Midjourney, Canva Magic Media).
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {lkpdData.daftarPromptGambar.map((pg) => (
                  <div key={pg.nomor} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                          {pg.nomor}
                        </span>
                        <span className="text-xs font-bold text-white">
                          GAMBAR {pg.nomor} — {pg.fungsiPedagogis}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pg.promptReadyAi);
                          setCopiedType(`prompt-${pg.nomor}`);
                          setTimeout(() => setCopiedType(null), 2000);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer transition-all"
                      >
                        {copiedType === `prompt-${pg.nomor}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedType === `prompt-${pg.nomor}` ? 'Tersalin!' : 'Salin Prompt AI'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                      <div><strong>Objek:</strong> {pg.objekUtama}</div>
                      <div><strong>Gaya Visual:</strong> {pg.gayaVisual}</div>
                      <div><strong>Warna:</strong> {pg.warna}</div>
                      <div><strong>Rasio:</strong> {pg.rasio}</div>
                      <div className="col-span-2 sm:col-span-4"><strong>Situasi & Karakter:</strong> {pg.situasi} ({pg.karakter})</div>
                      <div className="col-span-2 sm:col-span-4 text-amber-300"><strong>Detail Penting:</strong> {pg.detailPenting}</div>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-teal-500/30 text-xs font-mono text-teal-300 leading-relaxed select-all">
                      {pg.promptReadyAi}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: KUNCI JAWABAN & INDIKATOR */}
          {activeTab === 'kunci-jawaban' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Kunci Jawaban & Indikator Jawaban Terbuka</h3>
                    <p className="text-xs text-slate-400">
                      Panduan guru untuk menilai jawaban objektif dan memeriksa kedalaman berpikir siswa.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {lkpdData.kunciJawaban.map((kj, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                        Halaman {kj.nomorHalaman}
                      </span>
                      <span>{kj.aktivitas}</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <strong className="text-emerald-300 block mb-1">Jawaban Objektif / Kunci:</strong>
                        <p className="text-slate-200 leading-relaxed">{kj.jawabanObjektif}</p>
                      </div>

                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-slate-300">
                        <strong className="text-amber-300 block mb-1">Indikator Jawaban Terbuka:</strong>
                        <p className="italic leading-relaxed">{kj.indikatorJawabanTerbuka}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RUBRIK PENILAIAN PEMBELAJARAN MENDALAM (SIAP CETAK) */}
          {activeTab === 'rubrik' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Rubrik Penilaian Pembelajaran Mendalam (4 Skala • Siap Cetak)</h3>
                    <p className="text-xs text-slate-400">
                      Kriteria penilaian holistik mencakup pemahaman konsep, proses/kinerja, kolaborasi, dan refleksi diri.
                    </p>
                  </div>
                </div>
                <DocumentExportToolbar
                  filename={`Rubrik_LKPD_${lkpdData.identitas.mataPelajaran}`.replace(/\s+/g, '_')}
                  title={`Rubrik Penilaian - ${lkpdData.identitas.judulLkpd}`}
                  getHtmlContent={buildExportHtml}
                  orientation="landscape"
                  compact
                />
              </div>

              <div className="print-sheet bg-white text-slate-900 rounded-xl border border-slate-300 shadow-2xl p-5 sm:p-8 font-sans text-xs">
                <div className="text-center border-b-2 border-double border-slate-900 pb-3 mb-4">
                  <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-slate-900">
                    RUBRIK PENILAIAN PEMBELAJARAN MENDALAM (4 SKALA)
                  </h4>
                  <p className="text-xs font-bold uppercase text-slate-700 mt-0.5">
                    {lkpdData.identitas.judulLkpd} &bull; {lkpdData.identitas.mataPelajaran} ({lkpdData.identitas.kelasFase})
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-900 text-[11px]">
                    <thead>
                      <tr className="bg-slate-200/90 text-slate-900 font-bold text-center">
                        <th className="p-2.5 border border-slate-900 text-left w-1/5">Aspek Penilaian</th>
                        <th className="p-2.5 border border-slate-900 w-1/5">Skor 4 (Sangat Baik)</th>
                        <th className="p-2.5 border border-slate-900 w-1/5">Skor 3 (Baik)</th>
                        <th className="p-2.5 border border-slate-900 w-1/5">Skor 2 (Cukup)</th>
                        <th className="p-2.5 border border-slate-900 w-1/5">Skor 1 (Bimbingan)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lkpdData.rubrikPenilaian.map((r, idx) => (
                        <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                          <td className="p-2.5 border border-slate-900 font-bold text-slate-900 align-top">
                            {r.aspek}
                          </td>
                          <td className="p-2.5 border border-slate-900 leading-snug align-top">
                            {r.skor4}
                          </td>
                          <td className="p-2.5 border border-slate-900 leading-snug align-top">
                            {r.skor3}
                          </td>
                          <td className="p-2.5 border border-slate-900 leading-snug align-top">
                            {r.skor2}
                          </td>
                          <td className="p-2.5 border border-slate-900 leading-snug align-top">
                            {r.skor1}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
