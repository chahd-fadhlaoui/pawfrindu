import { useEffect, useState } from "react";
import DashboardStats from "../../components/admin/DashboardStats.jsx";
import LostAndFoundManagement from "../../components/admin/LostAndFoundManagement/LostAndFoundManagement.jsx";
import PetsManagement from "../../components/admin/PetManagement/PetsManagement";
import Sidebar from "../../components/admin/Sidebar";
import AdminsManagement from "../../components/admin/UserManagement/AdminsManagement.jsx";
import UsersManagement from "../../components/admin/UserManagement/UsersManagement";
import { useApp } from "../../context/AppContext.jsx";

const TABS = {
  DASHBOARD: "dashboard",
  PETS: "pets",
  USERS: "users",
  LOST_AND_FOUND: "lost&found",
  ACTIVE_USERS: "active",
  INACTIVE_USERS: "inactive",
  PENDING_APPROVALS: "pending",
  ACTIVE_ADMINS: "activeAdmins",
  INACTIVE_ADMINS: "inactiveAdmins",
};

const AdminDashboard = () => {
  const { triggerRefresh } = useApp();
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    console.log("AdminDashboard mounted");
    return () => console.log("AdminDashboard unmounted");
  }, []);

  useEffect(() => {
    console.log("AdminDashboard rendered with activeTab:", activeTab);
  }, [activeTab]);

  const renderContent = () => {
    console.log("Rendering content for activeTab:", activeTab);
    switch (activeTab) {
      case TABS.DASHBOARD:
        return <DashboardStats onRefresh={triggerRefresh} />;
      case TABS.PETS:
        return <PetsManagement hideHeader={false} />;
      case TABS.USERS:
      case TABS.ACTIVE_USERS:
      case TABS.INACTIVE_USERS:
      case TABS.PENDING_APPROVALS:
        return <UsersManagement hideHeader={false} />;
      case TABS.LOST_AND_FOUND:
        return <LostAndFoundManagement hideHeader={false} />;
      case TABS.ACTIVE_ADMINS:
      case TABS.INACTIVE_ADMINS:
        return <AdminsManagement hideHeader={false} />;
      default:
        return <DashboardStats onRefresh={triggerRefresh} />;
    }
  };

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
        <section className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div className="p-4 sm:p-0">{renderContent()}</div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;