import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { Stethoscope, MapPin, Clock, Award, ChevronLeft, User, Calendar, Phone, Check, Languages, ChevronRight, Info, Activity, Camera } from "lucide-react";

const PawIcon = ({ className, style }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M12,17.5c2.33,2.33,5.67,2.33,8,0s2.33-5.67,0-8s-5.67-2.33-8,0S9.67,15.17,12,17.5z M7.5,14.5 c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S9.46,12.54,7.5,14.5z M18.5,3.5c-1.96-1.96-4.04-1.96-6,0s-1.96,4.04,0,6 s4.04,1.96,6,0S20.46,5.46,18.5,3.5z M3.5,9.5c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S5.46,7.54,3.5,9.5z" />
  </svg>
);

export default function VetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vet, setVet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

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
        setError(err.response?.data?.message || "Failed to fetch veterinarian details");
      } finally {
        setLoading(false);
      }
    };

    fetchVetDetails();
  }, [id]);

  const PawBackground = () => (
    Array(10).fill(null).map((_, index) => (
      <PawIcon
        key={index}
        className={`absolute w-10 h-10 opacity-10 animate-float ${index % 2 === 0 ? "text-sky-400" : "text-emerald-400"} ${index % 3 === 0 ? "top-1/4" : index % 3 === 1 ? "top-1/2" : "top-3/4"} ${index % 4 === 0 ? "left-1/4" : index % 4 === 1 ? "left-1/2" : "left-3/4"}`}
        style={{ animationDelay: `${index * 0.6}s`, transform: `rotate(${index * 45}deg)` }}
      />
    ))
  );

  const handlePhotoClick = (index) => setSelectedPhotoIndex(index);
  const closeModal = () => setSelectedPhotoIndex(null);
  const nextPhoto = () => setSelectedPhotoIndex((prev) => (prev + 1) % vet.veterinarianDetails.clinicPhotos.length);
  const prevPhoto = () => setSelectedPhotoIndex((prev) => (prev - 1 + vet.veterinarianDetails.clinicPhotos.length) % vet.veterinarianDetails.clinicPhotos.length);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <div className="text-center animate-pulse">
          <Stethoscope size={64} className="mx-auto text-sky-500" />
          <p className="mt-4 text-xl font-medium text-gray-600">Loading Veterinarian Details...</p>
        </div>
      </div>
    );
  }

  if (error || !vet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <div className="text-center">
          <Stethoscope size={64} className="mx-auto mb-4 text-red-500" />
          <p className="text-xl font-medium text-red-600">{error || "Veterinarian not found"}</p>
          <button
            onClick={() => navigate("/veterinarians")}
            className="mt-6 flex items-center gap-2 mx-auto px-6 py-3 text-base font-medium text-white bg-gradient-to-br from-blue-500 to-green-500 rounded-xl shadow-lg hover:shadow-sky-200/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400"          >
            <ChevronLeft size={20} />
            Back to Veterinarians
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = vet.image ? (vet.image.startsWith("http") ? vet.image : `${process.env.REACT_APP_API_URL}/${vet.image}`) : "https://placehold.co/120x120";

  return (
<div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
  {/* Animated background elements */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-0 w-full h-full">
      <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-40 left-40 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
    </div>
    <div className="absolute inset-0 bg-white/30 backdrop-blur-[100px]"></div>
    <div className="absolute inset-0 opacity-10">
      <PawBackground />
    </div>
  </div>

  <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <button
      onClick={() => navigate("/vets")}
      className="group flex items-center gap-2 mb-10 px-5 py-3 text-base font-medium text-white bg-gradient-to-br from-blue-500 to-green-500 rounded-full  focus:outline-none "
    >
      <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
      Back to Veterinarians
    </button>

    <div className="bg-white/80 backdrop-blur-lg rounded-3xl overflow-hidden shadow-xl border border-emerald-100 relative">
      {/* Hero header section */}
      <div className="relative h-48 bg-gradient-to-r from-blue-100 to-green-100 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 mix-blend-multiply opacity-20"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/80 to-transparent"></div>
        </div>
        
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 md:left-16 md:translate-x-0">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-emerald-300 to-teal-300 blur-lg opacity-30"></div>
            <div className="relative rounded-full p-1 bg-white shadow-lg mb-20">
              <img
                src={imageUrl}
                alt={vet.fullName}
                className="w-36 h-36 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-inner"
                onError={(e) => (e.target.src = "https://placehold.co/120x120")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-24 md:pt-10 pb-8 px-6 md:pl-64 md:pr-8 lg:pr-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              {vet.fullName.trim()}
            </h1>
            <p className="mt-2 text-lg text-gray-600 flex items-center gap-2">
              <Stethoscope size={18} className="text-emerald-500" />
              {vet.veterinarianDetails?.degree || "Degree not specified"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-gradient-to-br from-blue-500 to-green-500 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              onClick={() => alert("Booking appointment...")}
            >
              <Calendar size={18} className="text-white" />
              Book Appointment
            </button>
            <button
              className="flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-full shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              onClick={() => alert("Contact now...")}
            >
              <Phone size={18} className="text-emerald-500" />
              Contact Now
            </button>
          </div>
        </div>

        {/* Specialization pills */}
        {vet.veterinarianDetails?.specialization && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-500 mb-2">Specialized in</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full">
                {vet.veterinarianDetails.specialization}
              </span>
              <span className="px-4 py-1.5 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-100 rounded-full">
                Animal Healthcare
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content tabs and sections */}
      <div className="px-6 md:px-8 lg:px-12 pb-10 space-y-8">
        {/* About section */}
        {vet.about ? (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
              <User size={22} className="text-emerald-500" />
              About Dr. {vet.fullName.split(" ")[1] || vet.fullName}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">{vet.about}</p>
          </div>
        ) : (
          <div className="bg-emerald-50 p-8 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
              <User size={22} className="text-emerald-500" />
              About
            </h2>
            <p className="text-lg text-gray-500 italic">This veterinarian hasn't provided biographical information yet.</p>
          </div>
        )}

        {/* Info cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <MapPin size={20} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Location & Contact</h3>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 mt-1 rounded-full bg-emerald-50 flex items-center justify-center">
                  <MapPin size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-lg text-gray-800">{vet.veterinarianDetails?.location || "Not specified"}, {vet.veterinarianDetails?.governorate || ""}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 mt-1 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Phone size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Landline Phone</p>
                  <p className="text-lg text-gray-800">{vet.veterinarianDetails?.landlinePhone || "Not specified"}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-emerald-100">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all duration-300">
                <MapPin size={16} className="text-emerald-500" />
                View on Map
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <Info size={20} className="text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Practice Details</h3>
            </div>
            
            <div className="space-y-5">
              {vet.veterinarianDetails?.averageConsultationDuration && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 mt-1 rounded-full bg-teal-50 flex items-center justify-center">
                    <Clock size={18} className="text-teal-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Consultation Duration</p>
                    <p className="text-lg text-gray-800">{vet.veterinarianDetails.averageConsultationDuration} minutes</p>
                  </div>
                </div>
              )}
              
              {vet.veterinarianDetails?.languagesSpoken?.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 mt-1 rounded-full bg-teal-50 flex items-center justify-center">
                    <Languages size={18} className="text-teal-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Languages</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vet.veterinarianDetails.languagesSpoken.map((language, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Services section */}
        {vet.veterinarianDetails?.services?.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Activity size={20} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Services Offered</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vet.veterinarianDetails.services.map((service, index) => (
                <div key={index} className="flex items-center p-3 bg-emerald-50/50 rounded-xl hover:bg-emerald-50 transition-colors duration-300">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm mr-3">
                    <Check size={16} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">{service.serviceName}</p>
                    {service.fee && <p className="text-sm text-emerald-600">{service.fee} TND</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opening hours section */}
        {vet.veterinarianDetails?.openingHours && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <Clock size={20} className="text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Opening Hours</h3>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                const sessionType = vet.veterinarianDetails.openingHours[day];
                if (sessionType === "Closed") {
                  return (
                    <div key={day} className="p-3 rounded-xl bg-gray-50">
                      <p className="font-medium text-gray-700">{day.charAt(0).toUpperCase() + day.slice(1)}</p>
                      <p className="text-red-500 text-sm mt-1">Closed</p>
                    </div>
                  );
                }
                
                const start = vet.veterinarianDetails.openingHours[`${day}Start`];
                const end = vet.veterinarianDetails.openingHours[`${day}End`];
                const start2 = vet.veterinarianDetails.openingHours[`${day}Start2`];
                const end2 = vet.veterinarianDetails.openingHours[`${day}End2`];
                
                return (
                  <div key={day} className="p-3 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 transition-colors duration-300">
                    <p className="font-medium text-gray-700">{day.charAt(0).toUpperCase() + day.slice(1)}</p>
                    <div className="flex flex-col text-sm text-emerald-700 mt-1">
                      <p>{start} - {end}</p>
                      {sessionType === "Double Session" && start2 && end2 && <p>{start2} - {end2}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Clinic photos gallery */}
    {vet.veterinarianDetails?.clinicPhotos?.length > 0 && (
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-3">
          <Camera size={24} className="text-emerald-500" />
          Clinic Photos
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vet.veterinarianDetails.clinicPhotos.map((photo, index) => (
            <div
              key={index}
              className="group bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all duration-300 cursor-pointer"
              onClick={() => handlePhotoClick(index)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={photo}
                  alt={`Clinic Photo ${index + 1}`}
                  className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => (e.target.src = "https://placehold.co/300x200")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <span className="text-white font-medium px-4 py-2 rounded-full bg-black/30 backdrop-blur-sm">View larger</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Photo Modal */}
    {selectedPhotoIndex !== null && (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="relative max-w-5xl w-full p-4">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white bg-emerald-500 rounded-full p-2 hover:bg-emerald-600 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2 md:translate-x-0">
            <button
              onClick={prevPhoto}
              className="bg-emerald-500 rounded-full p-3 text-white hover:bg-emerald-600 transition-all duration-300 shadow-lg"
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
          
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 md:translate-x-0">
            <button
              onClick={nextPhoto}
              className="bg-emerald-500 rounded-full p-3 text-white hover:bg-emerald-600 transition-all duration-300 shadow-lg"
            >
              <ChevronRight size={28} />
            </button>
          </div>
          
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/30 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm">
              Photo {selectedPhotoIndex + 1} of {vet.veterinarianDetails.clinicPhotos.length}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
  );
}