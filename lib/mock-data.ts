import { Kelas, Siswa, TesKebugaranTKJI, PresensiHarian, LiveSession, JurnalMengajar } from './types';
import { calculateIMT, getScoreSprint40m, getScorePullUps, getScoreSitUps30s, getScoreVerticalJump, getScoreRun600m, determineTKJICategory } from './tkji';

export const INITIAL_CLASSES: Kelas[] = [
  {
    id: 'k-4a',
    nama: 'Kelas 4A',
    tingkat: 4,
    tahunAjaran: '2024/2025 Genap',
    waliKelas: 'Ibu Ratna Dewi, S.Pd.',
    guruPJOK: 'Pak Budi Santoso, S.Pd.Jas',
  },
  {
    id: 'k-4b',
    nama: 'Kelas 4B',
    tingkat: 4,
    tahunAjaran: '2024/2025 Genap',
    waliKelas: 'Bapak Ahmad Faisal, S.Pd.',
    guruPJOK: 'Pak Budi Santoso, S.Pd.Jas',
  },
  {
    id: 'k-5a',
    nama: 'Kelas 5A',
    tingkat: 5,
    tahunAjaran: '2024/2025 Genap',
    waliKelas: 'Ibu Siti Rahmawati, M.Pd.',
    guruPJOK: 'Pak Budi Santoso, S.Pd.Jas',
  },
];

