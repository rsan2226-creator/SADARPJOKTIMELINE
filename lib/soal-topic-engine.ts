import type {
  KisiKisiItem,
  KomposisiSoalConfig,
  OpsiPgCount,
  SoalIsianSingkat,
  SoalMenjodohkan,
  SoalPgKompleks,
  SoalPilihanGanda,
  SoalUraian,
} from './asesmen-sumatif-types';

interface PgTemplate {
  stimulus?: string;
  deskripsiGambar?: string;
  pertanyaan: string;
  pilihan: { A: string; B: string; C: string; D: string; E: string };
  kunci: 'A' | 'B' | 'C' | 'D' | 'E';
  levelBloom: string;
  ruangLingkup: string;
}

interface PgkTemplate {
  stimulus?: string;
  pertanyaan: string;
  pilihan: Array<{ kode: string; teks: string; isBenar: boolean }>;
  kunci: string;
  levelBloom: string;
  ruangLingkup: string;
}

interface MatchTemplate {
  premisKiri: string;
  responsKanan: string;
  ruangLingkup: string;
}

interface ShortTemplate {
  stimulus?: string;
  pertanyaan: string;
  kunci: string;
  levelBloom: string;
  ruangLingkup: string;
}

interface EssayTemplate {
  stimulus?: string;
  deskripsiGambar?: string;
  pertanyaan: string;
  rubrikDanKunci: string;
  levelBloom: string;
  ruangLingkup: string;
}

interface TopicBank {
  id: string;
  title: string;
  keywords: string[];
  pg: PgTemplate[];
  pgKompleks: PgkTemplate[];
  menjodohkan: MatchTemplate[];
  isianSingkat: ShortTemplate[];
  uraian: EssayTemplate[];
}

