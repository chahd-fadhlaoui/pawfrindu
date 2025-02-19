import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import InputField from './InputField';

const ResetPasswordConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, clearError, validateResetToken, resetPassword } = useApp();
  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get token from query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setMessage('No reset token provided');
        setMessageType('error');
        setIsValid(false);
        return;
      }

      try {
        const result = await validateResetToken(token);
        if (result.success) {
          setIsValid(true);
          setMessage('');
        } else {
          setMessage('This password reset link is invalid or has expired.');
          setMessageType('error');
          setIsValid(false);
        }
      } catch (err) {
        console.error('Token validation error:', err);
        setMessage('This password reset link is invalid or has expired.');
        setMessageType('error');
        setIsValid(false);
      }
    };
    
    validateToken();
  }, [token, validateResetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setMessage('');
    setMessageType('');

    // Validation
    if (!passwords.password || !passwords.confirmPassword) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return;
    }

    if (passwords.password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resetPassword(token, passwords.password);
      
      if (result.success) {
        setMessage('Password successfully reset! Redirecting to login...');
        setMessageType('success');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setMessage(result.error || 'Failed to reset password');
        setMessageType('error');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to reset password');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-white via-[#ffc929]/5 to-pink-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
          <div className={`p-4 mb-4 rounded-lg ${
            messageType === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
          }`}>
            {message}
          </div>
          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-white transition-all duration-300 transform rounded-lg bg-[#ffc929] hover:shadow-lg hover:shadow-[#ffc929]/25 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:ring-offset-2"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-white via-[#ffc929]/5 to-pink-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Set New Password
        </h2>

        {message && (
          <div className={`p-4 mb-4 rounded-lg text-sm ${
            messageType === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            placeholder="New Password"
            label="New Password"
            value={passwords.password}
            onChange={(e) => setPasswords(prev => ({ ...prev, password: e.target.value }))}
            required
            endIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />

          <InputField
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm New Password"
            label="Confirm New Password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 text-white transition-all duration-300 transform rounded-lg bg-[#ffc929] hover:shadow-lg hover:shadow-[#ffc929]/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#ffc929] focus:ring-offset-2"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Resetting...
              </span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordConfirmation;