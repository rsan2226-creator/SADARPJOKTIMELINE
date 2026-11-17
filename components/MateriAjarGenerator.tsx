'use client';

import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Copy, Check, FileText, 
  Lightbulb, Target, Layers, Compass, HelpCircle, CheckCircle2, 
  ArrowRight, HeartHandshake, Award, RefreshCw, Bookmark,
  Quote, AlertCircle, Share2, ShieldCheck, Dumbbell, Brain
} from 'lucide-react';
import { MateriAjarData, getFallbackMateriAjarData } from '@/lib/materi-ajar-types';
import { DocumentExportToolbar } from './DocumentExportToolbar';
import { escapeHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

const BLOOM_LEVELS = [
  'C1 - Mengingat (Remembering)',
  'C2 - Memahami (Understanding)',
  'C3 - Menerapkan / Mengaplikasikan (Applying)',
  'C4 - Menganalisis (Analyzing)',
  'C5 - Mengevaluasi / Merefleksi (Evaluating)',
  'C6 - Mencipta / Merancang (Creating)',
];

const DIMENSI_LIST = [
  'Keimanan dan Ketakwaan kepada Tuhan YME',
  'Kewargaan',
  'Penalaran Kritis',
  'Kreativitas',
  'Kolaborasi',
  'Kemandirian',
  'Kesehatan',
  'Komunikasi',
];

interface PresetOption {
  label: string;
  mapel: string;
  jenjang: string;
  kelas: string;
  fase: string;
  topik: string;
  tujuan: string;
  levelBloom: string;
  dimensi: string[];
  alokasiWaktu: string;
  konteksLokal: string;
}

const PRESETS: PresetOption[] = [
  {
    label: '⚽ PJOK SD: Passing Sepak Bola',
    mapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    jenjang: 'SD',
    kelas: 'Kelas V',
    fase: 'Fase C',
    topik: 'Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola',
    tujuan: 'Peserta didik dapat memahami fungsi kaki tumpu dan mempraktikkan operan mendatar menggunakan kaki bagian dalam secara akurat dan sportif bersama pasangan.',
    levelBloom: 'C3 - Menerapkan / Mengaplikasikan (Applying)',
    dimensi: ['Kolaborasi', 'Penalaran Kritis', 'Kemandirian', 'Kesehatan'],
    alokasiWaktu: '2 × 40 Menit (1 Pertemuan)',
    konteksLokal: 'Lapangan rumput sekolah dengan tantangan sasaran gawang corong (cone).',
  },
  {
    label: '🏃 PJOK SMP: Kebugaran Jantung-Paru',
    mapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    jenjang: 'SMP',
    kelas: 'Kelas VII',
    fase: 'Fase D',
    topik: 'Latihan Daya Tahan Kardiorespirasi dan Analisis Zona Denyut Nadi Latihan',
    tujuan: 'Peserta didik dapat menganalisis respons denyut nadi latihan setelah sirkuit training dan menyusun target latihan kebugaran mandiri.',
    levelBloom: 'C4 - Menganalisis (Analyzing)',
    dimensi: ['Kesehatan', 'Penalaran Kritis', 'Kemandirian'],
    alokasiWaktu: '2 × 40 Menit (1 Pertemuan)',
    konteksLokal: 'Pengukuran denyut nadi di arteri radialis pergelangan tangan usai jogging mengelilingi lapangan.',
  },
  {
    label: '🏐 PJOK SMA: Taktik Serangan Bola Voli',
    mapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    jenjang: 'SMA',
    kelas: 'Kelas XI',
    fase: 'Fase F',
    topik: 'Analisis dan Evaluasi Taktik Penyerangan dan Penempatan Posisi Bola Voli',
    tujuan: 'Peserta didik dapat mengevaluasi efektivitas variasi pola penyerangan (quick spike, open spike) terhadap sistem pertahanan lawan dalam simulasi permainan 6 vs 6.',
    levelBloom: 'C5 - Mengevaluasi / Merefleksi (Evaluating)',
    dimensi: ['Kolaborasi', 'Penalaran Kritis', 'Komunikasi', 'Kesehatan'],
    alokasiWaktu: '2 × 45 Menit (1 Pertemuan)',
    konteksLokal: 'Pertandingan internal antarkelas dengan rotasi pemain dan evaluasi video slow-motion.',
  },
  {
    label: '🌿 IPAS SD: Ekosistem Sawah',
    mapel: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    jenjang: 'SD',
    kelas: 'Kelas V',
    fase: 'Fase C',
    topik: 'Rantai Makanan dan Keseimbangan Aliran Energi pada Ekosistem Sawah',
    tujuan: 'Peserta didik dapat memahami peran produsen, konsumen, dan dekomposer serta menganalisis dampak kepunahan salah satu populasi bagi petani.',
    levelBloom: 'C2 - Memahami (Understanding)',
    dimensi: ['Penalaran Kritis', 'Kewargaan', 'Kemandirian'],
    alokasiWaktu: '2 × 35 Menit (1 Pertemuan)',
    konteksLokal: 'Sawah tadah hujan di sekitar desa dengan pengamatan belalang, katak, dan ular sawah.',
  },
];

export function MateriAjarGenerator() {
  const [mapel, setMapel] = useState<string>('Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)');
  const [jenjang, setJenjang] = useState<string>('SD');
  const [kelas, setKelas] = useState<string>('Kelas V');
  const [fase, setFase] = useState<string>('Fase C');
  const [topik, setTopik] = useState<string>('Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola');
  const [tujuan, setTujuan] = useState<string>(
    'Peserta didik dapat memahami fungsi kaki tumpu dan mempraktikkan operan mendatar menggunakan kaki bagian dalam secara akurat dan sportif bersama pasangan.'
  );
  const [levelBloom, setLevelBloom] = useState<string>('C3 - Menerapkan / Mengaplikasikan (Applying)');
  const [dimensi, setDimensi] = useState<string[]>(['Kolaborasi', 'Penalaran Kritis', 'Kemandirian', 'Kesehatan']);
  const [alokasiWaktu, setAlokasiWaktu] = useState<string>('2 × 40 Menit (1 Pertemuan)');
  const [konteksLokal, setKonteksLokal] = useState<string>('Lapangan rumput sekolah dengan tantangan sasaran gawang corong (cone).');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'reader' | 'markdown'>('reader');

  const [materiData, setMateriData] = useState<MateriAjarData>(() =>
    getFallbackMateriAjarData()
  );

  const toggleDimensi = (dim: string) => {
    if (dimensi.includes(dim)) {
      if (dimensi.length > 1) {
        setDimensi(dimensi.filter((d) => d !== dim));
      }
    } else {
      setDimensi([...dimensi, dim]);
    }
  };

  const applyPreset = (p: PresetOption) => {
    setMapel(p.mapel);
    setJenjang(p.jenjang);
    setKelas(p.kelas);
    setFase(p.fase);
    setTopik(p.topik);
    setTujuan(p.tujuan);
    setLevelBloom(p.levelBloom);
    setDimensi(p.dimensi);
    setAlokasiWaktu(p.alokasiWaktu);
    setKonteksLokal(p.konteksLokal);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await postJsonSafe<{ data?: MateriAjarData }>(
        '/api/gemini/generate-materi-ajar',
        {
          mapel,
          jenjang,
          kelas,
          fase,
          topik,
          tujuanPembelajaran: tujuan,
          levelBloom,
          dimensiProfilLulusan: dimensi,
          alokasiWaktu,
          konteksLokal,
        }
      );
      if (res.data?.data) {
        setMateriData(res.data.data);
      } else {
        setMateriData(
          getFallbackMateriAjarData(
            mapel,
            jenjang,
            kelas,
            fase,
            topik,
            tujuan,
            levelBloom,
            dimensi
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFullMarkdown = (): string => {
    const d = materiData;
    return `# ${d.identitas.judulMateri}

**Mata Pelajaran:** ${d.identitas.mataPelajaran}  
**Jenjang / Kelas / Fase:** ${d.identitas.jenjang} / ${d.identitas.kelas} / ${d.identitas.fase}  
**Topik Pembelajaran:** ${d.identitas.topikPembelajaran}  
**Alokasi Waktu:** ${d.identitas.alokasiWaktu || '2 × 40 Menit'}  
**Level Kognitif (Taksonomi Bloom):** ${d.identitas.levelBloom}  
**Dimensi Profil Lulusan:** ${d.identitas.dimensiProfilLulusan.join(', ')}  

---

## A. TUJUAN PEMBELAJARAN
${d.identitas.tujuanPembelajaran}

---

## B. PENDAHULUAN & APERSEPSI
${d.pendahuluan.kalimatApersepsi}

${d.pendahuluan.analogiMenarik ? `> **Analogi Konseptual:** ${d.pendahuluan.analogiMenarik}\n` : ''}

**Pertanyaan Pemantik:**
${d.pendahuluan.pertanyaanPemantik.map((q, i) => `${i + 1}. ${q}`).join('\n')}

---

## C. ISI MATERI PEMBELAJARAN

### 1. Konsep dan Fakta Utama
${d.isiMateri.konsepUtama
  .map(
    (k) => `#### ${k.subjudul}
${k.penjelasan}
${k.faktaKunci ? `- **Fakta Kunci:** ${k.faktaKunci}` : ''}
${k.analogiAtauContoh ? `- **Contoh / Analogi:** ${k.analogiAtauContoh}` : ''}`
  )
  .join('\n\n')}

### 2. Prosedur dan Langkah Praktik
${d.isiMateri.prosedurDanLangkah
  .map(
    (p, i) => `**${p.tahap}**
- Langkah: ${p.langkah}
${p.tipsPenting ? `- *Tips Penting:* ${p.tipsPenting}` : ''}`
  )
  .join('\n\n')}

### 3. Contoh Konkret & Studi Kasus
${d.isiMateri.contohKonkret
  .map(
    (c) => `**${c.judulKasus}**
- Deskripsi: ${c.deskripsi}
- Pelajaran Berharga: ${c.pelajaran}`
  )
  .join('\n\n')}

${
  d.isiMateri.miskonsepsiUmum && d.isiMateri.miskonsepsiUmum.length > 0
    ? `### 4. Miskonsepsi Umum vs Fakta Benar
${d.isiMateri.miskonsepsiUmum
  .map(
    (m) => `- ❌ **Salah Paham:** ${m.salahPaham}
  ✅ **Penjelasan Benar:** ${m.penjelasanBenar}`
  )
  .join('\n\n')}`
    : ''
}

---

## D. AKTIVITAS BELAJAR AKTIF & LATIHAN MANDIRI
${d.aktivitasDanLatihan.instruksiAktivitas}

**Tugas Mandiri / Kelompok:**
${d.aktivitasDanLatihan.tugasMandiriAtauKelompok.map((t, i) => `${i + 1}. ${t}`).join('\n')}

**Pertanyaan Cek Pemahaman:**
${d.aktivitasDanLatihan.pertanyaanCekPemahaman
  .map(
    (s, i) => `${i + 1}. **[${s.levelKognitif}]** ${s.soal}
   *Petunjuk Jawaban:* ${s.petunjukJawaban || '-'}`
  )
  .join('\n\n')}

---

## E. RANGKUMAN & REFLEKSI
**Poin-Poin Kunci:**
${d.penutup.rangkumanPoinKunci.map((r) => `- ${r}`).join('\n')}

**Pesan Motivasi:**
${d.penutup.pesanMotivasi}

**Titimangsa:** ${d.penutup.titimangsa}  
**Penyusun:** ${d.penutup.penyusun}
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildExportHtml = () => {
    const title = materiData.identitas.judulMateri || 'Materi_Ajar_v1';
    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${escapeHtml(title)}</title>
        <style>
          @page { size: A4 portrait; margin: 2cm; }
          body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; color: #0f172a; line-height: 1.55; font-size: 11pt; }
          h1 { color: #0f766e; font-size: 17pt; text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 8px; margin-bottom: 12px; }
          h2 { color: #0d9488; font-size: 13pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 16px; page-break-after: avoid; }
          h3 { color: #1e293b; font-size: 11.5pt; margin-top: 12px; page-break-after: avoid; }
          table { width: 100%; border-collapse: collapse; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; break-inside: avoid; }
          .identity-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10pt; }
          .identity-table td { padding: 5px 8px; border: 1px solid #475569; vertical-align: top; }
          .identity-table tr:nth-child(even) { background-color: #f8fafc; }
          .box-apersepsi { background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 10px; margin: 10px 0; font-style: italic; page-break-inside: avoid; }
          .box-prosedur { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; margin: 8px 0; page-break-inside: avoid; }
          .badge { background-color: #ccfbf1; color: #0f766e; padding: 2px 6px; border-radius: 4px; font-size: 9pt; font-weight: bold; }
          .footer { margin-top: 24px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 9.5pt; color: #475569; page-break-inside: avoid; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(materiData.identitas.judulMateri)}</h1>
        
        <table class="identity-table">
          <tbody>
            <tr>
              <td width="25%"><strong>Mata Pelajaran:</strong></td>
              <td width="35%">${escapeHtml(materiData.identitas.mataPelajaran)}</td>
              <td width="20%"><strong>Jenjang / Kelas:</strong></td>
              <td width="20%">${escapeHtml(materiData.identitas.jenjang)} / ${escapeHtml(materiData.identitas.kelas)}</td>
            </tr>
            <tr>
              <td><strong>Fase Kurikulum:</strong></td>
              <td>${escapeHtml(materiData.identitas.fase)}</td>
              <td><strong>Alokasi Waktu:</strong></td>
              <td>${escapeHtml(materiData.identitas.alokasiWaktu || '2 × 40 Menit')}</td>
            </tr>
            <tr>
              <td><strong>Level Taksonomi Bloom:</strong></td>
              <td>${escapeHtml(materiData.identitas.levelBloom)}</td>
              <td><strong>Topik:</strong></td>
              <td>${escapeHtml(materiData.identitas.topikPembelajaran)}</td>
            </tr>
            <tr>
              <td colspan="4"><strong>Dimensi Profil Lulusan:</strong> ${escapeHtml(materiData.identitas.dimensiProfilLulusan.join(', '))}</td>
            </tr>
          </tbody>
        </table>

        <h2>A. TUJUAN PEMBELAJARAN</h2>
        <p>${escapeHtml(materiData.identitas.tujuanPembelajaran)}</p>

        <h2>B. PENDAHULUAN &amp; APERSEPSI</h2>
        <div class="box-apersepsi">
          <p>${escapeHtml(materiData.pendahuluan.kalimatApersepsi)}</p>
          ${materiData.pendahuluan.analogiMenarik ? `<p><strong>Analogi Konseptual:</strong> ${escapeHtml(materiData.pendahuluan.analogiMenarik)}</p>` : ''}
        </div>
        <p><strong>Pertanyaan Pemantik:</strong></p>
        <ol>
          ${materiData.pendahuluan.pertanyaanPemantik.map((q) => `<li>${escapeHtml(q)}</li>`).join('')}
        </ol>

        <h2>C. ISI MATERI PEMBELAJARAN</h2>
        <h3>1. Konsep Utama &amp; Fakta Kunci</h3>
        ${materiData.isiMateri.konsepUtama
          .map(
            (k) => `
          <div style="margin-bottom: 10px;">
            <strong>${escapeHtml(k.subjudul)}</strong>
            <p>${escapeHtml(k.penjelasan)}</p>
            ${k.faktaKunci ? `<p><em>Fakta Kunci:</em> ${escapeHtml(k.faktaKunci)}</p>` : ''}
            ${k.analogiAtauContoh ? `<p><em>Contoh/Analogi:</em> ${escapeHtml(k.analogiAtauContoh)}</p>` : ''}
          </div>
        `
          )
          .join('')}

        <h3>2. Prosedur dan Langkah Praktik</h3>
        ${materiData.isiMateri.prosedurDanLangkah
          .map(
            (p) => `
          <div class="box-prosedur">
            <strong>${escapeHtml(p.tahap)}</strong>
            <p>${escapeHtml(p.langkah)}</p>
            ${p.tipsPenting ? `<p style="color: #0d9488;"><em>Tips Penting:</em> ${escapeHtml(p.tipsPenting)}</p>` : ''}
          </div>
        `
          )
          .join('')}

        <h3>3. Contoh Konkret &amp; Studi Kasus</h3>
        ${materiData.isiMateri.contohKonkret
          .map(
            (c) => `
          <div style="margin-bottom: 8px;">
            <strong>${escapeHtml(c.judulKasus)}</strong>
            <p>${escapeHtml(c.deskripsi)}</p>
            <p><strong>Pelajaran Berharga:</strong> ${escapeHtml(c.pelajaran)}</p>
          </div>
        `
          )
          .join('')}

        ${
          materiData.isiMateri.miskonsepsiUmum && materiData.isiMateri.miskonsepsiUmum.length > 0
            ? `
          <h3>4. Miskonsepsi Umum vs Penjelasan Benar</h3>
          <ul>
            ${materiData.isiMateri.miskonsepsiUmum
              .map(
                (m) => `
              <li><strong>Salah Paham:</strong> ${escapeHtml(m.salahPaham)}<br/>
              <strong>Penjelasan Benar:</strong> ${escapeHtml(m.penjelasanBenar)}</li>
            `
              )
              .join('')}
          </ul>
        `
            : ''
        }

        <h2>D. AKTIVITAS BELAJAR AKTIF &amp; LATIHAN</h2>
        <p>${escapeHtml(materiData.aktivitasDanLatihan.instruksiAktivitas)}</p>
        <p><strong>Tugas Mandiri / Kelompok:</strong></p>
        <ul>
          ${materiData.aktivitasDanLatihan.tugasMandiriAtauKelompok.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
        </ul>
        <p><strong>Pertanyaan Cek Pemahaman:</strong></p>
        <ol>
          ${materiData.aktivitasDanLatihan.pertanyaanCekPemahaman
            .map((s) => `<li><strong>[${escapeHtml(s.levelKognitif)}]</strong> ${escapeHtml(s.soal)}<br/><em>Petunjuk:</em> ${escapeHtml(s.petunjukJawaban || '-')}</li>`)
            .join('')}
        </ol>

        <h2>E. RANGKUMAN &amp; REFLEKSI</h2>
        <ul>
          ${materiData.penutup.rangkumanPoinKunci.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}
        </ul>
        <p><em>${escapeHtml(materiData.penutup.pesanMotivasi)}</em></p>

        <div class="footer">
          <p style="text-align: right;">
            ${escapeHtml(materiData.penutup.titimangsa)}<br/>
            <strong>Guru Pengampu:</strong><br/><br/><br/>
            ${escapeHtml(materiData.penutup.penyusun)}
          </p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Materi Ajar Terstruktur & Utuh (v1)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Generator Materi Ajar Lengkap (v1)
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Susun bahan ajar komprehensif mengacu pada <strong className="text-emerald-300">Tujuan Pembelajaran</strong>, selaras dengan <strong className="text-teal-300">Level Taksonomi Bloom</strong>, dan terintegrasi <strong className="text-cyan-300">Dimensi Profil Lulusan</strong>. Dilengkapi pendahuluan kontekstual, konsep esensial, prosedur gerak, analogi ramah anak, dan latihan mandiri aktif.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto shrink-0 no-print">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors cursor-pointer shadow-sm"
              title="Salin Teks Lengkap"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Tersalin!' : 'Salin Markdown'}</span>
            </button>
            <DocumentExportToolbar
              filename={`Materi_Ajar_${(materiData.identitas.judulMateri || 'Materi_Ajar').replace(/\s+/g, '_')}`}
              title={materiData.identitas.judulMateri || 'Materi Ajar'}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-4 no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <h2 className="font-bold text-sm text-white">Parameter Bahan Ajar</h2>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full font-medium">
                Prompt Terstandar v1
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Muat Contoh Cepat:</span>
                <span className="text-[10px] text-slate-500">1-Klik Siap Pakai</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors font-medium cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mata Pelajaran, Jenjang, Kelas, Fase */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Mata Pelajaran (MAPEL)
                </label>
                <input
                  type="text"
                  value={mapel}
                  onChange={(e) => setMapel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  placeholder="Contoh: Pendidikan Jasmani, Olahraga, dan Kesehatan"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Jenjang Pendidikan
                </label>
                <select
                  value={jenjang}
                  onChange={(e) => setJenjang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="SD">SD (Sekolah Dasar)</option>
                  <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                  <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                  <option value="SMK">SMK (Sekolah Menengah Kejuruan)</option>
                </select>
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
                    className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                    placeholder="Kelas V"
                  />
                  <input
                    type="text"
                    value={fase}
                    onChange={(e) => setFase(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                    placeholder="Fase C"
                  />
                </div>
              </div>
            </div>

            {/* Topik Pembelajaran */}
            <div className="space-y-1 text-xs">
              <label className="text-[11px] font-medium text-slate-300 block">
                Topik Pembelajaran
              </label>
              <input
                type="text"
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none font-semibold text-emerald-300"
                placeholder="Contoh: Variasi dan Kombinasi Gerak Dasar Menendang dan Menghentikan Bola"
              />
            </div>

            {/* Tujuan Pembelajaran */}
            <div className="space-y-1 text-xs">
              <label className="text-[11px] font-medium text-slate-300 block">
                Tujuan Pembelajaran (Acuan Utama)
              </label>
              <textarea
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 leading-relaxed focus:border-emerald-500 focus:outline-none"
                placeholder="Tuliskan tujuan pembelajaran spesifik yang ingin dicapai siswa..."
              />
            </div>

            {/* Level Taksonomi Bloom */}
            <div className="space-y-1 text-xs">
              <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
                <span>Level Kognitif (Taksonomi Bloom)</span>
                <span className="text-[10px] text-teal-400 font-semibold">Hierarki Kognitif</span>
              </label>
              <select
                value={levelBloom}
                onChange={(e) => setLevelBloom(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none font-medium"
              >
                {BLOOM_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl} className="bg-slate-900 text-slate-100">
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Dimensi Profil Lulusan */}
            <div className="space-y-2 text-xs">
              <label className="text-[11px] font-medium text-slate-300 block">
                Dimensi Profil Lulusan (Pilih yang Relevan):
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {DIMENSI_LIST.map((dim) => {
                  const isChecked = dimensi.includes(dim);
                  return (
                    <button
                      key={dim}
                      type="button"
                      onClick={() => toggleDimensi(dim)}
                      className={`text-[11px] p-2 rounded-lg text-left transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isChecked
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                          isChecked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
                        }`}
                      >
                        {isChecked && '✓'}
                      </div>
                      <span className="truncate">{dim}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alokasi Waktu & Konteks Nyata */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Alokasi Waktu
                </label>
                <input
                  type="text"
                  value={alokasiWaktu}
                  onChange={(e) => setAlokasiWaktu(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  placeholder="2 × 40 Menit"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Konteks Nyata / Lingkungan
                </label>
                <input
                  type="text"
                  value={konteksLokal}
                  onChange={(e) => setKonteksLokal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  placeholder="Contoh: Lapangan terbuka sekolah"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !topik.trim() || !tujuan.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyusun Materi Ajar Lengkap & Utuh...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Materi Ajar Lengkap (v1)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Materi Ajar Display (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tab Selector & Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md flex items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('reader')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'reader'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Mode Pembaca (Reader View)</span>
              </button>
              <button
                onClick={() => setActiveTab('markdown')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'markdown'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Naskah Markdown</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Format Siap Digunakan Langsung di Kelas / Mandiri
            </span>
          </div>

          {/* Reader View */}
          {activeTab === 'reader' && (
            <div className="bg-white text-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 print:p-0 print:border-none print:shadow-none">
              {/* Header Materi */}
              <div className="border-b-2 border-emerald-600 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Bahan Ajar Pembelajaran Aktif
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {materiData.identitas.levelBloom}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {materiData.identitas.judulMateri}
                </h1>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  {materiData.identitas.mataPelajaran} &bull; {materiData.identitas.jenjang} ({materiData.identitas.kelas} / {materiData.identitas.fase}) &bull; Waktu: {materiData.identitas.alokasiWaktu || '2 × 40 Menit'}
                </p>

                {/* Profil Lulusan Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 self-center mr-1">
                    Dimensi Profil:
                  </span>
                  {materiData.identitas.dimensiProfilLulusan.map((dim, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200"
                    >
                      {dim}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bagian A: Tujuan Pembelajaran */}
              <div className="bg-emerald-50/70 border-l-4 border-emerald-600 p-4 rounded-r-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-1">
                  <Target className="w-4 h-4 text-emerald-700" />
                  <span>A. TUJUAN PEMBELAJARAN</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {materiData.identitas.tujuanPembelajaran}
                </p>
              </div>

              {/* Bagian B: Pendahuluan & Apersepsi */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>B. PENDAHULUAN & APERSEPSI</span>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-200/70 space-y-3">
                  <p className="first-letter:text-xl first-letter:font-bold first-letter:text-amber-800">
                    {materiData.pendahuluan.kalimatApersepsi}
                  </p>

                  {materiData.pendahuluan.analogiMenarik && (
                    <div className="p-3 bg-white rounded-lg border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900 italic font-medium">
                      <Quote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{materiData.pendahuluan.analogiMenarik}</span>
                    </div>
                  )}

                  {/* Pertanyaan Pemantik */}
                  <div>
                    <span className="text-[11px] font-bold text-amber-900 block mb-1.5">
                      ❓ Pertanyaan Pemantik Rasa Ingin Tahu:
                    </span>
                    <ul className="space-y-1">
                      {materiData.pendahuluan.pertanyaanPemantik.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-800">
                          <span className="text-amber-600 font-bold shrink-0">{idx + 1}.</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bagian C: Isi Materi Sistematis */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  <span>C. ISI MATERI PEMBELAJARAN</span>
                </div>

                {/* 1. Konsep Utama */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                    1. Konsep Pokok & Fakta Kunci
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {materiData.isiMateri.konsepUtama.map((konsep, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-2 text-xs"
                      >
                        <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-teal-600 text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">
                            {idx + 1}
                          </span>
                          <span>{konsep.subjudul}</span>
                        </h4>
                        <p className="text-slate-700 leading-relaxed pl-7">{konsep.penjelasan}</p>
                        {konsep.faktaKunci && (
                          <div className="ml-7 p-2 rounded-lg bg-teal-50/80 border border-teal-200 text-slate-700">
                            <strong className="text-teal-800">📌 Fakta Kunci:</strong> {konsep.faktaKunci}
                          </div>
                        )}
                        {konsep.analogiAtauContoh && (
                          <div className="ml-7 p-2 rounded-lg bg-indigo-50/80 border border-indigo-200 text-slate-700 italic">
                            <strong className="text-indigo-800 not-italic">💡 Contoh / Analogi:</strong>{' '}
                            {konsep.analogiAtauContoh}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Prosedur dan Langkah Praktis */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                    2. Prosedur Langkah Gerak / Praktik Step-by-Step
                  </h3>
                  <div className="space-y-2.5">
                    {materiData.isiMateri.prosedurDanLangkah.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-gradient-to-r from-teal-50/50 via-white to-slate-50 border border-teal-200/80 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2 font-bold text-teal-900 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-teal-600 text-white font-extrabold text-[10px]">
                            Langkah {idx + 1}
                          </span>
                          <span>{p.tahap}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed pl-2">{p.langkah}</p>
                        {p.tipsPenting && (
                          <div className="mt-2 ml-2 text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5">
                            <span>⚡</span>
                            <span>Tips Penting: {p.tipsPenting}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Contoh Konkret & Studi Kasus */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                    3. Contoh Konkret & Skenario Lapangan
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {materiData.isiMateri.contohKonkret.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                      >
                        <strong className="text-slate-900 block font-bold text-xs">
                          {c.judulKasus}
                        </strong>
                        <p className="text-slate-600 leading-relaxed">{c.deskripsi}</p>
                        <div className="pt-1 text-[11px] font-medium text-emerald-700 border-t border-slate-200">
                          <strong>Pelajaran:</strong> {c.pelajaran}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Miskonsepsi Umum */}
                {materiData.isiMateri.miskonsepsiUmum &&
                  materiData.isiMateri.miskonsepsiUmum.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>4. Miskonsepsi Umum vs Penjelasan Ilmiah</span>
                      </h3>
                      <div className="space-y-2">
                        {materiData.isiMateri.miskonsepsiUmum.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-xs grid grid-cols-1 md:grid-cols-2 gap-2"
                          >
                            <div className="text-rose-900">
                              <span className="font-bold block text-[11px]">❌ Sering Disalahpahami:</span>
                              <p className="mt-0.5">{m.salahPaham}</p>
                            </div>
                            <div className="text-emerald-900 border-t md:border-t-0 md:border-l border-rose-200 pt-2 md:pt-0 md:pl-3">
                              <span className="font-bold block text-[11px]">✅ Penjelasan yang Benar:</span>
                              <p className="mt-0.5">{m.penjelasanBenar}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Bagian D: Aktivitas Belajar Aktif & Latihan */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>D. AKTIVITAS BELAJAR AKTIF & CEK PEMAHAMAN</span>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-3 text-xs">
                  <p className="font-semibold text-indigo-950">
                    {materiData.aktivitasDanLatihan.instruksiAktivitas}
                  </p>

                  <div>
                    <span className="text-[11px] font-bold text-indigo-900 block mb-1">
                      Tantangan Aktivitas Mandiri / Kelompok:
                    </span>
                    <ul className="space-y-1">
                      {materiData.aktivitasDanLatihan.tugasMandiriAtauKelompok.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-800">
                          <span className="text-indigo-600 font-bold shrink-0">▸</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-indigo-200/60">
                    <span className="text-[11px] font-bold text-indigo-900 block mb-2">
                      Soal Cek Pemahaman Kognitif:
                    </span>
                    <div className="space-y-2">
                      {materiData.aktivitasDanLatihan.pertanyaanCekPemahaman.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-white rounded-lg border border-indigo-200 shadow-2xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-extrabold text-indigo-700">Soal #{idx + 1}</span>
                            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                              {s.levelKognitif}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800">{s.soal}</p>
                          {s.petunjukJawaban && (
                            <p className="text-[11px] text-slate-500 italic">
                              Petunjuk: {s.petunjukJawaban}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bagian E: Rangkuman & Penutup */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>E. RANGKUMAN & MUTIARA KARAKTER</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <ul className="space-y-1.5">
                    {materiData.penutup.rangkumanPoinKunci.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                        <span className="font-medium">{r}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-100/60 to-teal-100/60 border border-emerald-300 text-emerald-950 font-bold italic text-center">
                    {materiData.penutup.pesanMotivasi}
                  </div>

                  <div className="flex justify-between items-end pt-3 text-[10px] text-slate-500">
                    <div>Standar Kurikulum Merdeka &bull; SADARPJOK v1</div>
                    <div className="text-right">
                      {materiData.penutup.titimangsa}<br />
                      <strong>Guru Pengampu: {materiData.penutup.penyusun}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Markdown Raw View */}
          {activeTab === 'markdown' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span>Naskah Markdown Lengkap & Terstruktur</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin Semua'}</span>
                </button>
              </div>
              <textarea
                readOnly
                value={getFullMarkdown()}
                rows={22}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
