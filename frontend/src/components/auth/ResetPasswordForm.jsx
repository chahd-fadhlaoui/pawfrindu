import React, { useState } from "react";
import { Mail } from "lucide-react";
import InputField from "./InputField";
import { useApp } from "../../context/AppContext";

const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword, clearError } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter your email address");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");
    clearError();

    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setMessage("Password reset instructions have been sent to your email");
        setMessageType("success");
        setEmail(""); // Clear the form on success
      } else {
        setMessage(result.error || "Failed to send reset instructions");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage("An unexpected error occurred. Please try again later.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      <div className="space-y-4">
        <InputField
          icon={Mail}
          type="email"
          placeholder="your@email.com"
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full"
        />
        
        {message && (
          <div 
            className={`p-4 rounded-lg text-sm ${
              messageType === "success" 
                ? "bg-green-50 text-green-600 border border-green-200" 
                : "bg-red-50 text-red-500 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-3 text-white transition-all duration-300 transform rounded-lg bg-[#ffc929] hover:shadow-lg hover:shadow-[#ffc929]/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:ring-offset-2"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending...
            </span>
          ) : (
            "Reset Password"
          )}
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordForm;