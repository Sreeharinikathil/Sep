import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  ShieldCheck, Users, Building2, Briefcase, Award, 
  Clock, ArrowRight, ExternalLink, CheckCircle2 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="py-24 text-center text-slate-400">Loading placement telemetry...</div>;
  }

  const { metrics, departmentBreakdown, topCompanies } = stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-purple-600/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Placement Cell & Administration
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              College of Engineering &bull; Centralized Placement Drive & Assessment Analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/companies"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Verify Recruiters
          </Link>
          <Link
            to="/admin/students"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Student Directory
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Students</span>
          <span className="text-2xl font-extrabold text-slate-900">{metrics?.totalStudents || 0}</span>
          <span className="text-[10px] text-slate-400 block">Eligible batch</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Hiring Partners</span>
          <span className="text-2xl font-extrabold text-blue-600">{metrics?.totalCompanies || 0}</span>
          <span className="text-[10px] text-slate-400 block">Recruiting companies</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Openings</span>
          <span className="text-2xl font-extrabold text-brand-600">{metrics?.activeInternships || 0}</span>
          <span className="text-[10px] text-slate-400 block">Open positions</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Applications</span>
          <span className="text-2xl font-extrabold text-indigo-600">{metrics?.totalApplications || 0}</span>
          <span className="text-[10px] text-slate-400 block">Profiles submitted</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Tests Conducted</span>
          <span className="text-2xl font-extrabold text-amber-600">{metrics?.testsConducted || 0}</span>
          <span className="text-[10px] text-slate-400 block">Proctored sessions</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1 bg-gradient-to-br from-white to-emerald-50/50 border-emerald-200">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Selection Rate</span>
          <span className="text-2xl font-extrabold text-emerald-700">{metrics?.placementRate || 0}%</span>
          <span className="text-[10px] text-emerald-600 block">{metrics?.selectedStudents || 0} Students placed</span>
        </div>
      </div>

      {/* Grid: Department-wise placement breakdown & Top hiring partners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="font-bold text-slate-900 text-sm">Department Placement Performance</h2>
          <div className="space-y-3">
            {departmentBreakdown?.map((dept, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{dept.department}</span>
                  <span className="text-emerald-700">{dept.selections_count || 0} Selected</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Total Applications: {dept.applications_count || 0}</span>
                  <span>Conversion: {dept.applications_count > 0 ? Math.round(((dept.selections_count || 0) / dept.applications_count) * 100) : 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Hiring Partners */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="font-bold text-slate-900 text-sm">Top Hiring Industry Partners</h2>
          <div className="space-y-3">
            {topCompanies?.map((comp, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center p-1.5 overflow-hidden shrink-0">
                    {comp.logo_url ? (
                      <img src={comp.logo_url} alt={comp.company_name} className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{comp.company_name}</h4>
                    <span className="text-slate-500 text-[11px]">{comp.applications_count || 0} Applications Received</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-emerald-700 text-sm block">
                    {comp.hires_count || 0}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase">Offers Made</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
