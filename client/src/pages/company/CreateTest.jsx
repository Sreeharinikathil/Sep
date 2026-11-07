import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Clock, Database, PlusCircle, Check, ArrowLeft, 
  ShieldCheck, AlertCircle, Sparkles, Filter 
} from 'lucide-react';

export default function CreateTest() {
  const navigate = useNavigate();
  const [bankQuestions, setBankQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Technical Screening',
    duration_minutes: 30,
    passing_percentage: 60.0,
    allow_randomization: true,
    proctoring_enabled: true,
    strict_mode: true,
    max_tab_switches: 3
  });

  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    loadBank();
  }, [selectedCategory]);

  async function loadBank() {
    try {
      const params = selectedCategory !== 'ALL' ? `category=${selectedCategory}` : '';
      const data = await api.getQuestions(params);
      setBankQuestions(data.questions || []);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  }

  function toggleQuestionSelect(id) {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function handleSelectAllVisible() {
    const visibleIds = bankQuestions.map(q => q.id);
    const allSelected = visibleIds.every(id => selectedQuestionIds.includes(id));
    if (allSelected) {
      setSelectedQuestionIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedQuestionIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  }

  // Calculate live total marks
  const totalSelectedMarks = bankQuestions
    .filter(q => selectedQuestionIds.includes(q.id))
    .reduce((sum, q) => sum + (q.marks || 1), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (selectedQuestionIds.length === 0) {
      setError('Please select at least one question from the Question Bank.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.createTest({
        ...form,
        duration_minutes: parseInt(form.duration_minutes, 10),
        passing_percentage: parseFloat(form.passing_percentage),
        max_tab_switches: parseInt(form.max_tab_switches, 10),
        question_ids: selectedQuestionIds
      });

      navigate('/company/tests');
    } catch (err) {
      setError(err.message || 'Failed to assemble test.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/company/tests"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Tests</span>
      </Link>

      {/* Header */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create & Assemble Online Assessment
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Module 4 & 5: Combine questions, set time limits, and configure anti-cheat proctoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Selected Questions</span>
            <span className="text-lg font-extrabold text-brand-600">
              {selectedQuestionIds.length} <span className="text-xs font-normal text-slate-500">({totalSelectedMarks} Marks)</span>
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Test Parameters Card */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            1. Test Metadata & Proctoring Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Test Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Google Cloud SWE Intern Assessment"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Assessment Category
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Technical Screening / Full Stack"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Duration (Minutes) *
              </label>
              <input
                type="number"
                min="5"
                max="180"
                required
                value={form.duration_minutes}
                onChange={(e) => setForm(prev => ({ ...prev, duration_minutes: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Passing Cutoff Percentage (%)
              </label>
              <input
                type="number"
                step="1"
                min="10"
                max="100"
                required
                value={form.passing_percentage}
                onChange={(e) => setForm(prev => ({ ...prev, passing_percentage: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold text-emerald-700"
              />
            </div>
          </div>

          {/* Proctoring Toggles */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Proctoring Safeguards (Module 4)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.proctoring_enabled}
                  onChange={(e) => setForm(prev => ({ ...prev, proctoring_enabled: e.target.checked }))}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <span className="text-xs font-medium text-slate-800">Live AI Proctoring</span>
              </label>

              <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.strict_mode}
                  onChange={(e) => setForm(prev => ({ ...prev, strict_mode: e.target.checked }))}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <span className="text-xs font-medium text-slate-800">Fullscreen & Tab Lock</span>
              </label>

              <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allow_randomization}
                  onChange={(e) => setForm(prev => ({ ...prev, allow_randomization: e.target.checked }))}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <span className="text-xs font-medium text-slate-800">Shuffle Questions</span>
              </label>
            </div>
          </div>
        </div>

        {/* Question Selector Card */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                2. Select Questions from Question Bank
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Check questions below to include them in this online assessment
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Data Structures & Algorithms">Data Structures & Algo</option>
                <option value="Web Technologies">Web Technologies</option>
                <option value="Database Systems">Database Systems</option>
                <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                <option value="Python & Programming">Python & Core CS</option>
              </select>

              <button
                type="button"
                onClick={handleSelectAllVisible}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
              >
                Toggle Visible
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading questions...</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {bankQuestions.map((q) => {
                const isChecked = selectedQuestionIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleQuestionSelect(q.id)}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                      isChecked
                        ? 'bg-brand-50/60 border-brand-300 text-brand-950'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by parent div
                      className="w-4 h-4 mt-0.5 text-brand-600 rounded focus:ring-brand-500"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold px-2 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px]">
                          {q.category}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {q.difficulty} &bull; +{q.marks} Marks
                        </span>
                      </div>
                      <p className="font-medium text-slate-900 leading-snug">
                        {q.question_text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/company/tests"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/25 flex items-center gap-2 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{submitting ? 'Assembling...' : 'Publish Online Assessment'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
