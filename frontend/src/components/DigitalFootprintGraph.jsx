import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
 
export function DigitalFootprintGraph({ linkedIdentities = [] }) {
  const platformCounts = linkedIdentities.reduce((acc, id) => {
    const existing = acc.find(p => p.name === id.platform);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: id.platform, value: 1 });
    }
    return acc;
  }, []);
 
  const COLORS = ['#00ff88', '#00aaff', '#ffaa00', '#ff0055', '#aa00ff'];
 
  return (
    <motion.div className="p-6 rounded-xl border border-spec-border/50 bg-spec-surface/30 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-white mb-4 font-space">Digital Footprint</h3>
      
      {linkedIdentities.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No linked identities found</p>
      ) : (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={platformCounts}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
              >
                {platformCounts.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
 
          <div className="space-y-2">
            {linkedIdentities.slice(0, 5).map((id, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 4 }}
                className="p-2 rounded-lg bg-spec-surface/50 border border-spec-border/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{id.username}</p>
                    <p className="text-xs text-gray-400 capitalize">{id.platform}</p>
                  </div>
                  <p className="text-xs font-bold text-spec-accent">{id.confidence}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
export default DigitalFootprintGraph;