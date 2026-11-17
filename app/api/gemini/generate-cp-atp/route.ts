import { NextRequest, NextResponse } from 'next/server';
import { createGeminiClient, DEFAULT_GEMINI_MODEL, classifyGeminiError, logGeminiFallback } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  let namaMapel = 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)';
  let kelas = 'Kelas 4';
  let fase = 'Fase B';
  let capaianPembelajaran = '';
  let materiPokok = '';

  try {
    const body = await req.json();
    namaMapel = body.namaMapel || namaMapel;
    kelas = body.kelas || kelas;
    fase = body.fase || fase;
    capaianPembelajaran = body.capaianPembelajaran || '';
    materiPokok = body.materiPokok || '';

    const ai = createGeminiClient();
    if (!ai) {
      return NextResponse.json({
        result: generateFallbackCpAtp(namaMapel, kelas, fase, capaianPembelajaran, materiPokok),
        isFallback: true,
        warning: 'GEMINI_API_KEY belum diatur. Dokumen disusun menggunakan Mode Template otomatis.',
      });
    }

    const systemInstruction = `Anda adalah Pakar Pengembang Kurikulum Merdeka Kemendikbudristek dan Guru Penggerak Ahli Penyusun Perangkat Ajar.
Tugas Anda adalah menyusun dokumen Capaian Pembelajaran (CP) dan Alur Tujuan Pembelajaran (ATP) yang sangat sistematis, terukur, dan pedagogis sesuai instruksi pengguna.
Pastikan:
1. Menulis ulang Capaian Pembelajaran (CP) dengan rapi dalam bentuk poin-poin sesuai elemen sebelum tabel.
2. Menguraikan setiap topik materi menjadi 5 hingga 6 Tujuan Pembelajaran (TP).
3. TP pertama membangun pemahaman dasar murid (C1-C2).
4. TP kedua dan seterusnya menerapkan pembelajaran mendalam (C3).
5. Dua TP terakhir diarahkan pada HOTS (C4 Menganalisis, C5 Mengevaluasi, atau C6 Mencipta).
6. Setiap TP menggunakan formula ABCD (Audience: "Murid dapat...", Behavior: kata kerja operasional terukur, Condition: konteks aktivitas, Degree: tingkat pencapaian).
7. Sajikan dalam format Tabel 5 Kolom:
   - Kolom 1: No & Capaian Pembelajaran (CP) (diulang atau dimerge jika satu CP untuk beberapa TP)
   - Kolom 2: Tujuan Pembelajaran (TP)
   - Kolom 3: Taksonomi SOLO (Unistruktural / Multistruktural / Relasional / Abstrak Diperluas)
   - Kolom 4: Materi Pokok (Bab & Subbab)
   - Kolom 5: Dimensi Profil Lulusan (DPL) (Keimanan dan ketakwaan kepada Tuhan YME, kewargaan, penalaran kritis, kreativitas, kolaborasi, kemandirian, kesehatan, komunikasi)
8. Setelah tabel, tuliskan Alur Tujuan Pembelajaran (ATP) yang merangkum urutan logis pembelajaran dalam fase tersebut.
9. Format output menggunakan Markdown yang sangat terstruktur, rapi, dan mudah disalin ke dokumen Word.`;

    const userPrompt = `Saya adalah seorang guru mata pelajaran ${namaMapel} yang mengajar di kelas ${kelas}, fase ${fase}. Saya sedang menyusun perangkat ajar berdasarkan Capaian Pembelajaran berikut:
${capaianPembelajaran}

Setiap topik materi yang terkandung dalam capaian pembelajaran tersebut akan saya uraikan menjadi 5 hingga 6 Tujuan Pembelajaran (TP). Tujuan pertama dirancang untuk membangun pemahaman dasar murid, sedangkan tujuan kedua dan seterusnya difokuskan pada penerapan pendekatan pembelajaran mendalam. Oleh karena itu, dua tujuan terakhir diarahkan pada proses berpikir tingkat tinggi (HOTS), yaitu pada level menerapkan, menganalisis, mengevaluasi, atau mencipta sesuai taksonomi Bloom revisi.

Sesuaikan materi pembelajaran dengan buku paket yaitu:
${materiPokok}

Tujuan Pembelajaran ditulis menggunakan kalimat operasional (Behavior) yang diawali dengan subjek belajar (Audience) yaitu "Murid dapat...", bersifat terukur, dan disesuaikan dengan perkembangan kognitif Murid di kelas tersebut. Tujuan juga memuat konteks (Condition), dan tingkat pencapaian (Degree).

Setelah tujuan pembelajaran dirumuskan, setiap TP yang dihasilkan ditulis ulang dan diurutkan dalam Alur Tujuan Pembelajaran (ATP) sesuai dengan level berpikir yang akan dituju pada akhir fase.

Tulis ulang capaian pembelajaran dengan rapi dalam bentuk poin sesuai elemen yang ada di bagian paling atas sebelum tabel berikut.

Output yang diharapkan disajikan dalam bentuk tabel lima kolom yang terdiri atas:
1. Capaian Pembelajaran (CP), dituliskan kembali atau tetap jika digunakan untuk beberapa TP. Jika Capaian Pembelajaran dalam bentuk kalimat yang panjang maka pisahkan sesuai dengan materi pokok (Bab)
2. Tujuan Pembelajaran (TP), ditulis secara berurutan sesuai topik materi dan level berpikir
3. Taksonomi SOLO, tuliskan level taksonomi solo sesuai dengan tujuan pembelajaran
4. Materi Pokok, tuliskan materi pokok sesuai tujuan pembelajaran dan materi diatas
5. Dimensi Profil Lulusan (DPL), pilih dimensi yang sesuai dengan tujuan (bisa lebih dari satu setiap tujuan). DPL yaitu keimanan dan ketakwaan kepada Tuhan Yang Maha Esa, kewargaan, penalaran kritis, kreativitas, kolaborasi, kemandirian, kesehatan, atau komunikasi

Tabel diberi nomor urut pada setiap baris, dan untuk topik yang memiliki lebih dari satu tujuan pembelajaran, tetap menggunakan CP yang sama di kolom pertama.

Dengan format ini, saya ingin menghasilkan perangkat ajar yang tidak hanya menekankan penguasaan konsep, tetapi juga mengembangkan kemampuan berpikir kritis, kreatif, dan reflektif Murid melalui pendekatan pembelajaran mendalam.

OUTPUT: BUATKAN OUTPUTNYA DALAM FORMAT DOKUMEN YANG SANGAT RAPI, LENGKAP, DAN SIAP DIJADIKAN FILE WORD.`;

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
        result: generateFallbackCpAtp(namaMapel, kelas, fase, capaianPembelajaran, materiPokok),
        isFallback: true,
        warning: 'Respons AI kosong. Dokumen disusun menggunakan Mode Template otomatis.',
      });
    }

    return NextResponse.json({
      result: outputText,
      isFallback: false,
    });
  } catch (error: unknown) {
    const errInfo = classifyGeminiError(error);
    logGeminiFallback('CP-ATP', errInfo);
    return NextResponse.json({
      result: generateFallbackCpAtp(namaMapel, kelas, fase, capaianPembelajaran, materiPokok),
      isFallback: true,
      errorCode: errInfo.code,
      warning: errInfo.userMessage,
    });
  }
}

