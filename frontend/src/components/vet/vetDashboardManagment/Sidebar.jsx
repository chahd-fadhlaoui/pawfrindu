import React, { useState, useEffect } from "react";
import { Stethoscope, Calendar, LogOut, ChevronLeft, ChevronRight, Menu, UserIcon, Bell } from "lucide-react";
import { useApp } from "../../../context/AppContext";

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout, user } = useApp();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const shouldCollapse = width < 768;
      setIsCollapsed(shouldCollapse);
      setIsMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsCollapsed]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
  const handleLogout = () => logout(() => (window.location.href = "/"));

  const menuItems = [
    { icon: UserIcon, label: "My Profile", key: "profile", color: "text-purple-500" },
    { icon: Calendar, label: "Appointments", key: "appointments", color: "text-teal-500" },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed z-30 p-3 text-white rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-teal-500 md:hidden top-4 left-4 hover:from-purple-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/70 md:hidden transition-opacity duration-300"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white shadow-2xl transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-72"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-24 px-5 bg-gradient-to-r from-purple-500 to-teal-500">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            {!isCollapsed && (
              <h1 className="ml-4 text-2xl font-bold tracking-tight text-white">VetCare</h1>
            )}
          </div>
          {!isMobileOpen && (
            <button
              onClick={toggleSidebar}
              className="hidden p-2 text-white bg-white/20 rounded-full md:flex hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          )}
        </div>

        {/* Profile */}
        <div className={`p-5 border-b border-gray-100 ${isCollapsed ? "text-center" : "flex items-center space-x-4"}`}>
          <div className="relative w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-purple-100 to-teal-100 ring-2 ring-purple-200">
            <img
              src={user?.image || "https://via.placeholder.com/48"}
              alt={user?.fullName || "Vet"}
              className="object-cover w-full h-full rounded-full"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <span className="block text-base font-semibold text-gray-800 truncate">{user?.fullName || "Veterinarian"}</span>
              <span className="text-sm text-gray-500 truncate">{user?.email || "vet@example.com"}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.key);
                setIsMobileOpen(false);
              }}
              className={`flex items-center w-full p-3 rounded-lg transition-all duration-300 ${
                activeTab === item.key
                  ? "bg-gradient-to-r from-purple-500 to-teal-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
              }`}
              title={isCollapsed ? item.label : ""}
            >
              <item.icon
                className={`w-6 h-6 ${!isCollapsed && "mr-4"} ${
                  activeTab === item.key ? "text-white" : item.color
                }`}
              />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 mt-auto border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full p-3 text-gray-700 rounded-lg transition-colors duration-300 hover:bg-red-50 hover:text-red-500 ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut className={`w-6 h-6 ${!isCollapsed && "mr-4"}`} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;