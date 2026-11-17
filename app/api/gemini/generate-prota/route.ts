import { NextRequest, NextResponse } from 'next/server';
import { createGeminiClient, DEFAULT_GEMINI_MODEL, classifyGeminiError, logGeminiFallback } from '@/lib/gemini';

export interface ProtaRow {
  noBabAtp: string;
  bab: string;
  tujuanPembelajaran: string;
  materi: string;
  alokasiWaktu: number; // in JP (e.g. 5, 10)
  semester: 'I (Ganjil)' | 'II (Genap)';
  isCadangan?: boolean;
}

export interface ProtaResponse {
  identitas: {
    namaSekolah: string;
    namaMapel: string;
    kelas: string;
    fase: string;
    tahunPelajaran: string;
    jpPerMinggu: number;
    pekanSmt1: number;
    pekanSmt2: number;
    targetJpSmt1: number;
    targetJpSmt2: number;
    targetTotalJp: number;
    kepalaSekolah: string;
    nipKepalaSekolah: string;
    guruMapel: string;
    nipGuru: string;
    titimangsa: string;
  };
  rows: ProtaRow[];
  totalJpSmt1: number;
  totalJpSmt2: number;
  totalJpTahunan: number;
  markdown: string;
  isFallback: boolean;
  warning?: string;
  errorCode?: string;
}

