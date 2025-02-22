import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import {
  Heart,
  PawPrint,
  MapPin,
  Coins,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

export default function Pet() {
  const navigate = useNavigate();
  const { category: urlCategory } = useParams();
  const { pets, currencySymbol, loading, error } = useContext(AppContext);

  const [filteredPets, setFilteredPets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [races, setRaces] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [ages, setAges] = useState([]);
  const [fees, setFees] = useState([]);
  const [cities, setCities] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [petsPerPage] = useState(9);
  const [isAnimating, setIsAnimating] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(urlCategory || "");
  const [selectedRace, setSelectedRace] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedFee, setSelectedFee] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    let filtered = pets;
    if (selectedCategory)
      filtered = filtered.filter((pet) => pet.category === selectedCategory);
    if (selectedRace)
      filtered = filtered.filter((pet) => pet.race === selectedRace);
    if (selectedBreed)
      filtered = filtered.filter((pet) => pet.breed === selectedBreed);
    if (selectedAge)
      filtered = filtered.filter((pet) => pet.age === selectedAge);
    if (selectedFee)
      filtered = filtered.filter((pet) => pet.fee === selectedFee);
    if (selectedCity)
      filtered = filtered.filter((pet) => pet.city === selectedCity);
    setFilteredPets(filtered);
    setCurrentPage(1);
  }, [
    pets,
    selectedCategory,
    selectedRace,
    selectedBreed,
    selectedAge,
    selectedFee,
    selectedCity,
  ]);

  useEffect(() => {
    setCategories([...new Set(pets.map((pet) => pet.category))]);
    setRaces([...new Set(pets.map((pet) => pet.race))]);
    setBreeds([...new Set(pets.map((pet) => pet.breed))]);
    setAges([...new Set(pets.map((pet) => pet.age))]);
    setFees([...new Set(pets.map((pet) => pet.fee))]);
    setCities([...new Set(pets.map((pet) => pet.city))]);
  }, [pets]);

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

  const FilterSelect = ({ label, value, onChange, options }) => (
    <div className="w-full min-w-0 mb-2 sm:flex-1 sm:mb-0">
      <select
        className="w-full px-2 py-2 rounded-xl border-2 border-[#ffc929]/20 
        focus:ring-2 focus:ring-[#ffc929]/30 focus:border-[#ffc929] transition-all 
        text-gray-700 bg-white hover:border-[#ffc929]/40 text-sm"
        value={value}
        onChange={onChange}
      >
        <option value="">{label}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  // Background paw prints
  const PawBackground = () => {
    return Array(8)
      .fill(null)
      .map((_, index) => (
        <PawIcon
          key={index}
          className={`
          absolute w-8 h-8 opacity-5
          animate-float
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-pink-50">
        <div className="text-center">
          <PawPrint
            size={48}
            className="mx-auto text-[#ffc929] animate-bounce"
          />
          <p className="mt-4 text-gray-600">Loading pets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-pink-50">
        <div className="text-center">
          <PawPrint size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-red-600">An error occurred while loading pets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 py-6 overflow-hidden bg-gradient-to-b from-white to-pink-50 sm:py-12">
      {" "}
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <PawBackground />
      </div>
      {/* Blob Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#ffc929] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob-reverse" />
      <div className="container relative max-w-6xl mx-auto">
        {/* Title section */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 hover:text-[#ffc929] mb-2 transition-colors duration-300">
            Find Your Forever Friend
            <Heart
              className="inline-block ml-2 text-[#ffc929] animate-beat"
              size={24}
            />
          </h1>
          <p className="text-gray-600 hover:text-[#ffc929] text-base sm:text-lg transition-colors duration-300">
            Adorable companions waiting just for you!
          </p>
        </div>

        {/* Results summary moved to top */}
        {filteredPets.length > 0 && (
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border-2 border-[#ffc929]/20 text-gray-600 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#ffc929]/30">
              <PawPrint size={16} className="text-[#ffc929]" />
              {filteredPets.length} furry friends available
            </span>
          </div>
        )}
        {/* Mobile filter toggle */}
        <button
          className="w-full md:hidden bg-[#ffc929] text-white py-2 px-4 rounded-xl mb-4 hover:bg-[#ffc929]/90 transition-colors duration-300"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          {isFilterOpen ? "Hide Filters" : "Show Filters"}
        </button>

        <div
          className={`bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-4 mb-6 sm:mb-12 border-2 border-[#ffc929]/20 transition-all duration-300 ${
            !isFilterOpen && "hidden md:block"
          }`}
        >
          {" "}
          <div className="flex flex-col gap-2 sm:flex-row">
            <FilterSelect
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={categories}
            />
            <FilterSelect
              label="Race"
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
              options={races}
            />
            <FilterSelect
              label="Breed"
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value)}
              options={breeds}
            />
            <FilterSelect
              label="Age"
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              options={ages}
            />
            <FilterSelect
              label="Fee"
              value={selectedFee}
              onChange={(e) => setSelectedFee(e.target.value)}
              options={fees}
            />
            <FilterSelect
              label="City"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              options={cities}
            />
          </div>
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 transition-opacity duration-300 ${
            isAnimating ? "opacity-0" : "opacity-100"
          }`}
        >
          {currentPets.length > 0 ? (
            currentPets.map((pet, index) => (
              <div
                onClick={() => navigate(`/petsdetails/${pet._id}`)}
                key={index}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl 
                transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 group 
                border-2 border-[#ffc929]/20 cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden sm:h-64">
                  <img
                    src={pet.image}
                    alt={pet.name}
                    className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = "/placeholder-animal.png";
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <Heart
                      className="text-white drop-shadow-lg transform group-hover:scale-125 group-hover:text-[#ffc929] transition-all duration-300"
                      size={24}
                    />
                  </div>
                </div>

                <div className="p-4 space-y-3 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-[#ffc929] transition-colors duration-300">
                    {pet.name}
                  </h2>
                  <div className="flex flex-col gap-2">
                    <p className="text-[#ffc929] font-medium flex items-center text-sm sm:text-base">
                      <PawPrint
                        size={16}
                        className="mr-1 transition-transform duration-300 group-hover:rotate-12"
                      />
                      {pet.category} • {pet.breed}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-xs sm:text-sm text-gray-600 bg-[#ffc929]/10 px-3 py-1 
                      rounded-full border border-[#ffc929]/20 group-hover:bg-[#ffc929]/20 transition-colors duration-300"
                      >
                        {pet.age} years
                      </span>
                      <span
                        className="text-xs sm:text-sm text-gray-600 bg-[#ffc929]/10 px-3 py-1 
                      rounded-full border border-[#ffc929]/20 flex items-center gap-1 group-hover:bg-[#ffc929]/20 transition-colors duration-300"
                      >
                        <MapPin size={12} />
                        {pet.city}
                      </span>
                    </div>
                    <span
                      className="text-xs sm:text-sm text-gray-600 bg-[#ffc929]/10 px-3 py-1 
                    rounded-full border border-[#ffc929]/20 flex items-center gap-1 w-fit group-hover:bg-[#ffc929]/20 transition-colors duration-300"
                    >
                      <Coins size={12} />
                      {pet.fee === 0 ? "Free" : `${pet.fee}${currencySymbol}`}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center col-span-full sm:py-12">
              <PawPrint
                size={48}
                className="mx-auto text-[#ffc929] mb-4 animate-bounce"
              />
              <p className="text-xl font-light text-gray-600 sm:text-2xl">
                No pets found 🐾
              </p>
            </div>
          )}
        </div>

        {filteredPets.length > petsPerPage && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
              className={`p-2 rounded-full ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#ffc929] hover:bg-[#ffc929]/10"
              } transition-colors duration-300`}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                const isCurrentPage = currentPage === pageNumber;
                const isNearCurrent =
                  Math.abs(currentPage - pageNumber) <= 1 ||
                  pageNumber === 1 ||
                  pageNumber === totalPages;

                // Show ellipsis for breaks in pagination
                if (!isNearCurrent) {
                  if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span key={index} className="text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={index}
                    onClick={() => paginate(pageNumber)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                      isCurrentPage
                        ? "bg-[#ffc929] text-white font-medium shadow-lg shadow-[#ffc929]/20"
                        : "text-gray-600 hover:bg-[#ffc929]/10 hover:text-[#ffc929]"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                currentPage < totalPages && paginate(currentPage + 1)
              }
              className={`p-2 rounded-full ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#ffc929] hover:bg-[#ffc929]/10"
              } transition-colors duration-300`}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
