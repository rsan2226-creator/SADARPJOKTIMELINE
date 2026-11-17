import { supabase } from './supabase';
import {
  Kelas,
  Siswa,
  TesKebugaranTKJI,
  PresensiHarian,
  JurnalMengajar,
  LiveSession,
} from './types';
import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_TKJI,
  INITIAL_PRESENSI,
  INITIAL_JURNAL,
} from './mock-data';

// --- Row Types matching PostgreSQL columns ---
interface KelasRow {
  id: string;
  nama: string;
  tingkat: number;
  tahun_ajaran: string;
  wali_kelas: string | null;
  guru_pjok: string;
}

interface SiswaRow {
  id: string;
  nisn: string;
  nama: string;
  gender: 'L' | 'P';
  kelas_id: string;
  tanggal_lahir: string;
  tinggi_badan: number;
  berat_badan: number;
  catatan_medis: string | null;
  kontak_darurat: string | null;
  nomor_absen: number;
}

interface TkjiRow {
  id: string;
  siswa_id: string;
  tanggal: string;
  usia: number;
  sprint_sec: number;
  pull_ups: number;
  sit_ups: number;
  vertical_jump_cm: number;
  run_sec: number;
  score_sprint: number;
  score_pull_ups: number;
  score_sit_ups: number;
  score_jump: number;
  score_run: number;
  total_nilai: number;
  kategori: TesKebugaranTKJI['kategori'];
  imt: number;
  kategori_imt: TesKebugaranTKJI['kategoriImt'];
  catatan: string | null;
}

interface PresensiRow {
  id: string;
  tanggal: string;
  kelas_id: string;
  cuaca: PresensiHarian['cuaca'];
  suhu_udara: string;
  records: PresensiHarian['records'];
  catatan_guru: string;
}

interface JurnalRow {
  id: string;
  tanggal: string;
  kelas_id: string;
  materi: string;
  fase_kurikulum: string;
  elemen_capaian: string;
  tujuan_pembelajaran: string;
  ringkasan_aktivitas: string;
  kendala_dan_solusi: string;
}

interface LiveSessionRow {
  id: string;
  kelas_id: string;
  judul_materi: string;
  jenis_aktivitas: LiveSession['jenisAktivitas'];
  phase: LiveSession['phase'];
  start_time: number | null;
  elapsed_seconds: number;
  target_laps: number;
  target_minutes: number;
  lap_distance_meters: number;
  students: LiveSession['students'];
  is_timer_running: boolean;
  notes: string;
}

// --- Mappers ---
const mapKelasFromRow = (r: KelasRow): Kelas => ({
  id: r.id,
  nama: r.nama,
  tingkat: Number(r.tingkat),
  tahunAjaran: r.tahun_ajaran,
  waliKelas: r.wali_kelas ?? undefined,
  guruPJOK: r.guru_pjok,
});

const mapKelasToRow = (k: Kelas): KelasRow => ({
  id: k.id,
  nama: k.nama,
  tingkat: k.tingkat,
  tahun_ajaran: k.tahunAjaran,
  wali_kelas: k.waliKelas ?? null,
  guru_pjok: k.guruPJOK,
});

const mapSiswaFromRow = (r: SiswaRow): Siswa => ({
  id: r.id,
  nisn: r.nisn,
  nama: r.nama,
  gender: r.gender,
  kelasId: r.kelas_id,
  tanggalLahir: r.tanggal_lahir,
  tinggiBadan: Number(r.tinggi_badan),
  beratBadan: Number(r.berat_badan),
  catatanMedis: r.catatan_medis ?? undefined,
  kontakDarurat: r.kontak_darurat ?? undefined,
  nomorAbsen: Number(r.nomor_absen),
});

const mapSiswaToRow = (s: Siswa): SiswaRow => ({
  id: s.id,
  nisn: s.nisn,
  nama: s.nama,
  gender: s.gender,
  kelas_id: s.kelasId,
  tanggal_lahir: s.tanggalLahir,
  tinggi_badan: s.tinggiBadan,
  berat_badan: s.beratBadan,
  catatan_medis: s.catatanMedis ?? null,
  kontak_darurat: s.kontakDarurat ?? null,
  nomor_absen: s.nomorAbsen,
});

