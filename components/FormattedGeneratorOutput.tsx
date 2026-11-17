'use client';

import React, { useMemo, useState } from 'react';
import { Monitor, Printer } from 'lucide-react';
import { isMarkdownTableSeparator } from '@/lib/export-utils';

export interface MetaIdentityRow {
  label: string;
  value: string;
}

interface FormattedGeneratorOutputProps {
  markdown: string;
  docTitle?: string;
  docSubtitle?: string;
  metaRows?: MetaIdentityRow[];
  accent?: 'emerald' | 'teal' | 'purple' | 'cyan' | 'amber' | 'blue';
  defaultViewMode?: 'screen' | 'print';
  landscapeHint?: boolean;
  showSignatureFooter?: boolean;
}

type AstNode =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'h4'; text: string }
  | { type: 'hr' }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][]; aligns: Array<'left' | 'center' | 'right'> };

function parseAlignments(separatorLine: string): Array<'left' | 'center' | 'right'> {
  return separatorLine
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => {
      const s = c.trim();
      if (s.startsWith(':') && s.endsWith(':')) return 'center';
      if (s.endsWith(':')) return 'right';
      return 'left';
    });
}

function isCenteredHeader(headerText: string): boolean {
  const h = headerText.toLowerCase().trim();
  return (
    h === 'no' ||
    h === 'no.' ||
    h === 'no soal' ||
    h === 'no. soal' ||
    h === 'l/p' ||
    h === 'skor' ||
    h === 'jp' ||
    h === 'semester' ||
    h === 'pertemuan' ||
    h === 'fase' ||
    h === 'kode' ||
    h === 'kunci' ||
    h.includes('alokasi') ||
    h.includes('level') ||
    h.includes('taksonomi') ||
    h.includes('waktu')
  );
}

function parseMarkdownAst(markdown: string): AstNode[] {
  if (!markdown) return [];
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const nodes: AstNode[] = [];

  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];
  let tableBuffer: string[][] = [];
  let tableAligns: Array<'left' | 'center' | 'right'> = [];

  const flushList = () => {
    if (listType && listItems.length > 0) {
      nodes.push({ type: listType, items: listItems });
    }
    listType = null;
    listItems = [];
  };

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    const cleanRows: string[][] = [];
    tableBuffer.forEach((row) => {
      const joined = `|${row.join('|')}|`;
      if (isMarkdownTableSeparator(joined)) {
        if (tableAligns.length === 0) {
          tableAligns = parseAlignments(joined);
        }
        return;
      }
      cleanRows.push(row);
    });

    if (cleanRows.length > 0) {
      const colCount = Math.max(...cleanRows.map((r) => r.length));
      const headers = [...cleanRows[0]];
      while (headers.length < colCount) headers.push('');
      const body = cleanRows.slice(1).map((r) => {
        const padded = [...r];
        while (padded.length < colCount) padded.push('');
        return padded;
      });
      nodes.push({ type: 'table', headers, rows: body, aligns: tableAligns });
    }

    tableBuffer = [];
    tableAligns = [];
  };

  for (const raw of lines) {
    const trimmed = raw.trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableBuffer.push(cells);
      continue;
    } else {
      flushTable();
    }

    if (!trimmed) {
      flushList();
      continue;
    }

    if (/^[-*_]{3,}$/.test(trimmed)) {
      flushList();
      nodes.push({ type: 'hr' });
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      if (level === 1) nodes.push({ type: 'h1', text });
      else if (level === 2) nodes.push({ type: 'h2', text });
      else if (level === 3) nodes.push({ type: 'h3', text });
      else nodes.push({ type: 'h4', text });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(trimmed.replace(/^[-*]\s+/, ''));
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
      continue;
    }

    flushList();
    nodes.push({ type: 'p', text: trimmed });
  }

  flushTable();
  flushList();
  return nodes;
}

