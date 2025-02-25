// components/PetApplicationForm.jsx
import React, { useState, useEffect } from "react";
import { X, PawPrint } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function PetApplicationForm({ petId, onClose }) {
  const { user, applyToAdopt } = useApp(); // Assuming applyToAdopt is added to AppContext
  const [formData, setFormData] = useState({
    address: "",
    phone: "",
    petExperience: {
      hasPreviousPets: false,
      yearsOfExperience: 0,
      experience_description: "" // Corrected typo
    },
    occupation: "",
    workSchedule: "",
    housing: {
      type: "",
      ownership: "",
      familySize: 1,
      landlordApproval: false
    },
    reasonForAdoption: "",
    readiness: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.petOwnerDetails) {
      setFormData((prev) => ({
        ...prev,
        address: user.petOwnerDetails.address || prev.address,
        phone: user.petOwnerDetails.phone || prev.phone,
        petExperience: {
          hasPreviousPets: user.petOwnerDetails.petExperience?.hasPreviousPets || prev.petExperience.hasPreviousPets,
          yearsOfExperience: user.petOwnerDetails.petExperience?.yearsOfExperience || prev.petExperience.yearsOfExperience,
          experience_description: user.petOwnerDetails.petExperience?.experinece_description || prev.petExperience.experience_description,
        },
        occupation: user.petOwnerDetails.occupation || prev.occupation,
        workSchedule: user.petOwnerDetails.workSchedule || prev.workSchedule,
        housing: {
          type: user.petOwnerDetails.housing?.type || prev.housing.type,
          ownership: user.petOwnerDetails.housing?.ownership || prev.housing.ownership,
          familySize: user.petOwnerDetails.housing?.familySize || prev.housing.familySize,
          landlordApproval: user.petOwnerDetails.housing?.landlordApproval || prev.housing.landlordApproval
        }
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("petExperience.") || name.includes("housing.")) {
      const [parent, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: type === "checkbox" ? checked : value
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Basic validation
    if (formData.housing.ownership === "rent" && !formData.housing.landlordApproval) {
      setError("Landlord approval is required if renting.");
      setSubmitting(false);
      return;
    }

    try {
      const applicationData = { ...formData, petId, applicantId: user._id };
      const result = await applyToAdopt(petId, applicationData); // Assuming this method exists
      if (result.success) {
        console.log("Application submitted:", applicationData);
        onClose();
      } else {
        setError(result.error || "Failed to submit application");
      }
    } catch (err) {
      setError(err.message || "An error occurred while submitting");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto my-16 p-6 relative max-h-[95vh] overflow-y-auto custom-scrollbar">
        <div className="absolute -top-4 -right-4 w-24 h-24 text-[#ffc929] opacity-20 pointer-events-none">
          <PawPrint size={96} />
        </div>
        <button
          onClick={onClose}
          className="absolute z-10 text-gray-500 transition-colors right-4 top-4 hover:text-gray-700"
          disabled={submitting}
        >
          <X size={24} />
        </button>
        <div className="flex items-center gap-2 mb-6">
          <PawPrint className="text-[#ffc929]" size={28} />
          <h2 className="text-2xl font-bold text-[#8B5D6B]">Adoption Application</h2>
        </div>

        {error && (
          <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#8B5D6B]" htmlFor="address">Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929] bg-gray-50"
              placeholder="Your address"
              required
              disabled={submitting}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#8B5D6B]" htmlFor="phone">Phone *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929] bg-gray-50"
              placeholder="Your phone number"
              required
              disabled={submitting}
            />
          </div>

          {/* Pet Experience */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#8B5D6B]">Pet Experience</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasPreviousPets"
                name="petExperience.hasPreviousPets"
                checked={formData.petExperience.hasPreviousPets}
                onChange={handleChange}
                className="w-4 h-4 text-[#ffc929] border-gray-300 rounded focus:ring-[#ffc929]"
                disabled={submitting}
              />
              <label htmlFor="hasPreviousPets" className="text-sm text-gray-700">I’ve had pets before</label>
            </div>
            {formData.petExperience.hasPreviousPets && (
              <>
                <input
                  type="number"
                  id="yearsOfExperience"
                  name="petExperience.yearsOfExperience"
                  value={formData.petExperience.yearsOfExperience}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929] bg-gray-50"
                  placeholder="Years of experience"
                  min="0"
                  required={formData.petExperience.hasPreviousPets}
                  disabled={submitting}
                />
                <textarea
                  id="experience_description"
                  name="petExperience.experience_description"
                  value={formData.petExperience.experience_description}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929] bg-gray-50 resize-none"
                  placeholder="Describe your experience with pets..."
                  rows="3"
                  disabled={submitting}
                />
              </>
            )}
          </div>

          {/* Occupation */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#8B5D6B]" htmlFor="occupation">Occupation</label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929] bg-gray-50"
              placeholder="Your current occupation"
              disabled={submitting}
            />
          </div>

          {/* Work Schedule */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#8B5D6B]" htmlFor="workSchedule">Work Schedule</label>
            <select
              id="workSchedule"
              name="workSchedule"
              value={formData.workSchedule}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929] bg-gray-50"
              disabled={submitting}
            >
              <option value="">Select work schedule</option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="remote">Remote</option>
              <option value="flexible">Flexible</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Housing */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#8B5D6B]" htmlFor="housing.type">Housing Type *</label>
            <select
              id="housing.type"
              name="housing.type"
              value={formData.housing.type}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929] bg-gray-50"
              required
              disabled={submitting}
            >
              <option value="">Select housing type</option>
              <option value="villa">Villa</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#8B5D6B]" htmlFor="housing.ownership">Housing Ownership *</label>
            <select
              id="housing.ownership"
              name="housing.ownership"
              value={formData.housing.ownership}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929] bg-gray-50"
              required
              disabled={submitting}
            >
              <option value="">Select ownership</option>
              <option value="own">Own</option>
              <option value="rent">Rent</option>
            </select>
          </div>

          {formData.housing.ownership === "rent" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#8B5D6B]" htmlFor="housing.landlordApproval">Landlord Approval *</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="housing.landlordApproval"
                  name="housing.landlordApproval"
                  checked={formData.housing.landlordApproval}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#ffc929] border-gray-300 rounded focus:ring-[#ffc929]"
                  required={formData.housing.ownership === "rent"}
                  disabled={submitting}
                />
                <label htmlFor="housing.landlordApproval" className="text-sm text-gray-700">Approved by landlord</label>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#8B5D6B]" htmlFor="housing.familySize">Family Size *</label>
            <input
              type="number"
              id="housing.familySize"
              name="housing.familySize"
              value={formData.housing.familySize}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929] bg-gray-50"
              placeholder="Number of family members"
              min="1"
              required
              disabled={submitting}
            />
          </div>

          {/* Additional Fields */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#8B5D6B]" htmlFor="reasonForAdoption">Reason for Adoption *</label>
            <textarea
              id="reasonForAdoption"
              name="reasonForAdoption"
              value={formData.reasonForAdoption}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929] bg-gray-50 resize-none"
              placeholder="Why do you want to adopt this pet?"
              rows="3"
              required
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#8B5D6B]" htmlFor="readiness">Readiness to Adopt *</label>
            <select
              id="readiness"
              name="readiness"
              value={formData.readiness}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929] bg-gray-50"
              required
              disabled={submitting}
            >
              <option value="">Select readiness</option>
              <option value="immediate">Immediate</option>
              <option value="within_a_month">Within a Month</option>
              <option value="later">Later</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              className="w-full bg-[#ffc929] text-white py-3 rounded-full font-bold hover:bg-[#e6b625] transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 font-bold text-gray-600 transition-colors duration-300 bg-gray-100 rounded-full hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}