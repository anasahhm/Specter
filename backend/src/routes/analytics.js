import express from 'express';
import { Investigation, ThreatReport, ActivityLog } from '../models/index.js';
import mongoose from 'mongoose';
 
const router = express.Router();
 
router.get('/overview', async (req, res) => {
  try {
    const totalInvestigations = await Investigation.countDocuments({ userId: req.userId });
    const threatsDetected = await Investigation.countDocuments({
      userId: req.userId,
      riskScore: { $gte: 50 }
    });
    const reportsGenerated = await ThreatReport.countDocuments({ userId: req.userId });
 
    const avgRiskScore = await Investigation.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      { $group: { _id: null, avg: { $avg: '$riskScore' } } }
    ]);
 
    const threatLevelDistribution = await Investigation.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      { $group: { _id: '$threatLevel', count: { $sum: 1 } } }
    ]);
 
    res.json({
      overview: {
        totalInvestigations,
        threatsDetected,
        reportsGenerated,
        avgRiskScore: avgRiskScore[0]?.avg || 0,
        threatDistribution: threatLevelDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});
 
router.get('/timeline', async (req, res) => {
  try {
    const timeline = await ActivityLog.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(50);
 
    res.json({ timeline });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});
 
export default router;