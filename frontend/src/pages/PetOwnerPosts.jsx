import React, { useState } from "react";
import { Users, X, Edit, Trash2, Heart, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PetOwnerPosts = ({ posts }) => {
  const navigate = useNavigate();
  const [selectedPet, setSelectedPet] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#ffc929]/5 to-pink-50">
      <div className="container p-8 mx-auto">
        <div className="mb-8 space-y-4 transition-all duration-500 transform hover:translate-x-2">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 transition-colors duration-300 sm:text-4xl lg:text-5xl hover:text-[#ffc929]">
            Pet Adoption Posts
          </h1>
          <p className="mt-2 text-lg transition-colors duration-300 text-neutral-600 hover:text-pink-500">
            Manage your adoption posts and track potential candidates all in one
            place.
          </p>
        </div>

        <div className="overflow-hidden bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(255,201,41,0.2)] transition-all duration-500 transform hover:scale-[1.01] perspective-1000">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-700 uppercase bg-gradient-to-r from-[#ffc929]/10 to-white">
              <tr>
                {[
                  "Pet",
                  "Name",
                  "Description",
                  "Race",
                  "Age",
                  "Fee",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-4 font-medium transition-colors hover:bg-[#ffc929]/10"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((pet, index) => (
                <tr
                  key={index}
                  className="transition-all duration-300 border-b cursor-pointer hover:bg-[#ffc929]/5 group"
                >
                  <td className="px-6 py-4">
                    <div className="overflow-hidden transition-transform duration-500 transform rounded-lg hover:rotate-y-12">
                      <img
                        src={pet.image}
                        alt={pet.name}
                        className="object-cover w-20 h-20 transition-all duration-300 transform group-hover:scale-110"
                        onClick={() => setSelectedPet(pet)}
                      />
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 font-medium text-neutral-900 transition-colors duration-300 hover:text-[#ffc929]"
                    onClick={() => setSelectedPet(pet)}
                  >
                    {pet.name}
                  </td>
                  <td className="max-w-xs px-6 py-4">
                    <p className="truncate text-neutral-600">
                      {pet.description || "Loving pet seeking a forever home."}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{pet.race}</td>
                  <td className="px-6 py-4 text-neutral-600">{pet.age}</td>
                  <td className="px-6 py-4 text-neutral-600">${pet.fee}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={pet.status} />
                  </td>
                  <td className="px-6 py-4">
                    <ActionButtons pet={pet} navigate={navigate} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedPet && (
          <PetModal selectedPet={selectedPet} setSelectedPet={setSelectedPet} />
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Completed: "bg-[#ffc929]/20 text-[#ffc929]",
    Pending: "bg-pink-100 text-pink-500",
    default: "bg-red-100 text-red-500",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
        styles[status] || styles.default
      } hover:opacity-80 transform hover:scale-105`}
    >
      {status}
    </span>
  );
};

const ActionButtons = ({ pet, navigate }) => {
  const handleEdit = (e) => {
    e.stopPropagation();
    // Add edit logic
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    // Add delete logic
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleEdit}
        className="p-2 text-neutral-600 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_16px_rgba(255,201,41,0.3)] hover:bg-[#ffc929] hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-6"
      >
        <Edit size={16} />
      </button>
      <button
        onClick={handleDelete}
        className="p-2 text-neutral-600 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_16px_rgba(236,72,153,0.3)] hover:bg-pink-500 hover:text-white transition-all duration-300 transform hover:scale-110 hover:-rotate-6"
      >
        <Trash2 size={16} />
      </button>
      {pet.status !== "Completed" && (
        <button
          onClick={() => navigate(`/candidates/${pet.id}`)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-[#ffc929] shadow-[0_4px_12px_rgba(255,201,41,0.2)] hover:shadow-[0_8px_16px_rgba(255,201,41,0.3)] hover:bg-[#ffc929] transition-all duration-300 transform hover:scale-105 hover:rotate-2"
        >
          <Users size={16} />
          Candidates
        </button>
      )}
    </div>
  );
};

const PetModal = ({ selectedPet, setSelectedPet }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl animate-in zoom-in">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b">
          <h2 className="text-2xl font-bold text-neutral-900">
            {selectedPet.name}
          </h2>
          <button
            onClick={() => setSelectedPet(null)}
            className="p-2 rounded-full hover:bg-[#ffc929]/10 transition-all duration-300 hover:rotate-90"
          >
            <X size={20} className="text-neutral-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="relative overflow-hidden rounded-lg group">
            <img
              src={selectedPet.image}
              alt={selectedPet.name}
              className="object-cover w-full h-48 transition-transform duration-500 transform group-hover:scale-110"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex items-center gap-2">
                <Heart className="text-[#ffc929]" size={20} />
                <span className="text-white">Looking for a loving home</span>
              </div>
            </div>
          </div>

          <PetDetails pet={selectedPet} />

          {selectedPet.candidates?.length > 0 && (
            <CandidatesList candidates={selectedPet.candidates} />
          )}
        </div>
      </div>
    </div>
  );
};

const PetDetails = ({ pet }) => (
  <div className="grid grid-cols-2 gap-4">
    {[
      { label: "Race", value: pet.race },
      { label: "Age", value: pet.age },
      { label: "Fee", value: `$${pet.fee}` },
      { label: "Status", value: <StatusBadge status={pet.status} /> },
    ].map(({ label, value }) => (
      <div
        key={label}
        className="p-4 rounded-lg bg-[#ffc929]/5 hover:bg-[#ffc929]/10 transition-all duration-300 transform hover:scale-105"
      >
        <p className="text-sm text-neutral-600">{label}</p>
        <div className="font-medium text-neutral-900">{value}</div>
      </div>
    ))}
  </div>
);

const CandidatesList = ({ candidates }) => (
  <div className="mt-6">
    <h3 className="mb-3 text-lg font-semibold text-neutral-900">
      Potential Families
    </h3>
    <div className="space-y-2">
      {candidates.map((candidate, index) => (
        <div
          key={index}
          className="p-4 rounded-lg bg-[#ffc929]/5 hover:bg-[#ffc929]/10 transition-all duration-300 transform hover:translate-x-1 hover:rotate-1 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">{candidate.name}</p>
              <p className="text-sm text-neutral-600">
                {candidate.status || "Under Review"}
              </p>
            </div>
            <Info
              size={20}
              className="text-neutral-400 transition-colors hover:text-[#ffc929]"
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default PetOwnerPosts;
