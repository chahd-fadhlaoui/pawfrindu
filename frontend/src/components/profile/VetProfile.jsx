import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const VetProfile = ({
  formData,
  setFormData,
  formErrors,
  setFormErrors,
  currentStep,
  setCurrentStep,
  totalSteps,
  userRole,
  createProfile,
  clearError,
  navigate,
  loading,
}) => {
  const defaultImageUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNMTYwIDE4MEgzOUM0MSAxNDAgODAgMTIwIDEwMCAxMjBDMTIwIDEyMCAxNTggMTQwIDE2MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg=="; // Shortened for brevity
  const [expandedSections, setExpandedSections] = useState({
    contact: true,
    professional: true,
    services: true,
    schedule: true,
  });

  const governorates = [
    "Ariana", "Beja", "Ben Arous", "Bizerte", "Gabes", "Gafsa", "Jendouba", "Kairouan", "Kasserine", "Kebili",
    "Kef", "Mahdia", "Manouba", "Medenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse",
    "Tataouine", "Tozeur", "Tunis", "Zaghouan",
  ];

  const delegationsByGovernorate = {
    Ariana: ["Ariana Ville", "Ettadhamen", "Kalaat el-Andalous", "Mnihla", "Raoued", "Sidi Thabet", "Soukra"],
    Beja: ["Amdoun", "Béja Nord", "Béja Sud", "Goubellat", "Medjez el-Bab", "Nefza", "Téboursouk", "Testour", "Thibar"],
    "Ben Arous": ["Ben Arous", "Boumhel el-Bassatine", "El Mourouj", "Ezzahra", "Fouchana", "Hammam Chatt", "Hammam Lif", "M'Hamdia", "Medina Jedida", "Mégrine", "Mornag", "Radès"],
    Bizerte: ["Bizerte Nord", "Bizerte Sud", "El Alia", "Ghar El Melh", "Ghezala", "Joumine", "Mateur", "Menzel Bourguiba", "Menzel Jemil", "Ras Jebel", "Sejnane", "Tinja", "Utique", "Zarzouna"],
    Gabes: ["El Hamma", "Gabès Médina", "Gabès Ouest", "Gabès Sud", "Ghannouch", "Mareth", "Matmata", "Menzel El Habib", "Nouvelle Matmata"],
    Gafsa: ["Belkhir", "El Guettar", "El Ksar", "Gafsa Nord", "Gafsa Sud", "Mdhilla", "Metlaoui", "Moularès", "Redeyef", "Sened", "Sidi Aïch"],
    Jendouba: ["Ain Draham", "Balta-Bou Aouane", "Bou Salem", "Fernana", "Ghardimaou", "Jendouba", "Jendouba Nord", "Oued Meliz", "Tabarka"],
    Kairouan: ["Bou Hajla", "Chebika", "Chrarda", "Hajeb El Ayoun", "Haffouz", "Kairouan Nord", "Kairouan Sud", "Nasrallah", "Oueslatia", "Sbikha"],
    Kasserine: ["Ayoun", "Ezzouhour", "Feriana", "Foussana", "Haïdra", "Hassi El Ferid", "Jedelienne", "Kasserine Nord", "Kasserine Sud", "Majel Bel Abbès", "Sbeïtla", "Sbiba", "Thala"],
    Kebili: ["Douz Nord", "Douz Sud", "Faouar", "Kébili Nord", "Kébili Sud", "Souk El Ahed"],
    Kef: ["Dahmani", "Djellabine", "El Ksour", "Jerissa", "Kalaat Senan", "Kalaat Khasba", "Kef Est", "Kef Ouest", "Nebeur", "Sakiet Sidi Youssef", "Sers", "Tajerouine"],
    Mahdia: ["Bou Merdes", "Chorbane", "Chebba", "El Jem", "Hbira", "Ksour Essef", "Mahdia", "Melloulech", "Ouled Chamekh", "Sidi Alouane", "Souassi"],
    Manouba: ["Borj El Amri", "Douar Hicher", "El Batan", "Jedaida", "Manouba", "Mornaguia", "Oued Ellil", "Tebourba"],
    Medenine: ["Ben Gardane", "Beni Khedache", "Djerba Ajim", "Djerba Houmt Souk", "Djerba Midoun", "Médenine Nord", "Médenine Sud", "Sidi Makhlouf", "Zarzis"],
    Monastir: ["Bekalta", "Bembla", "Beni Hassen", "Jemmal", "Ksar Hellal", "Ksibet el-Médiouni", "Menzel Ennour", "Menzel Fersi", "Monastir", "Ouardanine", "Sahline", "Sayada-Lamta-Bou Hajar", "Zeramdine"],
    Nabeul: ["Beni Khalled", "Beni Khiar", "Bou Argoub", "Dar Chaabane El Fehri", "El Haouaria", "Grombalia", "Hammam Ghezaz", "Hammamet", "Kelibia", "Korba", "Menzel Bouzelfa", "Menzel Temime", "Nabeul", "Soliman", "Takelsa"],
    Sfax: ["Agareb", "Bir Ali Ben Khalifa", "El Amra", "El Ghraiba", "El Hencha", "Jebiniana", "Kerkennah", "Mahrès", "Menzel Chaker", "Sakiet Eddaïer", "Sakiet Ezzit", "Sfax Médina", "Sfax Ouest", "Sfax Sud", "Skhira"],
    "Sidi Bouzid": ["Bir El Hafey", "Cebbala Ouled Asker", "Jelma", "Mazzouna", "Meknassy", "Menzel Bouzaiane", "Ouled Haffouz", "Regueb", "Sidi Ali Ben Aoun", "Sidi Bouzid Est", "Sidi Bouzid Ouest", "Souk Jedid"],
    Siliana: ["Bargou", "Bou Arada", "El Aroussa", "El Krib", "Gaâfour", "Kesra", "Makthar", "Rouhia", "Siliana Nord", "Siliana Sud"],
    Sousse: ["Akouda", "Bouficha", "Enfidha", "Hammam Sousse", "Hergla", "Kalâa Kebira", "Kalâa Seghira", "Kondar", "M'saken", "Sidi Bou Ali", "Sidi El Hani", "Sousse Jawhara", "Sousse Médina", "Sousse Riadh", "Sousse Sidi Abdelhamid"],
    Tataouine: ["Bir Lahmar", "Dehiba", "Ghomrassen", "Remada", "Smar", "Tataouine Nord", "Tataouine Sud"],
    Tozeur: ["Degache", "Hazoua", "Nefta", "Tamaghza", "Tozeur"],
    Tunis: ["Bab Bhar", "Bab Souika", "Cité El Khadra", "Djebel Jelloud", "El Kabaria", "El Menzah", "El Omrane", "El Omrane Supérieur", "El Ouardia", "Ettahrir", "Ezzouhour", "Hraïria", "La Goulette", "La Marsa", "Le Bardo", "Le Kram", "Médina", "Séjoumi", "Sidi El Béchir", "Sidi Hassine"],
    Zaghouan: ["Bir Mchergua", "El Fahs", "Nadhour", "Saouaf", "Zaghouan", "Zriba"],
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;

    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      const response = await axiosInstance.post("/api/upload", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.url) {
        if (field === "profile") {
          setFormData((prev) => ({ ...prev, image: response.data.url }));
        } else {
          setFormData((prev) => ({
            ...prev,
            veterinarianDetails: { ...prev.veterinarianDetails, [field]: response.data.url },
          }));
        }
      }
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.some((file) => file.size > 5 * 1024 * 1024)) return;

    try {
      const uploadPromises = files.map((file) => {
        const uploadFormData = new FormData();
        uploadFormData.append("image", file);
        return axiosInstance.post("/api/upload", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      });
      const responses = await Promise.all(uploadPromises);
      const newPhotos = responses.map((res) => res.data.url);
      setFormData((prev) => ({
        ...prev,
        veterinarianDetails: {
          ...prev.veterinarianDetails,
          clinicPhotos: [...prev.veterinarianDetails.clinicPhotos, ...newPhotos],
        },
      }));
    } catch (error) {
      console.error("Multiple image upload failed:", error);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => {
      if (section === "root") return { ...prev, [field]: value };
      if (section === "veterinarianDetails" && field === "openingHours") {
        return {
          ...prev,
          veterinarianDetails: {
            ...prev.veterinarianDetails,
            openingHours: { ...prev.veterinarianDetails.openingHours, [value.day]: value.value },
          },
        };
      }
      if (section === "veterinarianDetails" && field === "governorate") {
        // Reset delegation when governorate changes
        return {
          ...prev,
          veterinarianDetails: {
            ...prev.veterinarianDetails,
            [field]: value,
            delegation: "", // Reset delegation when governorate changes
          },
        };
      }
      return { ...prev, [section]: { ...prev[section], [field]: value } };
    });
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleServiceChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedServices = [...prev.veterinarianDetails.services];
      updatedServices[index] = { ...updatedServices[index], [field]: value };
      return {
        ...prev,
        veterinarianDetails: { ...prev.veterinarianDetails, services: updatedServices },
      };
    });
  };

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      veterinarianDetails: {
        ...prev.veterinarianDetails,
        services: [...prev.veterinarianDetails.services, { serviceName: "", fee: "" }],
      },
    }));
  };

  const removeService = (index) => {
    setFormData((prev) => ({
      ...prev,
      veterinarianDetails: {
        ...prev.veterinarianDetails,
        services: prev.veterinarianDetails.services.filter((_, i) => i !== index),
      },
    }));
  };

  const handleLanguageChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const languages = checked
        ? [...prev.veterinarianDetails.languagesSpoken, value]
        : prev.veterinarianDetails.languagesSpoken.filter((lang) => lang !== value);
      return {
        ...prev,
        veterinarianDetails: { ...prev.veterinarianDetails, languagesSpoken: languages },
      };
    });
  };

  const validateCurrentStep = () => {
    const errors = {};
    if (currentStep === 1) {
      if (!formData.gender) errors.gender = "Gender is required";
      if (!formData.image) errors.image = "Profile image is required";
    } else if (currentStep === 2) {
      if (!formData.veterinarianDetails.location) errors.location = "Location is required";
      if (!formData.veterinarianDetails.governorate) errors.governorate = "Governorate is required";
    } else if (currentStep === 3) {
      if (!formData.veterinarianDetails.title) errors.title = "Title is required";
      if (!formData.veterinarianDetails.degree) errors.degree = "Degree is required";
    } else if (currentStep === 5) {
      if (!formData.veterinarianDetails.diplomasAndTraining) errors.diplomasAndTraining = "Diploma is required";
      if (formData.veterinarianDetails.clinicPhotos.length === 0) errors.clinicPhotos = "At least one clinic photo is required";
    }
    return errors;
  };

  const nextStep = () => {
    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      if (currentStep !== 5) setCurrentStep(5);
      return;
    }

    try {
      const profileDetails = {
        image: formData.image,
        gender: formData.gender,
        veterinarianDetails: formData.veterinarianDetails,
      };
      const result = await createProfile(profileDetails);
      if (result.success) navigate(result.redirectTo, { replace: true });
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-gray-900">Basic Information</h3>
      <div className="flex flex-col items-center justify-center">
        <img
          src={formData.image || defaultImageUrl}
          alt="Profile preview"
          className="object-cover w-32 h-32 rounded-full border-2 border-[#ffc929] mb-4"
        />
        <label className="px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-lg hover:bg-[#e6b625] cursor-pointer">
          Upload Profile Photo
          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "profile")} />
        </label>
        {formErrors.image && <p className="text-sm text-red-500">{formErrors.image}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
        <select
          value={formData.gender}
          onChange={(e) => handleInputChange("root", "gender", e.target.value)}
          className={`w-full px-4 py-3 text-sm border rounded-lg ${formErrors.gender ? "border-red-500" : "border-gray-300"}`}
        >
          <option value="" disabled>Select Gender</option>
          <option value="Femme">Femme</option>
          <option value="Homme">Homme</option>
        </select>
        {formErrors.gender && <p className="text-sm text-red-500">{formErrors.gender}</p>}
      </div>
    </div>
  );

  const renderVetContactInfo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-gray-900">Contact Information</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Location <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.veterinarianDetails.location}
            onChange={(e) => handleInputChange("veterinarianDetails", "location", e.target.value)}
            className={`w-full px-4 py-3 text-sm border rounded-lg ${formErrors.location ? "border-red-500" : "border-gray-300"}`}
          />
          {formErrors.location && <p className="text-sm text-red-500">{formErrors.location}</p>}
        </div>
        <div className="border-b pb-2">
          <button
            type="button"
            onClick={() => setExpandedSections((prev) => ({ ...prev, contact: !prev.contact }))}
            className="w-full flex justify-between items-center text-lg font-semibold text-gray-900"
          >
            Additional Contact Details
            <svg
              className={`w-5 h-5 transform ${expandedSections.contact ? "rotate-180" : "rotate-0"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          {expandedSections.contact && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Governorate <span className="text-red-500">*</span></label>
                <select
                  value={formData.veterinarianDetails.governorate}
                  onChange={(e) => handleInputChange("veterinarianDetails", "governorate", e.target.value)}
                  className={`w-full px-4 py-3 text-sm border rounded-lg ${formErrors.governorate ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="" disabled>Select Governorate</option>
                  {governorates.map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
                {formErrors.governorate && <p className="text-sm text-red-500">{formErrors.governorate}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Delegation</label>
                <select
                  value={formData.veterinarianDetails.delegation}
                  onChange={(e) => handleInputChange("veterinarianDetails", "delegation", e.target.value)}
                  className="w-full px-4 py-3 text-sm border rounded-lg border-gray-300"
                  disabled={!formData.veterinarianDetails.governorate}
                >
                  <option value="" disabled>Select Delegation</option>
                  {formData.veterinarianDetails.governorate &&
                    delegationsByGovernorate[formData.veterinarianDetails.governorate]?.map((delegation) => (
                      <option key={delegation} value={delegation}>{delegation}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Landline Phone</label>
                <input
                  type="tel"
                  value={formData.veterinarianDetails.landlinePhone}
                  onChange={(e) => handleInputChange("veterinarianDetails", "landlinePhone", e.target.value)}
                  className="w-full px-4 py-3 text-sm border rounded-lg border-gray-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Latitude</label>
                  <input
                    type="number"
                    value={formData.veterinarianDetails.geolocation.latitude}
                    onChange={(e) =>
                      handleInputChange("veterinarianDetails", "geolocation", {
                        ...formData.veterinarianDetails.geolocation,
                        latitude: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 text-sm border rounded-lg border-gray-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Longitude</label>
                  <input
                    type="number"
                    value={formData.veterinarianDetails.geolocation.longitude}
                    onChange={(e) =>
                      handleInputChange("veterinarianDetails", "geolocation", {
                        ...formData.veterinarianDetails.geolocation,
                        longitude: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 text-sm border rounded-lg border-gray-300"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVetProfessionalInfo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-gray-900">Professional Information</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
          <select
            value={formData.veterinarianDetails.title}
            onChange={(e) => handleInputChange("veterinarianDetails", "title", e.target.value)}
            className={`w-full px-4 py-3 text-sm border rounded-lg ${formErrors.title ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="" disabled>Select Title</option>
            <option value="Doctor">Doctor</option>
            <option value="Professor">Professor</option>
          </select>
          {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Degree <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.veterinarianDetails.degree}
            onChange={(e) => handleInputChange("veterinarianDetails", "degree", e.target.value)}
            className={`w-full px-4 py-3 text-sm border rounded-lg ${formErrors.degree ? "border-red-500" : "border-gray-300"}`}
          />
          {formErrors.degree && <p className="text-sm text-red-500">{formErrors.degree}</p>}
        </div>
        <div className="border-b pb-2">
          <button
            type="button"
            onClick={() => setExpandedSections((prev) => ({ ...prev, professional: !prev.professional }))}
            className="w-full flex justify-between items-center text-lg font-semibold text-gray-900"
          >
            Additional Professional Details
            <svg
              className={`w-5 h-5 transform ${expandedSections.professional ? "rotate-180" : "rotate-0"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          {expandedSections.professional && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Specialization</label>
                <input
                  type="text"
                  value={formData.veterinarianDetails.specialization}
                  onChange={(e) => handleInputChange("veterinarianDetails", "specialization", e.target.value)}
                  className="w-full px-4 py-3 text-sm border rounded-lg border-gray-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Languages Spoken</label>
                {["Français", "Anglais", "Arabe"].map((lang) => (
                  <div key={lang} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={lang}
                      checked={formData.veterinarianDetails.languagesSpoken.includes(lang)}
                      onChange={handleLanguageChange}
                    />
                    <label>{lang}</label>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Average Consultation Duration</label>
                <select
                  value={formData.veterinarianDetails.averageConsultationDuration}
                  onChange={(e) => handleInputChange("veterinarianDetails", "averageConsultationDuration", e.target.value)}
                  className="w-full px-4 py-3 text-sm border rounded-lg border-gray-300"
                >
                  <option value="" disabled>Select Duration</option>
                  {[10, 15, 20, 25, 30, 45, 50, 55, 60].map((dur) => (
                    <option key={dur} value={dur}>{dur} mins</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVetServicesAndSchedule = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-gray-900">Services & Schedule</h3>
      <div className="border-b pb-2">
        <button
          type="button"
          onClick={() => setExpandedSections((prev) => ({ ...prev, services: !prev.services }))}
          className="w-full flex justify-between items-center text-lg font-semibold text-gray-900"
        >
          Services Offered
          <svg
            className={`w-5 h-5 transform ${expandedSections.services ? "rotate-180" : "rotate-0"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        {expandedSections.services && (
          <div className="space-y-4 mt-4">
            {formData.veterinarianDetails.services.map((service, index) => (
              <div key={index} className="border p-4 rounded-lg relative">
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="absolute top-2 right-2 text-red-500"
                >
                  X
                </button>
                <div>
                  <label className="text-sm font-medium text-gray-700">Service Name</label>
                  <input
                    type="text"
                    value={service.serviceName}
                    onChange={(e) => handleServiceChange(index, "serviceName", e.target.value)}
                    className="w-full px-4 py-3 text-sm border rounded-lg border-gray-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Fee (in TND)</label>
                  <input
                    type="number"
                    value={service.fee}
                    onChange={(e) => handleServiceChange(index, "fee", e.target.value)}
                    className="w-full px-4 py-3 text-sm border rounded-lg border-gray-300"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addService}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-lg hover:bg-[#e6b625]"
            >
              Add Another Service
            </button>
          </div>
        )}
      </div>
      <div className="border-b pb-2">
        <button
          type="button"
          onClick={() => setExpandedSections((prev) => ({ ...prev, schedule: !prev.schedule }))}
          className="w-full flex justify-between items-center text-lg font-semibold text-gray-900"
        >
          Clinic Schedule
          <svg
            className={`w-5 h-5 transform ${expandedSections.schedule ? "rotate-180" : "rotate-0"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        {expandedSections.schedule && (
          <div className="space-y-4 mt-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Day</th>
                  <th className="border p-2 text-left">Schedule Type</th>
                  <th className="border p-2 text-left">Start</th>
                  <th className="border p-2 text-left">End</th>
                  <th className="border p-2 text-left">Start 2</th>
                  <th className="border p-2 text-left">End 2</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(formData.veterinarianDetails.openingHours)
                  .filter((key) => key.match(/^[a-z]+$/))
                  .map((day) => (
                    <tr key={day} className="border-t">
                      <td className="border p-2 capitalize">{day}</td>
                      <td className="border p-2">
                        <select
                          value={formData.veterinarianDetails.openingHours[day]}
                          onChange={(e) => handleInputChange("veterinarianDetails", "openingHours", { day, value: e.target.value })}
                          className="w-full p-1 border rounded"
                        >
                          <option value="Closed">Closed</option>
                          <option value="Single Session">Single Session</option>
                          <option value="Double Session">Double Session</option>
                        </select>
                      </td>
                      <td className="border p-2">
                        <input
                          type="time"
                          value={formData.veterinarianDetails.openingHours[`${day}Start`]}
                          onChange={(e) => handleInputChange("veterinarianDetails", "openingHours", { day: `${day}Start`, value: e.target.value })}
                          disabled={formData.veterinarianDetails.openingHours[day] === "Closed"}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="time"
                          value={formData.veterinarianDetails.openingHours[`${day}End`]}
                          onChange={(e) => handleInputChange("veterinarianDetails", "openingHours", { day: `${day}End`, value: e.target.value })}
                          disabled={formData.veterinarianDetails.openingHours[day] === "Closed"}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="time"
                          value={formData.veterinarianDetails.openingHours[`${day}Start2`]}
                          onChange={(e) => handleInputChange("veterinarianDetails", "openingHours", { day: `${day}Start2`, value: e.target.value })}
                          disabled={formData.veterinarianDetails.openingHours[day] !== "Double Session"}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="time"
                          value={formData.veterinarianDetails.openingHours[`${day}End2`]}
                          onChange={(e) => handleInputChange("veterinarianDetails", "openingHours", { day: `${day}End2`, value: e.target.value })}
                          disabled={formData.veterinarianDetails.openingHours[day] !== "Double Session"}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderVetDocuments = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-gray-900">Documents</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Diplomas and Training <span className="text-red-500">*</span></label>
          <label className="px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-lg hover:bg-[#e6b625] cursor-pointer inline-block">
            Upload Diploma
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "diplomasAndTraining")}
            />
          </label>
          {formData.veterinarianDetails.diplomasAndTraining && (
            <img
              src={formData.veterinarianDetails.diplomasAndTraining}
              alt="Diploma Preview"
              className="w-32 h-32 object-cover rounded-lg mt-2"
            />
          )}
          {formErrors.diplomasAndTraining && <p className="text-sm text-red-500">{formErrors.diplomasAndTraining}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Clinic Photos <span className="text-red-500">*</span></label>
          <label className="px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-lg hover:bg-[#e6b625] cursor-pointer inline-block">
            Upload Clinic Photos
            <input type="file" className="hidden" accept="image/*" multiple onChange={handleMultipleImageUpload} />
          </label>
          {formData.veterinarianDetails.clinicPhotos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.veterinarianDetails.clinicPhotos.map((photo, index) => (
                <img key={index} src={photo} alt={`Clinic Photo ${index + 1}`} className="w-20 h-20 object-cover rounded-lg" />
              ))}
            </div>
          )}
          {formErrors.clinicPhotos && <p className="text-sm text-red-500">{formErrors.clinicPhotos}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {currentStep === 1 && renderBasicInfo()}
      {currentStep === 2 && renderVetContactInfo()}
      {currentStep === 3 && renderVetProfessionalInfo()}
      {currentStep === 4 && renderVetServicesAndSchedule()}
      {currentStep === 5 && renderVetDocuments()}
      <div className="flex justify-between mt-6">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Previous
          </button>
        )}
        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={nextStep}
            className="ml-auto px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-lg hover:bg-[#e6b625]"
          >
            Save & Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="ml-auto px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-lg hover:bg-[#e6b625] disabled:bg-gray-300"
          >
            {loading ? "Completing Profile..." : "Submit"}
          </button>
        )}
      </div>
    </form>
  );
};

export default VetProfile;