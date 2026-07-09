import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

    const instanceId = Deno.env.get('ZAPI_INSTANCE_ID');
    const instanceToken = Deno.env.get('ZAPI_INSTANCE_TOKEN');
    const clientToken = Deno.env.get('ZAPI_CLIENT_TOKEN');

    logs.push(`ZAPI_INSTANCE_ID: ${instanceId}`);
    logs.push(`ZAPI_INSTANCE_TOKEN (6 primeiros): ${instanceToken?.substring(0, 6)}`);

    const url = `https://api.z-api.io/instances/${instanceId}/token/${instanceToken}/status`;
    logs.push(`URL: https://api.z-api.io/instances/${instanceId}/token/${instanceToken?.substring(0, 6)}.../status`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': clientToken,
      },
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
        error: typeof data === 'string' ? data : (data?.message || data?.error || responseText),
        raw: data,
      });
    }

    return Response.json({
      success: true,
      connected: data.connected ?? data.isConnected ?? null,
      smartphoneConnected: data.smartphoneConnected ?? null,
      error: null,
      raw: data,
    });
  } catch (error) {
    logs.push(`EXCEPTION: ${error?.message || String(error)}`);
    logs.push(`STACK: ${error?.stack || 'n/a'}`);
    return Response.json({ success: false, logs, error: error?.message || 'Erro interno' }, { status: 500 });
  }
});