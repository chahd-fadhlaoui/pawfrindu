import React from 'react';
import { Stethoscope, PawPrint, Clock, Mail, CircleCheckBig, LogOut } from 'lucide-react'; // Add LogOut icon
import { useApp } from '../../context/AppContext';

const VetPendingApproval = () => {
  const { user, logout } = useApp(); // Get user and logout from AppContext
  const vetName = user?.fullName || 'Veterinarian';

  const handleLogout = () => {
    logout(); // Call logout function from AppContext
    window.location.href = '/login'; // Redirect to login page
  };

  return (
    <section className="relative min-h-screen py-20 bg-cyan-50">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute text-6xl text-teal-200 transform top-20 left-10 opacity-20 -rotate-12">🐾</div>
        <div className="absolute text-6xl text-blue-200 transform rotate-45 top-40 right-20 opacity-20">🩺</div>
        <div className="absolute top-0 left-0 bg-cyan-200 rounded-full w-72 h-72 mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute bottom-0 right-0 bg-teal-200 rounded-full w-72 h-72 mix-blend-multiply filter blur-xl opacity-10 animate-blob-reverse" />
      </div>

      {/* Content Container */}
      <div className="relative max-w-2xl px-4 mx-auto">
        <div className="group relative overflow-hidden bg-white rounded-3xl p-12 transform transition-all duration-500 hover:scale-[1.02] border border-cyan-100 shadow-lg hover:border-teal-200">
          <div className="absolute inset-0 transition-all duration-500 opacity-0 bg-gradient-to-r from-cyan-50/30 via-teal-50/30 to-blue-50/30 group-hover:opacity-100 group-hover:bg-[length:200%_200%] animate-gradient" />
          
          <div className="relative z-10 space-y-8 text-center">
            {/* Icon Container */}
            <div className="relative mx-auto">
              <div className="w-24 h-24 p-5 mx-auto transition-all duration-500 transform rounded-full bg-gradient-to-br from-cyan-50 to-teal-50 group-hover:from-cyan-100 group-hover:to-teal-100 group-hover:rotate-6">
                <div className="transition-transform duration-500 group-hover:scale-110">
                  <Stethoscope className="w-full h-full text-teal-700" />
                </div>
              </div>
              <div className="absolute transition-all duration-300 -right-2 -top-2">
                <span className="absolute transition-all duration-500 opacity-0 group-hover:opacity-100 animate-ping">🐾</span>
                <span className="transition-all duration-500 opacity-0 group-hover:opacity-100">🐾</span>
              </div>
            </div>

            {/* Enhanced Content */}
            <div className="space-y-4 transition-all duration-300 transform group-hover:translate-y-[-2px]">
              <div className="space-y-2">
                <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-teal-600 bg-white border border-cyan-100 rounded-full shadow-sm">
                  <Clock className="w-4 h-4 mr-2 text-blue-500" />
                  Approval Pending
                </span>
                <h1 className="text-4xl font-bold text-gray-900">
                  <span className="block">Welcome, {vetName}!</span>
                  <span className="block mt-2 text-teal-600">Profile Under Review</span>
                </h1>
              </div>
              <p className="max-w-md mx-auto text-lg leading-relaxed text-gray-700">
                Your professional veterinary profile is currently being carefully reviewed by our admin team. 
                We're committed to maintaining the highest standards of animal healthcare.
              </p>
              
              {/* Additional Information */}
              <div className="flex flex-col items-center space-y-4 pt-4">
                <div className="flex items-center space-x-3 text-gray-800">
                  <PawPrint className="w-5 h-5 text-cyan-500" />
                  <span>Estimated review time: 2-4 days</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-800">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span>Please always check your email</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-800">
                  <CircleCheckBig className="w-5 h-5 text-green-500" />
                  <span>You'll receive an email once approved</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-6">
      
              <button 
                onClick={handleLogout}
                className="inline-flex items-center px-6 py-3 text-gray-700 transition-colors bg-white border border-cyan-200 rounded-full shadow-sm group hover:bg-gray-50 hover:border-gray-300"
              >
                <LogOut className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VetPendingApproval;