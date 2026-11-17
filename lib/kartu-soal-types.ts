import { buildCommandAlignedQuestions } from './soal-topic-engine';

export interface KartuSoalItem {
  nomorSoal: number;
  tujuanPembelajaran: string;
  indikatorSoal: string;
  materi: string;
  bukuSumber: string;
  stimulus?: string;
  deskripsiGambar?: string;
  pertanyaan: string;
  pilihan: {
    A: string;
    B: string;
    C: string;
    D: string;
    E?: string;
  };
  kunci: 'A' | 'B' | 'C' | 'D' | 'E';
  pembahasan: string;
  taksonomiBloom: string; // C1, C2, C3, C4, C5, C6
  digunakanUntuk: string; // ASTS, ASAS, SAS, Harian
  tanggal?: string;
  jumlahSiswa?: number | string;
  keterangan?: string;
}

export interface KartuSoalDocData {
  judul: string;
  tahunPelajaran: string;
  namaSekolah: string;
  namaPenyusun: string;
  mataPelajaran: string;
  bentukSoal: string;
  kelas: string;
  semester: string;
  kurikulum: string;
  bukuSumberDefault: string;
  items: KartuSoalItem[];
}

export function getDefaultKartuSoalDocData(): KartuSoalDocData {
  return {
    judul: 'KARTU SOAL ASESMEN SUMATIF AKHIR SEMESTER (ASAS)',
    tahunPelajaran: '2025 / 2026',
    namaSekolah: 'SMP MERDEKA',
    namaPenyusun: 'Lendi Ike Hermawan, S.Pd.',
    mataPelajaran: 'MATEMATIKA',
    bentukSoal: 'Pilihan Ganda',
    kelas: '8G',
    semester: '2',
    kurikulum: 'MERDEKA',
    bukuSumberDefault: 'MATEMATIKA untuk SMP/MTS kelas VIII, Penerbit Erlangga',
    items: [
      {
        nomorSoal: 1,
        tujuanPembelajaran: '3.6 Menjelaskan dan membuktikan teorema Pythagoras dan tripel Pythagoras\n4.6 Menyelesaikan masalah yang berkaitan dengan teorema Pythagoras dan tripel Pythagoras',
        indikatorSoal: 'Disajikan gambar segitiga siku-siku dengan sisi x, y, dan hipotenusa z, peserta didik dapat menentukan rumus teorema Pythagoras yang tepat.',
        materi: 'Teorema Pythagoras',
        bukuSumber: 'MATEMATIKA untuk SMP/MTS kelas VIII, Penerbit Erlangga',
        deskripsiGambar: 'Segitiga siku-siku dengan sisi alas x, sisi tegak y, sudut siku-siku di antara x dan y, serta sisi miring (hipotenusa) z.',
        pertanyaan: 'Rumus Pythagoras yang tepat untuk gambar segitiga siku-siku tersebut adalah...',
        pilihan: {
          A: 'z² = x² - y²',
          B: 'z² = x² + y²',
          C: 'x² = z² + y²',
          D: 'y² = x² + z²',
          E: 'z = x + y',
        },
        kunci: 'B',
        pembahasan: 'Berdasarkan Teorema Pythagoras, kuadrat panjang sisi miring (hipotenusa z) sama dengan jumlah kuadrat panjang sisi-sisi siku-sikunya (x dan y), sehingga berlaku rumus z² = x² + y².',
        taksonomiBloom: 'C2',
        digunakanUntuk: 'ASTS',
        tanggal: '16 Maret 2026',
        jumlahSiswa: 32,
        keterangan: 'Kunci B - Valid',
      },
      {
        nomorSoal: 2,
        tujuanPembelajaran: '3.6 Menjelaskan dan membuktikan teorema Pythagoras dan tripel Pythagoras',
        indikatorSoal: 'Peserta didik dapat menghitung panjang sisi miring segitiga siku-siku jika diketahui panjang kedua sisi siku-sikunya.',
        materi: 'Penerapan Teorema Pythagoras',
        bukuSumber: 'MATEMATIKA untuk SMP/MTS kelas VIII, Penerbit Erlangga',
        pertanyaan: 'Sebuah segitiga siku-siku memiliki panjang sisi siku-siku masing-masing 6 cm dan 8 cm. Panjang sisi miring segitiga tersebut adalah...',
        pilihan: {
          A: '10 cm',
          B: '12 cm',
          C: '14 cm',
          D: '16 cm',
          E: '20 cm',
        },
        kunci: 'A',
        pembahasan: 'Panjang sisi miring c = √(a² + b²) = √(6² + 8²) = √(36 + 64) = √100 = 10 cm.',
        taksonomiBloom: 'C3',
        digunakanUntuk: 'ASTS',
        tanggal: '16 Maret 2026',
        jumlahSiswa: 32,
        keterangan: 'Kunci A - Valid',
      },
      {
        nomorSoal: 3,
        tujuanPembelajaran: '3.6 Menjelaskan dan membuktikan teorema Pythagoras dan tripel Pythagoras',
        indikatorSoal: 'Peserta didik dapat menentukan kelompok bilangan yang merupakan tripel Pythagoras.',
        materi: 'Tripel Pythagoras',
        bukuSumber: 'MATEMATIKA untuk SMP/MTS kelas VIII, Penerbit Erlangga',
        pertanyaan: 'Di antara kelompok tiga bilangan berikut, yang merupakan tripel Pythagoras adalah...',
        pilihan: {
          A: '4, 5, 6',
          B: '5, 12, 13',
          C: '7, 24, 26',
          D: '8, 15, 18',
          E: '9, 12, 16',
        },
        kunci: 'B',
        pembahasan: 'Uji nilai: 5² + 12² = 25 + 144 = 169. Dan 13² = 169. Karena 5² + 12² = 13², maka (5, 12, 13) merupakan tripel Pythagoras.',
        taksonomiBloom: 'C2',
        digunakanUntuk: 'ASTS',
        tanggal: '16 Maret 2026',
        jumlahSiswa: 32,
        keterangan: 'Kunci B - Valid',
      },
      {
        nomorSoal: 4,
        tujuanPembelajaran: '4.6 Menyelesaikan masalah yang berkaitan dengan teorema Pythagoras dan tripel Pythagoras',
        indikatorSoal: 'Disajikan masalah kontekstual tentang tangga yang disandarkan pada tembok, peserta didik dapat menghitung jarak kaki tangga ke tembok.',
        materi: 'Aplikasi Teorema Pythagoras dalam Kehidupan Sehari-hari',
        bukuSumber: 'MATEMATIKA untuk SMP/MTS kelas VIII, Penerbit Erlangga',
        stimulus: 'Sebuah tangga dengan panjang 5 meter disandarkan pada dinding tembok sebuah rumah. Ujung atas tangga tepat mencapai bibir jendela di lantai dua yang tingginya 4 meter dari permukaan tanah datar.',
        pertanyaan: 'Jarak antara ujung bawah (kaki) tangga dengan dinding tembok tersebut adalah...',
        pilihan: {
          A: '2 meter',
          B: '2,5 meter',
          C: '3 meter',
          D: '3,5 meter',
          E: '4 meter',
        },
        kunci: 'C',
        pembahasan: 'Jarak kaki tangga (a) = √(panjang tangga² - tinggi jendela²) = √(5² - 4²) = √(25 - 16) = √9 = 3 meter.',
        taksonomiBloom: 'C4',
        digunakanUntuk: 'ASTS',
        tanggal: '16 Maret 2026',
        jumlahSiswa: 32,
        keterangan: 'Kunci C - Valid (HOTS)',
      },
      {
        nomorSoal: 5,
        tujuanPembelajaran: '4.6 Menyelesaikan masalah yang berkaitan dengan teorema Pythagoras dan tripel Pythagoras',
        indikatorSoal: 'Peserta didik dapat menentukan jenis segitiga (lancip, siku-siku, tumpul) berdasarkan perbandingan kuadrat sisi-sisinya.',
        materi: 'Kebalikan Teorema Pythagoras',
        bukuSumber: 'MATEMATIKA untuk SMP/MTS kelas VIII, Penerbit Erlangga',
        pertanyaan: 'Diketahui sebuah segitiga memiliki panjang sisi-sisi 9 cm, 12 cm, dan 16 cm. Jenis segitiga tersebut berdasarkan hubungan kuadrat sisinya adalah...',
        pilihan: {
          A: 'Segitiga lancip',
          B: 'Segitiga siku-siku',
          C: 'Segitiga tumpul',
          D: 'Segitiga sama sisi',
          E: 'Segitiga sembarang lancip',
        },
        kunci: 'C',
        pembahasan: 'Hitung kuadrat sisi terpanjang: 16² = 256. Hitung jumlah kuadrat dua sisi lainnya: 9² + 12² = 81 + 144 = 225. Karena c² > a² + b² (256 > 225), maka segitiga tersebut adalah segitiga tumpul.',
        taksonomiBloom: 'C4',
        digunakanUntuk: 'ASTS',
        tanggal: '16 Maret 2026',
        jumlahSiswa: 32,
        keterangan: 'Kunci C - Valid',
      },
    ],
  };
}

