import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const { token, exclusiveStartKey, limit = 9 } = body;

  if (!token) {
    return Response.json({ error: 'Token não fornecido' }, { status: 400 });
  }

  // 1. Buscar lista lean
  const leanResponse = await fetch('https://api.inhire.app/jobs/paginated/lean', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant': 'loglabdigital',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      limit,
      ...(exclusiveStartKey ? { exclusiveStartKey } : {}),
    }),
  });

  if (!leanResponse.ok) {
    const err = await leanResponse.text();
    return Response.json({ error: `InHire API error: ${leanResponse.status} - ${err}` }, { status: leanResponse.status });
  }

  const leanData = await leanResponse.json();
  const openJobs = (leanData.results || []).filter((j) => j.status === 'open');

  // 2. Buscar detalhes completos de cada vaga em paralelo
  const enrichedJobs = await Promise.all(
    openJobs.map(async (job) => {
      try {
        const detailResponse = await fetch(`https://api.inhire.app/jobs/${job.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant': 'loglabdigital',
            'Accept': 'application/json',
          },
        });

        if (detailResponse.ok) {
          const detail = await detailResponse.json();
          return { ...job, ...detail };
        }
      } catch (e) {
        console.warn(`[getJobs] Falha ao buscar detalhes da vaga ${job.id}:`, e);
      }
      return job;
    })
  );

  // Log do primeiro resultado para diagnóstico
  if (enrichedJobs.length > 0) {
    console.log('[getJobs] Primeiro resultado enriquecido:', JSON.stringify(enrichedJobs[0], null, 2));
  }

  return Response.json({
    results: enrichedJobs,
    startKey: leanData.startKey || null,
    total: enrichedJobs.length,
  });
});