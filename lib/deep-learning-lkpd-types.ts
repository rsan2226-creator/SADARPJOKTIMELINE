export type JenisLkpdType =
  | 'LKPD OBSERVASI'
  | 'LKPD EKSPERIMEN'
  | 'LKPD INQUIRY/PENEMUAN'
  | 'LKPD ANALISIS DATA'
  | 'LKPD BERBASIS GAMBAR'
  | 'LKPD PEMECAHAN MASALAH'
  | 'LKPD CERITA BERGAMBAR'
  | 'LKPD MENCOCOKKAN'
  | 'LKPD BENAR/SALAH'
  | 'LKPD ISIAN'
  | 'LKPD PROYEK'
  | 'LKPD CAMPURAN'
  | 'LKPD KLASIFIKASI/PENGELOMPOKAN'
  | 'LKPD URUTAN/SEQUENCING'
  | 'LKPD REFLEKSI DAN KONEKSI'
  | 'LKPD TEKA-TEKI SILANG (TTS)'
  | 'LKPD PENCARIAN KATA (WORD SEARCH)';

export interface LkpdTypeInfo {
  id: JenisLkpdType;
  label: string;
  pola: string;
  deskripsi: string;
}

export const JENIS_LKPD_LIST: LkpdTypeInfo[] = [
  {
    id: 'LKPD OBSERVASI',
    label: 'LKPD Observasi',
    pola: 'Stimulus → Amati → Catat → Bandingkan → Analisis → Simpulkan → Refleksi',
    deskripsi: 'Peserta didik mengamati objek, fenomena, gambar, atau situasi kemudian menemukan informasi dan membuat kesimpulan.',
  },
  {
    id: 'LKPD EKSPERIMEN',
    label: 'LKPD Eksperimen',
    pola: 'Masalah → Prediksi → Alat/Bahan → Langkah Kerja → Observasi → Data → Analisis → Kesimpulan → Refleksi',
    deskripsi: 'Peserta didik melakukan percobaan sederhana melalui tahapan prediksi, alat/bahan, prosedur, pengamatan, dan data.',
  },
  {
    id: 'LKPD INQUIRY/PENEMUAN',
    label: 'LKPD Inquiry / Penemuan',
    pola: 'Fenomena → Pertanyaan → Prediksi → Eksplorasi → Data → Analisis → Temukan Konsep → Kesimpulan → Refleksi',
    deskripsi: 'Peserta didik menemukan konsep atau prinsip melalui pertanyaan pemantik tanpa langsung diberikan konsep akhir.',
  },
  {
    id: 'LKPD ANALISIS DATA',
    label: 'LKPD Analisis Data',
    pola: 'Data → Amati → Identifikasi → Olah → Bandingkan → Temukan Pola → Interpretasi → Simpulkan → Refleksi',
    deskripsi: 'Peserta didik membaca, mengolah, membandingkan, dan menafsirkan data dalam bentuk tabel, grafik, atau hasil pengamatan.',
  },
  {
    id: 'LKPD BERBASIS GAMBAR',
    label: 'LKPD Berbasis Gambar',
    pola: 'Gambar → Amati → Identifikasi → Temukan pola → Analisis → Jawab → Simpulkan',
    deskripsi: 'Gambar menjadi stimulus utama untuk mengamati, membandingkan, mengelompokkan, atau memecahkan masalah.',
  },
  {
    id: 'LKPD PEMECAHAN MASALAH',
    label: 'LKPD Pemecahan Masalah',
    pola: 'Masalah → Identifikasi → Informasi → Strategi → Penyelesaian → Verifikasi → Solusi → Refleksi',
    deskripsi: 'Peserta didik diberikan masalah kontekstual nyata kemudian mengidentifikasi strategi, menyelesaikan, dan mengevaluasi.',
  },
  {
    id: 'LKPD CERITA BERGAMBAR',
    label: 'LKPD Cerita Bergambar',
    pola: 'Tokoh → Masalah → Peristiwa → Pertanyaan → Tantangan → Solusi → Refleksi',
    deskripsi: 'Materi disajikan melalui cerita/komik edukatif bergambar yang diikuti pertanyaan dan aktivitas pemecahan masalah.',
  },
  {
    id: 'LKPD MENCOCOKKAN',
    label: 'LKPD Mencocokkan',
    pola: 'Pasangan Gambar ↔ Konsep ↔ Masalah ↔ Solusi → Pertanyaan Analisis Lanjutan',
    deskripsi: 'Peserta didik mencocokkan gambar, konsep, istilah, atau pasangan yang sesuai disertai pertanyaan analitis.',
  },
  {
    id: 'LKPD BENAR/SALAH',
    label: 'LKPD Benar / Salah',
    pola: 'Pernyataan / Gambar → Tentukan Benar/Salah → Berikan Bukti & Alasan Logis',
    deskripsi: 'Menganalisis pernyataan atau gambar kemudian menentukan benar/salah disertai bukti dan argumen ilmiah.',
  },
  {
    id: 'LKPD ISIAN',
    label: 'LKPD Isian Terbimbing',
    pola: 'Stimulus Gambar + Teks + Diagram → Lengkapi Konsep Kunci → Simpulkan',
    deskripsi: 'Melengkapi bagian yang kosong berdasarkan stimulus gambar, diagram, teks, atau situasi pemikiran.',
  },
  {
    id: 'LKPD PROYEK',
    label: 'LKPD Proyek',
    pola: 'Pertanyaan Pemantik → Perencanaan → Pembagian Tugas → Pelaksanaan → Dokumentasi → Produk → Presentasi → Refleksi',
    deskripsi: 'Peserta didik menghasilkan suatu karya/produk nyata melalui perencanaan, dokumentasi, dan presentasi.',
  },
  {
    id: 'LKPD CAMPURAN',
    label: 'LKPD Campuran (Multi-Aktivitas)',
    pola: 'Observasi → Analisis Gambar → Tantangan Kasus → Isian → Refleksi',
    deskripsi: 'Menggabungkan beberapa jenis aktivitas LKPD secara proporsional dan logis sesuai tujuan pembelajaran.',
  },
  {
    id: 'LKPD KLASIFIKASI/PENGELOMPOKAN',
    label: 'LKPD Klasifikasi / Pengelompokan',
    pola: 'Stimulus → Amati → Identifikasi Ciri → Tentukan Kriteria → Kelompokkan → Jelaskan Alasan → Simpulkan',
    deskripsi: 'Mengidentifikasi karakteristik objek kemudian mengelompokkannya berdasarkan kriteria tertentu dan menjelaskan alasannya.',
  },
  {
    id: 'LKPD URUTAN/SEQUENCING',
    label: 'LKPD Urutan / Sequencing',
    pola: 'Stimulus Acak → Amati → Identifikasi → Susun Urutan Kronologis → Jelaskan Alasan → Verifikasi → Simpulkan',
    deskripsi: 'Menyusun gambar, langkah gerak, atau proses acak ke dalam urutan yang benar lalu menjelaskan alasannya.',
  },
  {
    id: 'LKPD REFLEKSI DAN KONEKSI',
    label: 'LKPD Refleksi dan Koneksi',
    pola: 'Pengalaman → Hubungkan → Maknai → Terapkan → Refleksi Diri → Tindak Lanjut',
    deskripsi: 'Menghubungkan materi dengan pengalaman hidup sehari-hari, memaknai, dan merefleksikan perubahan pemahaman.',
  },
  {
    id: 'LKPD TEKA-TEKI SILANG (TTS)',
    label: 'LKPD Teka-Teki Silang (TTS)',
    pola: 'Petunjuk Mendatar/Menurun → Temukan Istilah → Verifikasi Huruf → Hubungkan Makna → Refleksi',
    deskripsi: 'Menemukan istilah penting melalui petunjuk mendatar dan menurun untuk menguatkan pemahaman konsep.',
  },
  {
    id: 'LKPD PENCARIAN KATA (WORD SEARCH)',
    label: 'LKPD Pencarian Kata (Word Search)',
    pola: 'Stimulus → Cari Kata Kunci pada Grid Huruf → Tandai → Jelaskan Fungsi & Makna Konsep → Refleksi',
    deskripsi: 'Menemukan kata kunci tersembunyi pada grid huruf kemudian menjelaskan makna dan hubungannya dengan materi.',
  },
];

