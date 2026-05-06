import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function formatNumber(num) {
  const digits = num.replace(/\D/g, '');
  if (digits.startsWith('55')) return digits;
  if (digits.startsWith('0')) return '55' + digits.slice(1);
  return '55' + digits;
}

async function sendOne(to, templateSid, contentVariables) {
  const toFormatted = formatNumber(to || '');
  if (toFormatted.length < 12) {
    return { success: false, error: `Número inválido: ${to}` };
  }

  const payload = {
    whatsapp_account_id: Deno.env.get('WHATSAPP_ACCOUNT_ID'),
    template_sid: templateSid || Deno.env.get('WHATSAPP_DEFAULT_TEMPLATE_SID'),
    to: toFormatted,
    content_variables: contentVariables || {},
  };

  const response = await fetch(Deno.env.get('WHATSAPP_API_URL'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-system-id': Deno.env.get('WHATSAPP_SYSTEM_ID'),
      'Authorization': `Bearer ${Deno.env.get('WHATSAPP_TOKEN')}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error(`[WhatsApp] Erro ${response.status} para ${toFormatted}:`, JSON.stringify(data));
    return { success: false, error: data.message || `Erro ${response.status}` };
  }
  console.log('[WhatsApp] Enviado para:', toFormatted);
  return { success: true, data, to: toFormatted };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { disparoId, destinatarios, mensagemTemplate, templateSid } = await req.json();

  if (!destinatarios?.length || !mensagemTemplate) {
    return Response.json({ error: 'destinatarios e mensagemTemplate são obrigatórios' }, { status: 400 });
  }

  const now = new Date();
  const resultados = [];
  let enviados = 0;
  let erros = 0;

  for (const dest of destinatarios) {
    const mensagemFinal = mensagemTemplate
      .replace(/\[Nome\]/g, dest.nome || '')
      .replace(/\[Area\]/g, dest.area || '')
      .replace(/\[LinkSite\]/g, 'https://log-lab-careers.base44.app')
      .replace(/\[NomeVaga\]/g, dest.nomeVaga || 'nossa vaga')
      .replace(/\[LinkVaga\]/g, dest.linkVaga || '')
      .replace(/\[Modalidade\]/g, dest.modalidade || '')
      .replace(/\[Data\]/g, now.toLocaleDateString('pt-BR'))
      .replace(/\[Hora\]/g, now.toLocaleTimeString('pt-BR'));

    const resultado = await sendOne(dest.whatsapp, templateSid, {});

    resultados.push({
      talentoId: dest.id,
      nome: dest.nome,
      whatsapp: dest.whatsapp,
      success: resultado.success,
      error: resultado.error || null,
    });

    if (resultado.success) enviados++;
    else erros++;

    // Delay entre envios para evitar rate limit
    await new Promise(r => setTimeout(r, 500));
  }

  // Atualizar status do disparo no banco
  if (disparoId) {
    const status = enviados === 0 ? 'erro' : 'concluido';
    await base44.asServiceRole.entities.Disparo.update(disparoId, {
      status,
      totalEnviados: enviados,
      totalErros: erros,
      enviadoEm: now.toISOString(),
    });
  }

  return Response.json({ disparoId, totalEnviados: enviados, totalErros: erros, resultados });
});