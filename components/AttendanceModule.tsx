'use client';

import React, { useState, useMemo } from 'react';
import { 
  UserCheck, Calendar, Sun, CloudRain, Thermometer, CheckCheck, 
  FileEdit, BookOpen, AlertCircle, Save, Plus, Clock 
} from 'lucide-react';
import { Siswa, PresensiHarian, PresensiRecord, JurnalMengajar } from '@/lib/types';
import { DocumentExportToolbar } from '@/components/DocumentExportToolbar';
import { buildStandardWordHtml, escapeHtml } from '@/lib/export-utils';

interface AttendanceModuleProps {
  students: Siswa[];
  selectedClassId: string;
  classNameTitle: string;
  presensiList: PresensiHarian[];
  jurnalList: JurnalMengajar[];
  onSavePresensi: (presensi: PresensiHarian) => void;
  onSaveJurnal: (jurnal: JurnalMengajar) => void;
}

export function AttendanceModule({
  students,
  selectedClassId,
  classNameTitle,
  presensiList,
  jurnalList,
  onSavePresensi,
  onSaveJurnal,
}: AttendanceModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'presensi' | 'jurnal'>('presensi');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [cuaca, setCuaca] = useState<PresensiHarian['cuaca']>('Cerah');
  const [suhuUdara, setSuhuUdara] = useState<string>('28°C');
  const [catatanGuru, setCatatanGuru] = useState<string>(
    'Siswa mengenakan seragam olahraga lengkap. Pemanasan 15 menit terlaksana tertib.'
  );

  // Records overrides for current attendance form
  const [records, setRecords] = useState<Record<string, { status: PresensiRecord['status']; keterangan: string }>>({});

  const effectiveRecords = useMemo(() => {
    const merged: Record<string, { status: PresensiRecord['status']; keterangan: string }> = {};
    students.forEach((s) => {
      merged[s.id] = records[s.id] || { status: 'hadir', keterangan: '' };
    });
    return merged;
  }, [students, records]);

  // Jurnal Mengajar Form State
  const [jurnalForm, setJurnalForm] = useState({
    materi: 'Aktivitas Kebugaran Jasmani Terkait Kesehatan (Daya Tahan & Kelincahan)',
    faseKurikulum: 'Fase B (Kelas 4)',
    elemenCapaian: 'Keterampilan Gerak & Pemanfaatan Gerak',
    tujuanPembelajaran: 'Peserta didik mampu mempraktikkan bentuk-bentuk latihan kebugaran jasmani sederhana serta memantau denyut nadi istirahat dan latihan.',
    ringkasanAktivitas: 'Pemanasan statis dan dinamis 10 menit. Lari shuttle run 4x5m berpasangan. Pendinginan dan refleksi hidrasi.',
    kendalaDanSolusi: 'Kondisi lapangan agak berdebu saat terik; siswa diimbau memakai sepatu olahraga tertutup dan minum berkala.',
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Mark all present
  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: PresensiRecord['status']; keterangan: string }> = {};
    students.forEach((s) => {
      updated[s.id] = { status: 'hadir', keterangan: '' };
    });
    setRecords(updated);
  };

  // Change individual student status
  const handleStatusChange = (siswaId: string, status: PresensiRecord['status']) => {
    setRecords((prev) => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], status },
    }));
  };

  // Change individual student note
  const handleNoteChange = (siswaId: string, keterangan: string) => {
    setRecords((prev) => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], keterangan },
    }));
  };

  // Save Presensi
  const handleSubmitPresensi = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRecords: PresensiRecord[] = students.map((s) => ({
      siswaId: s.id,
      status: records[s.id]?.status || 'hadir',
      keterangan: records[s.id]?.keterangan || undefined,
    }));

    const presensiData: PresensiHarian = {
      id: `pres-${selectedClassId}-${selectedDate}`,
      tanggal: selectedDate,
      kelasId: selectedClassId,
      cuaca,
      suhuUdara,
      records: finalRecords,
      catatanGuru,
    };

    onSavePresensi(presensiData);
    setStatusMessage('Presensi harian olahraga berhasil disimpan secara sistematis.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Save Jurnal
  const handleSubmitJurnal = (e: React.FormEvent) => {
    e.preventDefault();
    const newJurnal: JurnalMengajar = {
      id: `jrn-${Date.now()}`,
      tanggal: selectedDate,
      kelasId: selectedClassId,
      ...jurnalForm,
    };

    onSaveJurnal(newJurnal);
    setStatusMessage('Jurnal mengajar PJOK berhasil direkam.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Calculate attendance counters
  const hadirCount = Object.values(effectiveRecords).filter((r) => r.status === 'hadir').length;
  const sakitCount = Object.values(effectiveRecords).filter((r) => r.status === 'sakit').length;
  const izinCount = Object.values(effectiveRecords).filter((r) => r.status === 'izin').length;
  const alpaCount = Object.values(effectiveRecords).filter((r) => r.status === 'alpa').length;

  const buildPresensiHtml = () => {
    const rowsHtml = students
      .map((siswa, idx) => {
        const rec = effectiveRecords[siswa.id] || { status: 'hadir', keterangan: '' };
        const noteParts = [
          rec.keterangan ? rec.keterangan : '',
          siswa.catatanMedis ? `Medis: ${siswa.catatanMedis}` : '',
        ].filter(Boolean);
        return `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td><strong>${escapeHtml(siswa.nama)}</strong><br/><small>NISN: ${escapeHtml(siswa.nisn)}</small></td>
          <td style="text-align:center;">${siswa.gender}</td>
          <td style="text-align:center; text-transform:uppercase;"><strong>${escapeHtml(rec.status)}</strong></td>
          <td>${escapeHtml(noteParts.join(' | ') || '-')}</td>
        </tr>`;
      })
      .join('');

    const bodyHtml = `
      <div class="kop">
        <h2>DAFTAR PRESENSI HARIAN PEMBELAJARAN PJOK</h2>
        <h3>${escapeHtml(classNameTitle)}</h3>
        <p>Administrasi Kehadiran Lapangan &amp; Pemantauan Kondisi Fisik Siswa</p>
      </div>
      <table class="meta-table">
        <tr><td style="width:150px;"><strong>Tanggal</strong></td><td>: ${escapeHtml(selectedDate)}</td><td style="width:130px;"><strong>Cuaca / Suhu</strong></td><td>: ${escapeHtml(cuaca)} (${escapeHtml(suhuUdara)})</td></tr>
        <tr><td><strong>Rekap Kehadiran</strong></td><td colspan="3">: Hadir (${hadirCount}), Sakit (${sakitCount}), Izin (${izinCount}), Alpa (${alpaCount}) dari ${students.length} siswa</td></tr>
        <tr><td><strong>Catatan Guru</strong></td><td colspan="3">: ${escapeHtml(catatanGuru || '-')}</td></tr>
      </table>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:32px;">No</th>
            <th>Nama Siswa</th>
            <th style="width:36px;">L/P</th>
            <th style="width:85px;">Status</th>
            <th>Catatan / Keluhan Kesehatan</th>
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
      title: `Presensi Harian PJOK - ${classNameTitle} (${selectedDate})`,
      bodyHtml,
    });
  };

  const buildJurnalHtml = () => {
    const allEntries: JurnalMengajar[] = [
      {
        id: 'current',
        tanggal: selectedDate,
        kelasId: selectedClassId,
        ...jurnalForm,
      },
      ...jurnalList.filter((j) => j.tanggal !== selectedDate || j.materi !== jurnalForm.materi),
    ];

    const rowsHtml = allEntries
      .map(
        (j, idx) => `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td style="text-align:center;">${escapeHtml(j.tanggal)}</td>
        <td><strong>${escapeHtml(j.materi)}</strong><br/><small>${escapeHtml(j.faseKurikulum)}</small></td>
        <td>${escapeHtml(j.tujuanPembelajaran)}</td>
        <td>${escapeHtml(j.ringkasanAktivitas)}</td>
        <td>${escapeHtml(j.kendalaDanSolusi)}</td>
      </tr>`
      )
      .join('');

    const bodyHtml = `
      <div class="kop">
        <h2>JURNAL MENGAJAR HARIAN GURU PJOK</h2>
        <h3>${escapeHtml(classNameTitle)} &bull; ${escapeHtml(jurnalForm.faseKurikulum)}</h3>
        <p>Elemen Capaian: ${escapeHtml(jurnalForm.elemenCapaian)}</p>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:28px;">No</th>
            <th style="width:72px;">Tanggal</th>
            <th>Materi &amp; Fase</th>
            <th>Tujuan Pembelajaran</th>
            <th>Ringkasan Aktivitas Lapangan</th>
            <th>Kendala &amp; Solusi</th>
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
      title: `Jurnal Mengajar PJOK - ${classNameTitle}`,
      bodyHtml,
      orientation: 'landscape',
    });
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between">
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tab Switcher & Export Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-700 pb-3 gap-3">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveSubTab('presensi')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'presensi'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Presensi Lapangan Siswa</span>
          </button>

          <button
            onClick={() => setActiveSubTab('jurnal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'jurnal'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Jurnal Mengajar Guru PJOK</span>
          </button>
        </div>

        <DocumentExportToolbar
          filename={
            activeSubTab === 'presensi'
              ? `Presensi_PJOK_${classNameTitle}_${selectedDate}`
              : `Jurnal_Mengajar_PJOK_${classNameTitle}`
          }
          title={
            activeSubTab === 'presensi'
              ? `Daftar Presensi Harian PJOK - ${classNameTitle}`
              : `Jurnal Mengajar Guru PJOK - ${classNameTitle}`
          }
          getHtmlContent={activeSubTab === 'presensi' ? buildPresensiHtml : buildJurnalHtml}
          orientation={activeSubTab === 'jurnal' ? 'landscape' : 'portrait'}
          compact
        />
      </div>

      {activeSubTab === 'presensi' ? (
        <form onSubmit={handleSubmitPresensi} className="space-y-6">
          {/* Field Condition & Metadata Bar */}
          <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Tanggal Pembelajaran:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Kondisi Cuaca Lapangan:</label>
                <select
                  value={cuaca}
                  onChange={(e) => setCuaca(e.target.value as PresensiHarian['cuaca'])}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-semibold"
                >
                  <option value="Cerah">Cerah Ideal</option>
                  <option value="Berawan">Berawan Sejuk</option>
                  <option value="Panas Terik">Panas Terik (Perbanyak Minum)</option>
                  <option value="Hujan (Olahraga di Aula)">Hujan (Olahraga di Aula)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Estimasi Suhu Udara:</label>
                <input
                  type="text"
                  value={suhuUdara}
                  onChange={(e) => setSuhuUdara(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-emerald-400 border border-emerald-500/30 rounded-lg px-3 py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Semua Hadir Siap</span>
                </button>
              </div>
            </div>

            {/* Attendance Summary Count */}
            <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-700/80 text-center">
              <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                <span className="text-[10px] text-emerald-400 font-bold block">Hadir Siap</span>
                <span className="text-lg font-black text-white">{hadirCount}</span>
              </div>
              <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                <span className="text-[10px] text-amber-400 font-bold block">Sakit (Dispensasi)</span>
                <span className="text-lg font-black text-white">{sakitCount}</span>
              </div>
              <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
                <span className="text-[10px] text-blue-400 font-bold block">Izin</span>
                <span className="text-lg font-black text-white">{izinCount}</span>
              </div>
              <div className="bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                <span className="text-[10px] text-rose-400 font-bold block">Tanpa Keterangan</span>
                <span className="text-lg font-black text-white">{alpaCount}</span>
              </div>
            </div>
          </div>

          {/* Student List Table */}
          <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3">Daftar Kehadiran Siswa ({classNameTitle})</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-700/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-300 font-bold border-b border-slate-700">
                    <th className="p-3 w-12 text-center border-r border-slate-700/80">No</th>
                    <th className="p-3 min-w-[180px] border-r border-slate-700/80">Nama Siswa</th>
                    <th className="p-3 text-center border-r border-slate-700/80">L/P</th>
                    <th className="p-3 text-center min-w-[200px] border-r border-slate-700/80">Status Kehadiran</th>
                    <th className="p-3 min-w-[200px]">Catatan / Keluhan Kesehatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {students.map((siswa, idx) => {
                    const currentStatus = records[siswa.id]?.status || 'hadir';
                    return (
                      <tr key={siswa.id} className={`${idx % 2 === 1 ? 'bg-slate-900/35' : ''} hover:bg-slate-750/50`}>
                        <td className="p-3 text-center text-slate-400 font-mono tabular-nums border-r border-slate-800/80">{idx + 1}</td>
                        <td className="p-3 border-r border-slate-800/80">
                          <div className="font-bold text-white">{siswa.nama}</div>
                          {siswa.catatanMedis && (
                            <div className="text-[10px] text-amber-400">⚠️ {siswa.catatanMedis}</div>
                          )}
                        </td>
                        <td className="p-3 text-center border-r border-slate-800/80">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              siswa.gender === 'L' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
                            }`}
                          >
                            {siswa.gender}
                          </span>
                        </td>
                        <td className="p-3 text-center border-r border-slate-800/80">
                          <div className="flex items-center justify-center gap-1">
                            {[
                              { id: 'hadir', label: 'Hadir', activeClass: 'bg-emerald-500 text-slate-950' },
                              { id: 'sakit', label: 'Sakit', activeClass: 'bg-amber-500 text-slate-950' },
                              { id: 'izin', label: 'Izin', activeClass: 'bg-blue-500 text-slate-950' },
                              { id: 'alpa', label: 'Alpa', activeClass: 'bg-rose-500 text-white' },
                            ].map((st) => (
                              <button
                                type="button"
                                key={st.id}
                                onClick={() => handleStatusChange(siswa.id, st.id as PresensiRecord['status'])}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                  currentStatus === st.id
                                    ? st.activeClass
                                    : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                                }`}
                              >
                                {st.label}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            placeholder="Contoh: Sakit pusing, asma kambuh..."
                            value={records[siswa.id]?.keterangan || ''}
                            onChange={(e) => handleNoteChange(siswa.id, e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 placeholder-slate-500 text-xs focus:border-emerald-500 outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <label className="text-slate-300 font-semibold text-xs block mb-1">
                Catatan Umum Guru PJOK:
              </label>
              <textarea
                value={catatanGuru}
                onChange={(e) => setCatatanGuru(e.target.value)}
                placeholder="Catatan pelaksanaan pembelajaran, kendala cuaca, atau penanganan siswa khusus..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none h-20"
              />
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Presensi Harian</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Jurnal Mengajar Form */
        <div className="space-y-6">
          <form onSubmit={handleSubmitJurnal} className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  Administrasi Guru PJOK
                </span>
                <h3 className="text-lg font-black text-white">Form Jurnal Mengajar Harian</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">{classNameTitle}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Materi / Topik Pembelajaran:</label>
                <input
                  type="text"
                  required
                  value={jurnalForm.materi}
                  onChange={(e) => setJurnalForm({ ...jurnalForm, materi: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Fase / Elemen Kurikulum:</label>
                <input
                  type="text"
                  value={jurnalForm.faseKurikulum}
                  onChange={(e) => setJurnalForm({ ...jurnalForm, faseKurikulum: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-300 font-semibold block mb-1">Tujuan Pembelajaran:</label>
                <textarea
                  value={jurnalForm.tujuanPembelajaran}
                  onChange={(e) => setJurnalForm({ ...jurnalForm, tujuanPembelajaran: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white h-20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-300 font-semibold block mb-1">Ringkasan Aktivitas Lapangan:</label>
                <textarea
                  value={jurnalForm.ringkasanAktivitas}
                  onChange={(e) => setJurnalForm({ ...jurnalForm, ringkasanAktivitas: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white h-20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-300 font-semibold block mb-1">Kendala & Solusi Lapangan:</label>
                <textarea
                  value={jurnalForm.kendalaDanSolusi}
                  onChange={(e) => setJurnalForm({ ...jurnalForm, kendalaDanSolusi: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white h-20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-lg shadow-teal-600/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Jurnal Mengajar</span>
              </button>
            </div>
          </form>

          {/* Previous Jurnal Entries */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Riwayat Jurnal Mengajar Terdaftar</h3>
            {jurnalList.map((j) => (
              <div key={j.id} className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-mono text-emerald-400 font-bold">{j.tanggal}</span>
                  <span className="bg-slate-700 px-2 py-0.5 rounded text-[10px] text-slate-200">
                    {j.faseKurikulum}
                  </span>
                </div>
                <div className="text-sm font-black text-white">{j.materi}</div>
                <p className="text-slate-300"><strong className="text-slate-400">Aktivitas:</strong> {j.ringkasanAktivitas}</p>
                <p className="text-slate-300"><strong className="text-slate-400">Kendala & Solusi:</strong> {j.kendalaDanSolusi}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
