import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function extractVars(content) {
  const matches = content.match(/\[([^\]]+)\]/g) || [];
  return [...new Set(matches)];
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, nome, categoria, conteudo, ativo } = await req.json().catch(() => ({}));
  if (!nome || !categoria || !conteudo) {
    return Response.json({ error: 'nome, categoria e conteudo são obrigatórios' }, { status: 400 });
  }

  const variaveis = extractVars(conteudo);
  const data = { nome, categoria, conteudo, variaveis, ativo: ativo !== false };

  let result;
  if (id) {
    result = await base44.asServiceRole.entities.Template.update(id, data);
  } else {
    result = await base44.asServiceRole.entities.Template.create(data);
  }

  return Response.json({ success: true, item: result });
});