import { useState, useEffect, useCallback } from 'react';

interface PatientHistoryResponse {
  history?: string;
  error?: string;
}

const API_BASE_URL = 'https://api.ris.somatiq.ai/api/v1';
const SECRET_KEY = 'krRxnikwwnbtuVoSdH0Wp0OU88WKvxqc';

// Cache to store patient history by StudyInstanceUID
const historyCache = new Map<string, { history: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getAuthToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/integration/token?secret_key=${SECRET_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.status}`);
    }
    const data = await response.json();
    console.log('Token response:', data);
    return data.token || data.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

async function fetchPatientHistory(studyInstanceUID: string, token: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/external/patient-details/${studyInstanceUID}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch patient details: ${response.status}`);
    }

    const data = await response.json();
    return data.patient_history || null;
  } catch (error) {
    console.error('Error fetching patient history:', error);
    return null;
  }
}

function usePatientHistory(studyInstanceUID?: string) {
  const [history, setHistory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (studyUID: string) => {
    if (!studyUID) return;

    // Check cache first
    const cached = historyCache.get(studyUID);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      setHistory(cached.history);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get auth token
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Failed to authenticate');
      }

      // Fetch patient history
      const patientHistory = await fetchPatientHistory(studyUID, token);

      if (patientHistory) {
        // Cache the result
        historyCache.set(studyUID, {
          history: patientHistory,
          timestamp: Date.now(),
        });

        setHistory(patientHistory);
      } else {
        setHistory('No patient history available.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch patient history';
      setError(errorMsg);
      setHistory(''); // Clear history on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (studyInstanceUID) {
      fetchHistory(studyInstanceUID);
    }
  }, [studyInstanceUID, fetchHistory]);

  const refetch = useCallback(() => {
    if (studyInstanceUID) {
      // Clear cache for this study and refetch
      historyCache.delete(studyInstanceUID);
      fetchHistory(studyInstanceUID);
    }
  }, [studyInstanceUID, fetchHistory]);

  return {
    history,
    loading,
    error,
    refetch,
  };
}

export default usePatientHistory;
