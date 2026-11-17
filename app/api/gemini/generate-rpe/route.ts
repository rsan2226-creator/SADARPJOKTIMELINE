import { NextRequest, NextResponse } from 'next/server';
import { createGeminiClient, DEFAULT_GEMINI_MODEL, classifyGeminiError, logGeminiFallback } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  let namaSekolah = 'SD Negeri Kalimantong';
  let kelas = 'V';
  let jpPerPekan = 4;
  let mataPelajaran = 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)';
  let semester = 'Ganjil';
  let tahunPelajaran = '2026/2027';
  let tanggalDokumen = 'Kalimantong, 13 Juli 2026';
  let kepalaSekolah = 'Ahmad Fauzi, S.Pd., M.Pd.';
  let nipKepalaSekolah = '19780512 200501 1 008';
  let guruMapel = 'Budi Santoso, S.Pd.Jas';
  let nipGuru = '19840315 200902 1 004';
  let catatanKalender = '';

  try {
    const body = await req.json();
    namaSekolah = body.namaSekolah || namaSekolah;
    kelas = body.kelas || kelas;
    jpPerPekan = body.jpPerPekan ?? jpPerPekan;
    mataPelajaran = body.mataPelajaran || mataPelajaran;
    semester = body.semester || semester;
    tahunPelajaran = body.tahunPelajaran || tahunPelajaran;
    tanggalDokumen = body.tanggalDokumen || tanggalDokumen;
    kepalaSekolah = body.kepalaSekolah || kepalaSekolah;
    nipKepalaSekolah = body.nipKepalaSekolah || nipKepalaSekolah;
    guruMapel = body.guruMapel || guruMapel;
    nipGuru = body.nipGuru || nipGuru;
    catatanKalender = body.catatanKalender || '';

    const ai = createGeminiClient();
    if (!ai) {
      const fallback = getFallbackRpe(
        namaSekolah,
        kelas,
        jpPerPekan,
        mataPelajaran,
        semester,
        tahunPelajaran,
        tanggalDokumen,
        kepalaSekolah,
        nipKepalaSekolah,
        guruMapel,
        nipGuru
      );
      return NextResponse.json({
        ...fallback,
        isFallback: true,
        warning: 'GEMINI_API_KEY belum diatur. Dokumen RPE disusun menggunakan Mode Template otomatis.',
      });
    }

    const systemInstruction = `Anda adalah Pakar Administrasi Kurikulum dan Perencanaan Pembelajaran Sekolah Dasar/Menengah di Indonesia.
Tugas Anda adalah menganalisis kalender akademik dan menyusun Dokumen Rincian Pekan Efektif (RPE) resmi yang presisi.
Bulan untuk Semester Ganjil: Juli, Agustus, September, Oktober, November, Desember (total 6 bulan, biasanya 26 pekan).
Bulan untuk Semester Genap: Januari, Februari, Maret, April, Mei, Juni (total 6 bulan, biasanya 26 pekan).
Pekan Tidak Efektif mencakup:
- Libur Semester / Akhir Tahun
- MPLS (Masa Pengenalan Lingkungan Sekolah)
- Asesmen Sumatif Tengah Semester (STS)
- Asesmen Sumatif Akhir Semester (SAS / SAT)
- Pengolahan Nilai & Pembagian Rapor
- Libur Hari Raya Keagamaan / Cuti Bersama
Pastikan jumlah pekan efektif = total pekan - pekan tidak efektif.
Jumlah jam efektif = pekan efektif * JP per pekan.`;

    const userPrompt = `Analisis kalender pendidikan dan susun Rincian Pekan Efektif (RPE) untuk:
Nama Sekolah: ${namaSekolah}
Kelas: ${kelas}
Mata Pelajaran: ${mataPelajaran}
JP Per Pekan: ${jpPerPekan}
Semester: ${semester}
Tahun Pelajaran: ${tahunPelajaran}
Tanggal Dokumen: ${tanggalDokumen}
Nama Kepala Sekolah: ${kepalaSekolah} (NIP: ${nipKepalaSekolah})
Nama Guru: ${guruMapel} (NIP: ${nipGuru})

Informasi Kalender / Catatan Kegiatan Khusus:
${catatanKalender || 'Gunakan kalender pendidikan standar tahun pelajaran 2026/2027 dengan memperhitungkan libur awal semester, MPLS, STS tengah semester, SAS akhir semester, pengolahan rapor, dan libur semester.'}

Berikan output JSON dengan skema berikut:
{
  "totalPekan": number,
  "pekanEfektif": number,
  "pekanTidakEfektif": number,
  "jumlahJamEfektif": number,
  "monthRows": [
    {
      "no": number,
      "bulan": string,
      "jumlahPekan": number,
      "pekanEfektif": number,
      "pekanTidakEfektif": number,
      "keterangan": string
    }
  ],
  "inactiveRows": [
    {
      "no": number,
      "uraianKegiatan": string,
      "jumlahPekan": number,
      "keterangan": string
    }
  ],
  "ringkasanAnalisis": string,
  "formattedMarkdown": string
}`;

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    return NextResponse.json({
      monthRows: parsed.monthRows || [],
      inactiveRows: parsed.inactiveRows || [],
      totalPekan: parsed.totalPekan,
      pekanEfektif: parsed.pekanEfektif,
      pekanTidakEfektif: parsed.pekanTidakEfektif,
      jumlahJamEfektif: parsed.jumlahJamEfektif,
      ringkasanAnalisis: parsed.ringkasanAnalisis || '',
      text: parsed.formattedMarkdown || '',
      isFallback: false,
    });
  } catch (error: unknown) {
    const errInfo = classifyGeminiError(error);
    logGeminiFallback('RPE', errInfo);
    const fallback = getFallbackRpe(
      namaSekolah,
      kelas,
      jpPerPekan,
      mataPelajaran,
      semester,
      tahunPelajaran,
      tanggalDokumen,
      kepalaSekolah,
      nipKepalaSekolah,
      guruMapel,
      nipGuru
    );
    return NextResponse.json({
      ...fallback,
      errorCode: errInfo.code,
      warning: errInfo.userMessage,
      isFallback: true,
    });
  }
}

