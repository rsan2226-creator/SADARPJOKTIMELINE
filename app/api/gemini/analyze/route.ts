import { NextRequest, NextResponse } from 'next/server';
import { createGeminiClient, DEFAULT_GEMINI_MODEL, classifyGeminiError, logGeminiFallback } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  let mode = '';
  let contextData: Record<string, unknown> = {};
  try {
    const body = await req.json();
    mode = body.mode || '';
    contextData = body.contextData || {};

    const ai = createGeminiClient();
    if (!ai) {
      return NextResponse.json({
        analysis: generateFallbackAnalysis(mode, contextData),
        isFallback: true,
        warning: 'GEMINI_API_KEY belum diatur. Analisis dibuat menggunakan Mode Template otomatis.',
      });
    }

    const systemInstruction = `Anda adalah Asisten Pakar Ahli Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK) serta Fisiologi Olahraga Sekolah Dasar & Menengah (SADARPJOK).
Gunakan bahasa Indonesia yang profesional, ramah, edukatif, berorientasi pada keselamatan siswa, serta selaras dengan Kurikulum Merdeka (Fase B/C).
Format output menggunakan markdown yang rapi, poin-poin jelas, serta actionable (mudah dipraktikkan oleh guru dan siswa).`;

    let prompt = '';

    if (mode === 'student_feedback') {
      prompt = `Buatkan evaluasi kebugaran jasmani personal untuk siswa berikut berdasarkan data tes TKJI:
Nama Siswa: ${contextData.nama}
Jenis Kelamin: ${contextData.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
Usia: ${contextData.usia || 11} tahun
Hasil TKJI:
- Lari Sprint 40m: ${contextData.sprintSec} detik (Nilai: ${contextData.scoreSprint})
- Gantung Siku Tekuk / Pull-Up: ${contextData.pullUps} detik/kali (Nilai: ${contextData.scorePullUps})
- Baring Duduk 30 detik: ${contextData.sitUps} kali (Nilai: ${contextData.scoreSitUps})
- Loncat Tegak: ${contextData.verticalJumpCm} cm (Nilai: ${contextData.scoreJump})
- Lari 600m: ${contextData.runSec} detik (Nilai: ${contextData.scoreRun})
Total Nilai: ${contextData.totalNilai} (Kategori: ${contextData.kategori})
IMT: ${contextData.imt} (${contextData.kategoriImt})
Catatan Medis: ${contextData.catatanMedis || 'Tidak ada'}

Berikan:
1. Apresiasi & Ringkasan Kondisi Fisik.
2. Komponen kebugaran yang sudah unggul.
3. Komponen yang perlu ditingkatkan (misal daya tahan jantung-paru atau kekuatan otot).
4. Rekomendasi 2-3 latihan sederhana yang menyenangkan dan aman dilakukan di rumah atau saat jam istirahat.`;
    } else if (mode === 'session_summary') {
      prompt = `Analisis data sesi aktivitas fisik lapangan real-time berikut:
Materi: ${contextData.judulMateri}
Jenis Aktivitas: ${contextData.jenisAktivitas}
Durasi: ${Math.round(Number(contextData.elapsedSeconds || 0) / 60)} menit
Total Siswa Aktif: ${contextData.activeStudentsCount} dari ${contextData.totalStudentsCount} siswa
Rata-rata Putaran/Laps: ${contextData.avgLaps} laps
Siswa dalam Pemantauan/Kelelahan: ${contextData.fatiguedStudents || 'Nihil'}

Berikan:
1. Evaluasi intensitas latihan (Volume & Beban Latihan).
2. Catatan manajemen keselamatan lapangan & hidrasi.
3. Rekomendasi pendinginan (cooling down) dan refleksi gerak untuk pertemuan berikutnya.`;
    } else {
      prompt = `Buatkan rekomendasi program remedial atau pengayaan kebugaran jasmani kelas:
Data Kelas: ${contextData.kelasNama || 'Kelas 4'}
Distribusi Kebugaran: ${JSON.stringify(contextData.distribution || {})}
Rata-rata Nilai: ${contextData.avgScore || 16} / 25

Rancang:
1. Strategi pembelajaran berdiferensiasi untuk siswa kelompok Kurang/Sedang dan kelompok Baik/Sangat Baik.
2. Modifikasi permainan gerak adaptif (low impact, high engagement).
3. Pesan penguatan profil pelajar Pancasila (gotong royong, mandiri, sportivitas).`;
    }

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    return NextResponse.json({
      analysis: response.text || 'Analisis kebugaran berhasil digenerate.',
      isFallback: false,
    });
  } catch (error: unknown) {
    const errInfo = classifyGeminiError(error);
    logGeminiFallback('AI Analysis', errInfo);
    return NextResponse.json({
      analysis: generateFallbackAnalysis(mode, contextData),
      errorCode: errInfo.code,
      warning: errInfo.userMessage,
      isFallback: true,
    });
  }
}

function generateFallbackAnalysis(mode: string, contextData: Record<string, unknown>): string {
  if (mode === 'student_feedback') {
    return `### Rekomendasi Kebugaran Personal (SADARPJOK)
**Siswa:** ${contextData?.nama || 'Siswa'} | **Kategori:** ${contextData?.kategori || 'Sedang'}

1. **Apresiasi:**
   Ananda telah menunjukkan antusiasme yang baik dalam mengikuti rangkaian tes kebugaran jasmani (TKJI). Tingkat kebugaran berada dalam kategori **${contextData?.kategori || 'Sedang'}**.

2. **Fokus Pengembangan:**
   - Pertahankan kekuatan otot inti (abdominal) dengan latihan plank atau sit-up bertahap 15 detik.
   - Tingkatkan kapasitas aerobik (daya tahan jantung-paru) melalui aktivitas lari jogging santai berdurasi 10–15 menit, 2 kali per minggu.

3. **Tips Keselamatan & Hidrasi:**
   - Pastikan selalu melakukan pemanasan statis dan dinamis sebelum olahraga.
   - Cukupi asupan air putih sebelum, saat jeda, dan setelah latihan fisik.`;
  }

  return `### Analisis & Rencana Aktivitas Pembelajaran PJOK
**Materi:** ${contextData?.judulMateri || 'Kebugaran Jasmani Terpadu'}

1. **Diferensiasi Pembelajaran:**
   - **Kelompok Pemula (Perlu Dukungan):** Berikan jarak lari yang lebih pendek dengan jeda istirahat aktif 90 detik.
   - **Kelompok Mahir:** Berikan variasi tantangan seperti rintangan kelincahan (agility ladder) atau estafet bola.

2. **Manajemen Lapangan:**
   - Pastikan area bebas dari permukaan licin atau benda berbahaya.
   - Lakukan pengecekan denyut nadi berkala untuk mengukur zona latihan aerobik aman (60-80% denyut nadi maksimal).`;
}
