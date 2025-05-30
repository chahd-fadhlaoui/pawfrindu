import { Heart, AlertTriangle } from "lucide-react";

export default function PetDetailsTab({ appointment: appt }) {
  const getAgeCategory = (age) => {
    if (!age || age === "Unknown") return "Unknown";
    switch (age.toLowerCase()) {
      case "puppy":
      case "kitten":
        return age.charAt(0).toUpperCase() + age.slice(1);
      case "young":
        return "Young";
      case "adult":
        return "Adult";
      case "senior":
        return "Senior";
      default:
        return "Unknown";
    }
  };

  const ageCategory = getAgeCategory(appt.petAge);
  const ageStyles = {
    Puppy: "bg-blue-100 text-blue-600",
    Kitten: "bg-blue-100 text-blue-600",
    Young: "bg-green-100 text-green-600",
    Adult: "bg-teal-100 text-teal-600",
    Senior: "bg-amber-100 text-amber-600",
    Unknown: "bg-gray-100 text-gray-600",
  };
  const isIncompleteNonPlatform = !appt.isPlatformPet && (
    !appt.petName || appt.petName === "Unknown" || !appt.species || appt.species === "Unknown"
  );
  const petEmoji = appt.species === "dog" ? "🐶" :
                   appt.species === "cat" ? "🐱" :
                   appt.species === "bird" ? "🐦" :
                   appt.species === "rabbit" ? "🐰" : "🐾";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3">
          <h3 className="text-white text-sm font-medium flex items-center">
            <Heart className="w-4 h-4 mr-2" />
            Pet Details
          </h3>
        </div>
        <div className="p-4">
          {appt.image && (
            <div className="mb-4">
              <img
                src={appt.image}
                alt={appt.petName}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => (e.target.src = "/default-pet.jpg")}
              />
            </div>
          )}
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-teal-100 rounded-full text-xl mr-3">
              {petEmoji}
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{appt.petName || "Unknown"}</h4>
              <p className="text-xs text-gray-500">
                {appt.species || appt.petType || "Unknown"} • {appt.petAge || "Unknown"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 text-xs">
              <span className="text-gray-500">Age</span>
              <p className="font-medium text-gray-700">{appt.petAge || "Unknown"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-xs">
              <span className="text-gray-500">Gender</span>
              <p className="font-medium text-gray-700">{appt.gender || "Unknown"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-xs">
              <span className="text-gray-500">Breed</span>
              <p className="font-medium text-gray-700">{appt.breed || "Unknown"}</p>
            </div>
          </div>
          <div className="flex items-center mb-3">
            <span className="text-xs text-gray-500 mr-2">Age Category:</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${ageStyles[ageCategory]}`}>
              {ageCategory}
            </span>
          </div>
          <div className="flex items-center mb-3">
            <span className="text-xs text-gray-500 mr-2">Training Status:</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                appt.isTrained ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
              }`}
            >
              {appt.isTrained ? "Trained" : "Not Trained"}
            </span>
          </div>
          {appt.fee && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">Fee:</span>
              <span className="text-sm font-medium ml-2">{appt.fee}dt</span>
            </div>
          )}
          {isIncompleteNonPlatform && (
            <div className="mt-4 bg-amber-50 border-l-4 border-amber-500 p-3 rounded-lg flex items-center">
              <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
              <p className="text-sm text-gray-700">This pet is not registered on the platform and has incomplete details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}