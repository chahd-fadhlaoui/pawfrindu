import {
  Briefcase,
  Calendar,
  Clock,
  Edit,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Check,
  X
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import img from "../assets/about-3.jpg";

const Profile = ({ userType = 'vet' }) => {
  const [activeTab, setActiveTab] = useState('about');
  const [profileImage, setProfileImage] = useState(img);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  // State for editable user data
  const [userData, setUserData] = useState({
    name: 'Sarah Anderson',
    role: userType === 'vet' ? 'Veterinarian' : userType === 'trainer' ? 'Pet Trainer' : 'Pet Owner',
    specialization: userType === 'vet' ? 'Small Animals & Exotic Pets' : userType === 'trainer' ? 'Dog Behavior Specialist' : null,
    location: 'San Francisco, CA',
    email: 'sarah.anderson@example.com',
    phone: '(555) 123-4567',
    joinDate: 'Jan 2024',
    about: userType === 'pet-owner' 
      ? 'Proud pet parent to two dogs and a cat. Passionate about providing the best care for my furry family members.'
      : `Experienced ${userType === 'vet' ? 'veterinarian' : 'trainer'} specializing in ${userType === 'vet' ? 'small animals and exotic pets' : 'dog behavior'}. Passionate about providing comprehensive care and creating positive experiences for both pets and their owners.`,
    availability: userType !== 'pet-owner' ? 'Monday - Friday, 9:00 AM - 5:00 PM' : null,
    stats: userType !== 'pet-owner' ? {
      experience: '8 years',
      clients: '150',
      rating: '4.9',
      reviews: '84'
    } : null,
    services: userType !== 'pet-owner' ? [
      ...(userType === 'vet' 
        ? ['Regular Check-ups', 'Vaccinations', 'Surgery', 'Emergency Care', 'Dental Care']
        : ['Basic Training', 'Behavior Modification', 'Puppy Training', 'Group Classes', 'Private Sessions']
      )
    ] : null
  });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
        setIsEditing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    fileInputRef.current?.click();
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatChange = (stat, value) => {
    setUserData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: value
      }
    }));
  };

  const handleServiceChange = (index, value) => {
    const newServices = [...userData.services];
    newServices[index] = value;
    setUserData(prev => ({
      ...prev,
      services: newServices
    }));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const renderEditableField = (field, value, type = 'text') => {
    return isEditing ? (
      <input
        type={type}
        value={value}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-[#ffc929]"
      />
    ) : (
      <span>{value}</span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#ffc929]/5 to-pink-50">
      <div className="container p-4 mx-auto">
        <div className="max-w-4xl mx-auto overflow-hidden transition-transform duration-500 bg-white shadow-xl hover:shadow-2xl rounded-2xl hover:-translate-y-1">
          {/* Edit Toggle Button */}
          <button
            onClick={toggleEdit}
            className="absolute top-4 right-4 p-2 transition-all duration-300 rounded-full bg-white hover:bg-[#ffc929] hover:text-white"
          >
            {isEditing ? <Check className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
          </button>

          {/* Profile Header */}
          <div className="relative h-48">
            <div className="absolute inset-0">
              <div className="w-full h-full transition-all duration-1000 bg-gradient-to-r from-[#ffc929] via-orange-400 to-pink-500 animate-gradient" />
              <div className="absolute inset-0 transition-opacity duration-300 bg-black/10 backdrop-blur-sm hover:bg-black/20" />
            </div>
          </div>

          {/* Profile Content */}
          <div className="relative px-6 pb-6 -mt-20">
            {/* Profile Picture */}
            <div className="relative inline-block">
              <div className="p-1 transition-transform duration-300 bg-white rounded-full hover:scale-105">
                <div className="relative w-32 h-32 overflow-hidden rounded-full group">
                  <img 
                    src={profileImage}
                    alt="Profile" 
                    className="object-cover w-full h-full transition-all duration-300 transform group-hover:scale-110"
                  />
                  <button
                    onClick={handleEditClick}
                    className="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-0 bg-black/50 group-hover:opacity-100"
                  >
                    <Edit className="w-6 h-6 text-white transition-transform duration-300 transform hover:scale-110" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="absolute bottom-0 right-0">
                <div className="p-2 transition-all duration-300 transform bg-[#ffc929] rounded-full hover:scale-110 hover:rotate-12">
                  <PawPrint className="w-4 h-4 text-white animate-bounce" />
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="mt-4">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-neutral-800">
                  {renderEditableField('name', userData.name)}
                </h1>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#ffc929]/10 text-[#ffc929]">
                  {renderEditableField('role', userData.role)}
                </span>
              </div>
              {userData.specialization && (
                <p className="text-sm font-medium text-neutral-600">
                  {renderEditableField('specialization', userData.specialization)}
                </p>
              )}
            </div>

            {/* Stats Overview */}
            {userData.stats && (
              <div className="grid grid-cols-4 gap-4 p-4 mt-6 bg-neutral-50 rounded-xl">
                {Object.entries(userData.stats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-semibold text-neutral-800">
                      {renderEditableField(`stats.${key}`, value)}
                    </div>
                    <div className="text-sm capitalize text-neutral-600">{key}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex gap-4 mt-6 border-b">
              {['about', 'contact', ...(userData.services ? ['services'] : [])].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-300 capitalize 
                    ${activeTab === tab 
                      ? 'text-[#ffc929] border-b-2 border-[#ffc929]' 
                      : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="mb-2 text-lg font-semibold text-neutral-800">About</h2>
                    <div className="text-neutral-600">
                      {isEditing ? (
                        <textarea
                          value={userData.about}
                          onChange={(e) => handleInputChange('about', e.target.value)}
                          className="w-full p-2 border rounded focus:outline-none focus:border-[#ffc929]"
                          rows={4}
                        />
                      ) : (
                        <p>{userData.about}</p>
                      )}
                    </div>
                  </div>
                  {userData.availability && (
                    <div>
                      <h2 className="mb-2 text-lg font-semibold text-neutral-800">Availability</h2>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Clock className="w-5 h-5 text-neutral-400" />
                        {renderEditableField('availability', userData.availability)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-3 rounded-lg hover:bg-neutral-50">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-neutral-400" />
                      {renderEditableField('email', userData.email, 'email')}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg hover:bg-neutral-50">
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-neutral-400" />
                      {renderEditableField('phone', userData.phone, 'tel')}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg hover:bg-neutral-50">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-neutral-400" />
                      {renderEditableField('location', userData.location)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg hover:bg-neutral-50">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-neutral-400" />
                      <span>Member since {userData.joinDate}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'services' && userData.services && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-neutral-800">Services Offered</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {userData.services.map((service, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-neutral-50 group">
                        <Briefcase className="w-5 h-5 text-[#ffc929]" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={service}
                            onChange={(e) => handleServiceChange(index, e.target.value)}
                            className="w-full px-2 py-1 bg-transparent border rounded focus:outline-none focus:border-[#ffc929]"
                          />
                        ) : (
                          <span className="text-neutral-700">{service}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add these animations to your global CSS or Tailwind config
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 15s ease infinite;
  }
`;
document.head.appendChild(style);

export default Profile;