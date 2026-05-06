import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const INHIRE_EMAIL = 'service-account-ac84cef9-a989-44ab-a10b-ee137d1e0e3c@inhire.app';
const INHIRE_PASSWORD = 'hgCPvSC9dwYE8XX5Te5p';
const INHIRE_TENANT = 'loglabdigital';

// Module-level token cache
let tokenCache = { token: null, timestamp: 0 };

function getTokenViaXHR() {
  return new Promise((resolve, reject) => {
    if (tokenCache.token && Date.now() - tokenCache.timestamp < 50 * 60 * 1000) {
      resolve(tokenCache.token);
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://auth.inhire.app/login', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Tenant', INHIRE_TENANT);
    xhr.timeout = 10000;

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        tokenCache = { token: data.accessToken, timestamp: Date.now() };
        console.log('[InHire] Token obtido:', data.accessToken?.substring(0, 20) + '...');
        resolve(data.accessToken);
      } else {
        reject(new Error(`Login falhou: ${xhr.status} ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error('Erro de rede no login'));
    xhr.ontimeout = () => reject(new Error('Timeout no login'));
    xhr.send(JSON.stringify({ email: INHIRE_EMAIL, password: INHIRE_PASSWORD }));
  });
}

async function fetchJobsViaServerFunction(token, exclusiveStartKey = null, limit = 9) {
  const res = await base44.functions.invoke('getJobs', {
    token,
    limit,
    ...(exclusiveStartKey ? { exclusiveStartKey } : {}),
  });

  const data = res.data;
  if (data.error) throw new Error(data.error);
  console.log('[InHire] Vagas abertas recebidas:', data.total);
  return data;
}

export function useInHireJobs() {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [startKey, setStartKey] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [fetchTick, setFetchTick] = useState(0);

  const loadJobs = useCallback(async (startKeyParam = null) => {
    try {
      const token = await getTokenViaXHR();
      const data = await fetchJobsViaServerFunction(token, startKeyParam);

      const processJobs = (arr) =>
        [...arr]
          .filter((j) => j.status === 'open')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (startKeyParam) {
        setAllJobs((prev) => processJobs([...prev, ...(data.results || [])]));
      } else {
        setAllJobs(processJobs(data.results || []));
      }
      setStartKey(data.startKey || null);
    } catch (err) {
      console.error('[useInHireJobs] Error:', err);
      setError('Não foi possível carregar as vagas no momento.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadJobs();
  }, [fetchTick]);

  const loadMore = useCallback(() => {
    if (!startKey || loadingMore) return;
    setLoadingMore(true);
    loadJobs(startKey);
  }, [startKey, loadingMore, loadJobs]);

  const retry = useCallback(() => setFetchTick((t) => t + 1), []);
  const setFilter = useCallback((area) => setActiveFilter(area), []);

  const jobs = activeFilter === 'Todas'
    ? allJobs
    : allJobs.filter((j) =>
        (j.area || j.department || '').toLowerCase().includes(activeFilter.toLowerCase())
      );

  return {
    jobs,
    loading,
    loadingMore,
    error,
    hasMore: !!startKey,
    loadMore,
    activeFilter,
    setFilter,
    totalJobs: allJobs.length,
    retry,
  };
}