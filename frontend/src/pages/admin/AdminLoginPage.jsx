import React, { useState } from 'react';
import { Mail, Eye, EyeOff, PawPrint, LogIn } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useApp();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { email, password } = credentials;
      const result = await login(email, password);
      
      if (result.success) {
        if (result.redirectTo === "/admin") {
          navigate('/admin');
        } else {
          setError("Only administrators can login here.");
        }
      } else {
        setError(result.error || "Invalid credentials");
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-yellow-50 to-pink-50">
      <div className="w-full max-w-md overflow-hidden bg-white shadow-lg rounded-xl">
        <div className="p-6 bg-gradient-to-r from-yellow-500 to-pink-500">
          <div className="flex items-center justify-center">
            <PawPrint className="w-10 h-10 mr-3 text-white" />
            <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-700 border border-red-200 rounded bg-red-50">
              <p className="font-medium text-center">{error}</p>
            </div>
          )}
          
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input 
                type="email" 
                id="email"
                value={credentials.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <input 
                type={showPassword ? "text" : "password"}
                id="password"
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center w-full px-4 py-3 space-x-2 text-white transition duration-300 rounded-lg bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 disabled:opacity-70"
          >
            {isLoading ? (
              <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <LogIn size={20} />
                <span>Sign In</span>
              </>
            )}
          </button>
          
          <div className="pt-2 text-sm text-center text-gray-500">
            <a href="/forgot-password" className="text-pink-600 transition duration-200 hover:text-pink-800">
              Forgot password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;