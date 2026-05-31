import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
 
export default function ThreatVisualization({ investigation }) {
  const radarData = [
    { metric: 'Phishing', value: investigation.phishingDetected ? 100 : 20 },
    { metric: 'Scam', value: investigation.scamProbability },
    { metric: 'Engagement', value: investigation.fakeEngagementDetected ? 80 : 30 },
    { metric: 'Toxicity', value: investigation.toxicityScore },
    { metric: 'Risk', value: investigation.riskScore }
  ];
 
  return (
    <motion.div className="p-6 rounded-xl border border-spec-border/50 bg-spec-surface/30 backdrop-blur-sm space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-4 font-space">Threat Profile</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(0,255,136,0.1)" />
            <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" />
            <Radar name="Score" dataKey="value" stroke="#00ff88" fill="#00ff88" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
 
      <div>
        <h4 className="text-sm font-bold text-white mb-4 uppercase">Behavioral Patterns</h4>
        {investigation.behavioralInsights && investigation.behavioralInsights.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={investigation.behavioralInsights.slice(0, 5).map((insight, i) => ({
              name: `Pattern ${i + 1}`,
              value: Math.random() * 100
            }))}>
              <CartesianGrid stroke="rgba(0,255,136,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#141829', border: '1px solid #00ff88' }} />
              <Bar dataKey="value" fill="#00ff88" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-8">No behavioral patterns detected</p>
        )}
      </div>
    </motion.div>
  );
}
