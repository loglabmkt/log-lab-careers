import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { page = 1, limit = 20, search = '', status = '', area = '' } = body;

  const all = await base44.asServiceRole.entities.Talento.list('-dataCandidatura', 1000);

  let filtered = all;
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(t =>
      t.nome?.toLowerCase().includes(s) ||
      t.whatsapp?.includes(s) ||
      t.email?.toLowerCase().includes(s)
    );
  }
  if (status) filtered = filtered.filter(t => t.status === status);
  if (area) filtered = filtered.filter(t => t.areaInteresse === area);

  const total = filtered.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return Response.json({ items, total, pages, page });
});