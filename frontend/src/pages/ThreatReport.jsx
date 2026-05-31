import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Share2, ArrowLeft, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { apiClient } from '../api/client';

export default function ThreatReport() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Load investigation (which contains all Wire API data)
        const res = await apiClient.get(`/investigations/${id}`);
        setReport(res.data.investigation);
      } catch (err) {
        console.error('Failed to load report:', err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-spec-bg flex items-center justify-center">
        <p className="text-spec-accent animate-pulse">Loading report…</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-spec-bg flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-2">Failed to load report</p>
          {error && <p className="text-gray-400 text-sm mb-4">{error}</p>}
          <button onClick={() => navigate(-1)} className="text-spec-accent hover:underline">← Go back</button>
        </div>
      </div>
    );
  }

  // If the investigation itself failed, show the failure state
  if (report.status === 'failed') {
    return (
      <div className="min-h-screen bg-spec-bg flex items-center justify-center">
        <div className="max-w-lg text-center p-8 rounded-xl border border-red-500/40 bg-red-500/5">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Investigation Failed</h2>
          <p className="text-gray-300 mb-4">
            {report.errorMessage || 'The Wire API was unable to retrieve data for this target.'}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            No report was generated because no real data was collected. Please verify the URL and try again.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-spec-accent text-spec-bg font-bold rounded-lg hover:opacity-90"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const wj           = report.wireData?.generatedJson || {};
  const riskScore    = report.riskScore    ?? 0;
  const confidence   = report.confidenceScore ?? 0;
  const threatLevel  = (report.threatLevel  || 'unknown').toUpperCase();
  const scamProb     = report.scamProbability ?? 0;
  const patterns     = report.suspiciousPatterns  || [];
  const insights     = report.behavioralInsights  || [];
  const recs         = report.recommendations     || [];
  const identities   = report.linkedIdentities    || [];

  const threatColor = {
    CRITICAL: 'text-red-400',
    HIGH:     'text-orange-400',
    MEDIUM:   'text-yellow-400',
    LOW:      'text-blue-400',
    SAFE:     'text-green-400'
  }[threatLevel] || 'text-gray-400';

  const findings = patterns.map(p => ({
    title: p,
    severity: p.toLowerCase().includes('critical') || p.toLowerCase().includes('financial') ? 'Critical'
            : p.toLowerCase().includes('phishing') || p.toLowerCase().includes('credential') ? 'High'
            : 'Medium'
  }));

  return (
    <div className="min-h-screen bg-spec-bg">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-16 z-40 border-b border-spec-border/30 bg-spec-bg/80 backdrop-blur-sm px-8 py-6"
      >
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-400 hover:text-spec-accent mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white font-space mb-1">Threat Intelligence Report</h1>
              <p className="text-gray-400 text-sm">{report.targetValue}</p>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button whileHover={{ scale: 1.05 }} className="p-3 rounded-lg border border-spec-border/50 hover:border-spec-accent text-gray-400 hover:text-spec-accent transition-all">
                <Share2 className="w-5 h-5" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} className="px-4 py-3 rounded-lg bg-spec-accent text-spec-bg font-bold flex items-center space-x-2 hover:shadow-glow transition-all">
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

          {/* Executive Summary */}
          <motion.section variants={itemVariants} className="p-8 rounded-xl border border-spec-border/50 bg-spec-surface/30 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4 font-space">EXECUTIVE SUMMARY</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              {report.aiSummary || 'Analysis completed. See findings below.'}
            </p>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Risk Score',       value: `${riskScore}/100`, color: riskScore >= 60 ? 'text-red-400' : riskScore >= 40 ? 'text-yellow-400' : 'text-green-400' },
                { label: 'Threat Level',     value: threatLevel,        color: threatColor },
                { label: 'Confidence',       value: `${confidence}%`,   color: 'text-spec-accent' },
                { label: 'Scam Probability', value: `${scamProb}%`,     color: scamProb >= 50 ? 'text-orange-400' : 'text-gray-300' }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-lg bg-spec-surface/50 border border-spec-border/30">
                  <p className="text-xs text-gray-400 uppercase mb-2">{item.label}</p>
                  <p className={`text-2xl font-bold font-space ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Wire API Intelligence */}
          <motion.section variants={itemVariants} className="p-8 rounded-xl border border-spec-border/50 bg-spec-surface/30 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4 font-space">WIRE API INTELLIGENCE</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Page Title',    value: wj.pageTitle     || 'N/A' },
                { label: 'SSL / HTTPS',   value: wj.ssl != null ? (wj.ssl ? '✓ Present' : '✗ Missing') : 'Unavailable' },
                { label: 'Domain Age',    value: wj.domainAge != null ? `${wj.domainAge} days` : 'Unavailable' },
                { label: 'Forms Found',   value: (wj.forms || []).length },
                { label: 'External Links', value: (wj.externalLinks || []).length },
                { label: 'Redirects',     value: (wj.redirects || []).length },
                { label: 'Tech Stack',    value: (wj.techStack || []).join(', ') || 'N/A' },
                { label: 'Job ID',        value: report.wireData?.jobId || 'N/A' }
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-spec-surface/50 border border-spec-border/30">
                  <p className="text-xs text-gray-400 uppercase mb-1">{item.label}</p>
                  <p className="text-white font-mono text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Key Findings */}
          {findings.length > 0 && (
            <motion.section variants={itemVariants} className="p-8 rounded-xl border border-spec-border/50 bg-spec-surface/30 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6 font-space">KEY FINDINGS</h2>
              <div className="space-y-4">
                {findings.map((f, i) => (
                  <motion.div key={i} whileHover={{ x: 4 }} className="p-4 rounded-lg border border-spec-border/30 bg-spec-surface/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-white text-sm">{f.title}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ml-2 ${
                        f.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        f.severity === 'High'     ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>{f.severity}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Behavioral Insights */}
          {insights.length > 0 && (
            <motion.section variants={itemVariants} className="p-8 rounded-xl border border-spec-border/50 bg-spec-surface/30 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4 font-space">BEHAVIORAL INSIGHTS</h2>
              <div className="space-y-2">
                {insights.map((ins, i) => (
                  <div key={i} className="flex items-start space-x-2 text-sm text-gray-300">
                    <span className="text-spec-accent mt-0.5">→</span>
                    <span>{ins}</span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Recommendations */}
          {recs.length > 0 && (
            <motion.section variants={itemVariants} className="p-8 rounded-xl border border-spec-accent/30 bg-spec-accent/5 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6 font-space">RECOMMENDATIONS</h2>
              <div className="space-y-3">
                {recs.map((rec, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-spec-accent/10 transition-colors">
                    <CheckCircle className="w-5 h-5 text-spec-accent flex-shrink-0 mt-0.5" />
                    <p className="text-gray-300 text-sm">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Linked Identities */}
          {identities.length > 0 && (
            <motion.section variants={itemVariants} className="p-8 rounded-xl border border-spec-border/50 bg-spec-surface/30 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4 font-space">LINKED IDENTITIES</h2>
              <div className="space-y-2">
                {identities.map((id, i) => (
                  <div key={i} className="p-3 rounded-lg bg-spec-surface/50 border border-spec-border/30 flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm">{id.username}</p>
                      <p className="text-gray-400 text-xs">{id.platform}</p>
                    </div>
                    <span className="text-spec-accent text-sm font-bold">{id.confidence}%</span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Report Details */}
          <motion.section variants={itemVariants} className="p-8 rounded-xl border border-spec-border/50 bg-spec-surface/30 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6 font-space">REPORT DETAILS</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Investigation ID',  value: report.id },
                { label: 'Generated',         value: new Date(report.completedAt || report.createdAt).toLocaleString() },
                { label: 'Processing Time',   value: report.processingTime ? `${report.processingTime}ms` : 'N/A' },
                { label: 'Data Source',       value: 'Wire API (Live)' },
                { label: 'Analysis Type',     value: 'Automated Threat Intelligence' },
                { label: 'Status',            value: 'Complete' }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-lg bg-spec-surface/50 border border-spec-border/30">
                  <p className="text-xs text-gray-400 uppercase mb-1">{item.label}</p>
                  <p className="text-white font-semibold text-sm font-mono break-all">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.div variants={itemVariants} className="text-center py-8 border-t border-spec-border/30">
            <p className="text-gray-500 text-xs">
              Data sourced from Wire API live intelligence • © 2026 SPECTER Threat Intelligence Platform
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
