import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Padrões de títulos internos/templates que não devem aparecer publicamente.
// "Banco de Talentos - Log, Lab" é vaga legítima e não bate nesses padrões.
const EXCLUDED_PATTERNS = [
  'vaga padrao',
  'vaga modelo',
  'vaga de teste',
  'funil completo',
  'template de vaga',
];

// Vagas "Banco de Talentos - [cargo]" são internas. A única exceção é "Log, Lab".
function isExcluded(title = '') {
  const normalized = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Filtro 1: padrões genéricos
  if (EXCLUDED_PATTERNS.some(p => normalized.includes(p))) return true;

  // Filtro 2: "Banco de Talentos - <cargo>" — exclui, exceto "log, lab" / "log lab"
  if (normalized.includes('banco de talentos')) {
    const isBancoPrincipal = normalized.includes('log, lab') || normalized.includes('log lab');
    if (!isBancoPrincipal) return true;
  }

  return false;
}

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

  // 3. Filtrar vagas internas/templates por padrão de nome
  const publicJobs = enrichedJobs.filter(job => !isExcluded(job.title || job.name));

  const sorted = publicJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return Response.json({
    results: sorted,
    startKey: leanData.startKey || null,
    total: sorted.length,
  });
});