const mapTkjiFromRow = (r: TkjiRow): TesKebugaranTKJI => ({
  id: r.id,
  siswaId: r.siswa_id,
  tanggal: r.tanggal,
  usia: Number(r.usia),
  sprintSec: Number(r.sprint_sec),
  pullUps: Number(r.pull_ups),
  sitUps: Number(r.sit_ups),
  verticalJumpCm: Number(r.vertical_jump_cm),
  runSec: Number(r.run_sec),
  scoreSprint: Number(r.score_sprint),
  scorePullUps: Number(r.score_pull_ups),
  scoreSitUps: Number(r.score_sit_ups),
  scoreJump: Number(r.score_jump),
  scoreRun: Number(r.score_run),
  totalNilai: Number(r.total_nilai),
  kategori: r.kategori,
  imt: Number(r.imt),
  kategoriImt: r.kategori_imt,
  catatan: r.catatan ?? undefined,
});

const mapTkjiToRow = (t: TesKebugaranTKJI): TkjiRow => ({
  id: t.id,
  siswa_id: t.siswaId,
  tanggal: t.tanggal,
  usia: t.usia,
  sprint_sec: t.sprintSec,
  pull_ups: t.pullUps,
  sit_ups: t.sitUps,
  vertical_jump_cm: t.verticalJumpCm,
  run_sec: t.runSec,
  score_sprint: t.scoreSprint,
  score_pull_ups: t.scorePullUps,
  score_sit_ups: t.scoreSitUps,
  score_jump: t.scoreJump,
  score_run: t.scoreRun,
  total_nilai: t.totalNilai,
  kategori: t.kategori,
  imt: t.imt,
  kategori_imt: t.kategoriImt,
  catatan: t.catatan ?? null,
});

const mapPresensiFromRow = (r: PresensiRow): PresensiHarian => ({
  id: r.id,
  tanggal: r.tanggal,
  kelasId: r.kelas_id,
  cuaca: r.cuaca,
  suhuUdara: r.suhu_udara,
  records: Array.isArray(r.records) ? r.records : [],
  catatanGuru: r.catatan_guru,
});

const mapPresensiToRow = (p: PresensiHarian): PresensiRow => ({
  id: p.id,
  tanggal: p.tanggal,
  kelas_id: p.kelasId,
  cuaca: p.cuaca,
  suhu_udara: p.suhuUdara,
  records: p.records,
  catatan_guru: p.catatanGuru,
});

const mapJurnalFromRow = (r: JurnalRow): JurnalMengajar => ({
  id: r.id,
  tanggal: r.tanggal,
  kelasId: r.kelas_id,
  materi: r.materi,
  faseKurikulum: r.fase_kurikulum,
  elemenCapaian: r.elemen_capaian,
  tujuanPembelajaran: r.tujuan_pembelajaran,
  ringkasanAktivitas: r.ringkasan_aktivitas,
  kendalaDanSolusi: r.kendala_dan_solusi,
});

const mapJurnalToRow = (j: JurnalMengajar): JurnalRow => ({
  id: j.id,
  tanggal: j.tanggal,
  kelas_id: j.kelasId,
  materi: j.materi,
  fase_kurikulum: j.faseKurikulum,
  elemen_capaian: j.elemenCapaian,
  tujuan_pembelajaran: j.tujuanPembelajaran,
  ringkasan_aktivitas: j.ringkasanAktivitas,
  kendala_dan_solusi: j.kendalaDanSolusi,
});

const mapLiveSessionFromRow = (r: LiveSessionRow): LiveSession => ({
  id: r.id,
  kelasId: r.kelas_id,
  judulMateri: r.judul_materi,
  jenisAktivitas: r.jenis_aktivitas,
  phase: r.phase,
  startTime: r.start_time,
  elapsedSeconds: Number(r.elapsed_seconds),
  targetLaps: Number(r.target_laps),
  targetMinutes: Number(r.target_minutes),
  lapDistanceMeters: Number(r.lap_distance_meters),
  students: Array.isArray(r.students) ? r.students : [],
  isTimerRunning: Boolean(r.is_timer_running),
  notes: r.notes,
});