export function getPjokKartuSoalDocData(): KartuSoalDocData {
  return {
    judul: 'KARTU SOAL ASESMEN SUMATIF AKHIR SEMESTER (ASAS)',
    tahunPelajaran: '2025 / 2026',
    namaSekolah: 'SD NEGERI KALIMANTONG',
    namaPenyusun: 'Guru PJOK, S.Pd.',
    mataPelajaran: 'PENDIDIKAN JASMANI, OLAHRAGA, DAN KESEHATAN (PJOK)',
    bentukSoal: 'Pilihan Ganda',
    kelas: 'Kelas V',
    semester: '1 (Ganjil)',
    kurikulum: 'MERDEKA',
    bukuSumberDefault: 'Buku Panduan Guru PJOK Kelas V, Kemendikbudristek RI',
    items: [
      {
        nomorSoal: 1,
        tujuanPembelajaran: 'Mempraktikkan dan menganalisis variasi serta kombinasi pola gerak dasar mengoper dan menembak bola dalam permainan sepak bola.',
        indikatorSoal: 'Disajikan deskripsi posisi gerak dasar menendang bola menggunakan kaki bagian dalam, peserta didik dapat menentukan posisi kaki tumpu yang benar.',
        materi: 'Pola Gerak Dasar Permainan Invasi (Sepak Bola)',
        bukuSumber: 'Buku Panduan Guru PJOK Kelas V, Kemendikbudristek RI',
        stimulus: 'Akurasi sebuah operan mendatar sangat dipengaruhi oleh posisi kaki tumpu saat menahan keseimbangan tubuh sebelum kaki penendang diayunkan.',
        deskripsiGambar: 'Bagan posisi kaki tumpu di samping bola sejauh 10-15 cm dengan lutut sedikit ditekuk.',
        pertanyaan: 'Posisi kaki tumpu yang benar saat melakukan gerak spesifik menendang bola menggunakan kaki bagian dalam adalah...',
        pilihan: {
          A: 'Diletakkan di samping bola berjarak sekitar 10–15 cm dengan ujung kaki menghadap sasaran',
          B: 'Diletakkan di belakang bola sejauh 40 cm dengan badan tegak',
          C: 'Diletakkan di depan bola untuk menghadang pergerakan bola',
          D: 'Menginjak bagian atas bola sebelum menendang',
          E: 'Menyilang di belakang kaki penendang',
        },
        kunci: 'A',
        pembahasan: 'Kaki tumpu diletakkan di samping bola berjarak sekitar 10–15 cm dengan ujung kaki menghadap arah sasaran dan lutut sedikit ditekuk agar keseimbangan stabil saat mengayun kaki penendang.',
        taksonomiBloom: 'C2',
        digunakanUntuk: 'ASAS',
        tanggal: '08 Desember 2025',
        jumlahSiswa: 28,
        keterangan: 'Kunci A - Valid',
      },
      {
        nomorSoal: 2,
        tujuanPembelajaran: 'Mempraktikkan dan menganalisis variasi serta kombinasi pola gerak dasar passing bawah dalam permainan bola voli.',
        indikatorSoal: 'Peserta didik dapat menentukan perkenaan bola yang tepat pada lengan saat melakukan passing bawah.',
        materi: 'Pola Gerak Dasar Permainan Net (Bola Voli)',
        bukuSumber: 'Buku Panduan Guru PJOK Kelas V, Kemendikbudristek RI',
        pertanyaan: 'Agar bola memantul dengan stabil dan mudah diarahkan saat melakukan passing bawah pada permainan bola voli, bidang perkenaan bola pada lengan adalah di...',
        pilihan: {
          A: 'Ujung jari-jari kedua tangan yang dirapatkan',
          B: 'Bagian pergelangan tangan hingga sedikit di atas pergelangan tangan (lengan bawah)',
          C: 'Tepat di siku tangan yang ditekuk',
          D: 'Lengan bagian atas dekat dengan bahu',
          E: 'Telapak tangan bagian dalam dengan membuka jari',
        },
        kunci: 'B',
        pembahasan: 'Bidang perkenaan bola yang ideal pada passing bawah bola voli adalah bagian lengan bawah di atas pergelangan tangan, dengan kedua lengan lurus dan rapat.',
        taksonomiBloom: 'C2',
        digunakanUntuk: 'ASAS',
        tanggal: '08 Desember 2025',
        jumlahSiswa: 28,
        keterangan: 'Kunci B - Valid',
      },
      {
        nomorSoal: 3,
        tujuanPembelajaran: 'Menerapkan dan mengevaluasi aktivitas latihan peningkatan kebugaran jasmani daya tahan jantung-paru.',
        indikatorSoal: 'Disajikan situasi latihan interval lari bolak-balik, peserta didik dapat menganalisis manfaat latihan tersebut bagi komponen kebugaran jasmani.',
        materi: 'Latihan Kebugaran Jasmani Dasar (TKJI)',
        bukuSumber: 'Buku Panduan Guru PJOK Kelas V, Kemendikbudristek RI',
        stimulus: 'Setiap pekan, siswa kelas V melakukan latihan lari joging berkelanjutan selama 12 menit mengelilingi lapangan sekolah dengan ritme teratur.',
        pertanyaan: 'Bentuk latihan lari berkelanjutan selama 12 menit tersebut bertujuan utama untuk melatih dan meningkatkan komponen kebugaran...',
        pilihan: {
          A: 'Kelenturan persendian panggul',
          B: 'Daya tahan kardiorespirasi (jantung dan paru-paru)',
          C: 'Kekuatan maksimal otot lengan',
          D: 'Kecepatan reaksi gerak refleks',
          E: 'Keseimbangan statis tubuh',
        },
        kunci: 'B',
        pembahasan: 'Lari berkelanjutan dengan durasi lebih dari 10–12 menit melatih sistem aerobik tubuh yang memperkuat kerja jantung dan kapasitas pernapasan paru-paru (daya tahan kardiorespirasi).',
        taksonomiBloom: 'C3',
        digunakanUntuk: 'ASAS',
        tanggal: '08 Desember 2025',
        jumlahSiswa: 28,
        keterangan: 'Kunci B - Valid',
      },
    ],
  };
}

