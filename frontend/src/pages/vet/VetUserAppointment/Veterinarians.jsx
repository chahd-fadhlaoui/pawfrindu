import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { Heart, Stethoscope, MapPin, Clock, Award, ChevronLeft, ChevronRight, Filter, X, Search } from "lucide-react";
import SearchBar from "../../../components/SearchBar";
import { FilterSelect } from "../../../components/admin/PetManagement/common/FilterSelect";

const PawIcon = ({ className, style }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M12,17.5c2.33,2.33,5.67,2.33,8,0s2.33-5.67,0-8s-5.67-2.33-8,0S9.67,15.17,12,17.5z M7.5,14.5 c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S9.46,12.54,7.5,14.5z M18.5,3.5c-1.96-1.96-4.04-1.96-6,0s-1.96,4.04,0,6 s4.04,1.96,6,0S20.46,5.46,18.5,3.5z M3.5,9.5c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S5.46,7.54,3.5,9.5z" />
  </svg>
);

const allSpecialties = ["General", "Surgery", "Cardiology", "Dermatology", "Nutrition", "Ophthalmology", "Neurology", "Emergency"];
const allServices = ["Consultation", "Vaccination", "Surgery", "Dental Care", "Diagnostic", "Rehabilitation"];
const allAvailability = ["Weekdays", "Weekends", "Evenings", "24/7"];
const sortOptions = ["Experience High-Low", "Experience Low-High"];

