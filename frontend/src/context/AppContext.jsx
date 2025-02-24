import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axiosInstance from "../utils/axiosInstance";

const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNMTYwIDE4MEgzOUM0MSAxNDAgODAgMTIwIDEwMCAxMjBDMTIwIDEyMCAxNTggMTQwIDE2MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==";

const ensureUserHasImage = (user) => {
  if (!user) return null;
  // Ensure image is set before returning the user
  const processedUser = {
    ...user,
    image: user.image || DEFAULT_PROFILE_IMAGE,
  };
  return processedUser;
};

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pets, setPets] = useState([]);
  const [userPets, setUserPets] = useState([]); // Separate state for user's pets
  const currencySymbol = "Dt";

  // Memoized core functions
  const fetchPets = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/pet/allpets");
      const petsData = response.data.data || [];
      setPets(petsData);
      return petsData;
    } catch (error) {
      console.error("Error fetching pets:", error);
      setError("Failed to fetch pets");
      return [];
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return false;
    }

    try {
      const response = await axiosInstance.get("/api/user/me");
      console.log("CheckAuth response:", response.data);
      const authenticatedUser = ensureUserHasImage(response.data.user);
      setUser(authenticatedUser);
      return true;
    } catch (error) {
      console.error(
        "Auth check failed:",
        error.message,
        error.response?.status
      );
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized getMyPets - only for authenticated users
  const getMyPets = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, error: "User not authenticated", data: [] };
    }

    try {
      const response = await axiosInstance.get("/api/pet/mypets");
      const userPetsData = response.data.data || [];
      setUserPets(userPetsData);
      return { success: true, data: userPetsData };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching your pets";
      console.error("Error fetching your pets:", error);
      return { success: false, error: errorMessage, data: [] };
    }
  }, []);

  // Initialize app
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (!isMounted) return;
      setLoading(true);
      console.log("Initializing app...");

      try {
        // First fetch all pets (public data)
        await fetchPets();
        console.log("Pets fetched");
        // Then check authentication
        const isAuthenticated = await checkAuth();
        console.log("Auth checked:", isAuthenticated);
        // If authenticated, fetch user's pets
        if (isAuthenticated && isMounted) {
          await getMyPets();
          console.log("User pets fetched");
        }
      } catch (error) {
        console.error("Initialization failed:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log("Loading complete");
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [fetchPets, checkAuth, getMyPets]);

  // Axios interceptors
  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setUser(null);
          setUserPets([]);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, []);

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
      const authenticatedUser = ensureUserHasImage(userData);

      localStorage.setItem("token", accessToken);
      axiosInstance.setAuthToken(accessToken); // Assuming this method exists
      setUser(authenticatedUser); // Set user directly from login response
      await fetchPets();
      await checkAuth();
      console.log("Login successful, user:", authenticatedUser);
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
            : "/login", // Fallback, though unlikely
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        (error.code === "ECONNREFUSED"
          ? "Cannot connect to server"
          : "Error logging in");
      setError(errorMessage);
      console.error("Login error:", error);
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
        const registeredUser = ensureUserHasImage(response.data.user);
        setUser(registeredUser);
        await fetchPets();
      }

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error creating account";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/user/me");

      const userData = response.data.user;
      const formattedUser = {
        name: userData.fullName || userData.name,
        image: userData.image || DEFAULT_PROFILE_IMAGE,
        email: userData.email,
        role:
          userData.role === "PetOwner"
            ? "Pet Owner"
            : userData.role === "Vet"
            ? "Veterinarian"
            : "Pet Trainer",
        about: userData.about || "No bio available.",
        petOwnerDetails: {
          address: userData.petOwnerDetails?.address || "Not provided",
          phone: userData.petOwnerDetails?.phone || "Not provided",
        },
        createdAt: userData.createdAt,
      };

      setUser(formattedUser);
      return formattedUser;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setError(error.response?.data?.message || "Failed to fetch user profile");
      throw error;
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

      const updatedUser = ensureUserHasImage(response.data.user);
      setUser(updatedUser);

      return {
        success: true,
        message: response.data.message,
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

  // Password management
  const forgotPassword = async (email) => {
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/api/user/forgot-password", {
        email,
      });
      return {
        success: true,
        message: response.data.message,
      };
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

      return {
        success: true,
        message: response.data.message,
      };
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
      // Refresh both lists
      await fetchPets();
      if (user) {
        await getMyPets();
      }
      return {
        success: true,
        data: response.data,
        message: response.data.message, // Pass the message from backend
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
      // Refresh both lists
      await fetchPets();
      if (user) {
        await getMyPets();
      }
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error deleting pet";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Helper functions
  const logout = useCallback(() => {
    axiosInstance.setAuthToken(null);
    localStorage.removeItem("token");
    setUser(null);
    setUserPets([]);
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prevUser) =>
      ensureUserHasImage({
        ...prevUser,
        ...userData,
      })
    );
  }, []);

  const value = {
    // State
    user,
    loading,
    error,
    pets, // All pets - available to everyone
    userPets, // User's pets - only available to authenticated users
    currencySymbol,

    // Auth functions
    login,
    register,
    logout,
    checkAuth,
    forgotPassword,
    validateResetToken,
    resetPassword,

    // Profile functions
    fetchUserProfile,
    createProfile,
    updateUser,

    // Public functions
    fetchPets, // Available to all users

    // Protected functions
    getMyPets, // Only for authenticated users
    updatePet,
    deletePet,

    // Helper functions
    clearError,
    setError,
    setLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppContextProvider");
  }
  return context;
};

export default AppContextProvider;
