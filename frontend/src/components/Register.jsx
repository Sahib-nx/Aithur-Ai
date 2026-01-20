import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, X, CheckCircle, AlertCircle, Loader2, Sparkles, User, Shield } from 'lucide-react';
import { axiosInstance } from '../../utils/axiosIntance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';


const RegisterModal = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showMessage, setShowMessage] = useState(false);

  const [, setAuthUser] = useAuth();
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

  };

  const navigate = useNavigate();

  // Simulate API call
  const handleRegister = async (e) => {
    e.preventDefault();

    // Set loading state and clear previous messages at the START
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    setShowMessage(false);

    try {
      const response = await axiosInstance.post('/user/register', formData);

      console.log(response.data);

      if (response.status === 201) {
        setMessage({ type: 'success', text: response.data.message });
        setShowMessage(true);
        localStorage.setItem("user", JSON.stringify(response.data.payload));
        localStorage.setItem("localStrToken", response.data.localStrToken);
        setAuthUser(response.data.localStrToken)
        navigate("/")
        toast.success(response.data.message);
        
      }

    } catch (error) {
      if (error.response && [400, 401, 403, 404, 500].includes(error.response.status)) {
        setMessage({
          type: 'error',
          text: error.response.data.message || "Something Went Wrong While Processing Your Request"
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Something went wrong. Please try again.'
        });
      }
      setShowMessage(true);

    } finally {
      // Always stop loading in the finally block
      setIsLoading(false);
    }
  };

  // Auto hide message after 4 seconds
  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false);
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      rotateX: -15,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      rotateX: 15,
      transition: { duration: 0.3 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const messageVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.9,
      transition: { duration: 0.3 }
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <AnimatePresence>

        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          {/* Modal */}
          <motion.div
            className="relative z-50 w-full max-w-md"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-ping"></div>
            </div>

            {/* Main modal container */}
            <div className="relative bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-purple-900/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl overflow-hidden">


              {/* Header with logo space */}
              <div className="px-8 pt-8 pb-4 text-center">
                {/* Logo placeholder with futuristic design */}
                <motion.div
                  className="mx-auto w-25 h-25  flex items-center justify-center mb-4  shadow-cyan-500/25"
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <img src="logo.png" alt="Aithur Logo" className="max-h-25 drop-shadow-[0_0_4px_#00FFFF]" />
                </motion.div>

                <motion.h2
                  className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Create Account
                </motion.h2>

                <motion.p
                  className="text-slate-400 text-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Join the future of AI assistance
                </motion.p>
              </div>

              {/* Message Display */}
              <AnimatePresence>
                {showMessage && (
                  <motion.div
                    className="mx-8 mb-4"
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className={`p-4 rounded-lg border flex items-center space-x-3 ${message.type === 'success'
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
                onSubmit={handleRegister}
                className="px-8 pb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="space-y-5">
                  {/* Username field */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <motion.input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                        placeholder="Enter your Username"
                        required
                        whileFocus={{ scale: 1.02 }}
                      />
                    </div>
                  </div>

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
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                        placeholder="Enter your email"
                        required
                        whileFocus={{ scale: 1.02 }}
                      />
                    </div>
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
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                        placeholder="Create a strong password"
                        required
                        whileFocus={{ scale: 1.02 }}
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </motion.button>
                    </div>


                  </div>

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    onChange={handleRegister}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </motion.button>

                  {/* Terms and Privacy */}
                  <motion.p
                    className="text-xs text-slate-500 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    By creating an account, you agree to our{' '}
                    <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
                      Privacy Policy
                    </a>
                  </motion.p>

                  {/* Footer links */}
                  <div className="text-center">
                    <motion.p
                      className="text-sm text-slate-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      Already have an account?{' '}
                      <Link to= "/login" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200">Sign in</Link>
                    </motion.p>
                  </div>
                </div>
              </motion.form>
            </div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
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

export default RegisterModal;