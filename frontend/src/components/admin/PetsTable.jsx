import { useState, useEffect } from "react";
import {
  Check,
  X,
  Loader2,
  PawPrint,
  Heart,
  Clock,
  Ban,
  Archive,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const PetsTable = ({ pets: initialPets, loading, error, fetchPets, refreshTrigger, onPetChange }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [filteredPets, setFilteredPets] = useState(initialPets);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const petsPerPage = 5;

  // Filter states
  const [sortByDate, setSortByDate] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [feeFilter, setFeeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [trainedFilter, setTrainedFilter] = useState('');

  // Liste dynamique des villes
  const uniqueCities = Array.from(new Set(filteredPets.map(pet => (pet.city || '').toLowerCase()))).sort();

  // Synchroniser filteredPets avec initialPets et appliquer les filtres
  useEffect(() => {
    const refreshPets = async () => {
      try {
        const updatedPetsResponse = await axiosInstance.get('/api/pet/allpets');
        let filtered = updatedPetsResponse.data.data.filter(pet => !pet.isArchived);

        // Appliquer les filtres
        filtered = filtered.filter(pet => {
          return (
            (!statusFilter || pet.status === statusFilter) &&
            (!feeFilter || (feeFilter === 'free' ? pet.fee === 0 : pet.fee > 0)) &&
            (!cityFilter || (pet.city || '').toLowerCase() === cityFilter.toLowerCase()) &&
            (!speciesFilter || (pet.species || '').toLowerCase() === speciesFilter.toLowerCase()) &&
            (!ageFilter || (
              ageFilter === 'puppy' ? (pet.species === 'dog' && (typeof pet.age === 'number' ? pet.age < 1 : pet.age === 'puppy')) :
              ageFilter === 'kitten' ? (pet.species === 'cat' && (typeof pet.age === 'number' ? pet.age < 1 : pet.age === 'kitten')) :
              ageFilter === 'adult' ? (typeof pet.age === 'number' ? (pet.age >= 1 && pet.age <= 7) : pet.age === 'adult') :
              ageFilter === 'senior' ? (typeof pet.age === 'number' ? pet.age > 7 : pet.age === 'senior') : true
            )) &&
            (!genderFilter || (pet.gender || '').toLowerCase() === genderFilter.toLowerCase()) &&
            (!trainedFilter || pet.isTrained === (trainedFilter === 'true'))
          );
        });

        // Trier par date
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.updatedAt || 0);
          const dateB = new Date(b.createdAt || b.updatedAt || 0);
          return sortByDate === 'asc' ? dateA - dateB : dateB - dateA;
        });

        setFilteredPets(filtered);
        setCurrentPage(1);
        console.log('Filtered Pets in PetsTable:', filtered);
      } catch (err) {
        console.error('Error fetching updated pets:', err);
      }
    };

    refreshPets();
  }, [initialPets, sortByDate, statusFilter, feeFilter, cityFilter, speciesFilter, ageFilter, genderFilter, trainedFilter, refreshTrigger]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPets.length / petsPerPage);
  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = filteredPets.slice(indexOfFirstPet, indexOfLastPet);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAccept = async (petId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const response = await axiosInstance.put(`/api/pet/modifyStatus/${petId}`, {
        status: "accepted",
      });
      if (response.data.success) {
        await fetchPets();
        onPetChange(); // Déclencher le rafraîchissement dans AdminDashboard
      } else {
        throw new Error(response.data.message || "Failed to accept pet");
      }
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to accept pet");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (petId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const response = await axiosInstance.delete(`/api/pet/deleteAdminPet/${petId}`);
      if (response.data.success) {
        await fetchPets();
        onPetChange(); // Déclencher le rafraîchissement dans AdminDashboard
      } else {
        throw new Error(response.data.message || "Failed to process pet");
      }
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to process pet");
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async (petId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const response = await axiosInstance.delete(`/api/pet/deleteAdminPet/${petId}`);
      if (response.data.success) {
        await fetchPets();
        onPetChange(); // Déclencher le rafraîchissement dans AdminDashboard
      } else {
        throw new Error(response.data.message || "Failed to archive pet");
      }
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to archive pet");
    } finally {
      setActionLoading(false);
    }
  };

  const resetFilters = () => {
    setSortByDate('desc');
    setStatusFilter('');
    setFeeFilter('');
    setCityFilter('');
    setSpeciesFilter('');
    setAgeFilter('');
    setGenderFilter('');
    setTrainedFilter('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="w-full p-12 flex flex-col items-center justify-center space-y-4 bg-white rounded-xl shadow-lg">
        <div className="relative">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <PawPrint className="w-4 h-4 text-amber-400 absolute bottom-0 right-0 animate-bounce" />
        </div>
        <p className="text-amber-600 font-medium">Loading precious pets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 bg-red-50 border-2 border-red-200 rounded-xl">
        <p className="text-red-600 text-center font-medium">Error loading pets: {error}</p>
      </div>
    );
  }

  if (!filteredPets.length) {
    return (
      <div className="w-full p-12 flex flex-col items-center justify-center space-y-4 bg-white rounded-xl shadow-lg">
        <div className="relative">
          <PawPrint className="w-12 h-12 text-amber-300" />
          <Heart className="w-6 h-6 text-amber-400 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <p className="text-amber-600 font-medium">No active pets found</p>
      </div>
    );
  }

  const getStatusConfig = (status, isArchived) => {
    if (isArchived) {
      return {
        icon: Archive,
        text: "Archived",
        bgClass: "bg-gradient-to-r from-gray-100 to-gray-200",
        textClass: "text-gray-700",
        iconClass: "text-gray-500",
        borderClass: "border-gray-300",
      };
    }
    switch (status) {
      case "accepted":
        return {
          icon: Heart,
          text: "Accepted",
          bgClass: "bg-gradient-to-r from-amber-100 to-amber-200",
          textClass: "text-amber-700",
          iconClass: "text-amber-500",
          borderClass: "border-amber-300",
        };
      case "adopted":
      case "sold":
        return {
          icon: Heart,
          text: status.charAt(0).toUpperCase() + status.slice(1),
          bgClass: "bg-gradient-to-r from-green-100 to-teal-100",
          textClass: "text-green-700",
          iconClass: "text-green-500",
          borderClass: "border-green-300",
        };
      default: // pending
        return {
          icon: Clock,
          text: "En Attente",
          bgClass: "bg-gradient-to-r from-gray-100 to-gray-200",
          textClass: "text-gray-700",
          iconClass: "text-gray-500",
          borderClass: "border-gray-300",
        };
    }
  };

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center space-x-3">
          <X className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{actionError}</p>
        </div>
      )}

      {/* Filter Bar with Soft Colors and No Scroll */}
      <div className="bg-gradient-to-r from-gray-50 to-amber-50 p-4 rounded-xl shadow-md border-2 border-amber-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 whitespace-nowrap">
              <Clock className="w-4 h-4 text-amber-500" /> Date
            </label>
            <select
              value={sortByDate}
              onChange={(e) => setSortByDate(e.target.value)}
              className="block w-28 rounded-md border-gray-300 bg-white shadow-sm focus:border-amber-400 focus:ring-amber-300 text-gray-800 text-sm"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 whitespace-nowrap">
              <Heart className="w-4 h-4 text-amber-500" /> Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-28 rounded-md border-gray-300 bg-white shadow-sm focus:border-amber-400 focus:ring-amber-300 text-gray-800 text-sm"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="adopted">Adopted</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 whitespace-nowrap">
              <PawPrint className="w-4 h-4 text-amber-500" /> Fee
            </label>
            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value)}
              className="block w-28 rounded-md border-gray-300 bg-white shadow-sm focus:border-amber-400 focus:ring-amber-300 text-gray-800 text-sm"
            >
              <option value="">All</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 whitespace-nowrap">
              <PawPrint className="w-4 h-4 text-amber-500" /> City
            </label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="block w-28 rounded-md border-gray-300 bg-white shadow-sm focus:border-amber-400 focus:ring-amber-300 text-gray-800 text-sm"
            >
              <option value="">All</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>
                  {city.charAt(0).toUpperCase() + city.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 whitespace-nowrap">
              <PawPrint className="w-4 h-4 text-amber-500" /> Species
            </label>
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="block w-28 rounded-md border-gray-300 bg-white shadow-sm focus:border-amber-400 focus:ring-amber-300 text-gray-800 text-sm"
            >
              <option value="">All</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="bird">Bird</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 whitespace-nowrap">
              <Heart className="w-4 h-4 text-amber-500" /> Age
            </label>
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="block w-28 rounded-md border-gray-300 bg-white shadow-sm focus:border-amber-400 focus:ring-amber-300 text-gray-800 text-sm"
            >
              <option value="">All</option>
              <option value="puppy">Puppy</option>
              <option value="kitten">Kitten</option>
              <option value="adult">Adult</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 whitespace-nowrap">
              <PawPrint className="w-4 h-4 text-amber-500" /> Gender
            </label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="block w-28 rounded-md border-gray-300 bg-white shadow-sm focus:border-amber-400 focus:ring-amber-300 text-gray-800 text-sm"
            >
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 whitespace-nowrap">
              <Check className="w-4 h-4 text-amber-500" /> Trained
            </label>
            <select
              value={trainedFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="block w-28 rounded-md border-gray-300 bg-white shadow-sm focus:border-amber-400 focus:ring-amber-300 text-gray-800 text-sm"
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 rounded-md hover:from-amber-200 hover:to-amber-300 transition-all duration-200 shadow-sm flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-amber-100">
        <div className="p-4 bg-gradient-to-r from-gray-50 to-amber-50 border-b-2 border-amber-100">
          <div className="flex items-center space-x-2">
            <PawPrint className="w-6 h-6 text-amber-500" />
            <h2 className="text-lg font-semibold text-amber-700">Pet Adoption Table</h2>
          </div>
        </div>
        <div>
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-amber-50">
              <tr>
                {[
                  "Photo",
                  "Nom",
                  "Breed",
                  "Âge",
                  "Ville",
                  "Genre",
                  "Catégorie",
                  "Tarif",
                  "Dressé",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-4 text-left text-sm font-semibold text-amber-700"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {currentPets.map((pet) => {
                const statusConfig = getStatusConfig(pet.status, pet.isArchived);
                const isAccepted = pet.status === "accepted";
                const canArchive = pet.status === "adopted" || pet.status === "sold";

                return (
                  <tr key={pet._id} className="hover:bg-amber-50/30 transition-all duration-200">
                    <td className="px-4 py-4">
                      <div className="relative group">
                        <img
                          src={pet.image || "/api/placeholder/48/48"}
                          alt={pet.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-amber-200 group-hover:border-amber-400 transition-all duration-200"
                        />
                        <div className="absolute inset-0 bg-amber-400 bg-opacity-0 group-hover:bg-opacity-10 rounded-full transition-all duration-200" />
                        <Heart className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-amber-700 hover:text-amber-900 transition-colors">
                        {pet.name}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{pet.breed}</td>
                    <td className="px-4 py-4 text-gray-700">{pet.age}</td>
                    <td className="px-4 py-4 text-gray-700">{pet.city}</td>
                    <td className="px-4 py-4 text-gray-700">{pet.gender}</td>
                    <td className="px-4 py-4 text-gray-700">{pet.species}</td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-amber-600">
                        {pet.fee === 0 ? "Free" : `${pet.fee}dt`}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          pet.isTrained
                            ? "bg-amber-100 text-amber-700 ring-1 ring-amber-400"
                            : "bg-gray-100 text-gray-700 ring-1 ring-gray-400"
                        }`}
                      >
                        {pet.isTrained ? "Oui" : "Non"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${statusConfig.bgClass} border ${statusConfig.borderClass}`}
                      >
                        <statusConfig.icon className={`w-4 h-4 ${statusConfig.iconClass}`} />
                        <span className={`text-sm font-medium ${statusConfig.textClass}`}>
                          {statusConfig.text}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {!canArchive && (
                          <button
                            onClick={() => handleAccept(pet._id)}
                            disabled={actionLoading || isAccepted || pet.isArchived}
                            className="p-2 rounded-full text-green-500 hover:text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                            title="Accept Pet"
                          >
                            <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          </button>
                        )}
                        {!isAccepted && (
                          canArchive ? (
                            <button
                              onClick={() => handleArchive(pet._id)}
                              disabled={actionLoading || pet.isArchived}
                              className="p-2 rounded-full text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                              title="Archive Pet"
                            >
                              <Archive className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReject(pet._id)}
                              disabled={actionLoading || pet.isArchived}
                              className="p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                              title="Delete Pet"
                            >
                              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 flex justify-center items-center gap-2 bg-gradient-to-r from-gray-50 to-amber-50">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === page
                      ? "bg-amber-200 text-amber-800"
                      : "bg-white text-amber-600 hover:bg-amber-100"
                  } transition-all duration-200`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetsTable;