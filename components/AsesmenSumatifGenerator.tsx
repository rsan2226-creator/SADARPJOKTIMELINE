'use client';

import React, { useState } from 'react';
import { 
  FileCheck2, Sparkles, Copy, Check, 
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
  getFallbackAsesmenSumatifData,
} from '@/lib/asesmen-sumatif-types';
import { KomposisiSoalEditor } from './KomposisiSoalEditor';
import { DocumentExportToolbar } from './DocumentExportToolbar';
import { escapeHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

interface PresetItem {
  label: string;
  mapel: string;
  kelas: string;
  fase: string;
  jenisAsesmen: string;
  semester: string;
  materiDetail: string;
}

const PRESETS: PresetItem[] = [
  {
    label: '⚽ PJOK SD: Bola Besar & Kebugaran (SAS Ganjil)',
    mapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelas: 'Kelas V',
    fase: 'Fase C',
    jenisAsesmen: 'Asesmen Sumatif Akhir Semester (SAS)',
    semester: 'Ganjil',
    materiDetail: 'Variasi dan Kombinasi Pola Gerak Dasar Permainan Bola Besar (Sepak Bola & Bola Voli), Kebugaran Jasmani Dasar TKJI, serta Pengukuran Denyut Nadi Latihan',
  },
  {
    label: '🏃 PJOK SMP: Atletik & Kebugaran (STS Ganjil)',
    mapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelas: 'Kelas VII',
    fase: 'Fase D',
    jenisAsesmen: 'Asesmen Sumatif Tengah Semester (STS)',
    semester: 'Ganjil',
    materiDetail: 'Keterampilan Gerak Lari Jarak Pendek (Sprint), Lompat Jauh Gaya Jongkok, Latihan Sirkuit Kebugaran Jantung-Paru, serta Pencegahan Cedera Olahraga',
  },
  {
    label: '🏐 PJOK SMA: Taktik & Permainan (PAS)',
    mapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelas: 'Kelas XI',
    fase: 'Fase F',
    jenisAsesmen: 'Asesmen Sumatif Akhir Semester (SAS/PAS)',
    semester: 'Ganjil',
    materiDetail: 'Analisis dan Evaluasi Taktik Pola Penyerangan & Pertahanan Bola Voli, Analisis Denyut Nadi Zona Latihan, serta Perancangan Program Kebugaran Mandiri',
  },
  {
    label: '🌿 IPAS SD: Ekosistem & Organ Tubuh (SAS)',
    mapel: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    kelas: 'Kelas V',
    fase: 'Fase C',
    jenisAsesmen: 'Asesmen Sumatif Akhir Semester (SAS)',
    semester: 'Ganjil',
    materiDetail: 'Sistem Pernapasan dan Pencernaan Manusia, Rantai Makanan & Aliran Energi Ekosistem Sawah, serta Pengaruh Kalor terhadap Perubahan Wujud Zat',
  },
  {
    label: '📐 Matematika SMP: Bilangan & Aljabar (STS)',
    mapel: 'Matematika',
    kelas: 'Kelas VII',
    fase: 'Fase D',
    jenisAsesmen: 'Asesmen Sumatif Tengah Semester (STS)',
    semester: 'Ganjil',
    materiDetail: 'Operasi Bilangan Bulat dan Pecahan, Perbandingan Senilai dan Berbalik Nilai, serta Operasi Bentuk Aljabar Sederhana',
  },
];

export function AsesmenSumatifGenerator() {
  const [mapel, setMapel] = useState<string>('Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)');
  const [kelas, setKelas] = useState<string>('Kelas V');
  const [fase, setFase] = useState<string>('Fase C');
  const [semester, setSemester] = useState<string>('Ganjil');
  const [jenisAsesmen, setJenisAsesmen] = useState<string>('Asesmen Sumatif Akhir Semester (SAS)');
  const [namaSekolah, setNamaSekolah] = useState<string>('SD NEGERI KALIMANTONG');
  const [tahunPelajaran, setTahunPelajaran] = useState<string>('2026/2027');
  const [alokasiWaktu, setAlokasiWaktu] = useState<string>('90 Menit');
  const [materiDetail, setMateriDetail] = useState<string>(
    'Variasi dan Kombinasi Gerak Dasar Permainan Bola Besar (Sepak Bola & Bola Voli) serta Kebugaran Jasmani Dasar'
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
    getFallbackAsesmenSumatifData()
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
    const fb = getFallbackAsesmenSumatifData(
      mapel,
      kelas,
      fase,
      jenisAsesmen,
      materiDetail,
      next,
      instruksiKhusus
    );
    fb.identitas.namaSekolah = namaSekolah;
    fb.identitas.semester = semester;
    fb.identitas.tahunPelajaran = tahunPelajaran;
    fb.identitas.alokasiWaktu = alokasiWaktu;
    setAsesmenData((prev) => alignAsesmenWithKomposisi(prev, next, fb));
  };

  const handleApplyPreset = (p: PresetItem) => {
    setMapel(p.mapel);
    setKelas(p.kelas);
    setFase(p.fase);
    setJenisAsesmen(p.jenisAsesmen);
    setSemester(p.semester);
    setMateriDetail(p.materiDetail);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setGenerationNotice(null);
    try {
      const res = await postJsonSafe<{
        data?: AsesmenSumatifData;
        warning?: string;
        isFallback?: boolean;
      }>('/api/gemini/generate-asesmen-sumatif', {
        mapel,
        kelas,
        fase,
        semester,
        jenisAsesmen,
        namaSekolah,
        tahunPelajaran,
        alokasiWaktu,
        materiDetail,
        komposisi,
        instruksiKhusus,
      });
      if (res.data?.data) {
        setAsesmenData(res.data.data);
        if (res.data.warning) {
          setGenerationNotice(res.data.warning);
        }
      } else {
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
        setAsesmenData(fb);
        setGenerationNotice(
          res.error || 'Menggunakan mode penyusun lokal sesuai materi dan perintah yang Anda masukkan.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAll = () => {
    const d = asesmenData;
    let fullText = `# ${d.identitas.namaSekolah}\n`;
    fullText += `${d.identitas.jenisAsesmen} - TAHUN PELAJARAN ${d.identitas.tahunPelajaran}\n`;
    fullText += `Mata Pelajaran: ${d.identitas.mataPelajaran} | Kelas: ${d.identitas.kelas} (${d.identitas.fase}) | Waktu: ${d.identitas.alokasiWaktu} | Jumlah Soal: ${d.identitas.jumlahSoal}\n\n`;
    fullText += `## PETUNJUK UMUM\n${d.petunjukUmum.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n`;

    let bagIndex = 1;
    const roman = ['I', 'II', 'III', 'IV', 'V'];
    const nextBag = () => roman[bagIndex++ - 1] || String(bagIndex);

    if (d.soalPilihanGanda.length > 0) {
      fullText += `## BAGIAN ${nextBag()}: SOAL PILIHAN GANDA (${formatRangeLabel(dataSummary.pg.count, dataSummary.pg.start, dataSummary.pg.end)})\n`;
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
    const title = `${d.identitas.jenisAsesmen}_${d.identitas.mataPelajaran}_${d.identitas.kelas}`.replace(/\s+/g, '_');

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
          <h3>${escapeHtml(d.identitas.jenisAsesmen)} - TAHUN PELAJARAN ${escapeHtml(d.identitas.tahunPelajaran)}</h3>
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

        <div style="font-size: 8.5pt; background-color: #f1f5f9; padding: 6px; margin-bottom: 10px; border: 1px solid #cbd5e1;">
          <strong>PETUNJUK UMUM:</strong>
          <ol style="margin: 3px 0; padding-left: 18px;">
            ${d.petunjukUmum.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
          </ol>
        </div>

        <!-- NASKAH SOAL DALAM FORMAT DUA KOLOM -->
        <div class="two-column">
          ${d.soalPilihanGanda.length > 0 ? `
          <div class="section-title">BAGIAN PILIHAN GANDA (${formatRangeLabel(dataSummary.pg.count, dataSummary.pg.start, dataSummary.pg.end)})</div>
          <p style="font-size: 8.5pt; margin-bottom: 6px;"><em>Pilihlah salah satu jawaban yang paling tepat (${escapeHtml(activePgInstruction)})!</em></p>

          ${d.soalPilihanGanda
            .map(
              (pg) => `
            <div class="question-item">
              ${pg.stimulus ? `<div class="stimulus-box">${escapeHtml(pg.stimulus)}</div>` : ''}
              ${pg.deskripsiGambar ? `<div class="stimulus-box">[Gambar: "${escapeHtml(pg.deskripsiGambar)}"]</div>` : ''}
              <div><strong>${pg.nomor}.</strong> ${escapeHtml(pg.pertanyaan)}</div>
              <div style="padding-left: 14px; margin-top: 2px;">
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
          <p style="font-size: 8.5pt; margin-bottom: 6px;"><em>Pilihlah jawaban-jawaban yang benar (bisa lebih dari satu pilihan)!</em></p>

          ${d.soalPgKompleks
            .map(
              (pgk) => `
            <div class="question-item">
              ${pgk.stimulus ? `<div class="stimulus-box">${escapeHtml(pgk.stimulus)}</div>` : ''}
              <div><strong>${pgk.nomor}.</strong> ${escapeHtml(pgk.pertanyaan)}</div>
              <div style="padding-left: 14px; margin-top: 2px;">
                ${pgk.pilihan.map((p) => `<div>[ &nbsp; ] ${escapeHtml(p.kode)}. ${escapeHtml(p.teks)}</div>`).join('')}
              </div>
            </div>
          `
            )
            .join('')}
          ` : ''}

          ${d.soalMenjodohkan.length > 0 ? `
          <div class="section-title">MENJODOHKAN (${formatRangeLabel(dataSummary.menjodohkan.count, dataSummary.menjodohkan.start, dataSummary.menjodohkan.end)})</div>
          <p style="font-size: 8.5pt; margin-bottom: 6px;"><em>Pasangkan pernyataan di kolom kiri dengan jawaban yang tepat di kolom kanan!</em></p>

          <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 10px;">
            ${d.soalMenjodohkan
              .map(
                (m) => `
              <tr>
                <td style="padding: 3px; width: 48%; border-bottom: 1px dotted #ccc;"><strong>${m.nomor}.</strong> ${escapeHtml(m.premisKiri)}</td>
                <td style="text-align: center; width: 8%;">➡</td>
                <td style="padding: 3px; width: 44%; border-bottom: 1px dotted #ccc;">( .... ) ${escapeHtml(m.responsKanan)}</td>
              </tr>
            `
              )
              .join('')}
          </table>
          ` : ''}

          ${d.soalIsianSingkat.length > 0 ? `
          <div class="section-title">ISIAN SINGKAT (${formatRangeLabel(dataSummary.isianSingkat.count, dataSummary.isianSingkat.start, dataSummary.isianSingkat.end)})</div>
          <p style="font-size: 8.5pt; margin-bottom: 6px;"><em>Isilah titik-titik di bawah ini dengan jawaban yang singkat dan tepat!</em></p>

          ${d.soalIsianSingkat
            .map(
              (is) => `
            <div class="question-item">
              ${is.stimulus ? `<div class="stimulus-box">${escapeHtml(is.stimulus)}</div>` : ''}
              <div><strong>${is.nomor}.</strong> ${escapeHtml(is.pertanyaan)}</div>
              <div style="margin-top: 4px; padding-left: 14px; font-style: italic; color: #475569;">
                Jawab: ............................................................................
              </div>
            </div>
          `
            )
            .join('')}
          ` : ''}

          ${d.soalUraian.length > 0 ? `
          <div class="section-title">URAIAN / ESSAY (${formatRangeLabel(dataSummary.uraian.count, dataSummary.uraian.start, dataSummary.uraian.end)})</div>
          <p style="font-size: 8.5pt; margin-bottom: 6px;"><em>Jawablah pertanyaan di bawah ini dengan uraian yang lengkap dan jelas!</em></p>

          ${d.soalUraian
            .map(
              (u) => `
            <div class="question-item">
              ${u.stimulus ? `<div class="stimulus-box">${escapeHtml(u.stimulus)}</div>` : ''}
              ${u.deskripsiGambar ? `<div class="stimulus-box">[Gambar: "${escapeHtml(u.deskripsiGambar)}"]</div>` : ''}
              <div><strong>${u.nomor}.</strong> ${escapeHtml(u.pertanyaan)}</div>
              <div style="height: 70px; border: 1px dashed #cbd5e1; margin-top: 4px; padding: 4px; font-size: 8pt; color: #94a3b8;">
                Ruang Jawaban Siswa:
              </div>
            </div>
          `
            )
            .join('')}
          ` : ''}
        </div>

        <br clear="all" style="page-break-before:always" />

        <!-- HALAMAN KISI-KISI ASESMEN SUMATIF -->
        <h2 style="text-align: center; margin-top: 20px;">KISI-KISI ASESMEN SUMATIF</h2>
        <p style="text-align: center; font-size: 9.5pt;">Mata Pelajaran: ${escapeHtml(d.identitas.mataPelajaran)} | Kelas: ${escapeHtml(d.identitas.kelas)} (${escapeHtml(d.identitas.fase)})</p>

        <table class="table-bordered">
          <thead>
            <tr>
              <th width="4%">No</th>
              <th width="18%">Tujuan Pembelajaran</th>
              <th width="14%">Ruang Lingkup Materi</th>
              <th width="9%">Level Kognitif</th>
              <th width="20%">Indikator Soal</th>
              <th width="10%">Bentuk Soal</th>
              <th width="5%">No. Soal</th>
              <th width="15%">Kunci Jawaban</th>
              <th width="5%">Skor</th>
            </tr>
          </thead>
          <tbody>
            ${d.kisiKisiTabel
              .map(
                (k) => `
              <tr>
                <td align="center">${k.no}</td>
                <td>${escapeHtml(k.tujuanPembelajaran)}</td>
                <td>${escapeHtml(k.ruangLingkupMateri)}</td>
                <td align="center">${escapeHtml(k.levelKognitif)}</td>
                <td>${escapeHtml(k.indikatorSoal)}</td>
                <td align="center">${escapeHtml(k.bentukSoal)}</td>
                <td align="center"><strong>${escapeHtml(String(k.nomorSoal))}</strong></td>
                <td>${escapeHtml(k.kunciJawaban)}</td>
                <td align="center">${k.skor}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <br clear="all" style="page-break-before:always" />

        <!-- TABEL KUNCI JAWABAN & PEDOMAN PENSKORAN -->
        <h2 style="text-align: center; margin-top: 20px;">TABEL KUNCI JAWABAN DAN PEDOMAN PENSKORAN</h2>
        
        <table class="table-bordered" style="width: 75%; margin: 10px auto;">
          <thead>
            <tr>
              <th>Bentuk Soal</th>
              <th>Nomor Soal</th>
              <th>Bobot Tiap Nomor</th>
              <th>Skor Maksimal</th>
            </tr>
          </thead>
          <tbody>
            ${d.soalPilihanGanda.length > 0 ? `
            <tr>
              <td>Pilihan Ganda</td>
              <td align="center">${formatRangeLabel(dataSummary.pg.count, dataSummary.pg.start, dataSummary.pg.end)} (${dataSummary.pg.count} butir)</td>
              <td align="center">1</td>
              <td align="center">${d.pedomanPenskoran.skorMaksimalPg}</td>
            </tr>` : ''}
            ${d.soalPgKompleks.length > 0 ? `
            <tr>
              <td>Pilihan Ganda Kompleks</td>
              <td align="center">${formatRangeLabel(dataSummary.pgKompleks.count, dataSummary.pgKompleks.start, dataSummary.pgKompleks.end)} (${dataSummary.pgKompleks.count} butir)</td>
              <td align="center">2</td>
              <td align="center">${d.pedomanPenskoran.skorMaksimalPgKompleks}</td>
            </tr>` : ''}
            ${d.soalMenjodohkan.length > 0 ? `
            <tr>
              <td>Menjodohkan</td>
              <td align="center">${formatRangeLabel(dataSummary.menjodohkan.count, dataSummary.menjodohkan.start, dataSummary.menjodohkan.end)} (${dataSummary.menjodohkan.count} butir)</td>
              <td align="center">1</td>
              <td align="center">${d.pedomanPenskoran.skorMaksimalMenjodohkan}</td>
            </tr>` : ''}
            ${d.soalIsianSingkat.length > 0 ? `
            <tr>
              <td>Isian Singkat</td>
              <td align="center">${formatRangeLabel(dataSummary.isianSingkat.count, dataSummary.isianSingkat.start, dataSummary.isianSingkat.end)} (${dataSummary.isianSingkat.count} butir)</td>
              <td align="center">2</td>
              <td align="center">${d.pedomanPenskoran.skorMaksimalIsian}</td>
            </tr>` : ''}
            ${d.soalUraian.length > 0 ? `
            <tr>
              <td>Uraian / Essay</td>
              <td align="center">${formatRangeLabel(dataSummary.uraian.count, dataSummary.uraian.start, dataSummary.uraian.end)} (${dataSummary.uraian.count} butir)</td>
              <td align="center">5</td>
              <td align="center">${d.pedomanPenskoran.skorMaksimalUraian}</td>
            </tr>` : ''}
            <tr style="background-color: #e2e8f0; font-weight: bold;">
              <td colspan="3" align="right">TOTAL SKOR MAKSIMAL:</td>
              <td align="center">${d.pedomanPenskoran.totalSkorMaksimal}</td>
            </tr>
          </tbody>
        </table>

        <div style="width: 75%; margin: 15px auto; padding: 10px; background-color: #f8fafc; border: 1px solid #000; font-size: 10pt; text-align: center;">
          <strong>RUMUS PENENTUAN NILAI AKHIR (NA):</strong><br/>
          <em>${escapeHtml(d.pedomanPenskoran.rumusNilaiAkhir)}</em>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Standar Kurikulum Merdeka &bull; Format 2 Kolom &bull; Komposisi Soal Kustom ({formSummary.totalSoal} Butir)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Generator Asesmen Sumatif (Tengah/Akhir/Harian)
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Otomasi penyusunan soal sumatif dengan jumlah soal tiap bentuk dapat disesuaikan, dilengkapi <strong className="text-emerald-300">Tabel Kisi-Kisi Komprehensif</strong>, <strong className="text-cyan-300">Pedoman Penskoran</strong>, dan siap ekspor ke <strong className="text-teal-300">Dokumen Word Dua Kolom (.doc)</strong> siap cetak.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto shrink-0 no-print">
            <DocumentExportToolbar
              filename={`Asesmen_Sumatif_${asesmenData.identitas.mataPelajaran}_${asesmenData.identitas.kelas}`.replace(/\s+/g, '_')}
              title={`${asesmenData.identitas.jenisAsesmen} - ${asesmenData.identitas.mataPelajaran}`}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
            />
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
              title="Salin Naskah"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Input Form (4 cols) vs Exam View (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Parameters (4 cols) */}
        <div className="lg:col-span-4 space-y-4 no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <h2 className="font-bold text-sm text-white">Parameter Asesmen</h2>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full font-medium tabular-nums">
                {formSummary.totalSoal} Butir Soal
              </span>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Muat Contoh Cepat:</span>
                <span className="text-[10px] text-slate-500">1-Klik</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors font-medium cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MAPEL & KELAS/FASE */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Mata Pelajaran (MAPEL)
                </label>
                <input
                  type="text"
                  value={mapel}
                  onChange={(e) => setMapel(e.target.value)}
                  placeholder="PJOK"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none font-bold text-emerald-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Kelas & Fase
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    placeholder="Kelas V"
                    className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={fase}
                    onChange={(e) => setFase(e.target.value)}
                    placeholder="Fase C"
                    className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Jenis Asesmen
                </label>
                <select
                  value={jenisAsesmen}
                  onChange={(e) => setJenisAsesmen(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Asesmen Sumatif Akhir Semester (SAS)">Sumatif Akhir (SAS/PAS)</option>
                  <option value="Asesmen Sumatif Tengah Semester (STS)">Sumatif Tengah (STS/PTS)</option>
                  <option value="Asesmen Sumatif Harian">Sumatif Harian (Bab/TP)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Semester & Tahun
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                  <input
                    type="text"
                    value={tahunPelajaran}
                    onChange={(e) => setTahunPelajaran(e.target.value)}
                    placeholder="2026/2027"
                    className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Alokasi Waktu
                </label>
                <input
                  type="text"
                  value={alokasiWaktu}
                  onChange={(e) => setAlokasiWaktu(e.target.value)}
                  placeholder="90 Menit"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Nama Satuan Pendidikan
                </label>
                <input
                  type="text"
                  value={namaSekolah}
                  onChange={(e) => setNamaSekolah(e.target.value)}
                  placeholder="SD NEGERI KALIMANTONG"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none uppercase font-semibold"
                />
              </div>
            </div>

            {/* MATERI DAN SUBMATERI SECARA DETAIL */}
            <div className="space-y-1 text-xs">
              <label className="text-[11px] font-medium text-slate-300 block">
                Materi dan Submateri Secara Detail (Acuan Soal)
              </label>
              <textarea
                value={materiDetail}
                onChange={(e) => setMateriDetail(e.target.value)}
                rows={4}
                placeholder="Tuliskan seluruh materi dan submateri yang ingin diujikan..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* PERINTAH / INSTRUKSI KHUSUS */}
            <div className="space-y-1 text-xs">
              <label className="text-[11px] font-medium text-emerald-300 block">
                Perintah / Instruksi Khusus Penyusunan Soal (Opsional)
              </label>
              <textarea
                value={instruksiKhusus}
                onChange={(e) => setInstruksiKhusus(e.target.value)}
                rows={2}
                placeholder="Contoh: Fokuskan soal HOTS (C4–C5), sertakan studi kasus, hindari topik yang tidak tertulis di atas."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Tombol Generate */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !materiDetail.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyusun {formSummary.totalSoal} Soal, Kisi-Kisi &amp; Kunci Jawaban...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Asesmen Sumatif ({formSummary.totalSoal} Soal)</span>
                </>
              )}
            </button>
          </div>

          {/* Editable Komposisi Soal Asesmen */}
          <KomposisiSoalEditor
            value={komposisi}
            onChange={setKomposisi}
            onApplyPreview={handleApplyKomposisiPreview}
            accent="emerald"
          />
        </div>

        {/* Right Column: Output Tabs & View (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 no-print">
            {/* View Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('soal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'soal'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Lembar Soal (2 Kolom Word)</span>
              </button>
              <button
                onClick={() => setActiveTab('kisi-kisi')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'kisi-kisi'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Tabel Kisi-Kisi</span>
              </button>
              <button
                onClick={() => setActiveTab('kunci')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'kunci'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Kunci & Penskoran</span>
              </button>
            </div>

            {/* Toggle 1 Kolom vs 2 Kolom (for preview) */}
            {activeTab === 'soal' && (
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                <span className="text-slate-500 mr-1 hidden sm:inline">Layout:</span>
                <button
                  onClick={() => setLayoutMode('two-col')}
                  className={`px-2 py-0.5 rounded ${layoutMode === 'two-col' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  2 Kolom
                </button>
                <button
                  onClick={() => setLayoutMode('one-col')}
                  className={`px-2 py-0.5 rounded ${layoutMode === 'one-col' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  1 Kolom
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs text-slate-300">
              <button
                onClick={() => setZoomScale(Math.max(0.5, zoomScale - 0.1))}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                title="Perkecil"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-10 text-center font-bold text-emerald-400">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale(Math.min(1.2, zoomScale + 0.1))}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                title="Perbesar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {generationNotice && (
            <div className="flex items-start justify-between gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl px-3.5 py-2.5 text-xs no-print">
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

          {/* TAB 1: LEMBAR SOAL SIAP PAKAI (DUA KOLOM SESUAI PROMPT) */}
          {activeTab === 'soal' && (
            <div className="overflow-x-auto p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col items-center justify-start min-h-[900px]">
              <div 
                style={{ 
                  transform: `scale(${zoomScale})`, 
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out'
                }}
                className="flex flex-col items-center"
              >
                {/* A4 PAPER CANVAS */}
                <div 
                  className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-[12mm] shadow-2xl rounded-sm box-border relative"
                  style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
                >
                  {/* KOP SOAL UJIAN RESMI */}
                  <div className="border-b-4 border-double border-slate-900 pb-2 mb-3 text-center">
                    <h4 className="text-[11px] font-black tracking-widest uppercase text-slate-700">
                      DINAS PENDIDIKAN DAN KEBUDAYAAN
                    </h4>
                    <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
                      {asesmenData.identitas.namaSekolah}
                    </h2>
                    <h3 className="text-xs font-black uppercase text-teal-800 mt-0.5">
                      {asesmenData.identitas.jenisAsesmen} - TAHUN PELAJARAN {asesmenData.identitas.tahunPelajaran}
                    </h3>
                  </div>

                  {/* IDENTITAS SOAL UJIAN */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] border-b border-slate-300 pb-2.5 mb-3 bg-slate-50/70 p-2.5 rounded-lg border">
                    <div>
                      <span className="font-bold text-slate-600 inline-block w-28">Mata Pelajaran:</span>
                      <strong className="text-slate-900">{asesmenData.identitas.mataPelajaran}</strong>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 inline-block w-28">Hari / Tanggal:</span>
                      <span className="text-slate-800">........................................</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 inline-block w-28">Kelas / Semester:</span>
                      <strong className="text-slate-900">{asesmenData.identitas.kelas} ({asesmenData.identitas.fase}) / {asesmenData.identitas.semester}</strong>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 inline-block w-28">Alokasi Waktu:</span>
                      <strong className="text-slate-900">{asesmenData.identitas.alokasiWaktu}</strong>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 inline-block w-28">Nama Peserta:</span>
                      <span className="text-slate-800">........................................</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 inline-block w-28">Jumlah Soal:</span>
                      <strong className="text-slate-900">{asesmenData.identitas.jumlahSoal} Butir Soal</strong>
                    </div>
                  </div>

                  {/* PETUNJUK UMUM */}
                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[10px] text-slate-700 mb-3">
                    <strong className="text-emerald-900 block font-bold mb-1">PETUNJUK UMUM PENGERJAAN:</strong>
                    <ol className="list-decimal pl-4 space-y-0.5 leading-tight">
                      {asesmenData.petunjukUmum.map((ptj, pIdx) => (
                        <li key={pIdx}>{ptj}</li>
                      ))}
                    </ol>
                  </div>

                  {/* NASKAH SOAL (DUA KOLOM ATAU SATU KOLOM) */}
                  <div className={layoutMode === 'two-col' ? 'columns-2 gap-6 text-[10.5px] leading-snug' : 'space-y-3 text-xs'}>
                    {/* BAGIAN PILIHAN GANDA */}
                    {asesmenData.soalPilihanGanda.length > 0 && (
                      <>
                        <div className="break-inside-avoid-column mb-3 pb-1 border-b-2 border-slate-800">
                          <span className="font-black text-xs text-slate-900 uppercase">
                            SOAL PILIHAN GANDA ({formatRangeLabel(dataSummary.pg.count, dataSummary.pg.start, dataSummary.pg.end)})
                          </span>
                          <p className="text-[10px] text-slate-500 italic mt-0.5">
                            Pilihlah salah satu jawaban {activePgInstruction} yang paling benar!
                          </p>
                        </div>

                        {asesmenData.soalPilihanGanda.map((pg) => (
                          <div key={pg.nomor} className="break-inside-avoid mb-3 space-y-1">
                            {pg.stimulus && (
                              <div className="p-1.5 rounded bg-slate-100 border-l-2 border-emerald-600 text-[9.5px] text-slate-700 italic">
                                {pg.stimulus}
                              </div>
                            )}
                            {pg.deskripsiGambar && (
                              <div className="p-1.5 rounded bg-amber-50 border border-dashed border-amber-300 text-[9px] text-amber-900 font-semibold">
                                📷 [Gambar: &quot;{pg.deskripsiGambar}&quot;]
                              </div>
                            )}
                            <div className="flex items-start gap-1 font-semibold text-slate-900">
                              <span className="w-4 shrink-0">{pg.nomor}.</span>
                              <span className="flex-1">{pg.pertanyaan}</span>
                            </div>
                            <div className="pl-4 space-y-0.5 text-slate-700">
                              {activePgKeys.map((key) =>
                                pg.pilihan[key] !== undefined ? (
                                  <div key={key}>{key}. {pg.pilihan[key]}</div>
                                ) : null
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* BAGIAN PILIHAN GANDA KOMPLEKS */}
                    {asesmenData.soalPgKompleks.length > 0 && (
                      <>
                        <div className="break-inside-avoid-column mb-3 mt-4 pt-2 border-t-2 border-slate-800">
                          <span className="font-black text-xs text-slate-900 uppercase">
                            PILIHAN GANDA KOMPLEKS ({formatRangeLabel(dataSummary.pgKompleks.count, dataSummary.pgKompleks.start, dataSummary.pgKompleks.end)})
                          </span>
                          <p className="text-[10px] text-slate-500 italic mt-0.5">
                            Berilah tanda centang (✓) pada pilihan yang benar (bisa lebih dari satu)!
                          </p>
                        </div>

                        {asesmenData.soalPgKompleks.map((pgk) => (
                          <div key={pgk.nomor} className="break-inside-avoid mb-3 space-y-1">
                            {pgk.stimulus && (
                              <div className="p-1.5 rounded bg-slate-100 border-l-2 border-cyan-600 text-[9.5px] text-slate-700 italic">
                                {pgk.stimulus}
                              </div>
                            )}
                            <div className="flex items-start gap-1 font-semibold text-slate-900">
                              <span className="w-4 shrink-0">{pgk.nomor}.</span>
                              <span className="flex-1">{pgk.pertanyaan}</span>
                            </div>
                            <div className="pl-4 space-y-0.5 text-slate-700">
                              {pgk.pilihan.map((p, idx) => (
                                <div key={idx} className="flex items-start gap-1.5">
                                  <span className="border border-slate-400 w-3 h-3 rounded-xs shrink-0 mt-0.5"></span>
                                  <span>{p.kode}. {p.teks}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* BAGIAN MENJODOHKAN */}
                    {asesmenData.soalMenjodohkan.length > 0 && (
                      <>
                        <div className="break-inside-avoid-column mb-3 mt-4 pt-2 border-t-2 border-slate-800">
                          <span className="font-black text-xs text-slate-900 uppercase">
                            MENJODOHKAN ({formatRangeLabel(dataSummary.menjodohkan.count, dataSummary.menjodohkan.start, dataSummary.menjodohkan.end)})
                          </span>
                          <p className="text-[10px] text-slate-500 italic mt-0.5">
                            Pasangkan pernyataan di sebelah kiri dengan pilihan yang tepat di sebelah kanan!
                          </p>
                        </div>

                        <div className="break-inside-avoid mb-3 space-y-1.5">
                          {asesmenData.soalMenjodohkan.map((m) => (
                            <div key={m.nomor} className="p-1.5 rounded bg-slate-50 border border-slate-200 text-[10px] space-y-0.5">
                              <div className="font-semibold text-slate-900">
                                <strong>{m.nomor}.</strong> {m.premisKiri}
                              </div>
                              <div className="text-teal-700 pl-4 font-medium">
                                ➡ ( . . . . ) {m.responsKanan}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* BAGIAN ISIAN SINGKAT */}
                    {asesmenData.soalIsianSingkat.length > 0 && (
                      <>
                        <div className="break-inside-avoid-column mb-3 mt-4 pt-2 border-t-2 border-slate-800">
                          <span className="font-black text-xs text-slate-900 uppercase">
                            ISIAN SINGKAT ({formatRangeLabel(dataSummary.isianSingkat.count, dataSummary.isianSingkat.start, dataSummary.isianSingkat.end)})
                          </span>
                          <p className="text-[10px] text-slate-500 italic mt-0.5">
                            Isilah titik-titik di bawah ini dengan jawaban yang singkat dan tepat!
                          </p>
                        </div>

                        {asesmenData.soalIsianSingkat.map((is) => (
                          <div key={is.nomor} className="break-inside-avoid mb-2.5 space-y-0.5">
                            {is.stimulus && (
                              <div className="p-1.5 rounded bg-slate-100 border-l-2 border-amber-600 text-[9.5px] text-slate-700 italic">
                                {is.stimulus}
                              </div>
                            )}
                            <div className="flex items-start gap-1 font-semibold text-slate-900">
                              <span className="w-4 shrink-0">{is.nomor}.</span>
                              <span className="flex-1">{is.pertanyaan}</span>
                            </div>
                            <div className="pl-4 text-slate-400 font-mono text-[10px]">
                              Jawab: ............................................................................
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* BAGIAN URAIAN / ESSAY */}
                    {asesmenData.soalUraian.length > 0 && (
                      <>
                        <div className="break-inside-avoid-column mb-3 mt-4 pt-2 border-t-2 border-slate-800">
                          <span className="font-black text-xs text-slate-900 uppercase">
                            URAIAN / ESSAY ({formatRangeLabel(dataSummary.uraian.count, dataSummary.uraian.start, dataSummary.uraian.end)})
                          </span>
                          <p className="text-[10px] text-slate-500 italic mt-0.5">
                            Jawablah pertanyaan berikut dengan uraian yang lengkap dan sistematis!
                          </p>
                        </div>

                        {asesmenData.soalUraian.map((u) => (
                          <div key={u.nomor} className="break-inside-avoid mb-3 space-y-1">
                            {u.stimulus && (
                              <div className="p-1.5 rounded bg-slate-100 border-l-2 border-purple-600 text-[9.5px] text-slate-700 italic">
                                {u.stimulus}
                              </div>
                            )}
                            {u.deskripsiGambar && (
                              <div className="p-1.5 rounded bg-amber-50 border border-dashed border-amber-300 text-[9px] text-amber-900 font-semibold">
                                📷 [Gambar: &quot;{u.deskripsiGambar}&quot;]
                              </div>
                            )}
                            <div className="flex items-start gap-1 font-semibold text-slate-900">
                              <span className="w-4 shrink-0">{u.nomor}.</span>
                              <span className="flex-1">{u.pertanyaan}</span>
                            </div>
                            <div className="h-16 rounded border border-dashed border-slate-300 bg-slate-50/50 p-1.5 text-[9px] text-slate-400">
                              Ruang Jawaban Uraian Siswa:
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* FOOTER UJIAN */}
                  <div className="border-t border-slate-300 pt-2 mt-4 flex items-center justify-between text-[9px] text-slate-500">
                    <span>Naskah Asesmen Sumatif &bull; {asesmenData.identitas.namaSekolah}</span>
                    <span>Halaman Siap Cetak A4 (Dua Kolom) &bull; Selamat Mengerjakan!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TABEL KISI-KISI ASESMEN SUMATIF (SIAP CETAK) */}
          {activeTab === 'kisi-kisi' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Table className="w-4 h-4 text-emerald-400" />
                    <span>Tabel Kisi-Kisi Asesmen Sumatif (Siap Cetak)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Memetakan ketercapaian Tujuan Pembelajaran, Level Taksonomi Bloom, dan Bentuk Soal
                  </p>
                </div>
                <DocumentExportToolbar
                  filename={`Kisi_Kisi_Asesmen_${asesmenData.identitas.mataPelajaran}`.replace(/\s+/g, '_')}
                  title={`Kisi-Kisi ${asesmenData.identitas.jenisAsesmen}`}
                  getHtmlContent={buildExportHtml}
                  orientation="landscape"
                  compact
                />
              </div>

              <div className="print-sheet bg-white text-slate-900 rounded-xl border border-slate-300 shadow-2xl p-5 sm:p-8 font-sans text-xs">
                <div className="text-center border-b-2 border-double border-slate-900 pb-3 mb-4">
                  <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-slate-900">
                    KISI-KISI PENULISAN SOAL {asesmenData.identitas.jenisAsesmen}
                  </h4>
                  <p className="text-xs font-bold uppercase text-slate-700 mt-0.5">
                    {asesmenData.identitas.namaSekolah} &bull; TAHUN PELAJARAN {asesmenData.identitas.tahunPelajaran}
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
                    <span className="font-bold text-slate-700 w-32 shrink-0">Jumlah Soal</span>
                    <span className="tabular-nums">: {asesmenData.identitas.jumlahSoal} Butir Soal</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse border border-slate-900">
                    <thead>
                      <tr className="bg-slate-200/90 text-slate-900 font-bold text-center">
                        <th className="border border-slate-900 px-2 py-2 w-10">No</th>
                        <th className="border border-slate-900 px-2.5 py-2 text-left min-w-[180px]">Tujuan Pembelajaran</th>
                        <th className="border border-slate-900 px-2.5 py-2 text-left min-w-[130px]">Ruang Lingkup Materi</th>
                        <th className="border border-slate-900 px-2 py-2 w-24">Level Kognitif</th>
                        <th className="border border-slate-900 px-2.5 py-2 text-left min-w-[180px]">Indikator Soal</th>
                        <th className="border border-slate-900 px-2 py-2 w-28">Bentuk Soal</th>
                        <th className="border border-slate-900 px-2 py-2 w-14">No. Soal</th>
                        <th className="border border-slate-900 px-2.5 py-2 text-left min-w-[140px]">Kunci Jawaban</th>
                        <th className="border border-slate-900 px-2 py-2 w-12">Skor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asesmenData.kisiKisiTabel.map((k, idx) => (
                        <tr key={k.no} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                          <td className="border border-slate-900 px-2 py-1.5 text-center tabular-nums font-bold align-top">{k.no}</td>
                          <td className="border border-slate-900 px-2.5 py-1.5 leading-snug align-top">{k.tujuanPembelajaran}</td>
                          <td className="border border-slate-900 px-2.5 py-1.5 leading-snug align-top">{k.ruangLingkupMateri}</td>
                          <td className="border border-slate-900 px-2 py-1.5 text-center font-semibold align-top">{k.levelKognitif}</td>
                          <td className="border border-slate-900 px-2.5 py-1.5 leading-snug align-top">{k.indikatorSoal}</td>
                          <td className="border border-slate-900 px-2 py-1.5 text-center align-top">{k.bentukSoal}</td>
                          <td className="border border-slate-900 px-2 py-1.5 text-center font-bold tabular-nums align-top">{k.nomorSoal}</td>
                          <td className="border border-slate-900 px-2.5 py-1.5 font-medium leading-snug align-top">{k.kunciJawaban}</td>
                          <td className="border border-slate-900 px-2 py-1.5 text-center font-bold tabular-nums align-top">{k.skor}</td>
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <span>Tabel Kunci Jawaban &amp; Pedoman Penskoran (Siap Cetak)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Rincian kunci jawaban, bobot skor tiap butir, dan rumus konversi Nilai Akhir (NA)
                  </p>
                </div>
                <DocumentExportToolbar
                  filename={`Kunci_Penskoran_${asesmenData.identitas.mataPelajaran}`.replace(/\s+/g, '_')}
                  title={`Kunci Jawaban & Pedoman Penskoran ${asesmenData.identitas.jenisAsesmen}`}
                  getHtmlContent={buildExportHtml}
                  orientation="portrait"
                  compact
                />
              </div>

              <div className="print-sheet bg-white text-slate-900 rounded-xl border border-slate-300 shadow-2xl p-5 sm:p-8 font-sans text-xs space-y-5">
                <div className="text-center border-b-2 border-double border-slate-900 pb-3">
                  <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-slate-900">
                    KUNCI JAWABAN DAN PEDOMAN PENSKORAN
                  </h4>
                  <p className="text-xs font-bold uppercase text-slate-700 mt-0.5">
                    {asesmenData.identitas.jenisAsesmen} &bull; {asesmenData.identitas.namaSekolah}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wide text-slate-900 mb-2">
                    A. Rekapitulasi Bobot &amp; Skor Maksimal
                  </h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse border border-slate-900">
                      <thead>
                        <tr className="bg-slate-200/90 text-slate-900 font-bold text-center">
                          <th className="border border-slate-900 px-3 py-2 text-left">Bentuk Soal</th>
                          <th className="border border-slate-900 px-3 py-2">Nomor Soal</th>
                          <th className="border border-slate-900 px-3 py-2">Jumlah Butir</th>
                          <th className="border border-slate-900 px-3 py-2">Bobot / Butir</th>
                          <th className="border border-slate-900 px-3 py-2">Skor Maksimal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {asesmenData.soalPilihanGanda.length > 0 && (
                          <tr className="bg-white">
                            <td className="border border-slate-900 px-3 py-1.5 font-semibold">Pilihan Ganda (PG)</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center tabular-nums">{formatRangeLabel(dataSummary.pg.count, dataSummary.pg.start, dataSummary.pg.end)}</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center tabular-nums">{dataSummary.pg.count} butir</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center tabular-nums">1</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center font-bold tabular-nums">{asesmenData.pedomanPenskoran.skorMaksimalPg}</td>
                          </tr>
                        )}
                        {asesmenData.soalPgKompleks.length > 0 && (
                          <tr className="bg-slate-50/70">
                            <td className="border border-slate-900 px-3 py-1.5 font-semibold">Pilihan Ganda Kompleks</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center tabular-nums">{formatRangeLabel(dataSummary.pgKompleks.count, dataSummary.pgKompleks.start, dataSummary.pgKompleks.end)}</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center tabular-nums">{dataSummary.pgKompleks.count} butir</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center tabular-nums">2</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center font-bold tabular-nums">{asesmenData.pedomanPenskoran.skorMaksimalPgKompleks}</td>
                          </tr>
                        )}
                        {asesmenData.soalMenjodohkan.length > 0 && (
                          <tr className="bg-white">
                            <td className="border border-slate-900 px-3 py-1.5 font-semibold">Menjodohkan</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center tabular-nums">{formatRangeLabel(dataSummary.menjodohkan.count, dataSummary.menjodohkan.start, dataSummary.menjodohkan.end)}</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center tabular-nums">{dataSummary.menjodohkan.count} butir</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center tabular-nums">1</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center font-bold tabular-nums">{asesmenData.pedomanPenskoran.skorMaksimalMenjodohkan}</td>
                          </tr>
                        )}
                        {asesmenData.soalIsianSingkat.length > 0 && (
                          <tr className="bg-slate-50/70">
                            <td className="border border-slate-900 px-3 py-1.5 font-semibold">Isian Singkat</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center tabular-nums">{formatRangeLabel(dataSummary.isianSingkat.count, dataSummary.isianSingkat.start, dataSummary.isianSingkat.end)}</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center tabular-nums">{dataSummary.isianSingkat.count} butir</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center tabular-nums">2</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center font-bold tabular-nums">{asesmenData.pedomanPenskoran.skorMaksimalIsian}</td>
                          </tr>
                        )}
                        {asesmenData.soalUraian.length > 0 && (
                          <tr className="bg-white">
                            <td className="border border-slate-900 px-3 py-1.5 font-semibold">Uraian / Essay</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center tabular-nums">{formatRangeLabel(dataSummary.uraian.count, dataSummary.uraian.start, dataSummary.uraian.end)}</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center tabular-nums">{dataSummary.uraian.count} butir</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center tabular-nums">5</td>
                            <td className="border border-slate-900 px-3 py-1.5 text-center font-bold tabular-nums">{asesmenData.pedomanPenskoran.skorMaksimalUraian}</td>
                          </tr>
                        )}
                        <tr className="bg-slate-200/90 font-bold text-slate-900">
                          <td colSpan={4} className="border border-slate-900 px-3 py-2 text-right uppercase">Total Skor Maksimal</td>
                          <td className="border border-slate-900 px-3 py-2 text-center tabular-nums">{asesmenData.pedomanPenskoran.totalSkorMaksimal}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-900 rounded-lg p-3 text-center space-y-1">
                  <span className="text-[11px] font-bold uppercase text-slate-700 block">
                    Rumus Penentuan Nilai Akhir (NA):
                  </span>
                  <strong className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                    {asesmenData.pedomanPenskoran.rumusNilaiAkhir}
                  </strong>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wide text-slate-900 mb-2">
                    B. Daftar Kunci Jawaban Lengkap ({asesmenData.identitas.jumlahSoal} Butir Soal)
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
