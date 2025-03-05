import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { X, Loader2 } from "lucide-react";

const AddPetForm = ({ onClose, onPetAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    city: "",
    gender: "",
    species: "",
    fee: "",
    isTrained: false,
    description: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/api/pet/addPet", formData);
      if (response.data.success) {
        onPetAdded();
        onClose();
      } else {
        setError(response.data.message || "Failed to add pet");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error adding pet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
        <button onClick={onClose} className="absolute text-gray-500 top-4 right-4 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        <h3 className="mb-4 text-xl font-bold">Add New Pet</h3>
        {error && <div className="p-2 mb-4 text-red-700 rounded bg-red-50">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Breed"
            value={formData.breed}
            onChange={(e) => handleChange("breed", e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Age"
            value={formData.age}
            onChange={(e) => handleChange("age", e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="w-full p-2 border rounded"
          />
          <select
            value={formData.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select
            value={formData.species}
            onChange={(e) => handleChange("species", e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Species</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="other">Other</option>
          </select>
          <input
            type="number"
            placeholder="Fee (DT)"
            value={formData.fee}
            onChange={(e) => handleChange("fee", e.target.value)}
            className="w-full p-2 border rounded"
            min="0"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isTrained}
              onChange={(e) => handleChange("isTrained", e.target.checked)}
            />
            Trained
          </label>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Image URL"
            value={formData.image}
            onChange={(e) => handleChange("image", e.target.value)}
            className="w-full p-2 border rounded"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#ffc929] text-white rounded hover:bg-[#e6b625] flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Pet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPetForm;