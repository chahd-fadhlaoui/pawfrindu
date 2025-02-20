import { Loader2, Lock, Mail, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import InputField from './InputField';

const SignupFormStep1 = ({ showPassword, onTogglePassword, onValidationChange, isLoading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          error = 'Full name is required';
        } else if (value.trim().length < 2) {
          error = 'Full name must be at least 2 characters';
        }
        break;

      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])/.test(value)) {
          error = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(value)) {
          error = 'Password must contain at least one number';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (field) => (e) => {
    if (isLoading) return; // Prevent changes while loading
    
    const value = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    setErrors(prev => ({
      ...prev,
      [field]: validateField(field, value)
    }));
  };

  useEffect(() => {
    // Check if all fields are filled and valid
    const isFormFilled = Object.values(formData).every(value => value.trim() !== '');
    const isFormValid = Object.values(errors).every(error => error === '');

    // If all validations pass, notify parent component
    if (onValidationChange) {
      onValidationChange(isFormFilled && isFormValid, formData);
    }
  }, [formData, errors]);

  return (
    <div className="space-y-4">
      <InputField
        icon={User}
        type="text"
        placeholder="Your Full Name"
        label="Full Name"
        value={formData.fullName}
        onChange={handleChange('fullName')}
        error={errors.fullName}
        disabled={isLoading}
      />

      <InputField
        icon={Mail}
        type="email"
        placeholder="your@email.com"
        label="Email"
        value={formData.email}
        onChange={handleChange('email')}
        error={errors.email}
        disabled={isLoading}
      />

      <InputField
        icon={Lock}
        type="password"
        placeholder="••••••••"
        label="Password"
        value={formData.password}
        onChange={handleChange('password')}
        error={errors.password}
        disabled={isLoading}
      />

      <InputField
        icon={Lock}
        type="password"
        placeholder="••••••••"
        label="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={errors.confirmPassword}
        disabled={isLoading}
      />

      {isLoading && (
        <div className="flex items-center justify-center text-[#ffc929]">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default SignupFormStep1;