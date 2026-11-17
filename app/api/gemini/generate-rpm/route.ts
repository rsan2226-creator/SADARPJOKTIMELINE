import { NextRequest, NextResponse } from 'next/server';
import { createGeminiClient, DEFAULT_GEMINI_MODEL, classifyGeminiError, logGeminiFallback } from '@/lib/gemini';

export interface RpmRequest {
  penyusun: string;
  sekolah: string;
  tahunAjaran: string;
  semester: string;
  mataPelajaran: string;
  kelasFase: string;
  bab: string;
  topik: string;
  alokasiWaktu: string;
  capaianPembelajaran: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  nipGuru: string;
  titimangsa: string;
}

const DEFAULT_RPM_BODY: RpmRequest = {
  penyusun: 'Guru PJOK SD Negeri Kalimantong',
  sekolah: 'SD Negeri Kalimantong',
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  mataPelajaran: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
  kelasFase: 'Kelas V / Fase C',
  bab: 'Bab 1: Permainan Bola Besar (Sepak Bola & Bola Voli)',
  topik: 'Variasi dan Kombinasi Pola Gerak Dasar Menendang, Menghentikan, dan Passing',
  alokasiWaktu: '16x40 Menit (8 Pertemuan)',
  capaianPembelajaran: 'Peserta didik dapat menunjukkan kemampuan dalam mempraktikkan modifikasi berbagai aktivitas pola gerak dasar dan keterampilan gerak, dilandasi dengan penerapan konsep dan prinsip gerak yang benar, serta menerapkan konsep aktivitas jasmani untuk kebugaran.',
  kepalaSekolah: 'Nasrudin, S.Pd., M.Pd.',
  nipKepalaSekolah: '19720415 199803 1 004',
  nipGuru: '19880724 201503 1 003',
  titimangsa: 'Kalimantong, 13 Juli 2026',
};

