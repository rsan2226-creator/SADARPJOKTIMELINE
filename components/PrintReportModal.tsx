'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Siswa, TesKebugaranTKJI, Kelas } from '@/lib/types';
import { calculateIMT, formatSecondsToMinutes } from '@/lib/tkji';
import { buildStandardWordHtml, escapeHtml } from '@/lib/export-utils';
import { DocumentExportToolbar } from './DocumentExportToolbar';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Siswa[];
  tkjiRecords: TesKebugaranTKJI[];
  currentClass: Kelas;
  selectedStudentId?: string;
}

export function PrintReportModal({
  isOpen,
  onClose,
  students,
  tkjiRecords,
  currentClass,
  selectedStudentId,
}: PrintReportModalProps) {
  const [activeStudentId, setActiveStudentId] = useState<string>(
    selectedStudentId || students[0]?.id || ''
  );

  if (!isOpen) return null;

  const targetStudent = students.find((s) => s.id === activeStudentId) || students[0];
  const targetTKJI = tkjiRecords.find((r) => r.siswaId === targetStudent?.id);
  const { imt, kategori: imtKat } = calculateIMT(
    targetStudent?.beratBadan || 0,
    targetStudent?.tinggiBadan || 0
  );

  const buildExportHtml = () => {
    if (!targetStudent) return '';
    const tgl = targetTKJI?.tanggal || new Date().toISOString().split('T')[0];
    const bodyHtml = `
      <div class="kop">
        <h2>PEMERINTAH DAERAH DINAS PENDIDIKAN &amp; KEBUDAYAAN</h2>
        <h2>SD NEGERI NUSANTARA TERPADU</h2>
        <h3>Jalan Pendidikan No. 45, Kecamatan Bugar Sejahtera &bull; Telp: (021) 765-4321</h3>
      </div>

      <h2 style="text-align: center; text-decoration: underline; margin-top: 12px;">
        KARTU HASIL TES KEBUGARAN JASMANI INDONESIA (TKJI)
      </h2>
      <p style="text-align: center; color: #475569; margin-top: 0; font-size: 9.5pt;">
        SADARPJOK: Sistem Pemantauan Aktivitas &amp; Kebugaran Siswa Real-Time
      </p>

      <table class="identity-table">
        <tr>
          <td width="18%"><strong>Nama Siswa</strong></td>
          <td width="32%">: ${escapeHtml(targetStudent.nama)}</td>
          <td width="18%"><strong>Jenis Kelamin</strong></td>
          <td width="32%">: ${targetStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
        </tr>
        <tr>
          <td><strong>NISN</strong></td>
          <td>: ${escapeHtml(targetStudent.nisn)}</td>
          <td><strong>Antropometri</strong></td>
          <td>: TB ${targetStudent.tinggiBadan} cm | BB ${targetStudent.beratBadan} kg</td>
        </tr>
        <tr>
          <td><strong>Kelas / TA</strong></td>
          <td>: ${escapeHtml(currentClass.nama)} / ${escapeHtml(currentClass.tahunAjaran)}</td>
          <td><strong>Status Gizi (IMT)</strong></td>
          <td>: ${imt} (${escapeHtml(imtKat)})</td>
        </tr>
      </table>

      <table class="data-table">
        <thead>
          <tr>
            <th width="6%">No</th>
            <th width="28%">Item Tes Kebugaran</th>
            <th width="30%">Komponen Fisik</th>
            <th width="18%">Hasil Prestasi</th>
            <th width="18%">Nilai Standar (1-5)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td align="center">1</td>
            <td><strong>Lari Sprint 40 Meter</strong></td>
            <td>Kecepatan (Speed)</td>
            <td align="center">${targetTKJI?.sprintSec || '-'} detik</td>
            <td align="center"><strong>${targetTKJI?.scoreSprint || '-'}</strong></td>
          </tr>
          <tr>
            <td align="center">2</td>
            <td><strong>Gantung Siku Tekuk</strong></td>
            <td>Kekuatan &amp; Daya Tahan Lengan</td>
            <td align="center">${targetTKJI?.pullUps || '-'} detik</td>
            <td align="center"><strong>${targetTKJI?.scorePullUps || '-'}</strong></td>
          </tr>
          <tr>
            <td align="center">3</td>
            <td><strong>Baring Duduk 30 Detik</strong></td>
            <td>Kekuatan Otot Perut (Core)</td>
            <td align="center">${targetTKJI?.sitUps || '-'} kali</td>
            <td align="center"><strong>${targetTKJI?.scoreSitUps || '-'}</strong></td>
          </tr>
          <tr>
            <td align="center">4</td>
            <td><strong>Loncat Tegak (Vertical Jump)</strong></td>
            <td>Daya Ledak Otot Tungkai</td>
            <td align="center">${targetTKJI?.verticalJumpCm || '-'} cm</td>
            <td align="center"><strong>${targetTKJI?.scoreJump || '-'}</strong></td>
          </tr>
          <tr>
            <td align="center">5</td>
            <td><strong>Lari 600 Meter</strong></td>
            <td>Daya Tahan Kardiorespirasi</td>
            <td align="center">${targetTKJI ? formatSecondsToMinutes(targetTKJI.runSec) : '-'}</td>
            <td align="center"><strong>${targetTKJI?.scoreRun || '-'}</strong></td>
          </tr>
          <tr>
            <td colspan="4" align="right"><strong>JUMLAH TOTAL NILAI (Skala 5 - 25)</strong></td>
            <td align="center"><strong>${targetTKJI?.totalNilai || '-'}</strong></td>
          </tr>
          <tr>
            <td colspan="4" align="right"><strong>KATEGORI KEBUGARAN JASMANI (TKJI)</strong></td>
            <td align="center"><strong>${escapeHtml(targetTKJI?.kategori || 'Belum Diuji')}</strong></td>
          </tr>
        </tbody>
      </table>

      <div style="border: 1px solid #334155; padding: 8px 10px; margin-top: 10px; margin-bottom: 14px;">
        <strong>Catatan / Rekomendasi Guru PJOK:</strong><br/>
        <em>${escapeHtml(targetTKJI?.catatan || 'Pertahankan kebiasaan berolahraga teratur 3 kali seminggu, perbanyak konsumsi air putih, dan konsumsi makanan gizi seimbang.')}</em>
      </div>

      <table class="ttd-table">
        <tr>
          <td width="50%">
            Mengetahui,<br/>Orang Tua / Wali Siswa<br/><br/><br/><br/>
            <strong>( ............................................ )</strong>
          </td>
          <td width="50%">
            Jakarta, ${escapeHtml(tgl)}<br/>Guru Pendidikan Jasmani (PJOK)<br/><br/><br/><br/>
            <strong style="text-decoration: underline;">${escapeHtml(currentClass.guruPJOK)}</strong><br/>
            NIP. 19840315 200902 1 004
          </td>
        </tr>
      </table>
    `;

    return buildStandardWordHtml({
      title: `Kartu Hasil TKJI - ${targetStudent.nama}`,
      bodyHtml,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-3xl w-full p-6 shadow-2xl space-y-4 my-8">
        {/* Controls - Hidden in print */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700 no-print">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300">Pilih Siswa:</span>
            <select
              value={activeStudentId}
              onChange={(e) => setActiveStudentId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nomorAbsen}. {s.nama} ({s.gender})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DocumentExportToolbar
              filename={`Kartu_Hasil_TKJI_${(targetStudent?.nama || 'Siswa').replace(/\s+/g, '_')}`}
              title={`Kartu Hasil TKJI - ${targetStudent?.nama || 'Siswa'}`}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
              compact
            />
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (Simulated Paper) */}
        <div className="bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0 font-sans">
          {/* Header Surat Resmi */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              PEMERINTAH DAERAH DINAS PENDIDIKAN & KEBUDAYAAN
            </div>
            <div className="text-lg font-black tracking-tight text-slate-900 mt-0.5">
              SD NEGERI NUSANTARA TERPADU
            </div>
            <div className="text-[11px] text-slate-600">
              Jalan Pendidikan No. 45, Kecamatan Bugar Sejahtera • Telp: (021) 765-4321
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-5">
            <h2 className="text-base font-black uppercase tracking-wide text-slate-900 underline decoration-2">
              KARTU HASIL TES KEBUGARAN JASMANI INDONESIA (TKJI)
            </h2>
            <div className="text-xs text-slate-600 font-semibold mt-0.5">
              SADARPJOK: Sistem Pemantauan Aktivitas & Kebugaran Siswa Real-Time
            </div>
          </div>

          {/* Student Identitas */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-5 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-28 text-slate-600 font-semibold">Nama Siswa:</span>
                <span className="font-bold text-slate-900">{targetStudent.nama}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-600 font-semibold">Nomor Induk (NISN):</span>
                <span className="font-mono font-bold text-slate-800">{targetStudent.nisn}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-600 font-semibold">Kelas / Semester:</span>
                <span className="font-semibold text-slate-800">
                  {currentClass.nama} / {currentClass.tahunAjaran}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-28 text-slate-600 font-semibold">Jenis Kelamin:</span>
                <span className="font-semibold text-slate-800">
                  {targetStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-600 font-semibold">Antropometri:</span>
                <span className="font-semibold text-slate-800">
                  TB: {targetStudent.tinggiBadan} cm | BB: {targetStudent.beratBadan} kg
                </span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-600 font-semibold">Status Gizi (IMT):</span>
                <span className="font-bold text-slate-900">
                  {imt} ({imtKat})
                </span>
              </div>
            </div>
          </div>

          {/* TKJI Table */}
          <div className="mb-5">
            <table className="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="border border-slate-300 p-2 text-center w-8">No</th>
                  <th className="border border-slate-300 p-2 text-left">Item Tes Kebugaran</th>
                  <th className="border border-slate-300 p-2 text-left">Komponen Fisik</th>
                  <th className="border border-slate-300 p-2 text-center">Hasil Prestasi</th>
                  <th className="border border-slate-300 p-2 text-center">Nilai Standar (1-5)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-mono">1</td>
                  <td className="border border-slate-300 p-2 font-semibold">Lari Sprint 40 Meter</td>
                  <td className="border border-slate-300 p-2 text-slate-600">Kecepatan (Speed)</td>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">
                    {targetTKJI?.sprintSec || '-'} detik
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-slate-900">
                    {targetTKJI?.scoreSprint || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-mono">2</td>
                  <td className="border border-slate-300 p-2 font-semibold">Gantung Siku Tekuk</td>
                  <td className="border border-slate-300 p-2 text-slate-600">Kekuatan & Daya Tahan Lengan</td>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">
                    {targetTKJI?.pullUps || '-'} detik
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-slate-900">
                    {targetTKJI?.scorePullUps || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-mono">3</td>
                  <td className="border border-slate-300 p-2 font-semibold">Baring Duduk 30 Detik</td>
                  <td className="border border-slate-300 p-2 text-slate-600">Kekuatan Otot Perut (Core)</td>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">
                    {targetTKJI?.sitUps || '-'} kali
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-slate-900">
                    {targetTKJI?.scoreSitUps || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-mono">4</td>
                  <td className="border border-slate-300 p-2 font-semibold">Loncat Tegak (Vertical Jump)</td>
                  <td className="border border-slate-300 p-2 text-slate-600">Daya Ledak Otot Tungkai</td>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">
                    {targetTKJI?.verticalJumpCm || '-'} cm
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-slate-900">
                    {targetTKJI?.scoreJump || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-mono">5</td>
                  <td className="border border-slate-300 p-2 font-semibold">Lari 600 Meter</td>
                  <td className="border border-slate-300 p-2 text-slate-600">Daya Tahan Kardiorespirasi</td>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">
                    {targetTKJI ? formatSecondsToMinutes(targetTKJI.runSec) : '-'}
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-slate-900">
                    {targetTKJI?.scoreRun || '-'}
                  </td>
                </tr>
                <tr className="bg-slate-100 font-black">
                  <td colSpan={4} className="border border-slate-300 p-2 text-right">
                    JUMLAH TOTAL NILAI (Skala 5 - 25):
                  </td>
                  <td className="border border-slate-300 p-2 text-center text-sm font-mono font-black text-emerald-800">
                    {targetTKJI?.totalNilai || '-'}
                  </td>
                </tr>
                <tr className="bg-emerald-50/50 font-black">
                  <td colSpan={4} className="border border-slate-300 p-2 text-right">
                    KATEGORI KEBUGARAN JASMANI (TKJI):
                  </td>
                  <td className="border border-slate-300 p-2 text-center text-sm uppercase text-emerald-800">
                    {targetTKJI?.kategori || 'Belum Diuji'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Catatan Guru & Rekomendasi */}
          <div className="border border-slate-300 p-3 rounded-lg text-xs mb-8">
            <span className="font-bold text-slate-800 block mb-1">Catatan / Rekomendasi Guru PJOK:</span>
            <p className="text-slate-700 leading-relaxed italic">
              {targetTKJI?.catatan ||
                'Pertahankan kebiasaan berolahraga teratur 3 kali seminggu, perbanyak konsumsi air putih, dan konsumsi makanan gizi seimbang.'}
            </p>
          </div>

          {/* Tanda Tangan */}
          <div className="grid grid-cols-2 text-xs text-center pt-2">
            <div>
              <div className="text-slate-600">Mengetahui,</div>
              <div className="font-semibold text-slate-800">Orang Tua / Wali Siswa</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-900">( ............................................ )</div>
            </div>

            <div>
              <div className="text-slate-600">
                Jakarta, {targetTKJI?.tanggal || new Date().toISOString().split('T')[0]}
              </div>
              <div className="font-semibold text-slate-800">Guru Pendidikan Jasmani (PJOK)</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-900 underline">{currentClass.guruPJOK}</div>
              <div className="text-[10px] text-slate-600">NIP. 19840315 200902 1 004</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
