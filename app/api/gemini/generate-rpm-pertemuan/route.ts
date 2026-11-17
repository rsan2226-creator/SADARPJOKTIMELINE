import { NextRequest, NextResponse } from 'next/server';
import { createGeminiClient, DEFAULT_GEMINI_MODEL, classifyGeminiError, logGeminiFallback } from '@/lib/gemini';

export interface RpmPertemuanRequest {
  penyusun: string;
  sekolah: string;
  tahunAjaran: string;
  semester: string;
  mataPelajaran: string;
  kelasFase: string;
  topik: string;
  alokasiWaktu: string;
  capaianPembelajaran: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  nipGuru: string;
  titimangsa: string;
}

const DEFAULT_RPM_PERTEMUAN_BODY: RpmPertemuanRequest = {
  penyusun: 'Guru PJOK SD Negeri Kalimantong',
  sekolah: 'SD Negeri Kalimantong',
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  mataPelajaran: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
  kelasFase: 'Kelas V / Fase C',
  topik: 'Variasi Pola Gerak Dasar Menendang dan Menghentikan Bola dengan Kaki Bagian Dalam',
  alokasiWaktu: '2x40 Menit (1 Pertemuan)',
  capaianPembelajaran: 'Peserta didik dapat menunjukkan kemampuan dalam mempraktikkan modifikasi berbagai aktivitas pola gerak dasar dan keterampilan gerak dilandasi dengan konsep dan prinsip gerak yang benar.',
  kepalaSekolah: 'Soleh, S.Pd., M.Pd.',
  nipKepalaSekolah: '19700318 199602 1 003',
  nipGuru: '19880724 201503 1 003',
  titimangsa: 'Kalimantong, 13 Juli 2026',
};

