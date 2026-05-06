import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const { token, exclusiveStartKey, limit = 9 } = body;

  if (!token) {
    return Response.json({ error: 'Token não fornecido' }, { status: 400 });
  }

  const jobsBody = { limit };
  if (exclusiveStartKey) jobsBody.exclusiveStartKey = exclusiveStartKey;

  const response = await fetch('https://api.inhire.app/jobs/paginated/lean', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant': 'loglabdigital',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(jobsBody),
  });

  if (!response.ok) {
    const err = await response.text();
    return Response.json({ error: `InHire API error: ${response.status} - ${err}` }, { status: response.status });
  }

  const data = await response.json();
  const openJobs = (data.results || []).filter((j) => j.status === 'open');

  return Response.json({
    results: openJobs,
    startKey: data.startKey || null,
    total: openJobs.length,
  });
});