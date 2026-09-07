import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Power, X, Eye, MapPin, GraduationCap, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    dob: '', 
    education: '',
    experience: '',
    place: '',
    pincode: ''
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch employees');
      }
    } catch (error) {
      toast.error('Network error fetching employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/employees/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setEmployees(employees.filter(emp => emp._id !== id));
          toast.success('Employee deleted successfully!');
        } else {
          toast.error(data.message || 'Failed to delete employee');
        }
      } catch (error) {
        toast.error('Error deleting employee');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/employees/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEmployees(employees.map(emp => {
          if (emp._id === id) {
            const newStatus = !emp.isActive;
            toast.info(`Status changed to ${newStatus ? 'Active' : 'Inactive'}`);
            return { ...emp, isActive: newStatus };
          }
          return emp;
        }));
      } else {
        toast.error(data.message || 'Failed to change status');
      }
    } catch (error) {
      toast.error('Error changing status');
    }
  };

  const handleEditClick = (emp) => {
    setFormData({ 
      name: emp.name || '', 
      email: emp.email || '', 
      phone: emp.phone || '', 
      dob: emp.dob || '',
      education: emp.education || '',
      experience: emp.experience || '',
      place: emp.place || '',
      pincode: emp.pincode || ''
    });
    setEditingId(emp._id);
    setIsModalOpen(true);
  };

  const handleViewClick = (emp) => {
    setViewingEmployee(emp);
    setIsViewModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone are required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/employees/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Employee updated successfully!');
        fetchEmployees(); // Refresh list
        setIsModalOpen(false);
      } else {
        toast.error(data.message || 'Failed to update employee');
      }
    } catch (error) {
      toast.error('Error updating employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Action Bar (Add button removed per user request) */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h1 className="text-lg font-bold text-gray-800">BA/Employee Management</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Total: {employees.length}</span>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="py-4 px-6 text-sm font-bold text-gray-800 whitespace-nowrap">Name</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-800 whitespace-nowrap">Email</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-800 whitespace-nowrap">Phone</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-800 whitespace-nowrap">Location</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-800 whitespace-nowrap">Status</th>
                <th className="py-4 px-6 text-sm font-bold text-gray-800 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto text-orange-500 mb-2" size={24} />
                    Loading employees...
                  </td>
                </tr>
              ) : employees.map((emp) => (
                <tr key={emp._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-800 whitespace-nowrap flex items-center gap-3">
                    {emp.photo ? (
                      <img src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/${emp.photo}`} alt={emp.name} className="w-8 h-8 rounded-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {emp.name ? emp.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    {emp.name || 'Unnamed BA'}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">{emp.email || 'N/A'}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{emp.phone}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {emp.place ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(emp.place + ' ' + (emp.pincode || ''))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-blue-500 hover:text-blue-700 font-medium text-sm transition-colors"
                        title={emp.place}
                      >
                        <MapPin size={14} className="shrink-0" />
                        <span className="max-w-[150px] truncate">{emp.place}</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No location</span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-medium whitespace-nowrap">
                    <span className={emp.isActive !== false ? 'text-green-600' : 'text-red-500'}>
                      {emp.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => handleViewClick(emp)}
                        className="text-blue-500 hover:text-blue-600 transition-colors" 
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(emp._id)}
                        className={`${emp.isActive !== false ? 'text-green-600 hover:text-green-700' : 'text-red-500 hover:text-red-600'} transition-colors`} 
                        title="Toggle Status"
                      >
                        <Power size={18} />
                      </button>
                      <button 
                        onClick={() => handleEditClick(emp)}
                        className="text-gray-400 hover:text-gray-800 transition-colors" 
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(emp._id)} 
                        className="text-orange-500 hover:text-orange-600 transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {!loading && employees.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && employees.length > 0 && (
          <div className="border-t border-gray-100 p-6 flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-gray-500 font-medium">
              Showing 1 to {employees.length} of {employees.length} Entries
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

      {/* Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Edit Employee (BA)</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter mobile number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input 
                    type="date" 
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                  <input 
                    type="text" 
                    value={formData.education}
                    onChange={(e) => setFormData({...formData, education: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. B.Tech, MBA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <input 
                    type="text" 
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. 2 Years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place / Address</label>
                  <input 
                    type="text" 
                    value={formData.place}
                    onChange={(e) => setFormData({...formData, place: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
                  <input 
                    type="text" 
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter pincode"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Modal with Google Maps */}
      {isViewModalOpen && viewingEmployee && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-800">BA Profile Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-8">
              
              {/* Left Column: Details */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                  {viewingEmployee.photo ? (
                    <img src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/${viewingEmployee.photo}`} alt={viewingEmployee.name} className="w-20 h-20 rounded-full object-cover shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-3xl shadow-sm shrink-0">
                      {viewingEmployee.name ? viewingEmployee.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{viewingEmployee.name || 'Unnamed BA'}</h3>
                    <p className="text-gray-500 font-medium">{viewingEmployee.email || 'No email'}</p>
                    <span className={`inline-block mt-2 px-2.5 py-1 text-xs font-bold rounded-md ${viewingEmployee.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {viewingEmployee.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mobile Number</p>
                    <p className="font-semibold text-gray-800">{viewingEmployee.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                    <p className="font-semibold text-gray-800">{viewingEmployee.dob || 'N/A'}</p>
                  </div>
                  <div className="col-span-2 mt-2">
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-2"><GraduationCap size={16}/> Education & Experience</p>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Education</p>
                        <p className="font-semibold text-gray-800">{viewingEmployee.education || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Experience</p>
                        <p className="font-semibold text-gray-800">{viewingEmployee.experience || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-2"><MapPin size={16}/> Location Details</p>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-orange-900 text-sm leading-relaxed">
                    {viewingEmployee.place || viewingEmployee.pincode ? (
                      <>
                        {viewingEmployee.place} <br/>
                        <span className="font-semibold">Pin: {viewingEmployee.pincode}</span>
                      </>
                    ) : (
                      "No location provided."
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Google Maps */}
              <div className="flex-1 min-h-[300px] flex flex-col bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                <div className="p-3 bg-gray-100 border-b border-gray-200 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin size={16} className="text-orange-500"/> Location Map
                </div>
                <div className="flex-1 w-full h-full relative">
                  {viewingEmployee.place || viewingEmployee.pincode ? (
                    <iframe
                      title="Employee Location"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        (viewingEmployee.place || '') + ' ' + (viewingEmployee.pincode || '')
                      )}&output=embed`}
                    ></iframe>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 p-6 text-center">
                      <p>Location cannot be displayed because the place/pincode is not provided.</p>
                    </div>
                  )}
                </div>
              </div>
              
            </div>
            
            <div className="p-5 border-t border-gray-100 shrink-0 flex justify-end">
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Employees;
