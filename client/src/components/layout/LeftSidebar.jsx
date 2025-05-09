import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BellIcon,
  XIcon
} from '@heroicons/react/outline';
import { useAuth } from '../../hooks/useAuth';
import { useContext } from 'react';
import { SidebarContext } from '../../contexts/SidebarContext';

const LeftSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const { showSidebar, toggleSidebar } = useContext(SidebarContext);

  const navItems = [
    { name: 'Home', path: '/home', icon: HomeIcon },
    { name: 'Learning Plan', path: '/plan', icon: BookOpenIcon },
    { name: 'Progress', path: '/progress', icon: ChartBarIcon },
    { name: 'Notifications', path: '/notifications', icon: BellIcon },
    { name: 'Announcements', path: '/announcements', icon: BellIcon },
  ];

  if (currentUser && currentUser.role === 'ADMIN') {
    navItems.push({
      name: 'Admin Dashboard',
      path: '/admin',
      icon: ShieldCheckIcon,
    });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className={`
        ${showSidebar ? 'fixed inset-0 z-50 md:hidden' : 'hidden'}
        md:flex md:flex-col md:w-72
        bg-white/70 dark:bg-slate-900/70
        backdrop-blur-xl shadow-2xl border-r border-blue-100 dark:border-slate-800
        transition-all duration-300
      `}
      style={{ minHeight: '100vh' }}
    >
      {showSidebar && (
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      <div
        className={`
          ${showSidebar ? 'fixed inset-y-0 left-0 w-72 z-50' : ''}
          flex flex-col h-full
          bg-white/80 dark:bg-slate-900/80
          backdrop-blur-xl shadow-2xl
          border-r border-blue-100 dark:border-slate-800
          transition-all duration-300
        `}
      >
        {/* Logo Section */}
        <div className="p-5 border-b border-blue-100 dark:border-slate-800 flex justify-between items-center ">
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse-slow">
              <span className="text-white font-bold text-2xl tracking-wide">S</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold relative">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse-slow">
                  Skill
                </span>
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent animate-pulse-slow ml-1" style={{ animationDelay: '1s' }}>
                  Sync
                </span>
              </span>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 transform translate-y-0.5 rounded-full animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </Link>
          {showSidebar && (
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-full text-blue-500 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-slate-800 transition"
              aria-label="Close sidebar"
            >
              <XIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-8 pb-4 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  group flex items-center px-5 py-3 text-base font-semibold rounded-2xl
                  transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/30 text-blue-700 dark:text-blue-200 shadow-lg'
                    : 'text-blue-900 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-slate-800/60 hover:shadow-md'}
                `}
              >
                <Icon
                  className={`mr-4 h-6 w-6 transition
                    ${isActive
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-blue-300 group-hover:text-blue-500 dark:text-blue-400'}
                  `}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t border-blue-100 dark:border-slate-800 bg-transparent">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-all duration-200"
          >
            <span className="mr-2">Log Out</span>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes gradient {
          0%,100% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LeftSidebar;
