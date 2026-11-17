import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { DeepLearningLkpdData, getFallbackDeepLearningLkpd, JenisLkpdType } from '@/lib/deep-learning-lkpd-types';
import { createGeminiClient, DEFAULT_GEMINI_MODEL, classifyGeminiError, logGeminiFallback } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  let mapel = 'PJOK';
  let kelasFase = 'Kelas V / Fase C';
  let topikMateri = 'Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola';
  let tujuanPembelajaran = 'Peserta didik dapat menganalisis letak kaki tumpu, mempraktikkan operan dan kontrol bola mendatar berpasangan secara presisi, serta merefleksikan kerja sama tim.';
  let alokasiWaktu = '2 × 40 Menit';
  let konteksKehidupanNyata = 'Bermain sepak bola mini di lapangan rumput sekolah bersama teman.';
  let karakteristikPesertaDidik = 'Peserta didik usia 10-11 tahun yang aktif kinestetik, menyukai visual bergambar dan game tantangan berpasangan.';
  let jumlahHalaman = 2;
  let jenisLkpd = 'LKPD PEMECAHAN MASALAH' as JenisLkpdType;

  try {
    const body = await req.json();
    mapel = body.mapel || mapel;
    kelasFase = body.kelasFase || kelasFase;
    topikMateri = body.topikMateri || topikMateri;
    tujuanPembelajaran = body.tujuanPembelajaran || tujuanPembelajaran;
    alokasiWaktu = body.alokasiWaktu || alokasiWaktu;
    konteksKehidupanNyata = body.konteksKehidupanNyata || konteksKehidupanNyata;
    karakteristikPesertaDidik = body.karakteristikPesertaDidik || karakteristikPesertaDidik;
    jumlahHalaman = body.jumlahHalaman ?? jumlahHalaman;
    jenisLkpd = (body.jenisLkpd as JenisLkpdType) || jenisLkpd;

    const ai = createGeminiClient();
    if (!ai) {
      return NextResponse.json({
        data: getFallbackDeepLearningLkpd(mapel, kelasFase, topikMateri, tujuanPembelajaran, jenisLkpd),
        isFallback: true,
        warning: 'GEMINI_API_KEY belum diatur. LKPD Deep Learning disusun menggunakan Mode Template otomatis.',
      });
    }

    const systemInstruction = `Anda adalah ahli desain pembelajaran, pengembang LKPD, instructional designer, ilustrator pendidikan, dan ahli Pembelajaran Mendalam (Deep Learning).
Tugas Anda adalah mengembangkan LKPD (Lembar Kerja Peserta Didik) bergambar yang tidak hanya menarik secara visual, tetapi juga mendorong peserta didik untuk berkesadaran (Mindful), bermakna (Meaningful), dan menggembirakan (Joyful) dalam proses belajar.

DATA INPUT:
- Mata Pelajaran: ${mapel}
- Kelas/Fase: ${kelasFase}
- Topik/Materi: ${topikMateri}
- Tujuan Pembelajaran: ${tujuanPembelajaran}
- Alokasi Waktu: ${alokasiWaktu}
- Konteks/Kehidupan Nyata: ${konteksKehidupanNyata}
- Karakteristik Peserta Didik: ${karakteristikPesertaDidik}
- Jumlah Halaman: ${jumlahHalaman}
- Jenis LKPD: ${jenisLkpd}

KETENTUAN WAJIB LKPD PEMBELAJARAN MENDALAM:
1. TERAPKAN 3 PRINSIP:
   - BERKESADARAN (MINDFUL): Rancang aktivitas yang membuat peserta didik memahami tujuan kegiatan, mengetahui apa yang sedang dipelajari, menghubungkan dengan pengalaman awal, berpikir sebelum menjawab, dan refleksi. Gunakan frasa: "Amati dengan teliti!", "Apa yang kamu perhatikan?", "Apa yang membuatmu yakin?", "Tuliskan hal baru yang kamu sadari."
   - BERMAKNA (MEANINGFUL): Hubungkan materi dengan kehidupan sehari-hari, lingkungan sekitar, permasalahan nyata. Pola: Mengamati → Memahami → Menghubungkan → Menganalisis → Menerapkan → Menyimpulkan.
   - MENGGEMBIRAKAN (JOYFUL): Menyenangkan, interaktif, tantangan, misi berjenjang (Level 1 Eksplorasi, Level 2 Tantangan, Level 3 Tantangan Lanjutan), pertanyaan pemantik seru tanpa mengorbankan kedalaman berpikir.
2. STIMULUS VISUAL BERBOBOT PEDAGOGIS:
   - Gambar menjadi stimulus utama berpikir (bukan sekadar hiasan).
   - Tuliskan DESKRIPSI GAMBAR yang sangat spesifik dan PROMPT GAMBAR AI yang siap digunakan (fungsi pedagogis, objek utama, situasi, karakter, ekspresi, komposisi, gaya visual, warna, rasio, detail tanpa teks).
3. STRUKTUR LENGKAP:
   - Identitas LKPD
   - Tujuan Pembelajaran terukur
   - Keterkaitan Deep Learning (Mindful, Meaningful, Joyful)
   - LKPD Siap Pakai terbagi per halaman (${jumlahHalaman} halaman): Judul, Instruksi, Mindful prompt, Stimulus visual, Aktivitas berjenjang (Level 1, 2, 3), Ruang Jawaban siswa, Analisis/diskusi, Refleksi sebelum & sesudah belajar.
   - Kunci Jawaban Lengkap (objektif & indikator terbuka)
   - Rubrik Penilaian 4 skala (aspek pemahaman, proses/kinerja, kolaborasi, refleksi).
4. Gunakan Bahasa Indonesia yang jelas, komunikatif, ramah peserta didik, dan inspiratif.
5. HASIL AKHIR HARUS UTUH DAN LENGKAP SIAP PAKAI.`;

    const userPrompt = `Buatkan LKPD Pembelajaran Mendalam lengkap sesuai instruksi untuk:
Mata Pelajaran: ${mapel}
Kelas/Fase: ${kelasFase}
Topik/Materi: ${topikMateri}
Tujuan Pembelajaran: ${tujuanPembelajaran}
Alokasi Waktu: ${alokasiWaktu}
Konteks Kehidupan Nyata: ${konteksKehidupanNyata}
Karakteristik Peserta Didik: ${karakteristikPesertaDidik}
Jumlah Halaman: ${jumlahHalaman}
Jenis LKPD: ${jenisLkpd}

Sajikan dalam bentuk JSON terstruktur lengkap.`;

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
                mataPelajaran: { type: Type.STRING },
                kelasFase: { type: Type.STRING },
                topikMateri: { type: Type.STRING },
                alokasiWaktu: { type: Type.STRING },
                jenisLkpd: { type: Type.STRING },
                konteksKehidupanNyata: { type: Type.STRING },
                karakteristikPesertaDidik: { type: Type.STRING },
                jumlahHalaman: { type: Type.INTEGER },
              },
              required: ['judulLkpd', 'mataPelajaran', 'kelasFase', 'topikMateri', 'jenisLkpd'],
            },
            tujuanPembelajaran: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            keterkaitanDeepLearning: {
              type: Type.OBJECT,
              properties: {
                mindful: { type: Type.STRING },
                meaningful: { type: Type.STRING },
                joyful: { type: Type.STRING },
              },
              required: ['mindful', 'meaningful', 'joyful'],
            },
            halamanList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  halamanNomor: { type: Type.INTEGER },
                  judulHalaman: { type: Type.STRING },
                  instruksiUtama: { type: Type.STRING },
                  mindfulPrompt: { type: Type.STRING },
                  stimulusVisualDeskripsi: { type: Type.STRING },
                  imagePromptRefNo: { type: Type.INTEGER },
                  aktivitasLevel1: {
                    type: Type.OBJECT,
                    properties: {
                      judul: { type: Type.STRING },
                      deskripsi: { type: Type.STRING },
                      tugas: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      ruangJawaban: { type: Type.STRING },
                    },
                  },
                  aktivitasLevel2: {
                    type: Type.OBJECT,
                    properties: {
                      judul: { type: Type.STRING },
                      deskripsi: { type: Type.STRING },
                      tugas: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      ruangJawaban: { type: Type.STRING },
                    },
                  },
                  aktivitasLevel3: {
                    type: Type.OBJECT,
                    properties: {
                      judul: { type: Type.STRING },
                      deskripsi: { type: Type.STRING },
                      tugas: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      ruangJawaban: { type: Type.STRING },
                    },
                  },
                  analisisDanDiskusi: {
                    type: Type.OBJECT,
                    properties: {
                      pertanyaan: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      ruangDiskusi: { type: Type.STRING },
                    },
                    required: ['pertanyaan', 'ruangDiskusi'],
                  },
                  kesimpulanDanRefleksi: {
                    type: Type.OBJECT,
                    properties: {
                      sebelumSesudahBelajar: { type: Type.STRING },
                      refleksiDiri: { type: Type.STRING },
                    },
                    required: ['sebelumSesudahBelajar', 'refleksiDiri'],
                  },
                },
                required: ['halamanNomor', 'judulHalaman', 'instruksiUtama', 'mindfulPrompt', 'stimulusVisualDeskripsi', 'analisisDanDiskusi', 'kesimpulanDanRefleksi'],
              },
            },
            daftarPromptGambar: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nomor: { type: Type.INTEGER },
                  fungsiPedagogis: { type: Type.STRING },
                  objekUtama: { type: Type.STRING },
                  situasi: { type: Type.STRING },
                  karakter: { type: Type.STRING },
                  ekspresi: { type: Type.STRING },
                  komposisi: { type: Type.STRING },
                  gayaVisual: { type: Type.STRING },
                  warna: { type: Type.STRING },
                  rasio: { type: Type.STRING },
                  detailPenting: { type: Type.STRING },
                  promptReadyAi: { type: Type.STRING },
                },
                required: ['nomor', 'fungsiPedagogis', 'objekUtama', 'promptReadyAi'],
              },
            },
            kunciJawaban: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nomorHalaman: { type: Type.INTEGER },
                  aktivitas: { type: Type.STRING },
                  jawabanObjektif: { type: Type.STRING },
                  indikatorJawabanTerbuka: { type: Type.STRING },
                },
                required: ['nomorHalaman', 'aktivitas', 'jawabanObjektif', 'indikatorJawabanTerbuka'],
              },
            },
            rubrikPenilaian: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  aspek: { type: Type.STRING },
                  skor4: { type: Type.STRING },
                  skor3: { type: Type.STRING },
                  skor2: { type: Type.STRING },
                  skor1: { type: Type.STRING },
                },
                required: ['aspek', 'skor4', 'skor3', 'skor2', 'skor1'],
              },
            },
          },
          required: [
            'identitas',
            'tujuanPembelajaran',
            'keterkaitanDeepLearning',
            'halamanList',
            'daftarPromptGambar',
            'kunciJawaban',
            'rubrikPenilaian',
          ],
        },
      },
    });

    const outputText = response.text || '{}';
    let parsed: Partial<DeepLearningLkpdData> = {};
    try {
      parsed = JSON.parse(outputText);
    } catch {
      const match = outputText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    const fallback = getFallbackDeepLearningLkpd(mapel, kelasFase, topikMateri, tujuanPembelajaran, jenisLkpd);
    const finalData: DeepLearningLkpdData = {
      identitas: {
        ...fallback.identitas,
        ...(parsed.identitas || {}),
        jenisLkpd: (parsed.identitas?.jenisLkpd as JenisLkpdType) || jenisLkpd,
      },
      tujuanPembelajaran: parsed.tujuanPembelajaran?.length ? parsed.tujuanPembelajaran : fallback.tujuanPembelajaran,
      keterkaitanDeepLearning: {
        ...fallback.keterkaitanDeepLearning,
        ...(parsed.keterkaitanDeepLearning || {}),
      },
      halamanList: parsed.halamanList?.length ? parsed.halamanList : fallback.halamanList,
      daftarPromptGambar: parsed.daftarPromptGambar?.length ? parsed.daftarPromptGambar : fallback.daftarPromptGambar,
      kunciJawaban: parsed.kunciJawaban?.length ? parsed.kunciJawaban : fallback.kunciJawaban,
      rubrikPenilaian: parsed.rubrikPenilaian?.length ? parsed.rubrikPenilaian : fallback.rubrikPenilaian,
    };

    return NextResponse.json({
      data: finalData,
      isFallback: false,
    });
  } catch (err: unknown) {
    const errInfo = classifyGeminiError(err);
    logGeminiFallback('LKPD Deep Learning', errInfo);
    return NextResponse.json({
      data: getFallbackDeepLearningLkpd(mapel, kelasFase, topikMateri, tujuanPembelajaran, jenisLkpd),
      isFallback: true,
      errorCode: errInfo.code,
      warning: errInfo.userMessage,
    });
  }
}
