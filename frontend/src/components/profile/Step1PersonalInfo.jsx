import React, { useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

const Step1PersonalInfo = ({ formData, setFormData, formErrors, setFormErrors }) => {
  const defaultImageUrl =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNMTYwIDE4MEgzOUM0MSAxNDAgODAgMTIwIDEwMCAxMjBDMTIwIDEyMCAxNTggMTQwIDE2MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==";

  useEffect(() => {
    if (!formData.trainerDetails || typeof formData.trainerDetails !== "object") {
      setFormData({
        image: formData.image || "",
        gender: formData.gender || "",
        acceptedTerms: false,
        trainerDetails: {
          governorate: "",
          delegation: "",
          phone: "",
          certificationImage: "",
          trainingFacilityType: "",
          geolocation: { latitude: 36.81897, longitude: 10.16579 },
          serviceAreas: [],
          businessCardImage: "",
          experienceYears: 0,
          languagesSpoken: [],
          services: [],
          openingHours: {
            monday: "Closed", mondayStart: "", mondayEnd: "", mondayStart2: "", mondayEnd2: "",
            tuesday: "Closed", tuesdayStart: "", tuesdayEnd: "", tuesdayStart2: "", tuesdayEnd2: "",
            wednesday: "Closed", wednesdayStart: "", wednesdayEnd: "", wednesdayStart2: "", wednesdayEnd2: "",
            thursday: "Closed", thursdayStart: "", thursdayEnd: "", thursdayStart2: "", thursdayEnd2: "",
            friday: "Closed", fridayStart: "", fridayEnd: "", fridayStart2: "", fridayEnd2: "",
            saturday: "Closed", saturdayStart: "", saturdayEnd: "", saturdayStart2: "", saturdayEnd2: "",
            sunday: "Closed", sundayStart: "", sundayEnd: "", sundayStart2: "", sundayEnd2: "",
          },
          trainingPhotos: [],
          averageSessionDuration: "",
        },
      });
    }
  }, [formData, setFormData]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);
    try {
      const response = await axiosInstance.post("/api/upload", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, image: response.data.url }));
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => {
      if (section === "root") return { ...prev, [field]: value };
      return { ...prev, [section]: { ...prev[section], [field]: value } };
    });
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleLanguageChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const languages = checked
        ? [...(prev.trainerDetails.languagesSpoken || []), value]
        : (prev.trainerDetails.languagesSpoken || []).filter((lang) => lang !== value);
      return {
        ...prev,
        trainerDetails: { ...prev.trainerDetails, languagesSpoken: languages },
      };
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b border-[#ffc929] pb-2">Step 1: Personal Information</h3>
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative">
          <label className="cursor-pointer">
            <img
              src={formData.image || defaultImageUrl}
              alt="Profile preview"
              className="object-cover w-40 h-40 rounded-full border-2 border-[#ffc929] mb-4 shadow-md hover:opacity-80 transition-opacity duration-200"
            />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              id="profile-upload"
            />
          </label>
          <label
            htmlFor="profile-upload"
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
                  checked={(formData.trainerDetails.languagesSpoken || []).includes(lang)}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
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
              value={formData.trainerDetails.phone || ""}
              onChange={(e) => handleInputChange("trainerDetails", "phone", e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500"
              placeholder="+216 XX XXX XXX"
            />
          </div>
          {formErrors.phone && <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>}
        </div>
      </div>
    </div>
  );
};

export default Step1PersonalInfo;