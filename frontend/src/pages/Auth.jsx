import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/client';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await apiClient.post(endpoint, formData);

      if (response.data.success) {
        login(response.data.token, response.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen bg-spec-bg flex items-center justify-center px-4">
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-spec-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-spec-info/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
      
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-block px-4 py-2 rounded-full border border-spec-accent/30 bg-spec-accent/5 text-spec-accent text-sm font-space mb-4">
            SPECTER AUTHENTICATION
          </div>
          <h1 className="text-3xl font-bold text-white font-space mb-2">
            {isLogin ? 'Welcome Back' : 'Join Specter'}
          </h1>
          <p className="text-gray-400">
            {isLogin 
              ? 'Sign in to access your threat intelligence hub' 
              : 'Create an account to start investigating'}
          </p>
        </motion.div>

        
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-xl border border-spec-border/50 bg-spec-surface/30 backdrop-blur-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLogin && (
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-white mb-2">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-spec-surface border border-spec-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-spec-accent focus:ring-1 focus:ring-spec-accent/50 transition-all"
                />
              </motion.div>
            )}

            
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-white mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-spec-surface border border-spec-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-spec-accent focus:ring-1 focus:ring-spec-accent/50 transition-all"
                />
              </div>
            </motion.div>

            
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-white mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-12 py-3 bg-spec-surface border border-spec-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-spec-accent focus:ring-1 focus:ring-spec-accent/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            
            {error && (
              <motion.div
                variants={itemVariants}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/50"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-spec-accent text-spec-bg rounded-lg font-bold hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
            </motion.button>
          </form>

          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ email: '', password: '', displayName: '' });
                }}
                className="text-spec-accent hover:text-spec-accent/80 font-semibold transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </motion.div>
        </motion.div>

        
        <motion.div variants={itemVariants} className="mt-6 p-4 rounded-lg border border-spec-border/30 bg-spec-surface/20">
          <p className="text-xs text-gray-500 mb-2"></p>
          <p className="text-xs text-gray-400">Email: <span className="text-spec-accent"></span></p>
          <p className="text-xs text-gray-400">Password: <span className="text-spec-accent"></span></p>
        </motion.div>
      </motion.div>
    </div>
  );
}
