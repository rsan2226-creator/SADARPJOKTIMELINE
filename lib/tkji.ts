import { Gender, TKJICategory } from './types';

export interface TKJINormItem {
  minVal: number;
  maxVal: number;
  score: number; // 5, 4, 3, 2, 1
}

// Menghitung IMT (Indeks Massa Tubuh) = BB (kg) / (TB(m))^2
export function calculateIMT(beratKg: number, tinggiCm: number): { imt: number; kategori: 'Kurus' | 'Normal' | 'Kelebihan BB' | 'Obesitas' } {
  if (!tinggiCm || tinggiCm <= 0 || !beratKg || beratKg <= 0) {
    return { imt: 0, kategori: 'Normal' };
  }
  const tinggiM = tinggiCm / 100;
  const imt = parseFloat((beratKg / (tinggiM * tinggiM)).toFixed(1));

  let kategori: 'Kurus' | 'Normal' | 'Kelebihan BB' | 'Obesitas' = 'Normal';
  if (imt < 14.5) kategori = 'Kurus';
  else if (imt <= 21.0) kategori = 'Normal';
  else if (imt <= 25.0) kategori = 'Kelebihan BB';
  else kategori = 'Obesitas';

  return { imt, kategori };
}

// Tabel Norma TKJI Usia 10 - 12 Tahun (Standar Depdiknas Pusat Kebugaran Jasmani)
export function getScoreSprint40m(seconds: number, gender: Gender): number {
  if (gender === 'L') {
    if (seconds <= 6.3) return 5;
    if (seconds <= 6.9) return 4;
    if (seconds <= 7.7) return 3;
    if (seconds <= 8.8) return 2;
    return 1;
  } else {
    if (seconds <= 6.7) return 5;
    if (seconds <= 7.5) return 4;
    if (seconds <= 8.3) return 3;
    if (seconds <= 9.6) return 2;
    return 1;
  }
}

export function getScorePullUps(repsOrSec: number, gender: Gender): number {
  // Gantung Siku Tekuk (detik) untuk 10-12 tahun
  if (gender === 'L') {
    if (repsOrSec >= 40) return 5;
    if (repsOrSec >= 22) return 4;
    if (repsOrSec >= 9) return 3;
    if (repsOrSec >= 3) return 2;
    return 1;
  } else {
    if (repsOrSec >= 33) return 5;
    if (repsOrSec >= 18) return 4;
    if (repsOrSec >= 7) return 3;
    if (repsOrSec >= 2) return 2;
    return 1;
  }
}

export function getScoreSitUps30s(reps: number, gender: Gender): number {
  if (gender === 'L') {
    if (reps >= 23) return 5;
    if (reps >= 18) return 4;
    if (reps >= 12) return 3;
    if (reps >= 4) return 2;
    return 1;
  } else {
    if (reps >= 20) return 5;
    if (reps >= 14) return 4;
    if (reps >= 7) return 3;
    if (reps >= 2) return 2;
    return 1;
  }
}

export function getScoreVerticalJump(heightCm: number, gender: Gender): number {
  if (gender === 'L') {
    if (heightCm >= 46) return 5;
    if (heightCm >= 38) return 4;
    if (heightCm >= 31) return 3;
    if (heightCm >= 24) return 2;
    return 1;
  } else {
    if (heightCm >= 42) return 5;
    if (heightCm >= 34) return 4;
    if (heightCm >= 28) return 3;
    if (heightCm >= 21) return 2;
    return 1;
  }
}

export function getScoreRun600m(seconds: number, gender: Gender): number {
  // Waktu tempuh lari 600m
  if (gender === 'L') {
    if (seconds <= 129) return 5; // <= 2'09"
    if (seconds <= 150) return 4; // 2'10" - 2'30"
    if (seconds <= 175) return 3; // 2'31" - 2'55"
    if (seconds <= 208) return 2; // 2'56" - 3'28"
    return 1; // > 3'28"
  } else {
    if (seconds <= 152) return 5; // <= 2'32"
    if (seconds <= 178) return 4; // 2'33" - 2'58"
    if (seconds <= 207) return 3; // 2'59" - 3'27"
    if (seconds <= 248) return 2; // 3'28" - 4'08"
    return 1; // > 4'08"
  }
}

export function determineTKJICategory(totalScore: number): TKJICategory {
  if (totalScore >= 22) return 'Sangat Baik';
  if (totalScore >= 18) return 'Baik';
  if (totalScore >= 14) return 'Sedang';
  if (totalScore >= 10) return 'Kurang';
  return 'Kurang Sekali';
}

export function getCategoryBadgeColor(kategori: TKJICategory): string {
  switch (kategori) {
    case 'Sangat Baik':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'Baik':
      return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
    case 'Sedang':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'Kurang':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'Kurang Sekali':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
}

export function formatSecondsToMinutes(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
