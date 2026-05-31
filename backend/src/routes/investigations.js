import express from 'express';
import { User, Investigation, ThreatReport, ActivityLog as ActivityLogModel } from '../models/index.js';
import wireService from '../services/wireService.js';
import { WireError } from '../services/wireService.js';
import aiService from '../services/aiService.js';
import threatAnalysisService from '../services/threatAnalysisService.js';

const investRouter = express.Router();

// Configuration for processing timeouts
const PROCESSING_CONFIG = {
  WIRE_TIMEOUT: 120000,      
  AI_TIMEOUT: 45000,          
  THREAT_ANALYSIS_TIMEOUT: 10000, 
  TOTAL_TIMEOUT: 180000       
};

investRouter.post('/start', async (req, res) => {
  try {
    let { targetType, targetValue } = req.body;
    const userId = req.userId;

    if (!targetType || !targetValue) {
      return res.status(400).json({ error: 'Target type and value are required' });
    }

    
    if (targetType === 'url') {
      try {
        const { normalizeUrl } = await import('../services/wireService.js');
        targetValue = normalizeUrl(targetValue);
      } catch (normErr) {
        return res.status(400).json({ error: `Invalid URL: ${normErr.message}` });
      }
    }

    const user = await User.findById(userId);

    const investigation = new Investigation({
      userId,
      targetType,
      targetValue,
      status: 'processing'
    });

    await investigation.save();

    user.investigationsUsed += 1;
    await user.save();

    await ActivityLogModel.create({
      userId,
      investigationId: investigation._id,
      action: 'investigation_started',
      actionDetails: { targetType, targetValue }
    });

    
    processInvestigationWithTimeout(
      investigation._id,
      userId,
      targetType,
      targetValue,
      PROCESSING_CONFIG.TOTAL_TIMEOUT
    ).catch(err => console.error(`[PROCESS] Unhandled error for ${investigation._id}:`, err));

    res.status(201).json({
      success: true,
      investigationId: investigation._id,
      message: 'Investigation started',
      status: 'processing'
    });
  } catch (error) {
    console.error('Investigation start error:', error);
    res.status(500).json({ error: 'Failed to start investigation' });
  }
});


investRouter.get('/:investigationId', async (req, res) => {
  try {
    const investigation = await Investigation.findOne({
      _id: req.params.investigationId,
      userId: req.userId
    });

    if (!investigation) {
      return res.status(404).json({ error: 'Investigation not found' });
    }

    res.json({
      investigation: {
        id:                   investigation._id,
        status:               investigation.status,
        errorMessage:         investigation.errorMessage,
        threatLevel:          investigation.threatLevel,
        riskScore:            investigation.riskScore,
        scamProbability:      investigation.scamProbability,
        confidenceScore:      investigation.confidenceScore,
        targetType:           investigation.targetType,
        targetValue:          investigation.targetValue,
        linkedIdentities:     investigation.linkedIdentities     || [],
        suspiciousPatterns:   investigation.suspiciousPatterns   || [],
        behavioralInsights:   investigation.behavioralInsights   || [],
        aiSummary:            investigation.aiSummary,
        recommendations:      investigation.recommendations      || [],
        phishingDetected:     investigation.phishingDetected,
        fakeEngagementDetected: investigation.fakeEngagementDetected,
        toxicityScore:        investigation.toxicityScore,
        urlIntelligence:      investigation.urlIntelligence      || {},
        wireData:             investigation.wireData             || {},
        completedAt:          investigation.completedAt,
        processingTime:       investigation.processingTime,
        createdAt:            investigation.createdAt,
        isBookmarked:         investigation.isBookmarked
      }
    });
  } catch (error) {
    console.error('Get investigation error:', error);
    res.status(500).json({ error: 'Failed to fetch investigation' });
  }
});


