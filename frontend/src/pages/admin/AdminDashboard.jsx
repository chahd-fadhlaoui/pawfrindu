import React, { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import UsersTable from "../../components/admin/UsersTable";
import PetsTable from "../../components/admin/PetsTable";
import ArchivedPetsTable from "../../components/admin/ArchivedPetsTable";
import { useApp } from "../../context/AppContext";
import axiosInstance from "../../utils/axiosInstance";

const AdminDashboard = () => {
  const { pets, fetchPets, triggerPetsRefresh } = useApp();
  const [activeTab, setActiveTab] = useState("pets");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === "pets" || activeTab === "archived") {
      fetchPets();
    }
  }, [activeTab, fetchPets]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching users...");
      const response = await axiosInstance.get("/api/user/getAllUsers");
      console.log("API Response:", response);
      if (!response.data) {
        throw new Error("No data received from API");
      }
      const userData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.users)
        ? response.data.users
        : [];
      console.log("Processed users data:", userData);
      setUsers(userData);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Unknown error";
      setError("Failed to fetch users: " + errorMessage);
      console.error("Error fetching users:", {
        error: err,
        response: err.response, // No trailing comma here
        message: errorMessage // No trailing comma needed as last property
      });
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 p-6 overflow-auto">
        <div className="mx-auto space-y-6 max-w-7xl">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {activeTab === "users"
                ? "User Management"
                : activeTab === "pets"
                ? "Pet Management"
                : "Archived Pets"}
            </h1>
            <p className="text-gray-600 text-md">
              {activeTab === "users"
                ? "Manage platform users efficiently."
                : activeTab === "pets"
                ? "Oversee pet profiles awaiting adoption."
                : "View and manage archived pet records."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 text-red-700 border-l-4 border-red-500 rounded-lg shadow-sm bg-red-50">
              {error}
            </div>
          )}

          {/* Content Area */}
          <div className="overflow-hidden bg-white border border-gray-200 shadow-md rounded-xl">
            {activeTab === "users" ? (
              <UsersTable users={users} loading={loading} error={error} />
            ) : activeTab === "pets" ? (
              <PetsTable onPetChange={handlePetChange} />
            ) : (
              <ArchivedPetsTable />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;