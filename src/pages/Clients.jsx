import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Power, X, Loader2, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialForm = { name: '', email: '', phone: '', password: '', clientType: 'Enterprise', address: '', wallet: 0 };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setClients(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch clients');
      }
    } catch (error) {
      toast.error('Network error fetching clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clients/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setClients(clients.filter(client => client._id !== id));
          toast.success('Client deleted successfully!');
        } else {
          toast.error(data.message || 'Failed to delete client');
        }
      } catch (error) {
        toast.error('Error deleting client');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clients/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setClients(clients.map(client => {
          if (client._id === id) {
            const newStatus = !client.isActive;
            toast.info(`Status changed to ${newStatus ? 'Active' : 'Inactive'}`);
            return { ...client, isActive: newStatus };
          }
          return client;
        }));
      } else {
        toast.error(data.message || 'Failed to change status');
      }
    } catch (error) {
      toast.error('Error changing status');
    }
  };

  const handleEditClick = (client) => {
    setFormData({ 
      name: client.name, 
      email: client.email, 
      phone: client.phone || '', 
      clientType: client.clientType || 'Enterprise',
      address: client.address || '',
      wallet: client.wallet || 0,
      password: ''
    });
    setFormErrors({});
    setEditingId(client._id);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setFormData(initialForm);
    setFormErrors({});
    setEditingId(null);
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone must be exactly 10 digits';
    }
    
    if (!editingId && !formData.password) {
      errors.password = 'Password is required for new clients';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${import.meta.env.VITE_API_BASE_URL}/clients`;
      let method = 'POST';

      if (editingId) {
        url = `${import.meta.env.VITE_API_BASE_URL}/clients/${editingId}`;
        method = 'PUT';
      }

      const payload = { ...formData };
      if (editingId && !payload.password) {
        delete payload.password; // Don't send empty password on edit
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.success) {
        toast.success(editingId ? 'Client updated successfully!' : 'Client added successfully!');
        fetchClients(); 
        setIsModalOpen(false);
      } else {
        toast.error(data.message || 'Failed to save client');
      }
    } catch (error) {
      toast.error('Error saving client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Client Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total Clients: {clients.length}</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-[#ff5a1f] hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Plus size={18} />
          Add Client
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 text-sm font-bold text-gray-800 whitespace-nowrap">Name</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-800 whitespace-nowrap">Email</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-800 whitespace-nowrap">Phone</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-800 whitespace-nowrap">Client Type</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-800 whitespace-nowrap">Wallet</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-800 whitespace-nowrap">Status</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-800 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto text-orange-500 mb-2" size={24} />
                    Loading clients...
                  </td>
                </tr>
              ) : clients.map((client) => (
                <tr key={client._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-800 whitespace-nowrap">{client.name}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{client.email}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{client.phone || 'N/A'}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{client.clientType || 'N/A'}</td>
                  <td className="py-4 px-6 whitespace-nowrap font-medium text-green-700">₹{client.wallet || 0}</td>
                  <td className="py-4 px-6 font-medium whitespace-nowrap">
                    <span className={client.isActive !== false ? 'text-green-600' : 'text-red-500'}>
                      {client.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clients/${client._id}/impersonate`, {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            });
                            const data = await response.json();
                            
                            if (data.success) {
                              localStorage.setItem('adminToken', token); // Save admin token just in case
                              localStorage.setItem('token', data.data.token);
                              localStorage.setItem('userRole', 'client');
                              
                              toast.success(`Logged in as Client: ${client.name}`);
                              window.location.href = '/'; 
                            } else {
                              toast.error(data.message || 'Failed to impersonate client');
                            }
                          } catch (error) {
                            toast.error('Network error during login');
                          }
                        }}
                        className="text-blue-500 hover:text-blue-600 transition-colors" 
                        title="Login As Client"
                      >
                        <LogIn size={18} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(client._id)}
                        className={`${client.isActive !== false ? 'text-green-600 hover:text-green-700' : 'text-red-500 hover:text-red-600'} transition-colors`} 
                        title="Toggle Status"
                      >
                        <Power size={18} />
                      </button>
                      <button 
                        onClick={() => handleEditClick(client)}
                        className="text-gray-400 hover:text-gray-800 transition-colors" 
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(client._id)} 
                        className="text-orange-500 hover:text-orange-600 transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {!loading && clients.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && clients.length > 0 && (
          <div className="border-t border-gray-100 p-6 flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-gray-500 font-medium">
              Showing 1 to {clients.length} of {clients.length} Entries
            </p>
            
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors">
                &lt;
              </button>
              
              <button className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-orange-500 text-orange-500">
                1
              </button>
              
              <button className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors">
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Client' : 'Add New Client'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name / Contact Person *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="Enter full name"
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="Enter email"
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                  maxLength="10"
                  className={`w-full border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="10 digit phone number"
                />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Type</label>
                <select 
                  value={formData.clientType}
                  onChange={(e) => setFormData({...formData, clientType: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Enterprise">Enterprise</option>
                  <option value="Startup">Startup</option>
                  <option value="SME">SME</option>
                  <option value="Govt.">Govt.</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Balance (₹)</label>
                <input 
                  type="number" 
                  value={formData.wallet}
                  onChange={(e) => setFormData({...formData, wallet: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password {editingId ? '' : '*'}</label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  autoComplete="new-password"
                  className={`w-full border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder={editingId ? "Leave blank to keep current password" : "Enter password (min 6 chars)"}
                />
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Enter full address"
                ></textarea>
              </div>
              
              <div className="md:col-span-2 mt-2 flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-4 py-2 bg-[#ff5a1f] hover:bg-orange-600 rounded-lg text-sm font-medium text-white transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? 'Save Changes' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Clients;
