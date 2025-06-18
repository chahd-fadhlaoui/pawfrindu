import { Heart, PawPrint } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import HelpSection from "../components/common/HelpSection";
import PetDetailsModal from "../components/PetDetailsModal";
import AdoptionRequestsTab from "../components/PetManagement/AdoptionRequestsTab";
import PetPostsTab from "../components/PetManagement/PetPostsTab";
import { useApp } from "../context/AppContext";

const PawIcon = ({ className, style }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M12,17.5c2.33,2.33,5.67,2.33,8,0s2.33-5.67,0-8s-5.67-2.33-8,0S9.67,15.17,12,17.5z M7.5,14.5 c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S9.46,12.54,7.5,14.5z M18.5,3.5c-1.96-1.96-4.04-1.96-6,0s-1.96,4.04,0,6 s4.04,1.96,6,0S20.46,5.46,18.5,3.5z M3.5,9.5c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S5.46,7.54,3.5,9.5z" />
  </svg>
);

const PetManagementDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, error, setError, clearError, loading } = useApp();

  const [selectedPet, setSelectedPet] = useState(null);
  const [approvalMessage, setApprovalMessage] = useState("");

  useEffect(() => {
    if (!user?._id) navigate("/login");
  }, [user, navigate]);

  // Determine active tab based on URL
  const activeTab = location.pathname.includes("requests") ? "requests" : "posts";

  const PawBackground = () => (
    Array(8)
      .fill(null)
      .map((_, index) => (
        <PawIcon
          key={index}
          className={`absolute w-8 h-8 opacity-5 animate-float ${
            index % 2 === 0 ? "text-[#ffc929]" : "text-pink-300"
          } ${index % 3 === 0 ? "top-1/4" : index % 3 === 1 ? "top-1/2" : "top-3/4"} ${
            index % 4 === 0 ? "left-1/4" : index % 4 === 1 ? "left-1/2" : "left-3/4"
          }`}
          style={{ animationDelay: `${index * 0.5}s`, transform: `rotate(${index * 45}deg)` }}
        />
      ))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-pink-50">
        <div className="text-center animate-pulse">
          <PawPrint size={48} className="mx-auto text-[#ffc929]" />
          <p className="mt-4 text-lg font-medium text-gray-600">Fetching your pet data...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen px-4 py-12 overflow-hidden bg-gradient-to-br from-white to-pink-50 sm:py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <PawBackground />
      </div>
      <div className="relative mx-auto space-y-12 max-w-7xl">
        {/* Header */}
        <div className="pt-16 space-y-6 text-center animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-[#ffc929]/20 rounded-full shadow-sm">
            <Heart className="w-4 h-4 mr-2 text-[#ffc929]" />
            Pet Management
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            <span className="block">Your</span>
            <span className="block text-pink-500">Pet Dashboard</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600">
            Handle your pet listings and adoption requests with ease.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white backdrop-blur-sm bg-opacity-90 border-2 border-[#ffc929]/20 shadow-xl rounded-3xl p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
            <button
              onClick={() => navigate("/list/posts")}
              className={`relative flex-1 max-w-[200px] px-5 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-[#ffc929]/20 rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-[#ffc929]/5 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30 ${
                activeTab === "posts"
                  ? "bg-gradient-to-r from-[#ffc929] to-[#ffa726] text-white border-[#ffc929]"
                  : ""
              }`}
              aria-label="View My Pet Posts"
              aria-pressed={activeTab === "posts"}
            >
              <span className="flex items-center justify-center gap-2">
                <PawPrint size={18} className={activeTab === "posts" ? "text-white" : "text-gray-500"} />
                My Pet Posts
              </span>
            </button>
            <button
              onClick={() => navigate("/list/requests")}
              className={`relative flex-1 max-w-[200px] px-5 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-[#ffc929]/20 rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-[#ffc929]/5 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30 ${
                activeTab === "requests"
                  ? "bg-gradient-to-r from-[#ffc929] to-[#ffa726] text-white border-[#ffc929]"
                  : ""
              }`}
              aria-label="View My Adoption Requests"
              aria-pressed={activeTab === "requests"}
            >
              <span className="flex items-center justify-center gap-2">
                <Heart size={18} className={activeTab === "requests" ? "text-white" : "text-gray-500"} />
                Adoption Requests
              </span>
            </button>
          </div>

          {/* Alerts */}
          {(error || approvalMessage) && (
            <div className="mt-6 space-y-3 animate-fadeIn" style={{ animationDelay: "0.4s" }}>
              {error && (
                <div className="p-4 text-sm text-red-600 border border-red-100 shadow-sm bg-red-50 rounded-xl">
                  <Alert message={error} onClose={clearError} />
                </div>
              )}
              {approvalMessage && (
                <div className="bg-[#ffc929]/10 border border-[#ffc929]/20 rounded-xl p-4 text-sm text-[#ffc929] shadow-sm">
                  <Alert message={approvalMessage} type="info" onClose={() => setApprovalMessage("")} />
                </div>
              )}
            </div>
          )}

          {/* Tab Content */}
          <div
            className="mt-6 bg-white border-2 border-[#ffc929]/20 rounded-xl shadow-md p-6 animate-fadeIn"
            style={{ animationDelay: "0.6s" }}
          >
            {activeTab === "posts" ? (
              <>
                <PetPostsTab setSelectedPet={setSelectedPet} setApprovalMessage={setApprovalMessage} />
                <HelpSection show={true} title="How to Manage Posts" className="mt-4 text-sm text-gray-600">
                  <p>Click a pet to edit—admin approval needed.</p>
                  <p>View candidates for adoption interest.</p>
                  <p>Delete posts instantly with the trash icon.</p>
                </HelpSection>
              </>
            ) : (
              <>
                <AdoptionRequestsTab setSelectedPet={setSelectedPet} />
                <HelpSection show={true} title="How to Manage Requests" className="mt-4 text-sm text-gray-600">
                  <p>Eye icon shows pet details.</p>
                  <p>Approval pending until owner confirms.</p>
                  <p>Track status updates here.</p>
                </HelpSection>
              </>
            )}
          </div>
        </div>

        {/* Modal */}
        {selectedPet && (
          <PetDetailsModal
            pet={selectedPet}
            onClose={() => setSelectedPet(null)}
            showOwner={activeTab === "requests"}
          />
        )}
      </div>
    </section>
  );
};

export default PetManagementDashboard;