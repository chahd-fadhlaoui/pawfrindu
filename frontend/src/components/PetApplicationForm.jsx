import React, { useState, useEffect } from "react";
import { X, PawPrint, Check, Info, ChevronRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import axiosInstance from "../utils/axiosInstance"; // Importer axiosInstance

function PetApplicationForm({ petId, petName, petImage, onClose }) {
  const { user } = useApp(); // On garde user pour les données initiales, mais pas applyToAdopt
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    occupation: "",
    workSchedule: "",
    housing: {
      type: "",
      ownership: "",
      familySize: 1,
      landlordApproval: false,
    },
    reasonForAdoption: "",
    readiness: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.petOwnerDetails) {
      setFormData((prev) => ({
        ...prev,
        occupation: user.petOwnerDetails.occupation || prev.occupation,
        workSchedule: user.petOwnerDetails.workSchedule || prev.workSchedule,
        housing: {
          type: user.petOwnerDetails.housing?.type || prev.housing.type,
          ownership: user.petOwnerDetails.housing?.ownership || prev.housing.ownership,
          familySize: user.petOwnerDetails.housing?.familySize || prev.housing.familySize,
          landlordApproval: user.petOwnerDetails.housing?.landlordApproval || prev.housing.landlordApproval,
        },
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("housing.")) {
      const [parent, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const applicationData = { ...formData, petId, applicantId: user._id };
      // Appel direct à l'API avec axiosInstance
      const response = await axiosInstance.post(`/api/pet/${petId}/apply`, applicationData);
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => onClose(), 3000);
      } else {
        setError(response.data.message || "Failed to submit application");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while submitting");
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1: // Employment
        return formData.occupation && formData.workSchedule;
      case 2: // Housing
        return formData.housing.type && formData.housing.ownership && 
               formData.housing.familySize >= 1;
      case 3: // Adoption info
        return formData.reasonForAdoption && formData.readiness;
      default:
        return true;
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-green-100 rounded-full p-3">
              <Check size={40} className="text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h3>
          <p className="text-gray-600 mb-6">
            Your application for {petName || "this pet"} has been submitted successfully. The shelter will review your application and contact you soon.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-[#ffc929] text-white py-3 rounded-full font-bold hover:bg-[#e6b625] transition-colors duration-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const renderProgressBar = () => {
    const steps = ["Employment", "Housing", "Adoption Info", "Review"];
    return (
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`text-xs font-medium ${index + 1 <= currentStep ? "text-[#8B5D6B]" : "text-gray-400"}`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#ffc929] transition-all duration-300 ease-in-out" 
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h3 className="text-xl font-bold text-[#8B5D6B] mb-4">Employment Information</h3>
            
            {/* Occupation */}
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-[#8B5D6B]" htmlFor="occupation">
                Your Occupation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929] bg-gray-50"
                placeholder="Your current occupation"
                required
                disabled={submitting}
              />
            </div>

            {/* Work Schedule */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#8B5D6B]" htmlFor="workSchedule">
                Work Schedule <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["full-time", "part-time", "remote", "flexible", "other"].map((option) => (
                  <div
                    key={option}
                    onClick={() => !submitting && setFormData(prev => ({ ...prev, workSchedule: option }))}
                    className={`
                      p-3 border rounded-xl cursor-pointer transition-all text-center
                      ${formData.workSchedule === option 
                        ? "border-[#ffc929] bg-[#fff8e1] text-[#8B5D6B]" 
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"}
                    `}
                  >
                    {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h3 className="text-xl font-bold text-[#8B5D6B] mb-4">Housing Information</h3>
            
            {/* Housing Type */}
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-[#8B5D6B]">
                Housing Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["villa", "house", "apartment", "other"].map((option) => (
                  <div
                    key={option}
                    onClick={() => !submitting && setFormData(prev => ({ 
                      ...prev, 
                      housing: { ...prev.housing, type: option } 
                    }))}
                    className={`
                      p-3 border rounded-xl cursor-pointer transition-all text-center
                      ${formData.housing.type === option 
                        ? "border-[#ffc929] bg-[#fff8e1] text-[#8B5D6B]" 
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"}
                    `}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </div>
                ))}
              </div>
            </div>

            {/* Housing Ownership */}
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-[#8B5D6B]">
                Housing Ownership <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["own", "rent"].map((option) => (
                  <div
                    key={option}
                    onClick={() => !submitting && setFormData(prev => ({ 
                      ...prev, 
                      housing: { ...prev.housing, ownership: option } 
                    }))}
                    className={`
                      p-3 border rounded-xl cursor-pointer transition-all text-center
                      ${formData.housing.ownership === option 
                        ? "border-[#ffc929] bg-[#fff8e1] text-[#8B5D6B]" 
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"}
                    `}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </div>
                ))}
              </div>
            </div>

            {/* Landlord Approval (si rent) */}
            {formData.housing.ownership === "rent" && (
              <div className="p-4 bg-[#fff8e1] rounded-xl mb-4 border border-[#ffc929]">
                <div className="flex items-start gap-3">
                  <Info size={20} className="text-[#8B5D6B] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#8B5D6B] mb-2">Landlord Approval</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="housing.landlordApproval"
                        name="housing.landlordApproval"
                        checked={formData.housing.landlordApproval}
                        onChange={handleChange}
                        className="w-5 h-5 text-[#ffc929] border-gray-300 rounded focus:ring-[#ffc929]"
                        disabled={submitting}
                      />
                      <label htmlFor="housing.landlordApproval" className="text-sm text-gray-700">
                        I confirm that my landlord has approved pet ownership
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Family Size */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#8B5D6B]" htmlFor="housing.familySize">
                How many people live in your home? <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => !submitting && formData.housing.familySize > 1 && setFormData(prev => ({ 
                    ...prev, 
                    housing: { ...prev.housing, familySize: prev.housing.familySize - 1 } 
                  }))}
                  className="p-2 bg-gray-100 rounded-l-xl border border-gray-200 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                  disabled={submitting || formData.housing.familySize <= 1}
                >
                  -
                </button>
                <div className="px-4 py-2 border-t border-b border-gray-200 text-center min-w-16">
                  {formData.housing.familySize}
                </div>
                <button
                  type="button"
                  onClick={() => !submitting && setFormData(prev => ({ 
                    ...prev, 
                    housing: { ...prev.housing, familySize: prev.housing.familySize + 1 } 
                  }))}
                  className="p-2 bg-gray-100 rounded-r-xl border border-gray-200 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                  disabled={submitting}
                >
                  +
                </button>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h3 className="text-xl font-bold text-[#8B5D6B] mb-4">Adoption Information</h3>
            
            {/* Reason for Adoption */}
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-[#8B5D6B]" htmlFor="reasonForAdoption">
                Why do you want to adopt this pet? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reasonForAdoption"
                name="reasonForAdoption"
                value={formData.reasonForAdoption}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc929] bg-gray-50 resize-none"
                placeholder="Share why you're interested in adopting this pet..."
                rows="4"
                required
                disabled={submitting}
              />
              <p className="text-xs text-gray-500">
                Min 20 characters - {formData.reasonForAdoption.length} / 500
              </p>
            </div>

            {/* Readiness to Adopt */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#8B5D6B]">
                When are you ready to adopt? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "immediate", label: "Right Now" },
                  { value: "within_a_month", label: "Within a Month" },
                  { value: "later", label: "Later" }
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => !submitting && setFormData(prev => ({ ...prev, readiness: option.value }))}
                    className={`
                      p-3 border rounded-xl cursor-pointer transition-all text-center
                      ${formData.readiness === option.value 
                        ? "border-[#ffc929] bg-[#fff8e1] text-[#8B5D6B]" 
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"}
                    `}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h3 className="text-xl font-bold text-[#8B5D6B] mb-4">Review Your Application</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-medium text-[#8B5D6B] mb-2">Employment Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Occupation:</div>
                  <div>{formData.occupation}</div>
                  <div className="text-gray-500">Work Schedule:</div>
                  <div>{formData.workSchedule.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-medium text-[#8B5D6B] mb-2">Housing Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Housing Type:</div>
                  <div>{formData.housing.type.charAt(0).toUpperCase() + formData.housing.type.slice(1)}</div>
                  <div className="text-gray-500">Ownership:</div>
                  <div>{formData.housing.ownership.charAt(0).toUpperCase() + formData.housing.ownership.slice(1)}</div>
                  {formData.housing.ownership === "rent" && (
                    <>
                      <div className="text-gray-500">Landlord Approval:</div>
                      <div>{formData.housing.landlordApproval ? "Yes" : "No"}</div>
                    </>
                  )}
                  <div className="text-gray-500">Family Size:</div>
                  <div>{formData.housing.familySize} person{formData.housing.familySize !== 1 ? 's' : ''}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-medium text-[#8B5D6B] mb-2">Adoption Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Readiness:</div>
                  <div>
                    {formData.readiness === "immediate" ? "Right Now" : 
                     formData.readiness === "within_a_month" ? "Within a Month" : "Later"}
                  </div>
                  <div className="text-gray-500 col-span-2">Reason for Adoption:</div>
                  <div className="col-span-2 bg-white p-3 rounded border border-gray-200">
                    {formData.reasonForAdoption}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto my-8 p-6 relative max-h-[95vh] overflow-y-auto custom-scrollbar">
        <div className="absolute top-0 right-0 w-24 h-24 text-[#ffc929] opacity-10 pointer-events-none overflow-hidden">
          <PawPrint size={96} />
        </div>
        
        <button
          onClick={onClose}
          className="absolute z-10 text-gray-500 transition-colors right-4 top-4 hover:text-gray-700"
          disabled={submitting}
        >
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-2 mb-4">
          <PawPrint className="text-[#ffc929]" size={28} />
          <h2 className="text-2xl font-bold text-[#8B5D6B]">Adoption Application</h2>
        </div>
        
        {petName && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
            {petImage && (
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                <img src={petImage} alt={petName} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">You're applying for</p>
              <p className="font-medium text-[#8B5D6B]">{petName}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md flex items-start gap-2">
            <div className="mt-0.5"><Info size={16} /></div>
            <div>{error}</div>
          </div>
        )}

        {renderProgressBar()}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStepContent()}

          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 py-3 font-medium text-gray-600 transition-colors duration-300 bg-gray-100 rounded-full hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                Back
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 bg-[#ffc929] text-white py-3 rounded-full font-bold hover:bg-[#e6b625] transition-colors duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                disabled={submitting || !isStepComplete()}
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 bg-[#ffc929] text-white py-3 rounded-full font-bold hover:bg-[#e6b625] transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default PetApplicationForm;