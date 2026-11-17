export interface AnalisisMateri {
  konsepUtama: string;
  submateriPenting: string[];
  istilahKunci: Array<{ istilah: string; artiSingkat: string }>;
  rumusAtauAturan?: string[];
  langkahProsedur?: string[];
  karakteristikCiri?: string[];
  contohRelevan: string[];
  perbedaanKonsep?: string[];
  kesalahanUmum: string[];
  kataKunciMemori: string[];
}

export interface InfografisCard {
  id: string;
  judul: string;
  ikon: string; // e.g. '📌', '🎯', '⚡', '💡', '⚠️', '🔍', '🔄', '⚖️'
  warnaCard: 'teal' | 'emerald' | 'amber' | 'sky' | 'rose' | 'purple' | 'indigo';
  tipeKonten: 'poin' | 'langkah' | 'rumus_aturan' | 'perbandingan' | 'istilah' | 'siklus_alur' | 'tips_peringatan';
  poinList?: string[];
  langkahList?: Array<{ nomor: number | string; judul: string; deskripsi: string }>;
  itemPerbandingan?: Array<{ judulA: string; deskripsiA: string; judulB: string; deskripsiB: string }>;
  istilahList?: Array<{ kata: string; definisi: string }>;
  highlightText?: string;
  tag?: string;
}

export interface InfografisMateriData {
  identitas: {
    judulInfografis: string;
    subjudul: string;
    mataPelajaran: string;
    kelasFase: string;
    topikMateri: string;
    formatTerpilih: string;
    alasanFormat: string;
    kataMutiara: string;
  };
  analisisMateri: AnalisisMateri;
  kartuInfografis: InfografisCard[];
  takeawayKunci: string[];
  tagarMemori: string[];
}

export interface FormatInfografisInfo {
  id: string;
  nomor: number;
  nama: string;
  deskripsi: string;
  cocokUntuk: string;
  ikon: string;
}

