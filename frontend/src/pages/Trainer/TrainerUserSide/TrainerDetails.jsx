import {
  Award,
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  Facebook,
  Globe,
  Instagram,
  Languages,
  MapPin,
  PawPrint,
  Phone,
  Star,
  User,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MapViewer from "../../../components/map/MapViewer";
import AppointmentModal from "../../../components/vet/VetUserManagment/appointmentForm/AppointmentModal";
import axiosInstance from "../../../utils/axiosInstance";

import { useApp } from "../../../context/AppContext";

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
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch trainer details and reviews
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
        setError(
          err.response?.data?.message || "Failed to fetch trainer details"
        );
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainerDetails();
  }, [id]);

  // Memoized image URLs
  const profileImageUrl = useMemo(
    () =>
      trainer?.image
        ? trainer.image.startsWith("http")
          ? trainer.image
          : `${process.env.REACT_APP_API_URL}/${trainer.image}`
        : "https://placehold.co/300x300",
    [trainer]
  );

  const businessCardImageUrl = useMemo(
    () =>
      trainer?.trainerDetails?.businessCardImage
        ? trainer.trainerDetails.businessCardImage.startsWith("http")
          ? trainer.trainerDetails.businessCardImage
          : `${process.env.REACT_APP_API_URL}/${trainer.trainerDetails.businessCardImage}`
        : "https://placehold.co/300x200",
    [trainer]
  );

  // Event handlers
  const handlePhotoClick = useCallback(
    (index) => setSelectedPhotoIndex(index),
    []
  );
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

  const handleKeyDownModal = useCallback(
    (e) => {
      if (selectedPhotoIndex !== null) {
        if (e.key === "Escape") closeModal();
        if (e.key === "ArrowRight") nextPhoto();
        if (e.key === "ArrowLeft") prevPhoto();
      }
    },
    [selectedPhotoIndex, closeModal, nextPhoto, prevPhoto]
  );

  useEffect(() => {
    if (selectedPhotoIndex !== null) {
      window.addEventListener("keydown", handleKeyDownModal);
      return () => window.removeEventListener("keydown", handleKeyDownModal);
    }
  }, [selectedPhotoIndex, handleKeyDownModal]);

  const openAppointmentModal = useCallback(() => {
    if (!user) {
      navigate("/login", { state: { from: `/trainer/${id}` } });
      return;
    }
    setIsModalOpen(true);
  }, [user, navigate, id]);

  const closeAppointmentModal = useCallback(() => setIsModalOpen(false), []);


  const handleSubmitReview = useCallback(
    async (e) => {
      e.preventDefault();
      if (!user) {
        navigate("/login", { state: { from: `/trainer/${id}` } });
        return;
      }
      if (ratingInput < 1 || ratingInput > 5) {
        setReviewError(
          "Please select.....Please select a rating between 1 and 5 stars"
        );
        toast.error("Invalid rating", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
        return;
      }
      try {
        const response = await axiosInstance.post(
          `/api/user/trainer/${id}/reviews`,
          {
            rating: ratingInput,
            comment: commentInput,
          }
        );
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
        toast.success("Review submitted successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
        setTimeout(() => {
          document
            .getElementById("reviews")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 500);
      } catch (err) {
        setReviewError(
          err.response?.data?.message || "Failed to submit review"
        );
        toast.error("Failed to submit review", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
      }
    },
    [user, id, ratingInput, commentInput, navigate]
  );

  const scrollToSection = useCallback((sectionId) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const availableServices = ["Basic Training", "Guard Dog Training"];
  const tabs = [
    { id: "about", label: "About", icon: <User size={18} /> },
    { id: "location", label: "Location", icon: <MapPin size={18} /> },
    { id: "services", label: "Services", icon: <Zap size={18} /> },
    { id: "schedule", label: "Schedule", icon: <Clock size={18} /> },
    { id: "gallery", label: "Gallery", icon: <Camera size={18} /> },
    { id: "reviews", label: "Reviews", icon: <Star size={18} /> },
  ];

  // Paw background animation
  const PawBackground = () =>
    Array(10)
      .fill(null)
      .map((_, index) => {
        const colors = [
          "text-[#ffc929]",
          "text-pink-300",
          "text-yellow-200",
          "text-orange-200",
        ];
        const colorClass = colors[index % colors.length];
        return (
          <PawIcon
            key={index}
            className={`absolute w-10 h-10 opacity-10 animate-float ${colorClass} ${
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
              animationDelay: `${index * 0.6}s`,
              transform: `rotate(${index * 45}deg)`,
            }}
          />
        );
      });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-pink-50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin w-12 h-12 rounded-full border-4 border-[#ffc929] border-t-transparent"></div>
          </div>
          <p className="text-lg font-medium text-gray-600">
            Loading Trainer Details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !trainer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-pink-50">
        <div className="max-w-md p-8 text-center bg-white shadow-lg rounded-xl">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50">
              <PawPrint size={32} className="text-pink-500" />
            </div>
          </div>
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Oops!</h2>
          <p className="mb-6 text-lg font-medium text-pink-600">
            {error || "Trainer not found"}
          </p>
          <button
            onClick={() => navigate("/trainers")}
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-lg hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 mx-auto"
            aria-label="Return to trainers"
          >
            <ChevronLeft size={16} />
            Return to Trainers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white to-pink-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute w-64 h-64 bg-yellow-200 rounded-full top-10 left-10 mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute bg-pink-200 rounded-full top-40 right-20 w-72 h-72 mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute bg-orange-100 rounded-full bottom-40 left-40 w-80 h-80 mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <PawBackground />
        </div>
      </div>

      <div className="container relative z-10 px-4 pt-6 mx-auto">
        {/* Return Button (Above All) */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/trainers")}
            className="flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-lg hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 shadow-sm"
            aria-label="Return to trainers list"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/trainers");
            }}
          >
            <ChevronLeft size={18} />
            <PawPrint size={18} />
            Return to Trainers
          </button>
        </div>

        {/* Sticky Header */}
        <header
          className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
            scrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
          }`}
        >
          <div className="container flex items-center justify-end px-4 mx-auto">
            <div className="flex items-center gap-2">
              {scrolled && (
                <div className="flex items-center gap-2 mr-4">
                  <img
                    src={profileImageUrl}
                    alt={trainer.fullName}
                    className="object-cover w-8 h-8 border-2 border-white rounded-full shadow-sm"
                    onError={(e) =>
                      (e.target.src = "https://placehold.co/300x300")
                    }
                  />
                  <span className="font-medium text-gray-800">
                    {trainer.fullName}
                  </span>
                </div>
              )}
              <button
                onClick={openAppointmentModal}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-lg hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 shadow-sm disabled:opacity-50"
                disabled={!user}
                aria-label="Book a session"
              >
                <Calendar size={14} />
                Book
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mt-16 mb-8 overflow-hidden bg-white shadow-sm rounded-2xl animate-fadeIn">
          <div className="relative">
            <div className="h-40 bg-gradient-to-r from-[#fff8e1] to-[#fce4ec]"></div>
            <div className="absolute flex flex-col items-center gap-6 left-8 -bottom-16 sm:flex-row">
              <div className="relative">
                <img
                  src={profileImageUrl}
                  alt={trainer.fullName}
                  className="object-cover w-32 h-32 border-2 border-white rounded-full shadow-md"
                  onError={(e) =>
                    (e.target.src = "https://placehold.co/300x300")
                  }
                />
                <div className="absolute -bottom-2 -right-2 bg-[#ffc929] rounded-full p-1 shadow-sm">
                  <Star size={16} className="text-white" fill="currentColor" />
                </div>
              </div>
              {trainer.trainerDetails?.businessCardImage && (
                <div className="relative">
                  <img
                    src={businessCardImageUrl}
                    alt="Business Card"
                    className="object-contain w-48 h-32 border border-gray-100 rounded-lg shadow-sm"
                    onError={(e) =>
                      (e.target.src = "https://placehold.co/300x200")
                    }
                  />
                </div>
              )}
            </div>
          </div>
          <div className="p-6 pt-20">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {trainer.fullName}
                  </h1>
                  {trainer.trainerDetails?.rating > 4.5 && (
                    <span className="bg-[#ffc929]/10 text-xs px-2 py-1 rounded-full text-[#ffc929] font-medium flex items-center gap-1">
                      <Award size={12} />
                      Top Rated
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < Math.round(trainer.trainerDetails?.rating || 0)
                            ? "text-[#ffc929] fill-[#ffc929]"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <p className="ml-1 text-sm font-medium text-gray-600">
                    {(trainer.trainerDetails?.rating || 0).toFixed(1)} (
                    {reviews.length})
                  </p>
                </div>
                {trainer.trainerDetails?.trainingFacilityType && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                    <MapPin size={14} className="text-[#ffc929]" />
                    <span>
                      {trainer.trainerDetails.trainingFacilityType ===
                      "Fixed Facility"
                        ? `${trainer.trainerDetails.governorate || ""}${
                            trainer.trainerDetails.delegation
                              ? `, ${trainer.trainerDetails.delegation}`
                              : ""
                          }`
                        : "Mobile Trainer (Travels to you)"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={openAppointmentModal}
                  className="px-6 py-2 flex items-center gap-2 bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-full text-white font-medium text-sm hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 shadow-sm disabled:opacity-50"
                  disabled={!user}
                  aria-label="Book a training session"
                >
                  <Calendar size={16} />
                  Book a Session
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div
          className="sticky z-20 mb-6 bg-white rounded-lg shadow-sm top-16 animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-[#ffc929] border-b-2 border-[#ffc929]"
                    : "text-gray-600 hover:text-[#ffa726]"
                }`}
                aria-current={activeTab === tab.id ? "page" : undefined}
                aria-label={`Go to ${tab.label} section`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fixed Call-to-Action for Mobile */}
        <div className="fixed z-40 bottom-4 right-4 lg:hidden">
          <button
            onClick={openAppointmentModal}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-full shadow-lg hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 disabled:opacity-50"
            disabled={!user}
            aria-label="Book a session now"
          >
            <Calendar size={16} />
            Book Now
          </button>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* About Section */}
            <section
              id="about"
              className="p-6 bg-white shadow-sm rounded-xl animate-fadeIn"
              style={{ animationDelay: "0.3s" }}
            >
              <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-800">
                <User size={20} className="text-[#ffc929]" />
                About {trainer.fullName}
              </h2>
              {loading ? (
                <div className="space-y-2">
                  <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : trainer.about ? (
                <p className="leading-relaxed text-gray-600">{trainer.about}</p>
              ) : (
                <p className="italic text-gray-500">No information provided</p>
              )}
              {trainer.trainerDetails?.breedsTrained?.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 text-lg font-medium text-gray-800">
                    Specialized Breeds
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trainer.trainerDetails.breedsTrained.map(
                      (breed, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-sm bg-[#ffc929]/10 text-gray-700 rounded-full"
                        >
                          <span className="font-medium">{breed.breedName}</span>
                          <span className="text-xs text-gray-500">
                            {" "}
                            ({breed.species})
                          </span>
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
              {trainer.trainerDetails?.languagesSpoken?.length > 0 && (
                <div className="mt-6">
                  <h3 className="flex items-center gap-2 mb-3 text-lg font-medium text-gray-800">
                    <Languages size={18} className="text-[#ffc929]" />
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trainer.trainerDetails.languagesSpoken.map(
                      (language, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-sm bg-[#ffc929]/10 text-[#ffc929] rounded-full font-medium"
                        >
                          {language}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Location Section */}
            <section
              id="location"
              className="p-6 bg-white shadow-sm rounded-xl animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-800">
                <MapPin size={20} className="text-[#ffc929]" />
                Location
              </h2>
              {loading ? (
                <div className="space-y-4">
                  <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {trainer.trainerDetails?.trainingFacilityType ===
                    "Fixed Facility" && (
                    <>
                      {(trainer.trainerDetails?.governorate ||
                        trainer.trainerDetails?.delegation) && (
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 mt-1 rounded-full bg-[#ffc929]/10 flex items-center justify-center">
                            <MapPin size={18} className="text-[#ffc929]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Location
                            </p>
                            <p className="text-lg text-gray-800">
                              {trainer.trainerDetails.governorate}
                              {trainer.trainerDetails.delegation
                                ? `, ${trainer.trainerDetails.delegation}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      )}
                      {trainer.trainerDetails?.geolocation && (
                        <div className="mt-4">
                          <p className="mb-2 text-sm font-medium text-gray-500">
                            Training Center Map
                          </p>
                          <MapViewer
                            position={trainer.trainerDetails.geolocation}
                          />
                          <a
                            href={`https://www.google.com/maps?q=${trainer.trainerDetails.geolocation.latitude},${trainer.trainerDetails.geolocation.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-lg font-semibold text-[#ffc929] hover:underline flex items-center space-x-2"
                            aria-label="View location on Google Maps"
                          >
                            <Globe className="w-5 h-5" />
                            <span>View on Google Maps</span>
                          </a>
                        </div>
                      )}
                    </>
                  )}
                  {trainer.trainerDetails?.trainingFacilityType === "Mobile" &&
                    trainer.trainerDetails?.serviceAreas?.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-sm font-medium text-gray-500">
                          Service Areas
                        </p>
                        <p className="mb-2 text-lg italic text-gray-700">
                          This trainer travels to your location
                        </p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {trainer.trainerDetails.serviceAreas.map(
                            (area, index) => (
                              <div
                                key={index}
                                className="p-3 bg-[#ffc929]/5 rounded-xl"
                              >
                                <p className="font-medium text-gray-800">
                                  {area.governorate}
                                </p>
                                {area.delegations?.length > 0 ? (
                                  <p className="text-sm text-gray-600">
                                    {area.delegations.join(", ")}
                                  </p>
                                ) : (
                                  <p className="text-sm italic text-gray-500">
                                    All delegations
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  {trainer.trainerDetails?.trainingFacilityType ===
                    "Fixed Facility" &&
                    !trainer.trainerDetails?.governorate &&
                    !trainer.trainerDetails?.geolocation && (
                      <p className="italic text-gray-500">
                        Location information not provided
                      </p>
                    )}
                  {trainer.trainerDetails?.trainingFacilityType === "Mobile" &&
                    !trainer.trainerDetails?.serviceAreas?.length && (
                      <p className="italic text-gray-500">
                        Service areas not specified
                      </p>
                    )}
                </div>
              )}
            </section>

            {/* Services Section */}
            <section
              id="services"
              className="p-6 bg-white shadow-sm rounded-xl animate-fadeIn"
              style={{ animationDelay: "0.5s" }}
            >
              <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-800">
                <Zap size={20} className="text-[#ffc929]" />
                Services Offered
              </h2>
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="p-5 bg-gray-200 rounded-lg animate-pulse"
                    >
                      <div className="w-3/4 h-4 mb-2 bg-gray-300 rounded"></div>
                      <div className="w-1/2 h-4 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : trainer.trainerDetails?.services?.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {trainer.trainerDetails.services.map((service, index) => (
                    <div
                      key={index}
                      className="p-5 bg-gradient-to-br from-white to-[#ffc929]/5 rounded-lg border border-[#ffc929]/10 transition-transform duration-300 hover:scale-[1.02] shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ffc929]/10 flex items-center justify-center mt-1">
                          <PawPrint size={18} className="text-[#ffc929]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {service.serviceName}
                          </h3>
                          {service.fee && (
                            <p className="mt-2 text-lg font-bold text-[#ffc929]">
                              {service.fee} TND
                            </p>
                          )}
                          {!availableServices.includes(service.serviceName) && (
                            <span className="inline-block px-2 py-1 mt-2 text-xs font-medium text-yellow-600 rounded-full bg-yellow-50">
                              Custom service
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Zap size={36} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No services listed</p>
                </div>
              )}
            </section>

            {/* Schedule Section */}
            <section
              id="schedule"
              className="p-6 bg-white shadow-sm rounded-xl animate-fadeIn"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                  <Clock size={20} className="text-[#ffc929]" />
                  Weekly Schedule
                </h2>
                {trainer.trainerDetails?.averageSessionDuration && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-[#ffc929]/10 rounded-full">
                    <Clock size={14} className="text-[#ffc929]" />
                    <span className="text-sm font-medium text-gray-700">
                      {trainer.trainerDetails.averageSessionDuration} min
                      sessions
                    </span>
                  </div>
                )}
              </div>
              {loading ? (
                <div className="grid gap-3 sm:grid-cols-7">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="p-3 bg-gray-200 rounded-lg animate-pulse"
                    >
                      <div className="w-1/2 h-4 mx-auto mb-2 bg-gray-300 rounded"></div>
                      <div className="w-3/4 h-4 mx-auto bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : trainer.trainerDetails?.openingHours ? (
                <div className="grid gap-3 sm:grid-cols-7">
                  {[
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday",
                  ].map((day) => {
                    const sessionType =
                      trainer.trainerDetails.openingHours[day];
                    const isToday =
                      new Date()
                        .toLocaleDateString("en-US", { weekday: "long" })
                        .toLowerCase() === day;
                    let content;
                    if (sessionType === "Closed") {
                      content = (
                        <div className="py-2">
                          <p className="text-sm text-red-500">Closed</p>
                        </div>
                      );
                    } else {
                      const start =
                        trainer.trainerDetails.openingHours[`${day}Start`];
                      const end =
                        trainer.trainerDetails.openingHours[`${day}End`];
                      const start2 =
                        trainer.trainerDetails.openingHours[`${day}Start2`];
                      const end2 =
                        trainer.trainerDetails.openingHours[`${day}End2`];
                      content = (
                        <div className="py-2 space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <Clock size={12} className="text-[#ffc929]" />
                            <p className="text-sm text-gray-600">
                              {start} - {end}
                            </p>
                          </div>
                          {sessionType === "Double Session" &&
                            start2 &&
                            end2 && (
                              <div className="flex items-center justify-center gap-1">
                                <Clock size={12} className="text-[#ffc929]" />
                                <p className="text-sm text-gray-600">
                                  {start2} - {end2}
                                </p>
                              </div>
                            )}
                        </div>
                      );
                    }
                    return (
                      <div
                        key={day}
                        className={`p-3 rounded-lg text-center ${
                          isToday
                            ? "bg-[#ffc929]/20 border border-[#ffc929]/30"
                            : sessionType === "Closed"
                            ? "bg-red-50"
                            : "bg-[#ffc929]/5"
                        } transition-transform duration-300 hover:scale-[1.02]`}
                      >
                        <p
                          className={`font-medium pb-2 border-b ${
                            isToday
                              ? "text-[#ffc929] border-[#ffc929]/30"
                              : "text-gray-800 border-gray-100"
                          }`}
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                          {isToday && (
                            <span className="ml-1 text-xs bg-[#ffc929] text-white px-1 rounded-sm">
                              Today
                            </span>
                          )}
                        </p>
                        {content}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Clock size={36} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">
                    No schedule information available
                  </p>
                </div>
              )}
            </section>

            {/* Gallery Section */}
            <section
              id="gallery"
              className="p-6 bg-white shadow-sm rounded-xl animate-fadeIn"
              style={{ animationDelay: "0.7s" }}
            >
              <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-800">
                <Camera size={20} className="text-[#ffc929]" />
                Training Gallery
              </h2>
              {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-200 rounded-lg animate-pulse aspect-square"
                    ></div>
                  ))}
                </div>
              ) : trainer.trainerDetails?.trainingPhotos?.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {trainer.trainerDetails.trainingPhotos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-lg shadow-sm aspect-square group"
                    >
                      <img
                        src={photo}
                        alt={`Training Photo ${index + 1}`}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        onClick={() => handlePhotoClick(index)}
                        onError={(e) =>
                          (e.target.src = "https://placehold.co/300x300")
                        }
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 cursor-pointer bg-black/40 group-hover:opacity-100"
                        onClick={() => handlePhotoClick(index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            handlePhotoClick(index);
                        }}
                        aria-label={`View training photo ${index + 1}`}
                      >
                        <div className="p-2 rounded-full bg-white/20">
                          <Camera size={20} className="text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Camera size={36} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No training photos available</p>
                </div>
              )}
            </section>

            {/* Reviews Section */}
            <section
              id="reviews"
              className="p-6 bg-white shadow-sm rounded-xl animate-fadeIn"
              style={{ animationDelay: "0.8s" }}
            >
              <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-800">
                <Star size={20} className="text-[#ffc929]" />
                Reviews & Feedback
              </h2>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="p-4 bg-white rounded-lg shadow-sm animate-pulse"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="w-1/4 h-4 mb-2 bg-gray-200 rounded"></div>
                          <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="mb-6 space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="p-4 bg-white rounded-lg shadow-sm transition-transform duration-300 hover:scale-[1.02]"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={
                            review.userId.image
                              ? review.userId.image.startsWith("http")
                                ? review.userId.image
                                : `${process.env.REACT_APP_API_URL}/${review.userId.image}`
                              : "https://placehold.co/300x300"
                          }
                          alt={review.userId.fullName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#ffc929]"
                          onError={(e) =>
                            (e.target.src = "https://placehold.co/300x300")
                          }
                        />
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="font-semibold text-gray-800">
                              {review.userId.fullName}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={
                                  i < Math.round(review.rating)
                                    ? "text-[#ffc929] fill-[#ffc929]"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                          </div>
                          <p className="mt-2 text-gray-600">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 mb-6 text-center">
                  <Star size={36} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No reviews yet</p>
                  <p className="mt-2 text-sm text-gray-400">
                    Be the first to review this trainer
                  </p>
                </div>
              )}
              {user ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    Submit Your Review
                  </h3>
                  {reviewError && (
                    <p className="text-sm text-red-500">{reviewError}</p>
                  )}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={24}
                        className={`cursor-pointer ${
                          star <= ratingInput
                            ? "text-[#ffc929] fill-[#ffc929]"
                            : "text-gray-300"
                        }`}
                        onClick={() => setRatingInput(star)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setRatingInput(star);
                        }}
                        aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
                      />
                    ))}
                  </div>
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Write your review..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-transparent"
                    rows="4"
                    required
                    aria-label="Review comment"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-lg hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 shadow-sm"
                    aria-label="Submit review"
                  >
                    Submit Review
                  </button>
                </form>
              ) : (
                <p className="text-sm text-gray-500">
                  Please{" "}
                  <a href="/login" className="text-[#ffc929] hover:underline">
                    login
                  </a>{" "}
                  to submit a review
                </p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-16">
              <div className="p-6 space-y-6 bg-white shadow-sm rounded-xl">
                {/* Trainer Info */}
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-gray-800">
                    Contact {trainer.fullName}
                  </h2>
                </div>

                {/* Contact Section */}
                <div>
                  {loading ? (
                    <div className="space-y-4">
                      <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <>
                      <p className="mb-4 text-gray-600">
                        Book via our platform or call directly to reserve your
                        session.
                      </p>
                      {(trainer.trainerDetails?.phone ||
                        trainer.trainerDetails?.secondaryPhone) && (
                        <div className="mb-4">
                          <p className="mb-2 text-sm font-medium text-gray-500">
                            Contact by Phone
                          </p>
                          {trainer.trainerDetails?.phone && (
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 mt-1 rounded-full bg-[#ffc929]/10 flex items-center justify-center">
                                <Phone size={16} className="text-[#ffc929]" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">
                                  Phone
                                </p>
                                <a
                                  href={`tel:${trainer.trainerDetails.phone}`}
                                  className="text-base text-[#ffc929] hover:underline"
                                  aria-label={`Call ${trainer.fullName} at ${trainer.trainerDetails.phone}`}
                                >
                                  {trainer.trainerDetails.phone}
                                </a>
                              </div>
                            </div>
                          )}
                          {trainer.trainerDetails?.secondaryPhone && (
                            <div className="flex items-start gap-3 mt-3">
                              <div className="w-8 h-8 mt-1 rounded-full bg-[#ffc929]/10 flex items-center justify-center">
                                <Phone size={16} className="text-[#ffc929]" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">
                                  Secondary Phone
                                </p>
                                <a
                                  href={`tel:${trainer.trainerDetails.secondaryPhone}`}
                                  className="text-base text-[#ffc929] hover:underline"
                                  aria-label={`Call ${trainer.fullName} at ${trainer.trainerDetails.secondaryPhone}`}
                                >
                                  {trainer.trainerDetails.secondaryPhone}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {(trainer.trainerDetails?.socialLinks?.facebook ||
                        trainer.trainerDetails?.socialLinks?.instagram ||
                        trainer.trainerDetails?.socialLinks?.website) && (
                        <div className="mb-4">
                          <p className="mb-2 text-sm font-medium text-gray-500">
                            Connect Online
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {trainer.trainerDetails?.socialLinks?.facebook && (
                              <a
                                href={
                                  trainer.trainerDetails.socialLinks.facebook
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#ffc929]/10 text-[#ffc929] hover:bg-[#ffc929] hover:text-white transition-colors"
                                aria-label="Visit trainer's Facebook page"
                              >
                                <Facebook size={16} />
                              </a>
                            )}
                            {trainer.trainerDetails?.socialLinks?.instagram && (
                              <a
                                href={
                                  trainer.trainerDetails.socialLinks.instagram
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#ffc929]/10 text-[#ffc929] hover:bg-[#ffc929] hover:text-white transition-colors"
                                aria-label="Visit trainer's Instagram page"
                              >
                                <Instagram size={16} />
                              </a>
                            )}
                            {trainer.trainerDetails?.socialLinks?.website && (
                              <a
                                href={
                                  trainer.trainerDetails.socialLinks.website
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#ffc929]/10 text-[#ffc929] hover:bg-[#ffc929] hover:text-white transition-colors"
                                aria-label="Visit trainer's website"
                              >
                                <Globe size={16} />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                      {!trainer.trainerDetails?.phone &&
                        !trainer.trainerDetails?.secondaryPhone &&
                        !trainer.trainerDetails?.socialLinks && (
                          <p className="italic text-gray-500">
                            Contact information not provided
                          </p>
                        )}
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={openAppointmentModal}
                          className="flex items-center gap-2 px-6 py-3 text-white font-medium bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-lg hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 shadow-sm disabled:opacity-50"
                          disabled={!user}
                          aria-label="Book a session now"
                        >
                          <Calendar size={18} />
                          Book a Session Now
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Photo Modal */}
        {selectedPhotoIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="relative w-full max-w-5xl p-4">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white bg-[#ffc929] rounded-full p-2 hover:bg-[#ffa726] transition-all duration-300"
                aria-label="Close photo modal"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") closeModal();
                }}
              >
                <X size={24} />
              </button>
              <div className="absolute left-0 transform -translate-x-1/2 -translate-y-1/2 top-1/2 md:translate-x-0">
                <button
                  onClick={prevPhoto}
                  className="bg-[#ffc929] rounded-full p-3 text-white hover:bg-[#ffa726] transition-all duration-300 shadow-lg"
                  aria-label="Previous photo"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") prevPhoto();
                  }}
                >
                  <ChevronLeft size={28} />
                </button>
              </div>
              <img
                src={trainer.trainerDetails.trainingPhotos[selectedPhotoIndex]}
                alt={`Training Photo ${selectedPhotoIndex + 1}`}
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                onError={(e) => (e.target.src = "https://placehold.co/600x400")}
              />
              <div className="absolute right-0 transform translate-x-1/2 -translate-y-1/2 top-1/2 md:translate-x-0">
                <button
                  onClick={nextPhoto}
                  className="bg-[#ffc929] rounded-full p-3 text-white hover:bg-[#ffa726] transition-all duration-300 shadow-lg"
                  aria-label="Next photo"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") nextPhoto();
                  }}
                >
                  <ChevronRight size={28} />
                </button>
              </div>
              <div className="absolute transform -translate-x-1/2 bottom-8 left-1/2">
                <div className="px-4 py-2 text-sm text-white rounded-full bg-black/30 backdrop-blur-md">
                  Photo {selectedPhotoIndex + 1} of{" "}
                  {trainer.trainerDetails.trainingPhotos.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Modal */}
        {isModalOpen && (
          <AppointmentModal
            professional={trainer}
            professionalType="Trainer"
            onClose={closeAppointmentModal}
            onSuccess={() => {
            closeAppointmentModal();
            }}
          />
        )}

        <ToastContainer />
      </div>
    </div>
  );
}
