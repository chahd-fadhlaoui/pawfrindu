import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin, Phone, Award, Clock, Stethoscope,
  DollarSign, FileText, Mail, Globe, Languages,
  Upload, Trash2, Edit, Save, X, Loader2, AlertTriangle,
  CreditCard
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import MapViewer from "../../map/MapViewer";
import MapPicker from "../../map/MapPicker";
 
const DEFAULT_PROFILE_IMAGE = "/api/placeholder/250/250";
const DEFAULT_BUSINESS_CARD_IMAGE = "/api/placeholder/150/100";

const governorates = [
  "Ariana", "Beja", "Ben Arous", "Bizerte", "Gabes", "Gafsa", "Jendouba", "Kairouan", "Kasserine", "Kebili",
  "Kef", "Mahdia", "Manouba", "Medenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse",
  "Tataouine", "Tozeur", "Tunis", "Zaghouan",
];

const delegationsByGovernorate = {
  Ariana: ["Ariana Ville", "Ettadhamen", "Kalaat el-Andalous", "Mnihla", "Raoued", "Sidi Thabet", "Soukra"],
  Beja: ["Amdoun", "Béja Nord", "Béja Sud", "Goubellat", "Medjez el-Bab", "Nefza", "Téboursouk", "Testour", "Thibar"],
  "Ben Arous": ["Ben Arous", "El Mourouj", "Ezzahra", "Fouchana", "Hammam Lif", "Mohammedia", "Mornag"],
  Bizerte: ["Bizerte Nord", "Bizerte Sud", "Ghar El Melh", "Mateur", "Ras Jebel", "Sejnane", "Tinja"],
  Gabes: ["Gabès Médina", "Gabès Ouest", "Gabès Sud", "Ghannouch", "Mareth", "Matmata", "Métouia"],
  Gafsa: ["Gafsa Nord", "Gafsa Sud", "El Guettar", "El Ksar", "Redeyef", "Sened"],
  Jendouba: ["Jendouba", "Jendouba Nord", "Aïn Draham", "Fernana", "Ghardimaou", "Tabarka"],
  Kairouan: ["Kairouan Nord", "Kairouan Sud", "Chebika", "Haffouz", "Nasrallah", "Sbikha"],
  Kasserine: ["Kasserine Nord", "Kasserine Sud", "Fériana", "Sbeitla", "Thala", "Haidra"],
  Kebili: ["Kebili Nord", "Kebili Sud", "Douz Nord", "Douz Sud", "Souk Lahad"],
  Kef: ["Le Kef Est", "Le Kef Ouest", "Dahmani", "Nebeur", "Sakiet Sidi Youssef", "Tajerouine"],
  Mahdia: ["Mahdia", "Chebba", "El Jem", "Ksour Essaf", "Melloulèche", "Sidi Alouane"],
  Manouba: ["Manouba", "Den Den", "Douar Hicher", "Oued Ellil", "Tebourba"],
  Medenine: ["Medenine Nord", "Medenine Sud", "Ben Gardane", "Djerba Ajim", "Djerba Midoun", "Zarzis"],
  Monastir: ["Monastir", "Bekalta", "Jemmal", "Ksar Hellal", "Moknine", "Sayada-Lamta-Bou Hajar"],
  Nabeul: ["Nabeul", "Dar Chaabane El Fehri", "Hammamet", "Korba", "Menzel Temime", "Soliman"],
  Sfax: ["Sfax Ville", "Sfax Ouest", "Sakiet Ezzit", "Sakiet Eddaïer", "Thyna", "El Amra"],
  "Sidi Bouzid": ["Sidi Bouzid Est", "Sidi Bouzid Ouest", "Bir El Hafey", "Jelma", "Menzel Bouzaiane"],
  Siliana: ["Siliana Nord", "Siliana Sud", "Bargou", "Gaâfour", "Makthar"],
  Sousse: ["Sousse Médina", "Sousse Riadh", "Hammam Sousse", "Kalâa Kebira", "Msaken"],
  Tataouine: ["Tataouine Nord", "Tataouine Sud", "Bir Lahmar", "Ghomrassen", "Remada"],
  Tozeur: ["Tozeur", "Degache", "Nefta", "Tamerza"],
  Tunis: ["Tunis", "Carthage", "La Marsa", "Le Bardo", "Sidi Bou Saïd", "El Omrane"],
  Zaghouan: ["Zaghouan", "Bir Mcherga", "El Fahs", "Nadhour", "Zriba"],
};

