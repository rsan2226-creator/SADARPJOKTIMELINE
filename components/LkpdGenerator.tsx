'use client';

import React, { useState, useRef } from 'react';
import { 
  FileEdit, Sparkles, Copy, Check, 
  FileImage, RefreshCw, CheckCircle2, Star, 
  Heart, Target, HelpCircle, Layers, BookOpen, Compass, 
  Zap, Trophy, Clock, Calendar, User, School, CheckSquare, 
  Lightbulb, Dumbbell, ShieldCheck, Smile
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { LkpdData, getFallbackLkpdData } from '@/lib/lkpd-types';
import { DocumentExportToolbar } from './DocumentExportToolbar';
import { escapeHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

const DPL_OPTIONS = [
  'Penalaran Kritis',
  'Kolaborasi',
  'Kemandirian',
  'Kreativitas',
  'Kesehatan',
  'Kewargaan',
  'Komunikasi',
  'Keimanan dan Ketakwaan',
];

export function LkpdGenerator() {
  // Input form states
  const [mapel, setMapel] = useState<string>('Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)');
  const [jenjang, setJenjang] = useState<string>('Sekolah Dasar (SD)');
  const [kelas, setKelas] = useState<string>('Kelas V');
  const [fase, setFase] = useState<string>('Fase C');
  const [modelPembelajaran, setModelPembelajaran] = useState<string>('Problem Based Learning (PBL) & TGfU');
  const [topik, setTopik] = useState<string>('Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola');
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState<string>(
    'Peserta didik dapat menganalisis konsep posisi kaki tumpu, mempraktikkan operan dan kontrol bola mendatar berpasangan secara terarah, serta merefleksikan pentingnya kerja sama tim.'
  );
  const [selectedDpl, setSelectedDpl] = useState<string[]>([
    'Penalaran Kritis',
    'Kolaborasi',
    'Kemandirian',
    'Kesehatan',
  ]);

  // Visual & Data states
  const [lkpdData, setLkpdData] = useState<LkpdData>(() =>
    getFallbackLkpdData(mapel, jenjang, kelas, fase, modelPembelajaran, topik, tujuanPembelajaran, selectedDpl)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [previewTheme, setPreviewTheme] = useState<'teal' | 'emerald' | 'indigo' | 'amber'>('teal');

  // Ref for high-res PNG export
  const lkpdPrintRef = useRef<HTMLDivElement>(null);

  // Quick preset loader
  const handleLoadPreset = (preset: 'sepakbola' | 'kebugaran' | 'senam' | 'ipas' | 'matematika') => {
    if (preset === 'sepakbola') {
      setMapel('PJOK');
      setJenjang('Sekolah Dasar (SD)');
      setKelas('Kelas V');
      setFase('Fase C');
      setModelPembelajaran('Problem Based Learning (PBL) & TGfU');
      setTopik('Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola');
      setTujuanPembelajaran(
        'Peserta didik dapat menganalisis konsep posisi kaki tumpu, mempraktikkan operan dan kontrol bola mendatar berpasangan secara terarah, serta merefleksikan pentingnya kerja sama tim.'
      );
      setSelectedDpl(['Penalaran Kritis', 'Kolaborasi', 'Kemandirian', 'Kesehatan']);
      setPreviewTheme('teal');
    } else if (preset === 'kebugaran') {
      setMapel('PJOK');
      setJenjang('Sekolah Dasar (SD)');
      setKelas('Kelas VI');
      setFase('Fase C');
      setModelPembelajaran('Discovery Learning & Circuit Training');
      setTopik('Latihan Daya Tahan Jantung-Paru dan Kelincahan Sirkuit');
      setTujuanPembelajaran(
        'Peserta didik dapat mengidentifikasi intensitas denyut nadi latihan, melakukan rangkaian pos sirkuit kebugaran jasmani secara mandiri, dan mengevaluasi kebugaran fisiknya.'
      );
      setSelectedDpl(['Kemandirian', 'Kesehatan', 'Penalaran Kritis']);
      setPreviewTheme('emerald');
    } else if (preset === 'senam') {
      setMapel('PJOK');
      setJenjang('Sekolah Dasar (SD)');
      setKelas('Kelas IV');
      setFase('Fase B');
      setModelPembelajaran('Problem Based Learning (PBL)');
      setTopik('Pola Gerak Dominan Senam Lantai Guling Depan');
      setTujuanPembelajaran(
        'Peserta didik dapat menganalisis urutan gerak guling depan (forward roll) dengan aman, mempraktikkan sikap awal hingga akhir di atas matras, dan membangun rasa percaya diri.'
      );
      setSelectedDpl(['Kemandirian', 'Kesehatan', 'Penalaran Kritis']);
      setPreviewTheme('indigo');
    } else if (preset === 'ipas') {
      setMapel('IPAS');
      setJenjang('Sekolah Dasar (SD)');
      setKelas('Kelas V');
      setFase('Fase C');
      setModelPembelajaran('Problem Based Learning (PBL)');
      setTopik('Rantai Makanan dan Keseimbangan Ekosistem Sawah');
      setTujuanPembelajaran(
        'Peserta didik dapat menganalisis peran produsen, konsumen, dan dekomposer pada jaring-jaring makanan serta memprediksi dampak perburuan liar terhadap populasi hewan.'
      );
      setSelectedDpl(['Penalaran Kritis', 'Kewargaan', 'Kolaborasi']);
      setPreviewTheme('amber');
    } else if (preset === 'matematika') {
      setMapel('Matematika');
      setJenjang('SMP');
      setKelas('Kelas VII');
      setFase('Fase D');
      setModelPembelajaran('Problem Based Learning (PBL)');
      setTopik('Operasi Hitung Bilangan Bulat Negatif dan Positif');
      setTujuanPembelajaran(
        'Peserta didik dapat memodelkan masalah sehari-hari (suhu, ketinggian, hutang-piutang) dengan bilangan bulat dan menyelesaikan operasi hitung secara cermat.'
      );
      setSelectedDpl(['Penalaran Kritis', 'Kemandirian']);
      setPreviewTheme('indigo');
    }
  };

  const handleToggleDpl = (item: string) => {
    setSelectedDpl((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  // Generate LKPD via Gemini API
  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await postJsonSafe<{ data?: LkpdData }>(
        '/api/gemini/generate-lkpd',
        {
          mapel,
          jenjang,
          kelas,
          fase,
          modelPembelajaran,
          topik,
          tujuanPembelajaran,
          dimensiProfilLulusan: selectedDpl,
        }
      );
      if (res.data?.data) {
        setLkpdData(res.data.data);
      } else {
        const fallback = getFallbackLkpdData(mapel, jenjang, kelas, fase, modelPembelajaran, topik, tujuanPembelajaran, selectedDpl);
        setLkpdData(fallback);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // High-res Image Export (.PNG)
  const handleExportPNG = async () => {
    if (!lkpdPrintRef.current) return;
    setIsExportingImage(true);
    try {
      const dataUrl = await toPng(lkpdPrintRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `LKPD_${lkpdData.identitas.mataPelajaran.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export PNG error:', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  const buildExportHtml = () => {
    const d = lkpdData;
    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
      <meta charset='utf-8'>
      <title>${escapeHtml(d.identitas.judulLkpd)}</title>
      <style>
        @page { size: A4 portrait; margin: 1.5cm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #0f172a; }
        h1 { font-size: 15pt; color: #0f766e; text-align: center; margin-bottom: 4px; }
        h2 { font-size: 12pt; color: #0369a1; border-bottom: 2px solid #0284c7; padding-bottom: 4px; margin-top: 16px; page-break-after: avoid; }
        h3 { font-size: 11pt; color: #0f172a; margin-top: 10px; }
        table { border-collapse: collapse; width: 100%; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; break-inside: avoid; }
        .data-table th, .data-table td { border: 1px solid #334155; padding: 6px 8px; font-size: 9.5pt; }
        .data-table th { background-color: #f1f5f9; text-align: left; font-weight: bold; }
        .data-table tbody tr:nth-child(even) { background-color: #f8fafc; }
        .box-identitas { border: 1px solid #cbd5e1; padding: 10px; background-color: #f8fafc; border-radius: 6px; margin-bottom: 14px; }
        .card-tahap { border: 1px solid #cbd5e1; background-color: #f8fafc; padding: 12px; margin-bottom: 12px; border-radius: 6px; page-break-inside: avoid; }
        .soal-box { border-left: 3px solid #0284c7; padding-left: 10px; margin-bottom: 10px; page-break-inside: avoid; }
        .garis-jawaban { border-bottom: 1px dashed #94a3b8; height: 30px; margin-bottom: 6px; }
        .badge { background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
      </style>
      </head>
      <body>
        <h1>${escapeHtml(d.identitas.judulLkpd)}</h1>
        <p style="text-align:center; font-weight:bold; color:#475569; margin-top:0;">TOPIK: ${escapeHtml(d.identitas.temaTopik.toUpperCase())}</p>
        <p style="text-align:center; color:#64748b; font-size:10pt;">${escapeHtml(d.identitas.mataPelajaran)} &bull; ${escapeHtml(d.identitas.kelasFase)} &bull; Alokasi Waktu: ${escapeHtml(d.identitas.alokasiWaktu)}</p>
        <hr style="border:none; border-top:2px solid #0f172a; margin-bottom:12px;"/>

        <div class="box-identitas">
          <table class="identity-table" width="100%" style="border:none;">
            <tr>
              <td width="50%"><strong>Nama Siswa:</strong> _____________________________</td>
              <td width="50%"><strong>No. Absen:</strong> ____________</td>
            </tr>
            <tr>
              <td><strong>Mata Pelajaran:</strong> ${escapeHtml(d.identitas.mataPelajaran)}</td>
              <td><strong>Kelas / Fase:</strong> ${escapeHtml(d.identitas.kelasFase)}</td>
            </tr>
            <tr>
              <td><strong>Hari / Tanggal:</strong> _____________________________</td>
              <td><strong>Model:</strong> ${escapeHtml(d.identitas.modelPembelajaran)}</td>
            </tr>
          </table>
        </div>

        <h2>A. PETUNJUK PENGGUNAAN LKPD</h2>
        <ol>
          ${d.petunjukPenggunaan.langkahMengerjakan.map(l => `<li>${escapeHtml(l)}</li>`).join('')}
        </ol>
        <p><strong>Alat &amp; Bahan:</strong> ${escapeHtml(d.petunjukPenggunaan.alatDanBahan.join(', '))}</p>
        <p><strong>Cara Menjawab:</strong> ${escapeHtml(d.petunjukPenggunaan.caraMenjawab)}</p>

        <h2>B. PENGALAMAN BELAJAR MENDALAM TERINTEGRASI SINTAKS</h2>
        
        <div class="card-tahap">
          <p style="color:#0369a1; font-weight:bold; font-size:10pt;">${escapeHtml(d.sintaksDanPengalamanBelajar.memahami.tahapSintaks)}</p>
          <h3>${escapeHtml(d.sintaksDanPengalamanBelajar.memahami.judulBagian)}</h3>
          <p style="background:#f1f5f9; padding:10px; border-radius:4px; font-style:italic;">
            "${escapeHtml(d.sintaksDanPengalamanBelajar.memahami.stimulusTeks)}"
          </p>
          <p><strong>Deskripsi Pengamatan:</strong> ${escapeHtml(d.sintaksDanPengalamanBelajar.memahami.ilustrasiAtauGambarDeskripsi)}</p>
          
          <h4>Pertanyaan Pemahaman:</h4>
          ${d.sintaksDanPengalamanBelajar.memahami.pertanyaanPemahaman.map(q => `
            <div class="soal-box">
              <p><strong>Soal ${q.nomor}:</strong> ${escapeHtml(q.soal)}</p>
              <div class="garis-jawaban"></div>
              <div class="garis-jawaban"></div>
            </div>
          `).join('')}
        </div>

        <div class="card-tahap">
          <p style="color:#0f766e; font-weight:bold; font-size:10pt;">${escapeHtml(d.sintaksDanPengalamanBelajar.mengaplikasikan.tahapSintaks)}</p>
          <h3>${escapeHtml(d.sintaksDanPengalamanBelajar.mengaplikasikan.judulBagian)}</h3>
          <p style="background:#f0fdfa; padding:10px; border-radius:4px;">
            ${escapeHtml(d.sintaksDanPengalamanBelajar.mengaplikasikan.studiKasusNyata)}
          </p>
          <h4>Instruksi Kerja Praktik:</h4>
          <ul>
            ${d.sintaksDanPengalamanBelajar.mengaplikasikan.instruksiKerja.map(ins => `<li>${escapeHtml(ins)}</li>`).join('')}
          </ul>
          <p><strong>Tugas:</strong> ${escapeHtml(d.sintaksDanPengalamanBelajar.mengaplikasikan.tugasAktivitas)}</p>
          <p><strong>Ruang Hasil Pengamatan / Solusi Siswa:</strong></p>
          <div style="border:1px solid #cbd5e1; height:80px; border-radius:4px; padding:8px; background:#ffffff;"></div>
        </div>

        <div class="card-tahap">
          <p style="color:#7c3aed; font-weight:bold; font-size:10pt;">${escapeHtml(d.sintaksDanPengalamanBelajar.merefleksikan.tahapSintaks)}</p>
          <h3>${escapeHtml(d.sintaksDanPengalamanBelajar.merefleksikan.judulBagian)}</h3>
          ${d.sintaksDanPengalamanBelajar.merefleksikan.pertanyaanRefleksi.map(r => `
            <div class="soal-box">
              <p><strong>Refleksi ${r.nomor}:</strong> ${escapeHtml(r.pertanyaan)}</p>
              <div class="garis-jawaban"></div>
              <div class="garis-jawaban"></div>
            </div>
          `).join('')}
        </div>

        <h2>C. BAGIAN PENUTUP &amp; REFLEKSI DIRI</h2>
        <p style="background:#fef3c7; padding:10px; border-radius:4px; font-style:italic; color:#92400e;">
          ${escapeHtml(d.penutup.pesanPenyemangat)}
        </p>

        <h4>Kolom Cek Pemahaman Diri:</h4>
        <table class="data-table">
          <thead>
            <tr>
              <th width="60%">Indikator Pemahaman</th>
              <th width="40%">Cek Pemahaman (Centang)</th>
            </tr>
          </thead>
          <tbody>
            ${d.penutup.kolomCekPemahamanDiri.map(c => `
              <tr>
                <td>${escapeHtml(c.aspek)}</td>
                <td>${c.pilihan.map(p => `&#9744; ${escapeHtml(p)}`).join(' &nbsp; ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <br/>
        <table class="sig-table" width="100%" style="border:none; margin-top:15px;">
          <tr style="border:none;">
            <td width="65%" style="border:none; vertical-align:top;">
              <strong>Catatan Guru:</strong><br/>
              <div style="border:1px solid #cbd5e1; min-height:56px; padding:6px; font-size:10pt;">${escapeHtml(d.penutup.catatanDanParafGuru.ruangCatatan)}</div>
            </td>
            <td width="35%" style="border:none; text-align:center; vertical-align:top;">
              <strong>Paraf &amp; Nilai Guru:</strong><br/><br/><br/>
              ( ____________________ )
            </td>
          </tr>
        </table>
      </body></html>
    `;
  };

  // Copy full text
  const handleCopyText = () => {
    const d = lkpdData;
    let txt = `====================================================\n`;
    txt += `${d.identitas.judulLkpd}\n`;
    txt += `TOPIK: ${d.identitas.temaTopik}\n`;
    txt += `Mata Pelajaran: ${d.identitas.mataPelajaran} | ${d.identitas.kelasFase}\n`;
    txt += `Model Pembelajaran: ${d.identitas.modelPembelajaran}\n`;
    txt += `====================================================\n\n`;
    txt += `IDENTITAS SISWA:\n`;
    txt += `Nama: .......................................  No. Absen: ......\n`;
    txt += `Kelas: ${d.identitas.kelasFase}  Tanggal: ........................\n\n`;
    txt += `A. PETUNJUK PENGGUNAAN:\n`;
    d.petunjukPenggunaan.langkahMengerjakan.forEach((l, i) => {
      txt += `${i + 1}. ${l}\n`;
    });
    txt += `Alat & Bahan: ${d.petunjukPenggunaan.alatDanBahan.join(', ')}\n\n`;
    txt += `B. PENGALAMAN BELAJAR MENDALAM TERINTEGRASI SINTAKS:\n\n`;
    txt += `1. MEMAHAMI (${d.sintaksDanPengalamanBelajar.memahami.tahapSintaks})\n`;
    txt += `Teks Stimulus:\n"${d.sintaksDanPengalamanBelajar.memahami.stimulusTeks}"\n\n`;
    txt += `Pertanyaan Pemahaman:\n`;
    d.sintaksDanPengalamanBelajar.memahami.pertanyaanPemahaman.forEach(q => {
      txt += `${q.nomor}. ${q.soal}\nJawaban: ........................................................\n\n`;
    });
    txt += `2. MENGAPLIKASIKAN (${d.sintaksDanPengalamanBelajar.mengaplikasikan.tahapSintaks})\n`;
    txt += `Studi Kasus: ${d.sintaksDanPengalamanBelajar.mengaplikasikan.studiKasusNyata}\n`;
    txt += `Instruksi:\n`;
    d.sintaksDanPengalamanBelajar.mengaplikasikan.instruksiKerja.forEach((ins, i) => {
      txt += `- ${ins}\n`;
    });
    txt += `Tugas: ${d.sintaksDanPengalamanBelajar.mengaplikasikan.tugasAktivitas}\n\n`;
    txt += `3. MEREFLEKSIKAN (${d.sintaksDanPengalamanBelajar.merefleksikan.tahapSintaks})\n`;
    d.sintaksDanPengalamanBelajar.merefleksikan.pertanyaanRefleksi.forEach(r => {
      txt += `${r.nomor}. ${r.pertanyaan}\nRefleksi Saya: .................................................\n\n`;
    });
    txt += `C. PENUTUP:\n"${d.penutup.pesanPenyemangat}"\n`;

    navigator.clipboard.writeText(txt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-cyan-900/30 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <FileEdit className="w-3.5 h-3.5 text-emerald-400" />
              <span>Generator LKPD Pembelajaran Mendalam (Deep Learning)</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              Lembar Kerja Peserta Didik (LKPD) Terstruktur & Interaktif
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Menyusun LKPD lengkap berbasis sintaks model pembelajaran (PBL, TGfU, Discovery) terintegrasi 3 pilar: <strong>Memahami (Stimulus & Soal), Mengaplikasikan (Kasus Nyata & Tantangan), dan Merefleksikan (Evaluasi & Tindak Lanjut)</strong>. Format non-tabel A4 portrait siap cetak, unduh Word (.doc), atau ekspor Gambar HD (.png).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportPNG}
              disabled={isExportingImage}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <FileImage className="w-4 h-4" />
              <span>{isExportingImage ? 'Memproses Gambar...' : 'Download Gambar HD (.PNG)'}</span>
            </button>

            <DocumentExportToolbar
              filename={`LKPD_${lkpdData.identitas.mataPelajaran.replace(/[^a-zA-Z0-9]/g, '_')}`}
              title={lkpdData.identitas.judulLkpd || 'LKPD Pembelajaran'}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
            />

            <button
              onClick={handleCopyText}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Salin Teks Lengkap"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Form Controls vs A4 LKPD Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Presets */}
        <div className="lg:col-span-4 space-y-4 no-print">
          {/* Quick Preset Buttons */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Pilihan Preset LKPD</span>
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">1-Klik Siap</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleLoadPreset('sepakbola')}
                className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-emerald-500/50 transition-all cursor-pointer"
              >
                ⚽ <strong>PJOK: Menendang & Kontrol Bola</strong> (PBL - Kelas V)
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('kebugaran')}
                className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-teal-500/50 transition-all cursor-pointer"
              >
                🏃 <strong>PJOK: Kebugaran Sirkuit Interval</strong> (Kelas VI)
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('senam')}
                className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-indigo-500/50 transition-all cursor-pointer"
              >
                🤸 <strong>PJOK: Senam Lantai Guling Depan</strong> (Kelas IV)
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('ipas')}
                className="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-amber-500/50 transition-all cursor-pointer"
              >
                🌿 <strong>IPAS: Rantai Makanan & Ekosistem</strong> (Kelas V)
              </button>
            </div>
          </div>

          {/* Form Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Konfigurasi LKPD Pembelajaran</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={mapel}
                    onChange={(e) => setMapel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Jenjang</label>
                  <input
                    type="text"
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Kelas</label>
                  <input
                    type="text"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Fase</label>
                  <input
                    type="text"
                    value={fase}
                    onChange={(e) => setFase(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Model & Sintaks Pembelajaran</label>
                <input
                  type="text"
                  value={modelPembelajaran}
                  onChange={(e) => setModelPembelajaran(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Misal: Problem Based Learning (PBL) & TGfU"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Topik Pembelajaran</label>
                <input
                  type="text"
                  value={topik}
                  onChange={(e) => setTopik(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Tujuan Pembelajaran</label>
                <textarea
                  rows={3}
                  value={tujuanPembelajaran}
                  onChange={(e) => setTujuanPembelajaran(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 font-medium text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Dimensi Profil Lulusan Checkboxes */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Dimensi Profil Lulusan (Pilih yang Dikembangkan):
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {DPL_OPTIONS.map((dpl) => {
                    const checked = selectedDpl.includes(dpl);
                    return (
                      <label
                        key={dpl}
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all cursor-pointer ${
                          checked
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleDpl(dpl)}
                          className="rounded text-emerald-500 w-3 h-3"
                        />
                        <span className="truncate">{dpl}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Menyusun LKPD Lengkap AI...' : 'Generate LKPD Lengkap'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Visual A4 Portrait Worksheet (NON-TABLE, INTEGRATED DEEP LEARNING) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Bar for View Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 no-print">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">Pratinjau Lembar LKPD A4 Portrait</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                Non-Tabel Sesuai Prompt
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Tema Aksen:</span>
              {(['teal', 'emerald', 'indigo', 'amber'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPreviewTheme(t)}
                  className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                    previewTheme === t ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                  } ${
                    t === 'teal' ? 'bg-teal-500 border-teal-300' :
                    t === 'emerald' ? 'bg-emerald-500 border-emerald-300' :
                    t === 'indigo' ? 'bg-indigo-500 border-indigo-300' : 'bg-amber-500 border-amber-300'
                  }`}
                  title={`Tema ${t}`}
                />
              ))}
            </div>
          </div>

          {/* Printable A4 Portrait Paper Container */}
          <div className="overflow-x-auto bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-6 flex justify-center items-start shadow-inner">
            <div
              ref={lkpdPrintRef}
              id="lkpd-sheet-container"
              className="w-[210mm] min-h-[297mm] bg-white text-slate-800 p-8 sm:p-10 shadow-2xl relative flex flex-col justify-between font-sans print:shadow-none print:w-full print:p-6"
              style={{ boxSizing: 'border-box' }}
            >
              {/* Decorative modern border accent */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500" />
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-600" />

              {/* 1. Header Bagian Atas */}
              <div className="border-b-2 border-slate-200 pb-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Kurikulum Merdeka
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">
                          Pembelajaran Mendalam
                        </span>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                        {lkpdData.identitas.judulLkpd}
                      </h1>
                      <p className="text-xs font-bold text-emerald-700">
                        Topik: {lkpdData.identitas.temaTopik}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-700 block uppercase">
                      {lkpdData.identitas.mataPelajaran}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold block">
                      {lkpdData.identitas.kelasFase} • {lkpdData.identitas.alokasiWaktu}
                    </span>
                  </div>
                </div>

                {/* Identitas Diri Siswa (Kotak Modern Terstruktur) */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Nama Peserta Didik:</span>
                    <div className="border-b border-dotted border-slate-400 h-5 mt-0.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">No. Absen:</span>
                    <div className="border-b border-dotted border-slate-400 h-5 mt-0.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Kelas / Fase:</span>
                    <strong className="text-slate-800 text-[11px] block mt-0.5">{lkpdData.identitas.kelasFase}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Hari / Tanggal:</span>
                    <div className="border-b border-dotted border-slate-400 h-5 mt-0.5" />
                  </div>
                  <div className="col-span-2 sm:col-span-4 pt-1.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-1 text-[10.5px]">
                    <div>
                      <span className="font-bold text-slate-700">Model Pembelajaran:</span>{' '}
                      <span className="text-slate-600">{lkpdData.identitas.modelPembelajaran}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-700">Dimensi:</span>
                      {lkpdData.identitas.dimensiProfilLulusan.map((d, i) => (
                        <span key={i} className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9.5px] font-semibold">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Petunjuk Penggunaan LKPD */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 mb-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 border-b border-amber-200 pb-1">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>PETUNJUK PENGGUNAAN LKPD</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                  <div>
                    <strong className="block text-amber-900 mb-0.5">Langkah Pengerjaan:</strong>
                    <ul className="list-decimal list-inside space-y-0.5 text-slate-700">
                      {lkpdData.petunjukPenggunaan.langkahMengerjakan.slice(0, 4).map((lp, i) => (
                        <li key={i} className="leading-snug">{lp}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <div>
                      <strong className="text-amber-900">Alat & Bahan:</strong>
                      <span className="text-slate-700 block mt-0.5">
                        {lkpdData.petunjukPenggunaan.alatDanBahan.join(', ')}
                      </span>
                    </div>
                    <div>
                      <strong className="text-amber-900">Cara Menjawab:</strong>
                      <span className="text-slate-700 block mt-0.5 italic">
                        {lkpdData.petunjukPenggunaan.caraMenjawab}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Sintaks Pembelajaran & Pengalaman Belajar Mendalam (NON-TABLE, INTEGRATED) */}
              <div className="space-y-3.5 flex-1 mb-4">
                {/* TAHAP 1: MEMAHAMI */}
                <div className="border border-sky-200 bg-sky-50/60 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-sky-200 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                        1
                      </span>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-sky-700 tracking-wider block">
                          {lkpdData.sintaksDanPengalamanBelajar.memahami.tahapSintaks}
                        </span>
                        <h3 className="text-xs sm:text-sm font-black text-slate-900">
                          {lkpdData.sintaksDanPengalamanBelajar.memahami.judulBagian}
                        </h3>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-sky-200 text-sky-800">
                      Pengalaman: Memahami
                    </span>
                  </div>

                  {/* Stimulus Teks */}
                  <div className="bg-white p-3 rounded-xl border border-sky-200 text-[11px] text-slate-700 leading-relaxed shadow-xs">
                    <p className="italic font-normal">
                      &ldquo;{lkpdData.sintaksDanPengalamanBelajar.memahami.stimulusTeks}&rdquo;
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-start gap-2 text-[10px] text-sky-900 bg-sky-50/60 p-2 rounded-lg">
                      <Compass className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <span><strong>Pengamatan Visual:</strong> {lkpdData.sintaksDanPengalamanBelajar.memahami.ilustrasiAtauGambarDeskripsi}</span>
                    </div>
                  </div>

                  {/* Pertanyaan Pemahaman (Minimal 3 Soal) */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-800">
                      Jawablah Pertanyaan Pemahaman Berikut Berdasarkan Teks dan Pengamatanmu:
                    </h4>
                    {lkpdData.sintaksDanPengalamanBelajar.memahami.pertanyaanPemahaman.map((q) => (
                      <div key={q.nomor} className="bg-white p-2.5 rounded-xl border border-sky-100 shadow-xs text-xs space-y-1">
                        <p className="font-bold text-slate-900 leading-snug">
                          {q.nomor}. {q.soal}
                        </p>
                        <div className="h-10 border-b border-dashed border-slate-300 mt-1 flex items-end">
                          <span className="text-[9.5px] text-slate-400 italic">
                            Jawaban Siswa: {q.panduanJawabanSiswa}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TAHAP 2: MENGAPLIKASIKAN */}
                <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        2
                      </span>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                          {lkpdData.sintaksDanPengalamanBelajar.mengaplikasikan.tahapSintaks}
                        </span>
                        <h3 className="text-xs sm:text-sm font-black text-slate-900">
                          {lkpdData.sintaksDanPengalamanBelajar.mengaplikasikan.judulBagian}
                        </h3>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">
                      Pengalaman: Mengaplikasikan
                    </span>
                  </div>

                  {/* Kasus Nyata Kontekstual */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 text-[11px] text-slate-700 space-y-2 shadow-xs">
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200/60">
                      <strong className="text-emerald-950 block font-bold mb-1">
                        KASUS NYATA LAPANGAN:
                      </strong>
                      <p className="text-[10.5px] leading-relaxed">
                        {lkpdData.sintaksDanPengalamanBelajar.mengaplikasikan.studiKasusNyata}
                      </p>
                    </div>

                    <div>
                      <strong className="text-emerald-900 text-[10.5px] block mb-1">Instruksi Kerja Praktik:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-700">
                        {lkpdData.sintaksDanPengalamanBelajar.mengaplikasikan.instruksiKerja.map((ins, i) => (
                          <li key={i} className="leading-snug">{ins}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Ruang Pengerjaan / Jawaban Siswa */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10.5px] font-bold text-slate-800 block mb-1">
                        Ruang Catatan Hasil Percobaan & Solusi Pasangan:
                      </span>
                      <div className="min-h-16 border-2 border-dashed border-emerald-300 rounded-xl p-2 bg-emerald-50/20 text-[10px] text-slate-500 italic">
                        {lkpdData.sintaksDanPengalamanBelajar.mengaplikasikan.panduanRuangKerja}
                      </div>
                    </div>
                  </div>
                </div>

                {/* TAHAP 3: MEREFLEKSIKAN */}
                <div className="border border-purple-200 bg-purple-50/60 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-purple-200 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                        3
                      </span>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider block">
                          {lkpdData.sintaksDanPengalamanBelajar.merefleksikan.tahapSintaks}
                        </span>
                        <h3 className="text-xs sm:text-sm font-black text-slate-900">
                          {lkpdData.sintaksDanPengalamanBelajar.merefleksikan.judulBagian}
                        </h3>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-800">
                      Pengalaman: Merefleksikan
                    </span>
                  </div>

                  <div className="space-y-2">
                    {lkpdData.sintaksDanPengalamanBelajar.merefleksikan.pertanyaanRefleksi.map((rf) => (
                      <div key={rf.nomor} className="bg-white p-2.5 rounded-xl border border-purple-100 shadow-xs text-xs space-y-1">
                        <p className="font-bold text-slate-900 leading-snug">
                          {rf.nomor}. {rf.pertanyaan}
                        </p>
                        <div className="h-9 border-b border-dashed border-slate-300 mt-1 flex items-end">
                          <span className="text-[9.5px] text-slate-400 italic">
                            Refleksi Saya: {rf.fokusRefleksi}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Bagian Penutup: Pesan Penyemangat, Cek Pemahaman Diri & Catatan Guru */}
              <div className="border-t-2 border-slate-200 pt-3 space-y-3">
                {/* Pesan Motivasi */}
                <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-2.5 text-xs text-amber-950 flex items-center gap-2.5 shadow-xs">
                  <Smile className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-[11px] font-semibold italic">
                    {lkpdData.penutup.pesanPenyemangat}
                  </p>
                </div>

                {/* Kolom Cek Pemahaman Diri Siswa */}
                <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Cek Pemahaman Diri Siswa (Beri tanda centang ✓):</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">Penilaian Diri Mandiri</span>
                  </div>

                  <div className="space-y-1.5 text-[10.5px]">
                    {lkpdData.penutup.kolomCekPemahamanDiri.map((chk, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-white p-1.5 rounded-lg border border-slate-200">
                        <span className="text-slate-700 font-medium">{chk.aspek}</span>
                        <div className="flex items-center gap-2.5 shrink-0 text-[10px]">
                          {chk.pilihan.map((pil, idx) => (
                            <label key={idx} className="flex items-center gap-1 text-slate-600 cursor-pointer">
                              <input type="checkbox" defaultChecked={idx === 0} className="rounded text-emerald-600 w-3 h-3" />
                              <span>{pil}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Catatan & Paraf Guru */}
                <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                  <div className="col-span-2 border border-slate-300 rounded-xl p-2.5 bg-white">
                    <span className="text-[10.5px] font-bold text-slate-700 block mb-1">
                      Catatan & Apresiasi Guru Pengampu:
                    </span>
                    <p className="text-[10.5px] text-slate-600 italic">
                      {lkpdData.penutup.catatanDanParafGuru.ruangCatatan}
                    </p>
                  </div>

                  <div className="border border-slate-300 rounded-xl p-2.5 bg-white text-center flex flex-col justify-between">
                    <span className="text-[10.5px] font-bold text-slate-700 block">
                      Nilai & Paraf Guru:
                    </span>
                    <div className="text-base font-black text-emerald-700 my-0.5">
                      A (Sangat Baik)
                    </div>
                    <div className="border-b border-slate-400 w-24 mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
