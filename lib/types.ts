export type Gender = 'L' | 'P'; // Laki-laki / Perempuan

export interface Siswa {
  id: string;
  nisn: string;
  nama: string;
  gender: Gender;
  kelasId: string;
  tanggalLahir: string; // YYYY-MM-DD
  tinggiBadan: number; // cm
  beratBadan: number; // kg
  catatanMedis?: string; // misalnya: asma ringan, alergi debu, pemulihan engkel
  kontakDarurat?: string;
  nomorAbsen: number;
}

export interface Kelas {
  id: string;
  nama: string; // e.g. "Kelas 4A", "Kelas 5B"
  tingkat: number; // 4, 5, 6, 7, 8, etc.
  tahunAjaran: string; // e.g. "2024/2025"
  waliKelas?: string;
  guruPJOK: string;
}

export type TKJICategory = 'Sangat Baik' | 'Baik' | 'Sedang' | 'Kurang' | 'Kurang Sekali';

export interface TesKebugaranTKJI {
  id: string;
  siswaId: string;
  tanggal: string;
  usia: number; // Tahun saat tes
  // 5 Item Tes TKJI
  sprintSec: number; // Item 1: Lari Sprint (detik)
  pullUps: number; // Item 2: Gantung Angkat / Siku Tekuk (kali / detik)
  sitUps: number; // Item 3: Baring Duduk 30/60 detik (kali)
  verticalJumpCm: number; // Item 4: Loncat Tegak (cm)
  runSec: number; // Item 5: Lari 600m / 800m / 1000m (detik)
  
  // Nilai Norm (1 - 5) per item
  scoreSprint: number;
  scorePullUps: number;
  scoreSitUps: number;
  scoreJump: number;
  scoreRun: number;
  
  totalNilai: number; // Sum of scores (5 - 25)
  kategori: TKJICategory;
  
  // IMT (Indeks Massa Tubuh)
  imt: number;
  kategoriImt: 'Kurus' | 'Normal' | 'Kelebihan BB' | 'Obesitas';
  catatan?: string;
}

export type ActivityPhase = 'persiapan' | 'pemanasan' | 'inti' | 'pendinginan' | 'selesai';

export interface StudentLiveState {
  siswaId: string;
  nama: string;
  gender: Gender;
  status: 'aktif' | 'istirahat' | 'terengah' | 'cedera' | 'dispensasi';
  lapsCount: number; // Jumlah putaran lapangan / repetisi drill
  estimatedHeartRate: number; // bpm (e.g. 110 - 170)
  rpeScore: number; // 1-10 Borg Scale (Rating of Perceived Exertion)
  lastUpdatedTime: number; // timestamp
  notes?: string;
}

export interface LiveSession {
  id: string;
  kelasId: string;
  judulMateri: string; // e.g. "Latihan Kebugaran Jasmani & Sirkuit Kelincahan"
  jenisAktivitas: 'Sirkuit Kebugaran' | 'Lari Jarak Pendek' | 'Shuttle Run' | 'Permainan Bola Besar' | 'Bleep Test' | 'Senam Irama';
  phase: ActivityPhase;
  startTime: number | null; // Date.now()
  elapsedSeconds: number;
  targetLaps: number;
  targetMinutes: number;
  lapDistanceMeters: number; // e.g. 100 meter per lap lapangan
  students: StudentLiveState[];
  isTimerRunning: boolean;
  notes: string;
}

export interface PresensiRecord {
  siswaId: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  keterangan?: string;
  keluhanAwal?: string; // misal: pusing sebelum mulai
}

export interface PresensiHarian {
  id: string;
  tanggal: string; // YYYY-MM-DD
  kelasId: string;
  cuaca: 'Cerah' | 'Berawan' | 'Hujan (Olahraga di Aula)' | 'Panas Terik';
  suhuUdara: string; // e.g. "28°C"
  records: PresensiRecord[];
  catatanGuru: string;
}

export interface JurnalMengajar {
  id: string;
  tanggal: string;
  kelasId: string;
  materi: string;
  faseKurikulum: string; // misal: "Fase B (Kelas 3-4)" / "Fase C (Kelas 5-6)"
  elemenCapaian: string; // misal: "Keterampilan Gerak & Kebugaran Jasmani"
  tujuanPembelajaran: string;
  ringkasanAktivitas: string;
  kendalaDanSolusi: string;
}