export async function POST(req: NextRequest) {
  let fallbackParams: GenerateParams = {
    namaSekolah: 'SD Negeri Kalimantong',
    namaMapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelas: 'Kelas V',
    fase: 'Fase C',
    tahunPelajaran: '2026/2027',
    jpPerMinggu: 5,
    pekanSmt1: 18,
    pekanSmt2: 19,
    targetJpSmt1: 90,
    targetJpSmt2: 95,
    targetTotalJp: 185,
    babSemester1: '',
    babSemester2: '',
    tujuanPembelajaran: '',
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
      kelas = 'Kelas V',
      fase = 'Fase C',
      tahunPelajaran = '2026/2027',
      jpPerMinggu = 5,
      pekanSmt1 = 18,
      pekanSmt2 = 19,
      babSemester1 = '',
      babSemester2 = '',
      tujuanPembelajaran = '',
      kepalaSekolah = 'H. A. Kadir, S.Pd., M.Pd.',
      nipKepalaSekolah = '19680512 199303 1 008',
      guruMapel = 'Guru PJOK SD Negeri Kalimantong',
      nipGuru = '19880724 201503 1 003',
      titimangsa = 'Kalimantong, 13 Juli 2026',
    } = body;

    const targetJpSmt1 = pekanSmt1 * jpPerMinggu;
    const targetJpSmt2 = pekanSmt2 * jpPerMinggu;
    const targetTotalJp = targetJpSmt1 + targetJpSmt2;

    fallbackParams = {
      namaSekolah,
      namaMapel,
      kelas,
      fase,
      tahunPelajaran,
      jpPerMinggu,
      pekanSmt1,
      pekanSmt2,
      targetJpSmt1,
      targetJpSmt2,
      targetTotalJp,
      babSemester1,
      babSemester2,
      tujuanPembelajaran,
      kepalaSekolah,
      nipKepalaSekolah,
      guruMapel,
      nipGuru,
      titimangsa,
    };

    const ai = createGeminiClient();
    if (!ai) {
      return NextResponse.json({
        ...generateFallbackProta(fallbackParams),
        warning: 'GEMINI_API_KEY belum diatur. PROTA disusun menggunakan Mode Template otomatis.',
      });
    }

    const systemInstruction = `Anda adalah Pakar Kurikulum Merdeka Kemendikbudristek dan Pengembang Perangkat Pembelajaran Sekolah Dasar.
Tugas Anda adalah menyusun tabel Program Tahunan (PROTA) yang sangat rapi, sistematis, dan akurat perhitungannya sesuai dengan ketentuan berikut:

KETENTUAN PROTA:
1. Struktur Kolom Tabel:
   - No Bab/ATP: Nomor urut bab dan ATP (contoh: "1.1", "1.2", "Cadangan I", "2.1", dst).
   - Bab: Nama bab sesuai pembagian semester yang diberikan.
   - Tujuan Pembelajaran: Tulis ulang tujuan pembelajaran persis seperti yang diberikan (jangan mengubah substansi tujuan).
   - Materi: Pokok bahasan atau submateri yang sesuai dengan bab/topik dari tujuan pembelajaran.
   - Alokasi Waktu: Jumlah jam pelajaran (JP). Wajib merupakan kelipatan dari JP per minggu (${jpPerMinggu} JP). Setiap baris minimal bernilai ${jpPerMinggu} JP (misal: ${jpPerMinggu} JP, ${jpPerMinggu * 2} JP). Jika tujuan pembelajaran terlalu banyak, kelompokkan atau distribusikan dengan tepat.
   - Semester: "I (Ganjil)" untuk materi semester 1, dan "II (Genap)" untuk materi semester 2.

2. Ketentuan Alokasi Waktu dan Cadangan:
   - Semester 1 = ${pekanSmt1} Pekan x ${jpPerMinggu} JP = ${targetJpSmt1} JP.
   - Semester 2 = ${pekanSmt2} Pekan x ${jpPerMinggu} JP = ${targetJpSmt2} JP.
   - Total 1 Tahun = ${targetTotalJp} JP.
   - WAJIB tambahkan baris "Cadangan" / "Asesmen Sumatif Akhir Semester" dengan alokasi waktu ${jpPerMinggu} JP di setiap akhir semester ganjil (Semester I) dan semester genap (Semester II).
   - Total alokasi waktu seluruh baris Semester 1 (termasuk cadangan) HARUS TEPAT sama dengan ${targetJpSmt1} JP.
   - Total alokasi waktu seluruh baris Semester 2 (termasuk cadangan) HARUS TEPAT sama dengan ${targetJpSmt2} JP.

3. Format Output:
Kembalikan JSON murni tanpa markdown fence (atau di dalam blok json) dengan struktur:
{
  "rows": [
    {
      "noBabAtp": "1.1",
      "bab": "Bab 1: ...",
      "tujuanPembelajaran": "...",
      "materi": "...",
      "alokasiWaktu": 5,
      "semester": "I (Ganjil)",
      "isCadangan": false
    },
    ...
    {
      "noBabAtp": "Cadangan I",
      "bab": "Cadangan / Asesmen Akhir Semester I",
      "tujuanPembelajaran": "Kegiatan remedial, pengayaan, dan asesmen sumatif akhir semester",
      "materi": "Cadangan dan Asesmen Akhir",
      "alokasiWaktu": 5,
      "semester": "I (Ganjil)",
      "isCadangan": true
    }
  ]
}`;

    const userPrompt = `Susun tabel Program Tahunan (PROTA) mata pelajaran ${namaMapel} berdasarkan Kurikulum Merdeka untuk kelas ${kelas} fase ${fase} tahun pelajaran ${tahunPelajaran}, menggunakan format kolom berikut:
No Bab/ATP – Nomor urut bab dan ATP.
Bab – Nama bab sesuai data di bawah.
Tujuan Pembelajaran – Tulis ulang tujuan pembelajaran sesuai data yang diberikan di bawah (jangan merubah tujuan).
Materi – Pokok bahasan atau submateri yang sesuai dengan bab/topik yang diambil dari tujuan pembelajaran atau bab.
Alokasi Waktu – Jumlah menit/jam pembelajaran yang disesuaikan dengan kompleksitas tujuan pembelajaran. Alokasi waktu menyesuaikan dengan Alokasi waktu tiap minggu (${jpPerMinggu} JP) atau kelipatannya (${jpPerMinggu * 2} JP). wajib sesuai dengan alokasi waktu tiap minggu yang ditentukan, jika tujuan pembelajaran terlalu banyak maka gabungkan tujuan tersebut untuk satu alokasi waktu. Jangan memberikan alokasi waktu kurang dari alokasi waktu tiap minggu.
Semester – Tuliskan I (Ganjil) atau II (Genap) sesuai pembagian materi.

Ketentuan:
Gunakan pembagian bab dan urutan sesuai data yang diberikan.
Setiap bab harus memuat semua ATP (Alur Tujuan Pembelajaran) dan materi terkait di bawahnya.
Pastikan format tabel rapi, mudah dibaca, dan konsisten.
Alokasi waktu disesuaikan berdasarkan analisis jumlah dan tingkat kesulitan tujuan pembelajaran di tiap bab dengan jumlah total ${targetTotalJp} JP. Semester 1 yaitu ${pekanSmt1} pekan (${targetJpSmt1} JP), Semester 2 yaitu ${pekanSmt2} Pekan (${targetJpSmt2} JP). Alokasi waktu tiap minggu yaitu ${jpPerMinggu} JP. 
Tambahkan “Cadangan” dengan alokasi waktu sesuai dengan alokasi waktu tiap minggu (${jpPerMinggu} JP) di setiap akhir semester ganjil dan genap.

INPUT YANG DIBERIKAN:
DAFTAR BAB DAN PEMBAGIAN SEMESTER:
Semester 1:
${babSemester1 || 'Bab 1: Permainan Bola Besar (Sepak Bola & Bola Voli)\nBab 2: Permainan Bola Kecil (Kasti/Rounders)\nBab 3: Aktivitas Atletik Dasar (Lari Jarak Pendek, Lompat Jauh)\nBab 4: Aktivitas Kebugaran Jasmani Terkait Kesehatan'}

Semester 2:
${babSemester2 || 'Bab 5: Senam Lantai (Guling Depan & Keseimbangan Statis)\nBab 6: Gerak Berirama (Senam Kesegaran Jasmani)\nBab 7: Aktivitas Air & Keselamatan Diri (Renang Gaya Dada/Modifikasi)\nBab 8: Pemeliharaan Kebersihan Alat Reproduksi & Pola Hidup Sehat'}

TUJUAN PEMBELAJARAN LENGKAP:
${tujuanPembelajaran || '1.1 Murid dapat mempraktikkan variasi pola gerak dasar menendang dan menghentikan bola sepak.\n1.2 Murid dapat mempraktikkan passing bawah bola voli berpasangan dengan koordinasi tepat.\n2.1 Murid dapat mempraktikkan lempar tangkap bola kasti dengan akurasi dan kerja sama tim.\n3.1 Murid dapat mempraktikkan start jongkok dan lari sprint 40 meter dengan teknik benar.\n4.1 Murid dapat mengukur kebugaran jasmani dasar (push up, sit up, denyut nadi).\n5.1 Murid dapat melakukan variasi gerak guling depan di atas matras dengan aman.\n6.1 Murid dapat mempraktikkan rangkaian langkah kaki dan ayunan lengan berirama.\n7.1 Murid dapat menunjukkan teknik pengenalan air dan pernapasan berirama.\n8.1 Murid dapat menganalisis pentingnya menjaga kebersihan alat reproduksi.'}`;

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    let parsed: { rows?: ProtaRow[] } = {};
    try {
      parsed = JSON.parse(outputText);
    } catch {
      // If parsing fails, try substring search
      const match = outputText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    if (!parsed.rows || !Array.isArray(parsed.rows) || parsed.rows.length === 0) {
      return NextResponse.json(
        generateFallbackProta({
          namaSekolah,
          namaMapel,
          kelas,
          fase,
          tahunPelajaran,
          jpPerMinggu,
          pekanSmt1,
          pekanSmt2,
          targetJpSmt1,
          targetJpSmt2,
          targetTotalJp,
          babSemester1,
          babSemester2,
          tujuanPembelajaran,
          kepalaSekolah,
          nipKepalaSekolah,
          guruMapel,
          nipGuru,
          titimangsa,
        })
      );
    }

    const rows = parsed.rows.map((r, i) => ({
      noBabAtp: r.noBabAtp || `${i + 1}`,
      bab: r.bab || '',
      tujuanPembelajaran: r.tujuanPembelajaran || '',
      materi: r.materi || '',
      alokasiWaktu: Number(r.alokasiWaktu) || jpPerMinggu,
      semester: (r.semester && r.semester.includes('II') ? 'II (Genap)' : 'I (Ganjil)') as 'I (Ganjil)' | 'II (Genap)',
      isCadangan: !!r.isCadangan || r.bab.toLowerCase().includes('cadangan'),
    }));

    // Calculate totals
    const totalJpSmt1 = rows.filter((r) => r.semester === 'I (Ganjil)').reduce((acc, r) => acc + r.alokasiWaktu, 0);
    const totalJpSmt2 = rows.filter((r) => r.semester === 'II (Genap)').reduce((acc, r) => acc + r.alokasiWaktu, 0);
    const totalJpTahunan = totalJpSmt1 + totalJpSmt2;

    const markdown = generateProtaMarkdown(rows, {
      namaSekolah,
      namaMapel,
      kelas,
      fase,
      tahunPelajaran,
      jpPerMinggu,
      pekanSmt1,
      pekanSmt2,
      targetJpSmt1,
      targetJpSmt2,
      targetTotalJp,
      babSemester1,
      babSemester2,
      tujuanPembelajaran,
      kepalaSekolah,
      nipKepalaSekolah,
      guruMapel,
      nipGuru,
      titimangsa,
    });

    return NextResponse.json({
      identitas: {
        namaSekolah,
        namaMapel,
        kelas,
        fase,
        tahunPelajaran,
        jpPerMinggu,
        pekanSmt1,
        pekanSmt2,
        targetJpSmt1,
        targetJpSmt2,
        targetTotalJp,
        kepalaSekolah,
        nipKepalaSekolah,
        guruMapel,
        nipGuru,
        titimangsa,
      },
      rows,
      totalJpSmt1,
      totalJpSmt2,
      totalJpTahunan,
      markdown,
      isFallback: false,
    });
  } catch (error: unknown) {
    const errInfo = classifyGeminiError(error);
    logGeminiFallback('PROTA', errInfo);
    return NextResponse.json({
      ...generateFallbackProta(fallbackParams),
      errorCode: errInfo.code,
      warning: errInfo.userMessage,
    });
  }
}

