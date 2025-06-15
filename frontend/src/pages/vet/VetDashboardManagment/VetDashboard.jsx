import { Calendar, Stethoscope } from "lucide-react";
import { useState } from "react";
import Appointments from "../../../components/vet/vetDashboardManagment/AppointmentsManagment/Appointments";
import MyProfile from "../../../components/vet/vetDashboardManagment/MyProfile";
import Sidebar from "../../../components/vet/vetDashboardManagment/Sidebar";
import { useApp } from "../../../context/AppContext";

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
        {/* Tab Content */}
        <section className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div className="p-4 sm:p-6">{currentTab.content}</div>
        </section>
      </main>
    </div>
  );
};

export default VetDashboard;