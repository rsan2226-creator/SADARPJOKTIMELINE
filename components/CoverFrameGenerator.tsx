'use client';

import React, { useState, useRef } from 'react';
import { 
  Sparkles, Download, Printer, FileText, Copy, Check, 
  Palette, Eye, ZoomIn, ZoomOut, RefreshCw, Layers, 
  User, School, BookOpen, CheckCircle2, ShieldCheck, 
  Award, Dumbbell, Calendar, FileCheck, Target, ArrowRight,
  Upload, Image as ImageIcon, Frame, BookmarkCheck, ChevronRight
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { 
  CoverDocumentData, 
  DAFTAR_DOKUMEN_DEFAULT, 
  COVER_PRESETS, 
  CoverPreset 
} from '@/lib/cover-frame-types';
import { DocumentExportToolbar } from '@/components/DocumentExportToolbar';
import { buildStandardWordHtml, escapeHtml } from '@/lib/export-utils';

export function CoverFrameGenerator() {
  const [mapel, setMapel] = useState<string>('Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)');
  const [kelas, setKelas] = useState<string>('V (LIMA)');
  const [tahunAjaran, setTahunAjaran] = useState<string>('2026/2027');
  const [namaSekolah, setNamaSekolah] = useState<string>('SD NEGERI KALIMANTONG');
  const [namaGuru, setNamaGuru] = useState<string>('Ahmad Faisal, S.Pd., Gr.');
  const [nip, setNip] = useState<string>('19880724 201503 1 003');
  const [logoType, setLogoType] = useState<'kemendikbud' | 'garuda' | 'prestasi' | 'custom'>('kemendikbud');
  const [customLogoUrl, setCustomLogoUrl] = useState<string>('');
  const [ilustrasiTheme, setIlustrasiTheme] = useState<'pjok_sports' | 'stem_science' | 'digital_classroom' | 'math_geometry' | 'literacy_creative'>('pjok_sports');
  const [daftarDokumen, setDaftarDokumen] = useState<string[]>(DAFTAR_DOKUMEN_DEFAULT);

  // View state
  const [activeTab, setActiveTab] = useState<'cover' | 'frame' | 'both'>('cover');
  const [zoomScale, setZoomScale] = useState<number>(0.85);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [frameGuideMode, setFrameGuideMode] = useState<'blank' | 'lined' | 'grid'>('blank');

  const coverRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const handleApplyPreset = (p: CoverPreset) => {
    setMapel(p.mapel);
    setKelas(p.kelas);
    setTahunAjaran(p.tahunAjaran);
    setNamaSekolah(p.namaSekolah);
    setNamaGuru(p.namaGuru);
    setNip(p.nip);
    setIlustrasiTheme(p.ilustrasi3DTheme);
  };

  const handleExportSingle = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(ref.current, {
        quality: 0.98,
        pixelRatio: 2, // 300 DPI equivalent print quality
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exporting image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      if (coverRef.current) {
        const urlCover = await toPng(coverRef.current, { quality: 0.98, pixelRatio: 2, backgroundColor: '#ffffff' });
        const a1 = document.createElement('a');
        a1.download = `Cover_RPM_${mapel.replace(/\s+/g, '_')}_Kelas_${kelas}_${Date.now()}.png`;
        a1.href = urlCover;
        a1.click();
      }
      setTimeout(async () => {
        if (frameRef.current) {
          const urlFrame = await toPng(frameRef.current, { quality: 0.98, pixelRatio: 2, backgroundColor: '#ffffff' });
          const a2 = document.createElement('a');
          a2.download = `Frame_Isi_Dokumen_${mapel.replace(/\s+/g, '_')}_${Date.now()}.png`;
          a2.href = urlFrame;
          a2.click();
        }
        setIsExporting(false);
      }, 400);
    } catch (err) {
      console.error('Error exporting all:', err);
      setIsExporting(false);
    }
  };

  const buildExportHtml = (): string => {
    const docRows = daftarDokumen
      .map(
        (doc, idx) => `
        <tr>
          <td style="text-align:center; width:36pt;">${idx + 1}</td>
          <td>${escapeHtml(doc)}</td>
          <td style="text-align:center; width:90pt;">Tersedia / Siap Cetak</td>
        </tr>`
      )
      .join('');

    const bodyHtml = `
      <div style="text-align:center; padding: 18pt 12pt; border: 2pt solid #1e3a8a; margin-bottom: 18pt; background-color: #f8fafc;">
        <div style="font-size: 10pt; font-weight: bold; letter-spacing: 1.5pt; color: #1e40af; text-transform: uppercase; margin-bottom: 6pt;">
          DOKUMEN PORTOFOLIO ADMINISTRASI GURU • KURIKULUM MERDEKA
        </div>
        <h1 style="font-size: 18pt; margin: 4pt 0 6pt 0; color: #0f172a;">RENCANA PEMBELAJARAN MENDALAM (RPM)</h1>
        <h2 style="font-size: 13pt; margin: 0 0 12pt 0; border: none; color: #1d4ed8;">${escapeHtml(mapel)}</h2>
        <p style="font-size: 11pt; font-weight: bold; margin: 2pt 0;">KELAS ${escapeHtml(kelas)} • TAHUN PELAJARAN ${escapeHtml(tahunAjaran)}</p>
        <p style="font-size: 12pt; font-weight: bold; color: #0f172a; margin-top: 10pt; text-transform: uppercase;">${escapeHtml(namaSekolah)}</p>
      </div>

      <table class="identity-table" style="margin-bottom: 16pt;">
        <tr>
          <td style="width: 150pt; font-weight: bold;">Satuan Pendidikan</td>
          <td style="width: 12pt;">:</td>
          <td>${escapeHtml(namaSekolah)}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Mata Pelajaran</td>
          <td>:</td>
          <td>${escapeHtml(mapel)}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Kelas</td>
          <td>:</td>
          <td>${escapeHtml(kelas)}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Tahun Pelajaran</td>
          <td>:</td>
          <td>${escapeHtml(tahunAjaran)}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Guru Pengampu</td>
          <td>:</td>
          <td>${escapeHtml(namaGuru)} (NIP. ${escapeHtml(nip)})</td>
        </tr>
      </table>

      <h3>Daftar Isi Perangkat Pembelajaran</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 36pt;">No</th>
            <th>Komponen Perangkat / Dokumen</th>
            <th style="width: 100pt;">Status Kelengkapan</th>
          </tr>
        </thead>
        <tbody>
          ${docRows}
        </tbody>
      </table>
    `;

    return buildStandardWordHtml({
      title: `Cover & Daftar Perangkat RPM - ${mapel} ${kelas}`,
      bodyHtml,
    });
  };

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomLogoUrl(reader.result as string);
        setLogoType('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper render logo official
  const renderLogoEmblem = () => {
    if (logoType === 'custom' && customLogoUrl) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={customLogoUrl} alt="Logo Sekolah" className="w-16 h-16 object-contain" />;
    }
    if (logoType === 'garuda') {
      return (
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-1 flex items-center justify-center shadow-md">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center border border-amber-300">
            <span className="text-2xl">🦅</span>
          </div>
        </div>
      );
    }
    if (logoType === 'prestasi') {
      return (
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-1 flex items-center justify-center shadow-md">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center border border-blue-200 text-blue-700">
            <Award className="w-9 h-9" />
          </div>
        </div>
      );
    }
    // Default: Tut Wuri Handayani / Kemendikbud Style Emblem
    return (
      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-700 via-cyan-600 to-indigo-700 p-1 flex items-center justify-center shadow-lg shadow-blue-500/20">
        <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center border-2 border-blue-300 text-blue-900">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-black shadow-xs">
            🎓
          </div>
          <span className="text-[6.5px] font-black uppercase tracking-tighter text-blue-900 mt-0.5">TUT WURI</span>
        </div>
      </div>
    );
  };

  // Helper render 3D Educational Artwork
  const render3DArtwork = () => {
    if (ilustrasiTheme === 'pjok_sports') {
      return (
        <div className="w-full h-[230px] rounded-2xl bg-gradient-to-b from-sky-100 via-emerald-50 to-blue-50 border border-sky-200/90 shadow-md relative overflow-hidden flex items-center justify-center p-4">
          {/* 3D Lighting & Backdrop Spheres */}
          <div className="absolute -top-10 -left-10 w-44 h-44 bg-cyan-400/25 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute top-4 right-6 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 opacity-60 blur-xs"></div>

          {/* Central 3D Sport & Learning Composition */}
          <div className="relative z-10 flex items-center justify-around w-full max-w-[420px]">
            {/* Student 1: Indonesian Student Athlete Boy */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-xl shadow-emerald-500/30 transform -rotate-3 hover:rotate-0 transition-transform flex items-center justify-center">
                <div className="w-full h-full rounded-xl bg-slate-900/10 flex flex-col items-center justify-center text-white backdrop-blur-xs relative overflow-hidden">
                  <div className="text-4xl mb-0.5">🏃‍♂️</div>
                  <span className="text-[8px] font-extrabold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded-full">Kinestetik</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1.5 bg-white/80 px-2 py-0.5 rounded-full shadow-2xs">Siswa Aktif</span>
            </div>

            {/* Center Dynamic 3D Element: Trophy, Soccer Ball & Digital Tablet */}
            <div className="flex flex-col items-center -mt-2">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-1.5 shadow-2xl shadow-blue-500/40 flex items-center justify-center animate-pulse">
                <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center shadow-inner relative">
                  <div className="text-4xl">⚽</div>
                  <div className="absolute -bottom-1 text-xs font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300 shadow-xs flex items-center gap-1">
                    <span>🏆</span> 3D PJOK
                  </div>
                </div>
              </div>
              {/* Badges / Floating Props */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                  ⚡ Kebugaran
                </span>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 shadow-2xs">
                  🤝 Kolaborasi
                </span>
              </div>
            </div>

            {/* Student 2: Indonesian Student Athlete Girl */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 p-1 shadow-xl shadow-purple-500/30 transform rotate-3 hover:rotate-0 transition-transform flex items-center justify-center">
                <div className="w-full h-full rounded-xl bg-slate-900/10 flex flex-col items-center justify-center text-white backdrop-blur-xs relative overflow-hidden">
                  <div className="text-4xl mb-0.5">🤾‍♀️</div>
                  <span className="text-[8px] font-extrabold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded-full">Sportif</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1.5 bg-white/80 px-2 py-0.5 rounded-full shadow-2xs">Siswa Ceria</span>
            </div>
          </div>

          {/* Bottom Floating Academic Tools */}
          <div className="absolute bottom-2 left-6 right-6 flex items-center justify-between text-[9px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
              📊 TKJI & Radar Kebugaran
            </span>
            <span className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
              🎯 Deep Learning (Mindful & Joyful)
            </span>
          </div>
        </div>
      );
    }

    if (ilustrasiTheme === 'stem_science') {
      return (
        <div className="w-full h-[230px] rounded-2xl bg-gradient-to-b from-teal-100 via-indigo-50 to-blue-50 border border-teal-200 shadow-md relative overflow-hidden flex items-center justify-center p-4">
          <div className="absolute -top-10 -left-10 w-44 h-44 bg-teal-400/25 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-around w-full max-w-[420px]">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-1 shadow-xl flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-white/30 flex flex-col items-center justify-center text-3xl">🔬</div>
            </div>
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 p-1.5 shadow-2xl flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center text-4xl">🧬</div>
            </div>
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 p-1 shadow-xl flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-white/30 flex flex-col items-center justify-center text-3xl">🪐</div>
            </div>
          </div>
        </div>
      );
    }

    // Default Academic & Digital Classroom
    return (
      <div className="w-full h-[230px] rounded-2xl bg-gradient-to-b from-blue-100 via-indigo-50 to-purple-50 border border-blue-200 shadow-md relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute -top-10 -left-10 w-44 h-44 bg-blue-400/25 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex items-center justify-around w-full max-w-[420px]">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 p-1 shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-xl bg-white/30 flex flex-col items-center justify-center text-3xl">💻</div>
          </div>
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 p-1.5 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center text-4xl">📚</div>
          </div>
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-400 p-1 shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-xl bg-white/30 flex flex-col items-center justify-center text-3xl">💡</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-purple-950 border border-blue-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 text-white font-black shadow-lg shadow-blue-500/20">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Paket Dokumen Resmi &bull; Cover Premium &bull; Frame Isi Halaman A4
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Generator Cover & Frame Halaman RPM
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Rancang cover dokumen <strong className="text-blue-300">Rencana Pembelajaran Mendalam (RPM) / Kurikulum Merdeka</strong> berstandar studio desain grafis profesional, lengkap dengan <strong className="text-purple-300">Frame/Border Halaman Isi</strong> yang konsisten (area tulis luas 90-95%) siap cetak 300 DPI dan ekspor Gambar HD.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto shrink-0 no-print">
            <button
              onClick={handleExportAll}
              disabled={isExporting}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Merender HD...' : 'Download Paket HD (.PNG)'}</span>
            </button>
            <DocumentExportToolbar
              title={`Cover_RPM_${mapel}_${kelas}`}
              filenameBase={`Cover_RPM_${mapel}_${kelas}`}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Form Parameters (5 cols) vs Canvas Preview (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-4 no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <h2 className="font-bold text-sm text-white">Data Input Cover & Frame</h2>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full font-medium">
                Resmi & Proporsional
              </span>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Muat Contoh Cepat:</span>
                <span className="text-[10px] text-slate-500">1-Klik</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COVER_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-colors font-medium cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Data: MAPEL & KELAS */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Mata Pelajaran (MAPEL)
                </label>
                <input
                  type="text"
                  value={mapel}
                  onChange={(e) => setMapel(e.target.value)}
                  placeholder="Contoh: PJOK"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none font-bold text-blue-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Kelas
                </label>
                <input
                  type="text"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  placeholder="Contoh: V (LIMA)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  value={tahunAjaran}
                  onChange={(e) => setTahunAjaran(e.target.value)}
                  placeholder="Contoh: 2026/2027"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Nama Satuan Pendidikan (NAMA_SEKOLAH)
                </label>
                <input
                  type="text"
                  value={namaSekolah}
                  onChange={(e) => setNamaSekolah(e.target.value)}
                  placeholder="Contoh: SD NEGERI KALIMANTONG"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none uppercase font-semibold"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Nama Guru (NAMA_GURU)
                </label>
                <input
                  type="text"
                  value={namaGuru}
                  onChange={(e) => setNamaGuru(e.target.value)}
                  placeholder="Contoh: Ahmad Faisal, S.Pd."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  NIP Guru (NIP)
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="19880724 201503 1 003"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Logo Options */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <label className="text-[11px] font-medium text-slate-300 block">
                Pilihan Logo Sekolah di Atas:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLogoType('kemendikbud')}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                    logoType === 'kemendikbud' ? 'bg-blue-500/20 border-blue-500 text-blue-200' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-base">🎓</span>
                  <span className="font-bold text-[11px]">Tut Wuri / Resmi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLogoType('garuda')}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                    logoType === 'garuda' ? 'bg-blue-500/20 border-blue-500 text-blue-200' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-base">🦅</span>
                  <span className="font-bold text-[11px]">Garuda Pancasila</span>
                </button>

                <label className="col-span-2 p-2 rounded-xl border border-dashed border-slate-700 bg-slate-950 hover:bg-slate-900 cursor-pointer flex items-center justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>Unggah Logo Kustom Sekolah (.png / .jpg)</span>
                  </span>
                  <input type="file" accept="image/*" onChange={handleCustomLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Tema Ilustrasi 3D */}
            <div className="space-y-1 text-xs">
              <label className="text-[11px] font-medium text-slate-300 block">
                Tema Ilustrasi 3D Pixar / Disney-style:
              </label>
              <select
                value={ilustrasiTheme}
                onChange={(e) => setIlustrasiTheme(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="pjok_sports">⚽ PJOK Olahraga & Siswa Ceria Indonesia</option>
                <option value="stem_science">🔬 Sains, IPAS, Mikroskop & Alam</option>
                <option value="digital_classroom">💻 Kelas Digital, AI & Laptop Siswa</option>
              </select>
            </div>
          </div>

          {/* Tips Standar Desain Resmi */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Kepatuhan Standar Prompt Desain:
            </span>
            <p className="text-[11px] leading-relaxed">
              Desain mempertahankan estetika premium studio dengan hierarki visual teratur: Logo &rarr; Dinas & Sekolah &rarr; Panel Kapsul Biru &rarr; Ilustrasi 3D &rarr; Kartu Identitas Guru &rarr; 8 Dokumen Checklist &rarr; Frame halaman isi berselaras (90-95% ruang tulis bebas).
            </p>
          </div>
        </div>

        {/* Right Column: Canvas Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 no-print">
            {/* View Selector Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('cover')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'cover'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Cover RPM A4</span>
              </button>

              <button
                onClick={() => setActiveTab('frame')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'frame'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Frame className="w-3.5 h-3.5" />
                <span>Frame Isi Halaman (90-95%)</span>
              </button>

              <button
                onClick={() => setActiveTab('both')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'both'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Paket Lengkap</span>
              </button>
            </div>

            {/* Frame Guide Toggle (if activeTab is frame) */}
            {activeTab !== 'cover' && (
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                <span className="text-slate-500 mr-1 hidden sm:inline">Isi:</span>
                <button
                  onClick={() => setFrameGuideMode('blank')}
                  className={`px-2 py-0.5 rounded ${frameGuideMode === 'blank' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  Polos
                </button>
                <button
                  onClick={() => setFrameGuideMode('lined')}
                  className={`px-2 py-0.5 rounded ${frameGuideMode === 'lined' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  Garis
                </button>
                <button
                  onClick={() => setFrameGuideMode('grid')}
                  className={`px-2 py-0.5 rounded ${frameGuideMode === 'grid' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  Grid
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs text-slate-300">
              <button
                onClick={() => setZoomScale(Math.max(0.5, zoomScale - 0.1))}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                title="Perkecil"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-10 text-center font-bold text-blue-400">
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

            {/* Download Button for Active Canvas */}
            <button
              onClick={() => {
                if (activeTab === 'frame') {
                  handleExportSingle(frameRef, `Frame_Isi_${mapel.replace(/\s+/g, '_')}`);
                } else {
                  handleExportSingle(coverRef, `Cover_RPM_${mapel.replace(/\s+/g, '_')}`);
                }
              }}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-blue-600/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Gambar (.PNG)</span>
            </button>
          </div>

          {/* Canvas Wrapper */}
          <div className="overflow-x-auto p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col items-center justify-start min-h-[900px]">
            <div 
              style={{ 
                transform: `scale(${zoomScale})`, 
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out'
              }}
              className="flex flex-col items-center space-y-10"
            >
              {/* ======================================================== */}
              {/* 1. COVER DOKUMEN RPM (A4 PORTRAIT: 210mm x 297mm) */}
              {/* ======================================================== */}
              {(activeTab === 'cover' || activeTab === 'both') && (
                <div
                  ref={coverRef}
                  className="w-[210mm] min-h-[297mm] bg-white text-slate-800 p-[12mm] shadow-2xl rounded-sm box-border relative flex flex-col justify-between overflow-hidden"
                  style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
                >
                  {/* Decorative Geometric Corner Ornaments (Ungu-Biru Gradient Corner) */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-600/15 to-transparent pointer-events-none rounded-br-full"></div>
                  <div className="absolute bottom-0 right-0 w-52 h-52 bg-gradient-to-tl from-purple-700/20 via-blue-600/15 to-transparent pointer-events-none rounded-tl-full"></div>
                  
                  {/* Thin Geometric Purple Border enclosing the page */}
                  <div className="absolute inset-[5mm] border-2 border-purple-300/80 rounded-2xl pointer-events-none shadow-xs">
                    {/* Inner corner accent markers */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-purple-600"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-purple-600"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-purple-600"></div>
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-purple-600"></div>
                  </div>

                  {/* Inner Page Content */}
                  <div className="relative z-10 flex flex-col justify-between h-full space-y-3.5">
                    {/* 1. Header: Logo Sekolah & Dinas Pendidikan */}
                    <div className="text-center flex flex-col items-center space-y-1.5 pt-1">
                      {renderLogoEmblem()}
                      <h4 className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mt-1">
                        DINAS PENDIDIKAN DAN KEBUDAYAAN
                      </h4>
                      <h2 className="text-base font-black tracking-tight text-slate-900 uppercase">
                        {namaSekolah || 'SD NEGERI KALIMANTONG'}
                      </h2>
                    </div>

                    {/* 2. Main Title in Blue Capsule / Rounded Pill (Second Visual Focus) */}
                    <div className="flex flex-col items-center">
                      <div className="w-full max-w-[500px] rounded-full bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 p-[3px] shadow-xl shadow-blue-500/25">
                        <div className="rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3.5 px-6 text-center text-white">
                          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider drop-shadow-sm leading-tight">
                            PERANGKAT PEMBELAJARAN
                          </h1>
                          <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-widest text-cyan-200 drop-shadow-sm mt-0.5">
                            KURIKULUM MERDEKA
                          </h2>
                        </div>
                      </div>

                      {/* Kelas & Tahun Ajaran */}
                      <div className="mt-2.5 text-center">
                        <span className="text-sm font-black text-slate-800 tracking-wide uppercase">
                          KELAS {kelas || 'V (LIMA)'}
                        </span>
                        <span className="mx-2 text-slate-400 font-bold">&bull;</span>
                        <span className="text-sm font-bold text-slate-600">
                          Tahun Ajaran {tahunAjaran || '2026/2027'}
                        </span>
                      </div>
                    </div>

                    {/* 3. Middle 3D Educational Artwork (Ultra Detailed 3D Pixar/Disney style) */}
                    <div className="px-2">
                      {render3DArtwork()}
                    </div>

                    {/* 4. White Modern Information Card with Soft Shadow (Identity Guru) */}
                    <div className="mx-2 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/50 flex flex-col justify-between">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        {/* Mata Pelajaran */}
                        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                            📖
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Mata Pelajaran</span>
                            <span className="font-extrabold text-slate-900 truncate block text-xs">
                              {mapel}
                            </span>
                          </div>
                        </div>

                        {/* Nama Guru */}
                        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                            👨‍🏫
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Nama Guru</span>
                            <span className="font-extrabold text-slate-900 truncate block text-xs">
                              {namaGuru}
                            </span>
                          </div>
                        </div>

                        {/* NIP */}
                        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                            🆔
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">NIP Guru</span>
                            <span className="font-mono font-bold text-slate-800 truncate block text-xs">
                              {nip || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5. Panel Daftar Dokumen with Modern Checklists */}
                    <div className="mx-2 p-3 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 border border-blue-200/80 shadow-2xs">
                      <div className="flex items-center justify-between mb-2 pb-1 border-b border-blue-200/60">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                          <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Daftar Dokumen Portofolio Perangkat Pembelajaran:</span>
                        </span>
                        <span className="text-[9px] font-bold text-blue-700 bg-white/80 px-2 py-0.5 rounded-full border border-blue-200">
                          Lengkap & Terverifikasi
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                        {daftarDokumen.map((doc, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/90 border border-slate-200/70 shadow-2xs text-slate-800"
                          >
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white font-extrabold text-[9px] flex items-center justify-center shrink-0">
                              ✓
                            </span>
                            <span className="font-semibold truncate text-[9.5px] leading-tight">
                              {doc}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* 2. FRAME / BORDER HALAMAN ISI DOKUMEN (A4 PORTRAIT) */}
              {/* ======================================================== */}
              {(activeTab === 'frame' || activeTab === 'both') && (
                <div
                  ref={frameRef}
                  className="w-[210mm] min-h-[297mm] bg-white text-slate-800 shadow-2xl rounded-sm box-border relative flex flex-col justify-between overflow-hidden"
                  style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
                >
                  {/* Top Layered Frame: Gradient Wave & Abstract Geometric Accents */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                  
                  {/* Thin Purple Geometric Border (Identical to cover design for consistency) */}
                  <div className="absolute inset-[6mm] border-2 border-purple-300/80 rounded-2xl pointer-events-none shadow-xs">
                    {/* Inner Corner Accent Markers */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-purple-600"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-purple-600"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-purple-600"></div>
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-purple-600"></div>
                  </div>

                  {/* Corner Gradient Accent on Bottom-Right (identical to cover) */}
                  <div className="absolute bottom-0 right-0 w-36 h-36 bg-gradient-to-tl from-purple-700/15 via-blue-600/10 to-transparent pointer-events-none rounded-tl-full"></div>

                  {/* Top Header Strip inside frame (minimal, leaves 90-95% empty) */}
                  <div className="pt-[10mm] px-[12mm] flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-100 pb-2 z-10">
                    <span className="font-bold text-blue-900 uppercase tracking-tight">
                      {namaSekolah || 'SATUAN PENDIDIKAN'} &bull; {mapel}
                    </span>
                    <span className="font-semibold">
                      Kelas {kelas} &bull; TA {tahunAjaran}
                    </span>
                  </div>

                  {/* CENTRAL BLANK WRITING AREA (±90–95% OF THE PAGE, PURE WHITE) */}
                  <div className="flex-1 my-2 mx-[12mm] relative z-0 flex flex-col justify-start">
                    {frameGuideMode === 'blank' && (
                      <div className="w-full h-full flex items-center justify-center text-slate-300/40 select-none pointer-events-none text-xs">
                        {/* 100% Blank Clean Space ready for printing & document content */}
                      </div>
                    )}

                    {frameGuideMode === 'lined' && (
                      <div className="w-full h-full space-y-6 pt-4 opacity-40 pointer-events-none select-none">
                        {Array.from({ length: 26 }).map((_, i) => (
                          <div key={i} className="border-b border-slate-300 h-1"></div>
                        ))}
                      </div>
                    )}

                    {frameGuideMode === 'grid' && (
                      <div 
                        className="w-full h-full opacity-25 pointer-events-none select-none"
                        style={{
                          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                          backgroundSize: '15px 15px'
                        }}
                      ></div>
                    )}
                  </div>

                  {/* Bottom Footer Strip inside frame (minimal) */}
                  <div className="pb-[9mm] px-[12mm] flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-100 pt-2 z-10">
                    <span className="italic">
                      Rencana Pembelajaran Mendalam (RPM) &bull; Kurikulum Merdeka
                    </span>
                    <span>
                      Guru: <strong>{namaGuru}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
