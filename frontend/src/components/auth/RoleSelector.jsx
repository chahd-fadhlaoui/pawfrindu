import { CircleDot } from "lucide-react";
import React from "react";
import config from "../../assets/config";

const RoleSelector = ({ selectedRole, setSelectedRole }) => {
  const handleRoleChange = (id) => {
    setSelectedRole(id);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-neutral-900">Choose your role</h3>
      <div className="grid gap-4">
        {config.roles.map(({ id, label, icon: Icon, description, bgColor }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleRoleChange(id)}
            className={`relative p-4 text-left rounded-xl ${config.transitions.baseClasses} overflow-hidden group ${
              selectedRole === id
                ? `bg-gradient-to-r ${bgColor} text-white`
                : "bg-neutral-50 hover:bg-neutral-100"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${selectedRole === id ? "bg-white/20" : "bg-white"}`}>
                <Icon className={`w-6 h-6 ${selectedRole === id ? "text-white" : "text-neutral-600"}`} />
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${selectedRole === id ? "text-white" : "text-neutral-900"}`}>
                  {label}
                </h4>
                <p className={`text-sm ${selectedRole === id ? "text-white/90" : "text-neutral-600"}`}>
                  {description}
                </p>
              </div>
              <CircleDot className={`w-5 h-5 mt-1 transition-opacity ${
                selectedRole === id ? "opacity-100" : "opacity-0"
              }`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;