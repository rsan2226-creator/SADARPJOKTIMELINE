import { buildCommandAlignedQuestions } from './soal-topic-engine';

export interface KisiKisiItem {
  no: number;
  tujuanPembelajaran: string;
  ruangLingkupMateri: string;
  levelKognitif: string;
  indikatorSoal: string;
  bentukSoal: 'Pilihan Ganda' | 'Pilihan Ganda Kompleks' | 'Menjodohkan' | 'Isian Singkat' | 'Uraian';
  nomorSoal: number;
  naskahSoal: string;
  kunciJawaban: string;
  skor: number;
}

export type PgOptionKey = 'A' | 'B' | 'C' | 'D' | 'E';
export type OpsiPgCount = 3 | 4 | 5;

export interface SoalPilihanGanda {
  nomor: number;
  stimulus?: string;
  deskripsiGambar?: string;
  tabelStimulus?: { headers: string[]; rows: string[][] };
  pertanyaan: string;
  pilihan: { A: string; B: string; C: string; D?: string; E?: string };
  kunci: PgOptionKey;
  levelBloom: string;
  skor: number;
}

export interface SoalPgKompleks {
  nomor: number;
  stimulus?: string;
  deskripsiGambar?: string;
  pertanyaan: string;
  pilihan: Array<{ kode: string; teks: string; isBenar?: boolean }>;
  kunci: string;
  levelBloom: string;
  skor: number;
}

export interface SoalMenjodohkan {
  nomor: number;
  premisKiri: string;
  responsKanan: string;
  kunci: string;
  skor: number;
}

export interface SoalIsianSingkat {
  nomor: number;
  stimulus?: string;
  deskripsiGambar?: string;
  pertanyaan: string;
  kunci: string;
  levelBloom: string;
  skor: number;
}

export interface SoalUraian {
  nomor: number;
  stimulus?: string;
  deskripsiGambar?: string;
  pertanyaan: string;
  rubrikDanKunci: string;
  levelBloom: string;
  skor: number;
}

export interface KomposisiSoalConfig {
  pg: number;
  pgKompleks: number;
  menjodohkan: number;
  isianSingkat: number;
  uraian: number;
  opsiPg?: OpsiPgCount;
}

export const DEFAULT_KOMPOSISI_SOAL: KomposisiSoalConfig & { opsiPg: OpsiPgCount } = {
  pg: 25,
  pgKompleks: 5,
  menjodohkan: 8,
  isianSingkat: 5,
  uraian: 2,
  opsiPg: 5,
};

export function normalizeOpsiPg(val?: unknown): OpsiPgCount {
  const num = typeof val === 'number' ? val : Number(val);
  if (num === 3) return 3;
  if (num === 4) return 4;
  return 5;
}

export function getAllowedPgKeys(opsiPg?: number): PgOptionKey[] {
  const count = normalizeOpsiPg(opsiPg);
  return (['A', 'B', 'C', 'D', 'E'] as PgOptionKey[]).slice(0, count);
}

export function formatPgOpsiLabel(opsiPg?: number): string {
  const count = normalizeOpsiPg(opsiPg);
  if (count === 3) return 'A, B, atau C';
  if (count === 4) return 'A, B, C, atau D';
  return 'A, B, C, D, atau E';
}

