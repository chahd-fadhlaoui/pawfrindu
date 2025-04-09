import { Archive, PawPrint, RefreshCw, Shield } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useApp } from "../../../context/AppContext";
import ActivePets from "./Pets/ActivePets";
import ArchivedPets from "./Pets/ArchivedPets";
import CompletedPets from "./Pets/CompletedPets";
import MyPets from "./Pets/MyPets";

const PetsManagement = ({ hideHeader = false }) => {
  const { pets, userPets, triggerRefresh, user, socket } = useApp();
  const [activeTab, setActiveTab] = useState("active");
  const [counts, setCounts] = useState({
    active: 0,
    completed: 0,
    archived: 0,
    myPets: 0,
  });

  // Calculate counts based on current pets and userPets
  const updateCounts = () => {
    setCounts({
      active: pets.filter(
        (p) =>
          ["pending", "accepted", "adoptionPending"].includes(p.status) &&
          !p.isArchived
      ).length,
      completed: pets.filter(
        (p) => ["adopted", "sold"].includes(p.status) && !p.isArchived
      ).length,
      archived: pets.filter((p) => p.isArchived).length,
      myPets: userPets.filter(
        (p) => !p.isArchived && p.status !== "adopted" && p.status !== "sold"
      ).length,
    });
  };

  useEffect(() => {
    console.log("PetsManagement mounted");
    return () => console.log("PetsManagement unmounted");
  }, []);

  // Update counts when pets or userPets change (initial load or socket updates)
  useEffect(() => {
    updateCounts();
  }, [pets, userPets]);

  // Listen to socket events for real-time updates
  useEffect(() => {
    socket.on("petCreated", () => updateCounts());
    socket.on("petUpdated", () => updateCounts());
    socket.on("petDeleted", () => updateCounts());
    socket.on("petArchived", () => updateCounts());
    socket.on("petUnarchived", () => updateCounts());

    return () => {
      socket.off("petCreated");
      socket.off("petUpdated");
      socket.off("petDeleted");
      socket.off("petArchived");
      socket.off("petUnarchived");
    };
  }, [socket]);

  const handleRefresh = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await triggerRefresh("pets"); // Fetch fresh pet data
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case "active":
        return <Shield className="w-5 h-5" />;
      case "completed":
        return <PawPrint className="w-5 h-5" />;
      case "archived":
        return <Archive className="w-5 h-5" />;
      case "myPets":
        return <PawPrint className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getTabColor = (tab) => {
    switch (tab) {
      case "active":
        return "text-green-600 bg-green-100";
      case "completed":
        return "text-teal-600 bg-teal-100";
      case "archived":
        return "text-gray-600 bg-gray-100";
      case "myPets":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-green-600 bg-green-100";
    }
  };

  const getTabText = (tab) => {
    const displayText =
      tab === "myPets"
        ? "My Pets"
        : tab === "completed"
        ? "Completed Pets"
        : `${tab.charAt(0).toUpperCase() + tab.slice(1)} Pets`;
    return `${displayText} (${counts[tab]})`;
  };

  return (
    <div className="overflow-hidden bg-white shadow-lg rounded-xl">
      {!hideHeader && (
        <div
          className="px-6 py-5 border-l-4"
          style={{
            borderImage: "linear-gradient(to bottom, #f59e0b, #ec4899) 1",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center p-2 rounded-lg bg-yellow-50">
              <Shield className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Pet Management
              </h1>
              <p className="text-sm text-gray-500">
                Oversee pet profiles and statuses
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex space-x-2">
          {["active", "completed", "archived", "myPets"].map((tab) => (
            <button
              key={tab}
              className={`relative flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab
                  ? `${getTabColor(tab)} shadow-sm`
                  : "text-gray-600 bg-white hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              <span className={activeTab === tab ? "" : "text-gray-400"}>
                {getTabIcon(tab)}
              </span>
              <span>{getTabText(tab)}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="p-6">
        {activeTab === "active" && <ActivePets showHeader={false} />}
        {activeTab === "completed" && <CompletedPets showHeader={false} />}
        {activeTab === "archived" && <ArchivedPets showHeader={false} />}
        {activeTab === "myPets" && <MyPets showHeader={false} />}
      </div>
    </div>
  );
};

export default PetsManagement;
