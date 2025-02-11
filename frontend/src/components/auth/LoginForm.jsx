import React, { useState } from "react";
import InputField from "./InputField";
import { Mail, Lock } from "lucide-react";

const LoginForm = ({ handleModeSwitch, onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value) ? '' : 'Invalid email address');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(validatePassword(e.target.value) ? '' : 'Password must be at least 8 characters long');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailError && !passwordError && !isSubmitting) {
      setIsSubmitting(true);
      onLogin(email, password)
        .then(() => {
          setIsSubmitting(false);
        })
        .catch((error) => {
          setIsSubmitting(false);
          console.error(error);
        });
    }
  };

  return (
    <>
      <InputField
        icon={Mail}
        type="email"
        placeholder="your@email.com"
        label="Email"
        value={email}
        onChange={handleEmailChange}
        error={emailError}
      />
      <InputField
        icon={Lock}
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        label="Password"
        value={password}
        onChange={handlePasswordChange}
        error={passwordError}
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword(!showPassword)}
      />
      <div className="flex items-center justify-between">
        <button
          onClick={() => handleModeSwitch("forgetPassword")}
          className="text-sm text-[#ffc929] hover:underline"
        >
          Forgot Password?
        </button>
      </div>
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`w-full py-2 text-white transition-all duration-300 transform rounded-lg bg-[#ffc929] hover:shadow-lg hover:shadow-[#ffc929]/25 hover:-translate-y-0.5 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? 'Signing In...' : 'Sign In'}
      </button>
    </>
  );
};

export default LoginForm;
