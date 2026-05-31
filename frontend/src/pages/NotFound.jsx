import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-spec-bg flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold text-spec-accent font-space mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Page not found</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-spec-accent text-spec-bg rounded-lg font-bold hover:shadow-glow transition-all"
        >
          Return Home
        </button>
      </motion.div>
    </div>
  );
}