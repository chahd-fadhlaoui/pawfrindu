import React from "react";
import InputField from "./InputField";
import { Mail } from "lucide-react";
const ResetPasswordForm = () => (
    <>
      <InputField
        icon={Mail}
        type="email"
        placeholder="your@email.com"
        label="Email Address"
      />
      <button className="w-full py-2 text-white transition-all duration-300 transform rounded-lg bg-[#ffc929] hover:shadow-lg hover:shadow-[#ffc929]/25 hover:-translate-y-0.5">
        Reset Password
      </button>
    </>
  );
  export default ResetPasswordForm;
