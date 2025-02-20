import { Edit, Plus, Trash2, Users, X } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import LoadingWrapper from "../components/LoadingWrapper";
import { useApp } from "../context/AppContext";
import { Alert } from "../components/Alert";

// Constants
const PET_CATEGORIES = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "bird", label: "Bird" },
  { value: "fish", label: "Fish" },
  { value: "reptile", label: "Reptile" },
  { value: "other", label: "Other" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const TABLE_HEADERS = [
  "Pet",
  "Name",
  "Description",
  "Race",
  "Age",
  "Fee",
  "Status",
  "Actions",
];

const STATUS_STYLES = {
  Completed: "bg-[#ffc929]/20 text-[#ffc929]",
  Pending: "bg-pink-100 text-pink-500",
  default: "bg-red-100 text-red-500",
};

// Component for status badge
const StatusBadge = ({ status }) => (
  <span
    className={`inline-block px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ${
      STATUS_STYLES[status] || STATUS_STYLES.default
    } hover:opacity-80 transform hover:scale-105 sm:px-3`}
  >
    {status}
  </span>
);

// Component for action buttons
const ActionButtons = ({
  pet,
  onEdit,
  onDelete,
  onViewCandidates,
  disabled,
}) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => onEdit(pet)}
      className="p-2 text-black rounded-lg shadow-sm hover:shadow-md hover:bg-[#ffc929] hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-6"
      disabled={disabled}
    >
      <Edit size={16} />
    </button>
    <button
      onClick={() => onDelete(pet._id)}
      className="p-2 text-black transition-all duration-300 transform rounded-lg shadow-sm hover:shadow-md hover:bg-pink-500 hover:text-white hover:scale-110 hover:-rotate-6"
      disabled={disabled}
    >
      <Trash2 size={16} />
    </button>
    {pet.fee === 0 && (
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

// Form fields component
const EditForm = ({ formData, onChange, onSubmit, onCancel, loading }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <input
        type="text"
        value={formData.name}
        onChange={(e) => onChange("name", e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ffc929]"
        placeholder="Pet Name"
        required
      />
      <input
        type="text"
        value={formData.race}
        onChange={(e) => onChange("race", e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ffc929]"
        placeholder="Race"
        required
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <input
        type="text"
        value={formData.breed}
        onChange={(e) => onChange("breed", e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ffc929]"
        placeholder="Breed"
        required
      />
      <input
        type="number"
        value={formData.age}
        onChange={(e) => onChange("age", e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ffc929]"
        placeholder="Age"
        required
        min="0"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <input
        type="text"
        value={formData.city}
        onChange={(e) => onChange("city", e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ffc929]"
        placeholder="City"
        required
      />
      <select
        value={formData.gender}
        onChange={(e) => onChange("gender", e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ffc929]"
        required
      >
        <option value="">Select Gender</option>
        {GENDER_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <select
        value={formData.category}
        onChange={(e) => onChange("category", e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ffc929]"
        required
      >
        <option value="">Select Category</option>
        {PET_CATEGORIES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={formData.fee}
        onChange={(e) => onChange("fee", e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ffc929]"
        placeholder="Fee"
        min="0"
        required
      />
    </div>

    <div className="flex items-center">
      <input
        type="checkbox"
        id="isTrained"
        checked={formData.isTrained}
        onChange={(e) => onChange("isTrained", e.target.checked)}
        className="w-4 h-4 border rounded focus:ring-2 focus:ring-[#ffc929]"
      />
      <label htmlFor="isTrained" className="ml-2">
        Is Trained
      </label>
    </div>

    <textarea
      value={formData.description}
      onChange={(e) => onChange("description", e.target.value)}
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ffc929]"
      placeholder="Description"
      rows={4}
      required
    />

    <div className="flex justify-end gap-4 mt-6">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-gray-700 transition-colors border rounded-lg hover:bg-gray-100"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 text-white transition-colors rounded-lg bg-[#ffc929] hover:bg-[#e6b625] disabled:bg-gray-300"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  </form>
);

// PetDetails component
const PetDetails = ({ pet, onEdit }) => (
  <div className="space-y-6">
    <div className="relative overflow-hidden rounded-lg aspect-video">
      <img
        src={pet.image}
        alt={pet.name}
        className="object-cover w-full h-full"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      {[
        { label: "Race", value: pet.race },
        { label: "Age", value: `${pet.age} months` },
        { label: "City", value: pet.city },
        { label: "Status", value: <StatusBadge status={pet.status} /> },
      ].map(({ label, value }) => (
        <div key={label} className="p-4 rounded-lg bg-[#ffc929]/5">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="font-medium">{value}</p>
        </div>
      ))}
    </div>

    <div className="p-4 space-y-2 rounded-lg bg-[#ffc929]/5">
      <p className="text-sm text-gray-600">Description</p>
      <p>{pet.description}</p>
    </div>

    <div className="flex justify-end gap-2">
      <button
        onClick={() => onEdit(pet)}
        className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-[#ffc929] hover:bg-[#e6b625]"
      >
        <Edit size={16} />
        Edit Pet
      </button>
    </div>
  </div>
);

const PetOwnerPosts = () => {
  const navigate = useNavigate();
  const {
    user,
    getMyPets,
    updatePet,
    deletePet,
    error,
    setError,
    clearError,
    currencySymbol,
  } = useApp();

  const [selectedPet, setSelectedPet] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userPets, setUserPets] = useState([]);

  const fetchUserPets = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMyPets();
      if (result.success) {
        setUserPets(result.data);
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

    const fetchData = async () => {
      if (user?._id && mounted) {
        await fetchUserPets();
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [user?._id]);

  const handleEdit = useCallback((pet) => {
    setEditMode(true);
    setSelectedPet(pet);
    setEditFormData({
      name: pet.name,
      race: pet.race,
      breed: pet.breed,
      age: pet.age,
      city: pet.city,
      gender: pet.gender,
      category: pet.category,
      fee: pet.fee,
      isTrained: pet.isTrained,
      description: pet.description,
    });
  }, []);

  const handleDelete = useCallback(
    async (petId) => {
      if (window.confirm("Are you sure you want to delete this pet?")) {
        setLoading(true);
        try {
          const result = await deletePet(petId);
          if (result.success) {
            fetchUserPets();
          }
        } catch (err) {
          setError(err.message || "Failed to delete pet");
        } finally {
          setLoading(false);
        }
      }
    },
    [deletePet, fetchUserPets, setError]
  );

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await updatePet(selectedPet._id, editFormData);
      if (result.success) {
        fetchUserPets();
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
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#ffc929] rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <LoadingWrapper loading={loading}>
      <div className="min-h-screen bg-gradient-to-br from-white via-[#ffc929]/5 to-pink-50">
        <div className="container p-4 mx-auto max-w-7xl sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex justify-between mb-8">
            <div className="space-y-4 transition-all duration-500 transform hover:translate-x-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 transition-colors duration-300 sm:text-3xl lg:text-4xl hover:text-[#ffc929]">
                Pet Adoption Posts
              </h1>
              <p className="mt-2 text-sm text-black transition-colors duration-300 hover:text-pink-500 sm:text-base lg:text-lg">
                Manage your adoption posts and track potential candidates all in
                one place.
              </p>
            </div>
          </div>
          {userPets.length > 0 && (
            <button
              onClick={() => navigate("/addPet")}
              className="flex items-center gap-1 px-4 py-1.5 text-sm text-white transition-all duration-300 transform rounded-lg bg-[#ffc929] hover:bg-[#e6b625] hover:scale-105"
            >
              <Plus size={16} />
              <span>Add New Post</span>
            </button>
          )}

          {/* Error Display */}
          {error && <Alert message={error} onClose={clearError} />}

          {/* Empty State */}
          {userPets.length === 0 ? (
            <EmptyState
              message="You haven't created any pet adoption posts yet. Start by adding your first pet!"
              buttonText="Add Your First Pet For Adoption"
              buttonAction={() => navigate("/addPet")}
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-hidden bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(255,201,41,0.2)] transition-all duration-500">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-neutral-700 uppercase bg-gradient-to-r from-[#ffc929]/10 to-white">
                      <tr>
                        {TABLE_HEADERS.map((header) => (
                          <th key={header} className="px-4 py-4 font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {userPets.map((pet) => (
                        <tr
                          key={pet._id}
                          className="transition-all duration-300 border-b hover:bg-[#ffc929]/5"
                          onClick={() => setSelectedPet(pet)}
                        >
                          <td className="px-4 py-4">
                            <div className="relative w-16 h-16 overflow-hidden rounded-lg">
                              <img
                                src={pet.image}
                                alt={pet.name}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4">{pet.name}</td>
                          <td className="max-w-xs px-4 py-4 truncate">
                            {pet.description}
                          </td>
                          <td className="px-4 py-4">{pet.race}</td>
                          <td className="px-4 py-4">{pet.age}</td>
                          <td className="px-4 py-4">
                            {pet.fee === 0
                              ? "Free"
                              : `${pet.fee} ${currencySymbol}`}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={pet.status} />
                          </td>
                          <td
                            className="px-4 py-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ActionButtons
                              pet={pet}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              onViewCandidates={(id) =>
                                navigate(`/candidates/${id}`)
                              }
                              disabled={loading}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="grid gap-4 md:hidden">
                {userPets.map((pet) => (
                  <div
                    key={pet._id}
                    className="p-4 transition-all duration-300 bg-white shadow-md rounded-xl hover:shadow-lg"
                    onClick={() => setSelectedPet(pet)}
                  >
                    <div className="flex flex-col sm:flex-row sm:space-x-4">
                      <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg sm:w-24 sm:h-24 sm:mb-0">
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-medium">{pet.name}</h3>
                          <StatusBadge status={pet.status} />
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 sm:line-clamp-1">
                          {pet.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm truncate">
                            <span className="font-medium">Race:</span>{" "}
                            {pet.race}
                          </div>
                          <div className="text-sm truncate">
                            <span className="font-medium">Age:</span> {pet.age}{" "}
                            months
                          </div>
                          <div className="text-sm truncate">
                            <span className="font-medium">Fee:</span>{" "}
                            {pet.fee === 0
                              ? "Free"
                              : `${pet.fee} ${currencySymbol}`}
                          </div>
                          <div className="text-sm truncate">
                            <span className="font-medium">Category:</span>{" "}
                            {pet.category}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex justify-end pt-3 mt-4 border-t"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ActionButtons
                        pet={pet}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onViewCandidates={(id) => navigate(`/candidates/${id}`)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Modal */}
          {selectedPet && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="w-full max-w-lg bg-white rounded-xl">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-xl font-bold">
                    {editMode ? "Edit Pet" : selectedPet.name}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-4">
                  {editMode ? (
                    <EditForm
                      formData={editFormData}
                      onChange={handleInputChange}
                      onSubmit={handleUpdate}
                      onCancel={handleCloseModal}
                      loading={loading}
                    />
                  ) : (
                    <PetDetails pet={selectedPet} onEdit={handleEdit} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LoadingWrapper>
  );
};

export default PetOwnerPosts;
