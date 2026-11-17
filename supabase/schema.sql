-- ============================================================
-- SKEMA DATABASE SUPABASE: SADARPJOKREALTIME
-- Project ID: milozilmgtvbjubezgwv
-- Jalankan SQL ini di Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- 1. Tabel Kelas
CREATE TABLE IF NOT EXISTS public.kelas (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  tingkat INTEGER NOT NULL,
  tahun_ajaran TEXT NOT NULL,
  wali_kelas TEXT,
  guru_pjok TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Siswa
CREATE TABLE IF NOT EXISTS public.siswa (
  id TEXT PRIMARY KEY,
  nisn TEXT NOT NULL,
  nama TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('L', 'P')),
  kelas_id TEXT NOT NULL REFERENCES public.kelas(id) ON DELETE CASCADE,
  tanggal_lahir TEXT NOT NULL,
  tinggi_badan NUMERIC NOT NULL DEFAULT 140,
  berat_badan NUMERIC NOT NULL DEFAULT 35,
  catatan_medis TEXT,
  kontak_darurat TEXT,
  nomor_absen INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Rekam Tes Kebugaran TKJI
CREATE TABLE IF NOT EXISTS public.tkji_records (
  id TEXT PRIMARY KEY,
  siswa_id TEXT NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  tanggal TEXT NOT NULL,
  usia INTEGER NOT NULL DEFAULT 11,
  sprint_sec NUMERIC NOT NULL,
  pull_ups NUMERIC NOT NULL,
  sit_ups NUMERIC NOT NULL,
  vertical_jump_cm NUMERIC NOT NULL,
  run_sec NUMERIC NOT NULL,
  score_sprint INTEGER NOT NULL,
  score_pull_ups INTEGER NOT NULL,
  score_sit_ups INTEGER NOT NULL,
  score_jump INTEGER NOT NULL,
  score_run INTEGER NOT NULL,
  total_nilai INTEGER NOT NULL,
  kategori TEXT NOT NULL,
  imt NUMERIC NOT NULL,
  kategori_imt TEXT NOT NULL,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Presensi Harian
CREATE TABLE IF NOT EXISTS public.presensi_harian (
  id TEXT PRIMARY KEY,
  tanggal TEXT NOT NULL,
  kelas_id TEXT NOT NULL REFERENCES public.kelas(id) ON DELETE CASCADE,
  cuaca TEXT NOT NULL,
  suhu_udara TEXT NOT NULL,
  records JSONB NOT NULL DEFAULT '[]'::jsonb,
  catatan_guru TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Jurnal Mengajar PJOK
CREATE TABLE IF NOT EXISTS public.jurnal_mengajar (
  id TEXT PRIMARY KEY,
  tanggal TEXT NOT NULL,
  kelas_id TEXT NOT NULL REFERENCES public.kelas(id) ON DELETE CASCADE,
  materi TEXT NOT NULL,
  fase_kurikulum TEXT NOT NULL,
  elemen_capaian TEXT NOT NULL,
  tujuan_pembelajaran TEXT NOT NULL,
  ringkasan_aktivitas TEXT NOT NULL,
  kendala_dan_solusi TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Sesi Pantau Lapangan Live (Realtime Sync)
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id TEXT PRIMARY KEY,
  kelas_id TEXT NOT NULL REFERENCES public.kelas(id) ON DELETE CASCADE,
  judul_materi TEXT NOT NULL,
  jenis_aktivitas TEXT NOT NULL,
  phase TEXT NOT NULL,
  start_time BIGINT,
  elapsed_seconds INTEGER NOT NULL DEFAULT 0,
  target_laps INTEGER NOT NULL DEFAULT 6,
  target_minutes INTEGER NOT NULL DEFAULT 30,
  lap_distance_meters INTEGER NOT NULL DEFAULT 100,
  students JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_timer_running BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks untuk query cepat berdasarkan kelas & siswa
CREATE INDEX IF NOT EXISTS idx_siswa_kelas_id ON public.siswa(kelas_id);
CREATE INDEX IF NOT EXISTS idx_tkji_siswa_id ON public.tkji_records(siswa_id);
CREATE INDEX IF NOT EXISTS idx_presensi_kelas_id ON public.presensi_harian(kelas_id);
CREATE INDEX IF NOT EXISTS idx_jurnal_kelas_id ON public.jurnal_mengajar(kelas_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_kelas_id ON public.live_sessions(kelas_id);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tkji_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presensi_harian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_mengajar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Publik/Anon untuk Aplikasi Guru
DROP POLICY IF EXISTS "Allow all on kelas" ON public.kelas;
CREATE POLICY "Allow all on kelas" ON public.kelas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on siswa" ON public.siswa;
CREATE POLICY "Allow all on siswa" ON public.siswa FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on tkji_records" ON public.tkji_records;
CREATE POLICY "Allow all on tkji_records" ON public.tkji_records FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on presensi_harian" ON public.presensi_harian;
CREATE POLICY "Allow all on presensi_harian" ON public.presensi_harian FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on jurnal_mengajar" ON public.jurnal_mengajar;
CREATE POLICY "Allow all on jurnal_mengajar" ON public.jurnal_mengajar FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on live_sessions" ON public.live_sessions;
CREATE POLICY "Allow all on live_sessions" ON public.live_sessions FOR ALL USING (true) WITH CHECK (true);

-- Aktifkan Supabase Realtime untuk sinkronisasi langsung antar perangkat
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'kelas'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.kelas;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'siswa'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.siswa;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tkji_records'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tkji_records;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'presensi_harian'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.presensi_harian;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'jurnal_mengajar'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.jurnal_mengajar;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'live_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.live_sessions;
  END IF;
END $$;
