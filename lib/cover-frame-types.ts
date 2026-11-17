export interface CoverDocumentData {
  mapel: string;
  kelas: string;
  tahunAjaran: string;
  namaSekolah: string;
  namaGuru: string;
  nip: string;
  logoType: 'kemendikbud' | 'garuda' | 'prestasi' | 'custom';
  customLogoUrl?: string;
  ilustrasi3DTheme: 'pjok_sports' | 'stem_science' | 'digital_classroom' | 'math_geometry' | 'literacy_creative';
  daftarDokumen: string[];
}

export const DAFTAR_DOKUMEN_DEFAULT = [
  'Capaian Pembelajaran (CP)',
  'Alur Tujuan Pembelajaran (ATP)',
  'Rincian Pekan Efektif (RPE)',
  'Program Tahunan (Prota)',
  'Program Semester (Promes)',
  'Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)',
  'Rencana Pembelajaran Mendalam (RPM)',
  'Asesmen Formatif & Sumatif',
];

export interface CoverPreset {
  label: string;
  mapel: string;
  kelas: string;
  tahunAjaran: string;
  namaSekolah: string;
  namaGuru: string;
  nip: string;
  ilustrasi3DTheme: 'pjok_sports' | 'stem_science' | 'digital_classroom' | 'math_geometry' | 'literacy_creative';
}

export const COVER_PRESETS: CoverPreset[] = [
  {
    label: '⚽ PJOK SD Kelas V (SADARPJOK)',
    mapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelas: 'V (LIMA)',
    tahunAjaran: '2026/2027',
    namaSekolah: 'SD NEGERI KALIMANTONG',
    namaGuru: 'Ahmad Faisal, S.Pd., Gr.',
    nip: '19880724 201503 1 003',
    ilustrasi3DTheme: 'pjok_sports',
  },
  {
    label: '🏃 PJOK SMP Kelas VII',
    mapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelas: 'VII (TUJUH)',
    tahunAjaran: '2026/2027',
    namaSekolah: 'SMP NEGERI 1 TALIWANG',
    namaGuru: 'Budi Santoso, S.Pd., M.Or.',
    nip: '19820512 200801 1 015',
    ilustrasi3DTheme: 'pjok_sports',
  },
  {
    label: '🏐 PJOK SMA Kelas XI',
    mapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelas: 'XI (SEBELAS)',
    tahunAjaran: '2026/2027',
    namaSekolah: 'SMA NEGERI 1 SUMBAWA BARAT',
    namaGuru: 'Drs. Herman Prasetyo, M.Pd.',
    nip: '19750318 200003 1 004',
    ilustrasi3DTheme: 'pjok_sports',
  },
  {
    label: '🌿 IPAS SD Kelas V',
    mapel: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    kelas: 'V (LIMA)',
    tahunAjaran: '2026/2027',
    namaSekolah: 'SD NEGERI 2 BRANG REA',
    namaGuru: 'Siti Rahmawati, S.Pd.',
    nip: '19920415 201903 2 011',
    ilustrasi3DTheme: 'stem_science',
  },
  {
    label: '📐 Matematika SMP Kelas VIII',
    mapel: 'Matematika',
    kelas: 'VIII (DELAPAN)',
    tahunAjaran: '2026/2027',
    namaSekolah: 'SMP NEGERI 2 SETELUK',
    namaGuru: 'Nurul Hidayah, S.Pd., M.Si.',
    nip: '19851120 201001 2 023',
    ilustrasi3DTheme: 'math_geometry',
  },
];
