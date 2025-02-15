import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";
import RoleSelector from "../components/auth/RoleSelector";
import SignupFormStep1 from "../components/auth/SignupFormStep1";
import FormHeader from "../components/ui/FormHeader";
import NavigationButtons from "../components/ui/NavigationButtons";
import ProgressIndicator from "../components/ui/ProgressIndicator";
import RightPanel from "../components/ui/RightPanel";
import axiosInstance from "../utils/axiosInstance";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [selectedRole, setSelectedRole] = useState("pet-owner");
  const [showPassword, setShowPassword] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [signupData, setSignupData] = useState(null);
  const [error, setError] = useState("");

  // Handle login submission
  const handleLogin = async (email, password) => {
    try {
      const response = await axiosInstance.post("/api/user/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.accessToken);

      const user = response.data.user;
      const dash =
        user.role === "PetOwner"
          ? "/"
          : user.role === "Trainer"
          ? "/trainer"
          : "/vet";

      navigate(dash);
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Error logging in");
    }
  };

  // Handle validation change from SignupFormStep1
  const handleValidationChange = (isValid, formData) => {
    setSignupData(formData);
    setError(""); // Clear any previous errors
  };

  // Format role for API
  const formatRole = (role) => {
    const roleMap = {
      "pet-owner": "PetOwner",
      trainer: "Trainer",
      vet: "Vet",
    };
    return roleMap[role] || role;
  };

  // Handle signup submission
  const handleSignup = async (formData) => {
    if (!formData) return;
  
    try {
      const submitData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formatRole(selectedRole)
      };
  
      console.log("Sending registration data:", submitData);
  
      const response = await axiosInstance.post("/api/user/register", submitData);
      
      // Check if the registration was successful
      if (response.data && response.data.success) {
        // Check if there's a token in the response
        if (response.data.accessToken) {
          localStorage.setItem("token", response.data.accessToken);
          navigate("/myprofile");
        } else {
          // If registration is successful but no token, redirect to login
          setMode("login");
          setError("Registration successful! Please login to continue.");
        }
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      
      if (error.response) {
        const errorMessage = error.response.data.message || 
          (error.response.data.errors && error.response.data.errors[0]?.msg) || 
          "Error creating account";
        setError(errorMessage);
      } else if (error.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError(error.message || "Error setting up request");
      }
    }
  };

  const handleModeSwitch = (newMode) => {
    if (isTransitioning || mode === newMode) return;

    setIsTransitioning(true);
    setError(""); // Clear any errors when switching modes

    setTimeout(() => {
      setMode(newMode);
      setFormStep(0);
      setSignupData(null);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  // Handle form step navigation
  const handleNextStep = () => {
    if (formStep === 1 && signupData) {
      handleSignup(signupData);
    } else {
      setFormStep(formStep + 1);
    }
  };

  useEffect(() => {
    document.title = mode === "login" ? "Login" : "Sign Up";
  }, [mode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#ffc929]/5 to-pink-50">
      <div className="container flex items-center justify-center min-h-screen p-4 mx-auto">
        <div className="relative w-full max-w-5xl overflow-hidden bg-white shadow-xl rounded-2xl">
          <div className="flex flex-col md:flex-row h-[700px] md:h-[600px]">
            {/* Form Container */}
            <div
              className={`w-full md:w-1/2 transition-transform duration-500 ease-out ${
                mode === "signup" ? "order-last" : ""
              }`}
            >
              <div className="h-full p-8 overflow-y-auto">
                <FormHeader mode={mode} />
                {mode === "signup" && <ProgressIndicator formStep={formStep} />}

                {/* Error Message */}
                {error && (
                  <div className="p-3 mb-4 text-sm text-red-500 rounded-lg bg-red-50">
                    {error}
                  </div>
                )}

                <form
                  className="space-y-6"
                  onSubmit={(e) => e.preventDefault()}
                >
                  {mode === "login" && (
                    <LoginForm
                      handleModeSwitch={handleModeSwitch}
                      onLogin={handleLogin}
                    />
                  )}

                  {mode === "forgetPassword" && <ResetPasswordForm />}

                  {mode === "signup" && (
                    <>
                      {formStep === 0 && (
                        <RoleSelector
                          selectedRole={selectedRole}
                          setSelectedRole={setSelectedRole}
                        />
                      )}

                      {formStep === 1 && (
                        <SignupFormStep1
                          showPassword={showPassword}
                          onTogglePassword={() =>
                            setShowPassword(!showPassword)
                          }
                          onValidationChange={handleValidationChange}
                        />
                      )}

                      <NavigationButtons
                        formStep={formStep}
                        setFormStep={setFormStep}
                        onSubmit={() => handleSignup(signupData)}
                        isValid={!!signupData}
                      />
                    </>
                  )}
                </form>

                {/* Mode Switch Button */}
                <div className="mt-6 text-center">
                  <span className="text-sm text-neutral-600">
                    {mode === "login"
                      ? "Don't have an account? "
                      : "Already have an account? "}
                    <button
                      onClick={() =>
                        handleModeSwitch(mode === "login" ? "signup" : "login")
                      }
                      className="text-[#ffc929] hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffc929] rounded-sm"
                      disabled={isTransitioning}
                    >
                      {mode === "login" ? "Sign Up" : "Sign In"}
                    </button>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-full transition-transform duration-500 ease-out md:w-1/2">
              <RightPanel
                mode={mode}
                handleModeSwitch={handleModeSwitch}
                isTransitioning={isTransitioning}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
