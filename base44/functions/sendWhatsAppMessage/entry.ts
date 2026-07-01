import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function formatAndValidateNumber(num) {
  if (!num) return { valid: false, error: 'Número vazio' };
  let digits = String(num).replace(/\D/g, '');
  digits = digits.replace(/^0+/, '');
  if (!digits.startsWith('55')) {
    digits = '55' + digits;
  }
  if (digits.length !== 13) {
    return {
      valid: false,
      error: `Número inválido: ${digits} (esperado 13 dígitos, recebido ${digits.length})`,
    };
  }
  const ddd = parseInt(digits.slice(2, 4), 10);
  if (ddd < 11 || ddd > 99) {
    return { valid: false, error: `DDD inválido: ${ddd}` };
  }
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
  const logs = [];

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      logs.push('Auth: usuário não autenticado');
      return Response.json({ success: false, logs, error: 'Unauthorized' }, { status: 401 });
    }
    logs.push(`Auth: autenticado como ${user.email || user.id}`);

    const { to, templateSid, contentVariables } = await req.json().catch(() => ({}));
    logs.push(`Input recebido: to=${to}, templateSid=${templateSid}, contentVariables=${JSON.stringify(contentVariables)}`);

    const url = Deno.env.get('WHATSAPP_API_URL');
    logs.push(`URL configurada: ${url}`);
    logs.push(`WHATSAPP_ACCOUNT_ID: ${Deno.env.get('WHATSAPP_ACCOUNT_ID')}`);
    logs.push(`WHATSAPP_SYSTEM_ID: ${Deno.env.get('WHATSAPP_SYSTEM_ID')}`);
    logs.push(`WHATSAPP_TOKEN (primeiros 20): ${Deno.env.get('WHATSAPP_TOKEN')?.substring(0, 20)}`);
    logs.push(`WHATSAPP_DEFAULT_TEMPLATE_SID: ${Deno.env.get('WHATSAPP_DEFAULT_TEMPLATE_SID')}`);

    const validation = formatAndValidateNumber(to);
    if (!validation.valid) {
      logs.push(`Validação falhou: ${validation.error}`);
      return Response.json({
        success: false,
        logs,
        error: validation.error,
        payloadEnviado: { to },
      });
    }
    const toFormatted = validation.number;
    logs.push(`Número formatado: ${toFormatted}`);

    const payload = {
      whatsapp_account_id: Deno.env.get('WHATSAPP_ACCOUNT_ID'),
      template_sid: templateSid || Deno.env.get('WHATSAPP_DEFAULT_TEMPLATE_SID'),
      to: toFormatted,
      content_variables: contentVariables || {},
    };
    logs.push(`Payload: ${JSON.stringify(payload)}`);

    const fetchUrl = Deno.env.get('WHATSAPP_API_URL');
    const fetchHeaders = {
      'Content-Type': 'application/json',
      'x-system-id': Deno.env.get('WHATSAPP_SYSTEM_ID'),
      'Authorization': `Bearer ${Deno.env.get('WHATSAPP_TOKEN')}`,
    };
    logs.push(`Fetch URL: ${fetchUrl}`);
    logs.push(`Fetch headers: ${JSON.stringify({ ...fetchHeaders, Authorization: 'Bearer ' + (Deno.env.get('WHATSAPP_TOKEN')?.substring(0, 20) || '') + '...' })}`);

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: fetchHeaders,
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    logs.push(`Status HTTP: ${response.status}`);
    logs.push(`Response body: ${responseText}`);

    let data;
    try { data = JSON.parse(responseText); } catch { data = { raw: responseText }; }

    if (!response.ok) {
      return Response.json({
        success: false,
        logs,
        status: response.status,
        error: readableError(data),
        payloadEnviado: payload,
      });
    }

    return Response.json({ success: true, logs, data, to: toFormatted });
  } catch (error) {
    logs.push(`EXCEPTION: ${error?.message || String(error)}`);
    logs.push(`STACK: ${error?.stack || 'n/a'}`);
    return Response.json({ success: false, logs, error: error?.message || 'Erro interno' }, { status: 500 });
  }
});