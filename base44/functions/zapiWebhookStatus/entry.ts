import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Webhook público chamado pelo Z-API ("Receber status da mensagem").
// Segurança: exige ?secret= igual ao ZAPI_CLIENT_TOKEN — sem isso, rejeita.
// Payload Z-API: { instanceId, status: SENT|RECEIVED|READ|READ_BY_ME|PLAYED, ids: [...], momment, phone, type: "MessageStatusCallback", isGroup }

// Precedência: nunca rebaixar um status (ex.: READ chega antes de RECEIVED atrasado)
const PRECEDENCIA = { enviado: 1, entregue: 2, lido: 3 };
const MAPA_STATUS = { SENT: 'enviado', RECEIVED: 'entregue', READ: 'lido', PLAYED: 'lido' };

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get('secret');
    const expected = Deno.env.get('ZAPI_CLIENT_TOKEN');
    if (!expected || secret !== expected) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = await req.json().catch(() => null);
    if (!payload || payload.type !== 'MessageStatusCallback') {
      // Evento que não interessa — responde ok para o Z-API não reenviar
      return Response.json({ value: true });
    }

    const novoStatus = MAPA_STATUS[payload.status];
    const ids = Array.isArray(payload.ids) ? payload.ids : [];
    if (!novoStatus || ids.length === 0) {
      return Response.json({ value: true });
    }

    const base44 = createClientFromRequest(req);
    const momento = payload.momment ? new Date(payload.momment).toISOString() : new Date().toISOString();

    for (const messageId of ids) {
      const logsEncontrados = await base44.asServiceRole.entities.EnvioLog.filter({ messageId: String(messageId) }, '-created_date', 5);
      for (const log of logsEncontrados) {
        const atual = PRECEDENCIA[log.status] || 0;
        if (PRECEDENCIA[novoStatus] <= atual) continue; // não rebaixa
        const updates = { status: novoStatus };
        if (novoStatus === 'entregue') updates.entregueEm = momento;
        if (novoStatus === 'lido') {
          updates.lidoEm = momento;
          if (!log.entregueEm) updates.entregueEm = momento;
        }
        await base44.asServiceRole.entities.EnvioLog.update(log.id, updates);
      }
    }

    return Response.json({ value: true });
  } catch (error) {
    console.error('[zapiWebhookStatus]', error?.message || error);
    // Sempre 200 para o Z-API não desabilitar o webhook por falhas pontuais
    return Response.json({ value: true });
  }
});
