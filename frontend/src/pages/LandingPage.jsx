import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, TrendingUp, Lock, Eye, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThreatLogBackground from './ThreatLogBackground';
import AnalysisPanels      from './AnalysisPanels';
import HUDRings            from './HUDRings';
import AlertFlash          from './AlertFlash';
import CyberButton         from './CyberButton';
import ScanLines           from './ScanLines';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: 'easeOut' }
  }
};


const marqueeCards = [
  { icon: Shield,       title: 'Phishing Detection',   desc: 'Wire scans page content, forms, and redirects' },
  { icon: Zap,          title: 'Instant URL Scan',     desc: 'Analyze + AI analysis in under 60 seconds' },
  { icon: Eye,          title: 'Brand Impersonation',  desc: 'Detects PayPal, Amazon, Microsoft spoofs' },
  { icon: Lock,         title: 'Security Assessment',  desc: 'SSL verification and domain checks' },
  { icon: TrendingUp,   title: 'Behavioral Analysis',  desc: 'Pattern recognition and account aging' },
];
const duplicatedCards = [...marqueeCards, ...marqueeCards];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative bg-spec-bg overflow-hidden">

      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&display=swap');

        /* Global font overrides for the landing page */
        .specter-heading {
          font-family: 'Orbitron', 'Geist Mono', monospace !important;
        }
        .specter-mono {
          font-family: 'Geist Mono', 'Courier New', monospace !important;
        }
      `}</style>

      
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 border-b border-spec-border/30 backdrop-blur-sm bg-spec-bg/80">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3"
        >
          <div className="p-0.5 rounded-sm bg-gradient-to-r from-spec-accent to-spec-accent-light">
            <div className="w-7 h-7 bg-spec-bg rounded-sm flex items-center justify-center">
              <Eye className="w-4 h-4 text-spec-accent" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white specter-heading tracking-wider">SPECTER</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-6"
        >
          <button
            onClick={() => navigate('/auth')}
            className="premium-link text-gray-300 hover:text-white"
          >
            <div className="corner-tl" />
            <div className="link-text">
              <div className="link-track">
                <span>Sign In</span>
                <span>Sign In</span>
              </div>
            </div>
            <div className="corner-br" />
          </button>
          <CyberButton
            label="Get Started"
            variant="primary"
            onClick={() => navigate('/auth')}
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.7rem' }}
          />
        </motion.div>
      </header>


      <section className="relative w-full h-screen bg-spec-bg overflow-hidden flex items-center justify-center" style={{ paddingTop: 0 }}>

        <ThreatLogBackground />

        
        <ScanLines />

        
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-spec-bg via-spec-surface/50 to-spec-bg opacity-60" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-spec-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-spec-info/5 rounded-full blur-3xl" />
        </div>

      
        <AnalysisPanels />

        
        <AlertFlash />

      
        <div className="absolute z-5 flex items-center justify-center pointer-events-none">
          <HUDRings size={480} />
        </div>

        
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="absolute top-32 right-8 z-10 max-w-md pointer-events-none"
        >
          <div className="text-right">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 specter-heading leading-tight tracking-tight">
              Scan Any URL <span className="bg-gradient-to-r from-spec-accent to-spec-accent-light bg-clip-text text-transparent">For Threats</span>
            </h1>
            <p className="text-sm md:text-base text-gray-300 specter-mono">
              Powered by Wire: real-time URL intelligence that detects phishing, brand impersonation, and credential harvesting.
            </p>
          </div>
        </motion.div>

        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="z-20 pointer-events-none"
          style={{
            position: 'fixed',
            top: '50vh',
            left: '50vw',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{
            margin: '1.2rem auto 0',
            width: '48px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,42,42,0.7), transparent)',
          }} />
        </motion.div>

        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="absolute bottom-12 left-8 z-20 pointer-events-auto"
          style={{ maxWidth: '36vw' }}
        >
          <motion.p variants={itemVariants} className="text-lg md:text-xl font-bold text-white specter-heading mb-3">
            Your Safety,<br />Our Mission
          </motion.p>
          <motion.p variants={itemVariants} className="text-sm text-gray-400 specter-mono leading-relaxed mb-6" style={{ maxWidth: '28rem' }}>
            Wire-powered analysis identifies malicious URLs before you click. Real-time intelligence across phishing schemes, brand impersonation, and credential harvesting attacks.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-row gap-4">
            <CyberButton
              label="Start Investigation"
              variant="primary"
              onClick={() => navigate('/auth')}
              icon={<ArrowRight className="w-4 h-4" />}
            />
            <CyberButton
              label="Watch Demo"
              variant="secondary"
            />
          </motion.div>
        </motion.div>

        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="absolute bottom-12 right-8 z-20 pointer-events-none"
          style={{ maxWidth: '38vw' }}
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white specter-heading leading-none tracking-tight text-right mb-6"
          >
            Protection<br />Redefined
          </motion.h1>
          <motion.div variants={itemVariants} className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <span className="text-xs specter-mono uppercase tracking-wider text-gray-400">Scroll down</span>
              <span className="w-12 h-px bg-gray-400" />
            </div>
            <span className="text-xs specter-mono uppercase tracking-wider text-white">To explore features</span>
          </motion.div>
        </motion.div>

      
        <motion.div
          className="absolute top-20 right-10 w-20 h-20 border-2 border-spec-accent/20 rounded-lg pointer-events-none z-15"
          animate={{
            rotate: 360,
            borderColor: ['rgba(255, 42, 42, 0.2)', 'rgba(0, 170, 255, 0.2)', 'rgba(255, 42, 42, 0.2)']
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-32 h-32 border-2 border-spec-info/20 rounded-full pointer-events-none z-15"
          animate={{
            scale: [1, 1.1, 1],
            borderColor: ['rgba(0, 170, 255, 0.2)', 'rgba(255, 42, 42, 0.2)', 'rgba(0, 170, 255, 0.2)']
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </section>

    
      <section className="relative z-10 py-20 px-8 bg-spec-bg overflow-hidden">
        <div className="max-w-7xl mx-auto mb-20">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-white mb-4 specter-heading tracking-tight text-center"
          >
            Core Features
          </motion.h3>
          <p className="text-center text-gray-400 specter-mono mb-12">
            Comprehensive threat detection and analysis
          </p>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-spec-bg to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-spec-bg to-transparent z-20 pointer-events-none" />

          <motion.div
            className="flex gap-4 w-fit"
            animate={{ x: [-1920, 0] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
          >
            {duplicatedCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="min-w-[350px] p-6 rounded-lg border border-spec-border/50 bg-spec-surface/30 backdrop-blur-sm hover:border-spec-accent/50 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-start mb-3">
                    <div className="p-2 rounded-lg bg-spec-accent/10 group-hover:bg-spec-accent/20 transition-colors">
                      <Icon className="w-5 h-5 text-spec-accent" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 specter-heading">{card.title}</h3>
                  <p className="text-sm text-gray-400 specter-mono">{card.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      
      <section className="relative z-10 py-20 px-8 bg-spec-bg">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <motion.h3
            variants={itemVariants}
            className="text-4xl font-bold text-white mb-12 specter-heading tracking-tight text-center"
          >
            Comprehensive Intelligence
          </motion.h3>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: AlertTriangle, title: 'Phishing Detection',   items: ['Email analysis', 'URL inspection', 'Form detection'] },
              { icon: TrendingUp,    title: 'Behavioral Analysis',  items: ['Pattern recognition', 'Account aging', 'Engagement metrics'] },
              { icon: Lock,          title: 'Security Assessment',  items: ['SSL verification', 'Domain check', 'Breach history'] },
              { icon: Eye,           title: 'Digital Footprint',    items: ['Social profiles', 'Linked accounts', 'Historical data'] },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-lg border border-spec-border/50 bg-spec-surface/40 backdrop-blur-sm hover:border-spec-accent/30 transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <feature.icon className="w-5 h-5 text-spec-accent" />
                  <h4 className="text-base font-bold text-white specter-heading">{feature.title}</h4>
                </div>
                <ul className="space-y-2">
                  {feature.items.map((item, j) => (
                    <li key={j} className="text-sm text-gray-400 specter-mono">
                      <span className="text-spec-accent font-bold">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

    </div>
  );
}