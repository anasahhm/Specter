import { Activity, Zap, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export function ActivityTimeline() {
  const recentActivities = [
    { icon: AlertTriangle, label: 'Critical threat detected', time: '2m ago', color: 'text-red-400' },
    { icon: Zap, label: 'Investigation completed', time: '15m ago', color: 'text-yellow-400' },
    { icon: AlertTriangle, label: 'Phishing detected', time: '1h ago', color: 'text-orange-400' },
    { icon: Activity, label: 'New investigation started', time: '2h ago', color: 'text-spec-accent' }
  ];

  return (
    <motion.div className="p-6 rounded-lg border border-spec-border/50 bg-spec-surface/40 backdrop-blur-sm h-full">
      <h2 className="text-lg font-bold text-white mb-6 font-sans tracking-tight">Activity</h2>

      <div className="space-y-4">
        {recentActivities.map((activity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start space-x-3 p-3 rounded-lg bg-spec-surface/30 hover:bg-spec-surface/50 transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-spec-surface">
              <activity.icon className={`w-4 h-4 ${activity.color} flex-shrink-0`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-serif">{activity.label}</p>
              <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
export default ActivityTimeline;