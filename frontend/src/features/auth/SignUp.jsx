import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { GraduationCap, Mail, CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/axios';

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email check | 2: Success/Instructions
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // ========== STEP 1: Email Verification ==========
  const handleEmailCheck = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    
    try {
      // First verify if email exists in database
      const verifyRes = await api.post('/auth/verify-alumni', { 
        email: email.toLowerCase().trim() 
      });
      
      console.log('📧 [SignUp] Verify Response:', verifyRes.data);
      
      if (verifyRes.data.success) {
        const { status, hasTemporaryPassword, hasPermanentPassword } = verifyRes.data;
        
        console.log(`🔍 [SignUp] User Status - status: ${status}, hasTemp: ${hasTemporaryPassword}, hasPerm: ${hasPermanentPassword}`);

        // SCENARIO 1: Admin-created account with temporary password (first-time setup)
        if (status === 'needs_temp_verification' || (hasTemporaryPassword && !hasPermanentPassword)) {
          console.log('✅ [SignUp] Account needs temporary password verification - REDIRECTING TO VERIFY-TEMP-PASSWORD');
          
          // Redirect immediately without any message or delay
          navigate('/verify-temp-password', {
            replace: true,
            state: { email: email.toLowerCase().trim() }
          });
          return;
        }

        // SCENARIO 2: Account already fully set up with permanent password
        if (hasPermanentPassword) {
          console.log('❌ [SignUp] Account already has permanent password - must login');
          setError('✓ Account found! You already have a password. Please login instead.');
          toast.error('You already have an account. Please login.');
          return;
        }

        // SCENARIO 3: Send temporary password (fallback for any other case)
        console.log('📧 [SignUp] Sending temporary password email...');
        await api.post('/auth/signup', { email: email.toLowerCase().trim() });
        setStep(2);
        toast.success('Verification email sent!');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Email not found.';
      console.error('❌ [SignUp] Error:', err);
      
      // Email not found in database
      if (err.response?.status === 404) {
        console.log('📝 [SignUp] Email not found - REDIRECTING TO SELF-REGISTER');
        setError('Email not found in college database. Redirecting to create new account...');
        setTimeout(() => {
          navigate('/self-register', { 
            replace: true,
            state: { email: email.toLowerCase().trim() } 
          });
        }, 1500);
      } else {
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 flex items-center justify-center p-2 py-4 sm:p-4 sm:py-0">
      <div className="w-full max-w-md max-h-screen overflow-y-auto sm:max-h-none sm:overflow-y-visible">
        {/* Main Card - Green & Professional */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden border border-emerald-100">
          
          {/* Header - Professional Green Theme */}
          <div className="p-3 sm:p-6 text-center bg-gradient-to-r from-emerald-600 to-teal-600 border-b border-emerald-200">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="h-10 w-10 sm:h-14 sm:w-14 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/30">
                <GraduationCap size={20} strokeWidth={1.5} className="sm:w-6 sm:h-6" />
              </div>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">Join AluVerse</h2>
            <p className="text-emerald-100 font-bold text-xs sm:text-sm mt-0.5 sm:mt-1">Connect with 30,000+ Alumni</p>
          </div>

          <div className="p-3 sm:p-6">
            {step === 1 ? (
              <div className="space-y-2 sm:space-y-3">
                {error && (
                  <>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-2 sm:p-3 flex gap-2 sm:gap-3">
                      <AlertCircle className="w-4 h-4 sm:w-4 sm:h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 text-xs sm:text-xs font-bold leading-snug">{error}</p>
                    </div>
                    {error.includes('already have a password') && (
                      <Button 
                        onClick={() => navigate('/login')}
                        className="w-full h-9 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-lg transition-all shadow-lg shadow-blue-600/30 text-xs sm:text-sm"
                      >
                        Go to Login →
                      </Button>
                    )}
                  </>
                )}

                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2 sm:p-3">
                  <p className="text-emerald-900 text-xs sm:text-xs font-bold leading-relaxed">
                    ✓ Enter the email you registered with LDCE<br/>
                    ✓ We'll send a temporary password<br/>
                    ✓ Complete your profile & connect!
                  </p>
                </div>

                <form onSubmit={handleEmailCheck} className="space-y-2 sm:space-y-3">
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-xs sm:text-xs font-black text-emerald-600 uppercase tracking-widest ml-1">College Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-2.5 sm:top-2.5 h-4 w-4 text-emerald-400" />
                      <input 
                        type="email"
                        placeholder="e.g. alumni@ldce.ac.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        className="w-full h-9 sm:h-10 pl-10 pr-3 bg-emerald-50 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-900 text-sm sm:text-sm group-hover:border-emerald-300"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-9 sm:h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-lg transition-all shadow-lg shadow-emerald-600/30 gap-2 text-xs sm:text-sm"
                  >
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (
                      <>
                        Verify & Send Password
                        <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center pt-0.5 sm:pt-1">
                  <button 
                    onClick={() => navigate('/login')}
                    className="text-xs font-black text-emerald-500 hover:text-emerald-700 transition-colors uppercase tracking-widest"
                  >
                    Already have a password? Sign In
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2 sm:space-y-3 py-1">
                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border-2 border-emerald-200">
                  <CheckCircle size={24} className="sm:w-7 sm:h-7" />
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">Check Your Inbox!</h3>
                  <p className="text-slate-600 text-xs sm:text-xs font-bold leading-relaxed px-1">
                    A temporary password has been sent to<br/><span className="text-emerald-600 font-black text-xs sm:text-sm break-all">{email}</span>
                  </p>
                </div>
                <div className="pt-0.5 sm:pt-1">
                  <Button 
                    onClick={() => navigate('/login')}
                    className="w-full h-9 sm:h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-lg shadow-lg shadow-emerald-600/30 text-xs sm:text-sm"
                  >
                    Go to Login
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 sm:px-6 py-2 sm:py-3 bg-emerald-50/50 border-t border-emerald-100 text-center">
            <p className="text-xs text-slate-500 font-bold">Secure authentication powered by AluVerse</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
