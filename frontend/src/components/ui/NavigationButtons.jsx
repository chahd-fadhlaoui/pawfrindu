import { ArrowRight } from "lucide-react";
import React from "react";
const NavigationButtons = ({ formStep, setFormStep, selectedRole }) => (
  <div className="flex gap-3">
    {formStep > 0 && (
      <button
        onClick={() => setFormStep(formStep - 1)}
        className="flex items-center justify-center flex-1 gap-2 px-4 py-2 transition-all duration-300 transform border rounded-lg text-neutral-600 hover:bg-neutral-50"
      >
        Back
      </button>
    )}
    <button
      onClick={() => {
        if (formStep < (selectedRole === "pet-owner" ? 1 : 2)) {
          setFormStep(formStep + 1);
        }
      }}
      className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white transition-all duration-300 transform rounded-lg bg-[#ffc929] hover:shadow-lg hover:shadow-[#ffc929]/25 hover:-translate-y-0.5"
    >
      {formStep === (selectedRole === "pet-owner" ? 1 : 2) ? "Create Account" : "Continue"}
      <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

export default NavigationButtons;
