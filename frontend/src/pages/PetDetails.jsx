import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  DollarSign,
  Heart,
  Info,
  MapPin,
  PawPrint,
  X,
  Zap,
} from "lucide-react";
import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import axiosInstance from "../utils/axiosInstance";

const PetApplicationForm = lazy(() => import("../components/PetApplicationForm"));
const HelpSection = lazy(() => import("../components/common/HelpSection"));

const PetDetails = () => {
  const navigate = useNavigate();
  const { petId } = useParams();
  const {
    currencySymbol,
    user,
    loading: contextLoading,
    pets,
    applications,
    applyToAdopt,
    socket,
    getMyAdoptionRequests,
  } = useApp();
  const [petInfo, setPetInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // Derive hasApplied synchronously from applications state
  console.log("Applications state in PetDetails:", applications);
  const hasApplied = user && applications.some((app) => 
    app.pet._id === petId && 
    (typeof app.user === 'string' ? app.user === user._id : app.user?._id === user._id)
  );
  console.log("hasApplied:", hasApplied, { petId, userId: user?._id });
  console.log("Applications content:", applications.map(app => ({
    petId: app.pet._id,
    userId: typeof app.user === 'string' ? app.user : app.user?._id,
    status: app.status
  })));
  
  const fetchPetDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const contextPet = pets.find((p) => p._id === petId);
      if (contextPet) {
        setPetInfo(contextPet);
      } else {
        const response = await axiosInstance.get(`/api/pet/pets/${petId}`);
        if (response.data.success) {
          setPetInfo(response.data.data);
        } else {
          throw new Error(response.data.message || "Failed to fetch pet details");
        }
      }
      setError(null);
    } catch (err) {
      setError(err.message || "An error occurred while fetching pet details");
      setPetInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [petId, user, pets]);

  useEffect(() => {
    if (petId) fetchPetDetails();
  }, [petId, fetchPetDetails]);

  useEffect(() => {
    if (!user || !petId) return;
    const fetchApplications = async () => {
      const result = await getMyAdoptionRequests();
      if (result.success) {
        console.log("Fetched applications on mount:", result.data);
      } else {
        console.error("Failed to fetch applications:", result.error);
      }
    };
    fetchApplications();
  }, [user, petId, getMyAdoptionRequests]);

  useEffect(() => {
    if (!socket) return;

    const handlePetUpdated = (data) => {
      if (data.petId === petId) {
        setPetInfo((prev) => ({ ...prev, ...data.updatedPet }));
      }
    };

    const handleAdoptionApplied = async (data) => {
      if (data.petId === petId && user?._id === data.userId) {
        try {
          const result = await getMyAdoptionRequests();
          if (!result.success) {
            console.error("Failed to refresh applications:", result.error);
            setError(result.error);
          }
        } catch (err) {
          console.error("Socket sync failed:", err);
          setError("Failed to sync adoption status");
        }
      }
    };

    const handleCandidateStatusUpdated = (data) => {
      if (data.petId === petId) {
        fetchPetDetails();
      }
    };

    socket.on("petUpdated", handlePetUpdated);
    socket.on("adoptionApplied", handleAdoptionApplied);
    socket.on("candidateStatusUpdated", handleCandidateStatusUpdated);

    return () => {
      socket.off("petUpdated", handlePetUpdated);
      socket.off("adoptionApplied", handleAdoptionApplied);
      socket.off("candidateStatusUpdated", handleCandidateStatusUpdated);
    };
  }, [petId, user, fetchPetDetails, getMyAdoptionRequests, socket]);

  const handleApplyNowClick = () => {
    if (!user) return navigate("/login", { state: { from: `/pet/${petId}` } });
    if (hasApplied) return;
    setShowForm(true);
  };

  const handleApplicationSuccess = async () => {
    setShowForm(false);
    try {
      const result = await getMyAdoptionRequests();
      if (result.success) {
        console.log("Applications after success:", result.data);
      } else {
        setError("Failed to refresh adoption requests");
      }
    } catch (err) {
      setError("Error syncing adoption requests: " + err.message);
    }
  };

  const handleImageError = (e) => {
    e.target.src = "https://placehold.co/600x600?text=No+Image";
    e.target.classList.add("opacity-50");
  };

  if (contextLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-pink-50 to-[#ffc929]/10">
        <div className="p-8 text-center bg-white shadow-xl rounded-2xl animate-pulse">
          <PawPrint size={72} className="mx-auto text-[#ffc929]" />
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Loading...</h2>
          <p className="mt-2 text-gray-500">Finding your perfect companion...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-pink-50 to-[#ffc929]/10">
        <div className="p-8 space-y-6 text-center bg-white border border-[#ffc929]/10 shadow-2xl rounded-3xl">
          <AlertCircle size={56} className="mx-auto text-red-500" />
          <div>
            <p className="mb-2 text-xl font-semibold text-red-600">{error}</p>
            <p className="mb-4 text-sm text-gray-500">We couldn't fetch the pet details. Please try again.</p>
          </div>
          <button
            onClick={() => navigate("/pets")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ffc929] to-[#ffa726] text-white font-semibold rounded-full hover:shadow-lg hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300"
          >
            <ChevronLeft size={20} /> Back to Pets
          </button>
        </div>
      </div>
    );
  }

  if (!petInfo) return null;

  const isOwner = user && petInfo.owner?._id === user._id;
  const imageUrl = petInfo.image || "https://placehold.co/600x600?text=No+Image";
  const longDescription = petInfo.description && petInfo.description.length > 200;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-pink-50 to-[#ffc929]/10">
      <div className="mx-auto space-y-12 max-w-7xl">
        {/* Header */}
        <div className="pt-16 space-y-6 text-center animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <button
            onClick={() => navigate("/pets")}
            className="absolute left-0 top-16 group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ffc929] to-[#ffa726] text-white font-medium rounded-full shadow-md hover:shadow-lg hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300"
            aria-label="Back to pets"
          >
            <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Back to Pets
          </button>
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-[#ffc929]/20 rounded-full shadow-sm">
            <Heart className="w-4 h-4 mr-2 text-[#ffc929]" />
            Pet Details
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            <span className="block">Meet</span>
            <span className="block text-pink-500">{petInfo.name}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600">
            Discover more about your potential new companion!
          </p>
        </div>

        {/* Main Content */}
        <main className="space-y-10">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#ffc929]/10 overflow-hidden">
            <div className="grid gap-12 p-8 md:grid-cols-2 lg:p-12">
              {/* Pet Image */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-br from-[#ffc929]/20 to-pink-200/20 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                <img
                  src={imageUrl}
                  alt={`${petInfo.name} - ${petInfo.species}`}
                  className="relative z-10 w-full aspect-square object-cover rounded-3xl shadow-lg group-hover:scale-[1.02] transition-transform duration-300"
                  onError={handleImageError}
                  loading="lazy"
                />
              </div>

              {/* Pet Details */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">{petInfo.name}</h2>
                  <p className="flex items-center gap-2 text-lg text-gray-600">
                    <PawPrint size={20} className="text-[#ffc929]" />
                    {petInfo.species.charAt(0).toUpperCase() + petInfo.species.slice(1)}
                    {petInfo.breed && ` • ${petInfo.breed}`}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-3">
                  {[
                    petInfo.isTrained && { icon: Zap, text: "Trained", color: "text-[#ffc929] bg-[#ffc929]/10" },
                    petInfo.fee === 0
                      ? { icon: DollarSign, text: "Free", color: "text-green-600 bg-green-50" }
                      : { icon: DollarSign, text: "Fee Required", color: "text-pink-600 bg-pink-50" },
                    hasApplied && { icon: CheckCircle, text: "Applied", color: "text-blue-600 bg-blue-50" },
                  ]
                    .filter(Boolean)
                    .map(({ icon: Icon, text, color }, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium ${color} rounded-full shadow-sm border border-[#ffc929]/20`}
                      >
                        <Icon size={14} /> {text}
                      </span>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {isOwner ? (
                    <div className="px-6 py-4 font-semibold text-center text-gray-600 bg-gray-100 rounded-xl">
                      You Own This Pet
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleApplyNowClick}
                        disabled={hasApplied}
                        className={`
                          flex-1 py-4 px-6 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 
                          group flex items-center justify-center gap-2 relative overflow-hidden
                          ${hasApplied
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#ffc929] to-[#ffa726] text-white hover:from-[#ffdd58] hover:to-[#ffab00] hover:scale-[1.02] focus:ring-4 focus:ring-[#ffc929]/50"}
                        `}
                        aria-label={hasApplied ? "Application submitted" : "Apply to adopt"}
                      >
                        {hasApplied
                          ? "Application Submitted"
                          : petInfo.fee === 0
                          ? "Apply Now"
                          : `Adopt for ${petInfo.fee}${currencySymbol}`}
                        {!hasApplied && (
                          <ChevronLeft size={20} className="transition-transform rotate-180 group-hover:translate-x-1" />
                        )}
                      </button>
                    </div>
                  )}
                  {!isOwner && !hasApplied && (
                    <p className="text-sm text-center text-gray-500">
                      {petInfo.fee === 0 ? "Adopt for free today!" : "A small fee secures your new companion"}
                    </p>
                  )}
                </div>

                {/* Pet Info Grid */}
                <div className="grid grid-cols-2 gap-4 bg-white/80 p-6 rounded-xl shadow-md border border-[#ffc929]/10">
                  {[
                    { icon: MapPin, label: "Location", value: petInfo.city },
                    { icon: Calendar, label: "Age", value: petInfo.age.charAt(0).toUpperCase() + petInfo.age.slice(1) },
                    { icon: Info, label: "Gender", value: petInfo.gender.charAt(0).toUpperCase() + petInfo.gender.slice(1) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 hover:bg-[#ffc929]/5 p-2 rounded-lg transition-colors">
                      <Icon size={20} className="text-[#ffc929] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">{label}</p>
                        <p className="text-base font-medium text-gray-800">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* About Section */}
                <div className="bg-white/80 p-6 rounded-xl shadow-md border border-[#ffc929]/10 group">
                  <h2 className="flex items-center gap-2 mb-3 text-xl font-semibold text-gray-800">
                    <PawPrint size={24} className="text-[#ffc929] group-hover:animate-bounce transition-transform" />
                    About {petInfo.name}
                  </h2>
                  <p
                    className={`text-sm leading-relaxed text-gray-700 ${
                      longDescription && !descriptionExpanded ? "line-clamp-3" : ""
                    }`}
                  >
                    {petInfo.description || `${petInfo.name} is waiting for a loving home!`}
                  </p>
                  {longDescription && (
                    <button
                      onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                      className="mt-2 text-[#ffc929] text-sm font-medium hover:underline"
                    >
                      {descriptionExpanded ? "Show Less" : "Read More"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {!isOwner && (
            <Suspense fallback={<div className="text-center text-gray-500">Loading Help...</div>}>
              <HelpSection
                title={`How to Adopt ${petInfo.name}`}
                className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg p-6 border border-[#ffc929]/10"
              >
                <p>Review <span className="font-medium">{petInfo.name}</span>'s profile above.</p>
                <p>
                  Click{" "}
                  <span className="font-medium">{petInfo.fee === 0 ? "Apply Now" : "Adopt"}</span>.
                </p>
                <p>{petInfo.fee === 0 ? "Complete the application form." : "Proceed with payment."}</p>
                <p>
                  {petInfo.fee === 0 ? "Await The Pet Owner's Approval." : "The Pet Owner will contact you."}
                </p>
              </HelpSection>
            </Suspense>
          )}
        </main>
      </div>

      {showForm && !isOwner && !hasApplied && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-lg p-6 bg-white shadow-2xl rounded-2xl">
            <button
              onClick={() => setShowForm(false)}
              className="absolute p-1 transition-colors rounded-full top-4 right-4 hover:bg-gray-100"
            >
              <X size={24} className="text-gray-600" />
            </button>
            <PetApplicationForm
              petId={petInfo._id}
              petName={petInfo.name}
              petImage={petInfo.image}
              onClose={() => setShowForm(false)}
              onSubmitSuccess={handleApplicationSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PetDetails;