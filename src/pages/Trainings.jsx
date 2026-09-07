import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap, Plus, Search, Edit2, Trash2, X,
  Video, Image as ImageIcon, FileText, Target,
  CheckCircle2, PlayCircle, Save, ArrowLeft, ChevronDown, ChevronUp, Layers,
  Award, Star, Trophy, AlertTriangle, RotateCcw, Lock
} from 'lucide-react';
import { toast } from 'react-toastify';

const API = import.meta.env.VITE_API_BASE_URL;

// ─── Certificate Component ───────────────────────────────────────────────────
const CertificateView = ({ training, progress, userName, onClose }) => {
  const downloadCertificate = () => {
    const token = localStorage.getItem('token');
    window.open(`${API}/trainings/${training._id}/certificate?token=${token}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-8">
        <Award size={64} className="text-orange-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Certificate Ready!</h3>
        <p className="text-gray-600 mb-6">Your certificate of completion has been generated.</p>
        
        <div className="flex flex-col gap-3">
          <button onClick={downloadCertificate} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-colors w-full">
            Download PDF
          </button>
          <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold transition-colors w-full">
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
    <div className={`rounded-2xl border-2 p-8 text-center ${passed ? 'border-green-300 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
        {passed ? <Trophy size={36} className="text-green-500"/> : <AlertTriangle size={36} className="text-red-500"/>}
      </div>
      <h3 className={`text-2xl font-bold mb-2 ${passed ? 'text-green-700' : 'text-red-700'}`}>
        {passed ? '🎉 Excellent! You Passed!' : '❌ Not Quite There Yet'}
      </h3>
      <p className={`text-4xl font-black mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
        {result.scorePercent}%
      </p>
      <p className="text-gray-600 mb-1">
        {result.score} / {result.total} correct answers
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Minimum passing score: {result.passingScore}%
      </p>

      {/* Per-question results */}
      <div className="text-left flex flex-col gap-3 mb-6">
        {result.results.map((r, idx) => (
          <div key={idx} className={`p-3 rounded-xl border ${r.isCorrect ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'}`}>
            <p className="font-medium text-gray-800 text-sm">Q{idx+1}: {r.question}</p>
            <div className="flex gap-4 mt-1 text-xs">
              <span className={`font-bold ${r.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                Your Answer: Option {r.selectedAnswer + 1}
              </span>
              {!r.isCorrect && (
                <span className="font-bold text-green-700">
                  Correct: Option {r.correctAnswer + 1}
                </span>
              )}
              <span className={`font-bold ${r.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {r.isCorrect ? '✓ Correct' : '✗ Wrong'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        {!passed && (
          <button onClick={onRetry} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
            <RotateCcw size={16}/> Retry Quiz
          </button>
        )}
        {passed && !isLastModule && (
          <button onClick={onNext} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
            Next Module <ArrowLeft size={16} className="rotate-180"/>
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

  // Inline Quiz Editor state (for Client role)
  const [editingQuizIdx, setEditingQuizIdx] = useState(null);
  const [addingQuiz, setAddingQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({ question: '', options: ['', ''], correctAnswer: 0 });

  const userRole = localStorage.getItem('userRole');
  const isBA = userRole === 'bd';
  const isClient = userRole === 'client';
  const canManageQuiz = isClient || userRole === 'admin' || userRole === 'superadmin';
  const userName = localStorage.getItem('userName') || 'Student';
  const activeModule = training.modules?.[activeModuleIdx];

  // Fetch progress on load
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/trainings/${training._id}/progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setProgress(data.data);
      } catch (e) { /* silent */ }
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

    // Validate all answered
    const unanswered = quiz.findIndex((_, idx) => userAnswers[idx] === undefined);
    if (unanswered !== -1) {
      toast.warning(`Please answer question ${unanswered + 1} before submitting.`);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const answers = quiz.map((_, idx) => userAnswers[idx]);
      const res = await fetch(`${API}/trainings/${training._id}/module/${activeModuleIdx}/submit`, {
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
        // Update local progress state
        setProgress(prev => ({
          ...prev,
          ...( data.data.passed ? { completedModules: [...(prev?.completedModules || []).filter(x => x !== activeModuleIdx), activeModuleIdx] } : {}),
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
    } catch (e) {
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

  // ── Inline Quiz Management (for Client/Admin/SuperAdmin) ──────────────────
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
      const res = await fetch(`${API}/trainings/${training._id}/module/${activeModuleIdx}/quiz`, {
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
      const res = await fetch(`${API}/trainings/${training._id}/module/${activeModuleIdx}/quiz/${editingQuizIdx}`, {
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
      const res = await fetch(`${API}/trainings/${training._id}/module/${activeModuleIdx}/quiz/${qIdx}`, {
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
    <div className="flex flex-col gap-6">
      {/* Certificate Modal */}
      {showCertificate && progress?.isCompleted && (
        <CertificateView
          training={training}
          progress={progress}
          userName={userName}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-700 transition-colors bg-white p-2 rounded-full shadow-sm border border-gray-200">
          <ArrowLeft size={20}/>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">{training.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{training.description}</p>
        </div>
        {progress?.isCompleted && (
          <button onClick={() => setShowCertificate(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm">
            <Award size={18}/> View Certificate
          </button>
        )}
      </div>

      {/* Completion banner */}
      {progress?.isCompleted && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <Trophy size={36} className="shrink-0"/>
          <div>
            <p className="font-black text-lg">🎓 Training Complete!</p>
            <p className="text-green-100 text-sm">Issued: {new Date(progress.certificateIssuedAt).toLocaleDateString()}</p>
          </div>
          <button onClick={() => setShowCertificate(true)} className="ml-auto bg-white text-green-700 font-bold px-4 py-2 rounded-lg text-sm hover:bg-green-50 transition-colors">
            View Certificate
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar: Modules List */}
        <div className="w-full md:w-64 shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Layers size={18} className="text-orange-500"/> Modules
            </h3>
          </div>
          <div className="flex flex-col">
            {(!training.modules || training.modules.length === 0) ? (
              <div className="p-4 text-sm text-gray-500 text-center">No modules found.</div>
            ) : (
              training.modules.map((mod, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveModuleIdx(idx); setActiveStep(1); setQuizResult(null); setUserAnswers({}); }}
                  className={`p-4 text-left border-b border-gray-100 last:border-0 transition-colors flex items-center justify-between ${
                    activeModuleIdx === idx 
                      ? 'bg-orange-50 border-l-4 border-l-orange-500 text-orange-900 font-bold' 
                      : 'hover:bg-gray-50 text-gray-600 font-medium'
                  }`}
                >
                  <span>{mod.moduleName}</span>
                  {isModuleCompleted(idx) && <CheckCircle2 size={16} className="text-green-500 shrink-0"/>}
                </button>
              ))
            )}
          </div>
          {/* Progress summary */}
          {training.modules?.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-xs font-bold text-gray-500 mb-2">PROGRESS</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all"
                  style={{ width: `${Math.round(((progress?.completedModules?.length || 0) / training.modules.length) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{progress?.completedModules?.length || 0} / {training.modules.length} modules</p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {activeModule ? (
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">{activeModule.moduleName}</h3>
              
              {/* Step Navigation */}
              <div className="flex gap-2 border-b border-gray-200">
                {[
                  { id: 1, label: 'Step 1: Video', icon: <Video size={16}/> },
                  { id: 2, label: 'Step 2: Notes', icon: <FileText size={16}/> },
                  { id: 3, label: 'Step 3: Quiz', icon: <Target size={16}/> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveStep(tab.id); setQuizResult(null); setUserAnswers({}); }}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeStep === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab.icon} {tab.label}
                    {tab.id === 3 && isModuleCompleted(activeModuleIdx) && (
                      <CheckCircle2 size={14} className="text-green-500"/>
                    )}
                  </button>
                ))}
              </div>

              {/* Step 1: Video */}
              {activeStep === 1 && (
                <div className="flex flex-col gap-6">
                  {activeModule.videoUrl ? (
                    <div className="aspect-video w-full">
                      {activeModule.videoUrl.startsWith('http') || activeModule.videoUrl.startsWith('//') ? (
                        <iframe src={activeModule.videoUrl} className="w-full h-full rounded-xl border border-gray-200" allowFullScreen/>
                      ) : (
                        <video src={`${API.replace('/api', '')}/${activeModule.videoUrl.replace(/\\/g, '/')}`} className="w-full h-full rounded-xl border border-gray-200" controls/>
                      )}
                    </div>
                  ) : (
                    <div className="p-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                      No video available for this module.
                    </div>
                  )}
                  {activeModule.videoDescription && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Description</h4>
                      <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">{activeModule.videoDescription}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Notes */}
              {activeStep === 2 && (
                <div className="flex flex-col gap-4">
                  {(!activeModule.qna || activeModule.qna.length === 0) ? (
                    <div className="p-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">No notes/Q&A available.</div>
                  ) : (
                    activeModule.qna.map((item, idx) => (
                      <div key={idx} className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col gap-2">
                        <p className="font-bold text-blue-900 flex items-start gap-2"><span className="text-blue-500">Q:</span> {item.question}</p>
                        <p className="text-blue-800 flex items-start gap-2"><span className="text-blue-500 font-bold">A:</span> {item.answer}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Step 3: Quiz */}
              {activeStep === 3 && (
                <div className="flex flex-col gap-6">
                  
                  {/* ── BA (BD) Role: Quiz Taking Mode ────────────────── */}
                  {isBA && (
                    <>
                      {(!activeModule.quiz || activeModule.quiz.length === 0) ? (
                        <div className="p-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">No quiz for this module.</div>
                      ) : quizResult ? (
                        <QuizResult
                          result={quizResult}
                          onRetry={handleRetryQuiz}
                          onNext={handleGoNextModule}
                          isLastModule={activeModuleIdx === training.modules.length - 1}
                        />
                      ) : (
                        <div className="flex flex-col gap-6">
                          {isModuleCompleted(activeModuleIdx) && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700">
                              <CheckCircle2 size={20} className="text-green-500 shrink-0"/>
                              <span className="font-medium text-sm">You already passed this module! Score: {progress?.quizScores?.[activeModuleIdx]}%</span>
                            </div>
                          )}
                          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700 font-medium">
                            📝 {activeModule.quiz.length} question{activeModule.quiz.length > 1 ? 's' : ''}. You need 80% or more to pass.
                          </div>
                          {activeModule.quiz.map((q, qIdx) => (
                            <div key={qIdx} className="border border-gray-200 rounded-xl p-5">
                              <p className="font-bold text-gray-900 mb-4 text-lg">{qIdx + 1}. {q.question}</p>
                              <div className="flex flex-col gap-2">
                                {q.options.map((opt, oIdx) => (
                                  <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                    userAnswers[qIdx] === oIdx
                                      ? 'border-orange-500 bg-orange-50 text-orange-900'
                                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                  }`}>
                                    <input type="radio" name={`quiz-q-${qIdx}`} checked={userAnswers[qIdx] === oIdx} onChange={() => handleSelectAnswer(qIdx, oIdx)} className="accent-orange-500 w-4 h-4"/>
                                    <span className="font-medium">{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-end">
                            <button onClick={handleSubmitQuiz} disabled={submitting} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm">
                              {submitting ? 'Submitting...' : '✓ Submit Quiz'}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ── Client / Admin / SuperAdmin: Quiz Builder Mode ── */}
                  {canManageQuiz && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-600">Manage Quiz Questions ({activeModule.quiz?.length || 0})</p>
                        <button onClick={() => { resetQuizForm(); setAddingQuiz(true); }} className="flex items-center gap-1 bg-orange-100 text-orange-700 hover:bg-orange-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                          <Plus size={14}/> Add Question
                        </button>
                      </div>

                      {/* Add Question Form */}
                      {(addingQuiz || editingQuizIdx !== null) && (
                        <div className="border-2 border-orange-300 bg-orange-50 rounded-xl p-5 flex flex-col gap-3">
                          <p className="font-bold text-orange-700 text-sm">{editingQuizIdx !== null ? '✏️ Edit Question' : '➕ New Question'}</p>
                          <input type="text" value={quizForm.question} onChange={e => setQuizForm(f => ({...f, question: e.target.value}))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 font-medium"
                            placeholder="Question text..." />
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500">Options (select radio for correct answer)</label>
                            {quizForm.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2">
                                <input type="radio" name="qf-correct" checked={quizForm.correctAnswer === oIdx} onChange={() => setQuizForm(f => ({...f, correctAnswer: oIdx}))} className="accent-green-500 w-4 h-4 cursor-pointer"/>
                                <input type="text" value={opt} onChange={e => { const opts = [...quizForm.options]; opts[oIdx] = e.target.value; setQuizForm(f => ({...f, options: opts})); }}
                                  className={`flex-1 border rounded-lg px-2 py-1.5 text-sm focus:outline-none ${quizForm.correctAnswer === oIdx ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}
                                  placeholder={`Option ${oIdx + 1}`} />
                                {quizForm.options.length > 2 && (
                                  <button onClick={() => { const opts = quizForm.options.filter((_, i) => i !== oIdx); setQuizForm(f => ({...f, options: opts, correctAnswer: Math.min(f.correctAnswer, opts.length - 1)})); }} className="text-gray-400 hover:text-red-500 p-1"><X size={14}/></button>
                                )}
                              </div>
                            ))}
                            <button onClick={() => setQuizForm(f => ({...f, options: [...f.options, '']}))} className="text-xs text-blue-500 hover:underline self-start font-medium">+ Add Option</button>
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <button onClick={resetQuizForm} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-bold">Cancel</button>
                            <button onClick={editingQuizIdx !== null ? handleUpdateQuizQuestion : handleAddQuizQuestion} className="px-4 py-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold">
                              {editingQuizIdx !== null ? 'Update' : 'Save Question'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Existing Questions */}
                      {(!activeModule.quiz || activeModule.quiz.length === 0) ? (
                        <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm">No questions yet. Click "Add Question" to start.</div>
                      ) : (
                        activeModule.quiz.map((q, qIdx) => (
                          <div key={qIdx} className="border border-gray-200 rounded-xl p-5 flex flex-col gap-3 bg-white">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-bold text-gray-900">{qIdx + 1}. {q.question}</p>
                              <div className="flex gap-1 shrink-0">
                                <button onClick={() => { setEditingQuizIdx(qIdx); setAddingQuiz(false); setQuizForm({ question: q.question, options: [...q.options], correctAnswer: q.correctAnswer }); }} className="text-gray-400 hover:text-blue-500 p-1.5 rounded-md hover:bg-blue-50"><Edit2 size={14}/></button>
                                <button onClick={() => handleDeleteQuizQuestion(qIdx)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50"><Trash2 size={14}/></button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className={`p-2.5 rounded-lg text-sm flex items-center gap-2 ${oIdx === q.correctAnswer ? 'bg-green-100 border border-green-300 text-green-800 font-bold' : 'bg-gray-50 border border-gray-200 text-gray-600'}`}>
                                  {oIdx === q.correctAnswer && <CheckCircle2 size={14} className="text-green-500 shrink-0"/>}
                                  {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ── Other roles: read-only info ───────────────────── */}
                  {!isBA && !canManageQuiz && (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-sm">
                      Quiz is only available for BA users.
                    </div>
                  )}

                </div>
              )}


            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">Please select a module.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Create/Edit Training View ──────────────────────────────────────────────
const CreateTrainingView = ({ onClose, onSave, initialData }) => {
  const isEdit = !!initialData;

  const [form, setForm] = useState(initialData || {
    name: '',
    description: '',
    passingScore: 80,
    isCertificateEnabled: true,
    modules: []
  });
  const [imageFile, setImageFile] = useState(null);
  const [videoFiles, setVideoFiles] = useState({});
  const [certificateTemplateFile, setCertificateTemplateFile] = useState(null);
  const [expandedModule, setExpandedModule] = useState(0);

  // --- Training Info Handlers ---
  const updateForm = (key, value) => setForm(f => ({ ...f, [key]: value }));

  // --- Module Handlers ---
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

  // --- Q&A Handlers ---
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

  // --- Quiz Handlers ---
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

  // --- Submit ---
  const handleSubmit = () => {
    if (!form.name) {
      toast.error('Training Name is required!');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('passingScore', form.passingScore || 80);
    formData.append('isCertificateEnabled', form.isCertificateEnabled ? 'true' : 'false');
    
    // We append the JSON string of modules, but we'll process videoFiles on the backend
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
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-full transition-colors mr-2">
              <ArrowLeft size={18}/>
            </button>
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
              {isEdit ? <Edit2 size={20}/> : <GraduationCap size={20}/>}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Training' : 'Create New Training'}</h2>
              <p className="text-xs text-gray-500">Add training info and multiple modules</p>
            </div>
          </div>
          <div className="flex gap-3 self-end sm:self-auto">
            <button type="button" onClick={onClose}
              className="px-5 py-2 border border-gray-300 bg-white rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2 bg-[#ff5a1f] hover:bg-orange-600 rounded-lg text-sm font-bold text-white transition-colors shadow-sm">
              <Save size={18}/> Save Training
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-50/50">
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            
            {/* General Info */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">1. Basic Information</h3>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Training Name *</label>
                <input type="text" value={form.name} onChange={e => updateForm('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. Platform Basics 101" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows={3}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Overview of the training..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                  <ImageIcon size={16} className="text-gray-400"/> Upload Training Thumbnail (Optional)
                </label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>

              {/* Passing Score & Certificate Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    🎯 Passing Score (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="10" max="100" step="5"
                      value={form.passingScore || 80}
                      onChange={e => updateForm('passingScore', parseInt(e.target.value, 10))}
                      className="flex-1 accent-orange-500 h-2"
                    />
                    <span className="text-2xl font-black text-orange-600 w-16 text-center">
                      {form.passingScore || 80}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">BA must score {form.passingScore || 80}% or more to pass each module.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    🏆 Certificate on Completion
                  </label>
                  <div
                    onClick={() => updateForm('isCertificateEnabled', !form.isCertificateEnabled)}
                    className={`relative w-14 h-7 rounded-full cursor-pointer transition-colors duration-300 ${form.isCertificateEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${form.isCertificateEnabled ? 'translate-x-7' : 'translate-x-0'}`}/>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {form.isCertificateEnabled ? '✅ Certificate will be given on completion' : '❌ No certificate for this training'}
                  </p>
                </div>
              </div>

              {/* Certificate Template Upload — only if certificate is enabled */}
              {form.isCertificateEnabled && (
                <div className="border border-dashed border-amber-300 bg-amber-50 rounded-xl p-5">
                  <label className="block text-sm font-bold text-amber-800 mb-1.5 flex items-center gap-2">
                    🖼️ Upload Certificate Template Image
                    <span className="text-xs font-normal text-amber-600">(PNG / JPG — Leave space for student's name)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setCertificateTemplateFile(e.target.files[0])}
                    className="w-full text-sm text-amber-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
                  />
                  {/* Show existing template if editing */}
                  {form.certificateTemplate && !certificateTemplateFile && (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/${form.certificateTemplate.replace(/\\/g, '/')}`}
                        alt="Current Certificate Template"
                        className="w-32 h-20 object-cover rounded-lg border border-amber-200 shadow-sm"
                      />
                      <p className="text-xs text-amber-700">Current template. Upload new to replace.</p>
                    </div>
                  )}
                  {certificateTemplateFile && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"/>
                      <p className="text-xs text-green-700 font-medium">New template selected: {certificateTemplateFile.name}</p>
                    </div>
                  )}
                  <p className="text-xs text-amber-600 mt-2">💡 Tip: Design your certificate in Canva/Photoshop. Leave a blank space where the student name should appear. The name will be shown on top of the image.</p>
                </div>
              )}
            </div>

            {/* Modules Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">2. Modules ({form.modules.length})</h3>
                <button onClick={addModule} type="button"
                  className="flex items-center gap-1 bg-orange-100 text-orange-700 hover:bg-orange-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                  <Plus size={16}/> Add Module
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {form.modules.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                    <Layers size={32} className="mx-auto text-gray-300 mb-2"/>
                    <p className="text-gray-500 font-medium text-sm">No modules added yet.</p>
                  </div>
                ) : (
                  form.modules.map((mod, mIdx) => (
                    <div key={mIdx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all">
                      {/* Module Header (Accordion) */}
                      <div 
                        className="bg-gray-50 px-6 py-4 flex items-center justify-between cursor-pointer border-b border-gray-200"
                        onClick={() => setExpandedModule(expandedModule === mIdx ? null : mIdx)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-sm">
                            {mIdx + 1}
                          </span>
                          <span className="font-bold text-gray-800">{mod.moduleName || `Module ${mIdx + 1}`}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={(e) => { e.stopPropagation(); removeModule(mIdx); }} className="text-gray-400 hover:text-red-500 p-1">
                            <Trash2 size={18}/>
                          </button>
                          {expandedModule === mIdx ? <ChevronUp size={20} className="text-gray-500"/> : <ChevronDown size={20} className="text-gray-500"/>}
                        </div>
                      </div>

                      {/* Module Body */}
                      {expandedModule === mIdx && (
                        <div className="p-6 flex flex-col gap-8 animate-in slide-in-from-top-2 duration-200">
                          
                          {/* Module Name */}
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Module Name</label>
                            <input type="text" value={mod.moduleName} onChange={e => updateModule(mIdx, 'moduleName', e.target.value)}
                              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 font-bold text-gray-900"
                              placeholder="e.g. Introduction" />
                          </div>

                          {/* Step 1: Video */}
                          <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
                              <Video size={16} className="text-blue-500"/> Step 1: Video & Description
                            </div>
                            <div className="p-4 flex flex-col gap-4">
                              <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">Video Source</label>
                                <div className="flex gap-4 mb-3">
                                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input type="radio" checked={mod.videoType !== 'upload'} onChange={() => updateModule(mIdx, 'videoType', 'link')} className="accent-blue-500" />
                                    YouTube / Embed Link
                                  </label>
                                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input type="radio" checked={mod.videoType === 'upload'} onChange={() => updateModule(mIdx, 'videoType', 'upload')} className="accent-blue-500" />
                                    Upload Video File
                                  </label>
                                </div>
                                
                                {mod.videoType === 'upload' ? (
                                  <input type="file" accept="video/*" onChange={e => {
                                    const file = e.target.files[0];
                                    if(file) {
                                      setVideoFiles(prev => ({...prev, [mIdx]: file}));
                                      // Clear URL when uploading file
                                      updateModule(mIdx, 'videoUrl', '');
                                    }
                                  }}
                                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                ) : (
                                  <input type="text" value={mod.videoUrl} onChange={e => updateModule(mIdx, 'videoUrl', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. https://www.youtube.com/embed/..." />
                                )}
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Video Description</label>
                                <textarea value={mod.videoDescription} onChange={e => updateModule(mIdx, 'videoDescription', e.target.value)} rows={2}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                  placeholder="Brief description of this video..." />
                              </div>
                            </div>
                          </div>

                          {/* Step 2: Notes / Q&A */}
                          <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-gray-700 flex items-center justify-between">
                              <span className="flex items-center gap-2"><FileText size={16} className="text-purple-500"/> Step 2: Notes (Q&A)</span>
                              <button onClick={() => addQna(mIdx)} type="button" className="text-xs text-purple-600 font-bold hover:underline">
                                + Add Q&A
                              </button>
                            </div>
                            <div className="p-4 flex flex-col gap-4">
                              {mod.qna.length === 0 ? (
                                <p className="text-xs text-gray-400 italic text-center">No notes added.</p>
                              ) : (
                                mod.qna.map((item, qIdx) => (
                                  <div key={qIdx} className="flex gap-2 relative bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="flex-1 flex flex-col gap-2">
                                      <input type="text" value={item.question} onChange={e => updateQna(mIdx, qIdx, 'question', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-purple-500 font-medium"
                                        placeholder="Question or Heading..." />
                                      <textarea value={item.answer} onChange={e => updateQna(mIdx, qIdx, 'answer', e.target.value)} rows={2}
                                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-purple-500"
                                        placeholder="Answer or Note content..." />
                                    </div>
                                    <button onClick={() => removeQna(mIdx, qIdx)} type="button" className="text-gray-400 hover:text-red-500 self-start">
                                      <X size={16}/>
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Step 3: Quiz */}
                          <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-gray-700 flex items-center justify-between">
                              <span className="flex items-center gap-2"><Target size={16} className="text-green-500"/> Step 3: Quiz Builder</span>
                              <button onClick={() => addQuiz(mIdx)} type="button" className="text-xs text-green-600 font-bold hover:underline">
                                + Add Question
                              </button>
                            </div>
                            <div className="p-4 flex flex-col gap-6">
                              {mod.quiz.length === 0 ? (
                                <p className="text-xs text-gray-400 italic text-center">No quiz questions added.</p>
                              ) : (
                                mod.quiz.map((q, qIdx) => (
                                  <div key={qIdx} className="border border-gray-200 p-4 rounded-xl relative">
                                    <button onClick={() => removeQuiz(mIdx, qIdx)} type="button" className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                      <X size={16}/>
                                    </button>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Question {qIdx + 1}</label>
                                    <input type="text" value={q.question} onChange={e => updateQuizQuestion(mIdx, qIdx, e.target.value)}
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 font-bold mb-3"
                                      placeholder="Question text..." />
                                    
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Options (Select radio for correct answer)</label>
                                    <div className="flex flex-col gap-2">
                                      {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-2">
                                          <input type="radio" name={`quiz-${mIdx}-${qIdx}`} checked={q.correctAnswer === oIdx} onChange={() => setCorrectAnswer(mIdx, qIdx, oIdx)}
                                            className="accent-green-500 w-4 h-4 cursor-pointer" />
                                          <input type="text" value={opt} onChange={e => updateQuizOption(mIdx, qIdx, oIdx, e.target.value)}
                                            className={`flex-1 border rounded-lg px-2 py-1.5 text-sm focus:outline-none ${q.correctAnswer === oIdx ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                                            placeholder={`Option ${oIdx + 1}`} />
                                          <button onClick={() => removeQuizOption(mIdx, qIdx, oIdx)} type="button" className="text-gray-400 hover:text-red-500 p-1">
                                            <X size={14}/>
                                          </button>
                                        </div>
                                      ))}
                                      <button onClick={() => addQuizOption(mIdx, qIdx)} type="button" className="text-xs text-blue-500 font-medium self-start mt-1 hover:underline">
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
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const Trainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const userRole = localStorage.getItem('userRole');
  const isClient = userRole === 'client';
  
  // Modals / View state
  const [showFormView, setShowFormView] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [viewingTraining, setViewingTraining] = useState(null);

  const fetchTrainings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/trainings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTrainings(data.data);
      }
    } catch (error) {
      toast.error('Failed to load trainings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this training?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/trainings/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setTrainings(trainings.filter(t => t._id !== id));
          toast.success('Training deleted.');
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error('Error deleting training');
      }
    }
  };

  const handleSave = async (formData, id) => {
    try {
      const token = localStorage.getItem('token');
      const url = id ? `${import.meta.env.VITE_API_BASE_URL}/trainings/${id}` : `${import.meta.env.VITE_API_BASE_URL}/trainings`;
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
    } catch (error) {
      toast.error('Network error while saving');
    }
  };

  const filtered = trainings.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()));

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

  // ─── RENDER LIST VIEW ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap size={26} className="text-orange-500"/> Training Modules
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage training content, modules, Q&A, and quizzes.</p>
        </div>
        <button 
          onClick={() => { setEditingTraining(null); setShowFormView(true); }}
          className="bg-[#ff5a1f] hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} /> Add Training
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input 
            type="text"
            placeholder="Search trainings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Training List */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading trainings...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <GraduationCap size={48} className="mx-auto text-gray-200 mb-3"/>
          <p className="text-gray-500 font-medium">No training modules found.</p>
          <button onClick={() => setShowFormView(true)} className="mt-2 text-orange-500 font-bold hover:underline text-sm">
            Create your first training
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              
              {/* Card Image */}
              <div className="h-44 bg-gray-100 relative group overflow-hidden">
                {item.image ? (
                  <img src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/${item.image.replace(/\\/g, '/')}`} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                    <ImageIcon size={32} className="mb-2 opacity-50"/>
                    <span className="text-xs font-medium">No Image</span>
                  </div>
                )}
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  <button onClick={() => setViewingTraining(item)} className="w-12 h-12 bg-white text-gray-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                    <PlayCircle size={24} className="text-orange-500"/>
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{item.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{item.description}</p>
                
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-4 bg-gray-50 w-fit px-3 py-1.5 rounded-lg border border-gray-100">
                  <span className="flex items-center gap-1.5"><Layers size={14} className="text-orange-500"/> {item.modules?.length || 0} Modules</span>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs font-bold text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingTraining(item); setShowFormView(true); }} className="text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 p-1.5 rounded-md transition-colors" title="Edit">
                      <Edit2 size={16}/>
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-1.5 rounded-md transition-colors" title="Delete">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Trainings;
