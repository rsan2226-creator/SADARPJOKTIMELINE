'use client';

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';
import { 
  BarChart3, Activity, Heart, AlertTriangle, ShieldCheck, 
  TrendingUp, Users, Sparkles, CheckCircle2 
} from 'lucide-react';
import { Siswa, TesKebugaranTKJI } from '@/lib/types';
import { calculateIMT } from '@/lib/tkji';
import { DocumentExportToolbar } from '@/components/DocumentExportToolbar';
import { buildStandardWordHtml, escapeHtml } from '@/lib/export-utils';

interface AnalyticsDashboardProps {
  students: Siswa[];
  tkjiRecords: TesKebugaranTKJI[];
  classNameTitle: string;
  onSelectStudentDetail: (siswa: Siswa) => void;
  onRequestClassAIAdvice: () => void;
}

export function AnalyticsDashboard({
  students,
  tkjiRecords,
  classNameTitle,
  onSelectStudentDetail,
  onRequestClassAIAdvice,
}: AnalyticsDashboardProps) {
  // Filter records belonging to this class
  const classRecords = tkjiRecords.filter((r) =>
    students.some((s) => s.id === r.siswaId)
  );

  // Category Distribution for PieChart
  const catCounts: Record<string, number> = {
    'Sangat Baik': 0,
    Baik: 0,
    Sedang: 0,
    Kurang: 0,
    'Kurang Sekali': 0,
  };

  classRecords.forEach((r) => {
    catCounts[r.kategori] = (catCounts[r.kategori] || 0) + 1;
  });

  const pieData = [
    { name: 'Sangat Baik', value: catCounts['Sangat Baik'], color: '#10b981' }, // Emerald
    { name: 'Baik', value: catCounts['Baik'], color: '#14b8a6' }, // Teal
    { name: 'Sedang', value: catCounts['Sedang'], color: '#f59e0b' }, // Amber
    { name: 'Kurang', value: catCounts['Kurang'], color: '#f97316' }, // Orange
    { name: 'Kurang Sekali', value: catCounts['Kurang Sekali'], color: '#f43f5e' }, // Rose
  ].filter((item) => item.value > 0);

  // Average score per component
  const avgScores = {
    sprint: classRecords.length > 0 ? (classRecords.reduce((acc, r) => acc + r.scoreSprint, 0) / classRecords.length).toFixed(1) : '0',
    pullUps: classRecords.length > 0 ? (classRecords.reduce((acc, r) => acc + r.scorePullUps, 0) / classRecords.length).toFixed(1) : '0',
    sitUps: classRecords.length > 0 ? (classRecords.reduce((acc, r) => acc + r.scoreSitUps, 0) / classRecords.length).toFixed(1) : '0',
    jump: classRecords.length > 0 ? (classRecords.reduce((acc, r) => acc + r.scoreJump, 0) / classRecords.length).toFixed(1) : '0',
    run: classRecords.length > 0 ? (classRecords.reduce((acc, r) => acc + r.scoreRun, 0) / classRecords.length).toFixed(1) : '0',
  };

  const barData = [
    { component: 'Kecepatan (Sprint 40m)', nilai: parseFloat(avgScores.sprint), max: 5 },
    { component: 'Kekuatan Lengan (Pull-Up)', nilai: parseFloat(avgScores.pullUps), max: 5 },
    { component: 'Otot Perut (Sit-Up)', nilai: parseFloat(avgScores.sitUps), max: 5 },
    { component: 'Power Tungkai (Jump)', nilai: parseFloat(avgScores.jump), max: 5 },
    { component: 'Daya Tahan (Lari 600m)', nilai: parseFloat(avgScores.run), max: 5 },
  ];

  // IMT (BMI) Distribution
  const imtCounts = { Kurus: 0, Normal: 0, 'Kelebihan BB': 0, Obesitas: 0 };
  students.forEach((s) => {
    const { kategori } = calculateIMT(s.beratBadan, s.tinggiBadan);
    imtCounts[kategori] = (imtCounts[kategori] || 0) + 1;
  });

  const imtChartData = [
    { status: 'Kurus', jumlah: imtCounts.Kurus, color: '#06b6d4' },
    { status: 'Normal', jumlah: imtCounts.Normal, color: '#10b981' },
    { status: 'Kelebihan BB', jumlah: imtCounts['Kelebihan BB'], color: '#f59e0b' },
    { status: 'Obesitas', jumlah: imtCounts.Obesitas, color: '#f43f5e' },
  ];

  // Early Warning list: Students with low fitness or special medical/BMI condition
  const studentsNeedingAttention = students.filter((s) => {
    const record = tkjiRecords.find((r) => r.siswaId === s.id);
    const { kategori: imtKat } = calculateIMT(s.beratBadan, s.tinggiBadan);
    const hasMedical = Boolean(s.catatanMedis);
    const isLowScore = record && (record.kategori === 'Kurang' || record.kategori === 'Kurang Sekali');
    const isOverweight = imtKat === 'Obesitas' || imtKat === 'Kelebihan BB';
    return isLowScore || hasMedical || isOverweight;
  });

  const avgClassScore =
    classRecords.length > 0
      ? (classRecords.reduce((acc, r) => acc + r.totalNilai, 0) / classRecords.length).toFixed(1)
      : '0';

  const primePercentage =
    classRecords.length > 0
      ? Math.round(
          ((catCounts['Sangat Baik'] + catCounts['Baik']) / classRecords.length) * 100
        )
      : 0;

  const buildExportHtml = () => {
    const distRows = Object.entries(catCounts)
      .map(
        ([kat, jml]) => `
        <tr>
          <td>${escapeHtml(kat)}</td>
          <td style="text-align:center;">${jml}</td>
          <td style="text-align:center;">${classRecords.length > 0 ? ((jml / classRecords.length) * 100).toFixed(1) : '0'}%</td>
        </tr>`
      )
      .join('');

    const compRows = barData
      .map(
        (b) => `
        <tr>
          <td>${escapeHtml(b.component)}</td>
          <td style="text-align:center;"><strong>${b.nilai}</strong> / ${b.max}</td>
        </tr>`
      )
      .join('');

    const imtRows = imtChartData
      .map(
        (m) => `
        <tr>
          <td>${escapeHtml(m.status)}</td>
          <td style="text-align:center;">${m.jumlah} siswa</td>
        </tr>`
      )
      .join('');

    const ewRows =
      studentsNeedingAttention.length > 0
        ? studentsNeedingAttention
            .map((s, idx) => {
              const rec = tkjiRecords.find((r) => r.siswaId === s.id);
              const { imt, kategori: imtKat } = calculateIMT(s.beratBadan, s.tinggiBadan);
              return `
              <tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td><strong>${escapeHtml(s.nama)}</strong></td>
                <td style="text-align:center;">${s.tinggiBadan}cm / ${s.beratBadan}kg</td>
                <td style="text-align:center;">${imt} (${escapeHtml(imtKat)})</td>
                <td style="text-align:center;">${escapeHtml(rec?.kategori || 'Belum Diuji')}</td>
                <td>${escapeHtml(s.catatanMedis || 'Perlu latihan daya tahan kardio ringan & pendampingan gizi')}</td>
              </tr>`;
            })
            .join('')
        : `<tr><td colspan="6" style="text-align:center;">Tidak ada siswa dengan perhatian khusus saat ini.</td></tr>`;

    const bodyHtml = `
      <div class="kop">
        <h2>LAPORAN ANALISIS &amp; STATISTIK KEBUGARAN JASMANI KELAS</h2>
        <h3>${escapeHtml(classNameTitle)}</h3>
        <p>Dashboard Profiling Kebugaran TKJI, Status Gizi (IMT), dan Early Warning System</p>
      </div>
      <table class="meta-table">
        <tr><td style="width:170px;"><strong>Rata-rata Nilai TKJI</strong></td><td>: ${avgClassScore} / 25</td><td style="width:165px;"><strong>Kebugaran Prima</strong></td><td>: ${primePercentage}% (Baik &amp; Sangat Baik)</td></tr>
        <tr><td><strong>IMT Normal</strong></td><td>: ${imtCounts.Normal} dari ${students.length} siswa</td><td><strong>Perhatian Khusus</strong></td><td>: ${studentsNeedingAttention.length} siswa</td></tr>
      </table>
      <div class="section-title">1. Distribusi Kategori Kebugaran (TKJI)</div>
      <table class="data-table">
        <thead><tr><th>Kategori Kebugaran</th><th style="width:110px;">Jumlah Siswa</th><th style="width:110px;">Persentase</th></tr></thead>
        <tbody>${distRows}</tbody>
      </table>
      <div class="section-title">2. Rata-rata 5 Komponen Tes TKJI &amp; Distribusi IMT</div>
      <table class="data-table">
        <thead><tr><th>Komponen Kebugaran</th><th style="width:140px;">Rata-rata Skor</th></tr></thead>
        <tbody>${compRows}</tbody>
      </table>
      <table class="data-table">
        <thead><tr><th>Status IMT (Gizi)</th><th style="width:140px;">Jumlah Siswa</th></tr></thead>
        <tbody>${imtRows}</tbody>
      </table>
      <div class="section-title">3. Daftar Siswa Dalam Pemantauan Khusus (Early Warning &amp; Remedial)</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:28px;">No</th>
            <th>Nama Siswa</th>
            <th style="width:95px;">TB / BB</th>
            <th style="width:95px;">IMT</th>
            <th style="width:95px;">Kategori TKJI</th>
            <th>Catatan / Tindak Lanjut</th>
          </tr>
        </thead>
        <tbody>${ewRows}</tbody>
      </table>
    `;

    return buildStandardWordHtml({
      title: `Laporan Statistik Kebugaran - ${classNameTitle}`,
      bodyHtml,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                Pusat Analisis & Statistik Kebugaran
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-300">{classNameTitle}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white mt-1">
              Dashboard Kebugaran Jasmani Siswa
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualisasi tren kebugaran, profiling gizi (IMT), dan early warning system keselamatan siswa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <DocumentExportToolbar
              filename={`Statistik_Kebugaran_${classNameTitle}`}
              title={`Laporan Statistik Kebugaran - ${classNameTitle}`}
              getHtmlContent={buildExportHtml}
              compact
            />
            <button
              onClick={onRequestClassAIAdvice}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Rekomendasi AI untuk Kelas Ini</span>
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-700/80">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400">Rata-rata Nilai TKJI</span>
            <div className="text-2xl font-black text-white mt-0.5 font-mono">
              {avgClassScore} <span className="text-xs text-slate-400 font-normal">/ 25</span>
            </div>
            <span className="text-[10px] text-teal-400 font-semibold">Tingkat Sedang ke Baik</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400">Tingkat Kebugaran Prima</span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5 font-mono">
              {primePercentage}%
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Kategori Baik & Sangat Baik</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400">Profil IMT Normal</span>
            <div className="text-2xl font-black text-cyan-400 mt-0.5 font-mono">
              {students.length > 0 ? Math.round((imtCounts.Normal / students.length) * 100) : 0}%
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">{imtCounts.Normal} dari {students.length} siswa</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400">Perhatian Khusus</span>
            <div className="text-2xl font-black text-rose-400 mt-0.5 font-mono">
              {studentsNeedingAttention.length}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Perlu remedial / asma / IMT</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: TKJI Category Distribution */}
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Distribusi Kategori Kebugaran (TKJI)</h3>
              <p className="text-[11px] text-slate-400">Komposisi status kebugaran seluruh siswa</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                Belum ada data uji TKJI yang terekam
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: 5 Components Breakdown */}
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Rata-rata 5 Komponen Kebugaran</h3>
              <p className="text-[11px] text-slate-400">Skor rata-rata per item tes (Skala 1 - 5)</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 30, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="component"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  width={140}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: unknown) => [`${value} / 5.0`, 'Nilai Rata-rata']}
                />
                <Bar dataKey="nilai" fill="#14b8a6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Early Warning List for Students Needing Attention */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Siswa Dalam Pemantauan Khusus (Early Warning & Remedial)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {studentsNeedingAttention.length} Siswa Teridentifikasi
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Siswa dengan riwayat asma/medis, kebugaran aerobik rendah, atau berat badan di luar rentang normal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {studentsNeedingAttention.map((siswa) => {
            const record = tkjiRecords.find((r) => r.siswaId === siswa.id);
            const { imt, kategori: imtKat } = calculateIMT(siswa.beratBadan, siswa.tinggiBadan);

            return (
              <div
                key={siswa.id}
                onClick={() => onSelectStudentDetail(siswa)}
                className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 hover:border-amber-500/60 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors">
                      {siswa.nama}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      TB: {siswa.tinggiBadan}cm • BB: {siswa.beratBadan}kg • IMT: {imt} ({imtKat})
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      record?.kategori === 'Kurang' || record?.kategori === 'Kurang Sekali'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {record?.kategori || 'Belum Diuji'}
                  </span>
                </div>

                {siswa.catatanMedis ? (
                  <div className="mt-2 text-[11px] text-amber-300 font-medium">
                    ⚠️ {siswa.catatanMedis}
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] text-slate-400">
                    Disarankan: Latihan daya tahan kardio ringan & pendampingan gizi.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
