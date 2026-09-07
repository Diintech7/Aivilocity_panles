import React, { useState } from 'react';
import { 
  FileText, Download, TrendingUp, Users, 
  CheckCircle, Briefcase, IndianRupee, Calendar
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { toast } from 'react-toastify';

// --- Mock Data ---
const revenueData = [
  { name: 'Jan', revenue: 45000, payouts: 12000 },
  { name: 'Feb', revenue: 52000, payouts: 18000 },
  { name: 'Mar', revenue: 48000, payouts: 15000 },
  { name: 'Apr', revenue: 61000, payouts: 22000 },
  { name: 'May', revenue: 59000, payouts: 25000 },
  { name: 'Jun', revenue: 72000, payouts: 30000 },
];

const taskStatusData = [
  { name: 'Approved', value: 45 },
  { name: 'Pending', value: 25 },
  { name: 'Rejected', value: 10 },
  { name: 'In Progress', value: 20 },
];

const campaignPerformance = [
  { name: 'Diwali Sale', tasks: 120, completion: 85 },
  { name: 'Referral Drive', tasks: 80, completion: 60 },
  { name: 'Social Blitz', tasks: 50, completion: 40 },
  { name: 'New Year', tasks: 90, completion: 75 },
];

const PIE_COLORS = ['#22c55e', '#eab308', '#ef4444', '#a855f7'];

const Reports = () => {
  const [timeRange, setTimeRange] = useState('6M');

  const handleDownload = () => {
    toast.success('Downloading Comprehensive Report (CSV)...');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={26} className="text-orange-500"/> Analytical Reports
          </h1>
          <p className="text-gray-500 text-sm mt-1">Platform performance, financial overview, and task metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={e => setTimeRange(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="1M">Last 1 Month</option>
            <option value="3M">Last 3 Months</option>
            <option value="6M">Last 6 Months</option>
            <option value="1Y">Last 1 Year</option>
          </select>
          <button 
            onClick={handleDownload}
            className="bg-[#ff5a1f] hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <IndianRupee size={20} className="text-green-600"/>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
              <TrendingUp size={12}/> +14.5%
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Total Revenue</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">₹3,37,000</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <IndianRupee size={20} className="text-orange-600"/>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
              <TrendingUp size={12}/> +8.2%
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Total Payouts</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">₹1,22,000</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Briefcase size={20} className="text-blue-600"/>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Active Campaigns</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">24</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-purple-600"/>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
              <TrendingUp size={12}/> +22%
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Tasks Completed</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">1,432</h3>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue vs Payouts Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Financial Overview</h3>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <Calendar size={14}/> Last 6 Months
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="payouts" name="Employee Payouts" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorPay)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Task Verification Status</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value}%`, 'Tasks']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-3xl font-extrabold text-gray-900">100%</span>
              <span className="text-xs text-gray-500 font-medium">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-3 mt-4">
            {taskStatusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }}></div>
                <span className="text-xs font-bold text-gray-600">{entry.name} ({entry.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Charts Row 2 */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-6">Top Campaigns Performance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={campaignPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              <Bar dataKey="tasks" name="Total Tasks Created" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="completion" name="Tasks Completed" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
};

export default Reports;
