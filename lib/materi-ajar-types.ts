export interface MateriAjarData {
  identitas: {
    judulMateri: string;
    mataPelajaran: string;
    jenjang: string;
    kelas: string;
    fase: string;
    topikPembelajaran: string;
    tujuanPembelajaran: string;
    levelBloom: string;
    dimensiProfilLulusan: string[];
    alokasiWaktu?: string;
  };
  pendahuluan: {
    kalimatApersepsi: string;
    pertanyaanPemantik: string[];
    analogiMenarik?: string;
  };
  isiMateri: {
    konsepUtama: Array<{
      subjudul: string;
      penjelasan: string;
      faktaKunci?: string;
      analogiAtauContoh?: string;
    }>;
    prosedurDanLangkah: Array<{
      tahap: string;
      langkah: string;
      tipsPenting?: string;
    }>;
    contohKonkret: Array<{
      judulKasus: string;
      deskripsi: string;
      pelajaran: string;
    }>;
    miskonsepsiUmum?: Array<{
      salahPaham: string;
      penjelasanBenar: string;
    }>;
  };
  aktivitasDanLatihan: {
    instruksiAktivitas: string;
    tugasMandiriAtauKelompok: string[];
    pertanyaanCekPemahaman: Array<{
      soal: string;
      levelKognitif: string;
      petunjukJawaban?: string;
    }>;
  };
  penutup: {
    rangkumanPoinKunci: string[];
    pesanMotivasi: string;
    titimangsa: string;
    penyusun: string;
  };
}

