import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TEMPLATES = [
  {
    nome: "Vaga Aberta",
    categoria: "Vaga aberta",
    conteudo: `Olá, [Nome]! 👋\n\nTemos uma oportunidade incrível na *Log Lab* que combina com o seu perfil de *[Area]*!\n\n🚀 Vaga: *[NomeVaga]*\n📍 Modalidade: [Modalidade]\n\nCandidate-se agora: [LinkVaga]\n\nQualquer dúvida, estamos aqui! 😊\n— Equipe Log Lab`,
    variaveis: ["[Nome]", "[Area]", "[NomeVaga]", "[Modalidade]", "[LinkVaga]"],
    ativo: true,
  },
  {
    nome: "Banco de Talentos Confirmado",
    categoria: "Boas-vindas",
    conteudo: `Oi, [Nome]! 🎉\n\nSeu cadastro no *banco de talentos da Log Lab* foi confirmado com sucesso!\n\nVocê será notificado assim que surgir uma vaga alinhada com sua área de interesse: *[Area]*.\n\nAcompanhe nossas oportunidades: [LinkSite]\n\nAté breve! 🚀\n— Equipe Log Lab`,
    variaveis: ["[Nome]", "[Area]", "[LinkSite]"],
    ativo: true,
  },
  {
    nome: "Entrevista Agendada",
    categoria: "Entrevista",
    conteudo: `Olá, [Nome]! 📅\n\nÓtimas notícias! Gostaríamos de agendar uma conversa com você sobre a vaga de *[NomeVaga]*.\n\nPor favor, confirme sua disponibilidade respondendo esta mensagem.\n\nAguardamos seu retorno! 😊\n— Equipe Log Lab`,
    variaveis: ["[Nome]", "[NomeVaga]"],
    ativo: true,
  },
  {
    nome: "Follow-up",
    categoria: "Follow-up",
    conteudo: `Oi, [Nome]! 👋\n\nPassando para saber se você ainda tem interesse em oportunidades na área de *[Area]* aqui na Log Lab.\n\nTemos novidades chegando! Se quiser continuar no nosso banco de talentos, é só confirmar aqui. ✅\n\n— Equipe Log Lab`,
    variaveis: ["[Nome]", "[Area]"],
    ativo: true,
  },
  {
    nome: "Aprovação",
    categoria: "Aprovação",
    conteudo: `Parabéns, [Nome]! 🎊🎊🎊\n\nÉ com muita alegria que comunicamos que você foi *aprovado(a)* no processo seletivo da *Log Lab*!\n\nEm breve nossa equipe de RH entrará em contato com os próximos passos.\n\nBem-vindo(a) ao time! 🚀💛\n— Equipe Log Lab`,
    variaveis: ["[Nome]"],
    ativo: true,
  },
];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await base44.asServiceRole.entities.Template.list('-created_date', 100);
  if (existing.length > 0) {
    return Response.json({ seeded: false, message: 'Templates já existem', count: existing.length });
  }

  const created = await Promise.all(
    TEMPLATES.map(t => base44.asServiceRole.entities.Template.create(t))
  );

  return Response.json({ seeded: true, count: created.length });
});