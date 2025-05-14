import { CalendarClock, Mail, MapPin, MessageSquare, PawPrint, Phone, Stethoscope, User } from "lucide-react";
import { getInitials, getStatusColor } from "./AppointmentCard.jsx";

const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-sm">
    <div className="flex items-center gap-3 pb-3 mb-4 border-b border-gray-100">
      <Icon className="w-6 h-6 text-[#ffc929]" />
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

export function OverviewTab({ appointment: appt, professionalType }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SectionCard icon={User} title="Client Information">
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
      </SectionCard>
      <div className="space-y-6">
        <SectionCard icon={CalendarClock} title={`${professionalType} Session Details`}>
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
        </SectionCard>
        <SectionCard icon={MessageSquare} title="Notes">
          {appt.notes ? (
            <div className="bg-yellow-50 rounded-lg p-3 text-sm text-gray-700">{appt.notes}</div>
          ) : (
            <div className="text-sm text-gray-600 italic p-3 text-center">No notes available</div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}