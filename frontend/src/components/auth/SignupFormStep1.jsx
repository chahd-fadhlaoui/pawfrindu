import React from "react";
import InputField from "./InputField";
import { Lock, Mail, User } from "lucide-react";
const SignupFormStep1 = ({ showPassword, onTogglePassword }) => (
  <div className="space-y-4">
    <InputField
      icon={User}
      type="text"
      placeholder="John Doe"
      label="Full Name"
    />
    <InputField
      icon={Mail}
      type="email"
      placeholder="your@email.com"
      label="Email"
    />
    <InputField
      icon={Lock}
      type={showPassword ? "text" : "password"}
      placeholder="••••••••"
      label="Password"
      showPassword={showPassword}
      onTogglePassword={onTogglePassword}
    />
  </div>
);
export default SignupFormStep1;
