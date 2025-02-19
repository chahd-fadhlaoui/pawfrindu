import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import LoginForm from "../components/auth/LoginForm";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";
import RoleSelector from "../components/auth/RoleSelector";
import SignupFormStep1 from "../components/auth/SignupFormStep1";
import FormHeader from "../components/ui/FormHeader";
import NavigationButtons from "../components/ui/NavigationButtons";
import ProgressIndicator from "../components/ui/ProgressIndicator";
import RightPanel from "../components/ui/RightPanel";
import LoadingWrapper from "../components/LoadingWrapper";

const Auth = () => {
  const navigate = useNavigate();
  const { login, register, error, loading, clearError } = useApp();
  const [mode, setMode] = useState("login");
  const [selectedRole, setSelectedRole] = useState("pet-owner");
  const [showPassword, setShowPassword] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [signupData, setSignupData] = useState(null);

  // Handle login submission
  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result.success) {
      navigate(result.redirectTo);
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
      veterinaire: "Vet",
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
    }, 300);
  };

  useEffect(() => {
    document.title = mode === "login" ? "Login" : "Sign Up";
  }, [mode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#ffc929]/5 to-pink-50">
      <LoadingWrapper loading={loading}>
      <div className="container flex items-center justify-center min-h-screen p-4 mx-auto">
        <div className="relative w-full max-w-5xl overflow-hidden bg-white shadow-xl rounded-2xl">
          <div className="flex flex-col md:flex-row h-[700px] md:h-[600px]">
            <div className={`w-full md:w-1/2 transition-transform duration-500 ease-out ${
              mode === "signup" ? "order-last" : ""
            }`}>
              <div className="h-full p-8 overflow-y-auto">
                <FormHeader mode={mode} />
                {mode === "signup" && <ProgressIndicator formStep={formStep} />}

                {error && (
                  <div className="p-3 mb-4 text-sm text-red-500 rounded-lg bg-red-50">
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
                    <span className="text-sm text-neutral-600">
                      {mode === "login"
                        ? "Don't have an account? "
                        : "Already have an account? "}
                      <button
                        onClick={() =>
                          handleModeSwitch(mode === "login" ? "signup" : "login")
                        }
                        className="text-[#ffc929] hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffc929] rounded-sm"
                        disabled={isTransitioning || loading}
                      >
                        {mode === "login" ? "Sign Up" : "Sign In"}
                      </button>
                    </span>
                  </div>
                )}
              </div>
            </div>

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
      </LoadingWrapper>
    </div>
  );
};

export default Auth;