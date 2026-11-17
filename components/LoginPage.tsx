'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  Dumbbell,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { postJsonSafe } from '@/lib/api-client';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg('Mohon masukkan username dan password terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await postJsonSafe<{
        authenticated?: boolean;
        error?: string;
      }>('/api/auth', {
        username: username.trim(),
        password,
      });

      if (res.ok && res.data?.authenticated) {
        onLoginSuccess();
        return;
      }

      setErrorMsg(
        res.data?.error ||
          res.error ||
          'Username atau password salah. Silakan coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDefault = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 grid grid-cols-1 lg:grid-cols-12">
      {/* Left Visual Showcase Column */}
      <section className="relative lg:col-span-7 min-h-[300px] lg:min-h-screen overflow-hidden bg-slate-900 flex flex-col justify-between p-8 sm:p-12 lg:p-14">
        {!imageError ? (
          <Image
            src="/images/sadarpjok-login-arena.jpg"
            alt="Lintasan lari dan lapangan olahraga sekolah SADARPJOK di pagi hari"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950" />
        )}

        {/* Measured Contrast Scrim */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/35"
        />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-950/40 shrink-0">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-white leading-none">
              SADARPJOK
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Pendidikan Jasmani, Olahraga &amp; Kesehatan · Kurikulum Merdeka
            </p>
          </div>
        </div>

        {/* Bottom Editorial Copy & Feature Strip */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-xl mt-12 lg:mt-0 space-y-6"
        >
          <div className="space-y-3">
            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.08] text-balance">
              Pemantauan Kebugaran &amp; Administrasi Guru PJOK Terpadu
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-lg">
              Kelola pencatatan putaran lapangan secara langsung, hitung norma tes TKJI Depdiknas, serta susun perangkat ajar siap cetak A4 dan F4 dalam satu ruang kerja.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/15">
            <div>
              <p className="text-xs text-slate-300">Lapangan Live</p>
              <p className="text-sm sm:text-base font-semibold text-white mt-0.5 tabular-nums">
                Stopwatch &amp; RPE
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-300">Evaluasi Fisik</p>
              <p className="text-sm sm:text-base font-semibold text-white mt-0.5 tabular-nums">
                Norma TKJI
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-300">Perangkat Ajar</p>
              <p className="text-sm sm:text-base font-semibold text-white mt-0.5 tabular-nums">
                Word &amp; PDF A4/F4
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Right Authentication Form Column */}
      <main className="lg:col-span-5 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/40"
        >
          <div className="space-y-2 mb-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Masuk ke Akun Guru
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Masukkan username dan password Anda untuk membuka dashboard pemantauan dan generator perangkat ajar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {errorMsg && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs sm:text-sm leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="login-username"
                className="block text-xs sm:text-sm font-medium text-slate-200"
              >
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="block text-xs sm:text-sm font-medium text-slate-200"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full h-12 pl-10 pr-12 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Memeriksa Akses...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Aplikasi</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              <span>Akses standar: </span>
              <span className="text-slate-200 font-mono">admin</span>
              <span aria-hidden="true"> · </span>
              <span className="text-slate-200 font-mono">admin123</span>
            </div>
            <button
              type="button"
              onClick={handleFillDefault}
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Isi Otomatis</span>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