export function applyOpsiPgToPgItem(
  pg: SoalPilihanGanda,
  opsiPg: OpsiPgCount
): SoalPilihanGanda {
  const allowedKeys = getAllowedPgKeys(opsiPg);
  const fullPool: Record<PgOptionKey, string> = {
    A: pg.pilihan?.A || 'Opsi A',
    B: pg.pilihan?.B || 'Opsi B',
    C: pg.pilihan?.C || 'Opsi C',
    D: pg.pilihan?.D || 'Opsi D',
    E: pg.pilihan?.E || 'Opsi E',
  };

  const rawKey = (String(pg.kunci || 'A').trim().toUpperCase()[0] || 'A') as PgOptionKey;
  let finalKey: PgOptionKey = allowedKeys.includes(rawKey)
    ? rawKey
    : allowedKeys[(Math.max(1, pg.nomor || 1) - 1) % allowedKeys.length];

  if (!allowedKeys.includes(rawKey) && fullPool[rawKey]) {
    const temp = fullPool[finalKey];
    fullPool[finalKey] = fullPool[rawKey];
    fullPool[rawKey] = temp;
  }

  const trimmedPilihan: { A: string; B: string; C: string; D?: string; E?: string } = {
    A: fullPool.A,
    B: fullPool.B,
    C: fullPool.C,
  };
  if (opsiPg >= 4) trimmedPilihan.D = fullPool.D;
  if (opsiPg >= 5) trimmedPilihan.E = fullPool.E;

  return {
    ...pg,
    pilihan: trimmedPilihan,
    kunci: finalKey,
  };
}

export function normalizeKomposisiSoal(
  raw?: Partial<KomposisiSoalConfig> | null
): KomposisiSoalConfig & { opsiPg: OpsiPgCount } {
  const clamp = (val: unknown, def: number, max: number) => {
    const num = typeof val === 'number' ? val : Number(val);
    if (!Number.isFinite(num)) return def;
    return Math.max(0, Math.min(max, Math.floor(num)));
  };

  const normalized: KomposisiSoalConfig & { opsiPg: OpsiPgCount } = {
    pg: clamp(raw?.pg, DEFAULT_KOMPOSISI_SOAL.pg, 60),
    pgKompleks: clamp(raw?.pgKompleks, DEFAULT_KOMPOSISI_SOAL.pgKompleks, 30),
    menjodohkan: clamp(raw?.menjodohkan, DEFAULT_KOMPOSISI_SOAL.menjodohkan, 30),
    isianSingkat: clamp(raw?.isianSingkat, DEFAULT_KOMPOSISI_SOAL.isianSingkat, 30),
    uraian: clamp(raw?.uraian, DEFAULT_KOMPOSISI_SOAL.uraian, 20),
    opsiPg: normalizeOpsiPg(raw?.opsiPg ?? DEFAULT_KOMPOSISI_SOAL.opsiPg),
  };

  const total =
    normalized.pg +
    normalized.pgKompleks +
    normalized.menjodohkan +
    normalized.isianSingkat +
    normalized.uraian;

  if (total === 0) {
    return { ...DEFAULT_KOMPOSISI_SOAL };
  }
  return normalized;
}

export interface KomposisiRange {
  count: number;
  start: number;
  end: number;
}

export function computeKomposisiSummary(k: KomposisiSoalConfig) {
  let cursor = 1;
  const makeRange = (count: number): KomposisiRange => {
    if (count <= 0) return { count: 0, start: 0, end: 0 };
    const start = cursor;
    const end = cursor + count - 1;
    cursor = end + 1;
    return { count, start, end };
  };

  const opsiPg = normalizeOpsiPg(k.opsiPg);
  const pg = makeRange(k.pg);
  const pgKompleks = makeRange(k.pgKompleks);
  const menjodohkan = makeRange(k.menjodohkan);
  const isianSingkat = makeRange(k.isianSingkat);
  const uraian = makeRange(k.uraian);

  const totalSoal =
    k.pg + k.pgKompleks + k.menjodohkan + k.isianSingkat + k.uraian;
  const skorPg = k.pg * 1;
  const skorPgKompleks = k.pgKompleks * 2;
  const skorMenjodohkan = k.menjodohkan * 1;
  const skorIsian = k.isianSingkat * 2;
  const skorUraian = k.uraian * 5;
  const totalSkor =
    skorPg + skorPgKompleks + skorMenjodohkan + skorIsian + skorUraian;

  return {
    pg,
    pgKompleks,
    menjodohkan,
    isianSingkat,
    uraian,
    opsiPg,
    allowedPgKeys: getAllowedPgKeys(opsiPg),
    totalSoal,
    skorPg,
    skorPgKompleks,
    skorMenjodohkan,
    skorIsian,
    skorUraian,
    totalSkor,
  };
}

