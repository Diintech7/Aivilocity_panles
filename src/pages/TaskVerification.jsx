import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, Eye, ChevronLeft, User, Calendar,
  Briefcase, Send, Search, AlertCircle, Tag, MessageSquare,
  Clock, ShieldCheck, FileCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

// ─── Shared task data (same as Tasks page) ────────────────────────────────────
const PRIORITY_CONFIG = {
  'High':   { color: 'bg-red-100 text-red-600',      border: 'border-l-red-500' },
  'Medium': { color: 'bg-yellow-100 text-yellow-600', border: 'border-l-yellow-500' },
  'Low':    { color: 'bg-green-100 text-green-600',   border: 'border-l-green-500' },
};

const initialTasks = [
  {
    id: 1,
    title: 'Write Blog Post on Product Launch',
    description: 'Write a 1000-word SEO-optimized blog post about the new Ailocity product launch.',
    campaign: 'New Year Brand Awareness',
    assignedTo: 'Rohit Sharma',
    assignedEmail: 'rohit@example.com',
    priority: 'Medium',
    status: 'Submitted',
    deadline: '2025-11-05',
    createdAt: '2025-10-20',
    reward: 2000,
    submissionNote: 'I have submitted the blog post with all the required keywords and meta description. Please review the attached doc link.',
    rejectionReason: '',
    comments: []
  },
  {
    id: 2,
    title: 'Run Referral Campaign on WhatsApp',
    description: 'Share the Ailocity referral link with at least 20 contacts and submit screenshot proof.',
    campaign: 'Referral Bonus Drive',
    assignedTo: 'Anjali Singh',
    assignedEmail: 'anjali@example.com',
    priority: 'Low',
    status: 'Approved',
    deadline: '2025-10-10',
    createdAt: '2025-10-01',
    reward: 800,
    submissionNote: 'Shared with 25 contacts. Screenshots attached.',
    rejectionReason: '',
    comments: [{ author: 'Admin', text: 'Great work! Reward has been processed.', date: '2025-10-12' }]
  },
  {
    id: 3,
    title: 'YouTube Video Review',
    description: 'Create a 5-minute YouTube review of Ailocity platform features and services.',
    campaign: 'Social Media Blitz Q4',
    assignedTo: 'Sandeep Yadav',
    assignedEmail: 'sandeep@example.com',
    priority: 'High',
    status: 'Rejected',
    deadline: '2025-10-30',
    createdAt: '2025-10-18',
    reward: 3000,
    submissionNote: 'Video uploaded at youtube.com/watch?v=xxxx',
    rejectionReason: 'Video quality was below the required 1080p resolution. Audio was also echoing. Please re-submit with better quality.',
    comments: []
  }
];

