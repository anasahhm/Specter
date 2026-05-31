import { useParams, useNavigate } from 'react-router-dom';
import { useInvestigation } from '../hooks/useInvestigation';
import { ArrowLeft, Download, Share2, Bookmark } from 'lucide-react';
import ThreatVisualization from '../components/ThreatVisualization';
import DigitalFootprintGraph from '../components/DigitalFootprintGraph';
import LoadingScanner from '../components/LoadingScanner';
import React from 'react';
import { motion } from 'framer-motion';
import { ThreatScoreCard } from '../components/ThreatScoreCard';

export default function InvestigationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { investigation, fetchInvestigation, loading, error, pollingStatus } = useInvestigation();
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  React.useEffect(() => {
    if (id) {
      fetchInvestigation(id).catch(err => {
        console.error('Error fetching investigation:', err);
      });
    }
  }, [id]);

  React.useEffect(() => {
    if (investigation) {
      setIsBookmarked(investigation.isBookmarked || false);
    }
  }, [investigation]);

  if (loading) {
    return <LoadingScanner />;
  }

  if (error || !investigation) {
    return (
      <div className="min-h-screen bg-spec-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load investigation</p>
          {error && <p className="text-gray-400 mb-4 text-sm">{error}</p>}
          <button
            onClick={() => navigate('/dashboard')}
            className="text-spec-accent hover:text-spec-accent/80"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  
  if (investigation.status === 'failed') {
    return (
      <div className="min-h-screen bg-spec-bg flex items-center justify-center">
        <div className="max-w-lg text-center p-8 rounded-xl border border-red-500/40 bg-red-500/5">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2 font-space">Investigation Failed</h2>
          <p className="text-gray-300 mb-4 text-sm leading-relaxed">
            {investigation.errorMessage ||
              'The Wire API was unable to retrieve data for this target. No report was generated.'}
          </p>
          <p className="text-gray-500 text-xs mb-6">
            Target: <span className="font-mono text-gray-400">{investigation.targetValue}</span>
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-spec-accent text-spec-bg font-bold rounded-lg hover:opacity-90 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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

  const getThreatColor = (level) => {
    switch(level) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-green-500';
    }
  };

  const getThreatBgColor = (level) => {
    switch(level) {
      case 'critical': return 'bg-red-500/10 border-red-500/50';
      case 'high': return 'bg-orange-500/10 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/50';
      case 'low': return 'bg-blue-500/10 border-blue-500/50';
      default: return 'bg-green-500/10 border-green-500/50';
    }
  };

  
  const threatLevel = investigation.threatLevel || 'low';
  const riskScore = investigation.riskScore ?? 0;
  const scamProbability = investigation.scamProbability ?? 0;
  const confidenceScore = investigation.confidenceScore ?? 75;
  const suspiciousPatterns = investigation.suspiciousPatterns || [];
  const recommendations = investigation.recommendations || [];
  const linkedIdentities = investigation.linkedIdentities || [];
  const behavioralInsights = investigation.behavioralInsights || [];
  const aiSummary = investigation.aiSummary || 'Analysis completed.';
  const phishingDetected = investigation.phishingDetected || false;
  const fakeEngagementDetected = investigation.fakeEngagementDetected || false;

  return (
    <div className="min-h-screen bg-spec-bg">
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-16 z-40 border-b border-spec-border/30 bg-spec-bg/80 backdrop-blur-sm px-8 py-6"
      >
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-400 hover:text-spec-accent mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white font-space mb-2">
                {investigation.targetValue}
              </h1>
              <p className="text-gray-400 capitalize">
                Analyzing {investigation.targetType} 
                {investigation.status === 'completed' ? ' - Complete' : ' - Processing'}
              </p>
              {pollingStatus && (
                <p className="text-yellow-400 text-sm mt-2">{pollingStatus}</p>
              )}
            </div>
            
            <motion.div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="p-3 rounded-lg border border-spec-border/50 hover:border-spec-accent text-gray-400 hover:text-spec-accent transition-all"
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-spec-accent' : ''}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-lg border border-spec-border/50 hover:border-spec-accent text-gray-400 hover:text-spec-accent transition-all"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-3 rounded-lg bg-spec-accent text-spec-bg font-bold flex items-center space-x-2 hover:shadow-glow transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </motion.button>
            </motion.div>
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
          
          <motion.div variants={itemVariants}>
            <ThreatScoreCard
              riskScore={riskScore}
              threatLevel={threatLevel}
              scamProbability={scamProbability}
              confidenceScore={confidenceScore}
            />
          </motion.div>

          
          <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2">
              <ThreatVisualization 
                investigation={{
                  phishingDetected,
                  scamProbability,
                  fakeEngagementDetected,
                  toxicityScore: investigation.toxicityScore || 0,
                  riskScore,
                  behavioralInsights
                }}
              />
            </div>

            
            <motion.div className="p-6 rounded-xl border border-spec-border/50 bg-spec-surface/30 backdrop-blur-sm h-fit">
              <h3 className="text-lg font-bold text-white mb-4 font-space">DETECTED THREATS</h3>
              <div className="space-y-3">
                {phishingDetected && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50">
                    <p className="text-red-400 text-sm font-bold">⚠ Phishing Detected</p>
                  </div>
                )}
                {fakeEngagementDetected && (
                  <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/50">
                    <p className="text-orange-400 text-sm font-bold">⚠ Fake Engagement</p>
                  </div>
                )}
                {scamProbability > 30 && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50">
                    <p className="text-red-400 text-sm font-bold">⚠ Scam Risk: {scamProbability}%</p>
                  </div>
                )}
                {suspiciousPatterns.length > 0 ? (
                  suspiciousPatterns.slice(0, 3).map((pattern, i) => (
                    <div key={i} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/50">
                      <p className="text-yellow-400 text-sm">• {pattern}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/50">
                    <p className="text-green-400 text-sm">✓ No threats detected</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

        
          <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-8">
          
            <div>
              <DigitalFootprintGraph linkedIdentities={linkedIdentities} />
            </div>

            
            <motion.div className="p-6 rounded-xl border border-spec-border/50 bg-spec-surface/30 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4 font-space">AI ANALYSIS</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">{aiSummary}</p>
              
              {recommendations.length > 0 && (
                <>
                  <h4 className="text-sm font-bold text-spec-accent mb-3 uppercase">Recommendations:</h4>
                  <ul className="space-y-2">
                    {recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-gray-400">✓ {rec}</li>
                    ))}
                  </ul>
                </>
              )}
            </motion.div>
          </motion.div>

          
          {behavioralInsights.length > 0 && (
            <motion.div variants={itemVariants} className="p-6 rounded-xl border border-spec-border/50 bg-spec-surface/30 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4 font-space">BEHAVIORAL INSIGHTS</h3>
              <div className="space-y-2">
                {behavioralInsights.map((insight, i) => (
                  <div key={i} className="flex items-start space-x-2 text-gray-300 text-sm">
                    <span className="text-spec-accent mt-1">→</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          
          {investigation.urlIntelligence && investigation.urlIntelligence.extractedLinks?.length > 0 && (
            <motion.div variants={itemVariants} className="p-6 rounded-xl border border-spec-border/50 bg-spec-surface/30 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4 font-space">EXTRACTED LINKS</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {investigation.urlIntelligence.extractedLinks.slice(0, 10).map((link, i) => (
                  <div key={i} className="p-2 rounded bg-spec-bg/50 border border-spec-border/30">
                    <p className="text-xs text-gray-400 truncate">{link}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}