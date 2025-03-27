import React, { useState, useEffect } from "react";
import { 
  MapPin, Phone, Award, Clock, Stethoscope, 
  DollarSign, FileText, Mail, Globe, Languages, 
  Upload, Trash2, Edit, Save, X, Loader2, AlertTriangle 
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom"; // Added for navigation
import axiosInstance from "../../utils/axiosInstance";

const DEFAULT_PROFILE_IMAGE = "/api/placeholder/250/250";

const MyProfile = () => {
  const { user } = useApp();
  const navigate = useNavigate(); // For redirecting to login
  const [vetData, setVetData] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({});
  const [tempImage, setTempImage] = useState(null);
  const [clinicPhotos, setClinicPhotos] = useState([]);
  const [businessCardImage, setBusinessCardImage] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVetProfile = async () => {
      if (!user?._id) {
        setError("Please log in to view your profile");
        setLoading(false);
        navigate("/login"); // Redirect to login if user ID is missing
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/user/me");
        const vet = response.data.user;
        if (vet.role !== "Vet") {
          throw new Error("This page is only accessible to veterinarians");
        }
        setVetData(vet);
        setEditableData({
          fullName: vet.fullName || "",
          email: vet.email || "",
          landlinePhone: vet.veterinarianDetails?.landlinePhone || "Not provided",
          governorate: vet.veterinarianDetails?.governorate || "Not provided",
          delegation: vet.veterinarianDetails?.delegation || "Not provided",
        });
        setTempImage(vet.image || DEFAULT_PROFILE_IMAGE);
        setClinicPhotos(vet.veterinarianDetails?.clinicPhotos || []);
        setBusinessCardImage(vet.veterinarianDetails?.businessCardImage || null);
      } catch (err) {
        console.error("Error fetching vet profile:", err);
        setError(err.message || "Failed to load veterinarian profile");
      } finally {
        setLoading(false);
      }
    };
    fetchVetProfile();
  }, [user, navigate]);

  const handleInputChange = (field, value) => {
    setEditableData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e, type) => {
    if (!vetData?.isActive) {
      alert("Your account is deactivated. Image uploads are disabled.");
      return;
    }
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axiosInstance.post("/api/user/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl = response.data.imageUrl;

      if (type === "profile") {
        setTempImage(imageUrl);
        setEditableData((prev) => ({ ...prev, image: imageUrl }));
      } else if (type === "businessCard") {
        setBusinessCardImage(imageUrl);
      } else if (type === "clinicPhoto") {
        setClinicPhotos([...clinicPhotos, imageUrl]);
      }
    } catch (error) {
      console.error(`Failed to upload ${type} image:`, error);
      alert(`Failed to upload ${type} image.`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRemoveClinicPhoto = (index) => {
    if (!vetData?.isActive) {
      alert("Your account is deactivated. You cannot remove photos.");
      return;
    }
    const newPhotos = clinicPhotos.filter((_, i) => i !== index);
    setClinicPhotos(newPhotos);
  };

  const handleSaveChanges = async () => {
    if (!vetData?.isActive) {
      alert("Your account is deactivated. You cannot save changes.");
      return;
    }
    try {
      setUploadLoading(true);

      const updatedData = {
        userId: vetData._id,
        fullName: editableData.fullName,
        email: editableData.email,
        image: tempImage !== DEFAULT_PROFILE_IMAGE ? tempImage : null,
        veterinarianDetails: {
          ...vetData.veterinarianDetails,
          landlinePhone: editableData.landlinePhone,
          governorate: editableData.governorate,
          delegation: editableData.delegation,
          clinicPhotos,
          businessCardImage,
        },
      };

      const result = await axiosInstance.put("/api/user/updateProfile", updatedData);
      console.log("Profile updated successfully:", result.data);

      // Refresh vet data after save
      const response = await axiosInstance.get("/api/user/me"); // Updated to use /me
      setVetData(response.data.user);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error.response?.data?.message || error.message);
      alert(`Error saving profile: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (vetData) {
      const vetDetails = vetData.veterinarianDetails || {};
      setEditableData({
        fullName: vetData.fullName || "",
        email: vetData.email || "",
        landlinePhone: vetDetails.landlinePhone || "Not provided",
        governorate: vetDetails.governorate || "Not provided",
        delegation: vetDetails.delegation || "Not provided",
      });
      setTempImage(vetData.image || DEFAULT_PROFILE_IMAGE);
      setClinicPhotos(vetDetails.clinicPhotos || []);
      setBusinessCardImage(vetDetails.businessCardImage || null);
    }
    setIsEditing(false);
  };

  const NavButton = ({ section, label, icon: Icon }) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`
        flex items-center space-x-2 px-4 py-2 rounded-lg transition-all 
        ${activeSection === section 
          ? "bg-teal-500 text-white shadow-md" 
          : "text-gray-600 hover:bg-teal-50 hover:text-teal-700"
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  const ProfileSection = ({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center space-x-4 mb-6 border-b pb-4 border-gray-100">
        <Icon className="w-8 h-8 text-teal-600" />
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );

  const VetProfileHeader = () => {
    const { fullName, email } = editableData;

    return (
      <div className="bg-white shadow-md border-b border-gray-100">
        {!vetData?.isActive && (
          <div className="bg-red-100 p-4 flex items-center gap-3 border-b border-red-200">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <p className="text-red-700 font-medium">
              Your account is deactivated. You can view your profile, but editing is disabled until reactivated by an admin.
            </p>
          </div>
        )}
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
          <div className="relative group">
            {isEditing ? (
              <label className="relative block">
                <img
                  src={tempImage}
                  alt={fullName}
                  className="w-64 h-64 rounded-xl object-cover shadow-lg border-4 border-white"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "profile")}
                  className="hidden"
                  disabled={uploadLoading || !vetData?.isActive}
                />
                {uploadLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-xl">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                  </div>
                )}
              </label>
            ) : (
              <img
                src={tempImage}
                alt={fullName}
                className="w-64 h-64 rounded-xl object-cover shadow-lg border-4 border-white"
              />
            )}
            {businessCardImage && (
              <div className="relative group">
                <img 
                  src={businessCardImage} 
                  alt="Business Card" 
                  className="absolute -bottom-4 -right-4 w-32 h-20 rounded-md shadow-md border-2 border-white"
                />
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md cursor-pointer">
                    <Upload className="w-6 h-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "businessCard")}
                      className="hidden"
                      disabled={uploadLoading || !vetData?.isActive}
                    />
                  </label>
                )}
              </div>
            )}
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editableData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 bg-gray-50 text-gray-800 font-extrabold text-2xl shadow-sm"
                  placeholder="Your Name"
                  disabled={!vetData?.isActive}
                />
              ) : (
                fullName || "Veterinarian"
              )}
            </h1>
            <p className="text-xl text-gray-600 mb-4 flex items-center justify-center md:justify-start space-x-2">
              <Mail className="w-5 h-5 text-gray-500" />
              {isEditing ? (
                <input
                  type="email"
                  value={editableData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 bg-gray-50 text-gray-600"
                  placeholder="Your Email"
                  disabled={!vetData?.isActive}
                />
              ) : (
                <span>{email || "N/A"}</span>
              )}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
              <NavButton section="profile" label="Profile" icon={FileText} />
              <NavButton section="specializations" label="Services" icon={Award} />
              <NavButton section="hours" label="Hours" icon={Clock} />
              <NavButton section="languages" label="Languages" icon={Languages} />
              {isEditing ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-teal-50 hover:text-teal-700"
                  >
                    <X className="w-5 h-5" />
                    <span className="font-medium">Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={uploadLoading || !vetData?.isActive}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      uploadLoading || !vetData?.isActive ? "bg-gray-400" : "bg-teal-500 text-white hover:bg-teal-600"
                    }`}
                  >
                    {uploadLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    <span className="font-medium">{uploadLoading ? "Saving..." : "Save"}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => vetData?.isActive ? setIsEditing(true) : alert("Your account is deactivated. Editing is disabled.")}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-teal-50 hover:text-teal-700"
                >
                  <Edit className="w-5 h-5" />
                  <span className="font-medium">Edit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfileContent = () => {
    if (!vetData) return null;
    const details = vetData.veterinarianDetails || {};

    switch (activeSection) {
      case "profile":
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <ProfileSection icon={Stethoscope} title="Professional Details">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Professional Title</p>
                  <p className="text-lg font-semibold text-gray-800">{details.title || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Consultation Duration</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {details.averageConsultationDuration ? `${details.averageConsultationDuration} minutes` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Diplomas & Training</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {details.diplomasAndTraining || "N/A"}
                  </p>
                </div>
                {isEditing && (
                  <label className="block mt-4">
                    <p className="text-sm text-gray-500 mb-1">Add Clinic Photo</p>
                    <div className="relative">
                      <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600" disabled={!vetData?.isActive}>
                        Upload
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "clinicPhoto")}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadLoading || !vetData?.isActive}
                      />
                    </div>
                  </label>
                )}
                {clinicPhotos.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Clinic Photos</p>
                    <div className="flex flex-wrap gap-3">
                      {clinicPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={photo} 
                            alt={`Clinic Photo ${index + 1}`} 
                            className="w-32 h-32 rounded-md object-cover"
                          />
                          {isEditing && vetData?.isActive && (
                            <button
                              onClick={() => handleRemoveClinicPhoto(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ProfileSection>

            <ProfileSection icon={MapPin} title="Practice Location">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Governorate</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableData.governorate}
                      onChange={(e) => handleInputChange("governorate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 bg-gray-50 text-gray-800"
                      placeholder="Governorate"
                      disabled={!vetData?.isActive}
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-800">{editableData.governorate}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Delegation</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableData.delegation}
                      onChange={(e) => handleInputChange("delegation", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 bg-gray-50 text-gray-800"
                      placeholder="Delegation"
                      disabled={!vetData?.isActive}
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-800">{editableData.delegation}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contact</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableData.landlinePhone}
                      onChange={(e) => handleInputChange("landlinePhone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 bg-gray-50 text-gray-800"
                      placeholder="Landline Phone"
                      disabled={!vetData?.isActive}
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-800">{editableData.landlinePhone}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <a 
                    href={`https://www.google.com/maps?q=${details.geolocation?.latitude},${details.geolocation?.longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-teal-600 hover:underline flex items-center space-x-2"
                  >
                    <Globe className="w-5 h-5" />
                    <span>View on Map</span>
                  </a>
                </div>
              </div>
            </ProfileSection>
          </div>
        );
      
      case "specializations":
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <ProfileSection icon={Award} title="Specializations">
              <ul className="space-y-3">
                {details.specializations?.map((spec, index) => (
                  <li 
                    key={index} 
                    className="bg-teal-50 rounded-lg p-3 flex items-center space-x-3"
                  >
                    <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                    <span className="text-gray-800 font-medium">{spec.specializationName}</span>
                  </li>
                ))}
              </ul>
            </ProfileSection>

            <ProfileSection icon={DollarSign} title="Services">
              <ul className="space-y-3">
                {details.services?.map((service, index) => (
                  <li 
                    key={index} 
                    className="bg-emerald-50 rounded-lg p-3 flex justify-between items-center"
                  >
                    <span className="text-gray-800 font-medium">{service.serviceName}</span>
                    <span className="text-emerald-700 font-semibold">{service.fee} DT</span>
                  </li>
                ))}
              </ul>
            </ProfileSection>
          </div>
        );
      
      case "hours":
        return (
          <ProfileSection icon={Clock} title="Opening Hours">
            <div className="grid md:grid-cols-3 gap-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const schedule = details.openingHours?.[day];
                const startTime = details.openingHours?.[`${day}Start`];
                const endTime = details.openingHours?.[`${day}End`];
                const startTime2 = details.openingHours?.[`${day}Start2`];
                const endTime2 = details.openingHours?.[`${day}End2`];

                return (
                  <div 
                    key={day} 
                    className={`
                      p-4 rounded-lg 
                      ${schedule === "Closed" 
                        ? "bg-rose-50 text-rose-700" 
                        : "bg-emerald-50 text-emerald-900"
                      }
                    `}
                  >
                    <p className="font-bold capitalize mb-2">{day}</p>
                    <p className="text-sm">
                      {schedule === "Closed" ? "Closed" : (
                        schedule === "Single Session" 
                          ? `${startTime} - ${endTime}` 
                          : `First: ${startTime} - ${endTime}\nSecond: ${startTime2} - ${endTime2}`
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </ProfileSection>
        );
      
      case "languages":
        return (
          <ProfileSection icon={Languages} title="Languages">
            <div className="flex flex-wrap gap-3">
              {details.languagesSpoken?.map((lang, index) => (
                <span 
                  key={index} 
                  className="bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {lang}
                </span>
              ))}
            </div>
          </ProfileSection>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
        <span className="ml-4 text-lg font-medium text-gray-700">Loading your profile...</span>
      </div>
    );
  }

  if (error || !vetData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center p-8 text-gray-600 bg-white rounded-2xl mx-auto max-w-2xl shadow-lg border border-gray-100">
          <X className="w-8 h-8 text-teal-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-semibold mb-2">Profile Error</h2>
          <p>{error || "No veterinarian profile available"}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VetProfileHeader />
      <div className="max-w-6xl mx-auto p-8">
        {renderProfileContent()}
      </div>
    </div>
  );
};

export default MyProfile;