export const INITIAL_STUDENTS: Siswa[] = [
  // Kelas 4A
  {
    id: 's-1',
    nisn: '0129841021',
    nama: 'Aditya Pratama Putra',
    gender: 'L',
    kelasId: 'k-4a',
    tanggalLahir: '2014-04-12',
    tinggiBadan: 138,
    beratBadan: 32,
    nomorAbsen: 1,
    kontakDarurat: '0812-3456-7890 (Ayah)',
  },
  {
    id: 's-2',
    nisn: '0129841022',
    nama: 'Anindya Putri Kirana',
    gender: 'P',
    kelasId: 'k-4a',
    tanggalLahir: '2014-07-21',
    tinggiBadan: 135,
    beratBadan: 29,
    nomorAbsen: 2,
    catatanMedis: 'Riwayat alergi debu lapangan',
    kontakDarurat: '0813-8877-6655 (Ibu)',
  },
  {
    id: 's-3',
    nisn: '0129841023',
    nama: 'Bagas Wahyu Ramadhan',
    gender: 'L',
    kelasId: 'k-4a',
    tanggalLahir: '2014-01-15',
    tinggiBadan: 142,
    beratBadan: 36,
    nomorAbsen: 3,
    kontakDarurat: '0815-1234-9876 (Wali)',
  },
  {
    id: 's-4',
    nisn: '0129841024',
    nama: 'Cantika Dewi Safitri',
    gender: 'P',
    kelasId: 'k-4a',
    tanggalLahir: '2014-09-08',
    tinggiBadan: 133,
    beratBadan: 28,
    nomorAbsen: 4,
    kontakDarurat: '0821-4321-8765 (Ibu)',
  },
  {
    id: 's-5',
    nisn: '0129841025',
    nama: 'Dimas Arya Nugroho',
    gender: 'L',
    kelasId: 'k-4a',
    tanggalLahir: '2014-03-30',
    tinggiBadan: 145,
    beratBadan: 44,
    nomorAbsen: 5,
    catatanMedis: 'Perlu pemantauan daya tahan kardiorespirasi (IMT lebih)',
    kontakDarurat: '0878-1122-3344 (Ayah)',
  },
  {
    id: 's-6',
    nisn: '0129841026',
    nama: 'Farhan Maulana Hakim',
    gender: 'L',
    kelasId: 'k-4a',
    tanggalLahir: '2014-06-18',
    tinggiBadan: 139,
    beratBadan: 33,
    nomorAbsen: 6,
    kontakDarurat: '0819-9988-7766 (Ibu)',
  },
  {
    id: 's-7',
    nisn: '0129841027',
    nama: 'Gita Nurul Aulia',
    gender: 'P',
    kelasId: 'k-4a',
    tanggalLahir: '2014-11-05',
    tinggiBadan: 136,
    beratBadan: 30,
    nomorAbsen: 7,
    catatanMedis: 'Riwayat asma ringan, sediakan inhaler saat lari jauh',
    kontakDarurat: '0812-7766-5544 (Ayah)',
  },
  {
    id: 's-8',
    nisn: '0129841028',
    nama: 'Hafiz Rizky Zulkarnain',
    gender: 'L',
    kelasId: 'k-4a',
    tanggalLahir: '2014-02-28',
    tinggiBadan: 140,
    beratBadan: 34,
    nomorAbsen: 8,
    kontakDarurat: '0857-4433-2211 (Ibu)',
  },
  {
    id: 's-9',
    nisn: '0129841029',
    nama: 'Indah Permata Sari',
    gender: 'P',
    kelasId: 'k-4a',
    tanggalLahir: '2014-08-14',
    tinggiBadan: 134,
    beratBadan: 31,
    nomorAbsen: 9,
    kontakDarurat: '0813-2233-4455 (Ayah)',
  },
  {
    id: 's-10',
    nisn: '0129841030',
    nama: 'Kevin Samuel Christian',
    gender: 'L',
    kelasId: 'k-4a',
    tanggalLahir: '2014-05-20',
    tinggiBadan: 141,
    beratBadan: 35,
    nomorAbsen: 10,
    kontakDarurat: '0822-6655-4433 (Ibu)',
  },
  
  // Kelas 4B Sample
  {
    id: 's-11',
    nisn: '0129841031',
    nama: 'Lutfi Hakim Pratama',
    gender: 'L',
    kelasId: 'k-4b',
    tanggalLahir: '2014-03-10',
    tinggiBadan: 140,
    beratBadan: 33,
    nomorAbsen: 1,
    kontakDarurat: '0812-8899-0011 (Ayah)',
  },
  {
    id: 's-12',
    nisn: '0129841032',
    nama: 'Meisya Aurelia Zahra',
    gender: 'P',
    kelasId: 'k-4b',
    tanggalLahir: '2014-07-02',
    tinggiBadan: 137,
    beratBadan: 29,
    nomorAbsen: 2,
    kontakDarurat: '0813-9900-1122 (Ibu)',
  },
  {
    id: 's-13',
    nisn: '0129841033',
    nama: 'Naufal Althaf Rabbani',
    gender: 'L',
    kelasId: 'k-4b',
    tanggalLahir: '2014-01-22',
    tinggiBadan: 143,
    beratBadan: 36,
    nomorAbsen: 3,
    kontakDarurat: '0856-1122-3344 (Ayah)',
  },

  // Kelas 5A Sample
  {
    id: 's-14',
    nisn: '0119842041',
    nama: 'Raihan Dwi Saputra',
    gender: 'L',
    kelasId: 'k-5a',
    tanggalLahir: '2013-05-19',
    tinggiBadan: 147,
    beratBadan: 39,
    nomorAbsen: 1,
    kontakDarurat: '0812-4455-6677 (Ayah)',
  },
  {
    id: 's-15',
    nisn: '0119842042',
    nama: 'Siti Syakira Humaira',
    gender: 'P',
    kelasId: 'k-5a',
    tanggalLahir: '2013-09-11',
    tinggiBadan: 142,
    beratBadan: 34,
    nomorAbsen: 2,
    kontakDarurat: '0877-3344-5566 (Ibu)',
  },
];

// Helper to create a realistic TKJI test record
function makeTKJIRecord(siswa: Siswa, dateStr: string, sprint: number, pull: number, sit: number, jump: number, run: number): TesKebugaranTKJI {
  const scoreSprint = getScoreSprint40m(sprint, siswa.gender);
  const scorePullUps = getScorePullUps(pull, siswa.gender);
  const scoreSitUps = getScoreSitUps30s(sit, siswa.gender);
  const scoreJump = getScoreVerticalJump(jump, siswa.gender);
  const scoreRun = getScoreRun600m(run, siswa.gender);
  const totalNilai = scoreSprint + scorePullUps + scoreSitUps + scoreJump + scoreRun;
  const kategori = determineTKJICategory(totalNilai);
  const { imt, kategori: kategoriImt } = calculateIMT(siswa.beratBadan, siswa.tinggiBadan);

  return {
    id: `tkji-${siswa.id}`,
    siswaId: siswa.id,
    tanggal: dateStr,
    usia: 11,
    sprintSec: sprint,
    pullUps: pull,
    sitUps: sit,
    verticalJumpCm: jump,
    runSec: run,
    scoreSprint,
    scorePullUps,
    scoreSitUps,
    scoreJump,
    scoreRun,
    totalNilai,
    kategori,
    imt,
    kategoriImt,
    catatan: totalNilai >= 18 ? 'Kebugaran sangat prima, pertahankan!' : totalNilai >= 14 ? 'Kebugaran sedang, tingkatkan latihan kardio.' : 'Perlu latihan fisik bertahap 3x seminggu.',
  };
}

