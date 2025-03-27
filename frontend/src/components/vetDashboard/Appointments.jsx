import React, { useState } from "react";
import { 
  CalendarCheck, CalendarClock, CalendarX, Calendar, 
  Plus, Filter, MapPin, Clock, UserIcon, MessageSquare 
} from "lucide-react";

const Appointments = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: "all",
    petType: "all"
  });

  const tabs = [
    { key: "all", label: "All Appointments", icon: Calendar, count: 10, color: "bg-blue-100 text-blue-600" },
    { key: "confirmed", label: "Confirmed", icon: CalendarCheck, count: 5, color: "bg-green-100 text-green-600" },
    { key: "pending", label: "Pending", icon: CalendarClock, count: 3, color: "bg-yellow-100 text-yellow-600" },
    { key: "completed", label: "Completed", icon: CalendarX, count: 2, color: "bg-gray-100 text-gray-600" },
  ];

  const appointments = {
    all: [
      { 
        id: 1, 
        pet: { name: "Max", type: "Dog", breed: "Labrador" }, 
        owner: { name: "John Doe", phone: "+216 XX XXX XXX" },
        date: "2024-04-15", 
        time: "10:00 AM", 
        status: "Confirmed",
        reason: "Annual Check-up",
        notes: "Vaccination update needed"
      },
      { 
        id: 2, 
        pet: { name: "Luna", type: "Cat", breed: "Siamese" }, 
        owner: { name: "Jane Smith", phone: "+216 XX XXX XXX" },
        date: "2024-04-16", 
        time: "02:30 PM", 
        status: "Pending",
        reason: "Skin Condition",
        notes: "Bring recent blood work"
      },
    ],
    confirmed: [
      { 
        id: 1, 
        pet: { name: "Max", type: "Dog", breed: "Labrador" }, 
        owner: { name: "John Doe", phone: "+216 XX XXX XXX" },
        date: "2024-04-15", 
        time: "10:00 AM", 
        status: "Confirmed",
        reason: "Annual Check-up",
        notes: "Vaccination update needed"
      },
    ],
    pending: [
      { 
        id: 2, 
        pet: { name: "Luna", type: "Cat", breed: "Siamese" }, 
        owner: { name: "Jane Smith", phone: "+216 XX XXX XXX" },
        date: "2024-04-16", 
        time: "02:30 PM", 
        status: "Pending",
        reason: "Skin Condition",
        notes: "Bring recent blood work"
      },
    ],
    completed: [
      { 
        id: 3, 
        pet: { name: "Buddy", type: "Dog", breed: "Golden Retriever" }, 
        owner: { name: "Mike Johnson", phone: "+216 XX XXX XXX" },
        date: "2024-04-10", 
        time: "11:15 AM", 
        status: "Completed",
        reason: "Regular Check-up",
        notes: "All tests normal"
      },
    ]
  };

  const AppointmentCard = ({ appointment }) => (
    <div className="bg-white border border-gray-100 rounded-xl shadow-md p-5 space-y-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-lg">
            <UserIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{appointment.pet.name}</h3>
            <p className="text-sm text-gray-600">
              {appointment.pet.type} - {appointment.pet.breed}
            </p>
          </div>
        </div>
        <span 
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            appointment.status === "Confirmed" ? "bg-green-100 text-green-700" :
            appointment.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
            "bg-gray-100 text-gray-700"
          }`}
        >
          {appointment.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-purple-500" />
          <span className="text-sm text-gray-700">
            {appointment.date} at {appointment.time}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-teal-500" />
          <span className="text-sm text-gray-700">{appointment.reason}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-4 border-gray-100">
        <div className="flex items-center space-x-2">
          <UserIcon className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-gray-700">{appointment.owner.name}</span>
        </div>
        <button className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex space-x-2 overflow-x-auto w-full md:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm font-medium 
                ${activeTab === tab.key 
                  ? `${tab.color} shadow-md` 
                  : "text-gray-600 hover:bg-gray-100"
                }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon className="w-5 h-5" />
              <span>{`${tab.label} (${tab.count})`}</span>
            </button>
          ))}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="p-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Filter className="w-5 h-5" />
          </button>
          <button className="flex items-center px-4 py-2.5 text-white bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg shadow-md hover:from-purple-600 hover:to-teal-600">
            <Plus className="w-5 h-5 mr-2" />
            Add Appointment
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">Filters</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              >
                <option value="all">All Dates</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pet Type</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={filters.petType}
                onChange={(e) => setFilters({...filters, petType: e.target.value})}
              >
                <option value="all">All Pets</option>
                <option value="dog">Dogs</option>
                <option value="cat">Cats</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {tabs.find(tab => tab.key === activeTab).label}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {appointments[activeTab].map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Appointments;