import React, { useState } from "react";
import Appointments from "../../../components/Trainer/TrainerDashboard/Appointments";
import Profile from "../../../components/Trainer/TrainerDashboard/Profile";
import Stats from "./Stats";
import Sidebar from "../../../components/Trainer/TrainerDashboard/Sidebar";

const TrainerDashboard = () => {
  const [activeSection, setActiveSection] = useState("profile");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <Profile />;
      case "appointments":
        return <Appointments />;
      case "stats":
        return <Stats />;
      default:
        return <Profile />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FFF8E1]">
      <Sidebar
        setActiveSection={setActiveSection}
        activeSection={activeSection}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <main className="flex-1 p-6">{renderSection()}</main>
    </div>
  );
};

export default TrainerDashboard;
