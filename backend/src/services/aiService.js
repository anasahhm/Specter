import axios from 'axios';

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || null;
    this.model = 'gemini-2.5-flash';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

    if (this.apiKey) {
      console.log(`[AI] Service initialized – model: ${this.model}`);
    } else {
      console.log('[AI] No Gemini API key configured – using rule-based Wire data analysis');
    }
  }

  async analyzeTargetWithAI(targetType, targetValue, wireData) {
    if (!this.apiKey) {
      console.log('[AI] Gemini unavailable, using rule-based analysis');
      return this._ruleBasedAnalysis(targetType, targetValue, wireData);
    }

    if (targetType !== 'url') {
      return this._ruleBasedAnalysis(targetType, targetValue, wireData);
    }

    try {
      return await this._geminiAnalysis(targetType, targetValue, wireData);
    } catch (err) {
      console.warn(`[AI] Analysis failed (${err.message}), falling back to rule-based`);
      return this._ruleBasedAnalysis(targetType, targetValue, wireData);
    }
  }

  async analyzeTargetFast(targetType, targetValue, wireData) {
    return this._ruleBasedAnalysis(targetType, targetValue, wireData);
  }

  async _geminiAnalysis(targetType, targetValue, wireData, retryCount = 0) {
    const prompt = this._buildPrompt(targetType, targetValue, wireData);
    const startTime = Date.now();

    try {
      console.log(`[AI] Gemini API request (attempt ${retryCount + 1}/3) for: ${targetValue}`);

      const response = await axios.post(
        `${this.baseUrl}/models/${this.model}:generateContent`,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
                                temperature: 0.1,
                                maxOutputTokens: 2048,
                                responseMimeType: "application/json"
                            }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          },
          timeout: 30000
        }
      );

      const elapsed = Date.now() - startTime;

      if (response.status !== 200) {
        throw new Error(`Gemini returned status ${response.status}`);
      }

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No response text from Gemini');
      }

      console.log(`[AI] Gemini response received in ${elapsed}ms`);
      return this._parseResponse(text, targetValue, wireData);
    } catch (err) {
      const elapsed = Date.now() - startTime;
      const errorMsg = err.response?.data?.error?.message || err.message;

      console.warn(`[AI] Request failed after ${elapsed}ms: ${errorMsg}`);

      if (retryCount < 2) {
        console.log(`[AI] Retrying (attempt ${retryCount + 2}/3) after 2s delay...`);
        await new Promise(r => setTimeout(r, 2000));
        return this._geminiAnalysis(targetType, targetValue, wireData, retryCount + 1);
      }

      console.error(`[AI] Failed after 3 attempts, using rule-based analysis`);
      throw err;
    }
  }

_buildPrompt(targetType, targetValue, wireData) {
  const wj = wireData?.generatedJson || {};

  return `
You are a senior cybersecurity threat analyst.

Analyze the following website intelligence collected from a live Wire API scrape.

URL:
${targetValue}

TITLE:
${wj.title || 'Unknown'}

DESCRIPTION:
${wj.description || 'None'}

PAGE TYPE:
${wj.pageType || 'Unknown'}

METADATA:
${JSON.stringify(wj.metadata || {}, null, 2)}

LINKS:
${JSON.stringify((wj.links || []).slice(0, 20), null, 2)}

SECTIONS:
${JSON.stringify((wj.sections || []).slice(0, 5), null, 2)}

SCRAPED CONTENT:
${(wireData?.markdown || '').substring(0, 4000)}

IMPORTANT RULES:

1. Use ONLY the supplied data.
2. Do NOT invent information.
3. Do NOT wrap output in markdown.
4. Return VALID JSON ONLY.
5. Every field must exist.

Return EXACTLY:

{
  "summary": "brief threat assessment",
  "suspiciousPatterns": [],
  "behavioralInsights": [],
  "linkedIdentities": [],
  "recommendations": []
}
`;
}


