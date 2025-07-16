// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';
import {
  Eye, EyeOff, User, Mail, Lock, Phone, AlertCircle, CheckCircle, Loader2
} from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData]       = useState({
    firstName: '', lastName:'', username:'', email:'', password:'', phoneNumber:''
  });
  const [errors, setErrors]           = useState({});
  const [generalError, setGeneralError]   = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [isLoading, setIsLoading]       = useState(false);

  // email‐exists
  const [emailExists, setEmailExists]       = useState(false);
  const [emailChecking, setEmailChecking]   = useState(false);
  // username‐exists
  const [usernameExists, setUsernameExists]     = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);

  const icons = {
    firstName:   <User  className="w-5 h-5"/>,
    lastName:    <User  className="w-5 h-5"/>,
    username:    <User  className="w-5 h-5"/>,
    email:       <Mail  className="w-5 h-5"/>,
    password:    <Lock  className="w-5 h-5"/>,
    phoneNumber: <Phone className="w-5 h-5"/>,
  };
  const labels = {
    firstName:   'First Name',
    lastName:    'Last Name',
    username:    'Username',
    email:       'Email Address',
    password:    'Password',
    phoneNumber: 'Phone Number',
  };

  const handleChange = async e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    setErrors({});
    setGeneralError('');
    setSuccessMessage('');

    if (name === 'email') {
      setEmailChecking(true);
      try {
        const resp = await axios.get(
          `Authentication/emailexists?email=${encodeURIComponent(value)}`
        );
        setEmailExists(resp.data === true);
      } catch (err) {
        console.error('Email check failed', err);
      } finally {
        setEmailChecking(false);
      }
    }

    if (name === 'username') {
      setUsernameChecking(true);
      try {
        const resp = await axios.get(
          `Authentication/usernameexists?username=${encodeURIComponent(value)}`
        );
        setUsernameExists(resp.data === true);
      } catch (err) {
        console.error('Username check failed', err);
      } finally {
        setUsernameChecking(false);
      }
    }
  };

  const validate = () => {
    const newErr = {};
    if (!formData.firstName.trim()) newErr.firstName = ['First name is required.'];
    if (!formData.lastName.trim())  newErr.lastName  = ['Last name is required.'];
    if (!formData.username.trim())  newErr.username  = ['Username is required.'];
    else if (formData.username.length < 3)
      newErr.username = ['Username must be at least 3 characters.'];

    if (!formData.email.trim()) newErr.email = ['Email is required.'];
    else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(formData.email))
        newErr.email = ['Please enter a valid email address.'];
    }

    if (!formData.phoneNumber.trim())
      newErr.phoneNumber = ['Phone number is required.'];
    else if (!/^\d+$/.test(formData.phoneNumber))
      newErr.phoneNumber = ['Phone must contain digits only.'];

    return newErr;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');
    const clientErr = validate();
    if (Object.keys(clientErr).length) {
      setErrors(clientErr);
      return;
    }

    if (emailExists) {
      setErrors({ email: ['That email is already registered.'] });
      return;
    }
    if (usernameExists) {
      setErrors({ username: ['That username is already taken.'] });
      return;
    }

    setIsLoading(true);
    setErrors({});
    try {
      await axios.post('Authentication/register', formData);
      setSuccessMessage('Registration completed successfully.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const data = err.response?.data;
      if (Array.isArray(data?.errors)) {
        setGeneralError(data.errors[0]);
      } else if (data?.errors && typeof data.errors === 'object') {
        setErrors(data.errors);
      }
      if (data?.errorMessage) {
        setGeneralError(data.errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `linear-gradient(to bottom right,
          ${theme.colors.gradientStart},
          ${theme.colors.gradientMiddle},
          ${theme.colors.gradientEnd})`
      }}
    >
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md">
        {/* header */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full"
            style={{ backgroundColor: theme.colors.orangeLight }}
          >
            <User className="w-8 h-8 mx-auto text-orange-600" />
          </div>
          <h2 className="text-3xl font-semibold" style={{ color: theme.colors.textDark }}>
            Create Account
          </h2>
          <p className="text-sm mt-1" style={{ color: theme.colors.textGray }}>
            Join us and start your journey
          </p>
        </div>

        {/* success & general errors */}
        {successMessage && (
          <div
            className="mb-4 p-3 rounded-xl flex items-center gap-2"
            style={{
              backgroundColor: theme.colors.orangeLight,
              borderColor:     theme.colors.orange,
              color:           theme.colors.textDark
            }}
          >
            <CheckCircle className="w-4 h-4" /> {successMessage}
          </div>
        )}
        {generalError && (
          <div
            className="mb-4 p-3 rounded-xl flex items-center gap-2"
            style={{
              backgroundColor: theme.colors.errorLight,
              borderColor:     theme.colors.error,
              color:           theme.colors.errorDark
            }}
          >
            <AlertCircle className="w-4 h-4" /> {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {Object.keys(formData).map(field => (
            <div key={field}>
              <label
                className="block text-sm mb-1"
                style={{ color: theme.colors.textDark }}
              >
                {labels[field]}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400">
                  {icons[field]}
                </span>
                <input
                  type={field === 'password'
                    ? (showPassword ? 'text' : 'password')
                    : 'text'
                  }
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-100 border focus:ring-2 focus:outline-none"
                  style={{
                    borderColor: errors[field]
                      ? theme.colors.error
                      : '#D1D5DB',
                    color: theme.colors.textDark
                  }}
                  placeholder={`Enter your ${labels[field].toLowerCase()}`}
                />
                {field === 'password' && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword
                      ? <EyeOff className="w-5 h-5"/>
                      : <Eye    className="w-5 h-5"/>}
                  </button>
                )}
                {field === 'email' && emailChecking && (
                  <Loader2 className="w-5 h-5 animate-spin absolute right-3 top-3.5 text-gray-400"/>
                )}
                {field === 'username' && usernameChecking && (
                  <Loader2 className="w-5 h-5 animate-spin absolute right-3 top-3.5 text-gray-400"/>
                )}
              </div>
              {/* field errors */}
              {errors[field] && (
                <p className="text-sm mt-1" style={{ color: theme.colors.error }}>
                  {errors[field][0]}
                </p>
              )}
              {/* live-email & username feedback */}
              {field === 'email' && !errors.email && emailExists && !emailChecking && (
                <p className="text-sm mt-1" style={{ color: theme.colors.error }}>
                  That email is already registered.
                </p>
              )}
              {field === 'username' && !errors.username && usernameExists && !usernameChecking && (
                <p className="text-sm mt-1" style={{ color: theme.colors.error }}>
                  That username is already taken.
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading || emailExists || usernameExists}
            className="w-full py-3 font-semibold text-white rounded-xl transition duration-300 flex justify-center items-center gap-2"
            style={{
              background: `linear-gradient(to right,
                ${theme.colors.orange},
                ${theme.colors.orangeDark})`,
              opacity: (isLoading||emailExists||usernameExists) ? 0.6 : 1
            }}
          >
            {isLoading
              ? <>
                  <Loader2 className="w-5 h-5 animate-spin"/> Creating Account...
                </>
              : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: theme.colors.textGray }}>
          Already have an account?{' '}
          <button
            className="font-medium hover:underline"
            style={{ color: theme.colors.orange }}
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
