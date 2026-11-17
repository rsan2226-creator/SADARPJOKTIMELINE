'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  Activity, ShieldCheck, Sparkles, Dumbbell, Table, CalendarRange, CalendarDays, Calendar, BookOpen, FileCheck, Target, Palette, Presentation, FileEdit, BookMarked, FileImage, GraduationCap, LayoutGrid, BookmarkCheck, FileCheck2, ListChecks, FileBadge, Database
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { LiveFieldTracker } from '@/components/LiveFieldTracker';

const TabLoading = () => (
  <div className="flex items-center justify-center py-20 text-slate-400 text-sm font-medium">
    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3" />
    <span>Memuat modul...</span>
  </div>
);

const TkjiModule = dynamic(() => import('@/components/TkjiModule').then((m) => m.TkjiModule), { ssr: false, loading: TabLoading });
const AttendanceModule = dynamic(() => import('@/components/AttendanceModule').then((m) => m.AttendanceModule), { ssr: false, loading: TabLoading });
const AnalyticsDashboard = dynamic(() => import('@/components/AnalyticsDashboard').then((m) => m.AnalyticsDashboard), { ssr: false, loading: TabLoading });
const StudentRoster = dynamic(() => import('@/components/StudentRoster').then((m) => m.StudentRoster), { ssr: false, loading: TabLoading });
const AiFitnessAdvisor = dynamic(() => import('@/components/AiFitnessAdvisor').then((m) => m.AiFitnessAdvisor), { ssr: false, loading: TabLoading });
const CpAtpGenerator = dynamic(() => import('@/components/CpAtpGenerator').then((m) => m.CpAtpGenerator), { ssr: false, loading: TabLoading });
const KktpGenerator = dynamic(() => import('@/components/KktpGenerator').then((m) => m.KktpGenerator), { ssr: false, loading: TabLoading });
const RpeGenerator = dynamic(() => import('@/components/RpeGenerator').then((m) => m.RpeGenerator), { ssr: false, loading: TabLoading });
const ProtaGenerator = dynamic(() => import('@/components/ProtaGenerator').then((m) => m.ProtaGenerator), { ssr: false, loading: TabLoading });
const ProsemGenerator = dynamic(() => import('@/components/ProsemGenerator').then((m) => m.ProsemGenerator), { ssr: false, loading: TabLoading });
const MateriAjarGenerator = dynamic(() => import('@/components/MateriAjarGenerator').then((m) => m.MateriAjarGenerator), { ssr: false, loading: TabLoading });
const InfografisMateriGenerator = dynamic(() => import('@/components/InfografisMateriGenerator').then((m) => m.InfografisMateriGenerator), { ssr: false, loading: TabLoading });
const CoverFrameGenerator = dynamic(() => import('@/components/CoverFrameGenerator').then((m) => m.CoverFrameGenerator), { ssr: false, loading: TabLoading });
const RpmGenerator = dynamic(() => import('@/components/RpmGenerator').then((m) => m.RpmGenerator), { ssr: false, loading: TabLoading });
const RpmPertemuanGenerator = dynamic(() => import('@/components/RpmPertemuanGenerator').then((m) => m.RpmPertemuanGenerator), { ssr: false, loading: TabLoading });
const RpmTpGenerator = dynamic(() => import('@/components/RpmTpGenerator').then((m) => m.RpmTpGenerator), { ssr: false, loading: TabLoading });
const RpmVisualGenerator = dynamic(() => import('@/components/RpmVisualGenerator').then((m) => m.RpmVisualGenerator), { ssr: false, loading: TabLoading });
const SlidePresentationGenerator = dynamic(() => import('@/components/SlidePresentationGenerator').then((m) => m.SlidePresentationGenerator), { ssr: false, loading: TabLoading });
const LkpdGenerator = dynamic(() => import('@/components/LkpdGenerator').then((m) => m.LkpdGenerator), { ssr: false, loading: TabLoading });
const DeepLearningLkpdGenerator = dynamic(() => import('@/components/DeepLearningLkpdGenerator').then((m) => m.DeepLearningLkpdGenerator), { ssr: false, loading: TabLoading });
const LkpdVisualImageGenerator = dynamic(() => import('@/components/LkpdVisualImageGenerator').then((m) => m.LkpdVisualImageGenerator), { ssr: false, loading: TabLoading });
const AsesmenSumatifGenerator = dynamic(() => import('@/components/AsesmenSumatifGenerator').then((m) => m.AsesmenSumatifGenerator), { ssr: false, loading: TabLoading });
const SoalV2Generator = dynamic(() => import('@/components/SoalV2Generator').then((m) => m.SoalV2Generator), { ssr: false, loading: TabLoading });
const KartuSoalGenerator = dynamic(() => import('@/components/KartuSoalGenerator').then((m) => m.KartuSoalGenerator), { ssr: false, loading: TabLoading });
const PrintReportModal = dynamic(() => import('@/components/PrintReportModal').then((m) => m.PrintReportModal), { ssr: false });
const SupabaseSetupModal = dynamic(() => import('@/components/SupabaseSetupModal').then((m) => m.SupabaseSetupModal), { ssr: false });
import { 
  INITIAL_CLASSES, INITIAL_STUDENTS, INITIAL_TKJI, 
  INITIAL_PRESENSI, INITIAL_JURNAL, loadData, saveData 
} from '@/lib/mock-data';
import {
  fetchAllSadarpjokData,
  subscribeToSadarpjokRealtime,
  upsertStudentInDb,
  deleteStudentInDb,
  upsertTkjiInDb,
  upsertPresensiInDb,
  upsertJurnalInDb,
  upsertLiveSessionInDb,
} from '@/lib/supabase-db';
import { Kelas, Siswa, TesKebugaranTKJI, PresensiHarian, JurnalMengajar, LiveSession } from '@/lib/types';

