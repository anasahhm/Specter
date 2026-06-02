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
    this.baseUrl = (process.env.WIRE_API_BASE || 'https://api.anakin.io/v1').replace(/\/$/, '');
    // FIX: Separate polling timeout from total job timeout
    this.POLL_TIMEOUT_MS = 180000;  // 3 minutes for polling total
    this.SINGLE_POLL_TIMEOUT_MS = 15000; // 15 seconds per individual request

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

    // FIX: Use proper polling with time-based timeout
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

  /**
   * FIX: Improved polling with time-based timeout instead of attempt-based
   * Rationale:
   * - Backoff intervals vary, so 60 attempts ≠ 60 seconds of actual waiting
   * - Use absolute deadline instead to be predictable
   */
  async pollJob(jobId) {
    const startTime = Date.now();
    const deadline = startTime + this.POLL_TIMEOUT_MS;
    let attemptNum = 0;

    console.log(`[WIRE] Polling job ${jobId} (max ${this.POLL_TIMEOUT_MS}ms timeout)`);

    while (Date.now() < deadline) {
      attemptNum++;

      // Calculate backoff with exponential growth, capped at 10s
      const backoffMs = Math.min(1000 + (attemptNum - 1) * 500, 10000);
      console.log(`[WIRE] Poll ${attemptNum} – waiting ${backoffMs}ms before request...`);
      
      await sleep(backoffMs);

      // Check deadline again after sleep
      if (Date.now() >= deadline) {
        const elapsed = Date.now() - startTime;
        throw new WireError(
          `Wire job ${jobId} timed out after ${elapsed}ms (deadline: ${this.POLL_TIMEOUT_MS}ms)`,
          'TIMEOUT'
        );
      }

      let res;
      try {
        res = await axios.get(
          `${this.baseUrl}/url-scraper/${jobId}`,
          {
            headers: { 'X-API-Key': this.apiKey },
            timeout: this.SINGLE_POLL_TIMEOUT_MS
          }
        );
      } catch (err) {
        const httpStatus = err.response?.status;
        const elapsed = Date.now() - startTime;
        
        console.warn(
          `[WIRE] Poll ${attemptNum} failed after ${elapsed}ms (HTTP ${httpStatus ?? 'none'}): ${err.message}`
        );

        // If we're out of time, fail immediately
        if (Date.now() >= deadline) {
          throw new WireError(
            `Wire poll timeout after ${elapsed}ms: ${err.message}`,
            'POLL_FAILED',
            httpStatus
          );
        }

        // Otherwise, continue to next attempt
        continue;
      }

      const status = res.data?.status;
      const elapsed = Date.now() - startTime;
      console.log(`[WIRE] Poll ${attemptNum} – status: ${status} (elapsed: ${elapsed}ms)`);

      if (status === 'completed') {
        console.log(`[WIRE] ✓ Job ${jobId} completed in ${elapsed}ms`);
        return res.data;
      }

      if (status === 'failed') {
        throw new WireError(
          `Anakin job ${jobId} failed: ${res.data?.error || 'unknown reason'}`,
          'JOB_FAILED'
        );
      }

      // Status is 'processing', loop continues
    }

    // Deadline exceeded
    const elapsed = Date.now() - startTime;
    throw new WireError(
      `Wire job ${jobId} exceeded deadline (${this.POLL_TIMEOUT_MS}ms) after ${attemptNum} attempts`,
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

function sleep(ms) { 
  return new Promise(r => setTimeout(r, ms)); 
}

export default new WireService();