export function buildKartuSoalFromInput(params: {
  teksSoal?: string;
  namaSekolah?: string;
  namaPenyusun?: string;
  mataPelajaran?: string;
  kelas?: string;
  semester?: string;
  kurikulum?: string;
  tahunPelajaran?: string;
  bentukSoal?: string;
  bukuSumber?: string;
  digunakanUntuk?: string;
  jumlahSiswa?: number;
  instruksiKhusus?: string;
}): KartuSoalDocData {
  const {
    teksSoal = '',
    namaSekolah = 'SD NEGERI KALIMANTONG',
    namaPenyusun = 'Guru Mata Pelajaran',
    mataPelajaran = 'PJOK',
    kelas = 'Kelas V',
    semester = 'Ganjil',
    kurikulum = 'MERDEKA',
    tahunPelajaran = '2026 / 2027',
    bentukSoal = 'Pilihan Ganda',
    bukuSumber = 'Buku Panduan Guru Kemendikbudristek RI',
    digunakanUntuk = 'ASAS',
    jumlahSiswa = 32,
    instruksiKhusus = '',
  } = params;

  const lines = String(teksSoal || '')
    .replace(/\r\n/g, '\n')
    .split('\n');

  interface DraftQ {
    nomor: number;
    lines: string[];
    pilihan: Partial<Record<'A' | 'B' | 'C' | 'D' | 'E', string>>;
    kunci?: 'A' | 'B' | 'C' | 'D' | 'E';
    pembahasan?: string;
  }

  const drafts: DraftQ[] = [];
  let current: DraftQ | null = null;

  const pushCurrent = () => {
    if (current && (current.lines.some((l) => l.trim()) || Object.keys(current.pilihan).length > 0)) {
      drafts.push(current);
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const soalHeaderMatch = line.match(/^SOAL\s*(\d+)\s*[:.)-]?\s*(.*)$/i);
    if (soalHeaderMatch) {
      pushCurrent();
      current = {
        nomor: Number(soalHeaderMatch[1]) || drafts.length + 1,
        lines: soalHeaderMatch[2] ? [soalHeaderMatch[2].trim()] : [],
        pilihan: {},
      };
      continue;
    }

    const numStartMatch = line.match(/^(\d+)[\.\)]\s+(.+)$/);
    if (numStartMatch && (!current || Object.keys(current.pilihan).length > 0 || current.kunci)) {
      pushCurrent();
      current = {
        nomor: Number(numStartMatch[1]) || drafts.length + 1,
        lines: [numStartMatch[2].trim()],
        pilihan: {},
      };
      continue;
    }

    if (!current) {
      current = { nomor: 1, lines: [], pilihan: {} };
    }

    const optMatch = line.match(/^([A-E])[\.\)]\s*(.+)$/i);
    if (optMatch) {
      const key = optMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E';
      current.pilihan[key] = optMatch[2].trim();
      continue;
    }

    const keyMatch = line.match(/^(?:kunci\s*jawaban|kunci|jawaban)\s*[:\-]?\s*([A-E])\b/i);
    if (keyMatch) {
      current.kunci = keyMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E';
      continue;
    }

    const pembahasanMatch = line.match(/^(?:pembahasan|penjelasan)\s*[:\-]\s*(.+)$/i);
    if (pembahasanMatch) {
      current.pembahasan = pembahasanMatch[1].trim();
      continue;
    }

    current.lines.push(line);
  }
  pushCurrent();

  const hasParsedQuestions =
    drafts.length > 0 &&
    drafts.some((d) => d.lines.join(' ').trim().length >= 8 && (Object.keys(d.pilihan).length >= 2 || d.kunci || drafts.length >= 2));

  let items: KartuSoalItem[] = [];

  if (hasParsedQuestions) {
    items = drafts.map((d, idx) => {
      const qText = d.lines.join(' ').trim() || `Butir Soal Nomor ${idx + 1} (${mataPelajaran})`;
      const kunci = d.kunci || 'A';
      const pilihan = {
        A: d.pilihan.A || 'Pilihan A',
        B: d.pilihan.B || 'Pilihan B',
        C: d.pilihan.C || 'Pilihan C',
        D: d.pilihan.D || 'Pilihan D',
        ...(d.pilihan.E ? { E: d.pilihan.E } : {}),
      };
      const correctText = pilihan[kunci] || pilihan.A;

      return {
        nomorSoal: d.nomor || idx + 1,
        tujuanPembelajaran: `Peserta didik mampu memahami dan menyelesaikan permasalahan terkait materi ${mataPelajaran} (${kelas}).`,
        indikatorSoal: `Disajikan butir soal nomor ${d.nomor || idx + 1}, peserta didik dapat menentukan jawaban yang tepat mengenai "${qText.slice(0, 75)}${qText.length > 75 ? '...' : ''}".`,
        materi: `${mataPelajaran} - Butir Soal ${d.nomor || idx + 1}`,
        bukuSumber,
        pertanyaan: qText,
        pilihan,
        kunci,
        pembahasan:
          d.pembahasan ||
          `Jawaban yang paling tepat adalah ${kunci} (${correctText}) sesuai konsep dasar ${mataPelajaran}.`,
        taksonomiBloom: idx % 3 === 2 ? 'C3' : 'C2',
        digunakanUntuk,
        jumlahSiswa,
        keterangan: `Kunci ${kunci} - Valid`,
      };
    });
  } else {
    const topicText = teksSoal.trim() || mataPelajaran;
    const generated = buildCommandAlignedQuestions({
      mapel: mataPelajaran,
      kelas,
      fase: kurikulum,
      materiOrTp: topicText,
      instruksiKhusus,
      komposisi: { pg: 5, pgKompleks: 0, menjodohkan: 0, isianSingkat: 0, uraian: 0, opsiPg: 5 },
      ranges: {
        pg: { count: 5, start: 1 },
        pgKompleks: { count: 0, start: 0 },
        menjodohkan: { count: 0, start: 0 },
        isianSingkat: { count: 0, start: 0 },
        uraian: { count: 0, start: 0 },
      },
      applyOpsiFn: (item) => item,
    });

    items = generated.pgList.map((pg, idx) => ({
      nomorSoal: idx + 1,
      tujuanPembelajaran: pg.tpRef,
      indikatorSoal: `Disajikan stimulus/pertanyaan mengenai ${pg.ruangLingkup}, peserta didik dapat menentukan jawaban yang tepat.`,
      materi: pg.ruangLingkup,
      bukuSumber,
      stimulus: pg.stimulus,
      deskripsiGambar: pg.deskripsiGambar,
      pertanyaan: pg.pertanyaan,
      pilihan: {
        A: pg.pilihan.A,
        B: pg.pilihan.B,
        C: pg.pilihan.C,
        D: pg.pilihan.D || 'Pilihan D',
        ...(pg.pilihan.E ? { E: pg.pilihan.E } : {}),
      },
      kunci: pg.kunci,
      pembahasan: `Berdasarkan konsep ${pg.ruangLingkup}, pilihan ${pg.kunci} (${pg.pilihan[pg.kunci]}) merupakan jawaban paling tepat.`,
      taksonomiBloom: pg.levelBloom.split(' ')[0] || 'C2',
      digunakanUntuk,
      jumlahSiswa,
      keterangan: `Kunci ${pg.kunci} - Valid`,
    }));
  }

  return {
    judul: `KARTU SOAL ${digunakanUntuk.toUpperCase()}`.trim(),
    tahunPelajaran,
    namaSekolah,
    namaPenyusun,
    mataPelajaran,
    bentukSoal,
    kelas,
    semester,
    kurikulum,
    bukuSumberDefault: bukuSumber,
    items,
  };
}
