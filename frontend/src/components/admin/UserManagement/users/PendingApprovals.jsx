import React, { useEffect, useState } from "react";
import { Loader2, PawPrint, X, Check, Search, Users } from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance";
import { PaginationControls } from "../../common/PaginationControls";
import { FilterSelect } from "../common/FilterSelect";
import UserTable from "../common/UserTable";
import { ErrorAlert } from "../../common/ErrorAlert";
import ConfirmationModal from "../../../ConfirmationModal";
import { useApp } from "../../../../context/AppContext";
import EmptyState from "../common/EmptyState";

const PendingApprovals = ({ showHeader = true }) => {
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
  const usersPerPage = 10;

  const roleOptions = [
    { value: "", label: "All Pending Roles" },
    { value: "Vet", label: "Veterinarian" },
    { value: "Trainer", label: "Trainer" },
  ];

  useEffect(() => {
    let filtered = users.filter(
      (user) =>
        (user.role === "Vet" || user.role === "Trainer") &&
        !user.isActive &&
        !user.isArchieve &&
        (user.lastLogin === null || user.lastLogin === undefined)
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

  const handleAcceptUser = (userId) => {
    setSelectedUserId(userId);
    setConfirmAction("accept");
    setIsConfirmModalOpen(true);
  };

  const confirmAcceptUser = async () => {
    try {
      await axiosInstance.put(`/api/user/users/${selectedUserId}`, { isActive: true });
      updateUsers([{ _id: selectedUserId, isActive: true }]);
      setFilteredUsers((prev) => prev.filter((user) => user._id !== selectedUserId));
      setSelectedUsers((prev) => prev.filter((id) => id !== selectedUserId));
      setIsConfirmModalOpen(false);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to accept user");
      console.error("Accept Error:", err);
      setIsConfirmModalOpen(false);
    }
  };

  const handleRejectUser = (userId) => {
    setSelectedUserId(userId);
    setConfirmAction("reject");
    setIsConfirmModalOpen(true);
  };

  const confirmRejectUser = async () => {
    try {
      await axiosInstance.put(`/api/user/users/${selectedUserId}`, { isArchieve: true });
      updateUsers([{ _id: selectedUserId, isArchieve: true }]);
      setFilteredUsers((prev) => prev.filter((user) => user._id !== selectedUserId));
      setSelectedUsers((prev) => prev.filter((id) => id !== selectedUserId));
      setIsConfirmModalOpen(false);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to reject user");
      console.error("Reject Error:", err);
      setIsConfirmModalOpen(false);
    }
  };

  const handleBulkAccept = () => {
    if (selectedUsers.length === 0) return;
    setConfirmAction("bulkAccept");
    setIsConfirmModalOpen(true);
  };

  const confirmBulkAccept = async () => {
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
      setActionError(err.response?.data?.message || "Failed to bulk accept users");
      console.error("Bulk Accept Error:", err);
      setIsConfirmModalOpen(false);
    }
  };

  const handleBulkReject = () => {
    if (selectedUsers.length === 0) return;
    setConfirmAction("bulkReject");
    setIsConfirmModalOpen(true);
  };

  const confirmBulkReject = async () => {
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
      setActionError(err.response?.data?.message || "Failed to bulk reject users");
      console.error("Bulk Reject Error:", err);
      setIsConfirmModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#ffc929] animate-spin" />
          <PawPrint className="w-8 h-8 text-[#ffc929] animate-pulse" />
          <p className="text-lg font-semibold text-gray-700">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl">
        <ErrorAlert
          message={error}
          title="Error Loading Pending Approvals"
          onDismiss={() => {}}
        />
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
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Pending Approvals</h2>
                <p className="text-sm text-gray-500">Review trainers and vets awaiting approval</p>
              </div>
            </div>
            <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
              {filteredUsers.length} Pending
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
              placeholder="Search pending trainers and vets by name or email..."
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
                  onClick={handleBulkAccept}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <Check className="w-4 h-4" />
                  Accept ({selectedUsers.length})
                </button>
                <button
                  onClick={handleBulkReject}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <X className="w-4 h-4" />
                  Reject ({selectedUsers.length})
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
              : "No trainers or vets are awaiting approval."
          }
        />
      ) : (
        <>
          <div className="bg-white shadow-xl rounded-xl animate-fadeIn">
            <div className="p-4 sm:p-6">
              <UserTable
                users={currentUsers}
                selectedUsers={selectedUsers}
                currentUser={currentUser}
                onToggleActive={handleAcceptUser}
                onToggleSelection={toggleUserSelection}
                onToggleSelectAll={toggleSelectAll}
                customActions={(user) => (
                  <div className="flex items-center justify-end gap-2">
                    {user._id !== currentUser?._id && (
                      <>
                        <button
                          onClick={() => handleAcceptUser(user._id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white transition-all duration-300 rounded-lg shadow-sm bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                        >
                          <Check className="w-3 h-3" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectUser(user._id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white transition-all duration-300 rounded-lg shadow-sm bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                          <X className="w-3 h-3" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                )}
                title="Pending Approvals"
                showHeader={false} // Header handled above
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={
          confirmAction === "accept"
            ? confirmAcceptUser
            : confirmAction === "reject"
            ? confirmRejectUser
            : confirmAction === "bulkAccept"
            ? confirmBulkAccept
            : confirmBulkReject
        }
        action={
          confirmAction === "accept" || confirmAction === "bulkAccept"
            ? "accept"
            : "reject"
        }
        itemName={
          confirmAction === "bulkAccept" || confirmAction === "bulkReject"
            ? `${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}`
            : filteredUsers.find((u) => u._id === selectedUserId)?.fullName || "this user"
        }
      />
    </div>
  );
};

export default PendingApprovals;