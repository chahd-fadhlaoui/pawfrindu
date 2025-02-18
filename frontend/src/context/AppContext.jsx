// context/AppContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { pets } from "../assets/assets";
import axiosInstance from "../utils/axiosInstance";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  // App-wide state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currencySymbol = "Dt";

  // Initialize auth check
  useEffect(() => {
    checkAuth();
  }, []);

  // Configure axios interceptor for token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    return () => {
      delete axiosInstance.defaults.headers.common["Authorization"];
    };
  }, []);

  // Auth Functions
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axiosInstance.get("/api/user/me");
        setUser(response.data.user);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        delete axiosInstance.defaults.headers.common["Authorization"];
        setUser(null);
      }
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
      localStorage.setItem("token", accessToken);
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
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
    localStorage.removeItem("token");
    delete axiosInstance.defaults.headers.common["Authorization"];
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