export async function POST(req: NextRequest) {
  let reqBody: RpmPertemuanRequest = DEFAULT_RPM_PERTEMUAN_BODY;
  try {
    const body: RpmPertemuanRequest = await req.json();
    reqBody = { ...DEFAULT_RPM_PERTEMUAN_BODY, ...body };
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
      kepalaSekolah,
      nipKepalaSekolah,
      nipGuru,
      titimangsa,
    } = reqBody;

    const ai = createGeminiClient();
    if (!ai) {
      return NextResponse.json({
        result: generateFallbackRpmPertemuan(reqBody),
        isFallback: true,
        warning: 'GEMINI_API_KEY belum diatur. Dokumen RPM disusun menggunakan Mode Template otomatis.',
      });
    }

    const systemInstruction = `Anda adalah Pakar Pengembang Kurikulum dan Perencanaan Pembelajaran Mendalam (Deep Learning) Kemendikbudristek.
Tugas Anda adalah menyusun dokumen Perencanaan Pembelajaran Mendalam (RPM) KHUSUS UNTUK 1 PERTEMUAN (2x40 Menit) yang sangat detail, sistematis, operasional, dan siap pakai.

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
      - Lintas Disiplin Ilmu: Hubungan dengan mata pelajaran lain (IPA, Matematika, Bahasa Indonesia).
      - Tujuan Pembelajaran: Buatkan 2-3 Tujuan Pembelajaran yang merinci kompetensi yang harus dikuasai murid dalam 1 pertemuan (2x40 Menit) mencakup level kognitif mengingat/memahami/menerapkan/menganalisis/merefleksi/mencipta. Awali dengan "Murid ...".
      - Topik Pembelajaran: Rincian materi inti pertemuan ini.
      - Praktik Pedagogis: Pendekatan Pembelajaran Mendalam (Deep Learning), Model Pembelajaran (lengkap dengan sintaks/langkah-langkah), dan Metode yang digunakan.
      - Kemitraan Pembelajaran: Orang tua, teman sebaya, komunitas sekolah.
      - Lingkungan Pembelajaran: Lapangan/ruang terbuka yang inklusif, aman, dan nyaman.
      - Pemanfaatan Digital: Video teknik gerak lambat, alat ukur digital.

   D. PENGALAMAN BELAJAR (Rinci dan Terstruktur):
      - Kegiatan Awal (15 Menit): Berkesadaran, bermakna, menggembirakan (mindful, meaningful, joyful). Salam, doa bersama, cek kehadiran, apersepsi keterhubungan pengalaman, motivasi, pemanasan dinamis berkesadaran.
      - Kegiatan Inti (60 Menit):
        WAJIB memuat 3 tahap pembelajaran mendalam:
        1. Memahami (Sintaks Model) (Estimasi Waktu)
        2. Mengaplikasikan (Sintaks Model) (Estimasi Waktu)
        3. Merefleksi (Sintaks Model) (Estimasi Waktu)
        ATURAN PENTING:
        - Prinsip Pembelajaran yang digunakan (Berkesadaran, Bermakna, Menggembirakan) DITULISKAN DI AWAL SETIAP KEGIATAN sebelum ke rincian aktivitas.
        - Setiap tahap mencantumkan estimasi waktu.
        - Setiap tahap diuraikan menjadi beberapa poin bernomor (minimal 4 poin aktivitas konkret guru dan/atau murid).
        - DPL dituliskan di akhir kalimat pada aktivitas dengan diberi tanda kurung, misal: (Kolaborasi, Penalaran Kritis).
      - Kegiatan Penutup (5 Menit): Menyimpulkan materi, umpan balik reflektif, tindak lanjut, doa bersama, salam penutup. (Identifikasi prinsip berkesadaran/bermakna/menggembirakan).

   E. ASESMEN PEMBELAJARAN:
      - Asesmen Awal: Jenis, Bentuk, dan Teknik.
      - Asesmen Proses: Jenis, Bentuk, dan Teknik.
      - Asesmen Akhir: Jenis, Bentuk, dan Teknik.

3. TANDA TANGAN:
   - Mengetahui Kepala Sekolah bernama: ${kepalaSekolah} (NIP. ${nipKepalaSekolah})
   - Guru Mata Pelajaran: ${penyusun} (NIP. ${nipGuru})
   - Titimangsa: ${titimangsa}

4. LAMPIRAN LENGKAP (Terpisah di Bawah Tabel RPP):
   - Soal Asesmen Awal: 5 butir soal diagnostik (lisan/uraian/pilihan ganda + kunci jawaban).
   - Rubrik Penilaian Sikap (4 Skala): Sesuaikan aspek penilaian sikap dengan DPL yang dipilih di atas dalam tabel rapi.
   - Rubrik Penilaian Pengetahuan (4 Skala): Tabel rapi.
   - Rubrik Penilaian Keterampilan (4 Skala): Tabel rapi.
   - Ringkasan Materi Ajar: Faktual, Konseptual, Prosedural.
   - Lembar Kerja Peserta Didik (LKPD) Lengkap:
     Disajikan TIDAK dalam bentuk tabel.
     Memuat:
     1. Identitas diri di LKPD: nama peserta didik, mata pelajaran, no absen, kelas, tanggal.
     2. Petunjuk penggunaan LKPD: instruksi pengerjaan, alat yang dibutuhkan, cara menjawab.
     3. Sintaks Pembelajaran terintegrasi dengan Pengalaman Belajar Mendalam:
        - Memahami: sajikan materi/gambar ringkas + minimal 3 pertanyaan pemahaman.
        - Mengaplikasikan: tugas kasus nyata/praktik nyata, instruksi kerja jelas, ruang jawaban siswa.
        - Merefleksikan: 2-3 pertanyaan refleksi proses belajar & kesulitan serta rencana tindak lanjut.
        - Bagian Penutup: ucapan penyemangat, catatan guru, kolom ceklis pemahaman diri siswa.

Bahasa formal, edukatif, berkesadaran, bermakna, menggembirakan, dan output dokumen utuh siap pakai dalam file Word portrait.`;

    const userPrompt = `Susunlah dokumen Perencanaan Pembelajaran Mendalam (RPM) KHUSUS UNTUK 1 PERTEMUAN (2x40 Menit) secara utuh dan lengkap:

Identitas:
- Penyusun: ${penyusun}
- Sekolah: ${sekolah}
- Tahun Ajaran: ${tahunAjaran}
- Semester: ${semester}
- Mata Pelajaran: ${mataPelajaran}
- Kelas/Fase: ${kelasFase}
- Topik: ${topik}
- Alokasi Waktu: ${alokasiWaktu}
- Kepala Sekolah: ${kepalaSekolah}
- Titimangsa: ${titimangsa}

Pastikan:
1. Tabel 2 kolom dari A sampai E.
2. 2-3 Tujuan Pembelajaran diawali kata "Murid ...".
3. Prinsip pembelajaran (berkesadaran/bermakna/menggembirakan) ditulis di awal setiap kegiatan inti sebelum rincian aktivitas.
4. Minimal 4 poin aktivitas bernomor di setiap tahap (Memahami, Mengaplikasikan, Merefleksi) dengan estimasi waktu dan DPL di akhir kalimat dalam kurung.
5. Tanda tangan Kepala Sekolah bernama ${kepalaSekolah}.
6. Lampiran Asesmen Awal (5 soal + kunci), Rubrik Sikap, Pengetahuan, Keterampilan (4 skala tabel rapi), Asesmen Akhir, Materi Ajar, dan LKPD Lengkap non-tabel yang komunikatif dan operasional.`;

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
    logGeminiFallback('RPM 1 Pertemuan', errInfo);
    return NextResponse.json(
      {
        result: generateFallbackRpmPertemuan(reqBody),
        errorCode: errInfo.code,
        warning: errInfo.userMessage,
        isFallback: true,
      },
      { status: 200 }
    );
  }
}