export interface AsesmenSumatifData {
  identitas: {
    namaSekolah: string;
    mataPelajaran: string;
    kelas: string;
    fase: string;
    semester: string;
    jenisAsesmen: string;
    tahunPelajaran: string;
    alokasiWaktu: string;
    jumlahSoal: number;
    opsiPg?: OpsiPgCount;
    materiDanSubmateri?: string;
    tujuanPembelajaran?: string;
    instruksiKhusus?: string;
  };
  petunjukUmum: string[];
  soalPilihanGanda: SoalPilihanGanda[];
  soalPgKompleks: SoalPgKompleks[];
  soalMenjodohkan: SoalMenjodohkan[];
  soalIsianSingkat: SoalIsianSingkat[];
  soalUraian: SoalUraian[];
  kisiKisiTabel: KisiKisiItem[];
  pedomanPenskoran: {
    skorMaksimalPg: number;
    skorMaksimalPgKompleks: number;
    skorMaksimalMenjodohkan: number;
    skorMaksimalIsian: number;
    skorMaksimalUraian: number;
    totalSkorMaksimal: number;
    rumusNilaiAkhir: string;
  };
}

export function getFallbackSoalV2Data(
  mapel: string = 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
  kelas: string = 'V (Lima)',
  fase: string = 'Fase C',
  jenisAsesmen: string = 'Asesmen Sumatif Akhir Semester (SAS)',
  tujuanPembelajaranText: string = '1. Mempraktikkan dan menganalisis variasi dan kombinasi gerak spesifik passing dan shooting sepak bola.\n2. Menganalisis dan mempraktikkan variasi gerak dasar passing bawah dan atas bola voli.\n3. Menerapkan latihan kebugaran jasmani daya tahan dan kekuatan otot.\n4. Menunjukkan sikap sportivitas, kolaborasi, dan tanggung jawab.',
  komposisi?: Partial<KomposisiSoalConfig>,
  instruksiKhusus: string = ''
): AsesmenSumatifData {
  const base = getFallbackAsesmenSumatifData(
    mapel,
    kelas,
    fase,
    jenisAsesmen,
    tujuanPembelajaranText,
    komposisi,
    instruksiKhusus
  );
  base.identitas.tujuanPembelajaran = tujuanPembelajaranText;
  if (instruksiKhusus) {
    base.identitas.instruksiKhusus = instruksiKhusus;
  }
  return base;
}

