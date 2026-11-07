import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import { 
  Award, CheckCircle2, XCircle, ArrowLeft, Clock, 
  ShieldCheck, AlertTriangle, HelpCircle, FileText, ChevronDown 
} from 'lucide-react';

export default function TestResult() {
  const { attemptId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResult();
  }, [attemptId]);

  async function loadResult() {
    try {
      // testId can be 0 or dummy because route handles attemptId lookup
      const res = await api.getTestResult(0, attemptId);
      setData(res);

      if (res.attempt?.passed) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve test evaluation.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="py-24 text-center text-slate-400">Loading performance report & solutions...</div>;
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-2xl border border-rose-200 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-bold text-slate-900 text-base">Error Loading Result</h3>
        <p className="text-slate-600 text-xs">{error || 'Record not found'}</p>
        <Link to="/student/applications" className="inline-block text-xs font-semibold text-brand-600">
          &larr; Back to Applications
        </Link>
      </div>
    );
  }

  const { attempt, questions } = data;
  const isPassed = attempt.passed;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/student/applications"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to My Applications</span>
      </Link>

      {/* Main Scorecard Banner */}
      <div className={`p-8 rounded-3xl border shadow-sm relative overflow-hidden ${
        isPassed 
          ? 'bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 text-white border-emerald-500/40' 
          : 'bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950 text-white border-slate-800'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Assessment Performance Report</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {attempt.test_title}
            </h1>
            <p className="text-xs text-slate-300">
              Candidate: <strong>{attempt.student_name}</strong> &bull; Reg: {attempt.register_no} &bull; Submitted on {new Date(attempt.submitted_at).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-6 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
              <span className="text-3xl font-extrabold text-white">
                {attempt.total_score} <span className="text-sm font-medium text-slate-400">/ {attempt.max_score}</span>
              </span>
            </div>

            <div className="h-10 w-[1px] bg-white/15"></div>

            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
              <span className={`text-base font-extrabold px-3 py-1 rounded-lg inline-block ${
                isPassed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {isPassed ? 'PASSED' : 'BELOW CUTOFF'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                Score: {attempt.percentage}% (Cutoff: {attempt.passing_percentage}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Proctoring & Diagnostics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Time Taken</span>
            <span className="font-bold text-slate-900 text-sm">
              {Math.floor(attempt.time_taken_seconds / 60)}m {attempt.time_taken_seconds % 60}s
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            attempt.tab_switch_count === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Tab Switches</span>
            <span className="font-bold text-slate-900 text-sm">
              {attempt.tab_switch_count} Violations Logged
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Evaluation Mode</span>
            <span className="font-bold text-slate-900 text-sm">Automated Instant Evaluation</span>
          </div>
        </div>
      </div>

      {/* Question-by-Question Solution Review */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Detailed Solution & Explanations Review
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Total {questions?.length} Questions
          </span>
        </div>

        <div className="space-y-4">
          {questions?.map((q, idx) => {
            const candidateChoice = q.candidateAnswer !== undefined ? parseInt(q.candidateAnswer, 10) : null;
            const correctChoice = parseInt(q.correctAnswers[0], 10);
            const isCorrect = candidateChoice === correctChoice;

            return (
              <div
                key={q.id}
                className={`p-6 rounded-2xl bg-white border transition shadow-xs ${
                  isCorrect ? 'border-emerald-200' : 'border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                      Q{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[11px] font-medium border border-slate-200">
                      {q.category}
                    </span>
                    <span className="text-xs text-slate-400">+{q.marks} Marks</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    isCorrect ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-900 mb-4">
                  {q.question_text}
                </p>

                {/* Options display with highlighting */}
                <div className="space-y-2 mb-4">
                  {q.options?.map((opt, optIdx) => {
                    const isCandidateChoice = candidateChoice === optIdx;
                    const isActualCorrect = correctChoice === optIdx;

                    let optClasses = 'border-slate-100 bg-slate-50 text-slate-700';
                    if (isActualCorrect) {
                      optClasses = 'border-emerald-300 bg-emerald-50/80 text-emerald-950 font-semibold';
                    } else if (isCandidateChoice && !isActualCorrect) {
                      optClasses = 'border-rose-300 bg-rose-50/80 text-rose-950 font-semibold line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optClasses}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-white/80 border flex items-center justify-center font-bold text-[10px]">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isActualCorrect && (
                          <span className="text-[10px] font-bold text-emerald-700 uppercase">Correct Answer</span>
                        )}
                        {isCandidateChoice && !isActualCorrect && (
                          <span className="text-[10px] font-bold text-rose-700 uppercase">Your Answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {q.explanation && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                    <strong className="text-slate-800 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
                      <span>Conceptual Explanation:</span>
                    </strong>
                    <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