export async function POST(req: NextRequest) {
  let reqBody: RpmRequest = DEFAULT_RPM_BODY;
  try {
    const body: RpmRequest = await req.json();
    reqBody = { ...DEFAULT_RPM_BODY, ...body };
    const {
      penyusun,
      sekolah,
      tahunAjaran,
      semester,
      mataPelajaran,
      kelasFase,
      bab,
      topik,
      alokasiWaktu,
      capaianPembelajaran,
      kepalaSekolah,
      nipKepalaSekolah,
      nipGuru,
      titimangsa,
    } = reqBody;

    const ai = createGeminiClient();
    if (!ai) {
      return NextResponse.json({
        result: generateFallbackRpm(reqBody),
        isFallback: true,
        warning: 'GEMINI_API_KEY belum diatur. Dokumen RPM disusun menggunakan Mode Template otomatis.',
      });
    }

    const systemInstruction = `Anda adalah Pakar Pengembang Kurikulum dan Perencanaan Pembelajaran Mendalam (Deep Learning) Kemendikbudristek.
Tugas Anda adalah menyusun dokumen Perencanaan Pembelajaran Mendalam (RPM) 1 BAB LENGKAP dengan rincian 8 PERTEMUAN (16x40 Menit) yang sangat detail, sistematis, operasional, dan siap cetak.

STRUKTUR DOKUMEN YANG WAJIB DIIKUTI:
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
      - Bab: ${bab}
      - Topik: ${topik}
      - Alokasi Waktu: ${alokasiWaktu}

   B. IDENTIFIKASI:
      - Identifikasi Murid: Uraikan Pengetahuan Awal, Minat Belajar, dan Kebutuhan Belajar berdiferensiasi.
      - Materi Pelajaran: Uraikan Faktual, Konseptual, Prosedural, dan Metakognitif.
      - Dimensi Profil Lulusan (DPL): Pilih yang relevan (keimanan & ketakwaan, kewargaan, penalaran kritis, kreativitas, kolaborasi, kemandirian, kesehatan, komunikasi).

   C. DESAIN PEMBELAJARAN:
      - Capaian Pembelajaran: ${capaianPembelajaran}
      - Lintas Disiplin Ilmu: Kaitkan dengan IPA (sistem organ/otot), Matematika (sudut/waktu/skor), Bahasa (instruksi/komunikasi).
      - Tujuan Pembelajaran (8 Pertemuan): Awali dengan kata "Murid ...", terukur, mencakup level kognitif mengingat/memahami/menerapkan/menganalisis/merefleksi/mencipta, dirinci Pertemuan 1 s.d. Pertemuan 8.
      - Topik Pembelajaran: Sub topik per pertemuan (Pertemuan 1 s.d. 8).
      - Praktik Pedagogis: Pendekatan Pembelajaran Mendalam (Deep Learning), Model Pembelajaran (sintaks lengkap) dan Metode dirinci Pertemuan 1 s.d. 8.
      - Kemitraan Pembelajaran: Orang tua, teman sebaya, narasumber/komunitas olahraga.
      - Lingkungan Pembelajaran: Lapangan olahraga, ruang kelas, lingkungan terbuka yang aman dan inklusif.
      - Pemanfaatan Digital: Video pembelajaran gerak lambat (slow motion), lembar observasi digital, aplikasi stopwatch/timer.

   D. PENGALAMAN BELAJAR (Rinci dan Lengkap):
      - Kegiatan Awal (15 Menit): Berkesadaran, bermakna, menggembirakan (mindful, meaningful, joyful). Salam, doa, presensi, apersepsi keterhubungan pengalaman, motivasi, dinamisasi tubuh.
      - Kegiatan Inti (60 Menit) per pertemuan (Pertemuan 1 s.d. 8):
        Wajib memuat 3 tahap pembelajaran mendalam:
        1. Memahami (Sintaks Model) (15 Menit)
        2. Mengaplikasikan (Sintaks Model) (30 Menit)
        3. Merefleksi (Sintaks Model) (15 Menit)
        Ketentuan tiap tahap: Minimal 4 poin aktivitas bernomor, menjelaskan aktivitas konkret Guru dan Murid secara jelas, dan diakhiri dengan Dimensi Profil Lulusan dalam kurung, misal: (Kolaborasi, Penalaran Kritis).
      - Kegiatan Penutup (5 Menit): Menyimpulkan materi, umpan balik reflektif, tindak lanjut, doa bersama, salam penutup.

   E. ASESMEN PEMBELAJARAN:
      - Asesmen Awal: Jenis, bentuk, dan teknik.
      - Asesmen Proses: Jenis, bentuk, dan teknik.
      - Asesmen Akhir: Jenis, bentuk, dan teknik.

3. TANDA TANGAN:
   - Mengetahui Kepala Sekolah: ${kepalaSekolah} (NIP. ${nipKepalaSekolah})
   - Guru Mata Pelajaran: ${penyusun} (NIP. ${nipGuru})
   - Titimangsa: ${titimangsa}

4. LAMPIRAN LENGKAP (Terpisah di Bawah Tabel RPP):
   - Lampiran 1: Asesmen Awal Pembelajaran (5 butir soal diagnostik + kunci jawaban lengkap).
   - Lampiran 2: Asesmen Proses Pembelajaran (Rubrik Penilaian Sikap 4 skala, Rubrik Penilaian Pengetahuan 4 skala, Rubrik Penilaian Keterampilan gerak 4 skala).
   - Lampiran 3: Asesmen Akhir Pembelajaran (5 butir soal sumatif / tugas unjuk kerja produk + rubrik penilaian).
   - Lampiran 4: Ringkasan Materi Ajar (Faktual, Konseptual, Prosedural).
   - Lampiran 5: LEMBAR KERJA PESERTA DIDIK (LKPD) LENGKAP:
     LKPD disajikan TIDAK dalam bentuk tabel, memuat: Identitas diri, Petunjuk penggunaan, Sintaks Pembelajaran terintegrasi dengan Pengalaman Belajar Mendalam (Memahami dengan teks/gambar + minimal 3 pertanyaan pemahaman; Mengaplikasikan dengan tugas studi kasus/praktik kontekstual & ruang kerja siswa; Merefleksikan dengan 2-3 pertanyaan refleksi mendalam; Bagian Penutup dengan kata penyemangat dan checklist pemahaman diri).

Gunakan bahasa formal, rapi, bernas, dan lengkap tanpa ringkasan terpotong agar file Word yang dihasilkan langsung siap dipakai.`;

    const userPrompt = `Tuliskan Perencanaan Pembelajaran Mendalam (RPM) 1 BAB LENGKAP untuk 8 Pertemuan sesuai ketentuan instruksi sistem:

Identitas:
- Penyusun: ${penyusun}
- Sekolah: ${sekolah}
- Tahun Ajaran: ${tahunAjaran}
- Semester: ${semester}
- Mata Pelajaran: ${mataPelajaran}
- Kelas/Fase Capaian: ${kelasFase}
- Bab: ${bab}
- Topik: ${topik}
- Alokasi Waktu: ${alokasiWaktu}
- Kepala Sekolah: ${kepalaSekolah}
- Titimangsa: ${titimangsa}

Tuliskan seluruh tabel dua kolom A sampai E, tanda tangan Kepala Sekolah ${kepalaSekolah} dan Guru Mapel, dilanjutkan Lampiran Asesmen Awal (5 soal + kunci), Rubrik Proses 4 skala (Sikap, Pengetahuan, Keterampilan), Asesmen Akhir (5 soal + kunci), Ringkasan Materi Ajar, dan LKPD Lengkap berkesadaran, bermakna, dan menggembirakan.`;

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
    logGeminiFallback('RPM 1 Bab', errInfo);
    return NextResponse.json(
      {
        result: generateFallbackRpm(reqBody),
        errorCode: errInfo.code,
        warning: errInfo.userMessage,
        isFallback: true,
      },
      { status: 200 }
    );
  }
}