export function getFallbackAsesmenSumatifData(
  mapel: string = 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
  kelas: string = 'V (Lima)',
  fase: string = 'Fase C',
  jenisAsesmen: string = 'Asesmen Sumatif Akhir Semester (SAS)',
  materiDetail: string = 'Variasi dan Kombinasi Pola Gerak Dasar Permainan Bola Besar (Sepak Bola dan Bola Voli) serta Kebugaran Jasmani Dasar',
  komposisi?: Partial<KomposisiSoalConfig>,
  instruksiKhusus: string = ''
): AsesmenSumatifData {
  const cfg = normalizeKomposisiSoal(komposisi);
  const summary = computeKomposisiSummary(cfg);

  const generated = buildCommandAlignedQuestions({
    mapel,
    kelas,
    fase,
    materiOrTp: materiDetail,
    instruksiKhusus,
    komposisi: cfg,
    ranges: {
      pg: summary.pg,
      pgKompleks: summary.pgKompleks,
      menjodohkan: summary.menjodohkan,
      isianSingkat: summary.isianSingkat,
      uraian: summary.uraian,
    },
    applyOpsiFn: applyOpsiPgToPgItem,
  });

  const finalPg: SoalPilihanGanda[] = generated.pgList.map(({ tpRef: _t, ruangLingkup: _r, ...rest }) => rest);
  const finalPgKompleks: SoalPgKompleks[] = generated.pgkList.map(({ tpRef: _t, ruangLingkup: _r, ...rest }) => rest);
  const finalMenjodohkan: SoalMenjodohkan[] = generated.matchList.map(({ tpRef: _t, ruangLingkup: _r, ...rest }) => rest);
  const finalIsian: SoalIsianSingkat[] = generated.shortList.map(({ tpRef: _t, ruangLingkup: _r, ...rest }) => rest);
  const finalUraian: SoalUraian[] = generated.essayList.map(({ tpRef: _t, ruangLingkup: _r, ...rest }) => rest);

  return {
    identitas: {
      namaSekolah: 'SD NEGERI KALIMANTONG',
      mataPelajaran: mapel,
      kelas: kelas,
      fase: fase,
      semester: 'Ganjil',
      jenisAsesmen: jenisAsesmen,
      tahunPelajaran: '2026/2027',
      alokasiWaktu: '90 Menit',
      jumlahSoal: summary.totalSoal,
      opsiPg: cfg.opsiPg,
      materiDanSubmateri: materiDetail,
      ...(instruksiKhusus ? { instruksiKhusus } : {}),
    },
    petunjukUmum: [
      'Berdoalah sebelum memulai mengerjakan naskah soal.',
      'Tuliskan identitas namamu, nomor absen, dan kelas pada lembar jawaban yang telah disediakan.',
      'Periksa dan bacalah setiap butir soal dengan teliti sebelum kamu menjawabnya.',
      'Dahulukan menjawab soal-soal yang kamu anggap paling mudah.',
      'Laporkan kepada pengawas jika terdapat tulisan yang kurang jelas, rusak, atau jumlah halaman yang kurang.',
      'Periksalah kembali seluruh pekerjaanmu sebelum lembar jawaban diserahkan kepada guru pengawas.',
    ],
    soalPilihanGanda: finalPg,
    soalPgKompleks: finalPgKompleks,
    soalMenjodohkan: finalMenjodohkan,
    soalIsianSingkat: finalIsian,
    soalUraian: finalUraian,
    kisiKisiTabel: generated.kisiRows,
    pedomanPenskoran: {
      skorMaksimalPg: summary.skorPg,
      skorMaksimalPgKompleks: summary.skorPgKompleks,
      skorMaksimalMenjodohkan: summary.skorMenjodohkan,
      skorMaksimalIsian: summary.skorIsian,
      skorMaksimalUraian: summary.skorUraian,
      totalSkorMaksimal: summary.totalSkor,
      rumusNilaiAkhir: `Nilai Akhir = (Total Skor Perolehan / ${summary.totalSkor}) × 100`,
    },
  };
}