function generateFallbackRpmPertemuan(p: RpmPertemuanRequest): string {
  return `# PERENCANAAN PEMBELAJARAN MENDALAM (RPM)
## KURIKULUM MERDEKA — 1 PERTEMUAN (2x40 MENIT)

| KOMPONEN & SUB-KOMPONEN | ISI PERENCANAAN PEMBELAJARAN MENDALAM (RPM) |
|---|---|
| **A. IDENTITAS**<br>• Penyusun<br>• Sekolah<br>• Tahun Ajaran<br>• Semester<br>• Mata Pelajaran<br>• Kelas / Fase<br>• Topik<br>• Alokasi Waktu | **Penyusun:** ${p.penyusun || 'Guru PJOK SD Negeri Kalimantong'}<br>**Sekolah:** ${p.sekolah || 'SD Negeri Kalimantong'}<br>**Tahun Ajaran:** ${p.tahunAjaran || '2026/2027'}<br>**Semester:** ${p.semester || 'Ganjil'}<br>**Mata Pelajaran:** ${p.mataPelajaran || 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)'}<br>**Kelas / Fase:** ${p.kelasFase || 'Kelas V / Fase C'}<br>**Topik:** ${p.topik || 'Variasi Pola Gerak Dasar Menendang dan Menghentikan Bola dengan Kaki Bagian Dalam'}<br>**Alokasi Waktu:** ${p.alokasiWaktu || '2x40 Menit (1 Pertemuan)'} |
| **B. IDENTIFIKASI**<br>• Identifikasi Murid<br>• Materi Pelajaran<br>• Dimensi Profil Lulusan | **1. Identifikasi Murid:**<br>- *Pengetahuan Awal:* Murid telah mengenal aktivitas menendang bola secara bebas saat bermain di lingkungan rumah, namun posisi kaki tumpu dan perkenaan kaki bagian dalam belum konsisten.<br>- *Minat Belajar:* Murid memiliki antusiasme kinestetik tinggi terhadap aktivitas permainan berkelompok dan tantangan berpasangan.<br>- *Kebutuhan Belajar:* Murid membutuhkan instruksi konkret bertahap (scaffolding gerak) dengan modifikasi jarak operan dan bantuan video lambat.<br><br>**2. Materi Pelajaran:**<br>- *Faktual:* Bola sepak ukuran 4 empuk, corong (cone) pembatas, dan stopwatch.<br>- *Konseptual:* Titik tumpu kaki terhadap bola dan sudut impak perkenaan kaki bagian dalam agar bola bergulir lurus mendatar.<br>- *Prosedural:* Urutan gerak: awalan mendekati bola -> menempatkan kaki tumpu di samping bola -> memutar pergelangan kaki keluar -> menendang titik tengah bola -> gerak lanjutan (follow through).<br>- *Metakognitif:* Menilai sendiri ketepatan lintasan bola dan mengevaluasi koordinasi gerak bersama rekan latihan.<br><br>**3. Dimensi Profil Lulusan (DPL):**<br>Kolaborasi, Penalaran Kritis, Kemandirian, dan Kesehatan. |
| **C. DESAIN PEMBELAJARAN**<br>• Capaian Pembelajaran<br>• Lintas Disiplin Ilmu<br>• Tujuan Pembelajaran (2-3 TP)<br>• Topik Pembelajaran<br>• Praktik Pedagogis<br>• Kemitraan Pembelajaran<br>• Lingkungan Belajar<br>• Pemanfaatan Digital | **1. Capaian Pembelajaran:**<br>Peserta didik dapat menunjukkan kemampuan dalam mempraktikkan modifikasi berbagai aktivitas pola gerak dasar dan keterampilan gerak dilandasi dengan konsep dan prinsip gerak yang benar, serta menerapkan konsep aktivitas jasmani untuk kebugaran fisik dan perilaku hidup sehat.<br><br>**2. Lintas Disiplin Ilmu:**<br>- *IPA:* Konsep biomekanika gaya dorong tungkai dan ritme pernapasan saat berolahraga.<br>- *Matematika:* Mengukur jarak operan bola (3–5 meter) dan sudut ayunan kaki.<br>- *Bahasa Indonesia:* Berkomunikasi secara lugas dan santun saat berpasangan.<br><br>**3. Tujuan Pembelajaran (1 Pertemuan):**<br>1. Murid dapat menjelaskan konsep posisi kaki tumpu dan perkenaan kaki bagian dalam pada bola melalui pengamatan demonstrasi secara tepat (Memahami).<br>2. Murid dapat mempraktikkan variasi gerak menendang dan menghentikan bola menyusur tanah secara berpasangan dengan jarak 4 meter secara terkontrol (Menerapkan).<br>3. Murid dapat merefleksikan kerja sama dan sportivitas serta menganalisis faktor penyebab operan melenceng bersama pasangan latihan (Menganalisis & Merefleksi).<br><br>**4. Praktik Pedagogis:**<br>- *Pendekatan:* Pembelajaran Mendalam (Deep Learning - Mindful, Meaningful, Joyful).<br>- *Model:* Teaching Games for Understanding (TGfU) & Drill Berdiferensiasi.<br>- *Metode:* Demonstrasi interaktif, latihan sirkuit berpasangan, permainan tantangan gawang corong, refleksi melingkar.<br><br>**5. Kemitraan, Lingkungan & Digital:**<br>- *Kemitraan:* Teman sebaya (tutor sebaya gerak) dan orang tua (apresiasi aktivitas fisik di rumah).<br>- *Lingkungan:* Lapangan terbuka sekolah yang bersih, rata, dan aman dengan marka corong warna-warni.<br>- *Digital:* Penayangan rekaman video gerak lambat (slow motion) teknik passing sepak bola melalui tablet guru. |
| **D. PENGALAMAN BELAJAR**<br>• Kegiatan Awal (15 Menit)<br>• Kegiatan Inti (60 Menit)<br>• Kegiatan Penutup (5 Menit) | **1. Kegiatan Awal (15 Menit) — Prinsip: Berkesadaran, Bermakna, Menggembirakan:**<br>1. Guru mengucap salam hangat dan mengajak seorang murid memimpin doa bersama dengan khidmat (Berkesadaran).<br>2. Guru menyapa kondisi kesehatan murid dan mengecek kehadiran dengan yel-yel kelas yang bersemangat (Menggembirakan).<br>3. Guru melakukan apersepsi bermakna: menanyakan *"Siapa yang pernah menonton timnas mengoper bola dengan cepat dan tepat ke temannya? Apa rahasianya agar operan tidak direbut lawan?"* (Bermakna).<br>4. Murid melakukan pemanasan dinamis berpasangan lewat permainan "Ular Oper Bola" untuk mengaktifkan fokus motorik dan kelenturan sendi (Joyful).<br><br>**2. Kegiatan Inti (60 Menit) — Pembelajaran Mendalam:**<br><br>**Tahap 1: Memahami (Orientasi Masalah & Eksplorasi Konsep) (15 Menit)**<br>*Prinsip Pembelajaran: Berkesadaran (Mindful) dan Bermakna (Meaningful)*<br>1. Guru mendemonstrasikan dua jenis tendangan: satu tendangan dengan kaki tumpu terlalu jauh yang melenceng, dan satu tendangan dengan kaki tumpu presisi di samping bola yang melaju lurus (Bermakna).<br>2. Murid mengamati secara saksama letak perkenaan bola pada sepatu guru dan tayangan gambar gerak lambat (Penalaran Kritis).<br>3. Murid secara berpasangan berdiskusi untuk merumuskan 3 kunci utama tendangan akurat: pandangan mata ke sasaran, kaki tumpu di samping bola, dan perkenaan tepat di tengah bola dengan kaki bagian dalam (Komunikasi).<br>4. Murid mempraktikkan gerakan bayangan (shadow movement) tanpa bola untuk merasakan ayunan sendi panggul dan posisi pergelangan kaki yang terkunci kuat (Kemandirian).<br><br>**Tahap 2: Mengaplikasikan (Praktik Terbimbing & Tantangan Kasus Nyata) (30 Menit)**<br>*Prinsip Pembelajaran: Menggembirakan (Joyful) dan Bermakna (Meaningful)*<br>1. Murid berpasangan pada jarak 4 meter, melakukan latihan operan mendatar menggunakan kaki bagian dalam secara bergantian sebanyak 15 kali repetisi (Kolaborasi & Kesehatan).<br>2. Pasangan latihan menerapkan teknik menghentikan bola (trapping) dengan telapak atau kaki bagian dalam agar bola langsung tenang di depan badan (Kemandirian).<br>3. Guru memberikan bimbingan diferensiasi: murid yang sudah mahir memperlebar jarak menjadi 6 meter, sedangkan murid yang membutuhkan bimbingan berlatih pada jarak 3 meter dengan bola bertekanan lebih empuk (Kemandirian & Keadilan).<br>4. Murid mengikuti permainan tantangan "Operan Gerbang Juara": mengoper bola melewati celah 2 corong selebar 50 cm; setiap operan yang lolos tanpa menyentuh corong mendapat 1 poin bintang regu (Kolaborasi & Kewargaan).<br><br>**Tahap 3: Merefleksi (Evaluasi Kinerja Gerak & Penguatan Karakter) (15 Menit)**<br>*Prinsip Pembelajaran: Berkesadaran (Mindful) dan Bermakna (Meaningful)*<br>1. Murid duduk melingkar di bawah pohon teduh, melakukan teknik pernapasan berkesadaran (stop-breathe-reflect) untuk menstabilkan denyut nadi (Berkesadaran & Kesehatan).<br>2. Setiap murid saling memberikan satu apresiasi positif kepada rekan pasangannya atas kerja sama dan operan terbaik hari ini (Komunikasi & Kolaborasi).<br>3. Murid menganalisis kendala gerak yang dialami: mengapa bola tadi sempat melenceng ke kanan atau melambung tinggi? (Penalaran Kritis).<br>4. Murid menyimpulkan perbaikan gerak yang akan dilakukan pada pertemuan berikutnya dan mengisi lembar refleksi diri (Kemandirian).<br><br>**3. Kegiatan Penutup (5 Menit) — Prinsip: Berkesadaran dan Menggembirakan:**<br>1. Murid melakukan peregangan pendinginan statis ringan sambil mengatur napas rileks (Kesehatan).<br>2. Guru bersama murid merangkum kesimpulan pembelajaran: ketelitian kaki tumpu dan komunikasi adalah kunci keberhasilan operan sepak bola (Bermakna).<br>3. Murid bersama guru mengembalikan dan merapikan bola serta corong ke tempat semula dengan tertib (Kewargaan).<br>4. Kegiatan pembelajaran diakhiri dengan doa syukur bersama dan tos kekompakan kelas (Menggembirakan). |
| **E. ASESMEN PEMBELAJARAN**<br>• Asesmen Awal<br>• Asesmen Proses<br>• Asesmen Akhir | **1. Asesmen Awal (Diagnostik):**<br>- *Jenis:* Diagnostik Kognitif & Keterampilan Dasar.<br>- *Bentuk:* Tanya jawab singkat 5 butir soal dan uji coba operan 3 kali.<br>- *Teknik:* Lisan dan observasi awal.<br><br>**2. Asesmen Proses (Formatif):**<br>- *Jenis:* Formatif Kinerja & Sikap Dimensi Profil Lulusan.<br>- *Bentuk:* Lembar penilaian antar-teman (peer-assessment) dan rubrik unjuk kerja 4 skala.<br>- *Teknik:* Observasi langsung saat aktivitas tantangan berpasangan.<br><br>**3. Asesmen Akhir (Sumatif Pertemuan):**<br>- *Jenis:* Evaluasi Ketercapaian Tujuan Pembelajaran.<br>- *Bentuk:* Tes unjuk kerja keterampilan operan 5 kali berturut-turut ke sasaran dan lembar refleksi tertulis.<br>- *Teknik:* Penilaian kinerja gerak terstandar. |

---

### KOLOM PENGESAHAN DOKUMEN

Kalimantong, 13 Juli 2026

**Mengetahui,**  
**Kepala SD Negeri Kalimantong**  

*(Tanda Tangan & Stempel)*  

**<u>${p.kepalaSekolah || 'Soleh, S.Pd., M.Pd.'}</u>**  
NIP. ${p.nipKepalaSekolah || '19700318 199602 1 003'}  

<br>

**Guru Mata Pelajaran PJOK,**  

*(Tanda Tangan)*  

**<u>${p.penyusun || 'Guru PJOK SD Negeri Kalimantong'}</u>**  
NIP. ${p.nipGuru || '19880724 201503 1 003'}  

---

## LAMPIRAN 1: ASESMEN AWAL PEMBELAJARAN (DIAGNOSTIK)
### Butir Soal Diagnostik & Kunci Jawaban:
1. **Soal 1:** Di bagian manakah letak kaki bagian dalam yang digunakan untuk menendang bola?  
   *Kunci Jawaban:* Di sisi dalam telapak kaki, mulai dari bawah mata kaki bagian dalam hingga sisi ibu jari kaki.
2. **Soal 2:** Ke arah manakah ujung kaki tumpu harus diarahkan saat kita akan mengoper bola ke teman?  
   *Kunci Jawaban:* Mengarah lurus ke arah sasaran teman yang dituju.
3. **Soal 3:** Mengapa saat menendang bola dengan kaki bagian dalam, pergelangan kaki harus dikunci kuat?  
   *Kunci Jawaban:* Agar tendangan bertenaga, stabil, dan pergelangan kaki tidak cedera atau bergeser saat membentur bola.
4. **Soal 4:** Bagaimana sikap tubuh yang baik saat bola operan dari teman menggelinding ke arahmu?  
   *Kunci Jawaban:* Tubuh sedikit condong ke depan, lutut sedikit ditekuk rileks, dan siap menyambut bola dengan telapak atau kaki bagian dalam.
5. **Soal 5:** Mengapa kita tidak boleh menertawakan teman yang operan bolanya belum tepat sasaran?  
   *Kunci Jawaban:* Karena belajar membutuhkan proses, dan sikap sportif adalah saling menyemangati serta membantu teman agar berkembang bersama.

---

## LAMPIRAN 2: RUBRIK PENILAIAN PROSES PEMBELAJARAN (4 SKALA)

### 1. Rubrik Penilaian Sikap (Dimensi Profil Lulusan yang Dipilih):
| Aspek Sikap (DPL) | Perlu Bimbingan (1) | Cukup (2) | Baik (3) | Sangat Baik (4) |
|---|---|---|---|---|
| **Kolaborasi** | Menolak berlatih bersama teman atau bermain sendiri. | Mau berpasangan tetapi pasif dan sering menyalahkan teman jika bola meleset. | Aktif bekerja sama, mengoper bola secara adil, dan saling mengingatkan teknik. | Menunjukkan kepemimpinan positif, selalu menyemangati teman, dan menciptakan suasana kompak. |
| **Penalaran Kritis** | Tidak menyadari kesalahan arah operan bola. | Menyadari arah bola melenceng namun tidak tahu penyebab posisi kakinya. | Mampu menganalisis kesalahan posisi kaki tumpu dan segera memperbaikinya. | Mampu menganalisis sudut perkenaan bola secara tepat dan memberikan masukan solutif ke teman. |
| **Kemandirian** | Selalu bergantung pada instruksi guru setiap kali menendang. | Memerlukan dorongan berulang kali untuk memulai latihan tantangan. | Melakukan latihan secara teratur dan mandiri sesuai target 15 kali repetisi. | Sangat disiplin, mengatur ritme latihan sendiri dengan fokus tinggi tanpa perlu diawasi guru. |
| **Kesehatan** | Melakukan gerakan secara sembrono yang berisiko cedera. | Mengikuti pemanasan dan pendinginan namun kurang sungguh-sungguh. | Melakukan pemanasan dan pendinginan dengan tertib serta menjaga hidrasi tubuh. | Sangat sadar menjaga postur tubuh yang aman, memantau ritme napas, dan menghargai kebugaran diri. |

### 2. Rubrik Penilaian Pengetahuan:
| Kriteria Pengetahuan | Perlu Bimbingan (1) | Cukup (2) | Baik (3) | Sangat Baik (4) |
|---|---|---|---|---|
| **Konsep Kaki Tumpu & Perkenaan** | Skor < 68. Belum mampu menjelaskan letak kaki tumpu dan perkenaan bola. | Skor 68–78. Mampu menjelaskan 1 konsep dasar dengan bantuan bimbingan guru. | Skor 79–89. Mampu menjelaskan posisi kaki tumpu dan perkenaan bola secara mandiri. | Skor 90–100. Mampu menguraikan korelasi sudut kaki tumpu, ayunan panggul, dan akurasi laju bola secara ilmiah. |

### 3. Rubrik Penilaian Keterampilan Gerak:
| Keterampilan Gerak | Perlu Bimbingan (1) | Cukup (2) | Baik (3) | Sangat Baik (4) |
|---|---|---|---|---|
| **Menendang Kaki Dalam** | Kaki tumpu salah, perkenaan meleset, bola melambung tak tentu arah. | Kaki tumpu benar namun pergelangan kaki belum dikunci; bola bergulir lemah. | Kaki tumpu dan perkenaan tepat; operan lurus dan terarah mencapai sasaran 3 dari 5 kali. | Gerakan luwes dan seimbang; operan melaju datar bertenaga serta tepat sasaran 5 dari 5 kali. |
| **Menghentikan Bola (Trapping)** | Bola memantul jauh atau terlepas saat hendak dihentikan. | Menghentikan bola namun posisi bola masih terpental lebih dari 1 meter. | Mampu menghentikan bola dengan tenang di depan badan dalam radius < 50 cm. | Kontrol bola sempurna, bola langsung siap untuk dialirkan atau dioper kembali dengan percaya diri. |

---

## LAMPIRAN 3: RINGKASAN MATERI AJAR
1. **Faktual:** Permainan sepak bola menggunakan bola standar ukuran 4 bertekanan udara 0.6–0.8 bar, lapangan datar beralas rumput/matras, corong penanda warna cerah.
2. **Konseptual:**
   - *Hukum Sudut Laju:* Jika kaki membentur bagian bawah bola, bola akan terangkat naik. Jika kaki membentur tepat di garis katulistiwa (tengah) bola, bola akan meluncur mendatar di atas rumput.
   - *Kaki Tumpu sebagai Kompas:* Arah jari-jari kaki tumpu menentukan arah garis edar bola yang dihasilkan.
3. **Prosedural:**
   - Berdiri menghadap sasaran operan.
   - Letakkan kaki tumpu di samping bola berjarak sekitar 10–15 cm dengan lutut sedikit lentur.
   - Tarik kaki yang akan menendang ke belakang, putar pergelangan kaki ke arah luar, lalu ayunkan ke depan mengenai tepat tengah bola dengan kaki bagian dalam.
   - Lanjutkan ayunan kaki ke arah sasaran dan seimbangkan badan dengan kedua lengan terbuka wajar.

---

## LAMPIRAN 4: LEMBAR KERJA PESERTA DIDIK (LKPD) LENGKAP
### LKPD PEMBELAJARAN MENDALAM: OPERAN AKURAT BOLA SEPAK

**A. IDENTITAS DIRI PESERTA DIDIK**
- Nama Peserta Didik : ............................................................
- Nomor Absen        : ............................................................
- Kelas / Fase       : Kelas V / Fase C
- Mata Pelajaran     : Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)
- Tanggal            : ............................................................

**B. PETUNJUK PENGGUNAAN LKPD**
1. Awali kegiatan dengan berdoa memohon kesehatan dan keselamatan kepada Tuhan Yang Maha Esa.
2. Gunakan seragam olahraga lengkap dan sepatu olahraga yang bertali rapi.
3. Kerjakan tantangan praktik ini bersama teman pasanganmu dengan kompak, riang gembira, dan saling membantu!
4. Tulislah jawaban pengamatan dan refleksimu dengan jujur dan rapi.

**C. SINTAKS & PENGALAMAN BELAJAR MENDALAM**

#### 1. MEMAHAMI (Ayo Amati dan Temukan Rahasianya!)
Amati demonstrasi guru dan gambar ilustrasi operan bola di lapangan:
> *"Tendangan yang akurat bukan ditentukan oleh seberapa keras kita menendang, melainkan oleh ketepatan letak kaki tumpu dan titik sentuh kaki pada bola."*

**Pertanyaan Pemahaman:**
1. Mengapa kaki tumpu harus diletakkan persis di samping bola dan tidak boleh terlalu jauh di belakang bola?  
   *Jawaban Saya:* ............................................................................................................................
2. Bagian bola sebelah manakah yang harus kamu sentuh dengan kaki bagian dalam agar bola meluncur lurus menyusur rumput?  
   *Jawaban Saya:* ............................................................................................................................
3. Mengapa kamu dan teman pasanganmu harus saling memanggil atau memberi tanda sebelum bola dioper?  
   *Jawaban Saya:* ............................................................................................................................

#### 2. MENGAPLIKASIKAN (Ayo Berlatih Nyata & Selesaikan Tantangan!)
**Tugas Praktik Berpasangan: "Tantangan Gerbang Presisi"**
- Letakkan 2 buah corong membentuk gerbang selebar 50 cm di antara kamu dan teman pasanganmu (jarak masing-masing 2 meter dari gerbang).
- Lakukan operan mendatar bergantian melewati celah gerbang corong sebanyak 10 kali operan!

**Catatan Hasil Praktik:**
- Jumlah operan kami yang berhasil lolos mulus tanpa menyentuh corong: ....... dari 10 kali.
- Apa strategi atau kesepakatan yang kamu dan temanmu buat agar operan semakin akurat?  
  *Jawaban Kami:* ............................................................................................................................

#### 3. MEREFLEKSIKAN (Ayo Renungkan Makna Belajarmu!)
1. Apa bagian tersulit yang kamu alami saat berusaha mengontrol bola operan yang datang? Bagaimana usahamu untuk mengatasinya?  
   *Refleksiku:* ............................................................................................................................
2. Bagaimana caramu menunjukkan sikap menghargai dan menyemangati teman pasanganmu ketika operan bolanya belum tepat sasaran?  
   *Refleksiku:* ............................................................................................................................
3. Setelah belajar hari ini, nilai kebaikan apa yang bisa kamu terapkan saat bermain bersama teman-teman di rumah?  
   *Refleksiku:* ............................................................................................................................

#### D. BAGIAN PENUTUP & CEK PEMAHAMAN DIRI
🌟 **Kata Penyemangat Guru:**  
*"Seorang juara sejati adalah murid yang pantang menyerah saat gagal, selalu menghormati teman satu regu, dan bersyukur atas tubuh sehat yang dianugerahkan Tuhan!"*

**Cek Pemahaman Diri (Beri tanda centang ✓):**
- [ ] Saya sudah paham fungsi kaki tumpu dalam mengarahkan bola.
- [ ] Saya dapat menendang bola dengan kaki bagian dalam secara terarah.
- [ ] Saya mampu mengontrol bola yang datang tanpa panik.
- [ ] Saya selalu menyemangati dan tidak menyalahkan teman pasangan saya.
- [ ] Saya merasa gembira dan tubuh saya semakin bugar hari ini.

**Tanda Tangan Murid:** ............................ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Catatan &amp; Paraf Guru:** ............................`;
}
