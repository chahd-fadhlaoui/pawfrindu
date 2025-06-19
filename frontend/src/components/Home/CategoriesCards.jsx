import { ArrowRight, Bird, Cat, Dog, HandHeartIcon, Stethoscope } from 'lucide-react';
import { useContext, useEffect, useState } from 'react'; 
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const CategoryCard = ({ category, isHovered, onHover }) => {
  return (
    <Link
      to={`/pets/${category.slug}`}
      className={`
        group relative overflow-hidden
        bg-white rounded-3xl p-8
        transform transition-all duration-500
        hover:scale-[1.02]
        border border-gray-100
        ${!category.isActive ? 'opacity-60 cursor-not-allowed' : 'hover:border-pink-200'}
        shadow-sm hover:shadow-lg
      `}
      onMouseEnter={() => onHover(category.id)}
      onMouseLeave={() => onHover(null)}
      aria-disabled={!category.isActive}
    >
      {/* Background Animation */}
      <div className="absolute inset-0 transition-all duration-500 opacity-0 bg-gradient-to-r from-yellow-50/30 via-pink-50/30 to-yellow-50/30 group-hover:opacity-100 group-hover:bg-[length:200%_200%] animate-gradient" />
       
      <div className="relative z-10 space-y-6">
        {/* Icon Container */}
        <div className="relative">
          <div className="w-16 h-16 transition-all duration-500 rounded-full bg-gradient-to-br from-yellow-50 to-pink-50 p-3.5 group-hover:from-yellow-100 group-hover:to-pink-100 group-hover:rotate-6 transform">
            <div className="transition-transform duration-500 group-hover:scale-110">
              {category.icon}
            </div>
          </div>
          {/* Floating sparkle decoration */}
          <div className="absolute transition-all duration-300 -right-2 -top-2">
            <span className="absolute transition-all duration-500 opacity-0 group-hover:opacity-100 animate-ping">✨</span>
            <span className="transition-all duration-500 opacity-0 group-hover:opacity-100">✨</span>
          </div>
        </div>

        {/* Enhanced Content with Animation */}
        <div className="space-y-2 transition-all duration-300 transform group-hover:translate-y-[-2px]">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-800 transition-colors duration-300 group-hover:text-pink-500">
              {category.category}
            </h3>
            {category.totalPets !== undefined && (
              <span className="text-sm text-gray-500 transition-all duration-300 group-hover:text-pink-400">
                ({category.totalPets})
              </span>
            )}
          </div>
          <p className="text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
            {category.description}
          </p>
        </div>
        {/* Enhanced Action Button with Animation */}
        {category.isActive && (
          <div className="flex items-center text-gray-600 transition-all duration-500 transform translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-pink-500">
            <span className="font-medium">Browse Category</span>
            <ArrowRight className="w-4 h-4 ml-2 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110" />
          </div>
        )}
      </div>
    </Link>
  );
};

const CategorySkeleton = () => (
  <div className="p-8 bg-white border border-gray-100 shadow-sm animate-pulse rounded-3xl">
    <div className="w-16 h-16 mb-6 bg-gray-100 rounded-full" />
    <div className="mb-6 space-y-2">
      <div className="w-1/2 h-6 bg-gray-100 rounded" />
      <div className="w-3/4 h-4 bg-gray-100 rounded" />
    </div>
    <div className="w-1/4 h-4 bg-gray-100 rounded" />
  </div>
);

const CategoriesSection = () => {
  const { pets } = useContext(AppContext); // Récupérer les pets depuis AppContext
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Calculer le nombre total pour chaque catégorie à partir des pets
        const dogsCount = pets.filter(pet => pet.species.toLowerCase() === "dog" && pet.status === "accepted").length;
        const catsCount = pets.filter(pet => pet.species.toLowerCase() === "cat" && pet.status === "accepted").length;
        const othersCount = pets.filter(pet => pet.species.toLowerCase() === "other" && pet.status === "accepted").length;
        // Pour Veterinary Care, on utilise une valeur statique ou une logique séparée si disponible
        const vetsCount = 0; 

        const data = [
          {
            id: '1',
            category: "Dogs",
            icon: <Dog className="w-full h-full text-gray-700" />,
            description: "Find your loyal companion",
            slug: "dog",
            totalPets: dogsCount,
            isActive: true
          },
          {
            id: '2',
            category: "Cats",
            icon: <Cat className="w-full h-full text-gray-700" />,
            description: "Discover your perfect feline friend",
            slug: "cat",
            totalPets: catsCount,
            isActive: true
          },
          {
            id: '3',
            category: "Other Pets",
            icon: <Bird className="w-full h-full text-gray-700" />,
            description: "Explore unique companion animals",
            slug: "other",
            totalPets: othersCount,
            isActive: true
          },
          {
            id: '4',
            category: "Veterinary Care",
            icon: <Stethoscope className="w-full h-full text-gray-700" />,
            description: "Professional pet healthcare services",
            slug: "veterinary",
            totalPets: vetsCount, // Placeholder, ajuste selon tes besoins
            isActive: true
          }
        ];
        
        setCategories(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load categories. Please try again later.');
        setLoading(false);
      }
    };

    fetchCategories();
  }, [pets]); // Ajouter pets comme dépendance pour recalculer si les données changent

  return (
    <section className="relative py-20 bg-white">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute text-6xl text-pink-200 transform top-20 left-10 opacity-20 -rotate-12">🐾</div>
        <div className="absolute text-6xl text-yellow-200 transform rotate-45 top-40 right-20 opacity-20">🐾</div>
        <div className="absolute text-6xl text-pink-200 transform bottom-20 left-1/4 opacity-20 rotate-12">🐾</div>
        <div className="absolute top-0 left-0 bg-pink-200 rounded-full w-72 h-72 mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute bottom-0 right-0 bg-yellow-200 rounded-full w-72 h-72 mix-blend-multiply filter blur-xl opacity-10 animate-blob-reverse" />
      </div>

      {/* Content Container */}
      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-16 space-y-6 text-center">
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-pink-100 rounded-full shadow-sm">
            <HandHeartIcon className="w-4 h-4 mr-2 text-[#ffc929]" />
            Find Your Perfect Match
          </span>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl group">
            <span className="block">Explore Pet Categories</span>
            <span className="block mt-2 text-pink-500">Choose Your Companion</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl leading-relaxed text-gray-600">
            Browse through our carefully curated categories to discover your new furry friend
            and learn about our professional pet care services.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
          {loading ? (
            Array(4).fill(null).map((_, i) => <CategorySkeleton key={`skeleton-${i}`} />)
          ) : error ? (
            <div className="text-center text-red-600 col-span-full">Error: {error}</div>
          ) : (
            categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isHovered={hoveredId === category.id}
                onHover={setHoveredId}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;