interface GenerateParams {
  namaSekolah: string;
  namaMapel: string;
  kelas: string;
  fase: string;
  tahunPelajaran: string;
  jpPerMinggu: number;
  pekanSmt1: number;
  pekanSmt2: number;
  targetJpSmt1: number;
  targetJpSmt2: number;
  targetTotalJp: number;
  babSemester1?: string;
  babSemester2?: string;
  tujuanPembelajaran?: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  guruMapel: string;
  nipGuru: string;
  titimangsa: string;
}

function generateFallbackProta(params: GenerateParams): ProtaResponse {
  const jp = params.jpPerMinggu; // e.g. 5
  // Semester 1: 18 pekan * 5 JP = 90 JP
  // 17 pekan materi + 1 pekan cadangan = 18 pekan
  const rows: ProtaRow[] = [
    // Semester 1
    {
      noBabAtp: '1.1',
      bab: 'Bab 1: Permainan Bola Besar (Sepak Bola)',
      tujuanPembelajaran: 'Murid dapat mempraktikkan variasi dan kombinasi pola gerak dasar menendang, menghentikan, dan menggiring bola dengan koordinasi yang baik serta menjunjung tinggi sportivitas.',
      materi: 'Variasi dan kombinasi menendang, menghentikan, dan menggiring bola sepak',
      alokasiWaktu: jp * 2, // 10 JP (2 pekan)
      semester: 'I (Ganjil)',
    },
    {
      noBabAtp: '1.2',
      bab: 'Bab 1: Permainan Bola Besar (Bola Voli)',
      tujuanPembelajaran: 'Murid dapat mempraktikkan variasi gerak dasar passing bawah dan passing atas dalam permainan bola voli yang dimodifikasi secara berpasangan atau berkelompok.',
      materi: 'Passing bawah dan passing atas bola voli modifikasi',
      alokasiWaktu: jp * 2, // 10 JP (2 pekan)
      semester: 'I (Ganjil)',
    },
    {
      noBabAtp: '2.1',
      bab: 'Bab 2: Permainan Bola Kecil (Kasti / Rounders)',
      tujuanPembelajaran: 'Murid dapat mempraktikkan keterampilan melempar, menangkap, dan memukul bola kasti/rounders dengan akurasi terarah dan mematuhi peraturan permainan modifikasi.',
      materi: 'Melempar, menangkap, dan memukul bola kasti',
      alokasiWaktu: jp * 2, // 10 JP (2 pekan)
      semester: 'I (Ganjil)',
    },
    {
      noBabAtp: '2.2',
      bab: 'Bab 2: Permainan Bola Kecil (Kasti / Rounders)',
      tujuanPembelajaran: 'Murid dapat menerapkan taktik sederhana bermain kasti secara kolaboratif dalam regu pemukul dan regu penjaga.',
      materi: 'Taktik permainan kasti dan kerja sama regu',
      alokasiWaktu: jp * 2, // 10 JP (2 pekan)
      semester: 'I (Ganjil)',
    },
    {
      noBabAtp: '3.1',
      bab: 'Bab 3: Aktivitas Atletik Dasar (Lari Jarak Pendek & Estafet)',
      tujuanPembelajaran: 'Murid dapat mempraktikkan start jongkok, ayunan lengan, langkah kaki, dan memasuki garis finis pada lari cepat 40 meter dengan teknik yang benar.',
      materi: 'Lari cepat 40 meter dan start jongkok',
      alokasiWaktu: jp * 2, // 10 JP (2 pekan)
      semester: 'I (Ganjil)',
    },
    {
      noBabAtp: '3.2',
      bab: 'Bab 3: Aktivitas Atletik Dasar (Lompat Jauh Gaya Jongkok)',
      tujuanPembelajaran: 'Murid dapat mempraktikkan kombinasi awalan, tolakan pada balok tumpu, melayang di udara, dan mendarat pada bak lompat jauh secara aman.',
      materi: 'Teknik lompat jauh gaya jongkok modifikasi',
      alokasiWaktu: jp * 2, // 10 JP (2 pekan)
      semester: 'I (Ganjil)',
    },
    {
      noBabAtp: '4.1',
      bab: 'Bab 4: Kebugaran Jasmani Terkait Kesehatan & TKJI',
      tujuanPembelajaran: 'Murid dapat mempraktikkan latihan daya tahan jantung-paru (shuttle run), kekuatan otot (sit up, push up), dan kelenturan tubuh.',
      materi: 'Latihan sirkuit kebugaran daya tahan dan kekuatan',
      alokasiWaktu: jp * 2, // 10 JP (2 pekan)
      semester: 'I (Ganjil)',
    },
    {
      noBabAtp: '4.2',
      bab: 'Bab 4: Kebugaran Jasmani Terkait Kesehatan & TKJI',
      tujuanPembelajaran: 'Murid dapat mengukur profil kebugaran pribadi melalui baterai tes kebugaran jasmani Indonesia (TKJI) dan menghitung denyut nadi latihan.',
      materi: 'Pengukuran baterai tes TKJI dan pencatatan denyut nadi',
      alokasiWaktu: jp * 3, // 15 JP (3 pekan)
      semester: 'I (Ganjil)',
    },
    {
      noBabAtp: 'Cadangan I',
      bab: 'Cadangan / Asesmen Sumatif Akhir Semester I',
      tujuanPembelajaran: 'Kegiatan asesmen sumatif akhir semester ganjil, remedial, pengayaan, dan pekan cadangan cuaca/lapangan.',
      materi: 'Asesmen Sumatif Akhir Semester & Pekan Cadangan',
      alokasiWaktu: jp * 1, // 5 JP (1 pekan)
      semester: 'I (Ganjil)',
      isCadangan: true,
    },

    // Semester 2: 19 pekan * 5 JP = 95 JP
    // 18 pekan materi + 1 pekan cadangan = 19 pekan
    {
      noBabAtp: '5.1',
      bab: 'Bab 5: Senam Lantai (Ketangkasan & Keseimbangan)',
      tujuanPembelajaran: 'Murid dapat mempraktikkan variasi gerak senam lantai meliputi guling depan (forward roll) dengan awalan berdiri atau jongkok secara disiplin dan aman di atas matras.',
      materi: 'Guling depan di atas matras dengan prosedur aman',
      alokasiWaktu: jp * 2, // 10 JP (2 pekan)
      semester: 'II (Genap)',
    },
    {
      noBabAtp: '5.2',
      bab: 'Bab 5: Senam Lantai (Ketangkasan & Keseimbangan)',
      tujuanPembelajaran: 'Murid dapat mempraktikkan sikap lilin, kayang modifikasi, dan berdiri satu kaki membentuk pesawat terbang untuk melatih keseimbangan statis.',
      materi: 'Sikap lilin dan keseimbangan statis',
      alokasiWaktu: jp * 2, // 10 JP (2 pekan)
      semester: 'II (Genap)',
    },
    {
      noBabAtp: '6.1',
      bab: 'Bab 6: Gerak Berirama (Senam Kesegaran Jasmani)',
      tujuanPembelajaran: 'Murid dapat mempraktikkan variasi langkah kaki (langkah biasa, langkah rapat, langkah keseimbangan) mengikuti ketukan musik atau irama hitungan.',
      materi: 'Langkah kaki berirama dan ayunan lengan',
      alokasiWaktu: jp * 2, // 10 JP (2 pekan)
      semester: 'II (Genap)',
    },
    {
      noBabAtp: '6.2',
      bab: 'Bab 6: Gerak Berirama (Senam Kesegaran Jasmani)',
      tujuanPembelajaran: 'Murid dapat merangkai dan memperagakan kombinasi gerak langkah kaki dan ayunan lengan dalam bentuk koreografi senam kreasi sederhana secara kompak.',
      materi: 'Rangkaian gerak berirama kreasi beregu',
      alokasiWaktu: jp * 3, // 15 JP (3 pekan)
      semester: 'II (Genap)',
    },
    {
      noBabAtp: '7.1',
      bab: 'Bab 7: Aktivitas Air & Keselamatan Diri di Air',
      tujuanPembelajaran: 'Murid dapat menunjukkan pengenalan air, gerakan meluncur, pernapasan ritmis, dan gerakan tungkai renang gaya dada/modifikasi dengan penuh rasa percaya diri.',
      materi: 'Meluncur dan gerakan tungkai gaya dada di kolam dangkal',
      alokasiWaktu: jp * 2, // 10 JP (2 pekan)
      semester: 'II (Genap)',
    },
    {
      noBabAtp: '7.2',
      bab: 'Bab 7: Aktivitas Air & Keselamatan Diri di Air',
      tujuanPembelajaran: 'Murid dapat mengidentifikasi prosedur keselamatan diri, etika di area kolam renang, dan cara memberikan pertolongan sederhana tanpa alat.',
      materi: 'Etika keselamatan di air dan penanganan kram otot',
      alokasiWaktu: jp * 2, // 10 JP (2 pekan)
      semester: 'II (Genap)',
    },
    {
      noBabAtp: '8.1',
      bab: 'Bab 8: Pemeliharaan Kebersihan Alat Reproduksi & Pola Hidup Sehat',
      tujuanPembelajaran: 'Murid dapat menjelaskan pentingnya menjaga kebersihan alat reproduksi pada masa pubertas dan mempraktikkan cara mencuci pakaian dalam serta mandi yang benar.',
      materi: 'Kesehatan dan higienitas alat reproduksi pada fase pubertas',
      alokasiWaktu: jp * 2, // 10 JP (2 pekan)
      semester: 'II (Genap)',
    },
    {
      noBabAtp: '8.2',
      bab: 'Bab 8: Pemeliharaan Kebersihan Alat Reproduksi & Pola Hidup Sehat',
      tujuanPembelajaran: 'Murid dapat menganalisis dampak makanan bergizi seimbang, istirahat cukup, dan bahaya merokok/zat adiktif terhadap fungsi organ tubuh.',
      materi: 'Gizi seimbang, istirahat cukup, dan pencegahan zat adiktif',
      alokasiWaktu: jp * 2, // 10 JP (2 pekan)
      semester: 'II (Genap)',
    },
    {
      noBabAtp: '8.3',
      bab: 'Bab 8: Pemeliharaan Kebersihan Alat Reproduksi & Pola Hidup Sehat',
      tujuanPembelajaran: 'Murid dapat membuat poster edukasi pola hidup bersih dan sehat (PHBS) di lingkungan sekolah dan rumah tangga.',
      materi: 'Kampanye PHBS dan pola hidup sehat',
      alokasiWaktu: jp * 1, // 5 JP (1 pekan)
      semester: 'II (Genap)',
    },
    {
      noBabAtp: 'Cadangan II',
      bab: 'Cadangan / Asesmen Sumatif Akhir Tahun (Semester II)',
      tujuanPembelajaran: 'Kegiatan asesmen sumatif akhir tahun (PAT/SAT), remedial, pengayaan, dan persiapan penyerahan rapor.',
      materi: 'Asesmen Sumatif Akhir Tahun & Pekan Cadangan',
      alokasiWaktu: jp * 2, // 10 JP (2 pekan cadangan agar pas 95 JP)
      semester: 'II (Genap)',
      isCadangan: true,
    },
  ];

  const totalJpSmt1 = rows.filter((r) => r.semester === 'I (Ganjil)').reduce((acc, r) => acc + r.alokasiWaktu, 0);
  const totalJpSmt2 = rows.filter((r) => r.semester === 'II (Genap)').reduce((acc, r) => acc + r.alokasiWaktu, 0);
  const totalJpTahunan = totalJpSmt1 + totalJpSmt2;

  const markdown = generateProtaMarkdown(rows, params);

  return {
    identitas: {
      namaSekolah: params.namaSekolah,
      namaMapel: params.namaMapel,
      kelas: params.kelas,
      fase: params.fase,
      tahunPelajaran: params.tahunPelajaran,
      jpPerMinggu: params.jpPerMinggu,
      pekanSmt1: params.pekanSmt1,
      pekanSmt2: params.pekanSmt2,
      targetJpSmt1: params.targetJpSmt1,
      targetJpSmt2: params.targetJpSmt2,
      targetTotalJp: params.targetTotalJp,
      kepalaSekolah: params.kepalaSekolah,
      nipKepalaSekolah: params.nipKepalaSekolah,
      guruMapel: params.guruMapel,
      nipGuru: params.nipGuru,
      titimangsa: params.titimangsa,
    },
    rows,
    totalJpSmt1,
    totalJpSmt2,
    totalJpTahunan,
    markdown,
    isFallback: true,
  };
}

