import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axiosInstance from "../utils/axiosInstance";
import socket, { disconnectSocket, initializeSocket } from "../utils/socket";
import { useLocation } from "react-router-dom";

const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNMTYwIDE4MEgzOUM0MSAxNDAgODAgMTIwIDEwMCAxMjBDMTIwIDEyMCAxNTggMTQwIDE2MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==";

const ensureUserHasImage = (user) => {
  if (!user) return null;
  return { ...user, image: user.image || DEFAULT_PROFILE_IMAGE };
};

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pets, setPets] = useState([]);
  const [userPets, setUserPets] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const currencySymbol = "TND";

  // Custom timing utility
  const measureTime = async (label, fn) => {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      console.log(`${label}: ${(end - start).toFixed(2)} ms`);
      return result;
    } catch (error) {
      console.log(
        `${label} failed: ${(performance.now() - start).toFixed(2)} ms`
      );
      throw error;
    }
  };

  // Memoized core functions
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found in localStorage");
      setUser(null);
      return false;
    }
    return measureTime("checkAuth", async () => {
      const response = await axiosInstance.get("/api/user/me");
      const authenticatedUser = ensureUserHasImage({
        ...response.data.user,
        adminType: response.data.user.adminType,
      });
      setUser(authenticatedUser);
      console.log("checkAuth succeeded with user:", authenticatedUser);
      return true;
    }).catch((error) => {
      console.error("Auth check failed:", error.response?.status);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
        setError("Session expired. Please log in again.");
      } else {
        setError("An unexpected error occurred during authentication.");
      }
      return false;
    });
  }, []);

  const fetchPets = useCallback(async () => {
    return measureTime("fetchPets", async () => {
      console.log("Fetching fresh pets from /api/pet/allpets");
      const response = await axiosInstance.get("/api/pet/allpets");
      const petsData = response.data.data || [];
      setPets(petsData);
      return petsData;
    }).catch((error) => {
      console.error("Error fetching pets:", error);
      setError("Failed to fetch pets");
      return pets;
    });
  }, []);

 const fetchAllUsers = useCallback(async (retryCount = 0) => {
  const maxRetries = 2;
  return measureTime("fetchAllUsers", async () => {
    console.log("Fetching users from /api/user/getAllUsers with token:", localStorage.getItem("token")?.substring(0, 10) + "...");
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/user/getAllUsers");
      console.log("fetchAllUsers response:", {
        success: response.data.success,
        count: response.data.count,
        users: response.data.users?.map(u => ({ _id: u._id, role: u.role, isActive: u.isActive, isArchieve: u.isArchieve })) || []
      });
      if (!response.data.success || !response.data.users) {
        throw new Error("Invalid response from server");
      }
      const usersData = response.data.users || [];
      setAllUsers(usersData);
      setError(null);
      return usersData;
    } catch (error) {
      console.error("fetchAllUsers error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.response?.status === 401 && retryCount < maxRetries) {
        console.log(`Retrying fetchAllUsers, attempt ${retryCount + 1}`);
        localStorage.removeItem("token");
        return fetchAllUsers(retryCount + 1);
      }
      const errorMessage = error.response?.data?.message || `Failed to fetch users: ${error.message}`;
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  });
}, []);
useEffect(() => {
  console.log("allUsers state updated:", allUsers.map(u => ({ id: u._id, role: u.role, isActive: u.isActive, isArchieve: u.isArchieve })));
}, [allUsers]);

