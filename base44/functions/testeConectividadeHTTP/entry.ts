import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const url1 = 'http://httpbin.org/post';
    const url2 = 'http://ip-api.com/json';

    const r1 = await fetch(url1, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teste: 1 }),
    });
    const r2 = await fetch(url2);

    return Response.json({
      httpbin: { status: r1.status, body: await r1.text() },
      ipapi: { status: r2.status, body: await r2.text() },
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'Erro interno' }, { status: 500 });
  }
});