import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { AlertCircle, BarChart3, PieChart, RefreshCw, Shield, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import axiosInstance from "../../utils/axiosInstance";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const DashboardStats = ({ onRefresh }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    archivedUsers: 0,
    pendingUsers: 0,
    totalPets: 0,
    pendingPets: 0,
    acceptedPets: 0,
    adoptionPendingPets: 0,
    adoptedPets: 0,
    soldPets: 0,
    archivedPets: 0,
    approvedPets: 0,
    lastRefreshed: new Date().toLocaleTimeString(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

const fetchStats = async () => {
  setLoading(true);
  setError(null);
  try {
    console.log('Fetching stats with token:', localStorage.getItem('token')?.substring(0, 10) + '...');
    const [userStatsRes, petStatsRes] = await Promise.all([
      axiosInstance.get('/api/user/stats'),
      axiosInstance.get('/api/pet/stats').catch((err) => ({
        data: { stats: {} },
        error: err,
      })),
    ]);

    const userStats = userStatsRes.data.stats || {};
    const petStats = petStatsRes.error ? {} : petStatsRes.data.stats || {};

    if (petStatsRes.error) {
      const errorMessage = petStatsRes.error.response?.status === 403
        ? 'You do not have permission to view pet statistics.'
        : `Failed to fetch pet stats: ${petStatsRes.error.response?.data?.message || petStatsRes.error.message}`;
      setError(errorMessage);
      console.error('Pet stats error:', {
        status: petStatsRes.error.response?.status,
        data: petStatsRes.error.response?.data,
        message: petStatsRes.error.message,
      });
    }

    setStats({
      totalUsers: userStats.totalUsers || 0,
      activeUsers: userStats.activeUsers || 0,
      inactiveUsers: userStats.inactiveUsers || 0,
      archivedUsers: userStats.archivedUsers || 0,
      pendingUsers: userStats.pendingUsers || 0,
      totalPets: petStats.totalPets || 0,
      pendingPets: petStats.pendingPets || 0,
      acceptedPets: petStats.acceptedPets || 0,
      adoptionPendingPets: petStats.adoptionPendingPets || 0,
      adoptedPets: petStats.adoptedPets || 0,
      soldPets: petStats.soldPets || 0,
      archivedPets: petStats.archivedPets || 0,
      approvedPets: petStats.approvedPets || 0,
      lastRefreshed: new Date().toLocaleTimeString(),
    });
  } catch (err) {
    const errorMessage = err.response?.status === 403
      ? 'You do not have permission to view these statistics.'
      : `Failed to fetch stats: ${err.response?.data?.message || err.message}`;
    setError(errorMessage);
    console.error('fetchStats error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });
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

  // User Bar Chart Data
  const userChartData = {
    labels: ["Active", "Inactive", "Archived", "Pending"],
    datasets: [
      {
        label: "Users",
        data: [stats.activeUsers, stats.inactiveUsers, stats.archivedUsers, stats.pendingUsers],
        backgroundColor: ["#ffc929cc", "#f59e0bcc", "#ec4899cc", "#d97706cc"],
        borderColor: ["#ffc929", "#f59e0b", "#ec4899", "#d97706"],
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: ["#ffc929", "#f59e0b", "#ec4899", "#d97706"],
        hoverBorderWidth: 3,
      },
    ],
  };

  const userChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 14, weight: "bold" }, color: "#374151" },
      },
      title: {
        display: true,
        text: "User Distribution",
        font: { size: 18, weight: "bold" },
        color: "#1f2937",
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.raw} (${((context.raw / stats.totalUsers) * 100).toFixed(1)}%)`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Number of Users", font: { size: 14 }, color: "#6b7280" },
        grid: { color: "#e5e7eb" },
        ticks: { color: "#6b7280", font: { size: 12 } },
      },
      x: {
        title: { display: true, text: "User Status", font: { size: 14 }, color: "#6b7280" },
        grid: { display: false },
        ticks: { color: "#6b7280", font: { size: 12 } },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  // Pet Pie Chart Data
  const petChartData = {
    labels: ["Pending", "Accepted", "Adoption Pending", "Adopted", "Sold", "Archived"],
    datasets: [
      {
        label: "Pets",
        data: [
          stats.pendingPets,
          stats.acceptedPets,
          stats.adoptionPendingPets,
          stats.adoptedPets,
          stats.soldPets,
          stats.archivedPets,
        ],
        backgroundColor: ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#6b7280"],
        borderColor: ["#fff"],
        borderWidth: 2,
        hoverOffset: 12,
        hoverBorderWidth: 3,
      },
    ],
  };

  const petChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 14, weight: "bold" }, color: "#374151" },
      },
      title: {
        display: true,
        text: "Pet Status Distribution",
        font: { size: 18, weight: "bold" },
        color: "#1f2937",
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        callbacks: {
          label: (context) =>
            `${context.label}: ${context.raw} (${((context.raw / stats.totalPets) * 100).toFixed(1)}%)`,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  return (
    <div className="relative overflow-hidden bg-white border border-gray-100 shadow-2xl rounded-2xl">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-[#ffc929] via-[#f59e0b] to-[#ec4899] text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Statistics</h1>
            <p className="text-sm opacity-90">
              Updated as of {stats.lastRefreshed} • {new Date().toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-semibold text-[#ec4899] bg-white rounded-lg shadow-md hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4 bg-gray-50">
        {[
          { icon: <Users className="w-6 h-6 text-[#ffc929]" />, label: "Total Users", value: stats.totalUsers, bg: "bg-yellow-50" },
          { icon: <Shield className="w-6 h-6 text-[#ec4899]" />, label: "Total Pets", value: stats.totalPets, bg: "bg-pink-50" },
          { icon: <PieChart className="w-6 h-6 text-[#ffc929]" />, label: "Pending Pets", value: stats.pendingPets, bg: "bg-yellow-50" },
          { icon: <BarChart3 className="w-6 h-6 text-[#ec4899]" />, label: "Adopted Pets", value: stats.adoptedPets, bg: "bg-pink-50" },
        ].map((stat, index) => (
          <div
            key={index}
            className="p-4 transition-all duration-300 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center">
              <div className={`flex items-center justify-center p-3 mr-4 rounded-full ${stat.bg}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
        <div
          className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl animate-fade-in-up"
          style={{ height: "400px", animationDelay: "400ms" }}
        >
          <Bar data={userChartData} options={userChartOptions} />
        </div>
        <div
          className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl animate-fade-in-up"
          style={{ height: "400px", animationDelay: "500ms" }}
        >
          <Pie data={petChartData} options={petChartOptions} />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center p-4 border-t border-gray-200 bg-red-50 animate-slide-in">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="ml-3 text-sm font-medium text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="p-1 ml-auto text-red-500 transition-all duration-200 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Skeleton Loading */}
      {loading && (
        <div className="absolute inset-0 flex flex-col gap-6 p-6 bg-opacity-75 bg-gray-50">
          <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array(4)
              .fill()
              .map((_, index) => (
                <div key={index} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
              ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-gray-200 h-96 rounded-xl animate-pulse" />
            <div className="bg-gray-200 h-96 rounded-xl animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
