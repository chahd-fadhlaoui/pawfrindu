import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import MapPicker from "../map/MapPicker";

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
  const defaultImageUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNMTYwIDE4MEgzOUM0MSAxNDAgODAgMTIwIDEwMCAxMjBDMTIwIDEyMCAxNTggMTQwIDE2MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==";
  const [expandedSections] = useState({
    step1: true,
    step2: true,
    step3: true,
    step4: true,
  });
  const [history, setHistory] = useState([]);
  const [specializationInput, setSpecializationInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Added isSubmitting state

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

  useEffect(() => {
    if (!formData.veterinarianDetails || typeof formData.veterinarianDetails !== "object") {
      setFormData({
        image: formData.image || "",
        gender: formData.gender || "",
        acceptedTerms: false,
        veterinarianDetails: {
          businessCardImage: "",
          specializations: [],
          title: "",
          governorate: "",
          delegation: "",
          landlinePhone: "",
          geolocation: { latitude: 36.8665367, longitude: 10.1647233 }, // Ensure this is always set
          diplomasAndTraining: "",
          services: [],
          languagesSpoken: [],
          averageConsultationDuration: "",
          openingHours: {
            monday: "Closed", mondayStart: "", mondayEnd: "", mondayStart2: "", mondayEnd2: "",
            tuesday: "Closed", tuesdayStart: "", tuesdayEnd: "", tuesdayStart2: "", tuesdayEnd2: "",
            wednesday: "Closed", wednesdayStart: "", wednesdayEnd: "", wednesdayStart2: "", wednesdayEnd2: "",
            thursday: "Closed", thursdayStart: "", thursdayEnd: "", thursdayStart2: "", thursdayEnd2: "",
            friday: "Closed", fridayStart: "", fridayEnd: "", fridayStart2: "", fridayEnd2: "",
            saturday: "Closed", saturdayStart: "", saturdayEnd: "", saturdayStart2: "", saturdayEnd2: "",
            sunday: "Closed", sundayStart: "", sundayEnd: "", sundayStart2: "", sundayEnd2: "",
          },
          clinicPhotos: [],
          address: "",
        },
      });
    } else {
      // Ensure geolocation is always an object with latitude and longitude
      if (!formData.veterinarianDetails.geolocation || typeof formData.veterinarianDetails.geolocation !== "object") {
        setFormData((prev) => ({
          ...prev,
          veterinarianDetails: {
            ...prev.veterinarianDetails,
            geolocation: { latitude: 36.8665367, longitude: 10.1647233 },
          },
        }));
      }
      if (!Array.isArray(formData.veterinarianDetails.specializations)) {
        setFormData((prev) => ({
          ...prev,
          veterinarianDetails: { ...prev.veterinarianDetails, specializations: [] },
        }));
      }
    }
  }, [formData, setFormData]);

  const handleImageUpload = async (e, field) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadPromises = Array.from(files).map(async (file) => {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return null;
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);
      try {
        const response = await axiosInstance.post("/api/upload", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.url;
      } catch (error) {
        console.error("Image upload failed:", error);
        return null;
      }
    });

    const urls = (await Promise.all(uploadPromises)).filter((url) => url);
    if (field === "profile") {
      setFormData((prev) => ({ ...prev, image: urls[0] || "" }));
    } else if (field === "clinicPhotos") {
      setFormData((prev) => ({
        ...prev,
        veterinarianDetails: {
          ...prev.veterinarianDetails,
          clinicPhotos: [...(prev.veterinarianDetails.clinicPhotos || []), ...urls],
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        veterinarianDetails: { ...prev.veterinarianDetails, [field]: urls[0] || "" },
      }));
    }
  };

  const handleClinicImagesUpload = (e) => handleImageUpload(e, "clinicPhotos");

  const removeClinicPhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      veterinarianDetails: {
        ...prev.veterinarianDetails,
        clinicPhotos: (prev.veterinarianDetails.clinicPhotos || []).filter((_, i) => i !== index),
      },
    }));
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
      return {
        ...prev,
        veterinarianDetails: {
          ...prev.veterinarianDetails,
          [field]: value,
          delegation: "",
        },
      };
    }
    if (section === "veterinarianDetails" && field === "geolocation") {
      // Ensure the geolocation value is valid; if not, use the default
      const newGeolocation =
        value && value.latitude && value.longitude
          ? { latitude: value.latitude, longitude: value.longitude }
          : { latitude: 36.8665367, longitude: 10.1647233 };
      return {
        ...prev,
        veterinarianDetails: {
          ...prev.veterinarianDetails,
          [field]: newGeolocation,
        },
      };
    }
    return { ...prev, [section]: { ...prev[section], [field]: value } };
  });
  setFormErrors((prev) => ({ ...prev, [field]: "" }));
};

  const handleServiceChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedServices = [...(prev.veterinarianDetails.services || [])];
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
        services: [...(prev.veterinarianDetails.services || []), { serviceName: "", fee: "" }],
      },
    }));
  };

  const removeService = (index) => {
    setFormData((prev) => ({
      ...prev,
      veterinarianDetails: {
        ...prev.veterinarianDetails,
        services: (prev.veterinarianDetails.services || []).filter((_, i) => i !== index),
      },
    }));
  };

  const handleSpecializationChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedSpecializations = [...(prev.veterinarianDetails.specializations || [])];
      updatedSpecializations[index] = { ...updatedSpecializations[index], [field]: value };
      return {
        ...prev,
        veterinarianDetails: { ...prev.veterinarianDetails, specializations: updatedSpecializations },
      };
    });
  };

  const addSpecialization = () => {
    setFormData((prev) => ({
      ...prev,
      veterinarianDetails: {
        ...prev.veterinarianDetails,
        specializations: [...(prev.veterinarianDetails.specializations || []), { specializationName: "" }],
      },
    }));
  };

  const removeSpecialization = (index) => {
    setFormData((prev) => ({
      ...prev,
      veterinarianDetails: {
        ...prev.veterinarianDetails,
        specializations: (prev.veterinarianDetails.specializations || []).filter((_, i) => i !== index),
      },
    }));
  };

  const addSpecializationFromInput = () => {
    if (specializationInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        veterinarianDetails: {
          ...prev.veterinarianDetails,
          specializations: [
            ...(prev.veterinarianDetails.specializations || []),
            { specializationName: specializationInput.trim() },
          ],
        },
      }));
      setSpecializationInput("");
    }
  };

  const copyMondayScheduleToAll = () => {
    const mondaySchedule = {
      status: formData.veterinarianDetails.openingHours.monday,
      start: formData.veterinarianDetails.openingHours.mondayStart,
      end: formData.veterinarianDetails.openingHours.mondayEnd,
      start2: formData.veterinarianDetails.openingHours.mondayStart2,
      end2: formData.veterinarianDetails.openingHours.mondayEnd2,
    };

    setFormData((prev) => ({
      ...prev,
      veterinarianDetails: {
        ...prev.veterinarianDetails,
        openingHours: {
          ...prev.veterinarianDetails.openingHours,
          tuesday: mondaySchedule.status,
          tuesdayStart: mondaySchedule.start,
          tuesdayEnd: mondaySchedule.end,
          tuesdayStart2: mondaySchedule.start2,
          tuesdayEnd2: mondaySchedule.end2,
          wednesday: mondaySchedule.status,
          wednesdayStart: mondaySchedule.start,
          wednesdayEnd: mondaySchedule.end,
          wednesdayStart2: mondaySchedule.start2,
          wednesdayEnd2: mondaySchedule.end2,
          thursday: mondaySchedule.status,
          thursdayStart: mondaySchedule.start,
          thursdayEnd: mondaySchedule.end,
          thursdayStart2: mondaySchedule.start2,
          thursdayEnd2: mondaySchedule.end2,
          friday: mondaySchedule.status,
          fridayStart: mondaySchedule.start,
          fridayEnd: mondaySchedule.end,
          fridayStart2: mondaySchedule.start2,
          fridayEnd2: mondaySchedule.end2,
          saturday: mondaySchedule.status,
          saturdayStart: mondaySchedule.start,
          saturdayEnd: mondaySchedule.end,
          saturdayStart2: mondaySchedule.start2,
          saturdayEnd2: mondaySchedule.end2,
          sunday: mondaySchedule.status,
          sundayStart: mondaySchedule.start,
          sundayEnd: mondaySchedule.end,
          sundayStart2: mondaySchedule.start2,
          sundayEnd2: mondaySchedule.end2,
        },
      },
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            veterinarianDetails: {
              ...prev.veterinarianDetails,
              geolocation: { latitude, longitude },
            },
          }));
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to retrieve your location. Please allow location access or enter it manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleLanguageChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const languages = checked
        ? [...(prev.veterinarianDetails.languagesSpoken || []), value]
        : (prev.veterinarianDetails.languagesSpoken || []).filter((lang) => lang !== value);
      return {
        ...prev,
        veterinarianDetails: { ...prev.veterinarianDetails, languagesSpoken: languages },
      };
    });
  };

  const validateCurrentStep = () => {
    const errors = {};
    if (currentStep === 1) {
      if (!formData.image) errors.image = "Profile photo is required";
      if (!formData.gender) errors.gender = "Gender is required";
      if (!(formData.veterinarianDetails.languagesSpoken || []).length) errors.languagesSpoken = "At least one language is required";
    } else if (currentStep === 2) {
      if (!formData.veterinarianDetails.diplomasAndTraining) errors.diplomasAndTraining = "Diploma photo is required";
      if (!formData.veterinarianDetails.title) errors.title = "Title is required";
      if (!formData.veterinarianDetails.businessCardImage) errors.businessCardImage = "Business card image is required";
    } else if (currentStep === 3) {
      if (!(formData.veterinarianDetails.services || []).length) errors.services = "At least one service is required";
    } else if (currentStep === 4) {
      if (!formData.veterinarianDetails.governorate) errors.governorate = "Governorate is required";
      if (!formData.veterinarianDetails.delegation) errors.delegation = "City is required";
    } else if (currentStep === 5) {
      if (!formData.acceptedTerms) errors.acceptedTerms = "You must accept the terms and conditions";
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
    setIsSubmitting(true);

    const allErrors = {};
    for (let step = 1; step <= 5; step++) {
      setCurrentStep(step);
      Object.assign(allErrors, validateCurrentStep());
    }
    setCurrentStep(totalSteps);

    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const profileDetails = {
        image: formData.image,
        gender: formData.gender,
        veterinarianDetails: formData.veterinarianDetails,
      };
      const result = await createProfile(profileDetails);
      if (result.success) {
        setHistory((prev) => [...prev, { timestamp: new Date().toISOString(), data: { ...formData } }]);
        navigate("/vet-pending-approval", { replace: true }); 
           }
    } catch (error) {
      console.error("Submission error:", error);
      setFormErrors({ submit: error.response?.data?.message || "Failed to create profile" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Personal Information
  const renderStep1 = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b border-[#ffc929] pb-2">Step 1: Personal Information</h3>
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative">
          {/* Wrap the img in a label to make it clickable */}
          <label className="cursor-pointer">
            <img
              src={formData.image || defaultImageUrl}
              alt="Profile preview"
              className="object-cover w-40 h-40 rounded-full border-2 border-[#ffc929] mb-4 shadow-md hover:opacity-80 transition-opacity duration-200"
            />
            {/* Hidden input tied to both the image and the upload button */}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "profile")}
              id="profile-upload" // Add an ID to link the label
            />
          </label>
          {/* Upload button */}
          <label
            htmlFor="profile-upload" // Associate this label with the input
            className="absolute -bottom-2 right-0 px-3 py-1 text-xs font-medium text-white bg-teal-600 rounded-full hover:bg-teal-700 cursor-pointer shadow-md transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 inline mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Upload
          </label>
        </div>
        {formErrors.image && <p className="text-sm text-red-500 mt-1">{formErrors.image}</p>}
      </div>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            {["Femme", "Homme"].map((option) => (
              <label key={option} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={formData.gender === option}
                  onChange={(e) => handleInputChange("root", "gender", e.target.value)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {formErrors.gender && <p className="text-sm text-red-500 mt-1">{formErrors.gender}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Languages Spoken <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["Français", "Anglais", "Arabe"].map((lang) => (
              <div key={lang} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`lang-${lang}`}
                  value={lang}
                  checked={(formData.veterinarianDetails.languagesSpoken || []).includes(lang)}
                  onChange={handleLanguageChange}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor={`lang-${lang}`} className="text-sm text-gray-700">
                  {lang}
                </label>
              </div>
            ))}
          </div>
          {formErrors.languagesSpoken && (
            <p className="text-sm text-red-500 mt-1">{formErrors.languagesSpoken}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Landline Phone</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <input
              type="tel"
              value={formData.veterinarianDetails.landlinePhone || ""}
              onChange={(e) => handleInputChange("veterinarianDetails", "landlinePhone", e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500"
              placeholder="+216 XX XXX XXX"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Professional Credentials
  const renderStep2 = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b border-teal-600 pb-2">Step 2: Professional Credentials</h3>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diplomas and Training <span className="text-red-500">*</span></label>
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <label className="px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-lg cursor-pointer transition-colors inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Diploma
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "diplomasAndTraining")}
              />
            </label>
            {formData.veterinarianDetails.diplomasAndTraining && (
              <div className="relative">
                <img
                  src={formData.veterinarianDetails.diplomasAndTraining}
                  alt="Diploma Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => handleInputChange("veterinarianDetails", "diplomasAndTraining", null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          {formErrors.diplomasAndTraining && <p className="text-sm text-red-500 mt-1">{formErrors.diplomasAndTraining}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              value={formData.veterinarianDetails.title || ""}
              onChange={(e) => handleInputChange("veterinarianDetails", "title", e.target.value)}
              className={`w-full pl-4 pr-10 py-3 text-sm border rounded-lg appearance-none focus:ring-teal-500 focus:border-teal-500 ${formErrors.title ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="" disabled>Select Title</option>
              <option value="Doctor">Doctor</option>
              <option value="Professor">Professor</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          {formErrors.title && <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Card Image <span className="text-red-500">*</span></label>
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <label className="px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-lg  cursor-pointer transition-colors inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Business Card
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "businessCardImage")}
              />
            </label>
            {formData.veterinarianDetails.businessCardImage && (
              <div className="relative">
                <img
                  src={formData.veterinarianDetails.businessCardImage}
                  alt="Business Card Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => handleInputChange("veterinarianDetails", "businessCardImage", null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          {formErrors.businessCardImage && <p className="text-sm text-red-500 mt-1">{formErrors.businessCardImage}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specializations</label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={specializationInput || ""}
                onChange={(e) => setSpecializationInput(e.target.value)}
                placeholder="Enter specialization name"
                className="flex-1 px-4 py-2 text-sm border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500"
              />
              <button
                type="button"
                onClick={addSpecializationFromInput}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!specializationInput}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {(formData.veterinarianDetails.specializations || []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.veterinarianDetails.specializations.map((spec, index) => (
                  <div key={index} className="inline-flex items-center bg-teal-100 text-teal-800 rounded-full px-3 py-1">
                    <span>{spec.specializationName}</span>
                    <button
                      type="button"
                      onClick={() => removeSpecialization(index)}
                      className="ml-2 text-teal-600 hover:text-teal-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No specializations added yet.</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Average Consultation Duration</label>
          <div className="relative">
            <select
              value={formData.veterinarianDetails.averageConsultationDuration || ""}
              onChange={(e) => handleInputChange("veterinarianDetails", "averageConsultationDuration", e.target.value)}
              className="w-full pl-4 pr-10 py-3 text-sm border rounded-lg appearance-none border-gray-300 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="" disabled>Select Duration</option>
              {[10, 15, 20, 25, 30, 45, 50, 55, 60].map((dur) => (
                <option key={dur} value={dur}>{dur} mins</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
// Step 3: Services & Schedule
const renderStep3 = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b border-teal-600 pb-2">Step 3: Services & Schedule</h3>
    <div className="space-y-8">
      {/* Services Offered */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Services Offered <span className="text-red-500">*</span></label>
        {(formData.veterinarianDetails.services || []).map((service, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-sm font-medium text-gray-800">Service #{index + 1}</h4>
              <button
                type="button"
                onClick={() => removeService(index)}
                className="text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  type="text"
                  value={service.serviceName || ""}
                  onChange={(e) => handleServiceChange(index, "serviceName", e.target.value)}
                  className="w-full px-4 py-2 text-sm border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g. Vaccination, Check-up"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fee (in TND)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">TND</span>
                  </div>
                  <input
                    type="number"
                    value={service.fee || ""}
                    onChange={(e) => handleServiceChange(index, "fee", e.target.value)}
                    className="w-full pl-14 pr-4 py-2 text-sm border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addService}
          className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Service
        </button>
        {formErrors.services && <p className="text-sm text-red-500 mt-1">{formErrors.services}</p>}
      </div>

      {/* Clinic Schedule */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">Clinic Schedule</label>
          <button
            type="button"
            onClick={copyMondayScheduleToAll}
            className="flex items-center px-3 py-1 text-xs font-medium text-teal-700 bg-teal-100 rounded-md hover:bg-teal-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Monday to All
          </button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left text-sm font-medium text-gray-700">Day</th>
              <th className="border p-2 text-left text-sm font-medium text-gray-700">Schedule Type</th>
              <th className="border p-2 text-left text-sm font-medium text-gray-700">Start</th>
              <th className="border p-2 text-left text-sm font-medium text-gray-700">End</th>
              <th className="border p-2 text-left text-sm font-medium text-gray-700">Start 2</th>
              <th className="border p-2 text-left text-sm font-medium text-gray-700">End 2</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(formData.veterinarianDetails.openingHours)
              .filter((key) => key.match(/^[a-z]+$/))
              .map((day) => (
                <tr key={day} className="border-t">
                  <td className="border p-2 capitalize text-sm text-gray-700">{day}</td>
                  <td className="border p-2">
                    <select
                      value={formData.veterinarianDetails.openingHours[day] || "Closed"}
                      onChange={(e) => handleInputChange("veterinarianDetails", "openingHours", { day, value: e.target.value })}
                      className="w-full p-1 border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    >
                      <option value="Closed">Closed</option>
                      <option value="Single Session">Single Session</option>
                      <option value="Double Session">Double Session</option>
                    </select>
                  </td>
                  <td className="border p-2">
                    <input
                      type="time"
                      value={formData.veterinarianDetails.openingHours[`${day}Start`] || ""}
                      onChange={(e) => handleInputChange("veterinarianDetails", "openingHours", { day: `${day}Start`, value: e.target.value })}
                      disabled={formData.veterinarianDetails.openingHours[day] === "Closed"}
                      className="w-full p-1 border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="time"
                      value={formData.veterinarianDetails.openingHours[`${day}End`] || ""}
                      onChange={(e) => handleInputChange("veterinarianDetails", "openingHours", { day: `${day}End`, value: e.target.value })}
                      disabled={formData.veterinarianDetails.openingHours[day] === "Closed"}
                      className="w-full p-1 border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="time"
                      value={formData.veterinarianDetails.openingHours[`${day}Start2`] || ""}
                      onChange={(e) => handleInputChange("veterinarianDetails", "openingHours", { day: `${day}Start2`, value: e.target.value })}
                      disabled={formData.veterinarianDetails.openingHours[day] !== "Double Session"}
                      className="w-full p-1 border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="time"
                      value={formData.veterinarianDetails.openingHours[`${day}End2`] || ""}
                      onChange={(e) => handleInputChange("veterinarianDetails", "openingHours", { day: `${day}End2`, value: e.target.value })}
                      disabled={formData.veterinarianDetails.openingHours[day] !== "Double Session"}
                      className="w-full p-1 border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Step 4: Location Details
const renderStep4 = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b border-teal-600 pb-2">Step 4: Location Details</h3>
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Governorate <span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              value={formData.veterinarianDetails.governorate || ""}
              onChange={(e) => handleInputChange("veterinarianDetails", "governorate", e.target.value)}
              className={`w-full pl-4 pr-10 py-3 text-sm border rounded-lg appearance-none focus:ring-teal-500 focus:border-teal-500 ${formErrors.governorate ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="" disabled>Select Governorate</option>
              {governorates.map((gov) => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          {formErrors.governorate && <p className="text-sm text-red-500 mt-1">{formErrors.governorate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Delegation <span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              value={formData.veterinarianDetails.delegation || ""}
              onChange={(e) => handleInputChange("veterinarianDetails", "delegation", e.target.value)}
              className={`w-full pl-4 pr-10 py-3 text-sm border rounded-lg appearance-none focus:ring-teal-500 focus:border-teal-500 ${formErrors.delegation ? "border-red-500" : "border-gray-300"}`}
              disabled={!formData.veterinarianDetails.governorate}
            >
              <option value="" disabled>Select Delegation</option>
              {formData.veterinarianDetails.governorate &&
                delegationsByGovernorate[formData.veterinarianDetails.governorate]?.map((delegation) => (
                  <option key={delegation} value={delegation}>{delegation}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          {formErrors.delegation && <p className="text-sm text-red-500 mt-1">{formErrors.delegation}</p>}
        </div>
      </div>

                

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Map Location</label>
        <MapPicker
          position={formData.veterinarianDetails.geolocation}
          setPosition={(newPosition) =>
            handleInputChange("veterinarianDetails", "geolocation", newPosition)
          }
        />
        <button
          type="button"
          onClick={getCurrentLocation}
          className="mt-2 w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Use Current Location
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Images</label>
        <div className="flex flex-col items-center p-5 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500 mb-2">Drag & drop images here, or click to select</p>
          <label className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 cursor-pointer transition-colors">
            Upload Images
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleClinicImagesUpload}
            />
          </label>
        </div>

        {(formData.veterinarianDetails.clinicPhotos || []).length > 0 && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
            {formData.veterinarianDetails.clinicPhotos.map((img, index) => (
              <div key={index} className="relative h-24 rounded-lg overflow-hidden">
                <img
                  src={img}
                  alt={`Clinic image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeClinicPhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
  // Step 5: Review & Submit
  const renderStep5 = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b border-teal-600 pb-2">Step 5: Review & Submit</h3>
      
      <div className="space-y-6">
        {/* Personal Information Review */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Personal Information</h4>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-teal-600 hover:text-teal-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <img
                src={formData.image || defaultImageUrl}
                alt="Profile preview"
                className="h-16 w-16 rounded-full object-cover border border-gray-200"
              />
              <div>
                <p className="text-sm text-gray-700"><span className="font-medium">Gender:</span> {formData.gender || "Not specified"}</p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Languages:</span> {(formData.veterinarianDetails.languagesSpoken || []).join(", ") || "None specified"}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Phone:</span> {formData.veterinarianDetails.landlinePhone || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Professional Credentials Review */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Professional Credentials</h4>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-teal-600 hover:text-teal-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Title:</span> {formData.veterinarianDetails.title || "Not specified"}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Specializations:</span> {
                    (formData.veterinarianDetails.specializations || []).length > 0 
                      ? formData.veterinarianDetails.specializations.map(s => s.specializationName).join(", ") 
                      : "None specified"
                  }
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Consultation Duration:</span> {
                    formData.veterinarianDetails.averageConsultationDuration 
                      ? `${formData.veterinarianDetails.averageConsultationDuration} mins` 
                      : "Not specified"
                  }
                </p>
              </div>
              <div className="flex flex-col items-start space-y-2">
                {formData.veterinarianDetails.diplomasAndTraining && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Diploma</p>
                    <img 
                      src={formData.veterinarianDetails.diplomasAndTraining}
                      alt="Diploma"
                      className="h-12 w-20 object-cover rounded border border-gray-200"
                    />
                  </div>
                )}
                {formData.veterinarianDetails.businessCardImage && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Business Card</p>
                    <img 
                      src={formData.veterinarianDetails.businessCardImage}
                      alt="Business Card"
                      className="h-12 w-20 object-cover rounded border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Services & Schedule Review */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Services & Schedule</h4>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="text-teal-600 hover:text-teal-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Services Offered</h5>
                {(formData.veterinarianDetails.services || []).length > 0 ? (
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    {formData.veterinarianDetails.services.map((service, index) => (
                      <li key={index}>
                        {service.serviceName} - {service.fee} TND
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No services specified</p>
                )}
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Working Hours</h5>
                <div className="overflow-hidden border border-gray-200 rounded">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left font-medium text-gray-500">Day</th>
                        <th className="px-2 py-2 text-left font-medium text-gray-500">Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.keys(formData.veterinarianDetails.openingHours)
                        .filter((key) => key.match(/^[a-z]+$/) && key !== "day")
                        .map((day) => (
                          <tr key={day}>
                            <td className="px-2 py-2 whitespace-nowrap capitalize">{day}</td>
                            <td className="px-2 py-2">
                              {formData.veterinarianDetails.openingHours[day] === "Closed" ? (
                                <span className="text-red-500">Closed</span>
                              ) : formData.veterinarianDetails.openingHours[day] === "Single Session" ? (
                                <span>
                                  {formData.veterinarianDetails.openingHours[`${day}Start`]} - {formData.veterinarianDetails.openingHours[`${day}End`]}
                                </span>
                              ) : (
                                <span>
                                  {formData.veterinarianDetails.openingHours[`${day}Start`]} - {formData.veterinarianDetails.openingHours[`${day}End`]}, 
                                  {formData.veterinarianDetails.openingHours[`${day}Start2`]} - {formData.veterinarianDetails.openingHours[`${day}End2`]}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Location Details Review */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Location Details</h4>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="text-teal-600 hover:text-teal-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Address:</span> {formData.veterinarianDetails.address || "Not specified"}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Location:</span> {
                formData.veterinarianDetails.delegation && formData.veterinarianDetails.governorate
                  ? `${formData.veterinarianDetails.delegation}, ${formData.veterinarianDetails.governorate}`
                  : "Not specified"
              }
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Coordinates:</span> {
                formData.veterinarianDetails.geolocation.latitude && formData.veterinarianDetails.geolocation.longitude
                  ? `${formData.veterinarianDetails.geolocation.latitude}, ${formData.veterinarianDetails.geolocation.longitude}`
                  : "Not specified"
              }
            </p>
            
            {(formData.veterinarianDetails.clinicPhotos || []).length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Clinic Images:</p>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {formData.veterinarianDetails.clinicPhotos.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Clinic image ${index + 1}`}
                      className="h-16 w-24 object-cover rounded flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Terms and Conditions */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              checked={formData.acceptedTerms || false}
              onChange={(e) => handleInputChange("root", "acceptedTerms", e.target.checked)}
              className="h-5 w-5 mt-0.5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <div>
              <label htmlFor="terms" className="text-sm font-medium text-gray-700">
                I accept the Terms and Conditions <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                By checking this box, you agree to our <a href="#" className="text-teal-600 hover:underline">Terms of Service</a> and 
                acknowledge that you have read our <a href="#" className="text-teal-600 hover:underline">Privacy Policy</a>.
              </p>
              {formErrors.acceptedTerms && <p className="text-sm text-red-500 mt-1">{formErrors.acceptedTerms}</p>}
            </div>
          </div>
        </div>
        
      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full px-6 py-3 text-base font-medium text-white bg-[#ffc929] rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        ) : (
          "Submit" // Changed from "Complete Registration" to "Submit"
        )}
      </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
      {currentStep === 5 && renderStep5()}
      {formErrors.submit && <p className="text-sm text-red-500">{formErrors.submit}</p>}
      {/* Only show navigation buttons for steps 1-4 */}
      {currentStep < 5 && (
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
          <button
            type="button"
            onClick={nextStep}
            className="ml-auto px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-lg hover:bg-[#e6b625]"
          >
            Save & Continue
          </button>
        </div>
      )}
    </form>
  );
};

export default VetProfile;