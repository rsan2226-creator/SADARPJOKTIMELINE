import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { KartuSoalDocData, buildKartuSoalFromInput } from '@/lib/kartu-soal-types';
import { createGeminiClient, DEFAULT_GEMINI_MODEL, classifyGeminiError, logGeminiFallback } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  let teksSoal = '';
  let namaSekolah = 'SMP MERDEKA';
  let namaPenyusun = 'Lendi Ike Hermawan, S.Pd.';
  let mataPelajaran = 'MATEMATIKA';
  let kelas = '8G';
  let semester = '2';
  let kurikulum = 'MERDEKA';
  let tahunPelajaran = '2025 / 2026';
  let bentukSoal = 'Pilihan Ganda';
  let bukuSumber = 'MATEMATIKA untuk SMP/MTS kelas VIII, Penerbit Erlangga';
  let digunakanUntuk = 'ASTS';
  let jumlahSiswa = 32;
  let instruksiKhusus = '';

  try {
    const body = await req.json();
    teksSoal = body.teksSoal ?? teksSoal;
    namaSekolah = body.namaSekolah || namaSekolah;
    namaPenyusun = body.namaPenyusun || namaPenyusun;
    mataPelajaran = body.mataPelajaran || mataPelajaran;
    kelas = body.kelas || kelas;
    semester = body.semester || semester;
    kurikulum = body.kurikulum || kurikulum;
    tahunPelajaran = body.tahunPelajaran || tahunPelajaran;
    bentukSoal = body.bentukSoal || bentukSoal;
    bukuSumber = body.bukuSumber || bukuSumber;
    digunakanUntuk = body.digunakanUntuk || digunakanUntuk;
    jumlahSiswa = Number(body.jumlahSiswa) || jumlahSiswa;
    instruksiKhusus = typeof body.instruksiKhusus === 'string' ? body.instruksiKhusus.trim() : '';

    const fallbackParams = {
      teksSoal,
      namaSekolah,
      namaPenyusun,
      mataPelajaran,
      kelas,
      semester,
      kurikulum,
      tahunPelajaran,
      bentukSoal,
      bukuSumber,
      digunakanUntuk,
      jumlahSiswa,
      instruksiKhusus,
    };

    const ai = createGeminiClient();
    if (!ai) {
      return NextResponse.json({
        data: buildKartuSoalFromInput(fallbackParams),
        isFallback: true,
        warning: 'Mode Template Cerdas aktif: kartu soal disusun langsung menyesuaikan naskah soal dan identitas Anda.',
      });
    }

    const systemInstruction = `Anda adalah seorang ahli penyusun instrumen evaluasi pendidikan dan instructional designer.
Tugas Anda adalah menganalisis naskah soal atau perintah materi yang diberikan, kemudian menyusun KARTU SOAL RESMI dengan mengacu secara ketat pada input guru:

Setiap butir kartu soal HARUS memuat:
1. Tujuan Pembelajaran (TP yang relevan dengan soal)
2. Indikator Soal (rumusan indikator operasional yang mencerminkan level kognitif)
3. Materi Pokok (submateri spesifik)
4. Buku Sumber (buku teks/referensi rujukan)
5. Naskah Soal:
   - Stimulus (jika ada konteks bacaan/kasus)
   - Deskripsi Gambar (jika ada diagram/grafik/bangun geometri)
   - Rumusan Butir Pertanyaan
   - Pilihan Jawaban (A, B, C, D, dan E jika ada)
6. Kunci Jawaban
7. Pembahasan Singkat (penjelasan konseptual mengapa kunci tersebut benar)
8. Level Kognitif Taksonomi Bloom (C1, C2, C3, C4, C5, atau C6)
9. Digunakan untuk: (misal ASTS, ASAS, SAS, atau Penilaian Harian)
10. Keterangan Soal

ATURAN KETAT: Jika guru sudah menempelkan daftar soal pada input, WAJIB gunakan tepat soal-soal tersebut ke dalam kartu soal tanpa mengganti topiknya. Gunakan identitas sekolah, penyusun, mapel, kelas, semester, dan instruksi khusus tepat seperti yang diperintahkan.`;

    const userPrompt = `Susunlah KARTU SOAL LENGKAP berdasarkan perintah dan data berikut:
Nama Sekolah: ${namaSekolah}
Nama Penyusun: ${namaPenyusun}
Mata Pelajaran: ${mataPelajaran}
Kelas: ${kelas}
Semester: ${semester}
Kurikulum: ${kurikulum}
Tahun Pelajaran: ${tahunPelajaran}
Bentuk Soal: ${bentukSoal}
Buku Sumber Default: ${bukuSumber}
Digunakan Untuk: ${digunakanUntuk}
Jumlah Siswa: ${jumlahSiswa}
${instruksiKhusus ? `Perintah / Instruksi Khusus Guru: ${instruksiKhusus}` : ''}

Naskah / Soal / Perintah Materi dari Guru:
${teksSoal.trim() || `Buatkan 5 kartu soal representatif khusus untuk mata pelajaran ${mataPelajaran} kelas ${kelas}.`}
`;

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            judul: { type: Type.STRING },
            tahunPelajaran: { type: Type.STRING },
            namaSekolah: { type: Type.STRING },
            namaPenyusun: { type: Type.STRING },
            mataPelajaran: { type: Type.STRING },
            bentukSoal: { type: Type.STRING },
            kelas: { type: Type.STRING },
            semester: { type: Type.STRING },
            kurikulum: { type: Type.STRING },
            bukuSumberDefault: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nomorSoal: { type: Type.INTEGER },
                  tujuanPembelajaran: { type: Type.STRING },
                  indikatorSoal: { type: Type.STRING },
                  materi: { type: Type.STRING },
                  bukuSumber: { type: Type.STRING },
                  stimulus: { type: Type.STRING },
                  deskripsiGambar: { type: Type.STRING },
                  pertanyaan: { type: Type.STRING },
                  pilihan: {
                    type: Type.OBJECT,
                    properties: {
                      A: { type: Type.STRING },
                      B: { type: Type.STRING },
                      C: { type: Type.STRING },
                      D: { type: Type.STRING },
                      E: { type: Type.STRING },
                    },
                    required: ['A', 'B', 'C', 'D'],
                  },
                  kunci: { type: Type.STRING },
                  pembahasan: { type: Type.STRING },
                  taksonomiBloom: { type: Type.STRING },
                  digunakanUntuk: { type: Type.STRING },
                  tanggal: { type: Type.STRING },
                  jumlahSiswa: { type: Type.INTEGER },
                  keterangan: { type: Type.STRING },
                },
                required: ['nomorSoal', 'tujuanPembelajaran', 'indikatorSoal', 'materi', 'bukuSumber', 'pertanyaan', 'pilihan', 'kunci', 'pembahasan', 'taksonomiBloom'],
              },
            },
          },
          required: ['judul', 'tahunPelajaran', 'namaSekolah', 'namaPenyusun', 'mataPelajaran', 'bentukSoal', 'kelas', 'semester', 'kurikulum', 'items'],
        },
      },
    });

    const parsedData: KartuSoalDocData = JSON.parse(response.text || '{}');
    if (!parsedData.items || parsedData.items.length === 0) {
      return NextResponse.json({
        data: buildKartuSoalFromInput(fallbackParams),
        isFallback: true,
      });
    }

    const syncedData: KartuSoalDocData = {
      ...parsedData,
      namaSekolah: namaSekolah || parsedData.namaSekolah,
      namaPenyusun: namaPenyusun || parsedData.namaPenyusun,
      mataPelajaran: mataPelajaran || parsedData.mataPelajaran,
      kelas: kelas || parsedData.kelas,
      semester: semester || parsedData.semester,
      kurikulum: kurikulum || parsedData.kurikulum,
      tahunPelajaran: tahunPelajaran || parsedData.tahunPelajaran,
      bentukSoal: bentukSoal || parsedData.bentukSoal,
      bukuSumberDefault: bukuSumber || parsedData.bukuSumberDefault,
    };

    return NextResponse.json({
      data: syncedData,
      isFallback: false,
    });
  } catch (error) {
    const errInfo = classifyGeminiError(error);
    logGeminiFallback('Kartu Soal', errInfo);
    return NextResponse.json({
      data: buildKartuSoalFromInput({
        teksSoal,
        namaSekolah,
        namaPenyusun,
        mataPelajaran,
        kelas,
        semester,
        kurikulum,
        tahunPelajaran,
        bentukSoal,
        bukuSumber,
        digunakanUntuk,
        jumlahSiswa,
        instruksiKhusus,
      }),
      isFallback: true,
      errorCode: errInfo.code,
      warning: errInfo.userMessage,
    });
  }
}
