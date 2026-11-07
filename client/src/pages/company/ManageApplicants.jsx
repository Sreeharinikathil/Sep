import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Users, Search, Filter, ExternalLink, FileText, 
  CheckCircle2, XCircle, Clock, Award, ShieldAlert, ArrowLeft 
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function ManageApplicants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialInternshipId = searchParams.get('internship') || '';

  const [postings, setPostings] = useState([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState(initialInternshipId);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Status Update Modal state
  const [updatingApp, setUpdatingApp] = useState(null);
  const [newStatus, setNewStatus] = useState('SHORTLISTED');
  const [remarks, setRemarks] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    loadPostings();
  }, []);

  useEffect(() => {
    if (selectedInternshipId) {
      loadApplicants(selectedInternshipId);
    }
  }, [selectedInternshipId]);

  async function loadPostings() {
    try {
      const data = await api.getMyPostings();
      const list = data.postings || [];
      setPostings(list);
      if (!selectedInternshipId && list.length > 0) {
        setSelectedInternshipId(String(list[0].id));
      }
    } catch (err) {
      console.error('Failed to load postings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadApplicants(internshipId) {
    setLoading(true);
    try {
      const data = await api.getApplicantsForInternship(internshipId);
      setApplicants(data.applicants || []);
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusSubmit(e) {
    e.preventDefault();
    if (!updatingApp) return;

    setSavingStatus(true);
    try {
      await api.updateApplicantStatus(updatingApp.application_id, {
        status: newStatus,
        remarks: remarks || undefined
      });

      // Reload
      await loadApplicants(selectedInternshipId);
      setUpdatingApp(null);
      setRemarks('');
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setSavingStatus(false);
    }
  }

  const filteredApplicants = applicants.filter(a => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/company/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Candidate Pipeline & Screening
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Review submissions, proctored test scores, violations, and issue selection offers
          </p>
        </div>

        {/* Internship Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Posting:</label>
          <select
            value={selectedInternshipId}
            onChange={(e) => {
              setSelectedInternshipId(e.target.value);
              setSearchParams({ internship: e.target.value });
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 max-w-xs truncate"
          >
            {postings.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.total_applicants || 0} applicants)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['ALL', 'APPLIED', 'SHORTLISTED', 'TEST_INVITED', 'TEST_COMPLETED', 'SELECTED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
              statusFilter === st
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st === 'ALL' ? 'All Applicants' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading applicants...</div>
        ) : filteredApplicants.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No applicants found in this view</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6 font-semibold">Candidate</th>
                  <th className="py-3 px-4 font-semibold">Academics & CGPA</th>
                  <th className="py-3 px-4 font-semibold">Online Test Performance</th>
                  <th className="py-3 px-4 font-semibold">Current Status</th>
                  <th className="py-3 px-4 font-semibold">Resume</th>
                  <th className="py-3 px-6 font-semibold text-right">Recruiter Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplicants.map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50/50 transition">
                    {/* Candidate */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">{app.student_name}</div>
                      <div className="text-slate-500 text-[11px] font-mono">{app.register_no || 'Reg Pending'}</div>
                      <div className="text-slate-400 text-[11px]">{app.student_email}</div>
                    </td>

                    {/* Academics */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        <span>CGPA:</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200">
                          {app.cgpa}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{app.department}</div>
                      <div className="text-slate-400 text-[10px]">{app.degree} &bull; Batch {app.batch_year}</div>
                    </td>

                    {/* Test Score */}
                    <td className="py-4 px-4">
                      {app.test_attempt_id ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs">
                              {app.test_score} / {app.test_max_score}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              app.test_passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {app.test_percentage}%
                            </span>
                          </div>
                          {app.tab_switch_count > 0 ? (
                            <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-amber-600" />
                              <span>{app.tab_switch_count} tab switches logged</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-medium">Clean proctoring</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Test Pending</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <StatusBadge status={app.status} />
                      {app.remarks && (
                        <div className="text-[10px] text-slate-500 mt-1 truncate max-w-xs" title={app.remarks}>
                          {app.remarks}
                        </div>
                      )}
                    </td>

                    {/* Resume */}
                    <td className="py-4 px-4">
                      {app.resume_url ? (
                        <a
                          href={app.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View PDF</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No Resume</span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          setUpdatingApp(app);
                          setNewStatus(app.status);
                          setRemarks(app.remarks || '');
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recruiter Action Modal */}
      {updatingApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Update Candidate Status
            </h3>
            <p className="text-xs text-slate-500">
              Candidate: <strong>{updatingApp.student_name}</strong> ({updatingApp.register_no})
            </p>

            <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Change Pipeline Stage To:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="SHORTLISTED">⭐ Shortlisted for Next Round</option>
                  <option value="TEST_INVITED">📝 Invite / Unlock Online Test</option>
                  <option value="UNDER_REVIEW">🔍 Under Technical Review</option>
                  <option value="SELECTED">🎉 Select Candidate (Offer Rolled Out)</option>
                  <option value="REJECTED">❌ Reject Application</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Feedback / Remarks for Candidate:
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Cleared online test screening with 90%. Shortlisted for technical interview..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUpdatingApp(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStatus}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  {savingStatus ? 'Saving...' : 'Apply Status Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
