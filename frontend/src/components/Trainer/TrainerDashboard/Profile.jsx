import React, { useState, useEffect, useCallback } from "react";
import {
  User, MapPin, Phone, Award, Clock, Languages, Upload, Trash2, Edit, Save, X, Loader2, AlertTriangle,
  Instagram, Facebook, Globe, ChevronDown, ChevronUp, Info
} from "lucide-react";
import { FaMapMarkedAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import MapViewer from "../../map/MapViewer";
import MapPicker from "../../map/MapPicker";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { governorates, delegationsByGovernorate } from "../../../assets/locations";
import { breeds, SPECIES_OPTIONS } from "../../../assets/Pet";
import { trainingCategories } from "../../../assets/trainer";
import { Tooltip } from "../../Tooltip";

const DEFAULT_PROFILE_IMAGE = "/api/placeholder/250/250";
const DEFAULT_BUSINESS_CARD_IMAGE = "/api/placeholder/150/100";

const CollapsibleSection = ({ title, icon: Icon, children, isOpen, toggleOpen, description }) => (
  <div className="mb-6 overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-md rounded-xl">
    <button
      onClick={toggleOpen}
      className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#ffc929] to-[#ff6f91] text-white hover:from-[#ffa726] hover:to-[#ff8b9d] transition-colors"
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-6 h-6" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
    </button>
    {isOpen && (
      <div className="px-6 py-4 animate-fade-in">
        {description && <p className="mb-4 text-sm text-gray-500">{description}</p>}
        {children}
      </div>
    )}
  </div>
);

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
      className="w-full px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 text-gray-800 text-lg shadow-sm transition-all duration-300"
      placeholder="Your Name"
      disabled={disabled}
    />
  );
};

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
      className="w-full px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 text-gray-800 shadow-sm transition-all duration-300"
      placeholder="Phone Number"
      disabled={disabled}
    />
  );
};

