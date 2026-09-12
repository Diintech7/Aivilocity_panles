import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Plus, Search, Edit2, Trash2, X,
  Video, Image as ImageIcon, FileText, Target,
  CheckCircle2, PlayCircle, Save, ArrowLeft, ChevronDown, ChevronUp, Layers,
  Award, Trophy, AlertTriangle, RotateCcw, Clock, Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.replace(/\\/g, '/');
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${BACKEND_URL}${normalizedPath}`;
};

// ─── Certificate Modal Component ──────────────────────────────────────────────
const CertificateView = ({ training, onClose }) => {
  const downloadCertificate = () => {
    const token = localStorage.getItem('token');
    window.open(`${API_BASE_URL}/trainings/${training._id}/certificate?token=${token}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden text-center p-6 border border-slate-200">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mx-auto mb-3 border border-amber-200">
          <Award size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Certificate Ready!</h3>
        <p className="text-xs text-gray-500 mb-5">
          Your official certificate of completion for <span className="font-semibold text-gray-800">{training.name}</span> has been issued.
        </p>
        
        <div className="flex flex-col gap-2.5">
          <button 
            onClick={downloadCertificate} 
            className="bg-[#ff5a1f] hover:bg-orange-600 text-white px-5 py-2.5 rounded-md font-bold text-sm transition-colors w-full shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Award size={16} /> Download PDF Certificate
          </button>
          <button 
            onClick={onClose} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-md font-semibold text-xs transition-colors w-full cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Quiz Result Component ───────────────────────────────────────────────────
