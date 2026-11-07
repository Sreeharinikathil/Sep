import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Briefcase, GraduationCap, ShieldCheck, CheckCircle2, 
  ArrowRight, Search, Building2, Award, FileText, 
  Terminal, Sparkles, MapPin, IndianRupee, Clock, ArrowUpRight
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function Home() {
  const { user, role, quickSwitch } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedInternships();
  }, []);

  async function loadFeaturedInternships() {
    try {
      const data = await api.getInternships();
      setInternships(data.internships?.slice(0, 4) || []);
    } catch (err) {
      console.error('Failed to load internships:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-indigo-950">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-medium">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Software Engineering Project &bull; Academic Portal 2026</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Internship Management with <br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Online Test for Selection
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            A secure full-stack campus placement platform connecting college students with industry recruiters. Featuring automated eligibility screening, proctored assessments, and end-to-end recruitment pipelines.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/internships"
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/30 flex items-center gap-2 transition"
            >
              <span>Explore Internships</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {user ? (
              <Link
                to={
                  role === 'STUDENT'
                    ? '/student/applications'
                    : role === 'COMPANY'
                    ? '/company/dashboard'
                    : '/admin/dashboard'
                }
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur transition"
              >
                Go to {role} Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur transition"
              >
                Sign In to Portal
              </Link>
            )}
          </div>

          {/* Quick Viva Role Test Cards */}
          <div className="pt-8">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
              Fast-Track Examiner Demo Logins
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
              <button
                onClick={() => quickSwitch('sreehari')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition text-slate-200 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white text-sm">Sreehari Nikathil</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                    Student
                  </span>
                </div>
                <div className="text-xs text-slate-400">Reg: CCE25CS231 &bull; 8.92 CGPA</div>
                <div className="text-[11px] text-brand-400 mt-2 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Sign in as Student <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              <button
                onClick={() => quickSwitch('google')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition text-slate-200 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white text-sm">Google Cloud India</span>
                  <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/50">
                    Recruiter
                  </span>
                </div>
                <div className="text-xs text-slate-400">Manage tests, candidates, postings</div>
                <div className="text-[11px] text-brand-400 mt-2 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Sign in as Recruiter <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              <button
                onClick={() => quickSwitch('admin')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition text-slate-200 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white text-sm">College Placement Cell</span>
                  <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/50">
                    Admin
                  </span>
                </div>
                <div className="text-xs text-slate-400">Placement stats & company audits</div>
                <div className="text-[11px] text-brand-400 mt-2 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Sign in as Admin <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Project Modules Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">
            System Architecture & Features
          </h2>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            5 Core Engineering Modules
          </p>
          <p className="text-slate-600 text-sm mt-2">
            Fully implemented as specified in the university Software Engineering Project syllabus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-indigo-600 uppercase mb-1">Module 1</div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">User Auth & RBAC</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Role-Based Access Control for Student, Company, and Admin roles. Secure bcrypt password hashing, JWT sessions, and credential verification.
            </p>
          </div>

          {/* Module 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-blue-600 uppercase mb-1">Module 2</div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Company & Postings</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Company profile administration, job descriptions, stipend details, eligibility cutoff rules, and test requirement linkage.
            </p>
          </div>

          {/* Module 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-emerald-600 uppercase mb-1">Module 3</div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Student & Applications</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Academic profile management, PDF resume upload, CGPA eligibility verification, and full-lifecycle application pipeline tracking.
            </p>
          </div>

          {/* Module 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition md:col-span-2 bg-gradient-to-br from-white to-brand-50/40 border-brand-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                <Terminal className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-600 text-white">
                Flagship Feature
              </span>
            </div>
            <div className="text-xs font-bold text-brand-600 uppercase mb-1">Module 4</div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Proctored Online Test Engine</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Interactive examination interface with fullscreen enforcement, tab-switch and blur detection, anti-cheat violation counters, countdown timers, and instant auto-evaluation for objective questions with score breakdown.
            </p>
          </div>

          {/* Module 5 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Database className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-purple-600 uppercase mb-1">Module 5</div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Question Bank & Assembler</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Categorized question repository (DSA, Web Dev, DBMS, Aptitude, Python), difficulty tiers, tags, explanations, and template-based test assembly.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Internships */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">
              Live Recruitment Drives
            </h2>
            <h3 className="text-2xl font-bold text-slate-900">Featured Internship Openings</h3>
          </div>
          <Link
            to="/internships"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>View All Openings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading open positions...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {internships.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden p-2">
                        {job.company_logo ? (
                          <img
                            src={job.company_logo}
                            alt={job.company_name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{job.title}</h4>
                        <p className="text-xs text-slate-500 font-medium">{job.company_name}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {job.employment_type}
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mb-4">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">₹{job.stipend_amount?.toLocaleString()}/mo</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location_city || job.location_type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.duration_months} Months</span>
                    </div>
                    {job.test_title && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium border border-purple-200">
                        Online Test Required
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Min CGPA: <strong>{job.min_cgpa > 0 ? job.min_cgpa : 'Open'}</strong>
                  </span>
                  <Link
                    to={`/internships/${job.id}`}
                    className="px-4 py-2 bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                  >
                    <span>View & Apply</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
