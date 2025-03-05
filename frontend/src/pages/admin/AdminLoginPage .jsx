import React, { useState } from 'react';
import { Mail, Eye, EyeOff, PawPrint, PawPrintIcon } from 'lucide-react';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de connexion à implémenter
    console.log('Tentative de connexion', { email, password });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-xl overflow-hidden w-full max-w-md">
        <div className="bg-gradient-to-r from-[#ffc929] to-pink-500 p-6 flex items-center justify-center">
          <h2 className="text-2xl font-bold text-white">Admin Login</h2>
          <PawPrintIcon className="text-white w-12 h-12 ml-3" />

        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <input 
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-[#ffc929] text-white py-2 rounded-lg hover:bg-[#ffc929] transition duration-300 flex items-center justify-center"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;