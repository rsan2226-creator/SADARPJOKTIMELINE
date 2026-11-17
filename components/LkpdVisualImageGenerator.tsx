'use client';

import React, { useState, useRef } from 'react';
import { 
  Palette, Download, Sparkles, CheckCircle2, 
  Layers, Eye, ZoomIn, ZoomOut, RefreshCw, FileImage, 
  Award, Heart, Smile, Trophy, Target, ShieldCheck, 
  Dumbbell, Star, BookOpen, Compass, CheckSquare, HelpCircle,
  Clock, Calendar, User, School, BookCheck, ArrowRightLeft,
  PenTool, Check, Share2
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { VisualLkpdData, getFallbackVisualLkpdData, VisualLkpdSection } from '@/lib/visual-lkpd';
import { DocumentExportToolbar } from './DocumentExportToolbar';
import { escapeHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

type ThemeMode = 'pastel' | 'sporty' | 'clean';

const SAMPLE_LKPD_PJOK = `LEMBAR KERJA PESERTA DIDIK (LKPD) INTERAKTIF
Mata Pelajaran: Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)
Kelas/Fase: Kelas V (Lima) / Fase C
Topik: Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola (Sepak Bola)
Alokasi Waktu: 2 x 40 Menit (1 Pertemuan)
Sekolah: SD Negeri Kalimantong

A. PETUNJUK PENGGUNAAN
1. Berdoalah terlebih dahulu sebelum memulai seluruh rangkaian kegiatan gerak dan belajar.
2. Kenakan seragam olahraga sekolah lengkap, kaos kaki, dan sepatu olahraga yang aman.
3. Bekerjasamalah secara sportif, kompak, dan saling menghargai rekan pasangan latihanmu.
4. Bacalah stimulus konsep dan perhatikan gambar ilustrasi secara cermat sebelum menjawab soal.

B. STIMULUS & EKSPLORASI KONSEP
Amati teknik posisi kaki tumpu dan kaki ayun pada operan mendatar (passing kaki bagian dalam):
Kunci utama akurasi dan laju bola mendatar terletak pada penempatan kaki tumpu. Kaki tumpu diletakkan tepat di samping bola berjarak sekitar 10-15 cm dengan ujung jari kaki menghadap lurus ke arah kawan yang dituju. Kaki ayun diputar ke arah luar sehingga perkenaan bola tepat pada lengkungan kaki bagian dalam. Bola disentuh tepat di titik tengah agar meluncur rata di atas rumput tanpa melambung.

C. PERTANYAAN PEMAHAMAN & ANALISIS KRITIS
1. Mengapa ujung jari kaki tumpu harus selalu dihadapkan lurus ke arah teman pasangan yang akan menerima bola?
2. Apa yang akan terjadi pada lintasan bola jika saat menendang, perkenaan kaki berada pada bagian paling bawah bola dan tubuhmu condong ke belakang?
3. Sebutkan keunggulan menendang bola menggunakan kaki bagian dalam dibandingkan menggunakan ujung jari kaki (cocor) saat mengoper jarak dekat!

D. TANTANGAN MENCOCOKKAN (MATCHING PAIRS)
Pasangkan istilah teknik gerak berikut dengan fungsinya yang paling tepat:
- Kaki Tumpu di Samping Bola -> Menjadi poros keseimbangan dan penentu arah lurus operan bola
- Kaki Bagian Dalam -> Bidang sentuh luas yang menghasilkan operan bola paling stabil dan terarah
- Gerak Menghentikan Bola (Trapping) -> Meredam momentum laju bola agar berhenti tenang dalam penguasaan
- Gerak Lanjutan (Follow Through) -> Menjaga momentum ayunan tubuh agar operan bertenaga dan mencegah cedera sendi

E. MISI LAPANGAN & KASUS NYATA (GERBANG PRESISI)
Bekerjasamalah dengan pasanganmu di lapangan. Pasang 2 buah cone berjarak 50 cm sebagai gerbang sasaran. Lakukan 10 kali operan mendatar bergantian dari jarak 4 meter yang harus meluncur mulus melewati celah gerbang tanpa menabrak cone sama sekali!
Catat hasil latihanmu:
- Berapa kali operan yang berhasil lolos mulus dari 10 kali percobaan?
- Apa kendala utama yang kamu dan pasanganmu temukan saat bola melenceng ke samping?

F. REFLEKSI BERKESADARAN & PENILAIAN DIRI
1. Bagaimana perasaanmu setelah berhasil bekerja sama dan saling mengoreksi teknik operan bersama teman pasangan?
2. Beri tanda centang (✓) pada daftar kecakapan berikut jika kamu sudah memahaminya:
[✓] Saya dapat menempatkan kaki tumpu tepat di samping bola dengan arah lurus ke sasaran.
[✓] Saya mampu melakukan operan mendatar menggunakan kaki bagian dalam secara konsisten.
[✓] Saya dapat menghentikan bola dengan tenang di depan badan tanpa bola memantul liar.
[✓] Saya selalu sportif, tidak menyalahkan teman saat salah oper, dan bersemangat selama latihan.

Pesan Penyemangat: "Juara sejati tidak hanya mahir mengolah bola, tetapi selalu menghargai kawan dan bermain dengan sportivitas tinggi!"
Titimangsa: Kalimantong, 13 Juli 2026
Guru Pengampu: Guru PJOK SD Negeri Kalimantong`;

const SAMPLE_LKPD_KEBUGARAN = `LEMBAR KERJA PESERTA DIDIK (LKPD) KEBUGARAN JASMANI
Mata Pelajaran: PJOK
Kelas/Fase: Kelas VII (Tujuh) / Fase D
Topik: Latihan Daya Tahan Jantung-Paru dan Analisis Denyut Nadi Latihan
Alokasi Waktu: 2 x 40 Menit (Pertemuan 1)
Sekolah: SMP Negeri 1 Olahraga

A. PETUNJUK BELAJAR
1. Pastikan dalam kondisi sehat dan sudah sarapan ringan minimal 1 jam sebelum tes.
2. Siapkan stopwatch atau jam tangan untuk menghitung denyut nadi selama 15 detik dikalikan 4.
3. Catat hasil secara jujur pada tabel yang telah disediakan.

B. STIMULUS ILMIAH
Denyut Nadi Istirahat (Resting Heart Rate) adalah indikator efisiensi kerja otot jantung. Jantung atlet atau peserta didik yang bugar dapat memompa volume darah lebih banyak per denyut, sehingga denyut istirahatnya lebih rendah (60-75 bpm). Setelah aktivitas interval circuit training 3 pos (jumping jacks, shuttle run, burpees), denyut nadi akan melonjak ke zona latihan (120-160 bpm).

C. PERTANYAAN ANALISIS
1. Mengapa atlet yang terlatih memiliki denyut nadi istirahat yang lebih rendah dibandingkan orang yang jarang berolahraga?
2. Jika denyut nadimu mencapai 175 bpm setelah sirkuit, langkah pendinginan apa yang wajib segera kamu lakukan?

D. TANTANGAN PRAKTIK & PENCATATAN DATA
Lakukan Circuit Training 3 Pos: Pos 1 Jumping Jacks (30 dtk), Pos 2 Shuttle Run 5x (30 dtk), Pos 3 Plank (30 dtk).
- Denyut Nadi Sebelum Latihan: ... bpm
- Denyut Nadi Segera Setelah Latihan: ... bpm
- Denyut Nadi Pemulihan (Menit ke-3): ... bpm

E. PENILAIAN DIRI & REFLEKSI
- [✓] Saya mampu mengukur denyut nadi mandiri di arteri radialis (pergelangan tangan).
- [✓] Saya menyelesaikan seluruh pos latihan sirkuit tanpa menyerah.
- [✓] Saya menyadari pentingnya menjaga kebugaran jantung untuk masa depan.

Pesan: "Kebugaran bukan tentang menjadi lebih baik dari orang lain, melainkan menjadi lebih baik dari dirimu kemarin!"
Titimangsa: Sumbawa Barat, 13 Juli 2026
Guru Pengampu: Guru PJOK SMPN 1 Olahraga`;

const SAMPLE_LKPD_IPAS = `LEMBAR KERJA PESERTA DIDIK (LKPD) IPAS
Mata Pelajaran: Ilmu Pengetahuan Alam dan Sosial (IPAS)
Kelas/Fase: Kelas V / Fase C
Topik: Ekosistem Sawah dan Aliran Energi Rantai Makanan
Alokasi Waktu: 2 x 40 Menit
Sekolah: SD Negeri Kalimantong

A. PETUNJUK
1. Bacalah bagan rantai makanan dengan saksama.
2. Diskusikan bersama anggota kelompokmu (4 orang).
3. Tuliskan jawaban dengan tulisan tangan yang rapi dan teliti.

B. STIMULUS PENGAMATAN
Di sawah Kalimantong, padi tumbuh subur memanfaatkan sinar matahari (Produsen). Belalang memakan daun padi (Konsumen I), lalu katak memangsa belalang (Konsumen II). Ular sawah memburu katak (Konsumen III), hingga burung elang memburu ular (Konsumen Puncak). Saat elang mati, jamur dan bakteri menguraikannya menjadi humus tanah bagi padi.

C. PERTANYAAN PEMAHAMAN
1. Apa peran utama tanaman padi dalam rantai makanan tersebut dan dari mana padi memperoleh energi awalnya?
2. Jika populasi ular sawah diburu habis oleh manusia, apa dampak buruk langsung yang akan dialami oleh tanaman padi milik petani? Jelaskan alur logikanya!
3. Mengapa pengurai (dekomposer) sangat penting bagi kelangsungan siklus rantai makanan berikutnya?

D. TANTANGAN MENCOCOKKAN TINGKAT TROFIK
- Tanaman Padi -> Produsen Autotrof penghasil energi organik pertama
- Belalang Sawah -> Konsumen Primer Herbivora pemakan produsen
- Katak Sawah -> Konsumen Sekunder Karnivora pemangsa serangga
- Jamur & Bakteri -> Dekomposer pengurai bangkai menjadi nutrisi tanah

E. REFLEKSI SIKAP PEDULI LINGKUNGAN
- Komitmen nyata apa yang dapat kamu lakukan untuk menjaga keseimbangan ekosistem di sekitarmu?
- [✓] Saya memahami peran tiap makhluk hidup dalam menjaga keseimbangan alam.
- [✓] Saya tidak akan menyakiti atau membasmi hewan liar yang tidak membahayakan.

Pesan: "Setiap makhluk hidup memiliki peran berharga di bumi. Jagalah keseimbangan alam demi generasi penerus!"
Titimangsa: Kalimantong, 13 Juli 2026
Guru Pengampu: Guru Kelas V SD Negeri Kalimantong`;

export function LkpdVisualImageGenerator() {
  const [rawInput, setRawInput] = useState<string>(SAMPLE_LKPD_PJOK);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [activeSheet, setActiveSheet] = useState<'sheet1' | 'sheet2' | 'both'>('sheet1');
  const [theme, setTheme] = useState<ThemeMode>('pastel');
  const [zoomScale, setZoomScale] = useState<number>(0.85);

  // Student details prefillable
  const [studentName, setStudentName] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('Kelas V (Lima)');
  const [studentAbsen, setStudentAbsen] = useState<string>('');
  const [studentDate, setStudentDate] = useState<string>('13 Juli 2026');

  // Parsed Visual LKPD data
  const [lkpdData, setLkpdData] = useState<VisualLkpdData>(() => getFallbackVisualLkpdData());

  // Refs for capturing High-Res Images
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);

  // Separate sections between Sheet 1 and Sheet 2
  const sheet1Sections = lkpdData.bagianList.slice(0, 2);
  const sheet2Sections = lkpdData.bagianList.slice(2);

  const handleTransform = async () => {
    setIsLoading(true);
    try {
      const res = await postJsonSafe<{ data?: VisualLkpdData }>(
        '/api/gemini/transform-lkpd-visual',
        { rawLkpdText: rawInput }
      );
      if (res.data?.data) {
        setLkpdData(res.data.data);
      } else {
        setLkpdData(getFallbackVisualLkpdData());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSingleImage = async (ref: React.RefObject<HTMLDivElement | null>, fileName: string) => {
    if (!ref.current) return;
    setIsExporting(true);
    try {
      // 2x pixel ratio for crystal-clear 300DPI equivalent quality
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
        link1.download = `LKPD_Visual_Halaman1_${Date.now()}.png`;
        link1.href = dataUrl1;
        link1.click();
      }
      if (page2Ref.current) {
        setTimeout(async () => {
          if (page2Ref.current) {
            const dataUrl2 = await toPng(page2Ref.current, { quality: 0.98, pixelRatio: 2, backgroundColor: '#ffffff' });
            const link2 = document.createElement('a');
            link2.download = `LKPD_Visual_Halaman2_${Date.now()}.png`;
            link2.href = dataUrl2;
            link2.click();
          }
          setIsExporting(false);
        }, 300);
      } else {
        setIsExporting(false);
      }
    } catch (err) {
      console.error('Export all error:', err);
      setIsExporting(false);
    }
  };

  const buildExportHtml = () => {
    const title = lkpdData.identitas.judulLkpd || 'LKPD_Visual_Interaktif';
    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${escapeHtml(title)}</title>
        <style>
          @page { size: A4 portrait; margin: 1.5cm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; line-height: 1.45; font-size: 10.5pt; }
          .header { text-align: center; border-bottom: 3px double #0284c7; padding-bottom: 8px; margin-bottom: 14px; }
          .header h1 { font-size: 15pt; margin: 0; color: #0369a1; text-transform: uppercase; }
          .header p { margin: 3px 0; font-size: 9.5pt; color: #475569; }
          table { width: 100%; border-collapse: collapse; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; break-inside: avoid; }
          .identity-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
          .identity-table td { border: 1px solid #475569; padding: 6px 10px; font-size: 9.5pt; }
          .section-card { border: 1px solid #bae6fd; background-color: #f0f9ff; border-radius: 8px; padding: 12px; margin-bottom: 14px; page-break-inside: avoid; }
          .section-title { font-weight: bold; font-size: 11.5pt; color: #0284c7; margin-bottom: 6px; }
          .question-box { border: 1px dashed #94a3b8; background-color: #ffffff; padding: 10px; margin-top: 6px; border-radius: 6px; min-height: 55px; }
          .footer-note { font-style: italic; color: #475569; font-size: 9pt; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${escapeHtml(lkpdData.identitas.judulLkpd)}</h1>
          <p><strong>Mata Pelajaran:</strong> ${escapeHtml(lkpdData.identitas.mataPelajaran)} | <strong>Kelas/Fase:</strong> ${escapeHtml(lkpdData.identitas.kelasFase)}</p>
          <p><strong>Topik:</strong> ${escapeHtml(lkpdData.identitas.topikMateri)} | <strong>Waktu:</strong> ${escapeHtml(lkpdData.identitas.alokasiWaktu)}</p>
        </div>

        <table class="identity-table">
          <tbody>
            <tr>
              <td width="50%"><strong>Nama Siswa:</strong> ${escapeHtml(studentName || '...................................................')}</td>
              <td width="50%"><strong>No. Absen / Kelas:</strong> ${escapeHtml(studentAbsen || '.......')} / ${escapeHtml(studentClass || lkpdData.identitas.kelasFase)}</td>
            </tr>
            <tr>
              <td><strong>Hari / Tanggal:</strong> ${escapeHtml(studentDate || '...................................................')}</td>
              <td><strong>Nilai / Paraf Guru:</strong> ...................................................</td>
            </tr>
          </tbody>
        </table>

        ${lkpdData.bagianList.map((sec) => `
          <div class="section-card">
            <div class="section-title">${escapeHtml(sec.ikon)} ${escapeHtml(sec.judulBagian)}</div>
            ${sec.instruksi ? `<p><em>${escapeHtml(sec.instruksi)}</em></p>` : ''}
            ${sec.teksKonten ? `<p style="line-height: 1.6;">${escapeHtml(sec.teksKonten)}</p>` : ''}
            ${sec.butirSoal?.map(s => `
              <div style="margin-top: 8px;">
                <strong>${s.nomor}. ${escapeHtml(s.pertanyaan)}</strong>
                <div class="question-box"><em>Ruang Jawaban Siswa:</em></div>
              </div>
            `).join('') || ''}
            ${sec.itemMencocokkan ? `
              <table style="width: 100%; border-collapse: collapse; margin-top: 8px; background: #ffffff;">
                <thead>
                  <tr>
                    <th style="border: 1px solid #334155; padding: 6px; background: #e2e8f0; width: 45%;">Pernyataan / Konsep</th>
                    <th style="border: 1px solid #334155; padding: 6px; background: #e2e8f0; width: 10%; text-align: center;">Arah</th>
                    <th style="border: 1px solid #334155; padding: 6px; background: #e2e8f0; width: 45%;">Pasangan / Makna</th>
                  </tr>
                </thead>
                <tbody>
                  ${sec.itemMencocokkan.map(m => `
                    <tr>
                      <td style="border: 1px solid #334155; padding: 6px;"><strong>${escapeHtml(m.kiri)}</strong></td>
                      <td style="border: 1px solid #334155; padding: 6px; text-align: center;">&rarr;</td>
                      <td style="border: 1px solid #334155; padding: 6px;">${escapeHtml(m.kanan)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
            ${sec.itemChecklist ? `
              <ul style="margin-top: 6px; padding-left: 20px;">
                ${sec.itemChecklist.map(c => `<li>&#9744; ${escapeHtml(c)}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}

        <div class="footer-note">
          <p>${escapeHtml(lkpdData.penutup.pesanPenyemangat || '')}</p>
          <p><strong>${escapeHtml(lkpdData.penutup.titimangsa || 'Kalimantong, 2026')}</strong> &bull; Guru Pengampu: ${escapeHtml(lkpdData.penutup.namaGuru || 'Guru PJOK')}</p>
        </div>
      </body>
      </html>
    `;
  };

  // Color mappings based on theme and section color
  const getCardStyle = (color: string) => {
    if (theme === 'pastel') {
      switch (color) {
        case 'cyan':
          return {
            bg: 'bg-cyan-50/70',
            border: 'border-cyan-200',
            headerBg: 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white',
            badgeBg: 'bg-cyan-100 text-cyan-800',
            accent: 'text-cyan-700',
          };
        case 'amber':
          return {
            bg: 'bg-amber-50/70',
            border: 'border-amber-200',
            headerBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
            badgeBg: 'bg-amber-100 text-amber-800',
            accent: 'text-amber-700',
          };
        case 'emerald':
          return {
            bg: 'bg-emerald-50/70',
            border: 'border-emerald-200',
            headerBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
            badgeBg: 'bg-emerald-100 text-emerald-800',
            accent: 'text-emerald-700',
          };
        case 'purple':
          return {
            bg: 'bg-purple-50/70',
            border: 'border-purple-200',
            headerBg: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
            badgeBg: 'bg-purple-100 text-purple-800',
            accent: 'text-purple-700',
          };
        case 'rose':
          return {
            bg: 'bg-rose-50/70',
            border: 'border-rose-200',
            headerBg: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white',
            badgeBg: 'bg-rose-100 text-rose-800',
            accent: 'text-rose-700',
          };
        case 'indigo':
        default:
          return {
            bg: 'bg-indigo-50/70',
            border: 'border-indigo-200',
            headerBg: 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white',
            badgeBg: 'bg-indigo-100 text-indigo-800',
            accent: 'text-indigo-700',
          };
      }
    } else if (theme === 'sporty') {
      // Sporty energetic neon tones
      switch (color) {
        case 'cyan':
          return {
            bg: 'bg-sky-50',
            border: 'border-sky-400',
            headerBg: 'bg-slate-900 text-sky-400 border-b border-sky-400',
            badgeBg: 'bg-sky-500 text-white font-bold',
            accent: 'text-sky-900',
          };
        case 'amber':
          return {
            bg: 'bg-amber-50',
            border: 'border-amber-400',
            headerBg: 'bg-slate-900 text-amber-400 border-b border-amber-400',
            badgeBg: 'bg-amber-500 text-slate-950 font-bold',
            accent: 'text-amber-900',
          };
        case 'emerald':
        default:
          return {
            bg: 'bg-emerald-50',
            border: 'border-emerald-400',
            headerBg: 'bg-slate-900 text-emerald-400 border-b border-emerald-400',
            badgeBg: 'bg-emerald-500 text-slate-950 font-bold',
            accent: 'text-emerald-900',
          };
      }
    } else {
      // Clean Minimalist
      return {
        bg: 'bg-slate-50/80',
        border: 'border-slate-300',
        headerBg: 'bg-slate-800 text-white',
        badgeBg: 'bg-slate-200 text-slate-800',
        accent: 'text-slate-800',
      };
    }
  };

  // Render a Single LKPD Section Card
  const renderSectionCard = (sec: VisualLkpdSection, idx: number) => {
    const style = getCardStyle(sec.warnaCard);

    return (
      <div 
        key={sec.id || idx} 
        className={`rounded-2xl border ${style.border} ${style.bg} overflow-hidden shadow-sm transition-all mb-4`}
      >
        {/* Section Header */}
        <div className={`px-4 py-2.5 flex items-center justify-between ${style.headerBg}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{sec.ikon}</span>
            <h3 className="font-bold text-sm tracking-tight">{sec.judulBagian}</h3>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
            {sec.tipe.replace('_', ' ')}
          </span>
        </div>

        {/* Section Body */}
        <div className="p-4 space-y-3 text-slate-800">
          {/* Instruksi khusus jika ada */}
          {sec.instruksi && (
            <div className="flex items-start gap-2 text-xs font-semibold text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
              <span className="text-amber-500 font-bold">👉</span>
              <p className="leading-relaxed">{sec.instruksi}</p>
            </div>
          )}

          {/* Teks konten stimulus jika ada */}
          {sec.teksKonten && (
            <div className="text-xs leading-relaxed text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
              <p>{sec.teksKonten}</p>
              {sec.ilustrasiDeskripsi && (
                <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-sky-50 via-indigo-50 to-emerald-50 border border-sky-200 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-500 text-white shrink-0 mt-0.5 shadow-sm">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 block">
                      📌 Ilustrasi Pengamatan & Skematik Visual
                    </span>
                    <p className="text-xs text-slate-700 italic mt-0.5 font-medium">
                      &quot;{sec.ilustrasiDeskripsi}&quot;
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Soal Isian */}
          {sec.butirSoal && sec.butirSoal.length > 0 && (
            <div className="space-y-3">
              {sec.butirSoal.map((soal, sIdx) => {
                const heightClass = 
                  soal.ruangJawabanHeight === 'lg' ? 'min-h-[90px]' :
                  soal.ruangJawabanHeight === 'sm' ? 'min-h-[46px]' : 'min-h-[65px]';

                return (
                  <div key={sIdx} className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
                    <div className="flex items-start gap-2.5 mb-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-sky-500 text-white font-extrabold text-xs shrink-0 shadow-2xs">
                        {soal.nomor}
                      </span>
                      <p className="text-xs font-bold text-slate-800 leading-snug pt-0.5">
                        {soal.pertanyaan}
                      </p>
                    </div>

                    {/* Interactive Fillable Answer Box */}
                    <div className={`w-full rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-2.5 text-xs text-slate-400 ${heightClass} flex flex-col justify-between relative`}>
                      <span className="text-[10px] font-semibold text-slate-400 select-none flex items-center gap-1">
                        <PenTool className="w-3 h-3 text-sky-500" />
                        Ruang Jawaban Peserta Didik:
                      </span>
                      {/* Lined notebook effect */}
                      <div className="w-full space-y-2 mt-2 opacity-40">
                        <div className="border-b border-slate-300 h-2"></div>
                        <div className="border-b border-slate-300 h-2"></div>
                        {soal.ruangJawabanHeight === 'lg' && <div className="border-b border-slate-300 h-2"></div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mencocokkan / Matching Pairs */}
          {sec.itemMencocokkan && sec.itemMencocokkan.length > 0 && (
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-2 pb-1 border-b border-slate-100">
                <span>Kolom A (Konsep / Gerak)</span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Tarik Garis / Pasangkan
                </span>
                <span>Kolom B (Fungsi / Makna)</span>
              </div>
              <div className="space-y-2">
                {sec.itemMencocokkan.map((m, mIdx) => (
                  <div key={mIdx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5 p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-xs font-semibold text-slate-800 flex items-center justify-between shadow-2xs">
                      <span>{m.kiri}</span>
                      <span className="w-5 h-5 rounded-full bg-sky-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {mIdx + 1}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full border-2 border-dashed border-amber-400 bg-amber-50 flex items-center justify-center text-[10px] text-amber-700 font-bold">
                        ⚯
                      </div>
                    </div>

                    <div className="col-span-5 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-slate-700 flex items-center justify-between shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mr-1.5">
                        {String.fromCharCode(65 + mIdx)}
                      </span>
                      <span className="flex-1">{m.kanan}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checklist Penilaian Diri */}
          {sec.itemChecklist && sec.itemChecklist.length > 0 && (
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-2">
              {sec.itemChecklist.map((chk, cIdx) => (
                <label 
                  key={cIdx} 
                  className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-md border-2 border-emerald-500 flex items-center justify-center shrink-0 mt-0.5 bg-emerald-50/50">
                    <Check className="w-3.5 h-3.5 text-emerald-600 opacity-60" />
                  </div>
                  <span className="text-xs text-slate-700 font-medium leading-snug">
                    {chk}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Title */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 border border-teal-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 font-black shadow-lg shadow-teal-500/20">
                <FileImage className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                High-Resolution Image (.PNG HD) & A4 Portrait
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Generator LKPD ke Gambar Visual Interaktif
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Ubah naskah LKPD mentah menjadi lembar kerja visual A4 bergambar interaktif modern, clean, dan ramah Gen Z.
              <strong className="text-teal-300"> 100% isi teks, soal, dan redaksi dipertahankan utuh tanpa perubahan</strong>, siap diunduh dalam format <strong>Gambar HD (.PNG)</strong>, Word (.doc), maupun Cetak A4.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto shrink-0">
            <button
              onClick={handleExportAllImages}
              disabled={isExporting}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/25 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Merender Gambar...' : 'Download Gambar HD (.PNG)'}</span>
            </button>
            <DocumentExportToolbar
              filename={`LKPD_Visual_${(lkpdData.identitas.judulLkpd || 'LKPD_Visual').replace(/\s+/g, '_')}`}
              title={lkpdData.identitas.judulLkpd || 'LKPD Visual Interaktif'}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Input Source on Left/Top, Visual Canvas on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Naskah & Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-4 no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-400" />
                <h2 className="font-bold text-sm text-white">Naskah Asli LKPD</h2>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                100% Verbatim Preserved
              </span>
            </div>

            {/* Quick Sample Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Muat Contoh Cepat:</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setRawInput(SAMPLE_LKPD_PJOK)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-colors font-medium cursor-pointer"
                >
                  ⚽ PJOK Bola Besar
                </button>
                <button
                  onClick={() => setRawInput(SAMPLE_LKPD_KEBUGARAN)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors font-medium cursor-pointer"
                >
                  🏃 Kebugaran (TKJI)
                </button>
                <button
                  onClick={() => setRawInput(SAMPLE_LKPD_IPAS)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors font-medium cursor-pointer"
                >
                  🌿 IPAS Rantai Makanan
                </button>
              </div>
            </div>

            {/* Textarea for Raw Text */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">
                Tempel teks naskah LKPD yang ingin dibuat bergambar:
              </label>
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                rows={13}
                placeholder="Tempel naskah LKPD lengkap di sini..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed focus:border-teal-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Action Button: Transform with Gemini */}
            <button
              onClick={handleTransform}
              disabled={isLoading || !rawInput.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyusun Tata Letak Visual Interaktif...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Transformasi ke LKPD Visual Bergambar</span>
                </>
              )}
            </button>
          </div>

          {/* Student Identitas Prefill Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white border-b border-slate-800 pb-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Isian Identitas Siswa di Lembar (Opsional)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Nama Peserta Didik</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Kosongkan jika tulis tangan"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Kelas / Fase</label>
                <input
                  type="text"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  placeholder="Kelas V / Fase C"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Nomor Absen</label>
                <input
                  type="text"
                  value={studentAbsen}
                  onChange={(e) => setStudentAbsen(e.target.value)}
                  placeholder="Contoh: 14"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Hari & Tanggal</label>
                <input
                  type="text"
                  value={studentDate}
                  onChange={(e) => setStudentDate(e.target.value)}
                  placeholder="13 Juli 2026"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              *Jika dikosongkan, lembar LKPD akan menyajikan garis isian titik-titik rapi siap diisi pensil/pulpen siswa saat dicetak.
            </p>
          </div>
        </div>

        {/* Right Column: Visual Canvas & Interactive Controls (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar: Theme, Zoom, Sheet Page Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 no-print">
            {/* Sheet Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveSheet('sheet1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSheet === 'sheet1'
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Halaman 1
              </button>
              <button
                onClick={() => setActiveSheet('sheet2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSheet === 'sheet2'
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Halaman 2
              </button>
              <button
                onClick={() => setActiveSheet('both')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSheet === 'both'
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua Halaman
              </button>
            </div>

            {/* Theme Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
              <Palette className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">Tema:</span>
              <button
                onClick={() => setTheme('pastel')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  theme === 'pastel' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pastel Ceria
              </button>
              <button
                onClick={() => setTheme('sporty')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  theme === 'sporty' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sporty Neon
              </button>
              <button
                onClick={() => setTheme('clean')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  theme === 'clean' ? 'bg-slate-700 text-slate-100 border border-slate-600' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Clean Edu
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs text-slate-300">
              <button
                onClick={() => setZoomScale(Math.max(0.5, zoomScale - 0.1))}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                title="Perkecil Tampilan"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-10 text-center font-bold text-teal-400">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale(Math.min(1.25, zoomScale + 0.1))}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                title="Perbesar Tampilan"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Download Button for Active Sheet */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (activeSheet === 'sheet2') {
                    handleExportSingleImage(page2Ref, `LKPD_Visual_Halaman2_${Date.now()}`);
                  } else {
                    handleExportSingleImage(page1Ref, `LKPD_Visual_Halaman1_${Date.now()}`);
                  }
                }}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm shadow-teal-600/30"
              >
                <FileImage className="w-3.5 h-3.5" />
                <span>Unduh Halaman Ini (.PNG)</span>
              </button>
            </div>
          </div>

          {/* Canvas Wrapper with Zoom Scaling */}
          <div className="overflow-x-auto p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col items-center justify-start min-h-[800px]">
            <div 
              style={{ 
                transform: `scale(${zoomScale})`, 
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out'
              }}
              className="flex flex-col items-center space-y-8"
            >
              {/* ======================================================== */}
              {/* PAGE 1: A4 PORTRAIT CANVAS (210mm x 297mm) */}
              {/* ======================================================== */}
              {(activeSheet === 'sheet1' || activeSheet === 'both') && (
                <div 
                  ref={page1Ref}
                  className="w-[210mm] min-h-[297mm] bg-white text-slate-800 p-[12mm] shadow-2xl rounded-sm box-border relative flex flex-col justify-between"
                  style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
                >
                  {/* Decorative background watermarks / gradient borders */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-cyan-400 to-indigo-500"></div>

                  <div>
                    {/* Header LKPD */}
                    <div className="border-b-2 border-slate-200 pb-3 mb-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-600 via-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-md font-black text-2xl">
                            <Dumbbell className="w-7 h-7" />
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                              Kurikulum Merdeka &bull; Pembelajaran Mendalam
                            </span>
                            <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase mt-0.5">
                              {lkpdData.identitas.judulLkpd || 'LEMBAR KERJA PESERTA DIDIK (LKPD)'}
                            </h1>
                            <p className="text-xs font-semibold text-slate-600">
                              {lkpdData.identitas.sekolah || 'SD Negeri Kalimantong'} &bull; Tahun Ajaran 2026/2027
                            </p>
                          </div>
                        </div>

                        {/* QR Code / Badge Icon */}
                        <div className="text-right flex flex-col items-end">
                          <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>A4 HD PORTRAIT</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-medium mt-1">Halaman 1 dari 2</span>
                        </div>
                      </div>

                      {/* Info Bar */}
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[9px] uppercase font-bold text-slate-500 block">Mata Pelajaran</span>
                          <span className="font-extrabold text-slate-800 truncate block">
                            {lkpdData.identitas.mataPelajaran}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[9px] uppercase font-bold text-slate-500 block">Topik / Materi</span>
                          <span className="font-extrabold text-teal-700 truncate block">
                            {lkpdData.identitas.topikMateri}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[9px] uppercase font-bold text-slate-500 block">Kelas & Waktu</span>
                          <span className="font-extrabold text-slate-800 truncate block">
                            {lkpdData.identitas.kelasFase} ({lkpdData.identitas.alokasiWaktu})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Identitas Peserta Didik Box (Clean & Interactive) */}
                    <div className="mb-4 bg-gradient-to-r from-sky-50/80 via-white to-teal-50/80 rounded-xl p-3 border-2 border-dashed border-sky-300 shadow-2xs">
                      <div className="grid grid-cols-12 gap-3 text-xs items-center">
                        <div className="col-span-5 flex items-center gap-2">
                          <span className="font-bold text-slate-700 shrink-0">👤 Nama Siswa:</span>
                          <span className="font-semibold text-slate-900 border-b border-slate-400 flex-1 pb-0.5 min-h-[20px]">
                            {studentName || '...................................................'}
                          </span>
                        </div>
                        <div className="col-span-3 flex items-center gap-2">
                          <span className="font-bold text-slate-700 shrink-0">🏫 Kelas:</span>
                          <span className="font-semibold text-slate-900 border-b border-slate-400 flex-1 pb-0.5 min-h-[20px]">
                            {studentClass || lkpdData.identitas.kelasFase}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5">
                          <span className="font-bold text-slate-700 shrink-0">🔢 Absen:</span>
                          <span className="font-semibold text-slate-900 border-b border-slate-400 flex-1 pb-0.5 text-center min-h-[20px]">
                            {studentAbsen || '....'}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5">
                          <span className="font-bold text-slate-700 shrink-0">📅 Tanggal:</span>
                          <span className="font-semibold text-slate-900 border-b border-slate-400 flex-1 pb-0.5 text-center min-h-[20px] text-[11px]">
                            {studentDate || '..../..../2026'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Petunjuk Penggunaan with Friendly Icons */}
                    {lkpdData.identitas.petunjukUmum && lkpdData.identitas.petunjukUmum.length > 0 && (
                      <div className="mb-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-slate-700">
                        <div className="flex items-center gap-2 font-bold text-amber-900 mb-1.5">
                          <HelpCircle className="w-4 h-4 text-amber-600" />
                          <span>Petunjuk Pengerjaan & Keselamatan Belajar:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {lkpdData.identitas.petunjukUmum.map((ptj, pIdx) => (
                            <div key={pIdx} className="flex items-start gap-1.5">
                              <span className="text-amber-600 font-bold shrink-0">✓</span>
                              <span className="text-[11px] leading-snug">{ptj}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sheet 1 Sections (Stimulus & Soal Pemahaman) */}
                    <div>
                      {sheet1Sections.map((sec, idx) => renderSectionCard(sec, idx))}
                    </div>
                  </div>

                  {/* Page 1 Footer */}
                  <div className="border-t border-slate-200 pt-2.5 mt-auto flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-semibold text-teal-700">
                      SADARPJOK &bull; Lembar Kerja Berbasis Visual Interaktif
                    </span>
                    <span>Bersambung ke Halaman 2 👉</span>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* PAGE 2: A4 PORTRAIT CANVAS (210mm x 297mm) */}
              {/* ======================================================== */}
              {(activeSheet === 'sheet2' || activeSheet === 'both') && (
                <div 
                  ref={page2Ref}
                  className="w-[210mm] min-h-[297mm] bg-white text-slate-800 p-[12mm] shadow-2xl rounded-sm box-border relative flex flex-col justify-between"
                  style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
                >
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"></div>

                  <div>
                    {/* Header Mini Page 2 */}
                    <div className="border-b border-slate-200 pb-2 mb-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal-700 uppercase tracking-tight">
                          {lkpdData.identitas.judulLkpd || 'LKPD INTERAKTIF'}
                        </span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-600 font-medium">Halaman Lanjutan (Aktivitas Lapangan & Refleksi)</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-500">
                        Nama: <strong className="text-slate-800">{studentName || '....................'}</strong> | Absen: <strong className="text-slate-800">{studentAbsen || '....'}</strong>
                      </div>
                    </div>

                    {/* Sheet 2 Sections (Mencocokkan, Kasus Lapangan, Refleksi, Checklist) */}
                    <div>
                      {sheet2Sections.map((sec, idx) => renderSectionCard(sec, idx + 2))}
                    </div>
                  </div>

                  {/* Page 2 Bottom: Penutup & Nilai / Paraf Guru */}
                  <div className="mt-auto pt-3 border-t-2 border-slate-200">
                    {/* Motivational Quote Banner */}
                    {lkpdData.penutup.pesanPenyemangat && (
                      <div className="p-2.5 rounded-xl bg-gradient-to-r from-teal-50 via-sky-50 to-indigo-50 border border-teal-200 text-center mb-3">
                        <p className="text-xs font-bold text-teal-900 italic">
                          {lkpdData.penutup.pesanPenyemangat}
                        </p>
                      </div>
                    )}

                    {/* Assessment & Signature Grid */}
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      {/* Teacher Note Box */}
                      <div className="col-span-2 bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          Catatan & Apresiasi Guru Pengampu:
                        </span>
                        <p className="text-xs text-slate-700 italic min-h-[36px]">
                          {lkpdData.penutup.catatanGuru || 'Peserta didik aktif berpartisipasi, sportif, dan menunjukkan pemahaman gerak yang sangat baik.'}
                        </p>
                      </div>

                      {/* Scoring & Stamp Box */}
                      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-center flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500 block">
                            Taraf Nilai / Skor
                          </span>
                          <div className="w-12 h-10 mx-auto my-1 rounded-lg border-2 border-dashed border-teal-400 flex items-center justify-center font-black text-teal-700 text-base">
                            A
                          </div>
                        </div>
                        <div className="text-[9px] text-slate-500">
                          {lkpdData.penutup.titimangsa || 'Kalimantong, 2026'}<br />
                          <strong className="text-slate-800">{lkpdData.penutup.namaGuru || 'Guru PJOK'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Bottom watermark */}
                    <div className="mt-2.5 text-center text-[9px] text-slate-400">
                      Dicetak otomatis via SADARPJOK &bull; Ukuran A4 Standar (21 cm × 29,7 cm) &bull; Format Siap Edar Siswa
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
