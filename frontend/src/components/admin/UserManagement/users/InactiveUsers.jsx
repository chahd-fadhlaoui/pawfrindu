import React, { useEffect, useState } from "react";
import { Loader2, PawPrint, X, Check, Archive, Search, Users } from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance";
import { PaginationControls } from "../../common/PaginationControls";
import { FilterSelect } from "../common/FilterSelect";
import UserTable from "../common/UserTable";
import { ErrorAlert } from "../../common/ErrorAlert";
import ConfirmationModal from "../../../ConfirmationModal";
import { useApp } from "../../../../context/AppContext";
import EmptyState from "../common/EmptyState";

const InactiveUsers = () => {
  const { allUsers: users, loading, error, user: currentUser, updateUsers } = useApp();
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [actionError, setActionError] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const usersPerPage = 5;

  const roleOptions = [
    { value: "", label: "All Roles" },
    { value: "Admin", label: "Admin" },
    { value: "PetOwner", label: "Pet Owner" },
    { value: "Vet", label: "Veterinarian" },
    { value: "Trainer", label: "Trainer" },
  ];

  useEffect(() => {
    let filtered = users.filter(
      (user) =>
        !user.isActive &&
        !user.isArchieve &&
        (user.lastLogin !== null || user.lastLogin !== undefined)
    );

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
    setSelectedUsers([]);
  }, [users, searchQuery, roleFilter]);

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
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    const selectableUsers = currentUsers.map((user) => user._id);
    setSelectedUsers((prev) =>
      prev.length === selectableUsers.length ? [] : selectableUsers
    );
  };

  const handleToggleActive = (userId) => {
    setSelectedUserId(userId);
    setConfirmAction("reactivate");
    setIsConfirmModalOpen(true);
  };

  const confirmToggleActive = async () => {
    try {
      await axiosInstance.put(`/api/user/users/${selectedUserId}`, { isActive: true });
      updateUsers([{ _id: selectedUserId, isActive: true }]);
      setFilteredUsers((prev) => prev.filter((user) => user._id !== selectedUserId));
      setSelectedUsers((prev) => prev.filter((id) => id !== selectedUserId));
      setIsConfirmModalOpen(false);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to reactivate user");
      console.error("Reactivate Error:", err);
      setIsConfirmModalOpen(false);
    }
  };

  const handleBulkActivate = () => {
    if (selectedUsers.length === 0) return;
    setConfirmAction("bulkReactivate");
    setIsConfirmModalOpen(true);
  };

  const confirmBulkActivate = async () => {
    try {
      await Promise.all(
        selectedUsers.map((userId) =>
          axiosInstance.put(`/api/user/users/${userId}`, { isActive: true })
        )
      );
      updateUsers(selectedUsers.map((userId) => ({ _id: userId, isActive: true })));
      setFilteredUsers((prev) => prev.filter((user) => !selectedUsers.includes(user._id)));
      setSelectedUsers([]);
      setIsConfirmModalOpen(false);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to bulk reactivate users");
      console.error("Bulk Reactivate Error:", err);
      setIsConfirmModalOpen(false);
    }
  };

  const handleToggleArchive = (userId) => {
    setSelectedUserId(userId);
    setConfirmAction("archive");
    setIsConfirmModalOpen(true);
  };

  const confirmToggleArchive = async () => {
    try {
      await axiosInstance.put(`/api/user/users/${selectedUserId}`, { isArchieve: true });
      updateUsers([{ _id: selectedUserId, isArchieve: true }]);
      setFilteredUsers((prev) => prev.filter((user) => user._id !== selectedUserId));
      setSelectedUsers((prev) => prev.filter((id) => id !== selectedUserId));
      setIsConfirmModalOpen(false);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to archive user");
      console.error("Archive Error:", err);
      setIsConfirmModalOpen(false);
    }
  };

  const handleBulkArchive = () => {
    if (selectedUsers.length === 0) return;
    setConfirmAction("bulkArchive");
    setIsConfirmModalOpen(true);
  };

  const confirmBulkArchive = async () => {
    try {
      await Promise.all(
        selectedUsers.map((userId) =>
          axiosInstance.put(`/api/user/users/${userId}`, { isArchieve: true })
        )
      );
      updateUsers(selectedUsers.map((userId) => ({ _id: userId, isArchieve: true })));
      setFilteredUsers((prev) => prev.filter((user) => !selectedUsers.includes(user._id)));
      setSelectedUsers([]);
      setIsConfirmModalOpen(false);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to bulk archive users");
      console.error("Bulk Archive Error:", err);
      setIsConfirmModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#ffc929] animate-spin" />
          <PawPrint className="w-8 h-8 text-[#ffc929] animate-pulse" />
          <p className="text-lg font-semibold text-gray-700">Loading inactive users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl">
        <ErrorAlert
          message={error}
          title="Error Loading Inactive Users"
          onDismiss={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Filters and Actions */}
      <div className="p-4 bg-white shadow-md rounded-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inactive users by name or email..."
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
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkActivate}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <Check className="w-4 h-4" />
                  Reactivate ({selectedUsers.length})
                </button>
                <button
                  onClick={handleBulkArchive}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <Archive className="w-4 h-4" />
                  Archive ({selectedUsers.length})
                </button>
              </div>
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
        <EmptyState
          hasFilters={searchQuery || roleFilter}
          onClearFilters={resetFilters}
          customMessage={
            searchQuery || roleFilter
              ? "Try adjusting your search or filters"
              : "No inactive users found. Check other tabs."
          }
        />
      ) : (
        <>
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
                      <>
                        <button
                          onClick={() => handleToggleActive(user._id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white transition-all duration-300 rounded-lg shadow-sm bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                        >
                          <Check className="w-3 h-3" />
                          Reactivate
                        </button>
                        <button
                          onClick={() => handleToggleArchive(user._id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white transition-all duration-300 rounded-lg shadow-sm bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                          <Archive className="w-3 h-3" />
                          Archive
                        </button>
                      </>
                    )}
                  </div>
                )}
                title="Inactive Users"
              />
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={
          confirmAction === "reactivate"
            ? confirmToggleActive
            : confirmAction === "archive"
            ? confirmToggleArchive
            : confirmAction === "bulkReactivate"
            ? confirmBulkActivate
            : confirmBulkArchive
        }
        action={
          confirmAction === "reactivate"
            ? "reactivate"
            : confirmAction === "archive"
            ? "archive"
            : confirmAction === "bulkReactivate"
            ? "reactivate"
            : "archive"
        }
        itemName={
          confirmAction === "bulkReactivate" || confirmAction === "bulkArchive"
            ? `${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}`
            : filteredUsers.find((u) => u._id === selectedUserId)?.fullName || "this user"
        }
      />
    </div>
  );
};

export default InactiveUsers;