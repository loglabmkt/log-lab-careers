import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status, totalEnviados, totalErros, enviadoEm } = await req.json().catch(() => ({}));
  if (!id) return Response.json({ error: 'id é obrigatório' }, { status: 400 });

  const updates = {};
  if (status) updates.status = status;
  if (typeof totalEnviados === 'number') updates.totalEnviados = totalEnviados;
  if (typeof totalErros === 'number') updates.totalErros = totalErros;
  if (enviadoEm) updates.enviadoEm = enviadoEm;

  const record = await base44.asServiceRole.entities.Disparo.update(id, updates);
  return Response.json({ success: true, item: record });
});
