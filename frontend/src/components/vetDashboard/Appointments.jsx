import React, { useState, useMemo, useEffect } from "react";
import {
  Clock,
  Check,
  X,
  Search,
  Plus,
  Phone,
  UserCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";

const VetAppointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [appointmentsState, setAppointmentsState] = useState([
    {
      id: 1,
      date: new Date(),
      time: "09:00 AM",
      duration: "30 min",
      petName: "Bella",
      petType: "Cat",
      petBreed: "Maine Coon",
      ownerName: "Emma Wilson",
      phone: "+1 (555) 123-4567",
      reason: "Vaccination",
      status: "confirmed",
      notes: "Bring previous vaccination records",
      isNew: false,
      createdAt: new Date(),
    },
    {
      id: 2,
      date: new Date(),
      time: "10:30 AM",
      duration: "45 min",
      petName: "Rocky",
      petType: "Dog",
      petBreed: "German Shepherd",
      ownerName: "Michael Brown",
      phone: "+1 (555) 987-6543",
      reason: "Check-up after surgery",
      status: "confirmed",
      notes: "Remove stitches if healing properly",
      isNew: false,
      createdAt: new Date(),
    },
    {
      id: 3,
      date: new Date(),
      time: "12:00 PM",
      duration: "1 hour",
      petName: "Coco",
      petType: "Dog",
      petBreed: "Cocker Spaniel",
      ownerName: "Olivia Martinez",
      phone: "+1 (555) 234-5678",
      reason: "Skin condition",
      status: "pending",
      notes: "Recurring rash on the back",
      isNew: true,
      createdAt: new Date(),
    },
    {
      id: 4,
      date: new Date(),
      time: "02:15 PM",
      duration: "30 min",
      petName: "Leo",
      petType: "Cat",
      petBreed: "Tabby",
      ownerName: "David Garcia",
      phone: "+1 (555) 345-6789",
      reason: "Annual check-up",
      status: "confirmed",
      notes: "",
      isNew: false,
      createdAt: new Date(),
    },
    {
      id: 5,
      date: new Date(),
      time: "03:45 PM",
      duration: "45 min",
      petName: "Max",
      petType: "Dog",
      petBreed: "Golden Retriever",
      ownerName: "Sarah Johnson",
      phone: "+1 (555) 456-7890",
      reason: "Limping on front leg",
      status: "urgent",
      notes: "Possible fracture, needs X-ray",
      isNew: false,
      createdAt: new Date(),
    },
  ]);
  const [recentlyConfirmed, setRecentlyConfirmed] = useState(null);
  const [recentlyReminded, setRecentlyReminded] = useState(null); // Track recent reminders

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    return appointmentsState
      .filter(
        (appt) =>
          appt.date.toDateString() === selectedDate.toDateString() &&
          (filterStatus === "all" || appt.status === filterStatus) &&
          (appt.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            appt.ownerName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointmentsState, searchQuery, selectedDate, filterStatus]);

  // Status styling
  const getStatusStyles = (status) => {
    switch (status) {
      case "confirmed":
        return { border: "border-green-500", text: "text-green-600", label: "Confirmed" };
      case "pending":
        return { border: "border-yellow-500", text: "text-yellow-600", label: "Pending" };
      case "urgent":
        return { border: "border-red-500", text: "text-red-600", label: "Urgent" };
      case "cancelled":
        return { border: "border-red-400", text: "text-red-500", label: "Cancelled" };
      default:
        return { border: "border-gray-500", text: "text-gray-600", label: "Unknown" };
    }
  };

  // Pet icon
  const getPetIcon = (petType) => (petType.toLowerCase() === "cat" ? "🐱" : "🐶");

  // Date navigation
  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  // Confirm appointment
  const confirmAppointment = (id) => {
    setAppointmentsState((prev) =>
      prev.map((appt) =>
        appt.id === id && appt.status === "pending" ? { ...appt, status: "confirmed" } : appt
      )
    );
    setRecentlyConfirmed(id);
    setTimeout(() => setRecentlyConfirmed(null), 3000); // Undo option for 3 seconds
  };

  // Undo confirmation
  const undoConfirm = (id) => {
    setAppointmentsState((prev) =>
      prev.map((appt) =>
        appt.id === id && appt.status === "confirmed" ? { ...appt, status: "pending" } : appt
      )
    );
    setRecentlyConfirmed(null);
  };

  // Cancel appointment
  const cancelAppointment = (id) => {
    setAppointmentsState((prev) =>
      prev.map((appt) =>
        appt.id === id && appt.status === "pending" ? { ...appt, status: "cancelled" } : appt
      )
    );
  };

  // Send reminder (simulated)
  const sendReminder = (id, ownerName, phone) => {
    // In a real app, this would integrate with an SMS/email API
    console.log(`Sending reminder to ${ownerName} at ${phone}`);
    setRecentlyReminded(id);
    setTimeout(() => setRecentlyReminded(null), 3000); // Reset after 3 seconds
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2 sm:mb-0">
              Daily Schedule
            </h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
                aria-label="Previous day"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-lg font-medium text-gray-700">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <button
                onClick={() => changeDate(1)}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
                aria-label="Next day"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search pet or owner..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search appointments"
            />
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilterStatus("all")}
          >
            All
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === "confirmed"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilterStatus("confirmed")}
          >
            Confirmed
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === "pending"
                ? "bg-yellow-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === "urgent"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilterStatus("urgent")}
          >
            Urgent
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === "cancelled"
                ? "bg-red-400 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilterStatus("cancelled")}
          >
            Cancelled
          </button>
        </div>

        {/* Timeline List */}
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appt) => {
              const isExpanded = expandedId === appt.id;
              const isRecentlyConfirmed = recentlyConfirmed === appt.id;
              const isRecentlyReminded = recentlyReminded === appt.id;
              return (
                <div
                  key={appt.id}
                  className={`bg-white rounded-lg shadow-sm border-l-4 ${
                    getStatusStyles(appt.status).border
                  } p-4 transition-all ${isExpanded ? "ring-2 ring-blue-300" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getPetIcon(appt.petType)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                          {appt.petName}
                          {appt.isNew && (
                            <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {appt.time} • {appt.duration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`${getStatusStyles(appt.status).text} text-sm font-medium`}>
                        {getStatusStyles(appt.status).label}
                      </span>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : appt.id)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        aria-label="Toggle details"
                      >
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 border-t pt-3 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                        <div className="flex items-center">
                          <UserCircle className="w-4 h-4 mr-2 text-blue-500" />
                          {appt.ownerName}
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
                          {appt.reason}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-blue-500" />
                          {appt.phone}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-blue-500" />
                          {appt.petType} • {appt.petBreed}
                        </div>
                      </div>
                      {appt.notes && (
                        <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <span className="font-medium">Notes:</span> {appt.notes}
                        </div>
                      )}
                      <div className="mt-4 flex justify-end space-x-2">
                        <button
                          className="flex items-center text-sm text-gray-600 hover:text-blue-600 px-3 py-1 rounded hover:bg-blue-50"
                          onClick={() => alert(`Calling ${appt.ownerName} at ${appt.phone}`)}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </button>
                        {appt.status === "pending" && !isRecentlyConfirmed && (
                          <>
                            <button
                              onClick={() => sendReminder(appt.id, appt.ownerName, appt.phone)}
                              className={`flex items-center text-sm text-white px-3 py-1 rounded ${
                                isRecentlyReminded
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-blue-500 hover:bg-blue-600"
                              }`}
                              disabled={isRecentlyReminded}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {isRecentlyReminded ? "Reminded" : "Remind"}
                            </button>
                            <button
                              onClick={() => confirmAppointment(appt.id)}
                              className="flex items-center text-sm text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Confirm
                            </button>
                            <button
                              onClick={() => cancelAppointment(appt.id)}
                              className="flex items-center text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </button>
                          </>
                        )}
                        {isRecentlyConfirmed && (
                          <button
                            onClick={() => undoConfirm(appt.id)}
                            className="flex items-center text-sm text-white bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Undo
                          </button>
                        )}
                        {appt.status === "confirmed" && (
                          <button
                            className="flex items-center text-sm text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Check In
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 py-6">
              No appointments match your criteria for this day.
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <button
          className="fixed bottom-6 right-6 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600"
          aria-label="Add new appointment"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Inline Styles */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in;
          }
        `}</style>
      </div>
    </div>
  );
};

export default VetAppointments;