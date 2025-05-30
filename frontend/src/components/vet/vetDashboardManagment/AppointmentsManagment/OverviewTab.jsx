import { User, Phone, Mail, MapPin, CalendarClock, Stethoscope, MessageSquare } from "lucide-react";

export default function OverviewTab({ appointment: appt }) {
  const getInitials = (name) => {
    if (!name) return "N/A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-500";
      case "confirmed":
        return "bg-teal-500";
      case "cancelled":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      case "notAvailable":
        return "bg-orange-500";
      case "adoptionPending":
        return "bg-purple-500";
      case "adopted":
        return "bg-green-500";
      case "sold":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
            <h3 className="text-white text-sm font-medium flex items-center">
              <User className="w-4 h-4 mr-2" />
              Client Information
            </h3>
          </div>
          <div className="p-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-medium mr-3">
                {getInitials(appt.ownerName)}
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{appt.ownerName || "Unknown"}</h4>
                <p className="text-xs text-gray-500">Client since Unknown</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0" />
                <span>{appt.phone || "No phone provided"}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0" />
                <span>{appt.email || "No email provided"}</span>
              </div>
              {appt.address && (
                <div className="flex items-start text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>{appt.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-4 py-3">
            <h3 className="text-white text-sm font-medium flex items-center">
              <CalendarClock className="w-4 h-4 mr-2" />
              Appointment Details
            </h3>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div className="text-sm text-gray-800">
                <span className="font-medium">{appt.date || "N/A"}</span> • {appt.time || "N/A"}
              </div>
              <div className="text-xs text-gray-500">{appt.duration || "N/A"}</div>
            </div>
            <div className="mb-4">
              <div className="flex items-start mb-3">
                <div className="mt-0.5 mr-2 p-1 rounded-md bg-teal-100">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Service</div>
                  <div className="text-sm font-medium text-gray-800">{appt.reason || "No reason provided"}</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-0.5 mr-2 p-1 rounded-md bg-blue-100">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Provider</div>
                  <div className="text-sm font-medium text-gray-800">{appt.provider || "Unknown"}</div>
                </div>
              </div>
            </div>
            <div className="relative pt-1 pb-1">
              <div className="flex items-center mb-2">
                <div className="flex-grow text-right pr-2 text-xs text-gray-500">Created</div>
                <div className="w-3 h-3 rounded-full bg-blue-500 z-10"></div>
                <div className="flex-grow pl-2">
                  <span className="text-xs text-gray-700">{appt.createdAt || "N/A"}</span>
                </div>
              </div>
              <div className="absolute left-1/2 top-3 bottom-3 w-0.5 bg-gray-200 transform -translate-x-1/2"></div>
              <div className="flex items-center mb-2">
                <div className="flex-grow text-right pr-2 text-xs text-gray-500">Status</div>
                <div className={`w-3 h-3 rounded-full z-10 ${getStatusColor(appt.status)}`}></div>
                <div className="flex-grow pl-2">
                  <span className="text-xs text-gray-700 capitalize">{appt.status || "Unknown"}</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-grow text-right pr-2 text-xs text-gray-500">Updated</div>
                <div className="w-3 h-3 rounded-full bg-gray-300 z-10"></div>
                <div className="flex-grow pl-2">
                  <span className="text-xs text-gray-700">{appt.updatedAt || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3">
            <h3 className="text-white text-sm font-medium flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Notes
            </h3>
          </div>
          <div className="p-4">
            {appt.notes ? (
              <div className="bg-amber-50 rounded-lg p-3 text-sm text-gray-700">{appt.notes}</div>
            ) : (
              <div className="text-sm text-gray-500 italic p-3 text-center">No notes available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}