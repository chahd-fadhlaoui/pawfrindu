import React, { useEffect, useState } from 'react';
import Sidebar from "../../components/admin/Sidebar";
import SearchBar from "../../components/admin/SearchBar";
import UsersTable from "../../components/admin/UsersTable";
import PetsTable from "../../components/admin/PetsTable";
import ArchivedPetsTable from "../../components/admin/ArchivedPetsTable"; // Nouveau composant
import { useApp } from "../../context/AppContext";
import axiosInstance from "../../utils/axiosInstance";

const AdminDashboard = () => {
  const { pets, fetchPets } = useApp();
  const [activeTab, setActiveTab] = useState('pets');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching users...');
      const response = await axiosInstance.get('/api/user/getAllUsers');
      
      console.log('API Response:', response);
      
      if (!response.data) {
        throw new Error('No data received from API');
      }
      
      const userData = Array.isArray(response.data) ? response.data : 
                      Array.isArray(response.data.users) ? response.data.users : [];
      
      console.log('Processed users data:', userData);
      setUsers(userData);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      setError('Failed to fetch users: ' + errorMessage);
      console.error('Error fetching users:', {
        error: err,
        response: err.response,
        message: errorMessage
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (activeTab === 'pets' && Array.isArray(pets)) {
        const filtered = pets.filter(pet => 
          !pet.isArchived && // Exclure les pets archivés dans l'onglet "Pets"
          ((pet.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (pet.breed || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (pet.city || '').toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredData(filtered);
      } else if (activeTab === 'archived' && Array.isArray(pets)) {
        const filtered = pets.filter(pet => 
          pet.isArchived && // Inclure uniquement les pets archivés dans l'onglet "Archived"
          ((pet.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (pet.breed || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (pet.city || '').toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredData(filtered);
      } else if (activeTab === 'users' && Array.isArray(users)) {
        const filtered = users.filter(user =>
          (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.role || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredData(filtered);
      } else {
        setFilteredData([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, pets, users, activeTab]);

  const getCurrentData = () => {
    if (loading) return [];
    return filteredData.length > 0 ? filteredData : (activeTab === 'users' ? users : pets) || [];
  };

  return (
    <div className="flex h-screen bg-amber-50/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 hover:text-[#ffc929]">
              {activeTab === 'users' ? 'Gestion des Utilisateurs' : 
               activeTab === 'pets' ? 'Gestion des Animaux' : 
               'Animaux Archivés'}
            </h1>
            <p className="text-amber-700">
              {activeTab === 'users'
                ? 'Gérez les utilisateurs de la plateforme'
                : activeTab === 'pets' 
                ? 'Gérez les profils des animaux en attente d\'adoption'
                : 'Visualisez et gérez les animaux archivés'}
            </p>
          </div>

          <div className="mb-6">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === 'users' ? 'Rechercher un utilisateur...' : 
                activeTab === 'pets' ? 'Rechercher un animal...' : 
                'Rechercher un animal archivé...'
              }
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border-2 border-amber-100">
            {activeTab === 'users' ? (
              <UsersTable 
                users={getCurrentData()} 
                loading={loading}
                error={error}
              />
            ) : activeTab === 'pets' ? (
              <PetsTable pets={getCurrentData()} />
            ) : (
              <ArchivedPetsTable pets={getCurrentData()} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;