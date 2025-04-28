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
        response.data.data.forEach((pet) => {
          if (pet.candidateStatus !== "approved") {
            console.warn(`Unexpected pet with candidateStatus: ${pet.candidateStatus}`, pet);
          }
        });
        setAdoptedPets(response.data.data);
      } else {
        console.error("Failed to fetch adopted pets:", response.data.message);
        setAdoptedPets([]);
      }
    } catch (error) {
      console.error("Error fetching adopted pets:", error);
      setAdoptedPets([]);
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
          <div className="relative z-10 p-8 bg-white border-2 rounded-full shadow-xl border-[#ffc929]/20">
            <Loader2 className="w-12 h-12 text-[#ffc929] animate-spin" />
          </div>
          <span className="relative z-10 text-lg font-medium text-pink-700">Loading your profile...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-r from-rose-50 to-pink-50">
        <div className="max-w-2xl p-8 mx-auto text-center text-pink-700 bg-white border-2 shadow-lg rounded-2xl border-[#ffc929]/20">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-rose-100 text-rose-500">
            <X className="w-8 h-8" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold">Profile Error</h2>
          <p className="text-rose-600">Error fetching your pet profile: {error}</p>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-r from-rose-50 to-pink-50">
        <div className="max-w-2xl p-8 mx-auto text-center text-gray-600 bg-white border-2 shadow-lg rounded-2xl border-[#ffc929]/20">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-rose-100 text-rose-500">
            <User className="w-8 h-8" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold">No Profile Found</h2>
          <p>No pet parent profile available</p>
        </div>
      </div>
    );

  const PawBackground = () => (
    Array(8).fill(null).map((_, index) => (
      <svg 
        key={index} 
        viewBox="0 0 24 24" 
        className={`absolute w-8 h-8 opacity-5 animate-float ${index % 2 === 0 ? "text-[#ffc929]" : "text-pink-300"}`}
        style={{ 
          animationDelay: `${index * 0.5}s`, 
          transform: `rotate(${index * 45}deg)`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
        }}
        fill="currentColor"
      >
        <path d="M12,17.5c2.33,2.33,5.67,2.33,8,0s2.33-5.67,0-8s-5.67-2.33-8,0S9.67,15.17,12,17.5z M7.5,14.5 c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S9.46,12.54,7.5,14.5z M18.5,3.5c-1.96-1.96-4.04-1.96-6,0s-1.96,4.04,0,6 s4.04,1.96,6,0S20.46,5.46,18.5,3.5z M3.5,9.5c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S5.46,7.54,3.5,9.5z" />
      </svg>
    ))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-pink-50">
      {/* Background with paw prints */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <PawBackground />
      </div>
      
      <div className="relative mx-auto max-w-7xl">
        {/* Header section with welcome banner */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-r from-[#ffc929] to-pink-500 rounded-b-3xl shadow-xl">
          <div className="absolute inset-0 opacity-20">
            {[...Array(15)].map((_, i) => (
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
          
          <div className="relative flex flex-col items-center justify-center h-full px-6 text-center text-white">
            <span className="inline-flex items-center px-4 py-2 mb-3 text-sm font-semibold bg-white rounded-full shadow-sm text-pink-500 border border-[#ffc929]/20">
              <Heart className="w-4 h-4 mr-2 text-[#ffc929]" />Pet Parent Profile
            </span>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              <span className="block">Welcome,</span>
              <span className="block text-white">{editableData.fullName || "Pet Lover"}</span>
            </h1>
          </div>
          
          {/* Edit Button */}
          <div className="absolute top-6 right-6">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-pink-600 transition-all duration-300 bg-white border rounded-lg shadow-md hover:bg-[#ffc929]/10 border-[#ffc929]/20"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm font-medium">Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-4 py-2 text-gray-500 transition-all duration-300 bg-white border rounded-lg shadow-md hover:bg-[#ffc929]/10 border-[#ffc929]/20"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm font-medium">Cancel</span>
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={uploadLoading}
                  className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ffc929] to-pink-500 text-white rounded-lg shadow-md ${uploadLoading ? "opacity-70 cursor-not-allowed" : "hover:from-pink-500 hover:to-[#ffc929]"} transition-all duration-300`}
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
        
        {/* Profile Section */}
        <div className="px-6 py-6 md:flex md:items-start md:gap-8 lg:gap-12">
          {/* Left column - Profile image and basic info */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="relative mb-6 -mt-20 md:-mt-24">
              {isEditing ? (
                <div className="mx-auto w-36 h-36 md:w-48 md:h-48">
                  <ImageUpload
                    currentImage={tempImage}
                    onImageSelected={handleImageSelected}
                    loading={uploadLoading}
                    maxSize={5}
                    showRemove={tempImage !== DEFAULT_PROFILE_IMAGE}
                    onRemove={handleRemoveImage}
                    className="transition-all duration-300 border-4 border-white rounded-full shadow-xl w-36 h-36 md:w-48 md:h-48"
                  />
                </div>
              ) : (
                <div className="relative mx-auto w-36 h-36 md:w-48 md:h-48">
                  <img
                    src={tempImage || DEFAULT_PROFILE_IMAGE}
                    alt={editableData.fullName}
                    className="object-cover w-full h-full transition-all duration-300 border-4 border-white rounded-full shadow-xl"
                  />
                  <div className="absolute p-2 bg-[#ffc929] rounded-full shadow-md -bottom-2 -right-2">
                    <PawPrint className="w-5 h-5 text-white" fill="white" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Basic info panel */}
            <div className="p-6 mb-6 bg-white border-2 backdrop-blur-sm bg-opacity-90 shadow-xl rounded-3xl border-[#ffc929]/20">
              <div className="mb-4 text-center">
                <h2 className="mb-1 text-2xl font-bold text-pink-600">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className="w-full px-3 py-2 text-xl font-bold text-pink-600 border rounded-lg shadow-sm border-[#ffc929]/30 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 bg-[#ffc929]/5 placeholder-rose-400"
                      placeholder="Your Name"
                    />
                  ) : (
                    editableData.fullName || "Pet Lover"
                  )}
                </h2>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-medium text-pink-600">{user.role || "Pet Parent"}</span>
                  <div className="flex items-center text-[#ffc929]">
                    <Heart className="w-4 h-4 mr-1" fill="currentColor" />
                    <span className="text-sm font-medium">Pet Enthusiast</span>
                  </div>
                </div>
              </div>
              
              {/* Contact info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 transition-all rounded-lg bg-[#ffc929]/5 hover:bg-[#ffc929]/10">
                  <Mail className="text-[#ffc929]" size={18} />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-700">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 transition-all rounded-lg bg-[#ffc929]/5 hover:bg-[#ffc929]/10">
                  <Phone className="text-[#ffc929]" size={18} />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Phone</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editableData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full px-2 py-1 text-sm text-gray-700 transition-all duration-300 bg-white border rounded border-[#ffc929]/30 focus:outline-none focus:ring-1 focus:ring-[#ffc929]"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-700">{editableData.phone}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 transition-all rounded-lg bg-[#ffc929]/5 hover:bg-[#ffc929]/10">
                  <MapPin className="text-[#ffc929]" size={18} />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Location</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editableData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className="w-full px-2 py-1 text-sm text-gray-700 transition-all duration-300 bg-white border rounded border-[#ffc929]/30 focus:outline-none focus:ring-1 focus:ring-[#ffc929]"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-700">{editableData.location}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Tabs and content */}
          <div className="md:w-2/3 lg:w-3/4">
            {/* Tabs */}
            <div className="flex mb-6 overflow-x-auto bg-white border-2 backdrop-blur-sm shadow-lg rounded-full border-[#ffc929]/20">
              {[
                { key: "about", label: "About Me", icon: User },
                { key: "pets", label: "My Adopted Pets", icon: PawPrint },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.key
                      ? "text-white bg-gradient-to-r from-[#ffc929] to-pink-500 rounded-full shadow-md"
                      : "text-gray-500 hover:text-[#ffc929]"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Tab content */}
            <div className="animate-fadeIn">
              {activeTab === "about" && (
                <div className="p-8 mb-6 bg-white border-2 backdrop-blur-sm bg-opacity-90 shadow-xl rounded-3xl border-[#ffc929]/20">
                  <h2 className="flex items-center gap-2 mb-6 text-xl font-bold text-pink-600">
                    <span className="p-2 text-white rounded-lg bg-gradient-to-r from-[#ffc929] to-pink-500">
                      <User className="w-5 h-5" />
                    </span>
                    About Me
                  </h2>
                  
                  <div className="p-6 border-2 rounded-2xl bg-[#ffc929]/5 border-[#ffc929]/20">
                    {isEditing ? (
                      <textarea
                        value={editableData.about || ""}
                        onChange={(e) => handleInputChange("about", e.target.value)}
                        className="w-full p-4 text-base text-gray-700 transition-all duration-300 bg-white border shadow-sm resize-none border-[#ffc929]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
                        rows={6}
                        placeholder="Tell us about yourself and your love for pets..."
                      />
                    ) : (
                      <p className="text-base leading-relaxed text-gray-700">
                        {editableData.about || "I'm a passionate pet parent who loves spending time with my furry companions! Every day with them brings joy and adventure to my life."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "pets" && (
                <div className="p-8 mb-6 bg-white border-2 backdrop-blur-sm bg-opacity-90 shadow-xl rounded-3xl border-[#ffc929]/20">
                  <h2 className="flex items-center gap-2 mb-6 text-xl font-bold text-pink-600">
                    <span className="p-2 text-white rounded-lg bg-gradient-to-r from-[#ffc929] to-pink-500">
                      <PawPrint className="w-5 h-5" />
                    </span>
                    My Furry Family
                  </h2>
                  
                  {petsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-10 h-10 text-[#ffc929] animate-spin" />
                    </div>
                  ) : adoptedPets.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                      {adoptedPets.map((pet) => (
                        <div
                          key={pet._id}
                          className="overflow-hidden transition-all duration-300 bg-white border-2 shadow-lg rounded-2xl border-[#ffc929]/20 hover:shadow-xl hover:scale-[1.02] group"
                        >
                          <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-white to-pink-50">
                            <img
                              src={pet.image || DEFAULT_PET_IMAGE}
                              alt={pet.name}
                              className="object-cover w-full h-full transition-transform duration-400 group-hover:scale-110"
                              onError={(e) => (e.target.src = DEFAULT_PET_IMAGE)}
                            />
                            <div className="absolute px-2 py-1 text-xs font-semibold text-white rounded-md shadow-sm top-3 left-3 bg-[#ffc929]">
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
                            <div className="absolute p-2 text-white rounded-full shadow-md transition-all duration-300 right-3 top-3 bg-gradient-to-r from-[#ffc929] to-pink-500">
                              <Heart className="w-4 h-4" fill="currentColor" />
                            </div>
                          </div>

                          <div className="p-5 space-y-4">
                            <div className="flex items-start justify-between">
                              <h3 className="text-xl font-bold transition-colors duration-300 text-pink-600 group-hover:text-[#ffc929]">
                                {pet.name}
                              </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 transition-all rounded-lg bg-[#ffc929]/5 hover:bg-[#ffc929]/10">
                                <p className="text-xs font-medium text-gray-500">Breed</p>
                                <p className="text-sm font-medium text-gray-700">{pet.breed || "Mixed"}</p>
                              </div>
                              
                              <div className="p-2 transition-all rounded-lg bg-[#ffc929]/5 hover:bg-[#ffc929]/10">
                                <p className="text-xs font-medium text-gray-500">Age</p>
                                <p className="text-sm font-medium text-gray-700">{pet.age || "Unknown"}</p>
                              </div>
                              
                              <div className="p-2 transition-all rounded-lg bg-[#ffc929]/5 hover:bg-[#ffc929]/10 col-span-2">
                                <p className="text-xs font-medium text-gray-500">Adopted</p>
                                <p className="text-sm font-medium text-gray-700">
                                  {pet.adoptedDate ? new Date(pet.adoptedDate).toLocaleDateString() : "Date not available"}
                                </p>
                              </div>
                            </div>

                            {pet.description && (
                              <p className="text-sm text-gray-500 line-clamp-2">{pet.description}</p>
                            )}

                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenModal(pet); }}
                              className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium transition-all duration-300 rounded-xl text-white bg-gradient-to-r from-[#ffc929] to-pink-500 hover:from-pink-500 hover:to-[#ffc929] shadow-md"
                            >
                              <PawPrint className="w-4 h-4" />
                              View Full Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center border-2 rounded-2xl bg-[#ffc929]/5 border-[#ffc929]/20">
                      <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-[#ffc929]/20 to-pink-100">
                        <PawPrint className="w-10 h-10 text-[#ffc929]" />
                      </div>
                      <h3 className="mb-2 text-lg font-medium text-pink-600">No Pets Yet</h3>
                      <p className="max-w-md mx-auto text-sm text-gray-500">
                        You haven't adopted any pets yet. When you do, they'll appear here with all their adorable details!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
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
          animation: fadeIn 0.5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Profile;