function renderInlineText(text: string, isPrint: boolean): React.ReactNode {
  if (!text) return null;
  // Split by <br> or <br/>
  const lineSegments = text.split(/<br\s*\/?>/gi);

  return lineSegments.map((segment, segIdx) => {
    const tokens: React.ReactNode[] = [];
    const regex = /(\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let tokenIdx = 0;

    while ((match = regex.exec(segment)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(segment.slice(lastIndex, match.index));
      }
      const full = match[0];
      if (full.startsWith('***') && full.endsWith('***')) {
        tokens.push(
          <strong key={`${segIdx}-${tokenIdx++}`} className={isPrint ? 'font-bold italic text-slate-900' : 'font-bold italic text-white'}>
            {full.slice(3, -3)}
          </strong>
        );
      } else if (full.startsWith('**') && full.endsWith('**')) {
        tokens.push(
          <strong key={`${segIdx}-${tokenIdx++}`} className={isPrint ? 'font-bold text-slate-900' : 'font-bold text-white'}>
            {full.slice(2, -2)}
          </strong>
        );
      } else if (full.startsWith('*') && full.endsWith('*')) {
        tokens.push(
          <em key={`${segIdx}-${tokenIdx++}`} className="italic">
            {full.slice(1, -1)}
          </em>
        );
      } else if (full.startsWith('`') && full.endsWith('`')) {
        tokens.push(
          <code
            key={`${segIdx}-${tokenIdx++}`}
            className={
              isPrint
                ? 'px-1 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px]'
                : 'px-1 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-[11px]'
            }
          >
            {full.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < segment.length) {
      tokens.push(segment.slice(lastIndex));
    }

    return (
      <React.Fragment key={segIdx}>
        {tokens}
        {segIdx < lineSegments.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

const ACCENT_MAP = {
  emerald: {
    thDark: 'bg-emerald-950/90 text-emerald-200 border-slate-700',
    h2Dark: 'text-emerald-400',
    h3Dark: 'text-teal-300',
    bulletDark: 'text-emerald-400',
    btnActive: 'bg-emerald-500 text-slate-950',
  },
  teal: {
    thDark: 'bg-teal-950/90 text-teal-200 border-slate-700',
    h2Dark: 'text-teal-400',
    h3Dark: 'text-cyan-300',
    bulletDark: 'text-teal-400',
    btnActive: 'bg-teal-500 text-slate-950',
  },
  purple: {
    thDark: 'bg-purple-950/90 text-purple-200 border-slate-700',
    h2Dark: 'text-purple-400',
    h3Dark: 'text-indigo-300',
    bulletDark: 'text-purple-400',
    btnActive: 'bg-purple-500 text-white',
  },
  cyan: {
    thDark: 'bg-cyan-950/90 text-cyan-200 border-slate-700',
    h2Dark: 'text-cyan-400',
    h3Dark: 'text-sky-300',
    bulletDark: 'text-cyan-400',
    btnActive: 'bg-cyan-500 text-slate-950',
  },
  amber: {
    thDark: 'bg-amber-950/90 text-amber-200 border-slate-700',
    h2Dark: 'text-amber-400',
    h3Dark: 'text-yellow-300',
    bulletDark: 'text-amber-400',
    btnActive: 'bg-amber-500 text-slate-950',
  },
  blue: {
    thDark: 'bg-blue-950/90 text-blue-200 border-slate-700',
    h2Dark: 'text-blue-400',
    h3Dark: 'text-sky-300',
    bulletDark: 'text-blue-400',
    btnActive: 'bg-blue-500 text-white',
  },
};

export function FormattedGeneratorOutput({
  markdown,
  docTitle,
  docSubtitle,
  metaRows,
  accent = 'emerald',
  defaultViewMode = 'print',
  landscapeHint = false,
  showSignatureFooter = false,
}: FormattedGeneratorOutputProps) {
  const [viewMode, setViewMode] = useState<'screen' | 'print'>(defaultViewMode);
  const ast = useMemo(() => parseMarkdownAst(markdown), [markdown]);
  const palette = ACCENT_MAP[accent];

  const isPrint = viewMode === 'print';

  // Avoid duplicate main title if the markdown starts with an H1 and docTitle is already shown in the Kop
  const renderedAst = useMemo(() => {
    if (isPrint && docTitle && ast.length > 0 && ast[0].type === 'h1') {
      return ast.slice(1);
    }
    return ast;
  }, [ast, isPrint, docTitle]);

  return (
    <div className="space-y-3">
      {/* Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 no-print">
        <span className="text-[11px] text-slate-300 font-medium">
          {isPrint
            ? `Dokumen Siap Cetak (${landscapeHint ? 'Disarankan Landscape A4 / F4' : 'Portrait A4 / F4'}) — Rapi Tanpa Perlu Edit`
            : 'Mode Tampilan Gelap (Layar)'}
        </span>
        <div className="inline-flex items-center rounded-xl bg-slate-950/90 border border-slate-700 p-1 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setViewMode('print')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              isPrint ? palette.btnActive : 'text-slate-300 hover:text-white'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Dokumen Siap Cetak</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('screen')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              !isPrint ? palette.btnActive : 'text-slate-300 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Mode Gelap</span>
          </button>
        </div>
      </div>

      {/* Document Body */}
      <div
        className={
          isPrint
            ? `print-sheet bg-white text-slate-900 rounded-xl border border-slate-300 shadow-2xl p-6 sm:p-10 mx-auto ${
                landscapeHint ? 'max-w-[297mm]' : 'max-w-[210mm]'
              } text-[12px] leading-relaxed font-sans space-y-3`
            : 'bg-slate-900/95 rounded-xl p-5 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-3 overflow-x-auto font-sans'
        }
      >
        {/* Formal Paper Header in Print Mode */}
        {isPrint && docTitle && (
          <div className="text-center border-b-[3px] border-double border-slate-900 pb-3 mb-4">
            <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
              {docTitle}
            </h1>
            {docSubtitle && (
              <p className="text-xs font-semibold text-slate-700 mt-0.5">{docSubtitle}</p>
            )}
          </div>
        )}

        {/* Meta Identity Table in Print Mode */}
        {isPrint && metaRows && metaRows.length > 0 && (
          <div className="bg-slate-50/80 border border-slate-300 rounded-lg px-4 py-2.5 mb-4">
            <table className="w-full text-xs border-collapse">
              <tbody>
                {metaRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-0.5 pr-3 font-bold text-slate-800 w-44 align-top">{row.label}</td>
                    <td className="py-0.5 px-1 text-slate-800 w-3 align-top">:</td>
                    <td className="py-0.5 text-slate-900 align-top font-medium">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Parsed Nodes */}
        {renderedAst.map((node, idx) => {
          if (node.type === 'h1') {
            return (
              <h1
                key={idx}
                className={
                  isPrint
                    ? 'text-sm sm:text-base font-extrabold text-slate-900 uppercase text-center mt-4 mb-2 pb-1.5 border-b-2 border-slate-800'
                    : 'text-base sm:text-lg font-extrabold text-white mt-4 mb-2 pb-1.5 border-b border-slate-800'
                }
              >
                {renderInlineText(node.text, isPrint)}
              </h1>
            );
          }

          if (node.type === 'h2') {
            return (
              <h2
                key={idx}
                className={
                  isPrint
                    ? 'text-xs sm:text-sm font-bold text-slate-900 bg-slate-100 border border-slate-400 border-l-4 border-l-slate-900 px-3 py-1.5 mt-5 mb-2 uppercase tracking-wide'
                    : `text-sm sm:text-base font-bold ${palette.h2Dark} mt-5 mb-2 pb-1 border-b border-slate-800`
                }
              >
                {renderInlineText(node.text, isPrint)}
              </h2>
            );
          }

          if (node.type === 'h3') {
            return (
              <h3
                key={idx}
                className={
                  isPrint
                    ? 'text-xs font-bold text-slate-900 mt-3.5 mb-1.5 pb-0.5 border-b border-slate-300'
                    : `text-xs sm:text-sm font-bold ${palette.h3Dark} mt-4 mb-1`
                }
              >
                {renderInlineText(node.text, isPrint)}
              </h3>
            );
          }

          if (node.type === 'h4') {
            return (
              <h4
                key={idx}
                className={
                  isPrint
                    ? 'text-xs font-bold text-slate-800 mt-2.5 mb-1'
                    : 'text-xs font-bold text-slate-200 mt-3 mb-1'
                }
              >
                {renderInlineText(node.text, isPrint)}
              </h4>
            );
          }

          if (node.type === 'hr') {
            return (
              <hr
                key={idx}
                className={isPrint ? 'border-t border-slate-300 my-3' : 'border-t border-slate-800 my-3'}
              />
            );
          }

          if (node.type === 'ul') {
            return (
              <ul key={idx} className="space-y-1 ml-1 my-1.5">
                {node.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={isPrint ? 'text-slate-900 font-bold' : `${palette.bulletDark} font-bold`}>
                      •
                    </span>
                    <span className={isPrint ? 'text-slate-800 flex-1' : 'text-slate-300 flex-1'}>
                      {renderInlineText(item, isPrint)}
                    </span>
                  </li>
                ))}
              </ul>
            );
          }

          if (node.type === 'ol') {
            return (
              <ol key={idx} className="space-y-1 ml-1 my-1.5">
                {node.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={`font-mono tabular-nums font-bold ${isPrint ? 'text-slate-900' : 'text-slate-400'}`}>
                      {i + 1}.
                    </span>
                    <span className={isPrint ? 'text-slate-800 flex-1' : 'text-slate-300 flex-1'}>
                      {renderInlineText(item, isPrint)}
                    </span>
                  </li>
                ))}
              </ol>
            );
          }

          if (node.type === 'p') {
            return (
              <p key={idx} className={isPrint ? 'text-slate-800 my-1 leading-relaxed' : 'text-slate-300 my-1 leading-relaxed'}>
                {renderInlineText(node.text, isPrint)}
              </p>
            );
          }

          if (node.type === 'table') {
            return (
              <div
                key={idx}
                className={
                  isPrint
                    ? 'overflow-x-auto my-3'
                    : 'overflow-x-auto my-3 border border-slate-700 rounded-xl shadow-sm'
                }
              >
                <table
                  className={
                    isPrint
                      ? 'w-full border-collapse border border-slate-900 text-[11px] font-sans'
                      : 'w-full text-left text-xs border-collapse font-sans'
                  }
                >
                  <thead>
                    <tr
                      className={
                        isPrint
                          ? 'bg-slate-200/80 text-slate-900 font-bold'
                          : `${palette.thDark} font-bold border-b border-slate-700`
                      }
                    >
                      {node.headers.map((th, hIdx) => (
                        <th
                          key={hIdx}
                          className={
                            isPrint
                              ? 'border border-slate-900 px-2.5 py-2 text-center align-middle font-bold'
                              : 'px-3 py-2.5 border-r border-slate-700/80 last:border-r-0 text-center align-middle whitespace-nowrap'
                          }
                        >
                          {renderInlineText(th, isPrint)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={isPrint ? '' : 'divide-y divide-slate-800'}>
                    {node.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={
                          isPrint
                            ? rIdx % 2 === 1
                              ? 'bg-slate-50/80'
                              : 'bg-white'
                            : `${rIdx % 2 === 1 ? 'bg-slate-800/30' : ''} hover:bg-slate-800/60 transition-colors`
                        }
                      >
                        {row.map((cell, cIdx) => {
                          const headerName = node.headers[cIdx] || '';
                          const explicitAlign = node.aligns[cIdx];
                          const isNumeric = /^\d{1,3}\.?$/.test(cell.trim()) || isCenteredHeader(headerName);
                          const align =
                            explicitAlign && explicitAlign !== 'left'
                              ? explicitAlign
                              : isNumeric
                                ? 'center'
                                : 'left';
                          const alignCls =
                            align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

                          return (
                            <td
                              key={cIdx}
                              className={
                                isPrint
                                  ? `border border-slate-900 px-2.5 py-2 align-top text-slate-900 leading-snug tabular-nums ${alignCls} ${
                                      cIdx === 0 && isNumeric ? 'font-bold w-10' : ''
                                    }`
                                  : `px-3 py-2.5 border-r border-slate-800/80 last:border-r-0 align-top leading-relaxed tabular-nums ${alignCls} ${
                                      cIdx === 0 && isNumeric ? 'font-mono font-bold text-slate-300 w-10' : 'text-slate-200'
                                    }`
                              }
                            >
                              {renderInlineText(cell, isPrint)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          return null;
        })}

        {/* Signature Footer Block in Print Mode */}
        {isPrint && showSignatureFooter && (
          <div className="grid grid-cols-2 gap-6 pt-8 mt-6 border-t border-slate-300 text-center text-xs text-slate-900">
            <div>
              <div>Mengetahui,</div>
              <div className="font-bold">Kepala Sekolah</div>
              <div className="h-14" />
              <div className="font-bold underline">..................................................</div>
              <div className="text-[11px]">NIP. .....................................</div>
            </div>
            <div>
              <div>................................., 20....</div>
              <div className="font-bold">Guru Mata Pelajaran</div>
              <div className="h-14" />
              <div className="font-bold underline">..................................................</div>
              <div className="text-[11px]">NIP. .....................................</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