// ─── Detail View ───────────────────────────────────────────────────────────────
const VerificationDetail = ({ task, onBack, onApprove, onReject }) => {
  const [rejectReason, setRejectReason] = useState(task.rejectionReason || '');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const priCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['Medium'];

  const handleReject = () => {
    if (!rejectReason.trim()) { toast.error('Please enter a rejection reason.'); return; }
    onReject(task.id, rejectReason);
    onBack();
  };

  const handleApprove = () => {
    onApprove(task.id);
    onBack();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-700 transition-colors"><ChevronLeft size={24}/></button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{task.campaign}</p>
        </div>
        <span className="bg-cyan-100 text-cyan-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
          <Send size={12}/> Pending Verification
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Task Info */}
          <div className={`bg-white rounded-xl border-l-4 ${priCfg.border} border border-gray-100 shadow-sm p-6 flex flex-col gap-4`}>
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Task Details</h3>
            <p className="text-gray-700 leading-relaxed">{task.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Assigned To', value: task.assignedTo, icon: <User size={14}/> },
                { label: 'Campaign', value: task.campaign, icon: <Briefcase size={14}/> },
                { label: 'Deadline', value: task.deadline, icon: <Calendar size={14}/> },
                { label: 'Priority', value: task.priority, icon: <AlertCircle size={14}/> },
                { label: 'Created', value: task.createdAt, icon: <Calendar size={14}/> },
                { label: 'Reward (₹)', value: `₹${task.reward.toLocaleString()}`, icon: <Tag size={14}/> },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">{item.icon}{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Note */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6">
            <h3 className="font-bold text-cyan-700 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
              <Send size={14}/> Employee's Submission Note
            </h3>
            {task.submissionNote ? (
              <p className="text-cyan-900 leading-relaxed">{task.submissionNote}</p>
            ) : (
              <p className="text-cyan-400 italic">No submission note provided.</p>
            )}
          </div>

          {/* Previous Rejection (if re-submitted) */}
          {task.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="font-bold text-red-700 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                <XCircle size={14}/> Previous Rejection Reason
              </h3>
              <p className="text-red-800 leading-relaxed">{task.rejectionReason}</p>
            </div>
          )}

          {/* Comments */}
          {task.comments?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MessageSquare size={16} className="text-orange-500"/> Comments
              </h3>
              {task.comments.map((c, i) => (
                <div key={i} className="flex gap-3 items-start mb-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {c.author.charAt(0)}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold text-gray-700">{c.author}</span>
                      <span className="text-xs text-gray-400">{c.date}</span>
                    </div>
                    <p className="text-sm text-gray-600">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Verification Actions */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
              <ShieldCheck size={16} className="text-orange-500"/> Verification Action
            </h3>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleApprove}
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
              >
                <CheckCircle2 size={18}/> Approve & Release Reward
              </button>

              <button
                onClick={() => setShowRejectForm(!showRejectForm)}
                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-colors border border-red-200"
              >
                <XCircle size={18}/> Reject Task
              </button>

              {showRejectForm && (
                <div className="mt-2 flex flex-col gap-3 animate-in slide-in-from-top duration-200">
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="Enter reason for rejection..."
                    className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                  />
                  <button onClick={handleReject}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg text-sm transition-colors">
                    Confirm Rejection
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Employee Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-4">Submitted By</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                {task.assignedTo.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{task.assignedTo}</p>
                <p className="text-xs text-gray-500">{task.assignedEmail}</p>
              </div>
            </div>
          </div>

          {/* Reward Info */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
            <p className="text-xs text-orange-600 font-bold uppercase tracking-wide mb-1">Reward on Approval</p>
            <p className="text-3xl font-extrabold text-orange-600">₹{task.reward.toLocaleString()}</p>
            <p className="text-xs text-orange-500 mt-1">Will be credited to employee wallet on approval.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main TaskVerification Component ──────────────────────────────────────────
const TaskVerification = () => {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Submitted');
  const [viewingTask, setViewingTask] = useState(null);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/tasks/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const mapped = data.map(sub => ({
          id: sub._id,
          title: sub.taskId?.name || 'Unknown Task',
          description: sub.taskId?.description || '',
          campaign: sub.campaignId?.title || 'Unknown Campaign',
          assignedTo: sub.bdId?.name || 'Unknown BA',
          assignedEmail: sub.bdId?.email || '',
          priority: 'Medium',
          status: sub.status === 'Completed' ? 'Submitted' : sub.status,
          deadline: sub.taskId?.endDate ? new Date(sub.taskId.endDate).toLocaleDateString() : 'N/A',
          createdAt: new Date(sub.createdAt).toLocaleDateString(),
          reward: sub.taskId?.price || 0,
          submissionNote: sub.feedback || '',
          rejectionReason: '',
          comments: []
        }));
        setTasks(mapped);
      }
    } catch (err) {
      toast.error('Failed to fetch submissions');
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/tasks/submissions/${id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Approved' })
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === id ? {...t, status: 'Approved'} : t));
        toast.success('Task Approved!');
      } else {
        toast.error('Failed to approve task');
      }
    } catch (e) {
      toast.error('Network Error');
    }
  };

  const handleReject = async (id, reason) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/tasks/submissions/${id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Rejected' }) // Ideally backend should save reason too
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === id ? {...t, status: 'Rejected', rejectionReason: reason} : t));
        toast.error('Task Rejected!');
      } else {
        toast.error('Failed to reject task');
      }
    } catch (e) {
      toast.error('Network Error');
    }
  };

  const tabs = [
    { label: 'Submitted', icon: <Send size={14}/>, color: 'text-cyan-600' },
    { label: 'Approved', icon: <CheckCircle2 size={14}/>, color: 'text-green-600' },
    { label: 'Rejected', icon: <XCircle size={14}/>, color: 'text-red-600' },
    { label: 'All', icon: <FileCheck size={14}/>, color: 'text-gray-600' },
  ];

  const filteredByTab = activeTab === 'All' ? tasks : tasks.filter(t => t.status === activeTab);

  const filtered = filteredByTab.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.assignedTo.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    Submitted: tasks.filter(t => t.status === 'Submitted').length,
    Approved:  tasks.filter(t => t.status === 'Approved').length,
    Rejected:  tasks.filter(t => t.status === 'Rejected').length,
    All:       tasks.length,
  };

  if (viewingTask) {
    return (
      <VerificationDetail
        task={viewingTask}
        onBack={() => setViewingTask(null)}
        onApprove={(id) => { handleApprove(id); setViewingTask(prev => ({...prev, status: 'Approved'})); }}
        onReject={(id, reason) => { handleReject(id, reason); }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck size={24} className="text-orange-500"/> Task Verification
        </h1>
        <p className="text-gray-500 text-sm mt-1">Review, approve, or reject submitted employee tasks.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
            <Send size={22} className="text-cyan-600"/>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-cyan-700">{counts.Submitted}</p>
            <p className="text-sm text-cyan-600 font-medium">Awaiting Review</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={22} className="text-green-600"/>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-green-700">{counts.Approved}</p>
            <p className="text-sm text-green-600 font-medium">Approved</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <XCircle size={22} className="text-red-500"/>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-red-600">{counts.Rejected}</p>
            <p className="text-sm text-red-500 font-medium">Rejected</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {tabs.map(tab => (
          <button key={tab.label} onClick={() => setActiveTab(tab.label)}
            className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.label
                ? 'border-[#ff5a1f] text-[#ff5a1f]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab.icon}
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ml-0.5 font-bold ${
              activeTab === tab.label ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
            }`}>{counts[tab.label]}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search task or employee..."
          className="w-full sm:w-96 border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Task Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-14 flex flex-col items-center gap-3 text-gray-400">
          <FileCheck size={44} className="opacity-30"/>
          <p className="font-medium">No tasks found in this category</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Task</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Employee</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Campaign</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Deadline</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Reward</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => {
                const priCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['Medium'];
                return (
                  <tr key={task.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className={`w-1 h-10 rounded-full shrink-0 ${priCfg.border.replace('border-l-','bg-')}`}></div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm max-w-[200px] truncate">{task.title}</p>
                          <p className={`text-xs font-medium mt-0.5 ${priCfg.color.split(' ')[1]}`}>{task.priority} Priority</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center shrink-0">
                          {task.assignedTo.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{task.assignedTo}</p>
                          <p className="text-xs text-gray-400">{task.assignedEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 max-w-[150px] truncate">{task.campaign}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">{task.deadline}</td>
                    <td className="py-4 px-6 text-sm font-bold text-orange-600">₹{task.reward.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        task.status === 'Submitted' ? 'bg-cyan-100 text-cyan-700' :
                        task.status === 'Approved'  ? 'bg-green-100 text-green-700' :
                        task.status === 'Rejected'  ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setViewingTask(task)} title="Review"
                          className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-xs font-medium border border-blue-200 hover:border-blue-400 px-2.5 py-1.5 rounded-lg transition-colors">
                          <Eye size={13}/> Review
                        </button>
                        {task.status === 'Submitted' && (
                          <>
                            <button onClick={() => { handleApprove(task.id); }}
                              className="text-green-600 hover:text-green-800 transition-colors" title="Approve">
                              <CheckCircle2 size={18}/>
                            </button>
                            <button onClick={() => { handleReject(task.id, 'Rejected by admin'); }}
                              className="text-red-500 hover:text-red-700 transition-colors" title="Reject">
                              <XCircle size={18}/>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskVerification;
