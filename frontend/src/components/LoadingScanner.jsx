import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SCAN_STAGES = [
  { label: 'INITIALIZING WIRE CONNECTION', duration: 800 },
  { label: 'SUBMITTING URL TO ANAKIN SCRAPER', duration: 1200 },
  { label: 'EXTRACTING PAGE INTELLIGENCE', duration: 2000 },
  { label: 'PARSING MARKDOWN CONTENT', duration: 1000 },
  { label: 'FEEDING DATA TO AI ANALYST', duration: 1500 },
  { label: 'CALCULATING THREAT VECTORS', duration: 1200 },
  { label: 'GENERATING THREAT REPORT', duration: 800 }
];

export function LoadingScanner() {
  return (
    <div className="min-h-screen bg-spec-bg flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="relative w-24 h-24 mx-auto mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 border-4 border-spec-accent/30 rounded-full" />
          <motion.div
            className="absolute inset-2 border-4 border-transparent border-t-spec-accent rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white mb-2 font-space">SCANNING</h2>
        <motion.p
          className="text-spec-accent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Analyzing digital footprint...
        </motion.p>
      </motion.div>
    </div>
  );
}
export default LoadingScanner;