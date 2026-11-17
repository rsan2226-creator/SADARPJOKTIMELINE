export interface SlideItem {
  id: number;
  type: 'title' | 'hook' | 'objective' | 'material' | 'activity' | 'reflection' | 'summary' | 'closing';
  submateriTag?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  keyConcept?: string;
  questionPrompt?: string;
  activityBox?: {
    instruction: string;
    duration: string;
  };
  visualIdea: string;
  canvaKeywordTag: string;
  speakerNotes: string;
}

export interface PresentationData {
  guru: string;
  mapel: string;
  kelas: string;
  sekolah: string;
  tujuanPembelajaran: string;
  judulMateri: string;
  temaWarna: 'teal' | 'ocean' | 'sunset' | 'purple' | 'emerald';
  totalSlides: number;
  slides: SlideItem[];
}

export function getFallbackPresentationData(guru?: string, mapel?: string, kelas?: string, sekolah?: string, tujuan?: string): PresentationData {
  const gName = guru || 'Guru PJOK SD Negeri Kalimantong';
  const mName = mapel || 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)';
  const kName = kelas || 'Kelas V (Fase C)';
  const sName = sekolah || 'SD Negeri Kalimantong';
  const tPembelajaran = tujuan || 'Peserta didik dapat memahami dan mempraktikkan variasi gerak dasar menendang dan menghentikan bola dengan kaki bagian dalam secara terarah, berpasangan, dan sportif.';

  const slides: SlideItem[] = [
    {
      id: 1,
      type: 'title',
      title: 'Variasi dan Kombinasi Menendang & Menghentikan Bola',
      subtitle: `Modul Ajar Interaktif • ${mName} • ${kName}`,
      keyConcept: 'Pembelajaran Mendalam (Deep Learning): Berkesadaran, Bermakna, Menggembirakan',
      visualIdea: 'Desain cover modern Canva dengan shape melengkung dinamis, ilustrasi lapangan hijau, bola sepak 3D, dan siluet anak-anak gembira.',
      canvaKeywordTag: 'kids sports presentation, 3d soccer ball, cheerful school layout',
      speakerNotes: `Sapa siswa dengan hangat dan energik. Tanyakan kabar kebugaran fisik dan kesiapan mereka sebelum memulai sesi bahan ajar interaktif hari ini di ${sName}.`,
    },
    {
      id: 2,
      type: 'hook',
      title: 'Pernahkah Kamu Mengoper Bola Tapi Melenceng Jauh?',
      subtitle: 'Mengapa Posisi Kaki Tumpu Sangat Menentukan Arah Tendangan?',
      questionPrompt: 'Bayangkan kamu sedang bertanding dan temanmu berdiri bebas di depan gawang. Apa yang paling menentukan agar bola operanmu sampai tepat ke kakinya tanpa direbut lawan?',
      bullets: [
        'Apakah karena kita menendang sekuat tenaga?',
        'Ataukah karena posisi kaki tumpu dan titik sentuh sepatu kita yang presisi?',
      ],
      keyConcept: 'Akurasi operan 80% ditentukan oleh stabilitas kaki tumpu, bukan semata-mata kekuatan otot tungkai.',
      visualIdea: 'Gambar split-screen interaktif Canva: sisi kiri bola melenceng ke luar lapangan, sisi kanan operan mulus meluncur tepat ke kaki rekan satu tim.',
      canvaKeywordTag: 'soccer kick angle illustration, comparison slide, problem hook',
      speakerNotes: 'Ajak 2-3 murid menjawab secara spontan. Bangun rasa ingin tahu mereka mengapa pemain sepak bola profesional selalu memperhatikan kaki tumpunya.',
    },
    {
      id: 3,
      type: 'objective',
      title: 'Tujuan Pembelajaran Kita Hari Ini',
      subtitle: 'Target Kompetensi yang Akan Kita Kuasai Bersama',
      bullets: [
        'Menjelaskan konsep posisi kaki tumpu di samping bola dan perkenaan kaki bagian dalam secara tepat.',
        'Mempraktikkan gerak menendang bola mendatar dengan arah lurus dan kecepatan yang terkontrol.',
        'Mempraktikkan teknik menghentikan bola (trapping) agar bola tetap dalam penguasaan aman.',
        'Menumbuhkan sikap kolaborasi, saling menyemangati, dan sportivitas tanpa menyalahkan teman.',
      ],
      keyConcept: 'Kuasai 3 Kunci: Kaki Tumpu Siap, Kunci Pergelangan Kaki, dan Sentuh Titik Tengah Bola.',
      visualIdea: 'Infografis Canva 4 pilar berbentuk kartu rounded modern dengan ikon piala, target panah, sepatu bola, dan jabat tangan persahabatan.',
      canvaKeywordTag: 'learning objectives icons, step roadmap, clean educational infographic',
      speakerNotes: 'Bacakan tujuan dengan bahasa yang komunikatif dan ramah anak. Tekankan bahwa setiap murid berproses dan saling mendukung satu sama lain.',
    },
    // Submateri 1: Slide 4 - 8 (5 Slide Submateri 1: Posisi Kaki Tumpu & Perkenaan)
    {
      id: 4,
      type: 'material',
      submateriTag: 'Submateri 1: Kaki Tumpu & Titik Sentuh',
      title: 'Mengenal Kaki Tumpu: Sang Kompas Penentu Arah',
      subtitle: 'Langkah Awal Kunci Operan Akurat',
      bullets: [
        'Kaki tumpu diletakkan di samping bola berjarak sekitar 10–15 cm (selebar satu telapak tangan).',
        'Ujung jari kaki tumpu dihadapkan lurus ke arah sasaran teman yang dituju.',
        'Lutut kaki tumpu sedikit ditekuk (lentur) untuk menjaga keseimbangan berat tubuh.',
      ],
      keyConcept: 'Jika kaki tumpumu menghadap ke barat, bolamu mustahil mengarah sempurna ke utara!',
      visualIdea: 'Ilustrasi top-down (tampak atas) Canva menunjukkan letak sepatu kiri di samping bola dengan garis panah hijau lurus ke depan.',
      canvaKeywordTag: 'top view foot placement football, diagram arrow, sport tutorial',
      speakerNotes: 'Minta semua murid berdiri di samping meja atau di lapangan, lalu peragakan menaruh kaki kiri di samping bola bayangan tanpa menyentuhnya.',
    },
    {
      id: 5,
      type: 'material',
      submateriTag: 'Submateri 1: Kaki Tumpu & Titik Sentuh',
      title: 'Bagian Sepatu Mana yang Menyentuh Bola?',
      subtitle: 'Memanfaatkan Permukaan Luas Kaki Bagian Dalam',
      bullets: [
        'Gunakan bagian dalam kaki, mulai dari bawah mata kaki dalam hingga pangkal ibu jari kaki.',
        'Permukaan ini adalah bagian paling datar pada sepatu, sehingga pantulan bola menjadi paling stabil dan mudah dikendalikan.',
        'Kunci sendi pergelangan kaki keluar (dorsofleksi & eversi ringan) agar tendangan kokoh dan tidak goyah.',
      ],
      keyConcept: 'Permukaan datar menghasilkan pantulan yang lurus dan terprediksi.',
      visualIdea: 'Foto/ilustrasi zoom-in kaki bagian dalam Canva dengan highlight warna cerah pada area kontak sepatu dan garis putus-putus ke titik tengah bola.',
      canvaKeywordTag: 'inside foot football pass, anatomy shoes sport vector, highlighted zone',
      speakerNotes: 'Tunjukkan sepatu sendiri atau gambar di slide. Tanyakan pada murid mengapa kita tidak memakai ujung jari kaki (cocor) saat operan pendek.',
    },
    {
      id: 6,
      type: 'material',
      submateriTag: 'Submateri 1: Kaki Tumpu & Titik Sentuh',
      title: 'Titik Sentuh Bola: Kenapa Bola Melambung Tinggi?',
      subtitle: 'Menjaga Bola Tetap Menggelinding Mendatar',
      bullets: [
        'Untuk operan menyusur rumput: Kaki harus mengenai tepat di TITIK TENGAH bola.',
        'Bila kaki mengenai bagian bawah bola: Bola akan terangkat dan melambung tinggi sehingga sulit dihentikan teman.',
        'Condongkan badan sedikit ke depan saat menendang agar lintasan bola tetap datar dan aman.',
      ],
      keyConcept: 'Sentuh tengah untuk bola datar; sentuh bawah untuk bola melambung tinggi.',
      visualIdea: 'Diagram cross-section bola Canva dengan target merah di titik tengah (Benar) dan tanda silang kuning di bagian bawah bola (Penyebab melambung).',
      canvaKeywordTag: 'physics of soccer ball, impact point infographic, correct vs wrong',
      speakerNotes: 'Jelaskan konsep sains sederhana (biomekanika dan fisika gaya sentuh) yang mudah dicerna murid kelas V.',
    },
    {
      id: 7,
      type: 'material',
      submateriTag: 'Submateri 1: Kaki Tumpu & Titik Sentuh',
      title: 'Gerak Lanjutan (Follow Through) yang Sempurna',
      subtitle: 'Menyelesaikan Ayunan Tungkai Secara Harmonis',
      bullets: [
        'Setelah kaki menyentuh bola, lanjutkan ayunan kaki penendang ke arah sasaran operan.',
        'Jangan mendadak menghentikan kaki tepat saat mengenai bola agar aliran tenaga tersalurkan halus.',
        'Kedua lengan direntangkan wajar di samping badan untuk menjaga keseimbangan dinamis tubuh.',
      ],
      keyConcept: 'Gerak lanjutan membuat operan mengalir anggun dan mencegah cedera otot hamstring.',
      visualIdea: 'Gambar rangkaian gerak stop-motion 3 langkah Canva: awalan -> ayunan kontak -> gerak lanjutan kaki mengarah ke sasaran.',
      canvaKeywordTag: 'kinetic motion sequence, running athlete cartoon, follow through pose',
      speakerNotes: 'Ajak murid mempraktikkan ayunan kaki di tempat dengan ritme lambat (slow motion) 3 kali hitungan.',
    },
    {
      id: 8,
      type: 'activity',
      submateriTag: 'Submateri 1: Kaki Tumpu & Titik Sentuh',
      title: 'Aktivitas Mini: Cek Kaki Pasanganmu!',
      subtitle: 'Tantangan Observasi Berpasangan 3 Menit',
      activityBox: {
        instruction: 'Berdirilah berpasangan sejauh 2 meter. Lakukan 5 kali gerakan bayangan (tanpa bola). Pasanganmu bertugas mengamati: apakah ujung kaki tumpu sudah lurus ke depan dan pergelangan kaki terkunci rapat?',
        duration: 'Durasi: 3 Menit',
      },
      bullets: [
        'Beri tanda jempol (👍) jika teknik pasanganmu sudah sesuai kunci rahasia.',
        'Beri saran ramah jika kaki tumpunya masih miring atau terlalu jauh dari bola bayangan.',
      ],
      keyConcept: 'Belajar bersama teman (peer feedback) mempercepat penguasaan teknik gerak motorik.',
      visualIdea: 'Kartu aktivitas interaktif Canva berwarna cerah dengan timer jam pasir, ikon dua sahabat saling memberi jempol, dan checklist gerak.',
      canvaKeywordTag: 'classroom challenge card, timer icon, high five buddies graphic',
      speakerNotes: 'Awasi murid saat bergerak. Berikan pujian langsung bagi pasangan yang aktif saling mengoreksi secara santun dan sportif.',
    },
    // Submateri 2: Slide 9 - 13 (5 Slide Submateri 2: Teknik Menghentikan Bola & Variasi Berpasangan)
    {
      id: 9,
      type: 'material',
      submateriTag: 'Submateri 2: Menghentikan Bola & Game Presisi',
      title: 'Menghentikan Bola (Trapping): Meredam Laju Si Kulit Bundar',
      subtitle: 'Agar Bola Langsung Jinak di Depan Kakimu',
      bullets: [
        'Songsong arah datangnya bola dengan pandangan mata tetap fokus mengunci pergerakan bola.',
        'Gunakan kaki bagian dalam atau telapak kaki untuk menyerap momentum benturan bola.',
        'Tarik kaki sedikit ke belakang pada saat bola menyentuh sepatu (seperti menangkap telur agar tidak pecah).',
      ],
      keyConcept: 'Menghentikan bola bukan menghadang keras, melainkan menyerap energi laju bola.',
      visualIdea: 'Animasi visual Canva efek pegas/busa lembut saat bola mengenai sepatu bagian dalam, menunjukkan bola berhenti tenang dalam jarak 30 cm.',
      canvaKeywordTag: 'ball control diagram, soft touch animation, football lesson',
      speakerNotes: 'Gunakan analogi menangkap telur mentah yang dilempar lembut. Jika tangan kaku telur akan pecah; jika ditarik lembut telur akan selamat.',
    },
    {
      id: 10,
      type: 'material',
      submateriTag: 'Submateri 2: Menghentikan Bola & Game Presisi',
      title: 'Menghentikan dengan Telapak Kaki (Sole Trapping)',
      subtitle: 'Pilihan Terbaik untuk Bola Bergulir Cepat',
      bullets: [
        'Angkat ujung kaki sedikit ke atas, dengan tumit tetap berada lebih rendah dekat tanah.',
        'Injak lembut bagian atas bola tepat saat bola tiba di bawah telapak sepatu.',
        'Hati-hati: Jangan menginjak bola terlalu keras karena dapat menyebabkan tubuh terpeleset.',
      ],
      keyConcept: 'Injakan lembut menghentikan bola secara instan di tempat.',
      visualIdea: 'Ilustrasi sepatu olahraga menginjak lembut bola dari atas dengan sudut sepatu 30 derajat dari permukaan tanah.',
      canvaKeywordTag: 'sole trapping technique, soccer shoes vector, ground level graphic',
      speakerNotes: 'Ingatkan aspek keselamatan (safety first) saat menginjak bola agar tidak terkilir.',
    },
    {
      id: 11,
      type: 'material',
      submateriTag: 'Submateri 2: Menghentikan Bola & Game Presisi',
      title: 'Kombinasi Gerak: Tendang - Kontrol - Umpan Balik',
      subtitle: 'Membangun Irama Sirkuit Berpasangan 4 Meter',
      bullets: [
        'Pemain A melakukan operan mendatar akurat dengan kaki bagian dalam ke arah Pemain B.',
        'Pemain B menghentikan bola dengan kaki dalam hingga bola berhenti tenang di depan badan.',
        'Pemain B melakukan operan balik ke Pemain A. Lakukan 10 kali repetisi bergantian.',
      ],
      keyConcept: 'Irama yang tenang dan konsisten melatih memori otot (muscle memory) lebih cepat.',
      visualIdea: 'Diagram alur panah melingkar Canva antara dua figur murid (Pemain A & B) dengan garis lintasan bola hijau neon dan jarak 4M.',
      canvaKeywordTag: 'two players passing drill, sports field aerial map, neon sports lines',
      speakerNotes: 'Tekankan ritme latihan: Jangan terburu-buru menendang kembali sebelum bola benar-benar terkontrol tenang.',
    },
    {
      id: 12,
      type: 'material',
      submateriTag: 'Submateri 2: Menghentikan Bola & Game Presisi',
      title: 'Game Tantangan: Gerbang Presisi Corong Mini',
      subtitle: 'Menguji Akurasi di Bawah Tekanan Menyenangkan',
      bullets: [
        'Dua corong (cone) dipasang berjarak 50 cm membentuk sebuah gerbang kecil di tengah.',
        'Operan dinyatakan BERHASIL jika bola meluncur mulus melewati celah gerbang tanpa menyentuh corong sama sekali.',
        'Hitung berapa skor keberhasilan dari 10 kali percobaan bersama rekan pasanganmu!',
      ],
      keyConcept: 'Tantangan terukur meningkatkan konsentrasi kognitif dan ketelitian kinestetik.',
      visualIdea: 'Grafis lapangan 3D Canva dengan dua corong oranye terang dan jalur bola bercahaya hijau melewati tepat di tengahnya.',
      canvaKeywordTag: 'mini goal cones target, 3d sports drill, gamification badge',
      speakerNotes: 'Berikan semangat kompetisi yang sehat. Siswa yang mahir dapat mempersempit gerbang menjadi 40 cm.',
    },
    {
      id: 13,
      type: 'activity',
      submateriTag: 'Submateri 2: Menghentikan Bola & Game Presisi',
      title: 'Latihan Singkat: Analisis Cepat Masalah Operan',
      subtitle: 'Yuk Kita Jadi Detektif Gerak!',
      bullets: [
        'Kasus 1: "Bola operan Edo melambung ke atas kepala Budi." -> Masalahnya: Edo menyentuh bagian ... bola.',
        'Kasus 2: "Bola operan Siti bergulir terlalu pelan dan berhenti di tengah jalan." -> Masalahnya: Ayunan kaki Siti kurang ...',
        'Kasus 3: "Bola Doni melenceng jauh ke samping kanan." -> Masalahnya: Kaki tumpu Doni tidak menghadap ke ...',
      ],
      keyConcept: 'Mengenali letak kesalahan adalah langkah pertama menjadi atlet yang cerdas.',
      visualIdea: 'Layout kuis interaktif Canva dengan kotak dialog detektif, ikon kaca pembesar, dan opsi jawaban bergaya game show.',
      canvaKeywordTag: 'quiz slide template, magnifying glass detective, multiple choice card',
      speakerNotes: 'Minta murid menjawab bersama-sama dengan seru. Pastikan semua memahami konsep fisika gerak di balik setiap kasus.',
    },
    // Slide Refleksi
    {
      id: 14,
      type: 'reflection',
      title: 'Mari Merefleksikan Pembelajaran Hari Ini',
      subtitle: 'Melihat Kembali Apa yang Telah Kita Rasakan dan Pelajari',
      bullets: [
        'Apa satu hal baru dan paling berharga yang kamu ketahui tentang posisi kaki tumpu hari ini?',
        'Tantangan apa yang paling sulit kamu rasakan saat mengontrol bola? Bagaimana caramu mengatasinya?',
        'Bagaimana sikap kerja sama dan saling menyemangati yang kamu tunjukkan kepada teman pasanganmu?',
      ],
      keyConcept: 'Refleksi mendalam mengubah pengalaman gerak jasmani menjadi karakter kepribadian yang tangguh.',
      visualIdea: 'Ilustrasi pohon refleksi Canva dengan kartu catatan tempel (sticky notes) warna pastel dan emotikon senyum bahagia.',
      canvaKeywordTag: 'reflection question prompt, sticky note thoughts, calm peaceful layout',
      speakerNotes: 'Beri waktu hening sejenak agar murid merenungkan proses belajarnya. Tunjuk 1-2 murid untuk menceritakan refleksinya.',
    },
    // Slide Kesimpulan
    {
      id: 15,
      type: 'summary',
      title: 'Rangkuman Inti Materi: 3 Kunci Juara',
      subtitle: 'Ingat Selalu Rumus Rahasia Operan Akurat',
      bullets: [
        '1. Kaki Tumpu di Samping: Arahkan ujung jari kaki tumpu lurus ke sasaran, berjarak 10–15 cm dari bola.',
        '2. Kunci Pergelangan Kaki: Gunakan kaki bagian dalam dan sentuh tepat di titik tengah bola.',
        '3. Kontrol Dingin: Redam laju bola dengan menarik kaki sedikit ke belakang seperti menangkap telur.',
        '4. Kolaborasi Juara: Selalu hargai dan dukung teman bermain, menang dan belajar bersama!',
      ],
      keyConcept: 'Teknik yang benar + Sikap sportif = Pemain yang luar biasa!',
      visualIdea: 'Infografis rangkuman Canva dengan 3 medali emas modern dan checklist besar berwarna hijau emerald.',
      canvaKeywordTag: 'summary bullet points, gold medal champion, checklist review card',
      speakerNotes: 'Ulangi 3 poin kunci bersama-sama dengan yel-yel kelas yang kompak dan bersemangat.',
    },
    // Slide Penutup
    {
      id: 16,
      type: 'closing',
      title: 'Tubuh yang Bugar, Jiwa yang Sportif!',
      subtitle: 'Teruslah Bergerak, Berlatih, dan Menginspirasi Sesama',
      bullets: [
        '“Kemenangan sejati bukan hanya tentang mencetak gol, melainkan tentang bagaimana kita saling mengangkat saat rekan kita terjatuh.”',
      ],
      keyConcept: `Terima Kasih Atas Semangat Luar Biasa Kalian Hari Ini!\nSampai Jumpa di Pertemuan Selanjutnya • ${sName}`,
      visualIdea: 'Slide penutup spektakuler Canva dengan confetti warna-warni, foto tim bergandengan tangan, dan tipografi inspiratif modern.',
      canvaKeywordTag: 'thank you slide, inspirational sport quote, confetti victory background',
      speakerNotes: `Ucapkan terima kasih dan apresiasi setinggi-tingginya kepada seluruh murid. Tutup dengan doa syukur dan tos kekompakan kelas di ${sName}.`,
    },
  ];

  return {
    guru: gName,
    mapel: mName,
    kelas: kName,
    sekolah: sName,
    tujuanPembelajaran: tPembelajaran,
    judulMateri: 'Variasi dan Kombinasi Menendang & Menghentikan Bola',
    temaWarna: 'teal',
    totalSlides: slides.length,
    slides,
  };
}