interface SadarpjokDashboardProps {
  onLogout: () => void;
}

export function SadarpjokDashboard({ onLogout }: SadarpjokDashboardProps) {
  const [classes, setClasses] = useState<Kelas[]>(() => loadData('classes', INITIAL_CLASSES));
  const [selectedClassId, setSelectedClassId] = useState<string>('k-4a');
  const [students, setStudents] = useState<Siswa[]>(() => loadData('students', INITIAL_STUDENTS));
  const [tkjiRecords, setTkjiRecords] = useState<TesKebugaranTKJI[]>(() => loadData('tkji', INITIAL_TKJI));
  const [presensiList, setPresensiList] = useState<PresensiHarian[]>(() => loadData('presensi', INITIAL_PRESENSI));
  const [jurnalList, setJurnalList] = useState<JurnalMengajar[]>(() => loadData('jurnal', INITIAL_JURNAL));

  const [currentTab, setCurrentTab] = useState<string>('tracker');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [sessionElapsedSec] = useState<number>(0);

  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
  const [printSelectedStudentId, setPrintSelectedStudentId] = useState<string>('');
  const [aiContext, setAiContext] = useState<Record<string, unknown> | undefined>(undefined);
  const [needsSchemaSetup, setNeedsSchemaSetup] = useState<boolean>(false);
  const [setupModalOpen, setSetupModalOpen] = useState<boolean>(false);

  const applySupabaseResult = useCallback((res: Awaited<ReturnType<typeof fetchAllSadarpjokData>>) => {
    if (res.schemaReady) {
      setNeedsSchemaSetup(false);
      setSetupModalOpen(false);
      if (res.classes.length > 0) {
        setClasses(res.classes);
        saveData('classes', res.classes);
      }
      setStudents(res.students);
      saveData('students', res.students);
      setTkjiRecords(res.tkjiRecords);
      saveData('tkji', res.tkjiRecords);
      setPresensiList(res.presensiList);
      saveData('presensi', res.presensiList);
      setJurnalList(res.jurnalList);
      saveData('jurnal', res.jurnalList);
    } else {
      setNeedsSchemaSetup(true);
    }
  }, []);

  const syncFromSupabase = useCallback(async () => {
    const res = await fetchAllSadarpjokData();
    applySupabaseResult(res);
  }, [applySupabaseResult]);

  useEffect(() => {
    let active = true;
    fetchAllSadarpjokData().then((res) => {
      if (active) applySupabaseResult(res);
    });
    const unsubscribe = subscribeToSadarpjokRealtime({
      onDataChange: () => {
        fetchAllSadarpjokData().then((res) => {
          if (active) applySupabaseResult(res);
        });
      },
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [applySupabaseResult]);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.kelasId === selectedClassId);

  const handleSaveTKJIRecord = (record: TesKebugaranTKJI) => {
    const updated = tkjiRecords.some((r) => r.id === record.id)
      ? tkjiRecords.map((r) => (r.id === record.id ? record : r))
      : [...tkjiRecords, record];
    setTkjiRecords(updated);
    saveData('tkji', updated);
    void upsertTkjiInDb(record);
  };

  const handleSavePresensi = (presensi: PresensiHarian) => {
    const updated = [presensi, ...presensiList.filter((p) => p.id !== presensi.id)];
    setPresensiList(updated);
    saveData('presensi', updated);
    void upsertPresensiInDb(presensi);
  };

  const handleSaveJurnal = (jurnal: JurnalMengajar) => {
    const updated = [jurnal, ...jurnalList];
    setJurnalList(updated);
    saveData('jurnal', updated);
    void upsertJurnalInDb(jurnal);
  };

  const handleAddStudent = (siswa: Siswa) => {
    const updated = [...students, siswa];
    setStudents(updated);
    saveData('students', updated);
    void upsertStudentInDb(siswa);
  };

  const handleUpdateStudent = (siswa: Siswa) => {
    const updated = students.map((s) => (s.id === siswa.id ? siswa : s));
    setStudents(updated);
    saveData('students', updated);
    void upsertStudentInDb(siswa);
  };

  const handleDeleteStudent = (id: string) => {
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    saveData('students', updated);
    void deleteStudentInDb(id);
  };

  const handleSaveSessionLog = (session: LiveSession) => {
    void upsertLiveSessionInDb(session);
    const newJurnal: JurnalMengajar = {
      id: `jrn-${Date.now()}`,
      tanggal: new Date().toISOString().split('T')[0],
      kelasId: selectedClassId,
      materi: session.judulMateri,
      faseKurikulum: `Fase ${currentClass.tingkat <= 4 ? 'B' : 'C'} (${currentClass.nama})`,
      elemenCapaian: 'Keterampilan Gerak & Kebugaran Jasmani',
      tujuanPembelajaran: `Melaksanakan latihan ${session.jenisAktivitas} dengan target ${session.targetLaps} putaran.`,
      ringkasanAktivitas: `Durasi ${Math.round(session.elapsedSeconds / 60)} menit. Rata-rata ${
        session.students.length > 0
          ? (session.students.reduce((a, b) => a + b.lapsCount, 0) / session.students.length).toFixed(1)
          : '0'
      } putaran.`,
      kendalaDanSolusi: session.notes,
    };
    handleSaveJurnal(newJurnal);
    setIsSessionActive(false);
  };

  const handleOpenPrintForStudent = (siswa: Siswa) => {
    setPrintSelectedStudentId(siswa.id);
    setPrintModalOpen(true);
  };

  const handleTriggerAIForStudent = (siswa: Siswa) => {
    setAiContext({ siswaId: siswa.id });
    setCurrentTab('ai-coach');
  };

  const handleTriggerAISession = (sessionData: Record<string, unknown>) => {
    setAiContext(sessionData);
    setCurrentTab('ai-coach');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        classes={classes}
        selectedClassId={selectedClassId}
        setSelectedClassId={setSelectedClassId}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        isSessionActive={isSessionActive}
        sessionElapsedSec={sessionElapsedSec}
        onOpenPrintModal={() => setPrintModalOpen(true)}
        onLogout={onLogout}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80 no-print">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>SADARPJOK • Kurikulum Merdeka Terintegrasi</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
                Pantau Aktivitas Olahraga Siswa{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  Secara Real-Time & Sistematis
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Kelola sesi latihan lapangan secara live, catat putaran dan beban latihan (RPE), evaluasi baterai tes kebugaran jasmani Indonesia (TKJI), dan otomatisasi rapor fisik siswa dengan bantuan AI.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCurrentTab('tracker')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                <span>Mulai Sesi Lapangan</span>
              </button>

              <button
                onClick={() => setCurrentTab('cp-atp')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 font-bold text-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Generator CP-ATP Word</span>
              </button>

              <button
                onClick={() => setCurrentTab('tp-kktp')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition-all cursor-pointer"
              >
                <Table className="w-4 h-4 text-cyan-400" />
                <span>Tabel TP - KKTP Word</span>
              </button>

              <button
                onClick={() => setCurrentTab('rpe')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all cursor-pointer"
              >
                <CalendarRange className="w-4 h-4 text-amber-400" />
                <span>Rincian Pekan Efektif (RPE)</span>
              </button>

              <button
                onClick={() => setCurrentTab('prota')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition-all cursor-pointer"
              >
                <CalendarDays className="w-4 h-4 text-indigo-400" />
                <span>Generator PROTA Word</span>
              </button>

              <button
                onClick={() => setCurrentTab('prosem')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-rose-400" />
                <span>Generator PROSEM Word</span>
              </button>

              <button
                onClick={() => setCurrentTab('materi-ajar')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 font-bold text-xs transition-all cursor-pointer shadow-sm"
              >
                <GraduationCap className="w-4 h-4 text-teal-400" />
                <span>Materi Ajar v1</span>
              </button>

              <button
                onClick={() => setCurrentTab('materi-infografis')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition-all cursor-pointer shadow-sm"
              >
                <LayoutGrid className="w-4 h-4 text-cyan-400" />
                <span>Materi Infografis</span>
              </button>

              <button
                onClick={() => setCurrentTab('cover-frame')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 font-bold text-xs transition-all cursor-pointer shadow-sm"
              >
                <BookmarkCheck className="w-4 h-4 text-blue-400" />
                <span>Cover & Frame RPM</span>
              </button>

              <button
                onClick={() => setCurrentTab('rpm')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-bold text-xs transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Generator RPM 1 BAB Word</span>
              </button>

              <button
                onClick={() => setCurrentTab('rpm-pertemuan')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition-all cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <span>RPM 1 Pertemuan Word</span>
              </button>

              <button
                onClick={() => setCurrentTab('rpm-tp')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition-all cursor-pointer"
              >
                <Target className="w-4 h-4 text-emerald-400" />
                <span>RPM 1 TP Word</span>
              </button>

              <button
                onClick={() => setCurrentTab('rpm-visual')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-bold text-xs transition-all cursor-pointer shadow-sm"
              >
                <Palette className="w-4 h-4 text-purple-400" />
                <span>RPM Visual Menarik (Gambar HD)</span>
              </button>

              <button
                onClick={() => setCurrentTab('slide-canva')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 font-bold text-xs transition-all cursor-pointer shadow-sm"
              >
                <Presentation className="w-4 h-4 text-teal-400" />
                <span>Slide Canva & PPTX</span>
              </button>

              <button
                onClick={() => setCurrentTab('lkpd')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition-all cursor-pointer shadow-sm"
              >
                <FileEdit className="w-4 h-4 text-emerald-400" />
                <span>Generator LKPD</span>
              </button>

              <button
                onClick={() => setCurrentTab('lkpd-deep-learning')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 font-bold text-xs transition-all cursor-pointer shadow-sm"
              >
                <BookMarked className="w-4 h-4 text-teal-400" />
                <span>LKPD Deep Learning</span>
              </button>

              <button
                onClick={() => setCurrentTab('lkpd-visual')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-200 border border-teal-500/40 font-bold text-xs transition-all cursor-pointer shadow-sm"
              >
                <FileImage className="w-4 h-4 text-teal-400" />
                <span>LKPD ke Gambar HD</span>
              </button>

              <button
                onClick={() => setCurrentTab('asesmen-sumatif')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition-all cursor-pointer shadow-sm"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Asesmen Sumatif (Word 2 Kolom)</span>
              </button>

              <button
                onClick={() => setCurrentTab('soal-v2')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 font-bold text-xs transition-all cursor-pointer shadow-sm"
              >
                <ListChecks className="w-4 h-4 text-blue-400" />
                <span>Generator Soal v2 (Berbasis TP)</span>
              </button>

              <button
                onClick={() => setCurrentTab('kartu-soal')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all cursor-pointer shadow-sm"
              >
                <FileBadge className="w-4 h-4 text-amber-400" />
                <span>Kartu Soal Sumatif (Sesuai Format)</span>
              </button>

              <button
                onClick={() => setCurrentTab('tkji')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Uji TKJI Siswa</span>
              </button>

              {needsSchemaSetup && (
                <button
                  onClick={() => setSetupModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition-all cursor-pointer"
                >
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Setup Tabel Supabase</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'tracker' && (
          <LiveFieldTracker
            key={selectedClassId}
            students={classStudents}
            selectedClassId={selectedClassId}
            classNameTitle={currentClass.nama}
            soundEnabled={soundEnabled}
            onSaveSessionLog={handleSaveSessionLog}
            onSyncLiveSession={(session) => void upsertLiveSessionInDb(session)}
            onSwitchToAIAnalysis={handleTriggerAISession}
          />
        )}

        {currentTab === 'tkji' && (
          <TkjiModule
            students={classStudents}
            tkjiRecords={tkjiRecords}
            selectedClassId={selectedClassId}
            classNameTitle={currentClass.nama}
            onSaveTKJIRecord={handleSaveTKJIRecord}
            onRequestAIStudentFeedback={handleTriggerAIForStudent}
            onPrintStudentCard={handleOpenPrintForStudent}
          />
        )}

        {currentTab === 'presensi' && (
          <AttendanceModule
            students={classStudents}
            selectedClassId={selectedClassId}
            classNameTitle={currentClass.nama}
            presensiList={presensiList}
            jurnalList={jurnalList}
            onSavePresensi={handleSavePresensi}
            onSaveJurnal={handleSaveJurnal}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsDashboard
            students={classStudents}
            tkjiRecords={tkjiRecords}
            classNameTitle={currentClass.nama}
            onSelectStudentDetail={handleTriggerAIForStudent}
            onRequestClassAIAdvice={() => {
              setAiContext({ mode: 'remedial_plan' });
              setCurrentTab('ai-coach');
            }}
          />
        )}

        {currentTab === 'siswa' && (
          <StudentRoster
            students={classStudents}
            tkjiRecords={tkjiRecords}
            selectedClassId={selectedClassId}
            classNameTitle={currentClass.nama}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onSelectStudentForAI={handleTriggerAIForStudent}
            onPrintStudentCard={handleOpenPrintForStudent}
          />
        )}

        {currentTab === 'cp-atp' && (
          <CpAtpGenerator
            currentClassGrade={currentClass.tingkat}
            classNameTitle={currentClass.nama}
          />
        )}

        {currentTab === 'tp-kktp' && (
          <KktpGenerator
            currentClassGrade={currentClass.tingkat}
            classNameTitle={currentClass.nama}
          />
        )}

        {currentTab === 'rpe' && <RpeGenerator />}
        {currentTab === 'prota' && <ProtaGenerator />}
        {currentTab === 'prosem' && <ProsemGenerator />}
        {currentTab === 'materi-ajar' && <MateriAjarGenerator />}
        {currentTab === 'materi-infografis' && <InfografisMateriGenerator />}
        {currentTab === 'cover-frame' && <CoverFrameGenerator />}
        {currentTab === 'rpm' && <RpmGenerator />}
        {currentTab === 'rpm-pertemuan' && <RpmPertemuanGenerator />}
        {currentTab === 'rpm-tp' && <RpmTpGenerator />}
        {currentTab === 'rpm-visual' && <RpmVisualGenerator />}
        {currentTab === 'slide-canva' && <SlidePresentationGenerator />}
        {currentTab === 'lkpd' && <LkpdGenerator />}
        {currentTab === 'lkpd-deep-learning' && <DeepLearningLkpdGenerator />}
        {currentTab === 'lkpd-visual' && <LkpdVisualImageGenerator />}
        {currentTab === 'asesmen-sumatif' && <AsesmenSumatifGenerator />}
        {currentTab === 'soal-v2' && <SoalV2Generator />}
        {currentTab === 'kartu-soal' && <KartuSoalGenerator />}

        {currentTab === 'ai-coach' && (
          <AiFitnessAdvisor
            students={classStudents}
            tkjiRecords={tkjiRecords}
            classNameTitle={currentClass.nama}
            initialContext={aiContext}
          />
        )}
      </main>

      {printModalOpen && (
        <PrintReportModal
          isOpen={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
          students={classStudents}
          tkjiRecords={tkjiRecords}
          currentClass={currentClass}
          selectedStudentId={printSelectedStudentId}
        />
      )}

      {setupModalOpen && (
        <SupabaseSetupModal
          isOpen={setupModalOpen}
          onClose={() => setSetupModalOpen(false)}
          onRetrySync={syncFromSupabase}
        />
      )}

      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-300">SADARPJOK</span>
            <span>—</span>
            <span>Sistem Pemantauan Aktivitas Olahraga Siswa Real-Time & Sistematis</span>
          </div>
          <div>
            Guru Pengampu: <strong className="text-slate-300">{currentClass.guruPJOK}</strong> • Standar TKJI Depdiknas
          </div>
        </div>
      </footer>
    </div>
  );
}
