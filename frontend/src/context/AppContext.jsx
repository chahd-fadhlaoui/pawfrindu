import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
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
  const [lastPetFetchTime, setLastPetFetchTime] = useState(0);
  const [refreshPetsTrigger, setRefreshPetsTrigger] = useState(0);
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
      const authenticatedUser = ensureUserHasImage(response.data.user);
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
    const now = Date.now();
    if (pets.length > 0 && now - lastPetFetchTime < CACHE_DURATION) {
      console.log("Returning cached pets");
      return pets;
    }

    return measureTime("fetchPets", async () => {
      const response = await axiosInstance.get("/api/pet/allpets");
      const petsData = response.data.data || [];
      if (JSON.stringify(petsData) !== JSON.stringify(pets)) {
        setPets(petsData);
      }
      setLastPetFetchTime(now);
      return petsData;
    }).catch((error) => {
      console.error("Error fetching pets:", error);
      setError("Failed to fetch pets");
      return [];
    });
  }, [pets, lastPetFetchTime]);

  const getMyPets = useCallback(async () => {
    return measureTime("getMyPets", async () => {
      const response = await axiosInstance.get("/api/pet/mypets");
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
        fullName: userData.fullName, // Utiliser fullName
        image: userData.image || DEFAULT_PROFILE_IMAGE,
        email: userData.email,
        role: userData.role,
        about: userData.about || "",
        displayRole:
          userData.role === "PetOwner"
            ? "Pet Owner"
            : userData.role === "Vet"
            ? "Veterinarian"
            : userData.role === "Trainer"
            ? "Pet Trainer"
            : userData.role,
        petOwnerDetails: userData.petOwnerDetails || {
          address: "Not provided",
          phone: "Not provided",
        },
        trainerDetails: userData.trainerDetails || undefined,
        veterinarianDetails: userData.veterinarianDetails || undefined,
        createdAt: userData.createdAt,
      };
      console.log("Fetched user data:", formattedUser); // Ajoutez ceci pour déboguer
      setUser(formattedUser);
      console.log("Fetched user data:", formattedUser);
      return formattedUser;
    }).catch((error) => {
      console.error("Failed to fetch profile:", error);
      setError(error.response?.data?.message || "Failed to fetch user profile");
      throw error;
    });
  }, []);

  // Initialize app
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await fetchPets(); // Fetch pets regardless of auth
      try {
        const token = localStorage.getItem("token");
        if (token && !user) {
          // Only run if no user is set
          const isAuthenticated = await checkAuth();
          if (isAuthenticated) {
            await fetchUserProfile();
            if (user?.role === "PetOwner" && userPets.length === 0)
              await getMyPets();
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
  }, [checkAuth, fetchUserProfile, getMyPets, userPets.length, fetchPets]); 
  // Refresh pets when triggered
  useEffect(() => {
    if (refreshPetsTrigger > 0) {
      fetchPets();
    }
  }, [refreshPetsTrigger, fetchPets]);

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
      setUser(ensureUserHasImage(userData));
      await Promise.all([fetchUserProfile(), fetchPets(), getMyPets()]);
      return {
        success: true,
        redirectTo:
          userData.role === "PetOwner"
            ? "/"
            : userData.role === "Trainer"
            ? "/trainer"
            : userData.role === "Vet"
            ? "/vet"
            : userData.role === "Admin"
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
    };
    try {
      const response = await axiosInstance.post(
        "/api/user/register",
        dataToSend
      );
      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        axiosInstance.setAuthToken(response.data.accessToken);
      }
      if (response.data.user) {
        setUser(ensureUserHasImage(response.data.user));
        await fetchPets();
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
      setRefreshPetsTrigger((prev) => prev + 1);
      if (user) await getMyPets();
      return {
        success: true,
        data: response.data,
        message: response.data.message,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error updating pet";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deletePet = async (petId) => {
    try {
      await axiosInstance.delete(`/api/pet/deletePet/${petId}`);
      setRefreshPetsTrigger((prev) => prev + 1);
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
    setLastPetFetchTime(0);
    setRefreshPetsTrigger(0);
  }, []);

  const clearError = useCallback(() => setError(""), []);

  const updateUser = useCallback((userData) => {
    setUser((prevUser) => ensureUserHasImage({ ...prevUser, ...userData }));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      pets,
      userPets,
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
      getMyPets,
      updatePet,
      deletePet,
      clearError,
      setError,
      setLoading,
      applyToAdopt,
      triggerPetsRefresh: () => setRefreshPetsTrigger((prev) => prev + 1),
    }),
    [
      user,
      loading,
      error,
      pets,
      userPets,
      checkAuth,
      fetchPets,
      getMyPets,
      logout,
      clearError,
      updateUser,
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
