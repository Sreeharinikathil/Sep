import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Database, PlusCircle, Search, Filter, Trash2, 
  CheckCircle2, HelpCircle, ArrowLeft, Tag, X, Check 
} from 'lucide-react';

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Question Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newQ, setNewQ] = useState({
    category: 'Data Structures & Algorithms',
    difficulty: 'MEDIUM',
    question_text: '',
    question_type: 'MCQ_SINGLE',
    options: ['', '', '', ''],
    correct_answers: [0],
    explanation: '',
    marks: 2.0,
    negative_marks: 0.5,
    tags: ''
  });

  useEffect(() => {
    fetchQuestions();
    fetchSummary();
  }, [categoryFilter, difficultyFilter, searchTerm]);

  async function fetchQuestions() {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (difficultyFilter !== 'ALL') params.append('difficulty', difficultyFilter);
      if (searchTerm) params.append('search', searchTerm);

      const data = await api.getQuestions(params.toString());
      setQuestions(data.questions || []);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSummary() {
    try {
      const data = await api.getQuestionSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load question summary:', err);
    }
  }

  function handleOptionChange(index, val) {
    const updated = [...newQ.options];
    updated[index] = val;
    setNewQ(prev => ({ ...prev, options: updated }));
  }

  async function handleAddQuestion(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.createQuestion(newQ);
      setAddModalOpen(false);
      setNewQ({
        category: 'Data Structures & Algorithms',
        difficulty: 'MEDIUM',
        question_text: '',
        question_type: 'MCQ_SINGLE',
        options: ['', '', '', ''],
        correct_answers: [0],
        explanation: '',
        marks: 2.0,
        negative_marks: 0.5,
        tags: ''
      });
      await fetchQuestions();
      await fetchSummary();
    } catch (err) {
      alert('Failed to add question: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteQuestion(id) {
    if (!confirm('Are you sure you want to remove this question from the Question Bank?')) return;
    try {
      await api.deleteQuestion(id);
      await fetchQuestions();
      await fetchSummary();
    } catch (err) {
      alert('Failed to delete question: ' + err.message);
    }
  }

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
            Centralized Question Bank
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Module 5: Manage categorized questions, options, difficulty tiers, and tags
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Category Pills & Stats Summary */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total In Bank</span>
            <span className="text-2xl font-extrabold text-slate-900">{summary.totalQuestions} Questions</span>
          </div>

          {summary.categories?.slice(0, 3).map((c, i) => (
            <div key={i} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block truncate">{c.category}</span>
              <span className="text-2xl font-extrabold text-brand-600">{c.count} Qs</span>
            </div>
          ))}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions by text or keywords..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Data Structures & Algorithms">Data Structures & Algo</option>
            <option value="Web Technologies">Web Technologies</option>
            <option value="Database Systems">Database Systems</option>
            <option value="Quantitative Aptitude">Quantitative Aptitude</option>
            <option value="Python & Programming">Python & Core CS</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading question repository...</div>
      ) : questions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No questions match the current filter.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800">
                    #{q.id}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700">
                    {q.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    q.difficulty === 'EASY'
                      ? 'bg-emerald-50 text-emerald-700'
                      : q.difficulty === 'HARD'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {q.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    +{q.marks} Marks {q.negative_marks > 0 ? `| -${q.negative_marks} Neg` : ''}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Remove from bank"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm font-semibold text-slate-900 leading-snug">
                {q.question_text}
              </p>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {q.options?.map((opt, optIdx) => {
                  const isCorrect = q.correct_answers?.includes(optIdx);
                  return (
                    <div
                      key={optIdx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        isCorrect
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-white border flex items-center justify-center font-bold text-[10px]">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-start gap-2 border border-slate-100">
                  <HelpCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <p><strong className="text-slate-800">Explanation:</strong> {q.explanation}</p>
                </div>
              )}

              {q.tags && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Tag className="w-3 h-3" />
                  <span>{q.tags}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New Question Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Question to Bank</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={newQ.category}
                    onChange={(e) => setNewQ(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                    <option value="Web Technologies">Web Technologies</option>
                    <option value="Database Systems">Database Systems</option>
                    <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                    <option value="Python & Programming">Python & Programming</option>
                    <option value="Operating Systems">Operating Systems</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Difficulty Tier
                  </label>
                  <select
                    value={newQ.difficulty}
                    onChange={(e) => setNewQ(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Question Statement *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newQ.question_text}
                  onChange={(e) => setNewQ(prev => ({ ...prev, question_text: e.target.value }))}
                  placeholder="Enter the complete question problem statement..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700 uppercase tracking-wider">
                  Options & Correct Answer Check *
                </label>
                {newQ.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct_answer_radio"
                      checked={newQ.correct_answers[0] === optIdx}
                      onChange={() => setNewQ(prev => ({ ...prev, correct_answers: [optIdx] }))}
                      className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-bold text-slate-500 text-xs w-4">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + optIdx)} text...`}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Conceptual Explanation
                </label>
                <textarea
                  rows={2}
                  value={newQ.explanation}
                  onChange={(e) => setNewQ(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explain why this option is correct for candidate post-exam review..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Marks Awarded
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={newQ.marks}
                    onChange={(e) => setNewQ(prev => ({ ...prev, marks: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Negative Marks
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={newQ.negative_marks}
                    onChange={(e) => setNewQ(prev => ({ ...prev, negative_marks: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={newQ.tags}
                    onChange={(e) => setNewQ(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="#arrays, #trees"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Save to Question Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
