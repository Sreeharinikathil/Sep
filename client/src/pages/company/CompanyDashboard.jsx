import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  Building2, Briefcase, Users, FileText, CheckCircle2, 
  PlusCircle, Database, Clock, ArrowRight, ExternalLink 
} from 'lucide-react';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPostings();
  }, []);

  async function loadPostings() {
    try {
      const data = await api.getMyPostings();
      setPostings(data.postings || []);
    } catch (err) {
      console.error('Failed to load company postings:', err);
    } finally {
      setLoading(false);
    }
  }

  // Aggregate stats
  const totalApplicants = postings.reduce((sum, p) => sum + (p.total_applicants || 0), 0);
  const totalShortlisted = postings.reduce((sum, p) => sum + (p.shortlisted_count || 0), 0);
  const totalSelected = postings.reduce((sum, p) => sum + (p.selected_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-brand-600/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Recruiter Dashboard
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Hiring workspace for <strong>{user?.full_name}</strong> &bull; Manage drives & online assessments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/company/post-internship"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Internship</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Postings</span>
          <span className="text-2xl font-extrabold text-slate-900">{postings.length}</span>
          <span className="text-[11px] text-slate-500 block">Active recruitment drives</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Applicants</span>
          <span className="text-2xl font-extrabold text-brand-600">{totalApplicants}</span>
          <span className="text-[11px] text-slate-500 block">Received candidate profiles</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Shortlisted</span>
          <span className="text-2xl font-extrabold text-indigo-600">{totalShortlisted}</span>
          <span className="text-[11px] text-slate-500 block">Cleared screening tests</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Final Selected</span>
          <span className="text-2xl font-extrabold text-emerald-600">{totalSelected}</span>
          <span className="text-[11px] text-slate-500 block">Offers rolled out</span>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/company/question-bank"
          className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-sm transition flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition">
              Question Bank Repository
            </h3>
            <p className="text-slate-500 text-xs">Curate technical & aptitude MCQs</p>
          </div>
        </Link>

        <Link
          to="/company/tests"
          className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-sm transition flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition">
              Online Test Assembler
            </h3>
            <p className="text-slate-500 text-xs">Build & configure proctored exams</p>
          </div>
        </Link>

        <Link
          to="/company/applicants"
          className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-sm transition flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition">
              Candidate Pipeline
            </h3>
            <p className="text-slate-500 text-xs">Review scores & issue offers</p>
          </div>
        </Link>
      </div>

      {/* Postings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Your Active Internship Postings</h2>
          <span className="text-xs text-slate-500">{postings.length} Positions</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading positions...</div>
        ) : postings.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No internships posted yet. Click "Post New Internship" to publish an opening.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6 font-semibold">Title & Department</th>
                  <th className="py-3 px-4 font-semibold">Stipend & Duration</th>
                  <th className="py-3 px-4 font-semibold">Screening Assessment</th>
                  <th className="py-3 px-4 font-semibold text-center">Applicants</th>
                  <th className="py-3 px-4 font-semibold text-center">Shortlisted</th>
                  <th className="py-3 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {postings.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">{p.title}</div>
                      <div className="text-slate-500 text-[11px]">{p.department} &bull; Min CGPA: {p.min_cgpa}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">₹{p.stipend_amount?.toLocaleString()}/mo</div>
                      <div className="text-slate-500 text-[11px]">{p.duration_months} Months &bull; {p.location_city || p.location_type}</div>
                    </td>
                    <td className="py-4 px-4">
                      {p.test_title ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium border border-purple-200 text-[11px]">
                          <Clock className="w-3 h-3" />
                          <span>{p.test_title}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No online test</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-slate-900 text-sm">{p.total_applicants || 0}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-indigo-600 text-sm">{p.shortlisted_count || 0}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/company/applicants?internship=${p.id}`}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                      >
                        <span>View Applicants</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
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
