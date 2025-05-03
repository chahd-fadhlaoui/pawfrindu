import { Eye, EyeOff, Loader2, X, User, Mail, Lock } from "lucide-react";
import React, { memo, useState } from "react";
import axiosInstance from "../../../../utils/axiosInstance";

export const AddUserModal = memo(({ isOpen, onClose, onAddUser }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
    setFormSuccess(null);
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      setFormError("All fields are required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setFormError("Please enter a valid email address.");
      return false;
    }
    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: "Admin",
    };

    try {
      const response = await axiosInstance.post("/api/user/register", payload);
      if (response.status === 201) {
        const newUser = {
          _id: response.data.user._id,
          fullName: formData.fullName,
          email: formData.email,
          role: "Admin",
          isActive: true,
          isArchieve: false,
          lastLogin: null,
        };
        setFormSuccess("User added successfully!");
        setTimeout(() => {
          onAddUser(newUser);
          onClose();
          setFormData({ fullName: "", email: "", password: "" });
          setFormSuccess(null);
        }, 1500);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to add user");
    } finally {
      setFormLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white shadow-xl rounded-xl">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-5 border-l-4 sm:px-6"
          style={{ borderImage: "linear-gradient(to bottom, #f59e0b, #ec4899) 1" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center p-2 rounded-lg bg-[#FEF3C7]">
              <User className="w-5 h-5 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Add New Admin</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 rounded-full hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAddUser} className="p-6 space-y-5">
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                <User className="inline w-4 h-4 mr-2 text-gray-400" />
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929] transition-all duration-300"
                placeholder="Enter user's full name"
                required
                autoFocus
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                <Mail className="inline w-4 h-4 mr-2 text-gray-400" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929] transition-all duration-300"
                placeholder="email@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                <Lock className="inline w-4 h-4 mr-2 text-gray-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929] transition-all duration-300"
                  placeholder="Minimum 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 transition-all duration-300 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
            </div>

            {/* Role Information */}
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="mb-2 text-sm font-medium text-gray-700">Role:</p>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-yellow-500 to-pink-500 text-white shadow-md"
                >
                  Admin
                </span>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {formError && (
            <div className="flex items-start p-3 text-sm text-red-600 rounded-lg shadow-sm bg-gradient-to-r from-red-50 to-red-100">
              <X className="w-4 h-4 mr-2 mt-0.5 text-red-500 flex-shrink-0" />
              <p>{formError}</p>
            </div>
          )}
          {formSuccess && (
            <div className="flex items-start p-3 text-sm text-green-600 rounded-lg shadow-sm bg-gradient-to-r from-green-50 to-green-100">
              <Loader2 className="w-4 h-4 mr-2 mt-0.5 text-green-500 animate-spin flex-shrink-0" />
              <p>{formSuccess}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={formLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className={`px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-pink-500 rounded-lg shadow-md hover:from-yellow-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 flex items-center gap-2 ${
                formLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating User...
                </>
              ) : (
                <>Add Admin</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});