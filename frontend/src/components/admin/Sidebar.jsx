import React, { useState, useEffect } from 'react';
import { Users, PawPrint, Heart, LogOut, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useApp } from "../../context/AppContext";

const Sidebar = ({ activeTab, setActiveTab, onCollapsedChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout, user } = useApp();

  // Handle screen resize with debounce
  useEffect(() => {
    let debounceTimer;
    
    const handleResize = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (window.innerWidth < 768) {
          setIsCollapsed(true);
        } else {
          setIsCollapsed(false);
        }
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(debounceTimer);
    };
  }, []);

  // Notify parent component when collapsed state changes
  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(isCollapsed);
    }
  }, [isCollapsed, onCollapsedChange]);

  const handleLogout = () => {
    logout(() => (window.location.href = "/"));
  };

  const menuItems = [
    { icon: Heart, label: "Pets", key: "pets" },
    { icon: Users, label: "Users", key: "users" },
  ];

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button 
        onClick={toggleMobileSidebar}
        className="fixed z-50 p-2 bg-white rounded-lg shadow-md top-4 left-4 md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:ring-opacity-50 transition-all duration-200"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} className="text-gray-700" />
      </button>

      {/* Sidebar Backdrop (Mobile) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-0 h-full z-40
          transition-all duration-300 ease-in-out
          bg-white
          border-r border-gray-100
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          shadow-lg
        `}
        aria-label="Main navigation"
      >
        {/* Sidebar Header */}
        <div className="flex items-center h-16 px-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <PawPrint className="w-7 h-7 text-[#ff2990] animate-bounce-subtle" />
            {!isCollapsed && (
              <span className="text-lg font-bold text-gray-900">
                PawFrindu
              </span>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute hidden w-8 h-8 text-gray-500 bg-white border border-gray-200 rounded-full shadow-md md:flex items-center justify-center -right-4 top-4 hover:bg-gray-50 hover:text-[#ffc929] hover:border-[#ffc929] focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:ring-opacity-50 transition-all duration-200"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* User Profile */}
        <div className="p-3 transition-colors duration-200 border-b border-gray-100 hover:bg-gray-50">
          {isCollapsed ? (
            <div className="w-10 h-10 rounded-full border-2 border-[#ffc929] overflow-hidden mx-auto hover:scale-105 transition-transform duration-200" title={user?.fullName || 'User'}>
              <img
                src={user?.image || "https://via.placeholder.com/40"}
                alt={user?.fullName || "User"}
                className="object-cover w-full h-full"
                onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
              />
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#ffc929] overflow-hidden flex-shrink-0 hover:scale-105 transition-transform duration-200">
                <img
                  src={user?.image || "https://via.placeholder.com/40"}
                  alt={user?.fullName || "User"}
                  className="object-cover w-full h-full"
                  onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || user?.role || 'Admin'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.key);
                if (window.innerWidth < 768) setIsMobileOpen(false);
              }}
              className={`
                w-full flex items-center 
                ${isCollapsed ? 'justify-center p-3' : 'justify-start p-2 pl-3'}
                rounded-lg
                transition-all duration-200
                ${activeTab === item.key
                  ? "bg-[#ffc929] text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-[#ffc929]"
                }
                focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:ring-opacity-50
              `}
              title={isCollapsed ? item.label : ""}
            >
              <item.icon className={`
                w-5 h-5 flex-shrink-0
                ${activeTab === item.key ? "text-white" : "text-gray-500 hover:text-[#ffc929]"}
              `} />
              {!isCollapsed && (
                <span className="ml-3 text-sm font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center 
              ${isCollapsed ? 'justify-center p-3' : 'justify-start p-2 pl-3'}
              rounded-lg
              text-gray-700 hover:bg-gray-50 hover:text-red-600
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-opacity-50
            `}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut className="flex-shrink-0 w-5 h-5 text-red-500" />
            {!isCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;