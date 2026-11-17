import { NextRequest, NextResponse } from 'next/server';
import { createGeminiClient, DEFAULT_GEMINI_MODEL, classifyGeminiError, logGeminiFallback } from '@/lib/gemini';

export interface RpmTpRequest {
  penyusun: string;
  sekolah: string;
  tahunAjaran: string;
  semester: string;
  mataPelajaran: string;
  kelasFase: string;
  topik: string;
  alokasiWaktu: string;
  capaianPembelajaran: string;
  tujuanPembelajaran: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  nipGuru: string;
  titimangsa: string;
}

const DEFAULT_RPM_TP_BODY: RpmTpRequest = {
  penyusun: 'Guru PJOK SD Negeri Kalimantong',
  sekolah: 'SD Negeri Kalimantong',
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  mataPelajaran: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
  kelasFase: 'Kelas V / Fase C',
  topik: 'Kombinasi Pola Gerak Dasar Menendang, Menghentikan, dan Menggiring Bola Sepak',
  alokasiWaktu: '6x40 Menit (3 Pertemuan)',
  capaianPembelajaran: 'Peserta didik dapat menunjukkan kemampuan dalam mempraktikkan modifikasi berbagai aktivitas pola gerak dasar dan keterampilan gerak, dilandasi dengan penerapan konsep dan prinsip gerak yang benar.',
  tujuanPembelajaran: 'Murid dapat mempraktikkan variasi dan kombinasi gerak dasar menendang, menghentikan, dan menggiring bola dengan kontrol akurat serta menerapkan kerja sama sportif dalam permainan sepak bola modifikasi.',
  kepalaSekolah: 'Nasrudin, S.Pd., M.Pd.',
  nipKepalaSekolah: '19720415 199803 1 004',
  nipGuru: '19880724 201503 1 003',
  titimangsa: 'Kalimantong, 13 Juli 2026',
};

