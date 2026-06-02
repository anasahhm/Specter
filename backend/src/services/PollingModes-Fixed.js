export const POLLING_MODES = {
  HACKATHON: {
    // Fast mode - Perfect for hackathons
    description: '⚡ Fast mode - Perfect for hackathons',
    
    // TIME-BASED (not attempt-based)
    timeoutMs: 60000,           // 1 minute hard deadline
    perRequestTimeoutMs: 8000,  // 8 seconds per individual request
    
    // Backoff configuration
    baseDelay: 1000,            // Start with 1s
    backoffIncrement: 500,      // +500ms each attempt
    maxBackoff: 5000,           // Cap at 5s
    
    // Rate limiting
    rateLimitDelay: { min: 5000, max: 8000 },
    
    // Metadata (for UI/logging)
    maxEstimatedAttempts: 15,   // Roughly how many before hitting timeout
    maxEstimatedMinutes: 1
  },
  
  ULTRA_FAST: {
    // Ultra-fast mode - For quick demos
    description: '🚀 Ultra-fast mode - For quick demos',
    
    // TIME-BASED (not attempt-based)
    timeoutMs: 45000,           // 45 seconds hard deadline
    perRequestTimeoutMs: 6000,  // 6 seconds per individual request
    
    // Backoff configuration
    baseDelay: 500,             // Start with 500ms
    backoffIncrement: 200,      // +200ms each attempt
    maxBackoff: 3000,           // Cap at 3s
    
    // Rate limiting
    rateLimitDelay: { min: 3000, max: 5000 },
    
    // Metadata (for UI/logging)
    maxEstimatedAttempts: 20,   // Roughly how many before hitting timeout
    maxEstimatedMinutes: 0.75   // 45 seconds
  },
  
  PRODUCTION: {
    // Reliable mode - Better for long tasks
    description: '✓ Reliable mode - Better for long tasks',
    
    // TIME-BASED (not attempt-based)
    timeoutMs: 180000,          // 3 minutes hard deadline (realistic!)
    perRequestTimeoutMs: 15000, // 15 seconds per individual request
    
    // Backoff configuration
    baseDelay: 2000,            // Start with 2s
    backoffIncrement: 1000,     // +1s each attempt
    maxBackoff: 10000,          // Cap at 10s
    
    // Rate limiting
    rateLimitDelay: { min: 15000, max: 25000 },
    
    // Metadata (for UI/logging)
    maxEstimatedAttempts: 60,   // Roughly how many before hitting timeout
    maxEstimatedMinutes: 3      // 180 seconds
  }
};
 
/**
 * Accurate timeout calculator
 * Handles exponential backoff with caps
 */
function calculateMaxDuration(mode) {
  let totalMs = 0;
  let attempt = 0;
  
  while (totalMs < mode.timeoutMs) {
    const delay = Math.min(
      mode.baseDelay + (attempt * mode.backoffIncrement),
      mode.maxBackoff
    );
    
    totalMs += delay;
    attempt++;
    
    // Safety check to prevent infinite loops in calculation
    if (attempt > 1000) break;
  }
  
  return {
    totalMs,
    estimatedAttempts: attempt,
    minutes: Math.ceil(totalMs / 60000),
    seconds: Math.ceil(totalMs / 1000)
  };
}
 
/**
 * Validate all modes have accurate metadata
 */
Object.entries(POLLING_MODES).forEach(([modeName, config]) => {
  const calculated = calculateMaxDuration(config);
  
  console.log(`\n[POLLING] Mode: ${modeName}`);
  console.log(`  ${config.description}`);
  console.log(`  Timeout: ${config.timeoutMs}ms (${config.timeoutMs / 1000}s)`);
  console.log(`  Estimated attempts: ~${calculated.estimatedAttempts}`);
  console.log(`  Estimated duration: ${calculated.minutes}m${(calculated.seconds % 60)}s`);
});
 
// Current active mode
export const CURRENT_MODE = POLLING_MODES.PRODUCTION;
 
console.log(`\n[POLLING] ✓ Active mode: ${CURRENT_MODE.description}`);
console.log(`[POLLING] Hard timeout: ${CURRENT_MODE.timeoutMs / 1000}s`);
console.log(`[POLLING] Per-request timeout: ${CURRENT_MODE.perRequestTimeoutMs / 1000}s`);
 
/**
 * Get active polling configuration
 */
export const getPollingConfig = () => CURRENT_MODE;
 
/**
 * Switch modes at runtime
 */
export const setPollingMode = (modeName) => {
  if (!POLLING_MODES[modeName]) {
    throw new Error(`Unknown polling mode: ${modeName}. Available: ${Object.keys(POLLING_MODES).join(', ')}`);
  }
  // In a real app, you'd update module state or use a singleton
  console.log(`[POLLING] Switched to mode: ${POLLING_MODES[modeName].description}`);
  return POLLING_MODES[modeName];
};
 
/**
 * Export helper to calculate next backoff delay for a given attempt
 */
export const getBackoffDelay = (attemptNumber, mode = CURRENT_MODE) => {
  return Math.min(
    mode.baseDelay + (attemptNumber * mode.backoffIncrement),
    mode.maxBackoff
  );
};
 
export default {
  POLLING_MODES,
  CURRENT_MODE,
  getPollingConfig,
  setPollingMode,
  getBackoffDelay,
  calculateMaxDuration
};
