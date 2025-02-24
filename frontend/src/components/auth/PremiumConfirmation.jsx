// components/auth/PremiumConfirmation.jsx
import React from "react";

const PremiumConfirmation = ({ selectedRole }) => {
  // Define premium roles and costs
  const rolePricing = {
    "pet-owner": { isFree: true, cost: 0 },
    "trainer": { isFree: false, cost: 19.99 }, // Example cost in Dt
    "veterinaire": { isFree: false, cost: 29.99 }, // Example cost in Dt
  };

  const roleName = selectedRole === "trainer" ? "Trainer" : "Vet";

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-neutral-900">
        Premium Role Subscription
      </h4>
      <p className="text-sm text-neutral-600">
        You've selected a premium role: <span className="font-medium">{roleName}</span>. 
        This role requires a subscription to access premium features.
      </p>
      <div className="p-4 bg-[#ffc929]/10 rounded-lg border border-[#ffc929]/20">
        <p className="text-sm text-neutral-800">
          Cost: <span className="font-semibold">Dt {rolePricing[selectedRole].cost}</span> per month
        </p>
        <p className="mt-1 text-xs text-neutral-600">
          Billed monthly. Cancel anytime.
        </p>
      </div>
      <p className="text-sm text-neutral-600">
        Confirm to proceed with signup and payment details.
      </p>
    </div>
  );
};

export default PremiumConfirmation;