const TOPIC_BANKS: TopicBank[] = [
  {
    id: 'sepak_bola',
    title: 'Permainan Sepak Bola',
    keywords: ['sepak bola', 'sepakbola', 'kaki bagian dalam', 'dribbling', 'kicking', 'trapping', 'menendang', 'kiper', 'penalti', 'invasi', 'futsal'],
    pg: [
      {
        stimulus: 'Akurasi operan mendatar dalam permainan sepak bola sangat dipengaruhi posisi kaki tumpu sebelum kaki ayun mengenai bola.',
        pertanyaan: 'Posisi kaki tumpu yang benar saat melakukan gerak spesifik menendang bola menggunakan kaki bagian dalam adalah...',
        pilihan: {
          A: 'Di samping bola berjarak 10–15 cm dengan ujung kaki menghadap ke sasaran',
          B: 'Di belakang bola sejauh 40 cm dengan badan condong ke belakang',
          C: 'Di depan bola agar dapat menghalangi pergerakan lawan',
          D: 'Di atas permukaan bola sambil menginjaknya kuat',
          E: 'Menyilang di belakang kaki penendang secara kaku',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Teknik Dasar Sepak Bola',
      },
      {
        deskripsiGambar: 'Bagan sudut perkenaan kaki: Kaki bagian dalam menyentuh tepat di titik tengah bola sepak.',
        pertanyaan: 'Jika pemain menendang tepat pada titik tengah bola dengan pergelangan kaki dikunci ke luar, maka arah jalannya bola akan...',
        pilihan: {
          A: 'Melambung tinggi melewati kepala pemain bertahan',
          B: 'Meluncur mendatar menyusur tanah secara stabil dan akurat',
          C: 'Berputar tajam keluar garis samping lapangan',
          D: 'Berhenti mendadak di titik awal tanpa bergeser',
          E: 'Memantul liar ke arah belakang penendang',
        },
        kunci: 'B',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Operan Mendatar Sepak Bola',
      },
      {
        pertanyaan: 'Mengapa menendang bola menggunakan ujung jari kaki kurang dianjurkan saat melakukan operan jarak pendek kepada rekan satu tim?',
        pilihan: {
          A: 'Menghasilkan laju bola yang terlalu lambat',
          B: 'Bidang perkenaannya sempit sehingga arah bola sulit dikontrol dan berisiko cedera jari',
          C: 'Dilarang dalam seluruh kompetisi sepak bola resmi',
          D: 'Bola selalu berbalik ke belakang penendang',
          E: 'Membutuhkan kekuatan otot lengan yang berlebih',
        },
        kunci: 'B',
        levelBloom: 'C4 (Menganalisis)',
        ruangLingkup: 'Analisis Teknik Mengoper',
      },
      {
        stimulus: 'Menghentikan bola (trapping) bertujuan menguasai bola agar tidak memantul jauh dan mudah direbut lawan.',
        pertanyaan: 'Prinsip utama saat menghentikan bola mendatar menggunakan telapak atau kaki bagian dalam adalah...',
        pilihan: {
          A: 'Menahan bola dengan sendi kaki yang dikunci sekaku mungkin',
          B: 'Menarik sedikit kaki ke belakang saat menyentuh bola untuk meredam momentum',
          C: 'Menendang balik bola sekeras mungkin sebelum berhenti',
          D: 'Melompat ke udara sambil membelakangi arah datangnya bola',
          E: 'Membiarkan bola melewati kedua kaki tanpa kontrol',
        },
        kunci: 'B',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Kontrol Bola (Trapping)',
      },
      {
        pertanyaan: 'Gerakan lanjutan kaki setelah menendang bola (follow through) berfungsi untuk...',
        pilihan: {
          A: 'Mengelabui wasit agar tidak meniup peluit',
          B: 'Menyempurnakan arah bola dan menjaga keseimbangan tubuh agar tidak cedera',
          C: 'Menghentikan jalannya pertandingan sementara',
          D: 'Mengurangi jarak tembakan ke arah gawang',
          E: 'Memancing pelanggaran pemain bertahan lawan',
        },
        kunci: 'B',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Mekanika Gerak Menendang',
      },
      {
        pertanyaan: 'Teknik menggiring bola (dribbling) menggunakan punggung kaki biasanya diterapkan ketika pemain ingin...',
        pilihan: {
          A: 'Menghentikan bola mendadak di depan garis gawang',
          B: 'Mengoper bola pelan ke teman yang berdiri di samping',
          C: 'Melakukan lemparan ke dalam dari garis samping',
          D: 'Mendorong bola ke depan dengan cepat menembus ruang terbuka',
          E: 'Menjaga bola tetap diam di titik tengah lapangan',
        },
        kunci: 'D',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Menggiring Bola (Dribbling)',
      },
    ],
    pgKompleks: [
      {
        stimulus: 'Perhatikan teknik menghentikan bola (trapping) mendatar dalam permainan sepak bola.',
        pertanyaan: 'Pilihlah tindakan yang TEPAT dilakukan agar bola tidak memantul jauh dari kaki!',
        pilihan: [
          { kode: 'A', teks: 'Fokus mengarahkan pandangan ke arah datangnya bola.', isBenar: true },
          { kode: 'B', teks: 'Menegangkan sendi pergelangan kaki sekaku dinding.', isBenar: false },
          { kode: 'C', teks: 'Menarik sedikit kaki ke belakang saat detik sentuhan pertama.', isBenar: true },
          { kode: 'D', teks: 'Menggunakan kaki bagian dalam atau telapak kaki secara terkontrol.', isBenar: true },
          { kode: 'E', teks: 'Memalingkan badan membelakangi bola sebelum disentuh.', isBenar: false },
        ],
        kunci: 'A, C, dan D',
        levelBloom: 'C4 (Menganalisis)',
        ruangLingkup: 'Teknik Kontrol Bola',
      },
    ],
    menjodohkan: [
      { premisKiri: 'Kaki bagian dalam (Sepak Bola)', responsKanan: 'Menghasilkan operan pendek mendatar yang stabil dan akurat', ruangLingkup: 'Sepak Bola' },
      { premisKiri: 'Punggung kaki (Instep)', responsKanan: 'Digunakan untuk tendangan keras ke arah gawang', ruangLingkup: 'Sepak Bola' },
    ],
    isianSingkat: [
      {
        stimulus: 'Saat menendang bola, satu kaki diletakkan 15 cm di samping bola untuk menahan keseimbangan tubuh.',
        pertanyaan: 'Kaki yang berfungsi sebagai poros penahan keseimbangan tersebut dinamakan kaki...',
        kunci: 'Kaki tumpu',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Sepak Bola',
      },
    ],
    uraian: [
      {
        stimulus: 'Dalam pertandingan sepak bola sekolah, beberapa pemain sering melakukan operan asal-asalan dan saling menyalahkan saat kehilangan bola.',
        pertanyaan: 'Analisislah 3 langkah perbaikan teknik operan dasar dan sikap kerja sama tim yang harus dilakukan agar permainan menjadi efektif dan sportif!',
        rubrikDanKunci: '1) Menempatkan kaki tumpu 10-15 cm di samping bola dan mengoper dengan kaki bagian dalam; 2) Melakukan komunikasi positif tanpa menyalahkan rekan; 3) Bergerak membuka ruang setelah mengoper bola.',
        levelBloom: 'C5 (Mengevaluasi)',
        ruangLingkup: 'Evaluasi Permainan Sepak Bola',
      },
    ],
  },
  {
    id: 'bola_voli',
    title: 'Permainan Bola Voli',
    keywords: ['voli', 'bola voli', 'volleyball', 'passing bawah', 'passing atas', 'servis', 'smash', 'spike', 'tosser', 'block'],
    pg: [
      {
        pertanyaan: 'Perkenaan bola yang paling ideal saat melakukan teknik passing bawah pada permainan bola voli adalah pada...',
        pilihan: {
          A: 'Lengan bawah di atas pergelangan tangan hingga mendekati pertengahan lengan',
          B: 'Ujung jari-jari kedua telapak tangan yang direnggangkan',
          C: 'Siku tangan yang ditekuk membentuk sudut sempit',
          D: 'Bahu atas dekat persendian leher',
          E: 'Punggung telapak tangan bagian luar secara terpisah',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Passing Bawah Bola Voli',
      },
      {
        pertanyaan: 'Saat melakukan servis bawah bola voli, posisi lambungan bola yang tepat sebelum dipukul adalah...',
        pilihan: {
          A: 'Setinggi 3 meter di atas net lawan',
          B: 'Di belakang kepala pemain servis',
          C: 'Di depan badan setinggi pinggang hingga dada',
          D: 'Menyentuh lantai lapangan terlebih dahulu',
          E: 'Jauh di samping telinga kiri',
        },
        kunci: 'C',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Servis Bawah Bola Voli',
      },
      {
        pertanyaan: 'Jika pemain melakukan passing bawah dengan kedua siku ditekuk, maka akibat yang terjadi pada arah pantulan bola adalah...',
        pilihan: {
          A: 'Meluncur lurus sempurna ke arah pengumpan',
          B: 'Memantul liar ke belakang atau menyamping tidak terkendali',
          C: 'Berhenti menempel di permukaan lengan',
          D: 'Langsung menghasilkan poin ganda bagi tim',
          E: 'Melaju sangat pelan tepat di atas net',
        },
        kunci: 'B',
        levelBloom: 'C4 (Menganalisis)',
        ruangLingkup: 'Analisis Kesalahan Passing Voli',
      },
      {
        pertanyaan: 'Gerak dasar passing atas dalam permainan bola voli paling tepat digunakan oleh seorang pengumpan (tosser) dengan perkenaan pada...',
        pilihan: {
          A: 'Ruas-ruas jari tangan yang lentur membentuk mangkuk',
          B: 'Telapak tangan penuh dengan suara tepukan keras',
          C: 'Kepalan tangan tertutup rapat',
          D: 'Pergelangan tangan bagian luar',
          E: 'Lengan atas dekat bahu',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Passing Atas Bola Voli',
      },
    ],
    pgKompleks: [
      {
        pertanyaan: 'Pilihlah pernyataan yang BENAR mengenai posisi tubuh dan lengan saat melakukan passing bawah bola voli!',
        pilihan: [
          { kode: 'A', teks: 'Kedua ibu jari sejajar mengunci kedua telapak tangan.', isBenar: true },
          { kode: 'B', teks: 'Kedua siku dibengkokkan saat menyentuh bola.', isBenar: false },
          { kode: 'C', teks: 'Lutut sedikit ditekuk dalam posisi kuda-kuda seimbang.', isBenar: true },
          { kode: 'D', teks: 'Ayunan lengan digerakkan dari sendi bahu secara serempak.', isBenar: true },
          { kode: 'E', teks: 'Perkenaan bola tepat mengenai ujung kuku jari.', isBenar: false },
        ],
        kunci: 'A, C, dan D',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Passing Bawah Bola Voli',
      },
    ],
    menjodohkan: [
      { premisKiri: 'Passing bawah (Bola Voli)', responsKanan: 'Menerima bola servis atau serangan rendah dari lawan', ruangLingkup: 'Bola Voli' },
      { premisKiri: 'Passing atas (Bola Voli)', responsKanan: 'Menyajikan umpan melambung bagi penyerang (smasher)', ruangLingkup: 'Bola Voli' },
    ],
    isianSingkat: [
      {
        pertanyaan: 'Jumlah maksimal sentuhan bola oleh satu tim dalam permainan bola voli sebelum bola wajib diseberangkan melewati net adalah...',
        kunci: '3 kali sentuhan',
        levelBloom: 'C1 (Mengingat)',
        ruangLingkup: 'Peraturan Bola Voli',
      },
    ],
    uraian: [
      {
        stimulus: 'Sebuah tim bola voli sering gagal membangun serangan karena hasil passing bawah pertama selalu mengarah keluar lapangan.',
        pertanyaan: 'Jelaskan 3 langkah koreksi teknik passing bawah yang harus diperbaiki oleh pemain tersebut agar bola terarah baik kepada pengumpan!',
        rubrikDanKunci: '1) Meluruskan dan mengunci kedua sendi siku saat perkenaan bola; 2) Memastikan bola mengenai lengan bawah di atas pergelangan tangan; 3) Mengatur sudut kemiringan lengan dan dorongan lutut ke arah sasaran.',
        levelBloom: 'C4 (Menganalisis)',
        ruangLingkup: 'Koreksi Teknik Bola Voli',
      },
    ],
  },
  {
    id: 'renang',
    title: 'Renang & Keselamatan Air',
    keywords: ['renang', 'akuatik', 'kolam', 'gaya bebas', 'gaya dada', 'gaya punggung', 'kupu-kupu', 'meluncur', 'pernapasan air', 'tenggelam', 'keselamatan air'],
    pg: [
      {
        stimulus: 'Gerakan meluncur merupakan kemampuan awal yang wajib dikuasai sebelum mempelajari teknik gaya renang.',
        pertanyaan: 'Posisi tubuh yang benar saat melakukan gerak meluncur di permukaan air adalah...',
        pilihan: {
          A: 'Tubuh lurus sejajar permukaan air (streamline) dengan kedua lengan dijulurkan ke depan',
          B: 'Kepala diangkat tegak di atas air dengan lutut ditekuk dalam',
          C: 'Kedua tangan direntangkan ke samping seperti posisi terbang',
          D: 'Tubuh dalam posisi duduk tegak di dasar kolam dangkal',
          E: 'Punggung membungkuk dengan dagu menempel di dada bawah air',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Gerak Dasar Meluncur',
      },
      {
        pertanyaan: 'Pada renang gaya bebas (front crawl), gerakan kedua tungkai kaki yang benar berasal dari...',
        pilihan: {
          A: 'Pangkal paha dengan gerakan naik-turun secara bergantian dan lutut tidak ditekuk berlebihan',
          B: 'Sendi lutut yang ditekuk hingga 90 derajat sambil menendang kuat ke samping',
          C: 'Putaran kedua pergelangan kaki secara bersamaan seperti katak',
          D: 'Gerakan menendang menyamping ke arah kiri dan kanan secara lambat',
          E: 'Diam tidak bergerak agar menghemat tenaga selama berenang',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Gerak Tungkai Renang Gaya Bebas',
      },
      {
        pertanyaan: 'Cara mengambil napas yang tepat saat berenang gaya bebas adalah dengan...',
        pilihan: {
          A: 'Memiringkan kepala ke satu sisi saat lengan melakukan fase tarikan/pemulihan lalu membuang napas di dalam air',
          B: 'Mengangkat kepala lurus tinggi ke depan setiap kali mengayunkan tangan',
          C: 'Menahan napas sekuat mungkin dari awal start hingga menyentuh dinding finish',
          D: 'Menghirup udara melalui hidung ketika wajah masih terendam di dalam air',
          E: 'Berhenti berdiri di tengah kolam setiap dua kali kayuhan lengan',
        },
        kunci: 'A',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Teknik Pernapasan Gaya Bebas',
      },
      {
        pertanyaan: 'Renang gaya dada sering disebut juga gaya katak karena pola gerakan lengan dan kakinya menyerupai katak yang berenang. Gerakan kaki pada renang gaya dada dilakukan dengan urutan...',
        pilihan: {
          A: 'Menarik tumit ke arah pinggul, memutar telapak kaki keluar, mendorong/menendang ke belakang lalu merapatkan kaki lurus',
          B: 'Mengayunkan kedua kaki lurus naik-turun bergantian seperti menggunting air',
          C: 'Menggerakkan kedua kaki secara bersamaan ke atas dan ke bawah seperti ekor lumba-lumba',
          D: 'Melompat-lompat kecil di dasar kolam sambil berjalan maju',
          E: 'Menyilangkan kedua kaki di depan dada tanpa dorongan air',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Gerak Kaki Renang Gaya Dada',
      },
      {
        stimulus: 'Kecelakaan di kolam renang sering terjadi akibat siswa mengabaikan aturan keselamatan dan pemanasan sebelum masuk ke air.',
        pertanyaan: 'Tindakan pencegahan paling utama untuk menghindari kram otot dan bahaya tenggelam sebelum berenang adalah...',
        pilihan: {
          A: 'Melakukan pemanasan dan peregangan otot, menyesuaikan diri dengan suhu air, serta berenang di kolam sesuai kemampuan',
          B: 'Langsung melompat ke kolam terdalam setelah makan makanan berat',
          C: 'Bercanda saling mendorong teman di tepi kolam yang licin',
          D: 'Berlari cepat mengelilingi bibir kolam yang tergenang air',
          E: 'Berenang sendirian di area dalam tanpa pengawasan guru atau penjaga kolam',
        },
        kunci: 'A',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Keselamatan di Kolam Renang',
      },
      {
        pertanyaan: 'Jika melihat seorang teman mengalami kepanikan atau hampir tenggelam di kolam renang, tindakan pertolongan yang paling aman bagi penolong yang belum terlatih berenang penyelamatan adalah...',
        pilihan: {
          A: 'Menjulurkan galah, pelampung, atau tali dari tepi kolam serta segera memanggil petugas/guru',
          B: 'Langsung melompat memeluk korban dari arah depan di bagian air yang dalam',
          C: 'Menonton dari jauh sambil merekam kejadian tanpa memberi tahu siapa pun',
          D: 'Menunggu hingga korban tenggelam ke dasar kolam baru meminta bantuan',
          E: 'Melempar benda keras ke arah kepala korban',
        },
        kunci: 'A',
        levelBloom: 'C4 (Menganalisis)',
        ruangLingkup: 'Penyelamatan Kecelakaan Air',
      },
    ],
    pgKompleks: [
      {
        stimulus: 'Kegiatan pembelajaran akuatik di kolam renang memerlukan disiplin tinggi demi menjaga keselamatan seluruh peserta didik.',
        pertanyaan: 'Pilihlah perilaku yang BENAR demi menjaga keselamatan diri dan orang lain di area kolam renang!',
        pilihan: [
          { kode: 'A', teks: 'Melakukan pemanasan dinamis dan statis sebelum masuk ke dalam kolam.', isBenar: true },
          { kode: 'B', teks: 'Berlari-lari dan saling mendorong teman di tepi kolam yang licin.', isBenar: false },
          { kode: 'C', teks: 'Memeriksa papan keterangan kedalaman kolam sebelum berenang.', isBenar: true },
          { kode: 'D', teks: 'Menggunakan pakaian renang yang sesuai dan tidak membahayakan gerak.', isBenar: true },
          { kode: 'E', teks: 'Melompat ke air dangkal dengan kepala terlebih dahulu.', isBenar: false },
        ],
        kunci: 'A, C, dan D',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Keselamatan Akuatik',
      },
    ],
    menjodohkan: [
      { premisKiri: 'Posisi Streamline (Meluncur)', responsKanan: 'Mengurangi hambatan air agar tubuh melaju lurus ke depan', ruangLingkup: 'Renang' },
      { premisKiri: 'Pernapasan Renang Gaya Bebas', responsKanan: 'Memiringkan kepala ke samping saat mengambil udara di permukaan', ruangLingkup: 'Renang' },
      { premisKiri: 'Pelampung / Ban Penyelamat', responsKanan: 'Alat bantu pertolongan pertama dari tepi kolam bagi perenang panik', ruangLingkup: 'Keselamatan Air' },
    ],
    isianSingkat: [
      {
        pertanyaan: 'Posisi tubuh lurus mendatar seperti anak panah saat memulai gerakan renang untuk memperkecil tahanan air disebut posisi...',
        kunci: 'Streamline',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Renang',
      },
      {
        pertanyaan: 'Pada renang gaya bebas, proses membuang napas (ekspirasi) dilakukan melalui mulut/hidung ketika wajah berada di...',
        kunci: 'Dalam air',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Pernapasan Renang',
      },
    ],
    uraian: [
      {
        stimulus: 'Dina baru belajar renang gaya bebas. Setiap kali ingin mengambil napas, Dina selalu mengangkat kepalanya lurus ke atas sehingga pinggul dan kakinya langsung tenggelam dan gerakannya terhenti.',
        pertanyaan: 'Analisislah penyebab masalah yang dialami Dina tersebut dan jelaskan 3 langkah perbaikan teknik pernapasan serta koordinasi tubuh yang benar!',
        rubrikDanKunci: 'Penyebab: mengangkat kepala ke atas merusak keseimbangan horizontal (streamline) sehingga bagian bawah tubuh turun. Perbaikan: 1) Memutar/memiringkan kepala ke satu sisi saja (satu telinga tetap dekat air); 2) Membuang udara perlahan di dalam air sebelum menoleh; 3) Menjaga ayunan kaki tetap konstan dari pangkal paha.',
        levelBloom: 'C4 (Menganalisis)',
        ruangLingkup: 'Analisis Teknik Renang Gaya Bebas',
      },
    ],
  },
  {
    id: 'atletik',
    title: 'Atletik (Lari, Lompat, Lempar)',
    keywords: ['atletik', 'sprint', 'lari cepat', 'lari jarak pendek', 'start jongkok', 'lompat jauh', 'tolak peluru', 'estafet', 'garis finish', 'gaya jongkok'],
    pg: [
      {
        pertanyaan: 'Jenis start yang wajib digunakan dalam perlombaan lari jarak pendek (sprint) 100 meter adalah...',
        pilihan: {
          A: 'Start jongkok (crouch start)',
          B: 'Start berdiri (standing start)',
          C: 'Start melayang (flying start)',
          D: 'Start duduk menghadap ke belakang',
          E: 'Start berjalan santai di lintasan',
        },
        kunci: 'A',
        levelBloom: 'C1 (Mengingat)',
        ruangLingkup: 'Lari Jarak Pendek (Sprint)',
      },
      {
        pertanyaan: 'Pada aba-aba "SIAP" dalam start jongkok lari jarak pendek, posisi tubuh pelari yang tepat adalah...',
        pilihan: {
          A: 'Mengangkat panggul lebih tinggi dari bahu dengan pandangan tetap mengarah ke depan lintasan bawah',
          B: 'Menurunkan kedua lutut hingga menempel penuh di tanah lintasan',
          C: 'Berdiri tegak sempurna sambil melambaikan tangan',
          D: 'Langsung berlari meninggalkan garis start sebelum bunyi pistol',
          E: 'Menoleh ke kanan dan kiri melihat posisi lawan',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Teknik Start Jongkok',
      },
      {
        pertanyaan: 'Urutan empat tahapan gerak yang benar pada lompat jauh gaya jongkok adalah...',
        pilihan: {
          A: 'Awalan lari – tolakan satu kaki – sikap melayang di udara – mendarat dengan kedua kaki',
          B: 'Berdiri diam – melompat dua kaki – berputar di udara – mendarat satu kaki',
          C: 'Berjalan mundur – tolakan dua tangan – berguling – berdiri tegak',
          D: 'Awalan lari – berhenti di papan tumpu – melangkah pelan ke bak pasir',
          E: 'Tolakan – awalan – mendarat – melayang di udara',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Lompat Jauh Gaya Jongkok',
      },
      {
        pertanyaan: 'Agar hasil lompatan dalam lompat jauh tidak dinyatakan batal (diskualifikasi) dan jarak ukur tetap maksimal, saat mendarat di bak pasir kedua kaki harus...',
        pilihan: {
          A: 'Mendarat bersamaan dengan lutut mengeper dan badan didorong ke depan',
          B: 'Menjatuhkan badan dan tangan ke arah belakang tepat di belakang bekas kaki',
          C: 'Melangkah mundur keluar dari bak pasir melalui area tumpuan',
          D: 'Mendarat dengan salah satu lutut lurus dan kaku',
          E: 'Menginjak melewati papan tolakan saat melakukan tolakan',
        },
        kunci: 'A',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Teknik Pendaratan Lompat Jauh',
      },
      {
        pertanyaan: 'Bagian tubuh yang menentukan seorang pelari jarak pendek telah menyentuh bidang vertikal garis finish adalah...',
        pilihan: {
          A: 'Dada atau bagian tubuh (torso) selain kepala dan lengan',
          B: 'Ujung jari tangan yang dijulurkan ke depan',
          C: 'Tumit kaki bagian belakang',
          D: 'Topi atau aksesori kepala yang terlepas',
          E: 'Bayangan tubuh pelari di atas garis',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Memasuki Garis Finish',
      },
    ],
    pgKompleks: [
      {
        pertanyaan: 'Pilihlah teknik yang BENAR saat melakukan tolakan dan melayang dalam lompat jauh gaya jongkok!',
        pilihan: [
          { kode: 'A', teks: 'Tolakan dilakukan menggunakan satu kaki terkuat tepat pada papan tumpuan.', isBenar: true },
          { kode: 'B', teks: 'Tolakan menggunakan dua kaki secara bersamaan di papan tumpuan.', isBenar: false },
          { kode: 'C', teks: 'Saat melayang, kedua lutut ditekuk ditarik ke arah dada menyerupai posisi jongkok.', isBenar: true },
          { kode: 'D', teks: 'Kecepatan awalan lari dijaga stabil hingga mencapai papan tumpuan.', isBenar: true },
          { kode: 'E', teks: 'Menginjak garis depan papan tolakan tidak dihitung sebagai pelanggaran.', isBenar: false },
        ],
        kunci: 'A, C, dan D',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Lompat Jauh',
      },
    ],
    menjodohkan: [
      { premisKiri: 'Start Jongkok', responsKanan: 'Digunakan pada nomor lari cepat 60 m, 100 m, dan 200 m', ruangLingkup: 'Atletik' },
      { premisKiri: 'Papan Tumpuan Lompat Jauh', responsKanan: 'Batas titik tolakan satu kaki terkuat sebelum melayang ke bak pasir', ruangLingkup: 'Atletik' },
      { premisKiri: 'Tongkat Estafet', responsKanan: 'Alat yang diserahkan antar pelari pada zona pergantian lari sambung', ruangLingkup: 'Atletik' },
    ],
    isianSingkat: [
      {
        pertanyaan: 'Pada perlombaan lari jarak pendek, aba-aba start jongkok terdiri atas tiga urutan yaitu bersedia, siap, dan...',
        kunci: 'Ya (atau bunyi peluit/pistol start)',
        levelBloom: 'C1 (Mengingat)',
        ruangLingkup: 'Lari Sprint',
      },
    ],
    uraian: [
      {
        stimulus: 'Riko melakukan lompat jauh dengan awalan yang sangat cepat, namun sesaat sebelum papan tumpuan ia memperlambat larinya dan saat mendarat tangannya bertumpu ke belakang di bak pasir.',
        pertanyaan: 'Identifikasilah dua kesalahan yang dilakukan Riko dan jelaskan dampaknya terhadap hasil jarak lompatan!',
        rubrikDanKunci: '1) Memperlambat lari sebelum papan tumpuan mengurangi momentum daya dorong ke depan saat tolakan; 2) Tangan menyentuh pasir di belakang kaki membuat pengukuran jarak diambil dari bekas tangan yang paling dekat dengan papan tumpuan sehingga jarak resmi berkurang jauh.',
        levelBloom: 'C4 (Menganalisis)',
        ruangLingkup: 'Evaluasi Lompat Jauh',
      },
    ],
  },
  {
    id: 'bola_basket',
    title: 'Permainan Bola Basket',
    keywords: ['basket', 'bola basket', 'chest pass', 'bounce pass', 'overhead pass', 'lay-up', 'lay up', 'dribble', 'pivot', 'rebound', 'fast break', 'zone defense', 'man to man'],
    pg: [
      {
        pertanyaan: 'Teknik mengoper bola basket setinggi dada menggunakan kedua tangan lurus ke arah rekan satu tim disebut...',
        pilihan: {
          A: 'Chest pass',
          B: 'Bounce pass',
          C: 'Overhead pass',
          D: 'Baseball pass',
          E: 'Behind the back pass',
        },
        kunci: 'A',
        levelBloom: 'C1 (Mengingat)',
        ruangLingkup: 'Teknik Operan Bola Basket',
      },
      {
        pertanyaan: 'Operan memantul (bounce pass) dalam permainan bola basket paling efektif diterapkan ketika...',
        pilihan: {
          A: 'Pemain bertahan lawan berdiri rapat di depan pengumpan dengan tangan terangkat tinggi',
          B: 'Ingin melakukan operan jarak sangat jauh melintasi seluruh lapangan',
          C: 'Tidak ada satu pun pemain lawan di area pertahanan',
          D: 'Melakukan tembakan tiga angka dari luar garis busur',
          E: 'Melakukan perebutan bola pantul (rebound) di bawah ring',
        },
        kunci: 'A',
        levelBloom: 'C4 (Menganalisis)',
        ruangLingkup: 'Taktik Operan Bola Basket',
      },
      {
        pertanyaan: 'Gerakan berputar ke segala arah dengan bertumpu pada satu kaki sebagai poros sambil memegang bola basket disebut...',
        pilihan: {
          A: 'Pivot',
          B: 'Lay-up shoot',
          C: 'Slam dunk',
          D: 'Screen',
          E: 'Traveling',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Gerak Pivot Bola Basket',
      },
      {
        pertanyaan: 'Pola pertahanan dalam permainan bola basket di mana setiap pemain bertahan bertanggung jawab menjaga satu pemain penyerang lawan tertentu disebut...',
        pilihan: {
          A: 'Man-to-man defense',
          B: 'Zone defense',
          C: 'Fast break offense',
          D: 'Set offense',
          E: 'Pick and roll',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Pola Pertahanan Bola Basket',
      },
    ],
    pgKompleks: [
      {
        pertanyaan: 'Pilihlah pernyataan yang BENAR mengenai teknik menggiring bola (dribbling) yang sah dalam bola basket!',
        pilihan: [
          { kode: 'A', teks: 'Memantulkan bola menggunakan dorongan jari-jari dan pergelangan tangan, bukan memukul dengan telapak.', isBenar: true },
          { kode: 'B', teks: 'Menggiring bola secara bersamaan dengan kedua tangan sekaligus.', isBenar: false },
          { kode: 'C', teks: 'Pandangan mata tetap diarahkan ke depan untuk melihat pergerakan rekan dan lawan.', isBenar: true },
          { kode: 'D', teks: 'Ketinggian pantulan bola dikontrol di kisaran pinggang agar mudah dilindungi.', isBenar: true },
          { kode: 'E', teks: 'Berlari membawa bola sebanyak 5 langkah tanpa memantulkannya ke lantai.', isBenar: false },
        ],
        kunci: 'A, C, dan D',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Dribbling Bola Basket',
      },
    ],
    menjodohkan: [
      { premisKiri: 'Chest Pass', responsKanan: 'Operan lurus dua tangan setinggi dada untuk jarak dekat-menengah', ruangLingkup: 'Bola Basket' },
      { premisKiri: 'Lay-Up Shoot', responsKanan: 'Tembakan melangkah dua langkah mendekati ring dan melepaskan bola dari jarak dekat', ruangLingkup: 'Bola Basket' },
      { premisKiri: 'Fast Break', responsKanan: 'Serangan kilat cepat sebelum pertahanan lawan sempat terbentuk', ruangLingkup: 'Taktik Bola Basket' },
    ],
    isianSingkat: [
      {
        pertanyaan: 'Pelanggaran dalam bola basket akibat pemain membawa bola berlari lebih dari dua langkah tanpa melakukan dribble disebut...',
        kunci: 'Traveling (Walking)',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Peraturan Bola Basket',
      },
    ],
    uraian: [
      {
        stimulus: 'Tim basket sekolah menghadapi lawan yang memiliki postur tubuh tinggi dan menerapkan pertahanan zona rapat di area bersyarat (paint area).',
        pertanyaan: 'Rancanglah strategi penyerangan dan jenis operan yang tepat untuk membongkar pertahanan zona lawan tersebut!',
        rubrikDanKunci: '1) Mempercepat sirkulasi bola di perimeter menggunakan chest pass dan overhead pass untuk menggeser formasi lawan; 2) Memanfaatkan tembakan jarak menengah/tiga angka agar bek keluar; 3) Menggunakan bounce pass dan backdoor cut ke celah kosong di dalam area pertahanan.',
        levelBloom: 'C5 (Mengevaluasi)',
        ruangLingkup: 'Taktik Penyerangan Bola Basket',
      },
    ],
  },
  {
    id: 'senam',
    title: 'Senam Lantai & Gerak Berirama',
    keywords: ['senam', 'matras', 'guling depan', 'guling belakang', 'forward roll', 'sikap lilin', 'kayang', 'meroda', 'senam irama', 'gerak berirama', 'ritmik'],
    pg: [
      {
        pertanyaan: 'Bagian tubuh yang pertama kali menyentuh matras setelah kedua telapak tangan saat melakukan gerak guling depan (forward roll) adalah...',
        pilihan: {
          A: 'Tengkuk / bahu bagian belakang dengan dagu dirapatkan ke dada',
          B: 'Puncak ubun-ubun kepala secara tegak lurus',
          C: 'Dahi bagian depan sebelum kedua tangan ditekuk',
          D: 'Punggung bagian bawah secara langsung',
          E: 'Kedua siku tangan secara bersamaan',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Senam Lantai Guling Depan',
      },
      {
        pertanyaan: 'Sikap awal dan posisi dagu yang harus diperhatikan agar guling depan berjalan bulat serta menghindari cedera leher adalah...',
        pilihan: {
          A: 'Menempelkan dagu ke arah dada sambil membulatkan punggung',
          B: 'Mendongakkan kepala tinggi ke atas melihat langit-langit',
          C: 'Menolehkan kepala ke samping kanan saat berguling',
          D: 'Meluruskan punggung sekaku papan lurus',
          E: 'Merentangkan kedua tangan ke belakang sebelum berguling',
        },
        kunci: 'A',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Keselamatan Senam Lantai',
      },
      {
        pertanyaan: 'Pada gerakan sikap lilin dalam senam lantai, bagian tubuh yang menjadi tumpuan berat badan di atas matras adalah...',
        pilihan: {
          A: 'Bahu atas, leher bagian belakang, dan kedua siku tangan yang menopang pinggang',
          B: 'Kedua telapak kaki yang diangkat ke atas',
          C: 'Puncak kepala dan dahi',
          D: 'Perut bagian depan',
          E: 'Kedua lutut yang ditekuk',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Sikap Lilin Senam Lantai',
      },
      {
        pertanyaan: 'Unsur utama yang membedakan aktivitas gerak berirama (senam irama) dengan senam lantai adalah...',
        pilihan: {
          A: 'Keselarasan gerak langkah kaki dan ayunan lengan mengikuti ketukan irama musik secara berkelanjutan',
          B: 'Kewajiban melakukan guling depan di atas matras tebal',
          C: 'Penggunaan alat pelindung kepala dan sarung tinju',
          D: 'Gerakan dilakukan secepat mungkin tanpa memperhatikan tempo',
          E: 'Hanya melibatkan gerakan diam di tempat tanpa perpindahan',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Aktivitas Gerak Berirama',
      },
    ],
    pgKompleks: [
      {
        pertanyaan: 'Pilihlah unsur-unsur penting yang dinilai dalam aktivitas senam irama (gerak berirama)!',
        pilihan: [
          { kode: 'A', teks: 'Ketepatan gerak dengan irama/ketukan musik.', isBenar: true },
          { kode: 'B', teks: 'Keluwesan dan kesinambungan rangkaian gerak (kontinuitas).', isBenar: true },
          { kode: 'C', teks: 'Kekakuan sendi dan berhentinya gerakan secara mendadak.', isBenar: false },
          { kode: 'D', teks: 'Kelenturan tubuh dan koordinasi langkah kaki serta ayunan lengan.', isBenar: true },
          { kode: 'E', teks: 'Mengabaikan kekompakan apabila dilakukan secara beregu.', isBenar: false },
        ],
        kunci: 'A, B, dan D',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Senam Irama',
      },
    ],
    menjodohkan: [
      { premisKiri: 'Guling Depan (Forward Roll)', responsKanan: 'Berguling ke depan membulat dengan tumpuan tengkuk di matras', ruangLingkup: 'Senam Lantai' },
      { premisKiri: 'Sikap Lilin', responsKanan: 'Mengangkat kedua tungkai lurus vertikal ke atas ditopang bahu dan tangan di pinggang', ruangLingkup: 'Senam Lantai' },
    ],
    isianSingkat: [
      {
        pertanyaan: 'Alas empuk berbahan busa tebal yang wajib digunakan untuk mencegah cedera saat mempraktikkan gerakan senam lantai disebut...',
        kunci: 'Matras',
        levelBloom: 'C1 (Mengingat)',
        ruangLingkup: 'Perlengkapan Senam',
      },
    ],
    uraian: [
      {
        pertanyaan: 'Jelaskan langkah-langkah melakukan guling depan (forward roll) dari sikap jongkok hingga kembali ke sikap jongkok dengan aman!',
        rubrikDanKunci: '1) Jongkok menghadap matras, kedua telapak tangan bertumpu selebar bahu; 2) Angkat panggul, rapatkan dagu ke dada, tekuk siku dan letakkan tengkuk di matras; 3) Dorong tubuh berguling ke depan membulat; 4) Peluk lutut saat mendarat dengan kaki dan kembali jongkok/berdiri seimbang.',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Prosedur Guling Depan',
      },
    ],
  },
  {
    id: 'kebugaran',
    title: 'Kebugaran Jasmani & TKJI',
    keywords: ['kebugaran', 'tkji', 'daya tahan', 'kelincahan', 'kekuatan', 'push-up', 'sit-up', 'shuttle run', 'denyut nadi', 'vo2max', 'kardiorespirasi', 'sirkuit', 'pemanasan', 'pendinginan'],
    pg: [
      {
        pertanyaan: 'Komponen kebugaran jasmani yang dominan dilatih saat melakukan lari bolak-balik (shuttle run) adalah...',
        pilihan: {
          A: 'Kelincahan (agility) dan kecepatan mengubah arah gerak',
          B: 'Keseimbangan statis berdiri satu kaki',
          C: 'Kelenturan tulang belakang saat duduk',
          D: 'Kekuatan otot jari tangan',
          E: 'Daya tahan diam tanpa bergerak',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Komponen Kebugaran Jasmani',
      },
      {
        stimulus: 'Andi mengukur denyut nadinya saat istirahat sebesar 68 bpm. Setelah berlari selama 15 menit, denyut nadinya naik menjadi 144 bpm.',
        pertanyaan: 'Secara fisiologis, kenaikan denyut nadi Andi selama aktivitas olahraga menunjukkan bahwa...',
        pilihan: {
          A: 'Jantung bekerja memompa darah lebih cepat guna menyuplai oksigen ke otot yang aktif',
          B: 'Jantung mengalami gangguan fungsi permanen',
          C: 'Otot kaki berhenti membutuhkan pasokan oksigen',
          D: 'Sirkulasi darah di seluruh tubuh sedang melambat',
          E: 'Paru-paru tidak mampu menghirup udara dari luar',
        },
        kunci: 'A',
        levelBloom: 'C4 (Menganalisis)',
        ruangLingkup: 'Fisiologi Denyut Nadi Latihan',
      },
      {
        pertanyaan: 'Latihan push-up selama 30 detik pada rangkaian Tes Kebugaran Jasmani Indonesia (TKJI) bertujuan mengukur kekuatan dan daya tahan otot...',
        pilihan: {
          A: 'Lengan, bahu, dan dada',
          B: 'Betis dan pergelangan kaki',
          C: 'Otot perut bagian bawah',
          D: 'Leher bagian belakang',
          E: 'Telapak kaki bagian dalam',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Tes Kebugaran Jasmani (TKJI)',
      },
      {
        pertanyaan: 'Kegiatan pendinginan (cooling down) setelah selesai berolahraga dilakukan dengan tujuan...',
        pilihan: {
          A: 'Mengembalikan denyut nadi dan suhu tubuh secara bertahap serta mengurangi penumpukan asam laktat otot',
          B: 'Memicu kelelahan mendadak pada persendian lutut',
          C: 'Menahan detak jantung agar tetap berada di batas maksimal',
          D: 'Menggantikan kebutuhan cairan tubuh tanpa minum air',
          E: 'Membuat otot menjadi kaku sebelum masuk kelas',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Pendinginan (Cooling Down)',
      },
    ],
    pgKompleks: [
      {
        pertanyaan: 'Pilihlah bentuk aktivitas yang efektif untuk meningkatkan daya tahan jantung dan paru-paru (kardiorespirasi)!',
        pilihan: [
          { kode: 'A', teks: 'Joging atau lari santai berkelanjutan minimal 12–20 menit.', isBenar: true },
          { kode: 'B', teks: 'Bersepeda santai dengan ritme stabil selama 25 menit.', isBenar: true },
          { kode: 'C', teks: 'Duduk diam bermain gawai selama 3 jam berturut-turut.', isBenar: false },
          { kode: 'D', teks: 'Berenang atau senam aerobik dengan intensitas sedang.', isBenar: true },
          { kode: 'E', teks: 'Berdiri statis selama 10 detik tanpa gerak tambahan.', isBenar: false },
        ],
        kunci: 'A, B, dan D',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Latihan Kardiorespirasi',
      },
    ],
    menjodohkan: [
      { premisKiri: 'Shuttle Run', responsKanan: 'Melatih kelincahan dan kecepatan mengubah arah lari', ruangLingkup: 'Kebugaran Jasmani' },
      { premisKiri: 'Sit-Up / Baring Duduk', responsKanan: 'Mengukur kekuatan dan daya tahan otot perut', ruangLingkup: 'Kebugaran Jasmani' },
      { premisKiri: 'Lari 600 m / 1000 m', responsKanan: 'Mengukur daya tahan aerobik jantung dan paru-paru', ruangLingkup: 'Kebugaran Jasmani' },
    ],
    isianSingkat: [
      {
        stimulus: 'Siti menghitung denyut nadinya pada pergelangan tangan selama 15 detik dan memperoleh 21 ketukan.',
        pertanyaan: 'Berapakah denyut nadi Siti dalam satuan satu menit (bpm)?',
        kunci: '84 bpm (21 × 4)',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Pengukuran Denyut Nadi',
      },
    ],
    uraian: [
      {
        stimulus: 'Seorang siswa cepat lelah saat pelajaran olahraga karena jarang beraktivitas fisik dan sering begadang bermain gawai.',
        pertanyaan: 'Susunlah program latihan kebugaran jasmani mingguan sederhana (minimal 3 jenis latihan beserta durasi dan frekuensi) agar kebugarannya meningkat!',
        rubrikDanKunci: 'Program memuat: 1) Frekuensi 3–4 kali/minggu (misal Senin, Rabu, Jumat); 2) Latihan aerobik (jalan cepat/joging 20–30 menit), kekuatan otot (push-up/sit-up/squat ringan 2–3 set), dan kelenturan; 3) Didukung tidur cukup 8 jam dan hidrasi air putih.',
        levelBloom: 'C6 (Mencipta)',
        ruangLingkup: 'Program Latihan Kebugaran',
      },
    ],
  },
  {
    id: 'kesehatan_p3k',
    title: 'Kesehatan, Gizi & Pencegahan Cedera',
    keywords: ['kesehatan', 'gizi', 'makanan sehat', 'cedera', 'p3k', 'rice', 'napza', 'rokok', 'kebersihan', 'pubertas', 'pertolongan pertama', 'olahraga aman'],
    pg: [
      {
        pertanyaan: 'Metode pertolongan pertama paling tepat untuk menangani cedera keseleo ringan (sprain) di lapangan olahraga dikenal dengan istilah RICE. Huruf "I" (Ice) pada prinsip RICE berarti...',
        pilihan: {
          A: 'Mengompres bagian cedera dengan es yang dibungkus kain selama 15–20 menit untuk mengurangi bengkak',
          B: 'Mengurut dan memijat bagian pergelangan yang keseleo sekuat tenaga',
          C: 'Mengoleskan balsem panas langsung sesaat setelah cedera terjadi',
          D: 'Memaksa atlet tetap berlari kencang agar otot kembali lentur',
          E: 'Merendam bagian yang bengkak ke dalam air mendidih',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Penanganan Cedera Metode RICE',
      },
      {
        pertanyaan: 'Menu makanan bergizi seimbang yang dianjurkan bagi peserta didik aktif berolahraga harus mengandung zat gizi makro dan mikro lengkap, yaitu...',
        pilihan: {
          A: 'Karbohidrat (nasi/ubi), protein (ikan/telur/tempe), sayur, buah kaya vitamin-mineral, serta air putih cukup',
          B: 'Minuman bersoda manis dan keripik tinggi garam setiap sore',
          C: 'Mi instan dua kali sehari tanpa tambahan sayur maupun lauk',
          D: 'Makanan cepat saji berlemak jenuh tinggi setiap jam istirahat',
          E: 'Permen gula buatan sebagai pengganti makan siang',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Gizi Seimbang Pelajar',
      },
      {
        pertanyaan: 'Mengapa konsumsi minuman berenergi berkafein tinggi atau merokok sangat berbahaya bagi peserta didik usia sekolah?',
        pilihan: {
          A: 'Merusak fungsi paru-paru, jantung, pembuluh darah, mengganggu pertumbuhan, dan menurunkan kebugaran',
          B: 'Mempercepat kenaikan tinggi badan secara alami',
          C: 'Meningkatkan daya tahan pernapasan saat lomba lari',
          D: 'Menjaga kesehatan gigi dan gusi agar selalu kuat',
          E: 'Menggantikan fungsi air mineral sebagai penghilang dahaga',
        },
        kunci: 'A',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Pencegahan Bahaya Rokok & Napza',
      },
    ],
    pgKompleks: [
      {
        pertanyaan: 'Pilihlah komponen tindakan yang TERMASUK dalam prinsip pertolongan pertama cedera olahraga R.I.C.E!',
        pilihan: [
          { kode: 'A', teks: 'Rest: Mengistirahatkan bagian tubuh yang mengalami cedera.', isBenar: true },
          { kode: 'B', teks: 'Ice: Mengompres area cedera menggunakan es terbungkus kain.', isBenar: true },
          { kode: 'C', teks: 'Massage Keras: Memijat paksa otot yang baru terkilir.', isBenar: false },
          { kode: 'D', teks: 'Compression & Elevation: Membalut elastis ringan dan meninggikan posisi bagian cedera.', isBenar: true },
          { kode: 'E', teks: 'Melanjutkan pertandingan penuh tanpa pemeriksaan.', isBenar: false },
        ],
        kunci: 'A, B, dan D',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'P3K Cedera Olahraga',
      },
    ],
    menjodohkan: [
      { premisKiri: 'Rest (Prinsip RICE)', responsKanan: 'Menghentikan aktivitas dan mengistirahatkan bagian tubuh cedera', ruangLingkup: 'P3K Olahraga' },
      { premisKiri: 'Elevation (Prinsip RICE)', responsKanan: 'Meninggikan posisi bagian cedera lebih tinggi dari jantung untuk kurangi bengkak', ruangLingkup: 'P3K Olahraga' },
    ],
    isianSingkat: [
      {
        pertanyaan: 'Zat gizi utama pada nasi, roti gandum, dan kentang yang berfungsi sebagai sumber energi utama saat berolahraga adalah...',
        kunci: 'Karbohidrat',
        levelBloom: 'C1 (Mengingat)',
        ruangLingkup: 'Gizi Olahraga',
      },
    ],
    uraian: [
      {
        pertanyaan: 'Saat bermain di lapangan, pergelangan kaki temanmu terkilir hingga sedikit membengkak. Jelaskan langkah pertolongan pertama dengan metode RICE secara berurutan!',
        rubrikDanKunci: '1) Rest: hentikan permainan, dudukkan/baringkan korban dengan tenang; 2) Ice: kompres dingin dengan es dibalut handuk 15 menit; 3) Compression: balut elastis tidak terlalu kencang; 4) Elevation: ganjal kaki lebih tinggi dari posisi dada dan lapor ke guru/UKS.',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Prosedur P3K RICE',
      },
    ],
  },
  {
    id: 'matematika',
    title: 'Matematika',
    keywords: ['matematika', 'pythagoras', 'bilangan', 'pecahan', 'aljabar', 'persamaan', 'perbandingan', 'bangun', 'luas', 'volume', 'sudut', 'statistika', 'peluang', 'geometri'],
    pg: [
      {
        pertanyaan: 'Hasil operasi hitung dari (-18) + 24 × 2 - (-6) adalah...',
        pilihan: {
          A: '36',
          B: '18',
          C: '24',
          D: '42',
          E: '-36',
        },
        kunci: 'A',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Operasi Bilangan Bulat',
      },
      {
        pertanyaan: 'Sebuah segitiga siku-siku memiliki panjang sisi penyiku masing-masing 6 cm dan 8 cm. Panjang sisi miring (hipotenusa) segitiga tersebut adalah...',
        pilihan: {
          A: '10 cm',
          B: '12 cm',
          C: '14 cm',
          D: '16 cm',
          E: '20 cm',
        },
        kunci: 'A',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Teorema Pythagoras',
      },
      {
        pertanyaan: 'Bentuk sederhana dari penjumlahan aljabar (5x + 3y) + (2x - y) adalah...',
        pilihan: {
          A: '7x + 2y',
          B: '7x + 4y',
          C: '3x + 2y',
          D: '7x - 2y',
          E: '9xy',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Operasi Bentuk Aljabar',
      },
      {
        stimulus: 'Seorang peternak memiliki persediaan pakan yang cukup untuk 20 ekor sapi selama 15 hari.',
        pertanyaan: 'Jika peternak menambah 5 ekor sapi lagi sehingga jumlah sapi menjadi 25 ekor, berapa hari persediaan pakan tersebut akan habis?',
        pilihan: {
          A: '12 hari',
          B: '10 hari',
          C: '18 hari',
          D: '20 hari',
          E: '14 hari',
        },
        kunci: 'A',
        levelBloom: 'C4 (Menganalisis)',
        ruangLingkup: 'Perbandingan Berbalik Nilai',
      },
    ],
    pgKompleks: [
      {
        pertanyaan: 'Pilihlah kelompok tiga bilangan yang merupakan Tripel Pythagoras yang tepat!',
        pilihan: [
          { kode: 'A', teks: '3, 4, 5', isBenar: true },
          { kode: 'B', teks: '5, 12, 13', isBenar: true },
          { kode: 'C', teks: '4, 5, 6', isBenar: false },
          { kode: 'D', teks: '6, 8, 10', isBenar: true },
          { kode: 'E', teks: '7, 10, 12', isBenar: false },
        ],
        kunci: 'A, B, dan D',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Tripel Pythagoras',
      },
    ],
    menjodohkan: [
      { premisKiri: '3/4 + 1/2', responsKanan: '5/4 atau 1 1/4', ruangLingkup: 'Pecahan' },
      { premisKiri: 'Nilai x pada 2x + 4 = 14', responsKanan: 'x = 5', ruangLingkup: 'Persamaan Linear' },
    ],
    isianSingkat: [
      {
        pertanyaan: 'Jika sebuah persegi memiliki keliling 36 cm, maka panjang sisi persegi tersebut adalah...',
        kunci: '9 cm',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Bangun Datar',
      },
    ],
    uraian: [
      {
        stimulus: 'Sebuah tangga sepanjang 5 meter disandarkan ke dinding tembok rumah. Ujung bawah tangga berjarak 3 meter dari kaki dinding.',
        pertanyaan: 'Hitunglah tinggi dinding yang dicapai ujung atas tangga tersebut beserta langkah penyelesaiannya!',
        rubrikDanKunci: 't = √(5² - 3²) = √(25 - 9) = √16 = 4 meter.',
        levelBloom: 'C4 (Menganalisis)',
        ruangLingkup: 'Aplikasi Pythagoras',
      },
    ],
  },
  {
    id: 'ipas_ipa',
    title: 'IPAS / IPA',
    keywords: ['ipas', 'ipa', 'ekosistem', 'rantai makanan', 'pernapasan', 'pencernaan', 'kalor', 'wujud benda', 'fotosintesis', 'energi', 'gaya', 'listrik', 'tumbuhan', 'organ'],
    pg: [
      {
        pertanyaan: 'Dalam suatu ekosistem sawah terdapat padi, tikus, ular, dan burung elang. Organisme yang berperan sebagai produsen penghasil energi pertama adalah...',
        pilihan: {
          A: 'Padi karena mampu berfotosintesis menghasilkan makanan sendiri',
          B: 'Tikus karena memakan biji padi secara langsung',
          C: 'Ular karena memakan tikus sebagai konsumen tingkat II',
          D: 'Elang sebagai pemangsa puncak di sawah',
          E: 'Jamur pengurai sisa makhluk hidup',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Rantai Makanan Ekosistem',
      },
      {
        pertanyaan: 'Organ pada sistem pernapasan manusia yang berfungsi sebagai tempat pertukaran gas oksigen (O2) dan karbon dioksida (CO2) adalah...',
        pilihan: {
          A: 'Alveolus di dalam paru-paru',
          B: 'Rongga hidung bagian luar',
          C: 'Tenggorokan (trakea)',
          D: 'Kerongkongan (esofagus)',
          E: 'Lambung bagian atas',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Sistem Pernapasan Manusia',
      },
      {
        pertanyaan: 'Peristiwa berubahnya wujud zat dari cair menjadi gas akibat menerima energi panas (kalor) seperti air yang mendidih disebut...',
        pilihan: {
          A: 'Menguap',
          B: 'Membeku',
          C: 'Mengkristal',
          D: 'Menyublim',
          E: 'Mengembun',
        },
        kunci: 'A',
        levelBloom: 'C1 (Mengingat)',
        ruangLingkup: 'Perubahan Wujud Benda',
      },
    ],
    pgKompleks: [
      {
        pertanyaan: 'Pilihlah cara yang tepat untuk menjaga kesehatan sistem pernapasan dan pencernaan manusia!',
        pilihan: [
          { kode: 'A', teks: 'Mengonsumsi makanan bergizi kaya serat dan mencuci tangan sebelum makan.', isBenar: true },
          { kode: 'B', teks: 'Berolahraga rutin serta menjauhi paparan asap rokok.', isBenar: true },
          { kode: 'C', teks: 'Sering menghirup udara tercemar asap kendaraan tanpa masker.', isBenar: false },
          { kode: 'D', teks: 'Minum air putih yang cukup dan menjaga kebersihan lingkungan.', isBenar: true },
          { kode: 'E', teks: 'Mengonsumsi makanan basi tanpa dimasak.', isBenar: false },
        ],
        kunci: 'A, B, dan D',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Kesehatan Organ Tubuh',
      },
    ],
    menjodohkan: [
      { premisKiri: 'Fotosintesis', responsKanan: 'Proses tumbuhan hijau mengolah air dan CO2 dengan bantuan cahaya matahari', ruangLingkup: 'Tumbuhan' },
      { premisKiri: 'Mencair', responsKanan: 'Perubahan wujud padat menjadi cair karena menyerap kalor', ruangLingkup: 'Kalor & Wujud Zat' },
    ],
    isianSingkat: [
      {
        pertanyaan: 'Enzim dan asam lambung (HCl) berperan memecah makanan serta membunuh kuman di dalam organ pencernaan bernama...',
        kunci: 'Lambung',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Sistem Pencernaan',
      },
    ],
    uraian: [
      {
        stimulus: 'Di suatu ekosistem sawah, populasi ular menurun drastis akibat perburuan liar oleh manusia.',
        pertanyaan: 'Analisislah dampak yang terjadi terhadap populasi tikus dan hasil panen padi petani akibat berkurangnya populasi ular!',
        rubrikDanKunci: 'Berkurangnya predator ular membuat populasi tikus meningkat pesat, sehingga hama tikus memakan tanaman padi secara berlebihan dan menurunkan hasil panen petani secara signifikan.',
        levelBloom: 'C4 (Menganalisis)',
        ruangLingkup: 'Keseimbangan Ekosistem',
      },
    ],
  },
  {
    id: 'bahasa_indonesia',
    title: 'Bahasa Indonesia',
    keywords: ['bahasa indonesia', 'gagasan pokok', 'ide pokok', 'eksplanasi', 'persuasi', 'deskripsi', 'narasi', 'kalimat efektif', 'pantun', 'puisi', 'paragraf', 'bacaan'],
    pg: [
      {
        pertanyaan: 'Ide utama yang menjadi dasar pengembangan seluruh kalimat penjelas dalam satu paragraf disebut...',
        pilihan: {
          A: 'Gagasan pokok (ide pokok)',
          B: 'Kalimat penjelas pelengkap',
          C: 'Kata penghubung antarkalimat',
          D: 'Judul karangan bebas',
          E: 'Tanda baca kutipan',
        },
        kunci: 'A',
        levelBloom: 'C1 (Mengingat)',
        ruangLingkup: 'Ide Pokok Paragraf',
      },
      {
        pertanyaan: 'Tujuan utama penyusunan teks eksplanasi adalah untuk...',
        pilihan: {
          A: 'Menjelaskan proses terjadinya suatu fenomena alam atau sosial secara runtut dan faktual',
          B: 'Menghibur pembaca melalui cerita dongeng fiksi imajinatif',
          C: 'Membujuk pembaca membeli suatu produk dagangan',
          D: 'Menceritakan pengalaman pribadi saat berlibur',
          E: 'Menggambarkan keindahan objek wisata secara puitis',
        },
        kunci: 'A',
        levelBloom: 'C2 (Memahami)',
        ruangLingkup: 'Teks Eksplanasi',
      },
    ],
    pgKompleks: [
      {
        pertanyaan: 'Pilihlah ciri-ciri kalimat efektif dalam penulisan karya ilmiah atau laporan!',
        pilihan: [
          { kode: 'A', teks: 'Struktur kalimat jelas (memiliki subjek dan predikat yang tepat).', isBenar: true },
          { kode: 'B', teks: 'Hemat kata dan tidak mengulang makna yang sama secara mubazir.', isBenar: true },
          { kode: 'C', teks: 'Menggunakan bahasa gaul tidak baku di seluruh bagian laporan.', isBenar: false },
          { kode: 'D', teks: 'Tidak menimbulkan makna ganda (ambigu) bagi pembaca.', isBenar: true },
          { kode: 'E', teks: 'Ditulis tanpa tanda baca titik dan koma.', isBenar: false },
        ],
        kunci: 'A, B, dan D',
        levelBloom: 'C3 (Menerapkan)',
        ruangLingkup: 'Kalimat Efektif',
      },
    ],
    menjodohkan: [
      { premisKiri: 'Paragraf Deduktif', responsKanan: 'Kalimat utama terletak di awal paragraf', ruangLingkup: 'Struktur Paragraf' },
      { premisKiri: 'Paragraf Induktif', responsKanan: 'Kalimat utama terletak di akhir paragraf sebagai kesimpulan', ruangLingkup: 'Struktur Paragraf' },
    ],
    isianSingkat: [
      {
        pertanyaan: 'Teks yang bertujuan mengajak, mengimbau, atau memengaruhi pembaca agar melakukan suatu tindakan disebut teks...',
        kunci: 'Persuasi',
        levelBloom: 'C1 (Mengingat)',
        ruangLingkup: 'Jenis Teks',
      },
    ],
    uraian: [
      {
        pertanyaan: 'Jelaskan perbedaan utama antara teks deskripsi dengan teks eksplanasi disertai masing-masing satu contoh topik!',
        rubrikDanKunci: 'Teks deskripsi menggambarkan objek secara rinci seolah pembaca melihat/merasakan langsung (contoh: Keindahan Pantai Senggigi). Teks eksplanasi menjelaskan proses sebab-akibat terjadinya fenomena (contoh: Proses Terjadinya Hujan).',
        levelBloom: 'C4 (Menganalisis)',
        ruangLingkup: 'Perbandingan Jenis Teks',
      },
    ],
  },
];

function splitUserTopics(rawText: string, mapel: string): string[] {
  const cleaned = String(rawText || '')
    .split(/\n+|;/)
    .map((line) =>
      line
        .replace(/^\s*\d+[\.\)]\s*/, '')
        .replace(/^\s*[-*•]\s*/, '')
        .trim()
    )
    .filter((line) => line.length >= 4);

  if (cleaned.length > 0) return cleaned;
  const fallbackTopic = rawText?.trim() || mapel || 'Materi Pembelajaran Inti';
  return [fallbackTopic];
}

function matchRelevantBanks(combinedQuery: string, mapel: string, instruksi: string): TopicBank[] {
  const lowerQuery = combinedQuery.toLowerCase();
  const lowerMapel = mapel.toLowerCase();
  const lowerInstruksi = instruksi.toLowerCase();

  // Extract explicit negative constraints if user wrote "hindari X" or "jangan X"
  const avoidedMatches = Array.from(
    lowerInstruksi.matchAll(/(?:jangan|hindari|tanpa|bukan)\s+([a-z0-9\s]{3,35})/gi)
  ).map((m) => m[1].trim());

  const scored = TOPIC_BANKS.map((bank) => {
    let score = 0;
    for (const kw of bank.keywords) {
      if (lowerQuery.includes(kw)) {
        score += kw.includes(' ') ? 3 : 2;
      }
      if (lowerMapel.includes(kw)) {
        score += 1;
      }
      if (avoidedMatches.some((av) => av.includes(kw) || kw.includes(av))) {
        score -= 100;
      }
    }
    return { bank, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((s) => s.bank);
}

function shortenTopicLabel(topic: string): string {
  const clean = topic.replace(/\s+/g, ' ').trim();
  if (clean.length <= 72) return clean;
  return `${clean.slice(0, 69).trim()}...`;
}

function extractTopicKeywords(topic: string): string {
  const stripped = topic
    .replace(/^(mempraktikkan|menganalisis|menjelaskan|memahami|menerapkan|mengevaluasi|mengidentifikasi|menunjukkan|merancang|peserta didik mampu|siswa dapat)\s+/i, '')
    .trim();
  return shortenTopicLabel(stripped || topic);
}

function inferBloomFilter(instruksi: string): 'HOTS' | 'LOTS' | 'MIXED' {
  const lower = instruksi.toLowerCase();
  if (/(hots|c4|c5|c6|analisis|evaluasi|penalaran|studi kasus)/i.test(lower)) {
    return 'HOTS';
  }
  if (/(mudah|dasar|lots|c1|c2|sederhana)/i.test(lower)) {
    return 'LOTS';
  }
  return 'MIXED';
}

function synthesizeTopicLockedPg(
  topic: string,
  mapel: string,
  kelas: string,
  variantIndex: number,
  bloomHint: 'HOTS' | 'LOTS' | 'MIXED',
  instruksi: string
): PgTemplate {
  const fokus = extractTopicKeywords(topic);
  const shortFokus = shortenTopicLabel(fokus);
  const ruangLingkup = shortenTopicLabel(fokus.split(/,|dan|serta/i)[0] || mapel);
  const needsCase = bloomHint === 'HOTS' || variantIndex % 3 === 1;
  const level =
    bloomHint === 'HOTS'
      ? variantIndex % 2 === 0
        ? 'C4 (Menganalisis)'
        : 'C5 (Mengevaluasi)'
      : bloomHint === 'LOTS'
        ? variantIndex % 2 === 0
          ? 'C1 (Mengingat)'
          : 'C2 (Memahami)'
        : ['C2 (Memahami)', 'C3 (Menerapkan)', 'C4 (Menganalisis)'][variantIndex % 3];

  const templates: Array<Omit<PgTemplate, 'ruangLingkup'>> = [
    {
      stimulus: needsCase
        ? `Dalam pembelajaran ${mapel} (${kelas}), guru memberikan tugas kepada peserta didik untuk menguasai kompetensi "${shortFokus}".`
        : undefined,
      pertanyaan: `Tujuan paling utama yang ingin dicapai peserta didik ketika mempelajari dan menerapkan materi "${shortFokus}" adalah...`,
      pilihan: {
        A: `Memahami konsep serta mampu menerapkan keterampilan "${shortFokus}" secara tepat, aman, dan bertanggung jawab`,
        B: 'Menghafal istilah materi tanpa memahami penerapan nyatanya dalam kehidupan sehari-hari',
        C: 'Menyelesaikan tugas secara tergesa-gesa tanpa memperhatikan prosedur yang benar',
        D: 'Mengabaikan keselamatan, ketelitian, serta kerja sama bersama rekan satu kelompok',
        E: 'Meniru pekerjaan teman tanpa berlatih memahami langkah-langkah dasarnya',
      },
      kunci: 'A',
      levelBloom: level,
    },
    {
      stimulus: `Seorang peserta didik mengalami kesulitan dalam mempraktikkan bagian inti dari materi "${shortFokus}" karena kurang persiapan dan terburu-buru.`,
      pertanyaan: `Langkah perbaikan paling tepat yang sebaiknya dilakukan agar penguasaan "${shortFokus}" berjalan efektif adalah...`,
      pilihan: {
        A: 'Berlatih terburu-buru melewati tahapan awal supaya cepat selesai',
        B: `Mempelajari tahapan dasar secara berurutan, memperhatikan umpan balik guru, dan berlatih konsisten sesuai prinsip "${shortFokus}"`,
        C: 'Menghentikan seluruh aktivitas latihan dan menghindari materi tersebut',
        D: 'Mengubah seluruh aturan standar tanpa persetujuan pembimbing',
        E: 'Mengandalkan kekuatan fisik semata tanpa memperhatikan teknik dan prosedur',
      },
      kunci: 'B',
      levelBloom: 'C4 (Menganalisis)',
    },
    {
      deskripsiGambar: `Ilustrasi/bagan tahapan pelaksanaan materi "${shortFokus}" pada mata pelajaran ${mapel} (${kelas}).`,
      pertanyaan: `Berdasarkan alur pembelajaran "${shortFokus}", urutan sikap dan tindakan yang paling mencerminkan penerapan konsep yang benar adalah...`,
      pilihan: {
        A: 'Melakukan persiapan, menjalankan prosedur inti secara cermat, lalu melakukan evaluasi hasil kegiatan',
        B: 'Langsung melakukan evaluasi akhir sebelum mencoba langkah persiapan',
        C: 'Mengabaikan tahap persiapan demi mempercepat waktu penyelesaian',
        D: 'Melakukan langkah penutup di awal kegiatan secara acak',
        E: 'Bekerja sendiri tanpa memperhatikan petunjuk dan tata tertib',
      },
      kunci: 'A',
      levelBloom: 'C3 (Menerapkan)',
    },
    {
      stimulus: instruksi.trim()
        ? `Sesuai arahan pembelajaran (${shortenTopicLabel(instruksi)}), peserta didik mengaitkan konsep "${shortFokus}" dengan situasi nyata.`
        : undefined,
      pertanyaan: `Indikator keberhasilan seorang peserta didik pada kompetensi "${shortFokus}" ditunjukkan melalui perilaku...`,
      pilihan: {
        A: 'Mampu menjelaskan prinsip dasar, menerapkan prosedur secara tepat, dan menunjukkan sikap disiplin/jujur',
        B: 'Hanya mencatat definisi di buku tulis tanpa mampu menjelaskan manfaatnya',
        C: 'Menolak bekerja sama saat diskusi atau praktik kelompok berlangsung',
        D: 'Sering melanggar kesepakatan aturan selama proses pembelajaran',
        E: 'Mengabaikan keselamatan diri sendiri maupun lingkungan sekitar',
      },
      kunci: 'A',
      levelBloom: level,
    },
  ];

  const picked = templates[variantIndex % templates.length];
  return { ...picked, ruangLingkup };
}

function synthesizeTopicLockedPgk(topic: string, mapel: string): PgkTemplate {
  const fokus = extractTopicKeywords(topic);
  return {
    stimulus: `Pada pembelajaran ${mapel} dengan topik "${fokus}", peserta didik harus memperhatikan aspek pengetahuan, keterampilan, dan sikap.`,
    pertanyaan: `Pilihlah DUA atau LEBIH pernyataan yang TEPAT dalam penerapan materi "${fokus}"!`,
    pilihan: [
      { kode: 'A', teks: `Memahami konsep dasar dan prosedur yang benar pada topik "${fokus}".`, isBenar: true },
      { kode: 'B', teks: 'Melakukan kegiatan secara tergesa-gesa tanpa memperhatikan keselamatan atau ketelitian.', isBenar: false },
      { kode: 'C', teks: 'Menerapkan langkah pelaksanaan secara runtut serta mengevaluasi kesalahannya.', isBenar: true },
      { kode: 'D', teks: 'Menunjukkan sikap disiplin, tanggung jawab, dan kerja sama yang sportif.', isBenar: true },
      { kode: 'E', teks: 'Mengabaikan arahan dan petunjuk kerja dari guru pembimbing.', isBenar: false },
    ],
    kunci: 'A, C, dan D',
    levelBloom: 'C4 (Menganalisis)',
    ruangLingkup: shortenTopicLabel(fokus),
  };
}

function synthesizeTopicLockedMatch(topic: string, idx: number): MatchTemplate {
  const fokus = extractTopicKeywords(topic);
  const pairs: Array<[string, string]> = [
    [`Tahap Persiapan (${shortenTopicLabel(fokus)})`, 'Menyiapkan kesiapan fisik/mental dan memahami aturan dasar sebelum praktik'],
    [`Pelaksanaan Inti (${shortenTopicLabel(fokus)})`, 'Menerapkan teknik/prosedur utama secara runtut, akurat, dan aman'],
    [`Evaluasi & Refleksi (${shortenTopicLabel(fokus)})`, 'Mengukur ketercapaian hasil serta memperbaiki kesalahan yang muncul'],
    [`Sikap & Karakter (${shortenTopicLabel(fokus)})`, 'Menjunjung tinggi disiplin, kejujuran, sportivitas, dan kerja sama tim'],
  ];
  const pair = pairs[idx % pairs.length];
  return {
    premisKiri: pair[0],
    responsKanan: pair[1],
    ruangLingkup: shortenTopicLabel(fokus),
  };
}

function synthesizeTopicLockedShort(topic: string, mapel: string, idx: number): ShortTemplate {
  const fokus = extractTopicKeywords(topic);
  if (idx % 2 === 0) {
    return {
      stimulus: `Dalam mata pelajaran ${mapel}, penguasaan "${fokus}" diawali dengan sikap siap dan pemahaman prosedur dasar.`,
      pertanyaan: `Tahap awal sebelum melaksanakan kegiatan inti pada materi "${fokus}" adalah melakukan...`,
      kunci: 'Persiapan / Pemanasan sesuai prosedur',
      levelBloom: 'C2 (Memahami)',
      ruangLingkup: shortenTopicLabel(fokus),
    };
  }
  return {
    pertanyaan: `Sikap utama yang harus selalu dijaga peserta didik ketika bekerja atau berlatih dalam materi "${fokus}" agar aman dan tertib adalah...`,
    kunci: 'Disiplin dan bertanggung jawab',
    levelBloom: 'C2 (Memahami)',
    ruangLingkup: shortenTopicLabel(fokus),
  };
}

function synthesizeTopicLockedEssay(topic: string, mapel: string, idx: number): EssayTemplate {
  const fokus = extractTopicKeywords(topic);
  if (idx % 2 === 0) {
    return {
      stimulus: `Pada pembelajaran ${mapel}, beberapa siswa masih mengalami kesalahan teknis dan kurang kompak saat mempraktikkan "${fokus}".`,
      pertanyaan: `Analisislah 3 langkah sistematis agar peserta didik dapat menguasai materi "${fokus}" dengan benar dan aman!`,
      rubrikDanKunci: `1) Memahami konsep dan tujuan "${fokus}" terlebih dahulu; 2) Mempraktikkan tahapan gerak/prosedur secara bertahap dan cermat; 3) Melakukan evaluasi umpan balik serta menjaga kedisiplinan dan kerja sama.`,
      levelBloom: 'C4 (Menganalisis)',
      ruangLingkup: shortenTopicLabel(fokus),
    };
  }
  return {
    pertanyaan: `Rancanglah contoh penerapan nyata atau solusi dari materi "${fokus}" dalam kehidupan sehari-hari peserta didik di sekolah maupun di rumah!`,
    rubrikDanKunci: `Jawaban memuat minimal 2 contoh konkret penerapan "${fokus}", penjelasan manfaatnya, serta sikap positif yang menyertai pelaksanaannya.`,
    levelBloom: 'C6 (Mencipta)',
    ruangLingkup: shortenTopicLabel(fokus),
  };
}

export interface GeneratedQuestionPack {
  pgList: Array<SoalPilihanGanda & { tpRef: string; ruangLingkup: string }>;
  pgkList: Array<SoalPgKompleks & { tpRef: string; ruangLingkup: string }>;
  matchList: Array<SoalMenjodohkan & { tpRef: string; ruangLingkup: string }>;
  shortList: Array<SoalIsianSingkat & { tpRef: string; ruangLingkup: string }>;
  essayList: Array<SoalUraian & { tpRef: string; ruangLingkup: string }>;
  kisiRows: KisiKisiItem[];
}

export function buildCommandAlignedQuestions(params: {
  mapel: string;
  kelas: string;
  fase: string;
  materiOrTp: string;
  instruksiKhusus?: string;
  komposisi: KomposisiSoalConfig & { opsiPg: OpsiPgCount };
  ranges: {
    pg: { count: number; start: number };
    pgKompleks: { count: number; start: number };
    menjodohkan: { count: number; start: number };
    isianSingkat: { count: number; start: number };
    uraian: { count: number; start: number };
  };
  applyOpsiFn: (item: SoalPilihanGanda, opsi: OpsiPgCount) => SoalPilihanGanda;
}): GeneratedQuestionPack {
  const { mapel, kelas, materiOrTp, instruksiKhusus = '', komposisi, ranges, applyOpsiFn } = params;
  const targetTps = splitUserTopics(materiOrTp, mapel);
  const bloomHint = inferBloomFilter(instruksiKhusus);
  const combinedQuery = `${mapel} ${materiOrTp} ${instruksiKhusus}`;
  const matchedBanks = matchRelevantBanks(combinedQuery, mapel, instruksiKhusus);

  // Deduplicated pool from all matched banks (interleaved across matched topics)
  const pgPool: Array<PgTemplate & { tpRef: string }> = [];
  const pgkPool: Array<PgkTemplate & { tpRef: string }> = [];
  const matchPool: Array<MatchTemplate & { tpRef: string }> = [];
  const shortPool: Array<ShortTemplate & { tpRef: string }> = [];
  const essayPool: Array<EssayTemplate & { tpRef: string }> = [];

  if (matchedBanks.length > 0) {
    const maxPg = Math.max(...matchedBanks.map((b) => b.pg.length));
    for (let i = 0; i < maxPg; i++) {
      matchedBanks.forEach((bank, bIdx) => {
        if (bank.pg[i]) {
          const matchingTp =
            targetTps.find((tp) =>
              bank.keywords.some((kw) => tp.toLowerCase().includes(kw))
            ) || targetTps[(i + bIdx) % targetTps.length];
          pgPool.push({ ...bank.pg[i], tpRef: matchingTp });
        }
      });
    }

    matchedBanks.forEach((bank, bIdx) => {
      const matchingTp =
        targetTps.find((tp) => bank.keywords.some((kw) => tp.toLowerCase().includes(kw))) ||
        targetTps[bIdx % targetTps.length];
      bank.pgKompleks.forEach((item) => pgkPool.push({ ...item, tpRef: matchingTp }));
      bank.menjodohkan.forEach((item) => matchPool.push({ ...item, tpRef: matchingTp }));
      bank.isianSingkat.forEach((item) => shortPool.push({ ...item, tpRef: matchingTp }));
      bank.uraian.forEach((item) => essayPool.push({ ...item, tpRef: matchingTp }));
    });
  }

  // Build PG aligned to exact requested count
  const pgList: Array<SoalPilihanGanda & { tpRef: string; ruangLingkup: string }> = [];
  for (let i = 0; i < komposisi.pg; i++) {
    const tpRef = targetTps[i % targetTps.length];
    const bankItem = pgPool[i];
    const tpl =
      bankItem || synthesizeTopicLockedPg(tpRef, mapel, kelas, i, bloomHint, instruksiKhusus);
    const basePg = applyOpsiFn(
      {
        nomor: ranges.pg.start + i,
        stimulus: tpl.stimulus,
        deskripsiGambar: tpl.deskripsiGambar,
        pertanyaan: tpl.pertanyaan,
        pilihan: { ...tpl.pilihan },
        kunci: tpl.kunci,
        levelBloom: tpl.levelBloom,
        skor: 1,
      },
      komposisi.opsiPg
    );
    pgList.push({
      ...basePg,
      tpRef: bankItem ? bankItem.tpRef : tpRef,
      ruangLingkup: tpl.ruangLingkup,
    });
  }

  // Build PG Kompleks
  const pgkList: Array<SoalPgKompleks & { tpRef: string; ruangLingkup: string }> = [];
  for (let i = 0; i < komposisi.pgKompleks; i++) {
    const tpRef = targetTps[i % targetTps.length];
    const bankItem = pgkPool[i];
    const tpl = bankItem || synthesizeTopicLockedPgk(tpRef, mapel);
    pgkList.push({
      nomor: ranges.pgKompleks.start + i,
      stimulus: tpl.stimulus,
      pertanyaan: tpl.pertanyaan,
      pilihan: tpl.pilihan.map((p) => ({ ...p })),
      kunci: tpl.kunci,
      levelBloom: tpl.levelBloom,
      skor: 2,
      tpRef: bankItem ? bankItem.tpRef : tpRef,
      ruangLingkup: tpl.ruangLingkup,
    });
  }

  // Build Menjodohkan
  const matchList: Array<SoalMenjodohkan & { tpRef: string; ruangLingkup: string }> = [];
  for (let i = 0; i < komposisi.menjodohkan; i++) {
    const tpRef = targetTps[i % targetTps.length];
    const bankItem = matchPool[i];
    const tpl = bankItem || synthesizeTopicLockedMatch(tpRef, i);
    matchList.push({
      nomor: ranges.menjodohkan.start + i,
      premisKiri: tpl.premisKiri,
      responsKanan: tpl.responsKanan,
      kunci: `Pasangan ${i + 1}`,
      skor: 1,
      tpRef: bankItem ? bankItem.tpRef : tpRef,
      ruangLingkup: tpl.ruangLingkup,
    });
  }

  // Build Isian Singkat
  const shortList: Array<SoalIsianSingkat & { tpRef: string; ruangLingkup: string }> = [];
  for (let i = 0; i < komposisi.isianSingkat; i++) {
    const tpRef = targetTps[i % targetTps.length];
    const bankItem = shortPool[i];
    const tpl = bankItem || synthesizeTopicLockedShort(tpRef, mapel, i);
    shortList.push({
      nomor: ranges.isianSingkat.start + i,
      stimulus: tpl.stimulus,
      pertanyaan: tpl.pertanyaan,
      kunci: tpl.kunci,
      levelBloom: tpl.levelBloom,
      skor: 2,
      tpRef: bankItem ? bankItem.tpRef : tpRef,
      ruangLingkup: tpl.ruangLingkup,
    });
  }

  // Build Uraian
  const essayList: Array<SoalUraian & { tpRef: string; ruangLingkup: string }> = [];
  for (let i = 0; i < komposisi.uraian; i++) {
    const tpRef = targetTps[i % targetTps.length];
    const bankItem = essayPool[i];
    const tpl = bankItem || synthesizeTopicLockedEssay(tpRef, mapel, i);
    essayList.push({
      nomor: ranges.uraian.start + i,
      stimulus: tpl.stimulus,
      deskripsiGambar: tpl.deskripsiGambar,
      pertanyaan: tpl.pertanyaan,
      rubrikDanKunci: tpl.rubrikDanKunci,
      levelBloom: tpl.levelBloom,
      skor: 5,
      tpRef: bankItem ? bankItem.tpRef : tpRef,
      ruangLingkup: tpl.ruangLingkup,
    });
  }

  // Build Kisi-Kisi synced 1-to-1 with every generated question
  const kisiRows: KisiKisiItem[] = [];
  pgList.forEach((pg) => {
    kisiRows.push({
      no: pg.nomor,
      tujuanPembelajaran: pg.tpRef,
      ruangLingkupMateri: pg.ruangLingkup,
      levelKognitif: pg.levelBloom,
      indikatorSoal: `Disajikan pernyataan/kasus terkait ${pg.ruangLingkup}, peserta didik dapat menentukan jawaban yang tepat.`,
      bentukSoal: 'Pilihan Ganda',
      nomorSoal: pg.nomor,
      naskahSoal: pg.pertanyaan,
      kunciJawaban: `${pg.kunci}. ${pg.pilihan[pg.kunci] || ''}`,
      skor: pg.skor,
    });
  });

  pgkList.forEach((pgk) => {
    kisiRows.push({
      no: pgk.nomor,
      tujuanPembelajaran: pgk.tpRef,
      ruangLingkupMateri: pgk.ruangLingkup,
      levelKognitif: pgk.levelBloom,
      indikatorSoal: `Disajikan beberapa pernyataan mengenai ${pgk.ruangLingkup}, peserta didik dapat memilih lebih dari satu jawaban benar.`,
      bentukSoal: 'Pilihan Ganda Kompleks',
      nomorSoal: pgk.nomor,
      naskahSoal: pgk.pertanyaan,
      kunciJawaban: pgk.kunci,
      skor: pgk.skor,
    });
  });

  matchList.forEach((m) => {
    kisiRows.push({
      no: m.nomor,
      tujuanPembelajaran: m.tpRef,
      ruangLingkupMateri: m.ruangLingkup,
      levelKognitif: 'C2 (Memahami)',
      indikatorSoal: `Peserta didik dapat memasangkan konsep ${m.ruangLingkup} dengan fungsi atau penjelasannya yang tepat.`,
      bentukSoal: 'Menjodohkan',
      nomorSoal: m.nomor,
      naskahSoal: `${m.premisKiri} -> ${m.responsKanan}`,
      kunciJawaban: m.responsKanan,
      skor: m.skor,
    });
  });

  shortList.forEach((s) => {
    kisiRows.push({
      no: s.nomor,
      tujuanPembelajaran: s.tpRef,
      ruangLingkupMateri: s.ruangLingkup,
      levelKognitif: s.levelBloom,
      indikatorSoal: `Disajikan pertanyaan singkat mengenai ${s.ruangLingkup}, peserta didik dapat menuliskan jawaban yang tepat.`,
      bentukSoal: 'Isian Singkat',
      nomorSoal: s.nomor,
      naskahSoal: s.pertanyaan,
      kunciJawaban: s.kunci,
      skor: s.skor,
    });
  });

  essayList.forEach((u) => {
    kisiRows.push({
      no: u.nomor,
      tujuanPembelajaran: u.tpRef,
      ruangLingkupMateri: u.ruangLingkup,
      levelKognitif: u.levelBloom,
      indikatorSoal: `Disajikan studi kasus terkait ${u.ruangLingkup}, peserta didik dapat menguraikan analisis atau solusi secara sistematis.`,
      bentukSoal: 'Uraian',
      nomorSoal: u.nomor,
      naskahSoal: u.pertanyaan,
      kunciJawaban: u.rubrikDanKunci,
      skor: u.skor,
    });
  });

  return {
    pgList,
    pgkList,
    matchList,
    shortList,
    essayList,
    kisiRows,
  };
}
