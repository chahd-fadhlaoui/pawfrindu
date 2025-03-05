import React, { useState, useEffect, memo } from "react";
import {
  PawPrint,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  ChevronsRight,
  ChevronsLeft,
  Plus,
  EyeOff,
  Eye,
} from "lucide-react";
import SearchBar from "../SearchBar";
import axiosInstance from "../../utils/axiosInstance";

// Modal séparé pour éviter les re-rendus excessifs
const AddUserModal = memo(({ isOpen, onClose, onAddUser }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formRoleOptions = [
    { value: "admin", label: "Admin" },
    { value: "adminAdoption", label: "Admin Adoption" },
    { value: "adminVet", label: "Admin Vet" },
    { value: "adminTrainer", label: "Admin Trainer" },
    { value: "adminLostAndFound", label: "Admin Lost & Found" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
    setFormSuccess(null);
  };

  const validateForm = () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
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

    const apiRole = "Admin"; // Toujours "Admin" pour l'API

    try {
      const response = await axiosInstance.post("/api/user/register", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: apiRole,
      });

      if (response.status === 201) {
        const newUser = {
          _id: response.data.user._id,
          fullName: formData.fullName,
          email: formData.email,
          role:
            formRoleOptions.find((option) => option.value === formData.role)
              ?.label || "Admin", // Utiliser le label du rôle sélectionné
        };
        setFormSuccess("User added successfully!");
        setTimeout(() => {
          onAddUser(newUser);
          onClose();
          setFormData({ fullName: "", email: "", password: "", role: "" });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
      <div className="relative w-full max-w-md p-6 bg-white border border-gray-200 shadow-2xl rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Add New User</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929] transition-all duration-200"
              placeholder="Enter full name"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929] transition-all duration-200"
              placeholder="Enter email"
              required
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929] transition-all duration-200"
              placeholder="Enter password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929] transition-all duration-200"
              required
            >
              <option value="">Select Role</option>
              {formRoleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {formError}
            </p>
          )}
          {formSuccess && (
            <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
              {formSuccess}
            </p>
          )}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
              disabled={formLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className={`px-4 py-2 text-white bg-[#ffc929] rounded-lg hover:bg-[#e6b625] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 flex items-center gap-2 ${
                formLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

const UsersTable = ({ users = [], loading, error, onUserAdded }) => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const usersPerPage = 5;

  // Filter Select Component
  const FilterSelect = ({ label, value, onChange, options }) => (
    <div className="relative w-full sm:w-48">
      <select
        className={`w-full px-4 py-2 text-sm rounded-lg bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929] transition-all duration-200 ${
          value ? "text-[#ffc929] font-semibold" : "text-gray-600"
        }`}
        value={value}
        onChange={onChange}
        aria-label={`Filter by ${label}`}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  // Role options pour le filtre
  const roleOptions = [
    { value: "Admin", label: "Admin" },
    { value: "PetOwner", label: "Pet Owner" },
    { value: "Vet", label: "Veterinarian" },
    { value: "Trainer", label: "Trainer" },
  ];

  // Apply filters and search
  useEffect(() => {
    let filtered = Array.isArray(users) ? [...users] : [];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (user) =>
          (user.fullName || "").toLowerCase().includes(query) ||
          (user.email || "").toLowerCase().includes(query)
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(
        (user) => (user.role || "").toLowerCase() === roleFilter.toLowerCase()
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchQuery, roleFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setCurrentPage(1);
  };

  const handleUserAdded = (newUser) => {
    setFilteredUsers((prev) => [...prev, newUser]);
    if (onUserAdded) onUserAdded(newUser);
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center bg-white border border-gray-200 shadow-lg rounded-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#ffc929] animate-spin" />
            <PawPrint className="w-8 h-8 text-[#ffc929] animate-pulse" />
          </div>
          <p className="text-lg font-semibold text-gray-700">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 text-center bg-white border border-gray-200 shadow-lg rounded-2xl">
        <div className="flex flex-col items-center gap-4 text-red-600">
          <X size={48} />
          <p className="text-lg font-semibold">Error: {error}</p>
          <p className="text-sm">Please try refreshing or contact support.</p>
        </div>
      </div>
    );
  }

  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <div className="p-6 space-y-6 shadow-lg bg-gray-50 rounded-2xl">
      {/* Search and Filter Bar */}
      <div className="flex flex-col items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full sm:w-64 bg-white border-gray-300 focus:ring-[#ffc929] focus:border-[#ffc929] rounded-lg shadow-sm transition-all duration-200"
        />
        <div className="flex items-center gap-4">
          <FilterSelect
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={roleOptions}
          />
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#ffc929] rounded-lg hover:bg-[#e6b625] hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
        {(searchQuery || roleFilter) && (
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm font-semibold text-[#ffc929] bg-[#ffc929]/10 rounded-lg hover:bg-[#ffc929]/20 hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table Content */}
      {filteredUsers.length === 0 && safeUsers.length > 0 ? (
        <div className="w-full p-8 text-center bg-white border border-gray-200 shadow-lg rounded-2xl">
          <div className="flex flex-col items-center gap-4">
            <PawPrint size={48} className="text-[#ffc929]" />
            <p className="text-lg font-semibold text-gray-700">
              No users match your filters
            </p>
            <p className="text-sm text-gray-600">
              Adjust your search or filters to find users.
            </p>
          </div>
        </div>
      ) : safeUsers.length === 0 ? (
        <div className="w-full p-8 text-center bg-white border border-gray-200 shadow-lg rounded-2xl">
          <div className="flex flex-col items-center gap-4">
            <PawPrint size={48} className="text-[#ffc929]" />
            <p className="text-lg font-semibold text-gray-700">
              No users found
            </p>
            <p className="text-sm text-gray-600">
              Add a user to populate the table.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <PawPrint className="w-6 h-6 text-[#ffc929]" />
              <h2 className="text-xl font-bold text-gray-900">Users Table</h2>
            </div>
            <span className="text-sm text-gray-500">
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1 ? "user" : "users"}
            </span>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 z-10 text-xs text-gray-700 uppercase bg-gray-100 shadow-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">Full Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr
                  key={user._id}
                  className="transition-all duration-200 cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {user.fullName || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {user.email || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full shadow-sm transition-colors duration-200 ${
                        user.role === "Admin"
                          ? "bg-teal-100 text-teal-700 hover:bg-teal-200"
                          : user.role === "Admin Adoption"
                          ? "bg-teal-100 text-teal-700 hover:bg-teal-200"
                          : user.role === "Admin Vet"
                          ? "bg-teal-100 text-teal-700 hover:bg-teal-200"
                          : user.role === "Admin Trainer"
                          ? "bg-teal-100 text-teal-700 hover:bg-teal-200"
                          : user.role === "Admin Lost & Found"
                          ? "bg-teal-100 text-teal-700 hover:bg-teal-200"
                          : user.role === "PetOwner"
                          ? "bg-[#ffc929]/20 text-[#ffc929] hover:bg-[#ffc929]/30"
                          : user.role === "Vet"
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          : user.role === "Trainer"
                          ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {user.role || "N/A"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstUser + 1}-
                {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                {filteredUsers.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#ffc929] hover:bg-[#ffc929]/10 hover:text-[#ffa726]"
                  }`}
                  aria-label="First page"
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#ffc929] hover:bg-[#ffc929]/10 hover:text-[#ffa726]"
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                          currentPage === page
                            ? "bg-[#ffc929] text-white shadow-md"
                            : "text-gray-600 hover:bg-[#ffc929]/10 hover:scale-105"
                        }`}
                        aria-label={`Page ${page}`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#ffc929] hover:bg-[#ffc929]/10 hover:text-[#ffa726]"
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#ffc929] hover:bg-[#ffc929]/10 hover:text-[#ffa726]"
                  }`}
                  aria-label="Last page"
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onAddUser={handleUserAdded}
      />
    </div>
  );
};

export default UsersTable;
