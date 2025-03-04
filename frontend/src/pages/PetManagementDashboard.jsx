import { Heart, PawPrint } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import PetDetailsModal from "../components/PetDetailsModal";
import AdoptionRequestsTab from "../components/PetManagement/AdoptionRequestsTab";
import PetPostsTab from "../components/PetManagement/PetPostsTab";
import { useApp } from "../context/AppContext";

// Main Dashboard Component
const PetManagementDashboard = () => {
  const navigate = useNavigate();
  const { user, error, setError, clearError } = useApp();

  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPet, setSelectedPet] = useState(null);
  const [approvalMessage, setApprovalMessage] = useState("");

  useEffect(() => {
    if (!user?._id) navigate("/login"); // Redirect if not authenticated
  }, [user, navigate]);

  const PawBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array(8)
        .fill(null)
        .map((_, index) => (
          <PawPrint
            key={index}
            size={48}
            className={`absolute opacity-5 animate-float ${
              index % 2 === 0 ? "text-[#ffc929]" : "text-pink-300"
            } ${
              index % 3 === 0
                ? "top-1/4"
                : index % 3 === 1
                ? "top-1/2"
                : "top-3/4"
            } ${
              index % 4 === 0
                ? "left-1/4"
                : index % 4 === 1
                ? "left-1/2"
                : "left-3/4"
            }`}
            style={{
              animationDelay: `${index * 0.5}s`,
              transform: `rotate(${index * 45}deg)`,
            }}
          />
        ))}
    </div>
  );

  return (
    <section className="relative min-h-screen px-4 py-12 sm:py-20 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-pink-50">
      <PawBackground />
      <div className="relative mx-auto space-y-12 max-w-7xl">
        {/* Header */}
        <div className="pt-16 space-y-6 text-center animate-fadeIn">
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-[#ffc929]/20 rounded-full shadow-sm">
            <Heart className="w-4 h-4 mr-2 text-[#ffc929]" />
            Pet Management
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            <span className="block">Your</span>
            <span className="block text-pink-500">Pet Dashboard</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600">
            Manage your pet listings and adoption requests in one place.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
              activeTab === "posts"
                ? "bg-[#ffc929] text-white shadow-md"
                : "bg-white text-gray-700 border border-[#ffc929]/20 hover:bg-[#ffc929]/10"
            }`}
          >
            My Pet Posts
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
              activeTab === "requests"
                ? "bg-[#ffc929] text-white shadow-md"
                : "bg-white text-gray-700 border border-[#ffc929]/20 hover:bg-[#ffc929]/10"
            }`}
          >
            My Adoption Requests
          </button>
        </div>

        {/* Alerts */}
        {error && <Alert message={error} onClose={clearError} />}
        {approvalMessage && (
          <Alert
            message={approvalMessage}
            type="info"
            onClose={() => setApprovalMessage("")}
          />
        )}

        {/* Tab Content */}
        {activeTab === "posts" ? (
          <PetPostsTab
            setSelectedPet={setSelectedPet}
            setApprovalMessage={setApprovalMessage}
          />
        ) : (
          <AdoptionRequestsTab setSelectedPet={setSelectedPet} />
        )}

        {/* Modal */}
        {selectedPet && (
          <PetDetailsModal
            pet={selectedPet}
            onClose={() => setSelectedPet(null)}
            showOwner={activeTab === "requests"} // Show owner only in AdoptionRequestsTab
          />
        )}
      </div>
    </section>
  );
};

export default PetManagementDashboard;
