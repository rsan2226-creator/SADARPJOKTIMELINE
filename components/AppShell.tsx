'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { LoginPage } from '@/components/LoginPage';

const SadarpjokDashboard = dynamic(
  () => import('@/components/SadarpjokDashboard').then((m) => m.SadarpjokDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 text-sm font-medium">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span>Menyiapkan ruang kerja SADARPJOK...</span>
      </div>
    ),
  }
);

interface AppShellProps {
  initialAuthenticated: boolean;
}

export function AppShell({ initialAuthenticated }: AppShellProps) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
    } catch {
      // Ignore transient network errors during logout
    }
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <LoginPage onLoginSuccess={() => setAuthenticated(true)} />;
  }

  return <SadarpjokDashboard onLogout={handleLogout} />;
}