useEffect(() => {
  if (user?.role === "Admin" || user?.role === "SuperAdmin") {
    fetchAllUsers();
  }
}, [user, fetchAllUsers]);

  const getMyPets = useCallback(async () => {
    return measureTime("getMyPets", async () => {
      const response = await axiosInstance.get("/api/pet/mypets");
      const userPetsData = response.data.data || [];
      setUserPets(userPetsData);
      return { success: true, data: userPetsData };
    }).catch((error) => {
      console.error("Error fetching your pets:", error);
      setError("Failed to fetch your pets");
      return {
        success: false,
        error: "Error fetching your pets",
        data: userPets,
      };
    });
  }, []);

  const fetchUserProfile = useCallback(async () => {
    return measureTime("fetchUserProfile", async () => {
      const response = await axiosInstance.get("/api/user/me");
      const userData = response.data.user;
      const formattedUser = {
        _id: userData._id,
        fullName: userData.fullName,
        image: userData.image || DEFAULT_PROFILE_IMAGE,
        email: userData.email,
        role: userData.role,
        adminType: userData.adminType,
        about: userData.about || "",
        displayRole:
          userData.role === "PetOwner"
            ? "Pet Owner"
            : userData.role === "Vet"
            ? "Veterinarian"
            : userData.role === "Trainer"
            ? "Pet Trainer"
            : userData.role === "Admin" && userData.adminType
            ? userData.adminType
            : userData.role,
        petOwnerDetails: userData.petOwnerDetails || {
          address: "Not provided",
          phone: "Not provided",
        },
        trainerDetails: userData.trainerDetails || undefined,
        veterinarianDetails: userData.veterinarianDetails || undefined,
        createdAt: userData.createdAt,
      };
      setUser(formattedUser);
      return formattedUser;
    }).catch((error) => {
      console.error("Failed to fetch profile:", error);
      setError(error.response?.data?.message || "Failed to fetch user profile");
      throw error;
    });
  }, []);

  const getMyAdoptionRequests = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/pet/my-adoption-requests");
      const adoptionRequests = response.data.data || [];
      setApplications(adoptionRequests);
      console.log(
        "Fetched applications:",
        adoptionRequests.map((app) => ({
          petId: app.pet._id,
          userId: app.user,
          status: app.status,
        }))
      );
      return { success: true, data: adoptionRequests };
    } catch (error) {
      console.error(
        "Error fetching adoption requests:",
        error.response?.data || error.message
      );
      setError(
        error.response?.data?.message || "Failed to fetch adoption requests"
      );
      return {
        success: false,
        error: "Error fetching adoption requests",
        data: applications,
      };
    }
  }, []);

  const logout = useCallback(() => {
    axiosInstance.setAuthToken(null); // Clears the Authorization header
    localStorage.removeItem("token"); // Removes token from localStorage
    socket.auth = null; // Clear socket auth
    disconnectSocket(); // Disconnects Socket
    setUser(null); // Resets user state
    setUserPets([]);
    setAllUsers([]);
    setApplications([]);
    setError("");
  }, []);

 const triggerRefresh = useCallback(async () => {
  console.log("Triggering refresh for role:", user?.role);
  try {
    if (user?.role === "PetOwner") {
      const [petsResult, profile, userPets, applications] = await Promise.all([
        fetchPets(),
        fetchUserProfile(),
        getMyPets(),
        getMyAdoptionRequests(),
      ]);
      setPets(petsResult || []);
      setUser(petsResult ? profile : user);
      setUserPets(userPets.success ? userPets.data : []);
      setApplications(applications.success ? applications.data : []);
    }
    if (user?.role === "Admin" || user?.role === "SuperAdmin") {
      console.log("Calling fetchAllUsers for Admin/SuperAdmin");
      await fetchAllUsers();
    }
  } catch (error) {
    console.error("triggerRefresh error:", error);
    setError(error.response?.data?.message || "Error refreshing data");
  }
}, [user, fetchAllUsers]);

  // Connect socket only if not already connected
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !socket.connected) {
      initializeSocket(token);
    }
  }, []);

  // Socket.IO event listeners
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to Socket.IO server:", socket.id);
    });

    socket.on("petCreated", (data) => {
      console.log("Pet created event:", data);
      setPets((prev) => [...prev, data.pet]);
      if (user?._id === data.pet.owner) {
        setUserPets((prev) => [...prev, data.pet]);
      }
    });

    socket.on("petUpdated", (data) => {
      console.log("Pet updated event:", data);
      setPets((prev) =>
        prev.map((pet) =>
          pet._id === data.petId ? { ...pet, ...data.updatedPet } : pet
        )
      );
      setUserPets((prev) =>
        prev.map((pet) =>
          pet._id === data.petId ? { ...pet, ...data.updatedPet } : pet
        )
      );
    });

    socket.on("petDeleted", (data) => {
      console.log("Pet deleted event:", data);
      setPets((prev) => prev.filter((pet) => pet._id !== data.petId));
      setUserPets((prev) => prev.filter((pet) => pet._id !== data.petId));
    });

    socket.on("petArchived", (data) => {
      setPets((prev) =>
        prev.map((pet) =>
          pet._id === data.petId ? { ...pet, isArchived: true } : pet
        )
      );
      setUserPets((prev) =>
        prev.map((pet) =>
          pet._id === data.petId ? { ...pet, isArchived: true } : pet
        )
      );
    });
    socket.on("petUnarchived", (data) => {
      setPets((prev) =>
        prev.map((pet) =>
          pet._id === data.petId ? { ...pet, isArchived: false } : pet
        )
      );
      setUserPets((prev) =>
        prev.map((pet) =>
          pet._id === data.petId ? { ...pet, isArchived: false } : pet
        )
      );
    });

    socket.on("userRegistered", (data) => {
      console.log("User registered event:", data);
      if (user?.role === "Admin") {
        setAllUsers((prev) => [...prev, data]);
      }
    });

    socket.on("userProfileCompleted", (data) => {
      console.log("User profile completed event:", data);
      if (user?._id === data.userId) {
        setUser((prev) => ensureUserHasImage({ ...prev, ...data }));
      }
      if (user?.role === "Admin") {
        setAllUsers((prev) =>
          prev.map((u) => (u._id === data.userId ? { ...u, ...data } : u))
        );
      }
    });

    socket.on("userProfileUpdated", (data) => {
      console.log("User profile updated event:", data);
      if (user?._id === data.userId) {
        setUser((prev) => ensureUserHasImage({ ...prev, ...data }));
      }
      if (user?.role === "Admin") {
        setAllUsers((prev) =>
          prev.map((u) => (u._id === data.userId ? { ...u, ...data } : u))
        );
      }
    });

    socket.on("userUpdatedByAdmin", (data) => {
      console.log("User updated by admin event:", data);
      if (user?._id === data.userId) {
        setUser((prev) => ensureUserHasImage({ ...prev, ...data }));
      }
      if (user?.role === "Admin") {
        setAllUsers((prev) =>
          prev.map((u) => (u._id === data.userId ? { ...u, ...data } : u))
        );
      }
    });

    socket.on("userApproved", (data) => {
      console.log("User approved event:", data);
      if (user?._id === data.userId) {
        setUser((prev) => ({ ...prev, isActive: true }));
      }
      if (user?.role === "Admin") {
        setAllUsers((prev) =>
          prev.map((u) =>
            u._id === data.userId ? { ...u, isActive: true } : u
          )
        );
      }
    });

    socket.on("userDeletedByAdmin", (data) => {
      console.log("User deleted by admin event:", data);
      if (user?._id === data.userId) {
        logout();
      }
      if (user?.role === "Admin") {
        setAllUsers((prev) => prev.filter((u) => u._id !== data.userId));
      }
    });

    socket.on("adoptionApplied", async (data) => {
      console.log("Adoption applied event:", data);
      if (user?._id === data.userId) {
        // Optimistic update
        setApplications((prev) => {
          if (prev.some((app) => app.pet._id === data.petId)) {
            return prev;
          }
          return [
            ...prev,
            {
              pet: {
                _id: data.petId,
                name: data.petName,
                species: data.species || "unknown",
                city: data.city || "Unknown",
                image: data.image || "Unknown",
                gender: data.gender || "unknown",
              },
              status: "pending",
              user: data.userId, // Ensure this matches backend structure
            },
          ];
        });

        // Sync with server
        const result = await getMyAdoptionRequests();
        if (result.success) {
          setApplications(result.data);
          console.log("Applications synced:", result.data);
        } else {
          setError(result.error || "Failed to sync adoption requests");
        }
      }
    });

    socket.on("candidateStatusUpdated", (data) => {
      console.log("Candidate status updated event:", data);
      setApplications((prev) =>
        prev.map((app) =>
          app.pet._id === data.petId && app.user === user?._id
            ? { ...app, status: data.status }
            : app
        )
      );
    });

    socket.on("adoptionFinalized", (data) => {
      console.log("Adoption finalized event:", data);
      setApplications((prev) =>
        prev.map((app) =>
          app.pet._id === data.petId && app.user === user?._id
            ? {
                ...app,
                status: data.action === "adopt" ? "approved" : "rejected",
              }
            : app
        )
      );
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
      const token = localStorage.getItem("token");
      if (token) {
        console.log("Attempting to reconnect...");
        initializeSocket(token);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("petCreated");
      socket.off("petUpdated");
      socket.off("petDeleted");
      socket.off("petArchived");
      socket.off("petUnarchived");
      socket.off("userRegistered");
      socket.off("userProfileCompleted");
      socket.off("userProfileUpdated");
      socket.off("userUpdatedByAdmin");
      socket.off("userApproved");
      socket.off("userDeletedByAdmin");
      socket.off("adoptionApplied");
      socket.off("candidateStatusUpdated");
      socket.off("adoptionFinalized");
      socket.off("disconnect");
    };
  }, [user, fetchPets]);


  const location = useLocation();
