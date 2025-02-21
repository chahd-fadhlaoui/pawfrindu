import { useState, useEffect } from "react";
import { Mail, MapPin, Phone, Heart, Dog, Cat, Edit, Save } from "lucide-react";
import { useApp } from "../context/AppContext";

const DEFAULT_PROFILE_IMAGE = "/api/placeholder/150/150";
const DEFAULT_PET_IMAGE = "/api/placeholder/100/100";

const Profile = () => {
  const { user, fetchUserProfile, updateUser, loading, error } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({});
  const [activeTab, setActiveTab] = useState("about");

  // Sample adopted pets data - this would come from your API in a real app
  const [adoptedPets, setAdoptedPets] = useState([
    {
      id: 1,
      name: "Buddy",
      type: "Dog",
      breed: "Golden Retriever",
      age: 3,
      adoptedDate: "2023-05-15",
      image: DEFAULT_PET_IMAGE
    },
    {
      id: 2,
      name: "Whiskers",
      type: "Cat",
      breed: "Maine Coon",
      age: 2,
      adoptedDate: "2024-01-10",
      image: DEFAULT_PET_IMAGE
    }
  ]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        await fetchUserProfile();
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    };
    
    loadUserData();
  }, []);
  
  useEffect(() => {
    if (user) {
      setEditableData({
        name: user.fullName,
        about: user.about || "Je suis un passionné des animaux !",
        location: user.petOwnerDetails?.address || "Not provided",
        phone: user.petOwnerDetails?.phone || "Not provided",
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setEditableData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = () => {
    updateUser(editableData);
    setIsEditing(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Heart className="w-8 h-8 text-amber-500 animate-pulse" /></div>;
  if (error) return <div className="text-red-500 p-4 text-center">Error fetching your pet profile: {error}</div>;
  if (!user) return <div className="text-center p-8">No pet parent profile available</div>;

  return (
    <div className="container px-4 py-8 mx-auto bg-amber-50">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl border-2 border-amber-200">
        {/* Top Banner with Pet Icons */}
        <div className="h-16 bg-gradient-to-r from-amber-300 to-amber-400 rounded-t-xl relative overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <Dog 
              key={`dog-${i}`} 
              className="absolute text-white opacity-20" 
              style={{
                top: `${Math.random() * 100}%`,
                left: `${i * 20}%`,
                transform: `rotate(${Math.random() * 30}deg)`,
                width: `${20 + Math.random() * 10}px`,
                height: `${20 + Math.random() * 10}px`
              }}
            />
          ))}
          {[...Array(5)].map((_, i) => (
            <Cat 
              key={`cat-${i}`} 
              className="absolute text-white opacity-20" 
              style={{
                top: `${Math.random() * 100}%`,
                left: `${10 + i * 20}%`,
                transform: `rotate(${Math.random() * 30}deg)`,
                width: `${18 + Math.random() * 8}px`,
                height: `${18 + Math.random() * 8}px`
              }}
            />
          ))}
        </div>
        
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 relative">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="relative mb-4 sm:mb-0">
                <img
                  src={user?.image}
                  alt={user?.name}
                  className="object-cover w-24 h-24 sm:mr-6 rounded-full border-4 border-amber-200 shadow-md"
                />
                <div className="absolute bottom-0 right-0 bg-amber-400 rounded-full p-1">
                  <Heart className="w-4 h-4 text-white" fill="white" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-amber-800">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="border rounded px-2 py-1 focus:outline-none focus:border-amber-400"
                    />
                  ) : (
                    user.name
                  )}
                </h1>
                <p className="text-amber-600 font-medium">{user.role || "Pet Parent"}</p>
                <div className="flex items-center justify-center sm:justify-start mt-2 text-amber-500">
                  <Heart className="w-4 h-4 mr-1" fill="currentColor" />
                  <span className="text-sm">Pet Lover</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-0 right-0 sm:relative p-2 text-amber-600 hover:text-amber-800"
            >
              {isEditing ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-amber-200 mb-6">
            <button
              onClick={() => setActiveTab("about")}
              className={`px-4 py-2 font-medium ${
                activeTab === "about"
                  ? "text-amber-800 border-b-2 border-amber-400"
                  : "text-amber-600 hover:text-amber-800"
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab("pets")}
              className={`px-4 py-2 font-medium flex items-center ${
                activeTab === "pets"
                  ? "text-amber-800 border-b-2 border-amber-400"
                  : "text-amber-600 hover:text-amber-800"
              }`}
            >
              <Heart className="w-4 h-4 mr-1" /> Adopted Pets
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-4 py-2 font-medium ${
                activeTab === "contact"
                  ? "text-amber-800 border-b-2 border-amber-400"
                  : "text-amber-600 hover:text-amber-800"
              }`}
            >
              Contact
            </button>
          </div>

          {/* About Tab Content */}
          {activeTab === "about" && (
            <div className="mt-6">
              <h2 className="mb-4 text-lg font-semibold text-amber-800 flex items-center">
                <span className="bg-amber-100 p-2 rounded-full mr-2">
                  <Heart className="w-5 h-5 text-amber-600" />
                </span>
                About Me
              </h2>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                {isEditing ? (
                  <textarea
                    value={editableData.about}
                    onChange={(e) => handleInputChange("about", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:border-amber-400 bg-white"
                    rows={4}
                  />
                ) : (
                  <p className="text-amber-900">{user.about || "I'm a passionate pet parent who loves animals!"}</p>
                )}
              </div>
            </div>
          )}

          {/* Adopted Pets Tab Content */}
          {activeTab === "pets" && (
            <div className="mt-6">
              <h2 className="mb-4 text-lg font-semibold text-amber-800 flex items-center">
                <span className="bg-amber-100 p-2 rounded-full mr-2">
                  <Heart className="w-5 h-5 text-amber-600" />
                </span>
                My Adopted Pets
              </h2>
              
              <div className="grid gap-6 sm:grid-cols-2">
                {adoptedPets.map(pet => (
                  <div key={pet.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-amber-200 hover:shadow-lg transition-shadow">
                    <div className="h-32 bg-amber-100 relative">
                      <img
                        src={pet.image}
                        alt={pet.name}
                        className="object-cover h-full w-full"
                      />
                      <div className="absolute top-2 right-2 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {pet.type}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-amber-800">{pet.name}</h3>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-amber-700"><span className="font-medium">Breed:</span> {pet.breed}</p>
                        <p className="text-amber-700"><span className="font-medium">Age:</span> {pet.age} years</p>
                        <p className="text-amber-700"><span className="font-medium">Adopted:</span> {new Date(pet.adoptedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {adoptedPets.length === 0 && (
                <div className="text-center py-8 bg-amber-50 rounded-lg border border-amber-100">
                  <Heart className="w-12 h-12 text-amber-300 mx-auto mb-2" />
                  <p className="text-amber-700">You haven't added any adopted pets yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Contact Tab Content */}
          {activeTab === "contact" && (
  <div className="mt-6">
    <h2 className="mb-4 text-lg font-semibold text-amber-800 flex items-center">
      <span className="bg-amber-100 p-2 rounded-full mr-2">
        <Mail className="w-5 h-5 text-amber-600" />
      </span>
      Contact Information
    </h2>
    
    <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex items-start space-x-3">
          <div className="bg-white p-2 rounded-full shadow-sm">
            <Mail className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-amber-700">Email</h3>
            <p className="text-amber-900">{user.email}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="bg-white p-2 rounded-full shadow-sm">
            <Phone className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-amber-700">Phone</h3>
            {isEditing ? (
              <input
                type="text"
                value={editableData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-amber-400 bg-white"
              />
            ) : (
              <p className="text-amber-900">{user.petOwnerDetails?.phone || "Not provided"}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="bg-white p-2 rounded-full shadow-sm">
            <MapPin className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-amber-700">Location</h3>
            {isEditing ? (
              <input
                type="text"
                value={editableData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-amber-400 bg-white"
              />
            ) : (
              <p className="text-amber-900">{user.petOwnerDetails?.address || "Not provided"}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="bg-white p-2 rounded-full shadow-sm">
            <Heart className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-amber-700">Preferred Contact</h3>
            <p className="text-amber-900">Email</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
          {/* Save Button */}
          {isEditing && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 text-white bg-gradient-to-r from-amber-400 to-amber-500 rounded-md hover:from-amber-500 hover:to-amber-600 shadow-md flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 bg-amber-100 rounded-b-xl flex justify-between items-center">
          <div className="flex items-center text-amber-700 text-sm">
            <Heart className="w-4 h-4 mr-1" />
            <span>Pet Parent since 2022</span>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-amber-600 hover:text-amber-800 text-sm flex items-center"
            >
              <Edit className="w-4 h-4 mr-1" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;