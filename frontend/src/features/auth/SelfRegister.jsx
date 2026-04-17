import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button, Input, Label } from '@/components/ui';
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const SelfRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  // Clear form when component mounts to prevent old data from showing
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    });
    setEmailExists(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.name) {
      toast.error('Email, password, and name are required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Attempting self-registration with:', { email: formData.email, name: formData.name });
      
      const response = await api.post('/auth/self-register', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        name: formData.name.trim(),
      });

      console.log('Registration response:', response.data);

      if (response.data.success && response.data.token) {
        const { token, alumni, user } = response.data;
        const alumniData = alumni || user;
        
        // Login the user immediately
        auth.login(token, alumniData);
        
        toast.success('Account created successfully! Welcome to AluVerse!');

        // Redirect to profile completion
        setTimeout(() => {
          navigate('/complete-profile', { replace: true });
        }, 500);
      } else {
        toast.error(response.data.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create account';
      
      // Check if email already exists
      if (errorMsg.includes('Email already registered') || errorMsg.includes('already')) {
        setEmailExists(true);
        toast.error('Email already registered');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-950 p-3 py-6 sm:p-4 sm:py-0">
      <Card className="w-full max-w-md max-h-screen overflow-y-auto sm:max-h-none sm:overflow-y-visible shadow-2xl border-blue-800/50">
        <CardHeader className="space-y-1 sm:space-y-2 p-4 sm:p-6 bg-gradient-to-r from-blue-900 to-blue-950 text-white rounded-t-lg border-b border-blue-800/50">
          <div className="flex items-center justify-center space-x-2 mb-2 sm:mb-3">
            <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="text-xl sm:text-2xl font-bold">AluVerse</span>
          </div>
          <CardTitle className="text-lg sm:text-xl text-center">Self Register</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-center text-blue-100">Create your alumni account</CardDescription>
        </CardHeader>

        <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6 bg-gradient-to-b from-slate-50 to-white">
          {emailExists && (
            <div className="mb-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs sm:text-sm text-amber-800 font-medium">
                📧 This email is already registered. 
              </p>
              <p className="text-xs text-amber-700 mt-2">
                Please use a different email or{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-semibold text-amber-900 hover:underline"
                >
                  sign in instead
                </button>
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" autoComplete="off">
            {/* Name */}
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm font-medium">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={loading}
                  className="pl-10 text-xs sm:text-sm"
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={loading}
                  className="pl-10 text-xs sm:text-sm"
                  autoComplete="off"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">This will be your login email</p>
            </div>

            {/* Password */}
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={loading}
                  className="pl-10 pr-10 text-xs sm:text-sm"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={loading}
                  className="pl-10 pr-10 text-xs sm:text-sm"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-blue-900 to-blue-950 hover:from-blue-800 hover:to-blue-900 text-white font-semibold text-sm sm:text-base h-10 sm:h-11 shadow-lg"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-blue-200"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 bg-gradient-to-b from-slate-50 to-white text-gray-600 font-medium">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Button
            onClick={() => navigate('/login')}
            variant="outline"
            className="w-full text-sm sm:text-base border-blue-900 text-blue-900 hover:bg-blue-50 font-medium"
            disabled={loading}
          >
            Sign In Instead
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelfRegister;
