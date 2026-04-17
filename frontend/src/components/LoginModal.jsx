import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Label } from "@/components/ui";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext.jsx";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";

const LoginModal = () => {
  const { showLoginModal, setShowLoginModal, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  // New signup flow states
  const [signupStep, setSignupStep] = useState("email"); // "email" | "password" | "verify"
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresPasswordSetup) {
          setError("Please set your password first. Check your email for the temporary password.");
        } else {
          setError(data.message || "Login failed");
        }
        return;
      }

      // Login successful
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success("Login successful!");
      setShowLoginModal(false);
      navigate('/home');
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle signup (email only)
  const handleSignupEmail = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      // Detect if it's a new user (Flow 2) or pre-registered (Flow 1)
      if (data.token) {
        // FLOW 2: New user already registered (if we allowed direct password setting, 
        // but here we only sent email, so we need a step to set password)
        // Wait, I updated backend to return token only if password was provided.
        // If password was NOT provided in signup, the backend would fail if not in CSV.
        // I should probably update the frontend to show password field if they are not in CSV.
      }

      if (data.tempPassword) {
        toast.info(`Temp password (dev mode): ${data.tempPassword}`);
      }

      if (data.message.includes("Pre-registered")) {
        toast.success("Check your email for the temporary password!");
        setSignupStep("verify");
      } else {
        // This is for Flow 2 where they need to set password
        setSignupStep("password");
      }
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle new user registration (set password directly)
  const handleNewRegistration = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      // Registration successful
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success("Registration successful! Welcome to AluVerse.");
      setShowLoginModal(false);
      navigate('/home');
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle set password (with temp password)
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tempPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to set password");
        return;
      }

      // Auto-login
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success("Password set successfully! Logging in...");
      setShowLoginModal(false);
      navigate('/home');
      
      // Reset form
      setEmail("");
      setTempPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSignupStep("email");
    } catch (err) {
      setError(err.message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.tempPassword) {
        toast.info(`Temp password (dev mode): ${data.tempPassword}`);
      }

      toast.success("Check your email for password reset instructions");
      setShowPasswordReset(false);
      setEmail("");
    } catch (error) {
      setError("Failed to send reset email");
    }
    
    setLoading(false);
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const result = await loginWithGoogle();
    if (result && !result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl font-bold">
              {isSignUp ? "Join Alumni Network" : "Welcome Back Alumni"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isSignUp
              ? "Create your alumni account to connect with fellow alumni"
              : "Please login to continue"}
          </DialogDescription>
        </DialogHeader>

        {/* LOGIN MODE */}
        {!isSignUp && (
          <form onSubmit={handleLogin} className="space-y-4 mt-2">
            {error && <div className="p-3 text-sm bg-red-50 text-red-600 rounded-lg border border-red-100 font-medium">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-bold"
            >
              {loading ? "Processing..." : "Login"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full border-slate-200 hover:bg-slate-50 font-semibold"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-primary font-medium hover:underline"
              >
                Sign Up
              </button>
            </p>
          </form>
        )}

        {/* SIGNUP MODE - STEP 1: EMAIL */}
        {isSignUp && signupStep === "email" && (
          <form onSubmit={handleSignupEmail} className="space-y-4 mt-2">
            {error && <div className="p-3 text-sm bg-red-50 text-red-600 rounded-lg border border-red-100 font-medium">{error}</div>}

            <div className="p-3 text-sm bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
              Enter your email to join the alumni network. Pre-registered alumni will receive a temporary password.
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-bold"
            >
              {loading ? "Processing..." : "Continue with Email"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="text-primary font-medium hover:underline"
              >
                Login
              </button>
            </p>
          </form>
        )}

        {/* SIGNUP MODE - STEP 2: SET PASSWORD */}
        {isSignUp && signupStep === "verify" && (
          <form onSubmit={handleSetPassword} className="space-y-4 mt-2">
            {error && <div className="p-3 text-sm bg-red-50 text-red-600 rounded-lg border border-red-100 font-medium">{error}</div>}

            <div className="p-3 text-sm bg-green-50 text-green-700 rounded-lg border border-green-100">
              We've sent a temporary password to <strong>{email}</strong>. Check your email and enter it below.
            </div>

            <div className="space-y-2">
              <Label htmlFor="temp-password">Temporary Password</Label>
              <Input
                id="temp-password"
                type="text"
                placeholder="Enter 8-character password from email"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Create a secure password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-bold"
            >
              {loading ? "Setting up..." : "Create Account & Login"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Didn't receive email?{" "}
              <button
                type="button"
                onClick={() => {
                  setSignupStep("email");
                  setTempPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="text-primary font-medium hover:underline"
              >
                Go back
              </button>
            </p>
          </form>
        )}

        {/* SIGNUP MODE - STEP 3: NEW USER PASSWORD */}
        {isSignUp && signupStep === "password" && (
          <form onSubmit={handleNewRegistration} className="space-y-4 mt-2">
            {error && <div className="p-3 text-sm bg-red-50 text-red-600 rounded-lg border border-red-100 font-medium">{error}</div>}

            <div className="p-3 text-sm bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
              Create a new account for <strong>{email}</strong>.
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="Create a secure password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-confirm-password">Confirm Password</Label>
              <Input
                id="reg-confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-bold"
            >
              {loading ? "Creating Account..." : "Sign Up & Login"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Want to use a different email?{" "}
              <button
                type="button"
                onClick={() => {
                  setSignupStep("email");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="text-primary font-medium hover:underline"
              >
                Go back
              </button>
            </p>
          </form>
        )}

        {/* Password Reset Dialog */}
        {showPasswordReset && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter your email address and we'll send you a temporary password to reset your account.
              </p>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordReset(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePasswordReset}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Sending..." : "Send Email"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;

