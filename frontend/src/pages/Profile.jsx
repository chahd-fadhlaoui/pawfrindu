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
          <Loader2 className="w-12 h-12 text-amber-300 animate-spin" />
          <span className="text-lg font-medium text-amber-600 animate-pulse">Loading...</span>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="text-rose-400 p-6 text-center bg-rose-50 rounded-2xl mx-auto max-w-2xl mt-12 shadow-md">
        Error fetching your pet profile: {error}
      </div>
    );
  if (!user)
    return (
      <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-2xl mx-auto max-w-2xl mt-12 shadow-md">
        No pet parent profile available
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 px-6 py-20">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden border border-amber-50 transition-all duration-300">
        {/* Header */}
        <div className="relative h-28 bg-gradient-to-r from-amber-100 to-pink-500 ">
          <div className="absolute inset-0 opacity-30">
            {[...Array(10)].map((_, i) => (
              <Heart
                key={`heart-${i}`}
                className="absolute text-amber-200 animate-float"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${10 + Math.random() * 15}px`,
                  height: `${10 + Math.random() * 15}px`,
                  animationDelay: `${i * 0.3}s`,
                }}
                fill="currentColor"
              />
            ))}
          </div>
        </div>

        <div className="relative px-10 pt-10 pb-16">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-8 mb-12">
            <div className="relative group">
              {isEditing ? (
                <div className="w-40 h-40">
                  <ImageUpload
                    currentImage={tempImage}
                    onImageSelected={handleImageSelected}
                    loading={uploadLoading}
                    maxSize={5}
                    showRemove={tempImage !== DEFAULT_PROFILE_IMAGE}
                    onRemove={handleRemoveImage}
                    className="w-40 h-40 rounded-full border-4 border-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
                  />
                </div>
              ) : (
                <img
                  src={tempImage || DEFAULT_PROFILE_IMAGE}
                  alt={editableData.fullName}
                  className="w-40 h-40 rounded-full border-4 border-white shadow-md object-cover transition-all duration-300 hover:shadow-lg hover:scale-105"
                />
              )}
              <div className="absolute -bottom-3 -right-3 bg-amber-200 rounded-full p-2 shadow-md transform translate-x-1/4 translate-y-1/4">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-semibold text-gray-700 tracking-wide">
                {isEditing ? (
                  <input
                    type="text"
                    value={editableData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="w-full px-4 py-2 border border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 bg-amber-50 text-gray-700 font-semibold text-3xl shadow-sm placeholder-amber-300"
                    placeholder="Your Name"
                  />
                ) : (
                  <span className="text-gradient">{editableData.fullName || "Pet Lover"}</span>
                )}
              </h1>
              <p className="text-lg font-medium text-amber-500 mt-2">{user.role || "Pet Parent"}</p>
              <div className="flex items-center justify-center sm:justify-start mt-3 text-amber-400">
                <Heart className="w-5 h-5 mr-2 animate-pulse" fill="currentColor" />
                <span className="text-base font-medium">Pet Enthusiast</span>
              </div>
            </div>
            <div className="absolute top-6 right-6 sm:static">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-amber-50 text-amber-600 rounded-full shadow-md hover:bg-amber-100 hover:text-amber-700 transition-all duration-300 border border-amber-100"
                >
                  <Edit className="w-5 h-5" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-5 py-2 bg-rose-50 text-rose-500 rounded-full shadow-md hover:bg-rose-100 hover:text-rose-600 transition-all duration-300 border border-rose-100"
                  >
                    <X className="w-5 h-5" />
                    <span className="text-sm font-medium">Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={uploadLoading}
                    className={`flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-200 to-rose-200 text-white rounded-full shadow-md hover:from-amber-300 hover:to-rose-300 transition-all duration-300 ${uploadLoading ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg"}`}
                  >
                    {uploadLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">{uploadLoading ? "Saving..." : "Save"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-amber-100 mb-10 bg-amber-50 rounded-t-xl shadow-inner">
            {["about", "pets", "contact"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-center font-medium text-base transition-all duration-300 ${
                  activeTab === tab
                    ? "text-amber-600 bg-white border-b-4 border-amber-200"
                    : "text-gray-500 hover:text-amber-500 hover:bg-amber-100"
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
              <h2 className="text-2xl font-medium text-gray-700 flex items-center gap-3 mb-6">
                <span className="bg-amber-100 p-2 rounded-full shadow-sm">
                  <Heart className="w-6 h-6 text-amber-400" />
                </span>
                About Me
              </h2>
              <div className="bg-amber-50 p-6 rounded-xl shadow-md border border-amber-100 transition-all duration-300">
                {isEditing ? (
                  <textarea
                    value={editableData.about || ""}
                    onChange={(e) => handleInputChange("about", e.target.value)}
                    className="w-full p-4 border border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white text-gray-600 text-base resize-none shadow-sm transition-all duration-300 hover:border-amber-200"
                    rows={6}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-600 text-lg leading-relaxed font-light">
                    {editableData.about || "I'm a passionate pet parent who loves spending time with my furry companions!"}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "pets" && (
            <div className="mt-6">
              <h2 className="text-2xl font-medium text-gray-700 flex items-center gap-3 mb-6">
                <span className="bg-amber-100 p-2 rounded-full shadow-sm">
                  <Heart className="w-6 h-6 text-amber-400" />
                </span>
                My Adopted Pets
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {adoptedPets.map((pet) => (
                  <div
                    key={pet.id}
                    className="bg-white rounded-2xl shadow-md overflow-hidden border border-amber-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative h-48 bg-amber-50">
                      <img
                        src={pet.image}
                        alt={pet.name}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 bg-amber-200 text-amber-700 text-xs font-medium px-2 py-1 rounded-full shadow">
                        {pet.type}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-medium text-gray-700">{pet.name}</h3>
                      <div className="mt-3 space-y-2 text-sm text-gray-500">
                        <p><span className="font-medium text-amber-600">Breed:</span> {pet.breed}</p>
                        <p><span className="font-medium text-amber-600">Age:</span> {pet.age} years</p>
                        <p><span className="font-medium text-amber-600">Adopted:</span> {new Date(pet.adoptedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="mt-6">
              <h2 className="text-2xl font-medium text-gray-700 flex items-center gap-3 mb-6">
                <span className="bg-amber-100 p-2 rounded-full shadow-sm">
                  <Mail className="w-6 h-6 text-amber-400" />
                </span>
                Contact Information
              </h2>
              <div className="bg-amber-50 p-6 rounded-2xl shadow-md border border-amber-100">
                <div className="grid gap-6 sm:grid-cols-2">
                  {[
                    { icon: Mail, label: "Email", value: user.email, editable: false },
                    { icon: Phone, label: "Phone", value: editableData.phone, field: "phone", editable: true },
                    { icon: MapPin, label: "Location", value: editableData.location, field: "location", editable: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-4 group">
                      <div className="bg-amber-100 p-3 rounded-full shadow-md group-hover:shadow-lg transition-all duration-300">
                        <item.icon className="w-6 h-6 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-amber-600">{item.label}</h3>
                        {isEditing && item.editable ? (
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => handleInputChange(item.field, e.target.value)}
                            className="w-full mt-2 px-3 py-2 border border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white text-gray-600 shadow-sm transition-all duration-300 hover:border-amber-200"
                          />
                        ) : (
                          <p className="mt-2 text-gray-600 font-medium">{item.value}</p>
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
        <div className="px-6 py-4 bg-amber-50 rounded-b-3xl flex justify-between items-center border-t border-amber-100 shadow-inner">
          <div className="flex items-center text-amber-500 text-sm font-medium">
            <Heart className="w-5 h-5 mr-2 animate-pulse" fill="currentColor" />
            <span>Pet Parent since 2022</span>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2 bg-amber-100 text-amber-600 rounded-full shadow-md hover:bg-amber-200 hover:text-amber-700 transition-all duration-300 border border-amber-50"
            >
              <Edit className="w-5 h-5" />
              <span className="text-sm font-medium">Edit Profile</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;