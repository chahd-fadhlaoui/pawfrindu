import React, { useState, useEffect, useMemo } from "react";
import { Loader2, PawPrint, X, Plus, Search } from "lucide-react";
import { PaginationControls } from "../../common/PaginationControls";
import { FilterSelect } from "../common/FilterSelect";
import { AddUserModal } from "./AddUserModal";
import UserTable from "../common/UserTable";
import { ErrorAlert } from "../../common/ErrorAlert";
import ConfirmationModal from "../../../ConfirmationModal";
import { useApp } from "../../../../context/AppContext";
import axiosInstance from "../../../../utils/axiosInstance";

const ActiveUsers = ({ refreshTrigger, showHeader = true }) => {
  const { allUsers: users, loading, error, user: currentUser, updateUsers, triggerRefresh } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [actionError, setActionError] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const usersPerPage = 10;

  const roleOptions = [
    { value: "", label: "All Roles" },
    { value: "Admin", label: "Admin" },
    { value: "PetOwner", label: "Pet Owner" },
    { value: "Vet", label: "Veterinarian" },
    { value: "Trainer", label: "Trainer" },
  ];

  const filteredUsers = useMemo(() => {
    let filtered = users.filter((user) => user.isActive && !user.isArchieve);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (user) =>
          (user.fullName || "").toLowerCase().includes(query) ||
          (user.email || "").toLowerCase().includes(query)
      );
    }

    if (roleFilter) {
      filtered = filtered.filter((user) => user.role.toLowerCase() === roleFilter.toLowerCase());
    }

    return filtered;
  }, [users, searchQuery, roleFilter]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedUsers([]);
  }, [searchQuery, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedUsers([]);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setCurrentPage(1);
    setSelectedUsers([]);
  };

  const toggleUserSelection = (userId) => {
    if (userId === currentUser?._id) return;
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    const selectableUsers = currentUsers
      .filter((user) => user._id !== currentUser?._id)
      .map((user) => user._id);
    setSelectedUsers((prev) =>
      prev.length === selectableUsers.length ? [] : selectableUsers
    );
  };

  const handleToggleActive = (userId) => {
    if (userId === currentUser?._id) {
      setActionError("You cannot deactivate your own account.");
      return;
    }
    setSelectedUserId(userId);
    setConfirmAction("deactivate");
    setIsConfirmModalOpen(true);
  };

  const confirmToggleActive = async () => {
    try {
      await axiosInstance.put(`/api/user/users/${selectedUserId}`, { isActive: false });
      updateUsers([{ _id: selectedUserId, isActive: false }]);
      setSelectedUsers((prev) => prev.filter((id) => id !== selectedUserId));
      setIsConfirmModalOpen(false);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to deactivate user");
      setIsConfirmModalOpen(false);
    }
  };

  const handleBulkDeactivate = () => {
    if (selectedUsers.length === 0) return;
    if (selectedUsers.includes(currentUser?._id)) {
      setActionError("You cannot deactivate your own account in a bulk action.");
      return;
    }
    setConfirmAction("bulkDeactivate");
    setIsConfirmModalOpen(true);
  };

  const confirmBulkDeactivate = async () => {
    try {
      await Promise.all(
        selectedUsers.map((userId) =>
          axiosInstance.put(`/api/user/users/${userId}`, { isActive: false })
        )
      );
      updateUsers(selectedUsers.map((userId) => ({ _id: userId, isActive: false })));
      setSelectedUsers([]);
      setIsConfirmModalOpen(false);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to bulk deactivate users");
      setIsConfirmModalOpen(false);
    }
  };

  const handleUserAdded = (newUser) => {
    updateUsers([newUser]);
    setIsAddUserModalOpen(false);
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#ffc929] animate-spin" />
          <PawPrint className="w-8 h-8 text-[#ffc929] animate-pulse" />
          <p className="text-lg font-semibold text-gray-700">Loading active users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl">
        <ErrorAlert message={error} title="Error Loading Users" onDismiss={() => {}} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="overflow-hidden bg-white shadow-lg rounded-xl animate-fadeIn">
          <div
            className="flex items-center px-4 py-5 border-l-4 sm:px-6"
            style={{ borderImage: "linear-gradient(to bottom, #f59e0b, #ec4899) 1" }}
          >
            <div className="flex items-center flex-1">
              <div className="p-2 rounded-lg bg-[#FEF3C7]">
                <Users className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Active Users</h2>
                <p className="text-sm text-gray-500">Manage active users on the platform</p>
              </div>
            </div>
            <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
              {filteredUsers.length} Active
            </span>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="p-4 bg-white shadow-md rounded-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active users by name or email..."
              className="w-full py-3 pl-10 pr-4 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-[#ffc929] focus:border-[#ffc929] transition-all duration-300"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              label="Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={roleOptions}
              className="bg-white border-gray-200 shadow-sm focus:ring-[#ffc929] focus:border-[#ffc929]"
            />
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <Plus className="w-4 h-4" />
              Add Admin
            </button>
            {selectedUsers.length > 0 && (
              <button
                onClick={handleBulkDeactivate}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <X className="w-4 h-4" />
                Deactivate ({selectedUsers.length})
              </button>
            )}
            {(searchQuery || roleFilter) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {actionError && (
        <div className="animate-fadeIn">
          <ErrorAlert message={actionError} onDismiss={() => setActionError("")} />
        </div>
      )}

      {/* Users Table or Empty State */}
      {filteredUsers.length === 0 ? (
        <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl animate-fadeIn">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-yellow-100 to-pink-100">
              <PawPrint size={32} className="text-[#ffc929]" />
            </div>
            <p className="text-lg font-semibold text-gray-700">No active users found</p>
            <p className="text-sm text-gray-500">
              {searchQuery || roleFilter ? "Try adjusting your search or filters" : "Add an admin to get started"}
            </p>
            {(searchQuery || roleFilter) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-xl rounded-xl animate-fadeIn">
            <div className="p-4 sm:p-6">
              <UserTable
                users={currentUsers}
                selectedUsers={selectedUsers}
                currentUser={currentUser}
                onToggleActive={handleToggleActive}
                onToggleSelection={toggleUserSelection}
                onToggleSelectAll={toggleSelectAll}
                customActions={(user) => (
                  <div className="flex items-center justify-end gap-2">
                    {user._id !== currentUser?._id && (
                      <button
                        onClick={() => handleToggleActive(user._id)}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white rounded-lg shadow-sm transition-all duration-300 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:ring-2 focus:ring-red-400"
                      >
                        <X className="w-3 h-3" />
                        Deactivate
                      </button>
                    )}
                  </div>
                )}
                title="Active Users"
                showHeader={false}
              />
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={usersPerPage}
              />
            </div>
          )}
        </>
      )}

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onAddUser={handleUserAdded}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmAction === "deactivate" ? confirmToggleActive : confirmBulkDeactivate}
        action="deactivate"
        itemName={
          confirmAction === "deactivate"
            ? filteredUsers.find((u) => u._id === selectedUserId)?.fullName || "this user"
            : `${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}`
        }
      />
    </div>
  );
};

export default ActiveUsers;