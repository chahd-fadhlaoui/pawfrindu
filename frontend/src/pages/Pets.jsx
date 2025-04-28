import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Heart, PawPrint, MapPin, Coins, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import SearchBar from "../components/SearchBar";
import { SPECIES_OPTIONS, breeds, ageRanges } from "../assets/Pet"; 
import { FilterBadge, FilterSelect } from "../components/common/Filter";

const PawIcon = ({ className, style }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M12,17.5c2.33,2.33,5.67,2.33,8,0s2.33-5.67,0-8s-5.67-2.33-8,0S9.67,15.17,12,17.5z M7.5,14.5 c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S9.46,12.54,7.5,14.5z M18.5,3.5c-1.96-1.96-4.04-1.96-6,0s-1.96,4.04,0,6 s4.04,1.96,6,0S20.46,5.46,18.5,3.5z M3.5,9.5c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S5.46,7.54,3.5,9.5z" />
  </svg>
);

const feeOptions = ["Free", "With Money"];
const sortOptions = ["Ascending", "Descending"];

const PetCard = ({ pet, navigate, currencySymbol }) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div
      onClick={() => navigate(`/petsdetails/${pet._id}`)}
      className="relative bg-white border-2 border-[#ffc929]/20 rounded-3xl shadow-md overflow-hidden transition-all duration-500 hover:shadow-xl hover:scale-[1.02] cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
      tabIndex={0}
      aria-label={`View details for ${pet.name} in ${pet.city} for ${pet.fee === 0 ? "free" : `${pet.fee}${currencySymbol}`}`}
    >
      <div className="relative w-full h-56 overflow-hidden bg-gradient-to-br from-white to-pink-50 rounded-t-3xl">
        <img
          src={pet.image}
          alt={pet.name}
          className="object-cover w-full h-full transition-transform duration-400 group-hover:scale-110"
          onError={(e) => (e.target.src = "/placeholder-animal.png")}
          loading="lazy"
        />
        <button
          onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
          className="absolute p-2 transition-all duration-300 rounded-full shadow-md top-3 right-3 bg-white/90 hover:bg-[#ffc929]/10 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
          aria-label={isLiked ? `Unlike ${pet.name}` : `Like ${pet.name}`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-[#ffc929] text-[#ffc929]" : "text-gray-400 group-hover:text-[#ffc929]"} transition-colors duration-300`} />
        </button>
      </div>
      <div className="relative z-10 p-6 space-y-4">
        <div className="transition-all duration-300 transform group-hover:translate-y-[-2px]">
          <h2 className="text-xl font-semibold text-gray-800 truncate transition-colors duration-300 group-hover:text-pink-500">{pet.name}</h2>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <PawPrint size={14} className="text-[#ffc929]" />
            {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
            {pet.breed && ` • ${pet.breed}`}
          </p>
          <div className="flex items-center justify-between text-base font-medium text-gray-700">
            <span className="flex items-center gap-2 px-3 py-1 border border-[#ffc929]/20 rounded-full shadow-sm bg-[#ffc929]/5">
              <MapPin size={16} className="text-[#ffc929]" />{pet.city}
            </span>
            <span className={`flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm ${pet.fee === 0 ? "bg-green-50 border-green-100 text-green-600" : "bg-[#ffc929]/10 border-[#ffc929]/20 text-[#ffc929]"}`}>
              <Coins size={16} className={pet.fee === 0 ? "text-green-500" : "text-[#ffc929]"} />
              {pet.fee === 0 ? "Free" : `${pet.fee}${currencySymbol}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function Pet() {
  const navigate = useNavigate();
  const { species: urlSpecies } = useParams();
  const { pets, currencySymbol, loading, error } = useContext(AppContext);

  const [filteredPets, setFilteredPets] = useState([]);
  const [speciesList] = useState(SPECIES_OPTIONS.map(opt => opt.value));
  const [breedsList, setBreedsList] = useState([]);
  const [agesList, setAgesList] = useState([]);
  const [cities, setCities] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [petsPerPage] = useState(9);
  const [isAnimating, setIsAnimating] = useState(false);

  const [selectedSpecies, setSelectedSpecies] = useState(
    urlSpecies && speciesList.includes(urlSpecies.toLowerCase()) ? urlSpecies.toLowerCase() : ""
  );
  const [selectedBreed, setSelectedBreed] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedFee, setSelectedFee] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let filtered = pets.filter((pet) => pet.status === "accepted");

    if (selectedSpecies) {
      filtered = filtered.filter((pet) => pet.species.toLowerCase() === selectedSpecies.toLowerCase());
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((pet) =>
        pet.name.toLowerCase().includes(query) ||
        (pet.breed && pet.breed.toLowerCase().includes(query)) ||
        (pet.city && pet.city.toLowerCase().includes(query))
      );
    }
    if (selectedBreed) filtered = filtered.filter((pet) => pet.breed === selectedBreed);
    if (selectedAge) filtered = filtered.filter((pet) => pet.age === selectedAge);
    if (selectedFee === "Free") filtered = filtered.filter((pet) => pet.fee === 0);
    else if (selectedFee === "With Money") filtered = filtered.filter((pet) => pet.fee > 0);
    if (selectedCity) filtered = filtered.filter((pet) => pet.city === selectedCity);
    if (selectedFee === "With Money" && sortOrder) {
      filtered.sort((a, b) => (sortOrder === "Ascending" ? a.fee - b.fee : b.fee - a.fee));
    }

    setFilteredPets(filtered);
    setCurrentPage(1);
  }, [pets, selectedSpecies, selectedBreed, selectedAge, selectedFee, selectedCity, sortOrder, searchQuery]);

  useEffect(() => {
    const acceptedPets = pets.filter((pet) => pet.status === "accepted");

    let availableBreeds = [];
    if (selectedSpecies === "dog") {
      availableBreeds = breeds.dog;
      setAgesList(ageRanges.dog);
    } else if (selectedSpecies === "cat") {
      availableBreeds = breeds.cat;
      setAgesList(ageRanges.cat);
    } else if (selectedSpecies === "other") {
      availableBreeds = breeds.other;
      setAgesList(ageRanges.other);
    } else {
      availableBreeds = [...new Set([...breeds.dog, ...breeds.cat, ...breeds.other, ...acceptedPets.filter((pet) => pet.breed).map((pet) => pet.breed)])];
      setAgesList([]);
    }
    setBreedsList(availableBreeds);

    setCities([...new Set(acceptedPets.map((pet) => pet.city))].filter(Boolean));

    if (!selectedSpecies) {
      setSelectedBreed("");
      setSelectedAge("");
    }
    if (selectedFee !== "With Money") setSortOrder("");
  }, [pets, selectedSpecies, selectedFee]);

  useEffect(() => {
    const validSpecies = urlSpecies && speciesList.includes(urlSpecies.toLowerCase()) ? urlSpecies.toLowerCase() : "";
    if (validSpecies !== selectedSpecies) {
      setSelectedSpecies(validSpecies);
    }
  }, [urlSpecies, speciesList]);

  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = filteredPets.slice(indexOfFirstPet, indexOfLastPet);
  const totalPages = Math.ceil(filteredPets.length / petsPerPage);

  const paginate = (pageNumber) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(pageNumber);
      setIsAnimating(false);
    }, 300);
  };

  const clearFilter = (filterType) => {
    switch (filterType) {
      case "species": setSelectedSpecies(""); break;
      case "breed": setSelectedBreed(""); break;
      case "age": setSelectedAge(""); break;
      case "fee": setSelectedFee(""); setSortOrder(""); break;
      case "city": setSelectedCity(""); break;
      case "search": setSearchQuery(""); break;
      default: break;
    }
  };

  const clearAllFilters = () => {
    setSelectedSpecies("");
    setSelectedBreed("");
    setSelectedAge("");
    setSelectedFee("");
    setSortOrder("");
    setSelectedCity("");
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
          <PawPrint size={48} className="mx-auto text-[#ffc929]" />
          <p className="mt-4 text-lg font-medium text-gray-600">Fetching Pets...</p>
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

  return (
    <section className="relative min-h-screen px-4 py-12 overflow-hidden bg-gradient-to-br from-white to-pink-50 sm:py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none"><PawBackground /></div>
      <div className="relative mx-auto space-y-12 max-w-7xl">
        <div className="pt-16 space-y-6 text-center animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-[#ffc929]/20 rounded-full shadow-sm">
            <Heart className="w-4 h-4 mr-2 text-[#ffc929]" />Adopt Your Perfect Pet
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            <span className="block">Find Your</span>
            <span className="block text-pink-500">Forever Companion</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600">
            Browse our adorable pets ready to bring joy to your home.
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm bg-opacity-90 border-2 border-[#ffc929]/20 shadow-xl rounded-3xl p-8 mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
            >
              <Filter size={16} />
              {isFilterOpen ? "Hide" : "Filter"}
            </button>
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, breed, or city..."
              className="flex-grow max-w-md shadow-xl sm:flex-grow-0 sm:mx-auto"
            />
            {filteredPets.length > 0 && (
              <span className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#ffc929] bg-[#ffc929]/10 border border-[#ffc929]/20 rounded-full shadow-inner">
                <PawPrint size={16} className="text-[#ffc929]" /> {filteredPets.length} Pets Available
              </span>
            )}
          </div>

          <div
            className={`grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 transition-all duration-300 ease-in-out ${isFilterOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
          >
            <FilterSelect label="Species" value={selectedSpecies} onChange={(e) => setSelectedSpecies(e.target.value)} options={SPECIES_OPTIONS} disabled={false} />
            <FilterSelect label="Breed" value={selectedBreed} onChange={(e) => setSelectedBreed(e.target.value)} options={breedsList} disabled={!selectedSpecies} />
            <FilterSelect label="Age" value={selectedAge} onChange={(e) => setSelectedAge(e.target.value)} options={agesList} disabled={!selectedSpecies} />
            <FilterSelect label="Fee" value={selectedFee} onChange={(e) => setSelectedFee(e.target.value)} options={feeOptions} disabled={false} />
            {selectedFee === "With Money" && (
              <FilterSelect label="Sort Fee" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} options={sortOptions} disabled={false} />
            )}
            <FilterSelect label="City" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} options={cities} disabled={false} />
          </div>

          {(selectedSpecies || selectedBreed || selectedAge || selectedFee || selectedCity || searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="text-sm font-medium text-gray-600">Applied Filters:</span>
              {selectedSpecies && <FilterBadge label="Species" value={selectedSpecies} onClear={() => clearFilter("species")} />}
              {selectedBreed && <FilterBadge label="Breed" value={selectedBreed} onClear={() => clearFilter("breed")} />}
              {selectedAge && <FilterBadge label="Age" value={selectedAge} onClear={() => clearFilter("age")} />}
              {selectedFee && <FilterBadge label="Fee" value={selectedFee} onClear={() => clearFilter("fee")} />}
              {selectedCity && <FilterBadge label="City" value={selectedCity} onClear={() => clearFilter("city")} />}
              {searchQuery && <FilterBadge label="Search" value={searchQuery} onClear={() => clearFilter("search")} />}
              <button
                onClick={clearAllFilters}
                className="px-4 py-1.5 ml-2 text-sm font-medium text-[#ffc929] bg-[#ffc929]/10 hover:bg-[#ffc929]/20 transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"} animate-fadeIn`} style={{ animationDelay: "0.6s" }}>
          {currentPets.length > 0 ? (
            currentPets.map((pet) => <PetCard key={pet._id} pet={pet} navigate={navigate} currencySymbol={currencySymbol} />)
          ) : (
            <div className="py-12 text-center col-span-full">
              <PawPrint size={48} className="mx-auto mb-4 text-[#ffc929]" />
              <h3 className="text-xl font-semibold text-gray-800">No Pets Found</h3>
              <p className="mt-2 text-gray-600">Adjust your filters or search to find more pets.</p>
            </div>
          )}
        </div>

        {filteredPets.length > petsPerPage && (
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