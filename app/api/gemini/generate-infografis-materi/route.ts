import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { InfografisMateriData, getFallbackInfografisMateriData } from '@/lib/infografis-materi-types';
import { createGeminiClient, DEFAULT_GEMINI_MODEL, classifyGeminiError, logGeminiFallback } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  let mapel = 'PJOK';
  let kelasFase = 'Kelas V / Fase C';
  let topik = 'Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola';
  let formatPilihan = 'auto';
  let catatanTambahan = '';

  try {
    const body = await req.json();
    mapel = body.mapel || mapel;
    kelasFase = body.kelasFase || kelasFase;
    topik = body.topik || topik;
    formatPilihan = body.formatPilihan || formatPilihan;
    catatanTambahan = body.catatanTambahan || '';

    const ai = createGeminiClient();
    if (!ai) {
      return NextResponse.json({
        data: getFallbackInfografisMateriData(mapel, kelasFase, topik),
        isFallback: true,
        warning: 'GEMINI_API_KEY belum diatur. Infografis disusun menggunakan Mode Template otomatis.',
      });
    }

    const systemInstruction = `Anda adalah ahli desain pembelajaran, instructional designer, guru profesional, dan desainer infografis pendidikan yang ahli dalam mengubah materi pembelajaran menjadi rangkuman visual yang ringkas, sistematis, mudah dipahami, menarik, dan membantu peserta didik mengingat konsep dengan cepat.

TUGAS UTAMA:
Buatlah RANGKUMAN MATERI AJAR dan ubah menjadi INFOGRAFIS EDUKATIF berbasis data:
MAPEL: ${mapel}
KELAS/FASE: ${kelasFase}
TOPIK/MATERI: ${topik}

PANDUAN LANGKAH KERJA:
A. ANALISIS MATERI (10 Parameter):
1. Konsep utama yang wajib dipahami
2. Submateri penting
3. Definisi atau istilah kunci
4. Rumus atau aturan penting (jika ada)
5. Langkah/prosedur (jika ada)
6. Ciri-ciri/karakteristik (jika ada)
7. Contoh yang paling relevan
8. Perbedaan antar konsep
9. Kesalahan umum yang perlu dihindari
10. Kata kunci yang membantu mengingat materi

B. BUAT RANGKUMAN BELAJAR:
- Singkat tetapi lengkap, bahasa mudah dipahami peserta didik jenjang ${kelasFase}.
- Hindari paragraf panjang. Utamakan poin-poin.
- Gunakan contoh konkret, tonjolkan konsep terpenting.

C. PILIH FORMAT INFOGRAFIS DARI 30 FORMAT:
Pilihan format yang tersedia:
1. CHEATSHEET 2. STICKY NOTES 3. MIND MAP 4. CONCEPT MAP 5. FLOWCHART 6. TIMELINE 7. PYRAMID INFOGRAPHIC 8. FUNNEL INFOGRAPHIC 9. COMPARISON CARD 10. TABLE INFOGRAPHIC 11. STEP-BY-STEP GUIDE 12. PROCESS DIAGRAM 13. CYCLE DIAGRAM 14. TREE DIAGRAM 15. ROADMAP 16. KNOWLEDGE CARDS 17. FLASHCARD INFOGRAPHIC 18. VISUAL NOTES 19. ONE-PAGE SUMMARY 20. POSTER EDUKATIF 21. COMIC SUMMARY 22. STORYBOARD 23. QUIZ INFOGRAPHIC 24. PROBLEM -> SOLUTION 25. BEFORE -> AFTER 26. 5W + 1H 27. PYRAMID OF KNOWLEDGE 28. HUB & SPOKE 29. PERIODIC / MODULAR CARDS 30. VISUAL DICTIONARY.
${formatPilihan !== 'auto' ? `Pengguna menginginkan format: "${formatPilihan}". Sesuaikan struktur visual dengan format tersebut.` : `Analisis karakteristik materi terlebih dahulu dan pilih 1 FORMAT UTAMA yang paling tepat (beserta alasan pemilihan).`}

D. DESAIN INFOGRAFIS:
- Ukuran A4 portrait (21 x 29,7 cm).
- Visual hierarchy sangat jelas: judul mudah terlihat, informasi dibagi dalam 4-6 modul/kartu infografis tematik yang terstruktur rapi.
- Gunakan ikon visual ramah (📌, 🎯, ⚡, 💡, ⚠️, 🔍, 🔄, ⚖️, 🧭, 👣).
- Warna modul harmonis (pilihan: teal, emerald, amber, sky, rose, purple, indigo).
- Gaya visual: MODERN + COLORFUL + CLEAN + EDUKATIF + FUN.
- Jika materi sains/matematika/PJOK memuat rumus/aturan/prosedur, pastikan akurat dan runtut.`;

    const userPrompt = `Buatkan Rangkuman dan Desain Infografis Edukatif A4 Lengkap untuk:
Mata Pelajaran: ${mapel}
Kelas/Fase: ${kelasFase}
Topik/Materi: ${topik}
Format yang Diminta: ${formatPilihan}
${catatanTambahan ? `Catatan Tambahan: ${catatanTambahan}` : ''}
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
                judulInfografis: { type: Type.STRING },
                subjudul: { type: Type.STRING },
                mataPelajaran: { type: Type.STRING },
                kelasFase: { type: Type.STRING },
                topikMateri: { type: Type.STRING },
                formatTerpilih: { type: Type.STRING },
                alasanFormat: { type: Type.STRING },
                kataMutiara: { type: Type.STRING },
              },
              required: ['judulInfografis', 'subjudul', 'mataPelajaran', 'kelasFase', 'topikMateri', 'formatTerpilih', 'alasanFormat', 'kataMutiara'],
            },
            analisisMateri: {
              type: Type.OBJECT,
              properties: {
                konsepUtama: { type: Type.STRING },
                submateriPenting: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                istilahKunci: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      istilah: { type: Type.STRING },
                      artiSingkat: { type: Type.STRING },
                    },
                    required: ['istilah', 'artiSingkat'],
                  },
                },
                rumusAtauAturan: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                langkahProsedur: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                karakteristikCiri: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                contohRelevan: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                perbedaanKonsep: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                kesalahanUmum: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                kataKunciMemori: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['konsepUtama', 'submateriPenting', 'istilahKunci', 'contohRelevan', 'kesalahanUmum', 'kataKunciMemori'],
            },
            kartuInfografis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  judul: { type: Type.STRING },
                  ikon: { type: Type.STRING },
                  warnaCard: { type: Type.STRING },
                  tipeKonten: { type: Type.STRING },
                  tag: { type: Type.STRING },
                  highlightText: { type: Type.STRING },
                  poinList: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  langkahList: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        nomor: { type: Type.STRING },
                        judul: { type: Type.STRING },
                        deskripsi: { type: Type.STRING },
                      },
                      required: ['nomor', 'judul', 'deskripsi'],
                    },
                  },
                  itemPerbandingan: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        judulA: { type: Type.STRING },
                        deskripsiA: { type: Type.STRING },
                        judulB: { type: Type.STRING },
                        deskripsiB: { type: Type.STRING },
                      },
                      required: ['judulA', 'deskripsiA', 'judulB', 'deskripsiB'],
                    },
                  },
                  istilahList: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        kata: { type: Type.STRING },
                        definisi: { type: Type.STRING },
                      },
                      required: ['kata', 'definisi'],
                    },
                  },
                },
                required: ['id', 'judul', 'ikon', 'warnaCard', 'tipeKonten'],
              },
            },
            takeawayKunci: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            tagarMemori: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['identitas', 'analisisMateri', 'kartuInfografis', 'takeawayKunci', 'tagarMemori'],
        },
      },
    });

    const outputText = response.text || '{}';
    let parsed: Partial<InfografisMateriData> = {};
    try {
      parsed = JSON.parse(outputText);
    } catch {
      const match = outputText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    const fallback = getFallbackInfografisMateriData(mapel, kelasFase, topik);
    const finalData: InfografisMateriData = {
      identitas: {
        ...fallback.identitas,
        ...(parsed.identitas || {}),
      },
      analisisMateri: {
        ...fallback.analisisMateri,
        ...(parsed.analisisMateri || {}),
      },
      kartuInfografis: parsed.kartuInfografis && parsed.kartuInfografis.length > 0
        ? (parsed.kartuInfografis as any)
        : fallback.kartuInfografis,
      takeawayKunci: parsed.takeawayKunci?.length ? parsed.takeawayKunci : fallback.takeawayKunci,
      tagarMemori: parsed.tagarMemori?.length ? parsed.tagarMemori : fallback.tagarMemori,
    };

    return NextResponse.json({
      data: finalData,
      isFallback: false,
    });
  } catch (error: unknown) {
    const errInfo = classifyGeminiError(error);
    logGeminiFallback('Infografis Materi', errInfo);
    const fallback = getFallbackInfografisMateriData(mapel, kelasFase, topik);
    return NextResponse.json({
      data: fallback,
      isFallback: true,
      errorCode: errInfo.code,
      warning: errInfo.userMessage,
    });
  }
}
