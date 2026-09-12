import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Eye, ChevronLeft, Calendar, Tag,
  Briefcase, Search, Plus, Trash2, Save, FileText, X,
  Image, Megaphone, Coins, CheckCircle2, PlusCircle,
  Sparkles, Loader2, Lightbulb, Wand2
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

const TaskCard = ({ task, onView, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all border-l-4 border-l-blue-500 flex flex-col">
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{task.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>

        <div className="flex flex-col gap-1.5 text-xs text-gray-500 mt-2">
          <span className="flex items-center gap-1.5">
            <Briefcase size={12} className="text-blue-400"/>
            {task.campaignId?.title || 'Unknown Campaign'}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-red-400"/>
            Ends: {new Date(task.endDate).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
            Task
          </span>
          <span className="text-sm font-bold text-orange-600">₹{task.price}</span>
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
        <button onClick={() => onView(task)}
          className="flex items-center gap-1.5 text-blue-500 hover:text-blue-700 text-xs font-medium transition-colors">
          <Eye size={14}/> View Details
        </button>
        <button onClick={() => onDelete(task._id)}
          className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
      </div>
    </div>
  );
};

const TaskDetail = ({ task, onBack }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-700 transition-colors">
          <ChevronLeft size={24}/>
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{task.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{task.campaignId?.title || 'Unknown Campaign'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 max-w-4xl">
        {task.image && (
          <img src={getImageUrl(task.image)} alt={task.name} className="w-full h-64 object-cover rounded-xl" />
        )}
        
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Description</p>
          <p className="text-gray-700 leading-relaxed">{task.description}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">What To Do (Requirements)</p>
          {task.whatToDo && task.whatToDo.length > 0 ? (
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {task.whatToDo.map((point, index) => (
                <li key={index} className="text-sm">{point}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No specific points provided.</p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
          {[
            { label: 'Start Date', value: new Date(task.startDate).toLocaleDateString(), icon: <Calendar size={14}/> },
            { label: 'End Date', value: new Date(task.endDate).toLocaleDateString(), icon: <Calendar size={14}/> },
            { label: 'Reward', value: `₹${task.price}`, icon: <Tag size={14}/> },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">{item.icon}{item.label}</p>
              <p className="text-sm font-semibold text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── AI Task Prompt Modal ──────────────────────────────────────────────────
const TaskAiPromptModal = ({ isOpen, onClose, onApplyAiTask }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const suggestions = [
    { label: '📱 Instagram Reel Promotion', text: 'Create an engaging Instagram Reel promoting the brand product with key hashtags and link in bio' },
    { label: '🏪 Local Merchant Survey & QR Audit', text: 'Visit 5 retail grocery shops, interview owners about digital payment preferences, and verify QR placement' },
    { label: '🎓 College Campus Ambassador Drive', text: 'Distribute 50 product flyers at a college campus and collect 10 verified student contact leads' },
    { label: '📲 App Download & KYC Verification', text: 'Get 5 verified users to download the mobile app, complete mobile verification, and leave feedback' },
    { label: '⭐ Play Store App Review & Bug Testing', text: 'Test new app features, write a detailed 5-star review on Google Play Store, and report feedback' }
  ];

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    const promptText = prompt.trim();
    if (!promptText) {
      toast.warning('Please enter a task idea or instruction prompt');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/tasks/ai-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: promptText })
      });

      const data = await res.json();
      if (res.ok && data.success && data.task) {
        onApplyAiTask(data.task);
        if (data.source === 'mock_fallback') {
          toast.info('✨ Task details auto-filled! Set GEMINI_API_KEY in backend/.env for live Google Gemini 1.5 Flash.');
        } else {
          toast.success('✨ Task details generated with AI! Please upload your task image and select a campaign.');
        }
        onClose();
      } else {
        toast.error(data.message || 'Failed to generate task with AI');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error while generating task with AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-purple-100 flex flex-col my-auto animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Sparkles size={18} className="text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">Generate Task with AI</h3>
              <p className="text-[11px] text-purple-100/90">Powered by Google Gemini 1.5 Flash</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleGenerate} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Task Idea / Prompt <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Conduct a 5-minute brand survey at local shops, ask about payment habits, and take photo proofs..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none shadow-xs"
              autoFocus
            />
          </div>

          {/* Quick Idea Chips */}
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              💡 Quick Examples (Click to use):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(s.text)}
                  className="px-2.5 py-1 text-xs rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60 font-medium transition-all text-left cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note about image */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
            <span className="text-base leading-none">📷</span>
            <div>
              <strong>Image Note:</strong> AI will automatically generate Task Name, Description, Step-by-Step Requirements, Reward Price, and Dates. <u>Task image aap khud se upload karenge</u>.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/25 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>AI Generating Task...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} className="text-amber-300" />
                  <span>Generate & Auto-fill Form</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddTaskModal = ({ onClose, onSave, campaigns }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    campaignId: '',
    startDate: '',
    endDate: '',
    price: '',
  });
  const [whatToDoList, setWhatToDoList] = useState(['', '', '']);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);

  const handleApplyAiTask = (aiTask) => {
    setForm(prev => ({
      ...prev,
      name: aiTask.name || prev.name,
      description: aiTask.description || prev.description,
      price: aiTask.price !== undefined && aiTask.price !== '' ? aiTask.price : prev.price,
      startDate: aiTask.startDate || prev.startDate || new Date().toISOString().split('T')[0],
      endDate: aiTask.endDate || prev.endDate,
    }));
    if (Array.isArray(aiTask.whatToDo) && aiTask.whatToDo.length > 0) {
      setWhatToDoList(aiTask.whatToDo);
    }
  };

  const addPoint = () => setWhatToDoList([...whatToDoList, '']);
  const removePoint = (i) => {
    if (whatToDoList.length > 1) {
      setWhatToDoList(whatToDoList.filter((_, idx) => idx !== i));
    } else {
      setWhatToDoList(['']);
    }
  };
  const handlePointChange = (i, val) => {
    const list = [...whatToDoList];
    list[i] = val;
    setWhatToDoList(list);
  };

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.campaignId || !form.endDate || !form.price) {
      toast.error('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('campaignId', form.campaignId);
    formData.append('startDate', form.startDate || new Date().toISOString().split('T')[0]);
    formData.append('endDate', form.endDate);
    formData.append('price', form.price);
    
    // Add non-empty whatToDo points
    const points = whatToDoList.filter(p => p.trim() !== '');
    points.forEach(p => formData.append('whatToDo', p.trim()));

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Task created successfully!');
        onSave();
        onClose();
      } else {
        toast.error(data.message || 'Failed to create task');
      }
    } catch (err) {
      toast.error('Server error');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-6xl overflow-hidden border border-gray-100 my-auto animate-in fade-in zoom-in duration-200">
        {/* Header with decorative illustration */}
        <div className="relative px-8 py-5 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-purple-50/20 border-b border-gray-100 flex items-center justify-between overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-1/4 w-48 h-48 bg-blue-100/40 rounded-full blur-2xl pointer-events-none" />

          {/* Left Title */}
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
              <Plus size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Create New Task</h2>
              <p className="text-xs text-gray-500 mt-0.5">Fill in the details below to add a task to a campaign.</p>
            </div>
          </div>

          {/* Center/Right Illustration & AI Action Button */}
          <div className="flex items-center gap-4 relative z-10">
            {/* ✨ AI Auto-fill Button */}
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              title="Auto-fill task fields with AI"
            >
              <Sparkles size={16} className="text-amber-300 animate-pulse" />
              <span>✨ Auto-fill with AI</span>
            </button>

            <div className="hidden lg:flex items-center gap-4 border-l border-gray-200 pl-4">
              <img
                src="/task.png"
                alt="Task"
                className="h-12 w-auto object-contain select-none pointer-events-none"
              />

              {/* Tagline dots */}
              <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-gray-500">
                <span>Organize</span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>Assign</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Track</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Achieve</span>
              </div>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-7 overflow-y-auto max-h-[72vh] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {/* AI Magic Prompt Banner */}
            <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-r from-purple-50/90 via-indigo-50/70 to-blue-50/60 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
                  <Sparkles size={20} className="text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">Task Auto-Fill with AI</h4>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                      Google Gemini 1.5 Flash
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Prompt likhein aur click karein — Task Name, Description, Step-by-Step Requirements, Reward Price aur Dates auto-fill ho jayenge! Image aap khud se upload karenge.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                <Sparkles size={14} className="text-amber-300" />
                <span>Prompt Likh kar Auto-fill karein</span>
              </button>
            </div>
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-5">
              {/* Task Name */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <FileText size={17} />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 tracking-tight">
                      Task Name <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] font-medium text-gray-400">
                      {form.name.length}/100
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={100}
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Create an Instagram Reel about our new product"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <FileText size={17} />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 tracking-tight">
                      Description
                    </label>
                    <span className="text-[11px] font-medium text-gray-400">
                      {form.description.length}/500
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Provide a brief overview of what this task entails..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs resize-none"
                  />
                </div>
              </div>

              {/* What To Do (Requirements) */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <CheckCircle2 size={17} />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-800 tracking-tight">
                    What To Do (Requirements)
                  </label>
                  <div className="flex flex-col gap-2">
                    {whatToDoList.map((point, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={point}
                          onChange={e => handlePointChange(index, e.target.value)}
                          placeholder={`Task Requirement ${index + 1}`}
                          className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => removePoint(index)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Remove requirement"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addPoint}
                      className="w-full border border-dashed border-blue-400 bg-blue-50/30 hover:bg-blue-50 text-blue-600 rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1"
                    >
                      <PlusCircle size={15} /> Add Another Requirement
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-5">
              {/* Task Image */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Image size={17} />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 tracking-tight">
                      Task Image
                    </label>
                    {imagePreview && (
                      <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        Preview Ready
                      </span>
                    )}
                  </div>

                  {imagePreview ? (
                    <div className="w-full border-2 border-purple-200 bg-purple-50/20 rounded-2xl p-3.5 flex items-center gap-3.5 relative group shadow-xs">
                      {/* Image Thumbnail */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-purple-200/80 bg-white shrink-0 shadow-xs relative flex items-center justify-center">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* File Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-xs font-bold text-gray-800 truncate" title={imageFile?.name}>
                          {imageFile?.name}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : ''} • Image selected
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <label className="text-[11px] font-bold text-purple-600 hover:text-purple-700 bg-white border border-purple-200 hover:bg-purple-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs">
                            Change Image
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
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full border-2 border-dashed border-purple-200 hover:border-purple-300 bg-gray-50/60 hover:bg-purple-50/20 rounded-2xl p-5 flex flex-col items-center justify-center relative cursor-pointer group transition-all text-center min-h-[110px]">
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
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Image size={28} className="text-gray-400 group-hover:text-purple-600 transition-colors mb-1.5" />
                      <span className="text-xs font-semibold text-gray-700 max-w-[240px] truncate">
                        Click or drag image here to upload
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        PNG, JPG, JPEG (Max 5MB)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Select Campaign */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Megaphone size={17} />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-800 tracking-tight">
                    Select Campaign <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.campaignId}
                    onChange={e => set('campaignId', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-xs cursor-pointer"
                  >
                    <option value="">-- Choose an associated campaign --</option>
                    {campaigns && campaigns.length > 0 ? (
                      campaigns.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>)
                    ) : (
                      <option disabled>No campaigns found in database</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Dates side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Start Date */}
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Calendar size={16} />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-800 tracking-tight">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={e => set('startDate', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Calendar size={16} />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-800 tracking-tight">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={e => set('endDate', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Reward Price */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Coins size={17} />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-800 tracking-tight">
                    Reward Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => set('price', e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-8 py-4 bg-gray-50/60 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <X size={15} /> Cancel
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/25 flex items-center gap-2 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Save size={15} /> Create Task
            </button>
          </div>
        </form>
      </div>

      {/* AI Prompt Modal */}
      <TaskAiPromptModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApplyAiTask={handleApplyAiTask}
      />
    </div>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState('');
  const [viewingTask, setViewingTask] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/campaigns`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCampaigns(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchCampaigns();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          toast.success('Task deleted!');
          fetchTasks();
        } else {
          toast.error('Failed to delete task');
        }
      } catch (err) {
        toast.error('Server error');
      }
    }
  };

  const filtered = tasks.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.campaignId?.title && t.campaignId.title.toLowerCase().includes(search.toLowerCase()))
  );

  if (viewingTask) {
    return <TaskDetail task={viewingTask} onBack={() => setViewingTask(null)} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare size={24} className="text-blue-500"/> Task Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Create specific tasks connected to your campaigns.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors self-start"
        >
          <Plus size={18}/> Create Task
        </button>
      </div>

      {/* Search Bar on Right Side */}
      <div className="flex justify-end">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by task name or campaign..."
            className="w-full border border-gray-300 bg-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500">Loading tasks...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3 text-gray-400">
          <FileText size={48} className="opacity-30"/>
          <p className="font-medium text-gray-500">No tasks created yet</p>
          <button onClick={() => setShowAddModal(true)} className="text-blue-500 text-sm font-bold mt-2 hover:underline">
            + Create your first task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onView={t => setViewingTask(t)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddTaskModal
          campaigns={campaigns}
          onClose={() => setShowAddModal(false)}
          onSave={fetchTasks}
        />
      )}
    </div>
  );
};

export default Tasks;
