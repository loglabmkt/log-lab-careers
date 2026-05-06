Deno.serve(async (req) => {
  const body = await req.json().catch(() => ({}));
  const { id } = body;
  const tenant = Deno.env.get('INHIRE_TENANT');

  if (!id) {
    return Response.json({ error: 'id is required' }, { status: 400 });
  }

  const res = await fetch(`https://api.inhire.app/jobs/${id}`, {
    method: 'GET',
    headers: {
      'X-Tenant': tenant,
      'Accept': 'application/json',
    },
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch (_) { data = text; }

  return Response.json({ status: res.status, ok: res.ok, data });
});