'use client';

import React, { useState, useRef } from 'react';
import { 
  Palette, Download, Sparkles, CheckCircle2, 
  Layers, Eye, ZoomIn, ZoomOut, RefreshCw, FileImage, 
  Award, Heart, Smile, Trophy, Target, ShieldCheck, 
  Dumbbell, Star, BookOpen, Compass, CheckSquare, HelpCircle,
  Clock, Calendar, User, School, BookCheck
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { VisualRpmData, getFallbackVisualRpmData } from '@/lib/visual-rpm';
import { DocumentExportToolbar } from './DocumentExportToolbar';
import { escapeHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

type ThemeMode = 'pastel' | 'neon' | 'editorial';

const SAMPLE_RAW_RPM = `RENCANA PELAKSANAAN PEMBELAJARAN MENDALAM (RPM)
A. IDENTITAS
Penyusun: Guru PJOK SD Negeri Kalimantong
Sekolah: SD Negeri Kalimantong
Tahun Ajaran: 2026/2027
Semester: Ganjil
Mata Pelajaran: PJOK
Kelas/Fase Capaian: Kelas V (Lima) / Fase C
Bab: Variasi dan Kombinasi Gerak Dasar Permainan Bola Besar
Topik: Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola
Alokasi Waktu: 2x40 Menit (1 Pertemuan)

B. IDENTIFIKASI
Identifikasi Murid:
- Pengetahuan awal: Murid telah mengenal teknik dasar menendang bola saat bermain di luar sekolah, namun belum konsisten pada posisi kaki tumpu.
- Minat belajar: Murid memiliki kecerdasan kinestetik tinggi dan antusias mengikuti tantangan berkelompok yang kompetitif dan menyenangkan.
- Kebutuhan belajar: Murid memerlukan peragaan visual lambat (slow motion) dan adaptasi jarak operan bertahap.
Materi Pelajaran:
- Faktual: Bola sepak standar ukuran 4 empuk, corong pembatas (cone), peluit wasit, dan stopwatch.
- Konseptual: Prinsip sudut pantul, titik sentuh bola, serta keselarasan ayunan tungkai kaki.
- Prosedural: Urutan gerak: awalan mendekati bola -> kaki tumpu di samping bola -> memutar pergelangan kaki -> menendang bola -> gerak lanjutan.
- Metakognitif: Kemampuan mengoreksi sendiri arah lengkungan bola dan mengevaluasi kekompakan bersama rekan pasangan.
Dimensi Profil Lulusan: Kolaborasi, Penalaran Kritis, Kemandirian, Kesehatan, Kewargaan.

C. DESAIN PEMBELAJARAN
Capaian Pembelajaran: Peserta didik dapat menunjukkan kemampuan dalam mempraktikkan modifikasi berbagai aktivitas pola gerak dasar dan keterampilan gerak dilandasi dengan penerapan konsep dan prinsip gerak yang benar.
Lintas Disiplin Ilmu: IPA (Biomekanika sendi dan denyut jantung), Matematika (Sudut perkenaan dan jarak operan), Bahasa Indonesia (Komunikasi sportif antar-pemain).
Tujuan Pembelajaran:
1. Murid dapat menjelaskan konsep posisi kaki tumpu dan perkenaan kaki bagian dalam pada bola secara tepat melalui pengamatan peragaan visual.
2. Murid dapat mempraktikkan variasi gerak menendang dan menghentikan bola mendatar berpasangan dengan jarak 4 meter secara terkontrol.
3. Murid dapat merefleksikan pentingnya kerja sama tim dan sportivitas serta menganalisis faktor penyebab operan melenceng bersama rekan latihan.
Topik Pembelajaran: Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola dengan Kaki Bagian Dalam
Praktik Pedagogis:
- Pendekatan: Pembelajaran Mendalam (Deep Learning - Mindful, Meaningful, Joyful)
- Model: Teaching Games for Understanding (TGfU) & Drill Berdiferensiasi
- Metode: Demonstrasi interaktif, sirkuit berpasangan, game tantangan gawang corong, refleksi dialogis.
Kemitraan Pembelajaran: Tutor sebaya antarmurid dan orang tua murid dalam pemantauan kebugaran harian di rumah.
Lingkungan Pembelajaran: Lapangan terbuka sekolah yang bersih, rata, dan aman dengan corong warna cerah.
Pemanfaatan Digital: Tayangan video teknik gerak lambat (slow-motion) dan lembar pencatatan digital.

D. PENGALAMAN BELAJAR
Kegiatan Awal (15 Menit) - Prinsip: Mindful, Meaningful, Joyful:
1. Guru mengucap salam hangat dan mengajak seorang murid memimpin doa bersama dengan khidmat (Berkesadaran).
2. Guru menyapa kondisi kesehatan murid dan memeriksa presensi dengan yel-yel kelas yang bersemangat (Menggembirakan).
3. Guru melakukan apersepsi bermakna dengan mengaitkan momen seru operan timnas sepak bola terhadap pentingnya akurasi passing (Bermakna).
4. Murid melakukan pemanasan dinamis berpasangan lewat game "Ular Oper Bola" untuk menyalakan fokus motorik (Joyful).

Kegiatan Inti (60 Menit):
Tahap Memahami (15 Menit):
- Guru memperagakan dua jenis tendangan: satu tendangan melenceng akibat kaki tumpu terlalu jauh, dan satu tendangan akurat lurus di samping bola.
- Murid mengamati secara saksama letak perkenaan bola pada sepatu dan video gerak lambat (Penalaran Kritis).
- Murid berdiskusi berpasangan merumuskan 3 rahasia operan tepat sasaran: kaki tumpu, kunci pergelangan kaki, dan titik tengah bola (Komunikasi).
- Murid mempraktikkan gerakan bayangan (shadow movement) tanpa bola untuk mengunci memori otot tungkai (Kemandirian).

Tahap Mengaplikasikan (30 Menit):
- Murid berpasangan jarak 4 meter melakukan latihan operan mendatar dan menghentikan bola secara bergantian 15 kali (Kolaborasi & Kesehatan).
- Pasangan latihan menerapkan teknik menghentikan bola (trapping) dengan telapak atau kaki dalam agar bola tidak terpental jauh.
- Guru memberikan bimbingan berdiferensiasi: murid mahir memperlebar jarak ke 6 meter, sedangkan murid berkembang berlatih pada jarak 3 meter.
- Murid mengikuti tantangan "Gerbang Presisi": mengoper bola melewati celah 2 corong selebar 50 cm tanpa menyentuh corong (Kolaborasi & Kewargaan).

Tahap Merefleksi (15 Menit):
- Murid duduk melingkar di bawah pohon rindang, meraba denyut nadi dan melakukan pernapasan relaksasi stop-breathe-reflect (Berkesadaran).
- Setiap murid saling memberikan satu apresiasi positif kepada rekan pasangannya atas kerja sama terbaik hari ini (Komunikasi & Kolaborasi).
- Murid menganalisis kendala: mengapa bola sempat melenceng ke kanan atau melambung tinggi, lalu menemukan cara perbaikannya (Penalaran Kritis).
- Murid menyimpulkan perbaikan gerak yang akan dilakukan dan mencatatnya dalam lembar refleksi pribadi (Kemandirian).

Kegiatan Penutup (5 Menit):
1. Murid melakukan pendinginan peregangan otot tungkai dan lengan dengan rileks dan tenang (Kesehatan).
2. Guru bersama murid menyimpulkan inti pembelajaran: akurasi operan dan komunikasi adalah kunci permainan sepak bola (Bermakna).
3. Murid bersama-sama merapikan peralatan bola dan corong ke tempat semula dengan tertib (Kewargaan).
4. Pembelajaran ditutup dengan doa syukur bersama dan tos kekompakan kelas (Menggembirakan).

E. ASESMEN PEMBELAJARAN
1. Asesmen Awal: Tanya jawab diagnostik pemahaman dasar menendang bola dan uji operan awal 3 kali.
2. Asesmen Proses: Observasi unjuk kerja berpasangan dan penilaian sikap dimensi profil lulusan (skala 1-4).
3. Asesmen Akhir: Tes akurasi operan gerbang presisi (5 kesempatan) dan jurnal refleksi tertulis.

Titimangsa: Kalimantong, 13 Juli 2026
Kepala Sekolah: Nasrudin, S.Pd., M.Pd. (NIP. 19700318 199602 1 003)
Guru PJOK: Guru PJOK SD Negeri Kalimantong (NIP. 19880724 201503 1 003)`;

export function RpmVisualGenerator() {
  const [rpmRawInput, setRpmRawInput] = useState<string>(SAMPLE_RAW_RPM);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTabSheet, setActiveTabSheet] = useState<'sheet1' | 'sheet2' | 'sheet3'>('sheet1');
  const [theme, setTheme] = useState<ThemeMode>('pastel');
  const [zoomScale, setZoomScale] = useState<number>(0.85);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [rpmData, setRpmData] = useState<VisualRpmData>(() => getFallbackVisualRpmData(SAMPLE_RAW_RPM));

  // Refs for high-res image export
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const page3Ref = useRef<HTMLDivElement>(null);

  const handleTransform = async () => {
    setIsLoading(true);
    try {
      const res = await postJsonSafe<{ data?: VisualRpmData }>(
        '/api/gemini/transform-rpm-visual',
        { rpmRawText: rpmRawInput }
      );
      if (res.data?.data) {
        setRpmData(res.data.data);
      } else {
        setRpmData(getFallbackVisualRpmData(rpmRawInput));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSingleImage = async (ref: React.RefObject<HTMLDivElement | null>, fileName: string) => {
    if (!ref.current) return;
    setIsExporting(true);
    try {
      // High-res pixelRatio 2 for crisp 300DPI equivalent quality
      const dataUrl = await toPng(ref.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export image error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAllImages = async () => {
    setIsExporting(true);
    try {
      if (page1Ref.current) {
        const dataUrl1 = await toPng(page1Ref.current, { quality: 0.98, pixelRatio: 2, backgroundColor: '#ffffff' });
        const link1 = document.createElement('a');
        link1.download = `RPM_Visual_Halaman1_Utama_${Date.now()}.png`;
        link1.href = dataUrl1;
        link1.click();
      }
      await new Promise((r) => setTimeout(r, 600));
      if (page2Ref.current) {
        const dataUrl2 = await toPng(page2Ref.current, { quality: 0.98, pixelRatio: 2, backgroundColor: '#ffffff' });
        const link2 = document.createElement('a');
        link2.download = `RPM_Visual_Halaman2_Asesmen_Rubrik_${Date.now()}.png`;
        link2.href = dataUrl2;
        link2.click();
      }
      await new Promise((r) => setTimeout(r, 600));
      if (page3Ref.current) {
        const dataUrl3 = await toPng(page3Ref.current, { quality: 0.98, pixelRatio: 2, backgroundColor: '#ffffff' });
        const link3 = document.createElement('a');
        link3.download = `RPM_Visual_Halaman3_LKPD_Interaktif_${Date.now()}.png`;
        link3.href = dataUrl3;
        link3.click();
      }
    } catch (err) {
      console.error('Export all images error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const buildExportHtml = () => {
    const rubrikRows = (rpmData.lampiran?.rubrikKeterampilan || [])
      .map(
        (rub) => `
          <tr>
            <td><strong>${escapeHtml(rub.aspek)}</strong></td>
            <td>${escapeHtml(rub.skala1)}</td>
            <td>${escapeHtml(rub.skala2)}</td>
            <td>${escapeHtml(rub.skala3)}</td>
            <td>${escapeHtml(rub.skala4)}</td>
          </tr>
        `
      )
      .join('');

    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
      <meta charset='utf-8'>
      <title>RPM Visual Interaktif A4 - ${escapeHtml(rpmData.identitas.topik)}</title>
      <style>
        @page { size: A4 portrait; margin: 1.5cm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #0f172a; }
        h1 { font-size: 15pt; color: #0f766e; text-align: center; margin: 0 0 4px 0; }
        h2 { font-size: 12pt; color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 4px; margin-top: 14px; page-break-after: avoid; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 12px; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; break-inside: avoid; }
        th, td { border: 1px solid #334155; padding: 6px 8px; font-size: 9.5pt; vertical-align: top; }
        th { background-color: #f1f5f9; text-align: left; font-weight: bold; }
        tbody tr:nth-child(even) { background-color: #f8fafc; }
        .card { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; margin-bottom: 10px; border-radius: 6px; page-break-inside: avoid; }
        .badge { background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
        .sig-table td { border: none !important; background: transparent !important; }
      </style>
      </head>
      <body>
        <h1>RENCANA PEMBELAJARAN MENDALAM (RPM) VISUAL INTERAKTIF</h1>
        <p style="text-align:center; color:#475569; margin-top:0;">Kurikulum Merdeka &bull; Berkesadaran (Mindful), Bermakna (Meaningful), Menggembirakan (Joyful)</p>
        <hr style="border:none; border-top:2px solid #0f172a; margin-bottom:12px;"/>

        <h2>A. IDENTITAS RPM</h2>
        <table>
          <tbody>
            <tr><td width="30%"><strong>Penyusun</strong></td><td>${escapeHtml(rpmData.identitas.penyusun)}</td></tr>
            <tr><td><strong>Satuan Pendidikan / Sekolah</strong></td><td>${escapeHtml(rpmData.identitas.sekolah)}</td></tr>
            <tr><td><strong>Tahun Ajaran / Semester</strong></td><td>${escapeHtml(rpmData.identitas.tahunAjaran)} / ${escapeHtml(rpmData.identitas.semester)}</td></tr>
            <tr><td><strong>Mata Pelajaran</strong></td><td>${escapeHtml(rpmData.identitas.mataPelajaran)}</td></tr>
            <tr><td><strong>Kelas / Fase Capaian</strong></td><td>${escapeHtml(rpmData.identitas.kelasFase)}</td></tr>
            <tr><td><strong>Topik Pembelajaran</strong></td><td>${escapeHtml(rpmData.identitas.topik)}</td></tr>
            <tr><td><strong>Alokasi Waktu</strong></td><td>${escapeHtml(rpmData.identitas.alokasiWaktu)}</td></tr>
          </tbody>
        </table>

        <h2>B. IDENTIFIKASI &amp; DESAIN PEMBELAJARAN</h2>
        <table>
          <thead>
            <tr><th colspan="2" style="background:#e0f2fe; color:#0369a1;">1. Identifikasi &amp; Desain Pembelajaran</th></tr>
          </thead>
          <tbody>
            <tr><td width="30%"><strong>Pengetahuan Awal</strong></td><td>${escapeHtml(rpmData.identifikasi.pengetahuanAwal)}</td></tr>
            <tr><td><strong>Minat Belajar</strong></td><td>${escapeHtml(rpmData.identifikasi.minatBelajar)}</td></tr>
            <tr><td><strong>Kebutuhan Belajar</strong></td><td>${escapeHtml(rpmData.identifikasi.kebutuhanBelajar)}</td></tr>
            <tr><td><strong>Dimensi Profil Lulusan (DPL)</strong></td><td>${escapeHtml(rpmData.identifikasi.dpl.join(', '))}</td></tr>
            <tr><td><strong>Capaian Pembelajaran (CP)</strong></td><td>${escapeHtml(rpmData.desain.capaianPembelajaran)}</td></tr>
            <tr><td><strong>Lintas Disiplin Ilmu</strong></td><td>${escapeHtml(rpmData.desain.lintasDisiplin)}</td></tr>
            <tr><td><strong>Tujuan Pembelajaran (TP)</strong></td><td><ol style="margin:0; padding-left:18px;">${rpmData.desain.tujuanPembelajaran.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ol></td></tr>
            <tr><td><strong>Pendekatan &amp; Model</strong></td><td>${escapeHtml(rpmData.desain.pendekatan)} &bull; ${escapeHtml(rpmData.desain.model)}</td></tr>
          </tbody>
        </table>

        <h2>C. PENGALAMAN BELAJAR BERMAKNA</h2>
        <div class="card"><strong>Kegiatan Awal (${escapeHtml(rpmData.pengalamanBelajar.kegiatanAwal.durasi)}):</strong><ul>${rpmData.pengalamanBelajar.kegiatanAwal.aktivitas.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul></div>
        <div class="card"><strong>Kegiatan Inti:</strong>
          ${rpmData.pengalamanBelajar.kegiatanInti.map(k => `
            <h4>${escapeHtml(k.judulPertemuan)}</h4>
            <p><strong>1. Tahap Memahami (${escapeHtml(k.tahapMemahami.durasi)}):</strong> ${escapeHtml(k.tahapMemahami.sintaks)}</p>
            <ul>${k.tahapMemahami.poin.map(p => `<li>${escapeHtml(p.deskripsi)} ${p.dpl ? `<em>(${escapeHtml(p.dpl)})</em>` : ''}</li>`).join('')}</ul>
            <p><strong>2. Tahap Mengaplikasikan (${escapeHtml(k.tahapMengaplikasikan.durasi)}):</strong> ${escapeHtml(k.tahapMengaplikasikan.sintaks)}</p>
            <ul>${k.tahapMengaplikasikan.poin.map(p => `<li>${escapeHtml(p.deskripsi)} ${p.dpl ? `<em>(${escapeHtml(p.dpl)})</em>` : ''}</li>`).join('')}</ul>
            <p><strong>3. Tahap Merefleksi (${escapeHtml(k.tahapMerefleksi.durasi)}):</strong> ${escapeHtml(k.tahapMerefleksi.sintaks)}</p>
            <ul>${k.tahapMerefleksi.poin.map(p => `<li>${escapeHtml(p.deskripsi)} ${p.dpl ? `<em>(${escapeHtml(p.dpl)})</em>` : ''}</li>`).join('')}</ul>
          `).join('')}
        </div>
        <div class="card"><strong>Kegiatan Penutup (${escapeHtml(rpmData.pengalamanBelajar.kegiatanPenutup.durasi)}):</strong><ul>${rpmData.pengalamanBelajar.kegiatanPenutup.aktivitas.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul></div>

        <h2>D. ASESMEN PEMBELAJARAN</h2>
        <table>
          <thead>
            <tr><th width="25%">Jenis Asesmen</th><th>Bentuk &amp; Teknik</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Asesmen Awal</strong></td><td>${escapeHtml(rpmData.asesmen.awal.bentuk)} (${escapeHtml(rpmData.asesmen.awal.teknik)})</td></tr>
            <tr><td><strong>Asesmen Proses</strong></td><td>${escapeHtml(rpmData.asesmen.proses.bentuk)} (${escapeHtml(rpmData.asesmen.proses.teknik)})</td></tr>
            <tr><td><strong>Asesmen Akhir</strong></td><td>${escapeHtml(rpmData.asesmen.akhir.bentuk)} (${escapeHtml(rpmData.asesmen.akhir.teknik)})</td></tr>
          </tbody>
        </table>

        ${rubrikRows ? `
        <h2>E. RUBRIK ASESMEN KINERJA &amp; KETERAMPILAN</h2>
        <table>
          <thead>
            <tr>
              <th width="24%">Aspek Keterampilan</th>
              <th width="19%">Perlu Bimbingan (0–68)</th>
              <th width="19%">Cukup (68–78)</th>
              <th width="19%">Baik (79–89)</th>
              <th width="19%">Sangat Baik (90–100)</th>
            </tr>
          </thead>
          <tbody>
            ${rubrikRows}
          </tbody>
        </table>` : ''}

        <h2>${rubrikRows ? 'F' : 'E'}. TANDA TANGAN &amp; PENGESAHAN</h2>
        <table class="sig-table" style="border:none; margin-top:16px;">
          <tbody>
            <tr style="border:none; background:transparent;">
              <td style="border:none; text-align:center;" width="50%">
                Mengetahui,<br/>Kepala Sekolah<br/><br/><br/><br/>
                <strong>${escapeHtml(rpmData.tandaTangan.kepalaSekolah)}</strong><br/>
                NIP. ${escapeHtml(rpmData.tandaTangan.nipKepalaSekolah)}
              </td>
              <td style="border:none; text-align:center;" width="50%">
                ${escapeHtml(rpmData.tandaTangan.titimangsa)}<br/>Guru Mata Pelajaran<br/><br/><br/><br/>
                <strong>${escapeHtml(rpmData.tandaTangan.guru)}</strong><br/>
                NIP. ${escapeHtml(rpmData.tandaTangan.nipGuru)}
              </td>
            </tr>
          </tbody>
        </table>
      </body></html>
    `;
  };

  // Pastel theme classes for soft cards
  const softCardColors = [
    'bg-sky-50 border-sky-200 text-sky-950',
    'bg-amber-50 border-amber-200 text-amber-950',
    'bg-emerald-50 border-emerald-200 text-emerald-950',
    'bg-purple-50 border-purple-200 text-purple-950',
    'bg-rose-50 border-rose-200 text-rose-950',
    'bg-indigo-50 border-indigo-200 text-indigo-950',
  ];

  const softBadgeColors = [
    'bg-sky-600 text-white',
    'bg-amber-600 text-white',
    'bg-emerald-600 text-white',
    'bg-purple-600 text-white',
    'bg-rose-600 text-white',
    'bg-indigo-600 text-white',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Feature */}
      <div className="bg-gradient-to-r from-violet-900/40 via-purple-900/30 to-fuchsia-900/30 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Desain Visual Interaktif A4 Portrait • Ramah Siswa Gen Z</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Generator RPM Menjadi Tampilan Visual Menarik (Gambar HD)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Mengubah naskah RPM biasa menjadi desain lembar A4 portrait modern bergaya edukatif, simetris dua kolom, kartu warna pastel lembut, font soal 12pt, dan langsung diekspor menjadi <strong>File Gambar Resolusi Tinggi (.PNG)</strong>, Word (.doc), atau Cetak/PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleExportSingleImage(
                activeTabSheet === 'sheet1' ? page1Ref : activeTabSheet === 'sheet2' ? page2Ref : page3Ref,
                `RPM_Visual_${activeTabSheet}_HD_${Date.now()}`
              )}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <FileImage className="w-4 h-4" />
              <span>{isExporting ? 'Memproses Gambar...' : 'Download Gambar HD (.PNG)'}</span>
            </button>

            <button
              onClick={handleExportAllImages}
              disabled={isExporting}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Semua Gambar (3 Hal)</span>
            </button>

            <DocumentExportToolbar
              filename={`RPM_Visual_${(rpmData.identitas.topik || 'Dokumen').replace(/\s+/g, '_')}`}
              title={`RPM Visual - ${rpmData.identitas.topik || 'Kurikulum Merdeka'}`}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
            />
          </div>
        </div>
      </div>

      {/* Editor & Control Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Raw RPM Input / Preset */}
        <div className="lg:col-span-4 space-y-4 no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Naskah RPM Asli (Input)</h3>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Teks 100% Preserved</span>
            </div>

            <p className="text-xs text-slate-400">
              Tempelkan teks RPM Anda (Identitas, Identifikasi, Desain, Pengalaman Belajar, Asesmen). Sistem akan menyusunnya ke dalam lembar bergambar A4 portrait tanpa mengubah teks asli sedikit pun.
            </p>

            <textarea
              rows={12}
              value={rpmRawInput}
              onChange={(e) => setRpmRawInput(e.target.value)}
              placeholder="Tempel naskah RPM di sini..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setRpmRawInput(SAMPLE_RAW_RPM)}
                className="text-xs text-purple-400 hover:text-purple-300 underline cursor-pointer"
              >
                Gunakan Contoh PJOK SD
              </button>

              <button
                type="button"
                onClick={handleTransform}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Menata Desain Visual...' : 'Perbarui Desain Visual'}</span>
              </button>
            </div>
          </div>

          {/* Theme & Visual Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Palet Desain & Tipografi</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme('pastel')}
                className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'pastel'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 ring-2 ring-purple-500/30'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex justify-center gap-1 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
                </div>
                Pastel Edukatif
              </button>

              <button
                type="button"
                onClick={() => setTheme('neon')}
                className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'neon'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex justify-center gap-1 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                </div>
                Athletic Gen Z
              </button>

              <button
                type="button"
                onClick={() => setTheme('editorial')}
                className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'editorial'
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/30'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex justify-center gap-1 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                </div>
                Editorial Modern
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Format A4 Portrait (21 cm × 29.7 cm) Terstandar</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Font Soal Wajib 12 pt (16px) Mudah Dibaca</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tabel 2 Kolom Sejajar Simetris & Harmonis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Visual A4 Preview Container */}
        <div className="lg:col-span-8 space-y-4">
          {/* Sheet Selector & Zoom Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 no-print">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTabSheet('sheet1')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTabSheet === 'sheet1'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Lembar 1: RPM Utama A4
              </button>
              <button
                type="button"
                onClick={() => setActiveTabSheet('sheet2')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTabSheet === 'sheet2'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Lembar 2: Asesmen & Rubrik A4
              </button>
              <button
                type="button"
                onClick={() => setActiveTabSheet('sheet3')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTabSheet === 'sheet3'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Lembar 3: LKPD Visual Interaktif
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">Zoom:</span>
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(0.5, prev - 0.1))}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Perkecil Tampilan"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono font-bold text-slate-200 min-w-12 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(1.2, prev + 0.1))}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Perbesar Tampilan"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(0.85)}
                className="text-[11px] font-semibold text-slate-400 hover:text-purple-300 px-2 py-1 bg-slate-800 rounded cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Scrollable Viewport with A4 Portrait Page */}
          <div className="overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-6 flex justify-center items-start shadow-inner min-h-[800px]">
            <div 
              style={{ 
                transform: `scale(${zoomScale})`, 
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out'
              }}
              className="flex flex-col gap-8"
            >
              {/* PAGE 1: RPM UTAMA A4 PORTRAIT */}
              {(activeTabSheet === 'sheet1' || typeof window === 'undefined') && (
                <div
                  ref={page1Ref}
                  id="rpm-sheet-page-1"
                  className="w-[210mm] min-h-[297mm] bg-white text-slate-800 p-8 shadow-2xl relative flex flex-col justify-between font-sans print:shadow-none print:w-full print:p-6"
                  style={{ boxSizing: 'border-box' }}
                >
                  {/* Decorative modern border / accents */}
                  <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />

                  {/* Header Title Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
                          <Dumbbell className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Kurikulum Merdeka
                            </span>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">
                              Deep Learning
                            </span>
                          </div>
                          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                            RENCANA PEMBELAJARAN MENDALAM (RPM)
                          </h1>
                          <p className="text-xs font-semibold text-slate-500">
                            Prinsip: Berkesadaran (Mindful) • Bermakna (Meaningful) • Menggembirakan (Joyful)
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-slate-700 uppercase tracking-wider">{rpmData.identitas.sekolah}</div>
                        <div className="text-[11px] text-slate-500">Tahun Ajaran {rpmData.identitas.tahunAjaran}</div>
                        <div className="text-[11px] font-bold text-emerald-600">Fase Capaian: {rpmData.identitas.kelasFase}</div>
                      </div>
                    </div>

                    {/* Modern Identity Box (Kotak Modern dan Rapi) */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Penyusun</span>
                        <strong className="text-slate-800 text-[11px] block truncate">{rpmData.identitas.penyusun}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Mata Pelajaran</span>
                        <strong className="text-slate-800 text-[11px] block truncate">{rpmData.identitas.mataPelajaran}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Kelas / Semester</span>
                        <strong className="text-slate-800 text-[11px] block">{rpmData.identitas.kelasFase.split('/')[0]} • {rpmData.identitas.semester}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Alokasi Waktu</span>
                        <strong className="text-emerald-700 text-[11px] font-black block">{rpmData.identitas.alokasiWaktu}</strong>
                      </div>
                      <div className="col-span-2 sm:col-span-4 pt-1 border-t border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Topik / Bahasan:</span>{' '}
                        <strong className="text-slate-900 text-xs">{rpmData.identitas.topik}</strong>
                      </div>
                    </div>
                  </div>

                  {/* TABEL UTAMA DUA KOLOM SEJAJAR (SIMETRIS, RAPI, HARMONIS) */}
                  <div className="grid grid-cols-2 gap-3 flex-1 mb-4">
                    {/* KOLOM KIRI: IDENTIFIKASI & DESAIN PEMBELAJARAN */}
                    <div className="space-y-2.5">
                      {/* Section B: Identifikasi */}
                      <div className="border border-sky-200 rounded-xl p-3 bg-sky-50/70 shadow-sm">
                        <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-sky-200">
                          <Compass className="w-3.5 h-3.5 text-sky-600" />
                          <h3 className="text-xs font-black text-sky-900 uppercase tracking-wide">
                            B. IDENTIFIKASI MURID & MATERI
                          </h3>
                        </div>

                        <div className="space-y-1.5 text-[11px] text-slate-700">
                          <div>
                            <span className="font-bold text-sky-800">Pengetahuan Awal:</span> {rpmData.identifikasi.pengetahuanAwal}
                          </div>
                          <div>
                            <span className="font-bold text-sky-800">Minat Belajar:</span> {rpmData.identifikasi.minatBelajar}
                          </div>
                          <div>
                            <span className="font-bold text-sky-800">Kebutuhan Belajar:</span> {rpmData.identifikasi.kebutuhanBelajar}
                          </div>
                          <div className="pt-1 border-t border-sky-100 text-[10.5px]">
                            <strong className="text-slate-800">Dimensi Materi:</strong>
                            <div className="grid grid-cols-2 gap-1 mt-0.5 text-[10px]">
                              <span className="bg-white/80 p-1 rounded border border-sky-200"><strong>Faktual:</strong> {rpmData.identifikasi.materiFaktual}</span>
                              <span className="bg-white/80 p-1 rounded border border-sky-200"><strong>Konseptual:</strong> {rpmData.identifikasi.materiKonseptual}</span>
                            </div>
                          </div>
                          <div className="pt-1">
                            <span className="font-bold text-slate-800 text-[10px] block mb-1">Dimensi Profil Lulusan (DPL):</span>
                            <div className="flex flex-wrap gap-1">
                              {rpmData.identifikasi.dpl.map((dplItem, i) => (
                                <span key={i} className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-sky-600 text-white shadow-xs">
                                  ✓ {dplItem}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section C: Desain Pembelajaran */}
                      <div className="border border-emerald-200 rounded-xl p-3 bg-emerald-50/70 shadow-sm">
                        <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-emerald-200">
                          <Target className="w-3.5 h-3.5 text-emerald-700" />
                          <h3 className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                            C. DESAIN PEMBELAJARAN
                          </h3>
                        </div>

                        <div className="space-y-2 text-[11px] text-slate-700">
                          <div>
                            <strong className="text-emerald-900">Capaian Pembelajaran (CP):</strong>
                            <p className="mt-0.5 text-[10.5px] leading-relaxed italic bg-white/70 p-1.5 rounded border border-emerald-100">
                              &ldquo;{rpmData.desain.capaianPembelajaran}&rdquo;
                            </p>
                          </div>
                          <div>
                            <strong className="text-emerald-900">Lintas Disiplin Ilmu:</strong> {rpmData.desain.lintasDisiplin}
                          </div>
                          <div>
                            <strong className="text-emerald-900">Tujuan Pembelajaran (TP):</strong>
                            <ol className="list-decimal list-inside space-y-1 mt-1 text-[10.5px]">
                              {rpmData.desain.tujuanPembelajaran.map((tp, idx) => (
                                <li key={idx} className="leading-snug bg-white/80 p-1 rounded border border-emerald-100">
                                  {tp}
                                </li>
                              ))}
                            </ol>
                          </div>
                          <div className="text-[10px] grid grid-cols-2 gap-1 pt-1 border-t border-emerald-200">
                            <div><strong>Pendekatan:</strong> {rpmData.desain.pendekatan}</div>
                            <div><strong>Model:</strong> {rpmData.desain.model}</div>
                            <div><strong>Metode:</strong> {rpmData.desain.metode}</div>
                            <div><strong>Lingkungan:</strong> {rpmData.desain.lingkungan}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* KOLOM KANAN: PENGALAMAN BELAJAR BERMAKNA & ASESMEN */}
                    <div className="space-y-2.5">
                      {/* Section D: Pengalaman Belajar Mindful Meaningful Joyful */}
                      <div className="border border-purple-200 rounded-xl p-3 bg-purple-50/70 shadow-sm">
                        <div className="flex items-center justify-between mb-2 pb-1 border-b border-purple-200">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-purple-700" />
                            <h3 className="text-xs font-black text-purple-900 uppercase tracking-wide">
                              D. PENGALAMAN BELAJAR
                            </h3>
                          </div>
                          <span className="text-[9.5px] font-bold px-1.5 py-0.5 bg-purple-200 text-purple-800 rounded">
                            Mindful • Meaningful • Joyful
                          </span>
                        </div>

                        {/* Kegiatan Awal */}
                        <div className="mb-2 bg-white/80 p-2 rounded-lg border border-purple-100 text-[10.5px]">
                          <div className="flex items-center justify-between font-bold text-purple-900 mb-0.5">
                            <span>1. Kegiatan Awal ({rpmData.pengalamanBelajar.kegiatanAwal.durasi})</span>
                            <span className="text-[9px] text-purple-600">Apersepsi & Pemanasan</span>
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[10px]">
                            {rpmData.pengalamanBelajar.kegiatanAwal.aktivitas.slice(0, 3).map((act, i) => (
                              <li key={i} className="leading-snug">{act}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Kegiatan Inti (3 Tahap: Memahami, Mengaplikasikan, Merefleksi) */}
                        {rpmData.pengalamanBelajar.kegiatanInti.slice(0, 1).map((inti, i) => (
                          <div key={i} className="space-y-1.5">
                            {/* Tahap 1: Memahami */}
                            <div className="bg-sky-50 p-2 rounded-lg border border-sky-200 text-[10.5px]">
                              <div className="flex items-center justify-between font-bold text-sky-900 mb-0.5">
                                <span>Tahap Memahami ({inti.tahapMemahami.durasi})</span>
                                <span className="text-[9px] bg-sky-200 text-sky-800 px-1 rounded">Sintaks Masalah</span>
                              </div>
                              <ul className="space-y-0.5 text-[10px] text-slate-700">
                                {inti.tahapMemahami.poin.slice(0, 2).map((p, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-sky-600 font-bold">•</span>
                                    <span>{p.deskripsi} {p.dpl && <strong className="text-sky-800">[{p.dpl}]</strong>}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Tahap 2: Mengaplikasikan */}
                            <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-[10.5px]">
                              <div className="flex items-center justify-between font-bold text-emerald-900 mb-0.5">
                                <span>Tahap Mengaplikasikan ({inti.tahapMengaplikasikan.durasi})</span>
                                <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1 rounded">Praktik Berpasangan</span>
                              </div>
                              <ul className="space-y-0.5 text-[10px] text-slate-700">
                                {inti.tahapMengaplikasikan.poin.slice(0, 2).map((p, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-emerald-600 font-bold">•</span>
                                    <span>{p.deskripsi} {p.dpl && <strong className="text-emerald-800">[{p.dpl}]</strong>}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Tahap 3: Merefleksi */}
                            <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 text-[10.5px]">
                              <div className="flex items-center justify-between font-bold text-amber-900 mb-0.5">
                                <span>Tahap Merefleksi ({inti.tahapMerefleksi.durasi})</span>
                                <span className="text-[9px] bg-amber-200 text-amber-800 px-1 rounded">Evaluasi Diri</span>
                              </div>
                              <ul className="space-y-0.5 text-[10px] text-slate-700">
                                {inti.tahapMerefleksi.poin.slice(0, 2).map((p, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-amber-600 font-bold">•</span>
                                    <span>{p.deskripsi} {p.dpl && <strong className="text-amber-800">[{p.dpl}]</strong>}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}

                        {/* Kegiatan Penutup */}
                        <div className="mt-2 bg-white/80 p-1.5 rounded-lg border border-purple-100 text-[10px]">
                          <strong className="text-purple-900">Kegiatan Penutup ({rpmData.pengalamanBelajar.kegiatanPenutup.durasi}):</strong>
                          <span className="text-slate-700"> Pendinginan, evaluasi bersama, apresiasi teman, dan doa penutup.</span>
                        </div>
                      </div>

                      {/* Section E: Asesmen Ringkas */}
                      <div className="border border-rose-200 rounded-xl p-2.5 bg-rose-50/70 shadow-sm text-[10.5px]">
                        <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-rose-200 font-bold text-rose-900">
                          <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                          <span>E. ASESMEN PEMBELAJARAN</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[9.5px]">
                          <div className="bg-white p-1 rounded border border-rose-100">
                            <strong className="text-rose-700 block">1. Awal (Diagnostik)</strong>
                            <span>{rpmData.asesmen.awal.bentuk}</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-rose-100">
                            <strong className="text-rose-700 block">2. Proses (Formatif)</strong>
                            <span>{rpmData.asesmen.proses.bentuk}</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-rose-100">
                            <strong className="text-rose-700 block">3. Akhir (Sumatif)</strong>
                            <span>{rpmData.asesmen.akhir.bentuk}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bagian Bawah: Titimangsa & Tanda Tangan Resmi Seimbang */}
                  <div className="border-t-2 border-slate-200 pt-3">
                    <div className="grid grid-cols-2 text-center text-xs">
                      <div>
                        <p className="text-slate-500 text-[11px]">Mengetahui,</p>
                        <p className="font-bold text-slate-800 text-xs">Kepala Sekolah {rpmData.identitas.sekolah}</p>
                        <div className="h-14 flex items-center justify-center">
                          <span className="text-[10px] text-slate-300 italic">[Tanda Tangan & Cap Resmi]</span>
                        </div>
                        <p className="font-bold text-slate-900 underline text-xs">{rpmData.tandaTangan.kepalaSekolah}</p>
                        <p className="text-[10px] text-slate-600 font-mono">NIP. {rpmData.tandaTangan.nipKepalaSekolah}</p>
                      </div>

                      <div>
                        <p className="text-slate-500 text-[11px]">{rpmData.tandaTangan.titimangsa}</p>
                        <p className="font-bold text-slate-800 text-xs">Guru Mata Pelajaran PJOK</p>
                        <div className="h-14 flex items-center justify-center">
                          <span className="text-[10px] text-slate-300 italic">[Tanda Tangan Guru]</span>
                        </div>
                        <p className="font-bold text-slate-900 underline text-xs">{rpmData.tandaTangan.guru}</p>
                        <p className="text-[10px] text-slate-600 font-mono">NIP. {rpmData.tandaTangan.nipGuru}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 2: ASESMEN & RUBRIK BERGAMBAR A4 PORTRAIT */}
              {(activeTabSheet === 'sheet2' || typeof window === 'undefined') && (
                <div
                  ref={page2Ref}
                  id="rpm-sheet-page-2"
                  className="w-[210mm] min-h-[297mm] bg-white text-slate-800 p-8 shadow-2xl relative flex flex-col justify-between font-sans print:shadow-none print:w-full print:p-6"
                  style={{ boxSizing: 'border-box' }}
                >
                  <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500" />
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-rose-500 to-amber-500" />

                  {/* Header Halaman 2 */}
                  <div className="border-b-2 border-slate-200 pb-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            Lampiran Asesmen & Instrumen Evaluasi
                          </span>
                          <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                            LEMBAR SOAL BERGAMBAR & RUBRIK KINERJA
                          </h2>
                          <p className="text-xs text-slate-500">
                            {rpmData.identitas.mataPelajaran} • {rpmData.identitas.kelasFase} • {rpmData.identitas.sekolah}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-lg text-slate-700">
                          Font Soal: 12 pt Terstandar
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content: Soal Awal (Font Soal 12pt dengan Badge Modern & Kartu Warna Lembut) */}
                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <HelpCircle className="w-4 h-4 text-amber-600" />
                        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                          1. Instrumen Asesmen Awal (Diagnostik Pemahaman Murid)
                        </h3>
                      </div>
                      {/* Kartu Soal Berwarna-Warni Lembut 2 Kolom Sejajar */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {rpmData.lampiran.soalAwal.slice(0, 4).map((soal, idx) => {
                          const cardStyle = softCardColors[idx % softCardColors.length];
                          const badgeStyle = softBadgeColors[idx % softBadgeColors.length];
                          return (
                            <div key={soal.no} className={`border rounded-xl p-3 shadow-xs ${cardStyle}`}>
                              <div className="flex items-start gap-2.5">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-xs ${badgeStyle}`}>
                                  {soal.no}
                                </span>
                                <div className="space-y-1">
                                  {/* Font Soal Wajib 12pt (16px) */}
                                  <p className="text-[12pt] font-semibold text-slate-900 leading-snug">
                                    {soal.soal}
                                  </p>
                                  <div className="text-[10px] text-slate-600 bg-white/70 p-1.5 rounded-md border border-slate-200 mt-1">
                                    <strong className="text-slate-800">Kunci Jawaban:</strong> {soal.jawaban}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Rubrik Penilaian Kinerja 4 Skala (Perlu Bimbingan, Cukup, Baik, Sangat Baik) */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                          2. Rubrik Asesmen Kinerja & Keterampilan Gerak (4 Kategori Nilai)
                        </h3>
                      </div>

                      <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs text-xs">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase border-b border-slate-300">
                              <th className="p-2 text-left w-[24%] border-r border-slate-300">Aspek Keterampilan</th>
                              <th className="p-2 text-left bg-rose-50 text-rose-900 border-r border-slate-300 w-[19%]">
                                Perlu Bimbingan<br/><span className="font-normal text-[9px]">(0 – 68)</span>
                              </th>
                              <th className="p-2 text-left bg-amber-50 text-amber-900 border-r border-slate-300 w-[19%]">
                                Cukup<br/><span className="font-normal text-[9px]">(68 – 78)</span>
                              </th>
                              <th className="p-2 text-left bg-sky-50 text-sky-900 border-r border-slate-300 w-[19%]">
                                Baik<br/><span className="font-normal text-[9px]">(79 – 89)</span>
                              </th>
                              <th className="p-2 text-left bg-emerald-50 text-emerald-900 w-[19%]">
                                Sangat Baik<br/><span className="font-normal text-[9px]">(90 – 100)</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-[10px]">
                            {rpmData.lampiran.rubrikKeterampilan.map((rub, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="p-2 font-bold text-slate-900 border-r border-slate-200 bg-slate-50">
                                  {rub.aspek}
                                </td>
                                <td className="p-2 text-slate-700 border-r border-slate-200 bg-rose-50/30">
                                  {rub.skala1}
                                </td>
                                <td className="p-2 text-slate-700 border-r border-slate-200 bg-amber-50/30">
                                  {rub.skala2}
                                </td>
                                <td className="p-2 text-slate-700 border-r border-slate-200 bg-sky-50/30">
                                  {rub.skala3}
                                </td>
                                <td className="p-2 text-slate-700 bg-emerald-50/30">
                                  {rub.skala4}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Soal Asesmen Akhir */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-purple-600" />
                        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                          3. Soal Asesmen Sumatif Lingkup Materi (Font 12 pt)
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {rpmData.lampiran.soalAkhir.slice(0, 2).map((soal, idx) => (
                          <div key={soal.no} className="border border-purple-200 bg-purple-50/60 rounded-xl p-3 shadow-xs">
                            <div className="flex items-start gap-2.5">
                              <span className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                                {soal.no}
                              </span>
                              <div>
                                <p className="text-[12pt] font-semibold text-slate-900 leading-snug">
                                  {soal.soal}
                                </p>
                                <p className="text-[10px] text-purple-900 mt-1 italic">
                                  <strong>Kunci:</strong> {soal.jawaban}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Titimangsa & Tanda Tangan */}
                  <div className="border-t-2 border-slate-200 pt-3 mt-3">
                    <div className="flex justify-between items-center text-xs text-slate-600 px-4">
                      <span>Dokumen Asesmen Terstandar PJOK Kurikulum Merdeka</span>
                      <span>{rpmData.tandaTangan.titimangsa}</span>
                      <span className="font-bold text-slate-800">{rpmData.tandaTangan.guru}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 3: LKPD VISUAL INTERAKTIF A4 PORTRAIT */}
              {(activeTabSheet === 'sheet3' || typeof window === 'undefined') && (
                <div
                  ref={page3Ref}
                  id="rpm-sheet-page-3"
                  className="w-[210mm] min-h-[297mm] bg-white text-slate-800 p-8 shadow-2xl relative flex flex-col justify-between font-sans print:shadow-none print:w-full print:p-6"
                  style={{ boxSizing: 'border-box' }}
                >
                  <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500" />

                  {/* Header LKPD Menarik Bergaya Majalah Edukatif Anak Gen Z */}
                  <div className="border-b-2 border-slate-200 pb-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-white shadow-md">
                          <Smile className="w-7 h-7" />
                        </div>
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Lembar Tantangan Praktik Mandiri & Kolaborasi
                          </span>
                          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                            LEMBAR KERJA PESERTA DIDIK (LKPD) INTERAKTIF
                          </h2>
                          <p className="text-xs font-semibold text-slate-500">
                            Topik: {rpmData.identitas.topik} • {rpmData.identitas.kelasFase}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                          Joyful Learning
                        </span>
                      </div>
                    </div>

                    {/* Box Isian Identitas Siswa Modern */}
                    <div className="mt-3 grid grid-cols-4 gap-2 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs">
                      <div className="border-r border-slate-200 pr-2">
                        <span className="text-[10px] text-slate-400 font-bold block">Nama Lengkap Murid:</span>
                        <div className="border-b border-dotted border-slate-400 h-5" />
                      </div>
                      <div className="border-r border-slate-200 pr-2">
                        <span className="text-[10px] text-slate-400 font-bold block">Teman Pasangan Latihan:</span>
                        <div className="border-b border-dotted border-slate-400 h-5" />
                      </div>
                      <div className="border-r border-slate-200 pr-2">
                        <span className="text-[10px] text-slate-400 font-bold block">Kelas / No Absen:</span>
                        <div className="border-b border-dotted border-slate-400 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Hari / Tanggal Praktik:</span>
                        <div className="border-b border-dotted border-slate-400 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Petunjuk Belajar Ramah Peserta Didik */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-950 mb-3 flex items-start gap-2">
                    <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Petunjuk Seru Mengerjakan:</strong>
                      <div className="grid grid-cols-2 gap-x-2 text-[10px] text-amber-900 mt-0.5">
                        {rpmData.lampiran.lkpd.petunjuk.map((pet, i) => (
                          <span key={i}>• {pet}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bagian Tantangan LKPD: 2 Kolom Sejajar */}
                  <div className="grid grid-cols-2 gap-3 flex-1 mb-3">
                    {/* Kolom 1: Tahap Memahami (Pertanyaan 12pt) */}
                    <div className="border border-sky-200 bg-sky-50/60 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 pb-1 border-b border-sky-200 font-bold text-xs text-sky-900 mb-2">
                          <BookCheck className="w-3.5 h-3.5 text-sky-600" />
                          <span>Tahap 1: Pengamatan & Pemahaman Konsep</span>
                        </div>
                        <p className="text-[10.5px] text-slate-600 mb-2 italic bg-white/70 p-1.5 rounded border border-sky-100">
                          {rpmData.lampiran.lkpd.memahami.teksPengantar}
                        </p>
                        <div className="space-y-2">
                          {rpmData.lampiran.lkpd.memahami.pertanyaan.map((q, idx) => (
                            <div key={idx} className="bg-white p-2 rounded-lg border border-sky-100 shadow-xs">
                              {/* Font Soal Wajib 12pt */}
                              <p className="text-[12pt] font-semibold text-slate-900 leading-snug">
                                {idx + 1}. {q}
                              </p>
                              <div className="mt-1 h-10 border-b border-dashed border-slate-300" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Kolom 2: Tahap Mengaplikasikan & Merefleksikan */}
                    <div className="space-y-3">
                      {/* Tantangan Praktik Gerak */}
                      <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-emerald-200 font-bold text-xs text-emerald-900 mb-1.5">
                          <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tahap 2: Tantangan Gerak di Lapangan</span>
                        </div>
                        <p className="text-[11.5pt] font-bold text-slate-900 leading-snug">
                          {rpmData.lampiran.lkpd.mengaplikasikan.kasusTugas}
                        </p>
                        <p className="text-[10px] text-emerald-800 mt-1">
                          {rpmData.lampiran.lkpd.mengaplikasikan.instruksi}
                        </p>
                        <div className="mt-2 grid grid-cols-5 gap-1 text-center text-[10px]">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <div key={num} className="bg-white p-1 rounded border border-emerald-200">
                              <span className="block font-bold text-emerald-700">Tendangan {num}</span>
                              <span className="text-[9px] text-slate-400">[ Gol / Meleset ]</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tahap Refleksi Diri */}
                      <div className="border border-purple-200 bg-purple-50/60 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-purple-200 font-bold text-xs text-purple-900 mb-1.5">
                          <Heart className="w-3.5 h-3.5 text-purple-600" />
                          <span>Tahap 3: Refleksi & Apresiasi Diri</span>
                        </div>
                        <div className="space-y-1.5">
                          {rpmData.lampiran.lkpd.merefleksikan.pertanyaan.slice(0, 2).map((q, idx) => (
                            <div key={idx} className="bg-white p-1.5 rounded border border-purple-100">
                              <p className="text-[11pt] font-semibold text-slate-900 leading-snug">
                                {idx + 1}. {q}
                              </p>
                              <div className="mt-1 h-6 border-b border-dashed border-slate-300" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checklist Karakter & Motivasi */}
                  <div className="border border-teal-200 bg-teal-50/70 rounded-xl p-2.5 mb-2">
                    <div className="flex items-center justify-between text-xs font-bold text-teal-900 mb-1">
                      <span>Checklist Sikap & Karakter Pelajar Pancasila:</span>
                      <span className="text-[10px] text-teal-700 font-normal">Beri tanda centang (✓) yang sesuai</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-[10px] text-slate-700">
                      {rpmData.lampiran.lkpd.penutup.checklist.slice(0, 6).map((chk, idx) => (
                        <label key={idx} className="flex items-center gap-1.5 bg-white p-1 rounded border border-teal-100">
                          <input type="checkbox" defaultChecked className="rounded text-teal-600 w-3 h-3" />
                          <span className="truncate">{chk}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Motivasi & Tanda Tangan Murid / Guru */}
                  <div className="border-t-2 border-slate-200 pt-2 flex items-center justify-between text-xs">
                    <p className="text-[10px] text-slate-500 italic max-w-md">
                      ✨ &ldquo;{rpmData.lampiran.lkpd.penutup.pesanMotivasi}&rdquo;
                    </p>
                    <div className="flex gap-6 text-center text-[10.5px]">
                      <div>
                        <span className="block text-slate-500">Nilai Guru PJOK</span>
                        <div className="w-16 h-7 border border-slate-300 rounded flex items-center justify-center font-bold text-emerald-700">
                          A+
                        </div>
                      </div>
                      <div>
                        <span className="block text-slate-500">Paraf Guru</span>
                        <div className="w-16 h-7 border-b border-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
