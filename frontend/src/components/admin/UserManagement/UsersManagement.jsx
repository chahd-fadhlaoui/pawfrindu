import React, { useState, useEffect } from "react";
import { Users, UserCheck, UserX, Clock, RefreshCw } from "lucide-react";
import ActiveUsers from "./users/ActiveUsers";
import InactiveUsers from "./users/InactiveUsers";
import ArchivedUsers from "./users/ArchivedUsers";
import PendingApprovals from "./users/PendingApprovals";
import { useApp } from "../../../context/AppContext";
import axiosInstance from "../../../utils/axiosInstance";

const UsersManagement = ({ hideHeader = false }) => {
  const { allUsers, triggerRefresh } = useApp(); // Use context
  const [activeTab, setActiveTab] = useState("active");
  const [counts, setCounts] = useState({
    active: 0,
    inactive: 0,
    archived: 0,
    pending: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch user stats from the backend
  const fetchUserStats = async () => {
    setLoadingStats(true);
    try {
      const response = await axiosInstance.get("/api/user/stats");
      const { stats } = response.data;
      setCounts({
        active: stats.activeUsers,
        inactive: stats.inactiveUsers,
        archived: stats.archivedUsers,
        pending: stats.pendingUsers,
      });
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Initial fetch and refresh when triggered
  useEffect(() => {
    fetchUserStats();
  }, [allUsers]); // Re-fetch when allUsers changes (e.g., after refresh)

  const handleRefresh = () => {
    triggerRefresh(); // Trigger context refresh
    fetchUserStats(); // Fetch updated stats immediately
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case "active":
        return <UserCheck className="w-5 h-5" />;
      case "inactive":
        return <UserX className="w-5 h-5" />;
      case "archived":
        return <Users className="w-5 h-5" />;
      case "pending":
        return <Clock className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const getTabColor = (tab) => {
    switch (tab) {
      case "active":
        return "text-green-600 bg-green-100";
      case "inactive":
        return "text-orange-600 bg-orange-100";
      case "archived":
        return "text-gray-600 bg-gray-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  const getTabText = (tab) => {
    const capitalized = tab.charAt(0).toUpperCase() + tab.slice(1);
    return `${capitalized} Users (${loadingStats ? "..." : counts[tab]})`;
  };

  return (
    <div className="overflow-hidden bg-white shadow-lg rounded-xl">
      {!hideHeader && (
        <div
          className="px-6 py-5 border-l-4"
          style={{ borderImage: "linear-gradient(to bottom, #f59e0b, #ec4899) 1" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center p-2 rounded-lg bg-yellow-50">
              <Users className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500">Manage platform users and permissions</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex space-x-2">
          {["active", "inactive", "archived", "pending"].map((tab) => (
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
          onClick={handleRefresh}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="p-6">
        {activeTab === "active" && <ActiveUsers showHeader={false} />}
        {activeTab === "inactive" && <InactiveUsers showHeader={false} />}
        {activeTab === "archived" && <ArchivedUsers showHeader={false} />}
        {activeTab === "pending" && <PendingApprovals showHeader={false} />}
      </div>
    </div>
  );
};

export default UsersManagement;