export const DAFTAR_30_FORMAT_INFOGRAFIS: FormatInfografisInfo[] = [
  { id: 'cheatsheet', nomor: 1, nama: 'CHEATSHEET', deskripsi: 'Materi dengan banyak konsep, rumus, aturan, istilah, atau fakta penting.', cocokUntuk: 'Rumus, aturan cepat, ringkasan ujian', ikon: '📑' },
  { id: 'sticky-notes', nomor: 2, nama: 'STICKY NOTES', deskripsi: 'Kumpulan catatan singkat dalam beberapa kartu warna-warni.', cocokUntuk: 'Catatan poin-poin cepat, tips harian', ikon: '📝' },
  { id: 'mind-map', nomor: 3, nama: 'MIND MAP', deskripsi: 'Konsep utama di tengah dengan cabang-cabang konsep pendukung.', cocokUntuk: 'Konsep bercabang, klasifikasi luas', ikon: '🧠' },
  { id: 'concept-map', nomor: 4, nama: 'CONCEPT MAP', deskripsi: 'Hubungan sebab-akibat antar konsep secara sistematis.', cocokUntuk: 'Keterkaitan sistem, teori sains', ikon: '🗺️' },
  { id: 'flowchart', nomor: 5, nama: 'FLOWCHART', deskripsi: 'Proses, prosedur, algoritma, atau langkah penyelesaian berarah.', cocokUntuk: 'Prosedur penanganan, alur algoritma', ikon: '🔀' },
  { id: 'timeline', nomor: 6, nama: 'TIMELINE', deskripsi: 'Sejarah, perkembangan, urutan peristiwa, atau tahapan waktu.', cocokUntuk: 'Sejarah olahraga, kronologi peristiwa', ikon: '⏳' },
  { id: 'pyramid-infographic', nomor: 7, nama: 'PYRAMID INFOGRAPHIC', deskripsi: 'Tingkatan, hierarki, prioritas, atau klasifikasi dari dasar.', cocokUntuk: 'Piramida kebugaran, hierarki kebutuhan', ikon: '🔺' },
  { id: 'funnel-infographic', nomor: 8, nama: 'FUNNEL INFOGRAPHIC', deskripsi: 'Proses dari umum menuju lebih khusus dan terfokus.', cocokUntuk: 'Penyaringan konsep, proses seleksi', ikon: '🔻' },
  { id: 'comparison-card', nomor: 9, nama: 'COMPARISON CARD', deskripsi: 'Membandingkan dua atau lebih konsep/teknik secara berdampingan.', cocokUntuk: 'Teknik A vs Teknik B, Benar vs Salah', ikon: '⚖️' },
  { id: 'table-infographic', nomor: 10, nama: 'TABLE INFOGRAPHIC', deskripsi: 'Klasifikasi, perbandingan, atau informasi terstruktur matriks.', cocokUntuk: 'Tabel data, kategori gerak, skor', ikon: '📊' },
  { id: 'step-by-step', nomor: 11, nama: 'STEP-BY-STEP GUIDE', deskripsi: 'Cara melakukan sesuatu secara bertahap dan teratur.', cocokUntuk: 'Langkah teknik gerak, prosedur latihan', ikon: '👣' },
  { id: 'process-diagram', nomor: 12, nama: 'PROCESS DIAGRAM', deskripsi: 'Alur runtut suatu proses bertransformasi.', cocokUntuk: 'Sistem kerja tubuh, aliran energi', ikon: '⚙️' },
  { id: 'cycle-diagram', nomor: 13, nama: 'CYCLE DIAGRAM', deskripsi: 'Proses yang berulang atau bersiklus tanpa henti.', cocokUntuk: 'Siklus latihan, rantai makanan, peredaran darah', ikon: '🔄' },
  { id: 'tree-diagram', nomor: 14, nama: 'TREE DIAGRAM', deskripsi: 'Klasifikasi, jenis, cabang konsep, atau hierarki akar pohon.', cocokUntuk: 'Cabang olahraga, taksonomi gerak', ikon: '🌳' },
  { id: 'roadmap', nomor: 15, nama: 'ROADMAP', deskripsi: 'Perjalanan atau tahapan pembelajaran dari pemula ke mahir.', cocokUntuk: 'Target kompetensi belajar, peta capaian', ikon: '🛣️' },
  { id: 'knowledge-cards', nomor: 16, nama: 'KNOWLEDGE CARDS', deskripsi: 'Informasi esensial dalam bentuk kartu-kartu ringkas terpisah.', cocokUntuk: 'Rangkuman modul per topik', ikon: '🗂️' },
  { id: 'flashcard-infographic', nomor: 17, nama: 'FLASHCARD INFOGRAPHIC', deskripsi: 'Konsep, pertanyaan kuis, dan jawaban singkat di baliknya.', cocokUntuk: 'Review cepat sebelum ulangan', ikon: '⚡' },
  { id: 'visual-notes', nomor: 18, nama: 'VISUAL NOTES', deskripsi: 'Kombinasi tulisan, ikon, simbol, panah, dan diagram sketsa.', cocokUntuk: 'Gaya belajar visual, catatan estetis', ikon: '🎨' },
  { id: 'one-page-summary', nomor: 19, nama: 'ONE-PAGE SUMMARY', deskripsi: 'Seluruh inti sari materi tuntas dipadatkan dalam 1 lembar.', cocokUntuk: 'Rangkuman akhir bab', ikon: '📄' },
  { id: 'poster-edukatif', nomor: 20, nama: 'POSTER EDUKATIF', deskripsi: 'Materi yang cepat dibaca, berdampak tinggi, dan siap dipajang.', cocokUntuk: 'Poster dinding kelas, kampanye hidup sehat', ikon: '🖼️' },
  { id: 'comic-summary', nomor: 21, nama: 'COMIC SUMMARY', deskripsi: 'Rangkuman materi melalui cerita bergambar dan dialog tokoh.', cocokUntuk: 'Siswa SD/SMP, pengenalan konsep fun', ikon: '💬' },
  { id: 'storyboard', nomor: 22, nama: 'STORYBOARD', deskripsi: 'Materi melalui rangkaian adegan kronologis visual.', cocokUntuk: 'Rangkaian gerak senam, simulasi taktik', ikon: '🎬' },
  { id: 'quiz-infographic', nomor: 23, nama: 'QUIZ INFOGRAPHIC', deskripsi: 'Rangkuman melalui pertanyaan tebak cepat dan solusi.', cocokUntuk: 'Asesmen mandiri, pemanasan materi', ikon: '❓' },
  { id: 'problem-solution', nomor: 24, nama: 'PROBLEM → SOLUTION', deskripsi: 'Masalah umum di lapangan, konsep kunci, dan solusinya.', cocokUntuk: 'Koreksi kesalahan gerak, studi kasus', ikon: '💡' },
  { id: 'before-after', nomor: 25, nama: 'BEFORE → AFTER', deskripsi: 'Perubahan atau perbandingan kondisi sebelum dan sesudah.', cocokUntuk: 'Hasil latihan fisik, perubahan stamina', ikon: '🌓' },
  { id: '5w-1h', nomor: 26, nama: '5W + 1H INFOGRAPHIC', deskripsi: 'Analisis menyeluruh: What, Who, When, Where, Why, How.', cocokUntuk: 'Kajian aturan olahraga, materi literasi', ikon: '🌐' },
  { id: 'pyramid-of-knowledge', nomor: 27, nama: 'PYRAMID OF KNOWLEDGE', deskripsi: 'Fondasi konsep dasar menuju konsep lanjutan tingkat tinggi.', cocokUntuk: 'Progresi kemampuan gerak dasar ke kompleks', ikon: '🧱' },
  { id: 'hub-and-spoke', nomor: 28, nama: 'HUB & SPOKE', deskripsi: 'Satu konsep inti di tengah dengan cabang satelit mengelilingi.', cocokUntuk: 'Komponen kebugaran jasmani', ikon: '🎯' },
  { id: 'periodic-modular', nomor: 29, nama: 'PERIODIC / MODULAR CARDS', deskripsi: 'Materi dalam modul-modul kecil terstruktur kotak tabel.', cocokUntuk: 'Klasifikasi sistematis, glosarium', ikon: '🧩' },
  { id: 'visual-dictionary', nomor: 30, nama: 'VISUAL DICTIONARY', deskripsi: 'Istilah teknis, ikon visual, ilustrasi, dan definisi singkat.', cocokUntuk: 'Glosarium istilah olahraga/sains', ikon: '📖' },
];

