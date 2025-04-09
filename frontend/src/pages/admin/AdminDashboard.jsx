import { ArrowLeftRight, Shield, Users, BarChart4 } from "lucide-react";
import React, { useEffect, useState } from "react";
import DashboardStats from "../../components/admin/DashboardStats.jsx";
import PetsManagement from "../../components/admin/PetManagement/PetsManagement";
import Sidebar from "../../components/admin/Sidebar";
import UsersManagement from "../../components/admin/UserManagement/UsersManagement";
import { useApp } from "../../context/AppContext.jsx";

const TABS = {
  DASHBOARD: "dashboard",
  PETS: "pets",
  USERS: "users",
};

const AdminDashboard = () => {
  const { triggerRefresh } = useApp();
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    console.log("AdminDashboard mounted");
    return () => console.log("AdminDashboard unmounted");
  }, []);

  console.log("AdminDashboard rendered with activeTab:", activeTab);

  const tabConfig = {
    [TABS.DASHBOARD]: {
      title: "Dashboard Statistics",
      description: "Overview of platform metrics",
      icon: <BarChart4 className="w-6 h-6 text-yellow-500" />,
      bgColor: "#FEF3C7",
      badge: { text: "Stats Module", color: "text-yellow-800 bg-yellow-100" },
    },
    [TABS.PETS]: {
      title: "Pet Management",
      description: "Oversee pet profiles and listings",
      icon: <Shield className="w-6 h-6 text-pink-500" />,
      bgColor: "#FCE7F3",
      badge: { text: "Pets Module", color: "text-pink-800 bg-pink-100" },
    },
    [TABS.USERS]: {
      title: "User Management",
      description: "Manage platform users and permissions",
      icon: <Users className="w-6 h-6 text-yellow-500" />,
      bgColor: "#FEF3C7",
      badge: { text: "Users Module", color: "text-yellow-800 bg-yellow-100" },
    },
  };

  const currentTab = tabConfig[activeTab];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50">
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
        {/* Admin Header */}
        <header className="flex items-center justify-between px-4 py-4 bg-white shadow-md rounded-xl sm:px-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your platform efficiently</p>
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{isSidebarCollapsed ? "Expand" : "Collapse"}</span>
          </button>
        </header>

        {/* Tab Header */}
        <section className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div
            className="flex items-center justify-between px-4 py-5 border-l-4 sm:px-6"
            style={{ borderImage: "linear-gradient(to bottom, #f59e0b, #ec4899) 1" }}
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
          <div className="p-4 sm:p-6">
            <div style={{ display: activeTab === TABS.DASHBOARD ? "block" : "none" }}>
              <DashboardStats onRefresh={triggerRefresh} />
            </div>
            <div style={{ display: activeTab === TABS.PETS ? "block" : "none" }}>
              <PetsManagement hideHeader={true} />
            </div>
            <div style={{ display: activeTab === TABS.USERS ? "block" : "none" }}>
              <UsersManagement hideHeader={true} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;