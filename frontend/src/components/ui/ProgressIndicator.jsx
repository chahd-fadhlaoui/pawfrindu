import React from "react";
import config from "../../assets/config";

const ProgressIndicator = ({ formStep }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {[0, 1, 2].map((step) => (
      <div
        key={step}
        className={`w-2 h-2 rounded-full ${config.transitions.baseClasses} ${
          formStep === step
            ? "bg-[#ffc929] w-8"
            : formStep > step
            ? "bg-[#ffc929]"
            : "bg-neutral-200"
        }`}
      />
    ))}
  </div>
);

export default ProgressIndicator;