_parseResponse(raw, targetValue, wireData) {
  try {
    let cleaned = raw.trim();

    cleaned = cleaned
      .replace(/^```json/i, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start === -1 || end === -1) {
      throw new Error('No JSON object found');
    }

    cleaned = cleaned.slice(start, end + 1);

    const parsed = JSON.parse(cleaned);

    return {
      summary:
        typeof parsed.summary === 'string'
          ? parsed.summary
          : 'Analysis completed.',

      suspiciousPatterns:
        Array.isArray(parsed.suspiciousPatterns)
          ? parsed.suspiciousPatterns
          : [],

      behavioralInsights:
        Array.isArray(parsed.behavioralInsights)
          ? parsed.behavioralInsights
          : [],

      linkedIdentities:
  Array.isArray(parsed.linkedIdentities)
    ? parsed.linkedIdentities.map(item => {
        if (typeof item === 'string') {
          return { username: item, platform: 'Unknown', confidence: 50 };
        }
        if (typeof item === 'object' && item !== null) {
          return {
            username:   item.username   || item.name  || item.value || 'Unknown',
            platform:   item.platform   || item.type  || 'Unknown',
            confidence: item.confidence ?? 50
          };
        }
        return { username: 'Unknown', platform: 'Unknown', confidence: 50 };
      })
    : [],

      recommendations:
        Array.isArray(parsed.recommendations)
          ? parsed.recommendations
          : [],

      source: 'gemini'
    };
  } catch (err) {
    console.warn(`[AI] Failed to parse Gemini response: ${err.message}`);
    console.warn(`[AI] Raw response: ${raw.substring(0, 500)}`);

    return this._ruleBasedAnalysis(
      'url',
      targetValue,
      wireData
    );
  }
}

  _ruleBasedAnalysis(targetType, targetValue, wireData) {
    if (targetType !== 'url') {
      return {
        summary: 'Analysis not supported for this target type.',
        suspiciousPatterns: [],
        behavioralInsights: [],
        linkedIdentities: [],
        recommendations: [],
        source: 'rule-based'
      };
    }

    const domain = this._extractDomain(targetValue);
    const wj = wireData?.generatedJson || {};
    const markdown = (wireData?.markdown || '').toLowerCase();
    const urlLower = targetValue.toLowerCase();

    const suspiciousPatterns = [];
    const brandNames = [
  'paypal',
  'amazon',
  'microsoft',
  'apple',
  'google',
  'facebook',
  'discord',
  'netflix',
  'bank'
];

brandNames.forEach(brand => {
  if (
    domain.includes(brand) &&
    !domain.endsWith(`${brand}.com`)
  ) {
    suspiciousPatterns.push(
      `Potential ${brand} impersonation domain`
    );
  }
});
    const behavioralInsights = [];
    const linkedIdentities = [];
    const recommendations = [];

    if (wj.ssl === false) {
      suspiciousPatterns.push('No SSL/HTTPS certificate – data transmission is unencrypted');
      recommendations.push('Do not submit sensitive data on sites without SSL');
    }

    if (wj.domainAge != null && wj.domainAge < 30) {
      suspiciousPatterns.push(`Very new domain (${wj.domainAge} days old) – common phishing indicator`);
      recommendations.push('Recently registered domains are frequently used in phishing campaigns');
    } else if (wj.domainAge != null && wj.domainAge < 90) {
      behavioralInsights.push(`Domain is relatively new (${wj.domainAge} days) – exercise caution`);
    }

    const forms = wj.forms || [];
    const allInputs = forms.flatMap(f => (f.inputs || []).map(i => i.toLowerCase()));

    if (allInputs.some(i => i.includes('password') || i.includes('pass'))) {
      suspiciousPatterns.push('Login/credential form detected – possible credential harvesting risk');
      recommendations.push('Never enter credentials on untrusted websites');
    }
    if (allInputs.some(i => i.includes('card') || i.includes('cvv') || i.includes('ssn'))) {
      suspiciousPatterns.push('Financial data form detected (card/CVV/SSN fields)');
      recommendations.push('CRITICAL: Do not provide payment information to this site');
    }
    if (allInputs.some(i => i.includes('email'))) {
      behavioralInsights.push('Email collection form present – could be spam harvesting');
    }

    if (Array.isArray(wj.redirects) && wj.redirects.length > 2) {
      suspiciousPatterns.push(`${wj.redirects.length} redirect hops detected – possible URL cloaking`);
    }

    const phishingKeywords = ['verify account', 'confirm identity', 'urgent action', 'suspended', 'claim reward', 'act now', 'update your information'];
    const foundKws = phishingKeywords.filter(kw => markdown.includes(kw));
    if (foundKws.length > 0) {
      suspiciousPatterns.push(`Phishing language detected: "${foundKws[0]}"`);
      recommendations.push('Site uses urgency/fear tactics – classic social engineering');
    }

    const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top', '.pw'];
    if (suspiciousTLDs.some(t => domain.endsWith(t))) {
      const tld = domain.split('.').pop();
      suspiciousPatterns.push(`Suspicious TLD: .${tld}`);
    }

    const brands = ['paypal', 'amazon', 'microsoft', 'apple', 'google', 'facebook', 'netflix', 'discord'];
    brands.forEach(brand => {
      if (urlLower.includes(brand) && !urlLower.includes(`${brand}.com`)) {
        suspiciousPatterns.push(`Possible ${brand} brand impersonation in URL`);
        linkedIdentities.push({ username: brand, platform: 'Brand Impersonation', confidence: 80 });
        recommendations.push(`Verify this is the official ${brand} website`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Verify the website legitimacy before submitting any personal information');
    }

    const knownLegit = ['google.com', 'github.com', 'microsoft.com', 'discord.com', 'reddit.com', 'wikipedia.org', 'stackoverflow.com', 'youtube.com', 'linkedin.com'];
    let summary;

    if (knownLegit.some(l => domain === l || domain.endsWith('.' + l))) {
      summary = `${domain} is a widely recognised legitimate platform. No threat indicators detected.`;
    } else if (suspiciousPatterns.length === 0) {
      summary = `No significant threat indicators found for ${domain} based on Wire API data.${wj.pageTitle ? ` Page title: "${wj.pageTitle}".` : ''} Always exercise caution on unfamiliar sites.`;
    } else {
      const severity = suspiciousPatterns.length >= 3 ? 'CRITICAL' : suspiciousPatterns.length >= 2 ? 'HIGH' : 'MEDIUM';
      summary = `${severity} RISK: ${suspiciousPatterns.length} threat indicator(s) identified for ${domain}. ${suspiciousPatterns[0]}.`;
    }

    return {
      summary,
      suspiciousPatterns,
      behavioralInsights,
      linkedIdentities,
      recommendations,
      source: 'rule-based-wire-data'
    };
  }

  _extractDomain(url) {
    try {
      const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
      return u.hostname;
    } catch {
      return url;
    }
  }
}

export default new AIService();