import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const app = express();

// MIDDLEWARE CONFIGURATION

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.'
});

const investigationLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 5, 
  message: 'Investigation rate limit exceeded. Please wait before starting another investigation.'
});

app.use('/api/', limiter);
app.use('/api/investigations/start', investigationLimiter);

// DATABASE CONNECTION

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// CUSTOM MIDDLEWARE

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation failed', details: err.message });
  }
  
  if (err.name === 'MongoError') {
    return res.status(500).json({ error: 'Database error', details: err.message });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// ROUTES


app.get('/api/health', (req, res) => {
  res.json({ status: 'operational', timestamp: new Date().toISOString() });
});

import authRoutes from './routes/auth.js';
import investigationRoutes from './routes/investigations.js';
import reportRoutes from './routes/reports.js';
import analyticsRoutes from './routes/analytics.js';
import wireRoutes from './routes/wire.js';
import { validateEnvironment } from './config/validateEnv.js';


app.use('/api/auth', authRoutes);
app.use('/api/investigations', authMiddleware, investigationRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/wire', authMiddleware, wireRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);


// SERVER STARTUP


const PORT = process.env.PORT || 5000;
 
const startServer = async () => {
  validateEnvironment();
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║        SPECTER - SERVER STARTED          ║
╠══════════════════════════════════════════╣
║ Port:         ${PORT}
║ Environment:  ${process.env.NODE_ENV}
║ Database:     Connected
║ Wire API:     ${process.env.WIRE_API_KEY ? '✓ Key loaded (' + process.env.WIRE_API_KEY.slice(0,12) + '...)' : '✗ NOT SET — investigations will fail'}
║ AI API:    ${process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_key_here' ? '✓ Configured (free tier)' : '— Not set (rule-based analysis)'}
╚══════════════════════════════════════════╝
    `);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export { app, authMiddleware };