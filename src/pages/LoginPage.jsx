import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import theme from '../theme';
import {
  Eye, EyeOff, Mail, Lock, AlertCircle, Loader2
} from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    setGeneralError('');
    setFieldErrors({});

    try {
      const response = await axios.post('Authentication/login', {
        email,
        password
      });
      console.log('Login successful:', response.data);
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      if (err.response) {
        const { data } = err.response;
        if (data.message) setGeneralError(data.message);
        if (data.errors) setFieldErrors(data.errors);
      } else {
        setGeneralError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `linear-gradient(to bottom right, ${theme.colors.gradientStart}, ${theme.colors.gradientMiddle}, ${theme.colors.gradientEnd})`
      }}
    >
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.colors.orangeLight }}
          >
            <Lock className="w-7 h-7" style={{ color: theme.colors.orangeDark }} />
          </div>
          <h2 className="text-3xl font-semibold" style={{ color: theme.colors.textDark }}>
            Sign in to Your Account
          </h2>
          <p className="text-sm mt-1" style={{ color: theme.colors.textGray }}>
            Access your dashboard securely
          </p>
        </div>

        {generalError && (
          <div
            className="mb-4 p-3 border rounded-xl flex items-center gap-2"
            style={{
              backgroundColor: theme.colors.errorLight,
              borderColor: theme.colors.error,
              color: theme.colors.errorDark
            }}
          >
            <AlertCircle className="w-4 h-4" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-5">
          <div>
            <label className="block text-sm mb-1" style={{ color: theme.colors.textDark }}>
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5" style={{ color: '#9CA3AF' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 border focus:outline-none focus:ring-2`}
                style={{
                  borderColor: fieldErrors.email ? theme.colors.error : '#D1D5DB',
                  outlineColor: theme.colors.orange,
                  ringColor: theme.colors.orange
                }}
                placeholder="you@example.com"
                required
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs mt-1" style={{ color: theme.colors.errorDark }}>
                {fieldErrors.email[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: theme.colors.textDark }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5" style={{ color: '#9CA3AF' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-100 border focus:outline-none focus:ring-2"
                style={{
                  borderColor: fieldErrors.password ? theme.colors.error : '#D1D5DB',
                  outlineColor: theme.colors.orange,
                  ringColor: theme.colors.orange
                }}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5"
                style={{ color: '#9CA3AF' }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs mt-1" style={{ color: theme.colors.errorDark }}>
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2" style={{ color: theme.colors.textGray }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-orange-500"
              />
              Remember me
            </label>
            <button type="button" className="hover:underline" style={{ color: theme.colors.orange }}>
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 font-semibold text-white rounded-xl transition duration-300 flex justify-center items-center gap-2"
            style={{
              background: `linear-gradient(to right, ${theme.colors.orange}, ${theme.colors.orangeDark})`,
              opacity: isLoading ? 0.5 : 1
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Logging in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: theme.colors.textGray }}>
          Don’t have an account?
          <button
            onClick={() => navigate('/register')}
            className="ml-1 font-medium hover:underline"
            style={{ color: theme.colors.orange }}
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
