export const CATEGORY_KEYWORDS = {
  'Tecnologia': [
    'desenvolvedor', 'developer', 'programador', 'software',
    'engenheiro de software', 'analista de sistemas', 'devops',
    'infraestrutura', 'suporte ti', 'suporte técnico', 'dados',
    'data', 'bi ', 'business intelligence', 'database', 'dba',
    'fullstack', 'full stack', 'full-stack', 'back-end', 'backend',
    'frontend', 'front-end', 'react', 'java', 'php', 'node',
    'python', 'genexus', 'arquiteto de', 'tech lead', 'líder técnico',
    'lider técnico', 'sistemas', 'analista de ti', 'técnico em informática',
    'técnico de informática', 'scrum master', 'product owner',
    'qa ', 'quality assurance', 'analista de requisitos', 'pmo',
    'governança de ti', 'cibersegurança', 'segurança da informação',
    'cloud', 'aws', 'azure', 'analista de suporte', 'service desk',
    'helpdesk', 'agile', 'mobile', 'ios', 'android', 'dba '
  ],
  'Design': [
    'designer', 'design gráfico', 'design de produto', 'ux ', 'ui ',
    'user experience', 'user interface', 'criação', 'arte final',
    'diagramação', 'ilustrador', 'motion', 'visual'
  ],
  'Marketing': [
    'marketing', 'comunicação', 'social media', 'mídia', 'conteúdo',
    'copywriter', 'seo', 'sem ', 'relações públicas', 'jornalista',
    'publicidade', 'propaganda', 'analista de marketing',
    'growth', 'inbound', 'outbound marketing', 'branding'
  ],
  'Comercial': [
    'vendas', 'comercial', 'vendedor', 'account', 'executivo de contas',
    'negócios', 'business development', 'cliente', 'crm ',
    'pré-venda', 'sdr', 'closer', 'executivo de vendas',
    'representante comercial', 'inside sales', 'outside sales',
    'hunter', 'farmer', 'gerente comercial', 'supervisor de vendas'
  ],
  'RH': [
    'recursos humanos', ' rh', 'recrutamento', 'seleção', 'people',
    'talentos', 'treinamento', 'desenvolvimento humano', 'cultura',
    'dhmo', 'departamento pessoal', 'benefícios', 'analista de rh',
    'banco de talentos', 'talent', 'hrbp', 'generalista de rh',
    'psicólogo organizacional', 'educação corporativa'
  ],
  'Operações': [
    'operações', 'operacional', 'processos', 'qualidade', 'logística',
    'supply chain', 'administração', 'administrativo', 'compras',
    'financeiro', 'contabilidade', 'fiscal', 'serviços gerais',
    'recepcionista', 'assistente administrativo', 'secretaria',
    'jurídico', 'juridico', 'compliance', 'analista de processos',
    'gerente de projetos', 'gestão de projetos', 'assistente jurídico',
    'controladoria', 'analista financeiro', 'auxiliar administrativo',
    'auxiliar financeiro', 'auxiliar jurídico', 'técnico judiciário',
    'analista de governança', 'backoffice', 'back office',
    'facilities', 'limpeza', 'portaria', 'segurança patrimonial',
    'motorista', 'estoque', 'almoxarifado', 'suprimentos',
    'analista de compliance', 'analista contábil', 'conecta'
  ]
};

export function classifyJob(jobName = '', jobArea = '') {
  const validCategories = Object.keys(CATEGORY_KEYWORDS);
  if (jobArea && validCategories.includes(jobArea)) {
    return jobArea;
  }

  const nameLower = jobName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      const kw = keyword
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      if (nameLower.includes(kw)) {
        return category;
      }
    }
  }

  return 'Operações';
}