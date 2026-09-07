import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Power, X, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminManagement = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch admins
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAdmins(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch admins');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error while fetching admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleLoginAs = async (admin) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/admins/${admin._id}/impersonate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Save the old superadmin token just in case (optional, but good for tracking)
        localStorage.setItem('superAdminToken', token);
        
        // Overwrite token and role with the new impersonated admin's credentials
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userRole', 'admin');
        
        toast.success(`Logged in as ${admin.name}`);
        window.location.href = '/'; // Hard redirect to force complete state reload
      } else {
        toast.error(data.message || 'Failed to impersonate admin');
      }
    } catch (error) {
      toast.error('Network error during login');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/admins/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setAdmins(admins.filter(admin => admin._id !== id));
          toast.success('Admin deleted successfully!');
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error('Error deleting admin');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/admins/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAdmins(admins.map(admin => {
          if (admin._id === id) {
             const newStatus = !admin.isActive;
             toast.info(`Status changed to ${newStatus ? 'Active' : 'Inactive'}`);
             return { ...admin, isActive: newStatus };
          }
          return admin;
        }));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Error toggling status');
    }
  };

  const handleEditClick = (admin) => {
    setFormData({ name: admin.name, email: admin.email, phone: admin.phone || '', password: '' });
    setFormErrors({});
    setEditingId(admin._id);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setFormData({ name: '', email: '', phone: '', password: '' });
    setFormErrors({});
    setEditingId(null);
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full Name is required';
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone must be exactly 10 digits';
    }
    
    if (!editingId && !formData.password) {
      errors.password = 'Password is required for new admins';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let url = `${import.meta.env.VITE_API_BASE_URL}/auth/register`;
      let method = 'POST';
      let payload = { ...formData, role: 'admin' };

      if (editingId) {
        url = `${import.meta.env.VITE_API_BASE_URL}/auth/admins/${editingId}`;
        method = 'PUT';
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
        toast.success(editingId ? 'Admin updated successfully!' : 'Admin added successfully!');
        fetchAdmins();
        setIsModalOpen(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Error saving admin');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Action Bar */}
      <div className="flex justify-end items-center">
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-[#ff5a1f] hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Plus size={18} />
          Add Admin
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 text-sm font-bold text-gray-800">Name</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-800">Email</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-800">Phone</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-800 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    Loading admins...
                  </td>
                </tr>
              ) : admins.map((admin) => (
                <tr key={admin._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-800">{admin.name}</td>
                  <td className="py-4 px-6">{admin.email}</td>
                  <td className="py-4 px-6">{admin.phone || 'N/A'}</td>
                  <td className="py-4 px-6 font-medium">
                    <span className={admin.isActive ? 'text-green-600' : 'text-red-500'}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => handleLoginAs(admin)}
                        className="text-blue-500 hover:text-blue-600 transition-colors" 
                        title="Login As"
                      >
                        <LogIn size={18} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(admin._id)}
                        className={`${admin.isActive ? 'text-green-600 hover:text-green-700' : 'text-red-500 hover:text-red-600'} transition-colors`} 
                        title="Toggle Status"
                      >
                        <Power size={18} />
                      </button>
                      <button 
                        onClick={() => handleEditClick(admin)}
                        className="text-gray-400 hover:text-gray-800 transition-colors" 
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(admin._id)} 
                        className="text-orange-500 hover:text-orange-600 transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {!loading && admins.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No admins found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-gray-100 p-6 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            Showing 1 to {admins.length} of {Math.max(15, admins.length)} Entries
          </p>
          
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors">
              &lt;
            </button>
            
            {[1].map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                  currentPage === page 
                    ? 'border border-orange-500 text-orange-500' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors">
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Admin' : 'Add New Admin'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="Enter name"
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                  maxLength="10"
                  className={`w-full border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="Enter 10 digit phone number"
                />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder={editingId ? "Leave blank to keep current" : "Enter password (min 6 chars)"}
                />
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
              </div>
              
              <div className="mt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#ff5a1f] hover:bg-orange-600 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  Save Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminManagement;
