import { NextRequest, NextResponse } from 'next/server';
import { createGeminiClient, DEFAULT_GEMINI_MODEL, classifyGeminiError, logGeminiFallback } from '@/lib/gemini';

export interface ProsemRow {
  unitBab: string;
  topikKonten: string;
  pertemuanKe: string;
  alokasiWaktu: number; // in JP (e.g. 4)
  distribution: Record<string, number>; // key: e.g. "Juli_3" -> value: 4 or 2
  keterangan?: string;
  isCadangan?: boolean;
}

export interface ProsemResponse {
  identitas: {
    namaSekolah: string;
    namaMapel: string;
    kelas: string;
    fase: string;
    tahunPelajaran: string;
    alokasiJpPerMinggu: number;
    kepalaSekolah: string;
    nipKepalaSekolah: string;
    guruMapel: string;
    nipGuru: string;
    titimangsa: string;
  };
  ganjilRows: ProsemRow[];
  genapRows: ProsemRow[];
  totalJpGanjil: number;
  totalJpGenap: number;
  totalJpTahunan: number;
  isFallback: boolean;
  warning?: string;
  errorCode?: string;
}

export async function POST(req: NextRequest) {
  let fallbackParams: GenerateProsemParams = {
    namaSekolah: 'SD Negeri Kalimantong',
    namaMapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelas: 'Kelas V (Lima)',
    fase: 'Fase C',
    tahunPelajaran: '2026/2027',
    alokasiJpPerMinggu: 4,
    protaText: '',
    kepalaSekolah: 'H. A. Kadir, S.Pd., M.Pd.',
    nipKepalaSekolah: '19680512 199303 1 008',
    guruMapel: 'Guru PJOK SD Negeri Kalimantong',
    nipGuru: '19880724 201503 1 003',
    titimangsa: 'Kalimantong, 13 Juli 2026',
  };

  try {
    const body = await req.json();
    const {
      namaSekolah = 'SD Negeri Kalimantong',
      namaMapel = 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
      kelas = 'Kelas V (Lima)',
      fase = 'Fase C',
      tahunPelajaran = '2026/2027',
      alokasiJpPerMinggu = 4,
      protaText = '',
      kepalaSekolah = 'H. A. Kadir, S.Pd., M.Pd.',
      nipKepalaSekolah = '19680512 199303 1 008',
      guruMapel = 'Guru PJOK SD Negeri Kalimantong',
      nipGuru = '19880724 201503 1 003',
      titimangsa = 'Kalimantong, 13 Juli 2026',
    } = body;

    fallbackParams = {
      namaSekolah,
      namaMapel,
      kelas,
      fase,
      tahunPelajaran,
      alokasiJpPerMinggu,
      protaText,
      kepalaSekolah,
      nipKepalaSekolah,
      guruMapel,
      nipGuru,
      titimangsa,
    };

    const ai = createGeminiClient();
    if (!ai) {
      return NextResponse.json({
        ...generateFallbackProsem(fallbackParams),
        warning: 'GEMINI_API_KEY belum diatur. PROSEM disusun menggunakan Mode Template otomatis.',
      });
    }

    const isKelasTransisi = /\b(1|7|10|I|VII|X)\b/i.test(kelas);
    const mplsLabel = isKelasTransisi ? 'MPLS (Masa Pengenalan Lingkungan Sekolah)' : 'Libur Akhir Tahun Pelajaran / Persiapan Ajaran Baru';

    const systemInstruction = `Anda adalah Pakar Kurikulum Merdeka Kemendikbudristek dan Perencana Kurikulum Sekolah Dasar.
Tugas Anda adalah memetakan Program Tahunan (PROTA) ke dalam tabel Program Semester (PROSEM) horizontal lengkap untuk Semester Ganjil (Juli - Desember) dan Semester Genap (Januari - Juni).

KETENTUAN PROSEM & DISTRIBUSI MINGGU:
1. Kolom utama:
   - Unit/BAB: Tema atau judul bab
   - Topik/Konten: Pokok bahasan atau submateri
   - Pertemuan Ke-: Nomor pertemuan di semester tersebut (misal: 1, 2, 3, 4...)
   - Alokasi Waktu (JP): Jumlah jam pelajaran (${alokasiJpPerMinggu} JP atau kelipatannya)
   - Keterangan: Catatan seperti STS, SAS, Libur

2. Rincian Minggu Efektif dan Tidak Efektif:
   SEMESTER GANJIL (Total 18 Pekan Efektif):
   - Juli: Minggu 1-2 TIDAK EFEKTIF (${mplsLabel}), Minggu 3-4 EFEKTIF (2 efektif, 2 tidak)
   - Agustus: Minggu 1-4 EFEKTIF (4 efektif, 0 tidak)
   - September: Minggu 1-2 EFEKTIF, Minggu 3-4 TIDAK EFEKTIF (Asesmen Sumatif Tengah Semester / STS) (2 efektif, 2 tidak)
   - Oktober: Minggu 1-4 EFEKTIF (4 efektif, 0 tidak)
   - November: Minggu 1-4 EFEKTIF (4 efektif, 0 tidak)
   - Desember: Minggu 1-2 TIDAK EFEKTIF (Asesmen Sumatif Akhir Semester / SAS), Minggu 3-4 EFEKTIF (Pekan Cadangan/Remedial/Porseni) (2 efektif, 2 tidak)

   SEMESTER GENAP (Total 19 Pekan Efektif):
   - Januari: Minggu 1-4 EFEKTIF (4 efektif, 0 tidak)
   - Februari: Minggu 1-4 EFEKTIF (4 efektif, 0 tidak)
   - Maret: Minggu 1-2 TIDAK EFEKTIF (Asesmen Sumatif Tengah Semester / STS), Minggu 3-4 TIDAK EFEKTIF (Libur Awal Ramadhan) (0 efektif, 4 tidak)
   - April: Minggu 1-5 EFEKTIF (5 efektif, 0 tidak)
   - Mei: Minggu 1-4 EFEKTIF (4 efektif, 0 tidak)
   - Juni: Minggu 1-2 TIDAK EFEKTIF (Asesmen Sumatif Akhir Tahun / SAT), Minggu 3-4 EFEKTIF (Pekan Porseni & Cadangan) (2 efektif, 2 tidak)

3. Format Distribusi Tiap Baris:
   Setiap pekan efektif diisi dengan angka alokasi JP (${alokasiJpPerMinggu} JP per minggu, atau jika dalam 1 pekan ada 2 topik berbeda, masing-masing 2 JP sehingga total per minggu tetap ${alokasiJpPerMinggu} JP).

Kembalikan format JSON murni:
{
  "ganjilRows": [
    {
      "unitBab": "Bab 1: Permainan Bola Besar",
      "topikKonten": "Variasi menendang dan menghentikan bola",
      "pertemuanKe": "1",
      "alokasiWaktu": 4,
      "distribution": { "Juli_3": 4 },
      "keterangan": ""
    }
  ],
  "genapRows": [
    ...
  ]
}`;

    const userPrompt = `Petakan data PROTA berikut ke dalam tabel Program Semester (PROSEM) horizontal untuk ${namaMapel}, ${kelas}, ${fase}, tahun pelajaran ${tahunPelajaran}:

PROTA YANG DIBERIKAN:
${protaText || `Semester 1:
- Bab 1 Permainan Bola Besar (Sepak Bola & Voli) - 8 JP (2 pertemuan)
- Bab 2 Permainan Bola Kecil (Kasti) - 8 JP (2 pertemuan)
- Bab 3 Atletik (Lari Cepat 40m & Lompat Jauh) - 8 JP (2 pertemuan)
- Bab 4 Kebugaran Jasmani & TKJI - 12 JP (3 pertemuan)
- Cadangan & Remedial - 4 JP (1 pertemuan)

Semester 2:
- Bab 5 Senam Lantai (Guling Depan & Sikap Lilin) - 8 JP (2 pertemuan)
- Bab 6 Gerak Berirama (SKJ & Langkah Kaki) - 12 JP (3 pertemuan)
- Bab 7 Aktivitas Air & Keselamatan - 8 JP (2 pertemuan)
- Bab 8 Kebersihan Alat Reproduksi & Pola Sehat - 8 JP (2 pertemuan)
- Cadangan & Remedial - 4 JP (1 pertemuan)`}

Alokasi waktu tiap minggu yaitu ${alokasiJpPerMinggu} JP. 
Rincian minggu efektif:
Juli = 2 dan 2
Agustus = 4 dan 0
September = 2 dan 2 (minggu 3,4 STS)
Oktober = 4 dan 0
November = 4 dan 0
Desember = 2 dan 2 (minggu 1,2 SAS)
Januari = 4 dan 0
Februari = 4 dan 0
Maret = 0 dan 4 (minggu 1,2 STS, minggu 3,4 libur puasa)
April = 5 dan 0
Mei = 4 dan 0
Juni = 2 dan 2 (minggu 1,2 SAT)

Pastikan seluruh 18 pekan efektif semester 1 dan 19 pekan efektif semester 2 terisi secara runtut.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    let parsed: { ganjilRows?: ProsemRow[]; genapRows?: ProsemRow[] } = {};
    try {
      parsed = JSON.parse(outputText);
    } catch {
      const match = outputText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    if (!parsed.ganjilRows || !parsed.genapRows || parsed.ganjilRows.length === 0) {
      return NextResponse.json(
        generateFallbackProsem({
          namaSekolah,
          namaMapel,
          kelas,
          fase,
          tahunPelajaran,
          alokasiJpPerMinggu,
          protaText,
          kepalaSekolah,
          nipKepalaSekolah,
          guruMapel,
          nipGuru,
          titimangsa,
        })
      );
    }

    const ganjilRows = parsed.ganjilRows;
    const genapRows = parsed.genapRows;
    const totalJpGanjil = ganjilRows.reduce((a, b) => a + (Number(b.alokasiWaktu) || 0), 0);
    const totalJpGenap = genapRows.reduce((a, b) => a + (Number(b.alokasiWaktu) || 0), 0);

    return NextResponse.json({
      identitas: {
        namaSekolah,
        namaMapel,
        kelas,
        fase,
        tahunPelajaran,
        alokasiJpPerMinggu,
        kepalaSekolah,
        nipKepalaSekolah,
        guruMapel,
        nipGuru,
        titimangsa,
      },
      ganjilRows,
      genapRows,
      totalJpGanjil,
      totalJpGenap,
      totalJpTahunan: totalJpGanjil + totalJpGenap,
      isFallback: false,
    });
  } catch (error: unknown) {
    const errInfo = classifyGeminiError(error);
    logGeminiFallback('PROSEM', errInfo);
    return NextResponse.json({
      ...generateFallbackProsem(fallbackParams),
      errorCode: errInfo.code,
      warning: errInfo.userMessage,
    });
  }
}

interface GenerateProsemParams {
  namaSekolah: string;
  namaMapel: string;
  kelas: string;
  fase: string;
  tahunPelajaran: string;
  alokasiJpPerMinggu: number;
  protaText: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  guruMapel: string;
  nipGuru: string;
  titimangsa: string;
}

function generateFallbackProsem(params: GenerateProsemParams): ProsemResponse {
  const jp = params.alokasiJpPerMinggu; // e.g. 4 or 5

  // 18 Effective Weeks in Semester Ganjil:
  // Juli_3, Juli_4 (2)
  // Agustus_1, Agustus_2, Agustus_3, Agustus_4 (4)
  // September_1, September_2 (2)
  // Oktober_1, Oktober_2, Oktober_3, Oktober_4 (4)
  // November_1, November_2, November_3, November_4 (4)
  // Desember_3, Desember_4 (2)
  // Total = 18 Pekan * jp (e.g. 18 * 4 = 72 JP)

  const ganjilRows: ProsemRow[] = [
    {
      unitBab: 'Bab 1: Permainan Bola Besar (Sepak Bola)',
      topikKonten: 'Variasi pola gerak dasar menendang dan menghentikan bola dengan kaki bagian dalam & luar',
      pertemuanKe: '1',
      alokasiWaktu: jp,
      distribution: { Juli_3: jp },
      keterangan: 'Awal KBM Efektif',
    },
    {
      unitBab: 'Bab 1: Permainan Bola Besar (Sepak Bola)',
      topikKonten: 'Kombinasi menggiring dan mengumpan bola berpasangan serta penerapan mini soccer',
      pertemuanKe: '2',
      alokasiWaktu: jp,
      distribution: { Juli_4: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 1: Permainan Bola Besar (Bola Voli)',
      topikKonten: 'Variasi gerak dasar passing bawah bola voli berpasangan dengan posisi lutut menekuk',
      pertemuanKe: '3',
      alokasiWaktu: jp,
      distribution: { Agustus_1: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 1: Permainan Bola Besar (Bola Voli)',
      topikKonten: 'Passing atas dan servis bawah sederhana dalam permainan bola voli modifikasi',
      pertemuanKe: '4',
      alokasiWaktu: jp,
      distribution: { Agustus_2: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 2: Permainan Bola Kecil (Kasti / Rounders)',
      topikKonten: 'Keterampilan melempar bola melambung, mendatar, dan menyusur tanah dengan akurat',
      pertemuanKe: '5',
      alokasiWaktu: jp,
      distribution: { Agustus_3: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 2: Permainan Bola Kecil (Kasti / Rounders)',
      topikKonten: 'Teknik memukul bola kasti dan menangkap bola lambung secara berpasangan',
      pertemuanKe: '6',
      alokasiWaktu: jp,
      distribution: { Agustus_4: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 2: Permainan Bola Kecil (Kasti / Rounders)',
      topikKonten: 'Simulasi taktik regu pemukul dan regu penjaga dalam permainan kasti modifikasi',
      pertemuanKe: '7',
      alokasiWaktu: jp,
      distribution: { September_1: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 3: Aktivitas Atletik Dasar',
      topikKonten: 'Start jongkok (bunch start, medium start) dan teknik dorongan kaki awal',
      pertemuanKe: '8',
      alokasiWaktu: jp,
      distribution: { September_2: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 3: Aktivitas Atletik Dasar',
      topikKonten: 'Lari cepat (sprint) 40 meter, ayunan lengan, dan teknik memasuki garis finis',
      pertemuanKe: '9',
      alokasiWaktu: jp,
      distribution: { Oktober_1: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 3: Aktivitas Atletik Dasar',
      topikKonten: 'Lompat jauh gaya jongkok: awalan lari, tolakan pada balok tumpu, dan melayang di udara',
      pertemuanKe: '10',
      alokasiWaktu: jp,
      distribution: { Oktober_2: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 3: Aktivitas Atletik Dasar',
      topikKonten: 'Pendaratan aman dengan kedua kaki mengeper di bak pasir dan evaluasi jarak lompatan',
      pertemuanKe: '11',
      alokasiWaktu: jp,
      distribution: { Oktober_3: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 4: Kebugaran Jasmani Terkait Kesehatan & TKJI',
      topikKonten: 'Konsep 5 komponen kebugaran jasmani & latihan sirkuit daya tahan jantung-paru (shuttle run)',
      pertemuanKe: '12',
      alokasiWaktu: jp,
      distribution: { Oktober_4: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 4: Kebugaran Jasmani Terkait Kesehatan & TKJI',
      topikKonten: 'Latihan kekuatan dan daya tahan otot: sit-up 30 detik dan push-up modifikasi',
      pertemuanKe: '13',
      alokasiWaktu: jp,
      distribution: { November_1: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 4: Kebugaran Jasmani Terkait Kesehatan & TKJI',
      topikKonten: 'Latihan daya ledak tungkai (vertical jump / loncat tegak) dan fleksibilitas tubuh',
      pertemuanKe: '14',
      alokasiWaktu: jp,
      distribution: { November_2: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 4: Kebugaran Jasmani Terkait Kesehatan & TKJI',
      topikKonten: 'Pelaksanaan lengkap baterai tes TKJI (Lari sprint, pull up, sit up, loncat, lari 600m)',
      pertemuanKe: '15',
      alokasiWaktu: jp,
      distribution: { November_3: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 4: Kebugaran Jasmani Terkait Kesehatan & TKJI',
      topikKonten: 'Pengukuran denyut nadi istirahat & latihan serta analisis status kebugaran pribadi',
      pertemuanKe: '16',
      alokasiWaktu: jp,
      distribution: { November_4: jp },
      keterangan: '',
    },
    {
      unitBab: 'Cadangan & Asesmen Sumatif Akhir',
      topikKonten: 'Program remedial gerak, pengayaan motorik siswa, dan tindak lanjut pasca-SAS',
      pertemuanKe: '17',
      alokasiWaktu: jp,
      distribution: { Desember_3: jp },
      keterangan: 'Pekan Cadangan & Remedial',
      isCadangan: true,
    },
    {
      unitBab: 'Cadangan & Evaluasi Fisik',
      topikKonten: 'Pekan Porseni antarkelas, refleksi kebugaran jasmani semester ganjil, dan pembagian rapor',
      pertemuanKe: '18',
      alokasiWaktu: jp,
      distribution: { Desember_4: jp },
      keterangan: 'Pekan Evaluasi & Porseni',
      isCadangan: true,
    },
  ];

  // 19 Effective Weeks in Semester Genap:
  // Januari_1, Januari_2, Januari_3, Januari_4 (4)
  // Februari_1, Februari_2, Februari_3, Februari_4 (4)
  // Maret = 0 Efektif
  // April_1, April_2, April_3, April_4, April_5 (5)
  // Mei_1, Mei_2, Mei_3, Mei_4 (4)
  // Juni_3, Juni_4 (2)
  // Total = 19 Pekan * jp (e.g. 19 * 4 = 76 JP)

  const genapRows: ProsemRow[] = [
    {
      unitBab: 'Bab 5: Senam Lantai (Ketangkasan & Keseimbangan)',
      topikKonten: 'Pemanasan peregangan statis-dinamis dan pengenalan matras senam',
      pertemuanKe: '1',
      alokasiWaktu: jp,
      distribution: { Januari_1: jp },
      keterangan: 'Awal KBM Genap',
    },
    {
      unitBab: 'Bab 5: Senam Lantai (Ketangkasan & Keseimbangan)',
      topikKonten: 'Variasi gerak guling depan (forward roll) awalan jongkok dengan bantuan guru',
      pertemuanKe: '2',
      alokasiWaktu: jp,
      distribution: { Januari_2: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 5: Senam Lantai (Ketangkasan & Keseimbangan)',
      topikKonten: 'Guling depan awalan berdiri mandiri dengan sikap mendarat jongkok seimbang',
      pertemuanKe: '3',
      alokasiWaktu: jp,
      distribution: { Januari_3: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 5: Senam Lantai (Ketangkasan & Keseimbangan)',
      topikKonten: 'Latihan keseimbangan statis: sikap lilin dan berdiri satu kaki membentuk pesawat',
      pertemuanKe: '4',
      alokasiWaktu: jp,
      distribution: { Januari_4: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 6: Gerak Berirama (Senam Kesegaran Jasmani)',
      topikKonten: 'Pola langkah kaki berirama: langkah biasa (loopas) dan langkah rapat (bijtrekpas)',
      pertemuanKe: '5',
      alokasiWaktu: jp,
      distribution: { Februari_1: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 6: Gerak Berirama (Senam Kesegaran Jasmani)',
      topikKonten: 'Variasi ayunan satu lengan dan dua lengan ke depan, samping, dan atas mengikuti ketukan',
      pertemuanKe: '6',
      alokasiWaktu: jp,
      distribution: { Februari_2: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 6: Gerak Berirama (Senam Kesegaran Jasmani)',
      topikKonten: 'Kombinasi gerak langkah kaki dan ayunan lengan berirama secara berkelompok',
      pertemuanKe: '7',
      alokasiWaktu: jp,
      distribution: { Februari_3: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 6: Gerak Berirama (Senam Kesegaran Jasmani)',
      topikKonten: 'Praktek koreografi senam kreasi irama nusantara sederhana dengan kekompakan regu',
      pertemuanKe: '8',
      alokasiWaktu: jp,
      distribution: { Februari_4: jp },
      keterangan: '',
    },
    // Note: Maret is skipped for effective weeks (0 effective)
    {
      unitBab: 'Bab 7: Aktivitas Air & Keselamatan Diri di Air',
      topikKonten: 'Pengenalan air di kolam dangkal: membasuh muka, jalan di air, dan memasukkan kepala',
      pertemuanKe: '9',
      alokasiWaktu: jp,
      distribution: { April_1: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 7: Aktivitas Air & Keselamatan Diri di Air',
      topikKonten: 'Teknik meluncur dengan tolakan kedua kaki dari dinding kolam dan posisi tubuh streamline',
      pertemuanKe: '10',
      alokasiWaktu: jp,
      distribution: { April_2: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 7: Aktivitas Air & Keselamatan Diri di Air',
      topikKonten: 'Gerakan tungkai gaya dada: menarik, menendang melingkar, dan merapatkan kedua kaki',
      pertemuanKe: '11',
      alokasiWaktu: jp,
      distribution: { April_3: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 7: Aktivitas Air & Keselamatan Diri di Air',
      topikKonten: 'Kombinasi pernapasan ritmis dan ayunan lengan renang gaya dada modifikasi',
      pertemuanKe: '12',
      alokasiWaktu: jp,
      distribution: { April_4: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 7: Aktivitas Air & Keselamatan Diri di Air',
      topikKonten: 'Etika keselamatan di kolam renang, pencegahan bahaya air, dan pertolongan pertama kram',
      pertemuanKe: '13',
      alokasiWaktu: jp,
      distribution: { April_5: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 8: Pemeliharaan Kebersihan Alat Reproduksi & Pola Hidup Sehat',
      topikKonten: 'Mengenal organ reproduksi dan perubahan fisik pada masa pubertas laki-laki & perempuan',
      pertemuanKe: '14',
      alokasiWaktu: jp,
      distribution: { Mei_1: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 8: Pemeliharaan Kebersihan Alat Reproduksi & Pola Hidup Sehat',
      topikKonten: 'Prosedur merawat kebersihan pakaian dalam, membasuh setelah BAK/BAB, dan mandi teratur',
      pertemuanKe: '15',
      alokasiWaktu: jp,
      distribution: { Mei_2: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 8: Pemeliharaan Kebersihan Alat Reproduksi & Pola Hidup Sehat',
      topikKonten: 'Pentingnya gizi seimbang (isi piringku), istirahat cukup, dan bahaya rokok bagi organ tubuh',
      pertemuanKe: '16',
      alokasiWaktu: jp,
      distribution: { Mei_3: jp },
      keterangan: '',
    },
    {
      unitBab: 'Bab 8: Pemeliharaan Kebersihan Alat Reproduksi & Pola Hidup Sehat',
      topikKonten: 'Membuat karya poster edukatif Pola Hidup Bersih dan Sehat (PHBS) di sekolah',
      pertemuanKe: '17',
      alokasiWaktu: jp,
      distribution: { Mei_4: jp },
      keterangan: '',
    },
    {
      unitBab: 'Cadangan & Asesmen Sumatif Akhir Tahun',
      topikKonten: 'Pekan remedial ketuntasan TP, pengayaan motorik siswa, dan verifikasi nilai rapor',
      pertemuanKe: '18',
      alokasiWaktu: jp,
      distribution: { Juni_3: jp },
      keterangan: 'Pekan Cadangan & Remedial',
      isCadangan: true,
    },
    {
      unitBab: 'Cadangan & Gelar Prestasi Olahraga',
      topikKonten: 'Pekan olahraga sekolah (Porseni akhir tahun), evaluasi kebugaran TKJI tahap 2, rapor kenaikan kelas',
      pertemuanKe: '19',
      alokasiWaktu: jp,
      distribution: { Juni_4: jp },
      keterangan: 'Porseni & Pembagian Rapor',
      isCadangan: true,
    },
  ];

  const totalJpGanjil = ganjilRows.reduce((a, b) => a + b.alokasiWaktu, 0);
  const totalJpGenap = genapRows.reduce((a, b) => a + b.alokasiWaktu, 0);

  return {
    identitas: {
      namaSekolah: params.namaSekolah,
      namaMapel: params.namaMapel,
      kelas: params.kelas,
      fase: params.fase,
      tahunPelajaran: params.tahunPelajaran,
      alokasiJpPerMinggu: params.alokasiJpPerMinggu,
      kepalaSekolah: params.kepalaSekolah,
      nipKepalaSekolah: params.nipKepalaSekolah,
      guruMapel: params.guruMapel,
      nipGuru: params.nipGuru,
      titimangsa: params.titimangsa,
    },
    ganjilRows,
    genapRows,
    totalJpGanjil,
    totalJpGenap,
    totalJpTahunan: totalJpGanjil + totalJpGenap,
    isFallback: true,
  };
}