export function alignAsesmenWithKomposisi(
  data: Partial<AsesmenSumatifData>,
  komposisi: KomposisiSoalConfig,
  fallback: AsesmenSumatifData
): AsesmenSumatifData {
  const summary = computeKomposisiSummary(komposisi);

  const pickList = <T extends { nomor: number }>(
    source: T[] | undefined,
    fbList: T[],
    count: number,
    startNo: number
  ): T[] => {
    if (count <= 0) return [];
    const pool = [...(Array.isArray(source) ? source : [])];
    for (let i = 0; pool.length < count && i < fbList.length; i++) {
      pool.push(fbList[i]);
    }
    return pool.slice(0, count).map((item, idx) => ({
      ...item,
      nomor: startNo + idx,
    }));
  };

  const opsiPg = normalizeOpsiPg(komposisi.opsiPg);

  const soalPilihanGanda = pickList(
    data.soalPilihanGanda,
    fallback.soalPilihanGanda,
    komposisi.pg,
    summary.pg.start
  ).map((pg) => applyOpsiPgToPgItem(pg, opsiPg));
  const soalPgKompleks = pickList(
    data.soalPgKompleks,
    fallback.soalPgKompleks,
    komposisi.pgKompleks,
    summary.pgKompleks.start
  );
  const soalMenjodohkan = pickList(
    data.soalMenjodohkan,
    fallback.soalMenjodohkan,
    komposisi.menjodohkan,
    summary.menjodohkan.start
  );
  const soalIsianSingkat = pickList(
    data.soalIsianSingkat,
    fallback.soalIsianSingkat,
    komposisi.isianSingkat,
    summary.isianSingkat.start
  );
  const soalUraian = pickList(
    data.soalUraian,
    fallback.soalUraian,
    komposisi.uraian,
    summary.uraian.start
  );

  const aiKisi = Array.isArray(data.kisiKisiTabel) ? data.kisiKisiTabel : [];
  const fbKisi = fallback.kisiKisiTabel;
  const tpDefault =
    aiKisi[0]?.tujuanPembelajaran ||
    fbKisi[0]?.tujuanPembelajaran ||
    'Peserta didik mencapai Tujuan Pembelajaran yang ditetapkan.';

  const kisiKisiTabel: KisiKisiItem[] = [];
  const findKisi = (idx: number, nomorSoal?: number) =>
    (nomorSoal !== undefined
      ? aiKisi.find((k) => Number(k.nomorSoal) === nomorSoal || Number(k.no) === nomorSoal)
      : undefined) ||
    aiKisi[idx] ||
    fbKisi[idx];

  soalPilihanGanda.forEach((pg, i) => {
    const existing = findKisi(i, pg.nomor);
    kisiKisiTabel.push({
      no: pg.nomor,
      tujuanPembelajaran: existing?.tujuanPembelajaran || tpDefault,
      ruangLingkupMateri: existing?.ruangLingkupMateri || 'Materi Inti Pembelajaran',
      levelKognitif: pg.levelBloom || existing?.levelKognitif || 'C2 (Memahami)',
      indikatorSoal:
        existing?.indikatorSoal ||
        `Peserta didik dapat menjawab pertanyaan pilihan ganda nomor ${pg.nomor}.`,
      bentukSoal: 'Pilihan Ganda',
      nomorSoal: pg.nomor,
      naskahSoal: pg.pertanyaan,
      kunciJawaban: `${pg.kunci}. ${pg.pilihan?.[pg.kunci] || ''}`,
      skor: pg.skor || 1,
    });
  });

  soalPgKompleks.forEach((pgk, i) => {
    const existing = findKisi(soalPilihanGanda.length + i, pgk.nomor);
    kisiKisiTabel.push({
      no: pgk.nomor,
      tujuanPembelajaran: existing?.tujuanPembelajaran || tpDefault,
      ruangLingkupMateri: existing?.ruangLingkupMateri || 'Analisis Konsep',
      levelKognitif: pgk.levelBloom || existing?.levelKognitif || 'C4 (Menganalisis)',
      indikatorSoal:
        existing?.indikatorSoal ||
        `Peserta didik dapat memilih lebih dari satu pernyataan benar nomor ${pgk.nomor}.`,
      bentukSoal: 'Pilihan Ganda Kompleks',
      nomorSoal: pgk.nomor,
      naskahSoal: pgk.pertanyaan,
      kunciJawaban: pgk.kunci,
      skor: pgk.skor || 2,
    });
  });

  soalMenjodohkan.forEach((m, i) => {
    const existing = findKisi(soalPilihanGanda.length + soalPgKompleks.length + i, m.nomor);
    kisiKisiTabel.push({
      no: m.nomor,
      tujuanPembelajaran: existing?.tujuanPembelajaran || tpDefault,
      ruangLingkupMateri: existing?.ruangLingkupMateri || 'Konsep & Istilah',
      levelKognitif: existing?.levelKognitif || 'C2 (Memahami)',
      indikatorSoal:
        existing?.indikatorSoal ||
        `Peserta didik dapat memasangkan premis dan respons nomor ${m.nomor}.`,
      bentukSoal: 'Menjodohkan',
      nomorSoal: m.nomor,
      naskahSoal: `${m.premisKiri} ➡ ${m.responsKanan}`,
      kunciJawaban: m.responsKanan,
      skor: m.skor || 1,
    });
  });

  soalIsianSingkat.forEach((isItem, i) => {
    const existing = findKisi(
      soalPilihanGanda.length + soalPgKompleks.length + soalMenjodohkan.length + i,
      isItem.nomor
    );
    kisiKisiTabel.push({
      no: isItem.nomor,
      tujuanPembelajaran: existing?.tujuanPembelajaran || tpDefault,
      ruangLingkupMateri: existing?.ruangLingkupMateri || 'Aplikasi Konsep',
      levelKognitif: isItem.levelBloom || existing?.levelKognitif || 'C3 (Menerapkan)',
      indikatorSoal:
        existing?.indikatorSoal ||
        `Peserta didik dapat menuliskan jawaban singkat nomor ${isItem.nomor}.`,
      bentukSoal: 'Isian Singkat',
      nomorSoal: isItem.nomor,
      naskahSoal: isItem.pertanyaan,
      kunciJawaban: isItem.kunci,
      skor: isItem.skor || 2,
    });
  });

  soalUraian.forEach((u, i) => {
    const existing = findKisi(
      soalPilihanGanda.length +
        soalPgKompleks.length +
        soalMenjodohkan.length +
        soalIsianSingkat.length +
        i,
      u.nomor
    );
    kisiKisiTabel.push({
      no: u.nomor,
      tujuanPembelajaran: existing?.tujuanPembelajaran || tpDefault,
      ruangLingkupMateri: existing?.ruangLingkupMateri || 'Studi Kasus & Pemecahan Masalah',
      levelKognitif: u.levelBloom || existing?.levelKognitif || 'C5 (Mengevaluasi)',
      indikatorSoal:
        existing?.indikatorSoal ||
        `Peserta didik dapat menguraikan jawaban studi kasus nomor ${u.nomor}.`,
      bentukSoal: 'Uraian',
      nomorSoal: u.nomor,
      naskahSoal: u.pertanyaan,
      kunciJawaban: u.rubrikDanKunci,
      skor: u.skor || 5,
    });
  });

  const skorMaksimalPg = soalPilihanGanda.reduce((sum, s) => sum + (s.skor || 1), 0);
  const skorMaksimalPgKompleks = soalPgKompleks.reduce((sum, s) => sum + (s.skor || 2), 0);
  const skorMaksimalMenjodohkan = soalMenjodohkan.reduce((sum, s) => sum + (s.skor || 1), 0);
  const skorMaksimalIsian = soalIsianSingkat.reduce((sum, s) => sum + (s.skor || 2), 0);
  const skorMaksimalUraian = soalUraian.reduce((sum, s) => sum + (s.skor || 5), 0);
  const totalSkorMaksimal =
    skorMaksimalPg +
    skorMaksimalPgKompleks +
    skorMaksimalMenjodohkan +
    skorMaksimalIsian +
    skorMaksimalUraian || 1;

  return {
    identitas: {
      ...fallback.identitas,
      ...(data.identitas || {}),
      jumlahSoal: summary.totalSoal,
      opsiPg,
    },
    petunjukUmum: data.petunjukUmum?.length ? data.petunjukUmum : fallback.petunjukUmum,
    soalPilihanGanda,
    soalPgKompleks,
    soalMenjodohkan,
    soalIsianSingkat,
    soalUraian,
    kisiKisiTabel,
    pedomanPenskoran: {
      skorMaksimalPg,
      skorMaksimalPgKompleks,
      skorMaksimalMenjodohkan,
      skorMaksimalIsian,
      skorMaksimalUraian,
      totalSkorMaksimal,
      rumusNilaiAkhir: `Nilai Akhir = (Total Skor Perolehan / ${totalSkorMaksimal}) × 100`,
    },
  };
}
