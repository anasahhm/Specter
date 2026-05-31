import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useInvestigation } from '../hooks/useInvestigation';
import { useNavigate } from 'react-router-dom';

export default function InvestigationForm({ onClose, onSuccess }) {
  const [targetType, setTargetType] = useState('url');
  const [targetValue, setTargetValue] = useState('');
  const { startInvestigation, loading, error } = useInvestigation();
  const navigate = useNavigate();

  const targetTypes = [
    { value: 'url', label: 'URL / Website', placeholder: 'google.com or https://suspicious-site.com' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetValue.trim()) return;

    try {
      const investigationId = await startInvestigation(targetType, targetValue);
      navigate(`/investigation/${investigationId}`);
      onSuccess?.();
    } catch (err) {
      console.error('Investigation failed:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-spec-surface border border-spec-border/50 rounded-lg overflow-hidden"
    >
      
      <div className="absolute inset-0 bg-gradient-to-br from-spec-accent/5 to-spec-info/5 pointer-events-none" />

      
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 hover:bg-spec-surface/50 rounded-lg transition-colors border border-transparent hover:border-spec-border/50"
      >
        <X className="w-5 h-5 text-gray-400" />
      </button>

      <div className="relative z-10 p-8">
        <h2 className="text-2xl font-bold text-white mb-2 font-sans tracking-tight uppercase">START INVESTIGATION</h2>
        <p className="text-gray-400 mb-6 font-serif">Analyze any digital entity for threats and suspicious activity</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-white mb-3 font-sans uppercase tracking-wider">What would you like to investigate?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {targetTypes.map(type => (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setTargetType(type.value)}
                  className={`p-3 rounded-lg border-2 transition-all font-medium text-sm font-serif ${
                    targetType === type.value
                      ? 'border-spec-accent bg-spec-accent/10 text-spec-accent'
                      : 'border-spec-border/50 bg-spec-surface/50 text-gray-400 hover:border-spec-accent/30'
                  }`}
                >
                  {type.label}
                </motion.button>
              ))}
            </div>
          </div>

          
          <div>
            <label className="block text-sm font-semibold text-white mb-2 font-sans uppercase tracking-wider">
              {targetTypes.find(t => t.value === targetType)?.label}
            </label>
            <textarea
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder={targetTypes.find(t => t.value === targetType)?.placeholder}
              className="w-full px-4 py-3 bg-spec-surface border border-spec-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-spec-accent focus:ring-1 focus:ring-spec-accent/50 resize-none font-serif"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-2 font-mono">
              Paste single or multiple values (one per line)
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50">
              <p className="text-red-400 text-sm font-serif">{error}</p>
            </div>
          )}

          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!targetValue.trim() || loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-spec-accent to-spec-accent-light text-white rounded-lg font-bold flex items-center justify-center space-x-2 hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-sans uppercase tracking-wider text-sm"
          >
            <span>Begin Analysis</span>
            <Send className="w-4 h-4" />
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}