export function getFallbackMateriAjarData(
  mapel: string = 'PJOK',
  jenjang: string = 'SD',
  kelas: string = 'Kelas V',
  fase: string = 'Fase C',
  topik: string = 'Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola',
  tujuan: string = 'Peserta didik dapat memahami prinsip ayunan kaki dan mempraktikkan operan mendatar berpasangan dengan akurat dan sportif.',
  levelBloom: string = 'C3 - Menerapkan / Mengaplikasikan',
  dimensi: string[] = ['Kolaborasi', 'Penalaran Kritis', 'Kemandirian', 'Kesehatan']
): MateriAjarData {
  return {
    identitas: {
      judulMateri: `Materi Ajar: ${topik}`,
      mataPelajaran: mapel,
      jenjang: jenjang,
      kelas: kelas,
      fase: fase,
      topikPembelajaran: topik,
      tujuanPembelajaran: tujuan,
      levelBloom: levelBloom,
      dimensiProfilLulusan: dimensi.length > 0 ? dimensi : ['Kolaborasi', 'Penalaran Kritis', 'Kemandirian', 'Kesehatan'],
      alokasiWaktu: '2 × 40 Menit (1 Pertemuan)',
    },
    pendahuluan: {
      kalimatApersepsi:
        'Pernahkah kamu menonton pertandingan sepak bola di mana seorang pemain memberikan umpan bola yang meluncur sangat mulus dan tepat di kaki rekannya tanpa melambung tinggi? Atau mungkin saat kamu bermain bola di halaman sekolah, tendanganmu melenceng jauh ke samping? Keberhasilan sebuah operan bola ternyata bukan semata-mata karena tenaga yang kuat, melainkan penerapan sudut dan letak kaki tumpu yang tepat!',
      pertanyaanPemantik: [
        'Mengapa saat mengoper teman yang dekat, kita lebih dianjurkan memakai kaki bagian dalam daripada ujung jari sepatu (cocor)?',
        'Apa yang menentukan arah laju bola saat kaki kita mulai mengayun menendang?',
        'Bagaimana kerja sama dan komunikasi antarteman membuat permainan bola menjadi lebih menyenangkan dan kompak?',
      ],
      analogiMenarik:
        'Bayangkan kaki tumpumu seperti kompas navigasi kapal dan kaki ayunmu seperti stik golf. Jika kompas mengarah ke utara, maka kapal akan melaju ke utara. Kaki tumpu menentukan kompas arah bola!',
    },
    isiMateri: {
      konsepUtama: [
        {
          subjudul: '1. Hakikat dan Prinsip Dasar Passing Kaki Bagian Dalam',
          penjelasan:
            'Passing menggunakan kaki bagian dalam adalah teknik mengoper bola yang paling sering digunakan dalam sepak bola modern karena menawarkan permukaan kontak yang luas dan datar. Hal ini meminimalkan risiko bola terpental liar dan menghasilkan laju bola mendatar menyusur tanah (ground pass).',
          faktaKunci:
            'Sekitar 70% dari seluruh operan dalam pertandingan sepak bola profesional dilakukan menggunakan kaki bagian dalam karena tingkat akurasinya yang paling tinggi.',
          analogiAtauContoh:
            'Seperti mendorong buku di atas meja dengan telapak tangan terbuka dibanding mendorong dengan satu jari; telapak tangan memberi dorongan lurus yang stabil.',
        },
        {
          subjudul: '2. Peran Krusial Kaki Tumpu sebagai Poros Gerak',
          penjelasan:
            'Kaki tumpu bukan hanya penahan berat tubuh, melainkan penentu utama akurasi dan elevasi bola. Kaki tumpu harus diletakkan tepat di samping bola dengan jarak 10–15 cm dan lutut sedikit ditekuk (fleksi) untuk menjaga titik berat badan tetap seimbang.',
          faktaKunci:
            'Jika kaki tumpu terlalu jauh di belakang bola, tubuh akan condong ke belakang dan bola otomatis melambung ke udara.',
          analogiAtauContoh:
            'Kaki tumpu berfungsi seperti tripod kamera yang kokoh agar gambar yang diambil tidak goyang.',
        },
        {
          subjudul: '3. Teknik Menghentikan Bola (Trapping) dengan Meredam Energi',
          penjelasan:
            'Menghentikan bola bukan berarti menahan bola dengan kaku seperti dinding semen, melainkan menarik sedikit kaki ke belakang saat bola menyentuh sepatu agar gaya benturan diredam. Hal ini membuat bola berhenti jinak di dekat kaki sendiri.',
          faktaKunci:
            'Prinsip fisika impuls dan momentum: memperpanjang waktu kontak akan mengurangi gaya benturan bola sehingga bola tidak memantul menjauh.',
        },
      ],
      prosedurDanLangkah: [
        {
          tahap: 'Tahap 1: Posisi Awalan (Approach)',
          langkah:
            'Berdiri tegak menghadap arah bola datang atau sasaran. Ambil ancang-ancang mundur 2-3 langkah dengan pandangan fokus ke bola dan teman rekan.',
          tipsPenting: 'Jangan tegang; rilekskan bahu dan buka kedua lengan sedikit ke samping untuk keseimbangan.',
        },
        {
          tahap: 'Tahap 2: Menempatkan Kaki Tumpu',
          langkah:
            'Langkahkan kaki non-dominan ke samping bola berjarak sekitar 10-15 cm. Arahkan ujung jari kaki tumpu tegak lurus ke target sasaran.',
          tipsPenting: 'Tekuk sedikit lutut kaki tumpu agar pusat gravitasi tubuh stabil.',
        },
        {
          tahap: 'Tahap 3: Ayunan dan Sentuhan Bola (Impact)',
          langkah:
            'Tarik kaki penendang ke belakang, putar pergelangan kaki ke arah luar hingga terkunci. Ayunkan kaki ke depan menyentuh tepat di titik tengah bola menggunakan sisi dalam sepatu.',
          tipsPenting: 'Kunci sendi engkel agar perkenaan bola kokoh dan tidak berbelok arah.',
        },
        {
          tahap: 'Tahap 4: Gerak Lanjutan (Follow Through)',
          langkah:
            'Lanjutkan ayunan kaki penendang searah sasaran bola dan mendarat kembali dengan seimbang.',
          tipsPenting: 'Gerak lanjutan mencegah otot paha depan kram dan menyempurnakan laju bola.',
        },
      ],
      contohKonkret: [
        {
          judulKasus: 'Latihan Berpasangan Jarak 4 Meter (Dua Sentuhan)',
          deskripsi:
            'Ahmad dan Budi berlatih berpasangan. Ahmad mengoper bola mendatar ke arah Budi. Budi meredam bola dengan kaki bagian dalam (sentuhan pertama), lalu segera mengoper kembali ke Ahmad (sentuhan kedua).',
          pelajaran:
            'Latihan dua sentuhan melatih kontrol emosi, konsentrasi indra kinestetik, dan kebiasaan tidak terburu-buru.',
        },
        {
          judulKasus: 'Tantangan Melewati Gerbang Corong (Cone Gate)',
          deskripsi:
            'Dua corong diletakkan berjarak 50 cm. Siswa ditantang melakukan 10 kali operan mendatar bergantian yang wajib melewati celah gerbang tanpa menabrak corong.',
          pelajaran:
            'Mengembangkan penalaran kritis dalam mengoreksi sudut datang bola serta menumbuhkan jiwa sportivitas.',
        },
      ],
      miskonsepsiUmum: [
        {
          salahPaham: 'Mengoper bola harus dilakukan sekeras-kerasnya agar cepat sampai ke teman.',
          penjelasanBenar:
            'Operan yang terlalu keras justru sulit dikontrol rekan dan mudah lepas dari penguasaan. Yang terpenting adalah akurasi dan laju bola yang terukur.',
        },
        {
          salahPaham: 'Menendang bola dengan ujung sepatu (cocor) menghasilkan tendangan yang lebih baik.',
          penjelasanBenar:
            'Ujung sepatu memiliki bidang sentuh yang sangat kecil dan runcing, sehingga bola mudah melenceng secara acak dan berisiko mencederai jari kaki.',
        },
      ],
    },
    aktivitasDanLatihan: {
      instruksiAktivitas:
        'Lakukan aktivitas belajar aktif di bawah ini baik secara mandiri di rumah maupun bersama kelompok kecil di lapangan:',
      tugasMandiriAtauKelompok: [
        'Lakukan gerakan bayangan (shadow practice) teknik menendang kaki bagian dalam tanpa bola sebanyak 15 kali di depan cermin untuk mengunci memori otot.',
        'Latih operan pantul ke dinding datar dari jarak 2 meter sebanyak 20 kali secara konsisten dan amati sudut pantulan bola.',
        'Catat pada jurnal harian: berapa kali kamu berhasil mengontrol bola dengan tenang tanpa bola terpental lebih dari 30 cm dari kakimu.',
      ],
      pertanyaanCekPemahaman: [
        {
          soal: 'Mengapa letak ujung jari kaki tumpu dikatakan sebagai kompas arah bola?',
          levelKognitif: 'C2 - Memahami',
          petunjukJawaban: 'Jelaskan hubungan antara garis hadap jari kaki tumpu dengan vektor dorongan kaki penendang.',
        },
        {
          soal: 'Jika kamu ingin mengoper teman yang sedang berlari ke ruang kosong di sebelah kanan, bagaimana kamu menyesuaikan arah kaki tumpu dan kekuatan ayunan kakimu?',
          levelKognitif: 'C3 - Menerapkan',
          petunjukJawaban: 'Uraikan modifikasi sudut kaki tumpu dan estimasi kecepatan lari teman.',
        },
        {
          soal: 'Bandingkan dampak operan mendatar vs operan lambung tinggi saat menghadapi lawan yang bertubuh jangkung dan rapat bertahan!',
          levelKognitif: 'C4 - Menganalisis',
          petunjukJawaban: 'Analisis keuntungan operan menyusur rumput yang lebih cepat sampai dan sulit dipotong lawan tinggi.',
        },
      ],
    },
    penutup: {
      rangkumanPoinKunci: [
        'Kunci akurasi passing kaki bagian dalam: Kaki tumpu 10-15 cm di samping bola mengarah ke target.',
        'Kunci bola mendatar: Sentuh bola tepat pada titik tengah dengan pergelangan kaki terkunci keluar.',
        'Kunci kontrol empuk (trapping): Tarik kaki sedikit ke belakang untuk meredam momentum bola.',
        'Kunci kebersamaan: Selalu dukung rekan, jaga sportivitas, dan hargai setiap proses belajar.',
      ],
      pesanMotivasi:
        '✨ "Keahlian gerak bukan bakat bawaan sejak lahir, melainkan buah dari latihan yang tekun, sikap rendah hati, dan tubuh yang senantiasa disyukuri kesehatannya!"',
      titimangsa: 'Kalimantong, 13 Juli 2026',
      penyusun: 'Guru PJOK SD Negeri Kalimantong',
    },
  };
}
