import {
  AlertCircle,
  Calendar,
  CalendarX,
  Check,
  CheckCircle,
  Clock,
  MoreVertical,
  X
} from "lucide-react";
import { useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useApp } from "../../../../context/AppContext";
import { OverviewTab } from "./OverviewTab";
import { PetDetailsTab } from "./PetDetailsTab";

// Utility functions (unchanged)
export function getPetEmoji(petType) {
  switch (petType?.toLowerCase()) {
    case "dog":
      return "🐶";
    case "cat":
      return "🐱";
    case "bird":
      return "🐦";
    case "rabbit":
      return "🐰";
    default:
      return "🐾";
  }
}

export function getInitials(name) {
  if (!name) return "N/A";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getStatusColor(status) {
  switch (status) {
    case "pending":
      return "bg-[#ffc929]";
    case "confirmed":
      return "bg-green-500";
    case "cancelled":
      return "bg-red-500";
    case "completed":
      return "bg-blue-500";
    case "notAvailable":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
}

export function AppointmentCard({ appointment: appt, isExpanded, toggleExpand, onAction, professionalType }) {
  const { user } = useApp();
  const isUserActive = user?.isActive ?? false; 

  if (!appt?.id) {
    console.error("AppointmentCard: Missing appointment.id:", appt);
    return null;
  }

  const [activeTab, setActiveTab] = useState("Overview");
  const [contextMenu, setContextMenu] = useState(false);

  const statusConfig = {
    pending: {
      color: "text-[#ffc929]",
      bgColor: "bg-yellow-50",
      borderColor: "border-[#ffc929]",
      icon: <AlertCircle className="w-4 h-4" />,
      label: "Pending",
    },
    confirmed: {
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
      icon: <Check className="w-4 h-4" />,
      label: "Confirmed",
    },
    cancelled: {
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      icon: <X className="w-4 h-4" />,
      label: "Cancelled",
    },
    completed: {
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      icon: <Check className="w-4 h-4" />,
      label: "Completed",
    },
    notAvailable: {
      color: "text-gray-600 ",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-300",
      icon: <CalendarX className="w-4 h-4" />,
      label: "Not Available",
    },
  };

  const status = statusConfig[appt.status] || statusConfig.pending;
  const petEmoji = getPetEmoji(appt.species);
  const isIncompleteNonPlatform =
    !appt.isPlatformPet &&
    (!appt.petName || appt.petName === "Unknown" || !appt.species || appt.species === "Unknown");

  return (
    <div
      className={`bg-white border border-gray-100 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer ${
        isExpanded ? "ring-2 ring-[#ffc929]" : ""
      } ${appt.isNew ? "animate-pulse-subtle" : ""} ${
        appt.status === "pending"
          ? "border-l-4 border-[#ffc929]"
          : appt.status === "confirmed"
          ? "border-l-4 border-green-400"
          : appt.status === "completed"
          ? "border-l-4 border-blue-400"
          : appt.status === "cancelled"
          ? "border-l-4 border-red-400"
          : appt.status === "notAvailable"
          ? "border-l-4 border-gray-400"
          : ""
      }`}
      onClick={(e) => {
        if (!e.target.closest("button")) toggleExpand();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && toggleExpand()}
      aria-expanded={isExpanded}
      aria-label={`Training session for ${appt.petName}`}
    >
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-50">
              {petEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {appt.petName || "Unknown Pet"}
                  {appt.breed && appt.breed !== "Unknown" && (
                    <span className="text-sm font-normal ml-2 text-gray-600">({appt.breed})</span>
                  )}
                </h3>
                {isIncompleteNonPlatform && (
                  <span className="bg-gray-50 text-gray-600 text-xs px-2 py-0.5 rounded-full flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Non-Platform Pet
                  </span>
                )}
                {appt.isNew && (
                  <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">New</span>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-1 gap-2">
                <Calendar className="w-4 h-4 text-[#ffc929]" />
                {appt.date || "N/A"} • <Clock className="w-4 h-4 text-[#ffc929]" /> {appt.time || "N/A"} •{" "}
                {appt.duration || "N/A"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center ${status.color} ${status.bgColor} px-3 py-1 rounded-lg text-sm font-medium shadow-sm border ${status.borderColor} ${
                status.label === "Pending" ? "animate-pulse" : ""
              }`}
            >
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </span>
            {appt.status === "cancelled" && isUserActive && ( // Only show context menu if user is active
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setContextMenu(!contextMenu);
                  }}
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 text-gray-600"
                  aria-label="More actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {contextMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction("updateStatus", appt.id);
                        setContextMenu(false);
                      }}
                      className="flex items-center w-full text-sm text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg"
                    >
                      <Check className="w-4 h-4 mr-2 text-[#ffc929]" />
                      Update Status
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {isUserActive && ( // Only show action buttons if user is active
          <div className="flex flex-wrap gap-2">
            {appt.status === "pending" && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction("confirm", appt.id);
                  }}
                  className="px-3 py-1.5 text-sm font-medium rounded-md bg-green-500 text-white hover:bg-green-600 transition-transform transform hover:scale-105"
                  aria-label="Confirm training session"
                >
                  <Check className="w-4 h-4 mr-1 inline" />
                  Confirm
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction("notAvailable", appt.id);
                  }}
                  className="px-3 py-1.5 text-sm font-medium rounded-md bg-gray-400 text-white hover:bg-gray-600 transition-transform transform hover:scale-105"
                  aria-label="Mark as not available"
                >
                  <CalendarX className="w-4 h-4 mr-1 inline" />
                  Not Available
                </button>
              </>
            )}
            {appt.status === "confirmed" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction("complete", appt.id);
                }}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-gradient-to-r from-yellow-500 to-pink-500 text-white hover:bg-[#ffa726] transition-transform transform hover:scale-105"
                aria-label="Complete training session"
              >
                <CheckCircle className="w-4 h-4 mr-1 inline" />
                Complete
              </button>
            )}
            {["pending", "confirmed"].includes(appt.status) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction("cancel", appt.id);
                }}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-transform transform hover:scale-105"
                aria-label="Cancel training session"
              >
                <X className="w-4 h-4 mr-1 inline" />
                Cancel
              </button>
            )}
          </div>
        )}
        {isExpanded && (
          <div className="mt-3 border-t border-gray-100 pt-3 animate-fade-in">
            <div className="flex border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur-sm">
              {["Overview", "Pet Details"].map((tab) => (
                <button
                  key={tab}
                  className={`flex-1 py-2 px-3 text-sm font-medium text-center transition-colors ${
                    activeTab === tab
                      ? "bg-white text-[#ffc929] border-b-2 border-[#ffc929]"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab(tab);
                  }}
                  aria-label={`View ${tab} tab`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-4">
              {activeTab === "Overview" && <OverviewTab appointment={appt} professionalType={professionalType} />}
              {activeTab === "Pet Details" && <PetDetailsTab appointment={appt} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}