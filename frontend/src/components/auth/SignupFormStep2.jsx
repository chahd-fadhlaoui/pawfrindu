import { Building2, MapPin, Phone } from "lucide-react";
import React from "react";
import InputField from "./InputField";
const SignupFormStep2 = () => (
    <div className="space-y-4">
      <InputField
        icon={Building2}
        type="text"
        placeholder="License number"
        label="Professional License"
      />
      <InputField
        icon={Phone}
        type="tel"
        placeholder="Your contact number"
        label="Phone Number"
      />
      <InputField
        icon={MapPin}
        type="text"
        placeholder="Your practice address"
        label="Practice Location"
      />
    </div>
  );
  export default SignupFormStep2;