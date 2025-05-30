import { Clock, RefreshCw, UserCheck, Users, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../../../context/AppContext";
import ActiveUsers from "../UserManagement/users/ActiveUsers";
import InactiveUsers from "../UserManagement/users/InactiveUsers";
import PendingApprovals from "../UserManagement/users/PendingApprovals";

const UsersManagement = ({ hideHeader = false }) => {
  const { allUsers, triggerRefresh } = useApp();
  const [activeTab, setActiveTab] = useState("active");
  const [counts, setCounts] = useState({
    active: 0,
    inactiveUsers: 0,
    archived: 0,
    pending: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Calculate user stats from allUsers
  const fetchUserStats = () => {
    setLoadingStats(true);
    console.log("allUsers in UsersManagement:", allUsers.map(u => ({ id: u._id, role: u.role, isActive: u.isActive, isArchieve: u.isArchieve })));
    try {
      const nonAdminUsers = allUsers.filter(
        (user) => !["Admin", "SuperAdmin"].includes(user.role)
      );
      const activeNonAdmins = nonAdminUsers.filter(
        (user) => user.isActive && !user.isArchieve
      ).length;
      const inactiveNonAdmins = nonAdminUsers.filter(
        (user) => !user.isActive && !user.isArchieve
      ).length;
      const archivedNonAdmins = nonAdminUsers.filter(
        (user) => user.isArchieve
      ).length;
      const pendingNonAdmins = nonAdminUsers.filter(
        (user) => !user.isActive && user.role !== "PetOwner" // Assuming Vet/Trainer need approval
      ).length;

      console.log("UsersManagement counts:", {
        activeNonAdmins,
        inactiveNonAdmins,
        archivedNonAdmins,
        pendingNonAdmins,
      });

      setCounts({
        active: activeNonAdmins,
        inactiveUsers: inactiveNonAdmins,
        archived: archivedNonAdmins,
        pending: pendingNonAdmins,
      });
    } catch (error) {
      console.error("Failed to calculate user stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [allUsers]);

  const handleRefresh = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await triggerRefresh();
      fetchUserStats();
    } catch (error) {
      console.error("Refresh failed:", error);
    }
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
    const tabLabels = {
      active: "Active Users",
      inactive: "Inactive Users",
      archived: "Archived Users",
      pending: "Pending Approvals",
    };
    const countKeys = {
      active: "active",
      inactive: "inactiveUsers",
      archived: "archived",
      pending: "pending",
    };
    return `${tabLabels[tab]} (${loadingStats ? "..." : counts[countKeys[tab]] || 0})`;
  };

  console.log("UsersManagement rendering with activeTab:", activeTab);

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
              <Users className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500">Manage platform users and permissions</p>
            </div>
          </div>
        </div>
      )}

      {/* Users Section */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between">
          <div className="flex space-x-2">
            {["active", "inactive", "pending"].map((tab) => (
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
        {activeTab === "active" && <ActiveUsers roleFilter="non-admin" />}
        {activeTab === "inactive" && <InactiveUsers roleFilter="non-admin" />}
        {activeTab === "pending" && <PendingApprovals />}
      </div>
    </div>
  );
};

export default UsersManagement;