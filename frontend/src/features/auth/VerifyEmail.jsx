import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Label } from '@/components/ui';
import { Mail, AlertCircle, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/axios';

/**
 * VerifyEmail - Step 1: Email Verification for Admin-Created Alumni Accounts
 * 
 * FLOW:
 * 1. User enters email (admin created account)
 * 2. System verifies email exists in database
 * 3. If exists → Temporary password is sent to email
 * 4. Redirect to /verify-temp-password with email in state
 * 5. User enters temp password → redirects to /set-password
 * 6. User sets new password → redirects to /complete-profile
 */

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

  const handleEmailVerification = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      console.log('🔍 [VerifyEmail] Verifying email:', email);

      // Step 1: Verify email exists in database
      const verifyRes = await api.post('/auth/verify-alumni', { 
        email: email.toLowerCase().trim() 
      });

      console.log('✅ [VerifyEmail] Email verified:', verifyRes.data);

      if (verifyRes.data.success) {
        // Step 2: Send temporary password to email
        try {
          await api.post('/auth/signup', { 
            email: email.toLowerCase().trim() 
          });
          console.log('📧 [VerifyEmail] Temporary password sent to email');
        } catch (emailError) {
          console.warn('⚠️ [VerifyEmail] Could not send email, but proceeding:', emailError);
        }

        // Step 3: Show success and redirect
        setEmailVerified(true);
        toast.success('✅ Email verified! Check your inbox for temporary password.');

        // Auto-redirect after 2 seconds
        setTimeout(() => {
          navigate('/verify-temp-password', {
            replace: true,
            state: { email: email.toLowerCase().trim() }
          });
        }, 2000);
      }
    } catch (error) {
      console.error('❌ [VerifyEmail] Error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Email verification failed';

      if (error.response?.status === 404) {
        setError('📧 Email not found in college database. You can create your own account instead.');
        toast.error('Email not found. Please check or create a new account.');
        
        // Auto-redirect to self-register with email pre-filled
        setTimeout(() => {
          navigate('/self-register', {
            replace: true,
            state: { email: email.toLowerCase().trim() }
          });
        }, 2500);
      } else {
        setError(errorMsg);
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
            <Mail className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="text-xl sm:text-2xl font-bold">AluVerse</span>
          </div>
          <CardTitle className="text-lg sm:text-xl text-center">Verify Email</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-center text-blue-100">
            Step 1 of 3: Verify your registered email
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 px-4 sm:px-6 pb-6 bg-gradient-to-b from-slate-50 to-white">
          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-900 font-medium">
              ✓ Enter the email registered with LDCE<br/>
              ✓ We'll verify and send you a temporary password<br/>
              ✓ Check your email inbox
            </p>
          </div>

          {/* Success State */}
          {emailVerified && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-900">Email Verified!</p>
                <p className="text-xs text-green-700 mt-1">Redirecting...</p>
              </div>
            </div>
          )}

          {/* Error Box */}
          {error && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm text-amber-900 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-700">
                College Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., yourname@ldce.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || emailVerified}
                  className="pl-10 text-xs sm:text-sm border-blue-200 focus:border-blue-500 focus:ring-blue-200"
                  autoComplete="email"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">This must be your registered college email</p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || emailVerified}
              className="w-full mt-6 bg-gradient-to-r from-blue-900 to-blue-950 hover:from-blue-800 hover:to-blue-900 text-white font-semibold text-sm sm:text-base h-10 sm:h-11 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : emailVerified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verified!
                </>
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-blue-200"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 bg-gradient-to-b from-slate-50 to-white text-gray-600 font-medium">
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Self Register Link */}
          <Button
            onClick={() => navigate('/self-register')}
            variant="outline"
            className="w-full text-sm sm:text-base border-blue-900 text-blue-900 hover:bg-blue-50 font-medium"
            disabled={loading}
          >
            Create New Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
