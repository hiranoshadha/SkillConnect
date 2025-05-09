import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);
    

    try {
      const { success, error, user } = await login({
        email: formData.email,
        password: formData.password
      });

      if (success) {
        console.log('User logged in:', user);
        if (user && user.role === "ADMIN") {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      } else {
        setLoginError(error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setLoginError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-blue-900 p-4">
      <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <Link to="/" className="inline-block group">
          <div className="flex flex-col items-center space-y-3 transform transition-transform hover:scale-105 duration-300">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse-slow shadow-lg">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-400 animate-bounce shadow-md"></div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="relative overflow-hidden">
                <span className="text-3xl font-bold flex">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse-slow transform hover:translate-y-1 transition-transform duration-300">
                    Skill
                  </span>
                  <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent animate-pulse-slow transform hover:translate-y-1 transition-transform duration-300" style={{ animationDelay: '1s' }}>
                    Sync
                  </span>
                </span>
                <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 transform translate-y-0.5 rounded-full animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>
          </div>
        </Link>
        
        <div className="mt-8 space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Welcome <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Back</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Sign in to continue your learning journey and connect with your community
          </p>
          <div className="flex justify-center space-x-2">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-600 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
            <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>
      </div>

        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl backdrop-blur-sm backdrop-filter bg-opacity-80 dark:bg-opacity-80 p-8 border border-gray-200 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-slate-700 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-slate-700 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Forgot your password?
                </a>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-700 transition-all duration-200 transform hover:scale-[1.02]"
    >
    Sign in
    </button>
    </div>
    </form>


    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>
      
      <div className="mt-6">
        <a 
          href="https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http://localhost:8080/api/users/oauth2&response_type=code&client_id=920716417496-4epc3rpf8vogsvupksrrbm72mlgqkolm.apps.googleusercontent.com&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&access_type=offline" 
          className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm bg-white dark:bg-slate-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
          </svg>
          Sign in with Google
        </a>
      </div>
    </div>

    </div>
    
    <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
      Not a member?{' '}
      <Link to="/" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
        Sign up now
      </Link>
    </p>
  </div>
</div>
);
};

export default Login;
