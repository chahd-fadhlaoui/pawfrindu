import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  // App-wide state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pets, setPets] = useState([]);
  const currencySymbol = "Dt";

  // Initialize auth check
  // Vérifie l'authentification et charge les animaux
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        await checkAuth(); // Vérifie l'authentification
        // Only fetch pets if authentication was successful
        if (user) {
          await getMyPets();
        }
      } catch (error) {
        console.error("Initial auth check failed:", error);
      } finally {
        setLoading(false);
      }
      fetchPets();
    };

    initialize();
  }, [user?._id]);
  useEffect(() => {
    fetchPets(); // Récupérer les animaux dès le montage du composant
  }, []);

  // Nouvelle fonction pour récupérer les pets
  const fetchPets = async () => {
    try {
      const response = await axiosInstance.get("/api/pet/allpets");
      setPets(response.data.data); // Supposant que l'API renvoie { data: [...pets] }
    } catch (error) {
      console.error("Error fetching pets:", error);
      setError("Failed to fetch pets");
    }
  };
  // Configure axios interceptor for token
  useEffect(() => {
    // Add request interceptor
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle 401 errors
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Clear auth state on 401 unauthorized
          localStorage.removeItem("token");
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Auth Functions
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return false;
    }

    try {
      const response = await axiosInstance.get("/api/user/me");
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      setUser(null);
      return false;
    }
  };

  const login = async (email, password) => {
    if (loading) return; // Prevent multiple submissions
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/api/user/login", {
        email,
        password,
      });

      const { accessToken, user } = response.data;

      // Use the new helper function
      axiosInstance.setAuthToken(accessToken);
      setUser(user);

      return {
        success: true,
        redirectTo:
          user.role === "PetOwner"
            ? "/"
            : user.role === "Trainer"
            ? "/trainer"
            : "/vet",
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error logging in";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      // Add a small delay before removing loading state to prevent flash
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError("");
    console.log("Attempting to register with data:", userData);
    try {
      const response = await axiosInstance.post("/api/user/register", userData);

      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.accessToken}`;
      }

      if (response.data.user) {
        setUser(response.data.user);
      }

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.log("Full error response:", error.response);
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
        userId: user._id, // Add the userId from context
      });

      if (response.data.user) {
        setUser(response.data.user);
      }

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
  const logout = () => {
    axiosInstance.setAuthToken(null);
    setUser(null);
  };
  // Helper Functions
  const clearError = () => {
    setError("");
  };

  const updateUser = (userData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }));
  };
// Add pet
/* const createPet = async (petData) => {
  try {
    const response = await axiosInstance.post("/api/pet/addpet", petData);
    await fetchPets(); // Refresh pets after creation
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Error creating pet";
    setError(errorMessage);
    return { success: false, error: errorMessage };
  }
}; */
  

// Update pet
  const updatePet = async (petId, updateData) => {
    try {
      const response = await axiosInstance.put(
        `/api/pet/updatedPet/${petId}`,
        updateData
      );
      await fetchPets(); // Refresh pets after update
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error updating pet";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Delete pet
  const deletePet = async (petId) => {
    try {
      await axiosInstance.delete(`/api/pet/deletePet/${petId}`);
      await fetchPets(); // Refresh pets after deletion
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error deleting pet";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Get my pets
  const getMyPets = async () => {
    try {
      const response = await axiosInstance.get("/api/pet/mypets");
      console.log("API Response for getMyPets:", response.data);
      // Update the pets state
      setPets(response.data.data || []);
      // Return the data in a consistent format
      return {
        success: true,
        data: response.data.data || [], // Make sure we always return an array
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error fetching your pets";
      setError(errorMessage);
      console.error("Error fetching your pets:", error);
      return {
        success: false,
        error: errorMessage,
        data: [], // Return empty array on error
      };
    }
  };
  const value = {
    // Auth State
    user,
    loading,
    error,

    // App Data
    pets,
    currencySymbol,

    // Auth Functions
    login,
    register,
    forgotPassword,
    logout,
    createProfile,
    checkAuth,
    resetPassword,
    validateResetToken,

    // Pet Functions
    //createPet,
    updatePet,
    deletePet,
    getMyPets,

    // Helper Functions
    clearError,
    updateUser,

    // Direct State Access (use carefully)
    setError,
    setLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook for using the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppContextProvider");
  }
  return context;
};

export default AppContextProvider;
