import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function extractVars(content) {
  const matches = content.match(/\[([^\]]+)\]/g) || [];
  return [...new Set(matches)];
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, nome, categoria, conteudo, ativo, templateSid, contentVariablesTemplate } = await req.json().catch(() => ({}));
  if (!nome || !categoria || !conteudo) {
    return Response.json({ error: 'nome, categoria e conteudo são obrigatórios' }, { status: 400 });
  }

  const variaveis = extractVars(conteudo);
  // Só sobrescreve templateSid/contentVariablesTemplate se vierem na requisição
  // (preserva os valores existentes em atualizações parciais, ex: toggle ativo)
  const data = { nome, categoria, conteudo, variaveis, ativo: ativo !== false };
  if (templateSid !== undefined) data.templateSid = templateSid || null;
  if (contentVariablesTemplate !== undefined) data.contentVariablesTemplate = contentVariablesTemplate || null;

  let result;
  if (id) {
    result = await base44.asServiceRole.entities.Template.update(id, data);
  } else {
    result = await base44.asServiceRole.entities.Template.create(data);
  }

  return Response.json({ success: true, item: result });
});