import { NextRequest, NextResponse } from 'next/server';
import { createGeminiClient, DEFAULT_GEMINI_MODEL, classifyGeminiError, logGeminiFallback } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  let satuanPendidikan = 'SD Negeri Nusantara 01';
  let namaMapel = 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)';
  let kelasFase = 'Kelas 4 / Fase B';
  let semester = 'Ganjil';
  let tahunPelajaran = '2024/2025';
  let babMateri = 'Bab 3: Kebugaran Jasmani Terkait Kesehatan';
  let daftarTujuanPembelajaran = '';

  try {
    const body = await req.json();
    satuanPendidikan = body.satuanPendidikan || satuanPendidikan;
    namaMapel = body.namaMapel || namaMapel;
    kelasFase = body.kelasFase || kelasFase;
    semester = body.semester || semester;
    tahunPelajaran = body.tahunPelajaran || tahunPelajaran;
    babMateri = body.babMateri || babMateri;
    daftarTujuanPembelajaran = body.daftarTujuanPembelajaran || '';

    const ai = createGeminiClient();
    if (!ai) {
      return NextResponse.json({
        result: generateFallbackKktp(
          satuanPendidikan,
          namaMapel,
          kelasFase,
          semester,
          tahunPelajaran,
          babMateri,
          daftarTujuanPembelajaran
        ),
        isFallback: true,
        warning: 'GEMINI_API_KEY belum diatur. Dokumen KKTP disusun menggunakan Mode Template otomatis.',
      });
    }

    const systemInstruction = `Anda adalah Pakar Evaluasi dan Asesmen Kurikulum Merdeka Kemendikbudristek.
Tugas Anda adalah menyusun tabel KKTP (Kriteria Ketercapaian Tujuan Pembelajaran) yang sangat sistematis, terukur, dan operasional menggunakan pendekatan interval nilai (rubrik deskriptif).
Pastikan:
1. Menampilkan Identitas KKTP lengkap di bagian paling atas:
   - Satuan Pendidikan
   - Mata Pelajaran
   - Kelas / Fase
   - Semester
   - Tahun Pelajaran
2. Tabel KKTP harus memuat kolom-kolom berikut:
   - Nomor
   - Bab
   - Materi Pokok
   - Deskripsi Capaian / Tujuan Pembelajaran
   - Interval Nilai yang dibagi ke dalam 4 kolom terpisah:
     1. Perlu Bimbingan (0–68)
     2. Cukup (68–78)
     3. Baik (79–89)
     4. Sangat Baik (90–100)
3. Setiap kolom interval KKTP HARUS memuat deskripsi kriteria ketercapaian operasional yang jelas dan spesifik untuk setiap Tujuan Pembelajaran (bukan sekadar angka, melainkan deskripsi konkret performa murid).
4. Di bawah tabel, sertakan panduan tindak lanjut / intervensi asesmen untuk masing-masing interval nilai (remedial, bimbingan teman sebaya, pengayaan, dan apresiasi).
5. Format output dalam Markdown terstruktur rapi, tabel valid, dan siap diekspor ke Microsoft Word (.doc).`;

    const userPrompt = `Buatkan tabel KKTP (Kriteria Ketercapaian Tujuan Pembelajaran) untuk mata pelajaran ${namaMapel} pada kelas/fase ${kelasFase} semester ${semester}.

Identitas Dokumen:
- Satuan Pendidikan: ${satuanPendidikan}
- Mata Pelajaran: ${namaMapel}
- Kelas dan Fase: ${kelasFase}
- Semester: ${semester}
- Tahun Pelajaran: ${tahunPelajaran}
- Bab dan Materi Pokok: ${babMateri}

KKTP ini disusun berdasarkan daftar tujuan pembelajaran sebagai berikut:
${daftarTujuanPembelajaran}

Tabel KKTP yang dibuat harus memuat kolom-kolom berikut:
1. Nomor (No)
2. Bab
3. Materi Pokok
4. Deskripsi Capaian / Tujuan Pembelajaran
5. Interval Nilai, yang dirinci ke dalam empat kolom terpisah:
   - Perlu Bimbingan (0–68)
   - Cukup (68–78)
   - Baik (79–89)
   - Sangat Baik (90–100)

Tulis tujuan pembelajaran sesuai dengan tujuan yang terdapat diatas.
Setiap Kolom Interval KKTP dituliskan deskripsinya masing-masing untuk setiap Tujuan Pembelajaran secara konkret dan terukur.
Dibagian atas dokumen tambahkan Identitas KKTP: Satuan pendidikan, mata pelajaran, semester, kelas, fase, tahun pelajaran.
Formatkan hasilnya dalam bentuk tabel yang rapi.

OUTPUT: BUATKAN OUTPUTNYA DALAM BENTUK DOKUMEN YANG SANGAT RAPI DAN LENGKAP SEHINGGA SIAP DIJADIKAN FILE WORD.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
      },
    });

    const outputText = response.text || '';
    if (!outputText.trim()) {
      return NextResponse.json({
        result: generateFallbackKktp(
          satuanPendidikan,
          namaMapel,
          kelasFase,
          semester,
          tahunPelajaran,
          babMateri,
          daftarTujuanPembelajaran
        ),
        isFallback: true,
        warning: 'Respons AI kosong. Dokumen KKTP disusun menggunakan Mode Template otomatis.',
      });
    }

    return NextResponse.json({
      result: outputText,
      isFallback: false,
    });
  } catch (error: unknown) {
    const errInfo = classifyGeminiError(error);
    logGeminiFallback('KKTP', errInfo);
    return NextResponse.json({
      result: generateFallbackKktp(
        satuanPendidikan,
        namaMapel,
        kelasFase,
        semester,
        tahunPelajaran,
        babMateri,
        daftarTujuanPembelajaran
      ),
      isFallback: true,
      errorCode: errInfo.code,
      warning: errInfo.userMessage,
    });
  }
}

function generateFallbackKktp(
  satuanPendidikan: string,
  namaMapel: string,
  kelasFase: string,
  semester: string,
  tahunPelajaran: string,
  babMateri: string,
  tpText: string
): string {
  const babShort = babMateri.split(':')[0]?.trim() || 'Bab Utama';
  const materiShort = babMateri.includes(':') ? babMateri.split(':').slice(1).join(':').trim() : babMateri;

  const parsedTps = tpText
    .split(/\n+/)
    .map((line) => line.replace(/^\s*\d+[\.\)]\s*/, '').trim())
    .filter((line) => line.length > 5);

  const defaultTps = [
    `Murid dapat menjelaskan konsep dan prinsip dasar ${materiShort} melalui pengamatan visual dengan tepat.`,
    `Murid dapat mempraktikkan variasi keterampilan ${materiShort} sesuai prosedur gerak yang aman dan terkontrol.`,
    `Murid dapat menganalisis kesalahan gerak serta melakukan perbaikan teknik ${materiShort} bersama rekan.`,
    `Murid dapat menerapkan sikap sportivitas, kerja sama, dan kemandirian selama aktivitas ${materiShort}.`,
  ];

  const tpsToRender = parsedTps.length > 0 ? parsedTps : defaultTps;

  const rowsMarkdown = tpsToRender
    .map((tp, idx) => {
      const safeTp = tp.replace(/\|/g, '/');
      return `| ${idx + 1} | ${babShort} | ${materiShort} | ${safeTp} | Belum mampu memenuhi indikator dasar pada "${safeTp.slice(0, 60)}..." dan membutuhkan pendampingan intensif guru. | Mampu menunjukkan sebagian indikator dasar namun ketepatan teknik atau pemahaman konsep masih perlu perbaikan. | Mampu memenuhi hampir seluruh indikator ketercapaian secara tepat, mandiri, dan aman. | Mampu melampaui indikator ketercapaian dengan konsisten, presisi, serta mampu menjadi tutor sebaya bagi teman. |`;
    })
    .join('\n');

  return `# KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)
## KURIKULUM MERDEKA

### IDENTITAS KKTP
- **Satuan Pendidikan:** ${satuanPendidikan}
- **Mata Pelajaran:** ${namaMapel}
- **Kelas / Fase:** ${kelasFase}
- **Semester:** ${semester}
- **Tahun Pelajaran:** ${tahunPelajaran}
- **Bab / Materi Pokok:** ${babMateri}

---

### TABEL KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (INTERVAL NILAI)

| No | Bab | Materi Pokok | Deskripsi Tujuan Pembelajaran (TP) | Perlu Bimbingan (0–68) | Cukup (68–78) | Baik (79–89) | Sangat Baik (90–100) |
|---|---|---|---|---|---|---|---|
${rowsMarkdown}

---

### KETERANGAN INTERVAL NILAI & TINDAK LANJUT ASESMEN:
1. **0 – 68 (Perlu Bimbingan):** Belum mencapai ketuntasan minimum. Murid mengikuti remedial intensif dan pendampingan khusus dari guru.
2. **68 – 78 (Cukup):** Telah mencapai ketuntasan dasar. Diberikan latihan penguatan mandiri pada aspek yang belum optimal.
3. **79 – 89 (Baik):** Mencapai ketuntasan dengan baik. Diberikan apresiasi dan diikutsertakan dalam aktivitas variasi lanjutan.
4. **90 – 100 (Sangat Baik):** Melampaui kriteria ketuntasan. Diberikan tantangan pengayaan (*tutor sebaya* atau peran sebagai kapten kelompok).`;
}
