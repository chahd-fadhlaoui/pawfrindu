import { CheckCircle, PawPrint, RefreshCw, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../../../context/AppContext";
import ActiveReports from "./ActiveReports";
import CompletedReports from "./CompletedReports";

const LostAndFoundManagement = ({ hideHeader }) => {
  const { socket, user, triggerRefresh } = useApp();
  const [activeTab, setActiveTab] = useState("active");
  const [counts, setCounts] = useState({ active: 0, completed: 0 });

  const updateCounts = (reports) => {
    setCounts({
      active: reports.filter((r) => r.status === "Pending" && !r.isArchived).length,
      completed: reports.filter(
        (r) => ["Matched", "Reunited"].includes(r.status) && !r.isArchived
      ).length,
    });
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/lost-and-found");
        const allReports = await response.json();
        updateCounts(allReports.data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
    };

    fetchReports();

    socket.on("foundReportCreated", fetchReports);
    socket.on("lostReportCreated", fetchReports);
    socket.on("reportApproved", fetchReports);
    socket.on("reportDeleted", fetchReports);
    socket.on("reportUpdated", fetchReports);
    socket.on("reportMatched", fetchReports);
    socket.on("reportUnmatched", fetchReports);
    socket.on("reportReunited", fetchReports);

    return () => {
      socket.off("foundReportCreated");
      socket.off("lostReportCreated");
      socket.off("reportApproved");
      socket.off("reportDeleted");
      socket.off("reportUpdated");
      socket.off("reportMatched");
      socket.off("reportUnmatched");
      socket.off("reportReunited");
    };
  }, [socket]);

  const handleRefresh = async () => {
    await triggerRefresh("lost-and-found");
  };

  const getTabIcon = (tabId) => {
    const icons = {
      active: Shield,
      completed: CheckCircle,
    };
    return icons[tabId];
  };

  const getTabColor = (tabId) => {
    const colors = {
      active: "text-yellow-600 bg-yellow-100",
      completed: "text-teal-600 bg-teal-100",
    };
    return colors[tabId];
  };

  const tabs = [
    { id: "active", label: "Active Reports" },
    { id: "completed", label: "Completed Reports" },
  ];

  return (
    <div className="overflow-hidden bg-white shadow-lg rounded-xl animate-fade-in">
      {!hideHeader && (
        <div
          className="px-6 py-5 border-l-4"
          style={{
            borderImage: "linear-gradient(to bottom, #f59e0b, #ec4899) 1",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center p-2 rounded-lg bg-yellow-50">
              <PawPrint className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Lost & Found Management
              </h1>
              <p className="text-sm text-gray-500">
                Review, match, and manage lost and found pet reports
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex space-x-2">
          {tabs.map((tab) => {
            const Icon = getTabIcon(tab.id);
            return (
              <button
                key={tab.id}
                className={`relative flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? getTabColor(tab.id) + " shadow-sm"
                    : "text-gray-600 bg-white hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className={`w-5 h-5 ${activeTab === tab.id ? "" : "text-gray-400"}`} />
                <span>{`${tab.label} (${counts[tab.id]})`}</span>
              </button>
            );
          })}
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
        {activeTab === "active" && <ActiveReports />}
        {activeTab === "completed" && <CompletedReports />}
      </div>
    </div>
  );
};

export default LostAndFoundManagement;