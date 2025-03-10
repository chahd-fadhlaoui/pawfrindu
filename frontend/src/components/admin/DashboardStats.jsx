import React, { useEffect, useState } from "react";
import { Users, Shield, PieChart, BarChart3, RefreshCw, AlertCircle, X } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const DashboardStats = ({ onRefresh }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    archivedUsers: 0,
    pendingUsers: 0,
    totalPets: 0,
    pendingPets: 0,
    adoptedPets: 0,
    adoptionPendingPets: 0,
    archivedPets: 0,
    lastRefreshed: new Date().toLocaleTimeString(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userStatsRes, petStatsRes] = await Promise.all([
        axiosInstance.get("/api/user/stats"),
        axiosInstance.get("/api/pet/stats"),
      ]);

      const userStats = userStatsRes.data.stats || {};
      const petStats = petStatsRes.data.stats || {};

      setStats({
        totalUsers: userStats.totalUsers || 0,
        activeUsers: userStats.activeUsers || 0,
        inactiveUsers: userStats.inactiveUsers || 0,
        archivedUsers: userStats.archivedUsers || 0,
        pendingUsers: userStats.pendingUsers || 0,
        totalPets: petStats.totalPets || 0,
        pendingPets: petStats.pendingPets || 0,
        adoptedPets: petStats.adoptedPets || 0,
        adoptionPendingPets: petStats.adoptionPendingPets || 0,
        archivedPets: petStats.archivedPets || 0,
        lastRefreshed: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      setError("Failed to fetch stats: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchStats();
    if (onRefresh) onRefresh();
    setLoading(false);
  };

  return (
    <div className="overflow-hidden transition-all duration-300 bg-white shadow-md rounded-xl">
      {/* Header */}
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-[#ffc929] to-[#ec4899]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Dashboard Statistics</h1>
            <p className="text-sm text-white/90">
              {new Date().toLocaleDateString()} • Last refresh: {stats.lastRefreshed}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="mt-4 md:mt-0 flex items-center px-4 py-1.5 text-sm font-medium text-[#ec4899] bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffc929] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
        <div className="transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
          <div className="flex items-center p-4">
            <div className="flex items-center justify-center p-2 mr-3 rounded-lg bg-yellow-50">
              <Users className="w-5 h-5 text-[#ffc929]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
          <div className="flex items-center p-4">
            <div className="flex items-center justify-center p-2 mr-3 rounded-lg bg-pink-50">
              <Shield className="w-5 h-5 text-[#ec4899]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pets</p>
              <p className="text-xl font-semibold text-gray-900">{stats.totalPets}</p>
            </div>
          </div>
        </div>
        <div className="transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
          <div className="flex items-center p-4">
            <div className="flex items-center justify-center p-2 mr-3 rounded-lg bg-yellow-50">
              <PieChart className="w-5 h-5 text-[#ffc929]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Pets</p>
              <p className="text-xl font-semibold text-gray-900">{stats.pendingPets}</p>
            </div>
          </div>
        </div>
        <div className="transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
          <div className="flex items-center p-4">
            <div className="flex items-center justify-center p-2 mr-3 rounded-lg bg-pink-50">
              <BarChart3 className="w-5 h-5 text-[#ec4899]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Adopted Pets</p>
              <p className="text-xl font-semibold text-gray-900">{stats.adoptedPets}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center p-4 transition-all duration-300 border-t border-gray-200 bg-red-50">
          <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-500" />
          <span className="flex-1 ml-3 text-sm font-medium text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="p-1 ml-auto text-red-500 transition-all duration-200 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;