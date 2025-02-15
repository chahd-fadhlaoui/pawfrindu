import React from 'react';
import { 
  Users, 
  PawPrint,
  Heart
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => (
  <div className="w-48 bg-amber-50 shadow-lg">
    <div className="p-4 border-b border-amber-100">
      <div className="flex items-center space-x-2">
        <PawPrint className="w-8 h-8 text-pink-500" />
        <span className="text-xl font-bold text-neutral-900 hover:text-pink-500">Pet Admin</span>
      </div>
    </div>
    <nav className="p-4">
      <button
        onClick={() => setActiveTab('users')}
        className={`w-full flex items-center space-x-2 p-3 rounded-xl mb-3 transition-all ${
          activeTab === 'users' 
            ? 'bg-orange-100 text-black' 
            : 'text-amber-700 hover:bg-amber-100/70'
        }`}
      >
        <Users className="w-5 h-5" />
        <span className="font-medium">Utilisateurs</span>
      </button>
      <button
        onClick={() => setActiveTab('pets')}
        className={`w-full flex items-center space-x-2 p-3 rounded-xl transition-all ${
          activeTab === 'pets' 
            ? 'bg-orange-100 text-black'  
            : 'text-amber-700 hover:bg-amber-100/70'
        }`}
      >
        <Heart className="w-5 h-5" />
        <span className="font-medium">Animaux</span>
      </button>
    </nav>
  </div>
);
export default Sidebar;