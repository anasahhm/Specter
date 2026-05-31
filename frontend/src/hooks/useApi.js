import { useState, useCallback } from 'react';
import apiClient from '../api/client';
 
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const request = useCallback(async (method, endpoint, data = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient({
        method,
        url: endpoint,
        data
      });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
 
  return { request, loading, error };
}