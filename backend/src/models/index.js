// backend/src/models/index.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ============================================
// USER MODEL
// ============================================

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  displayName: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: null
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  investigationLimit: {
    type: Number,
    default: 10
  },
  investigationsUsed: {
    type: Number,
    default: 0
  },
  apiKey: {
    type: String,
    unique: true,
    sparse: true,
    default: null
  },
  settings: {
    emailNotifications: { type: Boolean, default: true },
    privacyMode: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: true }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ============================================
// INVESTIGATION MODEL
// ============================================

const investigationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetType: {
    type: String,
    enum: ['url'],
    required: true
  },
  targetValue: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  // Human-readable failure reason (populated when status === 'failed')
  errorMessage: {
    type: String,
    default: null
  },
  threatLevel: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'safe'],
    default: 'low'
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  scamProbability: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  phishingDetected: {
    type: Boolean,
    default: false
  },
  fakeEngagementDetected: {
    type: Boolean,
    default: false
  },
  wireData: {
    profileInfo: mongoose.Schema.Types.Mixed,
    websiteInfo: mongoose.Schema.Types.Mixed,
    socialProfiles: [mongoose.Schema.Types.Mixed],
    metadata: mongoose.Schema.Types.Mixed
  },
  urlIntelligence: {
  markdown: String,        
  generatedJson: mongoose.Schema.Types.Mixed,  
  pageTitle: String,
  statusCode: Number,
  redirectChain: [String],
  extractedLinks: [String],
  techStack: [String],
  screenshots: [String]
},
anakinJobId: String,

  linkedIdentities: [{
    platform: String,
    username: String,
    confidence: Number,
    riskScore: Number
  }],
  suspiciousPatterns: [String],
  keywords: [String],
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  toxicityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  behavioralInsights: [String],
  aiSummary: String,
  recommendations: [String],
  isBookmarked: {
    type: Boolean,
    default: false
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: Date,
  processingTime: Number // milliseconds
}, { timestamps: true });

// Index for faster queries
investigationSchema.index({ userId: 1, createdAt: -1 });
investigationSchema.index({ userId: 1, status: 1 });
investigationSchema.index({ userId: 1, threatLevel: 1 });
investigationSchema.index({ userId: 1, riskScore: -1 });
investigationSchema.index({ targetValue: 1 });
investigationSchema.index({ riskScore: -1 });
investigationSchema.index({ createdAt: -1 });


// ============================================
// THREAT REPORT MODEL
// ============================================

const threatReportSchema = new mongoose.Schema({
  investigationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investigation',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reportTitle: String,
  overallRiskScore: Number,
  summary: String,
  findings: [{
    category: String,
    severity: String,
    description: String,
    evidence: [String]
  }],
  discoveredMetadata: mongoose.Schema.Types.Mixed,
  linkedEntities: [{
    entityType: String,
    value: String,
    confidence: Number,
    relationship: String
  }],
  threatRecommendations: [String],
  reportContent: String,
  generatedAt: {
    type: Date,
    default: Date.now
  },
  exportedAt: Date,
  exportFormats: [String], // ['pdf', 'json', 'html']
  isPublished: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// ============================================
// ACTIVITY LOG MODEL
// ============================================

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  investigationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investigation',
    sparse: true
  },
  action: {
    type: String,
    enum: ['investigation_started', 'investigation_completed', 'investigation_failed', 'report_generated', 'report_exported', 'entity_saved', 'entity_removed', 'login', 'logout', 'settings_updated'],
    required: true
  },
  actionDetails: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: false });

// ============================================
// SAVED ENTITY MODEL
// ============================================

const savedEntitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  entityType: {
    type: String,
    enum: ['username', 'email', 'website', 'socialProfile', 'phone'],
    required: true
  },
  entityValue: {
    type: String,
    required: true
  },
  label: String,
  category: {
    type: String,
    enum: ['suspicious', 'verified', 'trusted', 'blocked', 'watchlist'],
    default: 'suspicious'
  },
  notes: String,
  lastInvestigatedAt: Date,
  lastInvestigationScore: Number,
  frequency: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Composite index for user entities
savedEntitySchema.index({ userId: 1, entityValue: 1 }, { unique: true });

// ============================================
// CREATE MODELS
// ============================================

export const User = mongoose.model('User', userSchema);
export const Investigation = mongoose.model('Investigation', investigationSchema);
export const ThreatReport = mongoose.model('ThreatReport', threatReportSchema);
export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export const SavedEntity = mongoose.model('SavedEntity', savedEntitySchema);

export default {
  User,
  Investigation,
  ThreatReport,
  ActivityLog,
  SavedEntity
};