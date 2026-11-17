'use client';

import React, { useState } from 'react';
import { 
  Users, UserPlus, Search, Edit2, Trash2, Heart, Shield, 
  Phone, Calendar, ArrowUpDown, Filter, Sparkles, Printer 
} from 'lucide-react';
import { Siswa, TesKebugaranTKJI } from '@/lib/types';
import { calculateIMT, getCategoryBadgeColor } from '@/lib/tkji';
import { DocumentExportToolbar } from '@/components/DocumentExportToolbar';
import { buildStandardWordHtml, escapeHtml } from '@/lib/export-utils';

interface StudentRosterProps {
  students: Siswa[];
  tkjiRecords: TesKebugaranTKJI[];
  selectedClassId: string;
  classNameTitle: string;
  onAddStudent: (siswa: Siswa) => void;
  onUpdateStudent: (siswa: Siswa) => void;
  onDeleteStudent: (id: string) => void;
  onSelectStudentForAI: (siswa: Siswa, tkji?: TesKebugaranTKJI) => void;
  onPrintStudentCard: (siswa: Siswa, tkji?: TesKebugaranTKJI) => void;
}

export function StudentRoster({
  students,
  tkjiRecords,
  selectedClassId,
  classNameTitle,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onSelectStudentForAI,
  onPrintStudentCard,
}: StudentRosterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'semua' | 'L' | 'P'>('semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Siswa | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Siswa>>({
    nama: '',
    nisn: '',
    gender: 'L',
    tanggalLahir: '2014-05-10',
    tinggiBadan: 140,
    beratBadan: 35,
    nomorAbsen: students.length + 1,
    catatanMedis: '',
    kontakDarurat: '',
  });

  const openAddModal = () => {
    setFormData({
      nama: '',
      nisn: `012984${Math.floor(1000 + Math.random() * 9000)}`,
      gender: 'L',
      tanggalLahir: '2014-05-10',
      tinggiBadan: 140,
      beratBadan: 35,
      nomorAbsen: students.length + 1,
      catatanMedis: '',
      kontakDarurat: '0812-xxxx-xxxx (Orang Tua)',
    });
    setEditingStudent(null);
    setShowAddModal(true);
  };

  const openEditModal = (siswa: Siswa) => {
    setEditingStudent(siswa);
    setFormData({ ...siswa });
    setShowAddModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama) return;

    if (editingStudent) {
      const updated: Siswa = {
        ...editingStudent,
        ...formData,
      } as Siswa;
      onUpdateStudent(updated);
    } else {
      const newSiswa: Siswa = {
        id: `s-${Date.now()}`,
        nisn: formData.nisn || `012984${Math.floor(1000 + Math.random() * 9000)}`,
        nama: formData.nama,
        gender: formData.gender || 'L',
        kelasId: selectedClassId,
        tanggalLahir: formData.tanggalLahir || '2014-05-10',
        tinggiBadan: Number(formData.tinggiBadan) || 140,
        beratBadan: Number(formData.beratBadan) || 35,
        nomorAbsen: Number(formData.nomorAbsen) || students.length + 1,
        catatanMedis: formData.catatanMedis || undefined,
        kontakDarurat: formData.kontakDarurat || undefined,
      };
      onAddStudent(newSiswa);
    }

    setShowAddModal(false);
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery);
    const matchesGender = genderFilter === 'semua' ? true : s.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  const buildExportHtml = () => {
    const rowsHtml = filteredStudents
      .map((s) => {
        const tkji = tkjiRecords.find((r) => r.siswaId === s.id);
        const { imt, kategori: imtKat } = calculateIMT(s.beratBadan, s.tinggiBadan);
        return `
        <tr>
          <td style="text-align:center;">${s.nomorAbsen}</td>
          <td>${escapeHtml(s.nisn)}</td>
          <td><strong>${escapeHtml(s.nama)}</strong></td>
          <td style="text-align:center;">${s.gender}</td>
          <td style="text-align:center;">${s.tinggiBadan} cm</td>
          <td style="text-align:center;">${s.beratBadan} kg</td>
          <td style="text-align:center;">${imt} (${escapeHtml(imtKat)})</td>
          <td style="text-align:center;">${tkji ? `${escapeHtml(tkji.kategori)} (${tkji.totalNilai})` : 'Belum Tes'}</td>
          <td>${escapeHtml(s.catatanMedis || '-')}</td>
          <td>${escapeHtml(s.kontakDarurat || '-')}</td>
        </tr>`;
      })
      .join('');

    const bodyHtml = `
      <div class="kop">
        <h2>DAFTAR INDUK PROFIL &amp; REKAM FISIK SISWA</h2>
        <h3>${escapeHtml(classNameTitle)}</h3>
        <p>Data Antropometri (TB, BB, IMT), Status TKJI, Riwayat Medis, dan Kontak Darurat</p>
      </div>
      <table class="meta-table">
        <tr><td style="width:150px;"><strong>Kelas / Rombel</strong></td><td>: ${escapeHtml(classNameTitle)}</td><td style="width:140px;"><strong>Jumlah Siswa</strong></td><td>: ${filteredStudents.length} Siswa (L: ${filteredStudents.filter((s) => s.gender === 'L').length}, P: ${filteredStudents.filter((s) => s.gender === 'P').length})</td></tr>
      </table>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:36px;">Absen</th>
            <th style="width:82px;">NISN</th>
            <th>Nama Lengkap</th>
            <th style="width:30px;">L/P</th>
            <th style="width:52px;">TB</th>
            <th style="width:52px;">BB</th>
            <th>IMT (Gizi)</th>
            <th>Status TKJI</th>
            <th>Catatan Medis</th>
            <th>Kontak Darurat</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <table class="ttd-table">
        <tr>
          <td style="width:55%;">Mengetahui,<br/>Kepala Sekolah<br/><br/><br/><br/><u><strong>..........................................</strong></u><br/>NIP. .................................</td>
          <td style="width:45%;">Guru Mata Pelajaran PJOK<br/><br/><br/><br/><br/><u><strong>..........................................</strong></u><br/>NIP. .................................</td>
        </tr>
      </table>
    `;

    return buildStandardWordHtml({
      title: `Daftar Induk Siswa - ${classNameTitle}`,
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
                Data Pokok Siswa
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-300">{classNameTitle}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white mt-1">
              Manajemen Profil & Rekam Fisik Siswa
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola data antropometri (TB, BB, IMT), riwayat kesehatan, dan kontak darurat siswa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <DocumentExportToolbar
              filename={`Daftar_Siswa_${classNameTitle}`}
              title={`Daftar Induk Siswa - ${classNameTitle}`}
              getHtmlContent={buildExportHtml}
              orientation="landscape"
              compact
            />
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Siswa Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Roster Controls */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'semua', label: 'Semua Siswa', count: students.length },
              { id: 'L', label: 'Laki-laki', count: students.filter((s) => s.gender === 'L').length },
              { id: 'P', label: 'Perempuan', count: students.filter((s) => s.gender === 'P').length },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setGenderFilter(f.id as 'semua' | 'L' | 'P')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  genderFilter === f.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-800'
                }`}
              >
                {f.label} ({f.count})
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

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((siswa) => {
            const tkji = tkjiRecords.find((r) => r.siswaId === siswa.id);
            const { imt, kategori: imtKat } = calculateIMT(siswa.beratBadan, siswa.tinggiBadan);

            return (
              <div
                key={siswa.id}
                className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/80 hover:border-slate-600 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                        siswa.gender === 'L'
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'bg-pink-600/20 text-pink-400 border border-pink-500/30'
                      }`}
                    >
                      {siswa.nomorAbsen}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{siswa.nama}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">NISN: {siswa.nisn}</span>
                    </div>
                  </div>

                  {tkji ? (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeColor(
                        tkji.kategori
                      )}`}
                    >
                      {tkji.kategori}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Belum Tes
                    </span>
                  )}
                </div>

                {/* Antropometri */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tinggi</span>
                    <span className="font-mono font-bold text-white">{siswa.tinggiBadan} cm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Berat</span>
                    <span className="font-mono font-bold text-white">{siswa.beratBadan} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">IMT</span>
                    <span className="font-mono font-bold text-teal-400">{imt}</span>
                  </div>
                </div>

                {/* Medical & Emergency info */}
                {siswa.catatanMedis && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300">
                    ⚠️ {siswa.catatanMedis}
                  </div>
                )}

                {siswa.kontakDarurat && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{siswa.kontakDarurat}</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectStudentForAI(siswa, tkji)}
                      title="Analisis Kebugaran AI"
                      className="p-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onPrintStudentCard(siswa, tkji)}
                      title="Cetak Rapor Kebugaran"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(siswa)}
                      title="Edit Data Siswa"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus data siswa ${siswa.nama}?`)) {
                          onDeleteStudent(siswa.id);
                        }
                      }}
                      title="Hapus Siswa"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              {editingStudent ? 'Edit Profil Siswa' : 'Tambah Siswa Baru'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Lengkapi data siswa untuk keperluan presensi dan tes kebugaran jasmani.
            </p>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-slate-300 font-semibold block mb-1">Nama Lengkap Siswa:</label>
                  <input
                    type="text"
                    required
                    value={formData.nama || ''}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Muhammad Rizky..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">NISN (10 Digit):</label>
                  <input
                    type="text"
                    required
                    value={formData.nisn || ''}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Jenis Kelamin:</label>
                  <select
                    value={formData.gender || 'L'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Tinggi Badan (cm):</label>
                  <input
                    type="number"
                    required
                    value={formData.tinggiBadan || 140}
                    onChange={(e) => setFormData({ ...formData, tinggiBadan: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Berat Badan (kg):</label>
                  <input
                    type="number"
                    required
                    value={formData.beratBadan || 35}
                    onChange={(e) => setFormData({ ...formData, beratBadan: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Tanggal Lahir:</label>
                  <input
                    type="date"
                    value={formData.tanggalLahir || '2014-05-10'}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Nomor Absen:</label>
                  <input
                    type="number"
                    value={formData.nomorAbsen || 1}
                    onChange={(e) => setFormData({ ...formData, nomorAbsen: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-slate-300 font-semibold block mb-1">Catatan Medis (Opsional):</label>
                  <input
                    type="text"
                    value={formData.catatanMedis || ''}
                    onChange={(e) => setFormData({ ...formData, catatanMedis: e.target.value })}
                    placeholder="Contoh: Riwayat asma ringan, alergi debu, cedera engkel..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-slate-300 font-semibold block mb-1">Kontak Darurat Orang Tua:</label>
                  <input
                    type="text"
                    value={formData.kontakDarurat || ''}
                    onChange={(e) => setFormData({ ...formData, kontakDarurat: e.target.value })}
                    placeholder="Contoh: 0812-3456-7890 (Ayah)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
