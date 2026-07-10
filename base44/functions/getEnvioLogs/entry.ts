import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { disparoId, talentoId, limit = 200 } = await req.json().catch(() => ({}));
  if (!disparoId && !talentoId) {
    return Response.json({ error: 'disparoId ou talentoId é obrigatório' }, { status: 400 });
  }

  const query = disparoId ? { disparoId } : { talentoId };
  const items = await base44.asServiceRole.entities.EnvioLog.filter(query, '-created_date', limit);

  return Response.json({ items, total: items.length });
});
