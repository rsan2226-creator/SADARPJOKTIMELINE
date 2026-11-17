export interface LkpdData {
  identitas: {
    judulLkpd: string;
    temaTopik: string;
    mataPelajaran: string;
    jenjang: string;
    kelasFase: string;
    alokasiWaktu: string;
    modelPembelajaran: string;
    sintaksModel: string[];
    tujuanPembelajaran: string[];
    dimensiProfilLulusan: string[];
  };
  petunjukPenggunaan: {
    langkahMengerjakan: string[];
    alatDanBahan: string[];
    caraMenjawab: string;
  };
  sintaksDanPengalamanBelajar: {
    memahami: {
      tahapSintaks: string; // misal: "Tahap 1: Orientasi Siswa pada Masalah & Eksplorasi Stimulus"
      judulBagian: string;
      stimulusTeks: string;
      ilustrasiAtauGambarDeskripsi: string;
      pertanyaanPemahaman: Array<{
        nomor: number;
        soal: string;
        panduanJawabanSiswa: string;
      }>;
    };
    mengaplikasikan: {
      tahapSintaks: string; // misal: "Tahap 2: Penyelidikan Kasus Nyata & Eksperimen Mandiri/Kelompok"
      judulBagian: string;
      studiKasusNyata: string;
      instruksiKerja: string[];
      tugasAktivitas: string;
      panduanRuangKerja: string;
    };
    merefleksikan: {
      tahapSintaks: string; // misal: "Tahap 3: Evaluasi Hasil & Refleksi Pengalaman Belajar"
      judulBagian: string;
      pertanyaanRefleksi: Array<{
        nomor: number;
        pertanyaan: string;
        fokusRefleksi: string;
      }>;
    };
  };
  penutup: {
    pesanPenyemangat: string;
    kolomCekPemahamanDiri: Array<{
      aspek: string;
      pilihan: string[];
    }>;
    catatanDanParafGuru: {
      ruangCatatan: string;
      skalaNilai: string;
    };
  };
}

