import React, { useState } from 'react';
import {
  CheckSquare, Eye, ChevronLeft, Calendar, Tag,
  Briefcase, AlertCircle, Search, Plus, Trash2, Save, FileText, X
} from 'lucide-react';
import { toast } from 'react-toastify';

const PRIORITY_CONFIG = {
  'High':   { color: 'bg-red-100 text-red-600',    border: 'border-l-red-500' },
  'Medium': { color: 'bg-yellow-100 text-yellow-600', border: 'border-l-yellow-500' },
  'Low':    { color: 'bg-green-100 text-green-600', border: 'border-l-green-500' },
};

const initialTasks = [];

const TaskCard = ({ task, onView, onDelete }) => {
  const priCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['Medium'];

  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all border-l-4 ${priCfg.border} flex flex-col`}>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{task.title}</h3>
        <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>

        <div className="flex flex-col gap-1.5 text-xs text-gray-500 mt-2">
          <span className="flex items-center gap-1.5"><Briefcase size={12} className="text-orange-400"/>{task.campaign}</span>
          <span className="flex items-center gap-1.5"><Calendar size={12} className="text-red-400"/>Deadline: {task.deadline}</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priCfg.color}`}>{task.priority} Priority</span>
          <span className="text-sm font-bold text-orange-600">₹{task.reward.toLocaleString()}</span>
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
        <button onClick={() => onView(task)}
          className="flex items-center gap-1.5 text-blue-500 hover:text-blue-700 text-xs font-medium transition-colors">
          <Eye size={14}/> View Details
        </button>
        <button onClick={() => onDelete(task.id)}
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
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{task.title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{task.campaign}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 max-w-4xl">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Description</p>
          <p className="text-gray-700 leading-relaxed">{task.description}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
          {[
            { label: 'Campaign', value: task.campaign, icon: <Briefcase size={14}/> },
            { label: 'Deadline', value: task.deadline, icon: <Calendar size={14}/> },
            { label: 'Priority', value: task.priority, icon: <AlertCircle size={14}/> },
            { label: 'Reward', value: `₹${task.reward.toLocaleString()}`, icon: <Tag size={14}/> },
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

const CAMPAIGNS_LIST = [
  'Diwali Mega Sale Campaign',
  'New Year Brand Awareness',
  'Referral Bonus Drive',
  'Social Media Blitz Q4',
];

const AddTaskModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    campaign: '',
    priority: 'Medium',
    deadline: '',
    reward: '',
  });

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.campaign || !form.deadline || !form.reward) {
      toast.error('Please fill all required fields');
      return;
    }
    onSave({
      ...form,
      id: Date.now(),
      reward: Number(form.reward),
      createdAt: new Date().toISOString().split('T')[0],
    });
    toast.success('Task created successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Plus size={18} className="text-orange-600"/>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Create New Task</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={22}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh]">
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Title *</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g. Create Instagram Reel"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Describe what needs to be done..."/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Select Campaign * <span className="text-xs text-gray-400 font-normal">(Task is linked to this campaign)</span>
                </label>
                <select value={form.campaign} onChange={e => set('campaign', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                  <option value="">-- Select Campaign --</option>
                  {CAMPAIGNS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline *</label>
                <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reward (₹) *</label>
                <input type="number" value={form.reward} onChange={e => set('reward', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. 1500"/>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                <select value={form.priority} onChange={e => set('priority', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#ff5a1f] hover:bg-orange-600 rounded-xl text-sm font-medium text-white transition-colors shadow-sm">
              <Save size={16}/> Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [viewingTask, setViewingTask] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDelete = (id) => {
    if (window.confirm('Delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Task deleted!');
    }
  };

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.campaign.toLowerCase().includes(search.toLowerCase())
  );

  if (viewingTask) {
    return <TaskDetail task={viewingTask} onBack={() => setViewingTask(null)} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare size={24} className="text-orange-500"/> Task Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Create open tasks for campaigns that employees can claim.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#ff5a1f] hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors self-start"
        >
          <Plus size={18}/> Create Task
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search created tasks or campaigns..."
          className="w-full sm:w-96 border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3 text-gray-400">
          <FileText size={48} className="opacity-30"/>
          <p className="font-medium text-gray-500">No tasks created yet</p>
          <button onClick={() => setShowAddModal(true)} className="text-orange-500 text-sm font-bold mt-2 hover:underline">
            + Create your first task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onView={t => setViewingTask(t)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onSave={(newTask) => setTasks(prev => [newTask, ...prev])}
        />
      )}
    </div>
  );
};

export default Tasks;