export const INITIAL_TKJI: TesKebugaranTKJI[] = [
  makeTKJIRecord(INITIAL_STUDENTS[0], '2025-02-15', 6.5, 25, 20, 39, 142), // Aditya (Baik)
  makeTKJIRecord(INITIAL_STUDENTS[1], '2025-02-15', 7.2, 19, 15, 30, 170), // Anindya (Sedang)
  makeTKJIRecord(INITIAL_STUDENTS[2], '2025-02-15', 6.2, 42, 24, 47, 126), // Bagas (Sangat Baik)
  makeTKJIRecord(INITIAL_STUDENTS[3], '2025-02-15', 7.4, 18, 14, 29, 175), // Cantika (Sedang)
  makeTKJIRecord(INITIAL_STUDENTS[4], '2025-02-15', 8.2, 8, 10, 23, 215),  // Dimas (Kurang)
  makeTKJIRecord(INITIAL_STUDENTS[5], '2025-02-15', 6.8, 23, 19, 38, 148), // Farhan (Baik)
  makeTKJIRecord(INITIAL_STUDENTS[6], '2025-02-15', 8.0, 10, 11, 25, 205), // Gita (Kurang)
  makeTKJIRecord(INITIAL_STUDENTS[7], '2025-02-15', 6.4, 30, 21, 41, 138), // Hafiz (Baik)
  makeTKJIRecord(INITIAL_STUDENTS[8], '2025-02-15', 7.1, 20, 16, 32, 165), // Indah (Sedang)
  makeTKJIRecord(INITIAL_STUDENTS[9], '2025-02-15', 6.6, 26, 18, 37, 145), // Kevin (Baik)
];

export const INITIAL_PRESENSI: PresensiHarian[] = [
  {
    id: 'pres-1',
    tanggal: '2025-03-03',
    kelasId: 'k-4a',
    cuaca: 'Cerah',
    suhuUdara: '27°C',
    catatanGuru: 'Semua siswa mengenakan seragam olahraga lengkap. Pemanasan 15 menit berjalan tertib.',
    records: [
      { siswaId: 's-1', status: 'hadir' },
      { siswaId: 's-2', status: 'hadir' },
      { siswaId: 's-3', status: 'hadir' },
      { siswaId: 's-4', status: 'hadir' },
      { siswaId: 's-5', status: 'hadir', keterangan: 'Sedikit flu, lari interval disesuaikan' },
      { siswaId: 's-6', status: 'hadir' },
      { siswaId: 's-7', status: 'hadir', keterangan: 'Asma dipantau guru' },
      { siswaId: 's-8', status: 'hadir' },
      { siswaId: 's-9', status: 'sakit', keterangan: 'Surat izin sakit dari orang tua' },
      { siswaId: 's-10', status: 'hadir' },
    ],
  },
];

export const INITIAL_JURNAL: JurnalMengajar[] = [
  {
    id: 'jrn-1',
    tanggal: '2025-03-03',
    kelasId: 'k-4a',
    materi: 'Latihan Sirkuit Kebugaran Jasmani (Kelincahan & Daya Tahan Jantung-Paru)',
    faseKurikulum: 'Fase B (Kelas 4)',
    elemenCapaian: 'Pemanfaatan Gerak & Pengembangan Kebugaran Jasmani',
    tujuanPembelajaran: 'Peserta didik mampu mempraktikkan aktivitas jasmani dan latihan kebugaran jasmani terkait kesehatan (daya tahan aerobik dan kelincahan shuttle run) sesuai potensi.',
    ringkasanAktivitas: 'Siswa dibagi 4 pos: Pos 1 Shuttle Run 4x5m, Pos 2 Jumping Jack 30 detik, Pos 3 Lari Bolak-Balik Zigzag, Pos 4 Istirahat teratur.',
    kendalaDanSolusi: 'Dua siswa kelelahan di Pos 1 karena cuaca cukup terik; solusi istirahat hidrasi diperbanyak per 10 menit.',
  },
];

// LocalStorage Persistence Helpers
const STORAGE_PREFIX = 'sadarpjok_';

export function loadData<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
    return defaultVal;
  }
}

export function saveData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}
