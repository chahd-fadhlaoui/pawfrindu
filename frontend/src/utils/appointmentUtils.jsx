import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Calendar,
  CalendarClock,
  CalendarX,
  Check,
  CheckCircle,
  Clock,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  MoreVertical,
  PawPrint,
  Phone,
  Stethoscope,
  User,
  X
} from "lucide-react";
import { useState } from "react";

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
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
}

export function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center p-4 rounded-lg shadow-lg animate-slide-in-right border-l-4 ${
            toast.type === "success"
              ? "bg-white text-gray-700 border-[#ffc929]"
              : toast.type === "error"
              ? "bg-red-50 text-red-700 border-red-500"
              : toast.type === "warning"
              ? "bg-yellow-50 text-gray-700 border-[#ffc929]"
              : "bg-white text-gray-700 border-[#ffa726]"
          }`}
          role="alert"
          aria-live="assertive"
        >
          {toast.type === "success" && <Check className="w-5 h-5 mr-2 text-[#ffc929]" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5 mr-2 text-red-500" />}
          {toast.type === "warning" && <AlertTriangle className="w-5 h-5 mr-2 text-[#ffc929]" />}
          {toast.type === "info" && <Bell className="w-5 h-5 mr-2 text-[#ffa726]" />}
          <span className="text-sm">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

export function DeleteModal({ appointment, onConfirm, onClose }) {
  if (!appointment?.id) {
    console.error("DeleteModal: Missing appointment.id:", appointment);
    return null;
  }
  console.log("DeleteModal rendering for ID:", appointment.id);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full border border-gray-100 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Cancel Appointment</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-6">
          <div className="flex items-center p-4 bg-yellow-50 border-l-4 border-[#ffc929] rounded-lg">
            <AlertTriangle className="w-6 h-6 text-[#ffc929] mr-3" />
            <p className="text-sm text-gray-700">
              Are you sure you want to cancel the training session for{" "}
              <span className="font-medium">{appointment.petName}</span> on{" "}
              <span className="font-medium">{appointment.date}</span> at{" "}
              <span className="font-medium">{appointment.time}</span>?
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
            >
              Keep Appointment
            </button>
            <button
              onClick={() => {
                console.log("DeleteModal onConfirm for ID:", appointment.id);
                onConfirm();
              }}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-pink-500 text-white rounded-lg hover:bg-[#ffa726] focus:outline-none focus:ring-2 focus:ring-[#ffc929] shadow"
            >
              Cancel Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PetDetailsTab({ appointment: appt }) {
  const getAgeCategory = (age) => {
    if (!age || age === "Unknown") return "Unknown";
    switch (age.toLowerCase()) {
      case "puppy":
      case "kitten":
        return age.charAt(0).toUpperCase() + age.slice(1);
      case "young":
        return "Young";
      case "adult":
        return "Adult";
      case "senior":
        return "Senior";
      default:
        return "Unknown";
    }
  };

  const ageCategory = getAgeCategory(appt.petAge);
  const ageStyles = {
    Puppy: "bg-yellow-50 text-[#ffc929]",
    Kitten: "bg-yellow-50 text-[#ffc929]",
    Young: "bg-green-50 text-green-600",
    Adult: "bg-teal-50 text-teal-600",
    Senior: "bg-amber-50 text-amber-600",
    Unknown: "bg-gray-50 text-gray-600",
  };
  const isIncompleteNonPlatform =
    !appt.isPlatformPet &&
    (!appt.petName || appt.petName === "Unknown" || !appt.species || appt.species === "Unknown");

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white border border-gray-100 rounded-lg">
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
          <Heart className="w-7 h-7 text-[#ffc929]" />
          <h3 className="text-xl font-semibold text-gray-800">Pet Details</h3>
        </div>
        <div>
          {appt.image && (
            <div className="mb-4">
              <img
                src={appt.image}
                alt={appt.petName}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => (e.target.src = "/default-pet.jpg")}
              />
            </div>
          )}
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-yellow-50 rounded-full text-xl mr-3">
              {getPetEmoji(appt.species)}
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800">{appt.petName || "Unknown"}</h4>
              <p className="text-sm text-gray-600">
                {appt.species || appt.petType || "Unknown"} • {appt.petAge || "Unknown"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <span className="text-gray-600">Age</span>
              <p className="font-medium text-gray-800">{appt.petAge || "Unknown"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <span className="text-gray-600">Gender</span>
              <p className="font-medium text-gray-800">{appt.gender || "Unknown"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <span className="text-gray-600">Breed</span>
              <p className="font-medium text-gray-800">{appt.breed || "Unknown"}</p>
            </div>
          </div>
          <div className="flex items-center mb-3">
            <span className="text-sm text-gray-600 mr-2">Age Category:</span>
            <span className={`text-sm px-2 py-0.5 rounded-full ${ageStyles[ageCategory]}`}>
              {ageCategory}
            </span>
          </div>
          <div className="flex items-center mb-3">
            <span className="text-sm text-gray-600 mr-2">Training Status:</span>
            <span
              className={`text-sm px-2 py-0.5 rounded-full ${
                appt.isTrained ? "bg-green-50 text-green-600" : "bg-yellow-50 text-[#ffc929]"
              }`}
            >
              {appt.isTrained ? "Trained" : "Not Trained"}
            </span>
          </div>
          {appt.fee && (
            <div className="mt-2">
              <span className="text-sm text-gray-600">Fee:</span>
              <span className="text-sm font-medium ml-2">{appt.fee}dt</span>
            </div>
          )}
          {isIncompleteNonPlatform && (
            <div className="mt-4 bg-yellow-50 border-l-4 border-[#ffc929] p-3 rounded-lg flex items-center">
              <AlertTriangle className="w-5 h-5 text-[#ffc929] mr-2" />
              <p className="text-sm text-gray-700">
                This pet is not registered on the platform and has incomplete details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function OverviewTab({ appointment: appt, professionalType }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="p-6 bg-white border border-gray-100 rounded-lg">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
            <User className="w-7 h-7 text-[#ffc929]" />
            <h3 className="text-xl font-semibold text-gray-800">Client Information</h3>
          </div>
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-[#ffc929] font-medium mr-3">
                {getInitials(appt.ownerName)}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">{appt.ownerName || "Unknown"}</h4>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-[#ffc929] flex-shrink-0" />
                <span>{appt.phone || "No phone provided"}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-[#ffc929] flex-shrink-0" />
                <span>{appt.email || "No email provided"}</span>
              </div>
              {appt.address && (
                <div className="flex items-start text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-[#ffc929] flex-shrink-0 mt-0.5" />
                  <span>{appt.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="p-6 bg-white border border-gray-100 rounded-lg">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
            <CalendarClock className="w-7 h-7 text-[#ffc929]" />
            <h3 className="text-xl font-semibold text-gray-800">{professionalType} Session Details</h3>
          </div>
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div className="text-sm text-gray-800">
                <span className="font-medium">{appt.date || "N/A"}</span> • {appt.time || "N/A"}
              </div>
              <div className="text-sm text-gray-600">{appt.duration || "N/A"}</div>
            </div>
            <div className="mb-4">
              <div className="flex items-start mb-3">
                <div className="mt-0.5 mr-2 p-1 rounded-md bg-yellow-50">
                  {professionalType === "Trainer" ? (
                    <PawPrint className="w-4 h-4 text-[#ffc929]" />
                  ) : (
                    <Stethoscope className="w-4 h-4 text-[#ffc929]" />
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-600">
                    {professionalType === "Trainer" ? "Training Type" : "Service"}
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    {appt.reason || `No ${professionalType.toLowerCase()} type provided`}
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-0.5 mr-2 p-1 rounded-md bg-yellow-50">
                  <User className="w-4 h-4 text-[#ffc929]" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">{professionalType}</div>
                  <div className="text-sm font-medium text-gray-800">{appt.provider || "Unknown"}</div>
                </div>
              </div>
            </div>
            <div className="relative pt-1 pb-1">
              <div className="flex items-center mb-2">
                <div className="flex-grow text-right pr-2 text-sm text-gray-600">Created</div>
                <div className="w-3 h-3 rounded-full bg-[#ffc929] z-10"></div>
                <div className="flex-grow pl-2">
                  <span className="text-sm text-gray-800">{appt.createdAt || "N/A"}</span>
                </div>
              </div>
              <div className="absolute left-1/2 top-3 bottom-3 w-0.5 bg-gray-200 transform -translate-x-1/2"></div>
              <div className="flex items-center mb-2">
                <div className="flex-grow text-right pr-2 text-sm text-gray-600">Status</div>
                <div className={`w-3 h-3 rounded-full z-10 ${getStatusColor(appt.status)}`}></div>
                <div className="flex-grow pl-2">
                  <span className="text-sm text-gray-800 capitalize">{appt.status || "Unknown"}</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-grow text-right pr-2 text-sm text-gray-600">Updated</div>
                <div className="w-3 h-3 rounded-full bg-gray-300 z-10"></div>
                <div className="flex-grow pl-2">
                  <span className="text-sm text-gray-800">{appt.updatedAt || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white border border-gray-100 rounded-lg">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
            <MessageSquare className="w-7 h-7 text-[#ffc929]" />
            <h3 className="text-xl font-semibold text-gray-800">Notes</h3>
          </div>
          <div>
            {appt.notes ? (
              <div className="bg-yellow-50 rounded-lg p-3 text-sm text-gray-700">{appt.notes}</div>
            ) : (
              <div className="text-sm text-gray-600 italic p-3 text-center">No notes available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatusUpdateModal({ appointment, onSubmit, onClose }) {
  if (!appointment?.id) {
    console.error("StatusUpdateModal: Missing appointment.id:", appointment);
    return null;
  }
  console.log("StatusUpdateModal rendering for ID:", appointment.id);

  const [status, setStatus] = useState(appointment.status || "pending");
  const [reason, setReason] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "notAvailable", label: "Not Available" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("StatusUpdateModal onSubmit for ID:", appointment.id);
    onSubmit(status, reason, completionNotes);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full border border-gray-100 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Update Training Session Status</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc929] focus:outline-none"
              required
              aria-label="Select training session status"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {status === "cancelled" && (
            <div>
              <label className="block text-sm text-gray-600">Cancellation Reason (Optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc929] focus:outline-none"
                placeholder="Reason for cancellation"
                aria-label="Cancellation reason"
              ></textarea>
            </div>
          )}
          {status === "completed" && (
            <div>
              <label className="block text-sm text-gray-600">Completion Notes (Optional)</label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc929] focus:outline-none"
                placeholder="Add any notes about the completed training session"
                aria-label="Completion notes"
              ></textarea>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-pink-500 text-white rounded-lg hover:bg-[#ffa726] focus:outline-none focus:ring-2 focus:ring-[#ffc929] shadow"
            >
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AppointmentCard({ appointment: appt, isExpanded, toggleExpand, onAction, professionalType }) {
  if (!appt?.id) {
    console.error("AppointmentCard: Missing appointment.id:", appt);
    return null;
  }
  console.log("AppointmentCard rendering for ID:", appt.id);

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
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-300",
      icon: <CalendarX className="w-4 h-4" />,
      label: "Not Available",
    },
    adoptionPending: {
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      icon: <Clock className="w-4 h-4" />,
      label: "Adoption Pending",
    },
    adopted: {
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
      icon: <Heart className="w-4 h-4" />,
      label: "Adopted",
    },
    sold: {
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      icon: <Check className="w-4 h-4" />,
      label: "Sold",
    },
  };

  const status = statusConfig[appt.status] || statusConfig.pending;
  const petEmoji = getPetEmoji(appt.species);
  const isIncompleteNonPlatform =
    !appt.isPlatformPet &&
    (!appt.petName || appt.petName === "Unknown" || !appt.species || appt.species === "Unknown");

  return (
    <div
      className={`p-6 bg-white border border-gray-100 rounded-lg transition-all duration-300 hover:bg-gray-50 cursor-pointer ${
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
          ? "border-l-4 border-orange-400"
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-yellow-50 text-2xl">
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
                <span className="bg-gray-50 text-gray-600 text-xs px-2 py-0.5 rounded-full flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Non-Platform Pet
                </span>
              )}
              {appt.isNew && (
                <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">New</span>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Calendar className="w-4 h-4 mr-1 text-[#ffc929]" />
              {appt.date || "N/A"} • <Clock className="w-4 h-4 mx-1 text-[#ffc929]" /> {appt.time || "N/A"} •{" "}
              {appt.duration || "N/A"}
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
            {appt.status === "cancelled" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenu(!contextMenu);
                }}
                className="p-2 rounded-full bg-white hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                aria-label="More actions"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            )}
            {appt.status === "cancelled" && contextMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("AppointmentCard: updateStatus for ID:", appt.id);
                    onAction("updateStatus", appt.id);
                    setContextMenu(false);
                  }}
                  className="flex items-center w-full text-sm text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg"
                >
                  <Check className="w-4 h-4 mr-2 text-[#ffc929]" />
                  Update Status
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
                console.log("AppointmentCard: confirm for ID:", appt.id);
                onAction("confirm", appt.id);
              }}
              className="flex items-center text-sm bg-gradient-to-r from-yellow-500 to-pink-500 text-white hover:bg-[#ffa726] px-4 py-2 rounded-lg transition-transform transform hover:scale-105 shadow focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
              aria-label="Confirm training session"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Confirm
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("AppointmentCard: notAvailable for ID:", appt.id);
                onAction("notAvailable", appt.id);
              }}
              className="flex items-center text-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
              aria-label="Mark as not available"
            >
              <CalendarX className="w-4 h-4 mr-1.5" />
              Not Available
            </button>
          </>
        )}
        {appt.status === "confirmed" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log("AppointmentCard: complete for ID:", appt.id);
              onAction("complete", appt.id);
            }}
            className="flex items-center text-sm bg-gradient-to-r from-yellow-500 to-pink-500 text-white hover:bg-[#ffa726] px-4 py-2 rounded-lg transition-transform transform hover:scale-105 shadow focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
            aria-label="Complete training session"
          >
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Complete
          </button>
        )}
        {["pending", "confirmed"].includes(appt.status) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log("AppointmentCard: cancel for ID:", appt.id);
              onAction("cancel", appt.id);
            }}
            className="flex items-center text-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
            aria-label="Cancel training session"
          >
            <X className="w-4 h-4 mr-1.5" />
            Cancel
          </button>
        )}
      </div>
      {isExpanded && (
        <div className="mt-6 animate-fade-in">
          <div className="border-t border-gray-100 pt-4">
            <div className="bg-white rounded-lg border border-gray-100">
              <div className="flex border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur-sm">
                {["Overview", "Pet Details"].map((tab) => (
                  <button
                    key={tab}
                    className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
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
              <div className="p-6">
                {activeTab === "Overview" && <OverviewTab appointment={appt} professionalType={professionalType} />}
                {activeTab === "Pet Details" && <PetDetailsTab appointment={appt} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
