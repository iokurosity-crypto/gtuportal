import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/axios';
import { showError, clearErrors } from '@/components/ErrorDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button, Input, Label } from '@/components/ui';
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Professional Login Page
 * 
 * FLOW:
 * Type 1 (CSV Alumni):
 *   - Has temporaryPassword, NO permanentPassword (passwordHash=null)
 *   - If they try to enter permanent password here → "Invalid password"
 *   - They need to first verify temp password on separate page
 *   - Backend returns: { requiresPasswordSetup: true } → REDIRECT to /verify-temp-password
 * 
 * Type 2 (Self-Registered) or Type 1 After Setup:
 *   - Has permanentPassword only (temporaryPassword deleted)
 *   - Can login here with their permanent password
 *   - Redirects to /complete-profile or /profile/me
 */

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (location.state?.email) {
      setFormData((prev) => ({
        ...prev,
        email: location.state.email
      }));
    }

    // Pre-fill temporary password if provided from signup flow
    if (location.state?.tempPassword) {
      setFormData((prev) => ({
        ...prev,
        password: location.state.tempPassword
      }));
      toast.success(`Temporary password auto-filled! Just click Login.`);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();
    
    if (!formData.email || !formData.password) {
      showError('Please fill all fields');
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 [LOGIN] Attempting login with email:', formData.email);
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      console.log('✅ [LOGIN] Response:', response.data);

      // ✅ CASE: User has permanent password, login successful
      if (response.data.success) {
        const { token, alumni, isProfileComplete, requiresPasswordSetup } = response.data;
        
        auth.login(token, alumni);

        // 🔑 SPECIAL CASE: Temp password detected, needs verification first
        if (requiresPasswordSetup === true) {
          console.log('🔑 [LOGIN] Temp password detected! Redirecting to /verify-temp-password for verification');
          toast.success('Temporary password detected. Please verify it.');
          
          setTimeout(() => {
            navigate('/verify-temp-password', { 
              replace: true,
              state: { 
                email: formData.email 
              }
            });
          }, 500);
          return;
        }

        // Normal case: User has permanent password
        toast.success('Login successful!');

        setTimeout(() => {
          if (!isProfileComplete) {
            console.log('🔀 [LOGIN] Redirecting to /complete-profile (profile incomplete)');
            navigate('/complete-profile', { replace: true });
          } else {
            console.log('🔀 [LOGIN] Redirecting to /profile/me (complete)');
            navigate('/profile/me', { replace: true });
          }
        }, 100);
      }
      else {
        const errorMsg = response.data.message || 'Login failed';
        showError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('❌ [LOGIN] Error:', error);
      
      // Check for specific cases
      if (error.response?.status === 401) {
        const msg = error.response?.data?.message || 'Invalid email or password';
        showError(msg);
        toast.error(msg);
      } else {
        const errorMsg = error.message || 'Login failed';
        showError(`Error: ${errorMsg}`);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-3 py-6 sm:p-4 sm:py-0">
      <Card className="w-full max-w-md max-h-screen overflow-y-auto sm:max-h-none sm:overflow-y-visible">
        <CardHeader className="space-y-1 sm:space-y-2 p-4 sm:p-6">
          <div className="flex items-center justify-center space-x-2 mb-2 sm:mb-3">
            <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
            <span className="text-xl sm:text-2xl font-bold text-blue-600">AluVerse</span>
          </div>
          <CardTitle className="text-lg sm:text-xl">Alumni Login</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Sign in to your alumni account</CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Email Input */}
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 text-xs sm:text-sm h-9 sm:h-10"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10 text-xs sm:text-sm h-9 sm:h-10"
                  disabled={loading}
                  autoComplete="password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 sm:top-3 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-9 sm:h-10 mt-4 sm:mt-6"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Info Section */}
          <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
            {/* Help Alert */}
            <div className="p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200 flex gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-snug">
                <strong>First time?</strong> If this is your first login, use the password you received via email.
              </p>
            </div>

            {/* Signup Link */}
            <p className="text-center text-xs sm:text-sm text-gray-600">
              New alumni?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-blue-600 hover:underline font-medium"
                disabled={loading}
              >
                Create an account
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
