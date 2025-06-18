import { debounce } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { Heart, Stethoscope, MapPin, Clock, Award, ChevronLeft, ChevronRight, Filter, X, Search } from "lucide-react";
import SearchBar from "../../../components/SearchBar";
import { FilterSelect } from "../../../components/admin/PetManagement/common/FilterSelect";
import { governorates, delegationsByGovernorate } from "../../../assets/locations";

const PawIcon = ({ className, style }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M12,17.5c2.33,2.33,5.67,2.33,8,0s2.33-5.67,0-8s-5.67-2.33-8,0S9.67,15.17,12,17.5z M7.5,14.5 c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S9.46,12.54,7.5,14.5z M18.5,3.5c-1.96-1.96-4.04-1.96-6,0s-1.96,4.04,0,6 s4.04,1.96,6,0S20.46,5.46,18.5,3.5z M3.5,9.5c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S5.46,7.54,3.5,9.5z" />
  </svg>
);

const specializations = [
  "Consultation",
  "Elective Surgery",
  "Urinary Surgeries",
  "Digestive Surgeries",
  "Orthopedic Surgeries",
  "Hospitalization",
  "Vaccination",
  "Emergency Service",
  "On-Call Service",
  "Imaging (Ultrasound, Radiology)",
  "Laboratory Tests",
  "Grooming",
  "Boarding and Care",
  "Home Visits",
  "Microchip Identification"
];
const allServices = ["Consultation", "Vaccination", "Surgery", "Dental Care", "Diagnostic", "Rehabilitation"];
const allAvailability = ["Weekdays", "Weekends", "Evenings", "24/7"];
const sortOptions = ["Experience High-Low", "Experience Low-High"];

// Fallback options if data is empty
const fallbackGovernorates = ["Tunis", "Ariana", "Sousse"];
const fallbackDelegations = ["Centre", "Medina", "Carthage"];

