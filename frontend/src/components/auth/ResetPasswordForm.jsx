import React, { useState, useCallback } from "react";
import { Loader2, Mail } from "lucide-react";
import InputField from "./InputField";
import { useApp } from "../../context/AppContext";

const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword, clearError } = useApp();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!email.trim()) {
      setMessage({
        text: "Please enter your email address",
        type: "error"
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({
        text: "Please enter a valid email address",
        type: "error"
      });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "", type: "" });
    clearError();

    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setMessage({
          text: "Password reset instructions have been sent to your email",
          type: "success"
        });
        setEmail("");
      } else {
        setMessage({
          text: result.error || "Failed to send reset instructions",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage({
        text: "An unexpected error occurred. Please try again later.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  }, [email, forgotPassword, clearError]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
          disabled={isLoading}
          className="w-full transition-all duration-300"
          aria-label="Email address for password reset"
        />
        
        {message.text && (
          <div 
            role="alert"
            className={`p-4 rounded-lg text-sm transition-all duration-300 transform ${
              message.type === "success" 
                ? "bg-green-50 text-green-600 border border-green-200" 
                : "bg-red-50 text-red-500 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <button 
          type="submit"
          disabled={isLoading}
          className={`
            w-full py-3 text-white font-medium
            transition-all duration-300 transform rounded-lg
            bg-[#ffc929]
            hover:shadow-lg hover:shadow-[#ffc929]/25 
            hover:-translate-y-0.5 
            disabled:opacity-50 disabled:cursor-not-allowed 
            disabled:hover:translate-y-0 disabled:hover:shadow-none
            focus:outline-none focus:ring-2 focus:ring-[#ffc929] 
            focus:ring-offset-2
          `}
          aria-disabled={isLoading}
        >
          <span className="flex items-center justify-center">
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              "Reset Password"
            )}
          </span>
        </button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;