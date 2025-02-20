import { PawPrint, Plus } from "lucide-react";
import React from "react";

const EmptyState = ({ message, buttonText, buttonAction }) => {

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
      <div className="p-4 mb-4 text-[#ffc929] bg-[#ffc929]/10 rounded-full">
        <PawPrint size={48} />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">No Data Yet</h3>
      <p className="mb-6 text-gray-600">{message}</p>
      <button
        onClick={buttonAction}
        className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-300 transform rounded-lg bg-[#ffc929] hover:bg-[#e6b625] hover:scale-105"
      >
        <Plus size={20} />
        {buttonText || "Add Data"}
      </button>
    </div>
  );
};

export default EmptyState;
