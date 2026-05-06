import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { templateId, templateNome, mensagemFinal, destinatarios } = await req.json().catch(() => ({}));
  if (!mensagemFinal || !destinatarios?.length) {
    return Response.json({ error: 'mensagemFinal e destinatarios são obrigatórios' }, { status: 400 });
  }

  const record = await base44.asServiceRole.entities.Disparo.create({
    templateId: templateId || null,
    templateNome: templateNome || 'Mensagem personalizada',
    mensagemFinal,
    destinatarios,
    totalEnviados: 0,
    totalErros: 0,
    status: 'rascunho',
    criadoPor: user.email,
  });

  return Response.json({ success: true, item: record });
});