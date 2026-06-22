import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const Register = () => {
  const { register, handleSubmit, formState: { errors }, getValues, trigger } = useForm();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [formData, setFormData] = useState(null);
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSendOtp = async () => {
    const isValid = await trigger(); // Validates all fields
    if (!isValid) return;

    const data = getValues();
    setLoading(true);
    setServerError('');
    try {
      await api.post('/auth/send-otp', { email: data.email });
      setFormData(data);
      setOtpSent(true);
    } catch (error) {
      setServerError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otpValue || otpValue.length !== 6) {
      setServerError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      // 1. Verify OTP
      await api.post('/auth/verify-otp', { email: formData.email, otp: otpValue });
      
      // 2. Register User
      const response = await api.post('/auth/register', formData);
      login(response.data);
      navigate('/profile');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Failed to verify OTP or register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6 text-center">Create a new account</h3>
      {serverError && <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">{serverError}</div>}
      
      {!otpSent ? (
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
            <div className="mt-1">
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address *</label>
            <div className="mt-1">
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number *</label>
            <div className="mt-1">
              <input
                {...register('phone', { required: 'Mobile number is required', pattern: { value: /^[0-9]{10}$/, message: 'Invalid 10-digit mobile number' } })}
                type="tel"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password *</label>
            <div className="mt-1">
              <input
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                type="password"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP via Email'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndRegister} className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-md mb-4 text-green-800 dark:text-green-400 text-sm">
            An OTP has been sent to your email <strong>{formData?.email}</strong>.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enter 6-digit OTP *</label>
            <div className="mt-1">
              <input
                type="text"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-center tracking-widest text-lg"
                placeholder="000000"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading || otpValue.length !== 6}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Sign up'}
            </button>
          </div>
          <div className="text-center mt-2">
            <button
              type="button"
              onClick={() => { setOtpSent(false); setOtpValue(''); }}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Change Email
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
        <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">Sign in</Link>
      </div>
    </div>
  );
};

export default Register;