const ServiceInput = ({ service, index, onChange, onRemove, disabled, existingServices }) => {
  const [localServiceName, setLocalServiceName] = useState(service.serviceName);
  const [localFee, setLocalFee] = useState(service.fee);

  useEffect(() => {
    setLocalServiceName(service.serviceName);
    setLocalFee(service.fee);
  }, [service]);

  const handleBlur = (field) => {
    onChange(index, field, field === "serviceName" ? localServiceName : localFee);
  };

  const availableServices = trainingCategories.filter(
    (category) =>
      !existingServices.some(
        (s, i) => s.serviceName === category.name && i !== index
      )
  );

  return (
    <div className="flex items-center mb-3 space-x-2">
      <select
        value={localServiceName}
        onChange={(e) => setLocalServiceName(e.target.value)}
        onBlur={() => handleBlur("serviceName")}
        className="w-1/2 px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
        disabled={disabled}
      >
        <option value="" disabled>Select Service</option>
        {availableServices.map((category) => (
          <option key={category.id} value={category.name}>{category.name}</option>
        ))}
      </select>
      <input
        type="number"
        value={localFee}
        onChange={(e) => setLocalFee(e.target.value)}
        onBlur={() => handleBlur("fee")}
        className="w-1/3 px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
        placeholder="Fee"
        min="0"
        disabled={disabled}
      />
      <button
        onClick={() => onRemove(index)}
        className="p-2 text-red-500 transition-colors hover:text-red-700 disabled:text-gray-400"
        disabled={disabled}
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const [trainerData, setTrainerData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({});
  const [tempImage, setTempImage] = useState(null);
  const [businessCardImage, setBusinessCardImage] = useState(null);
  const [certificationImage, setCertificationImage] = useState(null);
  const [trainingPhotos, setTrainingPhotos] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState("dog");
  const [selectedBreed, setSelectedBreed] = useState("");
  const [serviceAreaGov, setServiceAreaGov] = useState("");
  const [openSections, setOpenSections] = useState({
    personal: true,
    professional: false,
    facility: false,
    services: false,
    social: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const fetchTrainerProfile = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/user/me");
        const trainer = response.data.user;
        if (trainer.role !== "Trainer") {
          throw new Error("This page is only accessible to trainers");
        }
        setTrainerData(trainer);
        setEditableData({
          fullName: trainer.fullName || "",
          gender: trainer.gender || "",
          about: trainer.about || "",
          email: trainer.email || "",
          trainerDetails: {
            governorate: trainer.trainerDetails?.governorate || "",
            delegation: trainer.trainerDetails?.delegation || "",
            geolocation: trainer.trainerDetails?.geolocation || { latitude: 36.8665367, longitude: 10.1647233 },
            trainingFacilityType: trainer.trainerDetails?.trainingFacilityType || "",
            serviceAreas: trainer.trainerDetails?.serviceAreas || [],
            phone: trainer.trainerDetails?.phone || "",
            secondaryPhone: trainer.trainerDetails?.secondaryPhone || "",
            languagesSpoken: trainer.trainerDetails?.languagesSpoken || ["Arabic"],
            services: trainer.trainerDetails?.services || [{ serviceName: "", fee: "" }],
            openingHours: trainer.trainerDetails?.openingHours || {
              monday: "Closed", mondayStart: "", mondayEnd: "", mondayStart2: "", mondayEnd2: "",
              tuesday: "Closed", tuesdayStart: "", tuesdayEnd: "", tuesdayStart2: "", tuesdayEnd2: "",
              wednesday: "Closed", wednesdayStart: "", wednesdayEnd: "", wednesdayStart2: "", wednesdayEnd2: "",
              thursday: "Closed", thursdayStart: "", thursdayEnd: "", thursdayStart2: "", thursdayEnd2: "",
              friday: "Closed", fridayStart: "", fridayEnd: "", fridayStart2: "", fridayEnd2: "",
              saturday: "Closed", saturdayStart: "", saturdayEnd: "", saturdayStart2: "", saturdayEnd2: "",
              sunday: "Closed", sundayStart: "", sundayEnd: "", sundayStart2: "", sundayEnd2: "",
            },
            breedsTrained: trainer.trainerDetails?.breedsTrained || [],
            averageSessionDuration: trainer.trainerDetails?.averageSessionDuration || "",
            socialLinks: trainer.trainerDetails?.socialLinks || { facebook: "", instagram: "", website: "" },
          },
        });
        setTempImage(trainer.image || DEFAULT_PROFILE_IMAGE);
        setBusinessCardImage(trainer.trainerDetails?.businessCardImage || DEFAULT_BUSINESS_CARD_IMAGE);
        setCertificationImage(trainer.trainerDetails?.certificationImage || null);
        setTrainingPhotos(trainer.trainerDetails?.trainingPhotos || []);
      } catch (err) {
        setError(err.message || "Failed to load trainer profile");
      } finally {
        setLoading(false);
      }
    };
    fetchTrainerProfile();
  }, [navigate]);

  const handleInputChange = useCallback((field, value, section = "root") => {
    setEditableData((prev) => {
      if (section === "root") {
        return { ...prev, [field]: value };
      }
      if (field === "governorate") {
        return {
          ...prev,
          trainerDetails: { ...prev.trainerDetails, [field]: value, delegation: "" },
        };
      }
      if (field === "socialLinks") {
        return {
          ...prev,
          trainerDetails: {
            ...prev.trainerDetails,
            socialLinks: { ...prev.trainerDetails.socialLinks, ...value },
          },
        };
      }
      return {
        ...prev,
        trainerDetails: { ...prev.trainerDetails, [field]: value },
      };
    });
  }, []);

  const handleMapPositionChange = async (newPosition) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPosition.latitude}&lon=${newPosition.longitude}&zoom=16&addressdetails=1`,
        { headers: { "User-Agent": "TrainerApp/1.0" } }
      );
      const data = await response.json();

      handleInputChange("geolocation", newPosition, "trainerDetails");

      if (data && data.address) {
        const governorateRaw = (data.address.state || "Tunis").replace(/^Gouvernorat\s+/i, "");
        const normalizedGovernorate = governorateRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const matchedGovernorate =
          governorates.find((gov) => {
            const normalizedGov = gov.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return (
              normalizedGov === normalizedGovernorate ||
              normalizedGov.includes(normalizedGovernorate) ||
              normalizedGovernorate.includes(normalizedGov)
            );
          }) || "Tunis";

        const availableDelegations = delegationsByGovernorate[matchedGovernorate] || [];

        const delegationRaw = (
          data.address.town ||
          data.address.suburb ||
          data.address.county ||
          data.address.village ||
          data.address.city ||
          data.address.municipality ||
          data.address.neighbourhood ||
          governorateRaw
        )
          .replace(/Ville\s*\d*/i, "")
          .replace(/Hammem/, "Hammam")
          .replace(/Ouest|Est|Nord|Sud/i, "")
          .trim();

        const normalizedDelegation = delegationRaw
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[- ]/g, "");

        const stateDistrictRaw = (data.address.state_district || "").replace(/^Délégation\s+/i, "").trim();
        const normalizedStateDistrict = stateDistrictRaw
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[- ]/g, "");

        let matchedDelegation = availableDelegations.find((del) => {
          const normalizedDel = del
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[- ]/g, "");
          return normalizedDel === normalizedDelegation;
        });

        if (!matchedDelegation && stateDistrictRaw) {
          matchedDelegation = availableDelegations.find((del) => {
            const normalizedDel = del
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[- ]/g, "");
            return normalizedDel === normalizedStateDistrict;
          });
        }

        if (!matchedDelegation) {
          matchedDelegation =
            availableDelegations.find((del) => del.toLowerCase().includes("ville")) ||
            availableDelegations[0] ||
            governorateRaw;
          console.warn(
            `No match for "${delegationRaw}" or "${stateDistrictRaw}" in ${matchedGovernorate} delegations, using: "${matchedDelegation}"`
          );
        }

        handleInputChange("governorate", matchedGovernorate, "trainerDetails");
        handleInputChange("delegation", matchedDelegation, "trainerDetails");
      } else {
        handleInputChange("governorate", "Tunis", "trainerDetails");
        handleInputChange("delegation", delegationsByGovernorate["Tunis"]?.[0] || "Tunis", "trainerDetails");
      }
    } catch (error) {
      console.error("Nominatim reverse geocoding error:", error);
      handleInputChange("geolocation", newPosition, "trainerDetails");
      handleInputChange("governorate", "Tunis", "trainerDetails");
      handleInputChange("delegation", delegationsByGovernorate["Tunis"]?.[0] || "Tunis", "trainerDetails");
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleMapPositionChange({ latitude, longitude });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Unable to retrieve your location.", { position: "top-right", autoClose: 3000 });
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.", { position: "top-right", autoClose: 3000 });
    }
  };

  const handleServiceChange = useCallback((index, field, value) => {
    setEditableData((prev) => {
      const newServices = [...prev.trainerDetails.services];
      newServices[index] = {
        ...newServices[index],
        [field]: field === "fee" ? parseFloat(value) || 0 : value,
      };
      return { ...prev, trainerDetails: { ...prev.trainerDetails, services: newServices } };
    });
  }, []);

  const addService = useCallback(() => {
    setEditableData((prev) => ({
      ...prev,
      trainerDetails: {
        ...prev.trainerDetails,
        services: [...prev.trainerDetails.services, { serviceName: "", fee: 0 }],
      },
    }));
  }, []);

  const removeService = useCallback((index) => {
    setEditableData((prev) => ({
      ...prev,
      trainerDetails: {
        ...prev.trainerDetails,
        services: prev.trainerDetails.services.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const handleOpeningHoursChange = useCallback((day, field, value) => {
    setEditableData((prev) => {
      const updatedOpeningHours = { ...prev.trainerDetails.openingHours, [`${day}${field}`]: value };
      if (value === "Closed") {
        updatedOpeningHours[`${day}Start`] = "";
        updatedOpeningHours[`${day}End`] = "";
        updatedOpeningHours[`${day}Start2`] = "";
        updatedOpeningHours[`${day}End2`] = "";
      }
      return {
        ...prev,
        trainerDetails: { ...prev.trainerDetails, openingHours: updatedOpeningHours },
      };
    });
  }, []);

  const addServiceArea = useCallback(() => {
    if (serviceAreaGov) {
      setEditableData((prev) => ({
        ...prev,
        trainerDetails: {
          ...prev.trainerDetails,
          serviceAreas: [...prev.trainerDetails.serviceAreas, { governorate: serviceAreaGov, delegations: [] }],
        },
      }));
      setServiceAreaGov("");
    }
  }, [serviceAreaGov]);

  const removeServiceArea = useCallback((index) => {
    setEditableData((prev) => ({
      ...prev,
      trainerDetails: {
        ...prev.trainerDetails,
        serviceAreas: prev.trainerDetails.serviceAreas.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const addBreed = useCallback(() => {
    if (selectedBreed && !editableData.trainerDetails.breedsTrained.some((b) => b.species === selectedSpecies && b.breedName === selectedBreed)) {
      setEditableData((prev) => ({
        ...prev,
        trainerDetails: {
          ...prev.trainerDetails,
          breedsTrained: [
            ...prev.trainerDetails.breedsTrained,
            { species: selectedSpecies, breedName: selectedBreed },
          ],
        },
      }));
      setSelectedBreed("");
    }
  }, [selectedSpecies, selectedBreed]);

  const removeBreed = useCallback((index) => {
    setEditableData((prev) => ({
      ...prev,
      trainerDetails: {
        ...prev.trainerDetails,
        breedsTrained: prev.trainerDetails.breedsTrained.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const handleImageUpload = async (e, type) => {
    if (!trainerData?.isActive) {
      toast.error("Your account is deactivated. Image uploads are disabled.", { position: "top-right", autoClose: 3000 });
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadLoading(true);

    const uploadPromises = Array.from(files).map(async (file) => {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is not an image or exceeds 5MB.`, { position: "top-right", autoClose: 3000 });
        return null;
      }

      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      try {
        const response = await axiosInstance.post("/api/upload", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.url;
      } catch (error) {
        toast.error(`Failed to upload ${file.name}.`, { position: "top-right", autoClose: 3000 });
        return null;
      }
    });

    const urls = (await Promise.all(uploadPromises)).filter((url) => url);

    if (type === "profile") {
      setTempImage(urls[0] || tempImage);
    } else if (type === "businessCard") {
      setBusinessCardImage(urls[0] || businessCardImage);
    } else if (type === "trainingPhotos") {
      setTrainingPhotos((prev) => [...prev, ...urls]);
    }

    setUploadLoading(false);
  };

  const handleRemoveTrainingPhoto = useCallback((index) => {
    if (!trainerData?.isActive) {
      toast.error("Your account is deactivated. You cannot remove photos.", { position: "top-right", autoClose: 3000 });
      return;
    }
    setTrainingPhotos((prev) => prev.filter((_, i) => i !== index));
  }, [trainerData]);

  const handleSaveChanges = async () => {
    if (!trainerData?.isActive) {
      toast.error("Your account is deactivated. You cannot save changes.", { position: "top-right", autoClose: 3000 });
      return;
    }

    try {
      setUploadLoading(true);

      const updatedData = {
        userId: trainerData._id,
        fullName: editableData.fullName || trainerData.fullName,
        image: tempImage !== DEFAULT_PROFILE_IMAGE ? tempImage : trainerData.image,
        gender: editableData.gender || trainerData.gender,
        about: editableData.about || trainerData.about,
        trainerDetails: {
          governorate: editableData.trainerDetails.governorate || null,
          delegation: editableData.trainerDetails.delegation || null,
          geolocation: editableData.trainerDetails.geolocation,
          trainingFacilityType: editableData.trainerDetails.trainingFacilityType || null,
          serviceAreas: editableData.trainerDetails.serviceAreas || [],
          phone: editableData.trainerDetails.phone || null,
          secondaryPhone: editableData.trainerDetails.secondaryPhone || null,
          languagesSpoken: editableData.trainerDetails.languagesSpoken || [],
          services: editableData.trainerDetails.services || [],
          openingHours: editableData.trainerDetails.openingHours,
          breedsTrained: editableData.trainerDetails.breedsTrained || [],
          averageSessionDuration: parseInt(editableData.trainerDetails.averageSessionDuration) || null,
          socialLinks: editableData.trainerDetails.socialLinks || {},
          trainingPhotos,
          businessCardImage: businessCardImage !== DEFAULT_BUSINESS_CARD_IMAGE ? businessCardImage : null,
        },
      };

      await axiosInstance.put("/api/user/updateTrainerProfile", updatedData);
      const response = await axiosInstance.get("/api/user/me");
      const updatedTrainer = response.data.user;
      setTrainerData(updatedTrainer);
      setEditableData({
        fullName: updatedTrainer.fullName || "",
        gender: updatedTrainer.gender || "",
        about: updatedTrainer.about || "",
        email: updatedTrainer.email || "",
        trainerDetails: {
          governorate: updatedTrainer.trainerDetails?.governorate || "",
          delegation: updatedTrainer.trainerDetails?.delegation || "",
          geolocation: updatedTrainer.trainerDetails?.geolocation || { latitude: 36.8665367, longitude: 10.1647233 },
          trainingFacilityType: updatedTrainer.trainerDetails?.trainingFacilityType || "",
          serviceAreas: updatedTrainer.trainerDetails?.serviceAreas || [],
          phone: updatedTrainer.trainerDetails?.phone || "",
          secondaryPhone: updatedTrainer.trainerDetails?.secondaryPhone || "",
          languagesSpoken: updatedTrainer.trainerDetails?.languagesSpoken || ["Arabic"],
          services: updatedTrainer.trainerDetails?.services || [{ serviceName: "", fee: "" }],
          openingHours: updatedTrainer.trainerDetails?.openingHours || {
            monday: "Closed", mondayStart: "", mondayEnd: "", mondayStart2: "", mondayEnd2: "",
            tuesday: "Closed", tuesdayStart: "", tuesdayEnd: "", tuesdayStart2: "", tuesdayEnd2: "",
            wednesday: "Closed", wednesdayStart: "", wednesdayEnd: "", wednesdayStart2: "", wednesdayEnd2: "",
            thursday: "Closed", thursdayStart: "", thursdayEnd: "", thursdayStart2: "", thursdayEnd2: "",
            friday: "Closed", fridayStart: "", fridayEnd: "", fridayStart2: "", fridayEnd2: "",
            saturday: "Closed", saturdayStart: "", saturdayEnd: "", saturdayStart2: "", saturdayEnd2: "",
            sunday: "Closed", sundayStart: "", sundayEnd: "", sundayStart2: "", sundayEnd2: "",
          },
          breedsTrained: updatedTrainer.trainerDetails?.breedsTrained || [],
          averageSessionDuration: updatedTrainer.trainerDetails?.averageSessionDuration || "",
          socialLinks: updatedTrainer.trainerDetails?.socialLinks || { facebook: "", instagram: "", website: "" },
        },
      });
      setTempImage(updatedTrainer.image || DEFAULT_PROFILE_IMAGE);
      setBusinessCardImage(updatedTrainer.trainerDetails?.businessCardImage || DEFAULT_BUSINESS_CARD_IMAGE);
      setCertificationImage(updatedTrainer.trainerDetails?.certificationImage || null);
      setTrainingPhotos(updatedTrainer.trainerDetails?.trainingPhotos || []);
      setIsEditing(false);
      toast.success("Profile updated successfully!", { position: "top-right", autoClose: 3000 });
    } catch (error) {
      toast.error(`Error saving profile: ${error.response?.data?.message || error.message}`, { position: "top-right", autoClose: 3000 });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCancelEdit = useCallback(() => {
    if (trainerData) {
      setEditableData({
        fullName: trainerData.fullName || "",
        gender: trainerData.gender || "",
        about: trainerData.about || "",
        email: trainerData.email || "",
        trainerDetails: {
          governorate: trainerData.trainerDetails?.governorate || "",
          delegation: trainerData.trainerDetails?.delegation || "",
          geolocation: trainerData.trainerDetails?.geolocation || { latitude: 36.8665367, longitude: 10.1647233 },
          trainingFacilityType: trainerData.trainerDetails?.trainingFacilityType || "",
          serviceAreas: trainerData.trainerDetails?.serviceAreas || [],
          phone: trainerData.trainerDetails?.phone || "",
          secondaryPhone: trainerData.trainerDetails?.secondaryPhone || "",
          languagesSpoken: trainerData.trainerDetails?.languagesSpoken || ["Arabic"],
          services: trainerData.trainerDetails?.services || [{ serviceName: "", fee: "" }],
          openingHours: trainerData.trainerDetails?.openingHours || {
            monday: "Closed", mondayStart: "", mondayEnd: "", mondayStart2: "", mondayEnd2: "",
            tuesday: "Closed", tuesdayStart: "", tuesdayEnd: "", tuesdayStart2: "", tuesdayEnd2: "",
            wednesday: "Closed", wednesdayStart: "", wednesdayEnd: "", wednesdayStart2: "", wednesdayEnd2: "",
            thursday: "Closed", thursdayStart: "", thursdayEnd: "", thursdayStart2: "", thursdayEnd2: "",
            friday: "Closed", fridayStart: "", fridayEnd: "", fridayStart2: "", fridayEnd2: "",
            saturday: "Closed", saturdayStart: "", saturdayEnd: "", saturdayStart2: "", saturdayEnd2: "",
            sunday: "Closed", sundayStart: "", sundayEnd: "", sundayStart2: "", sundayEnd2: "",
          },
          breedsTrained: trainerData.trainerDetails?.breedsTrained || [],
          averageSessionDuration: trainerData.trainerDetails?.averageSessionDuration || "",
          socialLinks: trainerData.trainerDetails?.socialLinks || { facebook: "", instagram: "", website: "" },
        },
      });
      setTempImage(trainerData.image || DEFAULT_PROFILE_IMAGE);
      setBusinessCardImage(trainerData.trainerDetails?.businessCardImage || DEFAULT_BUSINESS_CARD_IMAGE);
      setCertificationImage(trainerData.trainerDetails?.certificationImage || null);
      setTrainingPhotos(trainerData.trainerDetails?.trainingPhotos || []);
    }
    setIsEditing(false);
  }, [trainerData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-[#ffc929] animate-spin" />
        <span className="ml-4 text-lg font-medium text-gray-700">Loading your profile...</span>
      </div>
    );
  }

  if (error || !trainerData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="max-w-lg p-8 mx-auto text-center text-gray-600 bg-white border border-gray-100 shadow-md rounded-xl">
          <X className="w-8 h-8 text-[#ffc929] mb-4 mx-auto" />
          <h2 className="mb-2 text-2xl font-semibold">Profile Error</h2>
          <p>{error || "No trainer profile available"}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-[#ffc929] to-[#ff6f91] text-white rounded-xl hover:from-[#ffa726] hover:to-[#ff8b9d] transition-colors shadow-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl p-6 mx-auto">
        <div className="p-6 mb-6 bg-white border border-gray-100 shadow-md rounded-xl">
          {!trainerData?.isActive && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-medium text-red-700">
                Your account is deactivated. Editing is disabled until reactivated by an admin.
              </p>
            </div>
          )}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {isEditing && trainerData?.isActive ? (
                <label className="relative block group">
                  <img
                    src={tempImage}
                    alt={editableData.fullName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#ffc929]/20 ring-2 ring-[#ff6f91]/20"
                  />
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black rounded-full opacity-0 cursor-pointer bg-opacity-40 group-hover:opacity-100">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "profile")}
                    className="hidden"
                    disabled={uploadLoading}
                  />
                  {uploadLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-full">
                      <Loader2 className="w-5 h-5 text-[#ffc929] animate-spin" />
                    </div>
                  )}
                </label>
              ) : (
                <img
                  src={tempImage}
                  alt={editableData.fullName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#ffc929]/20 ring-2 ring-[#ff6f91]/20"
                />
              )}
              <div>
                {isEditing ? (
                  <FullNameInput
                    value={editableData.fullName}
                    onChange={(value) => handleInputChange("fullName", value)}
                    disabled={!trainerData?.isActive}
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-800">{editableData.fullName || "Trainer"}</h1>
                )}
                <p className="flex items-center space-x-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{editableData.trainerDetails.phone || "N/A"}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100 rounded-xl"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={uploadLoading || !trainerData?.isActive}
                    className={`flex items-center px-4 py-2 rounded-xl transition-colors shadow-md ${
                      uploadLoading || !trainerData?.isActive
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#ffc929] to-[#ff6f91] text-white hover:from-[#ffa726] hover:to-[#ff8b9d]"
                    }`}
                  >
                    {uploadLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {uploadLoading ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() =>
                    trainerData?.isActive
                      ? setIsEditing(true)
                      : toast.error("Your account is deactivated. Editing is disabled.", {
                          position: "top-right",
                          autoClose: 3000,
                        })
                  }
                  className="flex items-center px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100 rounded-xl"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
            </div>
          </div>
          {isEditing && trainerData?.isActive && (
            <div className="flex items-center space-x-4">
              <label className="relative inline-block cursor-pointer">
                {businessCardImage !== DEFAULT_BUSINESS_CARD_IMAGE ? (
                  <img
                    src={businessCardImage}
                    alt="Business Card"
                    className="h-12 w-24 rounded object-cover border-2 border-[#ffc929]/20"
                  />
                ) : (
                  <div className="h-12 w-24 rounded bg-gray-50 border-2 border-[#ffc929]/20 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "BusinessCard")}
                  className="hidden"
                  disabled={uploadLoading}
                />
                {uploadLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded">
                    <Loader2 className="w-4 h-4 text-[#ffc929] animate-spin" />
                  </div>
                )}
              </label>
              <span className="text-sm text-gray-500">Business Card</span>
            </div>
          )}
        </div>

        <CollapsibleSection
          title="Personal Information"
          icon={User}
          isOpen={openSections.personal}
          toggleOpen={() => toggleSection("personal")}
          description="Update your personal details below."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm text-gray-600">Gender</label>
              {isEditing ? (
                <select
                  value={editableData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
                  disabled={!trainerData?.isActive}
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : (
                <p className="text-gray-800">{editableData.gender || "N/A"}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-600">About</label>
              {isEditing ? (
                <textarea
                  value={editableData.about}
                  onChange={(e) => handleInputChange("about", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
                  rows={4}
                  disabled={!trainerData?.isActive}
                />
              ) : (
                <p className="text-gray-800">{editableData.about || "Not provided"}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-600">Primary Phone</label>
              {isEditing ? (
                <PhoneInput
                  value={editableData.trainerDetails.phone}
                  onChange={(value) => handleInputChange("phone", value, "trainerDetails")}
                  disabled={!trainerData?.isActive}
                />
              ) : (
                <p className="text-gray-800">{editableData.trainerDetails.phone || "N/A"}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-600">Secondary Phone</label>
              {isEditing ? (
                <PhoneInput
                  value={editableData.trainerDetails.secondaryPhone}
                  onChange={(value) => handleInputChange("secondaryPhone", value, "trainerDetails")}
                  disabled={!trainerData?.isActive}
                />
              ) : (
                <p className="text-gray-800">{editableData.trainerDetails.secondaryPhone || "Not provided"}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-600">Languages Spoken</label>
              {isEditing ? (
                <div className="space-y-2">
                  {["Arabic", "French", "English"].map((lang) => (
                    <label key={lang} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editableData.trainerDetails.languagesSpoken.includes(lang)}
                        onChange={(e) => {
                          const newLanguages = e.target.checked
                            ? [...editableData.trainerDetails.languagesSpoken, lang]
                            : editableData.trainerDetails.languagesSpoken.filter((l) => l !== lang);
                          handleInputChange("languagesSpoken", newLanguages, "trainerDetails");
                        }}
                        disabled={!trainerData?.isActive}
                      />
                      <span>{lang}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-800">
                  {editableData.trainerDetails.languagesSpoken.join(", ") || "None"}
                </p>
              )}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Professional Details"
          icon={Award}
          isOpen={openSections.professional}
          toggleOpen={() => toggleSection("professional")}
          description="Manage your professional credentials and specialties."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm text-gray-600">Average Session Duration</label>
              {isEditing ? (
                <select
                  value={editableData.trainerDetails.averageSessionDuration}
                  onChange={(e) => handleInputChange("averageSessionDuration", e.target.value, "trainerDetails")}
                  className="w-full px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
                  disabled={!trainerData?.isActive}
                >
                  <option value="" disabled>Select Duration</option>
                  {[15, 20, 25, 30, 45, 50, 55, 60, 75, 90, 120].map((duration) => (
                    <option key={duration} value={duration}>
                      {duration} mins
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-800">
                  {editableData.trainerDetails.averageSessionDuration
                    ? `${editableData.trainerDetails.averageSessionDuration} mins`
                    : "Not provided"}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-600">Breeds Trained</label>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <select
                      value={selectedSpecies}
                      onChange={(e) => {
                        setSelectedSpecies(e.target.value);
                        setSelectedBreed("");
                      }}
                      className="w-1/2 px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
                      disabled={!trainerData?.isActive}
                    >
                      {SPECIES_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedBreed}
                      onChange={(e) => setSelectedBreed(e.target.value)}
                      className="w-1/2 px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
                      disabled={!trainerData?.isActive}
                    >
                      <option value="" disabled>
                        Select a breed
                      </option>
                      {breeds[selectedSpecies]
                        .filter(
                          (breed) =>
                            !editableData.trainerDetails.breedsTrained.some(
                              (b) => b.species === selectedSpecies && b.breedName === breed
                            )
                        )
                        .map((breed) => (
                          <option key={breed} value={breed}>
                            {breed}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={addBreed}
                      className="px-4 py-3 bg-gradient-to-r from-[#ffc929] to-[#ff6f91] text-white rounded-xl hover:from-[#ffa726] hover:to-[#ff8b9d] transition-colors shadow-md"
                      disabled={!selectedBreed || !trainerData?.isActive}
                    >
                      Add
                    </button>
                  </div>
                  {editableData.trainerDetails.breedsTrained.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {editableData.trainerDetails.breedsTrained.map((breed, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-1 bg-[#ffc929]/10 rounded-full"
                        >
                          <span className="text-sm">{`${breed.breedName} (${breed.species})`}</span>
                          <button
                            onClick={() => removeBreed(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={!trainerData?.isActive}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic text-gray-500">No breeds added yet</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-800">
                  {editableData.trainerDetails.breedsTrained
                    .map((b) => `${b.breedName} (${b.species})`)
                    .join(", ") || "None"}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-600">Certification</label>
              {certificationImage ? (
                <img
                  src={certificationImage}
                  alt="Certification"
                  className="w-24 h-24 rounded-md object-cover border-2 border-[#ffc929]/20"
                />
              ) : (
                <p className="text-gray-800">No certification photo uploaded</p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-600">Training Photos</label>
              {isEditing && trainerData?.isActive && (
                <label className="block mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, "trainingPhotos")}
                    className="block text-sm text-gray-500"
                    disabled={uploadLoading || !trainerData?.isActive}
                  />
                </label>
              )}
              {trainingPhotos.length > 0 ? (
                <div className="flex flex-wrap gap-3 mt-2">
                  {trainingPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Training Photo ${index + 1}`}
                        className="w-24 h-24 rounded-md object-cover border-2 border-[#ffc929]/20"
                      />
                      {isEditing && trainerData?.isActive && (
                        <button
                          onClick={() => handleRemoveTrainingPhoto(index)}
                          className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-gray-500">No training photos uploaded</p>
              )}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Facility Details"
          icon={FaMapMarkedAlt}
          isOpen={openSections.facility}
          toggleOpen={() => toggleSection("facility")}
          description="Specify your training facility details or service areas."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
                  <FaMapMarkedAlt size={16} className="text-[#ffc929]" />
                </span>
                Training Facility Type
              </label>
              <Tooltip
                text="Choose whether you operate from a fixed facility or provide mobile training services."
                ariaLabel="Facility type information"
              >
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
                >
                  <span className="sr-only">Facility type information</span>
                  <Info size={16} className="text-gray-400" />
                </button>
              </Tooltip>
            </div>
            <div>
              {isEditing ? (
                <select
                  value={editableData.trainerDetails.trainingFacilityType}
                  onChange={(e) => handleInputChange("trainingFacilityType", e.target.value, "trainerDetails")}
                  className="w-full px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
                  disabled={!trainerData?.isActive}
                >
                  <option value="" disabled>
                    Select Facility Type
                  </option>
                  <option value="Fixed Facility">Fixed Facility</option>
                  <option value="Mobile">Mobile</option>
                </select>
              ) : (
                <p className="text-gray-800">{editableData.trainerDetails.trainingFacilityType || "Not provided"}</p>
              )}
            </div>
            {editableData.trainerDetails.trainingFacilityType === "Fixed Facility" && (
              <>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Governorate</label>
                  {isEditing ? (
                    <select
                      value={editableData.trainerDetails.governorate}
                      onChange={(e) => handleInputChange("governorate", e.target.value, "trainerDetails")}
                      className="w-full px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
                      disabled={!trainerData?.isActive}
                    >
                      <option value="" disabled>
                        Select Governorate
                      </option>
                      {governorates.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-800">{editableData.trainerDetails.governorate || "Not provided"}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Delegation</label>
                  {isEditing ? (
                    <select
                      value={editableData.trainerDetails.delegation}
                      onChange={(e) => handleInputChange("delegation", e.target.value, "trainerDetails")}
                      className={`w-full px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300 ${
                        !editableData.trainerDetails.governorate ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      disabled={!trainerData?.isActive || !editableData.trainerDetails.governorate}
                    >
                      <option value="" disabled>
                        {!editableData.trainerDetails.governorate ? "Select governorate first" : "Select Delegation"}
                      </option>
                      {(delegationsByGovernorate[editableData.trainerDetails.governorate] || []).map(
                        (delegation) => (
                          <option key={delegation} value={delegation}>
                            {delegation}
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <p className="text-gray-800">{editableData.trainerDetails.delegation || "Not provided"}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
                        <MapPin size={16} className="text-[#ffc929]" />
                      </span>
                      Facility Location
                    </label>
                    <Tooltip
                      text="Click the map to select your facility's exact location or use your current location. This will automatically update the governorate and delegation."
                      ariaLabel="Facility location information"
                    >
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
                      >
                        <span className="sr-only">Facility location information</span>
                        <Info size={16} className="text-gray-400" />
                      </button>
                    </Tooltip>
                  </div>
                  {isEditing && trainerData?.isActive ? (
                    <div>
                      <MapPicker
                        position={editableData.trainerDetails.geolocation}
                        setPosition={handleMapPositionChange}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Click the map to update your governorate and delegation automatically.
                      </p>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="mt-2 flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ff6f91] rounded-xl hover:from-[#ffa726] hover:to-[#ff8b9d] shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#ffc929]/50 focus:outline-none transition-all duration-300"
                        disabled={uploadLoading}
                      >
                        <MapPin size={18} />
                        Use Current Location
                      </button>
                    </div>
                  ) : (
                    <div>
                      <MapViewer position={editableData.trainerDetails.geolocation} />
                      <a
                        href={`https://www.google.com/maps?q=${editableData.trainerDetails.geolocation.latitude},${editableData.trainerDetails.geolocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-[#ffc929] hover:underline flex items-center space-x-2"
                      >
                        <Globe className="w-5 h-5" />
                        <span>View on Google Maps</span>
                      </a>
                    </div>
                  )}
                </div>
              </>
            )}
            {editableData.trainerDetails.trainingFacilityType === "Mobile" && (
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
                      <FaMapMarkedAlt size={16} className="text-[#ffc929]" />
                    </span>
                    Service Areas
                  </label>
                  <Tooltip
                    text="Select the governorates where you provide mobile training services."
                    ariaLabel="Service areas information"
                  >
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
                    >
                      <span className="sr-only">Service areas information</span>
                      <Info size={16} className="text-gray-400" />
                    </button>
                  </Tooltip>
                </div>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <select
                        value={serviceAreaGov}
                        onChange={(e) => setServiceAreaGov(e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
                        disabled={!trainerData?.isActive}
                      >
                        <option value="" disabled>
                          Select Governorate
                        </option>
                        {governorates
                          .filter(
                            (gov) =>
                              !editableData.trainerDetails.serviceAreas.some(
                                (area) => area.governorate === gov
                              )
                          )
                          .map((gov) => (
                            <option key={gov} value={gov}>
                              {gov}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={addServiceArea}
                        className="p-3 text-white bg-gradient-to-r from-[#ffc929] to-[#ff6f91] rounded-xl hover:from-[#ffa726] hover:to-[#ff8b9d] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                        disabled={!serviceAreaGov || !trainerData?.isActive}
                      >
                        <X size={20} />
                      </button>
                    </div>
                    {editableData.trainerDetails.serviceAreas.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {editableData.trainerDetails.serviceAreas.map((area, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[#ffc929]/10 text-gray-800 rounded-full transition-all duration-300"
                          >
                            <span>{area.governorate}</span>
                            <button
                              onClick={() => removeServiceArea(index)}
                              className="text-gray-500 hover:text-red-600"
                              disabled={!trainerData?.isActive}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm italic text-gray-500">No service areas added yet</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-800">
                    {editableData.trainerDetails.serviceAreas.map((a) => a.governorate).join(", ") ||
                      "None"}
                  </p>
                )}
              </div>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Services & Schedule"
          icon={Clock}
          isOpen={openSections.services}
          toggleOpen={() => toggleSection("services")}
          description="Configure your services and availability."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm text-gray-600">Services</label>
              {isEditing ? (
                <div>
                  {editableData.trainerDetails.services.map((service, index) => (
                    <ServiceInput
                      key={index}
                      service={service}
                      index={index}
                      onChange={handleServiceChange}
                      onRemove={removeService}
                      disabled={!trainerData?.isActive}
                      existingServices={editableData.trainerDetails.services}
                    />
                  ))}
                  <button
                    onClick={addService}
                    className="mt-2 px-4 py-3 bg-gradient-to-r from-[#ffc929] to-[#ff6f91] text-white rounded-xl hover:from-[#ffa726] hover:to-[#ff8b9d] transition-colors shadow-md"
                    disabled={!trainerData?.isActive}
                  >
                    Add Service
                  </button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {editableData.trainerDetails.services.length > 0 ? (
                    editableData.trainerDetails.services.map((service, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center bg-[#ffc929]/10 rounded-lg p-2"
                      >
                        <span className="text-gray-800">{service.serviceName}</span>
                        <span className="text-[#ff6f91] font-semibold">{service.fee} TND</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm italic text-gray-500">No services added yet</p>
                  )}
                </ul>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-600">Opening Hours</label>
              <div className="grid gap-3 md:grid-cols-2">
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(
                  (day) => {
                    const schedule = editableData.trainerDetails.openingHours[day] || "Closed";
                    return (
                      <div
                        key={day}
                        className={`p-3 rounded-lg ${
                          schedule === "Closed"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-[#ffc929]/10 text-[#ff6f91]"
                        }`}
                      >
                        <p className="mb-2 font-semibold capitalize">{day}</p>
                        {isEditing ? (
                          <div>
                            <select
                              value={schedule}
                              onChange={(e) => handleOpeningHoursChange(day, "", e.target.value)}
                              className="w-full mb-2 px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
                              disabled={!trainerData?.isActive}
                            >
                              <option value="Closed">Closed</option>
                              <option value="Single Session">Single Session</option>
                              <option value="Double Session">Double Session</option>
                            </select>
                            {schedule !== "Closed" && (
                              <>
                                <input
                                  type="time"
                                  value={editableData.trainerDetails.openingHours[`${day}Start`] || ""}
                                  onChange={(e) =>
                                    handleOpeningHoursChange(day, "Start", e.target.value)
                                  }
                                  className="w-full mb-2 px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
                                  disabled={!trainerData?.isActive}
                                />
                                <input
                                  type="time"
                                  value={editableData.trainerDetails.openingHours[`${day}End`] || ""}
                                  onChange={(e) =>
                                    handleOpeningHoursChange(day, "End", e.target.value)
                                  }
                                  className="w-full mb-2 px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
                                  disabled={!trainerData?.isActive}
                                />
                                {schedule === "Double Session" && (
                                  <>
                                    <input
                                      type="time"
                                      value={
                                        editableData.trainerDetails.openingHours[`${day}Start2`] || ""
                                      }
                                      onChange={(e) =>
                                        handleOpeningHoursChange(day, "Start2", e.target.value)
                                      }
                                      className="w-full mb-2 px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
                                      disabled={!trainerData?.isActive}
                                    />
                                    <input
                                      type="time"
                                      value={
                                        editableData.trainerDetails.openingHours[`${day}End2`] || ""
                                      }
                                      onChange={(e) =>
                                        handleOpeningHoursChange(day, "End2", e.target.value)
                                      }
                                      className="w-full px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
                                      disabled={!trainerData?.isActive}
                                    />
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm">
                            {schedule === "Closed" ? (
                              "Closed"
                            ) : schedule === "Single Session" ? (
                              `${
                                editableData.trainerDetails.openingHours[`${day}Start`] || "N/A"
                              } - ${editableData.trainerDetails.openingHours[`${day}End`] || "N/A"}`
                            ) : (
                              <>
                                First:{" "}
                                {`${
                                  editableData.trainerDetails.openingHours[`${day}Start`] || "N/A"
                                } - ${
                                  editableData.trainerDetails.openingHours[`${day}End`] || "N/A"
                                }`}
                                <br />
                                Second:{" "}
                                {`${
                                  editableData.trainerDetails.openingHours[`${day}Start2`] || "N/A"
                                } - ${
                                  editableData.trainerDetails.openingHours[`${day}End2`] || "N/A"
                                }`}
                              </>
                            )}
                          </p>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Social Media"
          icon={Globe}
          isOpen={openSections.social}
          toggleOpen={() => toggleSection("social")}
          description="Add links to your social media profiles."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Facebook className="w-5 h-5 text-[#3b5998]" />
              {isEditing ? (
                <input
                  type="url"
                  value={editableData.trainerDetails.socialLinks.facebook}
                  onChange={(e) =>
                    handleInputChange("socialLinks", { facebook: e.target.value }, "trainerDetails")
                  }
                  className="w-full px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
                  placeholder="https://facebook.com/yourprofile"
                  disabled={!trainerData?.isActive}
                />
              ) : (
                <p className="text-gray-800">{editableData.trainerDetails.socialLinks.facebook || "Not provided"}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Instagram className="w-5 h-5 text-[#e1306c]" />
              {isEditing ? (
                <input
                  type="url"
                  value={editableData.trainerDetails.socialLinks.instagram}
                  onChange={(e) =>
                    handleInputChange("socialLinks", { instagram: e.target.value }, "trainerDetails")
                  }
                  className="w-full px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
                  placeholder="https://instagram.com/yourprofile"
                  disabled={!trainerData?.isActive}
                />
              ) : (
                <p className="text-gray-800">
                  {editableData.trainerDetails.socialLinks.instagram || "Not provided"}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-[#ffc929]" />
              {isEditing ? (
                <input
                  type="url"
                  value={editableData.trainerDetails.socialLinks.website}
                  onChange={(e) =>
                    handleInputChange("socialLinks", { website: e.target.value }, "trainerDetails")
                  }
                  className="w-full px-4 py-3 border-2 border-[#ffc929]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] bg-gray-50 shadow-sm transition-all duration-300"
                  placeholder="https://yourwebsite.com"
                  disabled={!trainerData?.isActive}
                />
              ) : (
                <p className="text-gray-800">{editableData.trainerDetails.socialLinks.website || "Not provided"}</p>
              )}
            </div>
          </div>
        </CollapsibleSection>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Profile;