const VetCard = ({ vet, navigate }) => {
  const [isLiked, setIsLiked] = useState(false);
  const imageUrl = vet.image ? (vet.image.startsWith("http") ? vet.image : `${process.env.REACT_APP_API_URL}/${vet.image}`) : "https://placehold.co/80x80";
  
  const locationDisplay = `${vet.veterinarianDetails?.governorate || "Unknown"}${vet.veterinarianDetails?.delegation ? `, ${vet.veterinarianDetails.delegation}` : ""}`;

  return (
    <div
      onClick={() => navigate(`/vet/${vet._id}`)}
      className="relative bg-white border-2 border-[#ffc929]/20 rounded-3xl shadow-md overflow-hidden transition-all duration-500 hover:shadow-xl hover:scale-[1.02] cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
      tabIndex={0}
      aria-label={`View details for ${vet.fullName} in ${locationDisplay}`}
    >
      <div className="relative w-full h-56 overflow-hidden bg-gradient-to-br from-white to-pink-50 rounded-t-3xl">
        <img
          src={imageUrl}
          alt={vet.fullName}
          className="object-cover w-full h-full transition-transform duration-400 group-hover:scale-110"
          onError={(e) => (e.target.src = "https://placehold.co/80x80")}
          loading="lazy"
        />
        <button
          onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
          className="absolute p-2 transition-all duration-300 rounded-full shadow-md top-3 right-3 bg-white/90 hover:bg-[#ffc929]/10 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
          aria-label={isLiked ? `Unlike ${vet.fullName}` : `Like ${vet.fullName}`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-[#ffc929] text-[#ffc929]" : "text-gray-400 group-hover:text-[#ffc929]"} transition-colors duration-300`} />
        </button>
      </div>
      <div className="relative z-10 p-6 space-y-4">
        <div className="transition-all duration-300 transform group-hover:translate-y-[-2px]">
          <h2 className="text-xl font-semibold text-gray-800 truncate transition-colors duration-300 group-hover:text-pink-500">{vet.fullName.trim()}</h2>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <Stethoscope size={14} className="text-[#ffc929]" />
            {vet.veterinarianDetails?.title || "title not specified"}
          </p>
          <div className="flex items-center justify-between text-base font-medium text-gray-700">
            <span className="flex items-center gap-2 px-3 py-1 border border-[#ffc929]/20 rounded-full shadow-sm bg-[#ffc929]/5">
              <MapPin size={16} className="text-[#ffc929]" />
              {locationDisplay}
            </span>
            {vet.veterinarianDetails?.experienceYears !== undefined && (
              <span className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#ffc929]/20 shadow-sm bg-[#ffc929]/5">
                <Award size={16} className="text-[#ffc929]" />
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
  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-[#ffc929] bg-[#ffc929]/10 rounded-full">
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
  const [specialties] = useState(specializations);
  const [services] = useState(allServices);
  const [availabilities] = useState(allAvailability);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [vetsPerPage] = useState(9);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [selectedDelegation, setSelectedDelegation] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Debug options
  useEffect(() => {
    console.log("Governorates:", governorates);
    console.log("DelegationsByGovernorate:", delegationsByGovernorate);
    console.log("Specialties:", specialties);
    console.log("Services:", services);
    console.log("Availabilities:", availabilities);
    console.log("Sort Options:", sortOptions);
  }, []);

  // Fetch veterinarians from API
  useEffect(() => {
    const fetchVeterinarians = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/user/veterinarians");
        const vets = response.data.veterinarians || [];
        setVeterinarians(vets);
        setError("");
        console.log("Fetched veterinarians:", vets);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch veterinarians");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVeterinarians();
  }, []);

  // Initialize selectedSpecialty from urlSpecialty
  useEffect(() => {
    const validSpecialty = urlSpecialty && specializations.includes(urlSpecialty) ? urlSpecialty : "";
    setSelectedSpecialty(validSpecialty);
    console.log("URL Specialty:", urlSpecialty, "Selected Specialty:", validSpecialty);
  }, [urlSpecialty]);

  // Reset delegation when governorate changes
  useEffect(() => {
    setSelectedDelegation("");
    console.log("Selected Governorate:", selectedGovernorate, "Available Delegations:", delegationsByGovernorate[selectedGovernorate] || []);
  }, [selectedGovernorate]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((query) => {
      setSearchQuery(query);
      console.log("Search Query:", query);
    }, 300),
    []
  );

  // Filter veterinarians
  const filteredVetsMemo = useMemo(() => {
    let filtered = [...veterinarians];

    if (selectedSpecialty) {
      filtered = filtered.filter(vet => 
        vet.veterinarianDetails?.specialization?.toLowerCase() === selectedSpecialty.toLowerCase()
      );
    }

    if (selectedService) {
      filtered = filtered.filter(vet =>
        vet.veterinarianDetails?.services?.some(service => 
          service.serviceName?.toLowerCase() === selectedService.toLowerCase()
        )
      );
    }

    if (selectedAvailability) {
      filtered = filtered.filter(vet => {
        const openingHours = vet.veterinarianDetails?.openingHours;
        if (!openingHours) return false;
        return Object.keys(openingHours).some(day => {
          const sessionType = openingHours[day];
          if (sessionType === "Closed") return false;
          if (selectedAvailability === "Weekdays") {
            return day !== "saturday" && day !== "sunday";
          }
          if (selectedAvailability === "Weekends") {
            return day === "saturday" || day === "sunday";
          }
          if (selectedAvailability === "Evenings") {
            const endTime = openingHours[`${day}End`];
            return endTime && parseInt(endTime.split(":")[0], 10) >= 18;
          }
          return selectedAvailability === "24/7";
        });
      });
    }

    if (selectedGovernorate) {
      filtered = filtered.filter(vet => 
        vet.veterinarianDetails?.governorate?.toLowerCase() === selectedGovernorate.toLowerCase()
      );
    }

    if (selectedDelegation) {
      filtered = filtered.filter(vet => 
        vet.veterinarianDetails?.delegation?.toLowerCase() === selectedDelegation.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((vet) =>
        vet.fullName?.toLowerCase().includes(query) ||
        vet.veterinarianDetails?.specialization?.toLowerCase().includes(query) ||
        vet.veterinarianDetails?.governorate?.toLowerCase().includes(query) ||
        vet.veterinarianDetails?.delegation?.toLowerCase().includes(query) ||
        vet.veterinarianDetails?.services?.some(service => 
          service.serviceName?.toLowerCase().includes(query)
        )
      );
    }

    if (sortOrder) {
      filtered.sort((a, b) => {
        const aExp = a.veterinarianDetails?.experienceYears || 0;
        const bExp = b.veterinarianDetails?.experienceYears || 0;
        return sortOrder === "Experience High-Low" ? bExp - aExp : aExp - bExp;
      });
    }

    console.log("Filtered Vets:", filtered);
    return filtered;
  }, [
    veterinarians,
    selectedSpecialty,
    selectedService,
    selectedAvailability,
    selectedGovernorate,
    selectedDelegation,
    sortOrder,
    searchQuery
  ]);

  useEffect(() => {
    setFilteredVets(filteredVetsMemo);
    setCurrentPage(1);
  }, [filteredVetsMemo]);

  const indexOfLastVet = currentPage * vetsPerPage;
  const indexOfFirstVet = indexOfLastVet - vetsPerPage;
  const currentVets = filteredVets.slice(indexOfFirstVet, indexOfLastVet);
  const totalPages = Math.ceil(filteredVets.length / vetsPerPage);

  const paginate = (pageNumber) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(pageNumber);
      setIsAnimating(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  };

  const clearFilter = (filterType) => {
    switch (filterType) {
      case "specialty": 
        setSelectedSpecialty(urlSpecialty && specializations.includes(urlSpecialty) ? urlSpecialty : "");
        break;
      case "service": 
        setSelectedService("");
        break;
      case "availability": 
        setSelectedAvailability("");
        break;
      case "governorate": 
        setSelectedGovernorate("");
        setSelectedDelegation("");
        break;
      case "delegation": 
        setSelectedDelegation("");
        break;
      case "search": 
        setSearchQuery("");
        break;
      default: 
        break;
    }
  };

  const clearAllFilters = () => {
    setSelectedSpecialty(urlSpecialty && specializations.includes(urlSpecialty) ? urlSpecialty : "");
    setSelectedService("");
    setSelectedAvailability("");
    setSelectedGovernorate("");
    setSelectedDelegation("");
    setSortOrder("");
    setSearchQuery("");
  };

  const PawBackground = () => (
    Array(8).fill(null).map((_, index) => (
      <PawIcon
        key={index}
        className={`absolute w-8 h-8 opacity-5 animate-float ${index % 2 === 0 ? "text-[#ffc929]" : "text-pink-300"} ${index % 3 === 0 ? "top-1/4" : index % 3 === 1 ? "top-1/2" : "top-3/4"} ${index % 4 === 0 ? "left-1/4" : index % 4 === 1 ? "left-1/2" : "left-3/4"}`}
        style={{ animationDelay: `${index * 0.5}s`, transform: `rotate(${index * 45}deg)` }}
      />
    ))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-pink-50">
        <div className="text-center animate-pulse">
          <Stethoscope size={48} className="mx-auto text-[#ffc929]" />
          <p className="mt-4 text-lg font-medium text-gray-600">Finding Veterinarians...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-pink-50">
        <div className="text-center">
          <Stethoscope size={48} className="mx-auto mb-4 text-pink-500" />
          <p className="font-medium text-pink-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Use fallback if governorates or delegations are empty
  const availableGovernorates = governorates && governorates.length > 0 ? governorates : fallbackGovernorates;
  const availableDelegations = selectedGovernorate && delegationsByGovernorate[selectedGovernorate] && delegationsByGovernorate[selectedGovernorate].length > 0 
    ? delegationsByGovernorate[selectedGovernorate] 
    : fallbackDelegations;

  // Format options for FilterSelect if it expects { value, label }
  const formatOptions = (options) => 
    options.map(opt => typeof opt === "string" ? { value: opt, label: opt } : opt);

  return (
    <section className="relative min-h-screen px-4 py-12 overflow-hidden bg-gradient-to-br from-white to-pink-50 sm:py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none"><PawBackground /></div>
      <div className="relative mx-auto space-y-12 max-w-7xl">
        <div className="pt-16 space-y-6 text-center animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-[#ffc929]/20 rounded-full shadow-sm">
            <Stethoscope className="w-4 h-4 mr-2 text-[#ffc929]" />Care for Your Pet
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            <span className="block">Discover Trusted</span>
            <span className="block text-pink-500">Veterinary Experts</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600">
            Connect with skilled veterinarians to ensure your pet's health and happiness.
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm bg-opacity-90 border-2 border-[#ffc929]/20 shadow-xl rounded-3xl p-8 mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
              aria-label={isFilterOpen ? "Hide filters" : "Show filters"}
            >
              <Filter size={16} />
              {isFilterOpen ? "Hide" : "Filter"}
            </button>
            <SearchBar
              value={searchQuery}
              onChange={(e) => debouncedSearch(e.target.value)}
              placeholder="Search by name, location, or service..."
              className="flex-grow max-w-md shadow-xl sm:flex-grow-0 sm:mx-auto"
              iconColor="text-pink-500"
            />
            {filteredVets.length > 0 && (
              <span className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#ffc929] bg-[#ffc929]/10 border border-[#ffc929]/20 rounded-full shadow-inner">
                <Stethoscope size={16} className="text-[#ffc929]" /> {filteredVets.length} Vets Available
              </span>
            )}
          </div>

          <div
            className={`grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 transition-all duration-300 ease-in-out ${isFilterOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
          >
            <FilterSelect
              label="Specialty"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              options={formatOptions(specialties)}
              disabled={false}
            />
            <FilterSelect
              label="Service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              options={formatOptions(services)}
              disabled={false}
            />
            <FilterSelect
              label="Availability"
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              options={formatOptions(availabilities)}
              disabled={false}
            />
            <FilterSelect
              label="Governorate"
              value={selectedGovernorate}
              onChange={(e) => setSelectedGovernorate(e.target.value)}
              options={formatOptions(availableGovernorates)}
              disabled={false}
            />
            <FilterSelect
              label="Delegation"
              value={selectedDelegation}
              onChange={(e) => setSelectedDelegation(e.target.value)}
              options={formatOptions(availableDelegations)}
              disabled={!selectedGovernorate || availableDelegations.length === 0}
            />
            <FilterSelect
              label="Sort By"
              value={sortOrder}
              onChange={(e) => setSelectedSortOrder(e.target.value)}
              options={formatOptions(sortOptions)}
              disabled={false}
            />
          </div>

          {(selectedSpecialty || selectedService || selectedAvailability || selectedGovernorate || selectedDelegation || searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="text-sm font-medium text-gray-600">Applied Filters:</span>
              {selectedSpecialty && <FilterBadge label="Specialty" value={selectedSpecialty} onClear={() => clearFilter("specialty")} />}
              {selectedService && <FilterBadge label="Service" value={selectedService} onClear={() => clearFilter("service")} />}
              {selectedAvailability && <FilterBadge label="Availability" value={selectedAvailability} onClear={() => clearFilter("availability")} />}
              {selectedGovernorate && <FilterBadge label="Governorate" value={selectedGovernorate} onClear={() => clearFilter("governorate")} />}
              {selectedDelegation && <FilterBadge label="Delegation" value={selectedDelegation} onClear={() => clearFilter("delegation")} />}
              {searchQuery && <FilterBadge label="Search" value={searchQuery} onClear={() => clearFilter("search")} />}
              <button
                onClick={clearAllFilters}
                className="px-4 py-1.5 ml-2 text-sm font-medium text-[#ffc929] bg-[#ffc929]/10 hover:bg-[#ffc929]/20 transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
                aria-label="Clear all filters"
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
              <Stethoscope size={48} className="mx-auto mb-4 text-[#ffc929]" />
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
              className={`p-2 rounded-full ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-[#ffc929] hover:bg-[#ffc929]/10"} transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30`}
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
                    className={`w-10 h-10 rounded-full text-sm font-medium ${isCurrent ? "bg-[#ffc929] text-white shadow-md" : "text-gray-600 hover:bg-[#ffc929]/10"} transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30`}
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
              className={`p-2 rounded-full ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-[#ffc929] hover:bg-[#ffc929]/10"} transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30`}
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