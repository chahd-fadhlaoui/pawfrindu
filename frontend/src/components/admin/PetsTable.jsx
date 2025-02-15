import { Check, X } from "lucide-react";

const PetsTable = ({ pets, onAccept, onReject }) => (
  <div className="bg-white rounded-xl shadow-sm border-2 border-amber-100  overflow-x-hidden">
    <table className="w-full">
      <thead className="bg-amber-50">
        <tr>
          {[
            "Photo",
            "Nom",
            "Race",
            "Âge",
            "Ville",
            "Genre",
            "Catégorie",
            "Tarif",
            "Dressé",
            ,
            "Status",
            "Actions",
          ].map((header) => (
            <th
              key={header}
              className="px-4 py-4 text-left text-sm font-semibold text-amber-700"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-amber-100">
        {pets.map((pet) => (
          <tr key={pet._id} className="hover:bg-amber-50/30 transition-colors">
            <td className="px-4 py-3">
              <img
                src={pet.image}
                alt={pet.name}
                className="w-12 h-12 rounded-full border-2 border-amber-200"
              />
            </td>
            <td className="px-4 py-3 font-medium text-teal-600">{pet.name}</td>
            <td className="px-4 py-3">{pet.race}</td>
            <td className="px-4 py-3">{pet.age} ans</td>
            <td className="px-4 py-3">{pet.city}</td>
            <td className="px-4 py-3">{pet.gender}</td>
            <td className="px-4 py-3">{pet.category}</td>
            <td className="px-4 py-3 font-medium">{pet.fee}dt</td>
            <td className="px-4 py-3">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  pet.isTrained
                    ? "bg-pink-200 text-pink-700"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {pet.isTrained ? "Oui" : "Non"}
              </span>
            </td>
            <td className="px-4 py-3 text-center">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold shadow-md tracking-wide
    ${
      pet.status === "accepted"
        ? "bg-green-100 text-green-700 border border-green-400"
        : pet.status === "rejected"
        ? "bg-red-100 text-red-700 border border-red-400"
        : "bg-gray-100 text-gray-700 border border-gray-400"
    }
  `}
              >
                {pet.status === "accepted"
                  ? "✔ Accepté"
                  : pet.status === "rejected"
                  ? "✖ Rejeté"
                  : "⏳ En attente"}
              </span>
            </td>

            <td className="px-4 py-3">
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => onAccept(pet._id)}
                  className="p-1 text-green-500 hover:text-teal-600"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={() => onReject(pet._id)}
                  className="p-1 text-red-500 "
                >
                  <X size={20} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
export default PetsTable;
