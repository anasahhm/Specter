/**
 * HACKATHON POLLING CONFIG
 * Switch between modes easily!
 */

export const POLLING_MODES = {
  HACKATHON: {
    maxRetries: 25,
    baseDelay: 1000,
    backoffIncrement: 500,
    rateLimitDelay: { min: 5000, max: 8000 },
    description: '⚡ Fast mode - Perfect for hackathons'
  },
  
  ULTRA_FAST: {
    maxRetries: 15,
    baseDelay: 500,
    backoffIncrement: 200,
    rateLimitDelay: { min: 3000, max: 5000 },
    description: '🚀 Ultra-fast mode - For quick demos'
  },
  
  PRODUCTION: {
    maxRetries: 60,
    baseDelay: 2000,
    backoffIncrement: 1000,
    rateLimitDelay: { min: 15000, max: 25000 },
    description: '🏢 Reliable mode - Better for long tasks'
  }
};

// ⚡ CHANGE THIS TO SWITCH MODES:
export const CURRENT_MODE = POLLING_MODES.HACKATHON;

console.log(`🔄 Polling Mode: ${CURRENT_MODE.description}`);
console.log(`📊 Max wait time: ~${Math.ceil((CURRENT_MODE.maxRetries * CURRENT_MODE.baseDelay) / 1000 / 60)} minutes`);

export const getPollingConfig = () => CURRENT_MODE;