'use client';

import React, { useState } from 'react';
import { 
  ListChecks, Sparkles, Copy, Check, 
  HelpCircle, Eye, ZoomIn, ZoomOut, RefreshCw, Table, 
  Columns, Layers, Target, BookOpen, AlertCircle, 
  Award, CheckCircle2, ChevronRight, School, User, Calendar, X
} from 'lucide-react';
import { 
  AsesmenSumatifData, 
  DEFAULT_KOMPOSISI_SOAL,
  KomposisiSoalConfig,
  alignAsesmenWithKomposisi,
  computeKomposisiSummary,
  formatPgOpsiLabel,
  getFallbackSoalV2Data,
} from '@/lib/asesmen-sumatif-types';
import { KomposisiSoalEditor } from './KomposisiSoalEditor';
import { DocumentExportToolbar } from './DocumentExportToolbar';
import { escapeHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

export function SoalV2Generator() {
  const [mapel, setMapel] = useState<string>('Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)');
  const [kelas, setKelas] = useState<string>('Kelas V');
  const [fase, setFase] = useState<string>('Fase C');
  const [semester, setSemester] = useState<string>('Ganjil');
  const [jenisAsesmen, setJenisAsesmen] = useState<string>('Asesmen Sumatif Akhir Semester (SAS)');
  const [namaSekolah, setNamaSekolah] = useState<string>('SD NEGERI KALIMANTONG');
  const [tahunPelajaran, setTahunPelajaran] = useState<string>('2026/2027');
  const [alokasiWaktu, setAlokasiWaktu] = useState<string>('90 Menit');
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState<string>(
`1. Mempraktikkan dan menganalisis variasi serta kombinasi pola gerak dasar passing dan shooting dalam permainan sepak bola.
2. Menganalisis dan mempraktikkan variasi gerak passing bawah dan passing atas dalam permainan bola voli.
3. Menerapkan dan mengevaluasi aktivitas latihan peningkatan kebugaran jasmani (daya tahan jantung dan kekuatan otot).
4. Menunjukkan sikap sportivitas, gotong royong, disiplin, dan tanggung jawab selama beraktivitas jasmani.`
  );

  const [instruksiKhusus, setInstruksiKhusus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'soal' | 'kisi-kisi' | 'kunci'>('soal');
  const [layoutMode, setLayoutMode] = useState<'two-col' | 'one-col'>('two-col');
  const [zoomScale, setZoomScale] = useState<number>(0.85);
  const [komposisi, setKomposisi] = useState<KomposisiSoalConfig>({ ...DEFAULT_KOMPOSISI_SOAL });

  const [asesmenData, setAsesmenData] = useState<AsesmenSumatifData>(() =>
    getFallbackSoalV2Data()
  );

  const formSummary = computeKomposisiSummary(komposisi);
  const dataKomposisi: KomposisiSoalConfig = {
    pg: asesmenData.soalPilihanGanda.length,
    pgKompleks: asesmenData.soalPgKompleks.length,
    menjodohkan: asesmenData.soalMenjodohkan.length,
    isianSingkat: asesmenData.soalIsianSingkat.length,
    uraian: asesmenData.soalUraian.length,
    opsiPg: asesmenData.identitas.opsiPg ?? formSummary.opsiPg,
  };
  const dataSummary = computeKomposisiSummary(dataKomposisi);
  const activePgKeys = dataSummary.allowedPgKeys;
  const activePgInstruction = formatPgOpsiLabel(dataSummary.opsiPg);

  const formatRangeLabel = (count: number, start: number, end: number) =>
    count <= 0 ? '' : start === end ? `${start}` : `${start} - ${end}`;

  const handleApplyKomposisiPreview = (next: KomposisiSoalConfig) => {
    const fb = getFallbackSoalV2Data(
      mapel,
      kelas,
      fase,
      jenisAsesmen,
      tujuanPembelajaran,
      next,
      instruksiKhusus
    );
    fb.identitas.namaSekolah = namaSekolah;
    fb.identitas.semester = semester;
    fb.identitas.tahunPelajaran = tahunPelajaran;
    fb.identitas.alokasiWaktu = alokasiWaktu;
    setAsesmenData((prev) => alignAsesmenWithKomposisi(prev, next, fb));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setGenerationNotice(null);
    try {
      const res = await postJsonSafe<{
        data?: AsesmenSumatifData;
        warning?: string;
        isFallback?: boolean;
      }>('/api/gemini/generate-soal-v2', {
        mapel,
        kelas,
        fase,
        semester,
        jenisAsesmen,
        namaSekolah,
        tahunPelajaran,
        alokasiWaktu,
        tujuanPembelajaran,
        komposisi,
        instruksiKhusus,
      });

      if (res.data?.data) {
        setAsesmenData(res.data.data);
        if (res.data.warning) {
          setGenerationNotice(res.data.warning);
        }
      } else {
        const fb = getFallbackSoalV2Data(
          mapel,
          kelas,
          fase,
          jenisAsesmen,
          tujuanPembelajaran,
          komposisi,
          instruksiKhusus
        );
        fb.identitas.namaSekolah = namaSekolah;
        fb.identitas.semester = semester;
        fb.identitas.tahunPelajaran = tahunPelajaran;
        fb.identitas.alokasiWaktu = alokasiWaktu;
        setAsesmenData(fb);
        setGenerationNotice(
          res.error || 'Menggunakan mode penyusun lokal sesuai perintah yang Anda masukkan.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    const promptOpsiLabel = formatPgOpsiLabel(formSummary.opsiPg);
    const komposisiLines = [
      komposisi.pg > 0
        ? `Soal pilihan ganda disusun sebanyak ${komposisi.pg} nomor dengan ${formSummary.opsiPg} pilihan jawaban (${promptOpsiLabel}), tingkat kesulitan bervariasi dari mudah, sedang, hingga sulit.`
        : null,
      komposisi.pgKompleks > 0
        ? `Soal pilihan ganda kompleks disusun sebanyak ${komposisi.pgKompleks} nomor dengan 5 pilihan jawaban, tingkat kesulitan bervariasi dari mudah, sedang, hingga sulit.`
        : null,
      komposisi.menjodohkan > 0
        ? `Soal menjodohkan disusun sebanyak ${komposisi.menjodohkan} nomor, tingkat kesulitan bervariasi dari mudah, sedang, hingga sulit.`
        : null,
      komposisi.isianSingkat > 0
        ? `Soal isian singkat disusun sebanyak ${komposisi.isianSingkat} nomor dengan tingkat kesukaran sedang hingga tinggi, berbentuk aplikasi konsep dalam kehidupan nyata peserta didik.`
        : null,
      komposisi.uraian > 0
        ? `Soal isian uraian disusun sebanyak ${komposisi.uraian} nomor dengan tingkat kesukaran sedang hingga tinggi, berbentuk aplikasi konsep dalam kehidupan nyata peserta didik.`
        : null,
    ]
      .filter(Boolean)
      .join('\n');

    const promptText = `Anda adalah Guru mata pelajaran ${mapel} kelas ${kelas} fase ${fase} yang sedang menyusun soal asesmen. Buatkan asesmen sumatif tengah/akhir semester/harian berdasarkan semua tujuan pembelajaran berikut:
${tujuanPembelajaran}

Asesmen sumatif digunakan untuk mengukur ketercapaian kompetensi peserta didik secara menyeluruh pada akhir periode pembelajaran.
Buatkan juga kisi-kisi asesmen sumatif yang berfungsi untuk memetakan ketercapaian semua tujuan pembelajaran tersebut. Kisi-kisi harus ditampilkan dalam bentuk tabel dengan format berikut:
| No | Tujuan Pembelajaran | Ruang Lingkup Materi | Level Kognitif (Taksonomi Bloom) | Indikator Soal | Bentuk Soal | Nomor Soal | Naskah Soal | Kunci Jawaban | Skor |

Kisi-kisi soal dibuat detail tiap nomor soal (total ${formSummary.totalSoal} nomor soal):
${komposisiLines}${instruksiKhusus.trim() ? `\n\nPerintah / Instruksi Khusus Guru (WAJIB DIPATUHI):\n${instruksiKhusus.trim()}` : ''}
Info Tambahan: Sertakan soal-soal yang memiliki stimulus berupa bacaan singkat yang sesuai dengan pertanyaan dan juga sertakan Soal-soal berbasis gambar (seperti diagram, grafik, peta, atau ilustrasi). Karena Anda berbasis teks gunakan format “[Gambar:”Deskripsikan detail gambar yang harus disiapkan oleh guru”] diatas tekas pertanyaan soal. Jika ada stimulus dalam bentuk tabel munculkan tabelnya secara langsung dengan format yang rapi

Terakhir, tampilkan lembar soal asesmen sumatif yang memuat:
Identitas soal (nama sekolah, mata pelajaran, kelas/semester, tahun pelajaran, waktu, jumlah soal).
Petunjuk pengerjaan.
Soal

TABEL KUNCI JAWABAN DAN PEDOMAN PENSKORAN

Output: Lembar soal asesmen sumatif siap pakai dalam bentuk dokumen word (docx) dengan dua kolom setiap halamannya.`;

    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTextSoal = () => {
    const d = asesmenData;
    let fullText = `=== ${d.identitas.namaSekolah} ===\n`;
    fullText += `${d.identitas.jenisAsesmen}\n`;
    fullText += `Mata Pelajaran: ${d.identitas.mataPelajaran}\n`;
    fullText += `Kelas / Fase: ${d.identitas.kelas} (${d.identitas.fase})\n`;
    fullText += `Semester / TP: ${d.identitas.semester} / ${d.identitas.tahunPelajaran}\n`;
    fullText += `Alokasi Waktu: ${d.identitas.alokasiWaktu} | Jumlah Soal: ${d.identitas.jumlahSoal}\n`;
    if (d.identitas.tujuanPembelajaran) {
      fullText += `Tujuan Pembelajaran yang Diujikan:\n${d.identitas.tujuanPembelajaran}\n`;
    }
    fullText += `\nPETUNJUK UMUM:\n`;
    d.petunjukUmum.forEach((p, i) => {
      fullText += `${i + 1}. ${p}\n`;
    });

    const roman = ['I', 'II', 'III', 'IV', 'V'];
    let bagIndex = 0;
    const nextBag = () => roman[bagIndex++] || String(bagIndex);

    if (d.soalPilihanGanda.length > 0) {
      fullText += `\n## BAGIAN ${nextBag()}: SOAL PILIHAN GANDA (${formatRangeLabel(dataSummary.pg.count, dataSummary.pg.start, dataSummary.pg.end)})\n`;
      d.soalPilihanGanda.forEach((pg) => {
        if (pg.stimulus) fullText += `\n[Stimulus: ${pg.stimulus}]\n`;
        if (pg.deskripsiGambar) fullText += `[Gambar: "${pg.deskripsiGambar}"]\n`;
        fullText += `${pg.nomor}. ${pg.pertanyaan}\n`;
        activePgKeys.forEach((key) => {
          if (pg.pilihan[key] !== undefined) {
            fullText += `   ${key}. ${pg.pilihan[key]}\n`;
          }
        });
      });
    }

    if (d.soalPgKompleks.length > 0) {
      fullText += `\n## BAGIAN ${nextBag()}: SOAL PILIHAN GANDA KOMPLEKS (${formatRangeLabel(dataSummary.pgKompleks.count, dataSummary.pgKompleks.start, dataSummary.pgKompleks.end)})\n`;
      d.soalPgKompleks.forEach((pgk) => {
        if (pgk.stimulus) fullText += `\n[Stimulus: ${pgk.stimulus}]\n`;
        fullText += `${pgk.nomor}. ${pgk.pertanyaan}\n`;
        pgk.pilihan.forEach((pil) => {
          fullText += `   [ ] ${pil.kode}. ${pil.teks}\n`;
        });
      });
    }

    if (d.soalMenjodohkan.length > 0) {
      fullText += `\n## BAGIAN ${nextBag()}: SOAL MENJODOHKAN (${formatRangeLabel(dataSummary.menjodohkan.count, dataSummary.menjodohkan.start, dataSummary.menjodohkan.end)})\n`;
      d.soalMenjodohkan.forEach((m) => {
        fullText += `${m.nomor}. ${m.premisKiri} ➡ [ ... ]\n`;
      });
    }

    if (d.soalIsianSingkat.length > 0) {
      fullText += `\n## BAGIAN ${nextBag()}: SOAL ISIAN SINGKAT (${formatRangeLabel(dataSummary.isianSingkat.count, dataSummary.isianSingkat.start, dataSummary.isianSingkat.end)})\n`;
      d.soalIsianSingkat.forEach((is) => {
        if (is.stimulus) fullText += `\n[Stimulus: ${is.stimulus}]\n`;
        fullText += `${is.nomor}. ${is.pertanyaan} (...................)\n`;
      });
    }

    if (d.soalUraian.length > 0) {
      fullText += `\n## BAGIAN ${nextBag()}: SOAL URAIAN (${formatRangeLabel(dataSummary.uraian.count, dataSummary.uraian.start, dataSummary.uraian.end)})\n`;
      d.soalUraian.forEach((u) => {
        if (u.stimulus) fullText += `\n[Stimulus: ${u.stimulus}]\n`;
        if (u.deskripsiGambar) fullText += `[Gambar: "${u.deskripsiGambar}"]\n`;
        fullText += `${u.nomor}. ${u.pertanyaan}\n`;
      });
    }

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildExportHtml = () => {
    const d = asesmenData;
    const title = `${d.identitas.jenisAsesmen}_Soal_v2_${d.identitas.mataPelajaran}_${d.identitas.kelas}`.replace(/\s+/g, '_');

    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${escapeHtml(title)}</title>
        <style>
          @page { size: A4 portrait; margin: 1.5cm; }
          body { font-family: 'Calibri', 'Times New Roman', Arial, sans-serif; color: #000; line-height: 1.25; font-size: 10pt; }
          .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 5px; margin-bottom: 12px; }
          .kop h2 { margin: 0; font-size: 13pt; text-transform: uppercase; font-weight: bold; }
          .kop h3 { margin: 2px 0; font-size: 11pt; font-weight: bold; }
          .identity-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 9.5pt; }
          .identity-table td { padding: 3px 5px; border: none; }
          .section-title { font-size: 10.5pt; font-weight: bold; margin-top: 14px; margin-bottom: 6px; border-bottom: 1px solid #000; padding-bottom: 2px; }
          
          /* TWO COLUMN LAYOUT FOR WORD */
          .two-column {
            column-count: 2;
            column-gap: 1.5cm;
            column-rule: 1px solid #ccc;
          }
          
          .question-item { margin-bottom: 8px; break-inside: avoid; }
          .stimulus-box { background-color: #f8fafc; border: 1px dashed #94a3b8; padding: 6px; font-style: italic; font-size: 9pt; margin-bottom: 4px; }
          .tp-box { background-color: #f1f5f9; border-left: 3px solid #2563eb; padding: 6px 10px; margin-bottom: 8px; font-size: 9pt; }
          .table-bordered { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 8px; }
          .table-bordered thead { display: table-header-group; }
          .table-bordered tr { page-break-inside: avoid; break-inside: avoid; }
          .table-bordered th, .table-bordered td { border: 1px solid #000; padding: 4px 6px; vertical-align: top; }
          .table-bordered th { background-color: #f1f5f9; text-align: center; font-weight: bold; }
          .table-bordered tbody tr:nth-child(even) { background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <!-- KOP UJIAN -->
        <div class="kop">
          <h2>DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
          <h2>${escapeHtml(d.identitas.namaSekolah)}</h2>
          <h3>${escapeHtml(d.identitas.jenisAsesmen)} (BERBASIS TUJUAN PEMBELAJARAN) - TAHUN PELAJARAN ${escapeHtml(d.identitas.tahunPelajaran)}</h3>
        </div>

        <!-- IDENTITAS UJIAN -->
        <table class="identity-table">
          <tr>
            <td width="18%"><strong>Mata Pelajaran</strong></td>
            <td width="35%">: ${escapeHtml(d.identitas.mataPelajaran)}</td>
            <td width="18%"><strong>Hari / Tanggal</strong></td>
            <td width="29%">: .......................................</td>
          </tr>
          <tr>
            <td><strong>Kelas / Fase</strong></td>
            <td>: ${escapeHtml(d.identitas.kelas)} (${escapeHtml(d.identitas.fase)})</td>
            <td><strong>Waktu</strong></td>
            <td>: ${escapeHtml(d.identitas.alokasiWaktu)}</td>
          </tr>
          <tr>
            <td><strong>Semester</strong></td>
            <td>: ${escapeHtml(d.identitas.semester)}</td>
            <td><strong>Nama Peserta</strong></td>
            <td>: .......................................</td>
          </tr>
        </table>

        ${d.identitas.tujuanPembelajaran ? `
        <div class="tp-box">
          <strong>Tujuan Pembelajaran yang Diujikan:</strong><br/>
          ${escapeHtml(d.identitas.tujuanPembelajaran).replace(/\n/g, '<br/>')}
        </div>
        ` : ''}

        <div style="font-size: 8.5pt; background-color: #f1f5f9; padding: 6px; margin-bottom: 10px; border: 1px solid #cbd5e1;">
          <strong>PETUNJUK UMUM:</strong>
          <ol style="margin: 2px 0 0 16px; padding: 0;">
            ${d.petunjukUmum.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
          </ol>
        </div>

        <!-- DUA KOLOM NASKAH SOAL -->
        <div class="two-column">
          ${d.soalPilihanGanda.length > 0 ? `
          <div class="section-title">SOAL PILIHAN GANDA (${formatRangeLabel(dataSummary.pg.count, dataSummary.pg.start, dataSummary.pg.end)})</div>
          <p style="font-size: 8.5pt; font-style: italic; margin-bottom: 6px;">Petunjuk: Berilah tanda silang (X) pada salah satu huruf ${escapeHtml(activePgInstruction)} yang merupakan jawaban paling tepat!</p>

          ${d.soalPilihanGanda
            .map(
              (pg) => `
            <div class="question-item">
              ${pg.stimulus ? `<div class="stimulus-box">${escapeHtml(pg.stimulus)}</div>` : ''}
              ${pg.deskripsiGambar ? `<div class="stimulus-box"><strong>[Gambar: "${escapeHtml(pg.deskripsiGambar)}"]</strong></div>` : ''}
              ${
                pg.tabelStimulus
                  ? `
                <table class="table-bordered" style="margin-bottom: 4px;">
                  <thead>
                    <tr>${pg.tabelStimulus.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>
                  </thead>
                  <tbody>
                    ${pg.tabelStimulus.rows.map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}
                  </tbody>
                </table>
              `
                  : ''
              }
              <div><strong>${pg.nomor}.</strong> ${escapeHtml(pg.pertanyaan)}</div>
              <div style="margin-left: 14px; margin-top: 3px;">
                ${activePgKeys
                  .filter((key) => pg.pilihan[key] !== undefined)
                  .map((key) => `<div>${key}. ${escapeHtml(pg.pilihan[key] || '')}</div>`)
                  .join('')}
              </div>
            </div>
          `
            )
            .join('')}
          ` : ''}

          ${d.soalPgKompleks.length > 0 ? `
          <div class="section-title">PILIHAN GANDA KOMPLEKS (${formatRangeLabel(dataSummary.pgKompleks.count, dataSummary.pgKompleks.start, dataSummary.pgKompleks.end)})</div>
          <p style="font-size: 8.5pt; font-style: italic; margin-bottom: 6px;">Petunjuk: Pilihlah lebih dari satu jawaban yang benar dengan memberikan tanda centang (✓) pada kotak di depan pernyataan!</p>

          ${d.soalPgKompleks
            .map(
              (pgk) => `
            <div class="question-item">
              ${pgk.stimulus ? `<div class="stimulus-box">${escapeHtml(pgk.stimulus)}</div>` : ''}
              ${pgk.deskripsiGambar ? `<div class="stimulus-box"><strong>[Gambar: "${escapeHtml(pgk.deskripsiGambar)}"]</strong></div>` : ''}
              <div><strong>${pgk.nomor}.</strong> ${escapeHtml(pgk.pertanyaan)}</div>
              <div style="margin-left: 14px; margin-top: 3px;">
                ${pgk.pilihan.map((pil) => `<div>[ &nbsp; ] <strong>${escapeHtml(pil.kode)}.</strong> ${escapeHtml(pil.teks)}</div>`).join('')}
              </div>
            </div>
          `
            )
            .join('')}
          ` : ''}

          ${d.soalMenjodohkan.length > 0 ? `
          <div class="section-title">SOAL MENJODOHKAN (${formatRangeLabel(dataSummary.menjodohkan.count, dataSummary.menjodohkan.start, dataSummary.menjodohkan.end)})</div>
          <p style="font-size: 8.5pt; font-style: italic; margin-bottom: 6px;">Petunjuk: Pasangkan pernyataan atau konsep pada kolom kiri dengan pilihan respons yang tepat pada kolom kanan!</p>

          <table class="table-bordered" style="margin-bottom: 8px;">
            <thead>
              <tr>
                <th width="8%">No</th>
                <th width="46%">Pernyataan / Premis Kiri</th>
                <th width="46%">Pasangan / Pilihan Jawaban Kanan</th>
              </tr>
            </thead>
            <tbody>
              ${d.soalMenjodohkan
                .map(
                  (m) => `
                <tr>
                  <td style="text-align: center;">${m.nomor}</td>
                  <td>${escapeHtml(m.premisKiri)}</td>
                  <td>${escapeHtml(m.responsKanan)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          ` : ''}

          ${d.soalIsianSingkat.length > 0 ? `
          <div class="section-title">SOAL ISIAN SINGKAT (${formatRangeLabel(dataSummary.isianSingkat.count, dataSummary.isianSingkat.start, dataSummary.isianSingkat.end)})</div>
          <p style="font-size: 8.5pt; font-style: italic; margin-bottom: 6px;">Petunjuk: Jawablah pertanyaan berikut dengan singkat, tepat, dan benar!</p>

          ${d.soalIsianSingkat
            .map(
              (is) => `
            <div class="question-item">
              ${is.stimulus ? `<div class="stimulus-box">${escapeHtml(is.stimulus)}</div>` : ''}
              ${is.deskripsiGambar ? `<div class="stimulus-box"><strong>[Gambar: "${escapeHtml(is.deskripsiGambar)}"]</strong></div>` : ''}
              <div><strong>${is.nomor}.</strong> ${escapeHtml(is.pertanyaan)}</div>
              <div style="margin-left: 14px; margin-top: 3px; border-bottom: 1px dotted #666; width: 60%; height: 16px;"></div>
            </div>
          `
            )
            .join('')}
          ` : ''}

          ${d.soalUraian.length > 0 ? `
          <div class="section-title">SOAL URAIAN (${formatRangeLabel(dataSummary.uraian.count, dataSummary.uraian.start, dataSummary.uraian.end)})</div>
          <p style="font-size: 8.5pt; font-style: italic; margin-bottom: 6px;">Petunjuk: Jawablah pertanyaan berikut dengan analisis uraian yang lengkap dan jelas!</p>

          ${d.soalUraian
            .map(
              (u) => `
            <div class="question-item">
              ${u.stimulus ? `<div class="stimulus-box">${escapeHtml(u.stimulus)}</div>` : ''}
              ${u.deskripsiGambar ? `<div class="stimulus-box"><strong>[Gambar: "${escapeHtml(u.deskripsiGambar)}"]</strong></div>` : ''}
              <div><strong>${u.nomor}.</strong> ${escapeHtml(u.pertanyaan)}</div>
              <div style="margin-left: 14px; margin-top: 4px; border-bottom: 1px dotted #999; height: 40px;"></div>
            </div>
          `
            )
            .join('')}
          ` : ''}
        </div>

        <br style="page-break-before: always;" />

        <!-- KISI KISI & KUNCI JAWABAN -->
        <h3 style="text-align: center; margin-top: 20px;">TABEL KISI-KISI ASESMEN SUMATIF (10 KOLOM)</h3>
        <table class="table-bordered">
          <thead>
            <tr>
              <th>No</th>
              <th>Tujuan Pembelajaran</th>
              <th>Ruang Lingkup Materi</th>
              <th>Level Kognitif</th>
              <th>Indikator Soal</th>
              <th>Bentuk Soal</th>
              <th>No Soal</th>
              <th>Naskah Soal</th>
              <th>Kunci Jawaban</th>
              <th>Skor</th>
            </tr>
          </thead>
          <tbody>
            ${d.kisiKisiTabel
              .map(
                (k) => `
              <tr>
                <td style="text-align: center;">${k.no}</td>
                <td>${escapeHtml(k.tujuanPembelajaran)}</td>
                <td>${escapeHtml(k.ruangLingkupMateri)}</td>
                <td style="text-align: center;">${escapeHtml(k.levelKognitif)}</td>
                <td>${escapeHtml(k.indikatorSoal)}</td>
                <td style="text-align: center;">${escapeHtml(k.bentukSoal)}</td>
                <td style="text-align: center;"><strong>${escapeHtml(String(k.nomorSoal))}</strong></td>
                <td>${escapeHtml(k.naskahSoal || '')}</td>
                <td>${escapeHtml(k.kunciJawaban)}</td>
                <td style="text-align: center;">${k.skor}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <br style="page-break-before: always;" />

        <h3 style="text-align: center; margin-top: 20px;">TABEL PEDOMAN PENSKORAN & NILAI AKHIR</h3>
        <table class="table-bordered" style="width: 75%; margin: 0 auto;">
          <thead>
            <tr>
              <th>Bentuk Soal</th>
              <th>Jumlah Nomor</th>
              <th>Skor per Nomor</th>
              <th>Skor Maksimal</th>
            </tr>
          </thead>
          <tbody>
            ${d.soalPilihanGanda.length > 0 ? `
            <tr>
              <td>Pilihan Ganda (${formatRangeLabel(dataSummary.pg.count, dataSummary.pg.start, dataSummary.pg.end)})</td>
              <td align="center">${dataSummary.pg.count}</td>
              <td align="center">1</td>
              <td align="center">${d.pedomanPenskoran.skorMaksimalPg}</td>
            </tr>` : ''}
            ${d.soalPgKompleks.length > 0 ? `
            <tr>
              <td>Pilihan Ganda Kompleks (${formatRangeLabel(dataSummary.pgKompleks.count, dataSummary.pgKompleks.start, dataSummary.pgKompleks.end)})</td>
              <td align="center">${dataSummary.pgKompleks.count}</td>
              <td align="center">2</td>
              <td align="center">${d.pedomanPenskoran.skorMaksimalPgKompleks}</td>
            </tr>` : ''}
            ${d.soalMenjodohkan.length > 0 ? `
            <tr>
              <td>Menjodohkan (${formatRangeLabel(dataSummary.menjodohkan.count, dataSummary.menjodohkan.start, dataSummary.menjodohkan.end)})</td>
              <td align="center">${dataSummary.menjodohkan.count}</td>
              <td align="center">1</td>
              <td align="center">${d.pedomanPenskoran.skorMaksimalMenjodohkan}</td>
            </tr>` : ''}
            ${d.soalIsianSingkat.length > 0 ? `
            <tr>
              <td>Isian Singkat (${formatRangeLabel(dataSummary.isianSingkat.count, dataSummary.isianSingkat.start, dataSummary.isianSingkat.end)})</td>
              <td align="center">${dataSummary.isianSingkat.count}</td>
              <td align="center">2</td>
              <td align="center">${d.pedomanPenskoran.skorMaksimalIsian}</td>
            </tr>` : ''}
            ${d.soalUraian.length > 0 ? `
            <tr>
              <td>Uraian / Essay (${formatRangeLabel(dataSummary.uraian.count, dataSummary.uraian.start, dataSummary.uraian.end)})</td>
              <td align="center">${dataSummary.uraian.count}</td>
              <td align="center">5</td>
              <td align="center">${d.pedomanPenskoran.skorMaksimalUraian}</td>
            </tr>` : ''}
            <tr style="background-color: #e2e8f0; font-weight: bold;">
              <td colspan="3" align="right">TOTAL SKOR MAKSIMAL:</td>
              <td align="center">${d.pedomanPenskoran.totalSkorMaksimal}</td>
            </tr>
          </tbody>
        </table>

        <div style="width: 75%; margin: 15px auto 0 auto; padding: 10px; background-color: #f8fafc; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 10.5pt;">
          Rumus Penilaian Akhir: Nilai = (Total Skor Perolehan / ${d.pedomanPenskoran.totalSkorMaksimal}) × 100
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 md:p-8 border border-blue-700/50 shadow-2xl text-white">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <ListChecks className="w-3.5 h-3.5 text-blue-400" />
              Generator Soal Versi 2 (Berbasis Tujuan Pembelajaran)
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Penyusun Asesmen Sumatif ({formSummary.totalSoal} Butir Soal & Kisi-Kisi 10 Kolom)
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Menghasilkan naskah asesmen sumatif resmi (STS, SAS, PAS, atau Harian) dengan komposisi jumlah soal yang dapat diedit dan dipetakan secara terstruktur dari 
              <strong> Tujuan Pembelajaran (TP) yang Diujikan</strong>. Dilengkapi kisi-kisi lengkap 10 kolom, stimulus bacaan, tag ilustrasi guru, 
              serta output siap unduh dalam format dokumen Word <strong>dua kolom (two-column)</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyPrompt}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-600 transition shadow-sm cursor-pointer"
              title="Salin Prompt Guru Asesmen v2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
              {copied ? 'Tersalin!' : 'Salin Prompt AI'}
            </button>
            <DocumentExportToolbar
              filename={`Soal_v2_${asesmenData.identitas.mataPelajaran}_${asesmenData.identitas.kelas}`.replace(/\s+/g, '_')}
              title={`${asesmenData.identitas.jenisAsesmen} - ${asesmenData.identitas.mataPelajaran}`}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
            />
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Grid Konfigurasi & Input */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4 bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Konfigurasi Asesmen & TP
            </h2>
            <span className="text-xs text-slate-400">Kurikulum Merdeka</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mata Pelajaran</label>
              <input
                type="text"
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="Contoh: PJOK"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nama Satuan Pendidikan</label>
              <input
                type="text"
                value={namaSekolah}
                onChange={(e) => setNamaSekolah(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="SD NEGERI KALIMANTONG"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Kelas</label>
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {['Kelas I', 'Kelas II', 'Kelas III', 'Kelas IV', 'Kelas V', 'Kelas VI', 'Kelas VII', 'Kelas VIII', 'Kelas IX', 'Kelas X', 'Kelas XI', 'Kelas XII'].map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Fase</label>
              <select
                value={fase}
                onChange={(e) => setFase(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {['Fase A (Kelas 1-2)', 'Fase B (Kelas 3-4)', 'Fase C (Kelas 5-6)', 'Fase D (Kelas 7-9)', 'Fase E (Kelas 10)', 'Fase F (Kelas 11-12)'].map((f) => (
                  <option key={f} value={f.split(' ')[0] + ' ' + f.split(' ')[1]}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Ganjil">Ganjil (1)</option>
                <option value="Genap">Genap (2)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Jenis Asesmen</label>
              <select
                value={jenisAsesmen}
                onChange={(e) => setJenisAsesmen(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Asesmen Sumatif Akhir Semester (SAS)">Sumatif Akhir Semester (SAS / PAS)</option>
                <option value="Asesmen Sumatif Tengah Semester (STS)">Sumatif Tengah Semester (STS)</option>
                <option value="Asesmen Sumatif Harian / Lingkup Materi">Asesmen Sumatif Harian / TP</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tahun Pelajaran</label>
              <input
                type="text"
                value={tahunPelajaran}
                onChange={(e) => setTahunPelajaran(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Alokasi Waktu</label>
              <input
                type="text"
                value={alokasiWaktu}
                onChange={(e) => setAlokasiWaktu(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Fokus Utama Versi 2: TUJUAN PEMBELAJARAN YANG DIUJIKAN */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Tujuan Pembelajaran yang Diujikan (Wajib Diisi):
              </label>
              <span className="text-[11px] text-slate-400">1 baris per TP atau format penomoran</span>
            </div>
            <textarea
              rows={6}
              value={tujuanPembelajaran}
              onChange={(e) => setTujuanPembelajaran(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800/95 border border-amber-500/40 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-500 leading-relaxed font-mono"
              placeholder="Masukkan tujuan pembelajaran yang diujikan..."
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Setiap butir soal pada naskah dan baris tabel kisi-kisi (10 kolom) akan dipetakan langsung ke Tujuan Pembelajaran di atas.
            </p>
          </div>

          {/* Perintah / Instruksi Khusus */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Perintah / Instruksi Khusus Penyusunan Soal (Opsional):
              </label>
              <span className="text-[11px] text-slate-400">Level Bloom, fokus materi, atau batasan</span>
            </div>
            <textarea
              rows={2}
              value={instruksiKhusus}
              onChange={(e) => setInstruksiKhusus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/95 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-500 leading-relaxed"
              placeholder="Contoh: Fokuskan soal HOTS (C4–C5), sertakan soal cerita/ilustrasi, hindari topik di luar TP di atas."
            />
          </div>

          {/* Editor Komposisi Soal Asesmen */}
          <KomposisiSoalEditor
            value={komposisi}
            onChange={setKomposisi}
            onApplyPreview={handleApplyKomposisiPreview}
            accent="blue"
          />

          <button
            onClick={handleGenerate}
            disabled={isLoading || !tujuanPembelajaran.trim()}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Menyusun {formSummary.totalSoal} Soal & Kisi-Kisi TP...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Soal Berbasis TP ({formSummary.totalSoal} Nomor)
              </>
            )}
          </button>
        </div>

        {/* Preview & Hasil (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('soal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'soal'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                Naskah Ujian (Word 2 Kolom)
              </button>
              <button
                onClick={() => setActiveTab('kisi-kisi')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'kisi-kisi'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                Kisi-Kisi 10 Kolom ({asesmenData.kisiKisiTabel.length})
              </button>
              <button
                onClick={() => setActiveTab('kunci')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'kunci'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Kunci & Penskoran
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {activeTab === 'soal' && (
                <button
                  onClick={() => setLayoutMode(layoutMode === 'two-col' ? 'one-col' : 'two-col')}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                  title="Ganti tampilan 1 atau 2 kolom"
                >
                  {layoutMode === 'two-col' ? 'Mode: 2 Kolom' : 'Mode: 1 Kolom'}
                </button>
              )}
              <button
                onClick={handleCopyTextSoal}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Salin Naskah Teks"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {generationNotice && (
            <div className="flex items-start justify-between gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl px-3.5 py-2.5 text-xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{generationNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setGenerationNotice(null)}
                className="text-amber-300 hover:text-white p-0.5 rounded cursor-pointer"
                title="Tutup pemberitahuan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: LEMBAR SOAL DUA KOLOM */}
          {activeTab === 'soal' && (
            <div className="bg-white text-slate-900 rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-200 overflow-y-auto max-h-[750px] font-serif leading-relaxed text-sm">
              {/* Kop Ujian Resmi */}
              <div className="text-center border-b-2 border-double border-slate-900 pb-3 mb-4">
                <h2 className="text-base md:text-lg font-bold tracking-wide uppercase">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </h2>
                <h3 className="text-lg md:text-xl font-black uppercase text-blue-900">
                  {asesmenData.identitas.namaSekolah}
                </h3>
                <p className="text-xs font-semibold tracking-wider uppercase text-slate-700 mt-1">
                  {asesmenData.identitas.jenisAsesmen} (BERBASIS TUJUAN PEMBELAJARAN) - TAHUN PELAJARAN {asesmenData.identitas.tahunPelajaran}
                </p>
              </div>

              {/* Tabel Identitas Peserta & Soal */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs pb-3 border-b border-slate-300 mb-4 font-sans">
                <div className="flex gap-2">
                  <span className="w-28 font-bold text-slate-600">Mata Pelajaran:</span>
                  <span className="font-semibold text-slate-900">{asesmenData.identitas.mataPelajaran}</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-24 font-bold text-slate-600">Hari / Tanggal:</span>
                  <span className="text-slate-500">...................................................</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-28 font-bold text-slate-600">Kelas / Fase:</span>
                  <span className="font-semibold text-slate-900">{asesmenData.identitas.kelas} ({asesmenData.identitas.fase})</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-24 font-bold text-slate-600">Alokasi Waktu:</span>
                  <span className="font-semibold text-slate-900">{asesmenData.identitas.alokasiWaktu}</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-28 font-bold text-slate-600">Semester:</span>
                  <span className="font-semibold text-slate-900">{asesmenData.identitas.semester}</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-24 font-bold text-slate-600">Nama Peserta:</span>
                  <span className="text-slate-500">...................................................</span>
                </div>
              </div>

              {/* Rincian TP yang Diujikan Box */}
              {asesmenData.identitas.tujuanPembelajaran && (
                <div className="p-3 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg text-xs font-sans mb-4 space-y-1">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-600" />
                    Tujuan Pembelajaran (TP) yang Diujikan:
                  </div>
                  <div className="text-slate-700 whitespace-pre-line pl-1 leading-relaxed">
                    {asesmenData.identitas.tujuanPembelajaran}
                  </div>
                </div>
              )}

              {/* Petunjuk Umum */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans mb-5">
                <div className="font-bold text-slate-800 mb-1">PETUNJUK UMUM:</div>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                  {asesmenData.petunjukUmum.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ol>
              </div>

              {/* Naskah Soal Kontainer (2 Kolom Word) */}
              <div className={layoutMode === 'two-col' ? 'columns-1 md:columns-2 gap-8 text-[13px]' : 'space-y-4 text-[13px]'}>
                {/* Bagian I: PG */}
                {asesmenData.soalPilihanGanda.length > 0 && (
                <div className="break-inside-avoid-column mb-6">
                  <div className="bg-slate-100 font-bold font-sans text-xs uppercase px-2 py-1 rounded border border-slate-300 text-slate-800 mb-3">
                    Pilihan Ganda (Nomor {formatRangeLabel(dataSummary.pg.count, dataSummary.pg.start, dataSummary.pg.end)})
                  </div>
                  <p className="text-[11px] italic text-slate-500 mb-3 font-sans">
                    Berilah tanda silang (X) pada salah satu huruf {activePgInstruction} untuk jawaban yang paling tepat!
                  </p>
                  <div className="space-y-4">
                    {asesmenData.soalPilihanGanda.map((pg) => (
                      <div key={pg.nomor} className="break-inside-avoid mb-4">
                        {pg.stimulus && (
                          <div className="p-2 mb-1.5 bg-slate-50 border-l-2 border-slate-400 italic text-[12px] text-slate-700">
                            {pg.stimulus}
                          </div>
                        )}
                        {pg.deskripsiGambar && (
                          <div className="p-2 mb-1.5 bg-amber-50 border border-amber-300 rounded text-[11px] font-sans text-amber-900 font-semibold">
                            [Gambar: &ldquo;{pg.deskripsiGambar}&rdquo;]
                          </div>
                        )}
                        {pg.tabelStimulus && (
                          <div className="overflow-x-auto mb-2">
                            <table className="w-full text-[11px] border-collapse border border-slate-400 text-center font-sans">
                              <thead>
                                <tr className="bg-slate-100">
                                  {pg.tabelStimulus.headers.map((h, i) => (
                                    <th key={i} className="border border-slate-400 px-1 py-0.5">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {pg.tabelStimulus.rows.map((row, ri) => (
                                  <tr key={ri}>
                                    {row.map((cell, ci) => (
                                      <td key={ci} className="border border-slate-400 px-1 py-0.5">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        <div className="font-semibold flex items-start gap-1">
                          <span>{pg.nomor}.</span>
                          <span>{pg.pertanyaan}</span>
                        </div>
                        <div className="ml-4 mt-1 space-y-0.5 font-sans text-xs">
                          {activePgKeys.map((key) =>
                            pg.pilihan[key] !== undefined ? (
                              <div key={key}>{key}. {pg.pilihan[key]}</div>
                            ) : null
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {/* Bagian II: PG Kompleks */}
                {asesmenData.soalPgKompleks.length > 0 && (
                <div className="break-inside-avoid-column mb-6">
                  <div className="bg-slate-100 font-bold font-sans text-xs uppercase px-2 py-1 rounded border border-slate-300 text-slate-800 mb-3">
                    Pilihan Ganda Kompleks (Nomor {formatRangeLabel(dataSummary.pgKompleks.count, dataSummary.pgKompleks.start, dataSummary.pgKompleks.end)})
                  </div>
                  <p className="text-[11px] italic text-slate-500 mb-3 font-sans">
                    Pilihlah lebih dari satu jawaban yang benar dengan memberikan tanda centang (✓) pada kotak di depan pilihan!
                  </p>
                  <div className="space-y-4">
                    {asesmenData.soalPgKompleks.map((pgk) => (
                      <div key={pgk.nomor} className="break-inside-avoid mb-4">
                        {pgk.stimulus && (
                          <div className="p-2 mb-1.5 bg-slate-50 border-l-2 border-slate-400 italic text-[12px] text-slate-700">
                            {pgk.stimulus}
                          </div>
                        )}
                        {pgk.deskripsiGambar && (
                          <div className="p-2 mb-1.5 bg-amber-50 border border-amber-300 rounded text-[11px] font-sans text-amber-900 font-semibold">
                            [Gambar: &ldquo;{pgk.deskripsiGambar}&rdquo;]
                          </div>
                        )}
                        <div className="font-semibold flex items-start gap-1">
                          <span>{pgk.nomor}.</span>
                          <span>{pgk.pertanyaan}</span>
                        </div>
                        <div className="ml-4 mt-1.5 space-y-1 font-sans text-xs">
                          {pgk.pilihan.map((pil) => (
                            <div key={pil.kode} className="flex items-center gap-2">
                              <span className="w-3.5 h-3.5 border border-slate-400 rounded-sm inline-block" />
                              <span><strong>{pil.kode}.</strong> {pil.teks}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {/* Bagian III: Menjodohkan */}
                {asesmenData.soalMenjodohkan.length > 0 && (
                <div className="break-inside-avoid-column mb-6">
                  <div className="bg-slate-100 font-bold font-sans text-xs uppercase px-2 py-1 rounded border border-slate-300 text-slate-800 mb-3">
                    Menjodohkan (Nomor {formatRangeLabel(dataSummary.menjodohkan.count, dataSummary.menjodohkan.start, dataSummary.menjodohkan.end)})
                  </div>
                  <p className="text-[11px] italic text-slate-500 mb-3 font-sans">
                    Pasangkan pernyataan di kolom kiri dengan pilihan respons yang tepat di kolom kanan!
                  </p>
                  <table className="w-full text-xs font-sans border-collapse border border-slate-400 mb-3">
                    <thead>
                      <tr className="bg-slate-100 text-center">
                        <th className="border border-slate-400 p-1 w-8">No</th>
                        <th className="border border-slate-400 p-1">Pernyataan (Kiri)</th>
                        <th className="border border-slate-400 p-1">Pilihan Pasangan (Kanan)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asesmenData.soalMenjodohkan.map((m) => (
                        <tr key={m.nomor}>
                          <td className="border border-slate-400 p-1 text-center font-bold">{m.nomor}</td>
                          <td className="border border-slate-400 p-1.5">{m.premisKiri}</td>
                          <td className="border border-slate-400 p-1.5">{m.responsKanan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}

                {/* Bagian IV: Isian Singkat */}
                {asesmenData.soalIsianSingkat.length > 0 && (
                <div className="break-inside-avoid-column mb-6">
                  <div className="bg-slate-100 font-bold font-sans text-xs uppercase px-2 py-1 rounded border border-slate-300 text-slate-800 mb-3">
                    Isian Singkat (Nomor {formatRangeLabel(dataSummary.isianSingkat.count, dataSummary.isianSingkat.start, dataSummary.isianSingkat.end)})
                  </div>
                  <p className="text-[11px] italic text-slate-500 mb-3 font-sans">
                    Isilah titik-titik berikut dengan jawaban yang singkat, tepat, dan aplikatif!
                  </p>
                  <div className="space-y-3.5">
                    {asesmenData.soalIsianSingkat.map((is) => (
                      <div key={is.nomor} className="break-inside-avoid">
                        {is.stimulus && (
                          <div className="p-2 mb-1.5 bg-slate-50 border-l-2 border-slate-400 italic text-[12px] text-slate-700">
                            {is.stimulus}
                          </div>
                        )}
                        <div className="font-semibold flex items-start gap-1">
                          <span>{is.nomor}.</span>
                          <span>{is.pertanyaan}</span>
                        </div>
                        <div className="ml-4 mt-1 border-b border-dotted border-slate-400 h-5 w-48" />
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {/* Bagian V: Uraian */}
                {asesmenData.soalUraian.length > 0 && (
                <div className="break-inside-avoid-column mb-6">
                  <div className="bg-slate-100 font-bold font-sans text-xs uppercase px-2 py-1 rounded border border-slate-300 text-slate-800 mb-3">
                    Soal Uraian / Essay (Nomor {formatRangeLabel(dataSummary.uraian.count, dataSummary.uraian.start, dataSummary.uraian.end)})
                  </div>
                  <p className="text-[11px] italic text-slate-500 mb-3 font-sans">
                    Jawablah pertanyaan analisis studi kasus berikut dengan uraian yang lengkap dan sistematis!
                  </p>
                  <div className="space-y-4">
                    {asesmenData.soalUraian.map((u) => (
                      <div key={u.nomor} className="break-inside-avoid">
                        {u.stimulus && (
                          <div className="p-2 mb-1.5 bg-slate-50 border-l-2 border-slate-400 italic text-[12px] text-slate-700">
                            {u.stimulus}
                          </div>
                        )}
                        {u.deskripsiGambar && (
                          <div className="p-2 mb-1.5 bg-amber-50 border border-amber-300 rounded text-[11px] font-sans text-amber-900 font-semibold">
                            [Gambar: &ldquo;{u.deskripsiGambar}&rdquo;]
                          </div>
                        )}
                        <div className="font-semibold flex items-start gap-1">
                          <span>{u.nomor}.</span>
                          <span>{u.pertanyaan}</span>
                        </div>
                        <div className="ml-4 mt-2 space-y-2">
                          <div className="border-b border-dotted border-slate-300 h-4" />
                          <div className="border-b border-dotted border-slate-300 h-4" />
                          <div className="border-b border-dotted border-slate-300 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TABEL KISI-KISI 10 KOLOM (SIAP CETAK) */}
          {activeTab === 'kisi-kisi' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Table className="w-4 h-4 text-blue-400" />
                    Tabel Kisi-Kisi Asesmen Sumatif (10 Kolom • Siap Cetak)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Memetakan seluruh {asesmenData.identitas.jumlahSoal} butir soal secara detail ke setiap Tujuan Pembelajaran (TP) yang diujikan.
                  </p>
                </div>
                <DocumentExportToolbar
                  filename={`Kisi_Kisi_Soal_v2_${asesmenData.identitas.mataPelajaran}`.replace(/\s+/g, '_')}
                  title={`Kisi-Kisi ${asesmenData.identitas.jenisAsesmen} (10 Kolom)`}
                  getHtmlContent={buildExportHtml}
                  orientation="landscape"
                  compact
                />
              </div>

              <div className="print-sheet bg-white text-slate-900 rounded-xl border border-slate-300 shadow-2xl p-5 sm:p-8 font-sans text-xs">
                <div className="text-center border-b-2 border-double border-slate-900 pb-3 mb-4">
                  <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-slate-900">
                    KISI-KISI ASESMEN SUMATIF (10 KOLOM)
                  </h4>
                  <p className="text-xs font-bold uppercase text-slate-700 mt-0.5">
                    {asesmenData.identitas.jenisAsesmen} &bull; {asesmenData.identitas.namaSekolah} ({asesmenData.identitas.tahunPelajaran})
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-[11px] bg-slate-50 border border-slate-300 rounded-lg p-3 mb-4">
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700 w-32 shrink-0">Mata Pelajaran</span>
                    <span>: {asesmenData.identitas.mataPelajaran}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700 w-32 shrink-0">Semester</span>
                    <span>: {asesmenData.identitas.semester}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700 w-32 shrink-0">Kelas / Fase</span>
                    <span>: {asesmenData.identitas.kelas} ({asesmenData.identitas.fase})</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-700 w-32 shrink-0">Alokasi Waktu</span>
                    <span>: {asesmenData.identitas.alokasiWaktu}</span>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[600px]">
                  <table className="w-full text-[11px] text-left border-collapse border border-slate-900">
                    <thead className="bg-slate-200 text-slate-900 font-bold sticky top-0 z-10">
                      <tr className="text-center">
                        <th className="p-2 border border-slate-900 w-10">No</th>
                        <th className="p-2 border border-slate-900 text-left min-w-[180px]">Tujuan Pembelajaran</th>
                        <th className="p-2 border border-slate-900 text-left min-w-[130px]">Ruang Lingkup Materi</th>
                        <th className="p-2 border border-slate-900 w-24">Level Kognitif</th>
                        <th className="p-2 border border-slate-900 text-left min-w-[160px]">Indikator Soal</th>
                        <th className="p-2 border border-slate-900 w-24">Bentuk Soal</th>
                        <th className="p-2 border border-slate-900 w-14">No Soal</th>
                        <th className="p-2 border border-slate-900 text-left min-w-[200px]">Naskah Soal</th>
                        <th className="p-2 border border-slate-900 text-left min-w-[130px]">Kunci Jawaban</th>
                        <th className="p-2 border border-slate-900 w-12">Skor</th>
                      </tr>
                    </thead>
                    <tbody className="font-sans">
                      {asesmenData.kisiKisiTabel.map((k, idx) => (
                        <tr key={k.no} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                          <td className="p-2 border border-slate-900 text-center font-bold tabular-nums align-top">{k.no}</td>
                          <td className="p-2 border border-slate-900 leading-snug align-top">{k.tujuanPembelajaran}</td>
                          <td className="p-2 border border-slate-900 leading-snug align-top">{k.ruangLingkupMateri}</td>
                          <td className="p-2 border border-slate-900 text-center font-semibold align-top">{k.levelKognitif}</td>
                          <td className="p-2 border border-slate-900 leading-snug align-top">{k.indikatorSoal}</td>
                          <td className="p-2 border border-slate-900 text-center align-top">{k.bentukSoal}</td>
                          <td className="p-2 border border-slate-900 text-center font-bold tabular-nums align-top">{k.nomorSoal}</td>
                          <td className="p-2 border border-slate-900 leading-snug align-top">{k.naskahSoal}</td>
                          <td className="p-2 border border-slate-900 font-medium leading-snug align-top">{k.kunciJawaban}</td>
                          <td className="p-2 border border-slate-900 text-center font-bold tabular-nums align-top">{k.skor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KUNCI JAWABAN & PEDOMAN PENSKORAN (SIAP CETAK) */}
          {activeTab === 'kunci' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Kunci Jawaban &amp; Pedoman Penskoran (Siap Cetak)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pembobotan skor untuk {asesmenData.identitas.jumlahSoal} butir soal dan rumus konversi nilai akhir sumatif.
                  </p>
                </div>
                <DocumentExportToolbar
                  filename={`Kunci_Penskoran_v2_${asesmenData.identitas.mataPelajaran}`.replace(/\s+/g, '_')}
                  title={`Pedoman Penskoran ${asesmenData.identitas.jenisAsesmen}`}
                  getHtmlContent={buildExportHtml}
                  orientation="portrait"
                  compact
                />
              </div>

              <div className="print-sheet bg-white text-slate-900 rounded-xl border border-slate-300 shadow-2xl p-5 sm:p-8 font-sans text-xs space-y-5">
                <div className="text-center border-b-2 border-double border-slate-900 pb-3">
                  <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-slate-900">
                    KUNCI JAWABAN &amp; PEDOMAN PENSKORAN
                  </h4>
                  <p className="text-xs font-bold uppercase text-slate-700 mt-0.5">
                    {asesmenData.identitas.jenisAsesmen} &bull; {asesmenData.identitas.namaSekolah}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wide text-slate-900 mb-2">
                    A. Tabel Pedoman Penskoran &amp; Pembobotan Nilai
                  </h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse border border-slate-900">
                      <thead className="bg-slate-200/90 text-slate-900 font-bold text-center">
                        <tr>
                          <th className="p-2.5 border border-slate-900 text-left">Bentuk Soal</th>
                          <th className="p-2.5 border border-slate-900">Nomor Soal</th>
                          <th className="p-2.5 border border-slate-900">Jumlah Soal</th>
                          <th className="p-2.5 border border-slate-900">Bobot / Butir</th>
                          <th className="p-2.5 border border-slate-900">Skor Maksimal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {asesmenData.soalPilihanGanda.length > 0 && (
                        <tr className="bg-white">
                          <td className="p-2.5 border border-slate-900 font-semibold">Pilihan Ganda (PG)</td>
                          <td className="p-2.5 border border-slate-900 text-center tabular-nums">{formatRangeLabel(dataSummary.pg.count, dataSummary.pg.start, dataSummary.pg.end)}</td>
                          <td className="p-2.5 border border-slate-900 text-center tabular-nums">{dataSummary.pg.count} butir</td>
                          <td className="p-2.5 border border-slate-900 text-center tabular-nums">1</td>
                          <td className="p-2.5 border border-slate-900 text-center font-bold tabular-nums">{asesmenData.pedomanPenskoran.skorMaksimalPg}</td>
                        </tr>
                        )}
                        {asesmenData.soalPgKompleks.length > 0 && (
                        <tr className="bg-slate-50/70">
                          <td className="p-2.5 border border-slate-900 font-semibold">Pilihan Ganda Kompleks</td>
                          <td className="p-2.5 border border-slate-900 text-center tabular-nums">{formatRangeLabel(dataSummary.pgKompleks.count, dataSummary.pgKompleks.start, dataSummary.pgKompleks.end)}</td>
                          <td className="p-2.5 border border-slate-900 text-center tabular-nums">{dataSummary.pgKompleks.count} butir</td>
                          <td className="p-2.5 border border-slate-900 text-center tabular-nums">2</td>
                          <td className="p-2.5 border border-slate-900 text-center font-bold tabular-nums">{asesmenData.pedomanPenskoran.skorMaksimalPgKompleks}</td>
                        </tr>
                        )}
                        {asesmenData.soalMenjodohkan.length > 0 && (
                        <tr className="bg-white">
                          <td className="p-2.5 border border-slate-900 font-semibold">Menjodohkan</td>
                          <td className="p-2.5 border border-slate-900 text-center tabular-nums">{formatRangeLabel(dataSummary.menjodohkan.count, dataSummary.menjodohkan.start, dataSummary.menjodohkan.end)}</td>
                          <td className="p-2.5 border border-slate-900 text-center tabular-nums">{dataSummary.menjodohkan.count} butir</td>
                          <td className="p-2.5 border border-slate-900 text-center tabular-nums">1</td>
                          <td className="p-2.5 border border-slate-900 text-center font-bold tabular-nums">{asesmenData.pedomanPenskoran.skorMaksimalMenjodohkan}</td>
                        </tr>
                        )}
                        {asesmenData.soalIsianSingkat.length > 0 && (
                        <tr className="bg-slate-50/70">
                          <td className="p-2.5 border border-slate-900 font-semibold">Isian Singkat</td>
                          <td className="p-2.5 border border-slate-900 text-center tabular-nums">{formatRangeLabel(dataSummary.isianSingkat.count, dataSummary.isianSingkat.start, dataSummary.isianSingkat.end)}</td>
                          <td className="p-2.5 border border-slate-900 text-center tabular-nums">{dataSummary.isianSingkat.count} butir</td>
                          <td className="p-2.5 border border-slate-900 text-center tabular-nums">2</td>
                          <td className="p-2.5 border border-slate-900 text-center font-bold tabular-nums">{asesmenData.pedomanPenskoran.skorMaksimalIsian}</td>
                        </tr>
                        )}
                        {asesmenData.soalUraian.length > 0 && (
                        <tr className="bg-white">
                          <td className="p-2.5 border border-slate-900 font-semibold">Uraian / Essay</td>
                          <td className="p-2.5 border border-slate-900 text-center tabular-nums">{formatRangeLabel(dataSummary.uraian.count, dataSummary.uraian.start, dataSummary.uraian.end)}</td>
                          <td className="p-2.5 border border-slate-900 text-center tabular-nums">{dataSummary.uraian.count} butir</td>
                          <td className="p-2.5 border border-slate-900 text-center tabular-nums">5</td>
                          <td className="p-2.5 border border-slate-900 text-center font-bold tabular-nums">{asesmenData.pedomanPenskoran.skorMaksimalUraian}</td>
                        </tr>
                        )}
                        <tr className="bg-slate-200/90 font-bold text-slate-900">
                          <td colSpan={4} className="p-2.5 border border-slate-900 text-right uppercase">Total Skor Maksimal ({dataSummary.totalSoal} Soal)</td>
                          <td className="p-2.5 border border-slate-900 text-center tabular-nums">{asesmenData.pedomanPenskoran.totalSkorMaksimal} Poin</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-900 text-center space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Rumus Perhitungan Nilai Akhir Peserta Didik:
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-900 font-mono">
                    Nilai Akhir = (Total Skor Perolehan / {asesmenData.pedomanPenskoran.totalSkorMaksimal}) × 100
                  </div>
                </div>

                {asesmenData.soalPilihanGanda.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wide text-slate-900 mb-2">
                    B. Kunci Jawaban Pilihan Ganda (Nomor {formatRangeLabel(dataSummary.pg.count, dataSummary.pg.start, dataSummary.pg.end)})
                  </h5>
                  <div className="grid grid-cols-5 sm:grid-cols-5 gap-1.5">
                    {asesmenData.soalPilihanGanda.map((pg) => (
                      <div key={pg.nomor} className="px-2.5 py-1.5 rounded border border-slate-900 bg-slate-50 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 tabular-nums">No. {pg.nomor}</span>
                        <span className="font-black text-slate-900">{pg.kunci}</span>
                      </div>
                    ))}
                  </div>
                </div>
                )}

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wide text-slate-900 mb-2">
                    {asesmenData.soalPilihanGanda.length > 0 ? 'C.' : 'B.'} Daftar Kunci Jawaban Lengkap Semua Nomor ({formatRangeLabel(dataSummary.totalSoal, 1, dataSummary.totalSoal)})
                  </h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] border-collapse border border-slate-900">
                      <thead>
                        <tr className="bg-slate-200/90 text-slate-900 font-bold text-center">
                          <th className="border border-slate-900 px-2 py-1.5 w-16">No. Soal</th>
                          <th className="border border-slate-900 px-2.5 py-1.5 w-36">Bentuk Soal</th>
                          <th className="border border-slate-900 px-2.5 py-1.5 text-left">Kunci Jawaban</th>
                          <th className="border border-slate-900 px-2 py-1.5 w-16">Skor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {asesmenData.kisiKisiTabel.map((k, idx) => (
                          <tr key={k.no} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                            <td className="border border-slate-900 px-2 py-1.5 text-center font-bold tabular-nums align-top">{k.nomorSoal}</td>
                            <td className="border border-slate-900 px-2.5 py-1.5 text-center align-top">{k.bentukSoal}</td>
                            <td className="border border-slate-900 px-2.5 py-1.5 font-medium leading-snug align-top">{k.kunciJawaban}</td>
                            <td className="border border-slate-900 px-2 py-1.5 text-center font-bold tabular-nums align-top">{k.skor}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
