export interface VisualLkpdSection {
  id: string;
  tipe: 'stimulus' | 'soal_isian' | 'pilihan_ganda' | 'mencocokkan' | 'kasus_nyata' | 'refleksi' | 'checklist' | 'tabel_kerja';
  judulBagian: string;
  ikon: string; // e.g. '📌' | '✏️' | '💡' | '🔍' | '🎯' | '⭐'
  warnaCard: 'cyan' | 'amber' | 'emerald' | 'purple' | 'rose' | 'indigo';
  instruksi?: string;
  teksKonten?: string;
  ilustrasiDeskripsi?: string;
  butirSoal?: Array<{
    nomor: number | string;
    pertanyaan: string;
    kunciJawabanRef?: string;
    ruangJawabanHeight?: 'sm' | 'md' | 'lg';
  }>;
  itemMencocokkan?: Array<{
    kiri: string;
    kanan: string;
  }>;
  itemChecklist?: string[];
}

export interface VisualLkpdData {
  identitas: {
    judulLkpd: string;
    mataPelajaran: string;
    kelasFase: string;
    topikMateri: string;
    alokasiWaktu: string;
    sekolah?: string;
    petunjukUmum: string[];
  };
  bagianList: VisualLkpdSection[];
  penutup: {
    pesanPenyemangat?: string;
    catatanGuru?: string;
    titimangsa?: string;
    namaGuru?: string;
  };
}

export function parseRawLkpdToVisual(rawText: string): VisualLkpdData {
  const fallback = getFallbackVisualLkpdData();
  if (!rawText || rawText.trim().length < 20) {
    return fallback;
  }

  // Extract lines
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  let judul = fallback.identitas.judulLkpd;
  let mapel = fallback.identitas.mataPelajaran;
  let kelas = fallback.identitas.kelasFase;
  let topik = fallback.identitas.topikMateri;
  let waktu = fallback.identitas.alokasiWaktu;

  // Simple heuristic header detection
  for (const line of lines) {
    if (line.toLowerCase().includes('mata pelajaran:') || line.toLowerCase().includes('mapel:')) {
      mapel = line.split(':')[1]?.trim() || mapel;
    } else if (line.toLowerCase().includes('kelas') || line.toLowerCase().includes('fase:')) {
      kelas = line.split(':')[1]?.trim() || line;
    } else if (line.toLowerCase().includes('topik:') || line.toLowerCase().includes('materi:')) {
      topik = line.split(':')[1]?.trim() || topik;
    } else if (line.toLowerCase().includes('alokasi waktu:') || line.toLowerCase().includes('waktu:')) {
      waktu = line.split(':')[1]?.trim() || waktu;
    } else if (line.toLowerCase().includes('lkpd') || line.toLowerCase().includes('lembar kerja')) {
      judul = line;
    }
  }

  return {
    ...fallback,
    identitas: {
      ...fallback.identitas,
      judulLkpd: judul,
      mataPelajaran: mapel,
      kelasFase: kelas,
      topikMateri: topik,
      alokasiWaktu: waktu,
    },
  };
}