export interface ImagePromptInfo {
  nomor: number;
  fungsiPedagogis: string;
  objekUtama: string;
  situasi: string;
  karakter: string;
  ekspresi: string;
  komposisi: string;
  gayaVisual: string;
  warna: string;
  rasio: string;
  detailPenting: string;
  promptReadyAi: string;
}

export interface LkpdPageContent {
  halamanNomor: number;
  judulHalaman: string;
  instruksiUtama: string;
  mindfulPrompt: string; // e.g., "Amati dengan teliti!", "Apa yang kamu perhatikan?"
  stimulusVisualDeskripsi: string;
  imagePromptRefNo?: number;
  aktivitasLevel1?: {
    judul: string;
    deskripsi: string;
    tugas: string[];
    ruangJawaban: string;
  };
  aktivitasLevel2?: {
    judul: string;
    deskripsi: string;
    tugas: string[];
    ruangJawaban: string;
  };
  aktivitasLevel3?: {
    judul: string;
    deskripsi: string;
    tugas: string[];
    ruangJawaban: string;
  };
  analisisDanDiskusi: {
    pertanyaan: string[];
    ruangDiskusi: string;
  };
  kesimpulanDanRefleksi: {
    sebelumSesudahBelajar: string;
    refleksiDiri: string;
  };
}

