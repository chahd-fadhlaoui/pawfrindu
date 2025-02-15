import React, { useContext, useState } from 'react';
import Sidebar from "../../components/admin/Sidebar";
import SearchBar from "../../components/admin/SearchBar";
import UsersTable from "../../components/admin/UsersTable";
import PetsTable from "../../components/admin/PetsTable";
import { AppContext } from "../../context/AppContext";

const AdminDashboard = () => {
  const { pets, currencySymbol } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('pets');

  const users = [
    { fullName: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { fullName: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  ];

  return (
    <div className="flex h-screen bg-amber-50/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold  text-neutral-900 hover:text-[#ffc929]">
              {activeTab === 'users' ? 'Gestion des Utilisateurs' : 'Gestion des Animaux'}
            </h1>
            <p className="text-amber-700">
              {activeTab === 'users'
                ? 'Gérez les utilisateurs de la plateforme'
                : 'Gérez les profils des animaux en attente d\'adoption'}
            </p>
          </div>

          <div className="mb-6">
            <SearchBar />
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-amber-100">
            {activeTab === 'users'
              ? <UsersTable users={users} />
              : <PetsTable
                  pets={pets}
                  onAccept={(id) => console.log('Accepted:', id)}
                  onReject={(id) => console.log('Rejected:', id)}
                />
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;