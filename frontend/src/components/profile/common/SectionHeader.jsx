import React from "react";

export const SectionHeader = ({ title, icon: Icon, description }) => (
  <div className="flex items-center gap-3 pb-3 border-b border-[#ffc929]/30">
    <div className="p-2.5 bg-[#ffc929]/10 rounded-full">
      <Icon size={24} className="text-[#ffc929]" />
    </div>
    <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
    <p className="text-sm text-gray-600">
      Required fields are marked with <span className="text-red-500">*</span>
    </p>
  </div>
);