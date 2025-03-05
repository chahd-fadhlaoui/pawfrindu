import React, { useState } from "react";
import ActivePets from "./ActivePets";
import ArchivedPets from "./ArchivedPets";
import MyPets from "./MyPets.jsx"; 

const PetsManagement = ({ onPetChange }) => {
  const [activeSubTab, setActiveSubTab] = useState("active");

  return (
    <div className="space-y-4">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab("active")}
          className={`px-6 py-3 font-medium ${activeSubTab === "active" ? "border-b-2 border-[#ffc929] text-[#ffc929]" : "text-gray-600 hover:text-[#ffc929]"}`}
        >
          Active Pets
        </button>
        <button
          onClick={() => setActiveSubTab("archived")}
          className={`px-6 py-3 font-medium ${activeSubTab === "archived" ? "border-b-2 border-[#ffc929] text-[#ffc929]" : "text-gray-600 hover:text-[#ffc929]"}`}
        >
          Archived Pets
        </button>
        <button
          onClick={() => setActiveSubTab("myPets")}
          className={`px-6 py-3 font-medium ${activeSubTab === "myPets" ? "border-b-2 border-[#ffc929] text-[#ffc929]" : "text-gray-600 hover:text-[#ffc929]"}`}
        >
          My Pets
        </button>
      </div>
      {activeSubTab === "active" && <ActivePets onPetChange={onPetChange} />}
      {activeSubTab === "archived" && <ArchivedPets onPetChange={onPetChange} />}
      {activeSubTab === "myPets" && <MyPets onPetChange={onPetChange} />}
    </div>
  );
};

export default PetsManagement;