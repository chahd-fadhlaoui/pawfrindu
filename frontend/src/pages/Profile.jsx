import { useState, useEffect } from "react";
import { Mail, MapPin, Phone, Heart, Dog, Cat, Edit, Save, X, Loader2, User, Calendar, PawPrint } from "lucide-react";
import { useApp } from "../context/AppContext";
import axiosInstance from "../utils/axiosInstance";
import ImageUpload from "../components/ImageUpload";
import PetDetailsModal from "../components/PetDetailsModal";

const DEFAULT_PROFILE_IMAGE = "/api/placeholder/150/150";
const DEFAULT_PET_IMAGE = "/api/placeholder/100/100";

const Profile = () => {
  const { user, fetchUserProfile, updateUser, loading, error } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({});
  const [activeTab, setActiveTab] = useState("about");
  const [tempImage, setTempImage] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [adoptedPets, setAdoptedPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        await fetchUserProfile();
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    };
    loadUserData();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (user) {
      setEditableData({
        fullName: user.fullName || "",
        about: user.about || "",
        location: user.petOwnerDetails?.address || "Not provided",
        phone: user.petOwnerDetails?.phone || "Not provided",
        image: user.image || null,
      });
      setTempImage(user.image || DEFAULT_PROFILE_IMAGE);
      fetchAdoptedPets();
    }
  }, [user]);

  const fetchAdoptedPets = async () => {
    setPetsLoading(true);
    try {
      const response = await axiosInstance.get("/api/pet/my-adopted-pets");
      if (response.data.success) {
        setAdoptedPets(response.data.data);
      } else {
        console.error("Failed to fetch adopted pets:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching adopted pets:", error);
    } finally {
      setPetsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditableData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageSelected = (url) => {
    setTempImage(url);
    setEditableData((prev) => ({
      ...prev,
      image: url,
    }));
  };

  const handleRemoveImage = () => {
    setTempImage(DEFAULT_PROFILE_IMAGE);
    setEditableData((prev) => ({
      ...prev,
      image: null,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setUploadLoading(true);

      const updatedData = {
        userId: user._id,
        fullName: editableData.fullName,
        about: editableData.about,
        image: tempImage !== DEFAULT_PROFILE_IMAGE ? tempImage : null,
        petOwnerDetails: {
          address: editableData.location,
          phone: editableData.phone,
        },
      };

      updateUser({
        fullName: editableData.fullName,
        about: editableData.about,
        image: tempImage !== DEFAULT_PROFILE_IMAGE ? tempImage : null,
        petOwnerDetails: {
          ...user.petOwnerDetails,
          address: editableData.location,
          phone: editableData.phone,
        },
      });

      const result = await axiosInstance.put("/api/user/updateProfile", updatedData);
      console.log("Profile updated successfully:", result.data);

      await fetchUserProfile();
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error.response?.data?.message || error.message);
      alert(`Error saving profile: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditableData({
        fullName: user.fullName || "",
        about: user.about || "",
        location: user.petOwnerDetails?.address || "Not provided",
        phone: user.petOwnerDetails?.phone || "Not provided",
        image: user.image || null,
      });
      setTempImage(user.image || DEFAULT_PROFILE_IMAGE);
    }
    setIsEditing(false);
  };

  const handleOpenModal = (pet) => {
    setSelectedPet(pet);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPet(null);
  };



  if (loading && !user)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="relative flex flex-col items-center gap-4">
          <div className="absolute inset-0 opacity-10">
            {[...Array(10)].map((_, i) => (
              <PawPrint
                key={`paw-${i}`}
                className="absolute text-rose-200 animate-float"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${10 + Math.random() * 15}px`,
                  height: `${10 + Math.random() * 15}px`,
                  animationDelay: `${i * 0.3}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
                fill="currentColor"
              />
            ))}
          </div>
          <div className="relative z-10 bg-white p-8 rounded-full shadow-xl border-2 border-rose-200">
            <Loader2 className="w-12 h-12 text-[#ffc929] animate-spin" />
          </div>
          <span className="relative z-10 text-lg font-medium text-pink-700">Loading your profile...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-rose-50 to-pink-50 p-6">
        <div className="text-pink-700 p-8 text-center bg-white rounded-2xl mx-auto max-w-2xl shadow-lg border-2 border-rose-200">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-500">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Profile Error</h2>
          <p className="text-rose-600">Error fetching your pet profile: {error}</p>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-rose-50 to-pink-50 p-6">
        <div className="text-center p-8 text-gray-600 bg-white rounded-2xl mx-auto max-w-2xl shadow-lg border-2 border-rose-200">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-500">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No Profile Found</h2>
          <p>No pet parent profile available</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-rose-200 transition-all duration-500 hover:shadow-xl relative z-10">
          {/* Header Background */}
          <div className="relative h-56 bg-gradient-to-r from-rose-100 to-[#ffc929] overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              {[...Array(10)].map((_, i) => (
                <PawPrint
                  key={`header-paw-${i}`}
                  className="absolute text-white"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${15 + Math.random() * 20}px`,
                    height: `${15 + Math.random() * 20}px`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                  fill="currentColor"
                />
              ))}
            </div>

            {/* Profile Image */}
            <div className="absolute -bottom-30 mt-5 left-10">
              <div className="relative group">
                {isEditing ? (
                  <div className="w-36 h-36">
                    <ImageUpload
                      currentImage={tempImage}
                      onImageSelected={handleImageSelected}
                      loading={uploadLoading}
                      maxSize={5}
                      showRemove={tempImage !== DEFAULT_PROFILE_IMAGE}
                      onRemove={handleRemoveImage}
                      className="w-36 h-36 rounded-full border-4 border-white shadow-lg transition-all duration-300"
                    />
                  </div>
                ) : (
                  <img
                    src={tempImage || DEFAULT_PROFILE_IMAGE}
                    alt={editableData.fullName}
                    className="w-36 h-36 rounded-full border-4 border-white shadow-lg object-cover transition-all duration-300"
                  />
                )}
                <div className="absolute -bottom-2 -right-2 bg-pink-600 rounded-full p-2 shadow-md">
                  <PawPrint className="w-5 h-5 text-white" fill="white" />
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="absolute top-6 right-6">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-pink-600 rounded-lg shadow-md hover:bg-rose-100 transition-all duration-300 border border-rose-200"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-500 rounded-lg shadow-md hover:bg-rose-100 transition-all duration-300 border border-rose-200"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={uploadLoading}
                    className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ffc929] to-rose-500 text-white rounded-lg shadow-md ${uploadLoading ? "opacity-70 cursor-not-allowed" : "hover:from-rose-500 hover:to-[#ffc929]"} transition-all duration-300`}
                  >
                    {uploadLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">{uploadLoading ? "Saving..." : "Save"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-24 pb-8 px-10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-pink-600 mb-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editableData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 bg-rose-50 text-pink-600 font-bold text-2xl shadow-sm placeholder-rose-400"
                    placeholder="Your Name"
                  />
                ) : (
                  editableData.fullName || "Pet Lover"
                )}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-pink-600 font-medium">{user.role || "Pet Parent"}</span>
                <div className="flex items-center text-[#ffc929]">
                  <Heart className="w-4 h-4 mr-1" fill="currentColor" />
                  <span className="text-sm font-medium">Pet Enthusiast</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-rose-200 mb-8">
              {[
                { key: "about", label: "About Me", icon: User },
                { key: "pets", label: "My Adopted Pets", icon: PawPrint },
                { key: "contact", label: "Contact", icon: Mail },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 py-3 px-5 font-medium text-sm transition-all duration-300 border-b-2 ${
                    activeTab === tab.key
                      ? "text-pink-600 border-pink-500"
                      : "text-gray-500 border-transparent hover:text-rose-600 hover:border-rose-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="animate-fadeIn">
              {activeTab === "about" && (
                <div className="bg-white rounded-xl">
                  <h2 className="text-xl font-bold text-pink-600 mb-4 flex items-center gap-2">
                    <span className="bg-rose-100 p-2 rounded-lg text-pink-500">
                      <User className="w-5 h-5" />
                    </span>
                    About Me
                  </h2>
                  <div className="bg-rose-50 p-6 rounded-xl border border-rose-200">
                    {isEditing ? (
                      <textarea
                        value={editableData.about || ""}
                        onChange={(e) => handleInputChange("about", e.target.value)}
                        className="w-full p-4 border border-rose-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white text-gray-700 text-base resize-none shadow-sm transition-all duration-300"
                        rows={6}
                        placeholder="Tell us about yourself and your love for pets..."
                      />
                    ) : (
                      <p className="text-gray-700 text-base leading-relaxed">
                        {editableData.about || "I'm a passionate pet parent who loves spending time with my furry companions! Every day with them brings joy and adventure to my life."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "pets" && (
                <div>
                  <h2 className="text-xl font-bold text-pink-600 mb-4 flex items-center gap-2">
                    <span className="bg-rose-100 p-2 rounded-lg text-pink-500">
                      <PawPrint className="w-5 h-5" />
                    </span>
                    My Furry Family
                  </h2>
                  {petsLoading ? (
                    <div className="flex justify-center items-center py-12 bg-rose-50 rounded-xl border border-rose-200">
                      <Loader2 className="w-10 h-10 text-[#ffc929] animate-spin" />
                    </div>
                  ) : adoptedPets.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2">
                      {adoptedPets.map((pet) => (
                        <div
                          key={pet._id}
                          className="bg-white rounded-xl shadow-md overflow-hidden border border-rose-200 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex flex-col sm:flex-row">
                            {/* Pet Image */}
                            <div className="w-full sm:w-2/5 h-48 sm:h-full bg-rose-50 relative overflow-hidden">
                              <img
                                src={pet.image || DEFAULT_PET_IMAGE}
                                alt={pet.name}
                                className="object-cover w-full h-full"
                                onError={(e) => (e.target.src = DEFAULT_PET_IMAGE)}
                              />
                              <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
                                {pet.species === "dog" ? (
                                  <span className="flex items-center gap-1">
                                    <Dog className="w-3 h-3" /> Dog
                                  </span>
                                ) : pet.species === "cat" ? (
                                  <span className="flex items-center gap-1">
                                    <Cat className="w-3 h-3" /> Cat
                                  </span>
                                ) : (
                                  pet.species
                                )}
                              </div>
                            </div>

                            {/* Pet Info */}
                            <div className="w-full sm:w-3/5 p-5">
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-bold text-pink-600">{pet.name}</h3>
                               
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center text-gray-600 text-sm">
                                  <div className="bg-rose-100 p-1 rounded-md mr-2">
                                    <PawPrint className="w-3 h-3 text-rose-500" />
                                  </div>
                                  <span className="font-medium">Breed:</span>
                                  <span className="ml-2">{pet.breed || "Mixed"}</span>
                                </div>

                                <div className="flex items-center text-gray-600 text-sm">
                                  <div className="bg-rose-100 p-1 rounded-md mr-2">
                                    <Calendar className="w-3 h-3 text-rose-500" />
                                  </div>
                                  <span className="font-medium">Age:</span>
                                  <span className="ml-2">{pet.age || "Unknown"}</span>
                                </div>

                                <div className="flex items-center text-gray-600 text-sm">
                                  <div className="bg-rose-100 p-1 rounded-md mr-2">
                                    <Calendar className="w-3 h-3 text-rose-500" />
                                  </div>
                                  <span className="font-medium">Adopted:</span>
                                  <span className="ml-2">
                                    {pet.adoptedDate ? new Date(pet.adoptedDate).toLocaleDateString() : "Date not available"}
                                  </span>
                                </div>
                              </div>

                              {pet.description && (
                                <p className="mt-3 text-sm text-gray-500 line-clamp-2">{pet.description}</p>
                              )}

                              <div className="mt-4">
                                <button
                                  onClick={() => handleOpenModal(pet)}
                                  className="px-3 py-1.5 bg-rose-100 text-pink-600 text-xs font-medium rounded-md hover:bg-rose-200 transition-colors duration-300"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-rose-50 rounded-xl border border-rose-200">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 mb-4">
                        <PawPrint className="w-10 h-10 text-rose-200" />
                      </div>
                      <h3 className="text-lg font-medium text-pink-600 mb-2">No Pets Yet</h3>
                      <p className="text-gray-500 max-w-md mx-auto text-sm">
                        You haven't adopted any pets yet. When you do, they'll appear here with all their adorable details!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "contact" && (
                <div>
                  <h2 className="text-xl font-bold text-pink-600 mb-4 flex items-center gap-2">
                    <span className="bg-rose-100 p-2 rounded-lg text-pink-500">
                      <Mail className="w-5 h-5" />
                    </span>
                    Contact Information
                  </h2>
                  <div className="bg-rose-50 p-6 rounded-xl border border-rose-200">
                    <div className="grid gap-5 sm:grid-cols-2">
                      {[
                        { icon: Mail, label: "Email", value: user.email, editable: false, bgColor: "bg-rose-100", iconColor: "text-rose-500" },
                        { icon: Phone, label: "Phone", value: editableData.phone, field: "phone", editable: true, bgColor: "bg-[#ffc929]", iconColor: "text-white" },
                        { icon: MapPin, label: "Location", value: editableData.location, field: "location", editable: true, bgColor: "bg-rose-100", iconColor: "text-rose-500" },
                      ].map((item, index) => (
                        <div
                          key={item.label}
                          className={`flex items-center gap-4 p-4 bg-white rounded-lg border border-rose-200 ${index === 2 ? "sm:col-span-2" : ""}`}
                        >
                          <div className={`${item.bgColor} p-3 rounded-lg`}>
                            <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-rose-600 mb-1">{item.label}</h3>
                            {isEditing && item.editable ? (
                              <input
                                type="text"
                                value={item.value}
                                onChange={(e) => handleInputChange(item.field, e.target.value)}
                                className="w-full px-3 py-2 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white text-gray-700 text-sm transition-all duration-300"
                              />
                            ) : (
                              <p className="text-gray-800 font-medium">{item.value}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal for Pet Details */}
        {selectedPet && showModal && (
          <PetDetailsModal
            pet={selectedPet}
            onClose={handleCloseModal}
            actionLoading={actionLoading}
            showOwner={true}
          />
        )}
      </div>

      {/* Add animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Profile;