export function getFallbackInfografisMateriData(
  mapel: string = 'PJOK',
  kelasFase: string = 'Kelas V / Fase C',
  topik: string = 'Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola'
): InfografisMateriData {
  return {
    identitas: {
      judulInfografis: 'INFOGRAFIS: MASTER PASSING & TRAPPING BOLA',
      subjudul: 'Panduan Visual Gerak Dasar Menendang & Menghentikan Bola Sepak',
      mataPelajaran: mapel,
      kelasFase: kelasFase,
      topikMateri: topik,
      formatTerpilih: 'STEP-BY-STEP GUIDE + CHEATSHEET',
      alasanFormat:
        'Karakter materi gerak manipulatif sepak bola memerlukan visualisasi langkah gerak sekuensial (Step-by-Step) dikombinasikan dengan tips cepat (Cheatsheet) agar mudah diingat sebelum praktik lapangan.',
      kataMutiara:
        '✨ "Akurasi lahir dari ketenangan kaki tumpu, kerja sama tim lahir dari hati yang sportif!"',
    },
    analisisMateri: {
      konsepUtama:
        'Passing kaki bagian dalam adalah teknik operan mendatar paling stabil dan akurat karena memiliki bidang kontak sepatu yang paling luas.',
      submateriPenting: [
        'Posisi Kaki Tumpu di Samping Bola (10-15 cm)',
        'Titik Perkenaan Sepatu Sisi Dalam pada Titik Tengah Bola',
        'Teknik Meredam Momentum (Trapping)',
        'Gerak Lanjutan (Follow Through) untuk Menjaga Keseimbangan',
      ],
      istilahKunci: [
        { istilah: 'Kaki Tumpu', artiSingkat: 'Kaki non-dominan penahan berat tubuh yang mengarahkan sasaran.' },
        { istilah: 'Passing', artiSingkat: 'Mengoper bola kepada rekan satu tim dengan kecepatan terukur.' },
        { istilah: 'Trapping', artiSingkat: 'Menghentikan laju bola agar tenang dalam penguasaan diri.' },
        { istilah: 'Follow Through', artiSingkat: 'Gerakan ayunan lanjutan setelah kaki menyentuh bola.' },
      ],
      rumusAtauAturan: [
        'Kaki Tumpu = 10-15 cm di samping bola & ujung jari mengarah lurus ke target.',
        'Titik Kontak = Sisi dalam sepatu menyentuh titik tengah bola (agar tidak melambung).',
        'Kontrol Bola = Tarik kaki sedikit ke belakang saat bola menyentuh permukaan sepatu.',
      ],
      langkahProsedur: [
        'Langkah 1: Pendekatan (2-3 langkah mundur, pandangan fokus ke bola).',
        'Langkah 2: Tumpuan (kaki tumpu mendarat kokoh di samping bola, lutut fleksi).',
        'Langkah 3: Putar & Kunci (putar pergelangan kaki keluar, kunci engkel).',
        'Langkah 4: Sentuhan (ayunkan kaki menyapu titik tengah bola).',
        'Langkah 5: Lanjutan (ayunan kaki mengarah ke sasaran, mendarat seimbang).',
      ],
      karakteristikCiri: [
        'Laju bola mendatar menyusur rumput.',
        'Arah bola lurus presisi ke kaki rekan.',
        'Tenaga terukur dan tidak memantul liar.',
      ],
      contohRelevan: [
        'Operan pendek 4 meter berpasangan di sela-sela rintangan cone.',
        'Operan cepat dua sentuhan (satu sentuhan kontrol, satu sentuhan oper).',
      ],
      perbedaanKonsep: [
        'Kaki Bagian Dalam: Permukaan luas, sangat akurat, cocok untuk jarak pendek-menengah.',
        'Punggung Kaki (Kura-kura): Permukaan keras, laju kencang, cocok untuk tembakan (shooting).',
        'Ujung Jari Sepatu (Cocor): Permukaan runcing, arah tidak menentu, rawan cedera jari.',
      ],
      kesalahanUmum: [
        '❌ Kaki tumpu terlalu jauh di belakang bola -> Bola melambung liar ke atas.',
        '❌ Engkel kaki penendang kendor -> Bola melenceng dan tidak bertenaga.',
        '❌ Badan condong ke belakang saat menendang -> Hilang keseimbangan.',
        '❌ Menahan bola dengan kaki kaku -> Bola memantul jauh dari jangkauan.',
      ],
      kataKunciMemori: ['TUMPU', 'KUNCI', 'TENGAH', 'REDAM', 'LANJUT'],
    },
    kartuInfografis: [
      {
        id: 'card-1',
        judul: 'Prinsip Kunci Kaki Tumpu (Kompas Arah)',
        ikon: '🧭',
        warnaCard: 'teal',
        tipeKonten: 'poin',
        tag: 'FONDASI UTAMA',
        highlightText: 'Kaki tumpu adalah kompas penentu 80% akurasi operanmu!',
        poinList: [
          'Letakkan kaki tumpu 10–15 cm tepat di samping bola.',
          'Ujung jari kaki tumpu WAJIB menghadap lurus ke arah kawan sasaran.',
          'Tekuk sedikit lutut kaki tumpu agar titik berat badan kokoh dan seimbang.',
        ],
      },
      {
        id: 'card-2',
        judul: '5 Langkah Jurus Passing Presisi',
        ikon: '👣',
        warnaCard: 'emerald',
        tipeKonten: 'langkah',
        tag: 'PROSEDUR GERAK',
        langkahList: [
          { nomor: 1, judul: 'Ancang-Ancang', deskripsi: 'Mundur 2 langkah, pandangan rileks ke bola dan kawan.' },
          { nomor: 2, judul: 'Pasang Tumpuan', deskripsi: 'Pijakkan kaki tumpu di samping bola dengan lutut lentur.' },
          { nomor: 3, judul: 'Kunci Engkel', deskripsi: 'Buka kaki ayun ke luar dan kunci pergelangan kaki kuat.' },
          { nomor: 4, judul: 'Sentuh Titik Tengah', deskripsi: 'Ayunkan kaki mengenai tepat di tengah equator bola.' },
          { nomor: 5, judul: 'Follow Through', deskripsi: 'Biarkan kaki terus mengayun lurus ke arah operan.' },
        ],
      },
      {
        id: 'card-3',
        judul: 'Bedah Teknik: Mengapa Kaki Dalam Juara?',
        ikon: '⚖️',
        warnaCard: 'sky',
        tipeKonten: 'perbandingan',
        tag: 'PERBANDINGAN VISUAL',
        itemPerbandingan: [
          {
            judulA: 'Kaki Bagian Dalam (Direkomendasikan)',
            deskripsiA: 'Bidang kontak lebar & rata. Menghasilkan operan datar, mulus, dan mudah diterima kawan.',
            judulB: 'Ujung Sepatu / Cocor (Hindari)',
            deskripsiB: 'Bidang sentuh runcing & licin. Arah bola sulit ditebak, mudah meleset, dan berisiko cedera jari kaki.',
          },
        ],
      },
      {
        id: 'card-4',
        judul: 'Teknik Trapping (Meredam Bola Seperti Bantal)',
        ikon: '🛡️',
        warnaCard: 'indigo',
        tipeKonten: 'poin',
        tag: 'KONTROL BOLA',
        highlightText: 'Jangan menabrak bola! Sambut dan tarik kaki ke belakang.',
        poinList: [
          'Songsong bola yang datang dengan kaki bagian dalam.',
          'Tarik sedikit kaki ke belakang saat bola menyentuh sepatu untuk meredam momentum (hukum impuls).',
          'Bola akan berhenti jinak dalam radius 30 cm dari kakimu siap dioper kembali.',
        ],
      },
      {
        id: 'card-5',
        judul: 'Awas! 4 Kesalahan Umum yang Sering Terjadi',
        ikon: '⚠️',
        warnaCard: 'rose',
        tipeKonten: 'tips_peringatan',
        tag: 'TROUBLESHOOTING',
        poinList: [
          'Bola Melambung Tinggi? -> Kaki tumpu terlalu mundur atau tubuh condong ke belakang.',
          'Operan Melenceng ke Kanan/Kiri? -> Ujung kaki tumpu tidak tegak lurus mengarah ke kawan.',
          'Tendangan Lemah & Bergulir Lambat? -> Engkel kaki penendang kendor atau sentuhan di pinggir bola.',
          'Bola Memantul Jauh saat Dikontrol? -> Kaki menahan terlalu kaku (seperti dinding beton).',
        ],
      },
      {
        id: 'card-6',
        judul: 'Glosarium Kilat & Kata Kunci Memori',
        ikon: '📖',
        warnaCard: 'amber',
        tipeKonten: 'istilah',
        tag: 'KATA KUNCI CEPAT',
        istilahList: [
          { kata: 'TUMPU', definisi: '10-15 cm di samping bola mengarah lurus ke sasaran.' },
          { kata: 'KUNCI', definisi: 'Kunci sendi pergelangan kaki ke arah luar.' },
          { kata: 'TENGAH', definisi: 'Sentuh tepat di titik tengah bola agar meluncur datar.' },
          { kata: 'REDAM', definisi: 'Tarik kaki ke belakang seperti spons saat menerima bola.' },
        ],
      },
    ],
    takeawayKunci: [
      'Akurasi operan ditentukan oleh penempatan kaki tumpu, bukan seberapa keras kamu menendang.',
      'Kunci pergelangan kaki ke luar untuk memastikan bola menyusur tanah secara datar.',
      'Sambut dan redam bola saat trapping agar bola tetap jinak dalam kendali tubuh.',
      'Komunikasi ramah dan sikap saling mendukung adalah ruh dari kerja sama tim sepak bola.',
    ],
    tagarMemori: ['#PassingKakiDalam', '#AkurasiPassing', '#KakiTumpuKompas', '#TrappingEmpuk', '#SportifPJOK'],
  };
}
