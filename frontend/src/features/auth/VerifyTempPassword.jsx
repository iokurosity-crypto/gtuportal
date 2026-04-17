import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Label } from '@/components/ui';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * VerifyTempPassword - Step 2: Temporary Password Verification
 * 
 * FLOW:
 * 1. User receives email with temporary password (from VerifyEmail step)
 * 2. User enters temp password here
 * 3. Backend verifies → returns token
 * 4. Frontend redirects to /set-password with email in state
 * 5. User sets permanent password & receives it via email
 * 6. Redirect to /complete-profile
 */

const VerifyTempPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    tempPassword: ''
  });

  useEffect(() => {
    console.log('📄 [VerifyTempPassword] Component MOUNTED');
    console.log('  - Pre-filled email:', location.state?.email);
    
    if (!location.state?.email) {
      console.warn('⚠️ [VerifyTempPassword] No email provided. Redirecting to verify-email');
      toast.error('Please verify your email first.');
      navigate('/verify-email', { replace: true });
      return;
    }
  }, [location.state, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tempPassword.trim()) {
      toast.error('Please enter your temporary password');
      return;
    }

    console.log('🔐 [VerifyTempPassword] Verifying temp password for:', formData.email);
    setLoading(true);

    try {
      const response = await api.post('/auth/verify-temp-password', {
        email: formData.email.toLowerCase().trim(),
        tempPassword: formData.tempPassword
      });

      console.log('✅ [VerifyTempPassword] Response:', response.data);

      if (response.data.success) {
        console.log('✅ [VerifyTempPassword] Temp password verified!');
        
        const { token, alumni } = response.data;
        auth.login(token, alumni);
        toast.success('✅ Temporary password verified! Redirecting to set password...');
        
        console.log('🔀 [VerifyTempPassword] Redirecting to /set-password');
        navigate('/set-password', { 
          replace: true,
          state: { 
            fromTempVerification: true,
            email: formData.email 
          }
        });
      } else {
        console.error('❌ [VerifyTempPassword] Verification failed:', response.data.message);
        toast.error(response.data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('❌ [VerifyTempPassword] Error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Verification failed';
      
      if (error.response?.status === 401 || error.response?.status === 400) {
        toast.error('❌ Invalid or expired temporary password. Please try again or request a new one.');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-950 p-4 py-6">
      <Card className="w-full max-w-md shadow-2xl border-blue-800/50">
        <CardHeader className="space-y-2 p-4 sm:p-6 bg-gradient-to-r from-blue-900 to-blue-950 text-white rounded-t-lg border-b border-blue-800/50">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="text-xl sm:text-2xl font-bold">AluVerse</span>
          </div>
          <CardTitle className="text-lg sm:text-xl text-center">Verify Temporary Password</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-center text-blue-100">
            Step 2 of 3: Enter the password sent to your email
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 px-4 sm:px-6 pb-6 bg-gradient-to-b from-slate-50 to-white">
          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-900 font-medium">
              🔐 Check your email for the temporary password<br/>
              ✓ Use it to verify your account<br/>
              ✓ You'll then set your permanent password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (Read-only, Auto-filled) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-700">
                Email Address (Verified)
              </Label>
              <div className="relative">
                <CheckCircle2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="pl-10 text-xs sm:text-sm bg-green-50 border border-green-200 cursor-not-allowed text-gray-700 font-medium"
                />
              </div>
              <p className="text-xs text-green-700 font-medium">✓ Email verified</p>
            </div>

            {/* Temporary Password */}
            <div className="space-y-2">
              <Label htmlFor="tempPassword" className="text-xs sm:text-sm font-semibold text-gray-700">
                Temporary Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="tempPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password from email"
                  value={formData.tempPassword}
                  onChange={(e) => handleInputChange('tempPassword', e.target.value)}
                  disabled={loading}
                  className="pl-10 pr-10 text-xs sm:text-sm border-blue-200 focus:border-blue-500 focus:ring-blue-200"
                  autoComplete="off"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full mt-6 bg-gradient-to-r from-blue-900 to-blue-950 hover:from-blue-800 hover:to-blue-900 text-white font-semibold text-sm sm:text-base h-10 sm:h-11 shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Continue
                  <Lock className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Help Section */}
          <div className="mt-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="font-semibold text-amber-900 text-xs mb-1">💡 Didn't receive the password?</p>
            <p className="text-amber-800 text-xs leading-relaxed">
              Check your email spam folder, or{' '}
              <button
                onClick={() => navigate('/verify-email', { replace: true })}
                className="font-semibold text-amber-900 hover:underline"
              >
                go back to verify email again
              </button>.
            </p>
          </div>

          {/* Back Link */}
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/verify-email', { replace: true })}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
              disabled={loading}
            >
              ← Back to Email Verification
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyTempPassword;
