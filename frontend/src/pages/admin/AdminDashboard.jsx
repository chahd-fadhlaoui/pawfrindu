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
        {/* Tab Content */}
        <section className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div className="p-4 sm:p-0">
            <div style={{ display: activeTab === TABS.DASHBOARD ? "block" : "none" }}>
              <DashboardStats onRefresh={triggerRefresh} />
            </div>
            <div style={{ display: activeTab === TABS.PETS ? "block" : "none" }}>
              <PetsManagement hideHeader={false} />
            </div>
            <div style={{ display: activeTab === TABS.USERS ? "block" : "none" }}>
              <UsersManagement hideHeader={false} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;