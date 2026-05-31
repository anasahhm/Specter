import { useState, useCallback } from 'react';
import { useApi } from './useApi';

export function useInvestigation() {
  const [investigation, setInvestigation] = useState(null);
  const [investigations, setInvestigations] = useState([]);
  const { request, loading, error } = useApi();
  const [pollingStatus, setPollingStatus] = useState(null);

  const startInvestigation = async (targetType, targetValue) => {
    try {
      console.log('[HOOK] Starting investigation for:', targetValue);
      const data = await request('POST', '/investigations/start', {
        targetType,
        targetValue
      });
      return data.investigationId;
    } catch (err) {
      console.error('[HOOK] Start investigation error:', err);
      throw err;
    }
  };

  // ✅ Fast polling for hackathon - optimize for speed
  // Starts at 1s, increases gradually: 1s, 1s, 1s, 1s, 1.5s, 2s, 2.5s...
  const calculateBackoffDelay = (retries) => {
    const baseDelay = 1000; // 1 second instead of 2
    // After 4 retries, increase by 0.5s every 2 retries
    const exponentialFactor = Math.max(1, Math.floor(retries / 4));
    return baseDelay + ((exponentialFactor - 1) * 500);
  };

  const fetchInvestigation = async (investigationId, retries = 0, maxRetries = 25) => {
    try {
      console.log(`[HOOK] Fetching investigation ${investigationId} (attempt ${retries + 1}/${maxRetries})`);
      
      try {
        const data = await request('GET', `/investigations/${investigationId}`);
        
        if (data && data.investigation) {
          setInvestigation(data.investigation);
          
          // If still processing, poll again after delay
          if (data.investigation.status === 'processing' && retries < maxRetries) {
            const progress = Math.round((retries / maxRetries) * 100);
            const delay = calculateBackoffDelay(retries);
            const delaySeconds = (delay / 1000).toFixed(1);
            
            console.log(`[HOOK] Processing... (${retries + 1}/${maxRetries}) - ${progress}% - polling in ${delaySeconds}s`);
            setPollingStatus(`Processing... (${retries + 1}/${maxRetries}) - ${progress}% - waiting ${delaySeconds}s`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchInvestigation(investigationId, retries + 1, maxRetries);
          } else if (data.investigation.status === 'failed') {
            // Investigation failed
            console.error('[HOOK] Investigation failed:', data.investigation.errorMessage);
            setPollingStatus(null);
            return data.investigation;
          } else if (data.investigation.status === 'processing') {
            // Timeout reached but still processing
            console.warn('[HOOK] Investigation processing timeout - max retries reached');
            setPollingStatus('Processing took longer than expected, results may be incomplete');
            return data.investigation;
          } else {
            // Success
            console.log('[HOOK] Investigation complete, status:', data.investigation.status);
            setPollingStatus(null);
            return data.investigation;
          }
        } else {
          throw new Error('Invalid investigation response format');
        }
      } catch (fetchErr) {
        // ✅ Handle rate limiting (429) with quick backoff
        if (fetchErr.response?.status === 429) {
          console.warn(`[HOOK] ⚠️  Rate limited (429)! Backing off...`);
          
          if (retries < maxRetries) {
            // Quick delay for rate limit (5-8 seconds for hackathon)
            const rateLimitDelay = 5000 + Math.random() * 3000;
            const delaySeconds = (rateLimitDelay / 1000).toFixed(1);
            
            setPollingStatus(`⚠️  Rate limited - recovering in ${delaySeconds}s (${retries + 1}/${maxRetries})`);
            console.log(`[HOOK] Rate limit detected - waiting ${delaySeconds}s before retry`);
            
            await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
            return fetchInvestigation(investigationId, retries + 1, maxRetries);
          } else {
            throw new Error('Rate limited - please wait before trying again');
          }
        }
        
        // ✅ Handle timeout errors (408, 504)
        if (fetchErr.code === 'ECONNABORTED' || fetchErr.response?.status === 408 || fetchErr.response?.status === 504) {
          console.warn(`[HOOK] Request timeout, backing off and retrying...`);
          
          if (retries < maxRetries) {
            const retryDelay = calculateBackoffDelay(retries) + 2000;
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return fetchInvestigation(investigationId, retries + 1, maxRetries);
          } else {
            throw new Error('Request timeout - server not responding');
          }
        }
        
        // Re-throw other errors
        throw fetchErr;
      }
    } catch (err) {
      console.error('[HOOK] Fetch investigation error:', err);
      throw err;
    }
  };

  const fetchInvestigations = async (page = 1, limit = 10) => {
    try {
      console.log('[HOOK] Fetching investigations list, page:', page);
      const data = await request('GET', `/investigations?page=${page}&limit=${limit}`);
      if (data && data.investigations) {
        setInvestigations(data.investigations);
      }
      return data;
    } catch (err) {
      console.error('[HOOK] Fetch investigations error:', err);
      throw err;
    }
  };

  const bookmarkInvestigation = async (investigationId, isBookmarked) => {
    try {
      console.log('[HOOK] Toggling bookmark for:', investigationId);
      await request('PUT', `/investigations/${investigationId}/bookmark`, { isBookmarked });
      // Update local state
      if (investigation && investigation.id === investigationId) {
        setInvestigation({ ...investigation, isBookmarked: !isBookmarked });
      }
    } catch (err) {
      console.error('[HOOK] Bookmark investigation error:', err);
      throw err;
    }
  };

  return {
    investigation,
    investigations,
    startInvestigation,
    fetchInvestigation,
    fetchInvestigations,
    bookmarkInvestigation,
    loading,
    error,
    pollingStatus
  };
}