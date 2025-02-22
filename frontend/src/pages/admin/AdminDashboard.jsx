import React, { useEffect, useState } from 'react';
import Sidebar from "../../components/admin/Sidebar";
import SearchBar from "../../components/admin/SearchBar";
import UsersTable from "../../components/admin/UsersTable";
import PetsTable from "../../components/admin/PetsTable";
import { useApp } from "../../context/AppContext";
import axiosInstance from "../../utils/axiosInstance";

const AdminDashboard = () => {
  const { pets, fetchPets, updatePet } = useApp();
  const [activeTab, setActiveTab] = useState('pets');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch pets when component mounts
  useEffect(() => {
    fetchPets();
  }, []);

  // Fetch users when needed
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching users...');
      const response = await axiosInstance.get('/api/user/getAllUsers');
      
      // Log the response to see what we're getting
      console.log('API Response:', response);
      
      if (!response.data) {
        throw new Error('No data received from API');
      }
      
      // Ensure we have an array, even if empty
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

  // Fetch users when switching to users tab
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // Handle search functionality with debouncing
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (activeTab === 'pets' && Array.isArray(pets)) {
        const filtered = pets.filter(pet => 
          (pet.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (pet.race || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (pet.city || '').toLowerCase().includes(searchTerm.toLowerCase())
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
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, pets, users, activeTab]);

  // Handle pet acceptance
  const handleAccept = async (petId) => {
    try {
      await updatePet(petId, { status: 'accepted' });
      fetchPets();
    } catch (error) {
      console.error('Error accepting pet:', error);
    }
  };

  // Handle pet rejection
  const handleReject = async (petId) => {
    try {
      await updatePet(petId, { status: 'rejected' });
      fetchPets();
    } catch (error) {
      console.error('Error rejecting pet:', error);
    }
  };

  // Get the current data to display
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
              {activeTab === 'users' ? 'Gestion des Utilisateurs' : 'Gestion des Animaux'}
            </h1>
            <p className="text-amber-700">
              {activeTab === 'users'
                ? 'Gérez les utilisateurs de la plateforme'
                : 'Gérez les profils des animaux en attente d\'adoption'}
            </p>
          </div>

          <div className="mb-6">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeTab === 'users' ? 'Rechercher un utilisateur...' : 'Rechercher un animal...'}
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
            ) : (
              <PetsTable
                pets={getCurrentData()}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;