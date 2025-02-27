import React from "react";
import { Users, PawPrint, Heart, Archive, LogOut } from "lucide-react";
import { useApp } from "../../context/AppContext";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useApp();

  // Handle logout and redirect to home
  const handleLogout = () => {
    logout(() => (window.location.href = "/"));
  };

  return (
    <div className="w-64 h-screen bg-white border-r-2 border-gray-200 shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <PawPrint className="w-8 h-8 text-[#ffc929]" />
          <span className="text-xl font-bold text-gray-900">Pet Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        <button
          onClick={() => setActiveTab("users")}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
            activeTab === "users"
              ? "bg-[#ffc929] text-white font-semibold shadow-sm"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50`}
        >
          <Users className="w-5 h-5" />
          <span>Users</span>
        </button>
        <button
          onClick={() => setActiveTab("pets")}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
            activeTab === "pets"
              ? "bg-[#ffc929] text-white font-semibold shadow-sm"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50`}
        >
          <Heart className="w-5 h-5" />
          <span>Pets</span>
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
            activeTab === "archived"
              ? "bg-[#ffc929] text-white font-semibold shadow-sm"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50`}
        >
          <Archive className="w-5 h-5" />
          <span>Archived Pets</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 space-x-3 text-red-600 transition-all duration-200 rounded-lg hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;