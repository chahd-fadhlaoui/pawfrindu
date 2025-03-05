import React, { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import UsersTable from "../../components/admin/UsersTable";
import PetsManagement from "../../components/admin/PetsManagement";
import { useApp } from "../../context/AppContext";
import axiosInstance from "../../utils/axiosInstance";

const AdminDashboard = () => {
  const { fetchPets, triggerPetsRefresh } = useApp();
  const [activeTab, setActiveTab] = useState("pets");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (activeTab === "pets") {
      fetchPets();
    }
  }, [activeTab, fetchPets]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/api/user/getAllUsers");
      const userData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.users)
        ? response.data.users
        : [];
      setUsers(userData);
    } catch (err) {
      setError("Failed to fetch users: " + (err.response?.data?.message || err.message));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const handlePetChange = () => {
    triggerPetsRefresh();
  };

  const handleCollapsedChange = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onCollapsedChange={handleCollapsedChange} 
      />
      <main 
        className={`
          flex-1 p-6 overflow-auto transition-all duration-300
          ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}
          w-full
        `}
      >
        <div className="w-full mx-auto space-y-6 max-w-7xl">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {activeTab === "users" ? "User Management" : "Pet Management"}
            </h1>
            <p className="text-gray-600 text-md">
              {activeTab === "users"
                ? "Manage platform users efficiently."
                : "Oversee and manage all pet profiles."}
            </p>
          </div>
          {error && (
            <div className="p-4 text-red-700 border-l-4 border-red-500 rounded-lg bg-red-50">
              {error}
            </div>
          )}
          <div className="bg-white border border-gray-200 shadow-md rounded-xl">
            {activeTab === "users" ? (
              <UsersTable users={users} loading={loading} error={error} />
            ) : (
              <PetsManagement onPetChange={handlePetChange} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;