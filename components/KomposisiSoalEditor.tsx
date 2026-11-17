'use client';

import React from 'react';
import { CheckCircle2, Minus, Plus, RotateCcw } from 'lucide-react';
import {
  DEFAULT_KOMPOSISI_SOAL,
  KomposisiSoalConfig,
  OpsiPgCount,
  computeKomposisiSummary,
} from '@/lib/asesmen-sumatif-types';

interface KomposisiSoalEditorProps {
  value: KomposisiSoalConfig;
  onChange: (next: KomposisiSoalConfig) => void;
  onApplyPreview?: (next: KomposisiSoalConfig) => void;
  accent?: 'emerald' | 'blue';
}

const QUICK_KOMPOSISI: Array<{ label: string; config: KomposisiSoalConfig }> = [
  {
    label: 'Standar (45)',
    config: { pg: 25, pgKompleks: 5, menjodohkan: 8, isianSingkat: 5, uraian: 2 },
  },
  {
    label: 'Ringkas (25)',
    config: { pg: 15, pgKompleks: 3, menjodohkan: 3, isianSingkat: 2, uraian: 2 },
  },
  {
    label: 'Harian (15)',
    config: { pg: 10, pgKompleks: 0, menjodohkan: 0, isianSingkat: 3, uraian: 2 },
  },
  {
    label: 'PG + Uraian (25)',
    config: { pg: 20, pgKompleks: 0, menjodohkan: 0, isianSingkat: 0, uraian: 5 },
  },
];

