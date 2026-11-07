import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Clock, PlusCircle, Trash2, CheckCircle2, 
  ArrowLeft, Users, ShieldAlert, Award, FileText 
} from 'lucide-react';

export default function ManageTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    try {
      const data = await api.getTests();
      setTests(data.tests || []);
    } catch (err) {
      console.error('Failed to load tests:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this test?')) return;
    try {
      await api.deleteTest(id);
      await loadTests();
    } catch (err) {
      alert('Failed to delete test: ' + err.message);
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
            Online Selection Assessments
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Module 4 & 5: Manage timed exams, question pools, and candidate performance telemetry
          </p>
        </div>

        <Link
          to="/company/create-test"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Assemble New Test</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading tests...</div>
      ) : tests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Tests Created Yet</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            Assemble questions from the Question Bank into an online timed test to screen candidates.
          </p>
          <Link
            to="/company/create-test"
            className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
          >
            Create Your First Assessment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <div
              key={test.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                    {test.category}
                  </span>
                  <button
                    onClick={() => handleDelete(test.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="Delete Test"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {test.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {test.description || 'Configured with strict proctoring and automated objective evaluation.'}
                </p>

                <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Duration</span>
                    <strong className="text-slate-900">{test.duration_minutes}m</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Questions</span>
                    <strong className="text-slate-900">{test.question_count} Qs</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Marks</span>
                    <strong className="text-slate-900">{test.total_marks}</strong>
                  </div>
                </div>

                {/* Candidate attempts telemetry */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Candidates Attempted:</span>
                    <strong className="text-slate-900">{test.attempts_count || 0}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Passed Screening:</span>
                    <strong className="text-emerald-700">{test.passed_count || 0}</strong>
                  </div>
                  {test.average_score > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Average Score:</span>
                      <strong className="text-brand-700">{test.average_score} Marks</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Passing Cutoff: {test.passing_percentage}%</span>
                <span className="text-emerald-600 font-medium">Proctored AI</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