function generateProtaMarkdown(rows: ProtaRow[], params: GenerateParams): string {
  const smt1Rows = rows.filter((r) => r.semester === 'I (Ganjil)');
  const smt2Rows = rows.filter((r) => r.semester === 'II (Genap)');
  const totalSmt1 = smt1Rows.reduce((a, b) => a + b.alokasiWaktu, 0);
  const totalSmt2 = smt2Rows.reduce((a, b) => a + b.alokasiWaktu, 0);

  let md = `# PROGRAM TAHUNAN (PROTA) KURIKULUM MERDEKA\n\n`;
  md += `**Satuan Pendidikan:** ${params.namaSekolah}\n`;
  md += `**Mata Pelajaran:** ${params.namaMapel}\n`;
  md += `**Kelas / Fase:** ${params.kelas} / ${params.fase}\n`;
  md += `**Tahun Pelajaran:** ${params.tahunPelajaran}\n`;
  md += `**Alokasi Waktu per Minggu:** ${params.jpPerMinggu} JP\n`;
  md += `**Total Alokasi Waktu 1 Tahun:** ${totalSmt1 + totalSmt2} JP (${params.pekanSmt1} Pekan Smt 1 + ${params.pekanSmt2} Pekan Smt 2)\n\n`;
  md += `---\n\n`;

  md += `| No Bab/ATP | Bab | Tujuan Pembelajaran | Materi | Alokasi Waktu | Semester |\n`;
  md += `|---|---|---|---|---|---|\n`;

  smt1Rows.forEach((r) => {
    md += `| ${r.noBabAtp} | ${r.bab} | ${r.tujuanPembelajaran} | ${r.materi} | ${r.alokasiWaktu} JP | ${r.semester} |\n`;
  });
  md += `| **-** | **JUMLAH SEMESTER I** | **Total Alokasi Waktu Semester I (Termasuk Cadangan)** | **-** | **${totalSmt1} JP** | **I (Ganjil)** |\n`;

  smt2Rows.forEach((r) => {
    md += `| ${r.noBabAtp} | ${r.bab} | ${r.tujuanPembelajaran} | ${r.materi} | ${r.alokasiWaktu} JP | ${r.semester} |\n`;
  });
  md += `| **-** | **JUMLAH SEMESTER II** | **Total Alokasi Waktu Semester II (Termasuk Cadangan)** | **-** | **${totalSmt2} JP** | **II (Genap)** |\n`;
  md += `| **-** | **TOTAL TAHUNAN** | **Total Alokasi Waktu 1 Tahun Pelajaran** | **-** | **${totalSmt1 + totalSmt2} JP** | **I & II** |\n`;

  return md;
}
