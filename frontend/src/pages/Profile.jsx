import React, { useState, useRef } from 'react';  
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

const Profile = ({ userType = 'pet-owner' }) => {  
  const [activeTab, setActiveTab] = useState('about');  
  const [isEditing, setIsEditing] = useState(false);  
  const fileInputRef = useRef(null);  

  const [userData, setUserData] = useState({  
    name: 'Sarah Anderson',  
    profileImage: 'https://example.com/profile.jpg',  
    role: userType === 'pet-owner' ? 'Pet Owner' :   
          userType === 'vet' ? 'Veterinarian' :   
          'Pet Trainer',  
    location: 'San Francisco, CA',  
    email: 'sarah.anderson@example.com',  
    phone: '(555) 123-4567',  
    joinDate: 'Jan 2024',  
    stats: {  
      pets: 3,  
      adoptions: 3,  
      yearsActive: 5  
    },  
    about: 'Passionate pet lover dedicated to providing the best care for my furry family members.',  
    availability: 'Always available for my pets',  
    
    adoptedPets: [  
      {  
        id: 1,  
        name: 'Max',  
        type: 'Dog',  
        breed: 'Golden Retriever',  
        age: '4 years',  
        adoptionDate: 'June 2020',  
        image: 'https://example.com/max.jpg',  
        specialNeeds: false  
      },  
      {  
        id: 2,  
        name: 'Luna',  
        type: 'Cat',  
        breed: 'Maine Coon',  
        age: '2 years',  
        adoptionDate: 'February 2022',  
        image: 'https://example.com/luna.jpg',  
        specialNeeds: true,  
        specialNeedsDescription: 'Requires special diet and regular check-ups'  
      },  
      {  
        id: 3,  
        name: 'Buddy',  
        type: 'Dog',  
        breed: 'Rescue Mix',  
        age: '6 years',  
        adoptionDate: 'September 2018',  
        image: 'https://example.com/buddy.jpg',  
        specialNeeds: false  
      }  
    ]  
  });  

  // Handle input changes  
  const handleInputChange = (field, value) => {  
    setUserData(prev => ({  
      ...prev,  
      [field]: value  
    }));  
  };  

  // Handle service changes  
  const handleServiceChange = (index, value) => {  
    const newServices = [...(userData.services || [])];  
    newServices[index] = value;  
    setUserData(prev => ({  
      ...prev,  
      services: newServices  
    }));  
  };  

  // Handle pet changes  
  const handlePetChange = (index, field, value) => {  
    const newAdoptedPets = [...userData.adoptedPets];  
    newAdoptedPets[index] = {  
      ...newAdoptedPets[index],  
      [field]: value  
    };  
    setUserData(prev => ({  
      ...prev,  
      adoptedPets: newAdoptedPets  
    }));  
  };  

  // Render editable field  
  const renderEditableField = (field, value, type = 'text') => {  
    if (isEditing) {  
      return (  
        <input  
          type={type}  
          value={value}  
          onChange={(e) => handleInputChange(field, e.target.value)}  
          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-[#ffc929]"  
        />  
      );  
    }  
    return <span>{value}</span>;  
  };  

  // Render adopted pets tab  
  const renderAdoptedPetsTab = () => {  
    if (userType !== 'pet-owner' || !userData.adoptedPets) return null;  

    return (  
      <div className="space-y-6">  
        <h2 className="text-lg font-semibold text-neutral-800">Adopted Pets</h2>  
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">  
          {userData.adoptedPets.map((pet, index) => (  
            <div   
              key={pet.id}   
              className="overflow-hidden transition-all duration-300 bg-white border rounded-lg shadow-sm hover:shadow-md"  
            >  
              <div className="relative w-full h-48">  
                <img   
                  src={pet.image}   
                  alt={pet.name}   
                  className="absolute inset-0 object-cover w-full h-full"  
                />  
                {isEditing ? (  
                  <input   
                    type="text"   
                    value={pet.image}  
                    onChange={(e) => handlePetChange(index, 'image', e.target.value)}  
                    className="absolute bottom-0 left-0 right-0 w-full p-1 text-sm text-white bg-black/50"  
                    placeholder="Image URL"  
                  />  
                ) : null}  
              </div>  
              <div className="p-4">  
                <div className="flex items-center justify-between mb-2">  
                  <h3 className="text-xl font-bold">  
                    {isEditing ? (  
                      <input   
                        type="text"  
                        value={pet.name}  
                        onChange={(e) => handlePetChange(index, 'name', e.target.value)}  
                        className="w-full px-2 py-1 border rounded"  
                      />  
                    ) : (  
                      pet.name  
                    )}  
                  </h3>  
                  {pet.specialNeeds && (  
                    <span className="px-2 py-1 text-xs text-red-600 bg-red-100 rounded-full">  
                      Special Needs  
                    </span>  
                  )}  
                </div>  
                <div className="space-y-2 text-sm text-neutral-600">  
                  <div className="flex justify-between">  
                    <span>Type:</span>  
                    {isEditing ? (  
                      <input   
                        type="text"  
                        value={pet.type}  
                        onChange={(e) => handlePetChange(index, 'type', e.target.value)}  
                        className="w-1/2 px-1 border rounded"  
                      />  
                    ) : (  
                      <span>{pet.type}</span>  
                    )}  
                  </div>  
                  {/* Additional pet details rendering similar to above */}  
                </div>  
              </div>  
            </div>  
          ))}  
        </div>  
      </div>  
    );  
  };  

  // Determine tabs based on user type  
  const tabs = [  
    'about',   
    'contact',   
    ...(userData.services ? ['services'] : []),   
    ...(userType === 'pet-owner' ? ['adopted-pets'] : [])  
  ];  

  return (  
    <div className="container px-4 py-8 mx-auto">  
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl">  
        <div className="p-6">  
          {/* Profile Header */}  
          <div className="flex items-center mb-6">  
            <img   
              src={userData.profileImage}   
              alt={userData.name}   
              className="object-cover w-20 h-20 mr-4 rounded-full"  
            />  
            <div>  
              <h1 className="text-2xl font-bold text-neutral-800">{userData.name}</h1>  
              <p className="text-neutral-600">{userData.role}</p>  
            </div>  
          </div>  

          {/* Stats Grid */}  
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

          {/* Navigation Tabs */}  
          <div className="flex gap-4 mt-6 border-b">  
            {tabs.map((tab) => (  
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
              </div>  
            )}  

            {activeTab === 'contact' && (  
              // Contact tab content  
              <div className="grid gap-4 sm:grid-cols-2">  
                {/* Contact details similar to previous implementation */}  
              </div>  
            )}  

            {activeTab === 'adopted-pets' && renderAdoptedPetsTab()}  
          </div>  
        </div>  
      </div>  
    </div>  
  );  
};  

export default Profile;