export function getFallbackLkpdData(
  mapel?: string,
  jenjang?: string,
  kelas?: string,
  fase?: string,
  model?: string,
  topik?: string,
  tujuan?: string,
  dpl?: string[]
): LkpdData {
  const m = mapel || 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)';
  const j = jenjang || 'Sekolah Dasar (SD)';
  const k = kelas || 'Kelas V';
  const f = fase || 'Fase C';
  const mdl = model || 'Problem Based Learning (PBL) & Games for Understanding';
  const tpk = topik || 'Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola';
  const tj = tujuan || 'Peserta didik dapat menganalisis konsep posisi kaki tumpu, mempraktikkan operan dan kontrol bola mendatar berpasangan secara terarah, serta merefleksikan pentingnya kerja sama tim.';
  const dims = dpl && dpl.length > 0 ? dpl : ['Kolaborasi', 'Penalaran Kritis', 'Kemandirian', 'Kesehatan'];

  return {
    identitas: {
      judulLkpd: 'LEMBAR KERJA PESERTA DIDIK (LKPD) PEMBELAJARAN MENDALAM',
      temaTopik: tpk,
      mataPelajaran: m,
      jenjang: j,
      kelasFase: `${k} / ${f}`,
      alokasiWaktu: '2 × 35 Menit (1 Pertemuan)',
      modelPembelajaran: mdl,
      sintaksModel: [
        'Orientasi pada Masalah',
        'Mengorganisasi Belajar Berpasangan',
        'Penyelidikan Kinerja Gerak di Lapangan',
        'Mengembangkan Solusi Akurasi Operan',
        'Analisis & Evaluasi Refleksi Diri',
      ],
      tujuanPembelajaran: [
        'Murid dapat menjelaskan alasan pentingnya posisi kaki tumpu sejajar bola melalui pengamatan demonstrasi gerak.',
        'Murid dapat mempraktikkan variasi operan kaki bagian dalam dan kontrol bola pada jarak 4 meter secara presisi.',
        'Murid dapat menganalisis penyebab bola melenceng dan menemukan teknik perbaikan bersama rekan latihan.',
        'Murid menunjukkan sikap sportif, saling menyemangati, dan disiplin selama aktivitas permainan.',
      ],
      dimensiProfilLulusan: dims,
    },
    petunjukPenggunaan: {
      langkahMengerjakan: [
        'Berdoalah bersama sebelum memulai aktivitas agar selalu diberikan keselamatan dan keberkahan.',
        'Pastikan kamu mengenakan pakaian olahraga lengkap, kaos kaki, dan sepatu olahraga yang aman.',
        'Bekerjasamalah secara kompak dan adil dengan rekan pasangan yang telah ditentukan oleh guru.',
        'Amati teks dan panduan gambar secara saksama sebelum turun mempraktikkan tantangan di lapangan.',
        'Jawablah setiap pertanyaan dan tuliskan hasil analisismu dengan jujur pada ruang jawaban yang disediakan.',
      ],
      alatDanBahan: [
        '1 buah bola sepak bola ukuran 4 (busa/kulit empuk)',
        '2 buah cone/corong penanda warna cerah',
        '1 buah stopwatch/alat pengukur waktu (opsional)',
        'Alat tulis (pulpen/pensil) untuk mencatat hasil latihan',
      ],
      caraMenjawab: 'Tuliskan jawaban langsung pada garis atau kotak yang telah disediakan dengan kalimat sendiri yang jelas, runtut, dan komunikatif.',
    },
    sintaksDanPengalamanBelajar: {
      memahami: {
        tahapSintaks: 'Tahap 1 Sintaks: Orientasi Masalah & Eksplorasi Konseptual (Pengalaman Belajar: Memahami)',
        judulBagian: 'Bagian 1: Memahami Rahasia Akurasi Tendangan Bola',
        stimulusTeks: `Pernahkah kamu menonton pertandingan sepak bola di mana seorang pemain mengoper bola dengan sangat halus, namun bola meluncur lurus persis ke kaki rekannya? Di sisi lain, mungkin kamu pernah melihat bola yang ditendang sekuat tenaga malah melambung liar ke udara atau melenceng keluar lapangan. 
Rahasia terbesar dari sebuah operan yang akurat bukanlah seberapa keras otot kakimu mengayun, melainkan LETAK KAKI TUMPU dan TITIK PERKENAAN SEPATU pada bola. Kaki tumpu bertindak ibarat kompas penunjuk arah: ke mana ujung jarinya mengarah, ke sanalah gaya dorong bola akan mengalir. Bila kaki tumpumu berada 10–15 cm sejajar di samping bola dan pergelangan kakimu dikunci ke arah luar, bidang datar kaki bagian dalam akan mendorong titik tengah bola secara stabil dan menggelinding mulus menyusur rumput.`,
        ilustrasiAtauGambarDeskripsi: 'Ilustrasi posisi tampak atas: Sepatu kiri (kaki tumpu) diletakkan 10-15 cm di samping kiri bola dengan ujung jari menghadap lurus ke sasaran, sedangkan sepatu kanan berayun dengan sisi dalam menyentuh tepat di titik tengah bola.',
        pertanyaanPemahaman: [
          {
            nomor: 1,
            soal: 'Berdasarkan teks di atas, mengapa kaki tumpu diibaratkan sebagai "kompas penunjuk arah" dalam melakukan operan bola?',
            panduanJawabanSiswa: 'Jelaskan korelasi arah ujung kaki tumpu dengan arah laju bola...',
          },
          {
            nomor: 2,
            soal: 'Apa yang akan terjadi pada laju bola jika saat menendang, kakimu mengenai bagian paling bawah bola dan badanmu condong ke belakang?',
            panduanJawabanSiswa: 'Uraikan lintasan arah bola (apakah mendatar atau melambung tinggi) beserta alasannya...',
          },
          {
            nomor: 3,
            soal: 'Mengapa pergelangan kaki harus dikunci kuat ke arah luar saat menyentuh bola dengan kaki bagian dalam?',
            panduanJawabanSiswa: 'Jelaskan alasan kestabilan benturan dan pencegahan cedera pergelangan kaki...',
          },
        ],
      },
      mengaplikasikan: {
        tahapSintaks: 'Tahap 2 Sintaks: Penyelidikan Lapangan & Pemecahan Masalah Nyata (Pengalaman Belajar: Mengaplikasikan)',
        judulBagian: 'Bagian 2: Mengaplikasikan Gerak dalam Tantangan Kasus Nyata',
        studiKasusNyata: `KASUS NYATA LAPANGAN:
Kamu dan rekan pasanganmu (Edo) tergabung dalam satu tim mini. Dalam simulasi game, Edo selalu mengeluhkan operan yang kamu kirimkan sering melompat-lompat liar dan sulit dihentikan (trapping), sehingga bola kerap lepas dan direbut lawan. Setelah diamati, kamu terbiasa menendang bola sambil berlari kencang tanpa memperhatikan jarak pijakan kaki tumpumu.
Tugas kalian adalah memecahkan masalah ini melalui latihan terstruktur "Tantangan Gerbang Presisi Berpasangan".`,
        instruksiKerja: [
          'Pasang 2 buah cone berjarak 60 cm di tengah-tengah lapangan sebagai "Gerbang Sasaran".',
          'Berdirilah berhadapan dengan rekan pasanganmu dengan jarak masing-masing 2 meter dari gerbang (total jarak antar-pemain = 4 meter).',
          'Lakukan 10 kali operan mendatar secara bergantian melewati celah gerbang tanpa menyentuh cone.',
          'Pemain penerima wajib menghentikan bola dengan kaki bagian dalam hingga bola berhenti tenang di depan badan (jarak bola < 50 cm).',
          'Catat hasil keberhasilan operan dan kendala yang kamu rasakan pada lembar pengamatan di bawah ini.',
        ],
        tugasAktivitas: 'Tantangan 10 Operan Gerbang Presisi & Kontrol Dingin Berpasangan',
        panduanRuangKerja: 'Tuliskan hasil pengamatanmu: Jumlah operan sukses melewati gerbang tanpa menyentuh cone (misal: 8 dari 10), serta bagaimana kamu dan pasanganmu saling mengingatkan posisi kaki tumpu saat latihan.',
      },
      merefleksikan: {
        tahapSintaks: 'Tahap 3 Sintaks: Analisis Kinerja, Evaluasi & Tindak Lanjut (Pengalaman Belajar: Merefleksikan)',
          judulBagian: 'Bagian 3: Merefleksikan Proses Belajar dan Solusi Perbaikan',
          pertanyaanRefleksi: [
            {
              nomor: 1,
              pertanyaan: 'Saat melakukan latihan tadi, kesulitan apa yang paling kamu rasakan saat menendang atau mengontrol bola? Apa yang menjadi penyebab kesulitan tersebut?',
              fokusRefleksi: 'Identifikasi kendala teknis (posisi kaki, kecepatan ayunan, atau koordinasi mata-kaki)...',
            },
            {
              nomor: 2,
              pertanyaan: 'Bagaimana caramu dan rekan pasanganmu bekerja sama serta saling memberikan saran tanpa saling menyalahkan ketika bola melenceng?',
              fokusRefleksi: 'Refleksi dimensi kolaborasi, komunikasi sportif, dan empati antarteman...',
            },
            {
              nomor: 3,
              pertanyaan: 'Rencana perbaikan apa yang akan kamu lakukan pada latihan berikutnya agar operan dan kontrol bolamu menjadi semakin matang dan percaya diri?',
              fokusRefleksi: 'Rencana tindak lanjut nyata yang akan dipraktikkan pada pertemuan mendatang...',
            },
          ],
        },
      },
      penutup: {
      pesanPenyemangat: '“Kehebatan seorang atlet bukan diukur dari ketiadaan kesalahan, melainkan dari keberaniannya belajar dari setiap operan yang meleset dan selalu menyemangati rekannya. Tetap bugar, ceria, dan bangga berproses!”',
      kolomCekPemahamanDiri: [
        {
          aspek: 'Saya dapat menjelaskan fungsi kaki tumpu dalam mengarahkan operan bola.',
          pilihan: ['Sangat Paham', 'Paham', 'Perlu Berlatih Lagi'],
        },
        {
          aspek: 'Saya mampu mengoper bola mendatar melewati gerbang tanpa menyentuh corong.',
          pilihan: ['Sangat Mampu', 'Cukup Mampu', 'Perlu Berlatih Lagi'],
        },
        {
          aspek: 'Saya mampu mengontrol bola dengan tenang sehingga bola tidak memantul jauh.',
          pilihan: ['Sangat Mampu', 'Cukup Mampu', 'Perlu Berlatih Lagi'],
        },
        {
          aspek: 'Saya selalu menyemangati dan mendengarkan masukan dari teman pasangan saya.',
          pilihan: ['Selalu', 'Sering', 'Kadang-kadang'],
        },
        {
          aspek: 'Saya merasa senang, bersemangat, dan tubuh saya semakin bugar hari ini.',
          pilihan: ['Sangat Senang', 'Senang', 'Biasa Saja'],
        },
      ],
      catatanDanParafGuru: {
        ruangCatatan: 'Guru memberikan apresiasi atas kedisiplinan gerak, konsistensi kaki tumpu, dan kekompakan sportif bersama teman.',
        skalaNilai: 'Sangat Baik (A) / Baik (B) / Cukup (C)',
      },
    },
  };
}
