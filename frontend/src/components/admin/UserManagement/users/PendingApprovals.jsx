import React, { useEffect, useState, useMemo } from "react";
import { Loader2, PawPrint, X, Check, Search, Users } from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance";
import { PaginationControls } from "../../common/PaginationControls";
import { FilterSelect } from "../common/FilterSelect";
import UserTable from "../common/UserTable";
import { ErrorAlert } from "../../common/ErrorAlert";
import ConfirmationModal from "../../../ConfirmationModal";
import { useApp } from "../../../../context/AppContext";
import EmptyState from "../common/EmptyState";

const PendingApprovals = () => {
  const { allUsers: users, loading, error, user: currentUser, updateUsers, socket } = useApp();
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
    if (socket) {
      socket.onAny((event, ...args) => {
        console.log('Socket.IO event received:', { event, args });
      });
      socket.on('userDeletedByAdmin', ({ userId }) => {
        console.log('Socket.IO: User deleted by admin:', { userId });
        setFilteredUsers((prev) => {
          const updated = prev.filter((user) => user._id.toString() !== userId.toString());
          console.log('Updated filteredUsers after deletion:', updated);
          return updated;
        });
        setSelectedUsers((prev) => {
          const updated = prev.filter((id) => id.toString() !== userId.toString());
          console.log('Updated selectedUsers after deletion:', updated);
          return updated;
        });
        updateUsers([{ _id: userId.toString(), _deleted: true }]);
      });
      socket.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err);
      });
      socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
      });
      return () => {
        socket.offAny();
        socket.off('userDeletedByAdmin');
        socket.off('connect_error');
        socket.off('disconnect');
      };
    }
  }, [socket, updateUsers]);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        (user.role === "Vet" || user.role === "Trainer") &&
        !user.isActive &&
        !user.isArchieve &&
        (user.lastLogin === null || user.lastLogin === undefined)
    ).map(user => ({ ...user, _id: user._id.toString() })); // Normalize _id to string

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
    console.log('Filtered users updated:', filtered);
  }, [users, searchQuery, roleFilter]);

  useEffect(() => {
    console.log("Pending Approvals - Vet and Trainer data:", filteredUsers);
  }, [filteredUsers]);

  const currentUsers = useMemo(() => {
    return filteredUsers.slice(
      (currentPage - 1) * usersPerPage,
      currentPage * usersPerPage
    );
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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
      await axiosInstance.put(`/api/user/users/${selectedUserId}/approve`, { isActive: true });
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
      console.log('Sending DELETE request for user:', selectedUserId);
      await axiosInstance.delete(`/api/user/users/${selectedUserId}`);
      console.log('DELETE request successful for user:', selectedUserId);
      setIsConfirmModalOpen(false);
    } catch (err) {
      const message = err.response?.status === 404
        ? "User not found. It may have been deleted already."
        : err.response?.data?.message || "Failed to delete user";
      setActionError(message);
      console.error("Reject (Delete) Error:", err);
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
          axiosInstance.put(`/api/user/users/${userId}/approve`, { isActive: true })
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
      console.log('Sending bulk DELETE requests for users:', selectedUsers);
      await Promise.all(
        selectedUsers.map((userId) =>  
          axiosInstance.delete(`/api/user/users/${userId}`)
        )
      );
      console.log('Bulk DELETE requests successful for users:', selectedUsers);
      setIsConfirmModalOpen(false);
    } catch (err) {
      const message = err.response?.status === 404
        ? "One or more users not found. They may have been deleted already."
        : err.response?.data?.message || "Failed to bulk delete users";
      setActionError(message);
      console.error("Bulk Reject (Delete) Error:", err);
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

      {actionError && (
        <div className="animate-fadeIn">
          <ErrorAlert message={actionError} onDismiss={() => setActionError("")} />
        </div>
      )}

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
            key={filteredUsers.length} // Force re-render on length change
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