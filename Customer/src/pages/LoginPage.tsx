import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Smartphone, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/UI/Button';
import OTPLogin from '../components/Auth/OTPLogin';
import ForgotPassword from '../components/Auth/ForgotPassword';
import { api } from '../services/api';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'email' | 'otp' | 'forgot'>('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const { dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!formData.email || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    if (!isLogin && (!formData.name || !formData.phone)) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (isLogin) {
        // Login
        const { user, token } = await api.login(formData.email, formData.password);
        localStorage.setItem('token', token);
        dispatch({ type: 'LOGIN', payload: user });
        navigate(redirectTo);
      } else {
        // Register
        const { user, token } = await api.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        });
        localStorage.setItem('token', token);
        dispatch({ type: 'LOGIN', payload: user });
        navigate(redirectTo);
      }
    } catch (error: any) {
      alert(error.message || 'Authentication failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOTPSuccess = (user: any) => {
    // Convert OTP user to app user format
    const appUser = {
      id: user.id,
      name: user.user_metadata?.name || 'OTP User',
      email: user.email,
      phone: user.user_metadata?.phone || '',
      addresses: [],
      favorites: [],
    };

    dispatch({ type: 'LOGIN', payload: appUser });
    navigate(redirectTo);
  };

  const handleForgotPasswordSuccess = () => {
    setAuthMode('email');
    // Show success message or redirect
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6 space-y-3">
          <div className="relative h-20 w-20 flex items-center justify-center">
            <img
              src="/SR logo.png"
              alt="SR FoodKraft Logo"
              className="h-20 w-20 object-contain"
              style={{ transform: 'scale(1.8)' }}
            />
          </div>
          <div className="text-center">
            <h1 className="font-playfair text-3xl font-bold text-gray-900">
              SR FoodKraft
            </h1>
            <p className="text-sm text-gray-700 font-inter font-medium">Premium Catering</p>
          </div>
        </div>
        <h2 className="text-center text-2xl font-poppins font-bold text-black-700">
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-inter">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-gold hover:text-yellow-500"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
        {isLogin && (
          <p className="mt-2 text-center text-xs text-gray-500 font-inter">
            Demo: demo@srfoodkraft.com / demo123
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Authentication Mode Selector */}
          {authMode === 'email' && isLogin && (
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAuthMode('email')}
                  className={`flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${authMode === 'email'
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </button>
                <button
                  onClick={() => setAuthMode('otp')}
                  className={`flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${authMode === 'otp'
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  OTP
                </button>
              </div>
            </div>
          )}

          {/* OTP Login */}
          {authMode === 'otp' && (
            <OTPLogin
              onBack={() => setAuthMode('email')}
              onSuccess={handleOTPSuccess}
            />
          )}

          {/* Forgot Password */}
          {authMode === 'forgot' && (
            <ForgotPassword
              onBack={() => setAuthMode('email')}
              onSuccess={handleForgotPasswordSuccess}
            />
          )}

          {/* Email/Password Login */}
          {authMode === 'email' && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required={!isLogin}
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full" size="lg">
                  {isLogin ? 'Sign in' : 'Create account'}
                </Button>
              </div>

              {/* Forgot Password Link */}
              {isLogin && (
                <div className="text-center">
                  <button
                    onClick={() => setAuthMode('forgot')}
                    className="text-sm text-gold hover:text-yellow-500 font-medium"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </form>
          )}

        </div>
      </div>
    </div>
  );
}