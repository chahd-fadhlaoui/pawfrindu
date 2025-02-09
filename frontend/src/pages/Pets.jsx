import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Heart, PawPrint, MapPin, Coins } from 'lucide-react';

export default function Pet() {
  const navigate=useNavigate();
  const { category: urlCategory } = useParams();
  const { pets } = useContext(AppContext);

  const [filteredPets, setFilteredPets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [races, setRaces] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [ages, setAges] = useState([]);
  const [fees, setFees] = useState([]);
  const [cities, setCities] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // États des filtres
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || '');
  const [selectedRace, setSelectedRace] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedFee, setSelectedFee] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Logique de filtrage
  useEffect(() => {
    let filtered = pets;

    if (selectedCategory) filtered = filtered.filter(pet => pet.category === selectedCategory);
    if (selectedRace) filtered = filtered.filter(pet => pet.race === selectedRace);
    if (selectedBreed) filtered = filtered.filter(pet => pet.breed === selectedBreed);
    if (selectedAge) filtered = filtered.filter(pet => pet.age === selectedAge);
    if (selectedFee) filtered = filtered.filter(pet => pet.fee === selectedFee);
    if (selectedCity) filtered = filtered.filter(pet => pet.city === selectedCity);

    setFilteredPets(filtered);
  }, [pets, selectedCategory, selectedRace, selectedBreed, selectedAge, selectedFee, selectedCity]);

  // Extraction des options de filtres
  useEffect(() => {
    setCategories([...new Set(pets.map(pet => pet.category))]);
    setRaces([...new Set(pets.map(pet => pet.race))]);
    setBreeds([...new Set(pets.map(pet => pet.breed))]);
    setAges([...new Set(pets.map(pet => pet.age))]);
    setFees([...new Set(pets.map(pet => pet.fee))]);
    setCities([...new Set(pets.map(pet => pet.city))]);
  }, [pets]);

  const FilterSelect = ({ label, value, onChange, options }) => (
    <div className="w-full sm:flex-1 min-w-0 mb-2 sm:mb-0">
      <select
        className="w-full px-2 py-2 rounded-xl border-2 border-purple-100 
        focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all 
        text-purple-700 bg-white hover:border-pink-200 text-sm"
        value={value}
        onChange={onChange}
      >
        <option value="">{label}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-6 sm:py-12 px-4 relative">
      {/* Décoration de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-16 sm:w-24 h-16 sm:h-24 text-pink-200 opacity-20">
          <PawPrint size={96} />
        </div>
        <div className="absolute top-1/4 -right-4 w-16 sm:w-24 h-16 sm:h-24 text-purple-200 opacity-20">
          <PawPrint size={96} />
        </div>
      </div>

      <div className="container mx-auto max-w-6xl relative">
        {/* Titre kawaii */}
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-purple-800 mb-2">
            Trouvez Votre Ami Pour La Vie 
            <Heart className="inline-block ml-2 text-pink-500" size={24} />
          </h1>
          <p className="text-purple-600 text-base sm:text-lg">Des compagnons adorables qui n'attendent que vous !</p>
        </div>

        {/* Bouton pour afficher/masquer les filtres sur mobile */}
        <button
          className="w-full md:hidden bg-purple-600 text-white py-2 px-4 rounded-xl mb-4"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          {isFilterOpen ? 'Masquer les filtres' : 'Afficher les filtres'}
        </button>

        {/* Section de filtres */}
        <div className={`bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-4 mb-6 sm:mb-12 border-2 border-pink-100 ${!isFilterOpen && 'hidden md:block'}`}>
          <div className="flex flex-col sm:flex-row gap-2">
            <FilterSelect
              label="Catégorie"
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
              label="Âge"
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              options={ages}
            />
            <FilterSelect
              label="Tarif"
              value={selectedFee}
              onChange={(e) => setSelectedFee(e.target.value)}
              options={fees}
            />
            <FilterSelect
              label="Ville"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              options={cities}
            />
          </div>
        </div>

        {/* Grille des animaux */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {filteredPets.length > 0 ? (
            filteredPets.map((pet, index) => (
              <div
                onClick={()=>navigate(`/petsdetails/${pet._id}`)}
                key={index}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl 
                transition-all duration-300 transform hover:-translate-y-2 group 
                border-2 border-pink-100"
              >
                <div className="relative overflow-hidden h-48 sm:h-64">
                  <img
                    src={pet.image}
                    alt={pet.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/placeholder-animal.png';
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <Heart className="text-white drop-shadow-lg" size={24} />
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-purple-800">
                    {pet.name}
                  </h2>
                  <div className="flex flex-col gap-2">
                    <p className="text-purple-600 font-medium flex items-center text-sm sm:text-base">
                      <PawPrint size={16} className="mr-1" />
                      {pet.category} • {pet.breed}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm text-pink-600 bg-pink-50 px-3 py-1 
                      rounded-full border border-pink-100">
                        {pet.age}
                      </span>
                      <span className="text-xs sm:text-sm text-purple-600 bg-purple-50 px-3 py-1 
                      rounded-full border border-purple-100 flex items-center gap-1">
                        <MapPin size={12} />
                        {pet.city}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-green-600 bg-green-50 px-3 py-1 
                    rounded-full border border-green-100 flex items-center gap-1 w-fit">
                      <Coins size={12} />
                      {pet.fee}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 sm:py-12">
              <PawPrint size={48} className="mx-auto text-purple-300 mb-4" />
              <p className="text-purple-600 text-xl sm:text-2xl font-light">
                Aucun animal trouvé 🐾
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}