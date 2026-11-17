'use client';

import React, { useState, useRef } from 'react';
import { 
  Sparkles, Copy, Check, 
  Upload, RefreshCw, Eye, Layers, BookOpen, User, 
  School, CheckCircle2, AlertCircle, FileCheck, HelpCircle,
  ChevronLeft, ChevronRight, Bookmark, X
} from 'lucide-react';
import { 
  KartuSoalDocData, 
  KartuSoalItem, 
  buildKartuSoalFromInput,
  getDefaultKartuSoalDocData, 
  getPjokKartuSoalDocData 
} from '@/lib/kartu-soal-types';
import { DocumentExportToolbar } from './DocumentExportToolbar';
import { escapeHtml } from '@/lib/export-utils';
import { postJsonSafe } from '@/lib/api-client';

export function KartuSoalGenerator() {
  const [docData, setDocData] = useState<KartuSoalDocData>(() => getDefaultKartuSoalDocData());
  const [namaSekolah, setNamaSekolah] = useState<string>('SMP MERDEKA');
  const [namaPenyusun, setNamaPenyusun] = useState<string>('Lendi Ike Hermawan, S.Pd.');
  const [mataPelajaran, setMataPelajaran] = useState<string>('MATEMATIKA');
  const [kelas, setKelas] = useState<string>('8G');
  const [semester, setSemester] = useState<string>('2');
  const [kurikulum, setKurikulum] = useState<string>('MERDEKA');
  const [tahunPelajaran, setTahunPelajaran] = useState<string>('2025 / 2026');
  const [bentukSoal, setBentukSoal] = useState<string>('Pilihan Ganda');
  const [bukuSumber, setBukuSumber] = useState<string>('MATEMATIKA untuk SMP/MTS kelas VIII , Penerbit Erlangga');
  const [digunakanUntuk, setDigunakanUntuk] = useState<string>('ASTS');
  const [jumlahSiswa, setJumlahSiswa] = useState<string>('32');
  
  const [teksSoalInput, setTeksSoalInput] = useState<string>(
`SOAL 1:
Rumus Pythagoras yang tepat untuk segitiga siku-siku dengan sisi siku-siku x, y dan sisi miring z adalah...
a. z² = x² - y²
b. z² = x² + y²
c. x² = z² + y²
d. y² = x² + z²
Kunci: B

SOAL 2:
Sebuah segitiga siku-siku memiliki panjang sisi siku-siku masing-masing 6 cm dan 8 cm. Panjang sisi miring segitiga tersebut adalah...
a. 10 cm
b. 12 cm
c. 14 cm
d. 16 cm
Kunci: A

SOAL 3:
Di antara kelompok tiga bilangan berikut, yang merupakan tripel Pythagoras adalah...
a. 4, 5, 6
b. 5, 12, 13
c. 7, 24, 26
d. 8, 15, 18
Kunci: B`
  );

  const [instruksiKhusus, setInstruksiKhusus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setTeksSoalInput(content);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyPresetMatematika = () => {
    const defaultData = getDefaultKartuSoalDocData();
    setDocData(defaultData);
    setNamaSekolah(defaultData.namaSekolah);
    setNamaPenyusun(defaultData.namaPenyusun);
    setMataPelajaran(defaultData.mataPelajaran);
    setKelas(defaultData.kelas);
    setSemester(defaultData.semester);
    setKurikulum(defaultData.kurikulum);
    setTahunPelajaran(defaultData.tahunPelajaran);
    setBentukSoal(defaultData.bentukSoal);
    setBukuSumber(defaultData.bukuSumberDefault);
    setDigunakanUntuk('ASTS');
  };

  const handleApplyPresetPjok = () => {
    const pjokData = getPjokKartuSoalDocData();
    setDocData(pjokData);
    setNamaSekolah(pjokData.namaSekolah);
    setNamaPenyusun(pjokData.namaPenyusun);
    setMataPelajaran(pjokData.mataPelajaran);
    setKelas(pjokData.kelas);
    setSemester(pjokData.semester);
    setKurikulum(pjokData.kurikulum);
    setTahunPelajaran(pjokData.tahunPelajaran);
    setBentukSoal(pjokData.bentukSoal);
    setBukuSumber(pjokData.bukuSumberDefault);
    setDigunakanUntuk('ASAS');
  };

  const handleGenerateKartuSoal = async () => {
    setIsLoading(true);
    setGenerationNotice(null);
    const parsedJumlahSiswa = parseInt(jumlahSiswa) || 32;
    try {
      const res = await postJsonSafe<{
        data?: KartuSoalDocData;
        warning?: string;
        isFallback?: boolean;
      }>('/api/gemini/generate-kartu-soal', {
        teksSoal: teksSoalInput,
        namaSekolah,
        namaPenyusun,
        mataPelajaran,
        kelas,
        semester,
        kurikulum,
        tahunPelajaran,
        bentukSoal,
        bukuSumber,
        digunakanUntuk,
        jumlahSiswa: parsedJumlahSiswa,
        instruksiKhusus,
      });

      if (res.data?.data && res.data.data.items && res.data.data.items.length > 0) {
        setDocData(res.data.data);
        setActiveCardIndex(0);
        if (res.data.warning) {
          setGenerationNotice(res.data.warning);
        }
      } else {
        setDocData(
          buildKartuSoalFromInput({
            teksSoal: teksSoalInput,
            namaSekolah,
            namaPenyusun,
            mataPelajaran,
            kelas,
            semester,
            kurikulum,
            tahunPelajaran,
            bentukSoal,
            bukuSumber,
            digunakanUntuk,
            jumlahSiswa: parsedJumlahSiswa,
            instruksiKhusus,
          })
        );
        setActiveCardIndex(0);
        setGenerationNotice(
          res.error || 'Menggunakan penyusun kartu soal lokal sesuai teks soal dan perintah Anda.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    const promptText = `Berdasarkan soal yang saya unggah, susunlah kartu soal dengan mengacu pada format dan struktur yang terdapat pada contoh file yang akan saya unggah. Analisis terlebih dahulu format pada file tersebut, kemudian sesuaikan setiap komponen kartu soal agar mengikuti struktur yang sama. Isi kartu soal harus memuat informasi lengkap yang biasanya terdapat pada kartu soal, seperti: mata pelajaran, kelas/fase, materi, indikator soal, level kognitif, bentuk soal, nomor soal, butir soal, pilihan jawaban (A, B, C, D), kunci jawaban, serta pembahasan singkat. Pastikan setiap butir soal pada kartu soal sesuai dengan indikator pada kisi-kisi dan mencerminkan level kognitif yang telah ditentukan. Gunakan bahasa yang jelas, sistematis, dan siap digunakan sebagai dokumen administrasi penilaian. Tampilkan hasilnya dalam bentuk tabel atau format kartu soal yang rapi mengikuti contoh file yang diunggah sehingga dapat langsung digunakan atau disalin ke dalam dokumen resmi.${instruksiKhusus.trim() ? `\n\nPerintah / Instruksi Khusus:\n${instruksiKhusus.trim()}` : ''}

Unggah Soal yang telah dibuat dan juga format Tabel Kartu Soal yang disediakan`;

    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildExportHtml = () => {
    const d = docData;
    const title = `Kartu_Soal_${d.mataPelajaran}_${d.kelas}_${d.tahunPelajaran.replace(/\s+/g, '')}`.replace(/\s+/g, '_');

    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${escapeHtml(title)}</title>
        <style>
          @page { size: A4 portrait; margin: 1.5cm; }
          body { font-family: 'Times New Roman', Calibri, Arial, serif; color: #000; font-size: 11pt; line-height: 1.3; }
          .judul-doc { text-align: center; font-weight: bold; font-size: 13pt; margin-bottom: 2px; text-transform: uppercase; }
          .subjudul-doc { text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 16px; }
          
          .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11pt; }
          .meta-table td { padding: 3px 4px; vertical-align: top; border: none; }
          
          .kartu-container { border: 2px solid #000; margin-bottom: 24px; page-break-after: always; }
          .kartu-table { width: 100%; border-collapse: collapse; font-size: 10.5pt; }
          .kartu-table tr { page-break-inside: avoid; break-inside: avoid; }
          .kartu-table td, .kartu-table th { border: 1px solid #000; padding: 8px 10px; vertical-align: top; }
          
          .keterangan-title { background-color: #f1f5f9; font-weight: bold; text-align: center; font-size: 10pt; text-transform: uppercase; letter-spacing: 0.5px; }
          .keterangan-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; text-align: center; }
          .keterangan-table thead { display: table-header-group; }
          .keterangan-table tr { page-break-inside: avoid; break-inside: avoid; }
          .keterangan-table th, .keterangan-table td { border: 1px solid #000; padding: 5px 4px; }
          .keterangan-table th { background-color: #f1f5f9; font-weight: bold; }
          
          .pilihan-grid { margin-top: 8px; margin-left: 10px; }
          .pilihan-grid td { border: none !important; padding: 2px 8px !important; }
        </style>
      </head>
      <body>
        ${d.items
          .map(
            (item) => `
          <div class="judul-doc">${escapeHtml(d.judul)}</div>
          <div class="subjudul-doc">TAHUN PELAJARAN ${escapeHtml(d.tahunPelajaran)}</div>

          <table class="meta-table">
            <tr>
              <td width="20%">NAMA SEKOLAH</td>
              <td width="35%">: ${escapeHtml(d.namaSekolah)}</td>
              <td width="22%">NAMA PENYUSUN</td>
              <td width="23%">: ${escapeHtml(d.namaPenyusun)}</td>
            </tr>
            <tr>
              <td>MATA PELAJARAN</td>
              <td>: ${escapeHtml(d.mataPelajaran)}</td>
              <td>BENTUK SOAL</td>
              <td>: ${escapeHtml(d.bentukSoal)}</td>
            </tr>
            <tr>
              <td>KELAS</td>
              <td>: ${escapeHtml(d.kelas)}</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>SEMESTER</td>
              <td>: ${escapeHtml(d.semester)}</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>KURIKULUM</td>
              <td>: ${escapeHtml(d.kurikulum)}</td>
              <td></td>
              <td></td>
            </tr>
          </table>

          <table class="kartu-table" style="margin-bottom: 16px;">
            <tbody>
              <tr>
                <td width="40%" style="vertical-align: top;">
                  <strong>Tujuan Pembelajaran:</strong><br/>
                  ${escapeHtml(item.tujuanPembelajaran).replace(/\n/g, '<br/>')}
                  <br/><br/>
                  <strong>Indikator Soal:</strong><br/>
                  ${escapeHtml(item.indikatorSoal)}
                  <br/><br/>
                  <strong>Materi :</strong><br/>
                  ${escapeHtml(item.materi)}
                </td>
                <td width="60%" style="vertical-align: top;">
                  <div style="border-bottom: 1px solid #000; padding-bottom: 6px; margin-bottom: 8px;">
                    <strong>Buku Sumber :</strong> ${escapeHtml(item.bukuSumber || d.bukuSumberDefault)}
                  </div>
                  <div>
                    <strong>SOAL :</strong><br/>
                    <strong>${item.nomorSoal}.</strong>
                    ${item.stimulus ? `<div style="font-style: italic; margin-bottom: 4px;">${escapeHtml(item.stimulus)}</div>` : ''}
                    ${item.deskripsiGambar ? `<div style="margin-bottom: 6px; background-color: #f5f5f5; padding: 4px; border: 1px dashed #666;"><strong>[Gambar: "${escapeHtml(item.deskripsiGambar)}"]</strong></div>` : ''}
                    <div style="margin-bottom: 8px;">${escapeHtml(item.pertanyaan)}</div>

                    <div style="margin-top: 8px; padding-left: 10px;">
                      <div>a. ${escapeHtml(item.pilihan.A)}</div>
                      <div>b. ${escapeHtml(item.pilihan.B)}</div>
                      <div>c. ${escapeHtml(item.pilihan.C)}</div>
                      <div>d. ${escapeHtml(item.pilihan.D)}</div>
                      ${item.pilihan.E ? `<div>e. ${escapeHtml(item.pilihan.E)}</div>` : ''}
                    </div>

                    ${item.pembahasan ? `
                    <div style="margin-top: 10px; font-size: 9pt; border-top: 1px dotted #ccc; padding-top: 4px; color: #333;">
                      <strong>Kunci Jawaban: ${escapeHtml(item.kunci)}</strong> | <em>Pembahasan: ${escapeHtml(item.pembahasan)}</em>
                    </div>` : ''}
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="2" class="keterangan-title" style="text-align: center; font-weight: bold; padding: 4px;">
                  KETERANGAN SOAL
                </td>
              </tr>
            </tbody>
          </table>
          <table class="keterangan-table" style="margin-bottom: 24px;">
            <thead>
              <tr>
                <th rowspan="2" width="6%">No</th>
                <th rowspan="2" width="14%">Digunakan untuk</th>
                <th rowspan="2" width="14%">Tanggal</th>
                <th rowspan="2" width="12%">Jumlah Siswa</th>
                <th rowspan="2" width="14%">TAKSONOMI BLOOM</th>
                <th colspan="5" width="22%">Proporsi Jawaban pada pilihan</th>
                <th rowspan="2" width="18%">Keterangan</th>
              </tr>
              <tr>
                <th width="4.4%">A</th>
                <th width="4.4%">B</th>
                <th width="4.4%">C</th>
                <th width="4.4%">D</th>
                <th width="4.4%">E</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${item.nomorSoal}.</td>
                <td>${escapeHtml(item.digunakanUntuk || (d.judul.includes('TENGAH') ? 'ASTS' : 'ASAS'))}</td>
                <td>${escapeHtml(item.tanggal || '-')}</td>
                <td>${escapeHtml(String(item.jumlahSiswa || jumlahSiswa))}</td>
                <td>${escapeHtml(item.taksonomiBloom)}</td>
                <td>${item.kunci === 'A' ? '✓' : ''}</td>
                <td>${item.kunci === 'B' ? '✓' : ''}</td>
                <td>${item.kunci === 'C' ? '✓' : ''}</td>
                <td>${item.kunci === 'D' ? '✓' : ''}</td>
                <td>${item.kunci === 'E' ? '✓' : ''}</td>
                <td>${escapeHtml(item.keterangan || `Kunci ${item.kunci}`)}</td>
              </tr>
            </tbody>
          </table>
          <br/>
        `
          )
          .join('')}
      </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-900 via-stone-900 to-slate-900 p-6 md:p-8 border border-amber-700/50 shadow-2xl text-white">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <FileCheck className="w-3.5 h-3.5 text-amber-400" />
              Generator Kartu Soal Asesmen Sumatif (Sesuai File Lampiran)
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Format Tabel Kartu Soal Resmi (ASTS / ASAS / SAS)
            </h1>
            <p className="text-stone-300 text-sm max-w-3xl leading-relaxed">
              Menganalisis dan menyusun kartu soal lengkap sesuai struktur standar: Tujuan Pembelajaran, Indikator Soal, Materi, Buku Sumber, Naskah Soal & Pilihan Jawaban, serta Tabel Keterangan Soal (Taksonomi Bloom & Proporsi Kunci Jawaban tercentang).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyPrompt}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-600 transition shadow-sm cursor-pointer"
              title="Salin Prompt Guru Kartu Soal"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              {copied ? 'Tersalin!' : 'Salin Prompt AI'}
            </button>
            <DocumentExportToolbar
              filename={`Kartu_Soal_${docData.mataPelajaran}_${docData.kelas}`.replace(/\s+/g, '_')}
              title={`${docData.judul} - ${docData.mataPelajaran}`}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
            />
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Preset Cepat Berdasarkan Lampiran */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Pilihan Preset Format Kartu Soal:
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleApplyPresetMatematika}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition"
          >
            📐 Matematika 8G (Persis Contoh File Lampiran PDF)
          </button>
          <button
            onClick={handleApplyPresetPjok}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition"
          >
            ⚽ PJOK Fase C / Kelas V (SD/SMP)
          </button>
        </div>
      </div>

      {/* Grid Konfigurasi & Naskah Soal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Input & Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4 bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Identitas Dokumen Kartu Soal
            </h2>
            <span className="text-xs text-amber-400/80 font-mono">Kurikulum Merdeka</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nama Satuan Pendidikan</label>
              <input
                type="text"
                value={namaSekolah}
                onChange={(e) => setNamaSekolah(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="SMP MERDEKA"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nama Penyusun / Guru</label>
              <input
                type="text"
                value={namaPenyusun}
                onChange={(e) => setNamaPenyusun(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="Lendi Ike Hermawan, S.Pd."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mata Pelajaran</label>
              <input
                type="text"
                value={mataPelajaran}
                onChange={(e) => setMataPelajaran(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="MATEMATIKA"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Kelas</label>
              <input
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="8G"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Semester</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tahun Pelajaran</label>
              <input
                type="text"
                value={tahunPelajaran}
                onChange={(e) => setTahunPelajaran(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="2025 / 2026"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Bentuk Soal</label>
              <select
                value={bentukSoal}
                onChange={(e) => setBentukSoal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Pilihan Ganda">Pilihan Ganda</option>
                <option value="Pilihan Ganda Kompleks">Pilihan Ganda Kompleks</option>
                <option value="Uraian">Uraian / Essay</option>
                <option value="Menjodohkan">Menjodohkan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Digunakan Untuk</label>
              <input
                type="text"
                value={digunakanUntuk}
                onChange={(e) => setDigunakanUntuk(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="ASTS / ASAS"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Buku Sumber / Rujukan Guru</label>
            <input
              type="text"
              value={bukuSumber}
              onChange={(e) => setBukuSumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              placeholder="MATEMATIKA untuk SMP/MTS kelas VIII , Penerbit Erlangga"
            />
          </div>

          {/* Upload File & Input Soal */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                Unggah File Soal / Tempel Teks Soal:
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Pilih File Dokumen</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.doc,.docx,.pdf,.json"
                className="hidden"
              />
            </div>
            <textarea
              rows={6}
              value={teksSoalInput}
              onChange={(e) => setTeksSoalInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/95 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-500 font-mono leading-relaxed"
              placeholder="Tempelkan butir soal atau teks evaluasi di sini..."
            />
            <p className="text-[11px] text-slate-400">
              Sistem akan menganalisis soal atau topik di atas, merumuskan Tujuan Pembelajaran, Indikator Soal, Materi, Level Kognitif Bloom, dan mengisi tabel Keterangan Soal otomatis.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Perintah / Instruksi Khusus Penyusunan Kartu Soal (Opsional):
            </label>
            <textarea
              rows={2}
              value={instruksiKhusus}
              onChange={(e) => setInstruksiKhusus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/95 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-500 leading-relaxed"
              placeholder="Contoh: Fokuskan indikator HOTS C4–C5, lengkapi pembahasan langkah demi langkah, atau sesuaikan untuk topik tertentu."
            />
          </div>

          <button
            onClick={handleGenerateKartuSoal}
            disabled={isLoading || !teksSoalInput.trim()}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Menyusun Kartu Soal Sesuai Format Lampiran...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Susun Kartu Soal Resmi (AI)
              </>
            )}
          </button>
        </div>

        {/* Kolom Pratinjau Dokumen Kartu Soal (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header Kontrol Pratinjau */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Tampilan Kartu:</span>
              <div className="flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                    viewMode === 'all' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Semua ({docData.items.length})
                </button>
                <button
                  onClick={() => setViewMode('single')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                    viewMode === 'single' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Per Nomor
                </button>
              </div>
            </div>

            {viewMode === 'single' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveCardIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activeCardIndex === 0}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-amber-400">
                  Kartu Soal {activeCardIndex + 1} dari {docData.items.length}
                </span>
                <button
                  onClick={() => setActiveCardIndex((prev) => Math.min(docData.items.length - 1, prev + 1))}
                  disabled={activeCardIndex === docData.items.length - 1}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <DocumentExportToolbar
              filename={`Kartu_Soal_${docData.mataPelajaran}_${docData.kelas}`.replace(/\s+/g, '_')}
              title={`${docData.judul} - ${docData.mataPelajaran}`}
              getHtmlContent={buildExportHtml}
              orientation="portrait"
              compact
            />
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

          {/* Area Kertas Kartu Soal (Styling Persis File Lampiran PDF) */}
          <div className="bg-white text-slate-900 rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-300 overflow-y-auto max-h-[800px] font-serif leading-relaxed text-sm">
            {(viewMode === 'single' ? [docData.items[activeCardIndex]] : docData.items).map((item, idx) => {
              if (!item) return null;
              return (
                <div key={item.nomorSoal || idx} className="mb-10 last:mb-0 break-inside-avoid">
                  {/* Judul Dokumen */}
                  <div className="text-center mb-4">
                    <h2 className="text-sm md:text-base font-bold uppercase tracking-wide">
                      {docData.judul}
                    </h2>
                    <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-800">
                      TAHUN PELAJARAN {docData.tahunPelajaran}
                    </h3>
                  </div>

                  {/* Metadata Header 2 Kolom */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-4 font-sans font-medium text-slate-800">
                    <div className="space-y-0.5">
                      <div className="flex">
                        <span className="w-32 font-bold">NAMA SEKOLAH</span>
                        <span>: {docData.namaSekolah}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-bold">MATA PELAJARAN</span>
                        <span>: {docData.mataPelajaran}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-bold">KELAS</span>
                        <span>: {docData.kelas}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-bold">SEMESTER</span>
                        <span>: {docData.semester}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-bold">KURIKULUM</span>
                        <span>: {docData.kurikulum}</span>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex">
                        <span className="w-32 font-bold">NAMA PENYUSUN</span>
                        <span>: {docData.namaPenyusun}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-bold">BENTUK SOAL</span>
                        <span>: {docData.bentukSoal}</span>
                      </div>
                    </div>
                  </div>

                  {/* TABEL UTAMA KARTU SOAL */}
                  <div className="border-2 border-slate-900 rounded-sm overflow-hidden text-xs font-sans">
                    {/* Baris Konten: Kiri (TP, Indikator, Materi) vs Kanan (Buku Sumber, Soal) */}
                    <div className="grid grid-cols-12 border-b border-slate-900">
                      {/* Kolom Kiri: 5 cols */}
                      <div className="col-span-12 sm:col-span-5 p-3.5 border-b sm:border-b-0 sm:border-r border-slate-900 space-y-4 bg-slate-50/50">
                        <div>
                          <div className="font-bold text-slate-900 mb-1">Tujuan Pembelajaran:</div>
                          <div className="text-slate-700 whitespace-pre-line leading-relaxed text-[11.5px]">
                            {item.tujuanPembelajaran}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-300">
                          <div className="font-bold text-slate-900 mb-1">Indikator Soal:</div>
                          <div className="text-slate-700 text-[11.5px] leading-relaxed">
                            {item.indikatorSoal}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-300">
                          <div className="font-bold text-slate-900 mb-1">Materi :</div>
                          <div className="text-slate-700 text-[11.5px] leading-relaxed font-semibold">
                            {item.materi}
                          </div>
                        </div>
                      </div>

                      {/* Kolom Kanan: 7 cols */}
                      <div className="col-span-12 sm:col-span-7 p-3.5 space-y-3">
                        <div className="pb-2 border-b border-slate-300 text-[11.5px]">
                          <strong>Buku Sumber :</strong> {item.bukuSumber || docData.bukuSumberDefault}
                        </div>

                        <div>
                          <div className="font-bold text-slate-900 mb-1 text-sm">SOAL :</div>
                          <div className="font-semibold text-slate-900 mb-2 flex items-start gap-1 text-[13px]">
                            <span>{item.nomorSoal}.</span>
                            <span>{item.pertanyaan}</span>
                          </div>

                          {item.stimulus && (
                            <div className="p-2 mb-2 bg-slate-100 border-l-2 border-slate-400 italic text-[11px] text-slate-700">
                              {item.stimulus}
                            </div>
                          )}

                          {item.deskripsiGambar && (
                            <div className="p-2.5 mb-2 bg-amber-50 border border-amber-300 rounded text-[11px] text-amber-900">
                              <strong>[Gambar: &ldquo;{item.deskripsiGambar}&rdquo;]</strong>
                            </div>
                          )}

                          {/* Pilihan Jawaban Grid (a, b, c, d, e) */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 text-[12px]">
                            <div><strong>a.</strong> {item.pilihan.A}</div>
                            <div><strong>c.</strong> {item.pilihan.C}</div>
                            <div><strong>b.</strong> {item.pilihan.B}</div>
                            <div><strong>d.</strong> {item.pilihan.D}</div>
                            {item.pilihan.E && (
                              <div className="col-span-2"><strong>e.</strong> {item.pilihan.E}</div>
                            )}
                          </div>

                          {item.pembahasan && (
                            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600 bg-emerald-50/60 p-2 rounded border border-emerald-200/60">
                              <span className="font-bold text-emerald-800">Kunci Jawaban: {item.kunci}</span> &bull; <em>{item.pembahasan}</em>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Baris Judul Keterangan Soal */}
                    <div className="bg-slate-100 text-center font-bold uppercase text-[11px] py-1.5 border-b border-slate-900 tracking-wider">
                      KETERANGAN SOAL
                    </div>

                    {/* Tabel Keterangan Soal (Persis Contoh File Lampiran) */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-center border-collapse text-[10.5px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-900 font-semibold text-slate-800">
                            <th className="border-r border-slate-900 py-1.5 px-2 w-10" rowSpan={2}>No</th>
                            <th className="border-r border-slate-900 py-1.5 px-2" rowSpan={2}>Digunakan untuk</th>
                            <th className="border-r border-slate-900 py-1.5 px-2" rowSpan={2}>Tanggal</th>
                            <th className="border-r border-slate-900 py-1.5 px-2" rowSpan={2}>Jumlah Siswa</th>
                            <th className="border-r border-slate-900 py-1.5 px-2" rowSpan={2}>TAKSONOMI BLOOM</th>
                            <th className="border-b border-r border-slate-900 py-1 px-2" colSpan={5}>Proporsi Jawaban pada pilihan</th>
                            <th className="py-1.5 px-2" rowSpan={2}>Keterangan</th>
                          </tr>
                          <tr className="bg-slate-50 border-b border-slate-900 text-[10px]">
                            <th className="border-r border-slate-900 py-1 w-6">A</th>
                            <th className="border-r border-slate-900 py-1 w-6">B</th>
                            <th className="border-r border-slate-900 py-1 w-6">C</th>
                            <th className="border-r border-slate-900 py-1 w-6">D</th>
                            <th className="border-r border-slate-900 py-1 w-6">E</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="text-slate-800 font-medium">
                            <td className="border-r border-slate-900 py-2 font-bold">{item.nomorSoal}.</td>
                            <td className="border-r border-slate-900 py-2">{item.digunakanUntuk || digunakanUntuk}</td>
                            <td className="border-r border-slate-900 py-2">{item.tanggal || '-'}</td>
                            <td className="border-r border-slate-900 py-2">{item.jumlahSiswa || jumlahSiswa}</td>
                            <td className="border-r border-slate-900 py-2 font-bold font-mono text-blue-700">{item.taksonomiBloom}</td>
                            <td className="border-r border-slate-900 py-2 font-bold text-emerald-600 text-sm">
                              {item.kunci === 'A' ? '√' : ''}
                            </td>
                            <td className="border-r border-slate-900 py-2 font-bold text-emerald-600 text-sm">
                              {item.kunci === 'B' ? '√' : ''}
                            </td>
                            <td className="border-r border-slate-900 py-2 font-bold text-emerald-600 text-sm">
                              {item.kunci === 'C' ? '√' : ''}
                            </td>
                            <td className="border-r border-slate-900 py-2 font-bold text-emerald-600 text-sm">
                              {item.kunci === 'D' ? '√' : ''}
                            </td>
                            <td className="border-r border-slate-900 py-2 font-bold text-emerald-600 text-sm">
                              {item.kunci === 'E' ? '√' : ''}
                            </td>
                            <td className="py-2 px-2 text-left text-[10px] text-slate-600">
                              {item.keterangan || `Kunci ${item.kunci}`}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
