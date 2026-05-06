// In-memory token cache
let tokenCache = { accessToken: null, refreshToken: null, expiresAt: 0 };

async function tryFetch(url, options) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let body;
    try { body = JSON.parse(text); } catch (_) { body = text; }
    return { status: res.status, ok: res.ok, body };
  } catch (err) {
    return { status: null, ok: false, body: null, error: err.message };
  }
}

async function getToken() {
  const now = Date.now();
  if (tokenCache.accessToken && now < tokenCache.expiresAt) return tokenCache.accessToken;

  const r = await tryFetch('https://auth.inhire.app/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: Deno.env.get('INHIRE_EMAIL'),
      password: Deno.env.get('INHIRE_PASSWORD'),
    }),
  });

  if (r.ok && r.body?.accessToken) {
    tokenCache = {
      accessToken: r.body.accessToken,
      refreshToken: r.body.refreshToken,
      expiresAt: now + 50 * 60 * 1000,
    };
    return tokenCache.accessToken;
  }
  return { loginResult: r };
}

Deno.serve(async (req) => {
  const body = await req.json().catch(() => ({}));
  const { exclusiveStartKey, limit } = body;
  const tenant = Deno.env.get('INHIRE_TENANT');

  const jobsBody = JSON.stringify({ limit: limit || 10, exclusiveStartKey: exclusiveStartKey || null });
  const baseHeaders = {
    'X-Tenant': tenant,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const diag = {};

  // TENTATIVA 1 — público /jobs/paginated
  const a1 = await tryFetch('https://api.inhire.app/jobs/paginated', {
    method: 'POST',
    headers: baseHeaders,
    body: jobsBody,
  });
  diag.attempt1 = { url: 'POST /jobs/paginated', status: a1.status };
  if (a1.ok) {
    const results = (a1.body.results || a1.body.items || (Array.isArray(a1.body) ? a1.body : []));
    return Response.json({ results, startKey: a1.body.startKey || null });
  }
  diag.attempt1.error = typeof a1.body === 'string' ? a1.body : JSON.stringify(a1.body);

  // TENTATIVA 2 — público /jobs/lean/paginated
  const a2 = await tryFetch('https://api.inhire.app/jobs/lean/paginated', {
    method: 'POST',
    headers: baseHeaders,
    body: jobsBody,
  });
  diag.attempt2 = { url: 'POST /jobs/lean/paginated', status: a2.status };
  if (a2.ok) {
    const results = (a2.body.results || a2.body.items || (Array.isArray(a2.body) ? a2.body : []));
    return Response.json({ results, startKey: a2.body.startKey || null });
  }
  diag.attempt2.error = typeof a2.body === 'string' ? a2.body : JSON.stringify(a2.body);

  // TENTATIVA 3 — com autenticação
  const tokenOrDiag = await getToken();
  if (typeof tokenOrDiag === 'object' && tokenOrDiag.loginResult) {
    diag.attempt3login = { status: tokenOrDiag.loginResult.status, error: JSON.stringify(tokenOrDiag.loginResult.body) };
  } else {
    diag.attempt3login = { status: 200, note: 'login OK' };
    const token = tokenOrDiag;
    const authHeaders = { ...baseHeaders, 'Authorization': `Bearer ${token}` };

    const a3a = await tryFetch('https://api.inhire.app/jobs/paginated', {
      method: 'POST', headers: authHeaders, body: jobsBody,
    });
    diag.attempt3jobs_paginated = { status: a3a.status };
    if (a3a.ok) {
      const results = (a3a.body.results || a3a.body.items || (Array.isArray(a3a.body) ? a3a.body : []));
      return Response.json({ results, startKey: a3a.body.startKey || null });
    }
    diag.attempt3jobs_paginated.error = typeof a3a.body === 'string' ? a3a.body : JSON.stringify(a3a.body);

    const a3b = await tryFetch('https://api.inhire.app/jobs/lean/paginated', {
      method: 'POST', headers: authHeaders, body: jobsBody,
    });
    diag.attempt3jobs_lean = { status: a3b.status };
    if (a3b.ok) {
      const results = (a3b.body.results || a3b.body.items || (Array.isArray(a3b.body) ? a3b.body : []));
      return Response.json({ results, startKey: a3b.body.startKey || null });
    }
    diag.attempt3jobs_lean.error = typeof a3b.body === 'string' ? a3b.body : JSON.stringify(a3b.body);
  }

  return Response.json({ diagnostic: diag }, { status: 200 });
});