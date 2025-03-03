import React, { useState, useEffect } from "react";
import {
  PawPrint,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";
import SearchBar from "../SearchBar";

const UsersTable = ({ users = [], loading, error }) => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Filter Select Component with improved styling
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

  // Role options matching AppContext roles
  const roleOptions = [
    { value: "Admin", label: "Admin" },
    { value: "PetOwner", label: "Pet Owner" },
    { value: "Vet", label: "Veterinarian" },
    { value: "Trainer", label: "Trainer" },
  ];

  // Apply filters and search with normalized role comparison
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
      <div className="flex flex-col items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row sm:items-center">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full sm:w-64 bg-white border-gray-300 focus:ring-[#ffc929] focus:border-[#ffc929] rounded-lg shadow-sm transition-all duration-200"
        />
        <FilterSelect
          label="Role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          options={roleOptions}
        />
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
    </div>
  );
};

export default UsersTable;
