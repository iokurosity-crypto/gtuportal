import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, CheckCircle2, Mail, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/axios";

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  return score;
};

const SetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailDisplay, setEmailDisplay] = useState(location.state?.email || auth.alumni?.email || '');
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    console.log('📄 [SetPassword] Component MOUNTED');
    console.log('  - Email from location state:', location.state?.email);
    console.log('  - Email from auth:', auth.alumni?.email);
    console.log('  - From temp verification:', location.state?.fromTempVerification);

    if (location.state?.email) {
      setEmailDisplay(location.state.email);
    }

    if (!auth.loading && (!auth.isLoggedIn || !auth.token)) {
      toast.error("Please log in first");
      navigate("/verify-email", { replace: true });
      return;
    }

    // If user already completed password setup, send to complete-profile
    if (!auth.loading && auth.alumni?.isFirstLogin === false) {
      navigate(
        auth.alumni?.isProfileComplete ? "/profile/me" : "/complete-profile",
        { replace: true }
      );
    }
  }, [auth.alumni?.isFirstLogin, auth.alumni?.isProfileComplete, auth.isLoggedIn, auth.loading, auth.token, auth.alumni?.email, location.state, navigate]);

  const passwordStrength = getPasswordStrength(formData.newPassword);
  const passwordsMatch =
    Boolean(formData.confirmPassword) && formData.newPassword === formData.confirmPassword;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 [SetPassword] Submitting new password...');
      const response = await api.put("/auth/set-password-protected", {
        newPassword: formData.newPassword,
      });

      console.log('✅ [SetPassword] Response:', response.data);

      auth.updateAlumni(response.data?.alumni || {
        ...auth.alumni,
        isFirstLogin: false,
        isProfileComplete: false,
      });

      toast.success("✅ Password saved! Check your email for confirmation.");
      console.log('📧 [SetPassword] Password confirmation sent to email');

      // Auto-redirect to complete-profile after 2 seconds
      setTimeout(() => {
        navigate("/complete-profile", {
          replace: true,
          state: {
            fromSetPassword: true,
            email: emailDisplay || auth.alumni?.email,
          },
        });
      }, 1500);
    } catch (error) {
      console.error("[SetPassword] Failed:", error);
      toast.error(error.response?.data?.message || "Failed to save password");
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
          <CardTitle className="text-lg sm:text-xl text-center">Set Permanent Password</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-center text-blue-100">
            Step 3 of 3: Create your permanent password
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 px-4 sm:px-6 pb-6 bg-gradient-to-b from-slate-50 to-white space-y-6">
          {/* Email Display (Auto-filled, Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-700">
              Email Address (Verified)
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
              <Input
                id="email"
                type="email"
                value={emailDisplay}
                disabled
                className="pl-10 text-xs sm:text-sm bg-green-50 border border-green-200 cursor-not-allowed text-gray-700 font-medium"
              />
            </div>
            <p className="text-xs text-green-700 font-medium">✓ Email verified</p>
          </div>

          {/* Info Box */}
          <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-semibold text-blue-900">Temporary password verified ✓</p>
                <p className="text-blue-800 mt-1 leading-relaxed">
                  Create a strong permanent password below. We'll send you a confirmation email.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-xs sm:text-sm font-semibold text-gray-700">
                New Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  placeholder="Create a strong password"
                  className="pl-10 pr-10 text-xs sm:text-sm border-blue-200 focus:border-blue-500 focus:ring-blue-200"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((value) => (
                      <div
                        key={value}
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          passwordStrength >= value ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    {passwordStrength === 1 && "Weak password"}
                    {passwordStrength === 2 && "Fair password"}
                    {passwordStrength === 3 && "Good password"}
                    {passwordStrength === 4 && "Strong password ✓"}
                  </p>
                </>
              )}

              <p className="text-xs text-gray-500">
                💡 Use at least 6 characters. Mix uppercase, lowercase, numbers, and symbols for stronger security.
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-xs sm:text-sm font-semibold text-gray-700">
                Confirm Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  placeholder="Re-enter your password"
                  className="pl-10 pr-10 text-xs sm:text-sm border-blue-200 focus:border-blue-500 focus:ring-blue-200"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirmPassword && (
                <p className={`text-xs font-medium ${passwordsMatch ? "text-green-600" : "text-red-600"}`}>
                  {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !passwordsMatch || formData.newPassword.length < 6}
              className="w-full mt-6 bg-gradient-to-r from-blue-900 to-blue-950 hover:from-blue-800 hover:to-blue-900 text-white font-semibold text-sm sm:text-base h-10 sm:h-11 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Password...
                </>
              ) : (
                <>
                  Save & Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Progress Info */}
          <div className="text-center text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
            <p>After this, you'll complete your profile information.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetPassword;
