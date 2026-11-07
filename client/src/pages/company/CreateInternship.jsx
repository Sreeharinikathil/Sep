import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Building2, Briefcase, IndianRupee, Clock, Calendar, 
  MapPin, Check, AlertCircle, ArrowLeft, PlusCircle 
} from 'lucide-react';

export default function CreateInternship() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: '',
    department: 'Engineering & Product',
    employment_type: 'Summer Internship',
    location_type: 'HYBRID',
    location_city: 'Bangalore, Karnataka',
    stipend_amount: 50000,
    stipend_type: 'Monthly',
    duration_months: 6,
    description: '',
    responsibilities: '',
    requirements: '',
    required_skills: '',
    min_cgpa: 7.5,
    allowed_branches: 'CSE, IT, ECE',
    target_batches: '2025, 2026',
    openings_count: 5,
    deadline: '2026-12-31',
    test_id: ''
  });

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    try {
      const data = await api.getTests();
      setTests(data.tests || []);
    } catch (err) {
      console.error('Failed to load tests:', err);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.createInternship({
        ...form,
        stipend_amount: Number(form.stipend_amount),
        duration_months: Number(form.duration_months),
        min_cgpa: parseFloat(form.min_cgpa),
        openings_count: parseInt(form.openings_count, 10),
        test_id: form.test_id ? parseInt(form.test_id, 10) : null
      });

      navigate('/company/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to publish internship.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/company/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Publish New Internship Opening
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Specify eligibility standards, compensation details, and link an online selection test
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Position Info */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Basic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Internship Title *
                </label>
                <input
                  type="text"
                  required
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Cloud Software Engineer Intern"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Department / Team *
                </label>
                <input
                  type="text"
                  required
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. Cloud & AI Division"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Employment Type
                </label>
                <select
                  name="employment_type"
                  value={form.employment_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Summer Internship">Summer Internship</option>
                  <option value="Full-time Internship">Full-time Internship</option>
                  <option value="Co-op Internship">Co-op Internship</option>
                  <option value="Winter Internship">Winter Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Work Mode
                </label>
                <select
                  name="location_type"
                  value={form.location_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ON_SITE">On-Site</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Location / City
                </label>
                <input
                  type="text"
                  name="location_city"
                  value={form.location_city}
                  onChange={handleChange}
                  placeholder="Bangalore, Karnataka"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Compensation & Schedule */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Compensation & Duration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Monthly Stipend (INR ₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  name="stipend_amount"
                  value={form.stipend_amount}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Duration (Months)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  required
                  name="duration_months"
                  value={form.duration_months}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Number of Openings
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  name="openings_count"
                  value={form.openings_count}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Eligibility & Assessment Link */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Eligibility Criteria & Selection Assessment
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Minimum Cutoff CGPA (0 - 10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  name="min_cgpa"
                  value={form.min_cgpa}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Allowed Branches
                </label>
                <input
                  type="text"
                  name="allowed_branches"
                  value={form.allowed_branches}
                  onChange={handleChange}
                  placeholder="CSE, IT, ECE, EEE"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Graduation Batches
                </label>
                <input
                  type="text"
                  name="target_batches"
                  value={form.target_batches}
                  onChange={handleChange}
                  placeholder="2025, 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Link Online Test (Module 4 Engine)
                </label>
                <select
                  name="test_id"
                  value={form.test_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- No Test Requirement --</option>
                  {tests.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.duration_minutes}m &bull; {t.question_count} Qs)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Detailed Descriptions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              4. Role Specifications
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Overview & Description *
              </label>
              <textarea
                rows={4}
                required
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Detailed summary of the internship role..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Responsibilities
              </label>
              <textarea
                rows={3}
                name="responsibilities"
                value={form.responsibilities}
                onChange={handleChange}
                placeholder="• Develop frontend components&#10;• Optimize backend queries..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Key Skills (Comma separated)
              </label>
              <input
                type="text"
                name="required_skills"
                value={form.required_skills}
                onChange={handleChange}
                placeholder="React, Node.js, Python, PostgreSQL, Docker"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              to="/company/dashboard"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-brand-600/25 flex items-center gap-2 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Publishing...' : 'Publish Internship'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
