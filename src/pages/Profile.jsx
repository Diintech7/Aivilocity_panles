import React, { useState, useEffect } from 'react';
import { KeyRound, User, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Password form state
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProfileData(data.data);
      } else {
        toast.error(data.message || 'Failed to load profile');
      }
    } catch (error) {
      toast.error('Network error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!passwords.newPassword || !passwords.confirmPassword) {
      toast.error('Please fill all required fields');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setPasswordUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: passwords.newPassword })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Password updated successfully');
        setPasswords({ newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Failed to update password');
      }
    } catch (error) {
      toast.error('Network error updating password');
    } finally {
      setPasswordUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  if (!profileData) {
    return <div className="text-center text-gray-500 mt-10">Profile data not found</div>;
  }

  const isSuperAdmin = profileData.role === 'superadmin';
  const avatarText = profileData.name ? profileData.name.charAt(0).toUpperCase() : (isSuperAdmin ? 'SA' : 'A');
  const userSubtitle = isSuperAdmin ? 'Super Administrator' : 'Administrator';

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      
      {/* Top Profile Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex items-center gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-[#ff5a1f] flex items-center justify-center text-white text-4xl font-semibold shrink-0 shadow-md uppercase">
          {avatarText}
        </div>
        
        {/* Info */}
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-2xl font-bold text-[#111111]">{profileData.name}</h2>
          <p className="text-gray-500 font-medium mb-1">{userSubtitle}</p>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${profileData.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {profileData.isActive !== false ? 'Active Account' : 'Inactive Account'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'personal' 
              ? 'border-[#ff5a1f] text-[#ff5a1f]' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <User size={18} />
          Personal Information
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'password' 
              ? 'border-[#ff5a1f] text-[#ff5a1f]' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <KeyRound size={18} />
          Change Password
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 min-h-[300px]">
        {activeTab === 'personal' ? (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-[#111111] mb-4">Personal Information</h3>
            <hr className="border-gray-200 mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div>
                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                <p className="font-semibold text-gray-800">{profileData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                <p className="font-semibold text-gray-800">{profileData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                <p className="font-semibold text-gray-800">{profileData.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Role</p>
                <p className="font-semibold text-gray-800 capitalize">{profileData.role}</p>
              </div>

              {/* Client Specific Fields */}
              {profileData.role === 'client' && (
                <>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Client Type</p>
                    <p className="font-semibold text-gray-800">{profileData.clientType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Wallet Balance</p>
                    <p className="font-semibold text-gray-800">₹{profileData.wallet || 0}</p>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="font-semibold text-gray-800">{profileData.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Aadhar Card</p>
                    {profileData.aadharCard ? (
                       <a href={profileData.aadharCard} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">View Document</a>
                    ) : (
                       <p className="font-semibold text-gray-800">Not Uploaded</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Other Document</p>
                    {profileData.otherDocument ? (
                       <a href={profileData.otherDocument} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">View Document</a>
                    ) : (
                       <p className="font-semibold text-gray-800">Not Uploaded</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-[#111111] mb-4">Change Password</h3>
            <hr className="border-gray-200 mb-6" />
            
            <form className="max-w-md flex flex-col gap-5" onSubmit={handlePasswordUpdate}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter new password (min 6 chars)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={passwordUpdating}
                className={`mt-2 bg-[#ff5a1f] hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors self-start flex items-center gap-2 ${passwordUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {passwordUpdating && <Loader2 size={16} className="animate-spin" />}
                {passwordUpdating ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;
