import React, { useState } from "react";
import Appointments from "../../../components/Trainer/TrainerDashboard/Appointments";
import Profile from "../../../components/Trainer/TrainerDashboard/Profile";
import Stats from "../../../components/Trainer/TrainerDashboard/Stats";
import Sidebar from "../../../components/Trainer/TrainerDashboard/Sidebar";
import Reviews from "../../../components/Trainer/TrainerDashboard/Reviews";
import TrainerAppointments from "../../../components/Trainer/TrainerDashboard/Appointments";

const TrainerDashboard = () => {
  const [activeSection, setActiveSection] = useState("stats");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "stats":
        return <Stats isSidebarCollapsed={isSidebarCollapsed} />;
      case "appointments":
        return <TrainerAppointments isSidebarCollapsed={isSidebarCollapsed} />;
      case "reviews":
        return <Reviews isSidebarCollapsed={isSidebarCollapsed} />;
      case "profile":
        return <Profile isSidebarCollapsed={isSidebarCollapsed} />;
      default:
        return <Stats isSidebarCollapsed={isSidebarCollapsed} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50">
      <Sidebar
        setActiveSection={setActiveSection}
        activeSection={activeSection}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      {renderSection()}
    </div>
  );
};

export default TrainerDashboard;