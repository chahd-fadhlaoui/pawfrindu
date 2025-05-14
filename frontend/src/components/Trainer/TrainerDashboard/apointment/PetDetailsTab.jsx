import { AlertTriangle, Heart } from "lucide-react";
import { getPetEmoji } from "./AppointmentCard.jsx";

const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-sm">
    <div className="flex items-center gap-3 pb-3 mb-4 border-b border-gray-100">
      <Icon className="w-6 h-6 text-[#ffc929]" />
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

export function PetDetailsTab({ appointment: appt }) {
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
    Puppy: "bg-yellow-50 text-[#ffc929]",
    Kitten: "bg-yellow-50 text-[#ffc929]",
    Young: "bg-green-50 text-green-600",
    Adult: "bg-teal-50 text-teal-600",
    Senior: "bg-amber-50 text-amber-600",
    Unknown: "bg-gray-50 text-gray-600",
  };
  const isIncompleteNonPlatform =
    !appt.isPlatformPet &&
    (!appt.petName || appt.petName === "Unknown" || !appt.species || appt.species === "Unknown");

  return (
    <SectionCard icon={Heart} title="Pet Details">
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
        <div className="w-12 h-12 flex items-center justify-center bg-yellow-50 rounded-full mr-3">
          {getPetEmoji(appt.species)}
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-800">{appt.petName || "Unknown"}</h4>
          <p className="text-sm text-gray-600">
            {appt.species || appt.petType || "Unknown"} • {appt.petAge || "Unknown"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <span className="text-gray-600">Age</span>
          <p className="font-medium text-gray-800">{appt.petAge || "Unknown"}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <span className="text-gray-600">Gender</span>
          <p className="font-medium text-gray-800">{appt.petAge || "Unknown"}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <span className="text-gray-600">Breed</span>
          <p className="font-medium text-gray-800">{appt.breed || "Unknown"}</p>
        </div>
      </div>
      <div className="flex items-center mb-3">
        <span className="text-sm text-gray-600 mr-2">Age Category:</span>
        <span className={`text-sm px-2 py-0.5 rounded-full ${ageStyles[ageCategory]}`}>
          {ageCategory}
        </span>
      </div>
      <div className="flex items-center mb-3">
        <span className="text-sm text-gray-600 mr-2">Training Status:</span>
        <span
          className={`text-sm px-2 py-0.5 rounded-full ${
            appt.isTrained ? "bg-green-50 text-green-600" : "bg-yellow-50 text-[#ffc929]"
          }`}
        >
          {appt.isTrained ? "Trained" : "Not Trained"}
        </span>
      </div>
      {appt.fee && (
        <div className="mt-2">
          <span className="text-sm text-gray-600">Fee:</span>
          <span className="text-sm font-medium ml-2">{appt.fee}dt</span>
        </div>
      )}
      {isIncompleteNonPlatform && (
        <div className="mt-4 bg-yellow-50 border-l-4 border-[#ffc929] p-3 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 text-[#ffc929] mr-2" />
          <p className="text-sm text-gray-700">
            This pet is not registered on the platform and has incomplete details.
          </p>
        </div>
      )}
    </SectionCard>
  );
}