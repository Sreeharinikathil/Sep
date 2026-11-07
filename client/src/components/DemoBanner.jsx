import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Building2, GraduationCap } from 'lucide-react';

export default function DemoBanner() {
  const { user, quickSwitch, loading } = useAuth();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs py-2 px-4 border-b border-indigo-900/40 shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-indigo-200 uppercase tracking-wider text-[11px]">
            SEP Viva Demo Mode:
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Active: <strong className="text-white font-medium">{user ? `${user.full_name} (${user.role})` : 'Not Signed In'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] mr-1 hidden md:inline">Quick Switch:</span>

          <button
            onClick={() => quickSwitch('sreehari')}
            disabled={loading}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 font-medium ${
              user?.role === 'STUDENT'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Switch to Student: Sreehari Nikathil (CCE25CS231)"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
            <span>Student (Sreehari)</span>
          </button>

          <button
            onClick={() => quickSwitch('google')}
            disabled={loading}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 font-medium ${
              user?.email === 'recruitment@google.com'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Switch to Recruiter: Google Cloud India"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-300" />
            <span>Google Recruiter</span>
          </button>

          <button
            onClick={() => quickSwitch('zerodha')}
            disabled={loading}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 font-medium ${
              user?.email === 'hiring@zerodha.com'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Switch to Recruiter: Zerodha Tech"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Zerodha Tech</span>
          </button>

          <button
            onClick={() => quickSwitch('admin')}
            disabled={loading}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 font-medium ${
              user?.role === 'ADMIN'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Switch to College Placement Director"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
            <span>College Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