useEffect(() => {
  if (location.pathname.startsWith("/pets")) {
    console.log("Navigated to /pets, fetching pets");
    fetchPets();
  }
}, [location, fetchPets]);
  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (token && !user) {
          await checkAuth();
        }
        console.log("Initializing app, fetching pets");
        await fetchPets(); // Always fetch pets
      } catch (err) {
        console.error("Initialize app error:", err);
        setError("Failed to initialize app");
      } finally {
        setLoading(false);
      }
    };
    initializeApp();
  }, [checkAuth, fetchPets]);

  // Auth functions
  const login = async (email, password) => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post("/api/user/login", {
        email,
        password,
      });
      const { accessToken, user: userData, redirectTo } = response.data;
      localStorage.setItem("token", accessToken);
      axiosInstance.setAuthToken(accessToken);
      socket.auth = { token: accessToken };
      socket.connect();
  
      const fetchPromises = [];
      fetchPromises.push(fetchPets().then((petsData) => ({ pets: petsData })));
      fetchPromises.push(fetchUserProfile().then((profile) => ({ user: profile })));
      if (userData.role === "PetOwner") {
        fetchPromises.push(getMyPets().then((result) => ({ userPets: result.data })));
        fetchPromises.push(
          getMyAdoptionRequests().then((result) => ({ applications: result.success ? result.data : [] }))
        );
      }
      if (userData.role === "Admin" || userData.role === "SuperAdmin" ) {
        fetchPromises.push(fetchAllUsers().then((users) => ({ allUsers: users })));
      }
  
      const results = await Promise.all(fetchPromises);
      const fetchedData = results.reduce((acc, result) => ({ ...acc, ...result }), {});
  
      const finalUser = fetchedData.user || ensureUserHasImage({ ...userData, adminType: userData.adminType });
      setUser(finalUser);
      setPets(fetchedData.pets || []);
      setUserPets(fetchedData.userPets || []);
      setApplications(fetchedData.applications || []);
      setAllUsers(fetchedData.allUsers || []);
  
      console.log("User set after login:", finalUser); 
      console.log("Token after login:", localStorage.getItem("token").substring(0, 10) + "...");
  
      return { success: true, redirectTo };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error logging in";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError("");
    const dataToSend = {
      ...userData,
      image: userData.image || DEFAULT_PROFILE_IMAGE,
      ...(userData.role === "Admin" && userData.adminType
        ? { adminType: userData.adminType }
        : {}),
    };
    try {
      const response = await axiosInstance.post(
        "/api/user/register",
        dataToSend
      );
      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        axiosInstance.setAuthToken(response.data.accessToken);
        socket.auth = { token: response.data.accessToken };
        socket.connect();
      }
      if (response.data.user) {
        const updatedUser = ensureUserHasImage({
          ...response.data.user,
          adminType: response.data.user.adminType,
        });
        setUser(updatedUser);
        const fetchPromises = [fetchPets()];
        if (updatedUser.role === "Admin") fetchPromises.push(fetchAllUsers());
        await Promise.all(fetchPromises);
      }
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error creating account";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData) => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post("/api/user/profile", {
        ...profileData,
        userId: user._id,
      });
      const { accessToken, message } = response.data;
      if (accessToken) {
        localStorage.setItem("token", accessToken);
        axiosInstance.setAuthToken(accessToken);
        socket.auth = { token: accessToken };
        socket.connect();
      }
      const updatedUser = ensureUserHasImage(response.data.user);
      setUser(updatedUser);
      const fetchPromises = [fetchPets()];
      if (updatedUser.role === "PetOwner") fetchPromises.push(getMyPets());
      Promise.all(fetchPromises).catch((error) =>
        console.error("Pre-fetch failed:", error)
      );
      return {
        success: true,
        message,
        redirectTo:
          updatedUser.role === "PetOwner"
            ? "/"
            : `/${updatedUser.role.toLowerCase()}`,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error completing profile";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const applyToAdopt = async (petId, applicationData) => {
    try {
      const response = await axiosInstance.post(
        `/api/pet/apply/${petId}`,
        applicationData
      );
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to apply for adoption";
      if (errorMessage === "You have already applied to adopt this pet") {
        // Trigger a sync to ensure UI reflects existing application
        const result = await getMyAdoptionRequests();
        if (result.success) {
          setApplications(result.data);
        }
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post("/api/user/forgot-password", {
        email,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to process password reset";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const validateResetToken = async (token) => {
    try {
      const response = await axiosInstance.get(
        `/api/user/validate-reset-token/${token}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Invalid or expired token",
      };
    }
  };

  const resetPassword = async (token, newPassword) => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post("/api/user/reset-password", {
        token,
        newPassword,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to reset password";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updatePet = async (petId, updateData) => {
    try {
      const response = await axiosInstance.put(
        `/api/pet/updatedPet/${petId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error updating pet";
      console.error("UpdatePet Error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack,
      });
      return { success: false, error: errorMessage };
    }
  };

  const deletePet = async (petId) => {
    try {
      await axiosInstance.put(`/api/pet/deletePet/${petId}`);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error deleting pet";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = useCallback(() => setError(""), []);

  const updateUser = useCallback((userData) => {
    setUser((prevUser) => ensureUserHasImage({ ...prevUser, ...userData }));
  }, []);

  const updateUsers = useCallback((updatedUsers) => {
    setAllUsers((prevUsers) => {
      const newUsers = updatedUsers.filter(
        (u) => !prevUsers.some((p) => p._id === u._id)
      );
      const updatedExisting = prevUsers.map((user) => {
        const updatedUser = updatedUsers.find((u) => u._id === user._id);
        return updatedUser ? { ...user, ...updatedUser } : user;
      });
      return [...updatedExisting, ...newUsers];
    });
  }, []);

  const updatePets = useCallback((updatedPets) => {
    setPets((prevPets) => {
      const newPets = updatedPets.filter(
        (p) => !prevPets.some((prev) => prev._id === p._id)
      );
      const updatedExisting = prevPets.map((pet) => {
        const updatedPet = updatedPets.find((p) => p._id === pet._id);
        return updatedPet ? { ...pet, ...updatedPet } : pet;
      });
      return [...updatedExisting, ...newPets];
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      pets,
      userPets,
      allUsers,
      applications,
      triggerRefresh,
      currencySymbol,
      login,
      register,
      logout,
      checkAuth,
      forgotPassword,
      validateResetToken,
      resetPassword,
      fetchUserProfile,
      createProfile,
      updateUser,
      fetchPets,
      fetchAllUsers,
      getMyPets,
      getMyAdoptionRequests,
      updatePet,
      deletePet,
      clearError,
      setError,
      setLoading,
      applyToAdopt,
      updateUsers,
      updatePets,
      socket,
    }),
    [
      user,
      loading,
      error,
      pets,
      userPets,
      allUsers,
      applications,
      checkAuth,
      fetchPets,
      fetchAllUsers,
      getMyPets,
      logout,
      clearError,
      updateUser,
      updateUsers,
      updatePets,
      socket,
      triggerRefresh,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useApp must be used within an AppContextProvider");
  return context;
};

export default AppContextProvider;
