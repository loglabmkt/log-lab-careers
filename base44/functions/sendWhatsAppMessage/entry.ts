import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function formatAndValidateNumber(num) {
  if (!num) return { valid: false, error: 'Número vazio' };
  let digits = String(num).replace(/\D/g, '');
  digits = digits.replace(/^0+/, '');
  if (!digits.startsWith('55')) {
    digits = '55' + digits;
  }
  if (digits.length < 12 || digits.length > 13) {
    return {
      valid: false,
      error: `Número inválido: ${digits} (esperado 12 ou 13 dígitos)`,
    };
  }
  return { valid: true, number: digits };
}

function readableError(data, fallback) {
  if (!data && !fallback) return 'Erro desconhecido';
  if (typeof data === 'string') return data;
  if (data) {
    const msg = data.message || data.error || data.erro || JSON.stringify(data);
    return msg;
  }
  return fallback || 'Erro desconhecido';
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

    const { to, message } = await req.json().catch(() => ({}));
    logs.push(`Input recebido: to=${to}, message=${message ? message.substring(0, 50) + '...' : '(vazio)'}`);

    if (!message || !String(message).trim()) {
      logs.push('Validação: message é obrigatório');
      return Response.json({ success: false, logs, error: 'message é obrigatório' });
    }

    const validation = formatAndValidateNumber(to);
    if (!validation.valid) {
      logs.push(`Validação falhou: ${validation.error}`);
      return Response.json({ success: false, logs, error: validation.error });
    }
    const phone = validation.number;
    logs.push(`Número formatado: ${phone}`);

    const instanceId = Deno.env.get('ZAPI_INSTANCE_ID');
    const instanceToken = Deno.env.get('ZAPI_INSTANCE_TOKEN');
    const clientToken = Deno.env.get('ZAPI_CLIENT_TOKEN');

    logs.push(`ZAPI_INSTANCE_ID: ${instanceId}`);
    logs.push(`ZAPI_INSTANCE_TOKEN (6 primeiros): ${instanceToken?.substring(0, 6)}`);
    logs.push(`ZAPI_CLIENT_TOKEN (6 primeiros): ${clientToken?.substring(0, 6)}`);

    const url = `https://api.z-api.io/instances/${instanceId}/token/${instanceToken}/send-text`;
    logs.push(`URL: ${url}`);

    const body = { phone, message, delayMessage: 2 };
    logs.push(`Body: ${JSON.stringify(body)}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': clientToken,
      },
      body: JSON.stringify(body),
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
        error: readableError(data, responseText),
      });
    }

    return Response.json({
      success: true,
      logs,
      zaapId: data.zaapId || null,
      messageId: data.messageId || null,
      to: phone,
    });
  } catch (error) {
    logs.push(`EXCEPTION: ${error?.message || String(error)}`);
    logs.push(`STACK: ${error?.stack || 'n/a'}`);
    return Response.json({ success: false, logs, error: error?.message || 'Erro interno' }, { status: 500 });
  }
});