export function getFallbackVisualLkpdData(): VisualLkpdData {
  return {
    identitas: {
      judulLkpd: 'LEMBAR KERJA PESERTA DIDIK (LKPD) INTERAKTIF',
      mataPelajaran: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
      kelasFase: 'Kelas V (Lima) / Fase C',
      topikMateri: 'Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola',
      alokasiWaktu: '2 × 40 Menit (1 Pertemuan)',
      sekolah: 'SD Negeri Kalimantong',
      petunjukUmum: [
        'Berdoalah terlebih dahulu sebelum memulai kegiatan pembelajaran.',
        'Gunakan pakaian olahraga lengkap dan sepatu yang nyaman dan aman.',
        'Bekerjasamalah secara kompak dan saling menghargai bersama rekan pasanganmu.',
        'Bacalah instruksi dan stimulus gambar secara teliti sebelum mengisi jawaban.',
      ],
    },
    bagianList: [
      {
        id: 'sec-1',
        tipe: 'stimulus',
        judulBagian: 'Eksplorasi Konsep & Stimulus Pengamatan',
        ikon: '🔍',
        warnaCard: 'cyan',
        instruksi: 'Amati ilustrasi posisi kaki penendang dan kaki tumpu di bawah ini dengan saksama!',
        teksKonten: 'Akurasi sebuah operan sangat ditentukan oleh letak kaki tumpu dan titik sentuh sepatu pada bola. Kaki tumpu diletakkan di samping bola (berjarak 10–15 cm) dengan ujung jari menghadap lurus ke arah sasaran. Kunci sendi pergelangan kaki ke arah luar saat mengayunkan kaki bagian dalam agar bola meluncur datar menyusur rumput.',
        ilustrasiDeskripsi: 'Ilustrasi posisi tampak atas: Sepatu kiri (kaki tumpu) diletakkan 10-15 cm di samping kiri bola dengan ujung jari menghadap lurus ke sasaran, sedangkan sepatu kanan berayun dengan sisi dalam menyentuh tepat di titik tengah bola.',
      },
      {
        id: 'sec-2',
        tipe: 'soal_isian',
        judulBagian: 'Pertanyaan Pemahaman & Analisis Kritis',
        ikon: '✏️',
        warnaCard: 'amber',
        instruksi: 'Jawablah pertanyaan berikut dengan bahasa yang jelas dan tepat!',
        butirSoal: [
          {
            nomor: 1,
            pertanyaan: 'Mengapa ujung jari kaki tumpu harus selalu dihadapkan lurus ke arah sasaran teman yang dituju?',
            kunciJawabanRef: 'Karena arah ujung jari kaki tumpu bertindak sebagai kompas penentu gaya dorong bola...',
            ruangJawabanHeight: 'md',
          },
          {
            nomor: 2,
            pertanyaan: 'Apa yang terjadi pada arah dan lintasan bola jika saat menendang, kakimu menyentuh bagian paling bawah bola dan badanmu condong ke belakang?',
            kunciJawabanRef: 'Bola akan melambung tinggi ke udara dan sulit dikontrol oleh rekan satu tim...',
            ruangJawabanHeight: 'md',
          },
          {
            nomor: 3,
            pertanyaan: 'Bagian sepatu manakah yang memiliki permukaan paling luas dan datar untuk menghasilkan operan yang stabil?',
            kunciJawabanRef: 'Kaki bagian dalam (dimulai dari bawah mata kaki dalam hingga pangkal ibu jari kaki)...',
            ruangJawabanHeight: 'sm',
          },
        ],
      },
      {
        id: 'sec-3',
        tipe: 'mencocokkan',
        judulBagian: 'Tantangan Mencocokkan: Istilah & Fungsi Gerak',
        ikon: '📌',
        warnaCard: 'emerald',
        instruksi: 'Tariklah garis lurus atau pasangkan istilah gerak di sebelah kiri dengan fungsi/karakteristiknya yang tepat di sebelah kanan!',
        itemMencocokkan: [
          {
            kiri: 'Kaki Tumpu di Samping Bola',
            kanan: 'Menentukan kompas arah sasaran dan stabilitas tubuh',
          },
          {
            kiri: 'Kaki Bagian Dalam',
            kanan: 'Permukaan datar untuk menghasilkan operan lurus dan terukur',
          },
          {
            kiri: 'Menghentikan Bola (Trapping)',
            kanan: 'Meredam momentum bola agar berhenti tenang di depan badan',
          },
          {
            kiri: 'Follow Through (Gerak Lanjutan)',
            kanan: 'Menyempurnakan ayunan kaki dan mencegah ketegangan otot',
          },
        ],
      },
      {
        id: 'sec-4',
        tipe: 'kasus_nyata',
        judulBagian: 'Misi Lapangan Nyata: Tantangan Gerbang Presisi',
        ikon: '🎯',
        warnaCard: 'purple',
        instruksi: 'Lakukan tantangan praktik berpasangan bersama rekan latihanmu di lapangan!',
        teksKonten: 'Pasang 2 buah cone berjarak 50 cm sebagai gerbang sasaran pada jarak 4 meter. Lakukan 10 kali operan mendatar bergantian yang wajib melewati celah gerbang tanpa menyentuh cone sama sekali!',
        butirSoal: [
          {
            nomor: 'Tugas',
            pertanyaan: 'Berapa kali operanmu dan pasanganmu yang berhasil lolos mulus? Apa kendala yang kalian alami saat bola melenceng?',
            kunciJawabanRef: 'Catatan hasil latihan kami: Berhasil lolos ... dari 10 kali percobaan. Kendala: ...',
            ruangJawabanHeight: 'lg',
          },
        ],
      },
      {
        id: 'sec-5',
        tipe: 'refleksi',
        judulBagian: 'Refleksi Berkesadaran & Tindak Lanjut',
        ikon: '💡',
        warnaCard: 'rose',
        instruksi: 'Renungkan proses belajarmu hari ini dengan jujur dan penuh kesadaran.',
        butirSoal: [
          {
            nomor: 1,
            pertanyaan: 'Sebelum dan sesudah belajar hari ini, apa hal baru yang paling kamu sadari tentang teknik menendang bola?',
            ruangJawabanHeight: 'md',
          },
          {
            nomor: 2,
            pertanyaan: 'Sikap kerja sama dan saling menyemangati apa yang sudah kamu tunjukkan kepada teman pasanganmu?',
            ruangJawabanHeight: 'md',
          },
        ],
      },
      {
        id: 'sec-6',
        tipe: 'checklist',
        judulBagian: 'Checklist Pemahaman & Sikap Diri',
        ikon: '⭐',
        warnaCard: 'indigo',
        instruksi: 'Beri tanda centang (✓) pada kotak jika kamu telah menguasai kompetensi berikut:',
        itemChecklist: [
          'Saya memahami fungsi kaki tumpu sebagai kompas penentu arah bola.',
          'Saya mampu melakukan operan mendatar menggunakan kaki bagian dalam secara terarah.',
          'Saya mampu menghentikan bola dengan tenang di depan badan.',
          'Saya selalu sportif, mendengarkan masukan, dan tidak menyalahkan teman pasangan.',
          'Saya merasa gembira dan tubuh saya semakin bugar hari ini.',
        ],
      },
    ],
    penutup: {
      pesanPenyemangat: '✨ “Juara sejati tidak pernah berhenti belajar, selalu menyemangati rekannya, dan bersyukur atas tubuh sehat yang dianugerahkan Tuhan!”',
      catatanGuru: 'Peserta didik menunjukkan antusiasme tinggi, kerja sama sportif, dan pemahaman konsep gerak yang sangat baik.',
      titimangsa: 'Kalimantong, 13 Juli 2026',
      namaGuru: 'Guru PJOK SD Negeri Kalimantong',
    },
  };
}
