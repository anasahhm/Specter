class ThreatAnalysisService {
  constructor() {
    console.log('[THREAT] Service initialized');
  }

  async calculateRisk(targetType, targetValue, wireData, aiAnalysis) {
    console.log(`[THREAT] Calculating risk for: ${targetValue}`);
    const startTime = Date.now();

    if (targetType !== 'url') {
      return this.unknownRisk('Unsupported target type');
    }

    const wireJson = wireData?.generatedJson || {};
    const markdown  = wireData?.markdown      || '';

    let score     = 0;
    const breakdown = {
      domainRisk:    0,
      formRisk:      0,
      sslRisk:       0,
      contentRisk:   0,
      behavioralRisk: 0
    };

    breakdown.domainRisk = this.domainRisk(targetValue, wireJson, aiAnalysis);
    score += breakdown.domainRisk;

    // Only score if Wire returned actual form data
    breakdown.formRisk = this.formRisk(wireJson);
    score += breakdown.formRisk;

    breakdown.sslRisk = this.sslRisk(targetValue, wireJson);
    score += breakdown.sslRisk;


    breakdown.contentRisk = this.contentRisk(markdown);
    score += breakdown.contentRisk;

    
    breakdown.behavioralRisk = this.behavioralRisk(targetValue, wireJson, aiAnalysis);
    score += breakdown.behavioralRisk;

    score = Math.min(100, Math.max(0, Math.round(score)));

    const threatLevel         = this.level(score);
    const scamProbability     = this.scamProbability(score, markdown, aiAnalysis);
    const confidenceScore     = this.confidence(wireJson, score);
    const toxicityScore       = Math.round(score * 0.8);
    const phishingDetected    = this.detectPhishing(score, aiAnalysis);
    const fakeEngagementDetected = this.detectFakeEngagement(score, markdown, aiAnalysis);

    const suspiciousPatterns  = aiAnalysis?.suspiciousPatterns  || [];
    const behavioralInsights  = aiAnalysis?.behavioralInsights  || [];

    console.log(`[THREAT] ✓ Scored in ${Date.now() - startTime}ms – ${score}/100 (${threatLevel})`);

    return {
      riskScore:   score,
      threatLevel,
      scamProbability:     Math.round(scamProbability),
      confidenceScore:     Math.round(confidenceScore),
      toxicityScore,
      phishingDetected,
      fakeEngagementDetected,
      suspiciousPatterns,
      behavioralInsights,
      riskBreakdown: breakdown,
      dataSource: 'wire_api'
    };
  }

  

  domainRisk(url, wireJson, aiAnalysis) {
    let risk = 0;
    const domain = this.extractDomain(url);

if (/^\d{1,3}(\.\d{1,3}){3}$/.test(domain))
  risk += 5;

if (domain.includes('secure'))
  risk += 2;

if (domain.includes('verify'))
  risk += 2;

if (domain.includes('update'))
  risk += 2;

if (domain.includes('login'))
  risk += 2;

    
    const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.ru', '.cn', '.top', '.pw', '.cc'];
    if (suspiciousTLDs.some(t => domain.endsWith(t))) risk += 12;

    
    if (wireJson.domainAge != null) {
      if (wireJson.domainAge < 30)  risk += 10;
      else if (wireJson.domainAge < 90) risk += 5;
    }

    
    if (aiAnalysis?.suspiciousPatterns?.some(p =>
      p.toLowerCase().includes('impersonation') || p.toLowerCase().includes('phishing')
    )) {
      risk += 15;
    }

    
    if (domain.length > 40) risk += 5;

    
    if (
  !this.isKnownLegitDomain(domain) &&
  !domain.endsWith('.gov') &&
  !domain.endsWith('.edu')
) {
  risk += 3;
}

    return Math.min(30, risk);
  }

  formRisk(wireJson) {
    const forms = wireJson.forms;
    if (!Array.isArray(forms) || forms.length === 0) return 0;

    let risk = 0;
    forms.forEach(form => {
      const inputs = (form.inputs || []).map(i => i.toLowerCase());

      if (inputs.some(i => i.includes('password') || i.includes('pass'))) risk += 15;
      if (inputs.some(i => i.includes('card') || i.includes('cvv') || i.includes('ssn'))) risk += 25;
      if (inputs.some(i => i.includes('email'))) risk += 5;
      if (inputs.some(i => i.includes('phone') || i.includes('address') || i === 'name')) risk += 8;
    });

    return Math.min(30, risk);
  }

  sslRisk(url, wireJson) {
    let risk = 0;
    
    if (wireJson.ssl === false) risk += 15;
    
    if (url.startsWith('http://')) risk += 10;
    return Math.min(15, risk);
  }

  contentRisk(markdown) {
    if (!markdown) return 0;
    const lower = markdown.toLowerCase();
    const phishingKeywords = [
  'verify account',
  'confirm identity',
  'urgent action',
  'suspended',
  'limited access',
  'unauthorized access',
  'claim reward',
  'act now',
  'update your information',
  'your account has been',
  'confirm your details',
  'password expired',
  'login required',
  'account locked',
  'verify payment',
  'security alert'
];
    const hits = phishingKeywords.filter(kw => lower.includes(kw)).length;
    return Math.min(15, hits * 4);
  }

  behavioralRisk(url, wireJson, aiAnalysis) {
    let risk = 0;

    if (Array.isArray(wireJson.redirects) && wireJson.redirects.length > 2) risk += 5;
    if (Array.isArray(wireJson.externalLinks) && wireJson.externalLinks.length > 10) risk += 3;


    const domain = this.extractDomain(url);
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(domain)) risk += 5;


    if ((domain.match(/-/g) || []).length > 2) risk += 2;

    if ((aiAnalysis?.behavioralInsights || []).length > 0) {
      risk += Math.min(5, aiAnalysis.behavioralInsights.length * 2);
    }

    return Math.min(10, risk);
  }

  scamProbability(score, markdown, aiAnalysis) {
    let p = score * 0.7;
    const lower = (markdown || '').toLowerCase();
    const scamWords = ['reward', 'claim', 'prize', 'limited time', 'verify account', 'urgent'];
    p += scamWords.filter(w => lower.includes(w)).length * 10;
    if (aiAnalysis?.suspiciousPatterns?.some(p => p.toLowerCase().includes('phishing'))) p += 20;
    return Math.min(100, Math.max(0, p));
  }


  confidence(wireJson, score) {
    let base = 50;
    if (wireJson.ssl       != null) base += 10;
    if (wireJson.domainAge != null) base += 10;
    if (Array.isArray(wireJson.forms)) base += 10;
    if (wireJson.pageTitle)           base += 5;
    if (Array.isArray(wireJson.techStack) && wireJson.techStack.length > 0) base += 5;
    // Clamp to a reasonable range — very high scores also raise confidence
    return Math.min(95, base + score * 0.1);
  }

  detectPhishing(score, aiAnalysis) {
    return score > 60 ||
      (aiAnalysis?.suspiciousPatterns || []).some(p =>
        p.toLowerCase().includes('phishing') ||
        p.toLowerCase().includes('credential') ||
        p.toLowerCase().includes('impersonat')
      );
  }

  detectFakeEngagement(score, markdown, aiAnalysis) {
    const lower = (markdown || '').toLowerCase();
    return score > 70 ||
      lower.includes('claim reward') ||
      lower.includes('you have won') ||
      lower.includes('verify account') ||
      (aiAnalysis?.suspiciousPatterns || []).some(p =>
        p.toLowerCase().includes('reward') ||
        p.toLowerCase().includes('claim') ||
        p.toLowerCase().includes('verify account')
      );
  }

  level(score) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'safe';
  }

  extractDomain(url) {
    try {
      const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
      return u.hostname;
    } catch { return url; }
  }

  isKnownLegitDomain(domain) {
    const legit = [
      'discord.com', 'discord.gg', 'github.com', 'github.io',
      'google.com', 'gmail.com', 'microsoft.com', 'outlook.com',
      'live.com', 'office.com', 'office365.com',
      'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
      'reddit.com', 'stackoverflow.com', 'wikipedia.org', 'youtube.com',
      'linkedin.com', 'amazon.com', 'ebay.com', 'paypal.com', 'stripe.com',
      'vercel.app', 'netlify.app', 'heroku.com',
      'nextjs.org', 'react.dev', 'nodejs.org', 'npmjs.com'
    ];
    return legit.some(l => domain === l || domain.endsWith('.' + l));
  }

  unknownRisk(reason) {
    return {
      riskScore:   0,
      threatLevel: 'unknown',
      scamProbability:      0,
      confidenceScore:      0,
      toxicityScore:        0,
      phishingDetected:     false,
      fakeEngagementDetected: false,
      suspiciousPatterns:   [],
      behavioralInsights:   [],
      riskBreakdown: { domainRisk: 0, formRisk: 0, sslRisk: 0, contentRisk: 0, behavioralRisk: 0 },
      dataSource: 'none',
      note: reason
    };
  }
}

export default new ThreatAnalysisService();
