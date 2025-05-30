import React, { useEffect, useState } from "react";
import { Loader2, RefreshCw, Shield } from "lucide-react";
import ActiveUsers from "../../admin/UserManagement/users/ActiveUsers";
import InactiveUsers from "../../admin/UserManagement/users/InactiveUsers";
import { useApp } from "../../../context/AppContext";
import axiosInstance from "../../../utils/axiosInstance";

const AdminsManagement = ({ hideHeader = false }) => {
  const { allUsers, triggerRefresh } = useApp();
  const [activeTab, setActiveTab] = useState("activeAdmins");
  const [counts, setCounts] = useState({
    activeAdmins: 0,
    inactiveAdmins: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch admin stats
  const fetchAdminStats = async () => {
    setLoadingStats(true);
    try {
      const activeAdmins = allUsers.filter(
        (user) =>
          (user.role === "Admin" || user.role === "SuperAdmin") &&
          user.isActive &&
          !user.isArchieve
      ).length;
      const inactiveAdmins = allUsers.filter(
        (user) =>
          (user.role === "Admin" || user.role === "SuperAdmin") &&
          !user.isActive &&
          !user.isArchieve
      ).length;
      setCounts({
        activeAdmins,
        inactiveAdmins,
      });
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, [allUsers]);

  const handleRefresh = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await triggerRefresh();
      await fetchAdminStats();
    } catch (error) {
      console.error("Refresh failed:", error);
    }
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case "activeAdmins":
        return <Shield className="w-5 h-5" />;
      case "inactiveAdmins":
        return <Shield className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getTabColor = (tab) => {
    switch (tab) {
      case "activeAdmins":
        return "text-green-600 bg-green-100";
      case "inactiveAdmins":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-pink-600 bg-pink-100";
    }
  };

  const getTabText = (tab) => {
    const tabLabels = {
      activeAdmins: "Active Administrators",
      inactiveAdmins: "Inactive Administrators",
    };
    const countKeys = {
      activeAdmins: "activeAdmins",
      inactiveAdmins: "inactiveAdmins",
    };
    return `${tabLabels[tab]} (${loadingStats ? "..." : counts[countKeys[tab]] || 0})`;
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
            <div className="flex items-center justify-center p-2 rounded-lg bg-pink-50">
              <Shield className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Administrator Management</h1>
              <p className="text-sm text-gray-500">Manage platform administrators and super administrators</p>
            </div>
          </div>
        </div>
      )}

      {/* Admins Section */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
          <Shield className="w-5 h-5 text-pink-500" />
          Administrators
        </h2>
        <div className="flex justify-between">
          <div className="flex space-x-2">
            {["activeAdmins", "inactiveAdmins"].map((tab) => (
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
      </div>
      <div className="p-6">
        {activeTab === "activeAdmins" && <ActiveUsers roleFilter="Admin" />}
        {activeTab === "inactiveAdmins" && <InactiveUsers roleFilter="Admin" />}
      </div>
    </div>
  );
};

export default AdminsManagement;