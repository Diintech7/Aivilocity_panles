import React, { useState } from 'react';
import { 
  ArrowDownToLine, CheckCircle2, XCircle, Clock, 
  Search, FileText, Eye, CreditCard
} from 'lucide-react';
import { toast } from 'react-toastify';

// Mock Data
const initialWithdrawals = [
  {
    id: 'W-1001',
    employee: 'Vivek Kumar',
    email: 'vivek@example.com',
    amount: 1500,
    method: 'UPI',
    details: 'vivek@ybl',
    status: 'Pending',
    requestedAt: '2025-10-25 10:30 AM',
  },
  {
    id: 'W-1002',
    employee: 'Rohit Sharma',
    email: 'rohit@example.com',
    amount: 3200,
    method: 'Bank Transfer',
    details: 'Acc: 1234567890, IFSC: SBIN0001234',
    status: 'Pending',
    requestedAt: '2025-10-24 02:15 PM',
  },
  {
    id: 'W-1003',
    employee: 'Anjali Singh',
    email: 'anjali@example.com',
    amount: 800,
    method: 'UPI',
    details: 'anjali@okicici',
    status: 'Approved',
    requestedAt: '2025-10-20 09:00 AM',
  },
  {
    id: 'W-1004',
    employee: 'Sandeep Yadav',
    email: 'sandeep@example.com',
    amount: 5000,
    method: 'Bank Transfer',
    details: 'Acc: 0987654321, IFSC: HDFC0001234',
    status: 'Rejected',
    requestedAt: '2025-10-18 11:45 AM',
    rejectionReason: 'Invalid bank details provided.'
  }
];

const STATUS_TABS = ['Pending', 'Approved', 'Rejected', 'All Requests'];

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [activeTab, setActiveTab] = useState('Pending');
  const [search, setSearch] = useState('');

  const handleApprove = (id) => {
    if(window.confirm('Mark this withdrawal as Approved & Paid?')) {
      setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'Approved' } : w));
      toast.success('Withdrawal Approved!');
    }
  };

  const handleReject = (id) => {
    const reason = window.prompt('Enter reason for rejection:');
    if (reason !== null) {
      if (!reason.trim()) {
        toast.error('Rejection reason is required.');
        return;
      }
      setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'Rejected', rejectionReason: reason } : w));
      toast.error('Withdrawal Rejected!');
    }
  };

  const filteredByTab = activeTab === 'All Requests' 
    ? withdrawals 
    : withdrawals.filter(w => w.status === activeTab);

  const filtered = filteredByTab.filter(w => 
    w.employee.toLowerCase().includes(search.toLowerCase()) ||
    w.id.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    'Pending': withdrawals.filter(w => w.status === 'Pending').length,
    'Approved': withdrawals.filter(w => w.status === 'Approved').length,
    'Rejected': withdrawals.filter(w => w.status === 'Rejected').length,
    'All Requests': withdrawals.length,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ArrowDownToLine size={26} className="text-orange-500"/> Withdrawal Requests
        </h1>
        <p className="text-gray-500 text-sm mt-1">Review and process employee wallet withdrawals.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Clock size={22} className="text-yellow-600"/>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-yellow-700">{counts.Pending}</p>
            <p className="text-sm text-yellow-600 font-medium">Pending Approvals</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={22} className="text-green-600"/>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-green-700">{counts.Approved}</p>
            <p className="text-sm text-green-600 font-medium">Processed Requests</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <XCircle size={22} className="text-red-500"/>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-red-600">{counts.Rejected}</p>
            <p className="text-sm text-red-500 font-medium">Rejected Requests</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === tab
                ? 'border-[#ff5a1f] text-[#ff5a1f]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab}
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === tab ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
            }`}>{counts[tab]}</span>
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
          placeholder="Search by Employee Name or Request ID..."
          className="w-full sm:w-96 border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3 text-gray-400">
          <FileText size={48} className="opacity-30"/>
          <p className="font-medium">No withdrawal requests found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Request ID</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Employee</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Amount</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Payment Details</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(req => (
                  <tr key={req.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">{req.id}</td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{req.employee}</p>
                        <p className="text-xs text-gray-500">{req.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-extrabold text-orange-600">₹{req.amount.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                          <CreditCard size={12} className="text-blue-500"/> {req.method}
                        </span>
                        <span className="text-xs text-gray-500">{req.details}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleApprove(req.id)}
                            className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                            Approve
                          </button>
                          <button onClick={() => handleReject(req.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdrawals;
