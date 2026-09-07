import React, { useState, useEffect } from 'react';
import { 
  Bell, Send, Trash2, Search, 
  Info, CheckCircle, X, Mail, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

const SendNotificationModal = ({ onClose, onSend }) => {
  const [form, setForm] = useState({
    title: '',
    message: '',
    targetRole: 'all'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      toast.error('Title and message are required!');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Notification sent successfully!');
        onSend(data.data);
        onClose();
      } else {
        toast.error(data.message || 'Failed to send notification');
      }
    } catch (error) {
      toast.error('Network error. Failed to send notification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Send size={18} className="text-orange-600"/>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Send Notification</h2>
              <p className="text-xs text-gray-500">Broadcast a message to users</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors">
            <X size={18}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Notification Title *</label>
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g. System Update" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Message Content *</label>
            <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              placeholder="Type your announcement or alert here..." />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Target Audience *</label>
            <select value={form.targetRole} onChange={e => setForm({...form, targetRole: e.target.value})}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
              <option value="all">Everyone (All Clients & BAs)</option>
              <option value="client">My Clients Only</option>
              <option value="bd">All BAs (Employees)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-5 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2.5 bg-[#ff5a1f] hover:bg-orange-600 rounded-xl text-sm font-bold text-white transition-colors shadow-sm shadow-orange-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>} 
              {isSubmitting ? 'Sending...' : 'Send Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const userRole = localStorage.getItem('userRole') || 'admin';
  const canSend = ['admin', 'superadmin'].includes(userRole);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      toast.error('Network error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm('Delete this notification permanently?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setNotifications(prev => prev.filter(n => n._id !== id));
          toast.success('Notification deleted');
        } else {
          toast.error(data.message || 'Failed to delete');
        }
      } catch (error) {
        toast.error('Network error');
      }
    }
  };

  const filtered = notifications.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.message.toLowerCase().includes(search.toLowerCase())
  );

  const formatAudience = (role) => {
    switch(role) {
      case 'all': return 'All Users';
      case 'admin': return 'Admins';
      case 'client': return 'Clients';
      case 'bd': return 'BAs (Employees)';
      default: return role;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell size={26} className="text-orange-500"/> Notifications Hub
          </h1>
          <p className="text-gray-500 text-sm mt-1">Send and manage system announcements for all users.</p>
        </div>
        {canSend && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#ff5a1f] hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Send size={18} /> Send Notification
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input 
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
          <Mail size={16} className="text-orange-500"/> Announcement History
        </h3>
        
        {loading ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Loader2 className="animate-spin mx-auto text-orange-500 mb-2" size={32} />
            <p className="text-gray-500 font-medium">Loading notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-gray-300"/>
            </div>
            <p className="text-gray-500 font-bold">No notifications found.</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search or send a new notification.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map(notif => (
              <div key={notif._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow relative group">
                {/* Icon */}
                <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-blue-50 border border-blue-200">
                  <Info size={20} className="text-blue-500"/>
                </div>
                
                {/* Content */}
                <div className="flex-1 pr-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{notif.title}</h4>
                    <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    <span className="text-xs font-bold text-gray-400 whitespace-nowrap flex items-center gap-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed max-w-4xl">{notif.message}</p>
                  
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                      Target Audience: {formatAudience(notif.targetRole)}
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
                      Sent by: {notif.senderRole}
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                {canSend && (
                  <div className="absolute top-4 right-4 sm:static sm:flex items-start shrink-0">
                    <button onClick={() => handleDelete(notif._id)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Delete from history">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <SendNotificationModal 
          onClose={() => setShowModal(false)}
          onSend={(newNotif) => setNotifications([newNotif, ...notifications])}
        />
      )}
    </div>
  );
};

export default Notifications;
