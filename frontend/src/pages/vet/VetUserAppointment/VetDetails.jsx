import {
  Activity,
  Calendar,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Info,
  Languages,
  MapPin,
  Phone,
  Stethoscope,
  User
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import MapViewer from "../../../components/map/MapViewer";
import { useApp } from "../../../context/AppContext";
import axiosInstance from "../../../utils/axiosInstance";

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

export default function VetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const [vet, setVet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchVetDetails = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/user/vet/${id}`);
        console.log("Fetched vet details:", response.data);
        setVet(response.data.vet);
        setError("");
      } catch (err) {
        console.error("Error fetching vet details:", err);
        setError(
          err.response?.data?.message || "Failed to fetch veterinarian details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVetDetails();
  }, [id]);

  const PawBackground = () =>
    Array(10)
      .fill(null)
      .map((_, index) => {
        const colors = [
          "text-yellow-200",
          "text-orange-200",
          "text-pink-200",
          "text-amber-200",
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

  const handlePhotoClick = (index) => setSelectedPhotoIndex(index);
  const closeModal = () => setSelectedPhotoIndex(null);
  const nextPhoto = () =>
    setSelectedPhotoIndex(
      (prev) => (prev + 1) % vet.veterinarianDetails.clinicPhotos.length
    );
  const prevPhoto = () =>
    setSelectedPhotoIndex(
      (prev) =>
        (prev - 1 + vet.veterinarianDetails.clinicPhotos.length) %
        vet.veterinarianDetails.clinicPhotos.length
    );

  const openAppointmentModal = () => {
    if (!user) {
      navigate("/login", { state: { from: `/vet/${id}` } });
      return;
    }
    setIsModalOpen(true);
  };

  const closeAppointmentModal = () => setIsModalOpen(false);
  const handleBookingSuccess = (data) => {
    console.log("Appointment booked successfully:", data);
    closeAppointmentModal();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-pink-100">
        <div className="text-center animate-pulse">
          <Stethoscope size={64} className="mx-auto text-[#ffc929]" />
          <p className="mt-4 text-xl font-medium text-gray-600">
            Loading Veterinarian Details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !vet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-pink-100">
        <div className="text-center">
          <Stethoscope size={64} className="mx-auto mb-4 text-pink-500" />
          <p className="text-xl font-medium text-pink-600">
            {error || "Veterinarian not found"}
          </p>
          <button
            onClick={() => navigate("/veterinarians")}
            className="mt-6 flex items-center gap-2 mx-auto px-6 py-3 text-base font-medium text-white bg-gradient-to-br from-[#ffc929] to-[#ffa726] rounded-xl shadow-lg hover:shadow-pink-200/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
          >
            <ChevronLeft size={20} />
            Back to Veterinarians
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = vet.image
    ? vet.image.startsWith("http")
      ? vet.image
      : `${process.env.REACT_APP_API_URL}/${vet.image}`
    : "https://placehold.co/120x120";

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white to-pink-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute w-64 h-64 bg-yellow-200 rounded-full top-10 left-10 mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute bg-pink-200 rounded-full top-40 right-20 w-72 h-72 mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute bg-amber-100 rounded-full bottom-40 left-40 w-80 h-80 mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[100px]"></div>
        <div className="absolute inset-0 opacity-10">
          <PawBackground />
        </div>
      </div>

      <div className="relative z-10 max-w-6xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/vets")}
          className="group flex items-center gap-2 mb-10 px-5 py-3 text-base font-medium text-white bg-gradient-to-br from-[#ffc929] to-[#ffa726] rounded-full focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
        >
          <ChevronLeft
            size={18}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          Back to Veterinarians
        </button>

        <div className="relative overflow-hidden border border-yellow-100 shadow-xl bg-white/80 backdrop-blur-lg rounded-3xl">
          <div className="relative h-48 overflow-hidden bg-gradient-to-r from-yellow-100 to-pink-100">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-pink-100 mix-blend-multiply opacity-20"></div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/80 to-transparent"></div>
            </div>

            <div className="absolute transform -translate-x-1/2 -bottom-20 left-1/2 md:left-16 md:translate-x-0">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#ffc929] to-[#ffa726] blur-lg opacity-30"></div>
                <div className="relative p-1 mb-20 bg-white rounded-full shadow-lg">
                  <img
                    src={imageUrl}
                    alt={vet.fullName}
                    className="object-cover border-4 border-white rounded-full shadow-inner w-36 h-36 md:w-40 md:h-40"
                    onError={(e) =>
                      (e.target.src = "https://placehold.co/120x120")
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pt-24 pb-8 md:pt-10 md:pl-64 md:pr-8 lg:pr-12">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">
                  {vet.fullName.trim()}
                </h1>
                <p className="flex items-center gap-2 mt-2 text-lg text-gray-600">
                  <Stethoscope size={18} className="text-pink-500" />
                  {vet.veterinarianDetails?.degree || "Degree not specified"}
                </p>
              </div>
              <button
                className="flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-gradient-to-br from-[#ffc929] to-[#ffa726] rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/"
                onClick={openAppointmentModal}
              >
                <Calendar size={18} className="text-white" />
                Book Appointment
              </button>
            </div>

            {vet.veterinarianDetails?.specialization} && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-gray-500">
                  Specialized in
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 text-sm font-medium text-[#ffc929] bg-[#ffc929]/10 rounded-full border border-yellow-100">
                    {vet.veterinarianDetails.specialization}
                  </span>
                  <span className="px-4 py-1.5 text-sm font-medium text-pink-600 bg-pink-50 border border-pink-100 rounded-full">
                    Animal Healthcare
                  </span>
                </div>
              </div>
            )
          </div>

          <div className="px-6 pb-10 space-y-8 md:px-8 lg:px-12">
            {vet.about ? (
              <div className="p-8 shadow-sm bg-gradient-to-r from-yellow-50 to-pink-50 rounded-2xl">
                <h2 className="flex items-center gap-3 mb-4 text-2xl font-bold text-gray-800">
                  <User size={22} className="text-pink-500" />
                  About Dr. {vet.fullName.split(" ")[1] || vet.fullName}
                </h2>
                <p className="text-lg leading-relaxed text-gray-700">
                  {vet.about}
                </p>
              </div>
            ) : (
              <div className="p-8 shadow-sm bg-yellow-50 rounded-2xl">
                <h2 className="flex items-center gap-3 mb-4 text-2xl font-bold text-gray-800">
                  <User size={22} className="text-pink-500" />
                  About
                </h2>
                <p className="text-lg italic text-gray-500">
                  This veterinarian hasn't provided biographical information
                  yet.
                </p>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 transition-all duration-300 bg-white border border-yellow-100 shadow-sm rounded-2xl hover:border-pink-200 hover:shadow-md">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full">
                    <MapPin size={20} className="text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Location & Contact
                  </h3>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 mt-1 rounded-full bg-gradient-to-br from-[#ffc929] to-[#ffa726] flex items-center justify-center">
                      <MapPin size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Location
                      </p>
                      <p className="text-lg text-gray-800">
                        {vet.veterinarianDetails?.location || "Not specified"},{" "}
                        {vet.veterinarianDetails?.governorate || ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 mt-1 rounded-full bg-yellow-50">
                      <Phone size={18} className="text-pink-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Landline Phone
                      </p>
                      <p className="text-lg text-gray-800">
                        {vet.veterinarianDetails?.landlinePhone ||
                          "Not specified"}
                      </p>
                    </div>
                  </div>

                  {vet.veterinarianDetails?.geolocation && (
                    <div className="mt-6">
                      <p className="mb-2 text-sm font-medium text-gray-500">
                        Map Location
                      </p>
                      <MapViewer
                        position={vet.veterinarianDetails.geolocation}
                      />
                      <a
                        href={`https://www.google.com/maps?q=${vet.veterinarianDetails.geolocation.latitude},${vet.veterinarianDetails.geolocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center mt-2 space-x-2 text-lg font-semibold text-pink-600 hover:underline"
                      >
                        <Globe className="w-5 h-5" />
                        <span>View on Google Maps</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 transition-all duration-300 bg-white border border-yellow-100 shadow-sm rounded-2xl hover:border-pink-200 hover:shadow-md">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-pink-100 rounded-full">
                    <Info size={20} className="text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Practice Details
                  </h3>
                </div>

                <div className="space-y-5">
                  {vet.veterinarianDetails?.averageConsultationDuration && (
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 mt-1 rounded-full bg-pink-50">
                        <Clock size={18} className="text-pink-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Consultation Duration
                        </p>
                        <p className="text-lg text-gray-800">
                          {vet.veterinarianDetails.averageConsultationDuration}{" "}
                          minutes
                        </p>
                      </div>
                    </div>
                  )}

                  {vet.veterinarianDetails?.languagesSpoken?.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 mt-1 rounded-full bg-pink-50">
                        <Languages size={18} className="text-pink-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Languages
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {vet.veterinarianDetails.languagesSpoken.map(
                            (language, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-700"
                              >
                                {language}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {vet.veterinarianDetails?.services?.length > 0 && (
              <div className="p-6 transition-all duration-300 bg-white border border-yellow-100 shadow-sm rounded-2xl hover:border-pink-200 hover:shadow-md">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full">
                    <Activity size={20} className="text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Services Offered
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {vet.veterinarianDetails.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 transition-colors duration-300 bg-yellow-50/50 rounded-xl hover:bg-yellow-50"
                    >
                      <div className="flex items-center justify-center w-8 h-8 mr-3 bg-white rounded-full shadow-sm">
                        <Check size={16} className="text-pink-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {service.serviceName}
                        </p>
                        {service.fee && (
                          <p className="text-sm text-pink-600">
                            {service.fee} TND
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {vet.veterinarianDetails?.openingHours && (
              <div className="p-6 transition-all duration-300 bg-white border border-yellow-100 shadow-sm rounded-2xl hover:border-pink-200 hover:shadow-md">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-pink-100 rounded-full">
                    <Clock size={20} className="text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Opening Hours
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                      vet.veterinarianDetails.openingHours[day];
                    if (sessionType === "Closed") {
                      return (
                        <div key={day} className="p-3 rounded-xl bg-red-50">
                          <p className="font-medium text-gray-700">
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </p>
                          <p className="mt-1 text-sm text-red-500">Closed</p>
                        </div>
                      );
                    }

                    const start =
                      vet.veterinarianDetails.openingHours[`${day}Start`];
                    const end =
                      vet.veterinarianDetails.openingHours[`${day}End`];
                    const start2 =
                      vet.veterinarianDetails.openingHours[`${day}Start2`];
                    const end2 =
                      vet.veterinarianDetails.openingHours[`${day}End2`];

                    return (
                      <div
                        key={day}
                        className="p-3 transition-colors duration-300 rounded-xl bg-yellow-50/50 hover:bg-yellow-50"
                      >
                        <p className="font-medium text-gray-700">
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </p>
                        <div className="flex flex-col mt-1 text-sm text-[#ffc929]">
                          <p>
                            {start} - {end}
                          </p>
                          {sessionType === "Double Session" &&
                            start2 &&
                            end2 && (
                              <p>
                                {start2} - {end2}
                              </p>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {vet.veterinarianDetails?.clinicPhotos?.length > 0 && (
          <div className="mt-12">
            <h3 className="flex items-center justify-center gap-3 mb-6 text-2xl font-bold text-center text-gray-800">
              <Camera size={24} className="text-pink-500" />
              Clinic Photos
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vet.veterinarianDetails.clinicPhotos.map((photo, index) => (
                <div
                  key={index}
                  className="overflow-hidden transition-all duration-300 bg-white border border-yellow-100 shadow-sm cursor-pointer group rounded-2xl hover:shadow-md hover:border-pink-200"
                  onClick={() => handlePhotoClick(index)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={photo}
                      alt={`Clinic Photo ${index + 1}`}
                      className="object-cover w-full h-64 transition-transform duration-500 transform group-hover:scale-105"
                      onError={(e) =>
                        (e.target.src = "https://placehold.co/300x200")
                      }
                    />
                    <div className="absolute inset-0 flex items-end justify-center pb-6 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/60 to-transparent group-hover:opacity-100">
                      <span className="px-4 py-2 font-medium text-white rounded-full bg-black/30 backdrop-blur-sm">
                        View larger
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedPhotoIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="relative w-full max-w-5xl p-4">
              <button
                onClick={closeModal}
                className="absolute p-2 text-white transition-all duration-300 bg-pink-500 rounded-full top-4 right-4 hover:bg-pink-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>

              <div className="absolute left-0 transform -translate-x-1/2 -translate-y-1/2 top-1/2 md:translate-x-0">
                <button
                  onClick={prevPhoto}
                  className="p-3 text-white transition-all duration-300 bg-pink-500 rounded-full shadow-lg hover:bg-pink-600"
                >
                  <ChevronLeft size={28} />
                </button>
              </div>

              <img
                src={vet.veterinarianDetails.clinicPhotos[selectedPhotoIndex]}
                alt={`Clinic Photo ${selectedPhotoIndex + 1}`}
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                onError={(e) => (e.target.src = "https://placehold.co/600x400")}
              />

              <div className="absolute right-0 transform translate-x-1/2 -translate-y-1/2 top-1/2 md:translate-x-0">
                <button
                  onClick={nextPhoto}
                  className="p-3 text-white transition-all duration-300 bg-pink-500 rounded-full shadow-lg hover:bg-pink-600"
                >
                  <ChevronRight size={28} />
                </button>
              </div>

              <div className="absolute transform -translate-x-1/2 bottom-8 left-1/2">
                <div className="px-4 py-2 text-sm text-white rounded-full bg-black/30 backdrop-blur-md">
                  Photo {selectedPhotoIndex + 1} of{" "}
                  {vet.veterinarianDetails.clinicPhotos.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {isModalOpen && (
          <AppointmentModal
            professional={vet}
            professionalType="Vet"
            onClose={closeAppointmentModal}
            onSuccess={handleBookingSuccess}
          />
        )}
      </div>
    </div>
  );
}