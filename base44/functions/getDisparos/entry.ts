import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { page = 1, limit = 20 } = await req.json().catch(() => ({}));
  const all = await base44.asServiceRole.entities.Disparo.list('-created_date', 500);

  const total = all.length;
  const pages = Math.ceil(total / limit);
  const items = all.slice((page - 1) * limit, page * limit);

  return Response.json({ items, total, pages, page });
});