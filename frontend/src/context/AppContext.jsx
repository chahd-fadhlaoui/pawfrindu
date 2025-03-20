import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axiosInstance from "../utils/axiosInstance";

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
  const [lastPetFetchTime, setLastPetFetchTime] = useState(0);
  const [lastUsersFetchTime, setLastUsersFetchTime] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState({ pets: 0, users: 0 }); // Split refresh triggers
  const currencySymbol = "Dt";
  const CACHE_DURATION = 60000; // 60 seconds

  // Custom timing utility to avoid console.time conflicts
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
        adminType: response.data.user.adminType, // Inclure adminType
      });
      setUser(authenticatedUser);
      console.log("checkAuth succeeded with user:", authenticatedUser);
      return true;
    }).catch((error) => {
      console.error("Auth check failed:", error.response?.status);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
      }
      return false;
    });
  }, []);


  const fetchPets = useCallback(async () => {
    return measureTime("fetchPets", async () => {
      console.log("Fetching fresh pets from /api/pet/allpets");

      const response = await axiosInstance.get("/api/pet/allpets");
      const petsData = response.data.data || [];
      console.log("Fetched pets:", JSON.stringify(petsData, null, 2));

      setPets((prevPets) => {
        // Only update if data has changed
        if (JSON.stringify(prevPets) !== JSON.stringify(petsData)) {
          console.log("Pets updated due to data change");
          return petsData;
        }
        console.log("Pets unchanged, skipping update");
        return prevPets;
      });

      setLastPetFetchTime(Date.now());
      return petsData;
    }).catch((error) => {
      console.error("Error fetching pets:", error);
      setError("Failed to fetch pets");
      return pets;
    });
  }, []);

  
  const fetchAllUsers = useCallback(async () => {
    const now = Date.now();
    if (allUsers.length > 0 && now - lastUsersFetchTime < CACHE_DURATION) {
      return allUsers;
    }
    return measureTime("fetchAllUsers", async () => {
      const response = await axiosInstance.get("/api/user/getAllUsers");
      const usersData = response.data.users || [];
      setAllUsers(usersData);
      setLastUsersFetchTime(now);
      return usersData;
    }).catch((error) => {
      setError("Failed to fetch users");
      return [];
    });
  }, [allUsers, lastUsersFetchTime]);

  const getMyPets = useCallback(async () => {
    return measureTime("getMyPets", async () => {
      const response = await axiosInstance.get("/api/pet/mypets");
      console.log("getMyPets response:", response.data); // Debug
      const userPetsData = response.data.data || [];
      setUserPets(userPetsData);
      return { success: true, data: userPetsData };
    }).catch((error) => {
      console.error("Error fetching your pets:", error);
      setError("Failed to fetch your pets");
      return { success: false, error: "Error fetching your pets", data: [] };
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
            ? userData.adminType // Utiliser adminType pour les admins
            : userData.role,
        petOwnerDetails: userData.petOwnerDetails || {
          address: "Not provided",
          phone: "Not provided",
        },
        trainerDetails: userData.trainerDetails || undefined,
        veterinarianDetails: userData.veterinarianDetails || undefined,
        createdAt: userData.createdAt,
      };
      console.log("Fetched user data:", formattedUser);
      setUser(formattedUser);
      return formattedUser;
    }).catch((error) => {
      console.error("Failed to fetch profile:", error);
      setError(error.response?.data?.message || "Failed to fetch user profile");
      throw error;
    });
  }, []);

// method for fetching adoption requests
const getMyAdoptionRequests = useCallback(async () => {
  return measureTime("getMyAdoptionRequests", async () => {
    const token = localStorage.getItem("token");
    console.log("Sending request to /my-adoption-requests with token:", token);
    const response = await axiosInstance.get("/api/pet/my-adoption-requests");
    console.log("Adoption requests response:", response.data);
    const adoptionRequests = response.data.data || [];
    return { success: true, data: adoptionRequests };
  }).catch((error) => {
    console.error("Error fetching adoption requests:", error.response?.data || error.message);
    setError(error.response?.data?.message || "Failed to fetch adoption requests");
    return { success: false, error: "Error fetching adoption requests", data: [] };
  });
}, [setError]);

