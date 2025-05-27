import {
  Calendar,
  Camera,
  Clock,
  Info,
  Loader2,
  MapPin,
  Palette,
  PawPrint,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaPaw } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { delegationsByGovernorate, governorates } from "../assets/locations";
import {
  ageOptions,
  breeds,
  colorOptions,
  sizeOptions,
  species,
} from "../assets/Pet";
import MapPicker from "../components/map/MapPicker";
import { ErrorMessage } from "../components/profile/common/ErrorMessage";
import { Tooltip } from "../components/Tooltip";
import { useApp } from "../context/AppContext";
import axiosInstance from "../utils/axiosInstance";

export default function LostPetForm() {
  const { socket, user } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    size: "",
    age: "",
    gender: "",
    isPregnant: "",
    colorType: "Single",
    colors: [],
    location: {
      governorate: "",
      delegation: "",
      coordinates: { latitude: 36.8665367, longitude: 10.1647233 },
    },
    date: new Date().toISOString().split("T")[0],
    timeKnown: true,
    exactTime: "",
    timeOfDay: "",
    description: "",
    hasMicrochip: "No",
    microchipNumber: "",
    photos: [],
    email: user?.email || "",
    phoneNumber:
      user?.petOwnerDetails?.phone ||
      user?.trainerDetails?.phone ||
      user?.veterinarianDetails?.phone ||
      "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [selectedColor, setSelectedColor] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imageHover, setImageHover] = useState(false);
  const colorSelectRef = useRef(null);
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const animationClass = prefersReducedMotion
    ? ""
    : "transition-all duration-300";



  const timeOfDayOptions = [
    { value: "", label: "Select time of day" },
    { value: "Early Morning (5am-8am)", label: "Early Morning (5am-8am)" },
    { value: "Morning (8am-11am)", label: "Morning (8am-11am)" },
    { value: "Midday (11am-2pm)", label: "Midday (11am-2pm)" },
    { value: "Afternoon (2pm-5pm)", label: "Afternoon (2pm-5pm)" },
    { value: "Evening (5pm-8pm)", label: "Evening (5pm-8pm)" },
    { value: "Night (8pm-12am)", label: "Night (8pm-12am)" },
    { value: "Late Night (12am-5am)", label: "Late Night (12am-5am)" },
  ];

  const formSections = [
    { title: "Pet Details", icon: PawPrint },
    { title: "Appearance", icon: Palette },
    { title: "Location & Time", icon: MapPin },
    { title: "Additional Info", icon: Info },
  ];

  useEffect(() => {
    if (!user) {
      setIsAuthenticated(false);
      alert("You must be logged in to report a lost pet.");
      navigate("/login");
    } else {
      setIsAuthenticated(true);
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        phoneNumber:
          user.petOwnerDetails?.phone ||
          user.trainerDetails?.phone ||
          user.veterinarianDetails?.phone ||
          "",
      }));
    }
  }, [user, navigate]);

  useEffect(() => {
    socket.on("lostReportCreated", (data) => {
      console.log("New lost report created:", data);
    });
    return () => {
      socket.off("lostReportCreated");
    };
  }, [socket]);

  const handleInputChange = (field, subfield, value) => {
    setFormData((prev) => {
      if (subfield) {
        return {
          ...prev,
          [field]: { ...prev[field], [subfield]: value },
        };
      }
      return { ...prev, [field]: value };
    });
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAddColor = () => {
    if (!selectedColor) return;
    if (formData.colorType === "Single") {
      if (formData.colors.length > 0) {
        setFormErrors((prev) => ({
          ...prev,
          colors: "Only one color allowed in Single mode",
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, colors: [selectedColor] }));
    } else {
      if (!formData.colors.includes(selectedColor)) {
        setFormData((prev) => ({
          ...prev,
          colors: [...prev.colors, selectedColor],
        }));
      }
    }
    setSelectedColor("");
    setFormErrors((prev) => ({ ...prev, colors: "" }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && selectedColor) {
      e.preventDefault();
      handleAddColor();
    }
  };

  const removeColor = (color) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== color),
    }));
    setFormErrors((prev) => ({ ...prev, colors: "" }));
  };

  const validateFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({
        ...prev,
        photos: "Please upload an image file",
      }));
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        photos: "Image must be less than 5MB",
      }));
      return false;
    }
    return true;
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setFormErrors((prev) => ({ ...prev, photos: "" }));

    const newPhotos = [];
    for (const file of files) {
      if (!validateFile(file)) {
        setIsUploading(false);
        return;
      }

      try {
        const formDataToSend = new FormData();
        formDataToSend.append("image", file);

        const response = await axiosInstance.post(
          "/api/upload",
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.url) {
          newPhotos.push(response.data.url);
        }
      } catch (error) {
        setFormErrors((prev) => ({
          ...prev,
          photos: error.response?.data?.message || "Failed to upload image",
        }));
        setIsUploading(false);
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));
    setIsUploading(false);
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
    setFormErrors((prev) => ({ ...prev, photos: "" }));
  };

  const handleMapPositionChange = async (newPosition) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPosition.latitude}&lon=${newPosition.longitude}&zoom=16&addressdetails=1`,
        { headers: { "User-Agent": "PetApp/1.0" } }
      );
      const data = await response.json();

      handleInputChange("location", "coordinates", newPosition);

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
        }

        handleInputChange("location", "governorate", matchedGovernorate);
        handleInputChange("location", "delegation", matchedDelegation);
      } else {
        handleInputChange("location", "governorate", "Tunis");
        handleInputChange(
          "location",
          "delegation",
          delegationsByGovernorate["Tunis"]?.[0] || "Tunis"
        );
      }
    } catch (error) {
      console.error("Nominatim reverse geocoding error:", error);
      handleInputChange("location", "governorate", "Tunis");
      handleInputChange(
        "location",
        "delegation",
        delegationsByGovernorate["Tunis"]?.[0] || "Tunis"
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
          alert("Unable to retrieve your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const setCurrentDateTime = () => {
    const now = new Date();
    handleInputChange("date", null, now.toISOString().split("T")[0]);
    if (formData.timeKnown) {
      const timeString = now.toTimeString().slice(0, 5);
      handleInputChange("exactTime", null, timeString);
    }
  };

  const validateSection = (sectionIndex) => {
    const errors = {};
    if (sectionIndex === 0) {
      if (!formData.name) errors.name = "Pet name is required";
      if (!formData.species) errors.species = "Species is required";
      if (!formData.breed) errors.breed = "Breed is required";
      if (!formData.size) errors.size = "Size is required";
      if (!formData.age) errors.age = "Age is required";
      if (!formData.gender) errors.gender = "Gender is required";
      if (formData.gender === "Female" && !formData.isPregnant)
        errors.isPregnant = "Pregnancy status is required for female pets";
    } else if (sectionIndex === 1) {
      if (!formData.colorType) errors.colorType = "Color type is required";
      if (!formData.colors || formData.colors.length === 0)
        errors.colors = "At least one color is required";
      if (!formData.photos || formData.photos.length === 0)
        errors.photos = "At least one photo is required";
    } else if (sectionIndex === 2) {
      if (!formData.location.governorate)
        errors.governorate = "Governorate is required";
      if (!formData.location.delegation)
        errors.delegation = "Delegation is required";
      if (
        !formData.location.coordinates.latitude ||
        !formData.location.coordinates.longitude
      )
        errors.coordinates = "Coordinates are required";
      if (!formData.date) errors.date = "Date is required";
      if (formData.timeKnown && !formData.exactTime)
        errors.exactTime = "Exact time is required if known";
      if (!formData.timeKnown && !formData.timeOfDay)
        errors.timeOfDay = "Approximate time is required if exact time is not known";
    } else if (sectionIndex === 3) {
      if (!formData.description) errors.description = "Description is required";
      if (formData.hasMicrochip === "Yes" && !formData.microchipNumber)
        errors.microchipNumber = "Microchip number is required";
      if (!formData.email) errors.email = "Email is required";
      if (!formData.phoneNumber) errors.phoneNumber = "Phone number is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextSection = () => {
    if (validateSection(activeTab)) {
      setActiveTab((prev) => Math.min(prev + 1, formSections.length - 1));
    }
  };

  const prevSection = () => setActiveTab((prev) => Math.max(prev - 1, 0));

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setFormErrors({});

  const errors = {};
  if (!formData.name) errors.name = "Pet name is required";
  if (!formData.species) errors.species = "Species is required";
  if (!formData.breed) errors.breed = "Breed is required";
  if (!formData.size) errors.size = "Size is required";
  if (!formData.age) errors.age = "Age is required";
  if (!formData.gender) errors.gender = "Gender is required";
  if (formData.gender === "Female" && !formData.isPregnant)
    errors.isPregnant = "Pregnancy status is required for female pets";
  if (!formData.colorType) errors.colorType = "Color type is required";
  if (!formData.colors || formData.colors.length === 0)
    errors.colors = "At least one color is required";
  if (!formData.photos || formData.photos.length === 0)
    errors.photos = "At least one photo is required";
  if (!formData.location.governorate)
    errors.governorate = "Governorate is required";
  if (!formData.location.delegation)
    errors.delegation = "Delegation is required";
  if (
    !formData.location.coordinates.latitude ||
    !formData.location.coordinates.longitude ||
    typeof formData.location.coordinates.latitude !== "number" ||
    typeof formData.location.coordinates.longitude !== "number" ||
    isNaN(formData.location.coordinates.latitude) ||
    isNaN(formData.location.coordinates.longitude) ||
    formData.location.coordinates.latitude < -90 ||
    formData.location.coordinates.latitude > 90 ||
    formData.location.coordinates.longitude < -180 ||
    formData.location.coordinates.longitude > 180
  )
    errors.coordinates = "Valid coordinates are required";
  if (!formData.date) errors.date = "Date is required";
  if (formData.timeKnown && !formData.exactTime)
    errors.exactTime = "Exact time is required if known";
  if (!formData.timeKnown && !formData.timeOfDay)
    errors.timeOfDay = "Approximate time is required if exact time is not known";
  if (!formData.description) errors.description = "Description is required";
  if (formData.hasMicrochip === "Yes" && !formData.microchipNumber)
    errors.microchipNumber = "Microchip number is required";
  if (!formData.email) errors.email = "Email is required";
  if (!formData.phoneNumber) errors.phoneNumber = "Phone number is required";

  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    setIsSubmitting(false);
    const firstErrorSection = Math.min(
      errors.name ||
      errors.species ||
      errors.breed ||
      errors.size ||
      errors.age ||
      errors.gender ||
      errors.isPregnant
        ? 0
        : Infinity,
      errors.colorType || errors.colors || errors.photos ? 1 : Infinity,
      errors.governorate ||
      errors.delegation ||
      errors.coordinates ||
      errors.date ||
      errors.exactTime ||
      errors.timeOfDay
        ? 2
        : Infinity,
      errors.description ||
      errors.microchipNumber ||
      errors.email ||
      errors.phoneNumber
        ? 3
        : Infinity
    );
    setActiveTab(firstErrorSection);
    return;
  }

  const timeOfDayMap = {
    "Early Morning (5am-8am)": "06:30",
    "Morning (8am-11am)": "09:30",
    "Midday (11am-2pm)": "12:30",
    "Afternoon (2pm-5pm)": "15:30",
    "Evening (5pm-8pm)": "18:30",
    "Night (8pm-12am)": "20:00",
    "Late Night (12am-5am)": "02:00",
  };

  const dataToSend = {
    type: "Lost",
    name: formData.name,
    species: formData.species,
    breed: formData.breed,
    size: formData.size,
    age: formData.age,
    gender: formData.gender,
    isPregnant:
      formData.gender === "Female"
        ? formData.isPregnant === "Yes"
          ? true
          : formData.isPregnant === "No"
          ? false
          : null
        : false,
    colorType: formData.colorType,
    color: formData.colors,
    date: (() => {
      let date = new Date(formData.date);
      if (formData.timeKnown && formData.exactTime) {
        date = new Date(`${formData.date}T${formData.exactTime}:00Z`);
      } else if (!formData.timeKnown && formData.timeOfDay) {
        const mappedTime = timeOfDayMap[formData.timeOfDay] || "12:00";
        date = new Date(`${formData.date}T${mappedTime}:00Z`);
      }
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    })(),
    description: formData.description,
    location: {
      governorate: formData.location.governorate,
      delegation: formData.location.delegation,
      coordinates:
        formData.location.coordinates.latitude &&
        formData.location.coordinates.longitude &&
        typeof formData.location.coordinates.latitude === "number" &&
        typeof formData.location.coordinates.longitude === "number" &&
        !isNaN(formData.location.coordinates.latitude) &&
        !isNaN(formData.location.coordinates.longitude) &&
        formData.location.coordinates.latitude >= -90 &&
        formData.location.coordinates.latitude <= 90 &&
        formData.location.coordinates.longitude >= -180 &&
        formData.location.coordinates.longitude <= 180
          ? {
              type: "Point",
              coordinates: [
                formData.location.coordinates.longitude,
                formData.location.coordinates.latitude,
              ],
            }
          : undefined,
    },
    photos: formData.photos,
    microchipNumber:
      formData.hasMicrochip === "Yes" ? formData.microchipNumber : "",
    status: "Pending",
    owner: user?._id,
    email: formData.email,
    phoneNumber: formData.phoneNumber,
  };

  if (!dataToSend.date) {
    setFormErrors({ date: "Invalid date format" });
    setIsSubmitting(false);
    setActiveTab(2);
    return;
  }

  console.log("Data to send:", JSON.stringify(dataToSend, null, 2));

  try {
    const response = await axiosInstance.post(
      "/api/lost-and-found/lost",
      dataToSend,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    alert("Lost pet report submitted successfully!");
    setFormData({
      name: "",
      species: "",
      breed: "",
      size: "",
      age: "",
      gender: "",
      isPregnant: "",
      colorType: "Single",
      colors: [],
      location: {
        governorate: "",
        delegation: "",
        coordinates: { latitude: 36.8665367, longitude: 10.1647233 },
      },
      date: new Date().toISOString().split("T")[0],
      timeKnown: true,
      exactTime: "",
      timeOfDay: "",
      description: "",
      hasMicrochip: "No",
      microchipNumber: "",
      photos: [],
      email: user?.email || "",
      phoneNumber:
        user?.petOwnerDetails?.phone ||
        user?.trainerDetails?.phone ||
        user?.veterinarianDetails?.phone ||
        "",
    });
    setActiveTab(0);
    navigate("/lost-and-found");
  } catch (error) {
    console.error("Submission error:", error.response?.data);
    setFormErrors({
      submit:
        error.response?.data?.message ||
        "Error submitting report. Please try again.",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-pink-50 to-[#ffc929]/5">
      <div className="max-w-4xl p-6 pt-16 mx-auto md:pt-24">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-[#ffc929]/20 rounded-full shadow-sm transition hover:shadow-md">
            <FaPaw className="w-4 h-4 mr-2 text-[#ffc929]" />
            <span>Help Find Your Lost Pet</span>
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 md:text-4xl">
            <span className="block">Lost Your Pet?</span>
            <span className="block mt-2 text-pink-500">Report It Here</span>
          </h1>
          <p className="max-w-2xl mx-auto mt-6 text-lg leading-relaxed text-gray-600">
            Please fill out the form below to help us assist you in finding your lost pet.
          </p>
        </div>
        <div className="flex justify-between mb-8">
          {formSections.map((section, index) => (
            <div
              key={index}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => setActiveTab(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActiveTab(index)}
              aria-label={`Go to ${section.title} section`}
            >
              <div
                className={`flex items-center justify-center w-12 h-12 mb-2 rounded-full ${animationClass} ${
                  activeTab === index
                    ? "bg-gradient-to-r from-[#ffc929] to-[#ffa726] text-white shadow-lg"
                    : activeTab > index
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <section.icon size={22} />
              </div>
              <span
                className={`text-sm font-medium ${
                  activeTab >= index ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {section.title}
              </span>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 bg-white shadow-xl rounded-2xl"
        >
          {activeTab === 0 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                <PawPrint className="text-[#ffc929]" />
                Pet Details{" "}
                <span className="text-sm text-gray-500">
                  Fields marked with <span className="text-red-500">*</span> are
                  required.
                </span>
              </h2>

              <div className="p-6 border border-[#ffc929]/20 rounded-xl bg-white">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Tooltip text="Enter the pet's name, if known">
                      <label
                        htmlFor="name"
                        className="flex items-center gap-1 text-sm font-medium text-gray-700"
                      >
                        Pet Name <span className="text-red-500">*</span>
                        <Info size={14} className="text-gray-400" />
                      </label>
                    </Tooltip>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", null, e.target.value)
                        }
                        placeholder="e.g., Max"
                        className={`w-full p-4 text-gray-700 bg-white border-2 rounded-xl focus:border-[#ffc929] focus:ring-2 focus:ring-[#ffc929]/30 ${animationClass} ${
                          formErrors.name
                            ? "border-red-500 bg-red-50/30 ring-2 ring-red-200"
                            : "border-[#ffc929]/30"
                        }`}
                        aria-describedby={
                          formErrors.name ? "name-error" : undefined
                        }
                      />
                      {formErrors.name && (
                        <span className="absolute top-0 right-0 px-2 py-1 text-xs font-medium text-red-500 rounded-bl bg-red-50">
                          Required
                        </span>
                      )}
                    </div>
                    <ErrorMessage id="name-error" error={formErrors.name} />
                  </div>
                  <div className="space-y-2">
                    <Tooltip text="Select the type of pet (e.g., Dog, Cat)">
                      <label
                        htmlFor="species"
                        className="flex items-center gap-1 text-sm font-medium text-gray-700"
                      >
                        Species <span className="text-red-500">*</span>
                        <Info size={14} className="text-gray-400" />
                      </label>
                    </Tooltip>
                    <div className="relative">
                      <select
                        id="species"
                        value={formData.species}
                        onChange={(e) => {
                          handleInputChange("species", null, e.target.value);
                          handleInputChange("breed", null, "");
                          handleInputChange("size", null, "");
                          handleInputChange("age", null, "");
                          handleInputChange("gender", null, "");
                          handleInputChange("isPregnant", null, "");
                        }}
                        className={`w-full p-4 text-gray-700 bg-white border-2 rounded-xl focus:border-[#ffc929] focus:ring-2 focus:ring-[#ffc929]/30 ${animationClass} ${
                          formErrors.species
                            ? "border-red-500 bg-red-50/30 ring-2 ring-red-200"
                            : "border-[#ffc929]/30"
                        }`}
                        aria-describedby={
                          formErrors.species ? "species-error" : undefined
                        }
                      >
                        <option value="" disabled>
                          Select Species
                        </option>
                        {species.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.species && (
                        <span className="absolute top-0 right-0 px-2 py-1 text-xs font-medium text-red-500 rounded-bl bg-red-50">
                          Required
                        </span>
                      )}
                    </div>
                    <ErrorMessage
                      id="species-error"
                      error={formErrors.species}
                    />
                  </div>
                  <div className="space-y-2">
                    <Tooltip text="Select the breed of the pet">
                      <label
                        htmlFor="breed"
                        className="flex items-center gap-1 text-sm font-medium text-gray-700"
                      >
                        Breed <span className="text-red-500">*</span>
                        <Info size={14} className="text-gray-400" />
                      </label>
                    </Tooltip>
                    <div className="relative">
                      <select
                        id="breed"
                        value={formData.breed}
                        onChange={(e) =>
                          handleInputChange("breed", null, e.target.value)
                        }
                        className={`w-full p-4 text-gray-700 bg-white border-2 rounded-xl focus:border-[#ffc929] focus:ring-2 focus:ring-[#ffc929]/30 ${animationClass} ${
                          formErrors.breed
                            ? "border-red-500 bg-red-50/30 ring-2 ring-red-200"
                            : !formData.species
                            ? "opacity-60 cursor-not-allowed"
                            : "border-[#ffc929]/30"
                        }`}
                        disabled={!formData.species}
                        aria-describedby={
                          formErrors.breed ? "breed-error" : undefined
                        }
                      >
                        <option value="" disabled>
                          {formData.species
                            ? "Select Breed"
                            : "Select species first"}
                        </option>
                        {formData.species &&
                          breeds[formData.species]?.map((breed) => (
                            <option key={breed} value={breed}>
                              {breed}
                            </option>
                          ))}
                      </select>
                      {formErrors.breed && (
                        <span className="absolute top-0 right-0 px-2 py-1 text-xs font-medium text-red-500 rounded-bl bg-red-50">
                          Required
                        </span>
                      )}
                    </div>
                    <ErrorMessage id="breed-error" error={formErrors.breed} />
                  </div>
                  <div className="space-y-2">
                    <Tooltip text="Select the approximate size of the pet">
                      <label
                        htmlFor="size"
                        className="flex items-center gap-1 text-sm font-medium text-gray-700"
                      >
                        Size <span className="text-red-500">*</span>
                        <Info size={14} className="text-gray-400" />
                      </label>
                    </Tooltip>
                    <div className="relative">
                      <select
                        id="size"
                        value={formData.size}
                        onChange={(e) =>
                          handleInputChange("size", null, e.target.value)
                        }
                        className={`w-full p-4 text-gray-700 bg-white border-2 rounded-xl focus:border-[#ffc929] focus:ring-2 focus:ring-[#ffc929]/30 ${animationClass} ${
                          formErrors.size
                            ? "border-red-500 bg-red-50/30 ring-2 ring-red-200"
                            : !formData.species
                            ? "opacity-60 cursor-not-allowed"
                            : "border-[#ffc929]/30"
                        }`}
                        disabled={!formData.species}
                        aria-describedby={
                          formErrors.size ? "size-error" : undefined
                        }
                      >
                        <option value="" disabled>
                          {formData.species
                            ? "Select Size"
                            : "Select species first"}
                        </option>
                        {sizeOptions.map((size) => (
                          <option key={size.value} value={size.value}>
                            {size.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.size && (
                        <span className="absolute top-0 right-0 px-2 py-1 text-xs font-medium text-red-500 rounded-bl bg-red-50">
                          Required
                        </span>
                      )}
                    </div>
                    <ErrorMessage id="size-error" error={formErrors.size} />
                  </div>
                  <div className="space-y-2">
                    <Tooltip text="Select the approximate age of the pet">
                      <label
                        htmlFor="age"
                        className="flex items-center gap-1 text-sm font-medium text-gray-700"
                      >
                        Age <span className="text-red-500">*</span>
                        <Info size={14} className="text-gray-400" />
                      </label>
                    </Tooltip>
                    <div className="relative">
                      <select
                        id="age"
                        value={formData.age}
                        onChange={(e) =>
                          handleInputChange("age", null, e.target.value)
                        }
                        className={`w-full p-4 text-gray-700 bg-white border-2 rounded-xl focus:border-[#ffc929] focus:ring-2 focus:ring-[#ffc929]/30 ${animationClass} ${
                          formErrors.age
                            ? "border-red-500 bg-red-50/30 ring-2 ring-red-200"
                            : !formData.species
                            ? "opacity-60 cursor-not-allowed"
                            : "border-[#ffc929]/30"
                        }`}
                        disabled={!formData.species}
                        aria-describedby={
                          formErrors.age ? "age-error" : undefined
                        }
                      >
                        {ageOptions.map((age) => (
                          <option key={age.value} value={age.value}>
                            {age.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.age && (
                        <span className="absolute top-0 right-0 px-2 py-1 text-xs font-medium text-red-500 rounded-bl bg-red-50">
                          Required
                        </span>
                      )}
                    </div>
                    <ErrorMessage id="age-error" error={formErrors.age} />
                  </div>
                  <div className="space-y-2">
                    <Tooltip text="Select the gender of the pet">
                      <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                        Gender <span className="text-red-500">*</span>
                        <Info size={14} className="text-gray-400" />
                      </label>
                    </Tooltip>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={formData.gender === "Male"}
                          onChange={() => {
                            handleInputChange("gender", null, "Male");
                            handleInputChange("isPregnant", null, "No");
                          }}
                          className="w-4 h-4 text-[#ffc929] border-gray-300 focus:ring-[#ffc929]"
                          aria-describedby={
                            formErrors.gender ? "gender-error" : undefined
                          }
                        />
                        <span className="ml-2 text-sm text-gray-700">Male</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={formData.gender === "Female"}
                          onChange={() =>
                            handleInputChange("gender", null, "Female")
                          }
                          className="w-4 h-4 text-[#ffc929] border-gray-300 focus:ring-[#ffc929]"
                          aria-describedby={
                            formErrors.gender ? "gender-error" : undefined
                          }
                        />
                        <span className="ml-2 text-sm text-gray-700">Female</span>
                      </label>
                    </div>
                    {formErrors.gender && (
                      <ErrorMessage id="gender-error" error={formErrors.gender} />
                    )}
                    {formData.gender === "Female" && (
                      <div className="mt-2">
                        <Tooltip text="Select the pregnancy status of the female pet">
                          <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                            Pregnancy Status <span className="text-red-500">*</span>
                            <Info size={14} className="text-gray-400" />
                          </label>
                        </Tooltip>
                        <div className="flex gap-4 mt-2">
                          {["Yes", "No", "Not Sure"].map((status) => (
                            <label key={status} className="flex items-center">
                              <input
                                type="radio"
                                name="isPregnant"
                                value={status}
                                checked={formData.isPregnant === status}
                                onChange={() => handleInputChange("isPregnant", null, status)}
                                className="w-4 h-4 text-[#ffc929] border-gray-300 focus:ring-[#ffc929]"
                                aria-describedby={formErrors.isPregnant ? "isPregnant-error" : undefined}
                              />
                              <span className="ml-2 text-sm text-gray-700">{status}</span>
                            </label>
                          ))}
                        </div>
                        {formErrors.isPregnant && (
                          <ErrorMessage
                            id="isPregnant-error"
                            error={formErrors.isPregnant}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={nextSection}
                  className={`px-6 py-3 font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:shadow-lg flex items-center gap-2 ${animationClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={
                    !!formErrors.name ||
                    !!formErrors.species ||
                    !!formErrors.breed ||
                    !!formErrors.size ||
                    !!formErrors.age ||
                    !!formErrors.gender ||
                    !!formErrors.isPregnant
                  }
                >
                  Next <span className="text-xl">→</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                <Palette className="text-[#ffc929]" />
                Appearance{" "}
                <span className="text-sm text-gray-500">
                  Fields marked with <span className="text-red-500">*</span> are
                  required.
                </span>
              </h2>
              <div className="p-6 border border-[#ffc929]/20 rounded-xl bg-white">
                <div className="space-y-4">
                  <Tooltip text="Choose whether the pet has a single or multiple colors">
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      Color Type <span className="text-red-500">*</span>
                      <Info size={14} className="text-gray-400" />
                    </label>
                  </Tooltip>
                  <div className="flex gap-4">
                    {["Single", "Multiple"].map((type) => (
                      <div
                        key={type}
                        onClick={() => {
                          handleInputChange("colorType", null, type);
                          if (type === "Single" && formData.colors.length > 1) {
                            handleInputChange("colors", null, [
                              formData.colors[0],
                            ]);
                          }
                        }}
                        className={`flex-1 p-4 text-center border-2 rounded-xl cursor-pointer ${animationClass} ${
                          formData.colorType === type
                            ? "border-[#ffc929] bg-[#ffc929]/10 text-gray-800 font-medium"
                            : "border-gray-200 hover:border-[#ffc929]/30"
                        }`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleInputChange("colorType", null, type);
                            if (
                              type === "Single" &&
                              formData.colors.length > 1
                            ) {
                              handleInputChange("colors", null, [
                                formData.colors[0],
                              ]);
                            }
                          }
                        }}
                        aria-label={`Select ${type} color type`}
                      >
                        {type} Color
                      </div>
                    ))}
                  </div>
                  {formErrors.colorType && (
                    <ErrorMessage
                      id="colorType-error"
                      error={formErrors.colorType}
                    />
                  )}
                  <div className="mt-4 space-y-2">
                    <Tooltip text="Select one or more colors to describe the pet's appearance">
                      <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                        Select Colors <span className="text-red-500">*</span>
                        <Info size={14} className="text-gray-400" />
                      </label>
                    </Tooltip>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          id="colors"
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          onKeyDown={handleKeyDown}
                          ref={colorSelectRef}
                          className={`w-full p-4 text-gray-700 bg-white border-2 rounded-xl focus:border-[#ffc929] focus:ring-2 focus:ring-[#ffc929]/30 ${animationClass} ${
                            formErrors.colors
                              ? "border-red-500 bg-red-50/30 ring-2 ring-red-200"
                              : "border-[#ffc929]/30"
                          }`}
                          aria-describedby={
                            formErrors.colors ? "colors-error" : undefined
                          }
                        >
                          <option value="" disabled>
                            Select{" "}
                            {formData.colorType === "Single"
                              ? "Color"
                              : "Colors"}
                          </option>
                          {colorOptions.map((color) => (
                            <option key={color.value} value={color.value}>
                              {color.label}
                            </option>
                          ))}
                        </select>
                        {formErrors.colors && (
                          <span className="absolute top-0 right-0 px-2 py-1 text-xs font-medium text-red-500 rounded-bl bg-red-50">
                            Required
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddColor}
                        disabled={
                          !selectedColor ||
                          (formData.colorType === "Single" &&
                            formData.colors.length > 0)
                        }
                        className={`px-4 py-4 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${animationClass}`}
                        aria-label="Add selected color"
                      >
                        +
                      </button>
                    </div>
                    {formData.colors.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.colors.map((color, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 px-3 py-1 text-sm border-2 border-[#ffc929]/30 bg-[#ffc929]/10 rounded-full text-gray-800"
                          >
                            {color}
                            <button
                              type="button"
                              onClick={() => removeColor(color)}
                              className="text-red-500 hover:text-red-600"
                              aria-label={`Remove ${color}`}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <ErrorMessage id="colors-error" error={formErrors.colors} />
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
                        <Camera size={16} className="text-[#ffc929]" />
                      </span>
                      Photos <span className="text-red-500">*</span>
                    </label>
                    <Tooltip
                      text="Upload clear photos of the pet to help with identification (max 5MB each)."
                      ariaLabel="Photos information"
                    >
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
                      >
                        <span className="sr-only">Photos information</span>
                        <Info size={16} className="text-gray-400" />
                      </button>
                    </Tooltip>
                  </div>
                  <div
                    className={`flex flex-col items-center p-6 border-2 border-dashed border-[#ffc929]/30 rounded-xl hover:border-[#ffc929]/60 ${animationClass} ${
                      formErrors.photos ? "border-red-500 bg-red-50/30" : ""
                    }`}
                    onMouseEnter={() => setImageHover(true)}
                    onMouseLeave={() => setImageHover(false)}
                  >
                    <Camera
                      size={32}
                      className={`text-[#ffc929] mb-2 ${
                        imageHover ? "scale-110" : ""
                      } ${animationClass}`}
                    />
                    <p className="mb-2 text-sm text-gray-600">
                      Drag & drop images or click to upload
                    </p>
                    <label
                      htmlFor="photos-upload"
                      className={`px-4 py-3.5 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] cursor-pointer ${animationClass}`}
                      aria-label="Upload photos"
                    >
                      {isUploading ? (
                        <Loader2 size={18} className="inline animate-spin" />
                      ) : (
                        "Upload Photos"
                      )}
                      <input
                        id="photos-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                    {formErrors.photos && (
                      <span className="absolute top-0 right-0 px-2 py-1 text-xs font-medium text-red-500 rounded-bl bg-red-50">
                        Required
                      </span>
                    )}
                  </div>
                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3">
                      {formData.photos.map((url, index) => (
                        <div
                          key={index}
                          className="relative h-24 overflow-hidden rounded-xl group"
                        >
                          <img
                            src={url}
                            alt={`Pet photo ${index + 1}`}
                            className={`object-cover w-full h-full border-2 border-[#ffc929]/30 group-hover:border-[#ffc929] ${animationClass}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className={`absolute p-1 text-white bg-red-500 rounded-full top-1 right-1 hover:bg-red-600 ${animationClass}`}
                            aria-label={`Remove photo ${index + 1}`}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <ErrorMessage id="photos-error" error={formErrors.photos} />
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevSection}
                  className={`px-6 py-3 font-medium text-gray-700 border-2 border-gray-300 rounded-xl hover:border-[#ffc929]/50 flex items-center gap-2 ${animationClass}`}
                >
                  <span className="text-xl">←</span> Back
                </button>
                <button
                  type="button"
                  onClick={nextSection}
                  className={`px-6 py-3 font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:shadow-lg flex items-center gap-2 ${animationClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={
                    !!formErrors.colorType ||
                    !!formErrors.colors ||
                    !!formErrors.photos
                  }
                >
                  Next <span className="text-xl">→</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                <MapPin className="text-[#ffc929]" />
                Location & Time{" "}
                <span className="text-sm text-gray-500">
                  Fields marked with <span className="text-red-500">*</span> are
                  required.
                </span>
              </h2>
              <div className="p-6 border border-[#ffc929]/20 rounded-xl bg-white">
                <div className="space-y-4">
                  <Tooltip text="Pinpoint the exact location where the pet was lost">
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      Where was the pet lost?{" "}
                      <span className="text-red-500">*</span>
                      <Info size={14} className="text-gray-400" />
                    </label>
                  </Tooltip>
                  <div className="relative w-full h-64 overflow-hidden rounded-xl">
                    <MapPicker
                      position={formData.location.coordinates}
                      setPosition={handleMapPositionChange}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className={`flex items-center px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-lg bottom-4 right-4 hover:bg-[#ffa726] gap-2 z-10 shadow-md ${animationClass}`}
                    >
                      <MapPin size={16} />
                      Use Current Location
                    </button>
                  </div>
                  {formErrors.coordinates && (
                    <ErrorMessage
                      id="coordinates-error"
                      error={formErrors.coordinates}
                    />
                  )}
                  <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Tooltip text="Select the governorate where the pet was lost">
                        <label
                          htmlFor="governorate"
                          className="flex items-center gap-1 text-sm font-medium text-gray-700"
                        >
                          Governorate <span className="text-red-500">*</span>
                          <Info size={14} className="text-gray-400" />
                        </label>
                      </Tooltip>
                      <div className="relative">
                        <select
                          id="governorate"
                          value={formData.location.governorate}
                          onChange={(e) => {
                            handleInputChange(
                              "location",
                              "governorate",
                              e.target.value
                            );
                            handleInputChange("location", "delegation", "");
                          }}
                          className={`w-full p-3 text-gray-700 bg-white border-2 rounded-xl focus:border-[#ffc929] focus:ring-2 focus:ring-[#ffc929]/30 ${animationClass} ${
                            formErrors.governorate
                              ? "border-red-500 bg-red-50/30 ring-2 ring-red-200"
                              : "border-[#ffc929]/30"
                          }`}
                          aria-describedby={
                            formErrors.governorate
                              ? "governorate-error"
                              : undefined
                          }
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
                        {formErrors.governorate && (
                          <span className="absolute top-0 right-0 px-2 py-1 text-xs font-medium text-red-500 rounded-bl bg-red-50">
                            Required
                          </span>
                        )}
                      </div>
                      <ErrorMessage
                        id="governorate-error"
                        error={formErrors.governorate}
                      />
                    </div>
                    <div className="space-y-2">
                      <Tooltip text="Select the delegation within the governorate">
                        <label
                          htmlFor="delegation"
                          className="flex items-center gap-1 text-sm font-medium text-gray-700"
                        >
                          Delegation <span className="text-red-500">*</span>
                          <Info size={14} className="text-gray-400" />
                        </label>
                      </Tooltip>
                      <div className="relative">
                        <select
                          id="delegation"
                          value={formData.location.delegation}
                          onChange={(e) =>
                            handleInputChange(
                              "location",
                              "delegation",
                              e.target.value
                            )
                          }
                          className={`w-full p-3 text-gray-700 bg-white border-2 rounded-xl focus:border-[#ffc929] focus:ring-2 focus:ring-[#ffc929]/30 ${animationClass} ${
                            formErrors.delegation
                              ? "border-red-500 bg-red-50/30 ring-2 ring-red-200"
                              : "border-[#ffc929]/30"
                          } ${
                            !formData.location.governorate
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={!formData.location.governorate}
                          aria-describedby={
                            formErrors.delegation
                              ? "delegation-error"
                              : undefined
                          }
                        >
                          <option value="" disabled>
                            {formData.location.governorate
                              ? "Select Delegation"
                              : "Select governorate first"}
                          </option>
                          {formData.location.governorate &&
                            delegationsByGovernorate[
                              formData.location.governorate
                            ]?.map((del) => (
                              <option key={del} value={del}>
                                {del}
                              </option>
                            ))}
                        </select>
                        {formErrors.delegation && (
                          <span className="absolute top-0 right-0 px-2 py-1 text-xs font-medium text-red-500 rounded-bl bg-red-50">
                            Required
                          </span>
                        )}
                      </div>
                      <ErrorMessage
                        id="delegation-error"
                        error={formErrors.delegation}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  <Tooltip text="Specify the date and time when the pet was lost">
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      When was the pet lost?{" "}
                      <span className="text-red-500">*</span>
                      <Info size={14} className="text-gray-400" />
                    </label>
                  </Tooltip>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex items-center">
                      <div className="relative flex-1">
                        <Calendar
                          className="absolute text-gray-400 left-3 top-3"
                          size={18}
                        />
                        <input
                          type="date"
                          id="date"
                          value={formData.date}
                          onChange={(e) =>
                            handleInputChange("date", null, e.target.value)
                          }
                          max={new Date().toISOString().split("T")[0]}
                          className={`w-full p-3 pl-10 text-gray-700 bg-white border-2 rounded-xl focus:border-[#ffc929] focus:ring-2 focus:ring-[#ffc929]/30 ${animationClass} ${
                            formErrors.date
                              ? "border-red-500 bg-red-50/30 ring-2 ring-red-200"
                              : "border-[#ffc929]/30"
                          }`}
                          aria-describedby={
                            formErrors.date ? "date-error" : undefined
                          }
                        />
                        {formErrors.date && (
                          <span className="absolute top-0 right-0 px-2 py-1 text-xs font-medium text-red-500 rounded-bl bg-red-50">
                            Required
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={setCurrentDateTime}
                        className={`px-4 py-3 ml-2 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:shadow-lg ${animationClass}`}
                      >
                        Today
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="timeType"
                            checked={formData.timeKnown}
                            onChange={() =>
                              handleInputChange("timeKnown", null, true)
                            }
                            className="w-4 h-4 text-[#ffc929] border-gray-300 focus:ring-[#ffc929]"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Exact time
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="timeType"
                            checked={!formData.timeKnown}
                            onChange={() =>
                              handleInputChange("timeKnown", null, false)
                            }
                            className="w-4 h-4 text-[#ffc929] border-gray-300 focus:ring-[#ffc929]"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Approximate time
                          </span>
                        </label>
                      </div>
                      {formData.timeKnown ? (
                        <div className="relative">
                          <Clock
                            className="absolute text-gray-400 left-3 top-3"
                            size={18}
                          />
                          <input
                            type="time"
                            id="exactTime"
                            value={formData.exactTime}
                            onChange={(e) =>
                              handleInputChange(
                                "exactTime",
                                null,
                                e.target.value
                              )
                            }
                            className={`w-full p-3 pl-10 text-gray-700 bg-white border-2 rounded-xl focus:border-[#ffc929] focus:ring-2 focus:ring-[#ffc929]/30 ${animationClass} ${
                              formErrors.exactTime
                                ? "border-red-500 bg-red-50/30 ring-2 ring-red-200"
                                : "border-[#ffc929]/30"
                            }`}
                            aria-describedby={
                              formErrors.exactTime
                                ? "exactTime-error"
                                : undefined
                            }
                          />
                          {formErrors.exactTime && (
                            <span className="absolute top-0 right-0 px-2 py-1 text-xs font-medium text-red-500 rounded-bl bg-red-50">
                              Required
                            </span>
                          )}
                          <ErrorMessage
                            id="exactTime-error"
                            error={formErrors.exactTime}
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            id="timeOfDay"
                            value={formData.timeOfDay}
                            onChange={(e) =>
                              handleInputChange(
                                "timeOfDay",
                                null,
                                e.target.value
                              )
                            }
                            className={`w-full p-3 text-gray-700 bg-white border-2 rounded-xl focus:border-[#ffc929] focus:ring-2 focus:ring-[#ffc929]/30 ${animationClass} ${
                              formErrors.timeOfDay
                                ? "border-red-500 bg-red-50/30 ring-2 ring-red-200"
                                : "border-[#ffc929]/30"
                            }`}
                            aria-describedby={
                              formErrors.timeOfDay
                                ? "timeOfDay-error"
                                : undefined
                            }
                          >
                            {timeOfDayOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {formErrors.timeOfDay && (
                            <span className="absolute top-0 right-0 px-2 py-1 text-xs font-medium text-red-500 rounded-bl bg-red-50">
                              Required
                            </span>
                          )}
                          <ErrorMessage
                            id="timeOfDay-error"
                            error={formErrors.timeOfDay}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevSection}
                    className={`px-6 py-3 font-medium text-gray-700 border-2 border-gray-300 rounded-xl hover:border-[#ffc929]/50 flex items-center gap-2 ${animationClass}`}
                  >
                    <span className="text-xl">←</span> Back
                  </button>
                  <button
                    type="button"
                    onClick={nextSection}
                    className={`px-6 py-3 font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:shadow-lg flex items-center gap-2 ${animationClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={
                      !!formErrors.governorate ||
                      !!formErrors.delegation ||
                      !!formErrors.coordinates ||
                      !!formErrors.date ||
                      !!formErrors.exactTime ||
                      !!formErrors.timeOfDay
                    }
                  >
                    Next <span className="text-xl">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                <Info className="text-[#ffc929]" />
                Additional Information{" "}
                <span className="text-sm text-gray-500">
                  Fields marked with <span className="text-red-500">*</span> are
                  required.
                </span>
              </h2>
              <div className="p-6 border border-[#ffc929]/20 rounded-xl bg-white">
                <div className="space-y-4">
                  <Tooltip text="Does the pet have a microchip?">
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      Microchip <span className="text-red-500">*</span>
                      <Info size={14} className="text-gray-400" />
                    </label>
                  </Tooltip>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasMicrochip"
                        value="Yes"
                        checked={formData.hasMicrochip === "Yes"}
                        onChange={() =>
                          handleInputChange("hasMicrochip", null, "Yes")
                        }
                        className="w-4 h-4 text-[#ffc929] border-gray-300 focus:ring-[#ffc929]"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasMicrochip"
                        value="No"
                        checked={formData.hasMicrochip === "No"}
                        onChange={() => {
                          handleInputChange("hasMicrochip", null, "No");
                          handleInputChange("microchipNumber", null, "");
                        }}
                        className="w-4 h-4 text-[#ffc929] border-gray-300 focus:ring-[#ffc929]"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {formData.hasMicrochip === "Yes" && (
                    <div className="mt-4 space-y-2">
                      <Tooltip text="Enter the pet's microchip number">
                        <label
                          htmlFor="microchipNumber"
                          className="flex items-center gap-1 text-sm font-medium text-gray-700"
                        >
                          Microchip Number{" "}
                          <span className="text-red-500">*</span>
                          <Info size={14} className="text-gray-400" />
                        </label>
                      </Tooltip>
                      <div className="relative">
                        <input
                          type="text"
                          id="microchipNumber"
                          value={formData.microchipNumber}
                          onChange={(e) =>
                            handleInputChange(
                              "microchipNumber",
                              null,
                              e.target.value
                            )
                          }
                          placeholder="Enter microchip number"
                          className={`w-full p-3 text-gray-700 bg-white border-2 rounded-xl focus:border-[#ffc929] focus:ring-2 focus:ring-[#ffc929]/30 ${animationClass} ${
                            formErrors.microchipNumber
                              ? "border-red-500 bg-red-50/30 ring-2 ring-red-200"
                              : "border-[#ffc929]/30"
                          }`}
                          aria-describedby={
                            formErrors.microchipNumber
                              ? "microchipNumber-error"
                              : undefined
                          }
                        />
                        {formErrors.microchipNumber && (
                          <span className="absolute top-0 right-0 px-2 py-1 text-xs font-medium text-red-500 rounded-bl bg-red-50">
                            Required
                          </span>
                        )}
                        <ErrorMessage
                          id="microchipNumber-error"
                          error={formErrors.microchipNumber}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 space-y-2">
                  <Tooltip text="Provide details about the pet (e.g., behavior, collar)">
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      Description <span className="text-red-500">*</span>
                      <Info size={14} className="text-gray-400" />
                    </label>
                  </Tooltip>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", null, e.target.value)
                    }
                    placeholder="Describe the pet (behavior, distinguishing features, collar type, etc.)"
                    rows={4}
                    className={`w-full p-4 text-gray-700 bg-white border-2 rounded-xl focus:border-[#ffc929] focus:ring-2 focus:ring-[#ffc929]/30 ${animationClass} ${
                      formErrors.description
                        ? "border-red-500 bg-red-50/30 ring-2 ring-red-200"
                        : "border-[#ffc929]/30"
                    }`}
                    aria-describedby={
                      formErrors.description ? "description-error" : undefined
                    }
                  />
                  {formErrors.description && (
                    <ErrorMessage
                      id="description-error"
                      error={formErrors.description}
                    />
                  )}
                </div>
                <div className="mt-6 space-y-2">
                  <Tooltip text="Your contact details are taken from your profile">
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      Contact Information <span className="text-red-500">*</span>
                      <Info size={14} className="text-gray-400" />
                    </label>
                  </Tooltip>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className={`w-full p-3 text-gray-500 bg-gray-100 border-2 rounded-xl ${animationClass} border-[#ffc929]/30 cursor-not-allowed`}
                        aria-label="Your email (taken from profile)"
                        aria-describedby={
                          formErrors.email ? "email-error" : undefined
                        }
                      />
                      {formErrors.email && (
                        <span className="absolute top-0 right-0 px-2 py-1 text-xs font-medium text-red-500 rounded-bl bg-red-50">
                          Required
                        </span>
                      )}
                      <ErrorMessage id="email-error" error={formErrors.email} />
                    </div>
                    <div className="relative">
                      <input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        disabled
                        className={`w-full p-3 text-gray-500 bg-gray-100 border-2 rounded-xl ${animationClass} border-[#ffc929]/30 cursor-not-allowed`}
                        aria-label="Your phone number (taken from profile)"
                        aria-describedby={
                          formErrors.phoneNumber
                            ? "phoneNumber-error"
                            : undefined
                        }
                      />
                      {formErrors.phoneNumber && (
                        <span className="absolute top-0 right-0 px-2 py-1 text-xs font-medium text-red-500 rounded-bl bg-red-50">
                          Required
                        </span>
                      )}
                      <ErrorMessage
                        id="phoneNumber-error"
                        error={formErrors.phoneNumber}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevSection}
                  className={`px-6 py-3 font-medium text-gray-700 border-2 border-gray-300 rounded-xl hover:border-[#ffc929]/50 flex items-center gap-2 ${animationClass}`}
                >
                  <span className="text-xl">←</span> Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 ${animationClass}`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
              <ErrorMessage id="submit-error" error={formErrors.submit} />
            </div>
          )}
        </form>

        <div className="mt-8 text-center text-gray-500">
          <p>We will review your report and get back to you as soon as possible.</p>
        </div>
      </div>
    </div>
  );
}