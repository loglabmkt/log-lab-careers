import { useState, useEffect, useCallback } from "react";

const INHIRE_EMAIL = 'service-account-ac84cef9-a989-44ab-a10b-ee137d1e0e3c@inhire.app';
const INHIRE_PASSWORD = 'hgCPvSC9dwYE8XX5Te5p';
const INHIRE_TENANT = 'loglabdigital';
const AUTH_URL = 'https://auth.inhire.app/login';
const JOBS_URL = 'https://api.inhire.app/jobs/paginated';

// Module-level token cache
let tokenCache = { token: null, timestamp: 0 };

function xhrRequest({ method, url, headers, body }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    Object.entries(headers || {}).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch { resolve(xhr.responseText); }
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Request timeout'));
    xhr.timeout = 15000;

    xhr.send(body ? JSON.stringify(body) : null);
  });
}

async function getToken() {
  if (tokenCache.token && Date.now() - tokenCache.timestamp < 50 * 60 * 1000) {
    return tokenCache.token;
  }

  const data = await xhrRequest({
    method: 'POST',
    url: AUTH_URL,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant': INHIRE_TENANT,
    },
    body: { email: INHIRE_EMAIL, password: INHIRE_PASSWORD },
  });

  console.log('[InHire] Login OK. Token:', data.accessToken?.substring(0, 20) + '...');
  console.log('[InHire] Token válido?', data.accessToken?.startsWith('eyJ'));

  tokenCache = { token: data.accessToken, timestamp: Date.now() };
  return data.accessToken;
}

function xhrAttempt({ method, url, headers, body }) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    Object.entries(headers || {}).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.onload = () => {
      let parsed;
      try { parsed = JSON.parse(xhr.responseText); } catch { parsed = xhr.responseText; }
      resolve({ status: xhr.status, ok: xhr.status >= 200 && xhr.status < 300, data: parsed });
    };
    xhr.onerror = () => resolve({ status: 0, ok: false, data: 'Network error' });
    xhr.ontimeout = () => resolve({ status: 0, ok: false, data: 'Timeout' });
    xhr.timeout = 15000;
    xhr.send(body ? JSON.stringify(body) : null);
  });
}

async function fetchJobs(exclusiveStartKey = null, limit = 9) {
  const token = await getToken();
  console.log('[InHire] Buscando vagas com token:', token?.substring(0, 20) + '...');

  const body = { limit };
  if (exclusiveStartKey) body.exclusiveStartKey = exclusiveStartKey;

  const baseHeaders = { 'X-Tenant': INHIRE_TENANT, 'Content-Type': 'application/json' };

  const attempts = [
    { label: 'authorization (lowercase)', headers: { ...baseHeaders, 'authorization': `Bearer ${token}` }, url: JOBS_URL },
    { label: 'x-authorization', headers: { ...baseHeaders, 'x-authorization': `Bearer ${token}` }, url: JOBS_URL },
    { label: 'token in query string', headers: baseHeaders, url: `${JOBS_URL}?token=${token}` },
    { label: 'Basic auth', headers: { ...baseHeaders, 'Authorization': `Basic ${btoa(token + ':')}` }, url: JOBS_URL },
  ];

  for (let i = 0; i < attempts.length; i++) {
    const a = attempts[i];
    console.log(`[InHire] Tentativa ${i + 1}: ${a.label}`);
    const res = await xhrAttempt({ method: 'POST', url: a.url, headers: a.headers, body });
    console.log(`[InHire] Tentativa ${i + 1} resultado: status=${res.status}`, res.data);

    if (res.ok) {
      console.log(`[InHire] ✅ Tentativa ${i + 1} (${a.label}) funcionou!`);
      const all = res.data?.results || res.data?.items || (Array.isArray(res.data) ? res.data : []);
      const openJobs = all.filter((j) => j.status === 'open');
      console.log('[InHire] Vagas abertas recebidas:', openJobs.length);
      return { results: openJobs, startKey: res.data?.startKey || null };
    }
  }

  throw new Error('Todas as 4 tentativas falharam. Verifique os logs do console.');
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