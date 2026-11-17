import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  AsesmenSumatifData,
  DEFAULT_KOMPOSISI_SOAL,
  alignAsesmenWithKomposisi,
  computeKomposisiSummary,
  formatPgOpsiLabel,
  getFallbackAsesmenSumatifData,
  normalizeKomposisiSoal,
} from '@/lib/asesmen-sumatif-types';
import { createGeminiClient, DEFAULT_GEMINI_MODEL, classifyGeminiError, logGeminiFallback } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  let mapel = 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)';
  let kelas = 'Kelas V';
  let fase = 'Fase C';
  let semester = 'Ganjil';
  let jenisAsesmen = 'Asesmen Sumatif Akhir Semester (SAS)';
  let namaSekolah = 'SD NEGERI KALIMANTONG';
  let tahunPelajaran = '2026/2027';
  let alokasiWaktu = '90 Menit';
  let materiDetail = 'Variasi dan Kombinasi Gerak Dasar Permainan Bola Besar (Sepak Bola & Bola Voli) serta Kebugaran Jasmani Dasar';
  let instruksiKhusus = '';
  let komposisi = { ...DEFAULT_KOMPOSISI_SOAL };

  try {
    const body = await req.json();
    mapel = body.mapel || mapel;
    kelas = body.kelas || kelas;
    fase = body.fase || fase;
    semester = body.semester || semester;
    jenisAsesmen = body.jenisAsesmen || jenisAsesmen;
    namaSekolah = body.namaSekolah || namaSekolah;
    tahunPelajaran = body.tahunPelajaran || tahunPelajaran;
    alokasiWaktu = body.alokasiWaktu || alokasiWaktu;
    materiDetail = body.materiDetail || materiDetail;
    instruksiKhusus = typeof body.instruksiKhusus === 'string' ? body.instruksiKhusus.trim() : '';
    komposisi = normalizeKomposisiSoal(body.komposisi);

    const summary = computeKomposisiSummary(komposisi);
    const ai = createGeminiClient();
    if (!ai) {
      const fb = getFallbackAsesmenSumatifData(
        mapel,
        kelas,
        fase,
        jenisAsesmen,
        materiDetail,
        komposisi,
        instruksiKhusus
      );
      fb.identitas.namaSekolah = namaSekolah;
      fb.identitas.semester = semester;
      fb.identitas.tahunPelajaran = tahunPelajaran;
      fb.identitas.alokasiWaktu = alokasiWaktu;
      return NextResponse.json({
        data: fb,
        isFallback: true,
        warning: 'Mode Template Cerdas aktif: soal disusun langsung menyesuaikan materi dan perintah Anda.',
      });
    }

    const opsiPgLabel = formatPgOpsiLabel(komposisi.opsiPg);
    const pgPilihanSchemaProperties = Object.fromEntries(
      summary.allowedPgKeys.map((key) => [key, { type: Type.STRING }])
    );
    const komposisiLines = [
      komposisi.pg > 0
        ? `- Soal Pilihan Ganda (PG): ${komposisi.pg} nomor (Nomor ${summary.pg.start}–${summary.pg.end}) dengan ${komposisi.opsiPg} pilihan jawaban (${opsiPgLabel}), kunci jawaban WAJIB hanya memilih dari (${opsiPgLabel}), bobot 1 poin/soal.`
        : `- Soal Pilihan Ganda (PG): 0 nomor (tidak perlu dibuat, kosongkan array soalPilihanGanda).`,
      komposisi.pgKompleks > 0
        ? `- Soal Pilihan Ganda Kompleks: ${komposisi.pgKompleks} nomor (Nomor ${summary.pgKompleks.start}–${summary.pgKompleks.end}) dengan 5 opsi pilihan (A, B, C, D, E), bobot 2 poin/soal.`
        : `- Soal Pilihan Ganda Kompleks: 0 nomor (tidak perlu dibuat, kosongkan array soalPgKompleks).`,
      komposisi.menjodohkan > 0
        ? `- Soal Menjodohkan: ${komposisi.menjodohkan} nomor (Nomor ${summary.menjodohkan.start}–${summary.menjodohkan.end}), bobot 1 poin/soal.`
        : `- Soal Menjodohkan: 0 nomor (tidak perlu dibuat, kosongkan array soalMenjodohkan).`,
      komposisi.isianSingkat > 0
        ? `- Soal Isian Singkat: ${komposisi.isianSingkat} nomor (Nomor ${summary.isianSingkat.start}–${summary.isianSingkat.end}), tingkat kesukaran sedang hingga tinggi, bobot 2 poin/soal.`
        : `- Soal Isian Singkat: 0 nomor (tidak perlu dibuat, kosongkan array soalIsianSingkat).`,
      komposisi.uraian > 0
        ? `- Soal Isian Uraian: ${komposisi.uraian} nomor (Nomor ${summary.uraian.start}–${summary.uraian.end}), tingkat kesukaran sedang hingga tinggi, bobot 5 poin/soal.`
        : `- Soal Isian Uraian: 0 nomor (tidak perlu dibuat, kosongkan array soalUraian).`,
    ].join('\n   ');

    const systemInstruction = `Anda adalah Guru mata pelajaran ${mapel} kelas ${kelas} fase ${fase} yang sedang menyusun instrumen asesmen sumatif resmi sekolah (${jenisAsesmen}).
Asesmen sumatif digunakan untuk mengukur ketercapaian kompetensi peserta didik secara menyeluruh pada akhir periode pembelajaran.

TUGAS ANDA:
1. Buatkan KISI-KISI ASESMEN SUMATIF dalam bentuk tabel terpetakan:
   | No | Tujuan Pembelajaran | Ruang Lingkup Materi | Level Kognitif (Taksonomi Bloom) | Indikator Soal | Bentuk Soal | Nomor Soal | Naskah Soal | Kunci Jawaban | Skor |
   Dibuat detail untuk tiap nomor soal sebanyak ${summary.totalSoal} baris (Nomor 1 sampai ${summary.totalSoal}).

2. Komposisi Soal (Total TEPAT ${summary.totalSoal} butir soal):
   ${komposisiLines}

3. Ketentuan Stimulus Soal:
   - Sertakan soal-soal yang memiliki stimulus berupa bacaan singkat yang relevan.
   - Untuk soal berbasis gambar (diagram, grafik, peta, ilustrasi), gunakan format:
     [Gambar: "Deskripsikan detail gambar yang harus disiapkan oleh guru"] tepat di atas teks pertanyaan soal.
   - Tampilkan tabel stimulus jika ada secara rapi.

4. Lembar Soal Asesmen Sumatif memuat:
   - Identitas soal (nama sekolah, mata pelajaran, kelas/semester, tahun pelajaran, alokasi waktu, jumlah soal = ${summary.totalSoal}).
   - Petunjuk pengerjaan (umum & khusus).
   - Naskah soal tersusun rapi per bagian sesuai jumlah tiap jenis soal.

5. Tabel Kunci Jawaban dan Pedoman Penskoran:
   - Kunci jawaban lengkap tiap nomor dan skor.
   - Skor maksimal: PG = ${summary.skorPg}, PG Kompleks = ${summary.skorPgKompleks}, Menjodohkan = ${summary.skorMenjodohkan}, Isian = ${summary.skorIsian}, Uraian = ${summary.skorUraian} (Total = ${summary.totalSkor}).
   - Rumus Nilai Akhir = (Total Skor Perolehan / ${summary.totalSkor}) x 100.

6. ATURAN KETAT KESESUAIAN PERINTAH:
   - 100% isi soal, stimulus, pilihan jawaban, kunci, dan kisi-kisi WAJIB berasal secara eksklusif dari Mata Pelajaran, Kelas/Fase, Materi & Submateri Detail, serta Instruksi Khusus yang diperintahkan pengguna.
   - DILARANG menyisipkan topik atau mata pelajaran lain di luar perintah pengguna.`;

    const userPrompt = `Susunlah instrumen Asesmen Sumatif Lengkap (${summary.totalSoal} soal) berdasarkan perintah berikut:
Mata Pelajaran: ${mapel}
Kelas / Fase: ${kelas} / ${fase}
Semester: ${semester}
Jenis Asesmen: ${jenisAsesmen}
Nama Sekolah: ${namaSekolah}
Tahun Pelajaran: ${tahunPelajaran}
Alokasi Waktu: ${alokasiWaktu}
Komposisi Jumlah Soal: PG=${komposisi.pg} (${komposisi.opsiPg} opsi: ${opsiPgLabel}), PG Kompleks=${komposisi.pgKompleks}, Menjodohkan=${komposisi.menjodohkan}, Isian Singkat=${komposisi.isianSingkat}, Uraian=${komposisi.uraian}
Materi dan Submateri Detail: ${materiDetail}
${instruksiKhusus ? `Perintah / Instruksi Khusus Guru: ${instruksiKhusus}` : ''}
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
            identitas: {
              type: Type.OBJECT,
              properties: {
                namaSekolah: { type: Type.STRING },
                mataPelajaran: { type: Type.STRING },
                kelas: { type: Type.STRING },
                fase: { type: Type.STRING },
                semester: { type: Type.STRING },
                jenisAsesmen: { type: Type.STRING },
                tahunPelajaran: { type: Type.STRING },
                alokasiWaktu: { type: Type.STRING },
                jumlahSoal: { type: Type.INTEGER },
                materiDanSubmateri: { type: Type.STRING },
              },
              required: ['namaSekolah', 'mataPelajaran', 'kelas', 'fase', 'semester', 'jenisAsesmen', 'tahunPelajaran', 'alokasiWaktu', 'jumlahSoal'],
            },
            petunjukUmum: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            soalPilihanGanda: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nomor: { type: Type.INTEGER },
                  stimulus: { type: Type.STRING },
                  deskripsiGambar: { type: Type.STRING },
                  pertanyaan: { type: Type.STRING },
                  pilihan: {
                    type: Type.OBJECT,
                    properties: pgPilihanSchemaProperties,
                    required: summary.allowedPgKeys,
                  },
                  kunci: { type: Type.STRING },
                  levelBloom: { type: Type.STRING },
                  skor: { type: Type.INTEGER },
                },
                required: ['nomor', 'pertanyaan', 'pilihan', 'kunci', 'levelBloom', 'skor'],
              },
            },
            soalPgKompleks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nomor: { type: Type.INTEGER },
                  stimulus: { type: Type.STRING },
                  deskripsiGambar: { type: Type.STRING },
                  pertanyaan: { type: Type.STRING },
                  pilihan: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        kode: { type: Type.STRING },
                        teks: { type: Type.STRING },
                        isBenar: { type: Type.BOOLEAN },
                      },
                      required: ['kode', 'teks'],
                    },
                  },
                  kunci: { type: Type.STRING },
                  levelBloom: { type: Type.STRING },
                  skor: { type: Type.INTEGER },
                },
                required: ['nomor', 'pertanyaan', 'pilihan', 'kunci', 'levelBloom', 'skor'],
              },
            },
            soalMenjodohkan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nomor: { type: Type.INTEGER },
                  premisKiri: { type: Type.STRING },
                  responsKanan: { type: Type.STRING },
                  kunci: { type: Type.STRING },
                  skor: { type: Type.INTEGER },
                },
                required: ['nomor', 'premisKiri', 'responsKanan', 'kunci', 'skor'],
              },
            },
            soalIsianSingkat: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nomor: { type: Type.INTEGER },
                  stimulus: { type: Type.STRING },
                  deskripsiGambar: { type: Type.STRING },
                  pertanyaan: { type: Type.STRING },
                  kunci: { type: Type.STRING },
                  levelBloom: { type: Type.STRING },
                  skor: { type: Type.INTEGER },
                },
                required: ['nomor', 'pertanyaan', 'kunci', 'levelBloom', 'skor'],
              },
            },
            soalUraian: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nomor: { type: Type.INTEGER },
                  stimulus: { type: Type.STRING },
                  deskripsiGambar: { type: Type.STRING },
                  pertanyaan: { type: Type.STRING },
                  rubrikDanKunci: { type: Type.STRING },
                  levelBloom: { type: Type.STRING },
                  skor: { type: Type.INTEGER },
                },
                required: ['nomor', 'pertanyaan', 'rubrikDanKunci', 'levelBloom', 'skor'],
              },
            },
            kisiKisiTabel: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  no: { type: Type.INTEGER },
                  tujuanPembelajaran: { type: Type.STRING },
                  ruangLingkupMateri: { type: Type.STRING },
                  levelKognitif: { type: Type.STRING },
                  indikatorSoal: { type: Type.STRING },
                  bentukSoal: { type: Type.STRING },
                  nomorSoal: { type: Type.INTEGER },
                  naskahSoal: { type: Type.STRING },
                  kunciJawaban: { type: Type.STRING },
                  skor: { type: Type.INTEGER },
                },
                required: ['no', 'tujuanPembelajaran', 'ruangLingkupMateri', 'levelKognitif', 'indikatorSoal', 'bentukSoal', 'nomorSoal', 'kunciJawaban', 'skor'],
              },
            },
            pedomanPenskoran: {
              type: Type.OBJECT,
              properties: {
                skorMaksimalPg: { type: Type.INTEGER },
                skorMaksimalPgKompleks: { type: Type.INTEGER },
                skorMaksimalMenjodohkan: { type: Type.INTEGER },
                skorMaksimalIsian: { type: Type.INTEGER },
                skorMaksimalUraian: { type: Type.INTEGER },
                totalSkorMaksimal: { type: Type.INTEGER },
                rumusNilaiAkhir: { type: Type.STRING },
              },
              required: ['skorMaksimalPg', 'skorMaksimalPgKompleks', 'skorMaksimalMenjodohkan', 'skorMaksimalIsian', 'skorMaksimalUraian', 'totalSkorMaksimal', 'rumusNilaiAkhir'],
            },
          },
          required: ['identitas', 'petunjukUmum', 'soalPilihanGanda', 'soalPgKompleks', 'soalMenjodohkan', 'soalIsianSingkat', 'soalUraian', 'kisiKisiTabel', 'pedomanPenskoran'],
        },
      },
    });

    const outputText = response.text || '{}';
    let parsed: Partial<AsesmenSumatifData> = {};
    try {
      parsed = JSON.parse(outputText);
    } catch {
      const match = outputText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    const fallback = getFallbackAsesmenSumatifData(
      mapel,
      kelas,
      fase,
      jenisAsesmen,
      materiDetail,
      komposisi,
      instruksiKhusus
    );
    const aligned = alignAsesmenWithKomposisi(parsed, komposisi, fallback);
    const finalData: AsesmenSumatifData = {
      ...aligned,
      identitas: {
        ...aligned.identitas,
        namaSekolah: namaSekolah || aligned.identitas.namaSekolah,
        mataPelajaran: mapel || aligned.identitas.mataPelajaran,
        kelas: kelas || aligned.identitas.kelas,
        fase: fase || aligned.identitas.fase,
        semester: semester || aligned.identitas.semester,
        jenisAsesmen: jenisAsesmen || aligned.identitas.jenisAsesmen,
        tahunPelajaran: tahunPelajaran || aligned.identitas.tahunPelajaran,
        alokasiWaktu: alokasiWaktu || aligned.identitas.alokasiWaktu,
        materiDanSubmateri: materiDetail,
        ...(instruksiKhusus ? { instruksiKhusus } : {}),
      },
    };

    return NextResponse.json({
      data: finalData,
      isFallback: false,
    });
  } catch (err: unknown) {
    const errInfo = classifyGeminiError(err);
    logGeminiFallback('Asesmen Sumatif', errInfo);
    const fallback = getFallbackAsesmenSumatifData(
      mapel,
      kelas,
      fase,
      jenisAsesmen,
      materiDetail,
      komposisi,
      instruksiKhusus
    );
    fallback.identitas.namaSekolah = namaSekolah;
    fallback.identitas.semester = semester;
    fallback.identitas.tahunPelajaran = tahunPelajaran;
    fallback.identitas.alokasiWaktu = alokasiWaktu;
    return NextResponse.json({
      data: fallback,
      isFallback: true,
      errorCode: errInfo.code,
      warning: errInfo.userMessage,
    });
  }
}
