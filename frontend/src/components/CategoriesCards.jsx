import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import dog from "../assets/dogCategory.png";
import cat from "../assets/CatCategory.png";
import other from "../assets/OtherCategory.png";
import veterinary from "../assets/PawCategory.png";

// Reusable Category Card Component
const CategoryCard = ({ category, isHovered, onHover }) => {
  return (
    <Link
      to={`/pets/${category.slug}`}
      className={`
        group relative overflow-hidden
        bg-white rounded-2xl p-6 md:p-8
        transform transition-all duration-500
        hover:scale-102 hover:shadow-lg
        border-2 border-neutral-100
        ${!category.isActive ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#ffc929]'}
      `}
      onMouseEnter={() => onHover(category.id)}
      onMouseLeave={() => onHover(null)}
      aria-disabled={!category.isActive}
    >
      {/* Background Animation */}
      <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-neutral-50/50 to-transparent group-hover:opacity-100" />
      
      <div className="relative z-10 space-y-6">
        {/* Icon Container */}
        <div className="w-16 h-16 rounded-full bg-neutral-50 p-3 transition-colors duration-300 group-hover:bg-[#ffc929]/10">
          <img
            src={category.icon}
            alt=""
            role="presentation"
            className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-[#ffc929] transition-colors">
              {category.category}
            </h3>
            {category.totalPets && (
              <span className="text-sm text-neutral-500">
                ({category.totalPets})
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-600 md:text-base">
            {category.description}
          </p>
        </div>

        {/* Action Button */}
        {category.isActive && (
          <div className="flex items-center text-[#ffc929] opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            <span className="font-medium">Browse Category</span>
            <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-2" />
          </div>
        )}
      </div>
    </Link>
  );
};

// Loading Skeleton Component
const CategorySkeleton = () => (
  <div className="p-8 bg-white border-2 rounded-2xl border-neutral-100 animate-pulse">
    <div className="w-16 h-16 mb-6 rounded-full bg-neutral-200" />
    <div className="mb-6 space-y-2">
      <div className="w-1/2 h-6 rounded bg-neutral-200" />
      <div className="w-3/4 h-4 rounded bg-neutral-200" />
    </div>
    <div className="w-1/4 h-4 rounded bg-neutral-200" />
  </div>
);

// Main Component
const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Simulated API call
        const data = [
          {
            id: '1',
            category: "Dogs",
            icon: dog,
            description: "Find your loyal companion",
            slug: "dogs",
            totalPets: 156,
            isActive: true
          },
          {
            id: '2',
            category: "Cats",
            icon: cat,
            description: "Discover your perfect feline friend",
            slug: "cats",
            totalPets: 142,
            isActive: true
          },
          {
            id: '3',
            category: "Other Pets",
            icon: other,
            description: "Explore unique companion animals",
            slug: "other-pets",
            totalPets: 45,
            isActive: true
          },
          {
            id: '4',
            category: "Veterinary Care",
            icon: veterinary,
            description: "Professional pet healthcare services",
            slug: "veterinary",
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
  }, []);

  // Error State
  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-[#ffc929] hover:underline focus:outline-none"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-neutral-50 to-white">
      {/* Content Container */}
      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 space-y-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl text-neutral-900">
            <span className="block">Explore Pet Categories</span>
            <span className="block mt-2 text-[#ffc929]">Find Your Perfect Match</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-neutral-600">
            Browse through our carefully curated categories to discover your new companion
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
          {loading ? (
            // Loading State
            Array(4).fill(null).map((_, i) => (
              <CategorySkeleton key={`skeleton-${i}`} />
            ))
          ) : (
            // Loaded Categories
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

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#ffc929] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
      <div className="absolute bottom-0 right-0 rounded-full w-72 h-72 bg-neutral-200 mix-blend-multiply filter blur-xl opacity-10 animate-blob-reverse" />
    </section>
  );
};

export default CategoriesSection;