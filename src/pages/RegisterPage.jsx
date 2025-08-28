import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';
import toast from 'react-hot-toast';
import {
  Eye, EyeOff, User, Mail, Lock, Phone, AlertCircle, CheckCircle, Loader2,
  WifiOff, Shield, AlertTriangle, Check, X
} from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '', password: '', phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [realtimeErrors, setRealtimeErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [emailExists, setEmailExists] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailCheckError, setEmailCheckError] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);
  const [usernameChecking] = useState(false);
  const [usernameCheckError] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false, uppercase: false, lowercase: false, number: false, special: false
  });
  const [emailDebounceTimer, setEmailDebounceTimer] = useState(null);

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); if (generalError.includes('internet')) setGeneralError(''); };
    const handleOffline = () => { setIsOnline(false); setGeneralError('No internet connection. Please check your network.'); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, [generalError]);

  const validateFieldRealtime = (field, value, all) => {
    if (!fieldTouched[field] || !value.trim()) return null;
    switch (field) {
      case 'firstName':
        if (value.length < 3) return 'First Name must be at least 3 characters long.';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'First name can only contain letters and spaces.';
        if (all.lastName && value.toLowerCase() === all.lastName.toLowerCase()) return 'First Name and Last Name cannot be the same.';
        return null;
      case 'lastName':
        if (value.length < 3) return 'Last Name must be at least 3 characters long.';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Last name can only contain letters and spaces.';
        if (all.firstName && value.toLowerCase() === all.firstName.toLowerCase()) return 'First Name and Last Name cannot be the same.';
        return null;
      case 'username':
        if (value.length < 3) return 'Username must be at least 3 characters long.';
        if (value.length > 20) return 'Username cannot exceed 20 characters.';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores.';
        return null;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.';
        if (value.length > 254) return 'Email address is too long.';
        return null;
      case 'password':
        if (value.length < 8) return 'Hey! Your password is too short. Make it at least 8 characters.';
        if (value.length > 128) return 'Password cannot exceed 128 characters.';
        if (!passwordStrength.uppercase) return 'Include at least one uppercase letter (A-Z) in your password.';
        if (!passwordStrength.lowercase) return 'Include at least one lowercase letter (a-z) in your password.';
        if (!passwordStrength.number) return 'Add at least one number (0-9) to your password.';
        if (!passwordStrength.special) return 'Add a special character like !@#$%^&* to your password.';
        return null;
      case 'phoneNumber':
        if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(value)) return 'Please enter a valid phone number.';
        return null;
      default: return null;
    }
  };

  useEffect(() => {
    const newRealtime = {};
    Object.keys(formData).forEach(field => {
      const err = validateFieldRealtime(field, formData[field], formData);
      if (err) newRealtime[field] = err;
    });
    setRealtimeErrors(newRealtime);
  }, [formData, fieldTouched, passwordStrength]);

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const checkEmailAvailability = async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setEmailChecking(true); setEmailCheckError(false); setEmailExists(false);
    try {
      const response = await axios.get(`/Authentication/emailexists/${encodeURIComponent(email)}`, { timeout: 5000 });
      setEmailExists(response.data === true);
    } catch (err) {
      setEmailCheckError(true);
    } finally {
      setEmailChecking(false);
    }
  };

  const performAutoLogin = async (email, password) => {
    try {
      const loginResponse = await axios.post('Authentication/login', {
        email: email.trim().toLowerCase(),
        password
      });
      if (loginResponse.data?.token) {
        localStorage.setItem('token', loginResponse.data.token);
        // [FIX] store both keys so all pages agree
        const userPayload = {
          username: loginResponse.data.username,
          email: loginResponse.data.email,
          firstname: loginResponse.data.firstname,
          lastname: loginResponse.data.lastname,
        };
        localStorage.setItem('user', JSON.stringify(userPayload));       // legacy key
        localStorage.setItem('userInfo', JSON.stringify(userPayload));   // key used elsewhere

        // [FIX] set axios auth header right away
        try {
          axios.defaults.headers.common.Authorization = `Bearer ${loginResponse.data.token}`;
        } catch {}

        // [FIX] notify same-tab listeners (MenuPage listens to this)
        window.dispatchEvent(new Event('localStorageChange'));

        sessionStorage.removeItem('scrollPosition');
        navigate('/', { replace: true });
        setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }), 100);
        return true;
      }
      return false;
    } catch {
      sessionStorage.removeItem('scrollPosition');
      navigate('/login', { replace: true });
      setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }), 100);
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: [] }));
    setGeneralError('');
    setSuccessMessage('');
    setFieldTouched(prev => ({ ...prev, [name]: true }));
    if (name === 'password') checkPasswordStrength(value);
    if (name === 'email') {
      setEmailExists(false);
      setEmailCheckError(false);
      if (emailDebounceTimer) clearTimeout(emailDebounceTimer);
      const timer = setTimeout(() => { checkEmailAvailability(value); }, 800);
      setEmailDebounceTimer(timer);
    }
    if (name === 'username') setUsernameExists(false);
  };

  const handleBlur = (e) => setFieldTouched(prev => ({ ...prev, [e.target.name]: true }));

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = ['First name is required.'];
    else if (formData.firstName.length < 3) e.firstName = ['First Name must be at least 3 characters long.'];
    else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) e.firstName = ['First name can only contain letters and spaces.'];
    else if (formData.lastName && formData.firstName.toLowerCase() === formData.lastName.toLowerCase()) e.firstName = ['First Name and Last Name cannot be the same.'];

    if (!formData.lastName.trim()) e.lastName = ['Last name is required.'];
    else if (formData.lastName.length < 3) e.lastName = ['Last Name must be at least 3 characters long.'];
    else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) e.lastName = ['Last name can only contain letters and spaces.'];
    else if (formData.firstName && formData.lastName.toLowerCase() === formData.firstName.toLowerCase()) e.lastName = ['First Name and Last Name cannot be the same.'];

    if (!formData.username.trim()) e.username = ['Username is required.'];
    else if (formData.username.length < 3) e.username = ['Username must be at least 3 characters long.'];
    else if (formData.username.length > 20) e.username = ['Username cannot exceed 20 characters.'];
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) e.username = ['Username can only contain letters, numbers, and underscores.'];

    if (!formData.email.trim()) e.email = ['Email is required.'];
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = ['Please enter a valid email address.'];
    else if (formData.email.length > 254) e.email = ['Email address is too long.'];
    else if (emailExists) e.email = ['This email is already taken. Try logging in instead?'];

    if (!formData.password) e.password = ['Password is required.'];
    else if (formData.password.length < 8) e.password = ['Hey! Your password is too short. Make it at least 8 characters.'];
    else if (formData.password.length > 128) e.password = ['Password cannot exceed 128 characters.'];
    else {
      const s = passwordStrength;
      if (!s.uppercase) e.password = ['Include at least one uppercase letter (A-Z) in your password.'];
      else if (!s.lowercase) e.password = ['Include at least one lowercase letter (a-z) in your password.'];
      else if (!s.number) e.password = ['Add at least one number (0-9) to your password.'];
      else if (!s.special) e.password = ['Add a special character like !@#$%^&* to your password.'];
    }

    if (!formData.phoneNumber.trim()) e.phoneNumber = ['Phone number is required.'];
    else if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(formData.phoneNumber)) e.phoneNumber = ['Please enter a valid phone number.'];

    return e;
  };

  const processServerErrors = (errorData) => {
    const newErrors = {};
    if (errorData.errors) {
      if (Array.isArray(errorData.errors)) {
        errorData.errors.forEach((msg) => {
          if (typeof msg === 'string') {
            const m = msg.toLowerCase();
            if (m.includes('username')) { newErrors.username = [msg]; if (m.includes('taken') || m.includes('exists')) setUsernameExists(true); }
            else if (m.includes('email')) { newErrors.email = [msg]; if (m.includes('taken') || m.includes('exists')) setEmailExists(true); }
            else if (m.includes('first name')) newErrors.firstName = [msg];
            else if (m.includes('last name')) newErrors.lastName = [msg];
            else if (m.includes('password')) newErrors.password = [msg];
            else if (m.includes('phone')) newErrors.phoneNumber = [msg];
            else setGeneralError(msg);
          }
        });
      } else if (typeof errorData.errors === 'object') {
        Object.keys(errorData.errors).forEach(field => {
          const key = field.toLowerCase();
          const msgs = Array.isArray(errorData.errors[field]) ? errorData.errors[field] : [errorData.errors[field]];
          if (key === 'firstname' || key === 'first_name') newErrors.firstName = msgs;
          else if (key === 'lastname' || key === 'last_name') newErrors.lastName = msgs;
          else if (key === 'username') { newErrors.username = msgs; if (msgs.join(' ').toLowerCase().match(/taken|exists|already/)) setUsernameExists(true); }
          else if (key === 'email') { newErrors.email = msgs; if (msgs.join(' ').toLowerCase().match(/taken|exists|already/)) setEmailExists(true); }
          else if (key === 'password') newErrors.password = msgs;
          else if (key === 'phonenumber' || key === 'phone_number') newErrors.phoneNumber = msgs;
          else {
            const match = Object.keys(formData).find(k => k.toLowerCase() === key);
            if (match) newErrors[match] = msgs;
          }
        });
      }
    }
    const msg = errorData.message || errorData.errorMessage || '';
    if (msg && Object.keys(newErrors).length === 0) {
      const m = msg.toLowerCase();
      if (m.includes('username')) {
        if (m.match(/taken|exists|already/)) { newErrors.username = ['This username is already taken. Please choose another.']; setUsernameExists(true); }
        else newErrors.username = [msg];
      } else if (m.includes('email')) {
        if (m.match(/taken|exists|already/)) { newErrors.email = ['This email is already taken. Try logging in instead?']; setEmailExists(true); }
        else newErrors.email = [msg];
      } else if (m.includes('password')) newErrors.password = [msg];
      else if (m.includes('first name')) newErrors.firstName = [msg];
      else if (m.includes('last name')) newErrors.lastName = [msg];
      else if (m.includes('phone')) newErrors.phoneNumber = [msg];
      else if (m !== 'validation failed') setGeneralError(msg);
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOnline) { setGeneralError('No internet connection. Please check your network.'); return; }
    setGeneralError(''); setSuccessMessage('');
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return; }
    if (emailExists) { setErrors({ email: ['This email is already taken. Try logging in instead?'] }); return; }
    if (emailChecking) { setGeneralError('Please wait while we verify your email.'); return; }

    setIsLoading(true); setErrors({});
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim()
      };
      const response = await axios.post('Authentication/register', payload, { headers: { 'Content-Type': 'application/json' } });
      setSuccessMessage('Registration completed successfully! Logging you in...');
      toast.success('Registration successful! Logging you in...');
      setTimeout(async () => {
        const ok = await performAutoLogin(formData.email, formData.password);
        if (!ok) toast.error('Registration successful, but auto-login failed. Please login manually.');
      }, 1500);
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        const fieldErrs = processServerErrors(data);
        if (Object.keys(fieldErrs).length > 0) setErrors(fieldErrs);
        else {
          switch (status) {
            case 400: setGeneralError(data.message || data.errorMessage || 'Invalid request. Please check your input.'); break;
            case 409: {
              const msg = data.message || data.errorMessage || '';
              if (msg.toLowerCase().includes('username')) { setErrors({ username: ['This username is already taken. Please choose another.'] }); setUsernameExists(true); }
              else if (msg.toLowerCase().includes('email')) { setErrors({ email: ['This email is already taken. Try logging in instead?'] }); setEmailExists(true); }
              else setGeneralError(msg || 'Registration conflict. Please try again.');
              break;
            }
            case 422: setGeneralError(data.message || data.errorMessage || 'Invalid data provided.'); break;
            case 429: setGeneralError(data.message || data.errorMessage || 'Too many requests. Please try again later.'); break;
            case 500: setGeneralError('Server error. Please try again later.'); break;
            case 502: setGeneralError('Service temporarily unavailable. Please try again later.'); break;
            case 503: setGeneralError('Service is under maintenance. Please try again later.'); break;
            default: setGeneralError(`Registration failed (${status}). Please try again.`); break;
          }
        }
      } else if (err.request) {
        if (err.code === 'ECONNABORTED') setGeneralError('Request timeout. Please try again.');
        else if (err.code === 'ERR_NETWORK') setGeneralError('Network error. Please check your connection.');
        else setGeneralError('Unable to connect to server. Please try again.');
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    } finally { setIsLoading(false); }
  };

  const icons = {
    firstName: <User className="w-5 h-5" />,
    lastName: <User className="w-5 h-5" />,
    username: <User className="w-5 h-5" />,
    email: <Mail className="w-5 h-5" />,
    password: <Lock className="w-5 h-5" />,
    phoneNumber: <Phone className="w-5 h-5" />,
  };
  const labels = {
    firstName: 'First Name',
    lastName: 'Last Name',
    username: 'Username',
    email: 'Email Address',
    password: 'Password',
    phoneNumber: 'Phone Number',
  };

  const getFieldValidationIcon = (field) => {
    if (field === 'email') {
      if (emailChecking) return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      if (emailCheckError) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      if (emailExists) return <X className="w-5 h-5 text-red-500" />;
      if (getFieldError(field)) return <X className="w-5 h-5 text-red-500" />;
      if (formData.email && fieldTouched.email && !getFieldError(field)) return <Check className="w-5 h-5 text-green-500" />;
    }
    if (field === 'username') {
      if (getFieldError(field)) return <X className="w-5 h-5 text-red-500" />;
      if (formData.username && fieldTouched.username && !getFieldError(field)) return <Check className="w-5 h-5 text-green-500" />;
    }
    if (fieldTouched[field] && formData[field]) {
      if (getFieldError(field)) return <X className="w-5 h-5 text-red-500" />;
      return <Check className="w-5 h-5 text-green-500" />;
    }
    return null;
  };

  const getFieldError = (field) => {
    if (errors[field]?.length) return errors[field][0];
    if (realtimeErrors[field]) return realtimeErrors[field];
    if (field === 'email' && emailExists) return 'This email is already taken. Try logging in instead?';
    if (field === 'username' && usernameExists) return 'This username is already taken. Please choose another.';
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 dark:from-gray-900 dark:via-gray-950 dark:to-black">
      <div className="w-full max-w-md rounded-3xl p-8 shadow-2xl bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-orange-100 dark:bg-gray-800">
            <User className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
            Create Account
          </h2>
        </div>

        {!isOnline && (
          <div className="mb-4 p-2 rounded-xl flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm">Offline</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl flex items-center gap-2 border bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-gray-800 dark:text-gray-100">
            <CheckCircle className="w-4 h-4 text-orange-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {generalError && (
          <div className="mb-4 p-3 rounded-xl flex items-center gap-2 border bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4" />
            <span className="flex-1">{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {Object.keys(formData).map(field => (
            <div key={field}>
              <label className="block text-sm mb-1 text-gray-800 dark:text-gray-200">
                {labels[field]}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500">
                  {icons[field]}
                </span>
                <input
                  type={field === 'password' ? (showPassword ? 'text' : 'password') : field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                  ${getFieldError(field) ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-700 focus:ring-orange-400 dark:focus:ring-orange-500'}`}
                  placeholder={`Enter your ${labels[field].toLowerCase()}`}
                  disabled={isLoading}
                  autoComplete={field === 'password' ? 'new-password' : field}
                />
                {field === 'password' && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                )}
                {field !== 'password' && (
                  <div className="absolute right-3 top-3.5">
                    {getFieldValidationIcon(field)}
                  </div>
                )}
              </div>

              {getFieldError(field) && (
                <p className="text-sm mt-1 flex items-center gap-1 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  {getFieldError(field)}
                </p>
              )}

              {field === 'password' && formData.password && fieldTouched.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${passwordStrength.length ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                    <span className={passwordStrength.length ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${passwordStrength.uppercase && passwordStrength.lowercase ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                    <span className={passwordStrength.uppercase && passwordStrength.lowercase ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}>Uppercase and lowercase letters</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${passwordStrength.number ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                    <span className="text-gray-500 dark:text-gray-400">At least one number</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${passwordStrength.special ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                    <span className="text-gray-500 dark:text-gray-400">Special character (!@#$%^&*)</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading || emailExists || !isOnline || emailChecking}
            className="w-full py-3 font-semibold text-white rounded-xl transition duration-300 flex justify-center items-center gap-2 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : !isOnline ? (
              <>
                <WifiOff className="w-5 h-5" />
                No Connection
              </>
            ) : emailChecking ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Validating Email...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            className="font-medium hover:underline text-orange-600 dark:text-orange-400"
            onClick={() => navigate('/login')}
            disabled={isLoading}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
