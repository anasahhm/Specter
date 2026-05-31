import axios from 'axios';

export function normalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') throw new Error('URL is required');
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// WIRE SERVICE  (powered by Anakin.io)
class WireService {
  constructor() {
    this.apiKey  = process.env.WIRE_API_KEY || null;
    // Anakin real base URL — can be overridden via WIRE_API_BASE
    this.baseUrl = (process.env.WIRE_API_BASE || 'https://api.anakin.io/v1').replace(/\/$/, '');

    if (!this.apiKey) {
      console.error('[WIRE] ❌ WIRE_API_KEY is not set. Investigations will fail.');
    } else {
      console.log(`[WIRE] ✓ Service initialized – endpoint: ${this.baseUrl}`);
    }
  }


  async scrapeUrl(rawUrl) {
    const url = normalizeUrl(rawUrl);
    console.log(`[WIRE] Scraping URL: ${url}`);

    if (!this.apiKey) {
      throw new WireError(
        'WIRE_API_KEY is not configured. Cannot perform investigation.',
        'NO_API_KEY'
      );
    }


    let jobId;
    try {
      console.log(`[WIRE] Submitting job to ${this.baseUrl}/url-scraper`);

      const submitRes = await axios.post(
        `${this.baseUrl}/url-scraper`,
        {
          url,
          country:      'us',
          useBrowser:   false,
          generateJson: true   
        },
        {
          headers: {
            'X-API-Key':    this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      
      jobId = submitRes.data?.jobId || submitRes.data?.id;

      if (!jobId) {
        throw new WireError(
          `Anakin API did not return a job ID. Response: ${JSON.stringify(submitRes.data)}`,
          'NO_JOB_ID'
        );
      }

      console.log(`[WIRE] ✓ Job submitted, ID: ${jobId}`);

    } catch (err) {
      if (err instanceof WireError) throw err;
      const httpStatus = err.response?.status;
      const body       = JSON.stringify(err.response?.data ?? {});
      throw new WireError(
        `Wire API submission failed (HTTP ${httpStatus ?? 'no-response'}): ${err.message} – ${body}`,
        'SUBMIT_FAILED',
        httpStatus
      );
    }

  
    const result = await this.pollJob(jobId);

    console.log(`[WIRE] ✓ Scrape completed for: ${url}`);

    return {
      url,
      markdown:      result.markdown      || '',
      cleanedHtml:   result.cleanedHtml   || '',
      generatedJson: result.generatedJson?.data || result.generatedJson || {},
      cached:        result.cached         || false,
      durationMs:    result.durationMs     || 0,
      jobId,
      isDemo:        false,
      timestamp:     new Date().toISOString()
    };
  }


  async pollJob(jobId, maxAttempts = 30, intervalMs = 3000) {
    console.log(`[WIRE] Polling job ${jobId} (max ${maxAttempts} × ${intervalMs}ms = ${(maxAttempts * intervalMs) / 1000}s timeout)`);

    for (let i = 0; i < maxAttempts; i++) {
      await sleep(intervalMs);

      let res;
      try {
        res = await axios.get(
          `${this.baseUrl}/url-scraper/${jobId}`,
          {
            headers: { 'X-API-Key': this.apiKey },
            timeout: 15000
          }
        );
      } catch (err) {
        const httpStatus = err.response?.status;
        console.warn(`[WIRE] Poll attempt ${i + 1} error (HTTP ${httpStatus ?? 'none'}): ${err.message}`);
        if (i === maxAttempts - 1) {
          throw new WireError(
            `Wire poll failed after ${maxAttempts} attempts: ${err.message}`,
            'POLL_FAILED',
            httpStatus
          );
        }
        continue;
      }

      const status = res.data?.status;
      console.log(`[WIRE] Poll ${i + 1}/${maxAttempts} – status: ${status}`);

      if (status === 'completed') {
        console.log(`[WIRE] ✓ Job ${jobId} completed (${res.data.durationMs ?? '?'}ms)`);
        return res.data;
      }

      if (status === 'failed') {
        throw new WireError(
          `Anakin job ${jobId} failed: ${res.data?.error || 'unknown reason'}`,
          'JOB_FAILED'
        );
      }

    
    }

    throw new WireError(
      `Wire job ${jobId} timed out after ${maxAttempts} attempts (${(maxAttempts * intervalMs) / 1000}s)`,
      'TIMEOUT'
    );
  }

  
  async gatherData(targetType, targetValue) {
    if (targetType !== 'url') {
      throw new WireError(
        `Unsupported target type: ${targetType}. Only 'url' is supported.`,
        'UNSUPPORTED_TYPE'
      );
    }

    const result   = await this.scrapeUrl(targetValue);
    const enriched = this.enrichWebsiteInfo(result.generatedJson || {});

    console.log(`[WIRE] ✓ Gathered data for ${result.url}`);
    console.log(`[WIRE]   markdown: ${result.markdown.length} chars`);
    console.log(`[WIRE]   generatedJson keys: ${Object.keys(result.generatedJson).join(', ') || '(none)'}`);
    console.log(`[WIRE]   cached: ${result.cached}`);

    return {
      targetType:    'url',
      targetValue:   result.url,          
      metadata:      result.generatedJson || {},
      websiteInfo:   enriched,
      markdown:      result.markdown,
      cleanedHtml:   result.cleanedHtml,
      generatedJson: result.generatedJson,
      cached:        result.cached,
      durationMs:    result.durationMs,
      isDemo:        false,
      jobId:         result.jobId,
      timestamp:     result.timestamp
    };
  }


  enrichWebsiteInfo(jsonData) {
  const links = jsonData.links || [];

  return {
    ...jsonData,

    pageTitle: jsonData.title || '',

    externalLinks: links.map(l => l.url).filter(Boolean),

    externalLinkCount: links.length,

    sectionCount: (jsonData.sections || []).length,

    imageCount: (jsonData.metadata?.imageUrls || []).length,

    hasLoginKeywords:
      JSON.stringify(jsonData).toLowerCase().includes('login') ||
      JSON.stringify(jsonData).toLowerCase().includes('sign in') ||
      JSON.stringify(jsonData).toLowerCase().includes('password'),

    hasPaymentKeywords:
      JSON.stringify(jsonData).toLowerCase().includes('payment') ||
      JSON.stringify(jsonData).toLowerCase().includes('card') ||
      JSON.stringify(jsonData).toLowerCase().includes('checkout')
  };
}
}


export class WireError extends Error {
  constructor(message, code, httpStatus) {
    super(message);
    this.name       = 'WireError';
    this.code       = code;
    this.httpStatus = httpStatus;
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export default new WireService();
