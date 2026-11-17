'use client';

import React, { useState } from 'react';
import { 
  Sparkles, Bot, Send, Copy, Check, RefreshCw, 
  Lightbulb, ShieldCheck, Heart, Dumbbell 
} from 'lucide-react';
import { Siswa, TesKebugaranTKJI } from '@/lib/types';
import { DocumentExportToolbar } from '@/components/DocumentExportToolbar';
import { FormattedGeneratorOutput } from '@/components/FormattedGeneratorOutput';
import { buildStandardWordHtml, escapeHtml, markdownToCleanHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

interface AiFitnessAdvisorProps {
  students: Siswa[];
  tkjiRecords: TesKebugaranTKJI[];
  classNameTitle: string;
  initialContext?: Record<string, unknown>;
}

export function AiFitnessAdvisor({
  students,
  tkjiRecords,
  classNameTitle,
  initialContext,
}: AiFitnessAdvisorProps) {
  const [mode, setMode] = useState<'student_feedback' | 'remedial_plan' | 'session_summary'>(
    initialContext?.siswaId ? 'student_feedback' : 'remedial_plan'
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    (initialContext?.siswaId as string) || (students[0]?.id || '')
  );
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const studentTKJI = tkjiRecords.find((r) => r.siswaId === selectedStudentId);

  const handleGenerate = async (targetMode: typeof mode = mode) => {
    setLoading(true);
    setAnalysisResult(null);

    let contextData: Record<string, unknown> = {};

    if (targetMode === 'student_feedback') {
      if (!selectedStudent) {
        setLoading(false);
        return;
      }
      contextData = {
        nama: selectedStudent.nama,
        gender: selectedStudent.gender,
        usia: 11,
        catatanMedis: selectedStudent.catatanMedis,
        tinggiBadan: selectedStudent.tinggiBadan,
        beratBadan: selectedStudent.beratBadan,
        sprintSec: studentTKJI?.sprintSec || 7.0,
        pullUps: studentTKJI?.pullUps || 18,
        sitUps: studentTKJI?.sitUps || 15,
        verticalJumpCm: studentTKJI?.verticalJumpCm || 32,
        runSec: studentTKJI?.runSec || 160,
        scoreSprint: studentTKJI?.scoreSprint || 3,
        scorePullUps: studentTKJI?.scorePullUps || 3,
        scoreSitUps: studentTKJI?.scoreSitUps || 3,
        scoreJump: studentTKJI?.scoreJump || 3,
        scoreRun: studentTKJI?.scoreRun || 3,
        totalNilai: studentTKJI?.totalNilai || 15,
        kategori: studentTKJI?.kategori || 'Sedang',
        imt: studentTKJI?.imt || 18.2,
        kategoriImt: studentTKJI?.kategoriImt || 'Normal',
      };
    } else if (targetMode === 'session_summary') {
      contextData = {
        judulMateri: initialContext?.judulMateri || 'Sirkuit Kebugaran Jasmani Lapangan',
        jenisAktivitas: initialContext?.jenisAktivitas || 'Sirkuit Kebugaran',
        elapsedSeconds: initialContext?.elapsedSeconds || 1800,
        activeStudentsCount: initialContext?.activeStudentsCount || students.length,
        totalStudentsCount: students.length,
        avgLaps: initialContext?.avgLaps || '5.5',
        fatiguedStudents: initialContext?.fatiguedStudents || 'Nihil',
      };
    } else {
      // Class remedial plan
      const catCounts = {
        'Sangat Baik': tkjiRecords.filter((r) => r.kategori === 'Sangat Baik').length,
        Baik: tkjiRecords.filter((r) => r.kategori === 'Baik').length,
        Sedang: tkjiRecords.filter((r) => r.kategori === 'Sedang').length,
        Kurang: tkjiRecords.filter((r) => r.kategori === 'Kurang' || r.kategori === 'Kurang Sekali').length,
      };
      contextData = {
        kelasNama: classNameTitle,
        distribution: catCounts,
        avgScore: 16.5,
      };
    }

    try {
      const res = await postJsonSafe<{ analysis?: string }>('/api/gemini/analyze', {
        mode: targetMode,
        contextData,
      });

      if (res.data?.analysis) {
        setAnalysisResult(res.data.analysis);
      } else {
        setAnalysisResult(
          res.error || 'Terjadi kendala jaringan saat menghubungi asisten AI. Silakan coba kembali.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildExportHtml = () => {
    const modeTitle =
      mode === 'student_feedback'
        ? `Umpan Balik Personal Siswa (${selectedStudent?.nama || '-'})`
        : mode === 'remedial_plan'
          ? 'Rencana Program Remedial Kelas'
          : 'Refleksi & Evaluasi Sesi Lapangan';

    const bodyHtml = `
      <div class="kop">
        <h2>LAPORAN ANALISIS &amp; REKOMENDASI KEBUGARAN JASMANI</h2>
        <h3>${escapeHtml(classNameTitle)} &bull; ${escapeHtml(modeTitle)}</h3>
        <p>Disusun dengan Asisten Analisis Kebugaran Terpadu SADARPJOK</p>
      </div>
      <table class="meta-table">
        <tr><td style="width:150px;"><strong>Kelas</strong></td><td>: ${escapeHtml(classNameTitle)}</td></tr>
        <tr><td><strong>Jenis Laporan</strong></td><td>: ${escapeHtml(modeTitle)}</td></tr>
        ${
          mode === 'student_feedback' && selectedStudent
            ? `<tr><td><strong>Nama Siswa</strong></td><td>: ${escapeHtml(selectedStudent.nama)} (TB: ${selectedStudent.tinggiBadan}cm, BB: ${selectedStudent.beratBadan}kg, TKJI: ${studentTKJI ? `${studentTKJI.kategori} / ${studentTKJI.totalNilai}` : 'Belum Tes'})</td></tr>`
            : ''
        }
      </table>
      ${markdownToCleanHtml(analysisResult || '')}
      <table class="ttd-table">
        <tr>
          <td style="width:55%;"></td>
          <td style="width:45%;">Guru Mata Pelajaran PJOK<br/><br/><br/><br/><u><strong>..........................................</strong></u><br/>NIP. .................................</td>
        </tr>
      </table>
    `;

    return buildStandardWordHtml({
      title: `Analisis Kebugaran - ${classNameTitle}`,
      bodyHtml,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                AI Coach & Guru PJOK Terpadu
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white mt-1">
              Asisten Analisis Kebugaran Jasmani
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Rekomendasi remedial terpersonalisasi, strategi diferensiasi Kurikulum Merdeka, dan evaluasi beban latihan.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-700/80">
          <button
            onClick={() => {
              setMode('student_feedback');
              setAnalysisResult(null);
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              mode === 'student_feedback'
                ? 'bg-purple-950/40 border-purple-500/80 text-white shadow-md shadow-purple-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-purple-300">1. Umpan Balik Personal Siswa</div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Rekomendasi latihan rumah & penguatan fisik sesuai hasil tes TKJI individu.
            </p>
          </button>

          <button
            onClick={() => {
              setMode('remedial_plan');
              setAnalysisResult(null);
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              mode === 'remedial_plan'
                ? 'bg-teal-950/40 border-teal-500/80 text-white shadow-md shadow-teal-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-teal-300">2. Rencana Remedial Kelas</div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Strategi modifikasi gerak adaptif untuk kelompok siswa yang belum tuntas.
            </p>
          </button>

          <button
            onClick={() => {
              setMode('session_summary');
              setAnalysisResult(null);
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              mode === 'session_summary'
                ? 'bg-emerald-950/40 border-emerald-500/80 text-white shadow-md shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-emerald-300">3. Refleksi & Pemulihan Sesi</div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Evaluasi intensitas latihan, protokol pendinginan, dan hidrasi lapangan.
            </p>
          </button>
        </div>
      </div>

      {/* Input Selector & Trigger */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl space-y-4">
        {mode === 'student_feedback' && (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1">
              <label className="text-slate-400 text-xs font-semibold block mb-1">
                Pilih Siswa untuk Dianalisis:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-purple-500"
              >
                {students.map((s) => {
                  const tkji = tkjiRecords.find((r) => r.siswaId === s.id);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.nomorAbsen}. {s.nama} ({s.gender}) — TKJI: {tkji ? `${tkji.kategori} (${tkji.totalNilai})` : 'Belum Tes'}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              onClick={() => handleGenerate('student_feedback')}
              disabled={loading}
              className="w-full sm:w-auto mt-4 sm:mt-5 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{loading ? 'Menganalisis Data...' : 'Generate Rekomendasi AI'}</span>
            </button>
          </div>
        )}

        {mode === 'remedial_plan' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300">
              Analisis agregat untuk seluruh data kebugaran <strong className="text-teal-400">{classNameTitle}</strong>.
            </div>
            <button
              onClick={() => handleGenerate('remedial_plan')}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-lg shadow-teal-600/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{loading ? 'Merancang Program...' : 'Generate Rencana Remedial Kelas'}</span>
            </button>
          </div>
        )}

        {mode === 'session_summary' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300">
              Evaluasi intensitas beban latihan, keselamatan siswa di lapangan, dan protokol pemulihan.
            </div>
            <button
              onClick={() => handleGenerate('session_summary')}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{loading ? 'Memproses Refleksi...' : 'Generate Evaluasi Sesi'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Result Display Box */}
      {analysisResult && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-black text-white">
                Hasil Analisis & Arahan Asisten AI SADARPJOK
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DocumentExportToolbar
                filename={`Analisis_Kebugaran_${classNameTitle}`}
                title={`Laporan Analisis Kebugaran - ${classNameTitle}`}
                getHtmlContent={buildExportHtml}
                compact
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>
            </div>
          </div>

          <FormattedGeneratorOutput
            markdown={analysisResult}
            docTitle="LAPORAN ANALISIS & REKOMENDASI KEBUGARAN JASMANI"
            docSubtitle={classNameTitle}
            metaRows={[
              { label: 'Kelas / Rombel', value: classNameTitle },
              {
                label: 'Mode Analisis',
                value:
                  mode === 'student_feedback'
                    ? `Umpan Balik Personal (${selectedStudent?.nama || '-'})`
                    : mode === 'remedial_plan'
                      ? 'Rencana Program Remedial Kelas'
                      : 'Refleksi & Evaluasi Sesi Lapangan',
              },
            ]}
            accent="purple"
            showSignatureFooter
          />
        </div>
      )}
    </div>
  );
}
