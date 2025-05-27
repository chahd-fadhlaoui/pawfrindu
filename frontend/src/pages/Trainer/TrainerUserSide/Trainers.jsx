import { debounce } from "lodash";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  PawPrint,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  delegationsByGovernorate,
  governorates,
} from "../../../assets/locations";
import { SPECIES_OPTIONS, breeds } from "../../../assets/Pet";
import { FilterBadge, FilterSelect } from "../../../components/common/Filter";
import SearchBar from "../../../components/SearchBar";
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

const allServices = ["Basic Training", "Guard Dog Training"];
const allAvailability = ["Weekdays", "Weekends", "Evenings"];
const sortOptions = ["Rating High-Low", "Rating Low-High"];
const allBreeds = [
  ...new Set([
    ...(breeds.dog || []),
    ...(breeds.cat || []),
    ...(breeds.other || []),
  ]),
];

const TrainerCard = ({ trainer, navigate }) => {
  const imageUrl = trainer.image
    ? trainer.image.startsWith("http")
      ? trainer.image
      : `${process.env.REACT_APP_API_URL}/${trainer.image}`
    : "/placeholder-trainer.png";

  // Determine location display based on trainingFacilityType
  const locationDisplay =
    trainer.trainerDetails?.trainingFacilityType === "Mobile"
      ? trainer.trainerDetails?.serviceAreas?.length > 0
        ? `${trainer.trainerDetails.serviceAreas
            .map((area) => area.governorate)
            .join(", ")}`
        : "Service areas not specified"
      : `${trainer.trainerDetails?.governorate || "Unknown"}${
          trainer.trainerDetails?.delegation
            ? `, ${trainer.trainerDetails.delegation}`
            : ""
        }`;

  return (
    <div
      onClick={() => navigate(`/trainer/${trainer._id}`)}
      className="relative bg-white border-2 border-[#ffc929]/20 rounded-3xl shadow-md overflow-hidden transition-all duration-500 hover:shadow-xl hover:scale-[1.02] cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
      tabIndex={0}
      aria-label={`View details for ${trainer.fullName} - ${locationDisplay}`}
    >
      <div className="relative w-full h-56 overflow-hidden bg-gradient-to-br from-white to-pink-50 rounded-t-3xl">
        <img
          src={imageUrl}
          alt={trainer.fullName}
          className="object-cover w-full h-full transition-transform duration-400 group-hover:scale-110"
          onError={(e) => (e.target.src = "/placeholder-trainer.png")}
          loading="lazy"
        />
      </div>
      <div className="relative z-10 p-6 space-y-4">
        <div className="transition-all duration-300 transform group-hover:translate-y-[-2px]">
          <h2 className="text-xl font-semibold text-gray-800 truncate transition-colors duration-300 group-hover:text-pink-500">
            {trainer.fullName?.trim() || "Unknown Trainer"}
          </h2>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center justify-between text-base font-medium text-gray-700">
            <span className="flex items-center gap-2 px-3 py-1 border border-[#ffc929]/20 rounded-full shadow-sm bg-[#ffc929]/5">
              <MapPin size={16} className="text-[#ffc929]" />
              {locationDisplay}
            </span>
            {trainer.trainerDetails?.rating !== undefined && (
              <span className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#ffc929]/20 shadow-sm bg-[#ffc929]/5">
                <Award size={16} className="text-[#ffc929]" />
                {trainer.trainerDetails.rating.toFixed(1)} ★
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Trainers() {
  const navigate = useNavigate();

  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [trainersPerPage] = useState(9);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [selectedDelegation, setSelectedDelegation] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch trainers from API
  useEffect(() => {
    const fetchTrainers = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/user/trainers");
        const trainersData = response.data.trainers || [];
        setTrainers(trainersData);
        setFilteredTrainers(trainersData);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch trainers");
        console.error("Fetch trainers error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  // Reset delegation when governorate changes
  useEffect(() => {
    setSelectedDelegation("");
  }, [selectedGovernorate]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        setSearchQuery(query);
      }, 300),
    []
  );

  // Filter trainers
  const filteredTrainersMemo = useMemo(() => {
    let filtered = [...trainers];

    if (selectedService) {
      filtered = filtered.filter((trainer) =>
        trainer.trainerDetails?.services?.some((service) =>
          service?.serviceName?.toLowerCase().includes(selectedService.toLowerCase())
        )
      );
    }

    if (selectedSpecies) {
      filtered = filtered.filter((trainer) =>
        trainer.trainerDetails?.breedsTrained?.some(
          (breed) => breed?.species?.toLowerCase() === selectedSpecies.toLowerCase()
        )
      );
    }

    if (selectedBreed) {
      filtered = filtered.filter((trainer) =>
        trainer.trainerDetails?.breedsTrained?.some((breed) =>
          breed?.breedName?.toLowerCase().includes(selectedBreed.toLowerCase())
        )
      );
    }

    if (selectedAvailability) {
      filtered = filtered.filter((trainer) => {
        const openingHours = trainer.trainerDetails?.openingHours || {};
        return Object.keys(openingHours).some((day) => {
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
          return true;
        });
      });
    }

    if (selectedGovernorate) {
      filtered = filtered.filter((trainer) => {
        if (trainer.trainerDetails?.trainingFacilityType === "Mobile") {
          return trainer.trainerDetails?.serviceAreas?.some(
            (area) =>
              area.governorate?.toLowerCase() === selectedGovernorate.toLowerCase()
          );
        }
        return (
          trainer.trainerDetails?.governorate?.toLowerCase() ===
          selectedGovernorate.toLowerCase()
        );
      });
    }

    if (selectedDelegation) {
      filtered = filtered.filter((trainer) => {
        // Only apply delegation filter to Fixed Facility trainers
        if (trainer.trainerDetails?.trainingFacilityType === "Mobile") {
          return true; // Mobile trainers are not filtered by delegation
        }
        return (
          trainer.trainerDetails?.delegation?.toLowerCase() ===
          selectedDelegation.toLowerCase()
        );
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((trainer) => {
        const serviceAreasString = trainer.trainerDetails?.serviceAreas
          ?.map((area) => area.governorate)
          .join(" ");
        return (
          trainer.fullName?.toLowerCase().includes(query) ||
          trainer.trainerDetails?.governorate?.toLowerCase().includes(query) ||
          trainer.trainerDetails?.delegation?.toLowerCase().includes(query) ||
          serviceAreasString?.toLowerCase().includes(query) ||
          trainer.trainerDetails?.services?.some((service) =>
            service?.serviceName?.toLowerCase().includes(query)
          )
        );
      });
    }

    if (sortOrder) {
      filtered.sort((a, b) => {
        const aRating = a.trainerDetails?.rating || 0;
        const bRating = b.trainerDetails?.rating || 0;
        return sortOrder === "Rating High-Low" ? bRating - aRating : aRating - bRating;
      });
    }

    return filtered;
  }, [
    trainers,
    selectedService,
    selectedSpecies,
    selectedBreed,
    selectedAvailability,
    selectedGovernorate,
    selectedDelegation,
    sortOrder,
    searchQuery,
  ]);

  useEffect(() => {
    setFilteredTrainers(filteredTrainersMemo);
    setCurrentPage(1);
  }, [filteredTrainersMemo]);

  const indexOfLastTrainer = currentPage * trainersPerPage;
  const indexOfFirstTrainer = indexOfLastTrainer - trainersPerPage;
  const currentTrainers = filteredTrainers.slice(
    indexOfFirstTrainer,
    indexOfLastTrainer
  );
  const totalPages = Math.ceil(filteredTrainers.length / trainersPerPage);

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
      case "service":
        setSelectedService("");
        break;
      case "species":
        setSelectedSpecies("");
        break;
      case "breed":
        setSelectedBreed("");
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
    setSelectedService("");
    setSelectedSpecies("");
    setSelectedBreed("");
    setSelectedAvailability("");
    setSelectedGovernorate("");
    setSelectedDelegation("");
    setSortOrder("");
    setSearchQuery("");
  };

  const PawBackground = () =>
    Array(8)
      .fill(null)
      .map((_, index) => (
        <PawIcon
          key={`paw-${index}`}
          className={`absolute w-8 h-8 opacity-5 animate-float ${
            index % 2 === 0 ? "text-[#ffc929]" : "text-pink-300"
          } ${
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
            animationDelay: `${index * 0.5}s`,
            transform: `rotate(${index * 45}deg)`,
          }}
        />
      ));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-pink-50">
        <div className="text-center animate-pulse">
          <PawPrint size={48} className="mx-auto text-[#ffc929]" />
          <p className="mt-4 text-lg font-medium text-gray-600">
            Finding Trainers...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-pink-50">
        <div className="text-center">
          <PawPrint size={48} className="mx-auto mb-4 text-red-500" />
          <p className="font-medium text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  const availableDelegations = selectedGovernorate
    ? delegationsByGovernorate[selectedGovernorate] || []
    : [];

  return (
    <section className="relative min-h-screen px-4 py-12 overflow-hidden bg-gradient-to-br from-white to-pink-50 sm:py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <PawBackground />
      </div>
      <div className="relative mx-auto space-y-12 max-w-7xl">
        <div
          className="pt-16 space-y-6 text-center animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-[#ffc929]/20 rounded-full shadow-sm">
            <PawPrint className="w-4 h-4 mr-2 text-[#ffc929]" />
            Train Your Pet
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            <span className="block">Discover Expert</span>
            <span className="block text-pink-500">Pet Trainers</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600">
            Connect with skilled trainers to help your pet thrive.
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
            />
            <span className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#ffc929] bg-[#ffc929]/10 border border-[#ffc929]/20 rounded-full shadow-inner">
              <PawPrint size={16} className="text-[#ffc929]" />{" "}
              {filteredTrainers.length} Trainers Available
            </span>
          </div>

          <div
            className={`grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 transition-all duration-300 ease-in-out ${
              isFilterOpen
                ? "max-h-[600px] opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <FilterSelect
              label="Service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              options={allServices}
              disabled={false}
            />
            <FilterSelect
              label="Species"
              value={selectedSpecies}
              onChange={(e) => {
                setSelectedSpecies(e.target.value);
                setSelectedBreed("");
              }}
              options={SPECIES_OPTIONS}
              disabled={false}
            />
            <FilterSelect
              label="Breed"
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value)}
              options={
                selectedSpecies
                  ? [
                      ...new Set(
                        breeds[selectedSpecies.toLowerCase()] || allBreeds
                      ),
                    ]
                  : allBreeds
              }
              disabled={!selectedSpecies || allBreeds.length === 0}
            />
            <FilterSelect
              label="Availability"
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              options={allAvailability}
              disabled={false}
            />
            <FilterSelect
              label="Governorate"
              value={selectedGovernorate}
              onChange={(e) => setSelectedGovernorate(e.target.value)}
              options={governorates || []}
              disabled={false}
            />
            <FilterSelect
              label="Delegation"
              value={selectedDelegation}
              onChange={(e) => setSelectedDelegation(e.target.value)}
              options={availableDelegations}
              disabled={
                !selectedGovernorate || availableDelegations.length === 0
              }
            />
            <FilterSelect
              label="Sort By"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              options={sortOptions}
              disabled={false}
            />
          </div>

          {(selectedService ||
            selectedSpecies ||
            selectedBreed ||
            selectedAvailability ||
            selectedGovernorate ||
            selectedDelegation ||
            searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="text-sm font-medium text-gray-600">
                Applied Filters:
              </span>
              {selectedService && (
                <FilterBadge
                  label="Service"
                  value={selectedService}
                  onClear={() => clearFilter("service")}
                />
              )}
              {selectedSpecies && (
                <FilterBadge
                  label="Species"
                  value={selectedSpecies}
                  onClear={() => clearFilter("species")}
                />
              )}
              {selectedBreed && (
                <FilterBadge
                  label="Breed"
                  value={selectedBreed}
                  onClear={() => clearFilter("breed")}
                />
              )}
              {selectedAvailability && (
                <FilterBadge
                  label="Availability"
                  value={selectedAvailability}
                  onClear={() => clearFilter("availability")}
                />
              )}
              {selectedGovernorate && (
                <FilterBadge
                  label="Governorate"
                  value={selectedGovernorate}
                  onClear={() => clearFilter("governorate")}
                />
              )}
              {selectedDelegation && (
                <FilterBadge
                  label="Delegation"
                  value={selectedDelegation}
                  onClear={() => clearFilter("delegation")}
                />
              )}
              {searchQuery && (
                <FilterBadge
                  label="Search"
                  value={searchQuery}
                  onClear={() => clearFilter("search")}
                />
              )}
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

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${
            isAnimating ? "opacity-0" : "opacity-100"
          } animate-fadeIn`}
          style={{ animationDelay: "0.6s" }}
        >
          {currentTrainers.length > 0 ? (
            currentTrainers.map((trainer) => (
              <TrainerCard
                key={trainer._id}
                trainer={trainer}
                navigate={navigate}
              />
            ))
          ) : (
            <div className="py-12 text-center col-span-full">
              <PawPrint size={48} className="mx-auto mb-4 text-[#ffc929]" />
              <h3 className="text-xl font-semibold text-gray-800">
                No Trainers Found
              </h3>
              <p className="mt-2 text-gray-600">
                Adjust your filters or search to find more trainers.
              </p>
            </div>
          )}
        </div>

        {filteredTrainers.length > trainersPerPage && (
          <div
            className="flex items-center justify-center gap-4 mt-12 animate-fadeIn"
            style={{ animationDelay: "0.8s" }}
          >
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-[#ffc929] hover:bg-[#ffc929]/10"
              } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30`}
              aria-label="Previous page"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  const isCurrent = currentPage === page;
                  const isNear =
                    Math.abs(currentPage - page) <= 1 ||
                    page === 1 ||
                    page === totalPages;
                  if (!isNear)
                    return page === currentPage - 2 ||
                      page === currentPage + 2 ? (
                      <span key={`ellipsis-${page}`} className="text-gray-400">
                        ...
                      </span>
                    ) : null;
                  return (
                    <button
                      key={`page-${page}`}
                      onClick={() => paginate(page)}
                      className={`w-10 h-10 rounded-full text-sm font-medium ${
                        isCurrent
                          ? "bg-[#ffc929] text-white shadow-md"
                          : "text-gray-600 hover:bg-[#ffc929]/10"
                      } transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30`}
                      aria-label={`Go to page ${page}`}
                    >
                      {page}
                    </button>
                  );
                }
              )}
            </div>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full ${
                currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-[#ffc929] hover:bg-[#ffc929]/10"
              } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30`}
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
