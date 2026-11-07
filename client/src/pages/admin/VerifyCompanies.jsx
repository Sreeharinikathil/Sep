import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Building2, CheckCircle2, XCircle, ArrowLeft, 
  ExternalLink, Phone, Mail, ShieldCheck 
} from 'lucide-react';

export default function VerifyCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const data = await api.getAdminCompanies();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleVerify(id, currentStatus) {
    try {
      await api.toggleCompanyVerification(id, !currentStatus);
      await loadCompanies();
    } catch (err) {
      alert('Failed to update verification: ' + err.message);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Placement Dashboard</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Recruiter & Industry Partner Verification
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Module 1 & 2: Audit recruiter credentials and grant verified recruiter status for campus drives
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading companies...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6 font-semibold">Company & Domain</th>
                  <th className="py-3 px-4 font-semibold">HQ & Location</th>
                  <th className="py-3 px-4 font-semibold">HR Contact</th>
                  <th className="py-3 px-4 font-semibold text-center">Postings</th>
                  <th className="py-3 px-4 font-semibold text-center">Applicants</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">{c.company_name}</div>
                      <div className="text-slate-500 text-[11px]">{c.industry || 'Technology'}</div>
                      <div className="text-slate-400 text-[10px]">{c.email}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-slate-800 font-medium">{c.location || 'India'}</div>
                      {c.website && (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-600 text-[11px] hover:underline inline-flex items-center gap-0.5 mt-0.5"
                        >
                          <span>Website</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-slate-800 font-medium">{c.hr_name || 'HR Team'}</div>
                      <div className="text-slate-500 text-[10px]">{c.hr_phone || 'Contact on file'}</div>
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-slate-900">
                      {c.postings_count || 0}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-brand-600">
                      {c.total_applicants || 0}
                    </td>

                    <td className="py-4 px-4">
                      {c.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <span>Pending Verification</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleVerify(c.id, c.is_verified)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          c.is_verified
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        }`}
                      >
                        {c.is_verified ? 'Revoke Approval' : 'Approve & Verify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
