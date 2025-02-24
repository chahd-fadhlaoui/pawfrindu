// components/EditForm.jsx
import React from 'react';
import ImageUpload from '../components/ImageUpload';

const EditForm = ({ formData, onChange, onSubmit, onCancel, loading }) => {
  return (
    <form onSubmit={onSubmit} className="relative flex flex-col h-[calc(100vh-200px)] max-h-[600px]">
      <div className="flex-1 px-6 space-y-6 overflow-y-auto">
        {/* Image Upload Section */}
        <ImageUpload
          currentImage={formData.image}
          onImageSelected={(url) => onChange("image", url)}
          loading={loading}
          className="h-52"
        />

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Pet Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => onChange("name", e.target.value)}
                className="w-full px-3 py-2 text-sm transition-colors border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ffc929] hover:bg-gray-100"
                placeholder="Enter pet name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Breed</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => onChange("breed", e.target.value)}
                className="w-full px-3 py-2 text-sm transition-colors border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ffc929] hover:bg-gray-100"
                placeholder="Enter breed"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Age</label>
              <select
                value={formData.age}
                onChange={(e) => onChange("age", e.target.value)}
                className="w-full px-3 py-2 text-sm transition-colors border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ffc929] hover:bg-gray-100"
                required
              >
                <option value="">Select age range</option>
                <option value="puppy">Puppy</option>
                <option value="kitten">Kitten</option>
                <option value="young">Young</option>
                <option value="adult">Adult</option>
                <option value="senior">Senior</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => onChange("city", e.target.value)}
                className="w-full px-3 py-2 text-sm transition-colors border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ffc929] hover:bg-gray-100"
                placeholder="Enter city"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => onChange("gender", e.target.value)}
                className="w-full px-3 py-2 text-sm transition-colors border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ffc929] hover:bg-gray-100"
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Species</label>
              <select
                value={formData.species} // Changed from category to species
                onChange={(e) => onChange("species", e.target.value)}
                className="w-full px-3 py-2 text-sm transition-colors border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ffc929] hover:bg-gray-100"
                required
              >
                <option value="">Select species</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Adoption Fee</label>
              <input
                type="number"
                value={formData.fee}
                onChange={(e) => onChange("fee", e.target.value)}
                className="w-full px-3 py-2 text-sm transition-colors border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ffc929] hover:bg-gray-100"
                placeholder="Enter fee"
                min="0"
                required
              />
            </div>
            <div className="space-y-1.5 flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="isTrained"
                checked={formData.isTrained}
                onChange={(e) => onChange("isTrained", e.target.checked)}
                className="w-4 h-4 border rounded text-[#ffc929] focus:ring-2 focus:ring-[#ffc929]"
              />
              <label htmlFor="isTrained" className="text-sm">Is Trained</label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => onChange("description", e.target.value)}
              className="w-full px-3 py-2 text-sm transition-colors border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#ffc929] hover:bg-gray-100"
              placeholder="Enter description"
              rows={3}
              required
            />
          </div>
        </div>
      </div>

      {/* Action Buttons with Approval Note */}
      <div className="sticky bottom-0 px-6 py-4 bg-white border-t">
        <p className="mb-2 text-xs text-gray-500">Note: Changes to significant fields will require admin approval.</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 border rounded-lg hover:bg-gray-100 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-lg bg-[#ffc929] hover:bg-[#e6b625] disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditForm;