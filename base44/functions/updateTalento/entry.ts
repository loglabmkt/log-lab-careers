import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, nome, whatsapp, email, areaInteresse, aceitaWhatsapp } = body;

  if (!id) return Response.json({ error: 'ID obrigatório' }, { status: 400 });

  const updateData = {};
  if (nome !== undefined) updateData.nome = nome.trim();
  if (whatsapp !== undefined) updateData.whatsapp = whatsapp.replace(/\D/g, '');
  if (email !== undefined) updateData.email = email.trim() || null;
  if (areaInteresse !== undefined) updateData.areaInteresse = areaInteresse;
  if (aceitaWhatsapp !== undefined) updateData.aceitaWhatsapp = aceitaWhatsapp;

  await base44.asServiceRole.entities.Talento.update(id, updateData);

  return Response.json({ success: true });
});