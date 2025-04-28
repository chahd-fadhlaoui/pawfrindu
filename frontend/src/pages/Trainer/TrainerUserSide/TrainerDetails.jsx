import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import {
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Info,
  MapPin,
  PawPrint,
  Star,
  User,
  Zap,
  Facebook,
  Instagram,
  FileText,
  Languages,
} from "lucide-react";
import MapViewer from "../../../components/map/MapViewer";
import AppointmentModal from "../../../components/Trainer/TrainerUserSide/AppointmentModal";
import { useApp } from "../../../context/AppContext";

export default function TrainerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    const fetchTrainerDetails = async () => {
      setLoading(true);
      try {
        const [trainerResponse, reviewsResponse] = await Promise.all([
          axiosInstance.get(`/api/user/trainer/${id}`),
          axiosInstance.get(`/api/user/trainer/${id}/reviews`),
        ]);
        setTrainer(trainerResponse.data.trainer);
        setReviews(reviewsResponse.data.reviews || []);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch trainer details");
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainerDetails();
  }, [id]);

  const handlePhotoClick = useCallback((index) => setSelectedPhotoIndex(index), []);
  const closeModal = useCallback(() => setSelectedPhotoIndex(null), []);
  const nextPhoto = useCallback(() => {
    if (trainer?.trainerDetails?.trainingPhotos) {
      setSelectedPhotoIndex(
        (prev) => (prev + 1) % trainer.trainerDetails.trainingPhotos.length
      );
    }
  }, [trainer]);
  const prevPhoto = useCallback(() => {
    if (trainer?.trainerDetails?.trainingPhotos) {
      setSelectedPhotoIndex(
        (prev) =>
          (prev - 1 + trainer.trainerDetails.trainingPhotos.length) %
          trainer.trainerDetails.trainingPhotos.length
      );
    }
  }, [trainer]);

  const openAppointmentModal = useCallback(() => {
    if (!user) {
      navigate("/login", { state: { from: `/trainer/${id}` } });
      return;
    }
    setIsModalOpen(true);
  }, [user, navigate, id]);

  const closeAppointmentModal = useCallback(() => setIsModalOpen(false), []);
  const handleBookingSuccess = useCallback(() => {
    closeAppointmentModal();
  }, [closeAppointmentModal]);

  const handleSubmitReview = useCallback(
    async (e) => {
      e.preventDefault();
      if (!user) {
        navigate("/login", { state: { from: `/trainer/${id}` } });
        return;
      }
      if (ratingInput < 1 || ratingInput > 5) {
        setReviewError("Please select a rating between 1 and 5 stars");
        return;
      }
      try {
        const response = await axiosInstance.post(`/api/user/trainer/${id}/reviews`, {
          rating: ratingInput,
          comment: commentInput,
        });
        const newReview = {
          ...response.data.review,
          userId: { _id: user._id, fullName: user.fullName, image: user.image },
        };
        setReviews((prev) => [...prev, newReview]);
        setRatingInput(0);
        setCommentInput("");
        setReviewError("");
        setTrainer((prev) => ({
          ...prev,
          trainerDetails: {
            ...prev.trainerDetails,
            rating: response.data.newRating,
          },
        }));
        setTimeout(() => {
          document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
        }, 500);
      } catch (err) {
        setReviewError(err.response?.data?.message || "Failed to submit review");
      }
    },
    [user, id, ratingInput, commentInput, navigate]
  );

  const memoizedTrainer = useMemo(() => trainer, [trainer]);
  const memoizedReviews = useMemo(() => reviews, [reviews]);

  const availableServices = [
    "Obedience Training",
    "Behavioral Training",
    "Agility Training",
    "Puppy Training",
    "Guarding",
  ];

  const tabs = [
    { id: "about", label: "About", icon: <User size={18} /> },
    { id: "services", label: "Services", icon: <Zap size={18} /> },
    { id: "credentials", label: "Credentials", icon: <FileText size={18} /> },
    { id: "schedule", label: "Schedule", icon: <Clock size={18} /> },
    { id: "gallery", label: "Gallery", icon: <Camera size={18} /> },
    { id: "reviews", label: "Reviews", icon: <Star size={18} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-pink-50">
        <div className="text-center animate-pulse">
          <PawPrint size={48} className="mx-auto text-[#ffc929]" />
          <p className="mt-4 text-lg font-medium text-gray-600">
            Loading Trainer Details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !memoizedTrainer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-pink-50">
        <div className="text-center">
          <PawPrint size={48} className="mx-auto mb-4 text-pink-500" />
          <p className="text-lg font-medium text-pink-600">
            {error || "Trainer not found"}
          </p>
          <button
            onClick={() => navigate("/trainers")}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-lg hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300"
          >
            <ChevronLeft size={16} />
            Back to Trainers
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = memoizedTrainer.image
    ? memoizedTrainer.image.startsWith("http")
      ? memoizedTrainer.image
      : `${process.env.REACT_APP_API_URL}/${memoizedTrainer.image}`
    : "https://placehold.co/300x300";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-pink-50">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/trainers")}
          className="flex items-center gap-2 mb-8 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-lg hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300"
          aria-label="Back to trainers list"
        >
          <ChevronLeft size={16} />
          Back to Trainers
        </button>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#ffc929]/20 to-pink-50 rounded-2xl overflow-hidden animate-fadeIn">
          <div className="flex flex-col items-center gap-8 p-8 sm:p-12 sm:flex-row sm:items-start">
            <div className="relative">
              <img
                src={imageUrl}
                alt={memoizedTrainer.fullName}
                className="object-cover w-32 h-32 transition-transform duration-300 border-4 border-white rounded-full sm:w-40 sm:h-40 hover:scale-105"
                onError={(e) => (e.target.src = "https://placehold.co/300x300")}
              />
              <div className="absolute bottom-0 right-0 flex items-center justify-center w-10 h-10 bg-[#ffc929] rounded-full shadow-md">
                <Star size={20} className="text-white" fill="currentColor" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">
                {memoizedTrainer.fullName}
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2 sm:justify-start">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.round(memoizedTrainer.trainerDetails.rating || 0)
                          ? "text-[#ffc929] fill-[#ffc929]"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <p className="text-lg font-medium text-gray-600">
                  {(memoizedTrainer.trainerDetails?.rating || 0).toFixed(1)} (
                  {memoizedReviews.length} reviews)
                </p>
              </div>
              <button
                onClick={openAppointmentModal}
                className={`mt-6 flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-lg hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 ${
                  !user && "opacity-50 cursor-not-allowed"
                }`}
                disabled={!user}
                aria-label="Book a training session"
              >
                <Calendar size={16} />
                Book Session
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Book Button for Mobile */}
        <div className="fixed z-40 lg:hidden bottom-4 right-4">
          <button
            onClick={openAppointmentModal}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-full shadow-lg hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 ${
              !user && "opacity-50 cursor-not-allowed"
            }`}
            disabled={!user}
            aria-label="Book a training session"
          >
            <Calendar size={16} />
            Book Now
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex mt-8 overflow-x-auto border-b border-gray-200 scrollbar-hide animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-[#ffc929] border-b-2 border-[#ffc929]"
                  : "text-gray-600 hover:text-[#ffa726]"
              }`}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="mt-8 space-y-8">
          {/* About Section */}
          {activeTab === "about" && memoizedTrainer.about && (
            <section className="p-6 bg-white rounded-xl animate-fadeIn" style={{ animationDelay: "0.3s" }}>
              <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-800">
                <User size={20} className="text-[#ffc929]" />
                About {memoizedTrainer.fullName}
              </h2>
              <p className="leading-relaxed text-gray-600">{memoizedTrainer.about}</p>
            </section>
          )}

          {/* Location & Contact Section */}
          {activeTab === "about" &&
            (memoizedTrainer.trainerDetails?.governorate ||
              memoizedTrainer.trainerDetails?.phone ||
              memoizedTrainer.trainerDetails?.trainingFacilityType) && (
              <section className="p-6 bg-white rounded-xl animate-fadeIn" style={{ animationDelay: "0.4s" }}>
                <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-800">
                  <MapPin size={20} className="text-[#ffc929]" />
                  Location & Contact
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {memoizedTrainer.trainerDetails?.governorate && (
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="mt-1 text-[#ffc929]" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="text-gray-800">
                          {memoizedTrainer.trainerDetails.governorate}
                          {memoizedTrainer.trainerDetails.delegation
                            ? `, ${memoizedTrainer.trainerDetails.delegation}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  )}
                  {memoizedTrainer.trainerDetails?.phone && (
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="mt-1 text-[#ffc929]" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-gray-800">{memoizedTrainer.trainerDetails.phone}</p>
                      </div>
                    </div>
                  )}
                  {memoizedTrainer.trainerDetails?.secondaryPhone && (
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="mt-1 text-[#ffc929]" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Secondary Phone</p>
                        <p className="text-gray-800">
                          {memoizedTrainer.trainerDetails.secondaryPhone}
                        </p>
                      </div>
                    </div>
                  )}
                  {memoizedTrainer.trainerDetails?.trainingFacilityType ===
                    "Fixed Facility" &&
                    memoizedTrainer.trainerDetails?.geolocation && (
                      <div className="sm:col-span-2">
                        <p className="mb-3 text-sm font-medium text-gray-500">
                          Training Center Location
                        </p>
                        <div className="h-48 overflow-hidden rounded-lg">
                          <MapViewer position={memoizedTrainer.trainerDetails.geolocation} />
                        </div>
                        <a
                          href={`https://www.google.com/maps?q=${memoizedTrainer.trainerDetails.geolocation.latitude},${memoizedTrainer.trainerDetails.geolocation.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 mt-3 text-[#ffc929] hover:text-[#ffa726] transition-colors"
                        >
                          <Globe size={16} />
                          View on Google Maps
                        </a>
                      </div>
                    )}
                  {memoizedTrainer.trainerDetails?.trainingFacilityType === "Mobile" &&
                    memoizedTrainer.trainerDetails?.serviceAreas?.length > 0 && (
                      <div className="sm:col-span-2">
                        <p className="mb-2 text-sm font-medium text-gray-500">
                          Service Areas
                        </p>
                        <p className="mb-2 italic text-gray-600">
                          This trainer travels to your location
                        </p>
                        <div className="space-y-2">
                          {memoizedTrainer.trainerDetails.serviceAreas.map((area, index) => (
                            <div key={index} className="p-2 bg-[#ffc929]/5 rounded-lg">
                              <p className="font-medium text-gray-700">{area.governorate}</p>
                              {area.delegations?.length > 0 ? (
                                <p className="text-sm text-gray-600">
                                  {area.delegations.join(", ")}
                                </p>
                              ) : (
                                <p className="text-sm italic text-gray-500">All delegations</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </section>
            )}

          {/* Training Details Section */}
          {activeTab === "about" &&
            (memoizedTrainer.trainerDetails?.averageSessionDuration ||
              memoizedTrainer.trainerDetails?.languagesSpoken?.length > 0 ||
              memoizedTrainer.trainerDetails?.breedsTrained?.length > 0) && (
              <section className="p-6 bg-white rounded-xl animate-fadeIn" style={{ animationDelay: "0.5s" }}>
                <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-800">
                  <Info size={20} className="text-[#ffc929]" />
                  Training Details
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {memoizedTrainer.trainerDetails?.averageSessionDuration && (
                    <div className="flex items-start gap-3">
                      <Clock size={18} className="mt-1 text-[#ffc929]" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Session Duration</p>
                        <p className="text-gray-800">
                          {memoizedTrainer.trainerDetails.averageSessionDuration} minutes
                        </p>
                      </div>
                    </div>
                  )}
                  {memoizedTrainer.trainerDetails?.languagesSpoken?.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Languages size={18} className="mt-1 text-[#ffc929]" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Languages</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {memoizedTrainer.trainerDetails.languagesSpoken.map((language, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-[#ffc929]/10 text-[#ffc929] rounded-full">
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {memoizedTrainer.trainerDetails?.breedsTrained?.length > 0 && (
                    <div className="sm:col-span-2">
                      <p className="mb-2 text-sm font-medium text-gray-500">Specialized Breeds</p>
                      <div className="flex flex-wrap gap-2">
                        {memoizedTrainer.trainerDetails.breedsTrained.map((breed, index) => (
                          <span key={index} className="px-3 py-1 text-sm bg-[#ffc929]/10 text-gray-700 rounded-full">
                            <span className="font-medium">{breed.breedName}</span>
                            <span className="text-xs text-gray-500"> ({breed.species})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

          {/* Social Media Section */}
          {activeTab === "about" &&
            memoizedTrainer.trainerDetails?.socialLinks && (
              <section className="p-6 bg-white rounded-xl animate-fadeIn" style={{ animationDelay: "0.6s" }}>
                <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-800">
                  <Globe size={20} className="text-[#ffc929]" />
                  Social Media
                </h2>
                <div className="flex gap-6">
                  {memoizedTrainer.trainerDetails.socialLinks.facebook && (
                    <a
                      href={memoizedTrainer.trainerDetails.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ffc929] hover:text-[#ffa726] transition-colors"
                      aria-label="Visit trainer's Facebook page"
                    >
                      <Facebook size={28} />
                    </a>
                  )}
                  {memoizedTrainer.trainerDetails.socialLinks.instagram && (
                    <a
                      href={memoizedTrainer.trainerDetails.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ffc929] hover:text-[#ffa726] transition-colors"
                      aria-label="Visit trainer's Instagram page"
                    >
                      <Instagram size={28} />
                    </a>
                  )}
                  {memoizedTrainer.trainerDetails.socialLinks.website && (
                    <a
                      href={memoizedTrainer.trainerDetails.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ffc929] hover:text-[#ffa726] transition-colors"
                      aria-label="Visit trainer's website"
                    >
                      <Globe size={28} />
                    </a>
                  )}
                </div>
              </section>
            )}

          {/* Services Section */}
          {activeTab === "services" && memoizedTrainer.trainerDetails?.services?.length > 0 && (
            <section className="p-6 bg-white rounded-xl animate-fadeIn" style={{ animationDelay: "0.3s" }}>
              <h2 className="flex items-center gap-2 mb-6 text-xl font-semibold text-gray-800">
                <Zap size={20} className="text-[#ffc929]" />
                Services Offered
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {memoizedTrainer.trainerDetails.services.map((service, index) => (
                  <div
                    key={index}
                    className="flex flex-col p-5 bg-[#ffc929]/5 rounded-lg transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-center mb-3">
                      <div className="flex items-center justify-center w-10 h-10 mr-3 bg-[#ffc929]/10 rounded-full">
                        <PawPrint size={18} className="text-[#ffc929]" />
                      </div>
                      <h3 className="font-medium text-gray-800">{service.serviceName}</h3>
                    </div>
                    {service.fee && (
                      <div className="pt-3 mt-auto border-t border-gray-100">
                        <p className="flex justify-between">
                          <span className="text-sm text-gray-500">Price</span>
                          <span className="font-medium text-[#ffc929]">{service.fee} TND</span>
                        </p>
                      </div>
                    )}
                    {!availableServices.includes(service.serviceName) && (
                      <span className="self-start px-2 py-1 mt-2 text-xs font-medium text-yellow-600 rounded-full bg-yellow-50">
                        Custom service
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Credentials Section */}
          {activeTab === "credentials" &&
            (memoizedTrainer.trainerDetails?.businessCardImage ||
              memoizedTrainer.trainerDetails?.certificationImage) && (
              <section className="p-6 bg-white rounded-xl animate-fadeIn" style={{ animationDelay: "0.3s" }}>
                <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-800">
                  <FileText size={20} className="text-[#ffc929]" />
                  Credentials
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {memoizedTrainer.trainerDetails?.businessCardImage && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-500">Business Card</p>
                      <img
                        src={memoizedTrainer.trainerDetails.businessCardImage}
                        alt="Business Card"
                        className="object-contain w-full h-48 transition-transform duration-300 rounded-lg hover:scale-105"
                        onError={(e) => (e.target.src = "https://placehold.co/300x200")}
                      />
                    </div>
                  )}
                  {memoizedTrainer.trainerDetails?.certificationImage && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-500">Certification</p>
                      <img
                        src={memoizedTrainer.trainerDetails.certificationImage}
                        alt="Certification"
                        className="object-contain w-full h-48 transition-transform duration-300 rounded-lg hover:scale-105"
                        onError={(e) => (e.target.src = "https://placehold.co/300x200")}
                      />
                    </div>
                  )}
                </div>
              </section>
            )}

          {/* Schedule Section */}
          {activeTab === "schedule" && memoizedTrainer.trainerDetails?.openingHours && (
            <section className="p-6 bg-white rounded-xl animate-fadeIn" style={{ animationDelay: "0.3s" }}>
              <h2 className="flex items-center gap-2 mb-6 text-xl font-semibold text-gray-800">
                <Clock size={20} className="text-[#ffc929]" />
                Weekly Schedule
              </h2>
              <div className="grid gap-3 md:grid-cols-7">
                {[
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday",
                ].map((day) => {
                  const sessionType = memoizedTrainer.trainerDetails.openingHours[day];
                  const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day;
                  let content;
                  if (sessionType === "Closed") {
                    content = (
                      <div className="py-2">
                        <p className="text-sm text-red-500">Closed</p>
                      </div>
                    );
                  } else {
                    const start = memoizedTrainer.trainerDetails.openingHours[`${day}Start`];
                    const end = memoizedTrainer.trainerDetails.openingHours[`${day}End`];
                    const start2 = memoizedTrainer.trainerDetails.openingHours[`${day}Start2`];
                    const end2 = memoizedTrainer.trainerDetails.openingHours[`${day}End2`];
                    content = (
                      <div className="py-2 space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-[#ffc929]" />
                          <p className="text-sm text-gray-600">{start} - {end}</p>
                        </div>
                        {sessionType === "Double Session" && start2 && end2 && (
                          <div className="flex items-center gap-1">
                            <Clock size={14} className="text-[#ffc929]" />
                            <p className="text-sm text-gray-600">{start2} - {end2}</p>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={day}
                      className={`p-3 rounded-lg ${
                        isToday
                          ? "bg-[#ffc929]/10"
                          : sessionType === "Closed"
                          ? "bg-red-50"
                          : "bg-[#ffc929]/5"
                      } transition-transform duration-300 hover:scale-[1.02]`}
                    >
                      <p className={`font-medium text-center pb-2 border-b ${
                        isToday ? "text-[#ffc929] border-[#ffc929]/30" : "text-gray-800 border-gray-100"
                      }`}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                        {isToday && <span className="ml-1 text-xs">(Today)</span>}
                      </p>
                      {content}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center mt-6">
                <button
                  onClick={openAppointmentModal}
                  className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-lg hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 transform hover:scale-105"
                  aria-label="Book a session"
                >
                  <Calendar size={18} />
                  Book a Session Now
                </button>
              </div>
            </section>
          )}

          {/* Gallery Section */}
          {activeTab === "gallery" && memoizedTrainer.trainerDetails?.trainingPhotos?.length > 0 && (
            <section className="p-6 bg-white rounded-xl animate-fadeIn" style={{ animationDelay: "0.3s" }}>
              <h2 className="flex items-center gap-2 mb-6 text-xl font-semibold text-gray-800">
                <Camera size={20} className="text-[#ffc929]" />
                Training Gallery
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {memoizedTrainer.trainerDetails.trainingPhotos.map((photo, index) => (
                  <div key={index} className="relative overflow-hidden rounded-lg group aspect-square">
                    <img
                      src={photo}
                      alt={`Training Photo ${index + 1}`}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      onClick={() => handlePhotoClick(index)}
                      onError={(e) => (e.target.src = "https://placehold.co/300x300")}
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 cursor-pointer bg-black/40 group-hover:opacity-100"
                      onClick={() => handlePhotoClick(index)}
                    >
                      <div className="p-2 rounded-full bg-white/20">
                        <Camera size={20} className="text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews Section */}
          {activeTab === "reviews" && (
            <section id="reviews" className="p-6 bg-white rounded-xl animate-fadeIn" style={{ animationDelay: "0.3s" }}>
              <div className="flex flex-col mb-6 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                  <Star size={20} className="text-[#ffc929]" />
                  Reviews & Ratings
                </h2>
                {memoizedReviews.length > 0 && (
                  <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={
                            i < Math.round(memoizedTrainer.trainerDetails.rating || 0)
                              ? "text-[#ffc929] fill-[#ffc929]"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <p className="font-medium text-gray-700">
                      {(memoizedTrainer.trainerDetails.rating || 0).toFixed(1)} / 5
                    </p>
                  </div>
                )}
              </div>
              <div className="p-5 mb-8 bg-[#ffc929]/5 rounded-xl">
                <h3 className="mb-4 text-lg font-medium text-gray-800">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-600">Your Rating</p>
                    <div className="flex gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={24}
                          className={
                            i < ratingInput
                              ? "text-[#ffc929] fill-[#ffc929] cursor-pointer"
                              : "text-gray-300 hover:text-gray-400 cursor-pointer"
                          }
                          onClick={() => setRatingInput(i + 1)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              setRatingInput(i + 1);
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-600">Your Comment</p>
                    <textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                      rows={3}
                      placeholder="Share your experience with this trainer..."
                      aria-label="Review comment"
                    />
                  </div>
                  {reviewError && (
                    <p className="text-sm text-red-500">{reviewError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={!user}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      user
                        ? "text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] hover:from-[#ffa726] hover:to-[#ffc929]"
                        : "text-gray-500 bg-gray-200 cursor-not-allowed"
                    }`}
                    aria-label="Submit review"
                  >
                    Submit Review
                  </button>
                  {!user && (
                    <p className="text-xs text-gray-500">
                      Please <a href="/login" className="text-[#ffc929] hover:underline">login</a> to submit a review
                    </p>
                  )}
                </form>
              </div>
              {memoizedReviews.length > 0 ? (
                <div className="space-y-4">
                  {memoizedReviews.map((review, index) => (
                    <div key={index} className="p-4 bg-[#ffc929]/5 rounded-lg transition-transform duration-300 hover:scale-[1.02]">
                      <div className="flex items-start gap-3">
                        <img
                          src={review.userId?.image || "https://placehold.co/32x32"}
                          alt={review.userId?.fullName || "User"}
                          className="object-cover w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <p className="font-medium text-gray-800">
                              {review.userId?.fullName || "User"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="flex mt-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={
                                  i < review.rating
                                    ? "text-[#ffc929] fill-[#ffc929]"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                          </div>
                          {review.comment && (
                            <p className="text-gray-600">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Star size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No reviews yet</p>
                  <p className="mt-2 text-sm text-gray-400">Be the first to review this trainer</p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Photo Gallery Modal */}
        {selectedPhotoIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fadeIn">
            <div className="relative w-full max-w-4xl p-4">
              <button
                onClick={closeModal}
                className="absolute p-2 text-white transition-all duration-300 rounded-full bg-black/50 top-4 right-4 hover:bg-black/70"
                aria-label="Close photo modal"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") closeModal();
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="flex items-center justify-between">
                <button
                  onClick={prevPhoto}
                  className="p-3 text-white transition-all duration-300 rounded-full bg-black/50 hover:bg-black/70"
                  aria-label="Previous photo"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") prevPhoto();
                  }}
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="flex-1 mx-4">
                  <img
                    src={memoizedTrainer.trainerDetails.trainingPhotos[selectedPhotoIndex]}
                    alt={`Training Photo ${selectedPhotoIndex + 1}`}
                    className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                    onError={(e) => (e.target.src = "https://placehold.co/600x400")}
                  />
                  <p className="mt-2 text-sm text-center text-white">
                    {selectedPhotoIndex + 1} / {memoizedTrainer.trainerDetails.trainingPhotos.length}
                  </p>
                </div>
                <button
                  onClick={nextPhoto}
                  className="p-3 text-white transition-all duration-300 rounded-full bg-black/50 hover:bg-black/70"
                  aria-label="Next photo"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") nextPhoto();
                  }}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Modal */}
        {isModalOpen && (
          <AppointmentModal
            trainer={memoizedTrainer}
            onClose={closeAppointmentModal}
            onSuccess={handleBookingSuccess}
          />
        )}
      </div>
    </div>
  );
}