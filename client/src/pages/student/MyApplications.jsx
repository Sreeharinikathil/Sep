import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import { 
  Briefcase, Clock, CheckCircle2, AlertCircle, Award, 
  ArrowRight, FileText, ExternalLink, Sparkles, Building2 
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      const data = await api.getMyApplications();
      setApplications(data.applications || []);

      // If any application is SELECTED, trigger celebration confetti!
      const hasSelection = data.applications?.some(a => a.application_status === 'SELECTED');
      if (hasSelection) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Internship Applications
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Track your recruitment stages, test invites, test scores, and selection offers
          </p>
        </div>

        <Link
          to="/internships"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Browse More Openings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading your applications...</div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Applications Yet</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            You haven't submitted any internship applications. Explore active recruitment drives to get started!
          </p>
          <Link
            to="/internships"
            className="inline-block mt-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
          >
            Explore Openings Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const isTestPending = app.application_status === 'TEST_INVITED';
            const isSelected = app.application_status === 'SELECTED';
            const isCompleted = app.test_attempt_id && app.test_attempt_status === 'COMPLETED';

            return (
              <div
                key={app.application_id}
                className={`p-6 rounded-2xl bg-white border transition shadow-xs ${
                  isSelected
                    ? 'border-emerald-300 bg-gradient-to-r from-white via-emerald-50/20 to-white'
                    : isTestPending
                    ? 'border-amber-300 shadow-amber-500/5'
                    : 'border-slate-200/80 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Job & Company info */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 overflow-hidden shrink-0">
                      {app.company_logo ? (
                        <img
                          src={app.company_logo}
                          alt={app.company_name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Building2 className="w-7 h-7 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-lg leading-snug">
                          {app.internship_title}
                        </h3>
                        <StatusBadge status={app.application_status} />
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {app.company_name} &bull; ₹{app.stipend_amount?.toLocaleString()}/mo &bull; Applied on{' '}
                        {new Date(app.applied_at).toLocaleDateString()}
                      </p>

                      {app.remarks && (
                        <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-xl">
                          <strong className="text-slate-800">Recruiter Note:</strong> {app.remarks}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Test Status & Primary Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {/* Action button: Take Test */}
                    {isTestPending && app.test_id && (
                      <Link
                        to={`/student/test/${app.test_id}`}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/30 flex items-center gap-2 animate-pulse"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Launch Online Assessment Now</span>
                      </Link>
                    )}

                    {/* View Test Score / Result */}
                    {isCompleted && (
                      <div className="flex flex-col items-start lg:items-end gap-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500">Test Score:</span>
                          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {app.test_score} / {app.test_max_score} ({app.test_percentage}%)
                          </span>
                          {app.test_passed ? (
                            <span className="text-emerald-700 font-bold text-xs">Passed</span>
                          ) : (
                            <span className="text-rose-700 font-bold text-xs">Below Cutoff</span>
                          )}
                        </div>
                        <Link
                          to={`/student/test-result/${app.test_attempt_id}`}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline flex items-center gap-1"
                        >
                          <span>View Detailed Performance Report</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}

                    {isSelected && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2 font-semibold">
                        <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Official Selection Offer Extended!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
