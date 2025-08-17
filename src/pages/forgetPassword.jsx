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
  Wifi,
  WifiOff,
  Check,
  X,
  AlertTriangle
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
  const [searchParams] = useSearchParams();
  
  // Get email and code from URL parameters if present
  const urlEmail = searchParams.get('email');
  const urlCode = searchParams.get('code');

  // States for different steps
  const [currentStep, setCurrentStep] = useState(
    urlEmail && urlCode ? 'reset' : 'request'
  ); // 'request', 'sent', 'verify', 'reset', 'success'
  
  // Form data
  const [email, setEmail] = useState(urlEmail || '');
  const [resetCode, setResetCode] = useState(urlCode || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Error and validation states
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [fieldTouched, setFieldTouched] = useState({});
  const [realtimeErrors, setRealtimeErrors] = useState({});
  
  // Password strength checking
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Network status monitoring
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

  // Password strength checker
  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  // Real-time validation
  const validateFieldRealtime = (field, value) => {
    if (!fieldTouched[field] || !value.trim()) return null;

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

  // Update real-time validation
  useEffect(() => {
    const newRealtimeErrors = {};
    const fields = ['email', 'resetCode', 'newPassword', 'confirmPassword'];
    
    fields.forEach(field => {
      let value;
      switch (field) {
        case 'email': value = email; break;
        case 'resetCode': value = resetCode; break;
        case 'newPassword': value = newPassword; break;
        case 'confirmPassword': value = confirmPassword; break;
        default: value = '';
      }
      
      const error = validateFieldRealtime(field, value);
      if (error) {
        newRealtimeErrors[field] = error;
      }
    });
    
    setRealtimeErrors(newRealtimeErrors);
  }, [email, resetCode, newPassword, confirmPassword, fieldTouched, passwordStrength]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'resetCode':
        setResetCode(value);
        break;
      case 'newPassword':
        setNewPassword(value);
        checkPasswordStrength(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }
    
    // Clear errors and mark as touched
    setErrors(prev => ({ ...prev, [field]: [] }));
    setGeneralError('');
    setFieldTouched(prev => ({ ...prev, [field]: true }));
  };

  // Handle field blur
  const handleBlur = (field) => {
    setFieldTouched(prev => ({ ...prev, [field]: true }));
  };

  // Get field error
  const getFieldError = (field) => {
    if (errors[field] && errors[field].length > 0) return errors[field][0];
    if (realtimeErrors[field]) return realtimeErrors[field];
    return null;
  };

  // Get field validation icon
  const getFieldValidationIcon = (field) => {
    let value;
    switch (field) {
      case 'email': value = email; break;
      case 'resetCode': value = resetCode; break;
      case 'newPassword': value = newPassword; break;
      case 'confirmPassword': value = confirmPassword; break;
      default: value = '';
    }

    if (fieldTouched[field] && value) {
      if (getFieldError(field)) return <X className="w-5 h-5 text-red-500" />;
      return <Check className="w-5 h-5 text-green-500" />;
    }
    return null;
  };

  // Process server errors
  const processServerErrors = (errorData) => {
    const newErrors = {};
    console.log('Processing server errors:', errorData);

    if (errorData.errors) {
      if (Array.isArray(errorData.errors)) {
        errorData.errors.forEach((errorMsg) => {
          if (typeof errorMsg === 'string') {
            const lowerMessage = errorMsg.toLowerCase();
            if (lowerMessage.includes('email')) {
              newErrors.email = [errorMsg];
            } else if (lowerMessage.includes('code') || lowerMessage.includes('token')) {
              newErrors.resetCode = [errorMsg];
            } else if (lowerMessage.includes('password')) {
              newErrors.newPassword = [errorMsg];
            } else {
              setGeneralError(errorMsg);
            }
          }
        });
      } else if (typeof errorData.errors === 'object') {
        Object.keys(errorData.errors).forEach(field => {
          const fieldKey = field.toLowerCase();
          const errorMessages = Array.isArray(errorData.errors[field]) 
            ? errorData.errors[field] 
            : [errorData.errors[field]];
          
          if (fieldKey.includes('email')) {
            newErrors.email = errorMessages;
          } else if (fieldKey.includes('code') || fieldKey.includes('token')) {
            newErrors.resetCode = errorMessages;
          } else if (fieldKey.includes('password')) {
            newErrors.newPassword = errorMessages;
          }
        });
      }
    }

    const errorMessage = errorData.message || errorData.errorMessage || '';
    if (errorMessage && Object.keys(newErrors).length === 0) {
      const lowerMessage = errorMessage.toLowerCase();
      if (lowerMessage.includes('email')) {
        newErrors.email = [errorMessage];
      } else if (lowerMessage.includes('code') || lowerMessage.includes('token') || lowerMessage.includes('invalid') || lowerMessage.includes('expired')) {
        newErrors.resetCode = [errorMessage];
      } else if (lowerMessage.includes('password')) {
        newErrors.newPassword = [errorMessage];
      } else {
        setGeneralError(errorMessage);
      }
    }

    return newErrors;
  };

  // Step 1: Request password reset
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
        email: email.trim().toLowerCase()
      });
      
      setCurrentStep('sent');
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      console.error('Forgot password error:', err);
      
      if (err.response) {
        const { status, data } = err.response;
        const fieldErrors = processServerErrors(data);
        
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          switch (status) {
            case 404:
              setErrors({ email: ['No account found with this email address.'] });
              break;
            case 429:
              setGeneralError('Too many requests. Please try again later.');
              break;
            default:
              setGeneralError(data.message || 'Failed to send reset email. Please try again.');
          }
        }
      } else {
        setGeneralError('Unable to connect to server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify reset code (if manually entered)
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
        code: resetCode.trim()
      });
      
      setCurrentStep('reset');
      toast.success('Code verified! Now set your new password.');
    } catch (err) {
      console.error('Verify code error:', err);
      
      if (err.response) {
        const { status, data } = err.response;
        const fieldErrors = processServerErrors(data);
        
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          switch (status) {
            case 400:
              setErrors({ resetCode: ['Invalid or expired reset code.'] });
              break;
            case 404:
              setGeneralError('Reset request not found. Please request a new reset link.');
              break;
            default:
              setGeneralError(data.message || 'Failed to verify code. Please try again.');
          }
        }
      } else {
        setGeneralError('Unable to connect to server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!isOnline) {
      setGeneralError('No internet connection. Please check your network.');
      return;
    }

    setGeneralError('');
    setErrors({});

    // Validation
    const validationErrors = {};
    
    if (!newPassword) {
      validationErrors.newPassword = ['New password is required'];
    } else if (getFieldError('newPassword')) {
      validationErrors.newPassword = [getFieldError('newPassword')];
    }
    
    if (!confirmPassword) {
      validationErrors.confirmPassword = ['Please confirm your password'];
    } else if (newPassword !== confirmPassword) {
      validationErrors.confirmPassword = ['Passwords do not match'];
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('/Authentication/reset-password', {
        email: email.trim().toLowerCase(),
        code: resetCode.trim(),
        newPassword: newPassword
      });
      
      setCurrentStep('success');
      toast.success('Password reset successful! You can now login with your new password.');
    } catch (err) {
      console.error('Reset password error:', err);
      
      if (err.response) {
        const { status, data } = err.response;
        const fieldErrors = processServerErrors(data);
        
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          switch (status) {
            case 400:
              setGeneralError('Invalid or expired reset code. Please request a new reset link.');
              break;
            case 404:
              setGeneralError('Reset request not found. Please request a new reset link.');
              break;
            default:
              setGeneralError(data.message || 'Failed to reset password. Please try again.');
          }
        }
      } else {
        setGeneralError('Unable to connect to server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => navigate('/login');

  // Unified orange gradient background
  const orangeBg = {
    background: `linear-gradient(to bottom right, 
      ${theme.colors.orange}, ${theme.colors.orangeDark})`
  };

  // Success step
  if (currentStep === 'success') {
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
            Password Reset Successful!
          </h2>
          <p className="text-sm mb-6" style={{ color: theme.colors.textGray }}>
            Your password has been successfully reset. You can now login with your new password.
          </p>
          <button
            onClick={handleBackToLogin}
            className="w-full py-3 font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition transform hover:scale-105"
            style={orangeBg}
          >
            <ArrowLeft className="w-5 h-5" /> Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Email sent step
  if (currentStep === 'sent') {
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
              onClick={handleRequestReset}
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
              onClick={() => setCurrentStep('verify')}
              className="w-full py-3 font-semibold rounded-xl border-2 flex items-center justify-center gap-2 hover:bg-orange-50 transition"
              style={{
                borderColor: theme.colors.orange,
                color: theme.colors.orange,
                backgroundColor: 'transparent'
              }}
            >
              <Key className="w-5 h-5" /> Enter Code Manually
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
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.colors.orangeLight }}
          >
            {currentStep === 'request' ? (
              <Shield className="w-7 h-7" style={{ color: theme.colors.orangeDark }} />
            ) : currentStep === 'verify' ? (
              <Key className="w-7 h-7" style={{ color: theme.colors.orangeDark }} />
            ) : (
              <Lock className="w-7 h-7" style={{ color: theme.colors.orangeDark }} />
            )}
          </div>
          <h2 className="text-3xl font-semibold mb-2" style={{ color: theme.colors.textDark }}>
            {currentStep === 'request' ? 'Forgot Password?' : 
             currentStep === 'verify' ? 'Enter Reset Code' : 
             'Set New Password'}
          </h2>
          <p className="text-sm" style={{ color: theme.colors.textGray }}>
            {currentStep === 'request' ? 'No worries! Enter your email and we\'ll send you a reset link.' :
             currentStep === 'verify' ? 'Enter the reset code sent to your email.' :
             'Create a strong new password for your account.'}
          </p>
        </div>

        {/* Network Status */}
        {!isOnline && (
          <div className="mb-4 p-2 border rounded-xl flex items-center justify-center gap-2 bg-gray-50">
            <WifiOff className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Offline</span>
          </div>
        )}

        {/* General Error */}
        {generalError && (
          <div className="mb-4 p-3 border rounded-xl flex items-center gap-2"
               style={{ backgroundColor: theme.colors.errorLight, borderColor: theme.colors.error }}>
            <AlertCircle className="w-4 h-4" style={{ color: theme.colors.errorDark }} />
            <span className="text-sm" style={{ color: theme.colors.errorDark }}>
              {generalError}
            </span>
          </div>
        )}

        {/* Request Reset Form */}
        {currentStep === 'request' && (
          <form onSubmit={handleRequestReset} className="space-y-5">
            <div>
              <label className="block text-sm mb-1" style={{ color: theme.colors.textDark }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5" style={{ color: '#9CA3AF' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-100 border focus:outline-none focus:ring-2 transition"
                  style={{
                    borderColor: getFieldError('email') ? theme.colors.error : '#D1D5DB',
                    '--tw-ring-color': theme.colors.orange
                  }}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                  autoComplete="email"
                />
                <div className="absolute right-3 top-3.5">
                  {getFieldValidationIcon('email')}
                </div>
              </div>
              {getFieldError('email') && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: theme.colors.errorDark }}>
                  <AlertCircle className="w-4 h-4" />
                  {getFieldError('email')}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !isOnline}
              className="w-full py-3 font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition transform hover:scale-105"
              style={{
                ...orangeBg,
                opacity: (isLoading || !isOnline) ? 0.7 : 1
              }}
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Sending Reset Link...</>
              ) : !isOnline ? (
                <><WifiOff className="w-5 h-5" /> No Connection</>
              ) : (
                <><Send className="w-5 h-5" /> Send Reset Link</>
              )}
            </button>
          </form>
        )}

        {/* Verify Code Form */}
        {currentStep === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            <div>
              <label className="block text-sm mb-1" style={{ color: theme.colors.textDark }}>
                Reset Code
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3.5 w-5 h-5" style={{ color: '#9CA3AF' }} />
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => handleInputChange('resetCode', e.target.value)}
                  onBlur={() => handleBlur('resetCode')}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-100 border focus:outline-none focus:ring-2 transition"
                  style={{
                    borderColor: getFieldError('resetCode') ? theme.colors.error : '#D1D5DB',
                    '--tw-ring-color': theme.colors.orange
                  }}
                  placeholder="Enter the reset code from your email"
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-3.5">
                  {getFieldValidationIcon('resetCode')}
                </div>
              </div>
              {getFieldError('resetCode') && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: theme.colors.errorDark }}>
                  <AlertCircle className="w-4 h-4" />
                  {getFieldError('resetCode')}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !isOnline}
              className="w-full py-3 font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition transform hover:scale-105"
              style={{
                ...orangeBg,
                opacity: (isLoading || !isOnline) ? 0.7 : 1
              }}
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
              ) : (
                <><CheckCircle className="w-5 h-5" /> Verify Code</>
              )}
            </button>
          </form>
        )}

        {/* Reset Password Form */}
        {currentStep === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm mb-1" style={{ color: theme.colors.textDark }}>
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5" style={{ color: '#9CA3AF' }} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  onBlur={() => handleBlur('newPassword')}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-100 border focus:outline-none focus:ring-2 transition"
                  style={{
                    borderColor: getFieldError('newPassword') ? theme.colors.error : '#D1D5DB',
                    '--tw-ring-color': theme.colors.orange
                  }}
                  placeholder="Enter your new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(v => !v)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {getFieldError('newPassword') && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: theme.colors.errorDark }}>
                  <AlertCircle className="w-4 h-4" />
                  {getFieldError('newPassword')}
                </p>
              )}

              {/* Password strength indicator */}
              {newPassword && fieldTouched.newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${passwordStrength.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={passwordStrength.length ? 'text-green-600' : 'text-gray-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${passwordStrength.uppercase && passwordStrength.lowercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={passwordStrength.uppercase && passwordStrength.lowercase ? 'text-green-600' : 'text-gray-500'}>
                      Uppercase and lowercase letters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${passwordStrength.number ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={passwordStrength.number ? 'text-green-600' : 'text-gray-500'}>
                      At least one number
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${passwordStrength.special ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={passwordStrength.special ? 'text-green-600' : 'text-gray-500'}>
                      Special character (!@#$%^&*)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: theme.colors.textDark }}>
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5" style={{ color: '#9CA3AF' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-100 border focus:outline-none focus:ring-2 transition"
                  style={{
                    borderColor: getFieldError('confirmPassword') ? theme.colors.error : '#D1D5DB',
                    '--tw-ring-color': theme.colors.orange
                  }}
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {getFieldError('confirmPassword') && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: theme.colors.errorDark }}>
                  <AlertCircle className="w-4 h-4" />
                  {getFieldError('confirmPassword')}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !isOnline}
              className="w-full py-3 font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition transform hover:scale-105"
              style={{
                ...orangeBg,
                opacity: (isLoading || !isOnline) ? 0.7 : 1
              }}
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Resetting Password...</>
              ) : (
                <><CheckCircle className="w-5 h-5" /> Reset Password</>
              )}
            </button>
          </form>
        )}

        {/* Navigation */}
        <div className="mt-6 text-center">
          {currentStep === 'verify' && (
            <div className="space-y-2">
              <button
                onClick={() => setCurrentStep('request')}
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition"
                style={{ color: theme.colors.orange }}
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
              onClick={handleBackToLogin}
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition"
              style={{ color: theme.colors.orange }}
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