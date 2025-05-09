import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { KeyIcon, FingerPrintIcon } from '@heroicons/react/outline';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Autofocus first field on load
  useEffect(() => {
    const firstInput = document.getElementById('firstName');
    if (firstInput) firstInput.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    } else if (step === 2) {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.includes(' ')) {
        newErrors.username = 'Username cannot contain spaces';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'You must accept the terms and conditions';
      }
    }

    return newErrors;
  };

  const handleNextStep = () => {
    const validationErrors = validateStep(currentStep);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setCurrentStep(prev => prev + 1);
    
    // Autofocus first field of next step
    setTimeout(() => {
      const firstInput = document.getElementById(currentStep === 1 ? 'username' : 'firstName');
      if (firstInput) firstInput.focus();
    }, 100);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const validateForm = () => {
    const step1Errors = validateStep(1);
    const step2Errors = validateStep(2);
    return { ...step1Errors, ...step2Errors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    // Format the user data to match the server's expected structure
    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      bio: '',
      profileImage: null,
      role: 'USER'
    };

    // Register the user
    const result = await register(userData);
    
    setIsSubmitting(false);
    
    if (result.success) {
      // Registration successful
      navigate('/login');
    } else {
      // Handle registration error
      setErrors(prev => ({
        ...prev,
        form: result.error
      }));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative panel with 3D elements */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-center h-full text-white">
          <div className="mb-12">
            <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
              <span className="text-white font-bold text-4xl">S</span>
            </div>
            <h1 className="text-5xl font-extrabold mb-4">SkillSync</h1>
            <p className="text-xl text-white/80 max-w-md">Join our community of learners and start your personalized learning journey today.</p>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md"></div>
              <div>
                <p className="font-medium">Alex Johnson</p>
                <p className="text-sm text-white/70">"SkillSync helped me master new skills in just weeks!"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-10 lg:hidden">
            <Link to="/" className="inline-block">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SkillSync</span>
              </h1>
            </Link>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create your account</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Join our community of learners</p>
          
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-gray-400'}`}>
                  1
                </div>
                <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">Personal</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-gray-400'}`}>
                  2
                </div>
                <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">Account</span>
              </div>
            </div>
          </div>
          
          {errors.form && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
              {errors.form}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-4 py-3 border ${errors.firstName ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-slate-600'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-slate-800 dark:text-white`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-4 py-3 border ${errors.lastName ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-slate-600'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-slate-800 dark:text-white`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-4 py-3 border ${errors.email ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-slate-600'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-slate-800 dark:text-white`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}
            
            {/* Step 2: Account Information */}
            {currentStep === 2 && (
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-4 py-3 border ${errors.username ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-slate-600'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-slate-800 dark:text-white`}
                    placeholder="johndoe"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-4 py-3 border ${errors.password ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-slate-600'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-slate-800 dark:text-white`}
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-slate-600'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-slate-800 dark:text-white`}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${errors.acceptTerms ? 'border-red-300' : ''}`}
                  />
                  <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    I accept the <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">Terms and Conditions</a>
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.acceptTerms}</p>
                )}
                
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="w-1/3 flex justify-center py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : 'Create Account'}
                  </button>
                </div>
              </>
            )}
            
            {/* Alternative sign-up methods */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <a 
                  href="https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http://localhost:8080/api/users/oauth2&response_type=code&client_id=920716417496-4epc3rpf8vogsvupksrrbm72mlgqkolm.apps.googleusercontent.com&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&access_type=offline"
                  className="flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-slate-700 rounded-xl shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                  </svg>
                  Google
                </a>
                
                <button 
                  className="flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-slate-700 rounded-xl shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200"
                >
                  <KeyIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Biometric
                </button>
              </div>
            </div>
          </form>
          
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
