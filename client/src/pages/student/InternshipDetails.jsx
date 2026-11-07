import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  Building2, MapPin, IndianRupee, Clock, Calendar, 
  CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, 
  Briefcase, Check 
} from 'lucide-react';

export default function InternshipDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDetails();
  }, [id]);

  async function loadDetails() {
    try {
      const data = await api.getInternshipById(id);
      setJob(data.internship);
    } catch (err) {
      console.error('Failed to load internship details:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApply() {
    if (!user) {
      navigate('/login');
      return;
    }
    setApplying(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.applyForInternship(id);
      setMessage(res.message || 'Application submitted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading opening details...</div>;
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Internship Not Found</h2>
        <Link to="/internships" className="text-brand-600 text-sm font-semibold">
          &larr; Back to all internships
        </Link>
      </div>
    );
  }

  const studentCgpa = user?.profile?.cgpa || 0;
  const isEligible = user?.role === 'STUDENT' ? studentCgpa >= (job.min_cgpa || 0) : true;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/internships"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Openings</span>
      </Link>

      {/* Hero Header */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2.5 overflow-hidden shrink-0">
            {job.company_logo ? (
              <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-contain" />
            ) : (
              <Building2 className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-brand-600">{job.department}</span>
              {job.company_verified ? (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Recruiter
                </span>
              ) : null}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {job.title}
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-1">{job.company_name}</p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <span className="text-2xl font-extrabold text-slate-900">
            ₹{job.stipend_amount?.toLocaleString()}<span className="text-sm font-normal text-slate-500">/mo</span>
          </span>
          <span className="text-xs text-slate-500">{job.employment_type} &bull; {job.duration_months} Months</span>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Overview */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="font-bold text-slate-900 text-base">Job Description</h2>
            <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">
              {job.description}
            </p>

            {job.responsibilities && (
              <div className="pt-3">
                <h3 className="font-bold text-slate-900 text-sm mb-2">Key Responsibilities</h3>
                <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">
                  {job.responsibilities}
                </p>
              </div>
            )}

            {job.requirements && (
              <div className="pt-3">
                <h3 className="font-bold text-slate-900 text-sm mb-2">Requirements & Qualifications</h3>
                <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">
                  {job.requirements}
                </p>
              </div>
            )}
          </div>

          {/* Test Requirement Card */}
          {job.test_title && (
            <div className="p-6 bg-purple-50/70 rounded-2xl border border-purple-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-purple-900">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base">Proctored Online Test Required</h3>
              </div>
              <p className="text-purple-800 text-xs sm:text-sm leading-relaxed">
                Candidates must take the <strong>{job.test_title}</strong> to be evaluated for shortlisting. 
                The assessment is {job.test_duration} minutes long with a total of {job.test_marks} marks and a {job.test_passing_percentage}% passing threshold.
              </p>
              <div className="text-xs text-purple-700 font-medium">
                &bull; Strict Tab Switch & Fullscreen Monitoring is active during the test.
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info (1 col) */}
        <div className="space-y-6">
          {/* Application Action Card */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Application Action</h3>

            {message ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Application Sent!</span>
                </div>
                <p>{message}</p>
                <Link
                  to="/student/applications"
                  className="inline-block mt-2 font-bold text-emerald-900 underline"
                >
                  Go to My Applications &rarr;
                </Link>
              </div>
            ) : (
              <>
                {user?.role === 'STUDENT' ? (
                  <div className="space-y-3">
                    <div className={`p-3 rounded-xl text-xs border ${
                      isEligible ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {isEligible ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Eligible: Your CGPA {studentCgpa} meets the {job.min_cgpa} requirement.</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Not Eligible: Minimum {job.min_cgpa} CGPA required (yours is {studentCgpa}).</span>
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl">
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleApply}
                      disabled={!isEligible || applying}
                      className={`w-full py-3 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm ${
                        isEligible
                          ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {applying ? 'Submitting Application...' : 'Apply for this Internship'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="block w-full py-3 text-center bg-slate-900 text-white rounded-xl text-xs font-semibold"
                  >
                    Sign In to Apply
                  </Link>
                )}
              </>
            )}

            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-semibold text-slate-800">{job.location_city || job.location_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Batches:</span>
                <span className="font-semibold text-slate-800">{job.target_batches || '2025, 2026'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Allowed Branches:</span>
                <span className="font-semibold text-slate-800 text-right">{job.allowed_branches}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Openings:</span>
                <span className="font-semibold text-slate-800">{job.openings_count} Candidates</span>
              </div>
              {job.deadline && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Deadline:</span>
                  <span className="font-semibold text-rose-600">{job.deadline}</span>
                </div>
              )}
            </div>
          </div>

          {/* Company Mini Card */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">About {job.company_name}</h4>
            <p className="text-slate-600 leading-relaxed">
              {job.company_bio || 'A verified technology organization hiring graduating talent.'}
            </p>
            {job.company_website && (
              <a
                href={job.company_website}
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 font-semibold block hover:underline"
              >
                Visit Official Website &rarr;
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
