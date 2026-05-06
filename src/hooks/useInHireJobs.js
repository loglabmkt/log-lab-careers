import { useState, useEffect, useCallback } from "react";

const INHIRE_EMAIL = 'service-account-ac84cef9-a989-44ab-a10b-ee137d1e0e3c@inhire.app';
const INHIRE_PASSWORD = 'hgCPvSC9dwYE8XX5Te5p';
const INHIRE_TENANT = 'loglabdigital';
const AUTH_URL = 'https://auth.inhire.app/login';
const JOBS_URL = 'https://api.inhire.app/jobs/paginated';

// Module-level token cache
let cachedToken = null;
let tokenTimestamp = 0;
const TOKEN_TTL = 50 * 60 * 1000; // 50 minutes

async function getToken() {
  const now = Date.now();
  if (cachedToken && now - tokenTimestamp < TOKEN_TTL) return cachedToken;

  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant': INHIRE_TENANT,
    },
    body: JSON.stringify({ email: INHIRE_EMAIL, password: INHIRE_PASSWORD }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Auth failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  cachedToken = data.accessToken;
  tokenTimestamp = now;
  return cachedToken;
}

async function fetchJobs(exclusiveStartKey = null, limit = 9) {
  const token = await getToken();

  const body = { limit };
  if (exclusiveStartKey) body.exclusiveStartKey = exclusiveStartKey;

  const res = await fetch(JOBS_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant': INHIRE_TENANT,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Jobs fetch failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  const all = data.results || data.items || (Array.isArray(data) ? data : []);
  const results = all.filter((j) => j.status === 'open');
  return { results, startKey: data.startKey || null };
}

export function useInHireJobs() {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [startKey, setStartKey] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [fetchTick, setFetchTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchJobs()
      .then(({ results, startKey: sk }) => {
        if (cancelled) return;
        setAllJobs(results);
        setStartKey(sk);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[useInHireJobs]', err);
        setError('Não foi possível carregar as vagas no momento.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [fetchTick]);

  const loadMore = useCallback(async () => {
    if (!startKey || loadingMore) return;
    setLoadingMore(true);
    try {
      const { results, startKey: sk } = await fetchJobs(startKey);
      setAllJobs((prev) => [...prev, ...results]);
      setStartKey(sk);
    } catch (err) {
      console.error('[useInHireJobs loadMore]', err);
    } finally {
      setLoadingMore(false);
    }
  }, [startKey, loadingMore]);

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