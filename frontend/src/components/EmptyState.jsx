import { PawPrint, Plus } from "lucide-react";
import React from "react";

const EmptyState = ({ message, buttonText, buttonAction, disabled }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl shadow-lg border-2 border-[#ffc929]/20 min-h-[50vh]">
    <PawPrint size={64} className="mb-6 text-[#ffc929] animate-bounce" />
    <h3 className="mb-2 text-xl font-semibold text-gray-800">No Posts Yet</h3>
    <p className="max-w-md mb-6 text-gray-600">{message}</p>
    <button
      onClick={buttonAction}
      className="flex items-center gap-2 px-6 py-2.5 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
      disabled={disabled}
    >
      <Plus size={20} />
      {buttonText || "Add Your First Pet"}
    </button>
  </div>
);

export default EmptyState;