function generateFallbackCpAtp(
  namaMapel: string,
  kelas: string,
  fase: string,
  cp: string,
  materi: string
): string {
  const cleanCp = cp.trim() || 'Peserta didik mempraktikkan dan memahami variasi pola gerak dasar serta aktivitas kebugaran jasmani.';
  const cleanMateri = materi.trim() || 'Kebugaran Jasmani & Gerak Dasar';
  const materiLines = cleanMateri
    .split(/\n|;/)
    .map((s) => s.trim())
    .filter(Boolean);
  const topikUtama = materiLines[0] || cleanMateri;
  const topikKedua = materiLines[1] || `${topikUtama} - Penerapan & Latihan`;
  const cpShort = cleanCp.length > 110 ? `${cleanCp.slice(0, 110)}...` : cleanCp;

  return `# DOKUMEN CAPAIAN PEMBELAJARAN (CP) & ALUR TUJUAN PEMBELAJARAN (ATP)
**Mata Pelajaran:** ${namaMapel}  
**Kelas / Fase:** ${kelas} / ${fase}  
**Materi Pokok / Buku:** ${cleanMateri}  

---

### A. CAPAIAN PEMBELAJARAN (CP) PER ELEMEN
1. **Elemen Keterampilan Gerak:**
   - ${cleanCp}
2. **Elemen Pengetahuan Gerak:**
   - Murid memahami prosedur, fakta, konsep, dan prinsip variasi materi ${topikUtama} terkait kesehatan dan keselamatan.
3. **Elemen Pemanfaatan Gerak:**
   - Murid memahami prosedur dan mempraktikkan pengukuran kebugaran serta menjaga pola hidup sehat dan aktif.
4. **Elemen Pengembangan Karakter & Internalisasi Nilai:**
   - Murid menunjukkan perilaku bertanggung jawab, kerja sama, sportivitas, serta keselamatan diri dan orang lain.

---

### B. MATRIKS TUJUAN PEMBELAJARAN (TP) - PENDEKATAN PEMBELAJARAN MENDALAM

| No | Capaian Pembelajaran (CP) | Tujuan Pembelajaran (TP) | Taksonomi SOLO | Materi Pokok | Dimensi Profil Lulusan (DPL) |
|---|---|---|---|---|---|
| 1 | ${cpShort} | Murid dapat mengidentifikasi konsep dasar dan prosedur awal pada materi ${topikUtama} dengan benar melalui pengamatan visual. | Unistruktural | ${topikUtama} (Konsep Dasar) | Penalaran Kritis, Kesehatan |
| 2 | ${cpShort} | Murid dapat menjelaskan langkah-langkah pelaksanaan ${topikUtama} secara sistematis saat berdiskusi kelompok kecil. | Multistruktural | ${topikUtama} (Prosedur Gerak) | Komunikasi, Kolaborasi |
| 3 | ${cpShort} | Murid dapat mempraktikkan variasi dan kombinasi teknik ${topikKedua} dengan koordinasi yang aman dan terkontrol. | Relasional | ${topikKedua} (Praktik Terbimbing) | Kemandirian, Kesehatan |
| 4 | ${cpShort} | Murid dapat menganalisis kesalahan umum dan faktor keberhasilan dalam praktik ${topikUtama} melalui lembar observasi teman sebaya. | Relasional (HOTS) | ${topikUtama} (Analisis Gerak) | Penalaran Kritis, Kolaborasi |
| 5 | ${cpShort} | Murid dapat mengevaluasi tingkat kebugaran, keselamatan diri, dan efektivitas strategi gerak saat aktivitas ${topikKedua}. | Abstrak Diperluas (HOTS) | ${topikKedua} (Evaluasi & Refleksi) | Kemandirian, Penalaran Kritis |
| 6 | ${cpShort} | Murid dapat merancang rangkaian variasi aktivitas atau permainan modifikasi bertema ${topikUtama} secara kreatif bersama kelompoknya. | Abstrak Diperluas (HOTS) | ${topikUtama} (Kreasi Mandiri) | Kreativitas, Kolaborasi, Kesehatan |

---

### C. ALUR TUJUAN PEMBELAJARAN (ATP)
1. **Tahap 1 (Membangun Fondasi Konseptual — C1/C2):** Mengidentifikasi dan menjelaskan konsep dasar serta prosedur keselamatan pada materi **${topikUtama}**.
2. **Tahap 2 (Penerapan Pembelajaran Mendalam — C3):** Mempraktikkan variasi dan kombinasi **${topikKedua}** secara kolaboratif dan bermakna.
3. **Tahap 3 (Berpikir Tingkat Tinggi / HOTS — C4/C5/C6):** Menganalisis kesalahan gerak, mengevaluasi keselamatan & kebugaran, serta merancang aktivitas modifikasi secara mandiri dan kreatif.`;
}
