import React, { useEffect, useState } from 'react';
import {
  BarChart2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DogIcon,
  LogOut,
  Menu,
  User,
  Users,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

const Sidebar = ({ activeSection, setActiveSection, isCollapsed, setIsCollapsed }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const { logout, user } = useApp();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const shouldCollapse = width < 768;
      setIsCollapsed(shouldCollapse);
      setIsMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const menuItems = [
    { icon: User, label: 'Profile', key: 'profile' },
    { icon: Calendar, label: 'Appointments', key: 'appointments' },
    { icon: BarChart2, label: 'Stats', key: 'stats' },
    { icon: Users, label: 'Clients', key: 'clients' },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed z-30 p-2 text-white transition-all duration-300 rounded-full shadow-lg bg-gradient-to-r from-yellow-500 to-pink-500 md:hidden top-4 left-4 hover:from-yellow-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-20 transition-opacity duration-300 bg-black/60 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white shadow-xl transition-width duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-4 bg-gradient-to-r from-yellow-500 to-pink-500">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm">
              <DogIcon className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <h1 className="ml-3 text-xl font-bold tracking-tight text-white">PawFrindu</h1>
            )}
          </div>
          {!isMobileOpen && (
            <button
              onClick={toggleSidebar}
              className="hidden p-1.5 text-white rounded-full shadow-md md:flex bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        {/* Profile */}
        <div
          className={`p-4 border-b border-gray-100 ${isCollapsed ? 'text-center' : 'flex items-center space-x-3'}`}
        >
          <div className={`relative ${isCollapsed ? 'mx-auto' : ''}`}>
            {profileImageError || !user?.image ? (
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-100 to-pink-100 ring-2 ring-pink-200">
                <User size={20} className="text-pink-500" />
              </div>
            ) : (
              <img
                src={user.image}
                alt={user.fullName || 'Trainer'}
                className="object-fill w-20 h-10 rounded-full ring-2 ring-pink-200"
                onError={() => setProfileImageError(true)}
              />
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <span className="block text-sm font-semibold text-gray-800 truncate">
                {user?.fullName || 'Trainer Name'}
              </span>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 truncate">
                  {user?.email || 'trainer@pawfrindu.com'}
                </span>
                <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                  Trainer
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 mb-2">
              <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Dashboard</p>
            </div>
          )}
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveSection(item.key);
                setIsMobileOpen(false);
              }}
              className={`flex items-center w-full p-3 rounded-lg transition-colors duration-300 ${
                activeSection === item.key
                  ? 'bg-gradient-to-r from-yellow-500 to-pink-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 hover:text-pink-600'
              } focus:outline-none focus:ring-2 focus:ring-yellow-400`}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon
                className={`w-5 h-5 ${!isCollapsed && 'mr-3'} ${
                  activeSection === item.key ? 'text-white' : 'text-gray-500'
                }`}
              />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
              {!isCollapsed && activeSection === item.key && (
                <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-white bg-opacity-20 rounded-full">
                  Active
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 mt-auto border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full p-3 text-gray-700 transition-colors duration-300 rounded-lg hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className={`w-5 h-5 ${!isCollapsed && 'mr-3'}`} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
          {!isCollapsed && (
            <div className="mt-4 text-xs text-center text-gray-500">
              <span>PawFrindu Trainers </span>

            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;