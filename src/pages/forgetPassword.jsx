import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Shield
} from 'lucide-react';

// Theme colors matching your login page
const theme = {
  colors: {
    orange: '#FB923C',
    orangeDark: '#EA580C',
    orangeLight: '#FED7AA',
    textDark: '#1F2937',
    textGray: '#6B7280',
    error: '#EF4444',
    errorDark: '#DC2626',
    errorLight: '#FEE2E2',
    success: '#10B981',
    successDark: '#059669',
    successLight: '#D1FAE5'
  }
};

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setFieldError('');
    if (!email.trim()) return setFieldError('Email is required');
    if (!validateEmail(email.trim())) return setFieldError('Please enter a valid email address');

    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      setIsEmailSent(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => navigate('/login');

  // Unified orange‐gradient background
  const orangeBg = {
    background: `linear-gradient(to bottom right, 
      ${theme.colors.orange}, ${theme.colors.orangeDark})`
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={orangeBg}>
        <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md text-center">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.colors.successLight }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: theme.colors.success }} />
          </div>
          <h2 className="text-2xl font-semibold mb-3" style={{ color: theme.colors.textDark }}>
            Check Your Email
          </h2>
          <p className="text-sm mb-2" style={{ color: theme.colors.textGray }}>
            We've sent a password reset link to:
          </p>
          <p className="font-medium mb-6" style={{ color: theme.colors.textDark }}>
            {email}
          </p>
          <div className="space-y-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3 font-semibold text-white rounded-xl flex items-center justify-center gap-2"
              style={{
                ...orangeBg,
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading 
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                : <><Send className="w-5 h-5" /> Resend Email</>}
            </button>
            <button
              onClick={handleBackToLogin}
              className="w-full py-3 font-semibold rounded-xl border-2 flex items-center justify-center gap-2 hover:bg-orange-50 transition"
              style={{
                borderColor: theme.colors.orange,
                color: theme.colors.orange,
                backgroundColor: 'transparent'
              }}
            >
              <ArrowLeft className="w-5 h-5" /> Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={orangeBg}>
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.colors.orangeLight }}
          >
            <Shield className="w-7 h-7" style={{ color: theme.colors.orangeDark }} />
          </div>
          <h2 className="text-3xl font-semibold mb-2" style={{ color: theme.colors.textDark }}>
            Forgot Password?
          </h2>
          <p className="text-sm" style={{ color: theme.colors.textGray }}>
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 border rounded-xl flex items-center gap-2"
               style={{ backgroundColor: theme.colors.errorLight, borderColor: theme.colors.error }}>
            <AlertCircle className="w-4 h-4" style={{ color: theme.colors.errorDark }} />
            <span className="text-sm" style={{ color: theme.colors.errorDark }}>
              {error}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm mb-1" style={{ color: theme.colors.textDark }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5" style={{ color: '#9CA3AF' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 border focus:outline-none focus:ring-2 transition"
                style={{
                  borderColor: fieldError ? theme.colors.error : '#D1D5DB',
                  '--tw-ring-color': theme.colors.orange
                }}
                placeholder="Enter your email address"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {fieldError && (
              <p className="text-xs mt-1" style={{ color: theme.colors.errorDark }}>
                {fieldError}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition transform hover:scale-105"
            style={{
              ...orangeBg,
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading 
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending Reset Link...</>
              : <><Send className="w-5 h-5" /> Send Reset Link</>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleBackToLogin}
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition"
            style={{ color: theme.colors.orange }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
