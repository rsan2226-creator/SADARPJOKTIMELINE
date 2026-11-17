import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { LkpdData, getFallbackLkpdData } from '@/lib/lkpd-types';
import { createGeminiClient, DEFAULT_GEMINI_MODEL, classifyGeminiError, logGeminiFallback } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  let mapel = 'PJOK';
  let jenjang = 'SD';
  let kelas = 'Kelas V';
  let fase = 'Fase C';
  let modelPembelajaran = 'Problem Based Learning (PBL)';
  let topik = 'Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola';
  let tujuanPembelajaran = 'Peserta didik dapat menganalisis konsep posisi kaki tumpu dan mempraktikkan operan bola mendatar berpasangan secara terarah dan sportif.';
  let dimensiProfilLulusan = ['Kolaborasi', 'Penalaran Kritis', 'Kemandirian', 'Kesehatan'];

  try {
    const body = await req.json();
    mapel = body.mapel || mapel;
    jenjang = body.jenjang || jenjang;
    kelas = body.kelas || kelas;
    fase = body.fase || fase;
    modelPembelajaran = body.modelPembelajaran || modelPembelajaran;
    topik = body.topik || topik;
    tujuanPembelajaran = body.tujuanPembelajaran || tujuanPembelajaran;
    dimensiProfilLulusan = body.dimensiProfilLulusan || dimensiProfilLulusan;

    const ai = createGeminiClient();
    if (!ai) {
      return NextResponse.json({
        data: getFallbackLkpdData(mapel, jenjang, kelas, fase, modelPembelajaran, topik, tujuanPembelajaran, dimensiProfilLulusan),
        isFallback: true,
        warning: 'GEMINI_API_KEY belum diatur. LKPD disusun menggunakan Mode Template otomatis.',
      });
    }

    const systemInstruction = `Anda adalah seorang Guru ${mapel} ${jenjang} ${kelas} ${fase} yang profesional dan ahli dalam menyusun Lembar Kerja Peserta Didik (LKPD) Pembelajaran Mendalam (Deep Learning).
Tugas Anda adalah membuat LKPD yang LENGKAP dan TERSTRUKTUR berdasarkan sintaks model pembelajaran "${modelPembelajaran}" dengan topik "${topik}".
Tujuan pembelajaran acuan: "${tujuanPembelajaran}".
Dimensi profil lulusan yang dikembangkan: ${dimensiProfilLulusan.join(', ')}.

KETENTUAN WAJIB LKPD:
1. Identitas diri di LKPD: Nama peserta didik, mata pelajaran, no absen, kelas, tanggal.
2. Petunjuk penggunaan LKPD: Instruksi langkah-langkah mengerjakan, alat & bahan yang dibutuhkan, serta cara menjawab.
3. Sintaks Pembelajaran & Pengalaman Belajar Mendalam DIINTEGRASIKAN MENJADI SATU dan ditampilkan TIDAK DALAM BENTUK TABEL (dalam bentuk tahapan/blok kegiatan naratif interaktif):
   - Memahami: Sajikan materi/teks ringkas yang kontekstual dan menarik untuk diamati/dibaca + deskripsi ilustrasi + minimal 3 pertanyaan pemahaman mendalam dengan panduan ruang jawaban siswa.
   - Mengaplikasikan: Kasus nyata kontekstual kehidupan siswa + instruksi kerja jelas + tugas aktivitas nyata + panduan ruang kerja siswa.
   - Merefleksikan: 2–3 pertanyaan refleksi kritis menuntun siswa meninjau proses belajar, kesulitan yang dihadapi, dan rencana perbaikan/tindak lanjut.
4. Bagian Penutup: Ucapan penyemangat/motivasi, kolom cek pemahaman diri siswa (checklist indikator diri), dan ruang catatan/paraf apresiasi guru.
5. Bahasa: Komunikatif, ramah, hangat sesuai jenjang ${kelas}, mendorong pembelajaran bermakna, berkesadaran (mindful), dan menggembirakan (joyful).
6. ISI HARUS MUNCUL SECARA UTUH DAN LENGKAP (bukan sekadar kerangka atau poin kosong).`;

    const userPrompt = `Buatkan Lembar Kerja Peserta Didik (LKPD) lengkap untuk:
Mata Pelajaran: ${mapel}
Jenjang: ${jenjang}
Kelas / Fase: ${kelas} / ${fase}
Topik Pembelajaran: ${topik}
Sintaks Model & Metode: ${modelPembelajaran}
Tujuan Pembelajaran: ${tujuanPembelajaran}
Dimensi Profil Lulusan: ${dimensiProfilLulusan.join(', ')}

Sajikan dalam bentuk JSON berstruktur sesuai skema.`;

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
                judulLkpd: { type: Type.STRING },
                temaTopik: { type: Type.STRING },
                mataPelajaran: { type: Type.STRING },
                jenjang: { type: Type.STRING },
                kelasFase: { type: Type.STRING },
                alokasiWaktu: { type: Type.STRING },
                modelPembelajaran: { type: Type.STRING },
                sintaksModel: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                tujuanPembelajaran: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                dimensiProfilLulusan: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['judulLkpd', 'temaTopik', 'mataPelajaran', 'kelasFase', 'tujuanPembelajaran', 'dimensiProfilLulusan'],
            },
            petunjukPenggunaan: {
              type: Type.OBJECT,
              properties: {
                langkahMengerjakan: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                alatDanBahan: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                caraMenjawab: { type: Type.STRING },
              },
              required: ['langkahMengerjakan', 'alatDanBahan', 'caraMenjawab'],
            },
            sintaksDanPengalamanBelajar: {
              type: Type.OBJECT,
              properties: {
                memahami: {
                  type: Type.OBJECT,
                  properties: {
                    tahapSintaks: { type: Type.STRING },
                    judulBagian: { type: Type.STRING },
                    stimulusTeks: { type: Type.STRING },
                    ilustrasiAtauGambarDeskripsi: { type: Type.STRING },
                    pertanyaanPemahaman: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          nomor: { type: Type.INTEGER },
                          soal: { type: Type.STRING },
                          panduanJawabanSiswa: { type: Type.STRING },
                        },
                        required: ['nomor', 'soal'],
                      },
                    },
                  },
                  required: ['tahapSintaks', 'judulBagian', 'stimulusTeks', 'pertanyaanPemahaman'],
                },
                mengaplikasikan: {
                  type: Type.OBJECT,
                  properties: {
                    tahapSintaks: { type: Type.STRING },
                    judulBagian: { type: Type.STRING },
                    studiKasusNyata: { type: Type.STRING },
                    instruksiKerja: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    tugasAktivitas: { type: Type.STRING },
                    panduanRuangKerja: { type: Type.STRING },
                  },
                  required: ['tahapSintaks', 'judulBagian', 'studiKasusNyata', 'instruksiKerja', 'tugasAktivitas'],
                },
                merefleksikan: {
                  type: Type.OBJECT,
                  properties: {
                    tahapSintaks: { type: Type.STRING },
                    judulBagian: { type: Type.STRING },
                    pertanyaanRefleksi: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          nomor: { type: Type.INTEGER },
                          pertanyaan: { type: Type.STRING },
                          fokusRefleksi: { type: Type.STRING },
                        },
                        required: ['nomor', 'pertanyaan'],
                      },
                    },
                  },
                  required: ['tahapSintaks', 'judulBagian', 'pertanyaanRefleksi'],
                },
              },
              required: ['memahami', 'mengaplikasikan', 'merefleksikan'],
            },
            penutup: {
              type: Type.OBJECT,
              properties: {
                pesanPenyemangat: { type: Type.STRING },
                kolomCekPemahamanDiri: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      aspek: { type: Type.STRING },
                      pilihan: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ['aspek', 'pilihan'],
                  },
                },
                catatanDanParafGuru: {
                  type: Type.OBJECT,
                  properties: {
                    ruangCatatan: { type: Type.STRING },
                    skalaNilai: { type: Type.STRING },
                  },
                  required: ['ruangCatatan', 'skalaNilai'],
                },
              },
              required: ['pesanPenyemangat', 'kolomCekPemahamanDiri', 'catatanDanParafGuru'],
            },
          },
          required: ['identitas', 'petunjukPenggunaan', 'sintaksDanPengalamanBelajar', 'penutup'],
        },
      },
    });

    const outputText = response.text || '{}';
    let parsed: Partial<LkpdData> = {};
    try {
      parsed = JSON.parse(outputText);
    } catch {
      const match = outputText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    const fallback = getFallbackLkpdData(mapel, jenjang, kelas, fase, modelPembelajaran, topik, tujuanPembelajaran, dimensiProfilLulusan);

    const finalData: LkpdData = {
      identitas: {
        ...fallback.identitas,
        ...(parsed.identitas || {}),
        tujuanPembelajaran: parsed.identitas?.tujuanPembelajaran?.length ? parsed.identitas.tujuanPembelajaran : fallback.identitas.tujuanPembelajaran,
        dimensiProfilLulusan: parsed.identitas?.dimensiProfilLulusan?.length ? parsed.identitas.dimensiProfilLulusan : fallback.identitas.dimensiProfilLulusan,
        sintaksModel: parsed.identitas?.sintaksModel?.length ? parsed.identitas.sintaksModel : fallback.identitas.sintaksModel,
      },
      petunjukPenggunaan: {
        ...fallback.petunjukPenggunaan,
        ...(parsed.petunjukPenggunaan || {}),
        langkahMengerjakan: parsed.petunjukPenggunaan?.langkahMengerjakan?.length ? parsed.petunjukPenggunaan.langkahMengerjakan : fallback.petunjukPenggunaan.langkahMengerjakan,
        alatDanBahan: parsed.petunjukPenggunaan?.alatDanBahan?.length ? parsed.petunjukPenggunaan.alatDanBahan : fallback.petunjukPenggunaan.alatDanBahan,
      },
      sintaksDanPengalamanBelajar: {
        memahami: {
          ...fallback.sintaksDanPengalamanBelajar.memahami,
          ...(parsed.sintaksDanPengalamanBelajar?.memahami || {}),
          pertanyaanPemahaman: parsed.sintaksDanPengalamanBelajar?.memahami?.pertanyaanPemahaman?.length
            ? parsed.sintaksDanPengalamanBelajar.memahami.pertanyaanPemahaman
            : fallback.sintaksDanPengalamanBelajar.memahami.pertanyaanPemahaman,
        },
        mengaplikasikan: {
          ...fallback.sintaksDanPengalamanBelajar.mengaplikasikan,
          ...(parsed.sintaksDanPengalamanBelajar?.mengaplikasikan || {}),
          instruksiKerja: parsed.sintaksDanPengalamanBelajar?.mengaplikasikan?.instruksiKerja?.length
            ? parsed.sintaksDanPengalamanBelajar.mengaplikasikan.instruksiKerja
            : fallback.sintaksDanPengalamanBelajar.mengaplikasikan.instruksiKerja,
        },
        merefleksikan: {
          ...fallback.sintaksDanPengalamanBelajar.merefleksikan,
          ...(parsed.sintaksDanPengalamanBelajar?.merefleksikan || {}),
          pertanyaanRefleksi: parsed.sintaksDanPengalamanBelajar?.merefleksikan?.pertanyaanRefleksi?.length
            ? parsed.sintaksDanPengalamanBelajar.merefleksikan.pertanyaanRefleksi
            : fallback.sintaksDanPengalamanBelajar.merefleksikan.pertanyaanRefleksi,
        },
      },
      penutup: {
        ...fallback.penutup,
        ...(parsed.penutup || {}),
        kolomCekPemahamanDiri: parsed.penutup?.kolomCekPemahamanDiri?.length
          ? parsed.penutup.kolomCekPemahamanDiri
          : fallback.penutup.kolomCekPemahamanDiri,
        catatanDanParafGuru: {
          ...fallback.penutup.catatanDanParafGuru,
          ...(parsed.penutup?.catatanDanParafGuru || {}),
        },
      },
    };

    return NextResponse.json({
      data: finalData,
      isFallback: false,
    });
  } catch (err: unknown) {
    const errInfo = classifyGeminiError(err);
    logGeminiFallback('LKPD', errInfo);
    return NextResponse.json({
      data: getFallbackLkpdData(mapel, jenjang, kelas, fase, modelPembelajaran, topik, tujuanPembelajaran, dimensiProfilLulusan),
      isFallback: true,
      errorCode: errInfo.code,
      warning: errInfo.userMessage,
    });
  }
}