// Composant pour gérer le champ fullName isolément
const FullNameInput = ({ value, onChange, disabled }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    onChange(localValue);
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 bg-gray-50 text-gray-800 font-extrabold text-2xl shadow-sm"
      placeholder="Your Name"
      disabled={disabled}
    />
  );
};

// Composant pour gérer le champ téléphone isolément
const PhoneInput = ({ value, onChange, disabled }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    onChange(localValue);
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      placeholder="Landline Phone"
      disabled={disabled}
    />
  );
};

// Composant pour gérer chaque service isolément
const ServiceInput = ({ service, index, onChange, onRemove, disabled }) => {
  const [localServiceName, setLocalServiceName] = useState(service.serviceName);
  const [localFee, setLocalFee] = useState(service.fee);

  useEffect(() => {
    setLocalServiceName(service.serviceName);
    setLocalFee(service.fee);
  }, [service]);

  const handleBlur = (field) => {
    onChange(index, field, field === "serviceName" ? localServiceName : localFee);
  };

  return (
    <div className="flex space-x-2 mb-2 items-center">
      <input
        type="text"
        value={localServiceName}
        onChange={(e) => setLocalServiceName(e.target.value)}
        onBlur={() => handleBlur("serviceName")}
        className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
        placeholder="Service Name"
        disabled={disabled}
      />
      <input
        type="number"
        value={localFee}
        onChange={(e) => setLocalFee(e.target.value)}
        onBlur={() => handleBlur("fee")}
        className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg"
        placeholder="Fee"
        min="0"
        disabled={disabled}
      />
      <button
        onClick={() => onRemove(index)}
        className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-400"
        disabled={disabled}
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

const MyProfile = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [vetData, setVetData] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({});
  const [tempImage, setTempImage] = useState(null);
  const [clinicPhotos, setClinicPhotos] = useState([]);
  const [businessCardImage, setBusinessCardImage] = useState(null);
  const [diplomasImage, setDiplomasImage] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVetProfile = async () => {
      if (!user?._id) {
        setError("Please log in to view your profile");
        setLoading(false);
        navigate("/login");
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
          title: vet.veterinarianDetails?.title || "Doctor",
          averageConsultationDuration: vet.veterinarianDetails?.averageConsultationDuration || 30,
          governorate: vet.veterinarianDetails?.governorate || "Tunis",
          delegation: vet.veterinarianDetails?.delegation || "",
          landlinePhone: vet.veterinarianDetails?.landlinePhone || "",
          services: vet.veterinarianDetails?.services || [],
          languagesSpoken: vet.veterinarianDetails?.languagesSpoken || ["Arabe"],
          openingHours: vet.veterinarianDetails?.openingHours || {
            monday: "Closed", tuesday: "Closed", wednesday: "Closed", thursday: "Closed",
            friday: "Closed", saturday: "Closed", sunday: "Closed",
          },
          geolocation: vet.veterinarianDetails?.geolocation || { latitude: 36.8665367, longitude: 10.1647233 },
        });
        setTempImage(vet.image || DEFAULT_PROFILE_IMAGE);
        setClinicPhotos(vet.veterinarianDetails?.clinicPhotos || []);
        setBusinessCardImage(vet.veterinarianDetails?.businessCardImage || DEFAULT_BUSINESS_CARD_IMAGE);
        setDiplomasImage(vet.veterinarianDetails?.diplomasAndTraining || null);
      } catch (err) {
        console.error("Error fetching vet profile:", err);
        setError(err.message || "Failed to load veterinarian profile");
      } finally {
        setLoading(false);
      }
    };
    fetchVetProfile();
  }, [user, navigate]);

  const handleInputChange = useCallback((field, value) => {
    setEditableData((prev) => {
      const updatedData = { ...prev, [field]: value };
      if (field === "governorate") {
        updatedData.delegation = "";
      }
      return updatedData;
    });
  }, []);

  const handleGeolocationChange = useCallback((field, value) => {
    setEditableData((prev) => ({
      ...prev,
      geolocation: { ...prev.geolocation, [field]: parseFloat(value) || prev.geolocation[field] },
    }));
  }, []);

  const handleServiceChange = useCallback((index, field, value) => {
    setEditableData((prev) => {
      const newServices = [...prev.services];
      newServices[index] = {
        ...newServices[index],
        [field]: field === "fee" ? parseFloat(value) || 0 : value,
      };
      return { ...prev, services: newServices };
    });
  }, []);

  const addService = useCallback(() => {
    setEditableData((prev) => ({
      ...prev,
      services: [...prev.services, { serviceName: "", fee: 0 }],
    }));
  }, []);

  const removeService = useCallback((index) => {
    setEditableData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  }, []);

  const handleOpeningHoursChange = useCallback((day, field, value) => {
    setEditableData((prev) => ({
      ...prev,
      openingHours: { ...prev.openingHours, [`${day}${field}`]: value },
    }));
  }, []);

  const handleImageUpload = async (e, type) => {
    if (!vetData?.isActive) {
      alert("Your account is deactivated. Image uploads are disabled.");
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) {
      console.log("No files selected for upload");
      return;
    }

    setUploadLoading(true);

    const uploadPromises = Array.from(files).map(async (file) => {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is not an image or exceeds 5MB.`);
        return null;
      }

      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      try {
        const response = await axiosInstance.post("/api/upload", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log(`${type} upload successful:`, response.data.url);
        return response.data.url;
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        return null;
      }
    });

    const urls = (await Promise.all(uploadPromises)).filter((url) => url);

    if (type === "profile") {
      setTempImage(urls[0] || tempImage);
    } else if (type === "businessCard") {
      setBusinessCardImage(urls[0] || businessCardImage);
    } else if (type === "clinicPhoto") {
      setClinicPhotos((prev) => [...prev, ...urls]);
    }

    setUploadLoading(false);
  };

  const handleRemoveClinicPhoto = useCallback((index) => {
    if (!vetData?.isActive) {
      alert("Your account is deactivated. You cannot remove photos.");
      return;
    }
    setClinicPhotos((prev) => prev.filter((_, i) => i !== index));
  }, [vetData]);

  const handleSaveChanges = async () => {
    if (!vetData?.isActive) {
      alert("Your account is deactivated. You cannot save changes.");
      return;
    }
    try {
      setUploadLoading(true);

      const updatedData = {
        userId: vetData._id,
        fullName: editableData.fullName || vetData.fullName,
        image: tempImage !== DEFAULT_PROFILE_IMAGE ? tempImage : vetData.image,
        veterinarianDetails: {
          title: editableData.title,
          averageConsultationDuration: parseInt(editableData.averageConsultationDuration) || null,
          governorate: editableData.governorate || null,
          delegation: editableData.delegation || null,
          landlinePhone: editableData.landlinePhone || null,
          services: editableData.services,
          languagesSpoken: editableData.languagesSpoken,
          openingHours: editableData.openingHours,
          geolocation: editableData.geolocation,
          clinicPhotos,
          businessCardImage: businessCardImage !== DEFAULT_BUSINESS_CARD_IMAGE ? businessCardImage : null,
        },
      };

      await axiosInstance.put("/api/user/updateVetProfile", updatedData);
      const response = await axiosInstance.get("/api/user/me");
      const updatedVet = response.data.user;
      setVetData(updatedVet);
      setTempImage(updatedVet.image || DEFAULT_PROFILE_IMAGE);
      setClinicPhotos(updatedVet.veterinarianDetails?.clinicPhotos || []);
      setBusinessCardImage(updatedVet.veterinarianDetails?.businessCardImage || DEFAULT_BUSINESS_CARD_IMAGE);
      setDiplomasImage(updatedVet.veterinarianDetails?.diplomasAndTraining || null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error.response?.data || error.message);
      alert(`Error saving profile: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCancelEdit = useCallback(() => {
    if (vetData) {
      const vetDetails = vetData.veterinarianDetails || {};
      setEditableData({
        fullName: vetData.fullName || "",
        title: vetDetails.title || "Doctor",
        averageConsultationDuration: vetDetails.averageConsultationDuration || 30,
        governorate: vetDetails.governorate || "Tunis",
        delegation: vetDetails.delegation || "",
        landlinePhone: vetDetails.landlinePhone || "",
        services: vetDetails.services || [],
        languagesSpoken: vetDetails.languagesSpoken || ["Arabe"],
        openingHours: vetDetails.openingHours || {
          monday: "Closed", tuesday: "Closed", wednesday: "Closed", thursday: "Closed",
          friday: "Closed", saturday: "Closed", sunday: "Closed",
        },
        geolocation: vetDetails.geolocation || { latitude: 36.8665367, longitude: 10.1647233 },
      });
      setTempImage(vetData.image || DEFAULT_PROFILE_IMAGE);
      setClinicPhotos(vetDetails.clinicPhotos || []);
      setBusinessCardImage(vetDetails.businessCardImage || DEFAULT_BUSINESS_CARD_IMAGE);
      setDiplomasImage(vetDetails.diplomasAndTraining || null);
    }
    setIsEditing(false);
  }, [vetData]);

  const NavButton = React.memo(({ section, label, icon: Icon }) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all 
        ${activeSection === section ? "bg-teal-500 text-white shadow-md" : "text-gray-600 hover:bg-teal-50 hover:text-teal-700"}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  ));

  const ProfileSection = React.memo(({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center space-x-4 mb-6 border-b pb-4 border-gray-100">
        <Icon className="w-8 h-8 text-teal-600" />
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  ));

  const VetProfileHeader = () => {
    const { fullName } = editableData;
  
    return (
      <div className="bg-white shadow-md border-b border-gray-100">
        {/* Alerte pour compte désactivé */}
        {!vetData?.isActive && (
          <div className="bg-red-100 p-3 flex items-center gap-2 border-b border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700 font-medium">
              Your account is deactivated. Editing is disabled until reactivated by an admin.
            </p>
          </div>
        )}
        
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Section principale */}
          <div className="flex items-start">
            {/* Colonne gauche: Photo */}
            <div className="mr-6">
              {isEditing && vetData?.isActive ? (
                <label className="relative block group">
                  <img
                    src={tempImage}
                    alt={fullName}
                    className="w-32 h-32 rounded-lg object-cover shadow-md border-2 border-white"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "profile")}
                    className="hidden"
                    disabled={uploadLoading}
                  />
                  {uploadLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                      <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                    </div>
                  )}
                </label>
              ) : (
                <img
                  src={tempImage}
                  alt={fullName}
                  className="w-32 h-32 rounded-lg object-cover shadow-md border-2 border-white"
                />
              )}
            </div>
  
            {/* Colonne centrale: Informations */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                {/* Nom et email */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {isEditing ? (
                      <FullNameInput
                        value={editableData.fullName}
                        onChange={(value) => handleInputChange("fullName", value)}
                        disabled={!vetData?.isActive}
                      />
                    ) : (
                      fullName || "Veterinarian"
                    )}
                  </h1>
                  <p className="text-gray-600 flex items-center space-x-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{vetData.email || "N/A"}</span>
                  </p>
                </div>
                
                {/* Carte de visite - format compact */}
                <div className="mt-4 md:mt-0 flex items-center">
                  <div className="mr-3">
                    <p className="text-xs text-gray-500 font-medium mb-1">Business Card</p>
                    {isEditing && vetData?.isActive ? (
                      <label className="relative inline-block cursor-pointer">
                        {businessCardImage !== DEFAULT_BUSINESS_CARD_IMAGE ? (
                          <img
                            src={businessCardImage}
                            alt="Business Card"
                            className="h-16 w-28 rounded object-cover shadow-sm border border-gray-200"
                          />
                        ) : (
                          <div className="h-16 w-28 rounded bg-gray-50 border border-gray-200 flex items-center justify-center">
                            <Upload className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "businessCard")}
                          className="hidden"
                          disabled={uploadLoading}
                        />
                        {uploadLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded">
                            <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                          </div>
                        )}
                      </label>
                    ) : (
                      businessCardImage !== DEFAULT_BUSINESS_CARD_IMAGE && (
                        <img
                          src={businessCardImage}
                          alt="Business Card"
                          className="h-16 w-28 rounded object-cover shadow-sm border border-gray-200"
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
  
              {/* Navigation et boutons */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <NavButton section="profile" label="Profile" icon={FileText} />
                  <NavButton section="specializations" label="Services" icon={Award} />
                  <NavButton section="hours" label="Hours" icon={Clock} />
                  <NavButton section="languages" label="Languages" icon={Languages} />
                </div>
                
                <div className="flex">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center px-3 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100"
                      >
                        <X className="w-4 h-4 mr-1" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSaveChanges}
                        disabled={uploadLoading || !vetData?.isActive}
                        className={`flex items-center px-3 py-1.5 rounded text-sm ${
                          uploadLoading || !vetData?.isActive ? "bg-gray-300" : "bg-teal-500 text-white hover:bg-teal-600"
                        }`}
                      >
                        {uploadLoading ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-1" />
                        )}
                        <span>{uploadLoading ? "Saving" : "Save"}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => vetData?.isActive ? setIsEditing(true) : alert("Your account is deactivated. Editing is disabled.")}
                      className="flex items-center px-3 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderProfileContent = () => {
    if (!vetData) return null;

    switch (activeSection) {
      case "profile":
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <ProfileSection icon={Stethoscope} title="Professional Details">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Professional Title</p>
                  {isEditing ? (
                    <select
                      value={editableData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={!vetData?.isActive}
                    >
                      <option value="Doctor">Doctor</option>
                      <option value="Professor">Professor</option>
                    </select>
                  ) : (
                    <p className="text-lg font-semibold text-gray-800">{editableData.title}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Consultation Duration (minutes)</p>
                  {isEditing ? (
                    <select
                      value={editableData.averageConsultationDuration}
                      onChange={(e) => handleInputChange("averageConsultationDuration", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={!vetData?.isActive}
                    >
                      {[10, 15, 20, 25, 30, 45, 50, 55, 60].map((val) => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-lg font-semibold text-gray-800">{editableData.averageConsultationDuration || "N/A"}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Diplomas & Training</p>
                  {diplomasImage ? (
                    <img
                      src={diplomasImage}
                      alt="Diplomas"
                      className="w-32 h-32 rounded-md object-cover shadow-md border-2 border-white"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-800">No diploma photo uploaded</p>
                  )}
                </div>
                {isEditing && (
                  <label className="block mt-4">
                    <p className="text-sm text-gray-500 mb-1">Add Clinic Photo</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "clinicPhoto")}
                      className="block"
                      disabled={uploadLoading || !vetData?.isActive}
                    />
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
                    <select
                      value={editableData.governorate}
                      onChange={(e) => handleInputChange("governorate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={!vetData?.isActive}
                    >
                      {governorates.map((gov) => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-lg font-semibold text-gray-800">{editableData.governorate}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Delegation</p>
                  {isEditing ? (
                    <select
                      value={editableData.delegation}
                      onChange={(e) => handleInputChange("delegation", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={!vetData?.isActive}
                    >
                      <option value="">Select Delegation</option>
                      {(delegationsByGovernorate[editableData.governorate] || []).map((delegation) => (
                        <option key={delegation} value={delegation}>{delegation}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-lg font-semibold text-gray-800">{editableData.delegation || "N/A"}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Landline Phone</p>
                  {isEditing ? (
                    <PhoneInput
                      value={editableData.landlinePhone}
                      onChange={(value) => handleInputChange("landlinePhone", value)}
                      disabled={!vetData?.isActive}
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-800">{editableData.landlinePhone || "N/A"}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Clinic Location</p>
                  {isEditing && vetData?.isActive ? (
                    <div>
                      <MapPicker
                        position={editableData.geolocation}
                        setPosition={(newPos) => handleInputChange("geolocation", newPos)}
                      />
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-sm text-gray-500">Latitude</label>
                          <input
                            type="number"
                            value={editableData.geolocation.latitude}
                            onChange={(e) => handleGeolocationChange("latitude", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            step="any"
                            min="-90"
                            max="90"
                            disabled={!vetData?.isActive || uploadLoading}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Longitude</label>
                          <input
                            type="number"
                            value={editableData.geolocation.longitude}
                            onChange={(e) => handleGeolocationChange("longitude", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            step="any"
                            min="-180"
                            max="180"
                            disabled={!vetData?.isActive || uploadLoading}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <MapViewer position={editableData.geolocation} />
                      <a
                        href={`https://www.google.com/maps?q=${editableData.geolocation.latitude},${editableData.geolocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-lg font-semibold text-teal-600 hover:underline flex items-center space-x-2"
                      >
                        <Globe className="w-5 h-5" />
                        <span>  </span>
                      </a>
                    </div>
                  )}
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
                {vetData.veterinarianDetails?.specializations?.map((spec, index) => (
                  <li key={index} className="bg-teal-50 rounded-lg p-3">{spec.specializationName}</li>
                )) || <p>No specializations available</p>}
              </ul>
            </ProfileSection>

            <ProfileSection icon={DollarSign} title="Services">
              {isEditing ? (
                <div>
                  {editableData.services.map((service, index) => (
                    <ServiceInput
                      key={index}
                      service={service}
                      index={index}
                      onChange={handleServiceChange}
                      onRemove={removeService}
                      disabled={!vetData?.isActive}
                    />
                  ))}
                  <button
                    onClick={addService}
                    className="mt-2 px-4 py-2 bg-teal-500 text-white rounded-lg"
                    disabled={!vetData?.isActive}
                  >
                    Add Service
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {editableData.services.map((service, index) => (
                    <li key={index} className="bg-emerald-50 rounded-lg p-3 flex justify-between items-center">
                      <span className="text-gray-800 font-medium">{service.serviceName}</span>
                      <span className="text-emerald-700 font-semibold">{service.fee} DT</span>
                    </li>
                  ))}
                </ul>
              )}
            </ProfileSection>
          </div>
        );

      case "hours":
        return (
          <ProfileSection icon={Clock} title="Opening Hours">
            <div className="grid md:grid-cols-3 gap-4">
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                const schedule = editableData.openingHours[day] || "Closed";
                return (
                  <div key={day} className={`p-4 rounded-lg ${schedule === "Closed" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-900"}`}>
                    <p className="font-bold capitalize mb-2">{day}</p>
                    {isEditing ? (
                      <div>
                        <select
                          value={schedule}
                          onChange={(e) => handleOpeningHoursChange(day, "", e.target.value)}
                          className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg"
                          disabled={!vetData?.isActive}
                        >
                          <option value="Closed">Closed</option>
                          <option value="Single Session">Single Session</option>
                          <option value="Double Session">Double Session</option>
                        </select>
                        {schedule !== "Closed" && (
                          <>
                            <input
                              type="time"
                              value={editableData.openingHours[`${day}Start`] || ""}
                              onChange={(e) => handleOpeningHoursChange(day, "Start", e.target.value)}
                              className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg"
                              disabled={!vetData?.isActive}
                            />
                            <input
                              type="time"
                              value={editableData.openingHours[`${day}End`] || ""}
                              onChange={(e) => handleOpeningHoursChange(day, "End", e.target.value)}
                              className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg"
                              disabled={!vetData?.isActive}
                            />
                            {schedule === "Double Session" && (
                              <>
                                <input
                                  type="time"
                                  value={editableData.openingHours[`${day}Start2`] || ""}
                                  onChange={(e) => handleOpeningHoursChange(day, "Start2", e.target.value)}
                                  className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg"
                                  disabled={!vetData?.isActive}
                                />
                                <input
                                  type="time"
                                  value={editableData.openingHours[`${day}End2`] || ""}
                                  onChange={(e) => handleOpeningHoursChange(day, "End2", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  disabled={!vetData?.isActive}
                                />
                              </>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm">
                        {schedule === "Closed" ? "Closed" : (
                          schedule === "Single Session"
                            ? `${editableData.openingHours[`${day}Start`] || "N/A"} - ${editableData.openingHours[`${day}End`] || "N/A"}`
                            : `First: ${editableData.openingHours[`${day}Start`] || "N/A"} - ${editableData.openingHours[`${day}End`] || "N/A"}\nSecond: ${editableData.openingHours[`${day}Start2`] || "N/A"} - ${editableData.openingHours[`${day}End2`] || "N/A"}`
                        )}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </ProfileSection>
        );

      case "languages":
        return (
          <ProfileSection icon={Languages} title="Languages">
            {isEditing ? (
              <div className="space-y-2">
                {["Français", "Anglais", "Arabe"].map((lang) => (
                  <label key={lang} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editableData.languagesSpoken.includes(lang)}
                      onChange={(e) => {
                        const newLanguages = e.target.checked
                          ? [...editableData.languagesSpoken, lang]
                          : editableData.languagesSpoken.filter((l) => l !== lang);
                        handleInputChange("languagesSpoken", newLanguages);
                      }}
                      disabled={!vetData?.isActive}
                    />
                    <span>{lang}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {editableData.languagesSpoken.map((lang, index) => (
                  <span key={index} className="bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-sm font-medium">
                    {lang}
                  </span>
                ))}
              </div>
            )}
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