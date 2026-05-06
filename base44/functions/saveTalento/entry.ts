import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const { nome, whatsapp, areaInteresse, aceitaWhatsapp } = body;

  // Validações
  if (!nome || nome.trim().length < 3) {
    return Response.json({ error: 'Nome deve ter pelo menos 3 caracteres.' }, { status: 400 });
  }

  const whatsappClean = (whatsapp || '').replace(/[\s\-().+]/g, '').replace(/\D/g, '');
  if (!whatsappClean || whatsappClean.length < 10) {
    return Response.json({ error: 'WhatsApp inválido. Informe pelo menos 10 dígitos.' }, { status: 400 });
  }

  if (!areaInteresse || !areaInteresse.trim()) {
    return Response.json({ error: 'Área de interesse é obrigatória.' }, { status: 400 });
  }

  const record = await base44.asServiceRole.entities.Talento.create({
    nome: nome.trim(),
    whatsapp: whatsappClean,
    areaInteresse: areaInteresse.trim(),
    aceitaWhatsapp: !!aceitaWhatsapp,
    dataCandidatura: new Date().toISOString(),
    status: 'novo',
    origem: 'site_carreiras',
  });

  return Response.json({ success: true, id: record.id });
});