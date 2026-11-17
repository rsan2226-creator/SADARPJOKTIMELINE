'use client';

import React, { useState } from 'react';
import { Database, Copy, Check, RefreshCw, X, ExternalLink } from 'lucide-react';
import { SUPABASE_SCHEMA_SQL } from '@/lib/supabase-schema';
import { SUPABASE_PROJECT_ID } from '@/lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetrySync: () => Promise<void>;
}

export function SupabaseSetupModal({
  isOpen,
  onClose,
  onRetrySync,
}: SupabaseSetupModalProps) {
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleVerify = async () => {
    setRetrying(true);
    try {
      await onRetrySync();
    } finally {
      setRetrying(false);
    }
  };

  const sqlEditorUrl = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Inisialisasi Tabel Database Supabase (SADARPJOKREALTIME)
              </h3>
              <p className="text-xs text-slate-400">
                Project ID: <span className="font-mono text-emerald-400">{SUPABASE_PROJECT_ID}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
            Koneksi ke Supabase berhasil, namun tabel (<code className="font-mono">kelas</code>, <code className="font-mono">siswa</code>, <code className="font-mono">tkji_records</code>, <code className="font-mono">presensi_harian</code>, <code className="font-mono">jurnal_mengajar</code>, <code className="font-mono">live_sessions</code>) belum dibuat di proyek Supabase Anda. Salin SQL di bawah ini dan jalankan sekali di SQL Editor Supabase. Setelah tabel dibuat, aplikasi otomatis mengisi data awal kelas dan siswa secara langsung.
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-300">
              Skema SQL PostgreSQL + RLS + Realtime:
            </span>
            <div className="flex items-center gap-2">
              <a
                href={sqlEditorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                Buka SQL Editor Supabase
              </a>
              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'SQL Tersalin!' : 'Salin Semua SQL'}
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 font-mono overflow-x-auto max-h-72 leading-relaxed">
            {SUPABASE_SCHEMA_SQL}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Tutup (Gunakan Mode Lokal Sementara)
          </button>
          <button
            onClick={handleVerify}
            disabled={retrying}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Memeriksa Tabel...' : 'Verifikasi & Sinkronkan Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
}
