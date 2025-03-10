import { ArrowLeftRight, Shield, Users } from "lucide-react";
import React, { useState } from "react";
import DashboardStats from "../../components/admin/DashboardStats.jsx";
import PetsManagement from "../../components/admin/PetManagement/PetsManagement";
import Sidebar from "../../components/admin/Sidebar";
import UsersManagement from "../../components/admin/UserManagement/UsersManagement";
import { useApp } from "../../context/AppContext.jsx";

const TABS = {
  PETS: "pets",
  USERS: "users",
};

const AdminDashboard = () => {
  const { triggerRefresh } = useApp();
  const [activeTab, setActiveTab] = useState(TABS.PETS);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const getPageTitle = () =>
    ({ [TABS.USERS]: "User Management", [TABS.PETS]: "Pet Management" }[activeTab] || "Dashboard");

  const getPageDescription = () =>
    activeTab === TABS.USERS ? "Manage platform users and permissions" : "Oversee pet profiles";

  const getPageIcon = () =>
    activeTab === TABS.USERS ? (
      <Users className="w-6 h-6 text-yellow-500" />
    ) : (
      <Shield className="w-6 h-6 text-pink-500" />
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "md:ml-16" : "md:ml-64"}`}
      >
        <div className="p-4 space-y-6 sm:p-6">
          {/* Non-Sticky Admin Header */}
          <div className="flex items-center justify-between px-4 py-4 bg-white shadow-md rounded-xl sm:px-6">
            <div>
              <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Manage your platform's content and users</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  {isSidebarCollapsed ? "Expand" : "Collapse"}
                </span>
              </button>
            </div>
          </div>

          {/* Stats Component */}
          <DashboardStats />

          {/* Page Header */}
          <div className="overflow-hidden bg-white shadow-lg rounded-xl animate-fadeIn">
            <div
              className="flex items-center px-4 py-5 border-l-4 sm:px-6"
              style={{ borderImage: "linear-gradient(to bottom, #f59e0b, #ec4899) 1" }}
            >
              <div className="flex items-center flex-1">
                <div
                  className="p-2 rounded-lg bg-opacity-10"
                  style={{ backgroundColor: activeTab === TABS.USERS ? "#FEF3C7" : "#FCE7F3" }}
                >
                  {getPageIcon()}
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-bold text-gray-900 sm:text-xl">{getPageTitle()}</h2>
                  <p className="text-sm text-gray-500">{getPageDescription()}</p>
                </div>
              </div>
              <div className="hidden sm:flex sm:items-center">
                {activeTab === TABS.USERS ? (
                  <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
                    Users Module
                  </span>
                ) : (
                  <span className="px-3 py-1 text-sm font-medium text-pink-800 bg-pink-100 rounded-full">
                    Pets Module
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="overflow-hidden bg-white shadow-lg rounded-xl animate-fadeIn">
            <div className="p-4 sm:p-6">
              {activeTab === TABS.USERS ? (
                <UsersManagement hideHeader={true} />
              ) : (
                <PetsManagement hideHeader={true} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;