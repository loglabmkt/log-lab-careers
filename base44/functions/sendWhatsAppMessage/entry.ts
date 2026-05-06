import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function formatNumber(num) {
  const digits = (num || '').replace(/\D/g, '');
  return digits.startsWith('55') ? digits : '55' + digits;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { to, templateSid, contentVariables } = await req.json().catch(() => ({}));

  const toFormatted = formatNumber(to);

  const payload = {
    whatsapp_account_id: Deno.env.get('WHATSAPP_ACCOUNT_ID'),
    template_sid: templateSid || Deno.env.get('WHATSAPP_DEFAULT_TEMPLATE_SID'),
    to: toFormatted,
    content_variables: contentVariables || {},
  };

  console.log('[WA] URL:', Deno.env.get('WHATSAPP_API_URL'));
  console.log('[WA] Payload:', JSON.stringify(payload));
  console.log('[WA] Headers x-system-id:', Deno.env.get('WHATSAPP_SYSTEM_ID'));
  console.log('[WA] Token (primeiros 20):', Deno.env.get('WHATSAPP_TOKEN')?.substring(0, 20));

  const response = await fetch(Deno.env.get('WHATSAPP_API_URL'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-system-id': Deno.env.get('WHATSAPP_SYSTEM_ID'),
      'Authorization': `Bearer ${Deno.env.get('WHATSAPP_TOKEN')}`,
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  console.log('[WA] Status:', response.status);
  console.log('[WA] Response:', responseText);

  let data;
  try { data = JSON.parse(responseText); } catch { data = { raw: responseText }; }

  if (!response.ok) {
    return Response.json({
      success: false,
      status: response.status,
      error: data,
      payloadEnviado: payload,
    });
  }

  return Response.json({ success: true, data, to: toFormatted });
});