import React, { useState } from 'react';
import { 
  Users, UserCheck, UserMinus, ShieldCheck, 
  Briefcase, GraduationCap, Award, Megaphone, 
  PlayCircle, CheckCircle2, AlertCircle, XCircle,
  Wallet, ArrowDownToLine, CreditCard, Download,
  ChevronDown, Calendar, Search, ArrowRight, Lock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// Dummy data for charts
const analyticsData = [
  { name: '01 May', value: 50 },
  { name: '06 May', value: 120 },
  { name: '11 May', value: 80 },
  { name: '16 May', value: 180 },
  { name: '21 May', value: 90 },
  { name: '31 May', value: 160 },
];

const campaignData = [
  { name: 'Running', value: 28, color: '#f97316' },
  { name: 'Completed', value: 118, color: '#22c55e' },
  { name: 'Draft', value: 5, color: '#3b82f6' },
  { name: 'Cancelled', value: 5, color: '#ef4444' },
];

const taskData = [
  { name: 'Pending', value: 356, color: '#f97316' },
  { name: 'Approved', value: 8650, color: '#22c55e' },
  { name: 'Rejected', value: 240, color: '#ef4444' },
];

const statCards = [
  { title: 'Total Admin', value: '18', icon: <ShieldCheck size={24} className="text-orange-500" /> },
  { title: 'Total Clients', value: '320', icon: <Briefcase size={24} className="text-orange-500" /> },
  { title: 'Total Employees', value: '5,248', icon: <Users size={24} className="text-orange-500" /> },
  { title: 'Active Employees', value: '3,842', icon: <UserCheck size={24} className="text-orange-500" /> },
  { title: 'Total Campaigns', value: '156', icon: <Megaphone size={24} className="text-orange-500" /> },
  
  { title: 'Running Campaigns', value: '28', icon: <PlayCircle size={24} className="text-orange-500" /> },
  { title: 'Completed Campaigns', value: '118', icon: <CheckCircle2 size={24} className="text-orange-500" /> },
  { title: 'Total Trainings', value: '95', icon: <GraduationCap size={24} className="text-orange-500" /> },
  { title: 'Training Completed', value: '4,562', icon: <Award size={24} className="text-orange-500" /> },
  { title: 'Pending Task Verification', value: '356', icon: <AlertCircle size={24} className="text-orange-500" /> },
  
  { title: 'Approved Tasks', value: '8,650', icon: <CheckCircle2 size={24} className="text-orange-500" /> },
  { title: 'Rejected Tasks', value: '240', icon: <XCircle size={24} className="text-orange-500" /> },
  { title: 'Total Wallet Balance', value: '₹ 25,65,430', icon: <Wallet size={24} className="text-orange-500" /> },
  { title: 'Pending Withdrawals', value: '₹ 4,25,430', icon: <ArrowDownToLine size={24} className="text-orange-500" /> },
  { title: 'Total Payments', value: '₹ 21,40,000', icon: <CreditCard size={24} className="text-orange-500" /> },
];

const recentActivities = [
  { id: 1, text: 'Admin Rahul created a new admin account.', time: '2 min ago', icon: <ShieldCheck size={16} /> },
  { id: 2, text: 'New client "ABC Pvt Ltd" registered.', time: '15 min ago', icon: <Briefcase size={16} /> },
  { id: 3, text: 'Employee Vivek Kumar completed training "Sales Process".', time: '30 min ago', icon: <Award size={16} /> },
  { id: 4, text: 'Task #1452 has been approved.', time: '45 min ago', icon: <CheckCircle2 size={16} /> },
  { id: 5, text: 'Withdrawal request of ₹5,000 by Amit is pending.', time: '1 hour ago', icon: <ArrowDownToLine size={16} /> },
];

const topCampaigns = [
  { name: 'Summer Sale Promotion', clients: 25, employees: 450, tasks: 1250, status: 'Running', statusColor: 'text-orange-500 bg-orange-50' },
  { name: 'Product Awareness Drive', clients: 15, employees: 300, tasks: 900, status: 'Running', statusColor: 'text-orange-500 bg-orange-50' },
  { name: 'Brand Survey 2024', clients: 10, employees: 200, tasks: 600, status: 'Completed', statusColor: 'text-green-600 bg-green-50' },
  { name: 'New Product Launch', clients: 12, employees: 220, tasks: 560, status: 'Completed', statusColor: 'text-green-600 bg-green-50' },
  { name: 'Festival Offer Campaign', clients: 18, employees: 350, tasks: 850, status: 'Completed', statusColor: 'text-green-600 bg-green-50' },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Campaigns');

  return (
    <div className="flex flex-col gap-6 w-full overflow-x-hidden p-2 sm:p-4 lg:p-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Dashboard Overview
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Calendar size={16} className="text-gray-400" />
            <span className="hidden sm:inline">01 May - 31 May</span>
            <span className="sm:hidden">May 2024</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          <button className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-[#ff5a1f] hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {statCards.filter(card => {
          const role = localStorage.getItem('userRole');
          if (role === 'client') {
            return !['Total Admin', 'Total Clients', 'Total Employees', 'Active Employees'].includes(card.title);
          }
          if (role === 'admin') {
            return card.title !== 'Total Admin';
          }
          return true;
        }).map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-orange-50 rounded-xl shrink-0">
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider truncate">{card.title}</p>
              <h3 className="text-xl font-extrabold text-gray-900 mt-0.5 truncate">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Analytics Overview Area Chart */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Analytics Overview</h2>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {['Campaigns', 'Tasks', 'Employees', 'Trainings'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex-1 sm:flex-none text-center ${
                  activeTab === tab 
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-200' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="3 3" />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Charts Container */}
        <div className="xl:col-span-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
          
          {/* Campaign Status */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
            <h2 className="text-sm font-bold text-gray-900 mb-2 self-start uppercase tracking-wider">Campaign Status</h2>
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={campaignData} innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none">
                    {campaignData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-gray-900">156</span>
                <span className="text-xs font-bold text-gray-400">Total</span>
              </div>
            </div>
            
            <div className="w-full mt-6 grid grid-cols-2 gap-y-3 gap-x-2">
              {campaignData.map(item => (
                <div key={item.name} className="flex flex-col text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-500 font-bold truncate">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-gray-900 pl-4">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Task Verification Overview */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
            <h2 className="text-sm font-bold text-gray-900 mb-2 self-start uppercase tracking-wider">Task Verification</h2>
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskData} innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none">
                    {taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-gray-900">10k+</span>
                <span className="text-xs font-bold text-gray-400">Total</span>
              </div>
            </div>
            
            <div className="w-full mt-6 grid grid-cols-2 gap-y-3 gap-x-2">
              {taskData.map(item => (
                <div key={item.name} className="flex flex-col text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-500 font-bold truncate">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-gray-900 pl-4">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      {/* Bottom Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activities</h2>
          <div className="space-y-6 flex-1">
            {recentActivities.map(item => (
              <div key={item.id} className="flex gap-4 group">
                <div className="mt-0.5 text-orange-500 bg-orange-50 p-2 rounded-xl shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 leading-snug">{item.text}</p>
                  <p className="text-xs font-bold text-gray-400 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 text-sm text-orange-600 font-bold hover:text-orange-700 bg-orange-50 hover:bg-orange-100 py-2.5 rounded-xl transition-colors text-center w-full">
            View All Activities
          </button>
        </div>

        {/* Top Campaigns Table */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:col-span-2 xl:col-span-1 overflow-hidden">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Top Campaigns</h2>
          <div className="overflow-x-auto flex-1 -mx-6 px-6">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[500px]">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3">Campaign Name</th>
                  <th className="pb-3 text-center">Clients</th>
                  <th className="pb-3 text-center">Employees</th>
                  <th className="pb-3 text-center">Tasks</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {topCampaigns.map((camp, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 pr-4 font-bold text-gray-900">{camp.name}</td>
                    <td className="py-4 px-2 text-center font-medium">{camp.clients}</td>
                    <td className="py-4 px-2 text-center font-medium">{camp.employees}</td>
                    <td className="py-4 px-2 text-center font-medium">{camp.tasks}</td>
                    <td className="py-4 pl-2 text-right">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${camp.statusColor}`}>
                        {camp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-6 text-sm text-orange-600 font-bold hover:text-orange-700 bg-orange-50 hover:bg-orange-100 py-2.5 rounded-xl transition-colors text-center w-full">
            View All Campaigns
          </button>
        </div>

        {/* Wallet & Payment Summary */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:col-span-2 xl:col-span-1">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Wallet & Payments</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Wallet Balance</p>
                <Wallet size={16} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">₹25.6L</h3>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-2xl border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-orange-600 uppercase">Total Payments</p>
                <CreditCard size={16} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-extrabold text-orange-900">₹21.4L</h3>
            </div>
          </div>

          <div className="space-y-1 flex-1 text-sm text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="flex justify-between items-center py-2 border-b border-gray-200/60">
              <span className="font-medium text-gray-600">Pending Withdrawals</span>
              <span className="font-extrabold text-orange-600">₹4.25L</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200/60">
              <span className="font-medium text-gray-600">Total Withdrawals</span>
              <span className="font-extrabold text-gray-900">₹15.2L</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-600">Total Transactions</span>
              <span className="font-extrabold text-gray-900">12,548</span>
            </div>
          </div>
          
          <button className="mt-6 text-sm text-gray-600 font-bold hover:text-gray-900 bg-gray-100 hover:bg-gray-200 py-2.5 rounded-xl transition-colors text-center w-full">
            View Ledger
          </button>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
