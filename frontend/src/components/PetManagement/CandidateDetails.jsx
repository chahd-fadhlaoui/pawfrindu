import React, { useEffect } from 'react';
import { 
  Briefcase, 
  Home, 
  Calendar, 
  Clock, 
  Users, 
  PhoneCall,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Utility function to transform enum values to more readable format
const formatEnum = (value) => {
  if (!value) return 'N/A';
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const CandidateDetails = ({ candidate, petStatus, fetchData }) => {
  // Destructure nested details for easier access
  const { 
    occupation, 
    workSchedule, 
    housing,
    reasonForAdoption,
    readiness,
    phone
  } = candidate.petOwnerDetails || {};

  // Debug: Log candidate.petOwnerDetails to inspect data
  useEffect(() => {
    console.log('Candidate Details:', candidate);
    console.log('Pet Owner Details:', candidate.petOwnerDetails);
  }, [candidate]);

  // Define color and icon mappings for readiness
  const readinessConfig = {
    immediate: { 
      color: 'emerald', 
      icon: <Clock className="w-5 h-5 text-emerald-500" /> 
    },
    within_a_month: { 
      color: 'amber', 
      icon: <Clock className="w-5 h-5 text-amber-500" /> 
    },
    later: { 
      color: 'rose', 
      icon: <Clock className="w-5 h-5 text-rose-500" /> 
    }
  };

  const currentReadinessConfig = readinessConfig[readiness] || readinessConfig.later;

  // Check if phone number is valid
  const hasValidPhone = phone && typeof phone === 'string' && phone.trim() !== '' && phone !== 'N/A';

  return (
    <div className="p-6 mt-4 border-t border-gray-200 shadow-sm bg-white/95 backdrop-blur-sm rounded-b-2xl animate-fade-in">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Professional Background */}
        <div className="p-5 border border-blue-100 shadow-sm bg-gradient-to-br from-white to-blue-50/50 rounded-2xl">
          <h4 className="flex items-center gap-3 pb-2 mb-4 text-lg font-semibold text-gray-800 border-b border-blue-100">
            <Briefcase className="w-6 h-6 text-blue-500" /> Professional Details
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-600">Occupation</span>
              <span className="font-semibold text-gray-800">{formatEnum(occupation) || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-600">Work Schedule</span>
              <span className="font-semibold text-gray-800">{formatEnum(workSchedule) || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Living Situation */}
        <div className="p-5 border border-green-100 shadow-sm bg-gradient-to-br from-white to-green-50/50 rounded-2xl">
          <h4 className="flex items-center gap-3 pb-2 mb-4 text-lg font-semibold text-gray-800 border-b border-green-100">
            <Home className="w-6 h-6 text-green-500" /> Housing Information
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-600">Housing Type</span>
              <span className="font-semibold text-gray-800">{formatEnum(housing?.type) || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-600">Ownership</span>
              <span className="font-semibold text-gray-800">{formatEnum(housing?.ownership) || 'N/A'}</span>
            </div>
            {housing?.ownership === 'rent' && (
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-600">Landlord Approval</span>
                <div className="flex items-center gap-2">
                  {housing.landlordApproval ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-green-700">Approved</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="font-semibold text-red-700">Not Approved</span>
                    </>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium text-gray-600">
                <Users className="w-4 h-4" /> Family Size
              </span>
              <span className="font-semibold text-gray-800">{housing?.familySize || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Adoption Motivation */}
        <div className="p-5 border border-purple-100 shadow-sm md:col-span-2 bg-gradient-to-br from-white to-purple-50/50 rounded-2xl">
          <h4 className="flex items-center gap-3 pb-2 mb-4 text-lg font-semibold text-gray-800 border-b border-purple-100">
            <Calendar className="w-6 h-6 text-purple-500" /> Adoption Journey
          </h4>
          
          <div className="grid gap-4 md:grid-cols-2">
            <blockquote className="p-4 italic text-gray-700 bg-white border border-gray-100 rounded-lg">
              "{reasonForAdoption || 'No motivation provided'}"
            </blockquote>
            
            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-600">Adoption Readiness</span>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-${currentReadinessConfig.color}-100 text-${currentReadinessConfig.color}-800`}>
                  {currentReadinessConfig.icon}
                  {formatEnum(readiness)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {candidate.status === "approved" && (
          <div className="flex items-center gap-4 p-5 border shadow-sm md:col-span-2 bg-amber-50 border-amber-100 rounded-2xl">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <PhoneCall className="w-6 h-6 text-amber-500" />
                <p className="font-medium text-gray-800">
                  {hasValidPhone ? phone : "Contact information not available"}
                </p>
              </div>
            </div>
            {hasValidPhone ? (
              <a 
                href={`tel:${phone}`} 
                className="px-5 py-2.5 text-white transition-all duration-300 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:from-amber-600 hover:to-orange-600 shadow-md"
              >
                Contact
              </a>
            ) : (
              <span className="px-5 py-2.5 text-gray-600 bg-gray-200 rounded-lg shadow-md">
                Contact Unavailable
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDetails;