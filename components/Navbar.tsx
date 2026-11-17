'use client';

import { Activity, ShieldCheck, Flame, Volume2, VolumeX, UserCheck, BarChart3, Users, Sparkles, Printer, Dumbbell, FileSpreadsheet, Table, CalendarRange, CalendarDays, Calendar, BookOpen, FileCheck, Target, Palette, Presentation, FileEdit, BookMarked, FileImage, GraduationCap, LayoutGrid, BookmarkCheck, FileCheck2, ListChecks, FileBadge, LogOut } from 'lucide-react';
import { Kelas } from '@/lib/types';
import { playWhistleSound } from '@/lib/audio';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  classes: Kelas[];
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  isSessionActive: boolean;
  sessionElapsedSec: number;
  onOpenPrintModal: () => void;
  onLogout?: () => void;
}

export function Navbar({
  currentTab,
  setCurrentTab,
  classes,
  selectedClassId,
  setSelectedClassId,
  soundEnabled,
  setSoundEnabled,
  isSessionActive,
  sessionElapsedSec,
  onOpenPrintModal,
  onLogout,
}: NavbarProps) {
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const navItems = [
    { id: 'tracker', label: 'Pantau Lapangan (Live)', icon: Activity },
    { id: 'tkji', label: 'Tes Kebugaran TKJI', icon: ShieldCheck },
    { id: 'presensi', label: 'Presensi & Jurnal', icon: UserCheck },
    { id: 'analytics', label: 'Analisis & Statistik', icon: BarChart3 },
    { id: 'siswa', label: 'Data Siswa', icon: Users },
    { id: 'cp-atp', label: 'Generator CP-ATP', icon: FileSpreadsheet },
    { id: 'tp-kktp', label: 'TP - KKTP', icon: Table },
    { id: 'rpe', label: 'Rincian Pekan Efektif', icon: CalendarRange },
    { id: 'prota', label: 'Generator PROTA', icon: CalendarDays },
    { id: 'prosem', label: 'Generator PROSEM', icon: Calendar },
    { id: 'materi-ajar', label: 'Materi Ajar v1', icon: GraduationCap },
    { id: 'materi-infografis', label: 'Infografis Materi', icon: LayoutGrid },
    { id: 'cover-frame', label: 'Cover & Frame RPM', icon: BookmarkCheck },
    { id: 'rpm', label: 'Generator RPM 1 BAB', icon: BookOpen },
    { id: 'rpm-pertemuan', label: 'RPM 1 Pertemuan', icon: FileCheck },
    { id: 'rpm-tp', label: 'RPM 1 TP', icon: Target },
    { id: 'rpm-visual', label: 'RPM Visual Menarik (Gambar HD)', icon: Palette },
    { id: 'slide-canva', label: 'Slide Canva & PPTX', icon: Presentation },
    { id: 'lkpd', label: 'Generator LKPD', icon: FileEdit },
    { id: 'lkpd-deep-learning', label: 'LKPD Deep Learning', icon: BookMarked },
    { id: 'lkpd-visual', label: 'LKPD ke Gambar HD', icon: FileImage },
    { id: 'asesmen-sumatif', label: 'Asesmen Sumatif', icon: FileCheck2 },
    { id: 'soal-v2', label: 'Generator Soal v2', icon: ListChecks },
    { id: 'kartu-soal', label: 'Kartu Soal Sumatif', icon: FileBadge },
    { id: 'ai-coach', label: 'Asisten AI PJOK', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg no-print">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl tracking-wider">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  SADARPJOK
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Real-Time & Sistematis
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Sistem Pemantauan Aktivitas & Kebugaran Olahraga Siswa
              </p>
            </div>
          </div>

          {/* Center Class Selector & Live Tracker Indicator */}
          <div className="flex items-center gap-3">
            {isSessionActive && (
              <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 px-3 py-1.5 rounded-lg animate-pulse">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-300 hidden md:inline">SESI AKTIF:</span>
                <span className="text-xs font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  {formatTimer(sessionElapsedSec)}
                </span>
              </div>
            )}

            {/* Class Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 font-medium">Kelas:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-100 outline-none cursor-pointer pr-2"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id} className="bg-slate-800 text-slate-100">
                    {cls.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Whistle Test Button */}
            <button
              onClick={() => {
                if (soundEnabled) playWhistleSound(false);
              }}
              title="Tiup Peluit Wasit (Audio Feedback)"
              className="hidden sm:flex items-center gap-1 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Peluit</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Matikan Suara Audio' : 'Aktifkan Suara Audio'}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Print Card Button */}
            <button
              onClick={onOpenPrintModal}
              title="Cetak Rapor Kebugaran Siswa"
              className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg shadow-sm shadow-emerald-600/30 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cetak Rapor</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Keluar dari akun"
                className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-rose-500/15 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
