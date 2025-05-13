import {
  AlertTriangle,
  Award,
  Clock,
  Edit,
  Facebook,
  Globe,
  Info,
  Instagram,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2,
  Upload,
  User,
  X
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { FaMapMarkedAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  delegationsByGovernorate,
  governorates,
} from "../../../assets/locations";
import { breeds, SPECIES_OPTIONS } from "../../../assets/Pet";
import axiosInstance from "../../../utils/axiosInstance";
import MapPicker from "../../map/MapPicker";
import MapViewer from "../../map/MapViewer";
import { Tooltip } from "../../Tooltip";

const DEFAULT_PROFILE_IMAGE = "/api/placeholder/250/250";
const DEFAULT_BUSINESS_CARD_IMAGE = "/api/placeholder/150/100";

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
      className="w-full px-4 py-3 text-lg font-medium text-gray-900 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
      placeholder="Enter your full name"
      disabled={disabled}
      aria-label="Full Name"
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
      type="tel"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      className="w-full px-4 py-3 text-gray-900 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
      placeholder="Enter phone number"
      disabled={disabled}
      aria-label="Phone Number"
    />
  );
};

const ServiceInput = ({
  service,
  index,
  onChange,
  onRemove,
  disabled,
  existingServices,
}) => {
  const [localServiceName, setLocalServiceName] = useState(service.serviceName);
  const [localFee, setLocalFee] = useState(service.fee);

  useEffect(() => {
    setLocalServiceName(service.serviceName);
    setLocalFee(service.fee);
  }, [service]);

  const handleBlur = (field) => {
    onChange(
      index,
      field,
      field === "serviceName" ? localServiceName : localFee
    );
  };

  const availableServices = [
    { id: 1, name: "Basic Training" },
    { id: 2, name: "Guard Dog Training" },
  ].filter(
    (category) =>
      !existingServices.some(
        (s, i) => s.serviceName === category.name && i !== index
      )
  );

  return (
    <div className="flex items-center gap-3 mb-4">
      <select
        value={localServiceName}
        onChange={(e) => setLocalServiceName(e.target.value)}
        onBlur={() => handleBlur("serviceName")}
        className="flex-1 px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
        disabled={disabled}
        aria-label={`Service Name ${index + 1}`}
      >
        <option value="" disabled>
          Select a service
        </option>
        {availableServices.map((category) => (
          <option key={category.id} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={localFee}
        onChange={(e) => setLocalFee(e.target.value)}
        onBlur={() => handleBlur("fee")}
        className="px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm w-28 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="Fee"
        min="0"
        disabled={disabled}
        aria-label={`Service Fee ${index + 1}`}
      />
      <button
        onClick={() => onRemove(index)}
        className="p-2 text-red-500 transition-colors hover:text-red-600 disabled:text-gray-400 disabled:cursor-not-allowed"
        disabled={disabled}
        aria-label={`Remove Service ${localServiceName || index + 1}`}
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

const ProfileSection = React.memo(({ icon: Icon, title, children }) => (
  <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-sm">
    <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
      <Icon className="text-yellow-500 w-7 h-7" />
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
));
const NavButton = React.memo(({ section, label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={() => onClick(section)}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-yellow-500 to-pink-500 text-white shadow-sm"
        : "text-gray-600 bg-white hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50"
    } focus:outline-none focus:ring-2 focus:ring-[#ffc929]`}
    aria-label={`Navigate to ${label} section`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
));
const Profile = ({isSidebarCollapsed }) => {
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
  const [activeTab, setActiveTab] = useState("personal");
  const [selectedSpecies, setSelectedSpecies] = useState("dog");
  const [selectedBreed, setSelectedBreed] = useState("");
  const [serviceAreaGov, setServiceAreaGov] = useState("");

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
            geolocation: trainer.trainerDetails?.geolocation || {
              latitude: 36.8665367,
              longitude: 10.1647233,
            },
            trainingFacilityType: trainer.trainerDetails?.trainingFacilityType || "",
            serviceAreas: trainer.trainerDetails?.serviceAreas || [],
            phone: trainer.trainerDetails?.phone || "",
            secondaryPhone: trainer.trainerDetails?.secondaryPhone || "",
            languagesSpoken: trainer.trainerDetails?.languagesSpoken || ["Arabic"],
            services: trainer.trainerDetails?.services || [{ serviceName: "", fee: "" }],
            openingHours: trainer.trainerDetails?.openingHours || {
              monday: "Closed",
              mondayStart: "",
              mondayEnd: "",
              mondayStart2: "",
              mondayEnd2: "",
              tuesday: "Closed",
              tuesdayStart: "",
              tuesdayEnd: "",
              tuesdayStart2: "",
              tuesdayEnd2: "",
              wednesday: "Closed",
              wednesdayStart: "",
              wednesdayEnd: "",
              wednesdayStart2: "",
              wednesdayEnd2: "",
              thursday: "Closed",
              thursdayStart: "",
              thursdayEnd: "",
              thursdayStart2: "",
              thursdayEnd2: "",
              friday: "Closed",
              fridayStart: "",
              fridayEnd: "",
              fridayStart2: "",
              fridayEnd2: "",
              saturday: "Closed",
              saturdayStart: "",
              saturdayEnd: "",
              saturdayStart2: "",
              saturdayEnd2: "",
              sunday: "Closed",
              sundayStart: "",
              sundayEnd: "",
              sundayStart2: "",
              sundayEnd2: "",
            },
            breedsTrained: trainer.trainerDetails?.breedsTrained || [],
            averageSessionDuration: trainer.trainerDetails?.averageSessionDuration || "",
            socialLinks: trainer.trainerDetails?.socialLinks || {
              facebook: "",
              instagram: "",
              website: "",
            },
          },
        });
        setTempImage(trainer.image || DEFAULT_PROFILE_IMAGE);
        setBusinessCardImage(
          trainer.trainerDetails?.businessCardImage || DEFAULT_BUSINESS_CARD_IMAGE
        );
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
          trainerDetails: {
            ...prev.trainerDetails,
            [field]: value,
            delegation: "",
          },
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
        const governorateRaw = (data.address.state || "Tunis").replace(
          /^Gouvernorat\s+/i,
          ""
        );
        const normalizedGovernorate = governorateRaw
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        const matchedGovernorate =
          governorates.find((gov) => {
            const normalizedGov = gov
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
            return (
              normalizedGov === normalizedGovernorate ||
              normalizedGov.includes(normalizedGovernorate) ||
              normalizedGovernorate.includes(normalizedGov)
            );
          }) || "Tunis";

        const availableDelegations =
          delegationsByGovernorate[matchedGovernorate] || [];

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

        const stateDistrictRaw = (data.address.state_district || "")
          .replace(/^Délégation\s+/i, "")
          .trim();
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
            availableDelegations.find((del) =>
              del.toLowerCase().includes("ville")
            ) ||
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
        handleInputChange(
          "delegation",
          delegationsByGovernorate["Tunis"]?.[0] || "Tunis",
          "trainerDetails"
        );
      }
    } catch (error) {
      console.error("Nominatim reverse geocoding error:", error);
      handleInputChange("governorate", "Tunis", "trainerDetails");
      handleInputChange(
        "delegation",
        delegationsByGovernorate["Tunis"]?.[0] || "Tunis",
        "trainerDetails"
      );
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
          toast.error("Unable to retrieve your location.", {
            position: "top-right",
            autoClose: 3000,
            theme: "light",
          });
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    }
  };

  const handleServiceChange = useCallback((index, field, value) => {
    setEditableData((prev) => {
      const trainerDetails = prev.trainerDetails || {};
      const services = trainerDetails.services || [{ serviceName: "", fee: "" }];
      const newServices = [...services];
      newServices[index] = {
        ...newServices[index],
        [field]: field === "fee" ? parseFloat(value) || 0 : value,
      };
      return {
        ...prev,
        trainerDetails: { ...trainerDetails, services: newServices },
      };
    });
  }, []);

  const addService = useCallback(() => {
    setEditableData((prev) => {
      const trainerDetails = prev.trainerDetails || {};
      const services = trainerDetails.services || [];
      if (services.length >= 2) {
        toast.error("You can only add up to two services.", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
        return prev;
      }
      return {
        ...prev,
        trainerDetails: {
          ...trainerDetails,
          services: [...services, { serviceName: "", fee: 0 }],
        },
      };
    });
  }, []);

  const removeService = useCallback((index) => {
    setEditableData((prev) => {
      const trainerDetails = prev.trainerDetails || {};
      const services = trainerDetails.services || [];
      return {
        ...prev,
        trainerDetails: {
          ...trainerDetails,
          services: services.filter((_, i) => i !== index),
        },
      };
    });
  }, []);

  const handleOpeningHoursChange = useCallback((day, field, value) => {
    setEditableData((prev) => {
      const updatedOpeningHours = {
        ...prev.trainerDetails.openingHours,
        [`${day}${field}`]: value,
      };
      if (value === "Closed") {
        updatedOpeningHours[`${day}Start`] = "";
        updatedOpeningHours[`${day}End`] = "";
        updatedOpeningHours[`${day}Start2`] = "";
        updatedOpeningHours[`${day}End2`] = "";
      }
      return {
        ...prev,
        trainerDetails: {
          ...prev.trainerDetails,
          openingHours: updatedOpeningHours,
        },
      };
    });
  }, []);

  const addServiceArea = useCallback(() => {
    if (serviceAreaGov) {
      setEditableData((prev) => ({
        ...prev,
        trainerDetails: {
          ...prev.trainerDetails,
          serviceAreas: [
            ...prev.trainerDetails.serviceAreas,
            { governorate: serviceAreaGov, delegations: [] },
          ],
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
        serviceAreas: prev.trainerDetails.serviceAreas.filter(
          (_, i) => i !== index
        ),
      },
    }));
  }, []);

  const addBreed = useCallback(() => {
    if (
      selectedBreed &&
      !editableData.trainerDetails.breedsTrained.some(
        (b) => b.species === selectedSpecies && b.breedName === selectedBreed
      )
    ) {
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
        breedsTrained: prev.trainerDetails.breedsTrained.filter(
          (_, i) => i !== index
        ),
      },
    }));
  }, []);

  const handleImageUpload = async (e, type) => {
    if (!trainerData?.isActive) {
      toast.error("Your account is deactivated. Image uploads are disabled.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadLoading(true);

    const uploadPromises = Array.from(files).map(async (file) => {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is not an image or exceeds 5MB.`, {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
        return null;
      }

      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      try {
        const response = await axiosInstance.post(
          "/api/upload",
          uploadFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return response.data.url;
      } catch (error) {
        toast.error(`Failed to upload ${file.name}.`, {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
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

  const handleRemoveTrainingPhoto = useCallback(
    (index) => {
      if (!trainerData?.isActive) {
        toast.error("Your account is deactivated. You cannot remove photos.", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
        return;
      }
      setTrainingPhotos((prev) => prev.filter((_, i) => i !== index));
    },
    [trainerData]
  );

  const handleSaveChanges = async () => {
    if (!trainerData?.isActive) {
      toast.error("Your account is deactivated. You cannot save changes.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
      return;
    }

    try {
      setUploadLoading(true);

      const updatedData = {
        userId: trainerData._id,
        fullName: editableData.fullName || trainerData.fullName,
        image:
          tempImage !== DEFAULT_PROFILE_IMAGE ? tempImage : trainerData.image,
        gender: editableData.gender || trainerData.gender,
        about: editableData.about || trainerData.about,
        trainerDetails: {
          governorate: editableData.trainerDetails.governorate || null,
          delegation: editableData.trainerDetails.delegation || null,
          geolocation: editableData.trainerDetails.geolocation,
          trainingFacilityType:
            editableData.trainerDetails.trainingFacilityType || null,
          serviceAreas: editableData.trainerDetails.serviceAreas || [],
          phone: editableData.trainerDetails.phone || null,
          secondaryPhone: editableData.trainerDetails.secondaryPhone || null,
          languagesSpoken: editableData.trainerDetails.languagesSpoken || [],
          services: editableData.trainerDetails.services || [],
          openingHours: editableData.trainerDetails.openingHours,
          breedsTrained: editableData.trainerDetails.breedsTrained || [],
          averageSessionDuration:
            parseInt(editableData.trainerDetails.averageSessionDuration) ||
            null,
          socialLinks: editableData.trainerDetails.socialLinks || {},
          trainingPhotos,
          businessCardImage:
            businessCardImage !== DEFAULT_BUSINESS_CARD_IMAGE
              ? businessCardImage
              : null,
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
          geolocation: updatedTrainer.trainerDetails?.geolocation || {
            latitude: 36.8665367,
            longitude: 10.1647233,
          },
          trainingFacilityType:
            updatedTrainer.trainerDetails?.trainingFacilityType || "",
          serviceAreas: updatedTrainer.trainerDetails?.serviceAreas || [],
          phone: updatedTrainer.trainerDetails?.phone || "",
          secondaryPhone: updatedTrainer.trainerDetails?.secondaryPhone || "",
          languagesSpoken: updatedTrainer.trainerDetails?.languagesSpoken || [
            "Arabic",
          ],
          services: updatedTrainer.trainerDetails?.services || [
            { serviceName: "", fee: "" },
          ],
          openingHours: updatedTrainer.trainerDetails?.openingHours || {
            monday: "Closed",
            mondayStart: "",
            mondayEnd: "",
            mondayStart2: "",
            mondayEnd2: "",
            tuesday: "Closed",
            tuesdayStart: "",
            tuesdayEnd: "",
            tuesdayStart2: "",
            tuesdayEnd2: "",
            wednesday: "Closed",
            wednesdayStart: "",
            wednesdayEnd: "",
            wednesdayStart2: "",
            wednesdayEnd2: "",
            thursday: "Closed",
            thursdayStart: "",
            thursdayEnd: "",
            thursdayStart2: "",
            thursdayEnd2: "",
            friday: "Closed",
            fridayStart: "",
            fridayEnd: "",
            fridayStart2: "",
            fridayEnd2: "",
            saturday: "Closed",
            saturdayStart: "",
            saturdayEnd: "",
            saturdayStart2: "",
            saturdayEnd2: "",
            sunday: "Closed",
            sundayStart: "",
            sundayEnd: "",
            sundayStart2: "",
            sundayEnd2: "",
          },
          breedsTrained: updatedTrainer.trainerDetails?.breedsTrained || [],
          averageSessionDuration:
            updatedTrainer.trainerDetails?.averageSessionDuration || "",
          socialLinks: updatedTrainer.trainerDetails?.socialLinks || {
            facebook: "",
            instagram: "",
            website: "",
          },
        },
      });
      setTempImage(updatedTrainer.image || DEFAULT_PROFILE_IMAGE);
      setBusinessCardImage(
        updatedTrainer.trainerDetails?.businessCardImage ||
          DEFAULT_BUSINESS_CARD_IMAGE
      );
      setCertificationImage(
        updatedTrainer.trainerDetails?.certificationImage || null
      );
      setTrainingPhotos(updatedTrainer.trainerDetails?.trainingPhotos || []);
      setIsEditing(false);
      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    } catch (error) {
      toast.error(
        `Error saving profile: ${
          error.response?.data?.message || error.message
        }`,
        { position: "top-right", autoClose: 3000, theme: "light" }
      );
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
          geolocation: trainerData.trainerDetails?.geolocation || {
            latitude: 36.8665367,
            longitude: 10.1647233,
          },
          trainingFacilityType:
            trainerData.trainerDetails?.trainingFacilityType || "",
          serviceAreas: trainerData.trainerDetails?.serviceAreas || [],
          phone: trainerData.trainerDetails?.phone || "",
          secondaryPhone: trainerData.trainerDetails?.secondaryPhone || "",
          languagesSpoken: trainerData.trainerDetails?.languagesSpoken || [
            "Arabic",
          ],
          services: trainerData.trainerDetails?.services || [
            { serviceName: "", fee: "" },
          ],
          openingHours: trainerData.trainerDetails?.openingHours || {
            monday: "Closed",
            mondayStart: "",
            mondayEnd: "",
            mondayStart2: "",
            mondayEnd2: "",
            tuesday: "Closed",
            tuesdayStart: "",
            tuesdayEnd: "",
            tuesdayStart2: "",
            tuesdayEnd2: "",
            wednesday: "Closed",
            wednesdayStart: "",
            wednesdayEnd: "",
            wednesdayStart2: "",
            wednesdayEnd2: "",
            thursday: "Closed",
            thursdayStart: "",
            thursdayEnd: "",
            thursdayStart2: "",
            thursdayEnd2: "",
            friday: "Closed",
            fridayStart: "",
            fridayEnd: "",
            fridayStart2: "",
            fridayEnd2: "",
            saturday: "Closed",
            saturdayStart: "",
            saturdayEnd: "",
            saturdayStart2: "",
            saturdayEnd2: "",
            sunday: "Closed",
            sundayStart: "",
            sundayEnd: "",
            sundayStart2: "",
            sundayEnd2: "",
          },
          breedsTrained: trainerData.trainerDetails?.breedsTrained || [],
          averageSessionDuration:
            trainerData.trainerDetails?.averageSessionDuration || "",
          socialLinks: trainerData.trainerDetails?.socialLinks || {
            facebook: "",
            instagram: "",
            website: "",
          },
        },
      });
      setTempImage(trainerData.image || DEFAULT_PROFILE_IMAGE);
      setBusinessCardImage(
        trainerData.trainerDetails?.businessCardImage ||
          DEFAULT_BUSINESS_CARD_IMAGE
      );
      setCertificationImage(
        trainerData.trainerDetails?.certificationImage || null
      );
      setTrainingPhotos(trainerData.trainerDetails?.trainingPhotos || []);
    }
    setIsEditing(false);
  }, [trainerData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-yellow-50 to-pink-50">
        <Loader2 className="w-10 h-10 text-[#ffc929] animate-spin" />
        <span className="ml-3 text-lg font-medium text-gray-700">
          Loading profile...
        </span>
      </div>
    );
  }

  if (error || !trainerData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50">
        <div className="max-w-md p-6 text-center bg-white border border-gray-100 rounded-lg shadow-lg">
          <X className="w-8 h-8 mx-auto mb-3 text-[#ffc929]" />
          <h2 className="mb-2 text-xl font-semibold text-gray-800">Profile Error</h2>
          <p className="mb-4 text-gray-600">{error || "No trainer profile available"}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-white transition-colors bg-[#ffc929] rounded-lg shadow-sm hover:bg-[#ffa726]"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const TrainerProfileHeader = () => {
    return (
      <div className="bg-white border-b border-gray-100 shadow-sm">
        {!trainerData?.isActive && (
          <div className="flex items-center gap-2 p-3 border-b border-red-100 bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-medium text-red-700">
              Your account is deactivated. Editing is disabled until reactivated by an admin.
            </p>
          </div>
        )}
        <div className="max-w-6xl px-4 py-6 mx-auto">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex-shrink-0">
              {isEditing && trainerData?.isActive ? (
                <label className="relative block cursor-pointer group">
                  <img
                    src={tempImage}
                    alt={editableData.fullName}
                    className="object-cover w-24 h-24 border border-gray-200 rounded-lg shadow-sm"
                  />
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 bg-black rounded-lg opacity-0 bg-opacity-30 group-hover:opacity-100">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "profile")}
                    className="hidden"
                    disabled={uploadLoading}
                    aria-label="Upload Profile Image"
                  />
                  {uploadLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                      <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
                    </div>
                  )}
                </label>
              ) : (
                <img
                  src={tempImage}
                  alt={editableData.fullName}
                  className="object-cover w-24 h-24 border border-gray-200 rounded-lg shadow-sm"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  {isEditing ? (
                    <FullNameInput
                      value={editableData.fullName}
                      onChange={(value) => handleInputChange("fullName", value)}
                      disabled={!trainerData?.isActive}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-800">
                        {editableData.fullName || "Trainer"}
                      </h1>
                      {trainerData?.isActive ? (
                        <span className="px-2 py-1 text-xs text-green-700 bg-green-100 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs text-red-700 bg-red-100 rounded-full">
                          Deactivated
                        </span>
                      )}
                    </div>
                  )}
                  <p className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{editableData.trainerDetails.phone || "N/A"}</span>
                  </p>
                  <div className="flex items-center gap-3">
                    {editableData.trainerDetails.socialLinks.facebook && (
                      <a
                        href={editableData.trainerDetails.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook Profile"
                        className="transition-opacity hover:opacity-80"
                      >
                        <Facebook className="w-5 h-5 text-blue-600" />
                      </a>
                    )}
                    {editableData.trainerDetails.socialLinks.instagram && (
                      <a
                        href={editableData.trainerDetails.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram Profile"
                        className="transition-opacity hover:opacity-80"
                      >
                        <Instagram className="w-5 h-5 text-pink-600" />
                      </a>
                    )}
                    {editableData.trainerDetails.socialLinks.website && (
                      <a
                        href={editableData.trainerDetails.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Website"
                        className="transition-opacity hover:opacity-80"
                      >
                        <Globe className="w-5 h-5 text-yellow-500" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="mb-1 text-sm font-medium text-gray-600">Business Card</p>
                  {isEditing && trainerData?.isActive ? (
                    <label className="relative inline-block cursor-pointer group">
                      {businessCardImage !== DEFAULT_BUSINESS_CARD_IMAGE ? (
                        <img
                          src={businessCardImage}
                          alt="Business Card"
                          className="object-cover h-16 border border-gray-200 rounded-lg shadow-sm w-28"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-16 bg-gray-100 border border-gray-200 rounded-lg w-28">
                          <Upload className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 bg-black rounded-lg opacity-0 bg-opacity-30 group-hover:opacity-100">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "businessCard")}
                        className="hidden"
                        disabled={uploadLoading}
                        aria-label="Upload Business Card"
                      />
                      {uploadLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                          <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                        </div>
                      )}
                    </label>
                  ) : (
                    businessCardImage !== DEFAULT_BUSINESS_CARD_IMAGE && (
                      <img
                        src={businessCardImage}
                        alt="Business Card"
                        className="object-cover h-16 border border-gray-200 rounded-lg shadow-sm w-28"
                      />
                    )
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <NavButton
                    section="personal"
                    label="Personal"
                    icon={User}
                    isActive={activeTab === "personal"}
                    onClick={setActiveTab}
                  />
                  <NavButton
                    section="professional"
                    label="Professional"
                    icon={Award}
                    isActive={activeTab === "professional"}
                    onClick={setActiveTab}
                  />
                  <NavButton
                    section="facility"
                    label="Facility"
                    icon={FaMapMarkedAlt}
                    isActive={activeTab === "facility"}
                    onClick={setActiveTab}
                  />
                  <NavButton
                    section="services"
                    label="Services"
                    icon={Clock}
                    isActive={activeTab === "services"}
                    onClick={setActiveTab}
                  />
                  <NavButton
                    section="social"
                    label="Social"
                    icon={Globe}
                    isActive={activeTab === "social"}
                    onClick={setActiveTab}
                  />
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center px-4 py-2 text-gray-600 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                        aria-label="Cancel Editing"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveChanges}
                        disabled={uploadLoading || !trainerData?.isActive}
                        className={`flex items-center px-4 py-2 rounded-lg text-white transition-colors ${
                          uploadLoading || !trainerData?.isActive
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-yellow-500 hover:bg-yellow-600"
                        }`}
                        aria-label="Save Changes"
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
                          : toast.error(
                              "Your account is deactivated. Editing is disabled.",
                              {
                                position: "top-right",
                                autoClose: 3000,
                                theme: "light",
                              }
                            )
                      }
                      className="flex items-center px-4 py-2 text-gray-600 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                      aria-label="Edit Profile"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
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
    switch (activeTab) {
      case "personal":
        return (
          <div className="grid gap-6">
            <ProfileSection icon={User} title="Personal Information">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  {isEditing ? (
                    <select
                      value={editableData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="w-full px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={!trainerData?.isActive}
                      aria-label="Gender"
                    >
                      <option value="" disabled>
                        Select gender
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  ) : (
                    <p className="text-gray-800">{editableData.gender || "Not provided"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">About</label>
                  {isEditing ? (
                    <textarea
                      value={editableData.about}
                      onChange={(e) => handleInputChange("about", e.target.value)}
                      className="w-full px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] disabled:bg-gray-100 disabled:cursor-not-allowed"
                      rows={4}
                      placeholder="Tell us about yourself"
                      disabled={!trainerData?.isActive}
                      aria-label="About"
                    />
                  ) : (
                    <p className="text-gray-800">{editableData.about || "Not provided"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Primary Phone</label>
                  {isEditing ? (
                    <PhoneInput
                      value={editableData.trainerDetails.phone}
                      onChange={(value) => handleInputChange("phone", value, "trainerDetails")}
                      disabled={!trainerData?.isActive}
                    />
                  ) : (
                    <p className="text-gray-800">{editableData.trainerDetails.phone || "Not provided"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Secondary Phone</label>
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
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Languages Spoken</label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {["Arabic", "French", "English"].map((lang) => (
                        <label key={lang} className="flex items-center gap-2">
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
                            aria-label={`Language ${lang}`}
                            className="w-4 h-4 text-[#ffc929] border-gray-300 rounded focus:ring-[#ffc929]"
                          />
                          <span className="text-gray-700">{lang}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {editableData.trainerDetails.languagesSpoken.length > 0 ? (
                        editableData.trainerDetails.languagesSpoken.map((lang, index) => (
                          <span key={index} className="px-3 py-1 text-sm font-medium text-[#ffa726] bg-gradient-to-r from-yellow-50 to-pink-50 rounded-full">
                            {lang}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No languages specified</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ProfileSection>
          </div>
        );
  
      case "professional":
        return (
          <div className="grid gap-6">
            <ProfileSection icon={Award} title="Professional Details">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Average Session Duration</label>
                  {isEditing ? (
                    <select
                      value={editableData.trainerDetails.averageSessionDuration}
                      onChange={(e) => handleInputChange("averageSessionDuration", e.target.value, "trainerDetails")}
                      className="w-full px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={!trainerData?.isActive}
                      aria-label="Average Session Duration"
                    >
                      <option value="" disabled>
                        Select duration
                      </option>
                      {[15, 20, 25, 30, 45, 50, 55, 60, 75, 90, 120].map((duration) => (
                        <option key={duration} value={duration}>
                          {duration} minutes
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-800">
                      {editableData.trainerDetails.averageSessionDuration
                        ? `${editableData.trainerDetails.averageSessionDuration} minutes`
                        : "Not provided"}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Breeds Trained</label>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <select
                          value={selectedSpecies}
                          onChange={(e) => {
                            setSelectedSpecies(e.target.value);
                            setSelectedBreed("");
                          }}
                          className="flex-1 px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] disabled:bg-gray-100 disabled:cursor-not-allowed"
                          disabled={!trainerData?.isActive}
                          aria-label="Species"
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
                          className="flex-1 px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] disabled:bg-gray-100 disabled:cursor-not-allowed"
                          disabled={!trainerData?.isActive}
                          aria-label="Breed"
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
                          className="px-4 py-3 text-white transition-colors rounded-lg bg-gradient-to-r from-yellow-500 to-pink-500 hover:bg-gradient-to-r hover:from-yellow-600 hover:to-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          disabled={!selectedBreed || !trainerData?.isActive}
                          aria-label="Add Breed"
                        >
                          Add
                        </button>
                      </div>
                      {editableData.trainerDetails.breedsTrained.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {editableData.trainerDetails.breedsTrained.map((breed, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-3 py-1 text-[#ffa726] bg-gradient-to-r from-yellow-50 to-pink-50 rounded-full"
                            >
                              <span className="text-sm">{`${breed.breedName} (${breed.species})`}</span>
                              <button
                                onClick={() => removeBreed(index)}
                                className="text-red-600 transition-colors hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                disabled={!trainerData?.isActive}
                                aria-label={`Remove Breed ${breed.breedName}`}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No breeds added</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {editableData.trainerDetails.breedsTrained.length > 0 ? (
                        editableData.trainerDetails.breedsTrained.map((b, index) => (
                          <span key={index} className="px-3 py-1 text-sm font-medium text-[#ffa726] bg-gradient-to-r from-yellow-50 to-pink-50 rounded-full">
                            {`${b.breedName} (${b.species})`}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No breeds specified</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Certification</label>
                  {certificationImage ? (
                    <img
                      src={certificationImage}
                      alt="Certification"
                      className="object-cover w-32 h-32 border border-gray-200 rounded-lg shadow-sm"
                    />
                  ) : (
                    <p className="text-gray-800">No certification uploaded</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Training Photos</label>
                  {isEditing && trainerData?.isActive && (
                    <label className="block mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e, "trainingPhotos")}
                        className="block text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-yellow-50 file:to-pink-50 file:text-[#ffa726] hover:file:bg-gradient-to-r hover:file:from-yellow-100 hover:file:to-pink-100"
                        disabled={uploadLoading || !trainerData?.isActive}
                        aria-label="Upload Training Photos"
                      />
                    </label>
                  )}
                  {trainingPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 mt-3 sm:grid-cols-3">
                      {trainingPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt={`Training Photo ${index + 1}`}
                            className="object-cover w-full h-32 border border-gray-200 rounded-lg shadow-sm"
                          />
                          {isEditing && trainerData?.isActive && (
                            <button
                              onClick={() => handleRemoveTrainingPhoto(index)}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              aria-label={`Remove Training Photo ${index + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">No training photos uploaded</p>
                  )}
                </div>
              </div>
            </ProfileSection>
          </div>
        );
  
      case "facility":
        return (
          <div className="grid gap-6">
            <ProfileSection icon={FaMapMarkedAlt} title="Training Facility">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Training Facility Type</label>
                    <Tooltip
                      text="Choose whether you operate from a fixed facility or provide mobile training services."
                      ariaLabel="Facility type information"
                    >
                      <button
                        type="button"
                        className="text-gray-400 rounded-full hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                        aria-label="Facility type information"
                      >
                        <Info size={16} />
                      </button>
                    </Tooltip>
                  </div>
                  {isEditing ? (
                    <select
                      value={editableData.trainerDetails.trainingFacilityType}
                      onChange={(e) => handleInputChange("trainingFacilityType", e.target.value, "trainerDetails")}
                      className="w-full px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={!trainerData?.isActive}
                      aria-label="Training Facility Type"
                    >
                      <option value="" disabled>
                        Select facility type
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
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Governorate</label>
                      {isEditing ? (
                        <select
                          value={editableData.trainerDetails.governorate}
                          onChange={(e) => handleInputChange("governorate", e.target.value, "trainerDetails")}
                          className="w-full px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] disabled:bg-gray-100 disabled:cursor-not-allowed"
                          disabled={!trainerData?.isActive}
                          aria-label="Governorate"
                        >
                          <option value="" disabled>
                            Select governorate
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
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Delegation</label>
                      {isEditing ? (
                        <select
                          value={editableData.trainerDetails.delegation}
                          onChange={(e) => handleInputChange("delegation", e.target.value, "trainerDetails")}
                          className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] bg-white shadow-sm transition-all duration-200 ${
                            !editableData.trainerDetails.governorate ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                          disabled={!trainerData?.isActive || !editableData.trainerDetails.governorate}
                          aria-label="Delegation"
                        >
                          <option value="" disabled>
                            {!editableData.trainerDetails.governorate ? "Select governorate first" : "Select delegation"}
                          </option>
                          {(delegationsByGovernorate[editableData.trainerDetails.governorate] || []).map((delegation) => (
                            <option key={delegation} value={delegation}>
                              {delegation}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-800">{editableData.trainerDetails.delegation || "Not provided"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Facility Location</label>
                        <Tooltip
                          text="Click the map to select your facility's exact location or use your current location. This will automatically update the governorate and delegation."
                          ariaLabel="Facility location information"
                        >
                          <button
                            type="button"
                            className="text-gray-400 rounded-full hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                            aria-label="Facility location information"
                          >
                            <Info size={16} />
                          </button>
                        </Tooltip>
                      </div>
                      {isEditing && trainerData?.isActive ? (
                        <div className="space-y-3">
                          <MapPicker
                            position={editableData.trainerDetails.geolocation}
                            setPosition={handleMapPositionChange}
                          />
                          <p className="text-sm text-gray-500">
                            Select a location on the map to update governorate and delegation.
                          </p>
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="flex items-center gap-2 px-4 py-3 text-white transition-colors rounded-lg bg-gradient-to-r from-yellow-500 to-pink-500 hover:bg-gradient-to-r hover:from-yellow-600 hover:to-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            disabled={uploadLoading}
                            aria-label="Use Current Location"
                          >
                            <MapPin size={18} />
                            Use Current Location
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <MapViewer position={editableData.trainerDetails.geolocation} />
                          <a
                            href={`https://www.google.com/maps?q=${editableData.trainerDetails.geolocation.latitude},${editableData.trainerDetails.geolocation.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[#ffa726] hover:underline"
                            aria-label="View on Google Maps"
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
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Service Areas</label>
                      <Tooltip
                        text="Select the governorates where you provide mobile training services."
                        ariaLabel="Service areas information"
                      >
                        <button
                          type="button"
                          className="text-gray-400 rounded-full hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                          aria-label="Service areas information"
                        >
                          <Info size={16} />
                        </button>
                      </Tooltip>
                    </div>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <select
                            value={serviceAreaGov}
                            onChange={(e) => setServiceAreaGov(e.target.value)}
                            className="flex-1 px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] disabled:bg-gray-100 disabled:cursor-not-allowed"
                            disabled={!trainerData?.isActive}
                            aria-label="Service Area Governorate"
                          >
                            <option value="" disabled>
                              Select governorate
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
                            className="p-3 text-white transition-colors rounded-lg bg-gradient-to-r from-yellow-500 to-pink-500 hover:bg-gradient-to-r hover:from-yellow-600 hover:to-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            disabled={!serviceAreaGov || !trainerData?.isActive}
                            aria-label="Add Service Area"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                        {editableData.trainerDetails.serviceAreas.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {editableData.trainerDetails.serviceAreas.map((area, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 px-3 py-1.5 text-[#ffa726] bg-gradient-to-r from-yellow-50 to-pink-50 rounded-full"
                              >
                                <span className="text-sm">{area.governorate}</span>
                                <button
                                  onClick={() => removeServiceArea(index)}
                                  className="text-gray-500 transition-colors hover:text-red-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                                  disabled={!trainerData?.isActive}
                                  aria-label={`Remove Service Area ${area.governorate}`}
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No service areas added</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {editableData.trainerDetails.serviceAreas.length > 0 ? (
                          editableData.trainerDetails.serviceAreas.map((a, index) => (
                            <span key={index} className="px-3 py-1 text-sm font-medium text-[#ffa726] bg-gradient-to-r from-yellow-50 to-pink-50 rounded-full">
                              {a.governorate}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No service areas specified</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ProfileSection>
          </div>
        );
  
      case "services":
        return (
          <div className="grid gap-6">
            <ProfileSection icon={Clock} title="Services and Opening Hours">
              <div className="space-y-">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Services</label>
                  {isEditing ? (
                    <div className="space-y-4">
                      {editableData.trainerDetails?.services?.map((service, index) => (
                        <ServiceInput
                          key={index}
                          service={service}
                          index={index}
                          onChange={handleServiceChange}
                          onRemove={removeService}
                          disabled={!trainerData?.isActive}
                          existingServices={editableData.trainerDetails?.services || []}
                        />
                      )) || (
                        <p className="text-sm text-gray-500">No services available</p>
                      )}
                      <button
                        onClick={addService}
                        className="px-4 py-3 text-white transition-colors rounded-lg bg-gradient-to-r from-yellow-500 to-pink-500 hover:bg-gradient-to-r hover:from-yellow-600 hover:to-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        disabled={editableData.trainerDetails?.services?.length >= 2 || !trainerData?.isActive}
                        aria-label="Add Service"
                      >
                        Add Service
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {editableData.trainerDetails?.services?.length > 0 ? (
                        editableData.trainerDetails.services.map((service, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-pink-50"
                          >
                            <span className="text-gray-800">{service.serviceName}</span>
                            <span className="font-semibold text-[#ffa726]">{service.fee} TND</span>
                          </li>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No services added</p>
                      )}
                    </ul>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Opening Hours</label>
                  <div className="space-y-3">
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                      const schedule = editableData.trainerDetails.openingHours[day] || "Closed";
                      return (
                        <details key={day} className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-pink-50">
                          <summary className="flex items-center justify-between font-semibold text-gray-800 capitalize cursor-pointer">
                            <span>{day}</span>
                            <span className={`text-sm ${schedule === "Closed" ? "text-red-600" : "text-[#ffa726]"}`}>
                              {schedule === "Closed" ? "Closed" : schedule}
                            </span>
                          </summary>
                          <div className="mt-3 space-y-3">
                            {isEditing ? (
                              <div className="space-y-3">
                                <select
                                  value={schedule}
                                  onChange={(e) => handleOpeningHoursChange(day, "", e.target.value)}
                                  className="w-full px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  disabled={!trainerData?.isActive}
                                  aria-label={`${day} Schedule`}
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
                                      onChange={(e) => handleOpeningHoursChange(day, "Start", e.target.value)}
                                      className="w-full px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                      disabled={!trainerData?.isActive}
                                      aria-label={`${day} Start Time`}
                                    />
                                    <input
                                      type="time"
                                      value={editableData.trainerDetails.openingHours[`${day}End`] || ""}
                                      onChange={(e) => handleOpeningHoursChange(day, "End", e.target.value)}
                                      className="w-full px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                      disabled={!trainerData?.isActive}
                                      aria-label={`${day} End Time`}
                                    />
                                    {schedule === "Double Session" && (
                                      <>
                                        <input
                                          type="time"
                                          value={editableData.trainerDetails.openingHours[`${day}Start2`] || ""}
                                          onChange={(e) => handleOpeningHoursChange(day, "Start2", e.target.value)}
                                          className="w-full px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                          disabled={!trainerData?.isActive}
                                          aria-label={`${day} Second Start Time`}
                                        />
                                        <input
                                          type="time"
                                          value={editableData.trainerDetails.openingHours[`${day}End2`] || ""}
                                          onChange={(e) => handleOpeningHoursChange(day, "End2", e.target.value)}
                                          className="w-full px-4 py-3 transition-all duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                          disabled={!trainerData?.isActive}
                                          aria-label={`${day} Second End Time`}
                                        />
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600">
                                {schedule === "Closed" ? (
                                  "Closed"
                                ) : schedule === "Single Session" ? (
                                  `${editableData.trainerDetails.openingHours[`${day}Start`] || "N/A"} - ${editableData.trainerDetails.openingHours[`${day}End`] || "N/A"}`
                                ) : (
                                  <>
                                    First: {editableData.trainerDetails.openingHours[`${day}Start`] || "N/A"} - {editableData.trainerDetails.openingHours[`${day}End`] || "N/A"}<br />
                                    Second: {editableData.trainerDetails.openingHours[`${day}Start2`] || "N/A"} - {editableData.trainerDetails.openingHours[`${day}End2`] || "N/A"}
                                  </>
                                )}
                              </p>
                            )}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ProfileSection>
          </div>
        );
  
      case "social":
        return (
          <div className="grid gap-6">
            <ProfileSection icon={Globe} title="Social Links">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="facebook-url" className="block text-sm font-medium text-gray-700">Facebook</label>
                  {isEditing ? (
                    <input
                      id="facebook-url"
                      type="url"
                      value={editableData.trainerDetails.socialLinks.facebook || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value && !value.startsWith("https://")) {
                          toast.error("Please enter a valid URL starting with https://", {
                            position: "top-right",
                            autoClose: 3000,
                            theme: "light",
                          });
                          return;
                        }
                        handleInputChange("socialLinks", { facebook: value }, "trainerDetails");
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] bg-white shadow-sm transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="https://facebook.com/yourprofile"
                      disabled={!trainerData?.isActive}
                      aria-label="Facebook URL"
                    />
                  ) : (
                    <p className="text-gray-800">
                      {editableData.trainerDetails.socialLinks.facebook ? (
                        <a
                          href={editableData.trainerDetails.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ffa726] hover:underline"
                        >
                          Facebook Profile
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="instagram-url" className="block text-sm font-medium text-gray-700">Instagram</label>
                  {isEditing ? (
                    <input
                      id="instagram-url"
                      type="url"
                      value={editableData.trainerDetails.socialLinks.instagram || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value && !value.startsWith("https://")) {
                          toast.error("Please enter a valid URL starting with https://", {
                            position: "top-right",
                            autoClose: 3000,
                            theme: "light",
                          });
                          return;
                        }
                        handleInputChange("socialLinks", { instagram: value }, "trainerDetails");
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] bg-white shadow-sm transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="https://instagram.com/yourprofile"
                      disabled={!trainerData?.isActive}
                      aria-label="Instagram URL"
                    />
                  ) : (
                    <p className="text-gray-800">
                      {editableData.trainerDetails.socialLinks.instagram ? (
                        <a
                          href={editableData.trainerDetails.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ffa726] hover:underline"
                        >
                          Instagram Profile
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="website-url" className="block text-sm font-medium text-gray-700">Website</label>
                  {isEditing ? (
                    <input
                      id="website-url"
                      type="url"
                      value={editableData.trainerDetails.socialLinks.website || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value && !value.startsWith("https://")) {
                          toast.error("Please enter a valid URL starting with https://", {
                            position: "top-right",
                            autoClose: 3000,
                            theme: "light",
                          });
                          return;
                        }
                        handleInputChange("socialLinks", { website: value }, "trainerDetails");
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffa726] bg-white shadow-sm transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="https://yourwebsite.com"
                      disabled={!trainerData?.isActive}
                      aria-label="Website URL"
                    />
                  ) : (
                    <p className="text-gray-800">
                      {editableData.trainerDetails.socialLinks.website ? (
                        <a
                          href={editableData.trainerDetails.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ffa726] hover:underline"
                        >
                          Website
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  )}
                </div>
              </div>
            </ProfileSection>
          </div>
        );
  
      default:
        return <div className="text-center text-gray-500">Select a section to view details.</div>;
    }
  };
  return (
    <main className={`flex-1 p-4 sm:p-6 space-y-6 transition-all duration-300 ease-in-out ${
      isSidebarCollapsed ? "ml-16" : "ml-0 md:ml-64"
    }`}>
      <section className="overflow-hidden bg-white shadow-lg rounded-xl">
        <div className="px-6 py-5 border-l-4" style={{ borderImage: "linear-gradient(to bottom, #ffc929, #ffa726) 1" }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center p-2 rounded-lg bg-yellow-50">
              <User className="w-6 h-6 text-[#ffc929]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Trainer Profile</h1>
              <p className="text-sm text-gray-500">Manage your trainer profile information</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-0">
          <TrainerProfileHeader />
          <div className="px-4 py-8 sm:px-6">
            {renderProfileContent()}
          </div>
        </div>
      </section>
      <ToastContainer />
    </main>
  );
};

export default Profile;