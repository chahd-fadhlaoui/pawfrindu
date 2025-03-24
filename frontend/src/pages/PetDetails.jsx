import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import {
  Heart,
  PawPrint,
  MapPin,
  Coins,
  Zap,
  Calendar,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import PetApplicationForm from "../components/PetApplicationForm";
import HelpSection from "../components/common/HelpSection";
import axiosInstance from "../utils/axiosInstance";

// Custom PawIcon SVG
const PawIcon = ({ className, style }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    style={style}
    fill="currentColor"
  >
    <path d="M12,17.5c2.33,2.33,5.67,2.33,8,0s2.33-5.67,0-8s-5.67-2.33-8,0S9.67,15.17,12,17.5z M7.5,14.5 c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S9.46,12.54,7.5,14.5z M18.5,3.5c-1.96-1.96-4.04-1.96-6,0s-1.96,4.04,0,6 s4.04,1.96,6,0S20.46,5.46,18.5,3.5z M3.5,9.5c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S5.46,7.54,3.5,9.5z" />
  </svg>
);

// Paw Background for Decoration
const PawBackground = () => {
  return Array(8)
    .fill(null)
    .map((_, index) => (
      <PawPrint
        key={index}
        size={48}
        className={`
          absolute opacity-5 animate-float
          ${index % 2 === 0 ? "text-[#ffc929]" : "text-pink-300"}
          ${
            index % 3 === 0
              ? "top-1/4"
              : index % 3 === 1
              ? "top-1/2"
              : "top-3/4"
          }
          ${
            index % 4 === 0
              ? "left-1/4"
              : index % 4 === 1
              ? "left-1/2"
              : "left-3/4"
          }
        `}
        style={{
          animationDelay: `${index * 0.5}s`,
          transform: `rotate(${index * 45}deg)`,
        }}
      />
    ));
};

export default function PetDetails() {
  const navigate = useNavigate();
  const { petId } = useParams();
  const { pets, currencySymbol, user, loading } = useContext(AppContext);
  const [petInfo, setPetInfo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const fetchPetDetails = async () => {
    try {
      const response = await axiosInstance.get(`/api/pet/pets/${petId}`);
      if (response.data.success) {
        const pet = response.data.data;
        setPetInfo(pet);
        console.log("Fetched pet candidates:", pet.candidates);
        if (user && pet.candidates?.some((cand) => cand.user === user._id)) {
          setHasApplied(true);
        }
      } else {
        console.error("Failed to fetch pet:", response.data.message);
        setPetInfo(null);
      }
    } catch (error) {
      console.error("Error fetching pet details:", error);
      setPetInfo(null);
    }
  };

  useEffect(() => {
    if (petId) {
      fetchPetDetails();
    }
  }, [petId, user]);

  useEffect(() => {
    console.log("PetDetails - user:", user);
    console.log("PetDetails - petInfo:", petInfo);
    console.log("PetDetails - hasApplied:", hasApplied);
    console.log("PetDetails - candidates:", petInfo?.candidates);
    console.log(
      "PetDetails - isOwner:",
      user && petInfo?.owner?._id && petInfo.owner._id === user._id
    );
  }, [user, petInfo, hasApplied]);

  const handleApplyNowClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (hasApplied || (petInfo?.candidates?.some((cand) => cand.user === user._id))) {
      console.log("Application blocked: User has already applied.");
      return;
    }
    // If the pet has a fee, do nothing for now
    if (petInfo.fee !== 0) {
      console.log("Proceed to Payment clicked, but no action is implemented yet.");
      return;
    }
    // If the pet is free, show the application form
    setShowForm(true);
  };

  const handleCloseForm = () => setShowForm(false);

  const toggleLike = () => setIsLiked((prev) => !prev);

  const handleApplicationSuccess = async () => {
    setHasApplied(true);
    setShowForm(false);
    try {
      const response = await axiosInstance.get(`/api/pets/${petId}`);
      if (response.data.success) {
        console.log("Refetched pet after application:", response.data.data);
        setPetInfo(response.data.data);
        if (user && response.data.data.candidates?.some((cand) => cand.user === user._id)) {
          setHasApplied(true);
        }
      } else {
        console.error("Refetch failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error refetching pet details after application:", error);
    }
  };

  if (!petInfo || loading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-white to-pink-50">
        <div className="absolute inset-0 overflow-hidden">
          <PawBackground />
        </div>
        <div className="relative text-center animate-pulse">
          <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full shadow-md bg-pink-50">
            <PawPrint size={32} className="text-[#ffc929]" />
          </div>
          <p className="mt-4 text-lg font-medium text-gray-600">
            Fetching Pet Details...
          </p>
        </div>
      </div>
    );
  }

  const isOwner = user && petInfo.owner && petInfo.owner._id === user._id;

  return (
    <div className="relative min-h-screen px-4 py-12 overflow-hidden sm:py-20 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-pink-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <PawBackground />
      </div>
      <div className="relative max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div
          className="pt-16 space-y-6 text-center animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-[#ffc929]/20 rounded-full shadow-sm">
            <Heart className="w-4 h-4 mr-2 text-[#ffc929]" />
            Available for Adoption
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            <span className="block">Meet</span>
            <span className="block text-pink-500">{petInfo.name}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600">
            Discover everything about {petInfo.name} and start your adoption
            journey today!
          </p>
        </div>

        {/* Main Card */}
        <div
          className="overflow-hidden transition-all duration-500 bg-white border-2 border-[#ffc929]/20 shadow-lg rounded-3xl hover:shadow-xl animate-fadeIn"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex flex-col gap-6 p-6 md:flex-row md:p-8">
            {/* Image Section with Back Button */}
            <div className="relative md:w-1/2 h-[400px] md:h-auto group bg-gradient-to-br from-white to-pink-50 rounded-xl overflow-hidden shadow-inner border border-[#ffc929]/20">
              <button
                onClick={() => navigate(-1)}
                className="absolute z-10 flex items-center gap-2 px-4 py-2 transition-all duration-300 border border-[#ffc929]/20 rounded-full shadow-md top-4 left-4 bg-white hover:bg-[#ffc929]/10 hover:border-[#ffc929]/50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30 group/back"
                aria-label="Back to pet list"
              >
                <ArrowLeft className="w-5 h-5 text-[#ffc929] transition-transform duration-300 group-hover/back:-translate-x-1" />
                <span className="text-sm font-medium text-gray-700 transition-colors duration-300 group-hover/back:text-[#ffc929]">
                  Back
                </span>
              </button>
              <img
                src={petInfo.image}
                alt={petInfo.name}
                className="object-cover w-full h-full transition-transform duration-400 group-hover:scale-105"
                onError={(e) => (e.target.src = "/placeholder-animal.png")}
                loading="lazy"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike();
                }}
                className="absolute p-2 transition-all duration-300 rounded-full shadow-md top-4 right-4 bg-white/90 hover:bg-[#ffc929]/10 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
                aria-label={
                  isLiked ? `Unlike ${petInfo.name}` : `Like ${petInfo.name}`
                }
              >
                <Heart
                  className={`w-6 h-6 ${
                    isLiked
                      ? "fill-[#ffc929] text-[#ffc929]"
                      : "text-gray-400 group-hover:text-[#ffc929]"
                  } transition-colors duration-300`}
                />
              </button>
              <div className="absolute z-10 flex flex-wrap gap-2 bottom-4 left-4 right-4">
                <span className="px-3 py-1 text-sm font-medium text-green-600 transition-all duration-300 border border-green-100 rounded-full shadow-sm bg-green-50/90 hover:bg-white">
                  ✓ Available
                </span>
                {petInfo.isTrained && (
                  <span className="px-3 py-1 text-sm font-medium text-[#ffc929] transition-all duration-300 border border-[#ffc929]/20 rounded-full shadow-sm bg-[#ffc929]/10 hover:bg-white">
                    ✓ Trained
                  </span>
                )}
                {petInfo.fee === 0 && (
                  <span className="px-3 py-1 text-sm font-medium text-green-600 transition-all duration-300 border border-green-100 rounded-full shadow-sm bg-green-50/90 hover:bg-white">
                    ✓ Free
                  </span>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="flex flex-col space-y-6 md:w-1/2">
              {/* Pet Identity */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-3xl font-semibold text-gray-800 transition-colors duration-300 group-hover:text-pink-500">
                    {petInfo.name}
                  </h2>
                  <span className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 border border-[#ffc929]/20 rounded-full shadow-sm bg-pink-50">
                    <Calendar size={14} /> {petInfo.age}
                  </span>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <PawPrint size={14} className="text-[#ffc929]" />
                    {petInfo.species.charAt(0).toUpperCase() +
                      petInfo.species.slice(1)}
                    {petInfo.breed && ` • ${petInfo.breed}`}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-4 text-base font-medium text-gray-700">
                    <span className="flex items-center gap-2 px-4 py-2 border border-[#ffc929]/20 rounded-full shadow-sm bg-pink-50">
                      <MapPin size={18} className="text-[#ffc929]" />{" "}
                      {petInfo.city}
                    </span>
                    <span
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm ${
                        petInfo.fee === 0
                          ? "bg-green-50 border-green-100 text-green-600"
                          : "bg-[#ffc929]/10 border-[#ffc929]/20 text-[#ffc929]"
                      }`}
                    >
                      <Coins
                        size={18}
                        className={
                          petInfo.fee === 0
                            ? "text-green-500"
                            : "text-[#ffc929]"
                        }
                      />
                      {petInfo.fee === 0
                        ? "Free"
                        : `${petInfo.fee}${currencySymbol}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="bg-gradient-to-br from-white to-pink-50 p-6 rounded-xl border border-[#ffc929]/20 hover:shadow-md transition-all duration-300 group flex-1 overflow-auto max-h-[300px] scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-pink-50">
                <div className="flex items-center gap-2 mb-3">
                  <PawPrint className="w-6 h-6 text-[#ffc929] transition-transform duration-300 group-hover:rotate-12" />
                  <h3 className="text-lg font-semibold text-gray-800 transition-colors duration-300 group-hover:text-pink-500">
                    About {petInfo.name}
                  </h3>
                </div>
                <p className="text-base leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                  {petInfo.description}
                </p>
              </div>

              {/* Specification */}
              <div className="p-4 transition-all duration-300 bg-white border border-[#ffc929]/20 shadow-sm rounded-xl hover:shadow-md group">
                <div className="flex items-center gap-2 mb-2">
                  <Zap
                    size={16}
                    className="text-[#ffc929] transition-transform duration-300 group-hover:scale-110"
                  />
                  <h4 className="text-sm font-medium text-gray-700">
                    Training
                  </h4>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {petInfo.isTrained ? "Trained" : "Not Trained"}
                </p>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                {!isOwner ? (
                  <button
                    onClick={handleApplyNowClick}
                    className={`relative flex items-center justify-center w-full gap-2 py-4 overflow-hidden text-white font-bold bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30 ${
                      hasApplied ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={hasApplied}
                  >
                    <span>
                      {hasApplied
                        ? "Already Applied"
                        : petInfo.fee === 0
                        ? "Apply Now"
                        : "Proceed to Payment"}
                    </span>
                    {!hasApplied && (
                      <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    )}
                  </button>
                ) : (
                  <div className="w-full text-center py-4 rounded-xl font-bold text-gray-500 bg-gray-200 cursor-not-allowed">
                    Your Pet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <HelpSection show={!isOwner} title="How to Adopt This Pet">
          <li>
            Review <span className="font-medium">{petInfo.name}</span>’s
            details above.
          </li>
          <li>
            Click{" "}
            <span className="font-medium">
              {petInfo.fee === 0 ? "Apply Now" : "Proceed to Payment"}
            </span>{" "}
            to start the adoption process.
          </li>
          <li>Fill out the application form that appears after clicking.</li>
          <li>Wait for the owner to review your application.</li>
        </HelpSection>
      </div>

      {showForm && !isOwner && !hasApplied && (
        <PetApplicationForm
          petId={petInfo._id}
          petName={petInfo.name}
          petImage={petInfo.image}
          onClose={handleCloseForm}
          onSubmitSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
}