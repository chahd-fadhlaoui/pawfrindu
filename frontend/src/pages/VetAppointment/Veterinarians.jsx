import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { Heart, Stethoscope, MapPin, Calendar, ChevronLeft, ChevronRight, Filter, X, Clock, Award, Search } from "lucide-react";
import SearchBar from "../../components/SearchBar";
import { FilterSelect } from "../../components/admin/PetManagement/common/FilterSelect";

const PawIcon = ({ className, style }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M12,17.5c2.33,2.33,5.67,2.33,8,0s2.33-5.67,0-8s-5.67-2.33-8,0S9.67,15.17,12,17.5z M7.5,14.5 c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S9.46,12.54,7.5,14.5z M18.5,3.5c-1.96-1.96-4.04-1.96-6,0s-1.96,4.04,0,6 s4.04,1.96,6,0S20.46,5.46,18.5,3.5z M3.5,9.5c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S5.46,7.54,3.5,9.5z" />
  </svg>
);

const allSpecialties = ["General", "Surgery", "Cardiology", "Dermatology", "Nutrition", "Ophthalmology", "Neurology", "Emergency"];
const allServices = ["Consultation", "Vaccination", "Surgery", "Dental Care", "Diagnostic", "Rehabilitation"];
const allAvailability = ["Weekdays", "Weekends", "Evenings", "24/7"];
const sortOptions = ["Experience High-Low", "Experience Low-High"];

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
        console.log("Fetched veterinarians:", response.data);
        const vets = response.data.veterinarians || [];
        setVeterinarians(vets);
        console.log("Set veterinarians state:", vets);
        setError("");
      } catch (err) {
        console.error("Error fetching veterinarians:", err);
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
    console.log("Initial veterinarians before filtering:", filtered);

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
        // Simplified check: if any day matches the availability type
        return Object.keys(openingHours).some(day => {
          const sessionType = openingHours[day];
          return sessionType !== "Closed" && selectedAvailability === "Weekdays" ? day !== "saturday" && day !== "sunday" : selectedAvailability === "Weekends" ? (day === "saturday" || day === "sunday") : true;
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

    console.log("Filtered veterinarians:", filtered);
    setFilteredVets(filtered); // Simplified state update
    setCurrentPage(1);
  }, [veterinarians, selectedSpecialty, selectedService, selectedAvailability, selectedLocation, sortOrder, searchQuery]);

  // Update locations
  useEffect(() => {
    const uniqueLocations = [...new Set(veterinarians.map(vet => vet.veterinarianDetails?.location))].filter(Boolean);
    setLocations(uniqueLocations);
    console.log("Updated locations:", uniqueLocations);
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
        className={`absolute w-8 h-8 opacity-5 animate-float ${index % 2 === 0 ? "text-[#0ea5e9]" : "text-[#10b981]"} ${index % 3 === 0 ? "top-1/4" : index % 3 === 1 ? "top-1/2" : "top-3/4"} ${index % 4 === 0 ? "left-1/4" : index % 4 === 1 ? "left-1/2" : "left-3/4"}`}
        style={{ animationDelay: `${index * 0.5}s`, transform: `rotate(${index * 45}deg)` }}
      />
    ))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center animate-pulse">
          <Stethoscope size={48} className="mx-auto text-[#0ea5e9]" />
          <p className="mt-4 text-lg font-medium text-gray-600">Finding Veterinarians...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Stethoscope size={48} className="mx-auto mb-4 text-red-500" />
          <p className="font-medium text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <PawBackground />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-14 text-center">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-emerald-500">Find a Veterinarian</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Connect with trusted veterinarians for your pet's health and wellness needs.</p>
          <div className="mt-8 max-w-xl mx-auto">
            <SearchBar 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              placeholder="Search by name, specialty, or location" 
              className="shadow-xl"
            />
          </div>
        </div>

        <div className="bg-white backdrop-blur-sm bg-opacity-90 border-2 border-sky-200 shadow-xl rounded-3xl p-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl shadow-lg hover:shadow-sky-200/50 transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <Filter size={18} />
              {isFilterOpen ? "Hide Filters" : "Filter Veterinarians"}
            </button>
            {filteredVets.length > 0 && (
              <span className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-sky-600 bg-sky-50 border border-sky-200 rounded-full shadow-inner">
                <Stethoscope size={16} className="text-sky-500" /> {filteredVets.length} Veterinarians Available
              </span>
            )}
          </div>

          <div
            className={`grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 transition-all duration-300 ease-in-out ${isFilterOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
          >
            <FilterSelect label="Specialty" value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)} options={specialties} />
            <FilterSelect label="Service" value={selectedService} onChange={(e) => setSelectedService(e.target.value)} options={services} />
            <FilterSelect label="Availability" value={selectedAvailability} onChange={(e) => setSelectedAvailability(e.target.value)} options={availabilities} />
            <FilterSelect label="Location" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} options={locations} />
            <FilterSelect label="Sort By" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} options={sortOptions} />
          </div>

          {(selectedSpecialty || selectedService || selectedAvailability || selectedLocation || searchQuery) && (
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600">Applied Filters:</span>
              {selectedSpecialty && <FilterBadge label="Specialty" value={selectedSpecialty} onClear={() => clearFilter("specialty")} />}
              {selectedService && <FilterBadge label="Service" value={selectedService} onClear={() => clearFilter("service")} />}
              {selectedAvailability && <FilterBadge label="Availability" value={selectedAvailability} onClear={() => clearFilter("availability")} />}
              {selectedLocation && <FilterBadge label="Location" value={selectedLocation} onClear={() => clearFilter("location")} />}
              {searchQuery && <FilterBadge label="Search" value={searchQuery} onClear={() => clearFilter("search")} />}
              <button
                onClick={clearAllFilters}
                className="px-4 py-1.5 ml-2 text-sm font-medium text-sky-600 bg-sky-100 hover:bg-sky-200 transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {filteredVets.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="relative">
              <Stethoscope size={64} className="text-sky-500 opacity-25" />
              <span className="absolute inset-0 flex items-center justify-center text-sky-600">
                <Search size={28} />
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mt-6">No Veterinarians Found</h3>
            <p className="max-w-md mt-3 text-lg text-gray-600">Try adjusting your filters or search criteria to find a veterinarian.</p>
            <button
              onClick={clearAllFilters}
              className="mt-8 px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl shadow-lg hover:shadow-sky-200/50 transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-500 ${isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
              {currentVets.map((vet) => {
                const imageUrl = vet.image ? (vet.image.startsWith("http") ? vet.image : `${process.env.REACT_APP_API_URL}/${vet.image}`) : "https://placehold.co/80x80";
                
                return (
                  <div
                    key={vet._id}
                    onClick={() => navigate(`/vet/${vet._id}`)}
                    className="group bg-white border-2 border-sky-100 rounded-3xl shadow-lg p-8 hover:shadow-2xl hover:border-sky-300 hover:scale-102 transition-all duration-300 cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="flex items-start gap-5">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                        <img
                          src={imageUrl}
                          alt={vet.fullName}
                          className="w-28 h-28 rounded-full object-cover border-3 border-sky-200 shadow-md group-hover:border-sky-300 transition-all duration-300 relative z-10"
                          onError={(e) => (e.target.src = "https://placehold.co/80x80")}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-bold text-gray-800 group-hover:text-sky-700 transition-colors duration-300">{vet.fullName.trim()}</h3>
                          {vet.veterinarianDetails?.specialization && (
                            <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-sky-600 bg-sky-100 rounded-full shadow-inner group-hover:bg-sky-200 transition-colors duration-300">
                              {vet.veterinarianDetails.specialization}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                          <Stethoscope size={16} className="text-sky-500" />
                          {vet.veterinarianDetails?.degree || "Degree not specified"}
                        </p>
                      </div>
                    </div>
                    
                    {vet.veterinarianDetails ? (
                      <div className="mt-6 space-y-4 border-t border-gray-100 pt-4">
                        <p className="text-sm text-gray-700 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center shadow-inner">
                            <MapPin size={16} className="text-sky-500" />
                          </div>
                          {vet.veterinarianDetails.location || "Location not specified"}
                        </p>
                        {vet.veterinarianDetails.openingHours?.monday && (
                          <p className="text-sm text-gray-700 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center shadow-inner">
                              <Clock size={16} className="text-sky-500" />
                            </div>
                            Mon: {vet.veterinarianDetails.openingHours.monday === "Closed" ? "Closed" : `${vet.veterinarianDetails.openingHours.mondayStart} - ${vet.veterinarianDetails.openingHours.mondayEnd}`}
                          </p>
                        )}
                        {vet.veterinarianDetails.experienceYears !== undefined && (
                          <p className="text-sm text-gray-700 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center shadow-inner">
                              <Award size={16} className="text-sky-500" />
                            </div>
                            {vet.veterinarianDetails.experienceYears} years of experience
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-6 text-sm text-gray-500 italic border-t border-gray-100 pt-4">Veterinarian details not available</p>
                    )}
                    
                    <button
                      className="mt-6 w-full py-3 text-base font-medium text-white bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl shadow-md hover:shadow-lg hover:from-emerald-500 hover:to-sky-500 transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Contact Vet
                    </button>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-16">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-3 rounded-full ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-sky-500 hover:bg-sky-100"} transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400`}
                >
                  <ChevronLeft size={24} />
                </button>
                
                <div className="flex items-center gap-3">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`w-12 h-12 rounded-full text-base font-medium flex items-center justify-center ${
                        currentPage === page 
                          ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-lg" 
                          : "text-gray-600 hover:bg-sky-100"
                      } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-3 rounded-full ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-sky-500 hover:bg-sky-100"} transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400`}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const FilterBadge = ({ label, value, onClear }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-[#0ea5e9] bg-[#0ea5e9]/10 rounded-full">
    {label}: {value}
    <button onClick={onClear} className="ml-1 focus:outline-none">
      <X size={14} />
    </button>
  </span>
);