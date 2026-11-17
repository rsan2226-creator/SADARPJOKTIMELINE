'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, Award, TrendingUp, Sparkles, Plus, Edit2, 
  Search, Filter, CheckCircle, AlertCircle, FileText, Download, Printer
} from 'lucide-react';
import { Siswa, TesKebugaranTKJI } from '@/lib/types';
import { 
  getScoreSprint40m, getScorePullUps, getScoreSitUps30s, 
  getScoreVerticalJump, getScoreRun600m, determineTKJICategory, 
  calculateIMT, getCategoryBadgeColor, formatSecondsToMinutes 
} from '@/lib/tkji';
import { DocumentExportToolbar } from '@/components/DocumentExportToolbar';
import { buildStandardWordHtml, escapeHtml } from '@/lib/export-utils';

interface TkjiModuleProps {
  students: Siswa[];
  tkjiRecords: TesKebugaranTKJI[];
  selectedClassId: string;
  classNameTitle: string;
  onSaveTKJIRecord: (record: TesKebugaranTKJI) => void;
  onRequestAIStudentFeedback: (student: Siswa, tkji: TesKebugaranTKJI) => void;
  onPrintStudentCard: (student: Siswa, tkji: TesKebugaranTKJI) => void;
}

export function TkjiModule({
  students,
  tkjiRecords,
  selectedClassId,
  classNameTitle,
  onSaveTKJIRecord,
  onRequestAIStudentFeedback,
  onPrintStudentCard,
}: TkjiModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('semua');
  const [selectedStudentForTest, setSelectedStudentForTest] = useState<Siswa | null>(null);

  // Form State for inputting / editing TKJI
  const [formData, setFormData] = useState({
    sprintSec: 7.0,
    pullUps: 18,
    sitUps: 16,
    verticalJumpCm: 32,
    runSec: 160,
    tanggal: new Date().toISOString().split('T')[0],
  });

  // Calculate live preview scores
  const previewGender = selectedStudentForTest?.gender || 'L';
  const previewScoreSprint = getScoreSprint40m(formData.sprintSec, previewGender);
  const previewScorePull = getScorePullUps(formData.pullUps, previewGender);
  const previewScoreSit = getScoreSitUps30s(formData.sitUps, previewGender);
  const previewScoreJump = getScoreVerticalJump(formData.verticalJumpCm, previewGender);
  const previewScoreRun = getScoreRun600m(formData.runSec, previewGender);
  const previewTotal = previewScoreSprint + previewScorePull + previewScoreSit + previewScoreJump + previewScoreRun;
  const previewCategory = determineTKJICategory(previewTotal);

  const openTestModal = (siswa: Siswa) => {
    setSelectedStudentForTest(siswa);
    const existing = tkjiRecords.find((r) => r.siswaId === siswa.id);
    if (existing) {
      setFormData({
        sprintSec: existing.sprintSec,
        pullUps: existing.pullUps,
        sitUps: existing.sitUps,
        verticalJumpCm: existing.verticalJumpCm,
        runSec: existing.runSec,
        tanggal: existing.tanggal,
      });
    } else {
      setFormData({
        sprintSec: 7.0,
        pullUps: 18,
        sitUps: 16,
        verticalJumpCm: 32,
        runSec: 160,
        tanggal: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForTest) return;

    const { imt, kategori: kategoriImt } = calculateIMT(
      selectedStudentForTest.beratBadan,
      selectedStudentForTest.tinggiBadan
    );

    const newRecord: TesKebugaranTKJI = {
      id: `tkji-${selectedStudentForTest.id}`,
      siswaId: selectedStudentForTest.id,
      tanggal: formData.tanggal,
      usia: 11,
      sprintSec: Number(formData.sprintSec),
      pullUps: Number(formData.pullUps),
      sitUps: Number(formData.sitUps),
      verticalJumpCm: Number(formData.verticalJumpCm),
      runSec: Number(formData.runSec),
      scoreSprint: previewScoreSprint,
      scorePullUps: previewScorePull,
      scoreSitUps: previewScoreSit,
      scoreJump: previewScoreJump,
      scoreRun: previewScoreRun,
      totalNilai: previewTotal,
      kategori: previewCategory,
      imt,
      kategoriImt,
      catatan:
        previewTotal >= 18
          ? 'Kebugaran sangat prima, pertahankan!'
          : previewTotal >= 14
          ? 'Kebugaran sedang, tingkatkan latihan kardio & kelenturan.'
          : 'Perlu latihan fisik bertahap 3x seminggu.',
    };

    onSaveTKJIRecord(newRecord);
    setSelectedStudentForTest(null);
  };

  // Filtered list
  const filteredList = students.filter((siswa) => {
    const record = tkjiRecords.find((r) => r.siswaId === siswa.id);
    const matchesSearch =
      siswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      siswa.nisn.includes(searchQuery);

    if (categoryFilter === 'semua') return matchesSearch;
    if (categoryFilter === 'belum_tes') return matchesSearch && !record;
    return matchesSearch && record?.kategori === categoryFilter;
  });

  // Summary counts
  const testedCount = tkjiRecords.filter((r) => students.some((s) => s.id === r.siswaId)).length;
  const sangatBaikCount = tkjiRecords.filter((r) => r.kategori === 'Sangat Baik' && students.some((s) => s.id === r.siswaId)).length;
  const baikCount = tkjiRecords.filter((r) => r.kategori === 'Baik' && students.some((s) => s.id === r.siswaId)).length;
  const sedangCount = tkjiRecords.filter((r) => r.kategori === 'Sedang' && students.some((s) => s.id === r.siswaId)).length;
  const kurangCount = tkjiRecords.filter((r) => (r.kategori === 'Kurang' || r.kategori === 'Kurang Sekali') && students.some((s) => s.id === r.siswaId)).length;

  const buildExportHtml = () => {
    const rowsHtml = filteredList
      .map((siswa, idx) => {
        const record = tkjiRecords.find((r) => r.siswaId === siswa.id);
        const { imt, kategori: imtKat } = calculateIMT(siswa.beratBadan, siswa.tinggiBadan);
        return `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td><strong>${escapeHtml(siswa.nama)}</strong><br/><small>NISN: ${escapeHtml(siswa.nisn)}</small></td>
          <td style="text-align:center;">${siswa.gender}</td>
          <td style="text-align:center;">${imt} (${escapeHtml(imtKat)})<br/><small>${siswa.tinggiBadan}cm / ${siswa.beratBadan}kg</small></td>
          ${
            record
              ? `<td style="text-align:center;">${record.sprintSec}s<br/>(Skor ${record.scoreSprint})</td>
                 <td style="text-align:center;">${record.pullUps}s<br/>(Skor ${record.scorePullUps})</td>
                 <td style="text-align:center;">${record.sitUps}x<br/>(Skor ${record.scoreSitUps})</td>
                 <td style="text-align:center;">${record.verticalJumpCm}cm<br/>(Skor ${record.scoreJump})</td>
                 <td style="text-align:center;">${formatSecondsToMinutes(record.runSec)}<br/>(Skor ${record.scoreRun})</td>
                 <td style="text-align:center;"><strong>${record.totalNilai} / 25</strong></td>
                 <td style="text-align:center;"><strong>${escapeHtml(record.kategori)}</strong></td>`
              : `<td colspan="7" style="text-align:center; font-style:italic;">Belum melaksanakan tes TKJI</td>`
          }
        </tr>`;
      })
      .join('');

    const bodyHtml = `
      <div class="kop">
        <h2>REKAPITULASI HASIL TES KEBUGARAN JASMANI INDONESIA (TKJI)</h2>
        <h3>${escapeHtml(classNameTitle)} &bull; Standar Nasional Depdiknas</h3>
        <p>5 Item Uji: Sprint 40m, Gantung Siku Tekuk, Baring Duduk 30s, Loncat Tegak, Lari 600m</p>
      </div>
      <table class="meta-table">
        <tr><td style="width:160px;"><strong>Kelas / Rombel</strong></td><td>: ${escapeHtml(classNameTitle)}</td><td style="width:150px;"><strong>Jumlah Diuji</strong></td><td>: ${testedCount} dari ${students.length} Siswa</td></tr>
        <tr><td><strong>Distribusi Norma</strong></td><td colspan="3">: Sangat Baik (${sangatBaikCount}), Baik (${baikCount}), Sedang (${sedangCount}), Kurang/KS (${kurangCount})</td></tr>
      </table>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:28px;">No</th>
            <th>Nama Siswa</th>
            <th style="width:30px;">L/P</th>
            <th>IMT (TB/BB)</th>
            <th>Sprint 40m</th>
            <th>Gantung Siku</th>
            <th>Sit-Up 30s</th>
            <th>Loncat Tegak</th>
            <th>Lari 600m</th>
            <th style="width:55px;">Total</th>
            <th>Kategori TKJI</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <table class="ttd-table">
        <tr>
          <td style="width:55%;">Mengetahui,<br/>Kepala Sekolah<br/><br/><br/><br/><u><strong>..........................................</strong></u><br/>NIP. .................................</td>
          <td style="width:45%;">Guru Mata Pelajaran PJOK<br/><br/><br/><br/><br/><u><strong>..........................................</strong></u><br/>NIP. .................................</td>
        </tr>
      </table>
    `;

    return buildStandardWordHtml({
      title: `Rekap TKJI - ${classNameTitle}`,
      bodyHtml,
      orientation: 'landscape',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
                Standar Nasional Depdiknas
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-300">{classNameTitle}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white mt-1">
              Tes Kebugaran Jasmani Indonesia (TKJI)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              5 Item Uji Fisik: Sprint 40m, Gantung Siku Tekuk, Baring Duduk 30s, Loncat Tegak, Lari 600m
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DocumentExportToolbar
              filename={`Rekap_TKJI_${classNameTitle}`}
              title={`Rekap TKJI - ${classNameTitle}`}
              getHtmlContent={buildExportHtml}
              orientation="landscape"
              compact
            />
            <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Tuntas Diuji</span>
              <div className="text-base font-black text-emerald-400">
                {testedCount} / {students.length} Siswa
              </div>
            </div>
          </div>
        </div>

        {/* Norm breakdown indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-700/80">
          <div className="bg-slate-900/50 p-2.5 rounded-xl border border-emerald-500/20 text-center">
            <span className="text-[11px] font-bold text-emerald-400">Sangat Baik (22-25)</span>
            <div className="text-lg font-black text-white mt-0.5">{sangatBaikCount} siswa</div>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded-xl border border-teal-500/20 text-center">
            <span className="text-[11px] font-bold text-teal-400">Baik (18-21)</span>
            <div className="text-lg font-black text-white mt-0.5">{baikCount} siswa</div>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded-xl border border-amber-500/20 text-center">
            <span className="text-[11px] font-bold text-amber-400">Sedang (14-17)</span>
            <div className="text-lg font-black text-white mt-0.5">{sedangCount} siswa</div>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded-xl border border-rose-500/20 text-center">
            <span className="text-[11px] font-bold text-rose-400">Kurang / KS (&lt;14)</span>
            <div className="text-lg font-black text-white mt-0.5">{kurangCount} siswa</div>
          </div>
        </div>
      </div>

      {/* Filter and Table Section */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { id: 'semua', label: 'Semua Siswa' },
              { id: 'Sangat Baik', label: 'Sangat Baik' },
              { id: 'Baik', label: 'Baik' },
              { id: 'Sedang', label: 'Sedang' },
              { id: 'Kurang', label: 'Kurang' },
              { id: 'belum_tes', label: 'Belum Tes' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  categoryFilter === f.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari nama atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 rounded-lg px-3 py-1.5 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto border border-slate-700/80 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 font-bold border-b border-slate-700">
                <th className="p-3 w-12 text-center border-r border-slate-700/80">No</th>
                <th className="p-3 min-w-[160px] border-r border-slate-700/80">Nama Siswa</th>
                <th className="p-3 text-center border-r border-slate-700/80">L/P</th>
                <th className="p-3 text-center border-r border-slate-700/80">IMT (TB/BB)</th>
                <th className="p-3 text-center border-r border-slate-700/80">1. Sprint 40m</th>
                <th className="p-3 text-center border-r border-slate-700/80">2. Gantung Siku</th>
                <th className="p-3 text-center border-r border-slate-700/80">3. Sit-Up 30s</th>
                <th className="p-3 text-center border-r border-slate-700/80">4. Loncat Tegak</th>
                <th className="p-3 text-center border-r border-slate-700/80">5. Lari 600m</th>
                <th className="p-3 text-center border-r border-slate-700/80">Total Nilai</th>
                <th className="p-3 text-center border-r border-slate-700/80">Kategori TKJI</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredList.map((siswa, idx) => {
                const record = tkjiRecords.find((r) => r.siswaId === siswa.id);
                const { imt, kategori: imtKat } = calculateIMT(siswa.beratBadan, siswa.tinggiBadan);

                return (
                  <tr key={siswa.id} className={`${idx % 2 === 1 ? 'bg-slate-900/35' : ''} hover:bg-slate-750/50 transition-colors`}>
                    <td className="p-3 text-center text-slate-400 font-mono tabular-nums border-r border-slate-800/80">{idx + 1}</td>
                    <td className="p-3 font-semibold text-white border-r border-slate-800/80">
                      <div>{siswa.nama}</div>
                      <div className="text-[10px] text-slate-400 font-mono tabular-nums">NISN: {siswa.nisn}</div>
                    </td>
                    <td className="p-3 text-center font-bold border-r border-slate-800/80">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          siswa.gender === 'L' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
                        }`}
                      >
                        {siswa.gender}
                      </span>
                    </td>
                    <td className="p-3 text-center border-r border-slate-800/80 tabular-nums">
                      <span className="font-mono font-bold text-slate-200">{imt}</span>
                      <div className="text-[10px] text-slate-400">
                        {siswa.tinggiBadan}cm / {siswa.beratBadan}kg
                      </div>
                    </td>

                    {/* TKJI 5 Items */}
                    {record ? (
                      <>
                        <td className="p-3 text-center font-mono tabular-nums border-r border-slate-800/80">
                          <span className="text-white font-bold">{record.sprintSec}s</span>
                          <span className="text-[10px] text-emerald-400 block font-semibold">
                            (Nilai {record.scoreSprint})
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono tabular-nums border-r border-slate-800/80">
                          <span className="text-white font-bold">{record.pullUps}s</span>
                          <span className="text-[10px] text-emerald-400 block font-semibold">
                            (Nilai {record.scorePullUps})
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono tabular-nums border-r border-slate-800/80">
                          <span className="text-white font-bold">{record.sitUps}x</span>
                          <span className="text-[10px] text-emerald-400 block font-semibold">
                            (Nilai {record.scoreSitUps})
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono tabular-nums border-r border-slate-800/80">
                          <span className="text-white font-bold">{record.verticalJumpCm}cm</span>
                          <span className="text-[10px] text-emerald-400 block font-semibold">
                            (Nilai {record.scoreJump})
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono tabular-nums border-r border-slate-800/80">
                          <span className="text-white font-bold">{formatSecondsToMinutes(record.runSec)}</span>
                          <span className="text-[10px] text-emerald-400 block font-semibold">
                            (Nilai {record.scoreRun})
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono tabular-nums font-black text-sm text-cyan-300 border-r border-slate-800/80">
                          {record.totalNilai} <span className="text-[10px] text-slate-400 font-normal">/ 25</span>
                        </td>
                        <td className="p-3 text-center border-r border-slate-800/80">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${getCategoryBadgeColor(
                              record.kategori
                            )}`}
                          >
                            {record.kategori}
                          </span>
                        </td>
                      </>
                    ) : (
                      <td colSpan={7} className="p-3 text-center text-slate-500 italic border-r border-slate-800/80">
                        Belum melaksanakan tes kebugaran
                      </td>
                    )}

                    {/* Action Buttons */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openTestModal(siswa)}
                          title="Input / Edit Hasil Uji TKJI"
                          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {record && (
                          <>
                            <button
                              onClick={() => onRequestAIStudentFeedback(siswa, record)}
                              title="Dapatkan Rekomendasi Latihan Personal AI"
                              className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onPrintStudentCard(siswa, record)}
                              title="Cetak Kartu Hasil Kebugaran Siswa"
                              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Input / Edit TKJI Modal */}
      {selectedStudentForTest && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-emerald-500/40 max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Input Form Uji TKJI (10-12 Tahun)
                </span>
                <h3 className="text-lg font-black text-white">{selectedStudentForTest.nama}</h3>
                <span className="text-xs text-slate-400">
                  {selectedStudentForTest.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • TB:{' '}
                  {selectedStudentForTest.tinggiBadan}cm • BB: {selectedStudentForTest.beratBadan}kg
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Kategori Sementara</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCategoryBadgeColor(previewCategory)}`}>
                  {previewCategory} ({previewTotal})
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveForm} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Lari Sprint 40m */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                  <div className="flex justify-between font-bold text-slate-200 mb-1">
                    <span>1. Lari Sprint 40m</span>
                    <span className="text-emerald-400">Skor: {previewScoreSprint}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.sprintSec}
                      onChange={(e) => setFormData({ ...formData, sprintSec: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold"
                    />
                    <span className="text-slate-400 font-semibold">detik</span>
                  </div>
                </div>

                {/* 2. Gantung Siku Tekuk */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                  <div className="flex justify-between font-bold text-slate-200 mb-1">
                    <span>2. Gantung Siku Tekuk</span>
                    <span className="text-emerald-400">Skor: {previewScorePull}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="1"
                      required
                      value={formData.pullUps}
                      onChange={(e) => setFormData({ ...formData, pullUps: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold"
                    />
                    <span className="text-slate-400 font-semibold">detik</span>
                  </div>
                </div>

                {/* 3. Baring Duduk 30s */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                  <div className="flex justify-between font-bold text-slate-200 mb-1">
                    <span>3. Baring Duduk 30 Detik</span>
                    <span className="text-emerald-400">Skor: {previewScoreSit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="1"
                      required
                      value={formData.sitUps}
                      onChange={(e) => setFormData({ ...formData, sitUps: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold"
                    />
                    <span className="text-slate-400 font-semibold">kali</span>
                  </div>
                </div>

                {/* 4. Loncat Tegak */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                  <div className="flex justify-between font-bold text-slate-200 mb-1">
                    <span>4. Loncat Tegak (Jump)</span>
                    <span className="text-emerald-400">Skor: {previewScoreJump}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="1"
                      required
                      value={formData.verticalJumpCm}
                      onChange={(e) => setFormData({ ...formData, verticalJumpCm: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold"
                    />
                    <span className="text-slate-400 font-semibold">cm</span>
                  </div>
                </div>

                {/* 5. Lari 600m */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 sm:col-span-2">
                  <div className="flex justify-between font-bold text-slate-200 mb-1">
                    <span>5. Lari Jarak Sedang (600 Meter)</span>
                    <span className="text-emerald-400">
                      Skor: {previewScoreRun} ({formatSecondsToMinutes(formData.runSec)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="1"
                      required
                      value={formData.runSec}
                      onChange={(e) => setFormData({ ...formData, runSec: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold"
                    />
                    <span className="text-slate-400 font-semibold">detik</span>
                  </div>
                </div>
              </div>

              {/* Tanggal Pelaksanaan */}
              <div className="text-xs">
                <label className="text-slate-300 font-semibold block mb-1">Tanggal Tes Lapangan:</label>
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForTest(null)}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  Simpan Nilai TKJI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
