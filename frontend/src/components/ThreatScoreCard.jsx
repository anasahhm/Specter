import { motion } from 'framer-motion';

export function ThreatScoreCard({ riskScore = 0, threatLevel = 'low', scamProbability = 0, confidenceScore = 75 }) {
  const safeRiskScore = Math.max(0, Math.min(100, Number(riskScore) || 0));
  const safeScamProbability = Math.max(0, Math.min(100, Number(scamProbability) || 0));
  const safeConfidenceScore = Math.max(0, Math.min(100, Number(confidenceScore) || 75));
  const safeThreatLevel = String(threatLevel).toLowerCase() || 'low';

  const getThreatColor = (level) => {
    switch(level) {
      case 'critical': return { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400' };
      case 'high': return { bg: 'bg-orange-500/10', border: 'border-orange-500/50', text: 'text-orange-400' };
      case 'medium': return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-400' };
      case 'low': return { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-400' };
      default: return { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-400' };
    }
  };

  const colors = getThreatColor(safeThreatLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 rounded-lg border-2 ${colors.bg} ${colors.border} relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-spec-accent/5 to-transparent pointer-events-none" />

      <div className="relative z-10 grid lg:grid-cols-4 gap-8">
        
        <div className="flex flex-col items-center">
          <p className="text-gray-400 text-sm mb-2 font-serif uppercase tracking-wider">Overall Risk</p>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative w-24 h-24 flex items-center justify-center"
          >
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${(safeRiskScore / 100) * 282.7} 282.7`}
                className={colors.text}
              />
            </svg>
            <span className={`absolute text-2xl font-bold ${colors.text} font-sans tracking-tight`}>{safeRiskScore}%</span>
          </motion.div>
          <p className={`mt-2 text-sm font-bold ${colors.text} uppercase font-mono tracking-wider`}>{safeThreatLevel}</p>
        </div>


        {[
          {
            label: 'Scam Probability',
            value: safeScamProbability,
            color: safeScamProbability > 50 ? 'text-red-400' : safeScamProbability > 30 ? 'text-yellow-400' : 'text-blue-400',
            isText: false
          },
          {
            label: 'Confidence Score',
            value: safeConfidenceScore,
            color: safeConfidenceScore > 80 ? 'text-green-400' : safeConfidenceScore > 60 ? 'text-yellow-400' : 'text-gray-400',
            isText: false
          },
          {
            label: 'Threat Level',
            value: safeThreatLevel,
            color: colors.text,
            isText: true
          }
        ].map((metric, i) => (
          <div key={i} className="flex flex-col justify-center">
            <p className="text-gray-400 text-xs mb-2 uppercase font-mono tracking-wider">{metric.label}</p>
            <p className={`text-3xl font-bold font-sans tracking-tight ${metric.color}`}>
              {metric.isText ? metric.value.toUpperCase() : `${metric.value}%`}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default ThreatScoreCard;