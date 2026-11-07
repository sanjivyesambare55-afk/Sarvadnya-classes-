import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '../../firebase';
import { ADMIN_CONFIG } from './config';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Loader2, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
  unauthorizedError?: string;
  onClearUnauthorized?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ 
  unauthorizedError,
  onClearUnauthorized
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Forgot Password modal state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSentSuccess, setResetSentSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const getFriendlyErrorMessage = (code: string, fallback: string): string => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Incorrect email or password. Please verify and try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid administrative email address.';
      case 'auth/user-disabled':
        return 'This administrative account has been deactivated.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Access temporarily blocked for security. Please try again later or reset password.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your internet connectivity.';
      default:
        return fallback || 'Authentication failed. Please verify credentials.';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    if (onClearUnauthorized) onClearUnauthorized();
    setIsLoading(true);
    setAuthError(null);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // onAuthStateChanged in AdminDashboard will verify admin role in `admins/{uid}`
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      console.error('Admin login error:', err);
      setAuthError(getFriendlyErrorMessage(errorObj.code || '', errorObj.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setIsSendingReset(true);
    setResetError(null);

    try {
      await sendPasswordResetEmail(auth, forgotEmail.trim());
      setResetSentSuccess(true);
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      setResetError(getFriendlyErrorMessage(errorObj.code || '', 'Could not send reset email. Verify the address is registered.'));
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 font-sans selection:bg-[#6c3df4]/40 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[#6c3df4]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-[#ff7a3d]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6c3df4] to-[#ff7a3d] p-0.5 shadow-xl shadow-[#6c3df4]/25 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-[#ff7a3d]" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            {ADMIN_CONFIG.className}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Staff & Institute Management Portal · Nagpur
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Admin Authentication</h2>
              <p className="text-xs text-slate-400">Sign in with authorized administrator credentials</p>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#14b8a6] bg-[#14b8a6]/10 px-2 py-1 rounded border border-[#14b8a6]/20">
              Live Firestore
            </span>
          </div>

          {/* Unauthorized Alert */}
          {unauthorizedError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Access Denied</p>
                <p className="mt-0.5 leading-relaxed">{unauthorizedError}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sarvadnya.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] focus:ring-1 focus:ring-[#6c3df4] focus:outline-none text-sm text-white placeholder:text-slate-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setResetSentSuccess(false);
                    setResetError(null);
                    setIsForgotOpen(true);
                  }}
                  className="text-xs text-[#ff7a3d] hover:text-[#ff925d] transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] focus:ring-1 focus:ring-[#6c3df4] focus:outline-none text-sm text-white placeholder:text-slate-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#6c3df4] to-[#7f52ff] hover:from-[#5b2ce3] hover:to-[#6c3df4] disabled:opacity-60 shadow-lg shadow-[#6c3df4]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400">
            <HelpCircle className="w-4 h-4 text-[#ff7a3d] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Admin accounts are authorized through Firestore (<code className="text-slate-300 font-mono">admins/{'{uid}'}</code>). No public registration is permitted. Inactivity timeout: 30 minutes.
            </p>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-1">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-5">
              Enter your registered administrator email address to receive a secure password reset link.
            </p>

            {resetSentSuccess ? (
              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-start gap-3 text-xs text-teal-300 mb-4">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-teal-200">Reset Link Sent</p>
                  <p className="mt-0.5">Please check your inbox at <span className="font-mono text-white">{forgotEmail}</span> to complete the password reset.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                {resetError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                    {resetError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@sarvadnya.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#6c3df4] focus:outline-none text-sm text-white"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#6c3df4] hover:bg-[#5b2ce3] disabled:opacity-60 transition-colors flex items-center gap-1.5"
                  >
                    {isSendingReset && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Send Reset Email</span>
                  </button>
                </div>
              </form>
            )}

            {resetSentSuccess && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsForgotOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
