export interface VisualRpmData {
  identitas: {
    penyusun: string;
    sekolah: string;
    tahunAjaran: string;
    semester: string;
    mataPelajaran: string;
    kelasFase: string;
    topik: string;
    alokasiWaktu: string;
  };
  identifikasi: {
    pengetahuanAwal: string;
    minatBelajar: string;
    kebutuhanBelajar: string;
    materiFaktual: string;
    materiKonseptual: string;
    materiProsedural: string;
    materiMetakognitif: string;
    dpl: string[];
  };
  desain: {
    capaianPembelajaran: string;
    lintasDisiplin: string;
    tujuanPembelajaran: string[];
    topikPembelajaran: string;
    pendekatan: string;
    model: string;
    metode: string;
    kemitraan: string;
    lingkungan: string;
    digital: string;
  };
  pengalamanBelajar: {
    kegiatanAwal: {
      durasi: string;
      prinsip: string[];
      aktivitas: string[];
    };
    kegiatanInti: Array<{
      judulPertemuan: string;
      prinsip: string[];
      tahapMemahami: {
        sintaks: string;
        durasi: string;
        poin: Array<{ deskripsi: string; dpl?: string }>;
      };
      tahapMengaplikasikan: {
        sintaks: string;
        durasi: string;
        poin: Array<{ deskripsi: string; dpl?: string }>;
      };
      tahapMerefleksi: {
        sintaks: string;
        durasi: string;
        poin: Array<{ deskripsi: string; dpl?: string }>;
      };
    }>;
    kegiatanPenutup: {
      durasi: string;
      prinsip: string[];
      aktivitas: string[];
    };
  };
  asesmen: {
    awal: { jenis: string; bentuk: string; teknik: string };
    proses: { jenis: string; bentuk: string; teknik: string };
    akhir: { jenis: string; bentuk: string; teknik: string };
  };
  tandaTangan: {
    kepalaSekolah: string;
    nipKepalaSekolah: string;
    guru: string;
    nipGuru: string;
    titimangsa: string;
  };
  lampiran: {
    soalAwal: Array<{ no: number; soal: string; jawaban: string }>;
    rubrikSikap: Array<{ aspek: string; skala1: string; skala2: string; skala3: string; skala4: string }>;
    rubrikPengetahuan: Array<{ aspek: string; skala1: string; skala2: string; skala3: string; skala4: string }>;
    rubrikKeterampilan: Array<{ aspek: string; skala1: string; skala2: string; skala3: string; skala4: string }>;
    soalAkhir: Array<{ no: number; soal: string; jawaban: string }>;
    materiRingkas: { faktual: string; konseptual: string; prosedural: string };
    lkpd: {
      judul: string;
      petunjuk: string[];
      memahami: { teksPengantar: string; pertanyaan: string[] };
      mengaplikasikan: { kasusTugas: string; instruksi: string };
      merefleksikan: { pertanyaan: string[] };
      penutup: { pesanMotivasi: string; checklist: string[] };
    };
  };
}

