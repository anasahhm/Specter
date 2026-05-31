// backend/src/config/validateEnv.js
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'NODE_ENV', 'PORT'];
const requiredForWire = ['WIRE_API_KEY'];
const optionalEnv = ['OPENAI_API_KEY', 'WIRE_API_BASE', 'FRONTEND_URL'];

export function validateEnvironment() {
  const missing = requiredEnv.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('\n❌ FATAL: Missing required environment variables:\n');
    missing.forEach(key => console.error(`   ${key}=value`));
    console.error('\nPlease create a .env file with these variables.\n');
    process.exit(1);
  }

  const missingWire = requiredForWire.filter(key => !process.env[key]);
  if (missingWire.length > 0) {
    console.error('\n❌ FATAL: WIRE_API_KEY is not set.');
    console.error('   Get your key from https://anakin.io/dashboard');
    console.error('   Set WIRE_API_KEY in your backend/.env file.\n');
    process.exit(1);
  }

  // Stale flag — was removed; warn if still present
  if (process.env.USE_DEMO_WIRE === 'true') {
    console.warn('\n⚠️  USE_DEMO_WIRE=true detected — demo mode has been removed. Variable is ignored.\n');
  }

  const warnings = optionalEnv.filter(key => !process.env[key]);
  if (warnings.length > 0) {
    console.warn('ℹ️  Optional variables not set:');
    warnings.forEach(key => console.warn(`   ${key}`));
    if (!process.env.OPENAI_API_KEY) {
      console.warn('   → OpenAI absent. Rule-based Wire-data analysis will be used.');
    }
    if (!process.env.WIRE_API_BASE) {
      console.warn('   → WIRE_API_BASE not set. Defaulting to https://api.anakin.io/v1');
    }
    console.warn('');
  }

  console.log('✓ Environment validated');
  console.log(`  Wire base: ${process.env.WIRE_API_BASE || 'https://api.anakin.io/v1 (default)'}`);
  console.log(`  Key prefix: ${process.env.WIRE_API_KEY?.slice(0, 15)}...\n`);
}
