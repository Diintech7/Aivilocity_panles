import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Eye, X, Upload, 
  ChevronLeft, Star, ToggleLeft, ToggleRight,
  Megaphone, Calendar, Users, IndianRupee,
  CheckCircle, Clock, XCircle, Tag, Building2,
  List, PlusCircle, Sparkles, Loader2, Lightbulb, Search
} from 'lucide-react';
import { toast } from 'react-toastify';

const CATEGORIES = ['Marketing', 'Sales', 'Product Launch', 'Brand Awareness', 'Social Media', 'Customer Retention', 'Referral', 'Other'];
const STATUSES = ['Active', 'Inactive', 'Draft', 'Completed'];

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

const emptyForm = {
  title: '',
  description: '',
  category: CATEGORIES[0],
  company: '',
  training: '',
  reward: '',
  startDate: '',
  deadline: '',
  image: null,
  totalSlots: '',
  requirements: [''],
  status: 'Draft',
  featured: false,
  goal: '',
  about: '',
  team: [{ name: '', role: '' }],
  conditions: ['']
};

const statusConfig = {
  Active:    { color: 'text-green-700 bg-green-100',   icon: <CheckCircle size={13}/> },
  Inactive:  { color: 'text-gray-600 bg-gray-100',    icon: <XCircle size={13}/> },
  Draft:     { color: 'text-yellow-700 bg-yellow-100', icon: <Clock size={13}/> },
  Completed: { color: 'text-blue-700 bg-blue-100',    icon: <CheckCircle size={13}/> },
};

// ─── Sub-views ────────────────────────────────────────────────────────────────

const CampaignCard = ({ c, onView, onEdit, onDelete, onToggleStatus }) => {
  const cfg = statusConfig[c.status] || statusConfig['Draft'];
  const pct = c.totalSlots > 0 ? Math.round((c.filledSlots / c.totalSlots) * 100) : 0;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Banner */}
      <div className="h-36 bg-gradient-to-br from-orange-400 to-orange-600 relative flex items-center justify-center">
        {c.image ? (
          <img src={getImageUrl(c.image)} alt={c.title} className="w-full h-full object-cover absolute inset-0" />
        ) : (
          <Megaphone size={48} className="text-white/40" />
        )}
        {c.featured && (
          <span className="absolute top-3 left-3 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full shadow">
            <Star size={12}/> Featured
          </span>
        )}
        <span className={`absolute top-3 right-3 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shadow ${cfg.color}`}>
          {cfg.icon} {c.status}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2">{c.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Building2 size={12}/>{c.company}</p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-orange-600 font-bold">
            <IndianRupee size={14}/>{c.reward.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <Users size={14}/>{c.filledSlots}/{c.totalSlots}
          </span>
          <span className="flex items-center gap-1 text-gray-500 ml-auto">
            <Tag size={13}/>{c.category}
          </span>
        </div>

        {/* Progress */}
        <div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-orange-500 h-1.5 rounded-full transition-all" style={{width: `${pct}%`}}></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">{pct}% slots filled</p>
        </div>

        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar size={12}/> Deadline: {c.deadline ? new Date(c.deadline).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : 'N/A'}
        </p>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => onView(c)} title="View Details" className="text-blue-500 hover:text-blue-700 transition-colors"><Eye size={17}/></button>
          <button onClick={() => onEdit(c)} title="Edit" className="text-gray-400 hover:text-gray-700 transition-colors"><Edit2 size={17}/></button>
          <button onClick={() => onDelete(c._id)} title="Delete" className="text-orange-500 hover:text-orange-700 transition-colors"><Trash2 size={17}/></button>
        </div>
        <button
          onClick={() => onToggleStatus(c._id)}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${c.status === 'Active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
        >
          {c.status === 'Active' ? <><ToggleRight size={15}/> Deactivate</> : <><ToggleLeft size={15}/> Activate</>}
        </button>
      </div>
    </div>
  );
};

const formatForDateTimeInput = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
};