const mapLiveSessionToRow = (s: LiveSession): LiveSessionRow => ({
  id: s.id,
  kelas_id: s.kelasId,
  judul_materi: s.judulMateri,
  jenis_aktivitas: s.jenisAktivitas,
  phase: s.phase,
  start_time: s.startTime,
  elapsed_seconds: s.elapsedSeconds,
  target_laps: s.targetLaps,
  target_minutes: s.targetMinutes,
  lap_distance_meters: s.lapDistanceMeters,
  students: s.students,
  is_timer_running: s.isTimerRunning,
  notes: s.notes,
});

function isSchemaMissingError(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  return (
    err.code === 'PGRST205' ||
    err.code === '42P01' ||
    (err.message?.includes('Could not find the table') ?? false) ||
    (err.message?.includes('does not exist') ?? false)
  );
}

export interface LoadSupabaseResult {
  schemaReady: boolean;
  seeded: boolean;
  classes: Kelas[];
  students: Siswa[];
  tkjiRecords: TesKebugaranTKJI[];
  presensiList: PresensiHarian[];
  jurnalList: JurnalMengajar[];
  error?: string;
}

export async function seedInitialDataToSupabase(): Promise<boolean> {
  const { error: errKelas } = await supabase
    .from('kelas')
    .upsert(INITIAL_CLASSES.map(mapKelasToRow), { onConflict: 'id' });
  if (errKelas) return false;

  const { error: errSiswa } = await supabase
    .from('siswa')
    .upsert(INITIAL_STUDENTS.map(mapSiswaToRow), { onConflict: 'id' });
  if (errSiswa) return false;

  await supabase
    .from('tkji_records')
    .upsert(INITIAL_TKJI.map(mapTkjiToRow), { onConflict: 'id' });

  await supabase
    .from('presensi_harian')
    .upsert(INITIAL_PRESENSI.map(mapPresensiToRow), { onConflict: 'id' });

  await supabase
    .from('jurnal_mengajar')
    .upsert(INITIAL_JURNAL.map(mapJurnalToRow), { onConflict: 'id' });

  return true;
}

export async function fetchAllSadarpjokData(): Promise<LoadSupabaseResult> {
  try {
    const [kelasRes, siswaRes, tkjiRes, presensiRes, jurnalRes] = await Promise.all([
      supabase.from('kelas').select('*').order('tingkat', { ascending: true }),
      supabase.from('siswa').select('*').order('nomor_absen', { ascending: true }),
      supabase.from('tkji_records').select('*').order('tanggal', { ascending: false }),
      supabase.from('presensi_harian').select('*').order('tanggal', { ascending: false }),
      supabase.from('jurnal_mengajar').select('*').order('tanggal', { ascending: false }),
    ]);

    if (isSchemaMissingError(kelasRes.error) || isSchemaMissingError(siswaRes.error)) {
      return {
        schemaReady: false,
        seeded: false,
        classes: INITIAL_CLASSES,
        students: INITIAL_STUDENTS,
        tkjiRecords: INITIAL_TKJI,
        presensiList: INITIAL_PRESENSI,
        jurnalList: INITIAL_JURNAL,
      };
    }

    if (kelasRes.error) {
      throw new Error(kelasRes.error.message);
    }

    const kelasRows = (kelasRes.data || []) as KelasRow[];

    // Auto-seed initial classes & students if database tables are freshly created and empty
    if (kelasRows.length === 0) {
      const seeded = await seedInitialDataToSupabase();
      if (seeded) {
        return {
          schemaReady: true,
          seeded: true,
          classes: INITIAL_CLASSES,
          students: INITIAL_STUDENTS,
          tkjiRecords: INITIAL_TKJI,
          presensiList: INITIAL_PRESENSI,
          jurnalList: INITIAL_JURNAL,
        };
      }
    }

    return {
      schemaReady: true,
      seeded: false,
      classes: kelasRows.map(mapKelasFromRow),
      students: ((siswaRes.data || []) as SiswaRow[]).map(mapSiswaFromRow),
      tkjiRecords: ((tkjiRes.data || []) as TkjiRow[]).map(mapTkjiFromRow),
      presensiList: ((presensiRes.data || []) as PresensiRow[]).map(mapPresensiFromRow),
      jurnalList: ((jurnalRes.data || []) as JurnalRow[]).map(mapJurnalFromRow),
    };
  } catch (err) {
    return {
      schemaReady: false,
      seeded: false,
      classes: INITIAL_CLASSES,
      students: INITIAL_STUDENTS,
      tkjiRecords: INITIAL_TKJI,
      presensiList: INITIAL_PRESENSI,
      jurnalList: INITIAL_JURNAL,
      error: err instanceof Error ? err.message : 'Gagal terhubung ke Supabase',
    };
  }
}

