import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function normalizeNumber(num) {
  if (!num) return null;
  let digits = String(num).replace(/\D/g, '').replace(/^0+/, '');
  if (!digits.startsWith('55')) digits = '55' + digits;
  if (digits.length < 12 || digits.length > 13) return null;
  return digits;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { items, origem } = await req.json().catch(() => ({}));
  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'items é obrigatório (array de {nome, whatsapp, areaInteresse})' }, { status: 400 });
  }

  // Números já cadastrados (normalizados) para deduplicação
  const existentes = await base44.asServiceRole.entities.Talento.list('-created_date', 2000);
  const numerosExistentes = new Set(existentes.map(t => normalizeNumber(t.whatsapp)).filter(Boolean));

  const criados = [];
  const pulados = [];

  for (const item of items) {
    const numero = normalizeNumber(item.whatsapp);
    if (!numero) {
      pulados.push({ nome: item.nome, motivo: `número inválido: ${item.whatsapp}` });
      continue;
    }
    if (numerosExistentes.has(numero)) {
      pulados.push({ nome: item.nome, motivo: 'número já cadastrado' });
      continue;
    }
    if (!item.nome || String(item.nome).trim().length < 3) {
      pulados.push({ nome: item.nome, motivo: 'nome inválido' });
      continue;
    }

    const record = await base44.asServiceRole.entities.Talento.create({
      nome: String(item.nome).trim(),
      whatsapp: numero,
      areaInteresse: item.areaInteresse || 'Outros',
      aceitaWhatsapp: true,
      status: 'novo',
      origem: origem || 'importacao',
      dataCandidatura: new Date().toISOString(),
    });
    numerosExistentes.add(numero);
    criados.push({ id: record.id, nome: record.nome, whatsapp: numero });
  }

  return Response.json({
    success: true,
    totalRecebidos: items.length,
    totalCriados: criados.length,
    totalPulados: pulados.length,
    criados,
    pulados,
  });
});
