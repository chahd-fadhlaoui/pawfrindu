import { ChevronLeft, ChevronRight, Edit, Plus, Trash2, Users, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import EditForm from "../components/EditForm";
import EmptyState from "../components/EmptyState";
import { useApp } from "../context/AppContext";
import PetDetailsModal from "../components/PetDetailsModal";
import ConfirmationModal from "../components/ConfirmationModal"; 

// Constants 
const PET_CATEGORIES = [
  { value: "", label: "All Species" },
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "adopted", label: "Adopted" },
  { value: "sold", label: "Sold" },
];

const GENDER_OPTIONS = [
  { value: "", label: "All Genders" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const TRAINED_OPTIONS = [
  { value: "", label: "All Training Status" },
  { value: "true", label: "Trained" },
  { value: "false", label: "Not Trained" },
];

const APPROVED_OPTIONS = [
  { value: "", label: "All Approval Status" },
  { value: "true", label: "Approved" },
  { value: "false", label: "Not Approved" },
];

const TABLE_HEADERS = ["Pet", "Name", "Description", "Breed", "Age", "Fee", "Status", "Actions"];

const STATUS_STYLES = {
  accepted: "bg-[#ffc929]/20 text-[#ffc929]",
  pending: "bg-pink-100 text-pink-500",
  adopted: "bg-green-100 text-green-500",
  sold: "bg-blue-100 text-blue-500",
};

const ITEMS_PER_PAGE = 4;

// Component for status badge (unchanged)
const StatusBadge = ({ status }) => (
  <span
    className={`inline-block px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ${
      STATUS_STYLES[status] || STATUS_STYLES.default
    } hover:opacity-80 transform hover:scale-105 sm:px-3`}
  >
    {status}
  </span>
);

// Updated ActionButtons component to use confirmation
const ActionButtons = ({ pet, onEdit, onDelete, onViewCandidates, disabled }) => (
  <div className="flex items-center gap-2">
    {(pet.status === "pending" || pet.status === "accepted") && (
      <button
        onClick={() => onEdit(pet._id, pet.name)} // Pass pet ID and name for confirmation
        className="p-2 text-black rounded-lg shadow-sm hover:shadow-md hover:bg-[#ffc929] hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-6"
        disabled={disabled}
      >
        <Edit size={16} />
      </button>
    )}
    <button
      onClick={() => onDelete(pet._id, pet.name)} // Pass pet ID and name for confirmation
      className="p-2 text-black transition-all duration-300 transform rounded-lg shadow-sm hover:shadow-md hover:bg-pink-500 hover:text-white hover:scale-110 hover:-rotate-6"
      disabled={disabled}
    >
      <Trash2 size={16} />
    </button>
    {pet.fee === 0 && pet.status !== "pending" && (
      <button
        onClick={() => onViewCandidates(pet._id)}
        className="flex items-center gap-2 px-3 py-2 text-white rounded-lg bg-[#ffc929] shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 hover:rotate-2 sm:px-4"
        disabled={disabled}
      >
        <Users size={16} />
        <span className="hidden text-sm sm:inline">Candidates</span>
      </button>
    )}
  </div>
);

const PetOwnerPosts = () => {
  const navigate = useNavigate();
  const { user, getMyPets, updatePet, deletePet, error, setError, clearError, currencySymbol } = useApp();

  const [selectedPet, setSelectedPet] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPets, setUserPets] = useState(null);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: '', petId: null, petName: '' }); // Confirmation state

  // Filter and Pagination States
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterTrained, setFilterTrained] = useState("");
  const [filterApproved, setFilterApproved] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUserPets = useCallback(async () => {
    try {
      const result = await getMyPets();
      if (result.success) {
        const archivedPets = result.data.filter(pet => pet.isArchived === false); // Show non-archived pets
        setUserPets(archivedPets);
        clearError();
      } else {
        setError(result.error || "Failed to fetch pets");
        setUserPets([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch pets");
      setUserPets([]);
    } finally {
      setLoading(false);
    }
  }, [getMyPets, setError, clearError]);

  useEffect(() => {
    let mounted = true;
    if (user?._id && mounted) {
      fetchUserPets();
      const interval = setInterval(() => {
        fetchUserPets();
      }, 30000);
      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }
  }, [user?._id, fetchUserPets]);

  const handleEdit = useCallback((petId, petName) => {
    const pet = userPets.find(p => p._id === petId);
    if (pet) {
      setEditMode(true);
      setSelectedPet(pet);
      setEditFormData({
        name: pet.name,
        breed: pet.breed,
        age: pet.age,
        city: pet.city,
        gender: pet.gender,
        species: pet.species,
        fee: pet.fee,
        isTrained: pet.isTrained === true || pet.isTrained === "true",
        description: pet.description,
        image: pet.image,
      });
    }
  }, [userPets]);

  const handleDelete = useCallback(async (petId) => {
    setLoading(true);
    try {
      const result = await deletePet(petId);
      console.log("Delete result:", result);
      if (result.success) fetchUserPets();
    } catch (err) {
      setError(err.message || "Failed to delete pet");
    } finally {
      setLoading(false);
    }
  }, [deletePet, fetchUserPets, setError]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedData = { ...editFormData };
      const result = await updatePet(selectedPet._id, updatedData);
      if (result.success) {
        fetchUserPets();
        if (result.message.includes("pending admin approval")) setApprovalMessage(result.message);
        handleCloseModal();
      }
    } catch (err) {
      setError(err.message || "Failed to update pet");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = useCallback(() => {
    setSelectedPet(null);
    setEditMode(false);
    setEditFormData(null);
    clearError();
  }, [clearError]);

  const handleInputChange = useCallback((field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Confirmation handlers
  const openConfirmModal = (action, petId, petName) => {
    setConfirmModal({ isOpen: true, action, petId, petName });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, action: '', petId: null, petName: '' });
  };

  const confirmAction = () => {
    const { action, petId, petName } = confirmModal;
    switch (action) {
      case "delete":
        handleDelete(petId);
        break;
      case "edit":
        handleEdit(petId, petName);
        break;
      default:
        break;
    }
    closeConfirmModal();
  };

  const filteredPets = userPets ? userPets.filter((pet) => {
    const statusMatch = !filterStatus || pet.status === filterStatus;
    const speciesMatch = !filterSpecies || pet.species === filterSpecies;
    const genderMatch = !filterGender || pet.gender === filterGender;
    const trainedMatch = !filterTrained || String(pet.isTrained) === filterTrained;
    const approvedMatch = !filterApproved || String(pet.isApproved) === filterApproved;
    const searchMatch = !searchQuery || pet.name.toLowerCase().includes(searchQuery.toLowerCase()) || pet.description.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && speciesMatch && genderMatch && trainedMatch && approvedMatch && searchMatch;
  }) : [];

  const totalPages = Math.ceil(filteredPets.length / ITEMS_PER_PAGE);
  const paginatedPets = filteredPets.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#ffc929]/5 to-pink-50">
      <div className="container p-4 mx-auto max-w-7xl sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="space-y-4 transition-all duration-500 transform hover:translate-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 transition-colors duration-300 sm:text-3xl lg:text-4xl hover:text-[#ffc929]">
              Pet Adoption Posts
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-black transition-colors duration-300 hover:text-pink-500 sm:text-base lg:text-lg">
                Manage your adoption posts and track potential candidates all in one place.
              </p>
              {userPets && userPets.length > 0 && (
                <button
                  onClick={() => navigate("/addPet")}
                  className="flex items-center gap-1 px-4 py-1.5 text-sm text-white transition-all duration-300 transform rounded-lg bg-[#ffc929] hover:bg-[#e6b625] hover:scale-105"
                  disabled={loading}
                >
                  <Plus size={16} />
                  <span>Add New Post</span>
                </button>
              )}
            </div>
          </div>

          {userPets && userPets.length > 0 && (
            <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Filter by Status</label>
                <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ffc929] focus:border-[#ffc929]">{STATUS_OPTIONS.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Filter by Species</label>
                <select value={filterSpecies} onChange={(e) => { setFilterSpecies(e.target.value); setCurrentPage(1); }} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ffc929] focus:border-[#ffc929]">{PET_CATEGORIES.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Filter by Gender</label>
                <select value={filterGender} onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ffc929] focus:border-[#ffc929]">{GENDER_OPTIONS.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Filter by Training</label>
                <select value={filterTrained} onChange={(e) => { setFilterTrained(e.target.value); setCurrentPage(1); }} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ffc929] focus:border-[#ffc929]">{TRAINED_OPTIONS.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Filter by Approval</label>
                <select value={filterApproved} onChange={(e) => { setFilterApproved(e.target.value); setCurrentPage(1); }} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ffc929] focus:border-[#ffc929]">{APPROVED_OPTIONS.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Search by Name/Description</label>
                <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search..." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ffc929] focus:border-[#ffc929]" />
              </div>
            </div>
          )}
        </div>

        {error && <Alert message={error} onClose={clearError} />}
        {approvalMessage && (<Alert message={approvalMessage} type="info" onClose={() => setApprovalMessage("")} />)}

        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-4 border-[#ffc929] rounded-full border-t-transparent animate-spin"></div></div>
        ) : userPets === null ? null : userPets.length === 0 ? (
          <EmptyState message="You haven't created any pet adoption posts yet. Start by adding your first pet!" buttonText="Add Your First Pet For Adoption" buttonAction={() => navigate("/addPet")} disabled={loading} />
        ) : (
          <>
            <div className="hidden md:block overflow-hidden bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(255,201,41,0.2)] transition-all duration-500"><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-xs text-neutral-700 uppercase bg-gradient-to-r from-[#ffc929]/10 to-white"><tr>{TABLE_HEADERS.map((header) => (<th key={header} className="px-4 py-4 font-medium">{header}</th>))}</tr></thead><tbody>{paginatedPets.map((pet) => (<tr key={pet._id} className="transition-all duration-300 border-b hover:bg-[#ffc929]/5"><td className="px-4 py-4"><div className="relative w-16 h-16 overflow-hidden rounded-lg"><img src={pet.image} alt={pet.name} className="absolute inset-0 object-contain w-full h-full" /></div></td><td className="px-4 py-4">{pet.name}</td><td className="max-w-xs px-4 py-4 truncate">{pet.description}</td><td className="px-4 py-4">{pet.breed}</td><td className="px-4 py-4">{pet.age}</td><td className="px-4 py-4">{pet.fee === 0 ? "Free" : `${pet.fee} ${currencySymbol}`}</td><td className="px-4 py-4"><StatusBadge status={pet.status} /></td><td className="px-4 py-4" onClick={(e) => e.stopPropagation()}><ActionButtons pet={pet} onEdit={(petId, petName) => openConfirmModal("edit", petId, petName)} onDelete={(petId, petName) => openConfirmModal("delete", petId, petName)} onViewCandidates={(id) => navigate(`/candidates/${id}`)} disabled={loading} /></td></tr>))}</tbody></table></div></div>
            <div className="grid gap-4 md:hidden">{paginatedPets.map((pet) => (<div key={pet._id} className="p-4 transition-all duration-300 bg-white shadow-md rounded-xl hover:shadow-lg"><div className="flex flex-col sm:flex-row sm:space-x-4"><div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg sm:w-24 sm:h-24 sm:mb-0"><img src={pet.image} alt={pet.name} className="object-cover w-full h-full" /></div><div className="flex-1 space-y-3"><div className="flex items-start justify-between"><h3 className="text-lg font-medium">{pet.name}</h3><StatusBadge status={pet.status} /></div><p className="text-sm text-gray-600 line-clamp-2 sm:line-clamp-1">{pet.description}</p><div className="grid grid-cols-2 gap-2"><div className="text-sm truncate"><span className="font-medium">breed:</span> {pet.breed}</div><div className="text-sm truncate"><span className="font-medium">Age:</span> {pet.age}</div><div className="text-sm truncate"><span className="font-medium">Fee:</span> {pet.fee === 0 ? "Free" : `${pet.fee} ${currencySymbol}`}</div><div className="text-sm truncate"><span className="font-medium">Species:</span> {pet.species}</div></div></div></div><div className="flex justify-end pt-3 mt-4 border-t" onClick={(e) => e.stopPropagation()}><ActionButtons pet={pet} onEdit={(petId, petName) => openConfirmModal("edit", petId, petName)} onDelete={(petId, petName) => openConfirmModal("delete", petId, petName)} onViewCandidates={(id) => navigate(`/candidates/${id}`)} disabled={loading} /></div></div>))}</div>
            {totalPages > 1 && (<div className="flex items-center justify-between mt-6"><button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || loading} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft size={16} /> Previous</button><span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span><button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || loading} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Next <ChevronRight size={16} /></button></div>)}
          </>
        )}
        {selectedPet && !editMode && (<PetDetailsModal pet={selectedPet} onClose={handleCloseModal} />)}
        {selectedPet && editMode && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-sm"><div className="relative w-full max-w-lg my-8 bg-white rounded-xl"><button onClick={handleCloseModal} className="absolute z-10 p-2 rounded-full right-2 top-2 hover:bg-gray-100"><X size={20} /></button><div className="max-h-[80vh] overflow-y-auto"><div className="p-6 border-b"><h2 className="pr-8 text-xl font-bold">Edit Pet</h2></div><div className="p-6"><EditForm formData={editFormData} onChange={handleInputChange} onSubmit={handleUpdate} onCancel={handleCloseModal} loading={loading} /></div></div></div></div>)}
        <ConfirmationModal isOpen={confirmModal.isOpen} onClose={closeConfirmModal} onConfirm={confirmAction} action={confirmModal.action} itemName={confirmModal.petName} />
      </div>
    </div>
  );
};

export default PetOwnerPosts;