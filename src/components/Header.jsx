import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ toggleSidebar, toggleDesktopSidebar }) => {
  const location = useLocation();
  
  // Format pathname into a readable title
  const getTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    
    // Remove leading slash and format (e.g. /admin-management -> Admin Management)
    const formatted = path.substring(1).split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    return formatted;
  };

  const [userProfile, setUserProfile] = React.useState({ name: 'User', role: 'user' });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setUserProfile(data.data);
        }
      } catch (error) {
        console.error('Error fetching profile for header', error);
      }
    };
    fetchProfile();
  }, []);

  const userName = userProfile.name;
  let userSubtitle = 'User';
  if (userProfile.role === 'superadmin') userSubtitle = 'Super Administrator';
  else if (userProfile.role === 'admin') userSubtitle = 'Administrator';
  else if (userProfile.role === 'client') userSubtitle = 'Client';
  
  const avatarName = userName.split(' ').join('+');

  return (
    <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Mobile Toggle */}
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        {/* Desktop Toggle */}
        <button 
          onClick={toggleDesktopSidebar} 
          className="hidden lg:block p-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-lg sm:text-xl font-bold text-gray-800 whitespace-nowrap">{getTitle()}</h1>
      </div>
      
      <div className="flex items-center gap-4 sm:gap-6 ml-auto">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={24} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            3
          </span>
        </button>
        
        <Link to="/profile" className="flex items-center gap-3 border-l pl-4 sm:pl-6 border-gray-200 hover:opacity-80 transition-opacity">
          <img 
            src={`https://ui-avatars.com/api/?name=${avatarName}&background=f97316&color=fff`} 
            alt="User Avatar" 
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full"
          />
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-800 leading-none">{userName}</p>
            <p className="text-xs text-gray-500 mt-1">{userSubtitle}</p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