const QuizResult = ({ result, onRetry, onNext, isLastModule }) => {
  const passed = result.passed;
  return (
    <div className={`rounded-lg border p-6 text-center ${passed ? 'border-green-200 bg-green-50/70' : 'border-rose-200 bg-rose-50/70'}`}>
      <div className={`w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-3 border ${passed ? 'bg-green-100 border-green-300 text-green-700' : 'bg-rose-100 border-rose-300 text-rose-700'}`}>
        {passed ? <Trophy size={28}/> : <AlertTriangle size={28}/>}
      </div>
      <h3 className={`text-xl font-bold mb-1 ${passed ? 'text-green-800' : 'text-rose-800'}`}>
        {passed ? '🎉 Excellent! You Passed!' : '❌ Not Quite There Yet'}
      </h3>
      <p className={`text-3xl font-black mb-1 ${passed ? 'text-green-600' : 'text-rose-600'}`}>
        {result.scorePercent}%
      </p>
      <p className="text-xs text-gray-600 mb-1">
        {result.score} / {result.total} correct answers
      </p>
      <p className="text-[11px] text-gray-500 mb-5">
        Minimum required passing score: {result.passingScore}%
      </p>

      {/* Per-question feedback */}
      <div className="text-left flex flex-col gap-2.5 mb-5">
        {result.results.map((r, idx) => (
          <div key={idx} className={`p-3 rounded-md border text-xs ${r.isCorrect ? 'bg-white border-green-300' : 'bg-white border-rose-300'}`}>
            <p className="font-semibold text-gray-800">Q{idx + 1}: {r.question}</p>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px]">
              <span className={`font-semibold ${r.isCorrect ? 'text-green-700' : 'text-rose-700'}`}>
                Your Answer: Option {r.selectedAnswer + 1}
              </span>
              {!r.isCorrect && (
                <span className="font-semibold text-green-700">
                  Correct Answer: Option {r.correctAnswer + 1}
                </span>
              )}
              <span className={`font-bold ml-auto ${r.isCorrect ? 'text-green-600' : 'text-rose-600'}`}>
                {r.isCorrect ? '✓ Correct' : '✗ Incorrect'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2.5 justify-center">
        {!passed && (
          <button 
            onClick={onRetry} 
            className="flex items-center gap-1.5 bg-[#ff5a1f] hover:bg-orange-600 text-white px-5 py-2 rounded-md font-bold text-xs transition-colors shadow-xs cursor-pointer"
          >
            <RotateCcw size={14}/> Retry Quiz
          </button>
        )}
        {passed && !isLastModule && (
          <button 
            onClick={onNext} 
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-bold text-xs transition-colors shadow-xs cursor-pointer"
          >
            Next Module <ArrowLeft size={14} className="rotate-180"/>
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Detail View Component ───────────────────────────────────────────────────
const TrainingDetail = ({ training: initialTraining, onBack }) => {
  const [training, setTraining] = useState(initialTraining);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeStep, setActiveStep] = useState(1);
  const [progress, setProgress] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  // Inline Quiz Editor state (for Client/Admin role)
  const [editingQuizIdx, setEditingQuizIdx] = useState(null);
  const [addingQuiz, setAddingQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({ question: '', options: ['', ''], correctAnswer: 0 });

  const userRole = localStorage.getItem('userRole');
  const isBA = userRole === 'bd';
  const canManageQuiz = userRole === 'client' || userRole === 'admin' || userRole === 'superadmin';
  const activeModule = training.modules?.[activeModuleIdx];

  // Fetch progress on load
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/trainings/${training._id}/progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setProgress(data.data);
      } catch {
        // silent
      }
    };
    fetchProgress();
  }, [training._id]);

  const isModuleCompleted = (idx) => progress?.completedModules?.includes(idx);

  const handleSelectAnswer = (qIdx, oIdx) => {
    setUserAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleSubmitQuiz = async () => {
    const quiz = activeModule?.quiz || [];
    if (quiz.length === 0) return;

    const unanswered = quiz.findIndex((_, idx) => userAnswers[idx] === undefined);
    if (unanswered !== -1) {
      toast.warning(`Please answer question ${unanswered + 1} before submitting.`);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const answers = quiz.map((_, idx) => userAnswers[idx]);
      const res = await fetch(`${API_BASE_URL}/trainings/${training._id}/module/${activeModuleIdx}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      if (data.success) {
        setQuizResult(data.data);
        setProgress(prev => ({
          ...prev,
          ...(data.data.passed ? { completedModules: [...(prev?.completedModules || []).filter(x => x !== activeModuleIdx), activeModuleIdx] } : {}),
          quizScores: { ...(prev?.quizScores || {}), [activeModuleIdx]: data.data.scorePercent },
          isCompleted: data.data.isTrainingCompleted,
          certificateId: data.data.certificateId,
          certificateIssuedAt: data.data.certificateIssuedAt
        }));
        if (data.data.isTrainingCompleted) {
          toast.success('🎓 Congratulations! Training Completed! Certificate Generated!');
        }
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Error submitting quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetryQuiz = () => {
    setQuizResult(null);
    setUserAnswers({});
  };

  const handleGoNextModule = () => {
    setQuizResult(null);
    setUserAnswers({});
    setActiveModuleIdx(prev => prev + 1);
    setActiveStep(1);
  };

  const resetQuizForm = () => {
    setQuizForm({ question: '', options: ['', ''], correctAnswer: 0 });
    setEditingQuizIdx(null);
    setAddingQuiz(false);
  };

  const handleAddQuizQuestion = async () => {
    if (!quizForm.question.trim()) return toast.warning('Enter a question.');
    if (quizForm.options.some(o => !o.trim())) return toast.warning('Fill all options.');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/trainings/${training._id}/module/${activeModuleIdx}/quiz`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(quizForm)
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...training };
        updated.modules[activeModuleIdx].quiz = data.data;
        setTraining(updated);
        resetQuizForm();
        toast.success('Question added!');
      } else toast.error(data.message);
    } catch { toast.error('Error adding question'); }
  };

  const handleUpdateQuizQuestion = async () => {
    if (!quizForm.question.trim()) return toast.warning('Enter a question.');
    if (quizForm.options.some(o => !o.trim())) return toast.warning('Fill all options.');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/trainings/${training._id}/module/${activeModuleIdx}/quiz/${editingQuizIdx}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(quizForm)
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...training };
        updated.modules[activeModuleIdx].quiz = data.data;
        setTraining(updated);
        resetQuizForm();
        toast.success('Question updated!');
      } else toast.error(data.message);
    } catch { toast.error('Error updating question'); }
  };

  const handleDeleteQuizQuestion = async (qIdx) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/trainings/${training._id}/module/${activeModuleIdx}/quiz/${qIdx}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...training };
        updated.modules[activeModuleIdx].quiz = data.data;
        setTraining(updated);
        toast.success('Question deleted.');
      } else toast.error(data.message);
    } catch { toast.error('Error deleting question'); }
  };

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      {/* Certificate Modal */}
      {showCertificate && progress?.isCompleted && (
        <CertificateView
          training={training}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <button 
          onClick={onBack} 
          className="text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2 rounded-md transition-colors border border-slate-200 cursor-pointer"
          title="Back to Courses"
        >
          <ArrowLeft size={18}/>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              Training Course
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Pass: {training.passingScore || 80}%</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight truncate mt-0.5">{training.name}</h2>
        </div>
        {progress?.isCompleted && (
          <button 
            onClick={() => setShowCertificate(true)} 
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-bold text-xs transition-colors shadow-2xs cursor-pointer"
          >
            <Award size={16}/> View Certificate
          </button>
        )}
      </div>

      {/* Completion banner */}
      {progress?.isCompleted && (
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg p-4 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center shrink-0">
              <Trophy size={24} />
            </div>
            <div>
              <p className="font-bold text-sm">🎓 Training Completed Successfully!</p>
              <p className="text-emerald-100 text-xs mt-0.5">
                Issued on {progress.certificateIssuedAt ? new Date(progress.certificateIssuedAt).toLocaleDateString() : 'N/A'} • Certificate ID: {progress.certificateId || 'Ready'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowCertificate(true)} 
            className="bg-white text-emerald-800 font-bold px-3.5 py-1.5 rounded-md text-xs hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            View Certificate
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar: Modules List */}
        <div className="w-full lg:w-72 shrink-0 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden h-fit flex flex-col">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/75 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={15} className="text-orange-500"/> Curriculum ({training.modules?.length || 0})
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              {progress?.completedModules?.length || 0}/{training.modules?.length || 0} Done
            </span>
          </div>

          <div className="flex flex-col p-1.5 gap-1">
            {(!training.modules || training.modules.length === 0) ? (
              <div className="p-5 text-xs text-slate-400 text-center">No modules configured in this course.</div>
            ) : (
              training.modules.map((mod, idx) => {
                const isSelected = activeModuleIdx === idx;
                const isDone = isModuleCompleted(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => { setActiveModuleIdx(idx); setActiveStep(1); setQuizResult(null); setUserAnswers({}); }}
                    className={`p-3 text-left rounded-md transition-all flex items-center justify-between text-xs cursor-pointer ${
                      isSelected 
                        ? 'bg-orange-50 border border-orange-300 text-orange-950 font-bold shadow-2xs' 
                        : 'hover:bg-slate-50 text-slate-700 font-medium border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isSelected ? 'bg-orange-500 text-white' : isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="truncate">{mod.moduleName}</span>
                    </div>
                    {isDone && <CheckCircle2 size={15} className="text-emerald-600 shrink-0 ml-1.5"/>}
                  </button>
                );
              })
            )}
          </div>

          {/* Progress summary bar */}
          {training.modules?.length > 0 && (
            <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 mt-auto">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                <span>Course Completion</span>
                <span className="font-bold text-slate-700">
                  {Math.round(((progress?.completedModules?.length || 0) / training.modules.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.round(((progress?.completedModules?.length || 0) / training.modules.length) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Content Workspace */}
        <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-2xs p-5 sm:p-6 min-w-0">
          {activeModule ? (
            <div className="flex flex-col gap-5">
              {/* Module Title Header */}
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Module {activeModuleIdx + 1} of {training.modules?.length || 1}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{activeModule.moduleName}</h3>
                </div>
                {isModuleCompleted(activeModuleIdx) ? (
                  <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Completed
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-xs font-bold">
                    In Progress
                  </span>
                )}
              </div>
              
              {/* Step Navigation Tabs */}
              <div className="flex gap-1 border-b border-slate-200 bg-slate-50/75 p-1 rounded-md">
                {[
                  { id: 1, label: 'Step 1: Video', icon: <Video size={15}/> },
                  { id: 2, label: 'Step 2: Notes & Q&A', icon: <FileText size={15}/> },
                  { id: 3, label: 'Step 3: Assessment Quiz', icon: <Target size={15}/> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveStep(tab.id); setQuizResult(null); setUserAnswers({}); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      activeStep === tab.id
                        ? 'bg-white text-orange-600 shadow-2xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {tab.icon} {tab.label}
                    {tab.id === 3 && isModuleCompleted(activeModuleIdx) && (
                      <CheckCircle2 size={13} className="text-emerald-600 ml-0.5"/>
                    )}
                  </button>
                ))}
              </div>

              {/* Step 1: Video Content */}
              {activeStep === 1 && (
                <div className="flex flex-col gap-5">
                  {activeModule.videoUrl ? (
                    <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-black shadow-xs">
                      {activeModule.videoUrl.startsWith('http') || activeModule.videoUrl.startsWith('//') ? (
                        <iframe 
                          src={activeModule.videoUrl} 
                          className="w-full h-full" 
                          allowFullScreen
                          title="Module Video"
                        />
                      ) : (
                        <video 
                          src={getImageUrl(activeModule.videoUrl)} 
                          className="w-full h-full object-contain" 
                          controls
                        />
                      )}
                    </div>
                  ) : (
                    <div className="p-10 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500">
                      <Video size={36} className="mx-auto text-slate-300 mb-2"/>
                      <p className="text-xs font-semibold">No video attached to this module.</p>
                    </div>
                  )}

                  {activeModule.videoDescription && (
                    <div className="bg-slate-50/80 rounded-lg border border-slate-200 p-4">
                      <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-1.5">Description & Guidelines</h4>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{activeModule.videoDescription}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Notes & Q&A Content */}
              {activeStep === 2 && (
                <div className="flex flex-col gap-3.5">
                  {(!activeModule.qna || activeModule.qna.length === 0) ? (
                    <div className="p-10 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500">
                      <FileText size={36} className="mx-auto text-slate-300 mb-2"/>
                      <p className="text-xs font-semibold">No notes or Q&A provided for this module.</p>
                    </div>
                  ) : (
                    activeModule.qna.map((item, idx) => (
                      <div key={idx} className="bg-blue-50/40 border border-blue-100 rounded-lg p-4 flex flex-col gap-1.5">
                        <p className="font-bold text-xs text-blue-950 flex items-start gap-1.5">
                          <span className="text-blue-600 font-extrabold">Q:</span> {item.question}
                        </p>
                        <p className="text-xs text-slate-700 pl-4 border-l border-blue-200 mt-1 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Step 3: Quiz Assessment */}
              {activeStep === 3 && (
                <div className="flex flex-col gap-5">
                  {/* BA Role: Interactive quiz test */}
                  {isBA && (
                    <>
                      {(!activeModule.quiz || activeModule.quiz.length === 0) ? (
                        <div className="p-10 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500">
                          <Target size={36} className="mx-auto text-slate-300 mb-2"/>
                          <p className="text-xs font-semibold">No quiz configured for this module.</p>
                        </div>
                      ) : quizResult ? (
                        <QuizResult
                          result={quizResult}
                          onRetry={handleRetryQuiz}
                          onNext={handleGoNextModule}
                          isLastModule={activeModuleIdx === (training.modules?.length || 1) - 1}
                        />
                      ) : (
                        <div className="flex flex-col gap-5">
                          {isModuleCompleted(activeModuleIdx) && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
                              <CheckCircle2 size={17} className="text-emerald-600 shrink-0"/>
                              <span>You have successfully completed this module with score {progress?.quizScores?.[activeModuleIdx]}%!</span>
                            </div>
                          )}

                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-900 font-medium flex items-center justify-between">
                            <span>📝 {activeModule.quiz.length} Multiple Choice Questions</span>
                            <span className="font-bold">Required to Pass: {training.passingScore || 80}%</span>
                          </div>

                          <div className="flex flex-col gap-4">
                            {activeModule.quiz.map((q, qIdx) => (
                              <div key={qIdx} className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col gap-3 shadow-2xs">
                                <p className="font-bold text-xs text-slate-900">
                                  {qIdx + 1}. {q.question}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {q.options.map((opt, oIdx) => {
                                    const isSelected = userAnswers[qIdx] === oIdx;
                                    return (
                                      <button
                                        key={oIdx}
                                        type="button"
                                        onClick={() => handleSelectAnswer(qIdx, oIdx)}
                                        className={`p-3 rounded-md text-xs text-left border transition-all flex items-center gap-2.5 cursor-pointer ${
                                          isSelected
                                            ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold shadow-2xs'
                                            : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                                        }`}
                                      >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                          isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-300 bg-white'
                                        }`}>
                                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"/>}
                                        </div>
                                        <span>{opt}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              onClick={handleSubmitQuiz}
                              disabled={submitting}
                              className="bg-[#ff5a1f] hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-md text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                            >
                              {submitting ? 'Evaluating Quiz...' : 'Submit Quiz Answers'}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Admin / Client Role: Inline Question Inspector & Manager */}
                  {canManageQuiz && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Quiz Questions Management</h4>
                          <p className="text-[11px] text-slate-500">View, add, update, or remove assessment questions for this module.</p>
                        </div>
                        {!addingQuiz && editingQuizIdx === null && (
                          <button
                            onClick={() => { setAddingQuiz(true); setEditingQuizIdx(null); resetQuizForm(); }}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Plus size={14}/> Add Question
                          </button>
                        )}
                      </div>

                      {/* Add/Edit Question Form Drawer */}
                      {(addingQuiz || editingQuizIdx !== null) && (
                        <div className="border border-orange-200 bg-orange-50/30 rounded-lg p-4 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-xs text-slate-900">
                              {editingQuizIdx !== null ? `Edit Question ${editingQuizIdx + 1}` : 'New Assessment Question'}
                            </h5>
                            <button onClick={resetQuizForm} className="text-slate-400 hover:text-slate-600"><X size={15}/></button>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Question Title</label>
                            <input
                              type="text"
                              value={quizForm.question}
                              onChange={e => setQuizForm(f => ({ ...f, question: e.target.value }))}
                              placeholder="e.g. What is the main objective of this verification?"
                              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-orange-500 font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Options (Select radio for correct answer):
                            </label>
                            <div className="flex flex-col gap-2">
                              {quizForm.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="qf-correct"
                                    checked={quizForm.correctAnswer === oIdx}
                                    onChange={() => setQuizForm(f => ({ ...f, correctAnswer: oIdx }))}
                                    className="accent-green-600 w-4 h-4 cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={e => {
                                      const opts = [...quizForm.options];
                                      opts[oIdx] = e.target.value;
                                      setQuizForm(f => ({ ...f, options: opts }));
                                    }}
                                    className={`flex-1 border rounded-md px-2.5 py-1.5 text-xs focus:outline-none ${
                                      quizForm.correctAnswer === oIdx ? 'border-green-400 bg-green-50/50' : 'border-slate-300 bg-white'
                                    }`}
                                    placeholder={`Option ${oIdx + 1}`}
                                  />
                                  {quizForm.options.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const opts = quizForm.options.filter((_, i) => i !== oIdx);
                                        setQuizForm(f => ({ ...f, options: opts, correctAnswer: Math.min(f.correctAnswer, opts.length - 1) }));
                                      }}
                                      className="text-slate-400 hover:text-rose-500 p-1"
                                    >
                                      <X size={14}/>
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => setQuizForm(f => ({ ...f, options: [...f.options, ''] }))}
                                className="text-[11px] text-blue-600 hover:underline self-start font-semibold cursor-pointer"
                              >
                                + Add Another Option
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2 border-t border-orange-200/50">
                            <button
                              type="button"
                              onClick={resetQuizForm}
                              className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={editingQuizIdx !== null ? handleUpdateQuizQuestion : handleAddQuizQuestion}
                              className="px-4 py-1.5 text-xs bg-[#ff5a1f] hover:bg-orange-600 text-white rounded-md font-bold shadow-2xs cursor-pointer"
                            >
                              {editingQuizIdx !== null ? 'Update Question' : 'Save Question'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Question List Cards */}
                      {(!activeModule.quiz || activeModule.quiz.length === 0) ? (
                        <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs">
                          No quiz questions added yet. Click &quot;Add Question&quot; above to create one.
                        </div>
                      ) : (
                        activeModule.quiz.map((q, qIdx) => (
                          <div key={qIdx} className="border border-slate-200 rounded-lg p-4 flex flex-col gap-2.5 bg-white shadow-2xs">
                            <div className="flex items-start justify-between gap-3">
                              <p className="font-bold text-xs text-slate-900">
                                {qIdx + 1}. {q.question}
                              </p>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingQuizIdx(qIdx);
                                    setAddingQuiz(false);
                                    setQuizForm({ question: q.question, options: [...q.options], correctAnswer: q.correctAnswer });
                                  }}
                                  className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                                  title="Edit"
                                >
                                  <Edit2 size={13}/>
                                </button>
                                <button
                                  onClick={() => handleDeleteQuizQuestion(qIdx)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50"
                                  title="Delete"
                                >
                                  <Trash2 size={13}/>
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options.map((opt, oIdx) => (
                                <div 
                                  key={oIdx} 
                                  className={`p-2 rounded text-xs flex items-center gap-2 ${
                                    oIdx === q.correctAnswer 
                                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold' 
                                      : 'bg-slate-50 border border-slate-200 text-slate-600'
                                  }`}
                                >
                                  {oIdx === q.correctAnswer && <CheckCircle2 size={13} className="text-emerald-600 shrink-0"/>}
                                  <span className="truncate">{opt}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">Please select a module from the left curriculum panel.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Create/Edit Training View ──────────────────────────────────────────────
const CreateTrainingView = ({ onClose, onSave, initialData }) => {
  const isEdit = !initialData;

  const [form, setForm] = useState(initialData || {
    name: '',
    description: '',
    passingScore: 80,
    isCertificateEnabled: true,
    modules: []
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoFiles, setVideoFiles] = useState({});
  const [certificateTemplateFile, setCertificateTemplateFile] = useState(null);
  const [certificateTemplatePreview, setCertificateTemplatePreview] = useState(null);
  const [expandedModule, setExpandedModule] = useState(0);

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return toast.warning('Please enter a prompt for AI.');
    setIsGeneratingAi(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/trainings/ai-generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, ...data.data }));
        toast.success('Training generated by AI!');
        setShowAiModal(false);
        setAiPrompt('');
      } else {
        toast.error(data.message || 'Failed to generate training');
      }
    } catch (error) {
      toast.error('Error generating AI training');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const updateForm = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const addModule = () => {
    setForm(f => ({
      ...f, 
      modules: [...f.modules, {
        moduleName: `Module ${f.modules.length + 1}`,
        videoUrl: '',
        videoDescription: '',
        qna: [],
        quiz: []
      }]
    }));
    setExpandedModule(form.modules.length);
  };

  const updateModule = (mIdx, field, value) => {
    const newModules = [...form.modules];
    newModules[mIdx][field] = value;
    setForm(f => ({ ...f, modules: newModules }));
  };

  const removeModule = (mIdx) => {
    const newModules = [...form.modules];
    newModules.splice(mIdx, 1);
    setForm(f => ({ ...f, modules: newModules }));
  };

  const addQna = (mIdx) => {
    const newModules = [...form.modules];
    newModules[mIdx].qna.push({ question: '', answer: '' });
    setForm(f => ({ ...f, modules: newModules }));
  };

  const updateQna = (mIdx, qIdx, field, value) => {
    const newModules = [...form.modules];
    newModules[mIdx].qna[qIdx][field] = value;
    setForm(f => ({ ...f, modules: newModules }));
  };

  const removeQna = (mIdx, qIdx) => {
    const newModules = [...form.modules];
    newModules[mIdx].qna.splice(qIdx, 1);
    setForm(f => ({ ...f, modules: newModules }));
  };

  const addQuiz = (mIdx) => {
    const newModules = [...form.modules];
    newModules[mIdx].quiz.push({ question: '', options: ['', ''], correctAnswer: 0 });
    setForm(f => ({ ...f, modules: newModules }));
  };

  const updateQuizQuestion = (mIdx, qIdx, value) => {
    const newModules = [...form.modules];
    newModules[mIdx].quiz[qIdx].question = value;
    setForm(f => ({ ...f, modules: newModules }));
  };

  const addQuizOption = (mIdx, qIdx) => {
    const newModules = [...form.modules];
    newModules[mIdx].quiz[qIdx].options.push('');
    setForm(f => ({ ...f, modules: newModules }));
  };

  const updateQuizOption = (mIdx, qIdx, oIdx, value) => {
    const newModules = [...form.modules];
    newModules[mIdx].quiz[qIdx].options[oIdx] = value;
    setForm(f => ({ ...f, modules: newModules }));
  };

  const removeQuizOption = (mIdx, qIdx, oIdx) => {
    const newModules = [...form.modules];
    if (newModules[mIdx].quiz[qIdx].options.length <= 2) {
      toast.warning('A quiz question must have at least 2 options.');
      return;
    }
    newModules[mIdx].quiz[qIdx].options.splice(oIdx, 1);
    if (newModules[mIdx].quiz[qIdx].correctAnswer >= newModules[mIdx].quiz[qIdx].options.length) {
      newModules[mIdx].quiz[qIdx].correctAnswer = 0;
    }
    setForm(f => ({ ...f, modules: newModules }));
  };

  const setCorrectAnswer = (mIdx, qIdx, oIdx) => {
    const newModules = [...form.modules];
    newModules[mIdx].quiz[qIdx].correctAnswer = oIdx;
    setForm(f => ({ ...f, modules: newModules }));
  };

  const removeQuiz = (mIdx, qIdx) => {
    const newModules = [...form.modules];
    newModules[mIdx].quiz.splice(qIdx, 1);
    setForm(f => ({ ...f, modules: newModules }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Training Name is required!');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('passingScore', form.passingScore || 80);
    formData.append('isCertificateEnabled', form.isCertificateEnabled ? 'true' : 'false');
    formData.append('modules', JSON.stringify(form.modules));

    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (certificateTemplateFile) {
      formData.append('certificateTemplate', certificateTemplateFile);
    }
    Object.keys(videoFiles).forEach(mIdx => {
      formData.append(`module_${mIdx}_video`, videoFiles[mIdx]);
    });

    onSave(formData, isEdit ? form._id : null);
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full pb-10">
      {/* AI Generate Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col">
            <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><Sparkles size={18}/> Generate Training via AI</h3>
              <button onClick={() => setShowAiModal(false)} className="text-indigo-200 hover:text-white transition-colors cursor-pointer"><X size={18}/></button>
            </div>
            <div className="p-5 flex flex-col gap-4 bg-slate-50">
              <p className="text-xs text-slate-600">
                Describe the training you want to create. AI will automatically structure the modules, write descriptions, generate Q&A, and create assessment quizzes with options and correct answers.
              </p>
              <textarea 
                rows={4}
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="e.g. Create a 3-module training for field agents on how to pitch QR codes to retail shops, handle objections, and activate the QR scanner app."
                className="w-full border border-slate-300 rounded-md p-3 text-xs focus:outline-none focus:border-indigo-500 resize-none shadow-inner bg-white"
              />
              <button 
                onClick={handleGenerateAI}
                disabled={isGeneratingAi}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-md text-sm transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGeneratingAi ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Generating...</>
                ) : (
                  <><Sparkles size={16}/> Generate Now</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-2xs border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose} 
              className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-md transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft size={17}/>
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {isEdit ? 'Edit Training Course' : 'Create New Training Course'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Configure course curriculum, video lessons, Q&A notes, and assessment quizzes</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button 
              type="button" 
              onClick={() => setShowAiModal(true)}
              className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-md text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={14}/> Autofill with AI
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 bg-white rounded-md text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#ff5a1f] hover:bg-orange-600 rounded-md text-xs font-bold text-white transition-colors shadow-2xs cursor-pointer"
            >
              <Save size={15}/> Save Course
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 flex flex-col gap-6 bg-slate-50/40">
          {/* Section 1: Basic Information */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              1. Basic Course Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Training Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => updateForm('name', e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-xs focus:outline-none focus:border-orange-500 font-semibold text-slate-900"
                  placeholder="e.g. In-Store Sales & QR Activation Protocol" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea 
                  value={form.description} 
                  onChange={e => updateForm('description', e.target.value)} 
                  rows={3}
                  className="w-full border border-slate-300 rounded-md px-3.5 py-2 text-xs focus:outline-none focus:border-orange-500 text-slate-700 resize-none"
                  placeholder="Provide a comprehensive summary of what field agents will master..." 
                />
              </div>

              {/* Thumbnail Image Picker with Preview */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Training Thumbnail Image
                </label>
                <div className="flex items-center gap-3">
                  {(imagePreview || form.image) ? (
                    <div className="w-20 h-20 rounded-md border border-slate-200 overflow-hidden bg-slate-50 shrink-0 relative">
                      <img 
                        src={imagePreview || getImageUrl(form.image)} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-md border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon size={22} />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-md text-xs font-bold text-slate-700 cursor-pointer shadow-2xs">
                      <ImageIcon size={14}/> {imageFile || form.image ? 'Change Thumbnail' : 'Upload Thumbnail'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImageFile(file);
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden" 
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">Recommended: 16:9 ratio, JPG or PNG format.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passing Score & Certificate Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">🎯 Passing Score Threshold</label>
                  <span className="text-xs font-extrabold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                    {form.passingScore || 80}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10" 
                  max="100" 
                  step="5"
                  value={form.passingScore || 80}
                  onChange={e => updateForm('passingScore', parseInt(e.target.value, 10))}
                  className="w-full accent-orange-500 h-1.5 cursor-pointer mt-2"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">Associates must score at least {form.passingScore || 80}% on every module quiz to pass.</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800">🏆 Certificate Issuance</label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {form.isCertificateEnabled ? 'Auto-generate PDF certificate upon full completion' : 'No certificate for this training'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateForm('isCertificateEnabled', !form.isCertificateEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${form.isCertificateEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-xs absolute top-1 transition-transform ${form.isCertificateEnabled ? 'left-6' : 'left-1'}`}/>
                  </button>
                </div>
              </div>
            </div>

            {/* Certificate Template Upload */}
            {form.isCertificateEnabled && (
              <div className="border border-amber-200 bg-amber-50/50 rounded-md p-4 flex flex-col sm:flex-row items-start gap-4">
                <div className="flex-1">
                  <span className="text-xs font-bold text-amber-900 block mb-1">🖼️ Custom Certificate Background Template</span>
                  <p className="text-[11px] text-amber-700 leading-relaxed mb-2.5">
                    Upload a certificate image template (PNG/JPG). Student name, date, and Certificate ID will be positioned in the center.
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-50 rounded-md text-xs font-bold text-amber-900 cursor-pointer shadow-2xs">
                    Choose Template File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCertificateTemplateFile(file);
                          setCertificateTemplatePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {(certificateTemplatePreview || form.certificateTemplate) && (
                  <div className="w-28 h-18 rounded-md border border-amber-300 overflow-hidden bg-white shrink-0 shadow-xs">
                    <img 
                      src={certificateTemplatePreview || getImageUrl(form.certificateTemplate)} 
                      alt="Certificate Template" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Modular Curriculum Builder */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                2. Course Modules ({form.modules.length})
              </h3>
              <button 
                type="button" 
                onClick={addModule}
                className="flex items-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus size={14}/> Add New Module
              </button>
            </div>

            {form.modules.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300 text-slate-500">
                <Layers size={36} className="mx-auto text-slate-300 mb-2"/>
                <p className="text-xs font-bold text-slate-700">No modules added yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click &quot;Add New Module&quot; above to add video lessons, notes, and quiz questions.</p>
              </div>
            ) : (
              form.modules.map((mod, mIdx) => {
                const isExpanded = expandedModule === mIdx;
                return (
                  <div key={mIdx} className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden transition-all">
                    {/* Module Accordion Header */}
                    <div 
                      className="bg-slate-50/80 px-4 py-3 flex items-center justify-between cursor-pointer border-b border-slate-200 hover:bg-slate-100/70 transition-colors"
                      onClick={() => setExpandedModule(isExpanded ? null : mIdx)}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">
                          {mIdx + 1}
                        </span>
                        <span className="font-bold text-xs text-slate-800">{mod.moduleName || `Module ${mIdx + 1}`}</span>
                        <span className="text-[11px] text-slate-400">({mod.quiz?.length || 0} Quiz Qs • {mod.qna?.length || 0} Q&A)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeModule(mIdx); }} 
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                          title="Delete Module"
                        >
                          <Trash2 size={15}/>
                        </button>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-500"/> : <ChevronDown size={16} className="text-slate-500"/>}
                      </div>
                    </div>

                    {/* Module Accordion Body */}
                    {isExpanded && (
                      <div className="p-5 flex flex-col gap-5 bg-white">
                        {/* Module Name */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Module Title</label>
                          <input 
                            type="text" 
                            value={mod.moduleName} 
                            onChange={e => updateModule(mIdx, 'moduleName', e.target.value)}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                            placeholder="e.g. Introduction to Ground Operations" 
                          />
                        </div>

                        {/* Step 1: Video & Description */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center gap-1.5">
                            <Video size={14} className="text-blue-600"/> Step 1: Video Lesson & Instructions
                          </div>
                          <div className="p-3.5 flex flex-col gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Video Lesson Source</label>
                              <div className="flex items-center gap-4 mb-2">
                                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    checked={mod.videoType !== 'upload'} 
                                    onChange={() => updateModule(mIdx, 'videoType', 'link')} 
                                    className="accent-blue-600" 
                                  />
                                  YouTube / Embed Link
                                </label>
                                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    checked={mod.videoType === 'upload'} 
                                    onChange={() => updateModule(mIdx, 'videoType', 'upload')} 
                                    className="accent-blue-600" 
                                  />
                                  Upload Video File (MP4/WebM)
                                </label>
                              </div>
                              
                              {mod.videoType === 'upload' ? (
                                <input 
                                  type="file" 
                                  accept="video/*" 
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setVideoFiles(prev => ({ ...prev, [mIdx]: file }));
                                      updateModule(mIdx, 'videoUrl', '');
                                    }
                                  }}
                                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                                />
                              ) : (
                                <input 
                                  type="text" 
                                  value={mod.videoUrl} 
                                  onChange={e => updateModule(mIdx, 'videoUrl', e.target.value)}
                                  className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                                  placeholder="e.g. https://www.youtube.com/embed/..." 
                                />
                              )}
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Video Overview / Instructions</label>
                              <textarea 
                                value={mod.videoDescription} 
                                onChange={e => updateModule(mIdx, 'videoDescription', e.target.value)} 
                                rows={2}
                                className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 resize-none text-slate-700"
                                placeholder="Key points associates need to focus on in this video..." 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Step 2: Notes & Q&A */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
                            <span className="flex items-center gap-1.5"><FileText size={14} className="text-purple-600"/> Step 2: Study Notes (Q&A)</span>
                            <button 
                              type="button" 
                              onClick={() => addQna(mIdx)} 
                              className="text-xs text-purple-600 font-bold hover:underline cursor-pointer"
                            >
                              + Add Q&A Item
                            </button>
                          </div>
                          <div className="p-3.5 flex flex-col gap-2.5">
                            {mod.qna.length === 0 ? (
                              <p className="text-xs text-slate-400 italic text-center py-2">No notes added. Click &quot;+ Add Q&A Item&quot; to include study material.</p>
                            ) : (
                              mod.qna.map((item, qIdx) => (
                                <div key={qIdx} className="bg-slate-50/70 p-3 rounded-md border border-slate-200 flex gap-2 relative">
                                  <div className="flex-1 flex flex-col gap-2">
                                    <input 
                                      type="text" 
                                      value={item.question} 
                                      onChange={e => updateQna(mIdx, qIdx, 'question', e.target.value)}
                                      className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500 font-semibold bg-white"
                                      placeholder="Question or Topic Heading..." 
                                    />
                                    <textarea 
                                      value={item.answer} 
                                      onChange={e => updateQna(mIdx, qIdx, 'answer', e.target.value)} 
                                      rows={2}
                                      className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500 bg-white resize-none"
                                      placeholder="Detailed explanation or answer note..." 
                                    />
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => removeQna(mIdx, qIdx)} 
                                    className="text-slate-400 hover:text-rose-600 p-1 self-start cursor-pointer"
                                  >
                                    <X size={15}/>
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Step 3: Quiz Assessment Builder */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
                            <span className="flex items-center gap-1.5"><Target size={14} className="text-emerald-600"/> Step 3: Assessment Quiz Builder</span>
                            <button 
                              type="button" 
                              onClick={() => addQuiz(mIdx)} 
                              className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                            >
                              + Add Question
                            </button>
                          </div>
                          <div className="p-3.5 flex flex-col gap-4">
                            {mod.quiz.length === 0 ? (
                              <p className="text-xs text-slate-400 italic text-center py-2">No quiz questions added yet.</p>
                            ) : (
                              mod.quiz.map((q, qIdx) => (
                                <div key={qIdx} className="border border-slate-200 p-3.5 rounded-md relative bg-slate-50/40 flex flex-col gap-2.5">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                      Question {qIdx + 1}
                                    </label>
                                    <button 
                                      type="button" 
                                      onClick={() => removeQuiz(mIdx, qIdx)} 
                                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                    >
                                      <X size={15}/>
                                    </button>
                                  </div>
                                  <input 
                                    type="text" 
                                    value={q.question} 
                                    onChange={e => updateQuizQuestion(mIdx, qIdx, e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                                    placeholder="Enter question statement..." 
                                  />
                                  
                                  <label className="text-[11px] font-bold text-slate-600 mt-1">
                                    Options (Select the radio of the correct answer):
                                  </label>
                                  <div className="flex flex-col gap-1.5">
                                    {q.options.map((opt, oIdx) => (
                                      <div key={oIdx} className="flex items-center gap-2">
                                        <input 
                                          type="radio" 
                                          name={`quiz-${mIdx}-${qIdx}`} 
                                          checked={q.correctAnswer === oIdx} 
                                          onChange={() => setCorrectAnswer(mIdx, qIdx, oIdx)}
                                          className="accent-emerald-600 w-4 h-4 cursor-pointer" 
                                        />
                                        <input 
                                          type="text" 
                                          value={opt} 
                                          onChange={e => updateQuizOption(mIdx, qIdx, oIdx, e.target.value)}
                                          className={`flex-1 border rounded-md px-2.5 py-1 text-xs focus:outline-none ${
                                            q.correctAnswer === oIdx ? 'border-emerald-400 bg-emerald-50/40 font-semibold' : 'border-slate-300 bg-white'
                                          }`}
                                          placeholder={`Option ${oIdx + 1}`} 
                                        />
                                        <button 
                                          type="button" 
                                          onClick={() => removeQuizOption(mIdx, qIdx, oIdx)} 
                                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                                        >
                                          <X size={13}/>
                                        </button>
                                      </div>
                                    ))}
                                    <button 
                                      type="button" 
                                      onClick={() => addQuizOption(mIdx, qIdx)} 
                                      className="text-[11px] text-blue-600 font-semibold self-start mt-0.5 hover:underline cursor-pointer"
                                    >
                                      + Add Option
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Trainings Component ────────────────────────────────────────────────
const Trainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'certified', 'multimodule'
  const [loading, setLoading] = useState(true);
  
  // Modals / View state
  const [showFormView, setShowFormView] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [viewingTraining, setViewingTraining] = useState(null);

  const fetchTrainings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/trainings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTrainings(data.data);
      }
    } catch {
      toast.error('Failed to load trainings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this training module?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/trainings/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setTrainings(prev => prev.filter(t => t._id !== id));
          toast.success('Training deleted successfully.');
        } else {
          toast.error(data.message);
        }
      } catch {
        toast.error('Error deleting training');
      }
    }
  };

  const handleSave = async (formData, id) => {
    try {
      const token = localStorage.getItem('token');
      const url = id ? `${API_BASE_URL}/trainings/${id}` : `${API_BASE_URL}/trainings`;
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(`Training ${id ? 'updated' : 'created'} successfully!`);
        fetchTrainings();
        setShowFormView(false);
        setEditingTraining(null);
      } else {
        toast.error(data.message || 'Error saving training');
      }
    } catch {
      toast.error('Network error while saving');
    }
  };

  // Metrics calculation
  const totalCourses = trainings.length;
  const totalModules = trainings.reduce((acc, t) => acc + (t.modules?.length || 0), 0);
  const avgPassingScore = totalCourses 
    ? Math.round(trainings.reduce((acc, t) => acc + (t.passingScore || 80), 0) / totalCourses) 
    : 80;
  const certifiedCoursesCount = trainings.filter(t => t.isCertificateEnabled !== false).length;

  // Filtered list
  const filtered = trainings.filter(t => {
    const matchesSearch = t.name?.toLowerCase().includes(search.toLowerCase()) || 
                          t.description?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'certified') return t.isCertificateEnabled !== false;
    if (filterType === 'multimodule') return (t.modules?.length || 0) > 1;
    return true;
  });

  // ─── RENDER FORM VIEW ────────────────────────────────────────────────────────
  if (showFormView) {
    return (
      <CreateTrainingView
        onClose={() => { setShowFormView(false); setEditingTraining(null); }}
        onSave={handleSave}
        initialData={editingTraining}
      />
    );
  }

  // ─── RENDER DETAIL PREVIEW ───────────────────────────────────────────────────
  if (viewingTraining) {
    return <TrainingDetail training={viewingTraining} onBack={() => setViewingTraining(null)}/>;
  }

  // ─── RENDER MAIN LIST VIEW ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 w-full pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <GraduationCap size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Training Modules & Certification</h1>
              <p className="text-xs text-slate-500 mt-0.5">Manage course curriculum, video lessons, Q&A notes, and assessment quizzes</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => { setEditingTraining(null); setShowFormView(true); }}
          className="bg-[#ff5a1f] hover:bg-orange-600 text-white px-4 py-2 rounded-md font-bold text-xs flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
        >
          <Plus size={16} /> Add New Training
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Courses</p>
            <p className="text-lg font-black text-slate-900 mt-0.5">{totalCourses}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Modules</p>
            <p className="text-lg font-black text-slate-900 mt-0.5">{totalModules}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Target size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Pass Score</p>
            <p className="text-lg font-black text-slate-900 mt-0.5">{avgPassingScore}%</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Certified Courses</p>
            <p className="text-lg font-black text-slate-900 mt-0.5">{certifiedCoursesCount}</p>
          </div>
        </div>
      </div>

      {/* Toolbar & Filter Pills */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input 
            type="text"
            placeholder="Search trainings by name or topic..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-orange-500 bg-slate-50/50"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Courses' },
            { id: 'certified', label: 'With Certificate' },
            { id: 'multimodule', label: 'Multi-Module' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                filterType === f.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="text-xs text-slate-400 font-medium pl-2 hidden sm:inline">
            ({filtered.length} found)
          </span>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="text-center py-24 text-slate-400 text-xs flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"/>
          <span>Loading course modules...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-slate-200 shadow-2xs">
          <GraduationCap size={44} className="mx-auto text-slate-300 mb-2.5"/>
          <h4 className="text-sm font-bold text-slate-800">No training modules found</h4>
          <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search or create a new training program.</p>
          <button 
            onClick={() => setShowFormView(true)} 
            className="mt-3.5 inline-flex items-center gap-1.5 bg-[#ff5a1f] hover:bg-orange-600 text-white px-4 py-2 rounded-md font-bold text-xs transition-colors shadow-2xs cursor-pointer"
          >
            <Plus size={14} /> Create New Training
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(item => {
            const moduleCount = item.modules?.length || 0;
            const hasCertificate = item.isCertificateEnabled !== false;

            return (
              <div 
                key={item._id} 
                className="bg-white rounded-lg border border-slate-200 hover:border-orange-300 shadow-2xs hover:shadow-xs transition-all overflow-hidden flex flex-col group"
              >
                {/* Course Banner Image */}
                <div className="h-40 bg-slate-100 relative overflow-hidden shrink-0">
                  {item.image ? (
                    <img 
                      src={getImageUrl(item.image)} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200/80">
                      <GraduationCap size={36} className="text-slate-300 mb-1"/>
                      <span className="text-[11px] font-semibold text-slate-400">Course Preview</span>
                    </div>
                  )}

                  {/* Top floating badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="bg-white/95 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded border border-slate-200 shadow-2xs backdrop-blur-xs flex items-center gap-1">
                      <Layers size={11} className="text-orange-500" /> {moduleCount} Module{moduleCount !== 1 ? 's' : ''}
                    </span>

                    {hasCertificate ? (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs flex items-center gap-1">
                        <Award size={11} /> Certificate
                      </span>
                    ) : (
                      <span className="bg-slate-800/80 text-slate-200 text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs">
                        Standard
                      </span>
                    )}
                  </div>
                </div>

                {/* Course Body */}
                <div className="p-4 flex flex-col flex-1 gap-2.5">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {item.description || 'Comprehensive modular training with video instruction, notes, and quiz.'}
                    </p>
                  </div>

                  {/* Info strip */}
                  <div className="flex items-center gap-3 text-xs pt-1 mt-auto">
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center gap-1">
                      <Target size={12} className="text-orange-500" /> Pass: {item.passingScore || 80}%
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 ml-auto flex items-center gap-1">
                      <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-end border-t border-slate-100 pt-3 mt-1">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => { setEditingTraining(item); setShowFormView(true); }} 
                        className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors border border-transparent hover:border-blue-200 cursor-pointer" 
                        title="Edit Course"
                      >
                        <Edit2 size={14}/>
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)} 
                        className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-md transition-colors border border-transparent hover:border-rose-200 cursor-pointer" 
                        title="Delete Course"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Trainings;
