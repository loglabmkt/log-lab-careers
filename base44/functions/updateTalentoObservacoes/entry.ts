import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, observacoes } = await req.json().catch(() => ({}));
  if (!id) return Response.json({ error: 'id é obrigatório' }, { status: 400 });

  const updated = await base44.asServiceRole.entities.Talento.update(id, { observacoes });
  return Response.json({ success: true, item: updated });
});