export function getFallbackVisualRpmData(rawText?: string): VisualRpmData {
  const isSoleh = rawText && rawText.includes('Soleh');
  const kepsekName = isSoleh ? 'Soleh, S.Pd., M.Pd.' : 'Nasrudin, S.Pd., M.Pd.';

  return {
    identitas: {
      penyusun: 'Guru PJOK SD Negeri Kalimantong',
      sekolah: 'SD Negeri Kalimantong',
      tahunAjaran: '2026/2027',
      semester: 'Ganjil',
      mataPelajaran: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
      kelasFase: 'Kelas V (Lima) / Fase C',
      topik: 'Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola',
      alokasiWaktu: '2x40 Menit (1 Pertemuan)',
    },
    identifikasi: {
      pengetahuanAwal: 'Murid telah mengenal teknik dasar menendang bola saat bermain di luar sekolah, namun belum konsisten pada posisi kaki tumpu.',
      minatBelajar: 'Murid memiliki kecerdasan kinestetik tinggi dan antusias mengikuti tantangan berkelompok yang kompetitif dan menyenangkan.',
      kebutuhanBelajar: 'Murid memerlukan peragaan visual lambat (slow motion) dan adaptasi jarak operan bertahap.',
      materiFaktual: 'Bola sepak standar ukuran 4 empuk, corong pembatas (cone), peluit wasit, dan stopwatch.',
      materiKonseptual: 'Prinsip sudut pantul, titik sentuh bola, serta keselarasan ayunan tungkai kaki.',
      materiProsedural: 'Urutan gerak: awalan mendekati bola -> kaki tumpu di samping bola -> memutar pergelangan kaki -> menendang bola -> gerak lanjutan.',
      materiMetakognitif: 'Kemampuan mengoreksi sendiri arah lengkungan bola dan mengevaluasi kekompakan bersama teman pasangan.',
      dpl: ['Kolaborasi', 'Penalaran Kritis', 'Kemandirian', 'Kesehatan', 'Kewargaan'],
    },
    desain: {
      capaianPembelajaran: 'Peserta didik dapat menunjukkan kemampuan dalam mempraktikkan modifikasi berbagai aktivitas pola gerak dasar dan keterampilan gerak dilandasi dengan penerapan konsep dan prinsip gerak yang benar.',
      lintasDisiplin: 'IPA (Biomekanika sendi dan denyut jantung), Matematika (Sudut perkenaan dan jarak operan), Bahasa Indonesia (Komunikasi sportif antar-pemain).',
      tujuanPembelajaran: [
        'Murid dapat menjelaskan konsep posisi kaki tumpu dan perkenaan kaki bagian dalam pada bola secara tepat melalui pengamatan peragaan visual.',
        'Murid dapat mempraktikkan variasi gerak menendang dan menghentikan bola mendatar berpasangan dengan jarak 4 meter secara terkontrol.',
        'Murid dapat merefleksikan pentingnya kerja sama tim dan sportivitas serta menganalisis faktor penyebab operan melenceng bersama rekan latihan.',
      ],
      topikPembelajaran: 'Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola dengan Kaki Bagian Dalam',
      pendekatan: 'Pembelajaran Mendalam (Deep Learning - Mindful, Meaningful, Joyful)',
      model: 'Teaching Games for Understanding (TGfU) & Drill Berdiferensiasi',
      metode: 'Demonstrasi interaktif, sirkuit berpasangan, game tantangan gawang corong, refleksi dialogis.',
      kemitraan: 'Tutor sebaya antarmurid dan orang tua murid dalam pemantauan kebugaran harian di rumah.',
      lingkungan: 'Lapangan terbuka sekolah yang bersih, rata, dan aman dengan corong warna cerah.',
      digital: 'Tayangan video teknik gerak lambat (slow-motion) dan lembar pencatatan digital.',
    },
    pengalamanBelajar: {
      kegiatanAwal: {
        durasi: '15 Menit',
        prinsip: ['Berkesadaran (Mindful)', 'Bermakna (Meaningful)', 'Menggembirakan (Joyful)'],
        aktivitas: [
          'Guru mengucap salam hangat dan mengajak seorang murid memimpin doa bersama dengan khidmat (Berkesadaran).',
          'Guru menyapa kondisi kesehatan murid dan memeriksa presensi dengan yel-yel kelas yang bersemangat (Menggembirakan).',
          'Guru melakukan apersepsi bermakna dengan mengaitkan momen seru operan timnas sepak bola terhadap pentingnya akurasi passing (Bermakna).',
          'Murid melakukan pemanasan dinamis berpasangan lewat game "Ular Oper Bola" untuk menyalakan fokus motorik (Joyful).',
        ],
      },
      kegiatanInti: [
        {
          judulPertemuan: 'Pertemuan 1: Penguasaan Operan & Kontrol Presisi',
          prinsip: ['Berkesadaran (Mindful)', 'Bermakna (Meaningful)', 'Menggembirakan (Joyful)'],
          tahapMemahami: {
            sintaks: 'Orientasi pada Masalah & Eksplorasi Visual',
            durasi: '15 Menit',
            poin: [
              { deskripsi: 'Guru memperagakan dua jenis tendangan: satu tendangan melenceng akibat kaki tumpu terlalu jauh, dan satu tendangan akurat lurus di samping bola.', dpl: 'Bermakna' },
              { deskripsi: 'Murid mengamati secara saksama letak perkenaan bola pada sepatu dan video gerak lambat.', dpl: 'Penalaran Kritis' },
              { deskripsi: 'Murid berdiskusi berpasangan merumuskan 3 rahasia operan tepat sasaran: kaki tumpu, kunci pergelangan kaki, dan titik tengah bola.', dpl: 'Komunikasi' },
              { deskripsi: 'Murid mempraktikkan gerakan bayangan (shadow movement) tanpa bola untuk mengunci memori otot tungkai.', dpl: 'Kemandirian' },
            ],
          },
          tahapMengaplikasikan: {
            sintaks: 'Praktik Terbimbing & Tantangan Kasus Nyata',
            durasi: '30 Menit',
            poin: [
              { deskripsi: 'Murid berpasangan jarak 4 meter melakukan latihan operan mendatar dan menghentikan bola secara bergantian 15 kali.', dpl: 'Kolaborasi & Kesehatan' },
              { deskripsi: 'Pasangan latihan menerapkan teknik menghentikan bola (trapping) dengan telapak atau kaki dalam agar bola tidak terpental jauh.', dpl: 'Kemandirian' },
              { deskripsi: 'Guru memberikan bimbingan berdiferensiasi: murid mahir memperlebar jarak ke 6 meter, sedangkan murid berkembang berlatih pada jarak 3 meter.', dpl: 'Kemandirian' },
              { deskripsi: 'Murid mengikuti tantangan "Gerbang Presisi": mengoper bola melewati celah 2 corong selebar 50 cm tanpa menyentuh corong.', dpl: 'Kolaborasi & Kewargaan' },
            ],
          },
          tahapMerefleksi: {
            sintaks: 'Refleksi Kinerja Gerak & Penguatan Karakter',
            durasi: '15 Menit',
            poin: [
              { deskripsi: 'Murid duduk melingkar di bawah pohon rindang, meraba denyut nadi dan melakukan pernapasan relaksasi (stop-breathe-reflect).', dpl: 'Berkesadaran' },
              { deskripsi: 'Setiap murid saling memberikan satu apresiasi positif kepada rekan pasangannya atas kerja sama terbaik hari ini.', dpl: 'Komunikasi & Kolaborasi' },
              { deskripsi: 'Murid menganalisis kendala: mengapa bola sempat melenceng ke kanan atau melambung tinggi, lalu menemukan cara perbaikannya.', dpl: 'Penalaran Kritis' },
              { deskripsi: 'Murid menyimpulkan perbaikan gerak yang akan dilakukan dan mencatatnya dalam lembar refleksi pribadi.', dpl: 'Kemandirian' },
            ],
          },
        },
      ],
      kegiatanPenutup: {
        durasi: '5 Menit',
        prinsip: ['Berkesadaran (Mindful)', 'Menggembirakan (Joyful)'],
        aktivitas: [
          'Murid melakukan pendinginan peregangan otot tungkai dan lengan dengan rileks dan tenang (Kesehatan).',
          'Guru bersama murid menyimpulkan inti pembelajaran: akurasi operan dan komunikasi adalah kunci permainan sepak bola (Bermakna).',
          'Murid bersama-sama merapikan peralatan bola dan corong ke tempat semula dengan tertib (Kewargaan).',
          'Pembelajaran ditutup dengan doa syukur bersama dan tos kekompakan kelas (Menggembirakan).',
        ],
      },
    },
    asesmen: {
      awal: { jenis: 'Diagnostik Kognitif & Gerak', bentuk: 'Tanya jawab lisan 5 butir soal dan uji coba operan 3 kali', teknik: 'Lisan dan observasi awal' },
      proses: { jenis: 'Formatif Kinerja & Sikap DPL', bentuk: 'Lembar observasi antar-teman dan rubrik unjuk kerja 4 skala', teknik: 'Pengamatan kinerja langsung' },
      akhir: { jenis: 'Sumatif Lingkup Materi', bentuk: 'Tes unjuk kerja operan 5 kali berturut-turut ke sasaran dan lembar refleksi tertulis', teknik: 'Uji unjuk kerja terstandar' },
    },
    tandaTangan: {
      kepalaSekolah: kepsekName,
      nipKepalaSekolah: '19700318 199602 1 003',
      guru: 'Guru PJOK SD Negeri Kalimantong',
      nipGuru: '19880724 201503 1 003',
      titimangsa: 'Kalimantong, 13 Juli 2026',
    },
    lampiran: {
      soalAwal: [
        { no: 1, soal: 'Di bagian manakah letak kaki bagian dalam yang digunakan untuk menendang bola?', jawaban: 'Di sisi dalam telapak kaki, mulai dari bawah mata kaki dalam hingga sisi pangkal ibu jari kaki.' },
        { no: 2, soal: 'Ke arah manakah ujung kaki tumpu harus diarahkan saat kita akan mengoper bola ke teman?', jawaban: 'Mengarah lurus ke arah sasaran teman yang dituju.' },
        { no: 3, soal: 'Mengapa saat menendang bola dengan kaki bagian dalam, pergelangan kaki harus dikunci kuat?', jawaban: 'Agar tendangan bertenaga, stabil, dan pergelangan kaki tidak cedera atau bergeser.' },
        { no: 4, soal: 'Bagaimana sikap tubuh yang baik saat bola operan dari teman menggelinding ke arahmu?', jawaban: 'Tubuh sedikit condong ke depan, lutut lentur, dan siap menyambut bola dengan tenang.' },
        { no: 5, soal: 'Mengapa kita tidak boleh menertawakan teman yang operan bolanya belum tepat sasaran?', jawaban: 'Karena belajar membutuhkan proses, dan sikap sportif adalah saling menyemangati.' },
      ],
      rubrikSikap: [
        { aspek: 'Kolaborasi', skala1: 'Menolak bekerja sama dengan teman pasangan.', skala2: 'Mau bekerja sama namun pasif dan sering menyalahkan.', skala3: 'Aktif bekerja sama, berbagi bola secara adil, dan saling mendukung.', skala4: 'Menginspirasi, memimpin kekompakan tim, dan sangat menghargai kemampuan rekan.' },
        { aspek: 'Penalaran Kritis', skala1: 'Tidak menyadari kesalahan arah operan bola.', skala2: 'Menyadari bola melenceng namun tidak tahu penyebab posisi kakinya.', skala3: 'Mampu menganalisis kesalahan posisi kaki tumpu dan segera memperbaikinya.', skala4: 'Mampu menganalisis sudut perkenaan bola dan memberikan masukan solutif ke teman.' },
        { aspek: 'Kemandirian', skala1: 'Selalu bergantung pada arahan guru setiap kali menendang.', skala2: 'Memerlukan dorongan berulang kali untuk memulai tantangan.', skala3: 'Melakukan latihan secara tertib dan mandiri sesuai target 15 repetisi.', skala4: 'Sangat disiplin, mengatur ritme latihan sendiri dengan fokus tinggi tanpa diawasi.' },
      ],
      rubrikPengetahuan: [
        { aspek: 'Konsep Kaki Tumpu & Perkenaan', skala1: 'Skor < 68. Belum memahami posisi kaki tumpu dan titik sentuh bola.', skala2: 'Skor 68–78. Mampu menjelaskan 1 konsep dasar dengan bantuan bimbingan guru.', skala3: 'Skor 79–89. Mampu menjelaskan posisi kaki tumpu dan perkenaan bola secara mandiri.', skala4: 'Skor 90–100. Mampu menguraikan korelasi sudut kaki tumpu, ayunan panggul, dan akurasi laju bola secara ilmiah.' },
      ],
      rubrikKeterampilan: [
        { aspek: 'Menendang Kaki Bagian Dalam', skala1: 'Kaki tumpu salah, perkenaan meleset, bola melambung tak tentu arah.', skala2: 'Kaki tumpu benar namun pergelangan kaki belum dikunci; bola bergulir lemah.', skala3: 'Kaki tumpu dan perkenaan tepat; operan lurus terarah mencapai sasaran 3 dari 5 kali.', skala4: 'Gerakan luwes dan seimbang; operan melaju datar bertenaga serta tepat sasaran 5 dari 5 kali.' },
        { aspek: 'Menghentikan Bola (Trapping)', skala1: 'Bola memantul jauh atau terlepas saat hendak dihentikan.', skala2: 'Menghentikan bola namun posisi bola masih terpental lebih dari 1 meter.', skala3: 'Mampu menghentikan bola dengan tenang di depan badan dalam radius < 50 cm.', skala4: 'Kontrol bola sempurna, bola langsung tenang siap dialirkan kembali.' },
      ],
      soalAkhir: [
        { no: 1, soal: 'Jelaskan mengapa kaki tumpu harus diletakkan sejajar di samping bola berjarak sekitar 10-15 cm!', jawaban: 'Agar tubuh memiliki tumpuan stabil dan kaki penendang dapat berayun bebas mengenai titik tengah bola secara lurus mendatar.' },
        { no: 2, soal: 'Apa yang terjadi jika saat mengoper bola, badanmu condong terlalu jauh ke belakang?', jawaban: 'Titik kontak kaki akan mengenai bagian bawah bola sehingga bola melambung tinggi ke udara dan sulit dikontrol teman.' },
        { no: 3, soal: 'Sebutkan 3 nilai sportivitas yang harus selalu dijaga saat bermain sepak bola modifikasi!', jawaban: 'Menghormati keputusan wasit, menyalami kawan maupun lawan, dan tidak sombong saat menang.' },
        { no: 4, soal: 'Bagaimana cara mengatur kecepatan operan bola agar temanmu mudah menguasai bola?', jawaban: 'Menyesuaikan tenaga ayunan kaki dengan jarak teman dan memperhatikan kecepatan bola di atas permukaan rumput.' },
        { no: 5, soal: 'Tuliskan tindakan yang akan kamu lakukan jika teman pasanganmu merasa sedih karena bolanya belum terarah!', jawaban: 'Mengajaknya tersenyum, memberi semangat, dan berlatih bersama gerakan bayangan perlahan-lahan.' },
      ],
      materiRingkas: {
        faktual: 'Bola ukuran 4 standar SD, 10 corong penanda warna cerah, peluit, dan lapangan rumput datar.',
        konseptual: 'Kaki tumpu berfungsi sebagai kompas penentu arah bola; kaki penendang berfungsi sebagai pendorong momentum gaya gerak.',
        prosedural: '1. Berdiri menghadap sasaran. 2. Tempatkan kaki tumpu di samping bola. 3. Putar pergelangan kaki keluar. 4. Ayunkan kaki bagian dalam mengenai tengah bola. 5. Lanjutkan ayunan kaki.',
      },
      lkpd: {
        judul: 'LEMBAR KERJA PESERTA DIDIK (LKPD) VISUAL INTERAKTIF: OPERAN PRESISI BOLA BESAR',
        petunjuk: [
          'Berdoalah terlebih dahulu memohon keselamatan dan kelancaran belajar.',
          'Gunakan seragam olahraga rapi dan sepatu olahraga yang nyaman.',
          'Kerjakan tantangan ini bersama teman pasanganmu dengan kompak, riang gembira, dan saling mendukung!',
          'Tuliskan jawaban pengamatan dan refleksimu dengan rapi dan jujur.',
        ],
        memahami: {
          teksPengantar: 'Amati demonstrasi guru dan gambar ilustrasi di samping. Rahasia tendangan yang akurat bukan seberapa keras kamu menendang, melainkan ketepatan letak kaki tumpu dan sentuhan kaki pada titik tengah bola.',
          pertanyaan: [
            'Mengapa kaki tumpu harus diletakkan di samping bola dan bukan di belakang bola?',
            'Bagian bola manakah yang harus kamu sentuh agar bola menggelinding lurus menyusur rumput?',
            'Mengapa kamu dan teman pasanganmu harus saling memandang mata sebelum bola dioper?',
          ],
        },
        mengaplikasikan: {
          kasusTugas: 'Tantangan Gerbang Presisi: Atur 2 corong membentuk gerbang selebar 50 cm pada jarak 4 meter. Lakukan 10 kali operan bergantian yang wajib melewati celah gerbang tanpa menyentuh corong!',
          instruksi: 'Catat berapa kali operanmu dan temanmu berhasil lolos mulus! Diskusikan kesepakatan teknik operan terbaik yang kalian gunakan.',
        },
        merefleksikan: {
          pertanyaan: [
            'Bagaimana perasaanmu setelah berhasil menaklukkan tantangan operan gerbang bersama temanmu?',
            'Kesulitan apa yang paling kamu rasakan saat mengontrol bola? Bagaimana caramu memperbaikinya?',
            'Sikap baik dan kerja sama apa yang sudah kamu tunjukkan kepada teman pasanganmu hari ini?',
          ],
        },
        penutup: {
          pesanMotivasi: 'Seorang juara sejati adalah murid yang pantang menyerah, selalu menyemangati rekannya, dan bersyukur atas tubuh sehat yang dianugerahkan Tuhan!',
          checklist: [
            'Saya memahami fungsi kaki tumpu dalam mengarahkan bola.',
            'Saya dapat mengoper bola dengan kaki bagian dalam secara terarah.',
            'Saya mampu mengontrol bola dengan tenang di depan badan.',
            'Saya selalu menyemangati dan tidak menyalahkan teman pasangan.',
            'Saya merasa gembira dan tubuh saya semakin bugar hari ini.',
          ],
        },
      },
    },
  };
}