investRouter.get('/', async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const [investigations, total] = await Promise.all([
      Investigation.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Investigation.countDocuments({ userId: req.userId })
    ]);

    res.json({
      investigations: investigations.map(inv => ({
        id:              inv._id,
        targetType:      inv.targetType,
        targetValue:     inv.targetValue,
        status:          inv.status,
        errorMessage:    inv.errorMessage,
        threatLevel:     inv.threatLevel,
        riskScore:       inv.riskScore,
        scamProbability: inv.scamProbability,
        createdAt:       inv.createdAt,
        isBookmarked:    inv.isBookmarked
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get investigations error:', error);
    res.status(500).json({ error: 'Failed to fetch investigations' });
  }
});


investRouter.put('/:investigationId/bookmark', async (req, res) => {
  try {
    const investigation = await Investigation.findOneAndUpdate(
      { _id: req.params.investigationId, userId: req.userId },
      { isBookmarked: !req.body.isBookmarked },
      { new: true }
    );
    if (!investigation) return res.status(404).json({ error: 'Investigation not found' });
    res.json({ success: true, isBookmarked: investigation.isBookmarked });
  } catch (error) {
    console.error('Bookmark investigation error:', error);
    res.status(500).json({ error: 'Failed to bookmark investigation' });
  }
});


async function processInvestigationWithTimeout(investigationId, userId, targetType, targetValue, maxTime) {
  const processingPromise = processInvestigation(investigationId, userId, targetType, targetValue);

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Processing timeout exceeded: ${maxTime}ms`));
    }, maxTime);
  });

  return Promise.race([processingPromise, timeoutPromise]);
}



async function processInvestigation(investigationId, userId, targetType, targetValue) {
  let investigation;
  const startTime = Date.now();

  try {
    investigation = await Investigation.findById(investigationId);
    console.log(`[PROCESS] Starting investigation ${investigationId}`);
    console.log(`[PROCESS] Target: ${targetType} / ${targetValue}`);

    
    console.log(`[PROCESS] STEP 1/3: Calling Wire API (max ${PROCESSING_CONFIG.WIRE_TIMEOUT}ms)...`);
    const wireStartTime = Date.now();

    let wireData;
    try {
      wireData = await Promise.race([
        wireService.gatherData(targetType, targetValue),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Wire API timeout')), PROCESSING_CONFIG.WIRE_TIMEOUT)
        )
      ]);
      console.log(
  '[WIRE DEBUG FULL JSON]',
  JSON.stringify(wireData.generatedJson, null, 2)
);

      const wireElapsed = Date.now() - wireStartTime;
      console.log(`[PROCESS] Wire API completed in ${wireElapsed}ms`);
      console.log(`[PROCESS]   Markdown: ${wireData.markdown?.length ?? 0} chars`);
      console.log(`[PROCESS]   JSON keys: ${Object.keys(wireData.generatedJson || {}).join(', ') || '(none)'}`);
    } catch (wireErr) {
      const wireElapsed = Date.now() - wireStartTime;
      const userMessage = wireErr instanceof WireError
        ? `Wire API error (${wireErr.code}): ${wireErr.message}`
        : `Wire API failed after ${wireElapsed}ms: ${wireErr.message}`;

      console.error(`[PROCESS] Wire API failed: ${userMessage}`);

      investigation.status       = 'failed';
      investigation.errorMessage = userMessage;
      investigation.processingTime = Date.now() - startTime;
      await investigation.save();

      await ActivityLogModel.create({
        userId,
        investigationId,
        action: 'investigation_failed',
        actionDetails: { reason: userMessage, stage: 'wire_api', elapsed: wireElapsed }
      });

      return;
    }

  
    console.log(`[PROCESS] STEP 2/3: Running AI analysis (max ${PROCESSING_CONFIG.AI_TIMEOUT}ms)...`);
    const aiStartTime = Date.now();

    let aiAnalysis;
    try {
      aiAnalysis = await Promise.race([
        aiService.analyzeTargetWithAI(targetType, targetValue, wireData),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI analysis timeout')), PROCESSING_CONFIG.AI_TIMEOUT)
        )
      ]);

      const aiElapsed = Date.now() - aiStartTime;
      console.log(`[PROCESS] AI analysis completed in ${aiElapsed}ms`);
      console.log(`[PROCESS]   Source: ${aiAnalysis.source}`);
      console.log(`[PROCESS]   Patterns: ${aiAnalysis.suspiciousPatterns?.length || 0}`);
    } catch (aiErr) {
      const aiElapsed = Date.now() - aiStartTime;
      console.warn(`[PROCESS] AI analysis failed after ${aiElapsed}ms: ${aiErr.message}`);
      console.log('[PROCESS] Using fallback rule-based analysis...');

      aiAnalysis = aiService._ruleBasedAnalysis(targetType, targetValue, wireData);
    }

  
    console.log(`[PROCESS] STEP 3/3: Calculating threat score (max ${PROCESSING_CONFIG.THREAT_ANALYSIS_TIMEOUT}ms)...`);
    const threatStartTime = Date.now();

    let threatAnalysis;
    try {
      threatAnalysis = await Promise.race([
        threatAnalysisService.calculateRisk(targetType, targetValue, wireData, aiAnalysis),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Threat analysis timeout')), PROCESSING_CONFIG.THREAT_ANALYSIS_TIMEOUT)
        )
      ]);

      const threatElapsed = Date.now() - threatStartTime;
      console.log(`[PROCESS] Threat analysis completed in ${threatElapsed}ms`);
      console.log(`[PROCESS]   Risk Score: ${threatAnalysis.riskScore}/100`);
      console.log(`[PROCESS]   Threat Level: ${threatAnalysis.threatLevel}`);
    } catch (threatErr) {
      const threatElapsed = Date.now() - threatStartTime;
      console.warn(`[PROCESS] Threat analysis failed after ${threatElapsed}ms: ${threatErr.message}`);
      console.log('[PROCESS] Using default threat analysis...');

      threatAnalysis = {
        riskScore: 0,
        threatLevel: 'unknown',
        scamProbability: 0,
        confidenceScore: 0,
        phishingDetected: false,
        fakeEngagementDetected: false,
        toxicityScore: 0
      };
    }

    
    console.log(`[PROCESS] Storing results...`);
    investigation.linkedIdentities     = aiAnalysis.linkedIdentities   || [];
    investigation.suspiciousPatterns   = aiAnalysis.suspiciousPatterns  || [];
    investigation.behavioralInsights   = aiAnalysis.behavioralInsights  || [];
    investigation.aiSummary            = aiAnalysis.summary             || 'Analysis completed.';
    investigation.recommendations      = aiAnalysis.recommendations     || [];

    investigation.urlIntelligence = {
  markdown: wireData.markdown || '',

  generatedJson: wireData.generatedJson || {},

  pageTitle:
    wireData.generatedJson?.title ||
    targetValue,

  statusCode:
    wireData.generatedJson?.statusCode || null,

  redirectChain:
    wireData.generatedJson?.redirects || [],

  extractedLinks:
    Array.isArray(wireData.generatedJson?.links)
      ? wireData.generatedJson.links
          .map(link => link.url)
          .filter(Boolean)
      : [],

  techStack:
    wireData.generatedJson?.techStack || [],

  screenshots: []
};

    investigation.wireData           = wireData;
    investigation.riskScore          = threatAnalysis.riskScore;
    investigation.threatLevel        = threatAnalysis.threatLevel;
    investigation.scamProbability    = threatAnalysis.scamProbability;
    investigation.confidenceScore    = threatAnalysis.confidenceScore;
    investigation.phishingDetected   = threatAnalysis.phishingDetected;
    investigation.fakeEngagementDetected = threatAnalysis.fakeEngagementDetected;
    investigation.toxicityScore      = threatAnalysis.toxicityScore;

    investigation.status         = 'completed';
    investigation.errorMessage   = undefined;
    investigation.completedAt    = new Date();
    investigation.processingTime = Date.now() - startTime;

    await investigation.save();

    await generateThreatReport(investigation);

    await ActivityLogModel.create({
      userId,
      investigationId,
      action: 'investigation_completed',
      actionDetails: {
        riskScore:      investigation.riskScore,
        threatLevel:    investigation.threatLevel,
        processingTime: investigation.processingTime
      }
    });

    console.log(`[PROCESS] Success: Investigation ${investigationId} completed in ${investigation.processingTime}ms`);
    console.log(`[PROCESS]   Risk: ${investigation.riskScore}/100 | Level: ${investigation.threatLevel}`);

  } catch (error) {
    console.error(`[PROCESS] Unexpected error for ${investigationId}: ${error.message}`);

    if (investigation) {
      investigation.status       = 'failed';
      investigation.errorMessage = `Processing error: ${error.message}`;
      investigation.processingTime = Date.now() - startTime;

      try {
        await investigation.save();
        console.log(`[PROCESS] Investigation marked as failed: ${investigation._id}`);
      } catch (saveErr) {
        console.error(`[PROCESS] Failed to save error state: ${saveErr.message}`);
      }
    }
  }
}


async function generateThreatReport(investigation) {
  try {
    const report = new ThreatReport({
      investigationId:    investigation._id,
      userId:             investigation.userId,
      overallRiskScore:   investigation.riskScore,
      summary:            investigation.aiSummary,
      discoveredMetadata: investigation.wireData?.metadata || {},
      linkedEntities: (investigation.linkedIdentities || []).map(identity => ({
        entityType:   'linked_account',
        value:        identity.username || identity.platform || 'unknown',
        confidence:   identity.confidence || 0,
        relationship: 'possible_connection'
      })),
      threatRecommendations: investigation.recommendations || [],
      reportContent: generateReportContent(investigation)
    });

    await report.save();
    console.log(`[REPORT] Generated: ${report._id}`);
    return report;
  } catch (error) {
    console.error('[REPORT] Generation failed:', error.message);
  }
}

function generateReportContent(investigation) {
  const wj = investigation.wireData?.generatedJson || {};
  return `
THREAT INTELLIGENCE REPORT
Generated: ${new Date().toISOString()}
Data Source: Wire API (Real) — isDemo: false

TARGET INFORMATION
URL: ${investigation.targetValue}
Investigation ID: ${investigation._id}
Page Title: ${wj.pageTitle || 'N/A'}
SSL: ${wj.ssl != null ? (wj.ssl ? 'Yes' : 'No') : 'Unavailable'}
Domain Age: ${wj.domainAge != null ? `${wj.domainAge} days` : 'Unavailable'}
Tech Stack: ${(wj.techStack || []).join(', ') || 'N/A'}
Forms Found: ${(wj.forms || []).length}
External Links: ${(wj.externalLinks || []).length}
Redirects: ${(wj.redirects || []).length}

RISK ASSESSMENT
Risk Score: ${investigation.riskScore}/100
Threat Level: ${(investigation.threatLevel || 'unknown').toUpperCase()}
Scam Probability: ${investigation.scamProbability}%
Confidence: ${investigation.confidenceScore}%
Phishing Detected: ${investigation.phishingDetected ? 'YES' : 'NO'}
Fake Engagement Detected: ${investigation.fakeEngagementDetected ? 'YES' : 'NO'}

SUMMARY
${investigation.aiSummary || 'No summary available.'}

KEY FINDINGS
${(investigation.suspiciousPatterns || []).length
  ? investigation.suspiciousPatterns.map(p => `• ${p}`).join('\n')
  : '• No suspicious patterns detected'}

BEHAVIORAL INSIGHTS
${(investigation.behavioralInsights || []).length
  ? investigation.behavioralInsights.map(i => `• ${i}`).join('\n')
  : '• No behavioral insights available'}

LINKED IDENTITIES
${(investigation.linkedIdentities || []).length
  ? investigation.linkedIdentities.map(id => `• ${id.username || id.platform} (${id.platform}) – ${id.confidence}% confidence`).join('\n')
  : '• No linked identities found'}

RECOMMENDATIONS
${(investigation.recommendations || []).length
  ? investigation.recommendations.map(r => `• ${r}`).join('\n')
  : '• No recommendations available'}

TECHNICAL DETAILS
Processing Time: ${investigation.processingTime}ms
Toxicity Score: ${investigation.toxicityScore}

---
This report was generated by SPECTER Threat Intelligence Platform using live Wire API data.
  `.trim();
}

export default investRouter;