const triggerRefresh = useCallback(
  async (type = "pets") => {
    console.log("triggerRefresh called from:", new Error().stack.split("\n")[2]);
    let newData;
    if (type === "pets") {
      newData = await fetchPets();
      setRefreshTrigger((prev) => ({ ...prev, pets: prev.pets + 1 }));
    } else if (type === "users") {
      newData = await fetchAllUsers();
      setRefreshTrigger((prev) => ({ ...prev, users: prev.users + 1 }));
    }
    console.log(`triggerRefresh completed for ${type}, new data:`, newData);
    return newData;
  },
  [fetchPets, fetchAllUsers]
);

  // Initialize app
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        await fetchPets(); // Always fetch pets
        const token = localStorage.getItem("token");
        if (token && !user) {
          // Only run if no user is set
          const isAuthenticated = await checkAuth();
          if (isAuthenticated) {
            const currentUser = await fetchUserProfile(); // Fetch user first
            const fetchPromises = [];
            if (currentUser.role === "PetOwner" && userPets.length === 0) {
              fetchPromises.push(getMyPets()); // Fetch pets for PetOwner
            }
            if (currentUser.role === "Admin") {
              fetchPromises.push(fetchAllUsers()); // Fetch users for Admin after user is set
            }
            await Promise.all(fetchPromises);
            console.log("Initialization succeeded")
          } else {
            console.log("Initial auth check failed");
            localStorage.removeItem("token"); // Clear invalid token
          }
        } else if (!token) {
          console.log("No token, skipping initialization");
        }
      } catch (error) {
        console.error("Initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []); 

  // Refresh pets when triggered
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchPets().then(() => {
        if (user?.role === "Admin") fetchAllUsers();
      });
    }
  }, [refreshTrigger, fetchPets, fetchAllUsers, user]);

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
      const { accessToken, user: userData } = response.data;
      localStorage.setItem("token", accessToken);
      axiosInstance.setAuthToken(accessToken);
      const updatedUser = ensureUserHasImage({
        ...userData,
        adminType: userData.adminType, // Inclure adminType
      });
      setUser(updatedUser);
      const fetchPromises = [fetchUserProfile(), fetchPets()];
      if (updatedUser.role === "PetOwner") fetchPromises.push(getMyPets());
      if (updatedUser.role === "Admin") fetchPromises.push(fetchAllUsers());
      await Promise.all(fetchPromises);
      return {
        success: true,
        redirectTo:
          updatedUser.role === "PetOwner"
            ? "/"
            : updatedUser.role === "Trainer"
            ? "/trainer"
            : updatedUser.role === "Vet"
            ? "/vet"
            : updatedUser.role === "Admin"
            ? "/admin"
            : "/login",
      };
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
      ...(userData.role === "Admin" && userData.adminType ? { adminType: userData.adminType } : {}), // Ajouter adminType si Admin
    };
    try {
      const response = await axiosInstance.post("/api/user/register", dataToSend);
      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        axiosInstance.setAuthToken(response.data.accessToken);
      }
      if (response.data.user) {
        const updatedUser = ensureUserHasImage({
          ...response.data.user,
          adminType: response.data.user.adminType, // Inclure adminType dans l'état
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
      const { accessToken, message } = response.data; // Extract the new token
      console.log("createProfile response:", response.data); // Debug response
      console.log("New token:", accessToken); // Debug new token

      if (accessToken) {
        localStorage.setItem("token", accessToken); // Update token in localStorage
        axiosInstance.setAuthToken(accessToken); // Update axios instance with new token
      }

      const updatedUser = ensureUserHasImage(response.data.user);
      setUser(updatedUser);

      // Pre-fetch data in parallel but don't await navigation
      const fetchPromises = [fetchPets()];
      if (updatedUser.role === "PetOwner") {
        fetchPromises.push(getMyPets());
      }
      Promise.all(fetchPromises).catch((error) =>
        console.error("Pre-fetch failed:", error)
      );

      return { success: true, message, redirectTo: updatedUser.role === "PetOwner" ? "/" : `/${updatedUser.role.toLowerCase()}` };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error completing profile";
        console.error("createProfile error:", error.response?.data);
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
      await triggerRefresh("pets"); // Refresh pets after adoption application
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to apply for adoption";
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
      console.log("Raw Backend Response:", JSON.stringify(response.data, null, 2));
      await triggerRefresh("pets"); // Refresh pets after update
      return response.data; // Return raw response directly
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
      await axiosInstance.delete(`/api/pet/deletePet/${petId}`);
      await triggerRefresh("pets"); // Refresh pets after update
      if (user) await getMyPets();
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error deleting pet";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = useCallback(() => {
    axiosInstance.setAuthToken(null);
    localStorage.removeItem("token");
    setUser(null);
    setUserPets([]);
    setPets([]);
    setAllUsers([]);
    setLastPetFetchTime(0);
    setLastUsersFetchTime(0);
    setRefreshTrigger({ pets: 0, users: 0 });
  }, []);

  const clearError = useCallback(() => setError(""), []);

  const updateUser = useCallback((userData) => {
    setUser((prevUser) => ensureUserHasImage({ ...prevUser, ...userData }));
  }, []);

  const updateUsers = useCallback((updatedUsers) => {
    setAllUsers((prevUsers) => {
      const newUsers = updatedUsers.filter((u) => !prevUsers.some((p) => p._id === u._id));
      const updatedExisting = prevUsers.map((user) => {
        const updatedUser = updatedUsers.find((u) => u._id === user._id);
        return updatedUser ? { ...user, ...updatedUser } : user;
      });
      return [...updatedExisting, ...newUsers];
    });
  }, []);

  const updatePets = useCallback((updatedPets) => {
    setPets((prevPets) => {
      const newPets = updatedPets.filter((p) => !prevPets.some((prev) => prev._id === p._id));
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
      triggerRefresh,
      updateUsers,
      updatePets,
    }),
    [
      user,
      loading,
      error,
      pets,
      userPets,
      checkAuth,
      fetchPets,
      fetchAllUsers,
      getMyPets,
      logout,
      clearError,
      updateUser,
      updateUsers,
      updatePets,
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
