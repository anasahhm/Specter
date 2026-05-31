import express from 'express';
import { ThreatReport } from '../models/index.js';
import { Investigation } from '../models/index.js';
 
const router = express.Router();
 
// Get threat report
router.get('/:investigationId', async (req, res) => {
  try {
    const report = await ThreatReport.findOne({
      investigationId: req.params.investigationId,
      userId: req.userId
    }).populate('investigationId');
 
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
 
    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});
 
// Export report as PDF
router.post('/:investigationId/export', async (req, res) => {
  try {
    const { format = 'pdf' } = req.body;
    const report = await ThreatReport.findOne({
      investigationId: req.params.investigationId,
      userId: req.userId
    });
 
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
 
    // In production, use a library like PDFKit to generate PDF
    report.exportedAt = new Date();
    report.exportFormats.push(format);
    await report.save();
 
    res.json({
      success: true,
      message: 'Report exported successfully',
      downloadUrl: `/api/reports/${report._id}/download/${format}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});
 
export default router;