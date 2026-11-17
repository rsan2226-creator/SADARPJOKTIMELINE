import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { MateriAjarData, getFallbackMateriAjarData } from '@/lib/materi-ajar-types';
import { createGeminiClient, DEFAULT_GEMINI_MODEL, classifyGeminiError, logGeminiFallback } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  let mapel = 'PJOK';
  let jenjang = 'SD';
  let kelas = 'Kelas V';
  let fase = 'Fase C';
  let topik = 'Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola';
  let tujuanPembelajaran = 'Peserta didik dapat memahami prinsip ayunan kaki dan mempraktikkan operan mendatar berpasangan dengan akurat dan sportif.';
  let levelBloom = 'C3 - Menerapkan / Mengaplikasikan';
  let dimensiProfilLulusan = ['Kolaborasi', 'Penalaran Kritis', 'Kemandirian', 'Kesehatan'];
  let alokasiWaktu = '2 x 40 Menit (1 Pertemuan)';
  let konteksLokal = '';

  try {
    const body = await req.json();
    mapel = body.mapel || mapel;
    jenjang = body.jenjang || jenjang;
    kelas = body.kelas || kelas;
    fase = body.fase || fase;
    topik = body.topik || topik;
    tujuanPembelajaran = body.tujuanPembelajaran || tujuanPembelajaran;
    levelBloom = body.levelBloom || levelBloom;
    dimensiProfilLulusan = body.dimensiProfilLulusan || dimensiProfilLulusan;
    alokasiWaktu = body.alokasiWaktu || alokasiWaktu;
    konteksLokal = body.konteksLokal || '';

    const ai = createGeminiClient();
    if (!ai) {
      return NextResponse.json({
        data: getFallbackMateriAjarData(mapel, jenjang, kelas, fase, topik, tujuanPembelajaran, levelBloom, dimensiProfilLulusan),
        isFallback: true,
        warning: 'GEMINI_API_KEY belum diatur. Materi ajar disusun menggunakan Mode Template otomatis.',
      });
    }

    const systemInstruction = `Anda adalah seorang Guru ${mapel} ${jenjang} ${kelas} ${fase} yang inspiratif, kompeten, dan komunikatif.
Tugas Anda adalah membuat materi ajar lengkap dengan topik "${topik}" dan mengacu pada tujuan pembelajaran "${tujuanPembelajaran}".
Materi ajar harus sesuai dengan level kognitif "${levelBloom}" dan mendukung pengembangan dimensi profil lulusan: ${dimensiProfilLulusan.join(', ')}.

Materi ajar harus ditulis secara UTUH dan SISTEMATIS, mencakup:
1. Bagian Awal:
   - Judul materi ajar yang menarik dan edukatif.
   - Tujuan pembelajaran yang jelas dengan rincian level kognitif & dimensi profil yang disasar.
2. Pendahuluan atau Apersepsi:
   - Paragraf pembuka yang menghubungkan materi dengan kehidupan nyata siswa atau pengetahuan sebelumnya.
   - Pertanyaan pemantik yang menggugah rasa ingin tahu siswa.
   - Analogi atau perumpamaan menarik yang ramah anak.
3. Isi Materi (Disusun Sistematis & Komprehensif):
   - Konsep utama: jelaskan fakta, definisi, dan prinsip yang perlu dipahami siswa.
   - Prosedur & langkah gerak/kerja: tahapan langkah konkret step-by-step dengan tips penting.
   - Contoh konkret, ilustrasi skenario, atau studi kasus sehari-hari.
   - Miskonsepsi umum yang sering terjadi pada siswa beserta penjelasan yang benar.
4. Aktivitas Belajar Aktif & Pembelajaran Mandiri:
   - Instruksi aktivitas praktik/eksplorasi yang kontekstual dan menyenangkan.
   - Tugas mandiri atau kelompok.
   - Pertanyaan cek pemahaman (minimal 3 butir) yang selaras dengan level kognitif ${levelBloom}.
5. Penutup & Penguatan:
   - Rangkuman poin-poin kunci materi ajar.
   - Pesan motivasi penguat karakter profil lulusan.

Gunakan gaya bahasa yang komunikatif, hangat, lugas, sesuai jenjang usia peserta didik (${jenjang} ${kelas}), serta dukung pembelajaran aktif, kontekstual, dan menyenangkan. Materi ajar harus bisa digunakan langsung oleh guru untuk kegiatan belajar di kelas maupun pembelajaran mandiri.`;

    const userPrompt = `Buatkan Materi Ajar Lengkap dan Utuh sesuai instruksi:
Mata Pelajaran: ${mapel}
Jenjang: ${jenjang}
Kelas: ${kelas}
Fase: ${fase}
Topik Pembelajaran: ${topik}
Tujuan Pembelajaran: ${tujuanPembelajaran}
Level Kognitif (Taksonomi Bloom): ${levelBloom}
Dimensi Profil Lulusan: ${dimensiProfilLulusan.join(', ')}
Alokasi Waktu: ${alokasiWaktu}
${konteksLokal ? `Konteks Nyata / Lingkungan Sekolah: ${konteksLokal}` : ''}
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
                judulMateri: { type: Type.STRING },
                mataPelajaran: { type: Type.STRING },
                jenjang: { type: Type.STRING },
                kelas: { type: Type.STRING },
                fase: { type: Type.STRING },
                topikPembelajaran: { type: Type.STRING },
                tujuanPembelajaran: { type: Type.STRING },
                levelBloom: { type: Type.STRING },
                dimensiProfilLulusan: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                alokasiWaktu: { type: Type.STRING },
              },
              required: ['judulMateri', 'mataPelajaran', 'jenjang', 'kelas', 'fase', 'topikPembelajaran', 'tujuanPembelajaran', 'levelBloom', 'dimensiProfilLulusan'],
            },
            pendahuluan: {
              type: Type.OBJECT,
              properties: {
                kalimatApersepsi: { type: Type.STRING },
                pertanyaanPemantik: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                analogiMenarik: { type: Type.STRING },
              },
              required: ['kalimatApersepsi', 'pertanyaanPemantik'],
            },
            isiMateri: {
              type: Type.OBJECT,
              properties: {
                konsepUtama: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      subjudul: { type: Type.STRING },
                      penjelasan: { type: Type.STRING },
                      faktaKunci: { type: Type.STRING },
                      analogiAtauContoh: { type: Type.STRING },
                    },
                    required: ['subjudul', 'penjelasan'],
                  },
                },
                prosedurDanLangkah: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      tahap: { type: Type.STRING },
                      langkah: { type: Type.STRING },
                      tipsPenting: { type: Type.STRING },
                    },
                    required: ['tahap', 'langkah'],
                  },
                },
                contohKonkret: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      judulKasus: { type: Type.STRING },
                      deskripsi: { type: Type.STRING },
                      pelajaran: { type: Type.STRING },
                    },
                    required: ['judulKasus', 'deskripsi', 'pelajaran'],
                  },
                },
                miskonsepsiUmum: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      salahPaham: { type: Type.STRING },
                      penjelasanBenar: { type: Type.STRING },
                    },
                    required: ['salahPaham', 'penjelasanBenar'],
                  },
                },
              },
              required: ['konsepUtama', 'prosedurDanLangkah', 'contohKonkret'],
            },
            aktivitasDanLatihan: {
              type: Type.OBJECT,
              properties: {
                instruksiAktivitas: { type: Type.STRING },
                tugasMandiriAtauKelompok: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                pertanyaanCekPemahaman: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      soal: { type: Type.STRING },
                      levelKognitif: { type: Type.STRING },
                      petunjukJawaban: { type: Type.STRING },
                    },
                    required: ['soal', 'levelKognitif'],
                  },
                },
              },
              required: ['instruksiAktivitas', 'tugasMandiriAtauKelompok', 'pertanyaanCekPemahaman'],
            },
            penutup: {
              type: Type.OBJECT,
              properties: {
                rangkumanPoinKunci: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                pesanMotivasi: { type: Type.STRING },
                titimangsa: { type: Type.STRING },
                penyusun: { type: Type.STRING },
              },
              required: ['rangkumanPoinKunci', 'pesanMotivasi', 'titimangsa', 'penyusun'],
            },
          },
          required: ['identitas', 'pendahuluan', 'isiMateri', 'aktivitasDanLatihan', 'penutup'],
        },
      },
    });

    const outputText = response.text || '{}';
    let parsed: Partial<MateriAjarData> = {};
    try {
      parsed = JSON.parse(outputText);
    } catch {
      const match = outputText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    const fallback = getFallbackMateriAjarData(
      mapel,
      jenjang,
      kelas,
      fase,
      topik,
      tujuanPembelajaran,
      levelBloom,
      dimensiProfilLulusan
    );

    const finalData: MateriAjarData = {
      identitas: {
        ...fallback.identitas,
        ...(parsed.identitas || {}),
      },
      pendahuluan: {
        ...fallback.pendahuluan,
        ...(parsed.pendahuluan || {}),
      },
      isiMateri: {
        ...fallback.isiMateri,
        ...(parsed.isiMateri || {}),
      },
      aktivitasDanLatihan: {
        ...fallback.aktivitasDanLatihan,
        ...(parsed.aktivitasDanLatihan || {}),
      },
      penutup: {
        ...fallback.penutup,
        ...(parsed.penutup || {}),
      },
    };

    return NextResponse.json({
      data: finalData,
      isFallback: false,
    });
  } catch (error: unknown) {
    const errInfo = classifyGeminiError(error);
    logGeminiFallback('Materi Ajar', errInfo);
    const fallback = getFallbackMateriAjarData(mapel, jenjang, kelas, fase, topik, tujuanPembelajaran, levelBloom, dimensiProfilLulusan);
    return NextResponse.json({
      data: fallback,
      isFallback: true,
      errorCode: errInfo.code,
      warning: errInfo.userMessage,
    });
  }
}
