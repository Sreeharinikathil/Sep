import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  Search, Filter, MapPin, IndianRupee, Clock, Building2, 
  CheckCircle2, AlertTriangle, ArrowRight, Check, X 
} from 'lucide-react';

export default function BrowseInternships() {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');

  // Apply Modal state
  const [applyingJob, setApplyingJob] = useState(null);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyMessage, setApplyMessage] = useState(null);
  const [applyError, setApplyError] = useState(null);

  useEffect(() => {
    fetchInternships();
  }, [searchTerm, selectedDept, selectedLocation]);

  async function fetchInternships() {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedDept !== 'ALL') params.append('department', selectedDept);
      if (selectedLocation !== 'ALL') params.append('location_type', selectedLocation);

      const data = await api.getInternships(params.toString());
      setInternships(data.internships || []);
    } catch (err) {
      console.error('Failed to load internships:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmApply() {
    if (!applyingJob) return;
    setApplySubmitting(true);
    setApplyError(null);
    setApplyMessage(null);

    try {
      const res = await api.applyForInternship(applyingJob.id);
      setApplyMessage(res.message || 'Application submitted successfully!');
      setTimeout(() => {
        setApplyingJob(null);
        setApplyMessage(null);
      }, 2000);
    } catch (err) {
      setApplyError(err.message || 'Failed to submit application.');
    } finally {
      setApplySubmitting(false);
    }
  }

  const studentCgpa = user?.profile?.cgpa || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Internship Opportunities
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Apply to verified college recruitment drives and take screening assessments
          </p>
        </div>

        {user?.role === 'STUDENT' && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <span className="text-slate-500">Your Academic Profile:</span>
            <strong className="text-slate-800">{user.profile?.register_no || 'Student'}</strong>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
              CGPA: {studentCgpa}
            </span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by job title, company name, or technology tags..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full md:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering & Product">Engineering & Product</option>
            <option value="Platform Engineering">Platform Engineering</option>
            <option value="Cloud + AI Division">Cloud + AI Division</option>
            <option value="Automotive & Embedded Division">Embedded & IoT</option>
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full md:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="ALL">All Work Modes</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ON_SITE">On-Site</option>
          </select>
        </div>
      </div>

      {/* Internship Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Searching recruitment openings...</div>
      ) : internships.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No Openings Match Your Filter</h3>
          <p className="text-slate-500 text-xs mt-1">Try clearing some filter criteria to view all available drives.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {internships.map((job) => {
            const isEligible = user?.role === 'STUDENT' ? studentCgpa >= (job.min_cgpa || 0) : true;

            return (
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
                        <h3 className="font-bold text-slate-900 text-base leading-snug">{job.title}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span>{job.company_name}</span>
                          {job.company_verified ? (
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Verified
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {job.employment_type}
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 mb-4">
                    {job.description}
                  </p>

                  {/* Skills tags */}
                  {job.required_skills && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.required_skills.split(',').map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-3 border-y border-slate-100 text-xs text-slate-600 mb-4">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Stipend</span>
                      <strong className="text-slate-900 font-semibold">
                        ₹{job.stipend_amount?.toLocaleString()}/mo
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Mode / Location</span>
                      <span className="font-medium text-slate-800">{job.location_city || job.location_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Min CGPA</span>
                      <span className="font-medium text-slate-800">
                        {job.min_cgpa > 0 ? `${job.min_cgpa}+` : 'No cutoff'}
                      </span>
                    </div>
                  </div>

                  {/* Test & Eligibility Indicators */}
                  <div className="space-y-1.5 mb-4">
                    {job.test_title && (
                      <div className="flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 p-2 rounded-lg border border-purple-200">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Online Test Required: <strong>{job.test_title}</strong> ({job.test_duration} mins)</span>
                      </div>
                    )}

                    {user?.role === 'STUDENT' && (
                      <div className={`flex items-center gap-1.5 text-xs p-2 rounded-lg border ${
                        isEligible
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {isEligible ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>You meet academic criteria ({studentCgpa} CGPA &ge; {job.min_cgpa})</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Requires min {job.min_cgpa} CGPA (Your current: {studentCgpa})</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <Link
                    to={`/internships/${job.id}`}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                  >
                    View Details
                  </Link>

                  {user?.role === 'STUDENT' ? (
                    <button
                      onClick={() => setApplyingJob(job)}
                      disabled={!isEligible}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm ${
                        isEligible
                          ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
                    >
                      Sign In to Apply
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Apply Modal */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Confirm Internship Application</h3>
              <button
                onClick={() => setApplyingJob(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="font-semibold text-slate-900 text-sm">{applyingJob.title}</div>
                <div>{applyingJob.company_name} &bull; ₹{applyingJob.stipend_amount?.toLocaleString()}/mo</div>
              </div>

              <div>
                <strong>Applicant:</strong> {user?.full_name} ({user?.profile?.register_no})
              </div>
              <div>
                <strong>Department & CGPA:</strong> {user?.profile?.department} ({studentCgpa})
              </div>

              {applyingJob.test_title && (
                <div className="p-3 bg-purple-50 rounded-xl text-purple-900 border border-purple-200 space-y-1">
                  <strong>Online Screening Requirement:</strong>
                  <p>
                    This opening requires taking the <strong>{applyingJob.test_title}</strong>. Upon applying, the test will be unlocked on your dashboard.
                  </p>
                </div>
              )}

              {applyMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{applyMessage}</span>
                </div>
              )}

              {applyError && (
                <div className="p-3 bg-rose-50 text-rose-800 rounded-xl">
                  {applyError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApplyingJob(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApply}
                disabled={applySubmitting || applyMessage}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm disabled:opacity-50"
              >
                {applySubmitting ? 'Submitting...' : 'Confirm Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
