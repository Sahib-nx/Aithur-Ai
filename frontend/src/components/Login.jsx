import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { axiosInstance } from '../../utils/axiosIntance';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

// Constants
const MESSAGE_DISPLAY_DURATION = 3000;
const ANIMATION_DELAYS = {
  logo: 0,
  title: 0.3,
  subtitle: 0.4,
  form: 0.5,
  footer: 0.8
};

// Custom hook for form validation
const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = useCallback((formData) => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const clearError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return { errors, validateForm, clearError };
};

// Custom hook for message handling
const useMessage = () => {
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showMessage, setShowMessage] = useState(false);

  const showMessageWithTimer = useCallback((type, text) => {
    setMessage({ type, text });
    setShowMessage(true);
  }, []);

  const clearMessage = useCallback(() => {
    setShowMessage(false);
    setMessage({ type: '', text: '' });
  }, []);

  // Auto hide message after specified duration
  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(clearMessage, MESSAGE_DISPLAY_DURATION);
      return () => clearTimeout(timer);
    }
  }, [showMessage, clearMessage]);

  return { message, showMessage, showMessageWithTimer, clearMessage };
};

const LoginModal = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [, setAuthUser] = useAuth();
  const navigate = useNavigate();
  
  const { errors, validateForm, clearError } = useFormValidation();
  const { message, showMessage, showMessageWithTimer, clearMessage } = useMessage();

  // Handle input changes with validation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      clearError(name);
    }
  }, [errors, clearError]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Handle login submission
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);
    clearMessage();

    try {
      const response = await axiosInstance.post('/user/login', formData);

      if (response.status === 200) {
        const { message: successMessage, payload, localStrToken } = response.data;
        
        showMessageWithTimer('success', successMessage);
        
        // Store auth data
        localStorage.setItem("user", JSON.stringify(payload));
        localStorage.setItem("localStrToken", localStrToken);
        setAuthUser(localStrToken);

        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }

    } catch (error) {
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status) {
        const statusMessages = {
          400: 'Invalid request. Please check your input.',
          401: 'Invalid credentials. Please try again.',
          403: 'Access denied. Please contact support.',
          404: 'Service not found. Please try again later.',
          500: 'Server error. Please try again later.'
        };
        errorMessage = statusMessages[error.response.status] || errorMessage;
      }
      
      showMessageWithTimer('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, clearMessage, showMessageWithTimer, setAuthUser, navigate]);

  // Memoized animation variants
  const animationVariants = useMemo(() => ({
    modal: {
      hidden: { opacity: 0, scale: 0.8, rotateX: -15 },
      visible: { 
        opacity: 1, 
        scale: 1, 
        rotateX: 0,
        transition: { duration: 0.5, ease: "easeOut" }
      },
      exit: { 
        opacity: 0, 
        scale: 0.8, 
        rotateX: 15,
        transition: { duration: 0.3 }
      }
    },
    overlay: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 }
    },
    message: {
      hidden: { opacity: 0, y: -20, scale: 0.9 },
      visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { duration: 0.4, ease: "easeOut" }
      },
      exit: { 
        opacity: 0, 
        y: -20, 
        scale: 0.9,
        transition: { duration: 0.3 }
      }
    }
  }), []);

  // Check if form is valid for submit button state
  const isFormValid = useMemo(() => {
    return formData.email.trim() && formData.password.trim() && Object.keys(errors).length === 0;
  }, [formData, errors]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <AnimatePresence>
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            variants={animationVariants.overlay}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          {/* Modal */}
          <motion.div
            className="relative z-50 w-full max-w-md"
            variants={animationVariants.modal}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-ping" />
            </div>

            {/* Main modal container */}
            <div className="relative bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-purple-900/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl overflow-hidden">
              
              {/* Header with logo */}
              <div className="px-8 pt-8 pb-4 text-center">
                <motion.div
                  className="mx-auto w-25 h-25 rounded-xl flex items-center justify-center mb-4 shadow-cyan-500/25"
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: ANIMATION_DELAYS.logo }}
                >
                  <img 
                    src="logo.png" 
                    alt="Aithur Logo" 
                    className="max-h-25 drop-shadow-[0_0_4px_#00FFFF]"
                    loading="eager"
                  />
                </motion.div>

                <motion.h2
                  className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ANIMATION_DELAYS.title, duration: 0.6 }}
                >
                  Welcome Back
                </motion.h2>

                <motion.p
                  className="text-slate-400 text-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ANIMATION_DELAYS.subtitle, duration: 0.6 }}
                >
                  Sign in to access your AI assistant
                </motion.p>
              </div>

              {/* Message Display */}
              <AnimatePresence>
                {showMessage && (
                  <motion.div
                    className="mx-8 mb-4"
                    variants={animationVariants.message}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className={`p-4 rounded-lg border flex items-center space-x-3 ${
                      message.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                      {message.type === 'success' ? (
                        <CheckCircle size={20} />
                      ) : (
                        <AlertCircle size={20} />
                      )}
                      <span className="text-sm font-medium">{message.text}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <motion.form
                className="px-8 pb-8"
                onSubmit={handleLogin}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ANIMATION_DELAYS.form, duration: 0.6 }}
                noValidate
              >
                <div className="space-y-6">
                  {/* Email field */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <motion.input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                          errors.email 
                            ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' 
                            : 'border-slate-600/50 focus:ring-cyan-500/50 focus:border-cyan-500/50'
                        }`}
                        placeholder="Enter your email"
                        required
                        disabled={isLoading}
                        whileFocus={{ scale: 1.02 }}
                      />
                    </div>
                    {errors.email && (
                      <motion.p
                        className="mt-1 text-sm text-red-400"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  {/* Password field */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <motion.input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        name="password"
                        onChange={handleChange}
                        className={`w-full pl-10 pr-12 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                          errors.password 
                            ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' 
                            : 'border-slate-600/50 focus:ring-cyan-500/50 focus:border-cyan-500/50'
                        }`}
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
                        whileFocus={{ scale: 1.02 }}
                      />
                      <motion.button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
                        disabled={isLoading}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </motion.button>
                    </div>
                    {errors.password && (
                      <motion.p
                        className="mt-1 text-sm text-red-400"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </div>

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading || !isFormValid}
                    className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </motion.button>

                  {/* Footer links */}
                  <motion.div
                    className="text-center space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: ANIMATION_DELAYS.footer }}
                  >
                    <motion.a
                      href="#"
                      className="text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-200 block"
                      whileHover={{ scale: 1.05 }}
                    >
                      Forgot your password?
                    </motion.a>
                    <motion.p className="text-sm text-slate-500">
                      Don't have an account?{' '}
                      <Link 
                        to="/register" 
                        className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                      >
                        Sign up
                      </Link>
                    </motion.p>
                  </motion.div>
                </div>
              </motion.form>
            </div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 6 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [-20, -40, -20],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </>
      </AnimatePresence>
    </div>
  );
};

export default LoginModal;