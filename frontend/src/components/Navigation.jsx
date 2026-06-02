import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BarChart3, LogOut, Settings } from 'lucide-react';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path) => location.pathname === path;
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-spec-bg/40 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
      
        {/* Logo - Left */}
        <motion.button
          onClick={() => navigate('/dashboard')}
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <h1 className="text-xl font-bold text-white font-mono tracking-widest">SPECTER</h1>
        </motion.button>
        
        {/* Nav Items - Center */}
        <div className="flex items-center space-x-8">
          {navItems.map(item => (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center space-x-2 text-sm font-semibold transition-colors relative ${
                isActive(item.path)
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
              {isActive(item.path) && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-spec-accent to-spec-accent-light"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
        
        {/* Right Controls */}
        <motion.div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{user?.displayName || 'User'}</p>
            <p className="text-xs text-gray-400">{user?.subscriptionTier?.toUpperCase()}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-spec-surface rounded-lg transition-colors border border-transparent hover:border-spec-border/50"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-spec-border/50 hover:border-spec-accent text-gray-400 hover:text-spec-accent transition-colors font-mono text-xs uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.nav>
  );
}
