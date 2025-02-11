import React, { useState, useEffect } from "react";
import LoginForm from "../components/auth/LoginForm";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";
import RoleSelector from "../components/auth/RoleSelector";
import SignupFormStep1 from "../components/auth/SignupFormStep1";
import SignupFormStep2 from "../components/auth/SignupFormStep2";
import FormHeader from "../components/ui/FormHeader";
import NavigationButtons from "../components/ui/NavigationButtons";
import ProgressIndicator from "../components/ui/ProgressIndicator";
import RightPanel from "../components/ui/RightPanel";

const Login = () => {
  const [mode, setMode] = useState("login");
  const [selectedRole, setSelectedRole] = useState("pet-owner");
  const [showPassword, setShowPassword] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const getFormClasses = () => {
    const baseClasses = "w-full md:w-1/2 transition-transform duration-500 ease-out";
    return `${baseClasses} ${
      mode === "signup" ? "order-last" : ""
    }`;
  };

  const getPanelClasses = () => {
    return "w-full md:w-1/2 transition-transform duration-500 ease-out";
  };

  const handleModeSwitch = (newMode) => {
    if (isTransitioning || mode === newMode) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setMode(newMode);
      setFormStep(0);
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
      <div className="container flex items-center justify-center min-h-screen p-4 mx-auto">
        <div className="relative w-full max-w-5xl overflow-hidden bg-white shadow-xl rounded-2xl">
          <div className="flex flex-col md:flex-row h-[700px] md:h-[600px]">
            {/* Form Container */}
            <div className={getFormClasses()}>
              <div className="h-full p-8 overflow-y-auto">
                <FormHeader mode={mode} />
                {mode === "signup" && <ProgressIndicator formStep={formStep} />}
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  {mode === "login" && (
                    <LoginForm handleModeSwitch={handleModeSwitch} />
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
                          onTogglePassword={() => setShowPassword(!showPassword)}
                        />
                      )}
                      {formStep === 2 && selectedRole !== "pet-owner" && (
                        <SignupFormStep2 />
                      )}
                      <NavigationButtons
                        formStep={formStep}
                        setFormStep={setFormStep}
                        selectedRole={selectedRole}
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
            <div className={getPanelClasses()}>
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