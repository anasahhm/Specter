import express from 'express';
import wireService from '../services/wireService.js';
 
const router = express.Router();
 
router.post('/search', async (req, res) => {
  try {
    const { targetType, targetValue } = req.body;
    
    if (!targetType || !targetValue) {
      return res.status(400).json({ error: 'Target type and value required' });
    }
 
    const data = await wireService.gatherData(targetType, targetValue);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Wire search failed' });
  }
});
 
export default router;