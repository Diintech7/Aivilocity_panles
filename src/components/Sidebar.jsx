import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Briefcase, 
  UserCircle, 
  GraduationCap, 
  Award, 
  Megaphone, 
  CheckSquare, 
  CheckCircle, 
  Wallet, 
  ArrowDownToLine, 
  CreditCard, 
  FileText, 
  Bell, 
  Activity, 
  Settings, 
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar, isDesktopCollapsed }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Admin Management', path: '/admin-management', icon: <Users size={20} /> },
    { name: 'Clients', path: '/clients', icon: <Briefcase size={20} /> },
    { name: 'Employees', path: '/employees', icon: <UserCircle size={20} /> },
    { name: 'Trainings', path: '/trainings', icon: <GraduationCap size={20} /> },
    { name: 'Campaigns', path: '/campaigns', icon: <Megaphone size={20} /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare size={20} /> },
    { name: 'Task Verification', path: '/task-verification', icon: <CheckCircle size={20} /> },
    { name: 'Withdrawals', path: '/withdrawals', icon: <ArrowDownToLine size={20} /> },
    { name: 'Payments', path: '/payments', icon: <CreditCard size={20} /> },
    { name: 'Notifications', path: '/notifications', icon: <Bell size={20} /> },
    { name: 'Profile', path: '/profile', icon: <UserCircle size={20} /> },
    { name: 'Reports', path: '/reports', icon: <FileText size={20} /> },
  ];

  const userRole = localStorage.getItem('userRole') || 'admin';

  let visibleMenuItems = menuItems;
  if (userRole === 'superadmin') {
    visibleMenuItems = menuItems.filter(item => 
      item.name === 'Dashboard' || 
      item.name === 'Admin Management' || 
      item.name === 'Profile'
    );
  } else if (userRole === 'client') {
    // Client sees specific pages
    const clientPages = ['Dashboard', 'Profile', 'Trainings', 'Campaigns', 'Tasks', 'Task Verification', 'Notifications'];
    visibleMenuItems = menuItems.filter(item => clientPages.includes(item.name));
  } else {
    // Admin sees everything except Admin Management and Client specific pages
    const hiddenForAdmin = ['Admin Management', 'Trainings', 'Campaigns', 'Tasks', 'Task Verification'];
    visibleMenuItems = menuItems.filter(item => !hiddenForAdmin.includes(item.name));
  }

  const handleLogout = () => {
    // In a real app, clear tokens here
    navigate('/login');
  };

  return (
    <div className={`${isDesktopCollapsed ? 'lg:w-20' : 'w-64'} bg-[#111111] text-gray-300 flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className={`p-6 flex items-center ${isDesktopCollapsed ? 'justify-center' : 'justify-between'} shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!isDesktopCollapsed && (
            <div>
              <h1 className="text-white font-bold text-lg whitespace-nowrap">
                {userRole === 'superadmin' ? 'SUPER ADMIN' : 'ADMIN'}
              </h1>
            </div>
          )}
        </div>
        {/* Close Button on Mobile */}
        <button onClick={closeSidebar} className="lg:hidden text-gray-400 hover:text-white p-1">
          <X size={24} />
        </button>
      </div>
      
      <nav className="flex-1 px-4 pb-4 overflow-y-auto">
        <ul className="space-y-1 text-sm font-medium">
          {visibleMenuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={closeSidebar} // Close sidebar on mobile when navigating
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-orange-600 text-white' 
                      : 'hover:bg-gray-800 hover:text-white'
                  } ${isDesktopCollapsed ? 'justify-center' : ''}`
                }
                title={isDesktopCollapsed ? item.name : ""}
              >
                {item.icon}
                {!isDesktopCollapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800 shrink-0">
        <button 
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 text-orange-500 hover:text-orange-400 w-full rounded-md transition-colors font-medium text-sm ${isDesktopCollapsed ? 'justify-center' : ''}`}
          title={isDesktopCollapsed ? 'Logout' : ''}
        >
          <LogOut size={20} />
          {!isDesktopCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
