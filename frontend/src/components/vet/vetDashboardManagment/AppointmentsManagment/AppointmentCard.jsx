import { useState } from "react";
import {
  Calendar,
  Clock,
  Check,
  X,
  ChevronRight,
  MoreVertical,
  AlertTriangle,
  CalendarX,
  ArrowRight,
  MessageSquare,
  Phone,
  Heart,
} from "lucide-react";
import OverviewTab from "./OverviewTab";
import PetDetailsTab from "./PetDetailsTab";
import AppointmentHistoryTab from "./AppointmentHistoryTab";

export default function AppointmentCard({ appointment: appt, isExpanded, toggleExpand, onAction }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [contextMenu, setContextMenu] = useState(false);

  const statusConfig = {
    pending: { color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-300", icon: <AlertTriangle className="w-4 h-4" />, label: "Pending" },
    confirmed: { color: "text-teal-600", bgColor: "bg-teal-50", borderColor: "border-teal-300", icon: <Check className="w-4 h-4" />, label: "Confirmed" },
    cancelled: { color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-300", icon: <X className="w-4 h-4" />, label: "Cancelled" },
    completed: { color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-300", icon: <Check className="w-4 h-4" />, label: "Completed" },
    notAvailable: { color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-300", icon: <CalendarX className="w-4 h-4" />, label: "Not Available" },
    adoptionPending: { color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-300", icon: <Clock className="w-4 h-4" />, label: "Adoption Pending" },
    adopted: { color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-300", icon: <Heart className="w-4 h-4" />, label: "Adopted" },
    sold: { color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-300", icon: <Check className="w-4 h-4" />, label: "Sold" },
  };

  const status = statusConfig[appt.status] || statusConfig.pending;
  const petEmoji = appt.species === "dog" ? "🐶" :
                   appt.species === "cat" ? "🐱" :
                   appt.species === "bird" ? "🐦" :
                   appt.species === "rabbit" ? "🐰" : "🐾";
  const isIncompleteNonPlatform = !appt.isPlatformPet && (
    !appt.petName || appt.petName === "Unknown" || !appt.species || appt.species === "Unknown"
  );

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:bg-gray-50 cursor-pointer ${
        isExpanded ? "ring-2 ring-teal-300" : ""
      } ${appt.isNew ? "animate-pulse-subtle" : ""} ${
        appt.status === "pending" ? "border-l-4 border-amber-400" :
        appt.status === "confirmed" ? "border-l-4 border-teal-400" :
        appt.status === "completed" ? "border-l-4 border-blue-400" :
        appt.status === "cancelled" ? "border-l-4 border-red-400" :
        appt.status === "notAvailable" ? "border-l-4 border-orange-400" : ""
      }`}
      onClick={(e) => {
        if (!e.target.closest("button")) toggleExpand();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && toggleExpand()}
      aria-expanded={isExpanded}
      aria-label={`Appointment for ${appt.petName}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 text-2xl">
              {petEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  {appt.petName || "Unknown Pet"}
                  {appt.breed && appt.breed !== "Unknown" && (
                    <span className="text-sm font-normal ml-2">({appt.breed})</span>
                  )}
                </h3>
                {isIncompleteNonPlatform && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Non-Platform Pet
                  </span>
                )}
                {appt.isNew && (
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">New</span>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                {appt.date || "N/A"} • <Clock className="w-4 h-4 mx-1" /> {appt.time || "N/A"} • {appt.duration || "N/A"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`flex items-center ${status.color} ${status.bgColor} px-3 py-1 rounded-lg text-sm font-medium shadow-sm ${
                status.label === "Pending" ? "animate-pulse" : ""
              }`}
            >
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </span>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenu(!contextMenu);
                }}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-300"
                aria-label="More actions"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {contextMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction("updateStatus", appt.id);
                      setContextMenu(false);
                    }}
                    className="flex items-center w-full text-sm text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-t-lg"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Update Status
                  </button>
             
                  {appt.status === "pending" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction("remind", appt.id);
                        setContextMenu(false);
                      }}
                      className="flex items-center w-full text-sm text-gray-700 hover:bg-gray-100 px-4 py-2"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Reminder
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand();
                      setContextMenu(false);
                    }}
                    className="flex items-center w-full text-sm text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-b-lg"
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {appt.status === "pending" && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction("confirm", appt.id);
                }}
                className="flex items-center text-sm bg-teal-600 text-white hover:bg-teal-700 px-4 py-2 rounded-lg transition-transform transform hover:scale-105 shadow"
                aria-label="Confirm appointment"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Confirm
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction("notAvailable", appt.id);
                }}
                className="flex items-center text-sm bg-orange-600 text-white hover:bg-orange-700 px-4 py-2 rounded-lg transition-transform transform hover:scale-105 shadow"
                aria-label="Mark as not available"
              >
                <CalendarX className="w-4 h-4 mr-1.5" />
                Not Available
              </button>
            </>
          )}
     
          {["pending", "confirmed"].includes(appt.status) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction("cancel", appt.id);
              }}
              className="flex items-center text-sm border border-red-300 bg-white text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-transform transform hover:scale-105"
              aria-label="Cancel appointment"
            >
              <X className="w-4 h-4 mr-1.5" />
              Cancel
            </button>
          )}
        </div>
        {isExpanded && (
          <div className="mt-6 animate-fade-in">
            <div className="border-t border-gray-100 pt-4">
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl overflow-hidden">
                <div className="flex border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur-sm">
                  {["Overview", "Pet Details", "History"].map((tab) => (
                    <button
                      key={tab}
                      className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
                        activeTab === tab
                          ? "bg-white text-teal-600 border-b-2 border-teal-500"
                          : "text-gray-500 hover:bg-gray-100"
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
                <div className="p-6">
                  {activeTab === "Overview" && <OverviewTab appointment={appt} />}
                  {activeTab === "Pet Details" && <PetDetailsTab appointment={appt} />}
                  {activeTab === "History" && <AppointmentHistoryTab appointment={appt} />}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}