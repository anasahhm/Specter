import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
 
export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    darkMode: true,
    privacyMode: false,
    displayName: user?.displayName || ''
  });
  const [saved, setSaved] = useState(false);
 
  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };
 
  const handleSave = async () => {
    // API call to save settings
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
 
  return (
    <div className="min-h-screen bg-spec-bg">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-16 z-40 border-b border-spec-border/30 bg-spec-bg/80 backdrop-blur-sm px-8 py-6"
      >
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-400 hover:text-spec-accent mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <h1 className="text-3xl font-bold text-white font-space">Settings</h1>
        </div>
      </motion.div>
 
      <div className="max-w-2xl mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl border border-spec-border/50 bg-spec-surface/30 backdrop-blur-sm"
          >
            <h2 className="text-lg font-bold text-white mb-4 font-space">Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Display Name</label>
                <input
                  type="text"
                  value={settings.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  className="w-full px-4 py-2 bg-spec-surface border border-spec-border/50 rounded-lg text-white focus:outline-none focus:border-spec-accent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Email</label>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>
          </motion.div>
 
          {/* Preferences Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl border border-spec-border/50 bg-spec-surface/30 backdrop-blur-sm"
          >
            <h2 className="text-lg font-bold text-white mb-4 font-space">Preferences</h2>
            
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive alerts for threat detections' },
                { key: 'darkMode', label: 'Dark Mode', desc: 'Enable dark theme (recommended)' },
                { key: 'privacyMode', label: 'Privacy Mode', desc: 'Hide investigation details from logs' }
              ].map(pref => (
                <motion.div
                  key={pref.key}
                  whileHover={{ x: 4 }}
                  className="flex items-start justify-between p-4 rounded-lg hover:bg-spec-surface/50 transition-colors"
                >
                  <div>
                    <p className="text-white font-semibold">{pref.label}</p>
                    <p className="text-sm text-gray-400">{pref.desc}</p>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[pref.key]}
                      onChange={(e) => handleChange(pref.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-spec-surface peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-spec-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spec-accent"></div>
                  </label>
                </motion.div>
              ))}
            </div>
          </motion.div>
 
          {/* Save Button */}
          <motion.div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-3 bg-spec-accent text-spec-bg rounded-lg font-bold hover:shadow-glow transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </motion.button>
            
            {saved && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-spec-accent"
              >
                ✓ Settings saved successfully
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}