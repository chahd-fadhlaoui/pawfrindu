// context/AppContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { pets } from "../assets/assets";
import axiosInstance from "../utils/axiosInstance";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  // App-wide state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currencySymbol = "Dt";

// Initialize auth check
useEffect(() => {
  const initializeAuth = async () => {
    setLoading(true);
    try {
      await checkAuth();
    } catch (error) {
      console.error("Initial auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  initializeAuth();
}, []);


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
        redirectTo: user.role === "PetOwner" ? "/" : user.role === "Trainer" ? "/trainer" : "/vet",
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

    try {
      const response = await axiosInstance.post("/api/user/register", userData);
      
      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${response.data.accessToken}`;
      }

      if (response.data.user) {
        setUser(response.data.user);
      }

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error creating account";
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
        userId: user._id  // Add the userId from context
      });
      
      if (response.data.user) {
        setUser(response.data.user);
      }
  
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error completing profile";
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
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
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
    logout,
    createProfile,
    checkAuth,
    
    // Helper Functions
    clearError,
    updateUser,
    
    // Direct State Access (use carefully)
    setError,
    setLoading
  };
     // Don't render children until initial auth check is complete
  if (loading) {
    return null; // Or return a loading spinner
  }

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