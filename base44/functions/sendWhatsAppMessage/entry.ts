import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function formatNumber(num) {
  const digits = num.replace(/\D/g, '');
  if (digits.startsWith('55')) return digits;
  if (digits.startsWith('0')) return '55' + digits.slice(1);
  return '55' + digits;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { to, mensagem, templateSid, contentVariables } = await req.json();

  const toFormatted = formatNumber(to || '');
  if (toFormatted.length < 12) {
    return Response.json({ success: false, error: `Número inválido: ${to}` });
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
    console.error(`[WhatsApp] Erro ${response.status}:`, JSON.stringify(data));
    return Response.json({ success: false, error: data.message || data.error || JSON.stringify(data), status: response.status, rawResponse: data });
  }

  console.log('[WhatsApp] Enviado para:', toFormatted);
  return Response.json({ success: true, data, to: toFormatted });
});