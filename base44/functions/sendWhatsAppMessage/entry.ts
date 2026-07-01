import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function formatAndValidateNumber(num) {
  if (!num) return { valid: false, error: 'Número vazio' };

  // Remove tudo exceto dígitos
  let digits = String(num).replace(/\D/g, '');

  // Remove zeros à esquerda
  digits = digits.replace(/^0+/, '');

  // Adiciona 55 se não tiver
  if (!digits.startsWith('55')) {
    digits = '55' + digits;
  }

  // WhatsApp = SEMPRE celular = 13 dígitos após o 55
  if (digits.length !== 13) {
    return {
      valid: false,
      error: `Número inválido: ${digits} (esperado 13 dígitos, recebido ${digits.length})`,
    };
  }

  // Valida DDD (11 a 99)
  const ddd = parseInt(digits.slice(2, 4), 10);
  if (ddd < 11 || ddd > 99) {
    return { valid: false, error: `DDD inválido: ${ddd}` };
  }

  // Valida se tem "9" após DDD (celular brasileiro)
  if (digits[4] !== '9') {
    return {
      valid: false,
      error: `Número não parece ser celular (falta 9 após DDD): ${digits}`,
    };
  }

  return { valid: true, number: digits };
}

function readableError(data) {
  if (!data) return 'Erro desconhecido';
  if (typeof data === 'string') return data;
  const code = data.code ? ` [${data.code}]` : '';
  const msg = data.message || data.error || JSON.stringify(data);
  return `${msg}${code}`;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { to, templateSid, contentVariables } = await req.json().catch(() => ({}));

  // Validação robusta do número ANTES de chamar a API
  const validation = formatAndValidateNumber(to);
  if (!validation.valid) {
    console.error('[WA] Validação falhou:', validation.error);
    return Response.json({
      success: false,
      error: validation.error,
      payloadEnviado: { to },
    });
  }
  const toFormatted = validation.number;

  const payload = {
    whatsapp_account_id: Deno.env.get('WHATSAPP_ACCOUNT_ID'),
    template_sid: templateSid || Deno.env.get('WHATSAPP_DEFAULT_TEMPLATE_SID'),
    to: toFormatted,
    content_variables: contentVariables || {},
  };

  console.log('[URL DEBUG]', process.env.WHATSAPP_API_URL);
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
      error: readableError(data),
      payloadEnviado: payload,
    });
  }

  return Response.json({ success: true, data, to: toFormatted });
});