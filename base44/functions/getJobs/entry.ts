import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const EXCLUDED_PATTERNS = [
  'vaga padrao',
  'vaga modelo',
  'vaga de teste',
  'funil completo',
  'template de vaga',
];

function isExcluded(title = '') {
  const normalized = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (EXCLUDED_PATTERNS.some(p => normalized.includes(p))) return true;
  if (normalized.includes('banco de talentos')) {
    const isBancoPrincipal = normalized.includes('log, lab') || normalized.includes('log lab');
    if (!isBancoPrincipal) return true;
  }
  return false;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const { token, exclusiveStartKey = null, limit = 9, minResults = 9 } = body;

  if (!token) {
    return Response.json({ error: 'Token não fornecido' }, { status: 400 });
  }

  const validJobs = [];
  let currentStartKey = exclusiveStartKey;
  let finalStartKey = null;
  let attempts = 0;
  const MAX_ATTEMPTS = 5;

  while (validJobs.length < minResults && attempts < MAX_ATTEMPTS) {
    attempts++;

    const leanResponse = await fetch('https://api.inhire.app/jobs/paginated/lean', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant': 'loglabdigital',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        limit: 20,
        ...(currentStartKey ? { exclusiveStartKey: currentStartKey } : {}),
      }),
    });

    if (!leanResponse.ok) {
      const err = await leanResponse.text();
      return Response.json({ error: `InHire API error: ${leanResponse.status} - ${err}` }, { status: leanResponse.status });
    }

    const leanData = await leanResponse.json();
    const page = leanData.results || [];

    if (page.length === 0) break;

    // Filtrar abertas e não-privadas (lean já tem title/name disponível)
    const filtered = page
      .filter(j => j.status === 'open')
      .filter(j => !isExcluded(j.title || j.name));

    // Enriquecer com detalhes completos
    const enriched = await Promise.all(
      filtered.map(async (job) => {
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

    validJobs.push(...enriched);

    currentStartKey = leanData.startKey || null;
    finalStartKey = currentStartKey;

    if (!currentStartKey) break;
  }

  const sorted = validJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return Response.json({
    results: sorted.slice(0, limit),
    startKey: sorted.length > limit ? finalStartKey : finalStartKey,
    total: sorted.length,
  });
});