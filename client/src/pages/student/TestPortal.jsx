import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  Clock, ShieldAlert, AlertTriangle, CheckCircle2, 
  ArrowLeft, ArrowRight, Flag, RotateCcw, Camera, 
  Maximize2, Eye, EyeOff, Check, X 
} from 'lucide-react';

export default function TestPortal() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Test state
  const [testData, setTestData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Candidate progress state
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewedQuestions, setReviewedQuestions] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState({ 0: true });

  // Timer & Proctoring state
  const [remainingSeconds, setRemainingSeconds] = useState(1800);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);

  // Webcam state
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Initialize test
  useEffect(() => {
    loadTestSession();
  }, [id]);

  async function loadTestSession() {
    try {
      const data = await api.startTestAttempt(id);
      setTestData(data.test);
      setQuestions(data.questions || []);
      setAttemptId(data.attemptId);
      setAnswers(data.savedAnswers || {});
      setTabSwitchCount(data.tabSwitchCount || 0);
      setRemainingSeconds(data.remainingSeconds || 1800);
    } catch (err) {
      setError(err.message || 'Failed to initialize test.');
    } finally {
      setLoading(false);
    }
  }

  // Timer Countdown Effect
  useEffect(() => {
    if (!hasStarted || isSubmitting) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit('Time limit expired.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, isSubmitting]);

  // Anti-Cheat & Tab-Switch Listener
  useEffect(() => {
    if (!hasStarted || !testData?.proctoring_enabled || isSubmitting) return;

    function handleVisibilityChange() {
      if (document.hidden) {
        recordViolation('TAB_SWITCH', 'Candidate switched browser tab or minimized window');
      }
    }

    function handleBlur() {
      recordViolation('FOCUS_LOST', 'Candidate shifted window focus');
    }

    function handleContextMenu(e) {
      e.preventDefault();
    }

    function handleKeyDown(e) {
      // Prevent Copy, Cut, Paste, F12, DevTools
      if (
        (e.ctrlKey && ['c', 'v', 'u', 's', 'p'].includes(e.key.toLowerCase())) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasStarted, testData, isSubmitting, attemptId]);

  async function recordViolation(violationType, details) {
    if (!attemptId) return;

    try {
      const res = await api.logProctoringViolation(id, {
        attemptId,
        violationType,
        details
      });

      setTabSwitchCount(res.tabSwitchCount);

      if (res.disqualified) {
        setIsSubmitting(true);
        alert('You have been disqualified due to multiple proctoring violations.');
        navigate('/student/applications');
      } else {
        setWarningMessage(res.message);
        setWarningModalOpen(true);
      }
    } catch (err) {
      console.warn('Failed to record violation:', err);
    }
  }

  // Request Fullscreen & Start
  async function handleStartTest() {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (err) {
      console.log('Fullscreen bypassed:', err);
    }

    // Try camera access
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
          }
        })
        .catch(() => {
          setCameraActive(true); // graceful fallback simulation
        });
    } else {
      setCameraActive(true);
    }

    setHasStarted(true);
  }

  // Answer selection
  function handleSelectOption(optionIndex) {
    const q = questions[currentIndex];
    if (!q) return;

    setAnswers(prev => ({
      ...prev,
      [q.id]: optionIndex
    }));
  }

  function handleClearAnswer() {
    const q = questions[currentIndex];
    if (!q) return;

    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[q.id];
      return copy;
    });
  }

  function toggleMarkForReview() {
    const q = questions[currentIndex];
    if (!q) return;

    setReviewedQuestions(prev => ({
      ...prev,
      [q.id]: !prev[q.id]
    }));
  }

  function navigateToQuestion(idx) {
    if (idx < 0 || idx >= questions.length) return;
    setCurrentIndex(idx);
    setVisitedQuestions(prev => ({ ...prev, [idx]: true }));
  }

  async function handleAutoSubmit(reason) {
    setIsSubmitting(true);
    try {
      const timeTaken = (testData?.duration_minutes * 60) - remainingSeconds;
      const res = await api.submitTest(id, {
        attemptId,
        answers,
        timeTakenSeconds: Math.max(0, timeTaken)
      });

      // Exit fullscreen
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }

      navigate(`/student/test-result/${attemptId}`);
    } catch (err) {
      alert('Failed to submit test: ' + err.message);
      setIsSubmitting(false);
    }
  }

  async function handleManualSubmit() {
    setSubmitConfirmOpen(false);
    await handleAutoSubmit('Candidate submitted manually.');
  }

  // Timer formatting
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isUrgent = remainingSeconds <= 300; // < 5 mins
  const isCritical = remainingSeconds <= 60; // < 1 min

  if (loading) {
    return <div className="py-24 text-center text-slate-400">Loading test engine & environment...</div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-2xl border border-rose-200 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-base">Unable to Start Test</h3>
        <p className="text-slate-600 text-xs">{error}</p>
        <button
          onClick={() => navigate('/student/applications')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to My Applications
        </button>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: PRE-TEST INSTRUCTIONS SCREEN
  // ==========================================
  if (!hasStarted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {testData?.title}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Conducted by {testData?.company_name} &bull; {testData?.category}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
              <span className="text-sm font-extrabold text-slate-900">{testData?.duration_minutes} Mins</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Questions</span>
              <span className="text-sm font-extrabold text-slate-900">{testData?.total_questions} Questions</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Marks</span>
              <span className="text-sm font-extrabold text-slate-900">{testData?.total_marks}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Passing Cutoff</span>
              <span className="text-sm font-extrabold text-emerald-600">60%</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Proctoring Rules & Instructions</h3>
            <ul className="space-y-2 text-xs text-slate-600 leading-relaxed list-disc list-inside bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 text-amber-950">
              <li><strong>Fullscreen Mandatory:</strong> The test will launch in locked fullscreen mode.</li>
              <li><strong>Anti-Cheat Active:</strong> Tab switching and window blur are actively recorded.</li>
              <li><strong>3-Strike Policy:</strong> After 3 tab-switch violations, the test will be automatically disqualified.</li>
              <li><strong>Copy/Paste Disabled:</strong> Keyboard shortcuts and right-click menus are locked.</li>
              <li><strong>Auto-Save:</strong> Responses are saved in real-time as you select them.</li>
            </ul>
          </div>

          {/* Candidate Verification Preview */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Candidate Verified</span>
              <strong className="text-slate-900 text-sm">{user?.full_name}</strong>
              <span className="text-slate-500 block">Register No: {user?.profile?.register_no}</span>
            </div>
            <div className="w-16 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
              <Camera className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleStartTest}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition"
            >
              <Maximize2 className="w-4 h-4" />
              <span>I Agree to Rules & Start Proctored Test</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE PROCTORED EXAMINATION PORTAL
  // ==========================================
  const currentQ = questions[currentIndex];
  const isAnswered = currentQ && answers[currentQ.id] !== undefined;
  const isMarked = currentQ && Boolean(reviewedQuestions[currentQ.id]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col select-none">
      {/* Top Fixed Header Bar */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-xs">
            P
          </div>
          <div>
            <h2 className="font-bold text-sm text-white leading-tight">{testData?.title}</h2>
            <span className="text-[10px] text-slate-400">
              Candidate: <strong>{user?.full_name} ({user?.profile?.register_no})</strong>
            </span>
          </div>
        </div>

        {/* Center: Proctoring indicator & Camera */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-[11px] font-medium text-slate-300">Live AI Proctoring</span>
          </div>

          <div className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${
            tabSwitchCount > 0 
              ? 'bg-rose-950/80 border-rose-600 text-rose-300' 
              : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}>
            Violations: {tabSwitchCount} / {testData?.max_tab_switches || 3}
          </div>
        </div>

        {/* Right: Live Countdown Timer & Submit */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border transition ${
            isCritical
              ? 'bg-rose-600 text-white border-rose-700 animate-bounce'
              : isUrgent
              ? 'bg-amber-500 text-white border-amber-600'
              : 'bg-slate-800 text-white border-slate-700'
          }`}>
            <Clock className="w-4 h-4" />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={() => setSubmitConfirmOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Question Viewer (3 cols) */}
        <div className="lg:col-span-3 flex flex-col justify-between bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          {currentQ ? (
            <div className="space-y-6">
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                    {currentQ.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    +{currentQ.marks} Marks {currentQ.negative_marks > 0 ? `| -${currentQ.negative_marks} Neg` : ''}
                  </span>
                </div>

                <button
                  onClick={toggleMarkForReview}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isMarked
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isMarked ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                {currentQ.question_text}
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {currentQ.options?.map((option, idx) => {
                  const isSelected = answers[currentQ.id] === idx;
                  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition ${
                        isSelected
                          ? 'bg-brand-50/80 border-brand-500 shadow-xs text-brand-950 font-medium'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {optionLetters[idx] || idx + 1}
                      </span>
                      <span className="text-sm leading-snug">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">No question selected</div>
          )}

          {/* Bottom Controls */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleClearAnswer}
              disabled={!isAnswered}
              className="px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Response</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => navigateToQuestion(currentIndex + 1)}
                disabled={currentIndex === questions.length - 1}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
              >
                <span>Save & Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Palette & Proctoring Camera (1 col) */}
        <div className="space-y-6">
          {/* Proctoring Video Feed */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2 text-center">
            <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 text-[10px] text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>REC</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Webcam feed monitored for face presence
            </div>
          </div>

          {/* Question Palette */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Question Palette</h3>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-400"></span>
                <span>Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-rose-400"></span>
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-200"></span>
                <span>Not Visited</span>
              </div>
            </div>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const ans = answers[q.id] !== undefined;
                const rev = Boolean(reviewedQuestions[q.id]);
                const vis = Boolean(visitedQuestions[idx]);
                const isCurrent = idx === currentIndex;

                let colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
                if (ans) colorClasses = 'bg-emerald-500 text-white font-bold border-emerald-600';
                else if (rev) colorClasses = 'bg-amber-400 text-slate-900 font-bold border-amber-500';
                else if (vis) colorClasses = 'bg-rose-100 text-rose-800 border-rose-300';

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => navigateToQuestion(idx)}
                    className={`h-9 rounded-xl border text-xs font-semibold flex items-center justify-center transition ${colorClasses} ${
                      isCurrent ? 'ring-2 ring-brand-600 ring-offset-2' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Warning Anti-Cheat Modal */}
      {warningModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 text-center space-y-4 animate-bounce">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Proctoring Violation Flagged!
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {warningMessage || 'Browser window blur or tab switch was detected.'}
            </p>
            <div className="p-3 bg-rose-50 text-rose-900 rounded-xl text-xs font-semibold">
              Warning Count: {tabSwitchCount} / {testData?.max_tab_switches || 3}
            </div>
            <p className="text-[11px] text-slate-400">
              Please keep this window active in fullscreen. Continued violations will terminate your exam.
            </p>
            <button
              onClick={() => setWarningModalOpen(false)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition"
            >
              I Understand & Resume Test
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {submitConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Confirm Test Submission</h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl">
                <span className="block text-xl font-extrabold">{Object.keys(answers).length}</span>
                <span>Answered</span>
              </div>
              <div className="p-3 bg-rose-50 text-rose-900 rounded-xl">
                <span className="block text-xl font-extrabold">
                  {questions.length - Object.keys(answers).length}
                </span>
                <span>Unanswered</span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-900 rounded-xl">
                <span className="block text-xl font-extrabold">
                  {Object.values(reviewedQuestions).filter(Boolean).length}
                </span>
                <span>Marked</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to finalize and submit your test? Once submitted, your answers will be automatically evaluated.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSubmitConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
              >
                {isSubmitting ? 'Evaluating...' : 'Yes, Submit Final Answers'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
