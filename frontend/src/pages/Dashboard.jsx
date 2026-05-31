import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInvestigation } from '../hooks/useInvestigation';
import { Search, Plus, BarChart3, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import InvestigationForm from '../components/InvestigationForm';
import RecentInvestigations from '../components/RecentInvestigations';
import ThreatScoreCard from '../components/ThreatScoreCard';
import ActivityTimeline from '../components/ActivityTimeline';

export default function Dashboard() {
  const { investigations, fetchInvestigations, loading } = useInvestigation();
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({
    totalInvestigations: 0,
    threatsDetected: 0,
    avgRiskScore: 0,
    reportsGenerated: 0
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await fetchInvestigations(1, 20);
      const list = data?.investigations || [];
      const threats = list.filter(i => i.riskScore > 50).length;
      const avgScore = list.length > 0
        ? Math.round(list.reduce((sum, i) => sum + (i.riskScore || 0), 0) / list.length)
        : 0;
      setStats({
        totalInvestigations: list.length,
        threatsDetected: threats,
        avgRiskScore: avgScore,
        reportsGenerated: list.filter(i => i.status === 'completed').length
      });
    } catch (err) {
      console.error('Failed to load dashboard', err);
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
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-spec-bg">
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-16 z-40 border-b border-spec-border/30 bg-spec-bg/80 backdrop-blur-sm px-8 py-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white font-sans mb-1 tracking-tight">
                THREAT INTELLIGENCE HUB
              </h1>
              <p className="text-gray-400 font-serif">Monitor and investigate digital threats</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-spec-accent to-spec-accent-light text-white rounded-lg hover:shadow-glow-lg font-bold transition-all font-sans uppercase tracking-wider text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>New Investigation</span>
            </motion.button>
          </div>

          
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-spec-accent/50" />
            <input
              type="text"
              placeholder="Search investigations, entities, threats..."
              className="w-full pl-12 pr-4 py-3 bg-spec-surface border border-spec-border/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-spec-accent font-serif text-sm"
            />
          </div>
        </div>
      </motion.div>

      
      <div className="max-w-7xl mx-auto px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          
          <motion.div variants={itemVariants} className="grid md:grid-cols-4 gap-4">
            {[
              {
                icon: BarChart3,
                label: 'Total Investigations',
                value: stats.totalInvestigations,
                color: 'spec-info',
                trend: '+12%'
              },
              {
                icon: AlertTriangle,
                label: 'Threats Detected',
                value: stats.threatsDetected,
                color: 'spec-danger',
                trend: '+24%'
              },
              {
                icon: TrendingUp,
                label: 'Avg Risk Score',
                value: `${stats.avgRiskScore}%`,
                color: 'spec-accent'
              },
              {
                icon: Clock,
                label: 'Reports Generated',
                value: stats.reportsGenerated,
                color: 'spec-accent'
              }
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-6 rounded-lg border border-spec-border/50 bg-spec-surface/40 backdrop-blur-sm hover:border-spec-accent/30 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-spec-surface group-hover:bg-spec-accent/10 transition-colors">
                    <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                  </div>
                  {stat.trend && <span className="text-xs font-mono text-spec-accent uppercase tracking-wider">{stat.trend}</span>}
                </div>
                <p className="text-gray-400 text-sm mb-2 font-serif">{stat.label}</p>
                <p className="text-3xl font-bold text-white font-sans tracking-tight">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>

          
          <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-8">
            {/* Recent Investigations */}
            <div className="lg:col-span-2">
              <RecentInvestigations investigations={investigations} loading={loading} />
            </div>

            
            <div>
              <ActivityTimeline />
            </div>
          </motion.div>

          
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-2xl"
              >
                <InvestigationForm
                  onClose={() => setShowForm(false)}
                  onSuccess={() => {
                    setShowForm(false);
                    loadDashboard();
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}