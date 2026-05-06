// In-memory token cache
let tokenCache = { accessToken: null, refreshToken: null, expiresAt: 0 };

async function getValidToken() {
  const now = Date.now();

  if (tokenCache.accessToken && now < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  if (tokenCache.refreshToken) {
    try {
      const res = await fetch('https://auth.inhire.app/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokenCache.refreshToken }),
      });
      if (res.ok) {
        const data = await res.json();
        tokenCache = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || tokenCache.refreshToken,
          expiresAt: now + 50 * 60 * 1000,
        };
        return tokenCache.accessToken;
      }
    } catch (_) {}
  }

  const tenantVal = Deno.env.get('INHIRE_TENANT');
  const loginBody = JSON.stringify({
    email: Deno.env.get('INHIRE_EMAIL'),
    password: Deno.env.get('INHIRE_PASSWORD'),
  });

  // Try without X-Tenant first
  let loginRes = await fetch('https://auth.inhire.app/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: loginBody,
  });
  let attempt1Status = loginRes.status;
  let attempt1Body = await loginRes.text();

  if (loginRes.ok) {
    const loginData = JSON.parse(attempt1Body);
    tokenCache = {
      accessToken: loginData.accessToken,
      refreshToken: loginData.refreshToken,
      expiresAt: now + 50 * 60 * 1000,
    };
    return tokenCache.accessToken;
  }

  // Try with X-Tenant
  loginRes = await fetch('https://auth.inhire.app/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Tenant': tenantVal },
    body: loginBody,
  });
  let attempt2Status = loginRes.status;
  let attempt2Body = await loginRes.text();

  if (loginRes.ok) {
    const loginData = JSON.parse(attempt2Body);
    tokenCache = {
      accessToken: loginData.accessToken,
      refreshToken: loginData.refreshToken,
      expiresAt: now + 50 * 60 * 1000,
    };
    return tokenCache.accessToken;
  }

  throw new Error(
    `InHire login failed. ` +
    `Attempt1 (no tenant): ${attempt1Status} ${attempt1Body} | ` +
    `Attempt2 (with tenant): ${attempt2Status} ${attempt2Body}`
  );
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { exclusiveStartKey, limit } = body;

    const accessToken = await getValidToken();
    const tenant = Deno.env.get('INHIRE_TENANT');

    const jobsRes = await fetch('https://api.inhire.app/jobs/paginated', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Tenant': tenant,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        exclusiveStartKey: exclusiveStartKey || null,
        limit: limit || 12,
      }),
    });

    if (!jobsRes.ok) {
      const err = await jobsRes.text();
      throw new Error(`InHire jobs API failed: ${jobsRes.status} — ${err}`);
    }

    const data = await jobsRes.json();
    const allItems = data.results || data.items || (Array.isArray(data) ? data : []);
    const results = allItems.filter((job) => job.status === 'open');

    return Response.json({
      results,
      startKey: data.startKey || data.exclusiveStartKey || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});