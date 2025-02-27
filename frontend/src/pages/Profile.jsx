import { useState, useEffect } from "react";
import { Mail, MapPin, Phone, Heart, Dog, Cat, Edit, Save, X, Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import axiosInstance from "../utils/axiosInstance";
import ImageUpload from "../components/ImageUpload";

const DEFAULT_PROFILE_IMAGE = "/api/placeholder/150/150";
const DEFAULT_PET_IMAGE = "/api/placeholder/100/100";

const Profile = () => {
  const { user, fetchUserProfile, updateUser, loading, error } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({});
  const [activeTab, setActiveTab] = useState("about");
  const [tempImage, setTempImage] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [adoptedPets] = useState([
    {
      id: 1,
      name: "Buddy",
      type: "Dog",
      breed: "Golden Retriever",
      age: 3,
      adoptedDate: "2023-05-15",
      image: DEFAULT_PET_IMAGE,
    },
    {
      id: 2,
      name: "Whiskers",
      type: "Cat",
      breed: "Maine Coon",
      age: 2,
      adoptedDate: "2024-01-10",
      image: DEFAULT_PET_IMAGE,
    },
  ]);

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
    }
  }, [user]);

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

      console.log("Data being sent to backend:", updatedData);

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
      alert(`Erreur lors de la sauvegarde : ${error.response?.data?.message || error.message}`);
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

  if (loading && !user)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-amber-50 to-rose-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
          <span className="text-lg font-medium text-amber-700 animate-pulse">Loading Your Profile...</span>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="text-rose-500 p-6 text-center bg-rose-50 rounded-2xl mx-auto max-w-2xl mt-12 shadow-lg">
        Error fetching your pet profile: {error}
      </div>
    );
  if (!user)
    return (
      <div className="text-center p-8 text-gray-600 bg-gray-50 rounded-2xl mx-auto max-w-2xl mt-12 shadow-lg">
        No pet parent profile available
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 px-4 py-16">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-100 transition-all duration-500">
        {/* Header */}
        <div className="relative h-24 bg-gradient-to-r from-amber-300  to-pink-500">
          <div className="absolute inset-0 opacity-20">
            {[...Array(8)].map((_, i) => (
              <Heart
                key={`heart-${i}`}
                className="absolute text-white animate-float"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${15 + Math.random() * 15}px`,
                  height: `${15 + Math.random() * 15}px`,
                  animationDelay: `${i * 0.5}s`,
                }}
                fill="currentColor"
              />
            ))}
          </div>
        </div>

        <div className="relative px-8 pt-8 pb-12">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
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
                    className="w-36 h-36 rounded-full border-4 border-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
                  />
                </div>
              ) : (
                <img
                  src={tempImage || DEFAULT_PROFILE_IMAGE}
                  alt={editableData.fullName}
                  className="w-36 h-36 rounded-full border-4 border-white shadow-xl object-cover transition-all duration-300 hover:shadow-2xl hover:scale-105"
                />
              )}
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full p-2 shadow-lg transform translate-x-1/4 translate-y-1/4">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
                {isEditing ? (
                  <input
                    type="text"
                    value={editableData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white text-gray-800 font-extrabold text-3xl shadow-sm"
                    placeholder="Your Name"
                  />
                ) : (
                  <span className="gradient-text">{editableData.fullName || "Pet Lover"}</span>
                )}
              </h1>
              <p className="text-lg font-medium text-amber-600 mt-2">{user.role || "Pet Parent"}</p>
              <div className="flex items-center justify-center sm:justify-start mt-3 text-amber-500">
                <Heart className="w-6 h-6 mr-2 animate-pulse" fill="currentColor" />
                <span className="text-base font-semibold">Pet Enthusiast</span>
              </div>
            </div>
            <div className="absolute top-6 right-6 sm:static">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-white text-amber-600 rounded-full shadow-lg hover:bg-amber-50 hover:text-amber-700 transition-all duration-300 border border-amber-200"
                >
                  <Edit className="w-5 h-5" />
                  <span className="text-sm font-semibold">Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-5 py-2 bg-white text-gray-600 rounded-full shadow-lg hover:bg-gray-100 hover:text-gray-700 transition-all duration-300 border border-gray-200"
                  >
                    <X className="w-5 h-5" />
                    <span className="text-sm font-semibold">Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={uploadLoading}
                    className={`flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-400 to-rose-400 text-white rounded-full shadow-lg hover:from-amber-500 hover:to-rose-500 transition-all duration-300 ${uploadLoading ? "opacity-70 cursor-not-allowed" : "hover:shadow-xl"}`}
                  >
                    {uploadLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    <span className="text-sm font-semibold">{uploadLoading ? "Saving..." : "Save"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-10 bg-white rounded-t-xl shadow-inner">
            {["about", "pets", "contact"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-center font-semibold text-base transition-all duration-300 ${
                  activeTab === tab
                    ? "text-amber-700 bg-gradient-to-r from-amber-50 to-rose-50 border-b-4 border-amber-400"
                    : "text-gray-600 hover:text-amber-600 hover:bg-gray-50"
                }`}
              >
                {tab === "about" && "About"}
                {tab === "pets" && (
                  <span className="flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5" /> My Pets
                  </span>
                )}
                {tab === "contact" && "Contact"}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === "about" && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-6">
                <span className="bg-gradient-to-r from-amber-200 to-rose-200 p-2 rounded-full shadow-md">
                  <Heart className="w-6 h-6 text-amber-600" />
                </span>
                About Me
              </h2>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-100 transition-all duration-300">
                {isEditing ? (
                  <textarea
                    value={editableData.about || ""}
                    onChange={(e) => handleInputChange("about", e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50 text-gray-700 text-base resize-none shadow-inner transition-all duration-300 hover:border-amber-300"
                    rows={6}
                    placeholder="Share your story..."
                  />
                ) : (
                  <p className="text-gray-700 text-lg leading-relaxed font-light italic">
                    {editableData.about || "I'm a passionate pet parent who adores animals and cherishes every moment with my furry friends!"}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "pets" && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-6">
                <span className="bg-gradient-to-r from-amber-200 to-rose-200 p-2 rounded-full shadow-md">
                  <Heart className="w-6 h-6 text-amber-600" />
                </span>
                My Adopted Pets
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {adoptedPets.map((pet) => (
                  <div
                    key={pet.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-amber-50 to-rose-50">
                      <img
                        src={pet.image}
                        alt={pet.name}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-rose-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                        {pet.type}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-semibold text-gray-800">{pet.name}</h3>
                      <div className="mt-3 space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium text-amber-700">Breed:</span> {pet.breed}</p>
                        <p><span className="font-medium text-amber-700">Age:</span> {pet.age} years</p>
                        <p><span className="font-medium text-amber-700">Adopted:</span> {new Date(pet.adoptedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-6">
                <span className="bg-gradient-to-r from-amber-200 to-rose-200 p-2 rounded-full shadow-md">
                  <Mail className="w-6 h-6 text-amber-600" />
                </span>
                Contact Information
              </h2>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100">
                <div className="grid gap-6 sm:grid-cols-2">
                  {[
                    { icon: Mail, label: "Email", value: user.email, editable: false },
                    { icon: Phone, label: "Phone", value: editableData.phone, field: "phone", editable: true },
                    { icon: MapPin, label: "Location", value: editableData.location, field: "location", editable: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-4 group">
                      <div className="bg-gradient-to-r from-amber-200 to-rose-200 p-3 rounded-full shadow-md group-hover:shadow-lg transition-all duration-300">
                        <item.icon className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-amber-700">{item.label}</h3>
                        {isEditing && item.editable ? (
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => handleInputChange(item.field, e.target.value)}
                            className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50 text-gray-700 shadow-sm transition-all duration-300 hover:border-amber-300"
                          />
                        ) : (
                          <p className="mt-2 text-gray-700 font-medium">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-100 to-rose-100 rounded-b-3xl flex justify-between items-center border-t border-amber-200 shadow-inner">
          <div className="flex items-center text-amber-700 text-sm font-semibold">
            <Heart className="w-5 h-5 mr-2 animate-pulse" fill="currentColor" />
            <span>Pet Parent since 2022</span>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2 bg-white text-amber-700 rounded-full shadow-lg hover:bg-amber-50 hover:text-amber-800 transition-all duration-300 border border-amber-200"
            >
              <Edit className="w-5 h-5" />
              <span className="text-sm font-semibold">Edit Profile</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;