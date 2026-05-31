import { BarChart3, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function RecentInvestigations({ investigations, loading }) {
  const navigate = useNavigate();

  const getThreatColor = (level) => {
    switch(level) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  return (
    <motion.div className="p-6 rounded-lg border border-spec-border/50 bg-spec-surface/40 backdrop-blur-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-spec-accent/10">
          <BarChart3 className="w-5 h-5 text-spec-accent" />
        </div>
        <h2 className="text-lg font-bold text-white font-sans tracking-tight">Recent Investigations</h2>
      </div>

      {loading ? (
        <p className="text-gray-400 font-serif text-sm">Loading investigations...</p>
      ) : investigations.length === 0 ? (
        <p className="text-gray-400 font-serif text-sm">No investigations yet. Start your first investigation!</p>
      ) : (
        <div className="space-y-3">
          {investigations.slice(0, 10).map((inv) => (
            <motion.button
              key={inv.id}
              whileHover={{ x: 4 }}
              onClick={() => navigate(`/investigation/${inv.id}`)}
              className="w-full p-4 rounded-lg border border-spec-border/30 hover:border-spec-accent/50 bg-spec-surface/50 hover:bg-spec-surface/70 transition-all text-left group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate font-sans">{inv.targetValue}</p>
                  <p className="text-xs text-gray-400 capitalize font-serif">{inv.targetType}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {inv.status === 'completed' && (
                    <>
                      <span className={`text-sm font-bold font-mono uppercase tracking-wider ${getThreatColor(inv.threatLevel)}`}>
                        {inv.riskScore}%
                      </span>
                      <AlertTriangle className={`w-4 h-4 ${getThreatColor(inv.threatLevel)}`} />
                    </>
                  )}
                  {inv.status === 'processing' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-4 h-4 border-2 border-spec-accent/30 border-t-spec-accent rounded-full"
                    />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}