export async function POST(req: NextRequest) {
  let reqBody: RpmTpRequest = DEFAULT_RPM_TP_BODY;
  try {
    const body: RpmTpRequest = await req.json();
    reqBody = { ...DEFAULT_RPM_TP_BODY, ...body };
    const {
      penyusun,
      sekolah,
      tahunAjaran,
      semester,
      mataPelajaran,
      kelasFase,
      topik,
      alokasiWaktu,
      capaianPembelajaran,
      tujuanPembelajaran,
      kepalaSekolah,
      nipKepalaSekolah,
      nipGuru,
      titimangsa,
    } = reqBody;

    const ai = createGeminiClient();
    if (!ai) {
      return NextResponse.json({
        result: generateFallbackRpmTp(reqBody),
        isFallback: true,
        warning: 'GEMINI_API_KEY belum diatur. Dokumen RPM disusun menggunakan Mode Template otomatis.',
      });
    }

    const systemInstruction = `Anda adalah Pakar Pengembang Kurikulum dan Perencanaan Pembelajaran Mendalam (Deep Learning) Kemendikbudristek.
Tugas Anda adalah menyusun dokumen Perencanaan Pembelajaran Mendalam (RPM) BERDASARKAN 1 TUJUAN PEMBELAJARAN (RPM 1 TP) dengan alokasi waktu ${alokasiWaktu} yang diuraikan secara runtut untuk Pertemuan 1, Pertemuan 2, dan Pertemuan 3.

KETENTUAN STRUKTUR DOKUMEN:
1. Tampilkan dalam bentuk TABEL DUA KOLOM mulai dari Bagian A (Identitas), Bagian B (Identifikasi), Bagian C (Desain Pembelajaran), Bagian D (Pengalaman Belajar), hingga Bagian E (Asesmen Pembelajaran).
   - Kolom 1: Komponen & Sub-Komponen (Tuliskan Sub-komponen tepat di bawah Komponen utama).
   - Kolom 2: Isi Lengkap Dokumen Perencanaan.

2. Rincian Komponen:
   A. IDENTITAS:
      - Penyusun: ${penyusun}
      - Sekolah: ${sekolah}
      - Tahun Ajaran: ${tahunAjaran}
      - Semester: ${semester}
      - Mata Pelajaran: ${mataPelajaran}
      - Kelas/Fase Capaian: ${kelasFase}
      - Topik: ${topik}
      - Alokasi Waktu: ${alokasiWaktu}

   B. IDENTIFIKASI:
      - Identifikasi Murid: Uraikan Pengetahuan Awal, Minat Belajar, Kebutuhan Belajar.
      - Materi Pelajaran: Faktual, Konseptual, Prosedural, Metakognitif.
      - Dimensi Profil Lulusan (DPL): Pilih yang relevan (keimanan & ketakwaan, kewargaan, penalaran kritis, kreativitas, kolaborasi, kemandirian, kesehatan, komunikasi).

   C. DESAIN PEMBELAJARAN:
      - Capaian Pembelajaran: ${capaianPembelajaran}
      - Lintas Disiplin Ilmu: Hubungan dengan IPA, Matematika, Bahasa Indonesia.
      - Tujuan Pembelajaran: Tuliskan 1 Tujuan Pembelajaran terpadu yang dirancang untuk seluruh pertemuan ini (${alokasiWaktu}), diawali kata "Murid ...", mencakup level kognitif mengingat/memahami/menerapkan/menganalisis/merefleksi/mencipta.
      - Topik Pembelajaran: Uraikan sub-topik spesifik untuk setiap pertemuan (Pertemuan 1, Pertemuan 2, Pertemuan 3).
      - Praktik Pedagogis: Pendekatan Pembelajaran Mendalam (Deep Learning), Model (sintaks/langkah lengkap), dan Metode dirincikan untuk setiap pertemuan (Pertemuan 1, Pertemuan 2, Pertemuan 3).
      - Kemitraan Pembelajaran, Lingkungan Pembelajaran, dan Pemanfaatan Digital.

   D. PENGALAMAN BELAJAR (Rinci dan Lengkap):
      - Kegiatan Awal (15 Menit): Prinsip berkesadaran, bermakna, menggembirakan. Salam, doa bersama, cek kehadiran, apersepsi, motivasi, pemanasan berkesadaran.
      - Kegiatan Inti (60 Menit setiap pertemuan):
        Prinsip mindful, meaningful, joyful agar murid aktif menggali makna dari materi.
        Uraikan 3 tahap pembelajaran mendalam untuk SETIAP PERTEMUAN (Pertemuan 1, Pertemuan 2, Pertemuan 3):
        Format per tahap:
        [Nama Tahap Pembelajaran] (Sintaks Model) (Estimasi Waktu)
        - Memahami (Sintaks Model) (15 Menit)
        - Mengaplikasikan (Sintaks Model) (30 Menit)
        - Merefleksi (Sintaks Model) (15 Menit)
        Ketentuan tiap tahap: Minimal 4 poin bernomor, menjelaskan aktivitas konkret Guru dan Murid secara jelas, dan diakhiri dengan Dimensi Profil Lulusan dalam kurung, misal: (Kolaborasi, Penalaran Kritis).
      - Kegiatan Penutup (5 Menit): Menyimpulkan materi, umpan balik reflektif, tindak lanjut, doa bersama, salam penutup.

   E. ASESMEN PEMBELAJARAN:
      - Awal: Jenis, Bentuk, dan Teknik.
      - Proses: Jenis, Bentuk, dan Teknik.
      - Akhir: Jenis, Bentuk, dan Teknik.

3. TANDA TANGAN:
   - Mengetahui Kepala Sekolah bernama: ${kepalaSekolah} (NIP. ${nipKepalaSekolah})
   - Guru Mata Pelajaran: ${penyusun} (NIP. ${nipGuru})
   - Titimangsa: ${titimangsa}

4. LAMPIRAN LENGKAP (Terpisah di Bawah Tabel RPP):
   - Soal Asesmen Awal: 5 butir soal diagnostik (lisan/essay/uraian/pilihan ganda + jawaban lengkap).
   - Asesmen Proses Pembelajaran:
     - Rubrik Penilaian Sikap (4 Skala).
     - Rubrik Penilaian Pengetahuan (4 Skala).
     - Rubrik Penilaian Keterampilan (4 Skala).
     (Disajikan dalam bentuk tabel rapi).
   - Soal Asesmen Akhir: 5 butir soal sumatif + kunci jawaban / rubrik tugas unjuk kerja/proyek.
   - Ringkasan Materi Ajar: Faktual, Konseptual, Prosedural.
   - Lembar Kerja Peserta Didik (LKPD) Lengkap:
     Disajikan TIDAK dalam bentuk tabel.
     Memuat:
     1. Identitas diri di LKPD: nama peserta didik, mata pelajaran, no absen, kelas, tanggal.
     2. Petunjuk penggunaan LKPD.
     3. Sintaks Pembelajaran terintegrasi dengan Pengalaman Belajar Mendalam:
        - Memahami: sajikan materi/gambar ringkas + minimal 3 pertanyaan pemahaman.
        - Mengaplikasikan: tugas kasus nyata, instruksi kerja jelas, ruang jawaban siswa.
        - Merefleksikan: 2-3 pertanyaan refleksi proses belajar & kesulitan serta rencana tindak lanjut.
        - Bagian Penutup: ucapan penyemangat, catatan guru, kolom ceklis pemahaman diri siswa.

Bahasa formal, edukatif, berkesadaran, bermakna, menggembirakan, dan dokumen utuh siap pakai dalam file Word portrait.`;

    const userPrompt = `Susunlah dokumen Perencanaan Pembelajaran Mendalam (RPM) untuk 1 TUJUAN PEMBELAJARAN (RPM 1 TP) secara utuh dan lengkap:

Identitas:
- Penyusun: ${penyusun}
- Sekolah: ${sekolah}
- Tahun Ajaran: ${tahunAjaran}
- Semester: ${semester}
- Mata Pelajaran: ${mataPelajaran}
- Kelas/Fase: ${kelasFase}
- Topik: ${topik}
- Alokasi Waktu: ${alokasiWaktu}
- Capaian Pembelajaran: ${capaianPembelajaran}
- 1 Tujuan Pembelajaran: ${tujuanPembelajaran}
- Kepala Sekolah: ${kepalaSekolah}
- Titimangsa: ${titimangsa}

Tuliskan seluruh tabel dua kolom A sampai E (dengan rincian kegiatan inti per pertemuan: Pertemuan 1, Pertemuan 2, dan Pertemuan 3 memuat tahapan Memahami, Mengaplikasikan, Merefleksi + sintaks model + estimasi waktu + minimal 4 poin aktivitas + DPL di akhir kalimat), tanda tangan Kepala Sekolah bernama ${kepalaSekolah}, Lampiran Asesmen Awal (5 soal + kunci), Rubrik Sikap, Pengetahuan, Keterampilan (4 skala dalam tabel), Asesmen Akhir (5 soal + kunci), Materi Ajar, dan LKPD Lengkap non-tabel yang komunikatif dan operasional.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
      },
    });

    const outputText = response.text || '';

    return NextResponse.json({
      result: outputText,
      isFallback: false,
    });
  } catch (error: unknown) {
    const errInfo = classifyGeminiError(error);
    logGeminiFallback('RPM 1 TP', errInfo);
    return NextResponse.json(
      {
        result: generateFallbackRpmTp(reqBody),
        errorCode: errInfo.code,
        warning: errInfo.userMessage,
        isFallback: true,
      },
      { status: 200 }
    );
  }
}

function generateFallbackRpmTp(p: RpmTpRequest): string {
  return `# PERENCANAAN PEMBELAJARAN MENDALAM (RPM)
## KURIKULUM MERDEKA — 1 TUJUAN PEMBELAJARAN (${p.alokasiWaktu || '6x40 Menit / 3 Pertemuan'})

| KOMPONEN & SUB-KOMPONEN | ISI PERENCANAAN PEMBELAJARAN MENDALAM (RPM 1 TP) |
|---|---|
| **A. IDENTITAS**<br>• Penyusun<br>• Sekolah<br>• Tahun Ajaran<br>• Semester<br>• Mata Pelajaran<br>• Kelas / Fase<br>• Topik<br>• Alokasi Waktu | **Penyusun:** ${p.penyusun || 'Guru PJOK SD Negeri Kalimantong'}<br>**Sekolah:** ${p.sekolah || 'SD Negeri Kalimantong'}<br>**Tahun Ajaran:** ${p.tahunAjaran || '2026/2027'}<br>**Semester:** ${p.semester || 'Ganjil'}<br>**Mata Pelajaran:** ${p.mataPelajaran || 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)'}<br>**Kelas / Fase:** ${p.kelasFase || 'Kelas V / Fase C'}<br>**Topik:** ${p.topik || 'Kombinasi Pola Gerak Dasar Menendang, Menghentikan, dan Menggiring Bola Sepak'}<br>**Alokasi Waktu:** ${p.alokasiWaktu || '6x40 Menit (3 Pertemuan)'} |
| **B. IDENTIFIKASI**<br>• Identifikasi Murid<br>• Materi Pelajaran<br>• Dimensi Profil Lulusan | **1. Identifikasi Murid:**<br>- *Pengetahuan Awal:* Sebagian besar murid telah menguasai tendangan tunggal, namun koordinasi saat menyambung operan dengan gerak menggiring bola sambil berlari masih kaku.<br>- *Minat Belajar:* Murid memiliki minat bermain tinggi melalui mini-games beregu dan kompetisi tantangan operan berwaktu.<br>- *Kebutuhan Belajar:* Dibutuhkan visualisasi gerak lambat dan penataan ruang latihan bertahap (dari operan statis ke operan dinamis).<br><br>**2. Materi Pelajaran:**<br>- *Faktual:* Lapangan rumput, bola ukuran 4 empuk, rompi tim, corong rintangan.<br>- *Konseptual:* Titik tumpu kaki terhadap laju bola, momentum ayunan panggul, dan perpindahan ruang gerak tanpa bola.<br>- *Prosedural:* Rangkaian gerak: menghentikan bola menyusur tanah -> menggiring dengan sentuhan lembut -> menendang akurat ke rekan setim.<br>- *Metakognitif:* Menilai sendiri ketepatan keputusan kapan harus menggiring dan kapan harus mengoper bola ke teman.<br><br>**3. Dimensi Profil Lulusan (DPL):**<br>Kolaborasi, Penalaran Kritis, Kemandirian, Kesehatan, dan Kewargaan. |
| **C. DESAIN PEMBELAJARAN**<br>• Capaian Pembelajaran<br>• Lintas Disiplin Ilmu<br>• 1 Tujuan Pembelajaran<br>• Topik Pembelajaran<br>• Praktik Pedagogis<br>• Kemitraan Pembelajaran<br>• Lingkungan Belajar<br>• Pemanfaatan Digital | **1. Capaian Pembelajaran:**<br>Peserta didik dapat menunjukkan kemampuan dalam mempraktikkan modifikasi berbagai aktivitas pola gerak dasar dan keterampilan gerak, dilandasi dengan penerapan konsep dan prinsip gerak yang benar, serta menerapkan konsep aktivitas jasmani untuk kebugaran fisik dan perilaku hidup sehat.<br><br>**2. Lintas Disiplin Ilmu:**<br>- *IPA:* Analisis sudut gaya dorong kaki, laju gesekan bola di rumput, dan kesiapan denyut jantung saat transisi lari.<br>- *Matematika:* Mengkalkulasi jarak operan (4-8 meter), sudut passing diagonal, dan rasio keberhasilan operan.<br>- *Bahasa Indonesia:* Berkomunikasi verbal secara efektif, santun, dan kompak memberi instruksi posisi.<br><br>**3. Tujuan Pembelajaran (1 TP untuk 3 Pertemuan):**<br>*"Murid dapat mempraktikkan variasi dan kombinasi gerak dasar menendang, menghentikan, dan menggiring bola dengan kontrol akurat serta menerapkan kerja sama sportif dalam permainan sepak bola modifikasi."*<br><br>**4. Topik Pembelajaran Per Pertemuan:**<br>- *Pertemuan 1:* Penguasaan dasar operan dan kontrol bola (Menendang & Menghentikan bola kaki bagian dalam).<br>- *Pertemuan 2:* Kombinasi menggiring bola (dribbling) melewati rintangan corong dan melakukan operan terarah.<br>- *Pertemuan 3:* Penerapan kombinasi gerak dalam simulasi permainan 4 vs 4 (taktik operan segitiga & sportivitas).<br><br>**5. Praktik Pedagogis:**<br>- *Pendekatan:* Pembelajaran Mendalam (Deep Learning - Mindful, Meaningful, Joyful).<br>- *Model:* Teaching Games for Understanding (TGfU) & Problem Based Learning (PBL).<br>- *Metode Per Pertemuan:*<br>  - *Pertemuan 1:* Demonstrasi, drill berpasangan, tantangan gawang corong.<br>  - *Pertemuan 2:* Sirkuit rintangan zig-zag, umpan silang berpasangan.<br>  - *Pertemuan 3:* Mini soccer modifikasi, coaching clinic antar-teman, refleksi melingkar.<br><br>**6. Kemitraan, Lingkungan & Digital:**<br>- *Kemitraan:* Tutor sebaya dan pemantauan kebugaran harian bersama orang tua.<br>- *Lingkungan:* Lapangan terbuka teduh dengan pembagian zona latihan berwarna.<br>- *Digital:* Video rekaman gerak lambat dan lembar asesmen digital. |
| **D. PENGALAMAN BELAJAR**<br>• Kegiatan Awal (15 Menit)<br>• Kegiatan Inti (60 Menit)<br>• Kegiatan Penutup (5 Menit) | **1. Kegiatan Awal (15 Menit) — Berkesadaran, Bermakna, Menggembirakan:**<br>1. Guru mengucapkan salam dan memimpin doa bersama dengan sikap khidmat (Berkesadaran).<br>2. Guru memeriksa kehadiran murid serta menyapa kondisi kesiapan fisik dan emosional murid (Menggembirakan).<br>3. Guru melakukan apersepsi kontekstual: mengaitkan kerja sama timnas sepak bola dengan pentingnya kombinasi operan dan dribbling (Bermakna).<br>4. Murid melakukan pemanasan terpadu lewat permainan "Rebut Bola Berantai" untuk membakar semangat dan fokus gerak (Joyful).<br><br>**2. Kegiatan Inti (60 Menit) — Pembelajaran Mendalam Per Pertemuan:**<br><br>### PERTEMUAN 1: FONDASI OPERAN & KONTROL BOLA<br>**Tahap 1: Memahami (Orientasi Masalah) (15 Menit)**<br>1. Guru mendemonstrasikan perbedaan tendangan yang tepat di titik tengah bola vs tendangan di bawah bola (Bermakna).<br>2. Murid mengamati arah laju bola saat kaki tumpu diletakkan terlalu jauh vs tepat di samping bola (Penalaran Kritis).<br>3. Murid secara berpasangan merumuskan 3 syarat tendangan akurat: kaki tumpu sejajar, pergelangan dikunci, perkenaan kaki dalam (Komunikasi).<br>4. Murid mempraktikkan gerakan bayangan (shadow movement) tanpa bola untuk memantapkan memori otot tungkai (Kemandirian).<br><br>**Tahap 2: Mengaplikasikan (Praktik Terbimbing) (30 Menit)**<br>1. Murid berpasangan pada jarak 4 meter melakukan latihan operan mendatar dan menghentikan bola secara bergantian 15 kali (Kolaborasi).<br>2. Murid mempraktikkan kontrol bola langsung (one-touch trap) agar bola tidak memantul liar (Kesehatan).<br>3. Guru memberikan variasi jarak bagi murid yang siap (jarak 6 meter) dan bimbingan khusus bagi yang membutuhkan (Kemandirian).<br>4. Murid mengikuti tantangan "Operan Gerbang Mini": mengoper bola melewati celah dua corong selebar 50 cm (Kreativitas).<br><br>**Tahap 3: Merefleksi (Refleksi Kinerja) (15 Menit)**<br>1. Murid duduk melingkar, mengatur ritme napas dan meraba denyut nadi (Berkesadaran).<br>2. Pasangan murid saling bertukar umpan balik mengenai akurasi operan teman (Kolaborasi).<br>3. Murid menganalisis mengapa operan tadi sempat melenceng dan mencatat solusinya (Penalaran Kritis).<br>4. Guru memberikan apresiasi atas sportivitas dan usaha gigih seluruh murid (Menggembirakan).<br><br>### PERTEMUAN 2: KOMBINASI MENGGIRING & MENGOPER BOLA<br>**Tahap 1: Memahami (Eksplorasi Pola Rintangan) (15 Menit)**<br>1. Guru memperagakan kombinasi menggiring bola zig-zag melewati corong lalu melepas operan ke rekan (Bermakna).<br>2. Murid menganalisis sentuhan bola saat menggiring: sentuhan halus dekat kaki vs tendangan kencang yang mudah direbut (Penalaran Kritis).<br>3. Murid mendiskusikan pentingnya mengangkat kepala (head up) saat menggiring bola agar melihat posisi teman (Komunikasi).<br>4. Murid merancang lintasan dribbling yang paling efisien bersama kelompok kecil (Kreativitas).<br><br>**Tahap 2: Mengaplikasikan (Sirkuit Gerak Dinamis) (30 Menit)**<br>1. Murid melakukan sirkuit gerak: menggiring bola melewati 3 corong zig-zag sejauh 5 meter, lalu mengoper bola ke teman (Kemandirian).<br>2. Murid penerima mengontrol bola dengan tenang, memutar badan, dan menggiring bola kembali ke garis awal (Kesehatan & Kolaborasi).<br>3. Setiap regu saling mengamati dan mencatat waktu tempuh sirkuit dengan stopwatch secara bergantian (Penalaran Kritis).<br>4. Murid mempraktikkan teknik perlindungan bola (body shielding) saat teman pasangan mencoba memberi tekanan bayangan (Kewargaan).<br><br>**Tahap 3: Merefleksi (Evaluasi Kombinasi Gerak) (15 Menit)**<br>1. Murid duduk beristirahat dengan minum air putih tertib dan pendinginan napas (Berkesadaran).<br>2. Perwakilan murid berbagi pengalaman: kapan saat yang tepat melepaskan operan setelah menggiring bola (Penalaran Kritis).<br>3. Guru menegaskan pentingnya tidak egois membawa bola sendiri dan mengutamakan operan tim (Kewargaan).<br>4. Murid mengisi lembar pemantauan keterampilan kombinasi gerak (Kemandirian).<br><br>### PERTEMUAN 3: SIMULASI PERMAINAN 4 VS 4 & REKAPITULASI TP<br>**Tahap 1: Memahami (Taktik Operan Segitiga) (15 Menit)**<br>1. Guru bersama murid membedah formasi operan segitiga sederhana (tiki-taka) untuk membongkar pertahanan lawan (Penalaran Kritis).<br>2. Murid mengamati papan taktik mini dan menentukan ruang gerak tanpa bola (Komunikasi).<br>3. Murid menyepakati peraturan permainan mini: minimal 3 kali operan sebelum boleh mencetak gol ke gawang mini (Kewargaan).<br>4. Murid melakukan tos tim dan menyusun strategi bersama regunya secara demokratis (Kolaborasi).<br><br>**Tahap 2: Mengaplikasikan (Mini Soccer Modifikasi) (30 Menit)**<br>1. Murid memainkan pertandingan 4 vs 4 di lapangan berukuran 15x20 meter dengan gawang corong tanpa kiper (Kolaborasi).<br>2. Murid menerapkan kombinasi menendang, menghentikan, dan menggiring bola dalam situasi permainan dinamis (Kesehatan).<br>3. Murid yang sedang berada di bangku cadangan bertindak sebagai observer mencatat statistik operan sukses timnya (Penalaran Kritis).<br>4. Setiap pertandingan berlangsung 2x7 menit dengan rotasi peran yang adil bagi seluruh murid (Kewargaan).<br><br>**Tahap 3: Merefleksi (Refleksi Ketercapaian TP & Apresiasi) (15 Menit)**<br>1. Seluruh murid berkumpul melingkar dalam suasana riang dan bersalaman antar-regu (Menggembirakan).<br>2. Murid merefleksikan perubahan kemampuannya dari Pertemuan 1 hingga Pertemuan 3 (Penalaran Kritis).<br>3. Murid menyimpulkan bahwa penguasaan kombinasi gerak bola besar telah berhasil dicapai dengan kerja sama tim (Bermakna).<br>4. Guru memberikan penghargaan gelar "Regu Paling Sportif" dan "Pengumpan Terbaik" (Menggembirakan).<br><br>**3. Kegiatan Penutup (5 Menit):**<br>1. Murid melakukan peregangan statis relaksasi seluruh otot tungkai dan punggung (Kesehatan).<br>2. Guru menyampaikan kesimpulan umum ketercapaian 1 Tujuan Pembelajaran secara tuntas.<br>3. Murid merapikan seluruh bola dan corong bersama-sama secara bertanggung jawab (Kewargaan).<br>4. Doa syukur bersama dan salam penutup. |
| **E. ASESMEN PEMBELAJARAN**<br>• Asesmen Awal<br>• Asesmen Proses<br>• Asesmen Akhir | **1. Asesmen Awal (Diagnostik):**<br>- *Jenis:* Diagnostik Kognitif & Keterampilan Gerak Awal.<br>- *Bentuk:* Tes lisan 5 butir soal dan uji coba operan 3 kali.<br>- *Teknik:* Tanya jawab dan observasi awal.<br><br>**2. Asesmen Proses (Formatif):**<br>- *Jenis:* Formatif Kinerja & Sikap Dimensi Profil Lulusan.<br>- *Bentuk:* Lembar observasi antar-teman (peer-assessment) dan rubrik unjuk kerja 4 skala.<br>- *Teknik:* Pengamatan kinerja saat sirkuit dan mini game.<br><br>**3. Asesmen Akhir (Sumatif 1 TP):**<br>- *Jenis:* Sumatif Ketercapaian Tujuan Pembelajaran.<br>- *Bentuk:* Tes unjuk kerja keterampilan kombinasi gerak (dribbling + passing) & tes pemahaman konsep.<br>- *Teknik:* Performance test terstandar. |

---

### KOLOM PENGESAHAN DOKUMEN

Kalimantong, 13 Juli 2026

**Mengetahui,**  
**Kepala SD Negeri Kalimantong**  

*(Tanda Tangan & Stempel)*  

**<u>${p.kepalaSekolah || 'Nasrudin, S.Pd., M.Pd.'}</u>**  
NIP. ${p.nipKepalaSekolah || '19720415 199803 1 004'}  

<br>

**Guru Mata Pelajaran PJOK,**  

*(Tanda Tangan)*  

**<u>${p.penyusun || 'Guru PJOK SD Negeri Kalimantong'}</u>**  
NIP. ${p.nipGuru || '19880724 201503 1 003'}  

---

## LAMPIRAN 1: ASESMEN AWAL PEMBELAJARAN (DIAGNOSTIK)
### Butir Soal Diagnostik & Kunci Jawaban:
1. **Soal 1:** Apa perbedaan utama antara menendang bola untuk mengoper ke teman dan menendang bola untuk menembak ke gawang?  
   *Kunci Jawaban:* Menendang untuk mengoper mengutamakan akurasi dan laju mendatar (menggunakan kaki bagian dalam), sedangkan menembak mengutamakan kecepatan dan kekuatan (sering menggunakan punggung kaki).
2. **Soal 2:** Mengapa saat menggiring bola, jarak bola tidak boleh terlempar terlalu jauh dari jangkauan kaki?  
   *Kunci Jawaban:* Agar bola mudah dikontrol, mudah diubah arahnya, dan tidak mudah direbut oleh pemain lawan.
3. **Soal 3:** Di manakah posisi kedua lengan kita saat sedang melakukan gerakan menggiring bola sambil berlari?  
   *Kunci Jawaban:* Terbuka wajar di samping tubuh untuk menjaga keseimbangan dinamis saat berlari.
4. **Soal 4:** Bagaimana cara menghentikan bola yang datang menyusur tanah agar bola langsung berhenti tepat di depan badan?  
   *Kunci Jawaban:* Menyambut bola dengan telapak kaki sedikit diinjakkan perlahan di atas bola atau diredam menggunakan kaki bagian dalam dengan sedikit ditarik ke belakang.
5. **Soal 5:** Mengapa kita harus saling percaya dan mau membagi bola kepada teman yang berada di posisi bebas?  
   *Kunci Jawaban:* Karena sepak bola adalah permainan beregu, dan operan ke teman yang bebas memperbesar peluang mencetak gol serta mempererat kekompakan tim.

---

## LAMPIRAN 2: ASESMEN PROSES PEMBELAJARAN (RUBRIK PENILAIAN 4 SKALA)

### 1. Rubrik Penilaian Sikap (Dimensi Profil Lulusan):
| Aspek Sikap (DPL) | Perlu Bimbingan (1) | Cukup (2) | Baik (3) | Sangat Baik (4) |
|---|---|---|---|---|
| **Kolaborasi** | Individualis, enggan mengoper bola kepada rekan setim. | Mau mengoper bola namun hanya kepada teman akrab saja. | Aktif bekerja sama dan membagi bola secara adil kepada seluruh teman regu. | Menjadi penggerak kekompakan tim, selalu merangkul dan menyemangati semua anggota regu. |
| **Penalaran Kritis** | Tidak menyadari kesalahan arah operan atau kehilangan bola. | Menyadari kehilangan bola namun tidak tahu penyebab keterlambatan operan. | Mampu menganalisis waktu yang tepat antara mendribble dan melepas operan. | Cerdas membaca celah ruang kosong dan menganalisis pergerakan teman secara taktis. |
| **Kemandirian** | Bermain pasif dan menunggu selalu diarahkan guru. | Menjalankan latihan kombinasi gerak setelah diingatkan berkali-kali. | Disiplin dan tertib mengulang latihan sirkuit secara mandiri bersama pasangan. | Proaktif, gigih mencoba memperbaiki kesalahan gerak sendiri dengan konsentrasi penuh. |
| **Kewargaan (Sportivitas)** | Marah saat timnya kebobolan atau menyalahkan rekan setim. | Menerima hasil pertandingan namun enggan bersalaman dengan lawan. | Sportif, menyalami lawan dan menerima kekalahan maupun kemenangan dengan lapang dada. | Menjunjung tinggi fair play, menghargai wasit, dan menjadi teladan sportivitas bagi kelas. |

### 2. Rubrik Penilaian Pengetahuan:
| Kriteria Pengetahuan | Perlu Bimbingan (1) | Cukup (2) | Baik (3) | Sangat Baik (4) |
|---|---|---|---|---|
| **Pemahaman Kombinasi Gerak** | Skor < 68. Belum mampu menjelaskan urutan menghentikan, menggiring, dan menendang. | Skor 68–78. Mampu menjelaskan urutan gerakan namun penjelasannya belum lengkap. | Skor 79–89. Mampu menjelaskan konsep dan prosedur kombinasi gerak secara tepat. | Skor 90–100. Mampu menguraikan korelasi konsep biomekanika sudut bola, timing gerak, dan strategi tim secara mendalam. |

### 3. Rubrik Penilaian Keterampilan Gerak:
| Keterampilan Gerak | Perlu Bimbingan (1) | Cukup (2) | Baik (3) | Sangat Baik (4) |
|---|---|---|---|---|
| **Menggiring Bola (Dribbling)** | Bola sering lepas kendali (> 2 meter) dan sering menabrak corong rintangan. | Mampu menggiring melewati corong namun bola masih sering terlepas kontrol. | Menggiring bola dengan sentuhan lembut, bola terkontrol stabil melewati seluruh corong. | Dribbling sangat lincah, badan lentur, pandangan kepala terangkat, bola selalu dekat kaki. |
| **Operan Akurat (Passing)** | Operan tidak sampai ke sasaran atau melambung liar tak tentu arah. | Operan sampai ke sasaran namun kecepatan bola terlalu lemah atau terlalu keras. | Operan mendatar lurus tepat sasaran ke arah teman 4 dari 5 kali percobaan. | Operan sangat presisi, kecepatan bola pas, mudah dikontrol oleh teman 5 dari 5 kali percobaan. |

---

## LAMPIRAN 3: ASESMEN AKHIR PEMBELAJARAN (SUMATIF 1 TP)
### Soal Sumatif / Tugas Unjuk Kerja Praktik:
1. **Soal Praktik 1:** Lakukan kombinasi menggiring bola melewati 3 corong rintangan sejauh 6 meter, lalu lepaskan operan mendatar ke sasaran gawang mini berjarak 5 meter! (Dinilai: kelincahan dribble & akurasi passing).
2. **Soal Uraian 2:** Jelaskan bagaimana cara mengatur kekuatan ayunan kaki saat mengoper bola ke teman yang berjarak dekat (3 meter) vs teman yang berjarak jauh (8 meter)!  
   *Jawaban:* Untuk jarak dekat, ayunan kaki pendek dari lutut dengan dorongan lembut. Untuk jarak jauh, ayunan kaki lebih panjang bertumpu pada sendi panggul dengan dorongan lebih bertenaga.
3. **Soal Uraian 3:** Mengapa dalam permainan sepak bola modern, kemampuan menghentikan bola (first touch) sangat menentukan keberhasilan serangan tim?  
   *Jawaban:* Sentuhan pertama yang sempurna membuat bola langsung berada di posisi siap tembak atau siap oper tanpa memberi kesempatan lawan untuk merebut bola.
4. **Soal Uraian 4:** Analisislah apa yang akan terjadi jika seorang pemain terus menggiring bola tanpa mau mengoper kepada temannya yang berada di posisi kosong!  
   *Jawaban:* Ruang gerak pemain tersebut akan mudah dikepung lawan, tempo serangan melambat, dan peluang mencetak gol menjadi hilang.
5. **Soal Uraian 5:** Tuliskan 3 bentuk tindakan nyata di lapangan yang mencerminkan sikap sportivitas dan kerja sama!  
   *Jawaban:* Membantu teman yang terjatuh, menyemangati teman yang gagal mengoper, dan mematuhi keputusan wasit tanpa protes berlebihan.

---

## LAMPIRAN 4: RINGKASAN MATERI AJAR
1. **Materi Faktual:** Ukuran lapangan modifikasi 15x20 meter, bola sepak nomor 4 berbobot 350-390 gram, 10 buah corong penanda, rompi warna-warni dua kubu.
2. **Materi Konseptual:**
   - Kombinasi gerak adalah perpaduan dua pola gerak dasar atau lebih yang dilakukan secara berurutan dan berkesinambungan.
   - Prinsip ruang gerak: Pemain tanpa bola harus aktif bergerak mencari ruang terbuka agar dapat menerima operan dengan leluasa.
3. **Materi Prosedural:**
   - Dribble: Dorong bola perlahan ke depan menggunakan kaki bagian luar atau punggung kaki secara berirama mengikuti langkah lari.
   - Trap: Sambut bola yang datang dengan merelaksasikan kaki bagian dalam untuk meredam kecepatan bola.
   - Pass: Arahkan kaki tumpu ke sasaran, ayunkan kaki bagian dalam tepat di tengah bola.

---

## LAMPIRAN 5: LEMBAR KERJA PESERTA DIDIK (LKPD) LENGKAP
### LKPD PEMBELAJARAN MENDALAM: KOMBINASI GERAK SEPAK BOLA MODIFIKASI

**A. IDENTITAS DIRI PESERTA DIDIK**
- Nama Peserta Didik : ............................................................
- Nomor Absen        : ............................................................
- Kelas / Fase       : Kelas V / Fase C
- Mata Pelajaran     : Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)
- Tanggal            : ............................................................

**B. PETUNJUK PENGGUNAAN LKPD**
1. Awali kegiatan dengan berdoa bersama memohon keselamatan dan kelancaran belajar.
2. Kenakan seragam dan sepatu olahraga yang aman.
3. Lakukan setiap tahapan bersama rekan satu kelompokmu dengan semangat kolaboratif, jujur, dan riang gembira!
4. Isilah lembar pengamatan dan refleksi ini dengan teliti.

**C. SINTAKS & PENGALAMAN BELAJAR MENDALAM**

#### 1. MEMAHAMI (Ayo Amati & Temukan Solusinya!)
Perhatikan peragaan kombinasi gerak dribbling dan passing yang dilakukan di depan kelas:
> *"Pemain yang hebat bukan hanya lincah menggocek bola, tetapi memiliki pandangan luas untuk melihat posisi temannya dan melepaskan operan tepat pada waktunya."*

**Pertanyaan Pemahaman:**
1. Mengapa kita tidak boleh menundukkan kepala terus-menerus saat sedang menggiring bola?  
   *Jawaban Saya:* ............................................................................................................................
2. Apa akibatnya jika kamu mengoper bola terlalu kencang kepada teman yang berdiri sangat dekat?  
   *Jawaban Saya:* ............................................................................................................................
3. Bagaimana cara tubuhmu menjaga keseimbangan saat berganti arah dari menggiring bola ke menendang bola?  
   *Jawaban Saya:* ............................................................................................................................

#### 2. MENGAPLIKASIKAN (Ayo Berlatih Nyata & Taklukkan Tantangan!)
**Tugas Praktik Berpasangan: "Tantangan Dribble & Pass Presisi"**
- Atur 3 corong zig-zag dengan jarak masing-masing 1,5 meter.
- Giring bola melewati ketiga corong tersebut, lalu dari garis batas lepaskan operan mendatar ke temanmu yang berada di seberang.
- Temanmu mengontrol bola dan melakukan hal yang sama bergantian sebanyak 5 putaran setiap anak!

**Catatan Hasil Praktik Kelompok:**
- Jumlah keberhasilan menggiring bola tanpa menyentuh corong: ....... dari 5 kali.
- Jumlah operan akhir yang tepat sampai di kaki teman: ....... dari 5 kali.
- Apa kesepakatan teknik yang kalian terapkan agar gerakan mengalir lancar?  
  *Catatan Regu:* ............................................................................................................................

#### 3. MEREFLEKSIKAN (Ayo Renungkan Makna Belajarmu!)
1. Bagaimana perasaanmu setelah berhasil menyelesaikan sirkuit kombinasi gerak bersama temanmu?  
   *Refleksiku:* ............................................................................................................................
2. Kesulitan apa yang paling kamu rasakan saat beralih dari berlari menggiring bola ke posisi menendang bola? Bagaimana usahamu memperbaikinya?  
   *Refleksiku:* ............................................................................................................................
3. Nilai kerja sama dan sportivitas apa yang paling berharga yang kamu pelajari dari permainan tim hari ini?  
   *Refleksiku:* ............................................................................................................................

#### D. BAGIAN PENUTUP & CEK PEMAHAMAN DIRI
⚽ **Pesan Motivasi:**  
*"Bakat memenangkan pertandingan, tetapi kerja sama tim dan kecerdasan bermain memenangkan kejuaraan sejati!"*

**Tabel Ceklis Pemahaman Diri (Beri tanda centang ✓):**
- [ ] Saya mampu menggiring bola dengan kontrol yang tenang dan dekat kaki.
- [ ] Saya dapat mengoper bola secara akurat setelah menggiring bola.
- [ ] Saya selalu berkomunikasi dan menyemangati rekan satu tim saya.
- [ ] Saya menghormati lawan bermain dan bermain dengan jujur dan sportif.
- [ ] Saya merasa bugar, senang, dan bersemangat untuk berolahraga kembali.

**Tanda Tangan Murid:** ............................ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Catatan &amp; Paraf Guru:** ............................`;
}