// --- CRUD Operations ---
export async function upsertStudentInDb(siswa: Siswa): Promise<void> {
  const { error } = await supabase
    .from('siswa')
    .upsert(mapSiswaToRow(siswa), { onConflict: 'id' });
  if (error && !isSchemaMissingError(error)) {
    console.error('Supabase upsertStudent error:', error.message);
  }
}

export async function deleteStudentInDb(id: string): Promise<void> {
  const { error } = await supabase.from('siswa').delete().eq('id', id);
  if (error && !isSchemaMissingError(error)) {
    console.error('Supabase deleteStudent error:', error.message);
  }
}

export async function upsertTkjiInDb(record: TesKebugaranTKJI): Promise<void> {
  const { error } = await supabase
    .from('tkji_records')
    .upsert(mapTkjiToRow(record), { onConflict: 'id' });
  if (error && !isSchemaMissingError(error)) {
    console.error('Supabase upsertTkji error:', error.message);
  }
}

export async function upsertPresensiInDb(presensi: PresensiHarian): Promise<void> {
  const { error } = await supabase
    .from('presensi_harian')
    .upsert(mapPresensiToRow(presensi), { onConflict: 'id' });
  if (error && !isSchemaMissingError(error)) {
    console.error('Supabase upsertPresensi error:', error.message);
  }
}

export async function upsertJurnalInDb(jurnal: JurnalMengajar): Promise<void> {
  const { error } = await supabase
    .from('jurnal_mengajar')
    .upsert(mapJurnalToRow(jurnal), { onConflict: 'id' });
  if (error && !isSchemaMissingError(error)) {
    console.error('Supabase upsertJurnal error:', error.message);
  }
}

export async function upsertLiveSessionInDb(session: LiveSession): Promise<void> {
  const { error } = await supabase
    .from('live_sessions')
    .upsert(mapLiveSessionToRow(session), { onConflict: 'id' });
  if (error && !isSchemaMissingError(error)) {
    console.error('Supabase upsertLiveSession error:', error.message);
  }
}

export async function fetchActiveLiveSessionByClass(kelasId: string): Promise<LiveSession | null> {
  const { data, error } = await supabase
    .from('live_sessions')
    .select('*')
    .eq('kelas_id', kelasId)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return mapLiveSessionFromRow(data[0] as LiveSessionRow);
}

// --- Supabase Realtime Subscriptions ---
export interface RealtimeCallbacks {
  onDataChange: () => void;
  onLiveSessionChange?: (session: LiveSession) => void;
}

export function subscribeToSadarpjokRealtime(callbacks: RealtimeCallbacks): () => void {
  const channel = supabase
    .channel('sadarpjok-realtime-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'siswa' },
      () => callbacks.onDataChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tkji_records' },
      () => callbacks.onDataChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'presensi_harian' },
      () => callbacks.onDataChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'jurnal_mengajar' },
      () => callbacks.onDataChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'live_sessions' },
      (payload) => {
        if (callbacks.onLiveSessionChange && payload.new && typeof payload.new === 'object') {
          const row = payload.new as LiveSessionRow;
          if (row.id && row.kelas_id) {
            callbacks.onLiveSessionChange(mapLiveSessionFromRow(row));
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
