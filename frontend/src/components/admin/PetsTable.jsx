// components/admin/PetsTable.jsx
import { useState, useEffect } from "react";
import { Check, X, Loader2, PawPrint, Heart, Clock, Archive, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "../../context/AppContext"; 
import axiosInstance from "../../utils/axiosInstance";
import ConfirmationModal from "../ConfirmationModal";
import SearchBar from "../SearchBar"; // Import the new SearchBar component

const PetsTable = ({ refreshTrigger, onPetChange }) => {
  const { fetchPets, loading, error, pets } = useApp();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [filteredPets, setFilteredPets] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: '', petId: null, petName: '' });
  const [searchQuery, setSearchQuery] = useState(''); // Search state

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
  const uniqueCities = Array.from(new Set(pets.map(pet => (pet.city || '').toLowerCase()))).sort();

  // Apply filters and search whenever dependencies change
  useEffect(() => {
    const applyFilters = () => {
      let filtered = pets.filter(pet => !pet.isArchived); // Only non-archived pets

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(pet => 
          pet.name.toLowerCase().includes(query) || 
          (pet.breed && pet.breed.toLowerCase().includes(query)) || 
          (pet.city && pet.city.toLowerCase().includes(query)) || 
          (pet.species && pet.species.toLowerCase().includes(query))
        );
      }

      // Apply other filters
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
  }, [fetchPets, pets, sortByDate, statusFilter, feeFilter, cityFilter, speciesFilter, ageFilter, genderFilter, trainedFilter, refreshTrigger, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPets.length / petsPerPage);
  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = filteredPets.slice(indexOfFirstPet, indexOfLastPet);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
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
    setSearchQuery(''); // Reset search as well
    setCurrentPage(1);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center w-full p-12 space-y-4 bg-white shadow-lg rounded-2xl">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <PawPrint className="absolute bottom-0 right-0 w-4 h-4 text-amber-300 animate-bounce" />
          </div>
          <p className="text-lg font-medium text-amber-600">Loading Pets...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full p-8 border border-red-200 shadow-lg bg-red-50 rounded-2xl">
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <p className="text-lg font-medium">Error: {error}</p>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, breed, city, or species..."
        />

        {/* Filter Bar */}
        <div className="grid grid-cols-1 gap-4 p-4 bg-white border shadow-inner sm:grid-cols-2 lg:grid-cols-4 rounded-xl border-amber-100">
          <div className="flex flex-col gap-1"><label className="text-sm font-medium text-gray-700">Sort by Date</label><select value={sortByDate} onChange={(e) => setSortByDate(e.target.value)} className="w-full px-3 py-2 text-sm text-gray-700 transition-all bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-400"><option value="desc">Descending</option><option value="asc">Ascending</option></select></div>
          <div className="flex flex-col gap-1"><label className="text-sm font-medium text-gray-700">Status</label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 text-sm text-gray-700 transition-all bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-400"><option value="">All</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="adopted">Adopted</option><option value="sold">Sold</option></select></div>
          <div className="flex flex-col gap-1"><label className="text-sm font-medium text-gray-700">Fee</label><select value={feeFilter} onChange={(e) => setFeeFilter(e.target.value)} className="w-full px-3 py-2 text-sm text-gray-700 transition-all bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-400"><option value="">All</option><option value="free">Free</option><option value="paid">Paid</option></select></div>
          <div className="flex flex-col gap-1"><label className="text-sm font-medium text-gray-700">City</label><select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="w-full px-3 py-2 text-sm text-gray-700 transition-all bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-400"><option value="">All</option>{uniqueCities.map(city => (<option key={city} value={city}>{city.charAt(0).toUpperCase() + city.slice(1)}</option>))}</select></div>
          <div className="flex flex-col gap-1"><label className="text-sm font-medium text-gray-700">Species</label><select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)} className="w-full px-3 py-2 text-sm text-gray-700 transition-all bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-400"><option value="">All</option><option value="dog">Dog</option><option value="cat">Cat</option><option value="bird">Bird</option><option value="other">Other</option></select></div>
          <div className="flex flex-col gap-1"><label className="text-sm font-medium text-gray-700">Age</label><select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} className="w-full px-3 py-2 text-sm text-gray-700 transition-all bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-400"><option value="">All</option><option value="puppy">Puppy</option><option value="kitten">Kitten</option><option value="adult">Adult</option><option value="senior">Senior</option></select></div>
          <div className="flex flex-col gap-1"><label className="text-sm font-medium text-gray-700">Gender</label><select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="w-full px-3 py-2 text-sm text-gray-700 transition-all bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-400"><option value="">All</option><option value="male">Male</option><option value="female">Female</option></select></div>
          <div className="flex flex-col gap-1"><label className="text-sm font-medium text-gray-700">Trained</label><select value={trainedFilter} onChange={(e) => setTrainedFilter(e.target.value)} className="w-full px-3 py-2 text-sm text-gray-700 transition-all bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-400"><option value="">All</option><option value="true">Yes</option><option value="false">No</option></select></div>
          <div className="flex items-end justify-end sm:col-span-2 lg:col-span-4"><button onClick={resetFilters} className="w-full px-4 py-2 text-sm font-medium transition-all rounded-lg shadow-sm sm:w-auto text-amber-600 bg-amber-100 hover:bg-amber-200 hover:shadow-md">Reset Filters</button></div>
        </div>

        {/* Table Content */}
        {filteredPets.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full p-12 mt-4 space-y-4 bg-white border shadow-lg rounded-2xl border-amber-100">
            <div className="relative"><PawPrint className="w-12 h-12 text-amber-300" /><Heart className="absolute top-0 right-0 w-6 h-6 text-amber-400 animate-pulse" /></div>
            <p className="text-lg font-medium text-amber-600">No Active Pets Found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or search to see more pets.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden bg-white border shadow-lg rounded-xl border-amber-100">
            <div className="sticky top-0 z-10 flex items-center p-4 space-x-2 border-b bg-gradient-to-r from-amber-50 to-white border-amber-100"><PawPrint className="w-6 h-6 text-amber-500" /><h2 className="text-xl font-semibold text-amber-700">Pet Adoption Table</h2><span className="ml-2 text-sm text-gray-500">({filteredPets.length} pets)</span></div>
            <div className="overflow-x-auto max-h-[60vh] relative"><table className="w-full text-sm text-left border-collapse"><thead className="sticky top-0 z-10 text-xs font-semibold tracking-wide uppercase border-b shadow-sm bg-amber-50 border-amber-100 text-amber-700"><tr>{["Photo", "Name", "Breed", "Age", "City", "Gender", "Species", "Fee", "Trained", "Status", "Actions"].map((header) => (<th key={header} className="px-4 py-3 whitespace-nowrap">{header}</th>))}</tr></thead><tbody className="text-gray-700 divide-y divide-amber-100">{currentPets.map((pet) => {const statusConfig = getStatusConfig(pet.status, pet.isArchived);const isAccepted = pet.status === "accepted";const canArchive = pet.status === "adopted" || pet.status === "sold";return (<tr key={pet._id} className="transition-all duration-200 hover:bg-amber-50 group"><td className="w-16 px-4 py-3"><div className="relative w-12 h-12 overflow-hidden transition-transform duration-200 border rounded-full group-hover:scale-105 border-amber-200"><img src={pet.image || "/api/placeholder/48/48"} alt={pet.name} className="object-cover w-full h-full" /></div></td><td className="px-4 py-3 font-medium transition-colors text-amber-700 group-hover:text-amber-900">{pet.name}</td><td className="px-4 py-3">{pet.breed || '-'}</td><td className="px-4 py-3">{pet.age}</td><td className="px-4 py-3">{pet.city}</td><td className="px-4 py-3">{pet.gender}</td><td className="px-4 py-3">{pet.species}</td><td className="px-4 py-3 font-medium text-amber-600">{pet.fee === 0 ? "Free" : `${pet.fee}dt`}</td><td className="px-4 py-3"><span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${pet.isTrained ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{pet.isTrained ? "Yes" : "No"}</span></td><td className="px-4 py-3"><div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${statusConfig.bgClass} border ${statusConfig.borderClass}`}><statusConfig.icon className={`w-4 h-4 ${statusConfig.iconClass}`} /><span className={`text-xs font-medium ${statusConfig.textClass}`}>{statusConfig.text}</span></div></td><td className="px-4 py-3"><div className="flex items-center justify-center gap-2">{!canArchive && (<button onClick={() => openConfirmModal("accept", pet._id, pet.name)} disabled={actionLoading || isAccepted || pet.isArchived} className={`p-2 rounded-full transition-all duration-200 ${actionLoading || isAccepted || pet.isArchived ? "text-gray-400 cursor-not-allowed" : "text-green-500 hover:bg-green-50 hover:text-green-700 hover:shadow-md"}`} title="Accept Pet"><Check className="w-5 h-5" /></button>)} {!isAccepted && (canArchive ? (<button onClick={() => openConfirmModal("archive", pet._id, pet.name)} disabled={actionLoading || pet.isArchived} className={`p-2 rounded-full transition-all duration-200 ${actionLoading || pet.isArchived ? "text-gray-400 cursor-not-allowed" : "text-yellow-500 hover:bg-yellow-50 hover:text-yellow-700 hover:shadow-md"}`} title="Archive Pet"><Archive className="w-5 h-5" /></button>) : (<button onClick={() => openConfirmModal("delete", pet._id, pet.name)} disabled={actionLoading || pet.isArchived} className={`p-2 rounded-full transition-all duration-200 ${actionLoading || pet.isArchived ? "text-gray-400 cursor-not-allowed" : "text-red-500 hover:bg-red-50 hover:text-red-700 hover:shadow-md"}`} title="Delete Pet"><X className="w-5 h-5" /></button>))}</div></td></tr>);})}</tbody></table></div>
            {totalPages > 1 && (<div className="sticky bottom-0 z-10 flex items-center justify-between p-4 border-t shadow-inner bg-gradient-to-r from-amber-50 to-white border-amber-100"><button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-amber-600 hover:bg-amber-100 hover:text-amber-700"}`}><ChevronLeft className="w-4 h-4" /> Previous</button><div className="flex items-center gap-2">{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (<button key={page} onClick={() => handlePageChange(page)} className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${currentPage === page ? "bg-amber-500 text-white shadow-md" : "text-amber-600 hover:bg-amber-100"}`}>{page}</button>))}</div><button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-amber-600 hover:bg-amber-100 hover:text-amber-700"}`}>Next <ChevronRight className="w-4 h-4" /></button></div>)}
          </div>
        )}
      </>
    );
  };

  const getStatusConfig = (status, isArchived) => {
    if (isArchived) {
      return {
        icon: Archive,
        text: "Archived",
        bgClass: "bg-gray-100",
        textClass: "text-gray-600",
        iconClass: "text-gray-500",
        borderClass: "border-gray-200",
      };
    }
    switch (status) {
      case "accepted":
        return {
          icon: Heart,
          text: "Accepted",
          bgClass: "bg-amber-100",
          textClass: "text-amber-700",
          iconClass: "text-amber-500",
          borderClass: "border-amber-200",
        };
      case "adopted":
      case "sold":
        return {
          icon: Heart,
          text: status.charAt(0).toUpperCase() + status.slice(1),
          bgClass: "bg-green-100",
          textClass: "text-green-700",
          iconClass: "text-green-500",
          borderClass: "border-green-200",
        };
      default: // pending
        return {
          icon: Clock,
          text: "Pending",
          bgClass: "bg-gray-100",
          textClass: "text-gray-600",
          iconClass: "text-gray-500",
          borderClass: "border-gray-200",
        };
    }
  };

  return (
    <div className="p-6 space-y-6 border shadow-lg bg-gradient-to-br from-amber-50 to-white rounded-2xl border-amber-100">
      {actionError && (
        <div className="flex items-center p-4 space-x-3 border-l-4 border-red-500 rounded-lg shadow-inner bg-red-50">
          <X className="flex-shrink-0 w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">{actionError}</p>
        </div>
      )}
      {renderContent()}
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