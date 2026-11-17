'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, RotateCcw, Plus, Minus, Heart, Flame, ShieldAlert, 
  CheckCircle2, Clock, Footprints, AlertTriangle, UserCheck, 
  Sparkles, Save, BellRing, Settings2, Trophy, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Siswa, StudentLiveState, ActivityPhase, LiveSession } from '@/lib/types';
import { playWhistleSound, playLapBeep, playCountdownTick } from '@/lib/audio';
import { DocumentExportToolbar } from '@/components/DocumentExportToolbar';
import { buildStandardWordHtml, escapeHtml } from '@/lib/export-utils';

const getCurrentTimestamp = (): number => Date.now();

interface LiveFieldTrackerProps {
  students: Siswa[];
  selectedClassId: string;
  classNameTitle: string;
  soundEnabled: boolean;
  onSaveSessionLog: (session: LiveSession) => void;
  onSyncLiveSession?: (session: LiveSession) => void;
  onSwitchToAIAnalysis: (sessionData: Record<string, unknown>) => void;
}

export function LiveFieldTracker({
  students,
  selectedClassId,
  classNameTitle,
  soundEnabled,
  onSaveSessionLog,
  onSyncLiveSession,
  onSwitchToAIAnalysis,
}: LiveFieldTrackerProps) {
  // Session Configuration State
  const [topic, setTopic] = useState('Sirkuit Kebugaran Jasmani: Kelincahan & Daya Tahan');
  const [activityType, setActivityType] = useState<LiveSession['jenisAktivitas']>('Sirkuit Kebugaran');
  const [phase, setPhase] = useState<ActivityPhase>('pemanasan');
  const [targetLaps, setTargetLaps] = useState<number>(6);
  const [targetMinutes, setTargetMinutes] = useState<number>(30);
  const [lapDistanceMeters, setLapDistanceMeters] = useState<number>(100);

  // Timer State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number | null>(null);

  // Filter State
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Per-student live overrides keyed by siswaId
  const [studentOverrides, setStudentOverrides] = useState<Record<string, Partial<StudentLiveState>>>({});

  const liveStudents: StudentLiveState[] = useMemo(
    () =>
      students.map((s) => {
        const override = studentOverrides[s.id];
        return {
          siswaId: s.id,
          nama: s.nama,
          gender: s.gender,
          status: override?.status ?? 'aktif',
          lapsCount: override?.lapsCount ?? 0,
          estimatedHeartRate: override?.estimatedHeartRate ?? 95,
          rpeScore: override?.rpeScore ?? 4,
          lastUpdatedTime: override?.lastUpdatedTime ?? 0,
          notes:
            override?.notes !== undefined
              ? override.notes
              : s.catatanMedis
                ? `Catatan Medis: ${s.catatanMedis}`
                : undefined,
        };
      }),
    [students, studentOverrides]
  );

  const [showFinishModal, setShowFinishModal] = useState<boolean>(false);
  const [editingNoteStudentId, setEditingNoteStudentId] = useState<string | null>(null);
  const [studentNoteText, setStudentNoteText] = useState<string>('');

  const syncLiveToBackend = (updatedStudents: StudentLiveState[], runningOverride?: boolean, phaseOverride?: ActivityPhase) => {
    if (!onSyncLiveSession) return;
    onSyncLiveSession({
      id: `live-${selectedClassId}`,
      kelasId: selectedClassId,
      judulMateri: topic,
      jenisAktivitas: activityType,
      phase: phaseOverride ?? phase,
      startTime: sessionStartRef.current,
      elapsedSeconds,
      targetLaps,
      targetMinutes,
      lapDistanceMeters,
      students: updatedStudents,
      isTimerRunning: runningOverride ?? isRunning,
      notes: `Pemantauan langsung ${classNameTitle}`,
    });
  };

  // Stopwatch interval timer
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          // Interval beep every 5 minutes
          if (soundEnabled && next > 0 && next % 300 === 0) {
            playLapBeep(true);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, soundEnabled]);

  // Timer controls
  const handleStartTimer = () => {
    if (soundEnabled) playWhistleSound(false);
    if (!sessionStartRef.current) {
      sessionStartRef.current = getCurrentTimestamp();
    }
    setIsRunning(true);
    syncLiveToBackend(liveStudents, true);
  };

  const handlePauseTimer = () => {
    if (soundEnabled) playLapBeep(false);
    setIsRunning(false);
    syncLiveToBackend(liveStudents, false);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    sessionStartRef.current = null;
  };

  // Add / Subtract Lap for Individual Student
  const updateStudentLap = (siswaId: string, delta: number) => {
    const now = getCurrentTimestamp();
    const updated = liveStudents.map((s) => {
      if (s.siswaId !== siswaId) return s;
      const newLaps = Math.max(0, s.lapsCount + delta);

      // Dynamic heart rate & RPE estimation based on laps and phase
      const baseHr = phase === 'pemanasan' ? 115 : phase === 'inti' ? 140 : 105;
      const calculatedHr = Math.min(185, baseHr + newLaps * 3);
      const calculatedRpe = Math.min(10, Math.max(1, Math.round(3 + newLaps * 0.7)));

      return {
        ...s,
        lapsCount: newLaps,
        estimatedHeartRate: calculatedHr,
        rpeScore: calculatedRpe,
        lastUpdatedTime: now,
      };
    });
    setStudentOverrides((prev) => {
      const target = updated.find((u) => u.siswaId === siswaId);
      if (!target) return prev;
      return {
        ...prev,
        [siswaId]: {
          ...prev[siswaId],
          lapsCount: target.lapsCount,
          estimatedHeartRate: target.estimatedHeartRate,
          rpeScore: target.rpeScore,
          lastUpdatedTime: now,
        },
      };
    });
    syncLiveToBackend(updated);

    if (soundEnabled && delta > 0) {
      playLapBeep(false);
    }
  };

  // Batch Increment (+1 for all active students)
  const handleBatchAddLap = () => {
    const now = getCurrentTimestamp();
    const updated = liveStudents.map((s) => {
      if (s.status !== 'aktif') return s;
      const newLaps = s.lapsCount + 1;
      const baseHr = phase === 'inti' ? 145 : 120;
      return {
        ...s,
        lapsCount: newLaps,
        estimatedHeartRate: Math.min(185, baseHr + newLaps * 3),
        rpeScore: Math.min(10, Math.round(4 + newLaps * 0.6)),
        lastUpdatedTime: now,
      };
    });
    setStudentOverrides((prev) => {
      const next = { ...prev };
      updated.forEach((u) => {
        if (u.status === 'aktif') {
          next[u.siswaId] = {
            ...next[u.siswaId],
            lapsCount: u.lapsCount,
            estimatedHeartRate: u.estimatedHeartRate,
            rpeScore: u.rpeScore,
            lastUpdatedTime: now,
          };
        }
      });
      return next;
    });
    syncLiveToBackend(updated);
    if (soundEnabled) playWhistleSound(false);
  };

  // Change individual student status
  const handleStatusChange = (siswaId: string, status: StudentLiveState['status']) => {
    const now = getCurrentTimestamp();
    const updated = liveStudents.map((s) => {
      if (s.siswaId !== siswaId) return s;
      let hr = s.estimatedHeartRate;
      if (status === 'istirahat') hr = Math.max(85, hr - 25);
      if (status === 'terengah') hr = Math.min(185, hr + 15);
      if (status === 'cedera') hr = 100;
      return { ...s, status, estimatedHeartRate: hr, lastUpdatedTime: now };
    });
    setStudentOverrides((prev) => {
      const target = updated.find((u) => u.siswaId === siswaId);
      if (!target) return prev;
      return {
        ...prev,
        [siswaId]: {
          ...prev[siswaId],
          status: target.status,
          estimatedHeartRate: target.estimatedHeartRate,
          lastUpdatedTime: now,
        },
      };
    });
    syncLiveToBackend(updated);
  };

  // Change individual RPE
  const handleRpeChange = (siswaId: string, rpe: number) => {
    setStudentOverrides((prev) => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        rpeScore: rpe,
      },
    }));
  };

  // Save custom note for student
  const saveStudentNote = (siswaId: string) => {
    setStudentOverrides((prev) => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        notes: studentNoteText,
      },
    }));
    setEditingNoteStudentId(null);
    setStudentNoteText('');
  };

  // Finish session
  const handleFinishSession = () => {
    setIsRunning(false);
    setPhase('selesai');
    if (soundEnabled) playWhistleSound(true);
    
    // Confetti celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#14b8a6', '#06b6d4', '#f59e0b'],
    });

    setShowFinishModal(true);
  };

  // Save session record
  const handleSaveSessionData = () => {
    const sessionRecord: LiveSession = {
      id: `sesi-${Date.now()}`,
      kelasId: selectedClassId,
      judulMateri: topic,
      jenisAktivitas: activityType,
      phase: 'selesai',
      startTime: Date.now() - elapsedSeconds * 1000,
      elapsedSeconds,
      targetLaps,
      targetMinutes,
      lapDistanceMeters,
      students: liveStudents,
      isTimerRunning: false,
      notes: `Sesi ${topic} selesai dalam ${Math.round(elapsedSeconds / 60)} menit. Rata-rata putaran: ${avgLaps} laps.`,
    };

    onSaveSessionLog(sessionRecord);
    setShowFinishModal(false);
  };

  // Computed metrics
  const totalLapsCompleted = liveStudents.reduce((acc, s) => acc + s.lapsCount, 0);
  const activeCount = liveStudents.filter((s) => s.status === 'aktif').length;
  const restingCount = liveStudents.filter((s) => s.status === 'istirahat').length;
  const fatiguedCount = liveStudents.filter((s) => s.status === 'terengah').length;
  const injuredCount = liveStudents.filter((s) => s.status === 'cedera').length;
  const avgLaps = liveStudents.length > 0 ? (totalLapsCompleted / liveStudents.length).toFixed(1) : '0';
  const totalDistanceMeters = totalLapsCompleted * lapDistanceMeters;
  const estimatedCaloriesBurned = Math.round((totalDistanceMeters / 1000) * 65 + (elapsedSeconds / 60) * 4);

  // Filter students
  const filteredStudents = liveStudents.filter((s) => {
    const matchesFilter =
      statusFilter === 'semua' ? true : s.status === statusFilter;
    const matchesSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const buildExportHtml = () => {
    const rowsHtml = liveStudents
      .map(
        (s, idx) => `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td><strong>${escapeHtml(s.nama)}</strong></td>
        <td style="text-align:center;">${s.gender}</td>
        <td style="text-align:center; text-transform:uppercase;">${escapeHtml(s.status)}</td>
        <td style="text-align:center;">${s.lapsCount} / ${targetLaps}</td>
        <td style="text-align:center;">${s.lapsCount * lapDistanceMeters} m</td>
        <td style="text-align:center;">${s.estimatedHeartRate} bpm</td>
        <td style="text-align:center;">${s.rpeScore} / 10</td>
        <td>${escapeHtml(s.notes || '-')}</td>
      </tr>`
      )
      .join('');

    const bodyHtml = `
      <div class="kop">
        <h2>LAPORAN PEMANTAUAN AKTIVITAS LAPANGAN PJOK</h2>
        <h3>${escapeHtml(classNameTitle)} &bull; ${escapeHtml(activityType)}</h3>
        <p>Dicetak dari Sistem Monitoring Kebugaran SADARPJOK</p>
      </div>
      <table class="meta-table">
        <tr><td style="width:150px;"><strong>Materi / Topik</strong></td><td>: ${escapeHtml(topic)}</td><td style="width:140px;"><strong>Fase Latihan</strong></td><td style="text-transform:capitalize;">: ${escapeHtml(phase)}</td></tr>
        <tr><td><strong>Waktu Tempuh</strong></td><td>: ${formatTimer(elapsedSeconds)} (Target ${targetMinutes} mnt)</td><td><strong>Akumulasi Jarak</strong></td><td>: ${(totalDistanceMeters / 1000).toFixed(2)} km (${totalLapsCompleted} putaran)</td></tr>
        <tr><td><strong>Partisipasi Siswa</strong></td><td>: ${activeCount} Aktif, ${restingCount} Istirahat, ${fatiguedCount} Terengah, ${injuredCount} Cedera</td><td><strong>Estimasi Kalori</strong></td><td>: ${estimatedCaloriesBurned} kcal</td></tr>
      </table>
      <div class="section-title">Rekapitulasi Capaian &amp; Indikator Fisiologis Siswa</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:30px;">No</th>
            <th>Nama Siswa</th>
            <th style="width:32px;">L/P</th>
            <th style="width:72px;">Status</th>
            <th style="width:65px;">Putaran</th>
            <th style="width:65px;">Jarak</th>
            <th style="width:72px;">Est. Nadi</th>
            <th style="width:55px;">RPE</th>
            <th>Catatan Lapangan</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <table class="ttd-table">
        <tr>
          <td style="width:55%;"></td>
          <td style="width:45%;">Guru Mata Pelajaran PJOK<br/><br/><br/><br/><u><strong>..........................................</strong></u><br/>NIP. .................................</td>
        </tr>
      </table>
    `;

    return buildStandardWordHtml({
      title: `Laporan Live Tracker PJOK - ${classNameTitle}`,
      bodyHtml,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Control Panel */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Topic & Phase Tabs */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                Mode Lapangan PJOK
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-300">{classNameTitle}</span>
              <span className="text-xs text-slate-400">•</span>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as LiveSession['jenisAktivitas'])}
                className="bg-slate-900 border border-slate-700 text-xs font-semibold text-teal-300 rounded-md px-2 py-1 outline-none"
              >
                <option value="Sirkuit Kebugaran">Sirkuit Kebugaran</option>
                <option value="Shuttle Run">Shuttle Run (Kelincahan)</option>
                <option value="Lari Jarak Pendek">Lari Cepat / Sprint</option>
                <option value="Bleep Test">Bleep Test (Daya Tahan)</option>
                <option value="Permainan Bola Besar">Permainan Bola Besar</option>
                <option value="Senam Irama">Senam Irama & Pemanasan</option>
              </select>
            </div>

            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Judul Materi / Drill Olahraga Hari Ini..."
              className="text-lg md:text-xl font-black text-white bg-transparent border-b border-slate-700 hover:border-emerald-500 focus:border-emerald-500 outline-none pb-1 w-full transition-colors"
            />

            {/* Phase Selector Tabs */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
              {(['pemanasan', 'inti', 'pendinginan', 'selesai'] as ActivityPhase[]).map((p) => {
                const isActive = phase === p;
                return (
                  <button
                    key={p}
                    onClick={() => {
                      setPhase(p);
                      if (soundEnabled) playCountdownTick(p === 'inti');
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                        : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Fase: {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Digital Field Stopwatch */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div className="text-center sm:text-left">
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Timer Lapangan</span>
              </div>
              <div className="text-4xl md:text-5xl font-mono font-black tracking-tight text-white drop-shadow-md">
                {formatTimer(elapsedSeconds)}
              </div>
              <div className="text-[11px] text-slate-400">
                Target: {targetMinutes} Menit ({targetLaps} Putaran)
              </div>
            </div>

            <div className="flex sm:flex-col gap-2">
              <div className="flex items-center gap-2">
                {!isRunning ? (
                  <button
                    onClick={handleStartTimer}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Mulai</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePauseTimer}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Jeda</span>
                  </button>
                )}

                <button
                  onClick={handleResetTimer}
                  title="Reset Timer"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleFinishSession}
                className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-500 text-cyan-200 hover:text-white border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer"
              >
                Selesaikan Sesi
              </button>
            </div>
          </div>
        </div>

        {/* Export Word / PDF Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-700/70">
          <span className="text-xs text-slate-400 font-medium">
            Unduh rekapitulasi putaran, jarak tempuh, dan nadi siswa dalam format siap cetak:
          </span>
          <DocumentExportToolbar
            filename={`Live_Tracker_${classNameTitle}`}
            title={`Laporan Live Tracker PJOK - ${classNameTitle}`}
            getHtmlContent={buildExportHtml}
            orientation="landscape"
            compact
          />
        </div>

        {/* Live Metrics Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-700/80">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-emerald-400" />
              Total Putaran
            </span>
            <div className="text-xl font-black text-white mt-0.5">{totalLapsCompleted} laps</div>
            <div className="text-[10px] text-emerald-400 font-semibold">Rata-rata {avgLaps} / siswa</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              Partisipasi Aktif
            </span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {activeCount} <span className="text-xs text-slate-400 font-normal">/ {liveStudents.length} siswa</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold">
              {liveStudents.length > 0 ? Math.round((activeCount / liveStudents.length) * 100) : 0}% di lapangan
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Estimasi Kalori & Jarak
            </span>
            <div className="text-xl font-black text-amber-400 mt-0.5">{estimatedCaloriesBurned} kcal</div>
            <div className="text-[10px] text-slate-400 font-semibold">
              {(totalDistanceMeters / 1000).toFixed(2)} km akumulasi
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Status Stamina
            </span>
            <div className="text-xl font-black text-white mt-0.5">
              {fatiguedCount > 0 ? (
                <span className="text-amber-400 font-bold">{fatiguedCount} Terengah</span>
              ) : (
                <span className="text-emerald-400 font-bold">Stabil</span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold">
              {restingCount} istirahat, {injuredCount} cedera
            </div>
          </div>

          {/* Quick 1-Click All Active +1 Lap */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-center justify-center">
            <button
              onClick={handleBatchAddLap}
              title="Tambahkan 1 Putaran ke Semua Siswa yang Berstatus Aktif"
              className="w-full h-full min-h-[58px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl p-2.5 flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <div className="text-left">
                <div>+1 Lap Tim</div>
                <div className="text-[10px] font-normal text-emerald-100">Semua Siswa Aktif</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Field Roster & Student Activity Monitor */}
      <div className="space-y-4">
        {/* Controls: Filter Pills & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { id: 'semua', label: 'Semua Siswa', count: liveStudents.length },
              { id: 'aktif', label: 'Aktif Berlari', count: activeCount },
              { id: 'istirahat', label: 'Istirahat / Minum', count: restingCount },
              { id: 'terengah', label: 'Terengah / Lelah', count: fatiguedCount },
              { id: 'cedera', label: 'Cedera / Perlu Bantuan', count: injuredCount },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 text-xs text-slate-100 placeholder-slate-400 px-3 py-1.5 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none w-full md:w-56"
            />
          </div>
        </div>

        {/* Student Live Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student) => {
            const isCompletedTarget = student.lapsCount >= targetLaps;
            const hrZone =
              student.estimatedHeartRate > 165
                ? 'Zona Keras (Maksimal)'
                : student.estimatedHeartRate > 130
                ? 'Zona Aerobik Aman'
                : 'Zona Pemanasan';

            const hrColor =
              student.estimatedHeartRate > 165
                ? 'text-rose-400'
                : student.estimatedHeartRate > 130
                ? 'text-emerald-400'
                : 'text-cyan-400';

            return (
              <div
                key={student.siswaId}
                className={`bg-slate-800/90 rounded-xl p-4 border transition-all ${
                  student.status === 'cedera'
                    ? 'border-rose-500/80 bg-rose-950/20'
                    : student.status === 'terengah'
                    ? 'border-amber-500/60 bg-amber-950/15'
                    : isCompletedTarget
                    ? 'border-emerald-500/60 shadow-md shadow-emerald-500/10'
                    : 'border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {/* Header: Name, Gender & Status Dropdown */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                        student.gender === 'L'
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'bg-pink-600/20 text-pink-400 border border-pink-500/30'
                      }`}
                    >
                      {student.nama.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white line-clamp-1">{student.nama}</div>
                      <div className="text-[11px] text-slate-400">
                        {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </div>
                    </div>
                  </div>

                  {/* Status Picker */}
                  <select
                    value={student.status}
                    onChange={(e) =>
                      handleStatusChange(student.siswaId, e.target.value as StudentLiveState['status'])
                    }
                    className={`text-[11px] font-bold rounded-md px-2 py-1 outline-none border cursor-pointer ${
                      student.status === 'aktif'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : student.status === 'istirahat'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : student.status === 'terengah'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : student.status === 'cedera'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    }`}
                  >
                    <option value="aktif">Aktif</option>
                    <option value="istirahat">Istirahat</option>
                    <option value="terengah">Terengah</option>
                    <option value="cedera">Cedera</option>
                    <option value="dispensasi">Dispensasi</option>
                  </select>
                </div>

                {/* Big Lap Counter Section */}
                <div className="flex items-center justify-between bg-slate-900/80 rounded-xl p-3 my-3 border border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Capaian Laps / Drill
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl font-black text-white font-mono">{student.lapsCount}</span>
                      <span className="text-xs text-slate-400 font-semibold">/ {targetLaps} target</span>
                      {isCompletedTarget && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 inline ml-1" />
                      )}
                    </div>
                  </div>

                  {/* Counter Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateStudentLap(student.siswaId, -1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold border border-slate-700 active:scale-95 transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateStudentLap(student.siswaId, 1)}
                      className="w-10 h-10 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center font-extrabold shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-5 h-5 stroke-[3]" />
                    </button>
                  </div>
                </div>

                {/* Real-time Physiological indicators (BPM & RPE Scale) */}
                <div className="space-y-2 pt-1 border-t border-slate-700/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Heart className="w-3 h-3 text-rose-400" />
                      Estimasi Nadi (BPM):
                    </span>
                    <span className={`font-mono font-bold ${hrColor}`}>
                      {student.estimatedHeartRate} bpm
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Skala Beban (RPE Borg):</span>
                    <div className="flex items-center gap-1">
                      {[2, 4, 6, 8, 10].map((val) => (
                        <button
                          key={val}
                          onClick={() => handleRpeChange(student.siswaId, val)}
                          className={`w-5 h-5 text-[10px] font-bold rounded flex items-center justify-center transition-all cursor-pointer ${
                            student.rpeScore === val
                              ? 'bg-teal-500 text-slate-950 font-black'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes Tag if any */}
                {student.notes && (
                  <div className="mt-2.5 p-1.5 bg-amber-500/10 border border-amber-500/20 rounded text-[11px] text-amber-300 font-medium">
                    ⚠️ {student.notes}
                  </div>
                )}

                {/* Quick Add Note Button */}
                <div className="mt-2 pt-2 border-t border-slate-700/40 flex justify-end">
                  <button
                    onClick={() => {
                      setEditingNoteStudentId(student.siswaId);
                      setStudentNoteText(student.notes || '');
                    }}
                    className="text-[10px] text-slate-400 hover:text-emerald-400 font-semibold transition-colors cursor-pointer"
                  >
                    + Catatan Lapangan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note Editing Modal */}
      {editingNoteStudentId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Tambahkan Catatan Khusus Siswa</h3>
            <p className="text-xs text-slate-400 mb-4">
              Catatan kondisi fisik lapangan, penanganan cedera ringan, atau keluhan lelah.
            </p>
            <textarea
              value={studentNoteText}
              onChange={(e) => setStudentNoteText(e.target.value)}
              placeholder="Contoh: Mengeluh pusing setelah 4 putaran, diinstruksikan istirahat dan minum..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 outline-none h-24 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingNoteStudentId(null)}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => saveStudentNote(editingNoteStudentId)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white cursor-pointer"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Finish & Reflection Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-emerald-500/40 max-w-lg w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-center text-white">Sesi Olahraga Selesai!</h3>
            <p className="text-xs text-center text-slate-400 mt-1 mb-5">
              Data aktivitas fisik real-time telah direkam secara sistematis ke dalam database kelas.
            </p>

            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-700 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Materi Pembelajaran:</span>
                <span className="font-bold text-white text-right">{topic}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Waktu Latihan:</span>
                <span className="font-mono font-bold text-emerald-400">{formatTimer(elapsedSeconds)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Putaran Tim:</span>
                <span className="font-bold text-white">{totalLapsCompleted} putaran</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Akumulasi Jarak:</span>
                <span className="font-bold text-teal-400">{(totalDistanceMeters / 1000).toFixed(2)} km</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Estimasi Pembakaran Kalori:</span>
                <span className="font-bold text-amber-400">{estimatedCaloriesBurned} kcal</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Siswa dengan Catatan/Kelelahan:</span>
                <span className="font-bold text-rose-400">{fatiguedCount + injuredCount} siswa</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700 flex justify-center">
              <DocumentExportToolbar
                filename={`Laporan_Sesi_PJOK_${classNameTitle}`}
                title={`Laporan Sesi Lapangan PJOK - ${classNameTitle}`}
                getHtmlContent={buildExportHtml}
                orientation="landscape"
                compact
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 mt-4">
              <button
                onClick={() => {
                  handleSaveSessionData();
                  onSwitchToAIAnalysis({
                    judulMateri: topic,
                    jenisAktivitas: activityType,
                    elapsedSeconds,
                    activeStudentsCount: activeCount,
                    totalStudentsCount: liveStudents.length,
                    avgLaps,
                    fatiguedStudents: liveStudents
                      .filter((s) => s.status === 'terengah' || s.status === 'cedera')
                      .map((s) => `${s.nama} (${s.status})`)
                      .join(', '),
                  });
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Analisis AI & Refleksi</span>
              </button>

              <button
                onClick={handleSaveSessionData}
                className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs cursor-pointer"
              >
                Simpan & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