function getFallbackRpe(
  namaSekolah: string,
  kelas: string,
  jpPerPekan: number,
  mataPelajaran: string,
  semester: string,
  tahunPelajaran: string,
  tanggalDokumen: string,
  kepalaSekolah: string,
  nipKepalaSekolah: string,
  guruMapel: string,
  nipGuru: string
) {
  const isGanjil = semester.toLowerCase().includes('ganjil');

  if (isGanjil) {
    const monthRows = [
      { no: 1, bulan: 'Juli', jumlahPekan: 5, pekanEfektif: 2, pekanTidakEfektif: 3, keterangan: 'Libur Akhir Semester & MPLS' },
      { no: 2, bulan: 'Agustus', jumlahPekan: 4, pekanEfektif: 4, pekanTidakEfektif: 0, keterangan: 'Pembelajaran Efektif (HUT RI)' },
      { no: 3, bulan: 'September', jumlahPekan: 4, pekanEfektif: 3, pekanTidakEfektif: 1, keterangan: 'Asesmen Sumatif Tengah Semester (STS)' },
      { no: 4, bulan: 'Oktober', jumlahPekan: 5, pekanEfektif: 5, pekanTidakEfektif: 0, keterangan: 'Pembelajaran Efektif' },
      { no: 5, bulan: 'November', jumlahPekan: 4, pekanEfektif: 4, pekanTidakEfektif: 0, keterangan: 'Pembelajaran Efektif' },
      { no: 6, bulan: 'Desember', jumlahPekan: 4, pekanEfektif: 0, pekanTidakEfektif: 4, keterangan: 'Asesmen Akhir Semester & Libur Semester' },
    ];

    const inactiveRows = [
      { no: 1, uraianKegiatan: 'Libur Akhir Tahun Pelajaran 2025/2026', jumlahPekan: 2, keterangan: 'Pekan 1-2 Juli 2026' },
      { no: 2, uraianKegiatan: 'Masa Pengenalan Lingkungan Sekolah (MPLS)', jumlahPekan: 1, keterangan: 'Pekan 3 Juli 2026' },
      { no: 3, uraianKegiatan: 'Asesmen Sumatif Tengah Semester (STS) Ganjil', jumlahPekan: 1, keterangan: 'Pekan 4 September 2026' },
      { no: 4, uraianKegiatan: 'Asesmen Sumatif Akhir Semester (SAS) Ganjil', jumlahPekan: 1, keterangan: 'Pekan 2 Desember 2026' },
      { no: 5, uraianKegiatan: 'Pengolahan Nilai & Pembagian Rapor', jumlahPekan: 1, keterangan: 'Pekan 3 Desember 2026' },
      { no: 6, uraianKegiatan: 'Libur Semester Ganjil', jumlahPekan: 2, keterangan: 'Pekan 4-5 Desember 2026' },
    ];

    const totalPekan = 26;
    const tidakEfektif = 8;
    const efektif = 18;
    const totalJp = efektif * jpPerPekan;

    return {
      monthRows,
      inactiveRows,
      totalPekan,
      pekanEfektif: efektif,
      pekanTidakEfektif: tidakEfektif,
      jumlahJamEfektif: totalJp,
      ringkasanAnalisis: 'Pembelajaran semester ganjil memiliki 18 pekan efektif dengan alokasi total 72 JP. Bulan efektif penuh terdapat pada Agustus, Oktober, dan November.',
      text: `# RINCIAN PEKAN EFEKTIF\n## TAHUN PELAJARAN ${tahunPelajaran}`,
    };
  } else {
    const monthRows = [
      { no: 1, bulan: 'Januari', jumlahPekan: 5, pekanEfektif: 4, pekanTidakEfektif: 1, keterangan: 'Libur Awal Tahun / Masuk Genap' },
      { no: 2, bulan: 'Februari', jumlahPekan: 4, pekanEfektif: 4, pekanTidakEfektif: 0, keterangan: 'Pembelajaran Efektif' },
      { no: 3, bulan: 'Maret', jumlahPekan: 4, pekanEfektif: 2, pekanTidakEfektif: 2, keterangan: 'Libur Awal Ramadhan & STS Genap' },
      { no: 4, bulan: 'April', jumlahPekan: 5, pekanEfektif: 3, pekanTidakEfektif: 2, keterangan: 'Libur Hari Raya Idul Fitri' },
      { no: 5, bulan: 'Mei', jumlahPekan: 4, pekanEfektif: 4, pekanTidakEfektif: 0, keterangan: 'Pembelajaran Efektif / Ujian Sekolah' },
      { no: 6, bulan: 'Juni', jumlahPekan: 4, pekanEfektif: 2, pekanTidakEfektif: 2, keterangan: 'SAS Genap & Libur Akhir Semester' },
    ];

    const inactiveRows = [
      { no: 1, uraianKegiatan: 'Libur Awal Semester Genap & Tahun Baru', jumlahPekan: 1, keterangan: 'Pekan 1 Januari 2027' },
      { no: 2, uraianKegiatan: 'Libur Awal Puasa Ramadhan', jumlahPekan: 1, keterangan: 'Pekan 1 Maret 2027' },
      { no: 3, uraianKegiatan: 'Asesmen Sumatif Tengah Semester Genap', jumlahPekan: 1, keterangan: 'Pekan 4 Maret 2027' },
      { no: 4, uraianKegiatan: 'Libur Hari Raya Idul Fitri & Cuti Bersama', jumlahPekan: 2, keterangan: 'Pekan 1-2 April 2027' },
      { no: 5, uraianKegiatan: 'Asesmen Sumatif Akhir Tahun (SAT) & Remedial', jumlahPekan: 1, keterangan: 'Pekan 2 Juni 2027' },
      { no: 6, uraianKegiatan: 'Pembagian Rapor & Libur Kenaikan Kelas', jumlahPekan: 1, keterangan: 'Pekan 4 Juni 2027' },
    ];

    const totalPekan = 26;
    const tidakEfektif = 7;
    const efektif = 19;
    const totalJp = efektif * jpPerPekan;

    return {
      monthRows,
      inactiveRows,
      totalPekan,
      pekanEfektif: efektif,
      pekanTidakEfektif: tidakEfektif,
      jumlahJamEfektif: totalJp,
      ringkasanAnalisis: 'Pembelajaran semester genap memiliki 19 pekan efektif dengan total 76 JP. Terdapat jeda libur Ramadhan dan Idul Fitri pada Maret-April.',
      text: `# RINCIAN PEKAN EFEKTIF\n## TAHUN PELAJARAN ${tahunPelajaran}`,
    };
  }
}