function generateFallbackRpm(p: RpmRequest): string {
  return `# PERENCANAAN PEMBELAJARAN MENDALAM (RPM)
## KURIKULUM MERDEKA — PEMBELAJARAN MENDALAM (DEEP LEARNING)

| KOMPONEN & SUB-KOMPONEN | ISI PERENCANAAN PEMBELAJARAN MENDALAM (RPM) |
|---|---|
| **A. IDENTITAS**<br>• Penyusun<br>• Sekolah<br>• Tahun Ajaran<br>• Semester<br>• Mata Pelajaran<br>• Kelas / Fase<br>• Bab<br>• Topik<br>• Alokasi Waktu | **Penyusun:** ${p.penyusun || 'Guru PJOK SD Negeri Kalimantong'}<br>**Sekolah:** ${p.sekolah || 'SD Negeri Kalimantong'}<br>**Tahun Ajaran:** ${p.tahunAjaran || '2026/2027'}<br>**Semester:** ${p.semester || 'Ganjil'}<br>**Mata Pelajaran:** ${p.mataPelajaran || 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)'}<br>**Kelas / Fase:** ${p.kelasFase || 'Kelas V / Fase C'}<br>**Bab:** ${p.bab || 'Bab 1: Variasi dan Kombinasi Gerak Dasar Permainan Bola Besar'}<br>**Topik:** ${p.topik || 'Menendang, Menghentikan, Menggiring Bola Sepak & Passing Bola Voli'}<br>**Alokasi Waktu:** ${p.alokasiWaktu || '16x40 Menit (8 Pertemuan)'} |
| **B. IDENTIFIKASI**<br>• Identifikasi Murid<br>• Materi Pelajaran<br>• Dimensi Profil Lulusan | **1. Identifikasi Murid:**<br>- *Pengetahuan Awal:* Murid umumnya telah mengenal permainan sepak bola dan voli di lingkungan rumah, namun teknik gerak dasar (posisi kaki tumpu, perkenaan bola, passing bawah) masih belum terstandar.<br>- *Minat Belajar:* Sebagian besar murid memiliki minat kinestetik tinggi dan menyukai aktivitas permainan beregu kompetitif yang menyenangkan.<br>- *Kebutuhan Belajar:* Murid membutuhkan diferensiasi konten berupa modifikasi ukuran bola dan jarak target, serta panduan visual lambat (slow motion).<br><br>**2. Materi Pelajaran:**<br>- *Faktual:* Bentuk lapangan, bola sepak, bola voli, gawang mini, dan net modifikasi.<br>- *Konseptual:* Konsep sudut pantul bola, titik tumpu gravitasi tubuh, dan timing ayunan lengan/kaki.<br>- *Prosedural:* Langkah-langkah menendang dengan kaki bagian dalam/luar/punggung kaki, menghentikan bola, passing bawah voli.<br>- *Metakognitif:* Menilai sendiri ketepatan sasaran tendangan dan mengevaluasi koordinasi gerak bersama pasangan latihan.<br><br>**3. Dimensi Profil Lulusan (DPL):**<br>Kolaborasi, Penalaran Kritis, Kemandirian, Kesehatan, dan Kewargaan (Sportivitas). |
| **C. DESAIN PEMBELAJARAN**<br>• Capaian Pembelajaran<br>• Lintas Disiplin Ilmu<br>• Tujuan Pembelajaran (8 Pertemuan)<br>• Topik Pembelajaran<br>• Praktik Pedagogis<br>• Kemitraan Pembelajaran<br>• Lingkungan Belajar<br>• Pemanfaatan Digital | **1. Capaian Pembelajaran:**<br>Peserta didik dapat menunjukkan kemampuan dalam mempraktikkan modifikasi berbagai aktivitas pola gerak dasar dan keterampilan gerak, dilandasi dengan penerapan konsep gerak yang benar, serta menerapkan konsep aktivitas jasmani untuk kebugaran fisik dan perilaku hidup sehat.<br><br>**2. Lintas Disiplin Ilmu:**<br>- *IPA (Fisika & Biologi):* Hukum aksi-reaksi pantulan bola, frekuensi denyut nadi, dan kinerja otot tungkai/lengan.<br>- *Matematika:* Mengukur jarak operan bola, menghitung sudut tendangan, dan statistik skor permainan.<br>- *Bahasa Indonesia:* Berkomunikasi verbal secara efektif dan santun saat memimpin instruksi operan regu.<br><br>**3. Tujuan Pembelajaran (Per Pertemuan):**<br>- *Pertemuan 1:* Murid dapat menjelaskan dan mempraktikkan variasi menendang bola dengan kaki bagian dalam secara akurat (Memahami & Menerapkan).<br>- *Pertemuan 2:* Murid dapat mempraktikkan variasi menendang dengan punggung kaki dan menghentikan bola menyusur tanah (Menerapkan).<br>- *Pertemuan 3:* Murid dapat mengombinasikan gerak menggiring dan menendang bola melewati rintangan corong secara lincah (Menganalisis & Menerapkan).<br>- *Pertemuan 4:* Murid dapat menganalisis dan merancang taktik operan segitiga sederhana dalam mini game sepak bola modifikasi (Menganalisis & Mencipta).<br>- *Pertemuan 5:* Murid dapat mempraktikkan posisi lutut menekuk dan passing bawah bola voli berpasangan dengan timing tepat (Menerapkan).<br>- *Pertemuan 6:* Murid dapat mempraktikkan variasi passing atas dan servis bawah bola voli modifikasi melewati net rendah (Menerapkan).<br>- *Pertemuan 7:* Murid dapat mengombinasikan gerak passing bawah dan passing atas dalam formasi lingkaran beregu (Menganalisis & Menerapkan).<br>- *Pertemuan 8:* Murid dapat merefleksikan nilai sportivitas, kolaborasi, dan memimpin simulasi pertandingan voli/sepak bola modifikasi (Merefleksi & Mencipta).<br><br>**4. Praktik Pedagogis:**<br>- *Pendekatan:* Pembelajaran Mendalam (Deep Learning - Mindful, Meaningful, Joyful).<br>- *Model:* Teaching Games for Understanding (TGfU) & Problem Based Learning (PBL).<br>- *Metode:* Demonstrasi gerak, drill sirkuit, permainan tantangan bertingkat (gamifikasi), dan refleksi dialogis.<br><br>**5. Kemitraan, Lingkungan & Digital:**<br>- *Kemitraan:* Orang tua (pemantauan aktivitas fisik harian), teman sebaya (tutor sebaya gerak).<br>- *Lingkungan:* Lapangan terbuka sekolah yang teduh dan teratur dengan batas corong warna-warni.<br>- *Digital:* Penayangan video slow-motion teknik tendangan dan pencatatan lembar observasi digital. |
| **D. PENGALAMAN BELAJAR**<br>• Kegiatan Awal (15 Menit)<br>• Kegiatan Inti (60 Menit)<br>• Kegiatan Penutup (5 Menit) | **1. Kegiatan Awal (15 Menit) — Berkesadaran, Bermakna & Menggembirakan:**<br>1. Guru mengucap salam hangat dan mengajak seorang murid memimpin doa bersama dengan khidmat (Berkesadaran).<br>2. Guru memeriksa kehadiran murid serta menyapa kondisi fisik/kebugaran murid dengan ceria (Menggembirakan).<br>3. Guru melakukan apersepsi dengan mengaitkan momen seru pertandingan sepak bola timnas dengan teknik tendangan akurat (Bermakna).<br>4. Murid melakukan pemanasan dinamis berpasangan berbentuk permainan "Kucing-Kucingan Bola" untuk memantik denyut nadi dan fokus (Joyful).<br><br>**2. Kegiatan Inti (60 Menit) — Tahapan Pembelajaran Mendalam:**<br><br>*(Contoh Pertemuan 1: Menendang & Menghentikan Bola)*<br>**Tahap 1: Memahami (Orientasi pada Masalah) (15 Menit):**<br>1. Guru mendemonstrasikan perbedaan tendangan yang melenceng dan tendangan akurat dengan posisi kaki tumpu yang benar.<br>2. Murid mengamati tayangan video gerak lambat perkenaan kaki bagian dalam pada dinding bola (Penalaran Kritis).<br>3. Murid secara berpasangan mendiskusikan mengapa bola bisa berputar melenceng jika kaki tumpu terlalu jauh dari bola (Komunikasi).<br>4. Murid merumuskan kriteria keberhasilan tendangan lurus: kaki tumpu di samping bola, perkenaan pas di tengah bola (Penalaran Kritis).<br><br>**Tahap 2: Mengaplikasikan (Penyelidikan & Praktik Terbimbing) (30 Menit):**<br>1. Murid berdiri berhadapan jarak 4 meter, melakukan latihan operan kaki bagian dalam secara berulang bergantian (Kemandirian).<br>2. Murid mempraktikkan teknik menghentikan bola menggunakan telapak dan kaki bagian dalam agar bola tidak memantul liar (Kesehatan & Keterampilan).<br>3. Pasangan murid saling memberikan koreksi teknik gerak (peer-coaching) dengan mengacu pada lembar observasi gerak (Kolaborasi).<br>4. Murid mengikuti tantangan "Operan Lolos Corong": mengoper bola melewati celah dua corong selebar 50 cm sebanyak 10 kali (Kreativitas & Tanggung Jawab).<br><br>**Tahap 3: Merefleksi (Refleksi Kinerja & Penguatan Makna) (15 Menit):**<br>1. Murid berkumpul melingkar dalam suasana rileks, meraba denyut nadi dan mengatur napas berkesadaran (Mindful).<br>2. Perwakilan murid menceritakan hambatan gerak yang dialami dan cara memperbaikinya bersama teman (Penalaran Kritis).<br>3. Guru memberikan apresiasi terhadap sportivitas dan usaha pantang menyerah yang ditunjukkan seluruh murid (Menggembirakan).<br>4. Murid mencatat skor keberhasilan operan dalam lembar refleksi pribadi masing-masing (Kemandirian).<br><br>*(Pertemuan 2 s.d. 8 dijabarkan secara terpadu mengikuti siklus Memahami, Mengaplikasikan, dan Merefleksi dengan model TGfU dan gamifikasi gerak berjenjang)*.<br><br>**3. Kegiatan Penutup (5 Menit):**<br>1. Murid melakukan gerakan pendinginan statis perlahan sambil melemaskan otot tungkai dan lengan (Kesehatan).<br>2. Guru bersama murid menyimpulkan inti pembelajaran gerak hari ini dan rencana materi pertemuan berikutnya.<br>3. Murid merapikan peralatan olahraga bersama-sama (Kolaborasi & Kewargaan).<br>4. Pembelajaran ditutup dengan doa syukur bersama dan salam penutup. |
| **E. ASESMEN PEMBELAJARAN**<br>• Asesmen Awal<br>• Asesmen Proses<br>• Asesmen Akhir | **1. Asesmen Awal (Diagnostik):**<br>- *Jenis:* Diagnostik Kognitif & Non-Kognitif.<br>- *Bentuk:* Tanya jawab lisan pengalaman bermain bola & uji coba mengoper bola 3 kali.<br>- *Teknik:* Observasi langsung dan ceklis kesiapan gerak.<br><br>**2. Asesmen Proses (Formatif):**<br>- *Jenis:* Formatif Kinerja & Sikap.<br>- *Bentuk:* Lembar observasi penilaian antar-teman (peer-assessment) dan rubrik unjuk kerja 4 skala.<br>- *Teknik:* Pengamatan kinerja saat latihan sirkuit dan mini game.<br><br>**3. Asesmen Akhir (Sumatif):**<br>- *Jenis:* Sumatif Lingkup Materi Bab 1.<br>- *Bentuk:* Tes unjuk kerja keterampilan variasi operan berpasangan & tes tertulis pemahaman konsep.<br>- *Teknik:* Tes kinerja gerak (performance test) dengan rubrik terstandar. |

---

### KOLOM PENGESAHAN DOKUMEN

Kalimantong, 13 Juli 2026

**Mengetahui,**  
**Kepala SD Negeri Kalimantong**  

*(Tanda Tangan & Stempel)*  

**<u>Nasrudin, S.Pd., M.Pd.</u>**  
NIP. ${p.nipKepalaSekolah || '19720415 199803 1 004'}  

<br>

**Guru Mata Pelajaran PJOK,**  

*(Tanda Tangan)*  

**<u>${p.penyusun || 'Guru PJOK SD Negeri Kalimantong'}</u>**  
NIP. ${p.nipGuru || '19880724 201503 1 003'}  

---

## LAMPIRAN 1: ASESMEN AWAL PEMBELAJARAN (DIAGNOSTIK)
### Butir Soal Diagnostik & Kunci Jawaban:
1. **Soal 1:** Bagian kaki manakah yang paling tepat digunakan untuk menghasilkan operan bola mendatar yang lurus dan akurat pada jarak dekat?  
   *Kunci Jawaban:* Kaki bagian dalam.
2. **Soal 2:** Di manakah posisi kaki tumpu yang benar saat kamu hendak menendang bola ke arah teman?  
   *Kunci Jawaban:* Di samping bola dengan jarak sekitar satu kepal tangan (10-15 cm) dan ujung kaki mengarah ke sasaran operan.
3. **Soal 3:** Mengapa lutut harus sedikit ditekuk saat kita bersiap menerima operan bola bawah pada permainan bola voli?  
   *Kunci Jawaban:* Untuk menjaga keseimbangan tubuh dan memberikan daya dorong pegas saat lengan memantulkan bola ke atas.
4. **Soal 4:** Apa yang harus dilakukan murid jika melihat teman satu regu melakukan kesalahan saat mengoper bola?  
   *Kunci Jawaban:* Memberikan semangat, tidak mencemooh, dan memberikan masukan yang baik secara sportif.
5. **Soal 5:** Sebutkan 2 manfaat pemanasan sebelum bermain sepak bola dan bola voli!  
   *Kunci Jawaban:* Mencegah terjadinya cedera otot/sendi dan meningkatkan suhu tubuh serta kesiapan fokus mental.

---

## LAMPIRAN 2: ASESMEN PROSES PEMBELAJARAN (RUBRIK PENILAIAN 4 SKALA)

### 1. Rubrik Penilaian Sikap (Dimensi Profil Lulusan):
| Aspek Sikap | Perlu Bimbingan (1) | Cukup (2) | Baik (3) | Sangat Baik (4) |
|---|---|---|---|---|
| **Kolaborasi** | Menolak bekerja sama dengan teman pasangan. | Mau bekerja sama namun masih pasif dan sering menyalahkan teman. | Aktif bekerja sama, berbagi bola, dan saling mendukung pasangan latihan. | Menginspirasi, memimpin kekompakan tim, dan sangat menghargai kemampuan teman. |
| **Kemandirian** | Memerlukan instruksi dan dorongan guru secara terus-menerus. | Memulai aktivitas setelah diingatkan berulang kali. | Menyiapkan peralatan dan melakukan latihan gerak secara mandiri dan tertib. | Proaktif, disiplin tinggi mengatur ritme latihan mandiri tanpa diawasi. |
| **Penalaran Kritis** | Belum mampu mengidentifikasi kesalahan arah bola. | Mengetahui arah bola melenceng namun tidak tahu penyebab teknisnya. | Mampu menganalisis kesalahan posisi kaki tumpu/lengan dan memperbaikinya. | Mampu menganalisis sudut tendangan dan memberikan masukan konstruktif ke teman. |

### 2. Rubrik Penilaian Pengetahuan:
| Kriteria | Perlu Bimbingan (1) | Cukup (2) | Baik (3) | Sangat Baik (4) |
|---|---|---|---|---|
| **Pemahaman Konsep Gerak** | Skor pemahaman < 68. Belum memahami konsep dasar titik perkenaan bola. | Skor 68–78. Mampu menjelaskan 1 konsep gerak dengan bantuan guru. | Skor 79–89. Mampu menjelaskan konsep kaki tumpu dan passing secara lengkap. | Skor 90–100. Mampu menguraikan korelasi hukum gaya, sudut pantul, dan strategi tim. |

### 3. Rubrik Penilaian Keterampilan Gerak:
| Keterampilan | Perlu Bimbingan (1) | Cukup (2) | Baik (3) | Sangat Baik (4) |
|---|---|---|---|---|
| **Menendang Bola** | Posisi kaki tumpu salah, bola melambung liar / tidak terarah. | Kaki tumpu benar, namun perkenaan bola belum pas di kaki bagian dalam. | Perkenaan bola tepat di kaki dalam, operan terarah dan stabil 3 dari 5 kali. | Gerakan luwes, presisi sangat tinggi mencapai sasaran 5 dari 5 kali percobaan. |
| **Passing Bawah Voli** | Siku menekuk dan ayunan lengan tidak seirama. | Siku lurus namun perkenaan bola tidak di kedua pergelangan tangan. | Kedua lengan rapat lurus, bola memantul ke atas dengan stabil dan terkontrol. | Kuda-kuda sempurna, pantulan bola melengkung ideal dan akurat ke arah sasaran. |

---

## LAMPIRAN 3: ASESMEN AKHIR PEMBELAJARAN (SUMATIF BAB 1)
### Soal Sumatif Akhir:
1. **Soal Uraian 1:** Jelaskan secara runtut prosedur melakukan tendangan menggunakan punggung kaki agar menghasilkan tembakan yang bertenaga dan mendatar!  
   *Jawaban:* Awalan lari beberapa langkah, kaki tumpu di samping bola, pergelangan kaki yang menendang ditekuk ke bawah dan dikunci kencang, perkenaan tepat pada punggung sepatu (tali sepatu), dan ayunan kaki diteruskan ke depan.
2. **Soal Uraian 2:** Analisislah mengapa saat melakukan passing bawah bola voli, lengan tidak boleh diayunkan melebihi tinggi dada!  
   *Jawaban:* Jika ayunan lengan melebihi tinggi dada, sudut pantul bola akan meluncur ke belakang kepala pemain dan tidak dapat dikontrol oleh teman pengumpan.
3. **Soal Uraian 3:** Dalam sebuah pertandingan, regumu tertinggal 1 poin. Taktik operan bola seperti apa yang sebaiknya regumu terapkan secara kolaboratif?  
   *Jawaban:* Menerapkan operan pendek cepat dari kaki ke kaki (tiki-taka/segitiga), membuka ruang kosong, dan berkomunikasi aktif tanpa tergesa-gesa.
4. **Soal Uraian 4:** Sebutkan 3 tanda tubuh bahwa latihan kebugaran jasmani yang kamu lakukan berada pada intensitas yang aman!  
   *Jawaban:* Napas berirama teratur, berkeringat sehat, tidak merasakan pusing atau nyeri dada mendadak, dan denyut nadi kembali normal setelah pendinginan.
5. **Soal Uraian 5:** Bagaimana caramu menunjukkan sikap sportivitas saat regumu mengalami kekalahan dalam mini soccer di kelas?  
   *Jawaban:* Mengakui keunggulan lawan, menyalami pemain lawan dan wasit dengan tulus, serta mengevaluasi kekurangan regu secara kekeluargaan.

---

## LAMPIRAN 4: RINGKASAN MATERI AJAR
1. **Materi Faktual:** Peralatan bola ukuran 4 untuk SD, bola voli busa/kulit sintetis lembut, cone penanda ruang, dan peluit wasit.
2. **Materi Konseptual:** Prinsip aerodinamika bola, pusat gravitasi tubuh (kuda-kuda rendah untuk stabilitas), dan prinsip gaya dorong pegas tungkai.
3. **Materi Prosedural:** Urutan gerak: Awalan (Approach) -> Sikap Saat Perkenaan (Impact) -> Gerak Lanjutan (Follow-through).

---

## LAMPIRAN 5: LEMBAR KERJA PESERTA DIDIK (LKPD) LENGKAP
### LKPD PEMBELAJARAN MENDALAM: VARIASI GERAK PERMAINAN BOLA BESAR

**A. IDENTITAS DIRI PESERTA DIDIK**
- Nama Lengkap : ............................................................
- Nomor Absen   : ............................................................
- Kelas / Fase  : Kelas V / Fase C
- Mata Pelajaran: Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)
- Tanggal       : ............................................................

**B. PETUNJUK PENGGUNAAN LKPD**
1. Berdoalah sebelum memulai kegiatan latihan dan pengisian LKPD ini.
2. Siapkan sepatu olahraga yang nyaman, pakaian olahraga rapi, dan alat tulis.
3. Ikuti setiap tahapan pengalaman belajar mendalam bersama teman pasanganmu dengan jujur, ceria, dan saling menyemangati!
4. Mintalah bimbingan Guru jika mengalami kesulitan gerak.

**C. SINTAKS & PENGALAMAN BELAJAR MENDALAM**

#### 1. MEMAHAMI (Ayo Amati & Temukan Makna!)
Perhatikan gambar teknik tendangan bola di papan peraga atau demonstrasi temanmu di depan lapangan:
> *"Ketika bola ditendang tepat pada titik tengah menggunakan kaki bagian dalam, bola akan menggelinding stabil di atas rumput tanpa melambung tinggi."*

**Pertanyaan Pemahaman:**
1. Mengapa posisi kaki tumpu sangat menentukan arah laju bola?  
   *Tulis jawabanmu:* ............................................................................................................................
2. Apa yang terjadi jika bola ditendang pada bagian paling bawah bola?  
   *Tulis jawabanmu:* ............................................................................................................................
3. Mengapa kita harus saling menatap mata teman sebelum melepaskan operan bola?  
   *Tulis jawabanmu:* ............................................................................................................................

#### 2. MENGAPLIKASIKAN (Ayo Berlatih Nyata & Pecahkan Tantangan!)
**Tugas Praktik Berpasangan: "Tantangan Gerbang Ajaib"**
- Buatlah sebuah gerbang kecil menggunakan 2 corong berjarak 60 cm.
- Berdirilah bersama teman pasanganmu pada jarak 5 meter saling berseberangan dari gerbang.
- Lakukan 10 kali operan mendatar bergantian yang wajib melewati celah gerbang tanpa menyentuh corong!

**Lembar Hasil Tantangan Gerak:**
- Jumlah operan yang berhasil mulus lolos gerbang: ....... dari 10 kali percobaan.
- Apa teknik terbaik yang kamu dan temanmu temukan agar operan selalu tepat sasaran?  
  *Jawaban Tim:* ............................................................................................................................

#### 3. MEREFLEKSIKAN (Ayo Refleksikan Pengalaman Belajarmu!)
1. Bagaimana perasaanmu selama melakukan latihan bersama teman hari ini? (Sangat Senang / Cukup / Perlu Semangat Lagi)  
   *Alasanku:* ............................................................................................................................
2. Kesulitan apa yang paling kamu rasakan saat mengontrol bola yang datang kencang? Bagaimana caramu memperbaikinya?  
   *Refleksiku:* ............................................................................................................................
3. Sikap sportivitas dan kerja sama apa yang sudah berhasil kamu tunjukkan hari ini kepada temanmu?  
   *Catatanku:* ............................................................................................................................

#### D. BAGIAN PENUTUP & CEK PEMAHAMAN DIRI
⭐ **Pesan Penyemangat:**  
*"Kebugaran bukan tentang siapa yang tercepat, melainkan tentang siapa yang tidak pernah berhenti berusaha dan selalu bermain dengan hati yang sportif!"*

**Tabel Ceklis Pemahaman Diri (Beri tanda centang ✓):**
- [ ] Saya sudah paham posisi kaki tumpu yang benar saat menendang.
- [ ] Saya bisa mengoper bola dengan kaki bagian dalam secara tepat sasaran.
- [ ] Saya bisa bekerja sama dan menyemangati teman pasangan tanpa mengeluh.
- [ ] Saya merasa bugar, gembira, dan bersyukur atas nikmat kesehatan hari ini.

**Paraf Guru PJOK:** ............................ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Paraf Orang Tua:** ............................`;
}
