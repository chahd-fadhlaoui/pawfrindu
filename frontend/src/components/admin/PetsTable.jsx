import { useState, useEffect } from "react";
import { Check, X, Loader2, PawPrint, Heart, Clock, Archive } from "lucide-react";
import { useApp } from "../../context/AppContext";
import axiosInstance from "../../utils/axiosInstance";
import ConfirmationModal from "../ConfirmationModal";

const PetsTable = ({ refreshTrigger, onPetChange }) => {
  const { fetchPets, loading, error, pets } = useApp();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [filteredPets, setFilteredPets] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: '', petId: null, petName: '' });

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

  // Dynamic list of cities
  const uniqueCities = Array.from(new Set(filteredPets.map(pet => (pet.city || '').toLowerCase()))).sort();

  // Apply filters whenever dependencies change
  useEffect(() => {
    const applyFilters = () => {
      let filtered = pets.filter(pet => !pet.isArchived); // Only non-archived pets

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

      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0);
        const dateB = new Date(b.createdAt || b.updatedAt || 0);
        return sortByDate === 'asc' ? dateA - dateB : dateB - dateA;
      });

      setFilteredPets(filtered);
    };

    fetchPets(true); // Fetch fresh data
    applyFilters();  // Apply filters to the fetched data
  }, [fetchPets, pets, sortByDate, statusFilter, feeFilter, cityFilter, speciesFilter, ageFilter, genderFilter, trainedFilter, refreshTrigger]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPets.length / petsPerPage);
  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = filteredPets.slice(indexOfFirstPet, indexOfLastPet);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) { // Ensure page is within bounds
      setCurrentPage(page);
    }
  };

  const handleAccept = async (petId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const response = await axiosInstance.put(`/api/pet/modifyStatus/${petId}`, { status: "accepted" });
      if (response.data.success) {
        await fetchPets(true);
        onPetChange();
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
        await fetchPets(true);
        onPetChange();
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
        await fetchPets(true);
        onPetChange();
      } else {
        throw new Error(response.data.message || "Failed to archive pet");
      }
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to archive pet");
    } finally {
      setActionLoading(false);
    }
  };

  // Confirmation handlers
  const openConfirmModal = (action, petId, petName) => {
    setConfirmModal({ isOpen: true, action, petId, petName });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, action: '', petId: null, petName: '' });
  };

  const confirmAction = () => {
    const { action, petId } = confirmModal;
    switch (action) {
      case "accept":
        handleAccept(petId);
        break;
      case "delete":
        handleReject(petId);
        break;
      case "archive":
        handleArchive(petId);
        break;
      default:
        break;
    }
    closeConfirmModal();
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
    setCurrentPage(1); // Reset to page 1 only on filter reset
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-12 space-y-4 bg-white shadow-lg rounded-xl">
        <div className="relative">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <PawPrint className="absolute bottom-0 right-0 w-4 h-4 text-amber-400 animate-bounce" />
        </div>
        <p className="font-medium text-amber-600">Loading precious pets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 border-2 border-red-200 bg-red-50 rounded-xl">
        <p className="font-medium text-center text-red-600">Error loading pets: {error}</p>
      </div>
    );
  }

  if (!filteredPets.length) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-12 space-y-4 bg-white shadow-lg rounded-xl">
        <div className="relative">
          <PawPrint className="w-12 h-12 text-amber-300" />
          <Heart className="absolute w-6 h-6 text-amber-400 -top-2 -right-2 animate-pulse" />
        </div>
        <p className="font-medium text-amber-600">No active pets found</p>
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
        <div className="flex items-center p-4 space-x-3 border-l-4 border-red-500 rounded-lg bg-red-50">
          <X className="flex-shrink-0 w-5 h-5 text-red-500" />
          <p className="text-red-700">{actionError}</p>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 border-2 shadow-md bg-gradient-to-r from-gray-50 to-amber-50 rounded-xl border-amber-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 whitespace-nowrap"><Clock className="w-4 h-4 text-amber-500" /> Date</label>
            <select value={sortByDate} onChange={(e) => setSortByDate(e.target.value)} className="block text-sm text-gray-800 bg-white border-gray-300 rounded-md shadow-sm w-28 focus:border-amber-400 focus:ring-amber-300"><option value="desc">Desc</option><option value="asc">Asc</option></select>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 whitespace-nowrap"><Heart className="w-4 h-4 text-amber-500" /> Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="block text-sm text-gray-800 bg-white border-gray-300 rounded-md shadow-sm w-28 focus:border-amber-400 focus:ring-amber-300"><option value="">All</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="adopted">Adopted</option><option value="sold">Sold</option></select>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 whitespace-nowrap"><PawPrint className="w-4 h-4 text-amber-500" /> Fee</label>
            <select value={feeFilter} onChange={(e) => setFeeFilter(e.target.value)} className="block text-sm text-gray-800 bg-white border-gray-300 rounded-md shadow-sm w-28 focus:border-amber-400 focus:ring-amber-300"><option value="">All</option><option value="free">Free</option><option value="paid">Paid</option></select>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 whitespace-nowrap"><PawPrint className="w-4 h-4 text-amber-500" /> City</label>
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="block text-sm text-gray-800 bg-white border-gray-300 rounded-md shadow-sm w-28 focus:border-amber-400 focus:ring-amber-300"><option value="">All</option>{uniqueCities.map(city => (<option key={city} value={city}>{city.charAt(0).toUpperCase() + city.slice(1)}</option>))}</select>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 whitespace-nowrap"><PawPrint className="w-4 h-4 text-amber-500" /> Species</label>
            <select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)} className="block text-sm text-gray-800 bg-white border-gray-300 rounded-md shadow-sm w-28 focus:border-amber-400 focus:ring-amber-300"><option value="">All</option><option value="dog">Dog</option><option value="cat">Cat</option><option value="bird">Bird</option><option value="other">Other</option></select>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 whitespace-nowrap"><Heart className="w-4 h-4 text-amber-500" /> Age</label>
            <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} className="block text-sm text-gray-800 bg-white border-gray-300 rounded-md shadow-sm w-28 focus:border-amber-400 focus:ring-amber-300"><option value="">All</option><option value="puppy">Puppy</option><option value="kitten">Kitten</option><option value="adult">Adult</option><option value="senior">Senior</option></select>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 whitespace-nowrap"><PawPrint className="w-4 h-4 text-amber-500" /> Gender</label>
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="block text-sm text-gray-800 bg-white border-gray-300 rounded-md shadow-sm w-28 focus:border-amber-400 focus:ring-amber-300"><option value="">All</option><option value="male">Male</option><option value="female">Female</option></select>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 whitespace-nowrap"><Check className="w-4 h-4 text-amber-500" /> Trained</label>
            <select value={trainedFilter} onChange={(e) => setTrainedFilter(e.target.value)} className="block text-sm text-gray-800 bg-white border-gray-300 rounded-md shadow-sm w-28 focus:border-amber-400 focus:ring-amber-300"><option value="">All</option><option value="true">Yes</option><option value="false">No</option></select>
          </div>
          <button onClick={resetFilters} className="flex items-center gap-2 px-4 py-2 transition-all duration-200 rounded-md shadow-sm bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 hover:from-amber-200 hover:to-amber-300"><X className="w-4 h-4" /> Reset</button>
        </div>
      </div>

      {/* Pets Table */}
      <div className="bg-white border-2 shadow-lg rounded-xl border-amber-100">
        <div className="p-4 border-b-2 bg-gradient-to-r from-gray-50 to-amber-50 border-amber-100">
          <div className="flex items-center space-x-2"><PawPrint className="w-6 h-6 text-amber-500" /><h2 className="text-lg font-semibold text-amber-700">Pet Adoption Table</h2></div>
        </div>
        <div>
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-amber-50"><tr>{["Photo", "Nom", "Breed", "Âge", "Ville", "Genre", "Catégorie", "Tarif", "Dressé", "Status", "Actions"].map((header) => (<th key={header} className="px-4 py-4 text-sm font-semibold text-left text-amber-700">{header}</th>))}</tr></thead>
            <tbody className="divide-y divide-amber-100">{currentPets.map((pet) => {const statusConfig = getStatusConfig(pet.status, pet.isArchived);const isAccepted = pet.status === "accepted";const canArchive = pet.status === "adopted" || pet.status === "sold";return (<tr key={pet._id} className="transition-all duration-200 hover:bg-amber-50/30"><td className="px-4 py-4"><div className="relative group"><img src={pet.image || "/api/placeholder/48/48"} alt={pet.name} className="object-cover transition-all duration-200 border-2 rounded-full w-14 h-14 border-amber-200 group-hover:border-amber-400" /><div className="absolute inset-0 transition-all duration-200 bg-opacity-0 rounded-full bg-amber-400 group-hover:bg-opacity-10" /><Heart className="absolute w-4 h-4 transition-all duration-200 opacity-0 text-amber-400 -top-1 -right-1 group-hover:opacity-100" /></div></td><td className="px-4 py-4"><p className="font-medium transition-colors text-amber-700 hover:text-amber-900">{pet.name}</p></td><td className="px-4 py-4 text-gray-700">{pet.breed}</td><td className="px-4 py-4 text-gray-700">{pet.age}</td><td className="px-4 py-4 text-gray-700">{pet.city}</td><td className="px-4 py-4 text-gray-700">{pet.gender}</td><td className="px-4 py-4 text-gray-700">{pet.species}</td><td className="px-4 py-4"><span className="font-medium text-amber-600">{pet.fee === 0 ? "Free" : `${pet.fee}dt`}</span></td><td className="px-4 py-4"><span className={`px-3 py-1.5 rounded-full text-sm font-medium ${pet.isTrained ? "bg-amber-100 text-amber-700 ring-1 ring-amber-400" : "bg-gray-100 text-gray-700 ring-1 ring-gray-400"}`}>{pet.isTrained ? "Oui" : "Non"}</span></td><td className="px-4 py-4"><div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${statusConfig.bgClass} border ${statusConfig.borderClass}`}><statusConfig.icon className={`w-4 h-4 ${statusConfig.iconClass}`} /><span className={`text-sm font-medium ${statusConfig.textClass}`}>{statusConfig.text}</span></div></td><td className="px-4 py-4"><div className="flex items-center justify-center gap-2">{!canArchive && (<button onClick={() => openConfirmModal("accept", pet._id, pet.name)} disabled={actionLoading || isAccepted || pet.isArchived} className="p-2 text-green-500 transition-all duration-200 rounded-full hover:text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed group" title="Accept Pet"><Check className="w-5 h-5 transition-transform group-hover:scale-110" /></button>)} {!isAccepted && (canArchive ? (<button onClick={() => openConfirmModal("archive", pet._id, pet.name)} disabled={actionLoading || pet.isArchived} className="p-2 text-yellow-500 transition-all duration-200 rounded-full hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed group" title="Archive Pet"><Archive className="w-5 h-5 transition-transform group-hover:scale-110" /></button>) : (<button onClick={() => openConfirmModal("delete", pet._id, pet.name)} disabled={actionLoading || pet.isArchived} className="p-2 text-red-500 transition-all duration-200 rounded-full hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed group" title="Delete Pet"><X className="w-5 h-5 transition-transform group-hover:scale-110" /></button>))}</div></td></tr>);})}</tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-gray-50 to-amber-50">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === page ? "bg-amber-200 text-amber-800" : "bg-white text-amber-600 hover:bg-amber-100"} transition-all duration-200`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmAction}
        action={confirmModal.action}
        itemName={confirmModal.petName}
      />
    </div>
  );
};

export default PetsTable;