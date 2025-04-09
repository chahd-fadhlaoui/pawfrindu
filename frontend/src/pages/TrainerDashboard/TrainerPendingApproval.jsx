import React from 'react';
import { User, PawPrint, Clock, Mail, CircleCheckBig, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TrainerPendingApproval = () => {
  const { user, logout } = useApp();
  const trainerName = user?.fullName || 'Trainer';

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <section className="relative min-h-screen py-20 bg-yellow-50">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute text-6xl text-yellow-200 transform top-20 left-10 opacity-20 -rotate-12">🏋️</div>
        <div className="absolute text-6xl transform rotate-45 text-amber-200 top-40 right-20 opacity-20">🐾</div>
        <div className="absolute top-0 left-0 bg-yellow-200 rounded-full w-72 h-72 mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute bottom-0 right-0 rounded-full bg-amber-200 w-72 h-72 mix-blend-multiply filter blur-xl opacity-10 animate-blob-reverse" />
      </div>

      {/* Content Container */}
      <div className="relative max-w-2xl px-4 mx-auto">
        <div className="group relative overflow-hidden bg-white rounded-3xl p-12 transform transition-all duration-500 hover:scale-[1.02] border border-yellow-100 shadow-lg hover:border-yellow-300">
          <div className="absolute inset-0 transition-all duration-500 opacity-0 bg-gradient-to-r from-yellow-50/30 via-amber-50/30 to-orange-50/30 group-hover:opacity-100 group-hover:bg-[length:200%_200%] animate-gradient" />
          
          <div className="relative z-10 space-y-8 text-center">
            {/* Icon Container */}
            <div className="relative mx-auto">
              <div className="w-24 h-24 p-5 mx-auto transition-all duration-500 transform rounded-full bg-gradient-to-br from-yellow-50 to-amber-50 group-hover:from-yellow-100 group-hover:to-amber-100 group-hover:rotate-6">
                <div className="transition-transform duration-500 group-hover:scale-110">
                  <User className="w-full h-full text-yellow-700" />
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
                <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-yellow-600 bg-white border border-yellow-100 rounded-full shadow-sm">
                  <Clock className="w-4 h-4 mr-2 text-amber-500" />
                  Approval Pending
                </span>
                <h1 className="text-4xl font-bold text-gray-900">
                  <span className="block">Welcome, {trainerName}!</span>
                  <span className="block mt-2 text-yellow-600">Profile Under Review</span>
                </h1>
              </div>
              <p className="max-w-md mx-auto text-lg leading-relaxed text-gray-700">
                Your trainer profile is currently being reviewed by our admin team. 
                We’re ensuring all trainers meet our standards for pet care and training excellence.
              </p>
              
              {/* Additional Information */}
              <div className="flex flex-col items-center pt-4 space-y-4">
                <div className="flex items-center space-x-3 text-gray-800">
                  <PawPrint className="w-5 h-5 text-yellow-500" />
                  <span>Estimated review time: 2-4 days</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-800">
                  <Mail className="w-5 h-5 text-amber-500" />
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
                className="inline-flex items-center px-6 py-3 text-gray-700 transition-colors bg-white border border-yellow-200 rounded-full shadow-sm group hover:bg-gray-50 hover:border-gray-300"
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

export default TrainerPendingApproval;