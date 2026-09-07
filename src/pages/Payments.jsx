import React, { useState } from 'react';
import { 
  CreditCard, Search, Calendar, Filter, 
  ArrowUpRight, Download, FileText, CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';

// Mock Data for Payments Ledger
const initialPayments = [
  {
    id: 'TXN-982134',
    withdrawalId: 'W-1003',
    employee: 'Anjali Singh',
    amount: 800,
    method: 'UPI',
    paidAt: '2025-10-20 10:15 AM',
    reference: 'UPI/1234567890/okicici',
    status: 'Completed'
  },
  {
    id: 'TXN-982133',
    withdrawalId: 'W-0998',
    employee: 'Vivek Kumar',
    amount: 2500,
    method: 'Bank Transfer',
    paidAt: '2025-10-18 04:30 PM',
    reference: 'NEFT-SBIN0001234-987654321',
    status: 'Completed'
  },
  {
    id: 'TXN-982132',
    withdrawalId: 'W-0995',
    employee: 'Priya Patel',
    amount: 1200,
    method: 'UPI',
    paidAt: '2025-10-15 11:20 AM',
    reference: 'UPI/0987654321/ybl',
    status: 'Completed'
  },
];

const Payments = () => {
  const [payments] = useState(initialPayments);
  const [search, setSearch] = useState('');

  const filtered = payments.filter(p => 
    p.employee.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.withdrawalId.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const handleDownload = () => {
    toast.success('Downloading payments report...');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard size={26} className="text-orange-500"/> Payments Ledger
          </h1>
          <p className="text-gray-500 text-sm mt-1">Record of all completed payouts and transactions.</p>
        </div>
        <button 
          onClick={handleDownload}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Summary Box */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-orange-100 font-medium mb-1">Total Payouts Disbursed</p>
          <h2 className="text-4xl font-extrabold">₹{totalPaid.toLocaleString()}</h2>
        </div>
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <ArrowUpRight size={32} className="text-white"/>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input 
            type="text"
            placeholder="Search by Employee, TXN ID, or Request ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Ledger Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3 text-gray-400">
          <FileText size={48} className="opacity-30"/>
          <p className="font-medium">No payment records found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Transaction ID</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Ref. Request</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Employee</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Amount Paid</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Method & Ref</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide">Date & Time</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wide text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(payment => (
                  <tr key={payment.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">{payment.id}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{payment.withdrawalId}</td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">{payment.employee}</td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-extrabold text-green-600">₹{payment.amount.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-gray-700">{payment.method}</span>
                        <span className="text-xs text-gray-500">{payment.reference}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 flex items-center gap-2">
                      <Calendar size={14}/> {payment.paidAt}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-md">
                        <CheckCircle2 size={14}/> {payment.status}
                      </span>
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

export default Payments;