// ─── Campaign Form ─────────────────────────────────────────────────────────────
const CampaignForm = ({ initial, onSave, onCancel, title, trainings }) => {
  const [form, setForm] = useState(initial);
  const [imageFile, setImageFile] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const setField = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleReqChange = (i, v) => {
    const r = [...form.requirements];
    r[i] = v;
    setField('requirements', r);
  };
  const addReq = () => setField('requirements', [...form.requirements, '']);
  const removeReq = (i) => setField('requirements', form.requirements.filter((_, idx) => idx !== i));

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setField('image', URL.createObjectURL(file));
    }
  };

  const handleGenerateAI = async (customPrompt) => {
    const promptToUse = (typeof customPrompt === 'string' ? customPrompt : aiPrompt).trim();
    if (!promptToUse) {
      toast.warning('Please enter a brief campaign idea/prompt first!');
      return;
    }

    setAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/campaigns/ai-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: promptToUse })
      });

      const data = await res.json();
      if (res.ok && data.success && data.campaign) {
        const c = data.campaign;
        setForm(prev => ({
          ...prev,
          title: c.title || prev.title,
          description: c.description || prev.description,
          category: CATEGORIES.includes(c.category) ? c.category : prev.category,
          company: c.company || prev.company,
          reward: c.reward !== undefined && c.reward !== '' ? c.reward : prev.reward,
          startDate: formatForDateTimeInput(c.startDate) || prev.startDate,
          deadline: formatForDateTimeInput(c.deadline) || prev.deadline,
          totalSlots: c.totalSlots !== undefined && c.totalSlots !== '' ? c.totalSlots : prev.totalSlots,
          goal: c.goal || prev.goal,
          about: c.about || prev.about,
          requirements: Array.isArray(c.requirements) && c.requirements.length > 0 ? c.requirements : prev.requirements,
          conditions: Array.isArray(c.conditions) && c.conditions.length > 0 ? c.conditions : prev.conditions,
        }));

        if (data.source === 'mock_fallback') {
          toast.info('✨ Campaign template auto-filled! Set GEMINI_API_KEY in backend/.env for live Google Gemini 1.5 Flash.');
        } else {
          toast.success('✨ Campaign details generated with Google Gemini! Please review and upload banner image.');
        }
      } else {
        toast.error(data.message || 'Failed to generate campaign with AI');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error while generating with AI');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.reward || !form.startDate || !form.deadline || !form.totalSlots) {
      toast.error('Please fill all required fields'); return;
    }
    onSave(form, imageFile);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-700 transition-colors"><ChevronLeft size={24}/></button>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      {/* ─── AI Magic Auto-Fill ─── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50/60 to-orange-50/40 border border-purple-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Sparkles size={19} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight">AI Smart Auto-Fill</h3>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                  Google Gemini 1.5 Flash
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Bas 1 line me campaign ka idea likhiye. AI title, description, category, reward, dates, goal, requirements sab auto-fill kar dega!
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleGenerateAI();
              }
            }}
            placeholder="e.g. Swiggy delivery partner onboarding, reward ₹250 per partner, target 500 slots, 30 days..."
            className="flex-1 border border-purple-200 bg-white/90 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-inner"
          />
          <button
            type="button"
            onClick={() => handleGenerateAI()}
            disabled={aiLoading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl shadow-md shadow-purple-600/20 disabled:opacity-75 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
          >
            {aiLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Auto-Fill with AI ✨</span>
              </>
            )}
          </button>
        </div>

        {/* Quick prompt chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-purple-100/80">
          <span className="text-[11px] font-semibold text-purple-700 flex items-center gap-1 mr-1">
            <Lightbulb size={12} /> Quick Ideas:
          </span>
          {[
            'HDFC Credit Card Acquisition (₹250/card, 500 slots)',
            'Swiggy Delivery Partner Onboarding (₹300/onboard)',
            'Angel One Demat Account Drive (₹200/account)',
            'Campus Ambassador Referral Program (₹150/lead)'
          ].map((idea, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setAiPrompt(idea);
                handleGenerateAI(idea);
              }}
              className="text-[11px] bg-white/90 hover:bg-purple-100 hover:text-purple-800 border border-purple-200/80 text-gray-600 rounded-lg px-2.5 py-1 transition-all cursor-pointer"
            >
              {idea}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Campaign Info</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title *</label>
              <input type="text" value={form.title} onChange={e=>setField('title',e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter campaign title" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea value={form.description} onChange={e=>setField('description',e.target.value)} rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Describe the campaign..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={form.category} onChange={e=>setField('category',e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input type="text" value={form.company} onChange={e=>setField('company',e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. Ailocity Pvt. Ltd." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Associated Training</label>
                <select value={form.training || ''} onChange={e=>setField('training',e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">-- None --</option>
                  {trainings.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reward Amount (₹) *</label>
                <input type="number" value={form.reward} onChange={e=>setField('reward',e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. 5000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Starting Date *</label>
                <input type="datetime-local" value={form.startDate} onChange={e=>setField('startDate',e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                <input type="datetime-local" value={form.deadline} onChange={e=>setField('deadline',e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Slots *</label>
                <input type="number" value={form.totalSlots} onChange={e=>setField('totalSlots',e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. 100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select value={form.status} onChange={e=>setField('status',e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {STATUSES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>


            {/* Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Goal</label>
              <textarea value={form.goal} onChange={e=>setField('goal',e.target.value)} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="What is the main goal of this campaign?" />
            </div>

            {/* About */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About Campaign</label>
              <textarea value={form.about} onChange={e=>setField('about',e.target.value)} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Detailed information about this campaign..." />
            </div>


            {/* Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
              <div className="flex flex-col gap-2">
                {(form.conditions || ['']).map((cond, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input type="text" value={cond} onChange={e => {
                      const arr = [...(form.conditions || [])]; arr[i] = e.target.value; setField('conditions', arr);
                    }} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={`Condition ${i+1}`} />
                    {(form.conditions || []).length > 1 && (
                      <button type="button" onClick={() => setField('conditions', form.conditions.filter((_,idx)=>idx!==i))} className="text-red-400 hover:text-red-600"><X size={16}/></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setField('conditions', [...(form.conditions||[]), ''])}
                  className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium mt-1">
                  <PlusCircle size={16}/> Add Condition
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          {/* Image Upload */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-4">Campaign Image</h3>
            <div className="relative w-full h-40 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden bg-gray-50 group hover:border-orange-400 transition-colors cursor-pointer">
              {form.image ? (
                <img src={getImageUrl(form.image)} alt="preview" className="w-full h-full object-cover absolute inset-0" />
              ) : (
                <>
                  <Upload size={28} className="text-gray-300 group-hover:text-orange-400 transition-colors"/>
                  <p className="text-xs text-gray-400 mt-2">Click to upload image</p>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImage} className="absolute inset-0 opacity-0 cursor-pointer"/>
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-4">Campaign Settings</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 text-sm">Featured Campaign</p>
                <p className="text-xs text-gray-400 mt-0.5">Show prominently on top</p>
              </div>
              <button
                type="button"
                onClick={() => setField('featured', !form.featured)}
                className={`w-12 h-6 rounded-full relative transition-colors ${form.featured ? 'bg-orange-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.featured ? 'left-7' : 'left-1'}`}></span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-2">
            <button type="submit"
              className="w-full bg-[#ff5a1f] hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition-colors shadow-sm">
              Save Campaign
            </button>
            <button type="button" onClick={onCancel}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

// ─── Campaign Details ──────────────────────────────────────────────────────────
const CampaignDetails = ({ c, onBack, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const cfg = statusConfig[c.status] || statusConfig['Draft'];
  const pct = c.totalSlots > 0 ? Math.round((c.filledSlots / c.totalSlots) * 100) : 0;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'goal', label: '🎯 Goal' },
    { id: 'about', label: 'ℹ️ About' },
    { id: 'conditions', label: '📋 Conditions' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-700 transition-colors"><ChevronLeft size={24}/></button>
        <h2 className="text-2xl font-bold text-gray-900">Campaign Details</h2>
        <button onClick={() => onEdit(c)}
          className="ml-auto flex items-center gap-2 bg-[#ff5a1f] hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Edit2 size={16}/> Edit Campaign
        </button>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl h-48 flex items-center justify-center relative overflow-hidden shadow">
        {c.image ? <img src={getImageUrl(c.image)} alt={c.title} className="w-full h-full object-cover absolute inset-0"/> : <Megaphone size={64} className="text-white/40"/>}
        {c.featured && (
          <span className="absolute top-4 left-4 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow">
            <Star size={12}/> Featured
          </span>
        )}
        <span className={`absolute top-4 right-4 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full shadow ${cfg.color}`}>
          {cfg.icon} {c.status}
        </span>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-xl drop-shadow">{c.title}</h3>
          <p className="text-white/80 text-sm">{c.company}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[#ff5a1f] text-[#ff5a1f]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tab Content */}
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
                <p className="text-gray-600 leading-relaxed">{c.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                  {[
                    { label: 'Category', value: c.category, icon: <Tag size={14}/> },
                    { label: 'Company', value: c.company, icon: <Building2 size={14}/> },
                    { label: 'Training', value: c.training?.name || 'None', icon: <Tag size={14}/> },
                    { label: 'Reward', value: `₹${Number(c.reward).toLocaleString()}`, icon: <IndianRupee size={14}/> },
                    { label: 'Start Date', value: c.startDate ? new Date(c.startDate).toLocaleString('en-IN', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : 'N/A', icon: <Calendar size={14}/> },
                    { label: 'Deadline', value: c.deadline ? new Date(c.deadline).toLocaleString('en-IN', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : 'N/A', icon: <Calendar size={14}/> },
                    { label: 'Total Slots', value: c.totalSlots, icon: <Users size={14}/> },
                    { label: 'Filled Slots', value: c.filledSlots, icon: <CheckCircle size={14}/> },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">{item.icon}{item.label}</p>
                      <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Slot Progress</span>
                    <span>{c.filledSlots} / {c.totalSlots} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-orange-500 h-2.5 rounded-full" style={{width:`${pct}%`}}></div>
                  </div>
                </div>
              </div>


            </div>
          )}

          {activeTab === 'goal' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl">🎯</div>
                <h3 className="font-bold text-gray-900 text-lg">Campaign Goal</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-base">
                {c.goal || <span className="text-gray-400 italic">No goal specified for this campaign.</span>}
              </p>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl">ℹ️</div>
                <h3 className="font-bold text-gray-900 text-lg">About This Campaign</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-base">
                {c.about || <span className="text-gray-400 italic">No details specified for this campaign.</span>}
              </p>
            </div>
          )}



          {activeTab === 'conditions' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-xl">📋</div>
                <h3 className="font-bold text-gray-900 text-lg">Terms & Conditions</h3>
              </div>
              {(c.conditions || []).length > 0 ? (
                <ol className="space-y-3">
                  {(c.conditions || []).map((cond, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                      <p className="text-gray-700 text-sm leading-relaxed">{cond}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-gray-400 italic">No conditions specified.</p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Quick Stats */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Quick Stats</h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cfg.color}`}>{c.status}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Featured</span><span className="font-medium text-gray-800">{c.featured ? 'Yes ⭐' : 'No'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Created</span><span className="font-medium text-gray-800">{c.createdAt || 'N/A'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Available</span><span className="font-medium text-gray-800">{c.totalSlots - c.filledSlots} slots</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Campaigns Component ──────────────────────────────────────────────────
const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [view, setView] = useState('list'); // list | create | edit | detail
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setCampaigns(data);
    } catch (err) {
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/trainings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTrainings(data.data || data); // Adjust depending on your training API response structure
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchCampaigns();
    fetchTrainings();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/campaigns/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setCampaigns(prev => prev.map(c => c._id === id ? updated : c));
        toast.info(`Campaign status updated`);
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/campaigns/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setCampaigns(prev => prev.filter(c => c._id !== id));
          toast.success('Campaign deleted!');
          if (view === 'detail') setView('list');
        } else {
          toast.error('Failed to delete campaign');
        }
      } catch (err) {
        toast.error('Network error');
      }
    }
  };

  const handleSave = async (form, imageFile) => {
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'requirements' || key === 'conditions') {
          if (Array.isArray(form[key])) {
            form[key].forEach(val => {
              if (val) formData.append(key, val);
            });
          }
        } else if (key === 'team') {
          // Team formatting if needed
        } else if (key === 'image') {
          // Skip local blob url string; real imageFile is attached below
        } else if (form[key] !== undefined && form[key] !== null) {
          formData.append(key, form[key]);
        }
      });

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const url = selected ? `${import.meta.env.VITE_API_BASE_URL}/campaigns/${selected._id}` : `${import.meta.env.VITE_API_BASE_URL}/campaigns`;
      const method = selected ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });

      if (res.ok) {
        const savedCampaign = await res.json();
        if (selected) {
          setCampaigns(prev => prev.map(c => c._id === selected._id ? savedCampaign : c));
          toast.success('Campaign updated!');
        } else {
          setCampaigns(prev => [...prev, savedCampaign]);
          toast.success('Campaign created!');
        }
        setSelected(null);
        setView('list');
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.message || 'Failed to save campaign');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const filtered = campaigns.filter(c => {
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    All: campaigns.length,
    Active: campaigns.filter(c => c.status === 'Active').length,
    Inactive: campaigns.filter(c => c.status === 'Inactive').length,
    Draft: campaigns.filter(c => c.status === 'Draft').length,
    Completed: campaigns.filter(c => c.status === 'Completed').length,
  };

  if (view === 'create') {
    return <CampaignForm title="Create Campaign" initial={{...emptyForm}} onSave={handleSave} onCancel={() => { setSelected(null); setView('list'); }} trainings={trainings} />;
  }
  if (view === 'edit' && selected) {
    // If training is populated, map it to its ID for the form
    const editInitial = { ...selected, training: selected.training?._id || selected.training || '' };
    return <CampaignForm title="Edit Campaign" initial={editInitial} onSave={handleSave} onCancel={() => { setSelected(null); setView('list'); }} trainings={trainings} />;
  }
  if (view === 'detail' && selected) {
    return <CampaignDetails c={selected} onBack={() => { setSelected(null); setView('list'); }} onEdit={(c) => { setSelected(c); setView('edit'); }} />;
  }

  // ── List View ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Megaphone size={24} className="text-orange-500"/> Campaign Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your marketing campaigns in one place.</p>
        </div>
        <button onClick={() => { setSelected(null); setView('create'); }}
          className="flex items-center gap-2 bg-[#ff5a1f] hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors self-start">
          <Plus size={18}/> Create Campaign
        </button>
      </div>

      {/* Filters & Search Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Stats Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {Object.entries(counts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === status ? 'bg-[#ff5a1f] text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}
            >
              {status} <span className="ml-1 opacity-75">({count})</span>
            </button>
          ))}
        </div>

        {/* Search Bar on Right */}
        <div className="relative w-full sm:w-80 self-end lg:self-auto shrink-0">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full border border-gray-300 bg-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Campaign Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-orange-500">
          <Clock className="animate-spin" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3 text-gray-400">
          <Megaphone size={48} className="opacity-30"/>
          <p className="font-medium">No campaigns found</p>
          <button onClick={() => { setSelected(null); setView('create'); }} className="text-orange-500 hover:text-orange-700 text-sm font-medium flex items-center gap-1 mt-1">
            <Plus size={16}/> Create your first campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(c => (
            <CampaignCard
              key={c._id}
              c={c}
              onView={(c) => { setSelected(c); setView('detail'); }}
              onEdit={(c) => { setSelected(c); setView('edit'); }}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Campaigns;
