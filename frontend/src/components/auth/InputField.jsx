import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

const InputField = ({ icon: Icon, type, placeholder, label, value, onChange, error }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      <div className="relative group">
        <Icon className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-neutral-400 transition-colors group-focus-within:text-[#ffc929]" />
        <input
          type={inputType}
          className="w-full px-10 py-2 transition-all duration-300 border rounded-lg outline-none focus:border-[#ffc929] focus:ring-2 focus:ring-[#ffc929]/20"
          placeholder={placeholder}
          value={value} 
          onChange={onChange}  
        />
        {type === "password" && (
          <button
            type="button"
            onClick={handleTogglePassword}
            className="absolute transform -translate-y-1/2 right-3 top-1/2"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 text-neutral-400 hover:text-neutral-600" />
            ) : (
              <Eye className="w-5 h-5 text-neutral-400 hover:text-neutral-600" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};


export default InputField;