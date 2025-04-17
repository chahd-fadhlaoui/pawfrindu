import React, { useState } from "react";
import { Stethoscope, Calendar } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import MyProfile from "../../../components/vet/vetDashboardManagment/MyProfile";
import Appointments from "../../../components/vet/vetDashboardManagment/Appointments";
import Sidebar from "../../../components/vet/vetDashboardManagment/Sidebar";

const TABS = {
  PROFILE: "profile",
  APPOINTMENTS: "appointments",
};

const VetDashboard = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState(TABS.PROFILE);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const tabConfig = {
    [TABS.PROFILE]: {
      title: "My Profile",
      description: "View and manage your veterinarian profile",
      icon: <Stethoscope className="w-6 h-6 text-green-500" />,
      bgColor: "#DCFCE7", // Light green background
      badge: { text: "Profile", color: "text-green-800 bg-green-100" },
      content: <MyProfile user={user} />,
    },
    [TABS.APPOINTMENTS]: {
      title: "Appointments",
      description: "Manage your appointment schedule",
      icon: <Calendar className="w-6 h-6 text-blue-500" />,
      bgColor: "#DBEAFE", // Light blue background
      badge: { text: "Appointments", color: "text-blue-800 bg-blue-100" },
      content: <Appointments />,
    },
  };

  const currentTab = tabConfig[activeTab];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <main
        className={`flex-1 p-4 sm:p-6 space-y-6 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        {/* Vet Header */}
        <header className="flex items-center justify-between px-4 py-4 bg-white shadow-md rounded-xl sm:px-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">Vet Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome, {user?.fullName || "Veterinarian"}</p>
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <span className="hidden sm:inline">{isSidebarCollapsed ? "Expand" : "Collapse"}</span>
          </button>
        </header>

        {/* Tab Header */}
        <section className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div
            className="flex items-center justify-between px-4 py-5 border-l-4 sm:px-6"
            style={{ borderImage: "linear-gradient(to bottom, #10B981, #3B82F6) 1" }} // Green to Blue gradient
          >
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-opacity-10" style={{ backgroundColor: currentTab.bgColor }}>
                {currentTab.icon}
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">{currentTab.title}</h2>
                <p className="text-sm text-gray-500">{currentTab.description}</p>
              </div>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full hidden sm:inline ${currentTab.badge.color}`}>
              {currentTab.badge.text}
            </span>
          </div>
        </section>

        {/* Tab Content */}
        <section className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div className="p-4 sm:p-6">{currentTab.content}</div>
        </section>
      </main>
    </div>
  );
};

export default VetDashboard;