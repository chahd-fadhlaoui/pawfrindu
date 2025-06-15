import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoginForm from "../components/auth/LoginForm";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";
import RoleSelector from "../components/auth/RoleSelector";
import SignupFormStep1 from "../components/auth/SignupFormStep1";
import LoadingWrapper from "../components/LoadingWrapper";
import FormHeader from "../components/ui/FormHeader";
import NavigationButtons from "../components/ui/NavigationButtons";
import ProgressIndicator from "../components/ui/ProgressIndicator";
import RightPanel from "../components/ui/RightPanel";
import { useApp } from "../context/AppContext";

const Auth = () => {
  const navigate = useNavigate();
  const { login, register, error, loading, clearError } = useApp();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [selectedRole, setSelectedRole] = useState("pet-owner");
  const [showPassword, setShowPassword] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [signupData, setSignupData] = useState(null);

  // Detect phone screens (≤640px) for RightPanel visibility
  const [isPhone, setIsPhone] = useState(window.matchMedia("(max-width: 640px)").matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const handleResize = () => setIsPhone(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result.success) {
      const redirectTo = location.state?.from || result.redirectTo || "/pets";
      toast.success("Login successful!", { autoClose: 2000 });
      console.log("Navigating to:", result.redirectTo);
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(result.error || "Login failed", { autoClose: 3000 });
    }
  };

  const handleValidationChange = (isValid, formData) => {
    setSignupData(formData);
    clearError();
  };

  const formatRole = (role) => {
    const roleMap = {
      "pet-owner": "PetOwner",
      trainer: "Trainer",
      veterinarian: "Vet",
    };
    return roleMap[role] || role;
  };

  const handleSignup = async (formData) => {
    if (!formData) return;

    const submitData = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formatRole(selectedRole),
    };

    const result = await register(submitData);
    if (result.success) {
      navigate("/myprofile");
    }
  };

  const handleModeSwitch = (newMode) => {
    if (isTransitioning || mode === newMode) return;
    setIsTransitioning(true);
    clearError();

    setTimeout(() => {
      setMode(newMode);
      setFormStep(0);
      setSignupData(null);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, isPhone ? 150 : 300); // Faster transition on phones
  };

  useEffect(() => {
    document.title = mode === "login" ? "Login" : "Sign Up";
  }, [mode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#ffc929]/5 to-pink-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 overscroll-y-none">
      <LoadingWrapper loading={loading}>
        <div className="w-full max-w-[80rem] bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row min-h-[400px] sm:min-h-[500px] lg:h-[600px]">
            <div
              className={`w-full sm:w-1/2 transition-transform duration-300 ease-out p-4 sm:p-6 lg:p-8 touch-action-pan-y ${
                isPhone ? "w-full" : mode === "signup" ? "order-last" : ""
              }`}
              role="region"
              aria-label="Authentication form"
            >
              <div className="h-full overflow-y-auto">
                <FormHeader mode={mode} />
                {mode === "signup" && <ProgressIndicator formStep={formStep} />}

                {error && (
                  <div className="p-3 mb-4 text-sm sm:text-base text-red-500 rounded-lg bg-red-50">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  {mode === "login" && (
                    <LoginForm
                      handleModeSwitch={handleModeSwitch}
                      onLogin={handleLogin}
                      isLoading={loading}
                    />
                  )}

                  {mode === "forgetPassword" && (
                    <ResetPasswordForm onModeSwitch={handleModeSwitch} />
                  )}

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
                          onTogglePassword={() => setShowPassword(!showPassword)}
                          onValidationChange={handleValidationChange}
                          isLoading={loading}
                        />
                      )}

                      <NavigationButtons
                        formStep={formStep}
                        setFormStep={setFormStep}
                        onSubmit={() => handleSignup(signupData)}
                        isValid={!!signupData}
                        isLoading={loading}
                      />
                    </>
                  )}
                </div>

                {mode !== "forgetPassword" && (
                  <div className="mt-6 text-center">
                    <span className="text-sm sm:text-base text-neutral-600">
                      {mode === "login"
                        ? "Don't have an account? "
                        : "Already have an account? "}
                      <button
                        onClick={() =>
                          handleModeSwitch(mode === "login" ? "signup" : "login")
                        }
                        className="text-[#ffc929] hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffc929] rounded-sm min-h-[44px] min-w-[44px]"
                        disabled={isTransitioning || loading}
                        aria-label={
                          mode === "login" ? "Switch to sign up" : "Switch to sign in"
                        }
                      >
                        {mode === "login" ? "Sign Up" : "Sign In"}
                      </button>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!isPhone && (
              <div
                className="w-full sm:w-1/2 transition-transform duration-300 ease-out"
                role="complementary"
                aria-label="Authentication panel"
              >
                <RightPanel
                  mode={mode}
                  handleModeSwitch={handleModeSwitch}
                  isTransitioning={isTransitioning}
                  isMobile={isPhone}
                />
              </div>
            )}
          </div>
        </div>
      </LoadingWrapper>
    </div>
  );
};

export default Auth;