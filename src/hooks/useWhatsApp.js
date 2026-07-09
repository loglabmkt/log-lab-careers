import { useState } from "react";
import { base44 } from "@/api/base44Client";

export function substituirVariaveis(template, talento) {
  return template
    .replace(/\[Nome\]/g, talento.nome || '')
    .replace(/\[Area\]/g, talento.area || talento.areaInteresse || '')
    .replace(/\[LinkSite\]/g, 'https://carreira.loglabdigital.com.br')
    .replace(/\[NomeVaga\]/g, talento.nomeVaga || '')
    .replace(/\[LinkVaga\]/g, talento.linkVaga || '')
    .replace(/\[Modalidade\]/g, talento.modalidade || '')
    .replace(/\[Hora\]/g, new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    .replace(/\[Data\]/g, new Date().toLocaleDateString('pt-BR'));
}

// Validação de número brasileiro (aceita 12 ou 13 dígitos)
export function formatAndValidateNumber(num) {
  if (!num) return { valid: false, error: 'Número vazio' };

  let digits = String(num).replace(/\D/g, '');
  digits = digits.replace(/^0+/, '');

  if (!digits.startsWith('55')) {
    digits = '55' + digits;
  }

  // Aceita 12 dígitos (fixo/legado) OU 13 dígitos (celular com 9)
  if (digits.length < 12 || digits.length > 13) {
    return {
      valid: false,
      error: `Número inválido: ${digits} (esperado 12 ou 13 dígitos)`,
    };
  }

  return { valid: true, number: digits };
}

// Resolve um campo mapeado para o valor real do talento
function resolveTemplateVariable(campo, talento) {
  const now = new Date();
  switch (campo) {
    case 'nome': return talento.nome || '';
    case 'area': return talento.area || talento.areaInteresse || '';
    case 'whatsapp': return talento.whatsapp || '';
    case 'nomeVaga': return talento.nomeVaga || '';
    case 'linkVaga': return talento.linkVaga || '';
    case 'modalidade': return talento.modalidade || '';
    case 'empresa': return 'Log Lab';
    case 'data': return now.toLocaleDateString('pt-BR');
    case 'hora': return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    case 'textoLivre': return talento.textoLivre || '';
    default: return talento[campo] || '';
  }
}

// Constrói content_variables a partir do mapa { "1": "nome", "2": "area" } + talento
export function buildContentVariables(contentVariablesMap, talento) {
  const contentVariables = {};
  if (contentVariablesMap && talento) {
    for (const [numero, campo] of Object.entries(contentVariablesMap)) {
      contentVariables[numero] = resolveTemplateVariable(campo, talento);
    }
  }
  return contentVariables;
}

async function sendMessage({ to, message }) {
  const res = await base44.functions.invoke('sendWhatsAppMessage', {
    to,
    message,
  });

  const result = res.data;

  if (!result.success) {
    console.error('[useWhatsApp] Erro completo:', result);
  }

  return result;
}

export function useWhatsApp() {
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ atual: 0, total: 0 });
  const [results, setResults] = useState([]);

  const sendIndividual = async ({ talento, conteudo }) => {
    setSending(true);

    if (!conteudo || !conteudo.trim()) {
      setSending(false);
      return { success: false, error: 'Template sem conteúdo' };
    }

    // Validação ANTES da chamada à API
    const validation = formatAndValidateNumber(talento.whatsapp);
    if (!validation.valid) {
      console.error(`[WhatsApp] Falha: ${talento.nome} - ${validation.error}`);
      setSending(false);
      return { success: false, error: validation.error };
    }

    const message = substituirVariaveis(conteudo, talento);
    const resultado = await sendMessage({
      to: validation.number,
      message,
    });
    if (!resultado.success) {
      console.error(`[WhatsApp] Falha: ${talento.nome} - ${resultado.error}`);
    }
    setSending(false);
    return resultado;
  };

  const sendDisparo = async ({ destinatarios, conteudo }) => {
    setSending(true);
    setProgress({ atual: 0, total: destinatarios.length });

    const resultados = [];
    for (let i = 0; i < destinatarios.length; i++) {
      const dest = destinatarios[i];
      setProgress({ atual: i + 1, total: destinatarios.length });

      // Validação ANTES da chamada à API
      const validation = formatAndValidateNumber(dest.whatsapp);
      let resultado;
      if (!validation.valid) {
        console.error(`[WhatsApp] Falha: ${dest.nome} - ${validation.error}`);
        resultado = { success: false, error: validation.error };
      } else {
        const message = substituirVariaveis(conteudo, dest);
        resultado = await sendMessage({
          to: validation.number,
          message,
        });
        if (!resultado.success) {
          console.error(`[WhatsApp] Falha: ${dest.nome} - ${resultado.error}`);
        }
      }

      resultados.push({
        ...dest,
        success: resultado.success,
        error: resultado.error || null,
      });

      if (i < destinatarios.length - 1) {
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    setSending(false);
    setResults(resultados);
    return {
      enviados: resultados.filter((r) => r.success).length,
      erros: resultados.filter((r) => !r.success).length,
      resultados,
    };
  };

  return { sending, progress, results, sendIndividual, sendDisparo };
}