import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  User, GraduationCap, FileText, Upload, Check, 
  AlertCircle, GitBranch, Link2, Globe, Save 
} from 'lucide-react';

export default function StudentProfile() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '',
    register_no: '',
    college_name: '',
    department: '',
    degree: '',
    cgpa: 0,
    batch_year: 2025,
    phone: '',
    bio: '',
    skills: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
    resume_url: '',
    resume_filename: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await api.getStudentProfile();
      setProfile({
        full_name: data.user?.full_name || '',
        ...data.profile
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      await api.updateStudentProfile(profile);
      await refreshUser();
      setStatusMsg('Profile updated successfully!');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleResumeUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploadingResume(true);
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.uploadResume(formData);
      setProfile(prev => ({
        ...prev,
        resume_url: res.resumeUrl,
        resume_filename: res.fileName
      }));
      setStatusMsg('Resume uploaded successfully!');
      await refreshUser();
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload resume file.');
    } finally {
      setUploadingResume(false);
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading student profile...</div>;
  }

  // Calculate profile completion percentage
  const fieldsToCheck = [
    profile.full_name, profile.register_no, profile.department, 
    profile.cgpa, profile.skills, profile.phone, profile.bio, profile.resume_url
  ];
  const completedCount = fieldsToCheck.filter(Boolean).length;
  const completionPercent = Math.round((completedCount / fieldsToCheck.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Profile & Academic Record
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage your credentials, eligibility metrics, and resume for campus recruitment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Profile Strength</span>
            <span className="text-sm font-extrabold text-brand-600">{completionPercent}%</span>
          </div>
          <div className="w-16 bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-brand-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="font-bold text-slate-900 text-base">Academic & Personal Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  name="full_name"
                  value={profile.full_name || ''}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  College Register No.
                </label>
                <input
                  type="text"
                  required
                  name="register_no"
                  value={profile.register_no || ''}
                  onChange={handleChange}
                  placeholder="CCE25CS231"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Current CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  name="cgpa"
                  value={profile.cgpa || ''}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold text-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Graduation Batch
                </label>
                <input
                  type="number"
                  name="batch_year"
                  value={profile.batch_year || 2025}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={profile.department || ''}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Bio & Career Objective
              </label>
              <textarea
                rows={3}
                name="bio"
                value={profile.bio || ''}
                onChange={handleChange}
                placeholder="Brief summary of your academic background, passions, and technical aspirations..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Technical Skills (Comma separated)
              </label>
              <input
                type="text"
                name="skills"
                value={profile.skills || ''}
                onChange={handleChange}
                placeholder="React, Node.js, Python, PostgreSQL, Data Structures, Docker"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                Professional & Social Profiles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <GitBranch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    name="github_url"
                    value={profile.github_url || ''}
                    onChange={handleChange}
                    placeholder="GitHub URL"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    name="linkedin_url"
                    value={profile.linkedin_url || ''}
                    onChange={handleChange}
                    placeholder="LinkedIn URL"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    name="portfolio_url"
                    value={profile.portfolio_url || ''}
                    onChange={handleChange}
                    placeholder="Portfolio URL"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Resume Card */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>Resume Document</span>
            </h3>

            {profile.resume_url ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 truncate">
                    {profile.resume_filename || 'Uploaded_Resume.pdf'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Attached to your internship applications for recruiter screening.
                </p>
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-brand-600 hover:text-brand-700 font-semibold"
                >
                  View / Download Resume &rarr;
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                You haven't uploaded a resume yet. Upload a PDF copy to attach to future applications.
              </p>
            )}

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Upload New Resume (PDF / DOCX)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={uploadingResume}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
              />
              {uploadingResume && (
                <p className="text-[11px] text-brand-600 mt-1">Uploading document...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