export interface DeepLearningLkpdData {
  identitas: {
    judulLkpd: string;
    mataPelajaran: string;
    kelasFase: string;
    topikMateri: string;
    alokasiWaktu: string;
    jenisLkpd: JenisLkpdType;
    konteksKehidupanNyata: string;
    karakteristikPesertaDidik: string;
    jumlahHalaman: number;
  };
  tujuanPembelajaran: string[];
  keterkaitanDeepLearning: {
    mindful: string;
    meaningful: string;
    joyful: string;
  };
  halamanList: LkpdPageContent[];
  daftarPromptGambar: ImagePromptInfo[];
  kunciJawaban: Array<{
    nomorHalaman: number;
    aktivitas: string;
    jawabanObjektif: string;
    indikatorJawabanTerbuka: string;
  }>;
  rubrikPenilaian: Array<{
    aspek: string;
    skor4: string;
    skor3: string;
    skor2: string;
    skor1: string;
  }>;
}

export function getFallbackDeepLearningLkpd(
  mapel?: string,
  kelasFase?: string,
  topik?: string,
  tujuan?: string,
  jenis?: JenisLkpdType
): DeepLearningLkpdData {
  const m = mapel || 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)';
  const kf = kelasFase || 'Kelas V / Fase C';
  const tpk = topik || 'Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola';
  const jns = jenis || 'LKPD PEMECAHAN MASALAH';
  const tp = tujuan || 'Peserta didik dapat menganalisis letak kaki tumpu, mempraktikkan operan dan kontrol bola mendatar berpasangan secara presisi, serta merefleksikan kerja sama tim.';

  return {
    identitas: {
      judulLkpd: 'LKPD PEMBELAJARAN MENDALAM: RAHASIA OPERAN PRESISI SI KULIT BUNDAR',
      mataPelajaran: m,
      kelasFase: kf,
      topikMateri: tpk,
      alokasiWaktu: '2 × 40 Menit (1 Pertemuan)',
      jenisLkpd: jns,
      konteksKehidupanNyata: 'Bermain sepak bola mini di lapangan rumput sekolah bersama teman sebaya saat jam olahraga atau sore hari.',
      karakteristikPesertaDidik: 'Peserta didik usia 10-11 tahun yang sangat aktif secara kinestetik, antusias pada tantangan visual bergambar, dan menyukai permainan kompetitif berpasangan.',
      jumlahHalaman: 2,
    },
    tujuanPembelajaran: [
      'Murid dapat mengamati dan menjelaskan korelasi posisi kaki tumpu dengan akurasi arah bola secara kritis.',
      'Murid dapat mempraktikkan teknik operan mendatar dan menghentikan bola (trapping) melewati target berpasangan.',
      'Murid dapat mengidentifikasi kesalahan teknis operan yang melenceng dan merumuskan strategi perbaikannya.',
      'Murid menunjukkan sikap saling menyemangati, sportif, dan berkesadaran penuh selama beraktivitas.',
    ],
    keterkaitanDeepLearning: {
      mindful: 'Peserta didik diajak mengamati secara sadar posisi kaki tumpu sebelum menendang, merasakan titik kontak sentuhan sepatu pada bola, dan merefleksikan perubahan pemahamannya sebelum dan sesudah belajar.',
      meaningful: 'Materi dikaitkan langsung dengan pengalaman nyata saat bermain di lapangan bersama teman: bagaimana sebuah operan yang presisi dapat menciptakan peluang gol dan mempererat kekompakan tim.',
      joyful: 'Proses belajar dikemas melalui misi tantangan "Detektif Tendangan & Gerbang Sasaran Berpasangan", maskot kartun bola yang ceria, teka-teki pemecahan kasus, dan selebrasi keberhasilan bersama rekan latihan.',
    },
    halamanList: [
      {
        halamanNomor: 1,
        judulHalaman: 'Halaman 1: Misi Detektif Kaki Tumpu (Mengamati & Memahami Masalah)',
        instruksiUtama: 'Amati gambar situasi lapangan dengan saksama. Temukan petunjuk mengapa bola operan bisa melenceng jauh!',
        mindfulPrompt: 'Amati dengan teliti! Apa yang kamu perhatikan dari posisi kaki kedua anak pada gambar di bawah?',
        stimulusVisualDeskripsi: 'Ilustrasi komparasi dua pemain sepak bola anak SD: Pemain A (Doni) menaruh kaki tumpu miring terlalu jauh 40 cm di belakang bola sehingga tubuhnya condong ke belakang dan bola melambung tinggi ke luar lapangan. Pemain B (Rian) menaruh kaki tumpu sejajar 15 cm di samping bola dengan ujung kaki lurus ke sasaran, menghasilkan operan datar lurus yang mulus.',
        imagePromptRefNo: 1,
        aktivitasLevel1: {
          judul: 'LEVEL 1 — Eksplorasi: Temukan Perbedaan Kunci',
          deskripsi: 'Bandingkan posisi tubuh dan kaki tumpu antara Doni dan Rian pada gambar.',
          tugas: [
            'Berapa perkiraan jarak kaki tumpu Doni dan Rian dari posisi bola?',
            'Ke arah manakah ujung jari kaki tumpu Rian menghadap saat bola ditendang?',
          ],
          ruangJawaban: 'Tuliskan hasil pengamatanmu: Kaki tumpu Doni berada di ... sedangkan kaki tumpu Rian berada di ... Ujung kaki tumpu Rian mengarah ke ...',
        },
        aktivitasLevel2: {
          judul: 'LEVEL 2 — Tantangan: Analisis Sebab-Akibat',
          deskripsi: 'Gunakan nalar kritismu untuk memecahkan misteri laju bola.',
          tugas: [
            'Mengapa bola Doni melambung tinggi ke udara dan tidak sampai ke rekannya?',
            'Bagian sepatu manakah yang paling ideal menyentuh bola agar laju bola tetap mendatar di atas rumput?',
          ],
          ruangJawaban: 'Analisis saya: Bola Doni melambung karena ... Agar bola meluncur mendatar, bagian sepatu yang menyentuh bola adalah ...',
        },
        analisisDanDiskusi: {
          pertanyaan: [
            'Apa yang kamu pikirkan ketika melihat rekan pasanganmu bolanya sering melenceng?',
            'Bagaimana cara memberi masukan yang baik tanpa membuatnya merasa bersalah?',
          ],
          ruangDiskusi: 'Catatan diskusi bersama teman pasangan: Kami sepakat saling mengingatkan letak kaki tumpu dengan cara ...',
        },
        kesimpulanDanRefleksi: {
          sebelumSesudahBelajar: 'Sebelum belajar, saya mengira operan akurat hanya butuh tenaga kuat. Sekarang saya menyadari bahwa posisi kaki tumpu adalah kompas penentu arah bola.',
          refleksiDiri: 'Tingkat keyakinan pemahaman konsep saya hari ini: [  ] Sangat Yakin  [  ] Cukup Yakin  [  ] Masih Bingung.',
        },
      },
      {
        halamanNomor: 2,
        judulHalaman: 'Halaman 2: Misi Lapangan Gerbang Presisi (Mengaplikasikan & Solusi Nyata)',
        instruksiUtama: 'Lakukan tantangan praktik berpasangan di lapangan. Ujilah teorimu dalam 10 kali operan gerbang presisi!',
        mindfulPrompt: 'Fokuskan pikiran dan pandangan matamu sebelum mengayunkan kaki. Apa yang membuatmu yakin operanmu akan lolos?',
        stimulusVisualDeskripsi: 'Diagram lapangan mini berpasangan: Dua siswa SD (berjarak 4 meter) saling berhadapan. Di tengah-tengah dipasang dua cone pembatas selebar 50 cm membentuk sebuah gerbang sasaran bercahaya hijau. Bola harus meluncur mendatar tepat di antara kedua cone tanpa menyentuhnya.',
        imagePromptRefNo: 2,
        aktivitasLevel2: {
          judul: 'LEVEL 2 — Praktik Terbimbing: Tantangan 10 Operan Gerbang Presisi',
          deskripsi: 'Lakukan operan mendatar bergantian bersama rekan pasanganmu.',
          tugas: [
            'Lakukan 10 kali operan melewati celah gerbang cone.',
            'Penerima menghentikan bola (trapping) dengan kaki dalam hingga bola berhenti tenang di depan badan.',
            'Hitung berapa kali operanmu dan pasanganmu berhasil lolos mulus tanpa menyentuh cone!',
          ],
          ruangJawaban: 'Hasil Latihan Kami: Berhasil lolos cone: ... dari 10 kali tendangan. Bola berhenti tenang di depan badan: ... kali.',
        },
        aktivitasLevel3: {
          judul: 'LEVEL 3 — Tantangan Lanjutan: Strategi Mengatasi Masalah',
          deskripsi: 'Jika ada bola yang melenceng atau menyentuh cone, temukan solusinya.',
          tugas: [
            'Faktor apa yang paling sering menyebabkan bola meleset (misal: terburu-buru, kaki tumpu miring, atau salah titik sentuh)?',
            'Tuliskan satu strategi penyesuaian yang langsung berhasil memperbaiki tendanganmu!',
          ],
          ruangJawaban: 'Kendala yang kami temukan: ... Strategi perbaikan yang kami lakukan: ...',
        },
        analisisDanDiskusi: {
          pertanyaan: [
            'Bagaimana perasaanmu dan rekan pasanganmu saat berhasil mencapai target 8 dari 10 operan sukses?',
            'Apa hal baru yang kamu pelajari tentang kerja sama dan kesabaran saat berlatih olahraga?',
          ],
          ruangDiskusi: 'Refleksi kolaborasi kami: Kami merasa sangat gembira karena ...',
        },
        kesimpulanDanRefleksi: {
          sebelumSesudahBelajar: 'Sebelum belajar, saya sering panik saat bola datang cepat. Sekarang saya tahu cara menyerap tenaga bola dengan menarik kaki sedikit ke belakang seperti menangkap telur.',
          refleksiDiri: 'Tuliskan 1 komitmen kebugaran dan sportivitas yang akan kamu bawa di pertandingan berikutnya!',
        },
      },
    ],
    daftarPromptGambar: [
      {
        nomor: 1,
        fungsiPedagogis: 'Stimulus komparasi visual untuk mengamati posisi kaki tumpu yang salah vs posisi kaki tumpu yang benar.',
        objekUtama: 'Dua anak laki-laki Indonesia usia 10 tahun bermain sepak bola dengan jersey olahraga sekolah warna cerah.',
        situasi: 'Sisi kiri: anak menendang dengan kaki tumpu jauh di belakang bola dan tubuh condong ke belakang, bola melambung ke luar garis. Sisi kanan: anak menendang dengan kaki tumpu rapi 15 cm di samping bola, bola meluncur lurus mendatar.',
        karakter: 'Dua siswa SD sporty berambut hitam rapi dengan sepatu olahraga bersol karet.',
        ekspresi: 'Sisi kiri ekspresi heran dan kaget; sisi kanan ekspresi tersenyum fokus dan percaya diri.',
        komposisi: 'Split screen perbandingan sejajar berdampingan (side by side), sudut pandang setinggi pinggang (waist-level view).',
        gayaVisual: 'Ilustrasi edukatif modern, semi-realistis ramah anak, garis bersih (clean vector outline), warna cerah pastel.',
        warna: 'Hijau rumput alami, biru langit cerah, aksen kuning dan oranye pada sepatu.',
        rasio: '16:9 widescreen atau 4:3 horizontal.',
        detailPenting: 'Tidak boleh ada teks tulisan di dalam gambar. Garis lintasan bola tampak jelas dengan efek panah visual halus.',
        promptReadyAi: 'A high quality educational children illustration, side-by-side comparison of two Indonesian boys playing football on a grass pitch. Left boy has incorrect kicking posture with supporting foot too far behind the ball and body leaning back, ball flying high. Right boy has perfect kicking posture with supporting foot placed flat 15cm beside the soccer ball with toe pointing forward, kicking with inside foot smoothly. Clean line art, colorful modern school textbook style, cheerful and instructive, no text.',
      },
      {
        nomor: 2,
        fungsiPedagogis: 'Petunjuk visual tata letak tantangan gerak di lapangan (drill diagram).',
        objekUtama: 'Dua siswa SD berjarak 4 meter saling berhadapan di lapangan hijau dengan dua corong oranye di tengah membentuk gerbang mini.',
        situasi: 'Latihan operan berpasangan melewati celah gawang corong mini. Bola sepak bergulir tepat di tengah celah dengan jejak garis putus-putus bercahaya hijau.',
        karakter: 'Satu siswa laki-laki dan satu siswa perempuan mengenakan rompi olahraga tim hijau dan oranye.',
        ekspresi: 'Wajah riang gembira, antusias, dan sportif.',
        komposisi: 'Sudut pandang isometrik atau tiga perempat (three-quarters perspective) memperlihatkan seluruh jarak latihan.',
        gayaVisual: 'Desain infografis olahraga edukatif anak, flat modern vector, ramah peserta didik.',
        warna: 'Hijau emerald rumput, oranye terang corong, putih bola sepak.',
        rasio: '16:9 atau 4:3.',
        detailPenting: 'Visual bersih tanpa huruf/tulisan mengganggu, proporsi tubuh anak usia sekolah dasar yang proporsional.',
        promptReadyAi: 'Isometric educational sports drill illustration for elementary students, two Indonesian school children passing a soccer ball through a mini goal made of two bright orange cones on a lush green schoolyard. One boy kicking with inside foot, one girl ready to trap the ball. Clean infographic style, vibrant cheerful colors, friendly mascot style, no text.',
      },
    ],
    kunciJawaban: [
      {
        nomorHalaman: 1,
        aktivitas: 'Level 1: Eksplorasi Kaki Tumpu',
        jawabanObjektif: 'Kaki tumpu Doni berada di belakang bola (> 30 cm), sedangkan kaki tumpu Rian sejajar di samping bola (10-15 cm). Ujung kaki tumpu Rian mengarah lurus ke sasaran rekan yang dituju.',
        indikatorJawabanTerbuka: 'Siswa dapat mengidentifikasi letak kaki tumpu yang tepat (di samping bola) dan arah ujung jari kaki tumpu sebagai penentu arah laju bola.',
      },
      {
        nomorHalaman: 1,
        aktivitas: 'Level 2: Analisis Sebab-Akibat',
        jawabanObjektif: 'Bola Doni melambung karena perkenaan sepatu mengenai bagian bawah bola dan badan condong ke belakang. Bagian sepatu paling ideal adalah kaki bagian dalam karena permukaannya luas dan datar.',
        indikatorJawabanTerbuka: 'Siswa dapat menjelaskan hubungan gaya kontak sepatu pada titik tengah bola untuk menghasilkan lintasan mendatar menyusur rumput.',
      },
      {
        nomorHalaman: 2,
        aktivitas: 'Level 2 & 3: Tantangan Gerbang Presisi & Strategi',
        jawabanObjektif: 'Target minimal 7-8 dari 10 operan berhasil lolos tanpa menyentuh corong. Bola terkontrol dalam radius < 50 cm di depan tubuh.',
        indikatorJawabanTerbuka: 'Siswa mampu merumuskan strategi perbaikan nyata, seperti mengunci pergelangan kaki, menempatkan kaki tumpu lebih tenang sebelum menendang, dan berkomunikasi dengan rekan pasangan.',
      },
    ],
    rubrikPenilaian: [
      {
        aspek: 'Pemahaman Konsep Kaki Tumpu',
        skor4: 'Mampu menjelaskan hubungan letak kaki tumpu, titik sentuh bola, dan arah laju bola secara sangat tepat dan logis.',
        skor3: 'Mampu menjelaskan letak kaki tumpu dan titik sentuh bola dengan benar namun penjelasan alasan masih sederhana.',
        skor2: 'Mengetahui kaki tumpu harus di samping bola namun belum memahami korelasi arah ujung kakinya.',
        skor1: 'Belum memahami fungsi dan posisi kaki tumpu dalam menendang bola.',
      },
      {
        aspek: 'Kinerja Praktik & Ketepatan Gerak',
        skor4: 'Operan mendatar stabil, 8-10 kali lolos gerbang tanpa menyentuh corong, dan kontrol bola tenang di depan badan.',
        skor3: 'Operan mendatar cukup baik, 6-7 kali lolos gerbang, dan mampu menghentikan bola dengan sedikit pantulan.',
        skor2: 'Operan sering menyentuh corong atau melambung, 4-5 kali lolos gerbang, kontrol bola masih sering terlepas.',
        skor1: 'Operan meleset jauh dari gerbang (< 4 kali lolos) dan kesulitan menghentikan bola.',
      },
      {
        aspek: 'Kolaborasi & Sportivitas (DPL)',
        skor4: 'Sangat kompak, selalu menyemangati pasangan, berbagi peran secara adil, dan santun saat memberi masukan.',
        skor3: 'Bekerja sama dengan baik bersama pasangan, mau mendengarkan masukan, dan tidak menyalahkan teman.',
        skor2: 'Cenderung pasif dalam kerja sama atau sesekali mengeluh ketika operan pasangan belum tepat.',
        skor1: 'Menolak bekerja sama dengan pasangan atau sering menyalahkan teman ketika gagal.',
      },
      {
        aspek: 'Refleksi Diri (Mindful & Meaningful)',
        skor4: 'Mampu mengevaluasi proses belajarnya secara jujur, mendalam, dan merumuskan rencana tindak lanjut perbaikan yang konkret.',
        skor3: 'Mampu menuliskan kesulitan dan hal yang dipelajari dengan cukup baik dan relevan.',
        skor2: 'Refleksi ditulis sangat singkat tanpa menyebutkan kendala nyata atau solusi.',
        skor1: 'Tidak mengisi bagian refleksi diri.',
      },
    ],
  };
}
