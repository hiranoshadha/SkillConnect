import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, BookOpenIcon, ShieldCheckIcon, ChartBarIcon, BellIcon } from '@heroicons/react/outline';
import { useAuth } from '../../hooks/useAuth';

const LeftSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  const navItems = [
    { name: 'Home', path: '/home', icon: HomeIcon },
    { name: 'Learning Plan', path: '/plan', icon: BookOpenIcon },
    // { name: 'Discover', path: '/discover', icon: SparklesIcon },
    { name: 'Progress', path: '/progress', icon: ChartBarIcon },
    { name: 'Notifications', path: '/notifications', icon: BellIcon },
    { name: 'Announcements', path: '/announcements', icon: BellIcon ,}
  ];

  if (currentUser && currentUser.role === 'ADMIN') {
    navItems.push({
      name: 'Admin Dashboard',
      path: '/admin',
      icon: ShieldCheckIcon
    });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 shadow-lg z-10">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/assets/images/logo.svg" alt="SkillShare Logo" className="h-8 w-8" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SkillSync</span>
        </Link>
      </div>
      
      <nav className="flex-1 pt-6 pb-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`
                group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700/50'}
              `}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-600 dark:text-gray-400'}`} />
              {item.name}
              {/* {item.name === 'Notifications' && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</span>
              )} */}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]">
            <span className="mr-2">Log Out</span> 
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;
