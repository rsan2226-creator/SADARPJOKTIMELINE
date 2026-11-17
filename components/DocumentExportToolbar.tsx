'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  FileDown,
  Printer,
  Loader2,
  FileJson,
  Sparkles,
  Copy,
  Check,
  Download,
  X,
  Table2,
  Columns3,
  FileSpreadsheet,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  PaperSize,
  PageOrientation,
  PAPER_SIZES,
  ExtractedTable,
  downloadWordFromHtml,
  downloadPdfFromHtml,
  printFormattedDocument,
  buildAiPrintPrompt,
  buildJsonPromptPayload,
  downloadJsonPrompt,
  downloadAiPromptTxt,
  extractSelectableTablesForColumns,
  buildColumnSubsetData,
  buildColumnSubsetHtml,
  downloadExcelFromTable,
  downloadCsvFromTable,
  formatColumnSubsetForClipboard,
  restorePlainCellText,
} from '@/lib/export-utils';

interface DocumentExportToolbarProps {
  filename?: string;
  filenameBase?: string;
  title: string;
  getHtmlContent: () => string;
  orientation?: PageOrientation;
  defaultPaperSize?: PaperSize;
  compact?: boolean;
  showPrintButton?: boolean;
}

export function DocumentExportToolbar({
  filename,
  filenameBase,
  title,
  getHtmlContent,
  orientation = 'portrait',
  defaultPaperSize = 'F4',
  compact = false,
  showPrintButton = true,
}: DocumentExportToolbarProps) {
  const [paperSize, setPaperSize] = useState<PaperSize>(defaultPaperSize);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [promptModalOpen, setPromptModalOpen] = useState<boolean>(false);
  const [promptTab, setPromptTab] = useState<'prompt' | 'json'>('prompt');
  const [copiedKey, setCopiedKey] = useState<'prompt' | 'json' | null>(null);
  const [cachedHtml, setCachedHtml] = useState<string>('');

  // State for Download Per Kolom modal
  const [columnModalOpen, setColumnModalOpen] = useState<boolean>(false);
  const [columnTables, setColumnTables] = useState<ExtractedTable[]>([]);
  const [activeTableIdx, setActiveTableIdx] = useState<number>(0);
  const [selectedColIndices, setSelectedColIndices] = useState<number[]>([]);
  const [copiedColKey, setCopiedColKey] = useState<string | null>(null);
  const [isExportingColPdf, setIsExportingColPdf] = useState<boolean>(false);

  const resolvedFilename = filename || filenameBase || title || 'Dokumen_SADARPJOK';

  useEffect(() => {
    if (!promptModalOpen && !columnModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPromptModalOpen(false);
        setColumnModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [promptModalOpen, columnModalOpen]);

  const handleOpenPromptModal = (tab: 'prompt' | 'json') => {
    setCachedHtml(getHtmlContent());
    setPromptTab(tab);
    setCopiedKey(null);
    setPromptModalOpen(true);
  };

  const handleOpenColumnModal = () => {
    const html = getHtmlContent();
    setCachedHtml(html);
    const tables = extractSelectableTablesForColumns(html, title);
    let bestIdx = 0;
    let bestScore = -1;
    tables.forEach((tbl, idx) => {
      const score = tbl.headers.length * Math.max(1, tbl.rows.length);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    });
    const chosenTable = tables[bestIdx];
    setColumnTables(tables);
    setActiveTableIdx(bestIdx);
    setSelectedColIndices(
      chosenTable ? chosenTable.headers.map((_, idx) => idx) : []
    );
    setCopiedColKey(null);
    setColumnModalOpen(true);
  };

  const handleSelectTableIdx = (idx: number) => {
    setActiveTableIdx(idx);
    const tbl = columnTables[idx];
    setSelectedColIndices(tbl ? tbl.headers.map((_, cIdx) => cIdx) : []);
    setCopiedColKey(null);
  };

  const toggleColumnSelection = (colIdx: number) => {
    setSelectedColIndices((prev) =>
      prev.includes(colIdx)
        ? prev.filter((i) => i !== colIdx)
        : [...prev, colIdx].sort((a, b) => a - b)
    );
  };

  const handleSelectAllColumns = () => {
    const tbl = columnTables[activeTableIdx];
    if (!tbl) return;
    setSelectedColIndices(tbl.headers.map((_, idx) => idx));
  };

  const handleSelectSingleDefaultColumn = () => {
    const tbl = columnTables[activeTableIdx];
    if (!tbl || tbl.headers.length === 0) return;
    const firstNonNoIdx = tbl.headers.findIndex(
      (h) => !/^no\.?$/i.test(restorePlainCellText(h).trim())
    );
    setSelectedColIndices([firstNonNoIdx >= 0 ? firstNonNoIdx : 0]);
  };

  const handleClearColumns = () => {
    setSelectedColIndices([]);
  };

  const handleDownloadWord = () => {
    const htmlContent = getHtmlContent();
    downloadWordFromHtml({
      filename: resolvedFilename,
      htmlContent,
      paperSize,
      orientation,
    });
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const htmlContent = getHtmlContent();
      await downloadPdfFromHtml({
        filename: resolvedFilename,
        title,
        htmlContent,
        paperSize,
        orientation,
      });
    } catch (err) {
      console.error('Gagal membuat PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    const htmlContent = getHtmlContent();
    printFormattedDocument({
      title,
      htmlContent,
      paperSize,
      orientation,
    });
  };

  const jsonPayload = promptModalOpen
    ? buildJsonPromptPayload({
        title,
        htmlContent: cachedHtml,
        paperSize,
        orientation,
      })
    : null;

  const aiPromptText = promptModalOpen
    ? jsonPayload?.promptAiSiapCetak ||
      buildAiPrintPrompt({
        title,
        htmlContent: cachedHtml,
        paperSize,
        orientation,
      })
    : '';

  const jsonPromptText = jsonPayload ? JSON.stringify(jsonPayload, null, 2) : '';

  const handleCopyContent = async (kind: 'prompt' | 'json') => {
    const text = kind === 'json' ? jsonPromptText : aiPromptText;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(kind);
      setTimeout(() => setCopiedKey(null), 2200);
    } catch (err) {
      console.error('Gagal menyalin ke clipboard:', err);
    }
  };

  const handleDownloadPromptOrJson = (kind: 'prompt' | 'json') => {
    const html = cachedHtml || getHtmlContent();
    if (kind === 'json') {
      downloadJsonPrompt({
        filename: resolvedFilename,
        title,
        htmlContent: html,
        paperSize,
        orientation,
      });
    } else {
      downloadAiPromptTxt({
        filename: resolvedFilename,
        title,
        htmlContent: html,
        paperSize,
        orientation,
      });
    }
  };

  const activeTable = columnTables[activeTableIdx] || null;
  const subsetData =
    columnModalOpen && activeTable && selectedColIndices.length > 0
      ? buildColumnSubsetData(activeTable, selectedColIndices)
      : null;

  const buildColLabel = (headers: string[], totalCols: number): string => {
    if (headers.length === totalCols) return 'Semua_Kolom';
    if (headers.length === 1) return `Kolom_${headers[0]}`;
    return `${headers.length}_Kolom`;
  };

  const handleExportColumns = async (
    format: 'excel' | 'csv' | 'word' | 'pdf' | 'copy',
    overrideIndices?: number[],
    copyKeyId: string = 'multi'
  ) => {
    if (!activeTable) return;
    const indices = overrideIndices ?? selectedColIndices;
    if (indices.length === 0) return;

    const subset = buildColumnSubsetData(activeTable, indices);
    const colLabel = buildColLabel(subset.headers, activeTable.headers.length);
    const tableTitle = activeTable.titleHint || title;

    if (format === 'copy') {
      try {
        const text = formatColumnSubsetForClipboard(subset.headers, subset.rows);
        await navigator.clipboard.writeText(text);
        setCopiedColKey(copyKeyId);
        setTimeout(() => setCopiedColKey(null), 2000);
      } catch (err) {
        console.error('Gagal menyalin kolom:', err);
      }
      return;
    }

    if (format === 'excel') {
      downloadExcelFromTable({
        filename: resolvedFilename,
        title,
        tableTitle,
        headers: subset.headers,
        rows: subset.rows,
        colLabel,
      });
      return;
    }

    if (format === 'csv') {
      downloadCsvFromTable({
        filename: resolvedFilename,
        headers: subset.headers,
        rows: subset.rows,
        colLabel,
      });
      return;
    }

    const colHtml = buildColumnSubsetHtml({
      title,
      tableTitle,
      headers: subset.headers,
      rows: subset.rows,
      paperSize,
      orientation,
    });

    if (format === 'word') {
      downloadWordFromHtml({
        filename: `${resolvedFilename}_${colLabel}`,
        htmlContent: colHtml,
        paperSize,
        orientation,
      });
      return;
    }

    if (format === 'pdf') {
      setIsExportingColPdf(true);
      try {
        await downloadPdfFromHtml({
          filename: `${resolvedFilename}_${colLabel}`,
          title,
          htmlContent: colHtml,
          paperSize,
          orientation,
        });
      } catch (err) {
        console.error('Gagal membuat PDF per kolom:', err);
      } finally {
        setIsExportingColPdf(false);
      }
    }
  };

  const modalNode =
    promptModalOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
            onClick={() => setPromptModalOpen(false)}
          >
            <div
              className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-slate-900/95">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Sparkles className="w-3 h-3" />
                      Siap Cetak {paperSize}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {orientation === 'landscape' ? 'Landscape' : 'Portrait'} &bull;{' '}
                      {PAPER_SIZES[paperSize].label}
                    </span>
                    {jsonPayload && jsonPayload.metadataDokumen.jumlahTabelData > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <Table2 className="w-3 h-3" />
                        {jsonPayload.metadataDokumen.jumlahTabelData} Tabel Terstruktur
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    Ekspor JSON Prompt &amp; Prompt AI Siap Cetak ({paperSize})
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{title}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Switch Paper Format inside Modal */}
                  <div className="inline-flex items-center rounded-lg bg-slate-800 border border-slate-700 p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPaperSize('F4')}
                      className={`px-2 py-1 rounded-md transition cursor-pointer ${
                        paperSize === 'F4'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      F4
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaperSize('A4')}
                      className={`px-2 py-1 rounded-md transition cursor-pointer ${
                        paperSize === 'A4'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      A4
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPromptModalOpen(false)}
                    aria-label="Tutup modal ekspor"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Sub-Tabs & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-slate-800 bg-slate-950/60">
                <div className="inline-flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPromptTab('prompt')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      promptTab === 'prompt'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Prompt AI (Siap Cetak {paperSize})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromptTab('json')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      promptTab === 'json'
                        ? 'bg-violet-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    <span>JSON Prompt (.json)</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyContent(promptTab)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition cursor-pointer"
                  >
                    {copiedKey === promptTab ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-sky-400" />
                    )}
                    <span>
                      {copiedKey === promptTab
                        ? 'Tersalin!'
                        : promptTab === 'json'
                          ? 'Salin JSON'
                          : 'Salin Prompt AI'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadPromptOrJson(promptTab)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm ${
                      promptTab === 'json'
                        ? 'bg-violet-600 hover:bg-violet-500 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>
                      {promptTab === 'json' ? 'Unduh File .json' : 'Unduh Prompt .txt'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Preview Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-950 space-y-3">
                <div className="text-[11px] text-slate-400 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 leading-relaxed">
                  {promptTab === 'prompt' ? (
                    <>
                      Salin <strong className="text-amber-300">Prompt AI</strong> ini lalu tempelkan ke ChatGPT / Gemini / Claude. Instruksi sudah otomatis mengunci ukuran cetak <strong className="text-white">{PAPER_SIZES[paperSize].label}</strong> dan memastikan seluruh tabel diformat rapi berbatas garis penuh tanpa terpotong.
                    </>
                  ) : (
                    <>
                      File <strong className="text-violet-300">JSON Prompt</strong> berisi metadata kertas <strong className="text-white">{paperSize}</strong>, aturan kerapian tabel cetak, teks Prompt AI siap pakai, serta seluruh baris &amp; kolom tabel terstruktur untuk integrasi AI/otomasi dokumen.
                    </>
                  )}
                </div>

                <pre className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] sm:text-xs font-mono text-slate-200 whitespace-pre-wrap break-words leading-relaxed overflow-x-auto select-all">
                  {promptTab === 'json' ? jsonPromptText : aiPromptText}
                </pre>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const columnModalNode =
    columnModalOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
            onClick={() => setColumnModalOpen(false)}
          >
            <div
              className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-slate-900/95">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      <Columns3 className="w-3 h-3" />
                      Download Per Kolom
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {PAPER_SIZES[paperSize].label}
                    </span>
                    {activeTable && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <Table2 className="w-3 h-3" />
                        {activeTable.headers.length} Kolom &bull; {activeTable.rows.length} Baris
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    Pilih &amp; Unduh Data Per Kolom
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{title}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="inline-flex items-center rounded-lg bg-slate-800 border border-slate-700 p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPaperSize('F4')}
                      className={`px-2 py-1 rounded-md transition cursor-pointer ${
                        paperSize === 'F4'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      F4
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaperSize('A4')}
                      className={`px-2 py-1 rounded-md transition cursor-pointer ${
                        paperSize === 'A4'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      A4
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setColumnModalOpen(false)}
                    aria-label="Tutup modal download per kolom"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Table Selector Bar when multiple tables exist */}
              {columnTables.length > 1 && (
                <div className="px-5 py-2.5 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                    Pilih Tabel:
                  </span>
                  {columnTables.map((tbl, idx) => {
                    const isActive = idx === activeTableIdx;
                    return (
                      <button
                        key={`${tbl.index}-${idx}`}
                        type="button"
                        onClick={() => handleSelectTableIdx(idx)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                          isActive
                            ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        <Table2 className="w-3 h-3" />
                        <span className="max-w-[200px] truncate">
                          Tabel {idx + 1}: {tbl.titleHint}
                        </span>
                        <span className="text-[10px] opacity-80">
                          ({tbl.headers.length} kol)
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Body: Left column checklist + individual download, Right preview + multi-column download */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-950">
                {activeTable ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
                    {/* Left Column List */}
                    <div className="lg:col-span-5 flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5">
                        <span className="text-xs font-bold text-slate-200">
                          Daftar Kolom ({selectedColIndices.length}/{activeTable.headers.length})
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleSelectAllColumns}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 cursor-pointer"
                          >
                            Semua
                          </button>
                          <button
                            type="button"
                            onClick={handleSelectSingleDefaultColumn}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 cursor-pointer"
                          >
                            1 Kolom
                          </button>
                          <button
                            type="button"
                            onClick={handleClearColumns}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                          >
                            Kosongkan
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-[54vh] overflow-y-auto pr-1">
                        {activeTable.headers.map((rawHeader, cIdx) => {
                          const colName = restorePlainCellText(rawHeader) || `Kolom ${cIdx + 1}`;
                          const isChecked = selectedColIndices.includes(cIdx);
                          const filledCount = activeTable.rows.filter(
                            (r) => restorePlainCellText(r[cIdx] ?? '') !== ''
                          ).length;
                          const copyKey = `col-${cIdx}`;

                          return (
                            <div
                              key={`${colName}-${cIdx}`}
                              className={`rounded-xl border p-3 transition ${
                                isChecked
                                  ? 'bg-slate-900 border-teal-500/50'
                                  : 'bg-slate-900/50 border-slate-800'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleColumnSelection(cIdx)}
                                  className="flex items-start gap-2.5 text-left min-w-0 flex-1 cursor-pointer"
                                >
                                  {isChecked ? (
                                    <CheckSquare className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                  )}
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-white break-words">
                                      <span className="text-teal-400 mr-1.5">#{cIdx + 1}</span>
                                      {colName}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                      {filledCount} dari {activeTable.rows.length} baris terisi
                                    </div>
                                  </div>
                                </button>
                              </div>

                              {/* 1-click Single Column Downloads */}
                              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] text-slate-500 font-semibold mr-auto">
                                  Unduh kolom ini saja:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleExportColumns('copy', [cIdx], copyKey)}
                                  title={`Salin isi kolom "${colName}"`}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                                >
                                  {copiedColKey === copyKey ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-sky-400" />
                                  )}
                                  <span>{copiedColKey === copyKey ? 'Disalin' : 'Salin'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExportColumns('excel', [cIdx])}
                                  title={`Unduh Excel (.xls) kolom "${colName}"`}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-600/90 hover:bg-emerald-500 text-white cursor-pointer"
                                >
                                  <FileSpreadsheet className="w-3 h-3" />
                                  <span>XLS</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExportColumns('csv', [cIdx])}
                                  title={`Unduh CSV (.csv) kolom "${colName}"`}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-teal-600/90 hover:bg-teal-500 text-white cursor-pointer"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>CSV</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExportColumns('word', [cIdx])}
                                  title={`Unduh Word (.doc) ${paperSize} kolom "${colName}"`}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-blue-600/90 hover:bg-blue-500 text-white cursor-pointer"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>DOC</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExportColumns('pdf', [cIdx])}
                                  disabled={isExportingColPdf}
                                  title={`Unduh PDF (.pdf) ${paperSize} kolom "${colName}"`}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-rose-600/90 hover:bg-rose-500 text-white disabled:opacity-50 cursor-pointer"
                                >
                                  <FileDown className="w-3 h-3" />
                                  <span>PDF</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Preview & Multi-Column Download */}
                    <div className="lg:col-span-7 flex flex-col gap-3">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-white">
                              Unduh Gabungan Kolom Terpilih
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {subsetData
                                ? `Terpilih ${subsetData.headers.length} dari ${activeTable.headers.length} kolom (${subsetData.rows.length} baris)`
                                : 'Belum ada kolom yang dicentang'}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={!subsetData}
                            onClick={() => handleExportColumns('copy', undefined, 'multi')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 disabled:opacity-40 cursor-pointer"
                          >
                            {copiedColKey === 'multi' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-sky-400" />
                            )}
                            <span>{copiedColKey === 'multi' ? 'Tersalin!' : 'Salin Kolom'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={!subsetData}
                            onClick={() => handleExportColumns('excel')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 cursor-pointer"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>Excel (.xls)</span>
                          </button>

                          <button
                            type="button"
                            disabled={!subsetData}
                            onClick={() => handleExportColumns('csv')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-40 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>CSV (.csv)</span>
                          </button>

                          <button
                            type="button"
                            disabled={!subsetData}
                            onClick={() => handleExportColumns('word')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Word ({paperSize})</span>
                          </button>

                          <button
                            type="button"
                            disabled={!subsetData || isExportingColPdf}
                            onClick={() => handleExportColumns('pdf')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 cursor-pointer"
                          >
                            {isExportingColPdf ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <FileDown className="w-3.5 h-3.5" />
                            )}
                            <span>{isExportingColPdf ? 'Membuat PDF...' : `PDF (${paperSize})`}</span>
                          </button>
                        </div>
                      </div>

                      {/* Live Preview Table */}
                      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                        <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                            Pratinjau Hasil Per Kolom
                          </span>
                          {subsetData && subsetData.rows.length > 25 && (
                            <span className="text-[10px] text-slate-400">
                              Menampilkan 25 dari {subsetData.rows.length} baris (unduhan memuat semua baris)
                            </span>
                          )}
                        </div>

                        <div className="overflow-auto max-h-[45vh] p-3 bg-white text-slate-900">
                          {subsetData ? (
                            <table className="w-full border-collapse text-xs">
                              <thead>
                                <tr>
                                  {subsetData.headers.map((h, hIdx) => (
                                    <th
                                      key={`${h}-${hIdx}`}
                                      className="border border-slate-400 bg-slate-100 px-2.5 py-2 font-bold text-center text-slate-900 whitespace-pre-wrap"
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {subsetData.rows.slice(0, 25).map((row, rIdx) => (
                                  <tr
                                    key={rIdx}
                                    className={rIdx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}
                                  >
                                    {row.map((cell, cIdx) => (
                                      <td
                                        key={cIdx}
                                        className="border border-slate-300 px-2.5 py-1.5 align-top whitespace-pre-wrap break-words"
                                      >
                                        {cell || '-'}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="py-12 text-center text-xs text-slate-500">
                              Centang minimal 1 kolom di panel kiri untuk melihat pratinjau dan mengunduh.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-sm text-slate-400">
                    Dokumen belum memiliki konten untuk diekstrak per kolom.
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className="inline-flex flex-wrap items-center gap-2 no-print">
        {/* Paper Size Selector: F4 / A4 */}
        <div
          className="inline-flex items-center rounded-lg bg-slate-800/90 border border-slate-700 p-0.5 text-[11px] font-bold"
          title="Pilih Ukuran Kertas Cetak (F4 Folio atau A4)"
        >
          <button
            type="button"
            onClick={() => setPaperSize('F4')}
            className={`px-2 py-1 rounded-md transition cursor-pointer ${
              paperSize === 'F4'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            F4
          </button>
          <button
            type="button"
            onClick={() => setPaperSize('A4')}
            className={`px-2 py-1 rounded-md transition cursor-pointer ${
              paperSize === 'A4'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            A4
          </button>
        </div>

        {/* Download Word (.doc) */}
        <button
          type="button"
          onClick={handleDownloadWord}
          title={`Unduh Microsoft Word (.doc) format ${paperSize}`}
          className={`inline-flex items-center gap-1.5 rounded-xl font-bold transition cursor-pointer shadow-sm ${
            compact ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-xs'
          } bg-blue-600 hover:bg-blue-500 text-white`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Word ({paperSize})</span>
        </button>

        {/* Download PDF (.pdf) */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isExportingPdf}
          title={`Unduh File PDF (.pdf) rapi siap cetak ${paperSize}`}
          className={`inline-flex items-center gap-1.5 rounded-xl font-bold transition cursor-pointer shadow-sm disabled:opacity-60 ${
            compact ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-xs'
          } bg-rose-600 hover:bg-rose-500 text-white`}
        >
          {isExportingPdf ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileDown className="w-3.5 h-3.5" />
          )}
          <span>{isExportingPdf ? 'Membuat PDF...' : `PDF (${paperSize})`}</span>
        </button>

        {/* Direct Print F4 / A4 */}
        {showPrintButton && (
          <button
            type="button"
            onClick={handlePrint}
            title={`Cetak Dokumen Siap Print (${paperSize})`}
            className={`inline-flex items-center gap-1.5 rounded-xl font-semibold transition cursor-pointer border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-100 ${
              compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Cetak {paperSize}</span>
          </button>
        )}

        {/* Download Per Kolom */}
        <button
          type="button"
          onClick={handleOpenColumnModal}
          title="Pilih dan unduh data per kolom (Excel, CSV, Word, PDF, atau Salin)"
          className={`inline-flex items-center gap-1.5 rounded-xl font-bold transition cursor-pointer shadow-sm ${
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs'
          } bg-teal-600 hover:bg-teal-500 text-white`}
        >
          <Columns3 className="w-3.5 h-3.5" />
          <span>Per Kolom</span>
        </button>

        {/* Export JSON Prompt */}
        <button
          type="button"
          onClick={() => handleOpenPromptModal('json')}
          title={`Ekspor JSON Prompt & tabel terstruktur format ${paperSize}`}
          className={`inline-flex items-center gap-1.5 rounded-xl font-bold transition cursor-pointer shadow-sm ${
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs'
          } bg-violet-600 hover:bg-violet-500 text-white`}
        >
          <FileJson className="w-3.5 h-3.5" />
          <span>JSON Prompt</span>
        </button>

        {/* AI Print Prompt (F4 Siap Cetak) */}
        <button
          type="button"
          onClick={() => handleOpenPromptModal('prompt')}
          title={`Salin Prompt AI siap cetak ukuran ${paperSize} dengan tabel rapi`}
          className={`inline-flex items-center gap-1.5 rounded-xl font-bold transition cursor-pointer shadow-sm ${
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs'
          } bg-amber-500 hover:bg-amber-400 text-slate-950`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Prompt AI ({paperSize})</span>
        </button>
      </div>
      {modalNode}
      {columnModalNode}
    </>
  );
}

