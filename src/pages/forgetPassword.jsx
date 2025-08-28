import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../axiosConfig';
import toast from 'react-hot-toast';
import {
  Mail,
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Key,
  WifiOff,
  Check,
  X,
} from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL params (if coming from email link)
  const urlEmail = searchParams.get('email');
  const urlCode = searchParams.get('code');

  // Steps: 'request' | 'sent' | 'verify' | 'reset' | 'success'
  const [currentStep, setCurrentStep] = useState(
    urlEmail && urlCode ? 'reset' : 'request'
  );

  // Form state
  const [email, setEmail] = useState(urlEmail || '');
  const [resetCode, setResetCode] = useState(urlCode || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Validation & errors
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [fieldTouched, setFieldTouched] = useState({});
  const [realtimeErrors, setRealtimeErrors] = useState({});

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // ---- Utilities ----
  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  // Network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (generalError === 'No internet connection. Please check your network.') {
        setGeneralError('');
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setGeneralError('No internet connection. Please check your network.');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [generalError]);

  // Realtime validation
  const validateFieldRealtime = (field, value) => {
    if (!fieldTouched[field] || !String(value).trim()) return null;

    switch (field) {
      case 'email':
        if (!validateEmail(value)) return 'Please enter a valid email address.';
        if (value.length > 254) return 'Email address is too long.';
        return null;
      case 'resetCode':
        if (value.length < 6) return 'Reset code must be at least 6 characters.';
        if (value.length > 10) return 'Reset code cannot exceed 10 characters.';
        return null;
      case 'newPassword':
        if (value.length < 8) return 'Password must be at least 8 characters long.';
        if (value.length > 128) return 'Password cannot exceed 128 characters.';
        if (!passwordStrength.uppercase) return 'Include at least one uppercase letter (A-Z).';
        if (!passwordStrength.lowercase) return 'Include at least one lowercase letter (a-z).';
        if (!passwordStrength.number) return 'Add at least one number (0-9).';
        if (!passwordStrength.special) return 'Add a special character like !@#$%^&*.';
        return null;
      case 'confirmPassword':
        if (value !== newPassword) return 'Passwords do not match.';
        return null;
      default:
        return null;
    }
  };

  useEffect(() => {
    const next = {};
    ['email', 'resetCode', 'newPassword', 'confirmPassword'].forEach((f) => {
      const v =
        f === 'email'
          ? email
          : f === 'resetCode'
          ? resetCode
          : f === 'newPassword'
          ? newPassword
          : confirmPassword;
      const err = validateFieldRealtime(f, v);
      if (err) next[f] = err;
    });
    setRealtimeErrors(next);
  }, [email, resetCode, newPassword, confirmPassword, fieldTouched, passwordStrength]);

  const getFieldError = (field) => {
    if (errors[field]?.length) return errors[field][0];
    if (realtimeErrors[field]) return realtimeErrors[field];
    return null;
  };

  const getFieldValidationIcon = (field) => {
    const value =
      field === 'email'
        ? email
        : field === 'resetCode'
        ? resetCode
        : field === 'newPassword'
        ? newPassword
        : confirmPassword;

    if (fieldTouched[field] && value) {
      if (getFieldError(field)) return <X className="w-5 h-5 text-red-500" />;
      return <Check className="w-5 h-5 text-green-500" />;
    }
    return null;
  };

  const processServerErrors = (errorData) => {
    const next = {};
    if (errorData?.errors) {
      if (Array.isArray(errorData.errors)) {
        errorData.errors.forEach((msg) => {
          if (typeof msg === 'string') {
            const l = msg.toLowerCase();
            if (l.includes('email')) next.email = [msg];
            else if (l.includes('code') || l.includes('token')) next.resetCode = [msg];
            else if (l.includes('password')) next.newPassword = [msg];
            else setGeneralError(msg);
          }
        });
      } else if (typeof errorData.errors === 'object') {
        Object.keys(errorData.errors).forEach((field) => {
          const msgs = Array.isArray(errorData.errors[field])
            ? errorData.errors[field]
            : [errorData.errors[field]];
          const key = field.toLowerCase();
          if (key.includes('email')) next.email = msgs;
          else if (key.includes('code') || key.includes('token')) next.resetCode = msgs;
          else if (key.includes('password')) next.newPassword = msgs;
        });
      }
    }

    const message = errorData?.message || errorData?.errorMessage || '';
    if (message && Object.keys(next).length === 0) {
      const l = message.toLowerCase();
      if (l.includes('email')) next.email = [message];
      else if (l.includes('code') || l.includes('token') || l.includes('invalid') || l.includes('expired'))
        next.resetCode = [message];
      else if (l.includes('password')) next.newPassword = [message];
      else setGeneralError(message);
    }
    return next;
  };

  // ---- Handlers ----
  const handleInputChange = (field, value) => {
    if (field === 'email') setEmail(value);
    if (field === 'resetCode') setResetCode(value);
    if (field === 'newPassword') {
      setNewPassword(value);
      checkPasswordStrength(value);
    }
    if (field === 'confirmPassword') setConfirmPassword(value);

    setErrors((prev) => ({ ...prev, [field]: [] }));
    setGeneralError('');
    setFieldTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setFieldTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!isOnline) {
      setGeneralError('No internet connection. Please check your network.');
      return;
    }
    setGeneralError('');
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: ['Email is required'] });
      return;
    }
    if (!validateEmail(email.trim())) {
      setErrors({ email: ['Please enter a valid email address'] });
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('/Authentication/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      setCurrentStep('sent');
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        const mapped = processServerErrors(data);
        if (Object.keys(mapped).length) setErrors(mapped);
        else {
          if (status === 404) setErrors({ email: ['No account found with this email address.'] });
          else if (status === 429) setGeneralError('Too many requests. Please try again later.');
          else setGeneralError(data?.message || 'Failed to send reset email. Please try again.');
        }
      } else {
        setGeneralError('Unable to connect to server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!isOnline) {
      setGeneralError('No internet connection. Please check your network.');
      return;
    }
    setGeneralError('');
    setErrors({});

    if (!resetCode.trim()) {
      setErrors({ resetCode: ['Reset code is required'] });
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('/Authentication/verify-reset-code', {
        email: email.trim().toLowerCase(),
        code: resetCode.trim(),
      });
      setCurrentStep('reset');
      toast.success('Code verified! Now set your new password.');
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        const mapped = processServerErrors(data);
        if (Object.keys(mapped).length) setErrors(mapped);
        else {
          if (status === 400) setErrors({ resetCode: ['Invalid or expired reset code.'] });
          else if (status === 404) setGeneralError('Reset request not found. Please request a new reset link.');
          else setGeneralError(data?.message || 'Failed to verify code. Please try again.');
        }
      } else {
        setGeneralError('Unable to connect to server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isOnline) {
      setGeneralError('No internet connection. Please check your network.');
      return;
    }
    setGeneralError('');
    setErrors({});

    const v = {};
    if (!newPassword) v.newPassword = ['New password is required'];
    else if (getFieldError('newPassword')) v.newPassword = [getFieldError('newPassword')];
    if (!confirmPassword) v.confirmPassword = ['Please confirm your password'];
    else if (newPassword !== confirmPassword) v.confirmPassword = ['Passwords do not match'];

    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('/Authentication/reset-password', {
        email: email.trim().toLowerCase(),
        code: resetCode.trim(),
        newPassword,
      });
      setCurrentStep('success');
      toast.success('Password reset successful! You can now login with your new password.');
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        const mapped = processServerErrors(data);
        if (Object.keys(mapped).length) setErrors(mapped);
        else {
          if (status === 400)
            setGeneralError('Invalid or expired reset code. Please request a new reset link.');
          else if (status === 404)
            setGeneralError('Reset request not found. Please request a new reset link.');
          else setGeneralError(data?.message || 'Failed to reset password. Please try again.');
        }
      } else {
        setGeneralError('Unable to connect to server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const FieldHintError = ({ field }) =>
    getFieldError(field) ? (
      <p className="text-xs mt-1 flex items-center gap-1 text-red-600 dark:text-red-400">
        <AlertCircle className="w-4 h-4" />
        {getFieldError(field)}
      </p>
    ) : null;

  // ---- Success screen ----
  if (currentStep === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 dark:from-gray-900 dark:via-gray-950 dark:to-black">
        <div className="w-full max-w-md rounded-3xl p-8 shadow-2xl bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Password Reset Successful!
          </h2>
          <p className="text-sm mb-6 text-gray-600 dark:text-gray-400">
            Your password has been successfully reset. You can now login with your new password.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition duration-300 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ---- Email sent screen ----
  if (currentStep === 'sent') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 dark:from-gray-900 dark:via-gray-950 dark:to-black">
        <div className="w-full max-w-md rounded-3xl p-8 shadow-2xl bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Check Your Email
          </h2>
          <p className="text-sm mb-2 text-gray-600 dark:text-gray-400">
            We've sent a password reset link to:
          </p>
          <p className="font-medium mb-6 text-gray-900 dark:text-gray-100">{email}</p>
          <div className="space-y-4">
            <button
              onClick={handleRequestReset}
              disabled={isLoading}
              className="w-full py-3 font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition duration-300 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Resend Email
                </>
              )}
            </button>
            <button
              onClick={() => setCurrentStep('verify')}
              className="w-full py-3 font-semibold rounded-xl border-2 flex items-center justify-center gap-2 hover:bg-orange-50 dark:hover:bg-gray-800 transition text-orange-600 dark:text-orange-400 border-orange-300/70 dark:border-orange-700/60"
            >
              <Key className="w-5 h-5" /> Enter Code Manually
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 font-semibold rounded-xl border-2 flex items-center justify-center gap-2 hover:bg-orange-50 dark:hover:bg-gray-800 transition text-orange-600 dark:text-orange-400 border-orange-300/70 dark:border-orange-700/60"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Main (request / verify / reset) ----
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 dark:from-gray-900 dark:via-gray-950 dark:to-black">
      <div className="w-full max-w-md rounded-3xl p-8 shadow-2xl bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800">
        {/* header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-orange-100 dark:bg-gray-800">
            {currentStep === 'request' && <Shield className="w-7 h-7 text-orange-600" />}
            {currentStep === 'verify' && <Key className="w-7 h-7 text-orange-600" />}
            {currentStep === 'reset' && <Lock className="w-7 h-7 text-orange-600" />}
          </div>
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
            {currentStep === 'request'
              ? 'Forgot Password?'
              : currentStep === 'verify'
              ? 'Enter Reset Code'
              : 'Set New Password'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {currentStep === 'request'
              ? "No worries! Enter your email and we'll send you a reset link."
              : currentStep === 'verify'
              ? 'Enter the reset code sent to your email.'
              : 'Create a strong new password for your account.'}
          </p>
        </div>

        {!isOnline && (
          <div className="mb-4 p-2 rounded-xl flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm">Offline</span>
          </div>
        )}

        {generalError && (
          <div className="mb-4 p-3 rounded-xl flex items-center gap-2 border bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{generalError}</span>
          </div>
        )}

        {/* Request */}
        {currentStep === 'request' && (
          <form onSubmit={handleRequestReset} className="space-y-5">
            <div>
              <label className="block text-sm mb-1 text-gray-800 dark:text-gray-200">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2
                    bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100
                    placeholder-gray-400 dark:placeholder-gray-500
                    ${getFieldError('email') ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-700 focus:ring-orange-400 dark:focus:ring-orange-500'}`}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                  autoComplete="email"
                />
                <div className="absolute right-3 top-3.5">{getFieldValidationIcon('email')}</div>
              </div>
              <FieldHintError field="email" />
            </div>

            <button
              type="submit"
              disabled={isLoading || !isOnline}
              className="w-full py-3 font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition duration-300 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Sending Reset Link...
                </>
              ) : !isOnline ? (
                <>
                  <WifiOff className="w-5 h-5" /> No Connection
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Send Reset Link
                </>
              )}
            </button>
          </form>
        )}

        {/* Verify */}
        {currentStep === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            <div>
              <label className="block text-sm mb-1 text-gray-800 dark:text-gray-200">
                Reset Code
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => handleInputChange('resetCode', e.target.value)}
                  onBlur={() => handleBlur('resetCode')}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2
                    bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100
                    placeholder-gray-400 dark:placeholder-gray-500
                    ${getFieldError('resetCode') ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-700 focus:ring-orange-400 dark:focus:ring-orange-500'}`}
                  placeholder="Enter the reset code from your email"
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-3.5">{getFieldValidationIcon('resetCode')}</div>
              </div>
              <FieldHintError field="resetCode" />
            </div>

            <button
              type="submit"
              disabled={isLoading || !isOnline}
              className="w-full py-3 font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition duration-300 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" /> Verify Code
                </>
              )}
            </button>
          </form>
        )}

        {/* Reset */}
        {currentStep === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm mb-1 text-gray-800 dark:text-gray-200">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  onBlur={() => handleBlur('newPassword')}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2
                    bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100
                    placeholder-gray-400 dark:placeholder-gray-500
                    ${getFieldError('newPassword') ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-700 focus:ring-orange-400 dark:focus:ring-orange-500'}`}
                  placeholder="Enter your new password"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                  disabled={isLoading}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <FieldHintError field="newPassword" />

              {/* Strength bullets */}
              {newPassword && fieldTouched.newPassword && (
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${passwordStrength.length ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                    <span className={passwordStrength.length ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${(passwordStrength.uppercase && passwordStrength.lowercase) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                    <span className={(passwordStrength.uppercase && passwordStrength.lowercase) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                      Uppercase and lowercase letters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${passwordStrength.number ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                    <span className={passwordStrength.number ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                      At least one number
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${passwordStrength.special ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                    <span className={passwordStrength.special ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                      Special character (!@#$%^&*)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-800 dark:text-gray-200">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2
                    bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100
                    placeholder-gray-400 dark:placeholder-gray-500
                    ${getFieldError('confirmPassword') ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-700 focus:ring-orange-400 dark:focus:ring-orange-500'}`}
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <FieldHintError field="confirmPassword" />
            </div>

            <button
              type="submit"
              disabled={isLoading || !isOnline}
              className="w-full py-3 font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition duration-300 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Resetting Password...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" /> Reset Password
                </>
              )}
            </button>
          </form>
        )}

        {/* Bottom nav */}
        <div className="mt-6 text-center">
          {currentStep === 'verify' && (
            <div className="space-y-2">
              <button
                onClick={() => setCurrentStep('request')}
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline text-orange-600 dark:text-orange-400"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4" />
                Request New Link
              </button>
              <br />
            </div>
          )}
          {(currentStep === 'request' || currentStep === 'verify') && (
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline text-orange-600 dark:text-orange-400"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          )}
          {currentStep === 'reset' && (
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline text-orange-600 dark:text-orange-400"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