const VetCard = ({ vet, navigate }) => {
  const [isLiked, setIsLiked] = useState(false);
  const imageUrl = vet.image ? (vet.image.startsWith("http") ? vet.image : `${process.env.REACT_APP_API_URL}/${vet.image}`) : "https://placehold.co/80x80";

  return (
    <div
      onClick={() => navigate(`/vet/${vet._id}`)}
      className="relative bg-white border-2 border-[#4ade80]/20 rounded-3xl shadow-md overflow-hidden transition-all duration-500 hover:shadow-xl hover:scale-[1.02] cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#4ade80]/30"
      tabIndex={0}
      aria-label={`View details for ${vet.fullName} in ${vet.veterinarianDetails?.location || "Unknown"}`}
    >
      <div className="relative w-full h-56 overflow-hidden bg-gradient-to-br from-white to-blue-50 rounded-t-3xl">
        <img
          src={imageUrl}
          alt={vet.fullName}
          className="object-cover w-full h-full transition-transform duration-400 group-hover:scale-110"
          onError={(e) => (e.target.src = "https://placehold.co/80x80")}
          loading="lazy"
        />
        <button
          onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
          className="absolute p-2 transition-all duration-300 rounded-full shadow-md top-3 right-3 bg-white/90 hover:bg-[#4ade80]/10 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/30"
          aria-label={isLiked ? `Unlike ${vet.fullName}` : `Like ${vet.fullName}`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-[#4ade80] text-[#4ade80]" : "text-gray-400 group-hover:text-[#4ade80]"} transition-colors duration-300`} />
        </button>
      </div>
      <div className="relative z-10 p-6 space-y-4">
        <div className="transition-all duration-300 transform group-hover:translate-y-[-2px]">
          <h2 className="text-xl font-semibold text-gray-800 truncate transition-colors duration-300 group-hover:text-blue-600">{vet.fullName.trim()}</h2>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <Stethoscope size={14} className="text-[#4ade80]" />
            {vet.veterinarianDetails?.title || "title not specified"}
          </p>
          <div className="flex items-center justify-between text-base font-medium text-gray-700">
            <span className="flex items-center gap-2 px-3 py-1 border border-[#4ade80]/20 rounded-full shadow-sm bg-[#4ade80]/5">
              <MapPin size={16} className="text-[#4ade80]" />
              {vet.veterinarianDetails?.location || "Location not specified"}
            </span>
            {vet.veterinarianDetails?.experienceYears !== undefined && (
              <span className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#4ade80]/20 shadow-sm bg-[#4ade80]/5">
                <Award size={16} className="text-[#4ade80]" />
                {vet.veterinarianDetails.experienceYears} yrs
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterBadge = ({ label, value, onClear }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-[#4ade80] bg-[#4ade80]/10 rounded-full">
    {label}: {value}
    <button onClick={onClear} className="ml-1 focus:outline-none">
      <X size={14} />
    </button>
  </span>
);

export default function Veterinarians() {
  const navigate = useNavigate();
  const { specialty: urlSpecialty } = useParams();

  const [veterinarians, setVeterinarians] = useState([]);
  const [filteredVets, setFilteredVets] = useState([]);
  const [specialties] = useState(allSpecialties);
  const [services] = useState(allServices);
  const [availabilities] = useState(allAvailability);
  const [locations, setLocations] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [vetsPerPage] = useState(9);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch veterinarians from API
  useEffect(() => {
    const fetchVeterinarians = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/user/veterinarians");
        const vets = response.data.veterinarians || [];
        setVeterinarians(vets);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch veterinarians");
      } finally {
        setLoading(false);
      }
    };
    fetchVeterinarians();
  }, []);

  // Initialize selectedSpecialty from urlSpecialty
  useEffect(() => {
    const validSpecialty = urlSpecialty && allSpecialties.includes(urlSpecialty) ? urlSpecialty : "";
    setSelectedSpecialty(validSpecialty);
  }, [urlSpecialty]);

  // Filter veterinarians based on state changes
  useEffect(() => {
    let filtered = [...veterinarians];
    if (selectedSpecialty) {
      filtered = filtered.filter(vet => vet.veterinarianDetails?.specialization === selectedSpecialty);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((vet) =>
        vet.fullName.toLowerCase().includes(query) ||
        (vet.veterinarianDetails?.specialization?.toLowerCase().includes(query)) ||
        (vet.veterinarianDetails?.location?.toLowerCase().includes(query))
      );
    }
    if (selectedService) {
      filtered = filtered.filter(vet =>
        vet.veterinarianDetails?.services?.some(service => service.serviceName === selectedService)
      );
    }
    if (selectedAvailability) {
      filtered = filtered.filter(vet => {
        const openingHours = vet.veterinarianDetails?.openingHours;
        if (!openingHours) return false;
        return Object.keys(openingHours).some(day => {
          const sessionType = openingHours[day];
          return sessionType !== "Closed" && (
            selectedAvailability === "Weekdays" ? day !== "saturday" && day !== "sunday" :
            selectedAvailability === "Weekends" ? (day === "saturday" || day === "sunday") :
            true
          );
        });
      });
    }
    if (selectedLocation) {
      filtered = filtered.filter(vet => vet.veterinarianDetails?.location === selectedLocation);
    }
    if (sortOrder) {
      filtered.sort((a, b) => {
        if (sortOrder === "Experience High-Low") return (b.veterinarianDetails?.experienceYears || 0) - (a.veterinarianDetails?.experienceYears || 0);
        if (sortOrder === "Experience Low-High") return (a.veterinarianDetails?.experienceYears || 0) - (b.veterinarianDetails?.experienceYears || 0);
        return 0;
      });
    }
    setFilteredVets(filtered);
    setCurrentPage(1);
  }, [veterinarians, selectedSpecialty, selectedService, selectedAvailability, selectedLocation, sortOrder, searchQuery]);

  // Update locations
  useEffect(() => {
    const uniqueLocations = [...new Set(veterinarians.map(vet => vet.veterinarianDetails?.location))].filter(Boolean);
    setLocations(uniqueLocations);
  }, [veterinarians]);

  const indexOfLastVet = currentPage * vetsPerPage;
  const indexOfFirstVet = indexOfLastVet - vetsPerPage;
  const currentVets = filteredVets.slice(indexOfFirstVet, indexOfLastVet);
  const totalPages = Math.ceil(filteredVets.length / vetsPerPage);

  const paginate = (pageNumber) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(pageNumber);
      setIsAnimating(false);
    }, 300);
  };

  const clearFilter = (filterType) => {
    switch (filterType) {
      case "specialty": setSelectedSpecialty(urlSpecialty && allSpecialties.includes(urlSpecialty) ? urlSpecialty : ""); break;
      case "service": setSelectedService(""); break;
      case "availability": setSelectedAvailability(""); break;
      case "location": setSelectedLocation(""); break;
      case "search": setSearchQuery(""); break;
      default: break;
    }
  };

  const clearAllFilters = () => {
    setSelectedSpecialty(urlSpecialty && allSpecialties.includes(urlSpecialty) ? urlSpecialty : "");
    setSelectedService("");
    setSelectedAvailability("");
    setSelectedLocation("");
    setSortOrder("");
    setSearchQuery("");
  };

  const PawBackground = () => (
    Array(8).fill(null).map((_, index) => (
      <PawIcon
        key={index}
        className={`absolute w-8 h-8 opacity-5 animate-float ${index % 2 === 0 ? "text-[#4ade80]" : "text-blue-300"} ${index % 3 === 0 ? "top-1/4" : index % 3 === 1 ? "top-1/2" : "top-3/4"} ${index % 4 === 0 ? "left-1/4" : index % 4 === 1 ? "left-1/2" : "left-3/4"}`}
        style={{ animationDelay: `${index * 0.5}s`, transform: `rotate(${index * 45}deg)` }}
      />
    ))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-blue-50">
        <div className="text-center animate-pulse">
          <Stethoscope size={48} className="mx-auto text-[#4ade80]" />
          <p className="mt-4 text-lg font-medium text-gray-600">Finding Veterinarians...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-blue-50">
        <div className="text-center">
          <Stethoscope size={48} className="mx-auto mb-4 text-blue-500" />
          <p className="font-medium text-blue-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen px-4 py-12 overflow-hidden bg-gradient-to-br from-white to-blue-100 sm:py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none"><PawBackground /></div>
      <div className="relative mx-auto space-y-12 max-w-7xl">
        <div className="pt-16 space-y-6 text-center animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-600 bg-white border border-[#4ade80]/20 rounded-full shadow-sm">
            <Stethoscope className="w-4 h-4 mr-2 text-[#4ade80]" />Care for Your Pet
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            <span className="block">Discover Trusted</span>
            <span className="block text-blue-600">Veterinary Experts</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600">
            Connect with skilled veterinarians to ensure your pet's health and happiness.
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm bg-opacity-90 border-2 border-[#4ade80]/20 shadow-xl rounded-3xl p-8 mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-[#4ade80] to-[#3b82f6] rounded-xl shadow-md hover:from-[#3b82f6] hover:to-[#4ade80] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/30"
            >
              <Filter size={16} />
              {isFilterOpen ? "Hide" : "Filter"}
            </button>
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, specialty, or location..."
              className="flex-grow max-w-md shadow-xl sm:flex-grow-0 sm:mx-auto"
            />
            {filteredVets.length > 0 && (
              <span className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-full shadow-inner">
                <Stethoscope size={16} className="text-[#4ade80]" /> {filteredVets.length} Vets Available
              </span>
            )}
          </div>

          <div
            className={`grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 transition-all duration-300 ease-in-out ${isFilterOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
          >
            <FilterSelect
              label="Specialty"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              options={specialties}
              disabled={false}
            />
            <FilterSelect
              label="Service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              options={services}
              disabled={false}
            />
            <FilterSelect
              label="Availability"
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              options={availabilities}
              disabled={false}
            />
            <FilterSelect
              label="Location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              options={locations}
              disabled={false}
            />
            <FilterSelect
              label="Sort By"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              options={sortOptions}
              disabled={false}
            />
          </div>

          {(selectedSpecialty || selectedService || selectedAvailability || selectedLocation || searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="text-sm font-medium text-gray-600">Applied Filters:</span>
              {selectedSpecialty && <FilterBadge label="Specialty" value={selectedSpecialty} onClear={() => clearFilter("specialty")} />}
              {selectedService && <FilterBadge label="Service" value={selectedService} onClear={() => clearFilter("service")} />}
              {selectedAvailability && <FilterBadge label="Availability" value={selectedAvailability} onClear={() => clearFilter("availability")} />}
              {selectedLocation && <FilterBadge label="Location" value={selectedLocation} onClear={() => clearFilter("location")} />}
              {searchQuery && <FilterBadge label="Search" value={searchQuery} onClear={() => clearFilter("search")} />}
              <button
                onClick={clearAllFilters}
                className="px-4 py-1.5 ml-2 text-sm font-medium text-[#4ade80] bg-[#4ade80]/10 hover:bg-[#4ade80]/20 transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4ade80]/30"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"} animate-fadeIn`} style={{ animationDelay: "0.6s" }}>
          {currentVets.length > 0 ? (
            currentVets.map((vet) => <VetCard key={vet._id} vet={vet} navigate={navigate} />)
          ) : (
            <div className="py-12 text-center col-span-full">
              <Stethoscope size={48} className="mx-auto mb-4 text-[#4ade80]" />
              <h3 className="text-xl font-semibold text-gray-800">No Veterinarians Found</h3>
              <p className="mt-2 text-gray-600">Adjust your filters or search to find more veterinarians.</p>
            </div>
          )}
        </div>

        {filteredVets.length > vetsPerPage && (
          <div className="flex items-center justify-center gap-4 mt-12 animate-fadeIn" style={{ animationDelay: "0.8s" }}>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-[#4ade80] hover:bg-[#4ade80]/10"} transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/30`}
              aria-label="Previous page"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const isCurrent = currentPage === page;
                const isNear = Math.abs(currentPage - page) <= 1 || page === 1 || page === totalPages;
                if (!isNear) return page === currentPage - 2 || page === currentPage + 2 ? <span key={page} className="text-gray-400">...</span> : null;
                return (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`w-10 h-10 rounded-full text-sm font-medium ${isCurrent ? "bg-[#4ade80] text-white shadow-md" : "text-gray-600 hover:bg-[#4ade80]/10"} transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/30`}
                    aria-label={`Go to page ${page}`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-[#4ade80] hover:bg-[#4ade80]/10"} transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/30`}
              aria-label="Next page"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}