export function KomposisiSoalEditor({
  value,
  onChange,
  onApplyPreview,
  accent = 'emerald',
}: KomposisiSoalEditorProps) {
  const summary = computeKomposisiSummary(value);

  type KomposisiCountKey = 'pg' | 'pgKompleks' | 'menjodohkan' | 'isianSingkat' | 'uraian';

  const items: Array<{
    key: KomposisiCountKey;
    label: string;
    bobot: number;
    max: number;
    range: { count: number; start: number; end: number };
  }> = [
    { key: 'pg', label: '1. Pilihan Ganda (A-E)', bobot: 1, max: 60, range: summary.pg },
    {
      key: 'pgKompleks',
      label: '2. PG Kompleks',
      bobot: 2,
      max: 30,
      range: summary.pgKompleks,
    },
    {
      key: 'menjodohkan',
      label: '3. Menjodohkan',
      bobot: 1,
      max: 30,
      range: summary.menjodohkan,
    },
    {
      key: 'isianSingkat',
      label: '4. Isian Singkat',
      bobot: 2,
      max: 30,
      range: summary.isianSingkat,
    },
    { key: 'uraian', label: '5. Uraian / Essay', bobot: 5, max: 20, range: summary.uraian },
  ];

  const handleUpdateField = (key: KomposisiCountKey, rawVal: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, Math.floor(Number.isFinite(rawVal) ? rawVal : 0)));
    const next: KomposisiSoalConfig = { ...value, [key]: clamped };
    const totalNext =
      next.pg + next.pgKompleks + next.menjodohkan + next.isianSingkat + next.uraian;
    if (totalNext === 0) return; // Prevent all zero
    onChange(next);
  };

  const accentText = accent === 'blue' ? 'text-blue-400' : 'text-emerald-400';
  const accentBtn =
    accent === 'blue'
      ? 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border-blue-500/30'
      : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 gap-2">
        <span className="font-bold text-white flex items-center gap-1.5">
          <CheckCircle2 className={`w-4 h-4 ${accentText}`} />
          <span>Komposisi Soal Asesmen (Dapat Diedit)</span>
        </span>
        <button
          type="button"
          onClick={() => {
            onChange({ ...DEFAULT_KOMPOSISI_SOAL });
            onApplyPreview?.({ ...DEFAULT_KOMPOSISI_SOAL });
          }}
          title="Reset ke standar 45 soal"
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Quick Composition Presets */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_KOMPOSISI.map((preset) => {
          const isMatch =
            value.pg === preset.config.pg &&
            value.pgKompleks === preset.config.pgKompleks &&
            value.menjodohkan === preset.config.menjodohkan &&
            value.isianSingkat === preset.config.isianSingkat &&
            value.uraian === preset.config.uraian;

          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                const next = { ...preset.config, opsiPg: value.opsiPg ?? 5 };
                onChange(next);
                onApplyPreview?.(next);
              }}
              className={`text-[10px] px-2 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
                isMatch
                  ? accentBtn
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Jumlah Opsi Pilihan Ganda */}
      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/70 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-slate-200">Opsi Jawaban Pilihan Ganda</span>
          <span className={`font-bold ${accentText}`}>{summary.opsiPg} Opsi (A–{summary.allowedPgKeys[summary.allowedPgKeys.length - 1]})</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {([
            { count: 3 as OpsiPgCount, label: '3 Opsi (A–C)', hint: 'SD Rendah' },
            { count: 4 as OpsiPgCount, label: '4 Opsi (A–D)', hint: 'SD / SMP' },
            { count: 5 as OpsiPgCount, label: '5 Opsi (A–E)', hint: 'SMA / SMK' },
          ]).map((opt) => {
            const isSelected = summary.opsiPg === opt.count;
            return (
              <button
                key={opt.count}
                type="button"
                onClick={() => {
                  const next = { ...value, opsiPg: opt.count };
                  onChange(next);
                  onApplyPreview?.(next);
                }}
                className={`px-2 py-1.5 rounded-md border text-center transition-colors cursor-pointer ${
                  isSelected
                    ? accentBtn
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-bold leading-tight">{opt.label}</div>
                <div className="text-[9px] opacity-75 leading-tight mt-0.5">{opt.hint}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editable Rows */}
      <div className="space-y-1.5 text-[11px]">
        {items.map((item) => {
          const count = value[item.key];
          const rangeText =
            item.range.count > 0
              ? `No. ${item.range.start}${item.range.end > item.range.start ? `–${item.range.end}` : ''}`
              : 'Nonaktif';

          return (
            <div
              key={item.key}
              className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-950 border border-slate-800/70"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-200 truncate">
                  {item.key === 'pg'
                    ? `1. Pilihan Ganda (A–${summary.allowedPgKeys[summary.allowedPgKeys.length - 1]})`
                    : item.label}
                </div>
                <div className="text-[10px] text-slate-400 tabular-nums">
                  {rangeText} · Bobot {item.bobot} pt ({count * item.bobot} pt)
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleUpdateField(item.key, count - 1, item.max)}
                  aria-label={`Kurangi ${item.label}`}
                  className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min={0}
                  max={item.max}
                  value={count}
                  onChange={(e) =>
                    handleUpdateField(
                      item.key,
                      e.target.value === '' ? 0 : Number(e.target.value),
                      item.max
                    )
                  }
                  aria-label={`Jumlah ${item.label}`}
                  className={`w-12 h-7 text-center font-bold tabular-nums rounded-md bg-slate-900 border border-slate-700 focus:outline-none focus:border-emerald-500 ${accentText}`}
                />
                <button
                  type="button"
                  onClick={() => handleUpdateField(item.key, count + 1, item.max)}
                  aria-label={`Tambah ${item.label}`}
                  className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals & Instant Apply */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-[11px]">
        <div className="tabular-nums">
          <span className="text-slate-400">Total: </span>
          <strong className="text-white">{summary.totalSoal} Soal</strong>
          <span className="text-slate-500"> · </span>
          <strong className={accentText}>{summary.totalSkor} Poin</strong>
        </div>

        {onApplyPreview && (
          <button
            type="button"
            onClick={() => onApplyPreview(value)}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer ${accentBtn}`}
          >
            Terapkan Pratinjau
          </button>
        )}
      </div>
    </div>
  );
}
