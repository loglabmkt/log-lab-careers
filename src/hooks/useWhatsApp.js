import { useState } from "react";
import { base44 } from "@/api/base44Client";

export function substituirVariaveis(template, talento) {
  return template
    .replace(/\[Nome\]/g, talento.nome || '')
    .replace(/\[Area\]/g, talento.area || talento.areaInteresse || '')
    .replace(/\[LinkSite\]/g, 'https://log-lab-careers.base44.app')
    .replace(/\[NomeVaga\]/g, talento.nomeVaga || '')
    .replace(/\[LinkVaga\]/g, talento.linkVaga || '')
    .replace(/\[Data\]/g, new Date().toLocaleDateString('pt-BR'));
}

async function sendMessage({ to, templateSid, contentVariables }) {
  const res = await base44.functions.invoke('sendWhatsAppMessage', {
    to,
    templateSid: templateSid || null,
    contentVariables: contentVariables || {},
  });

  const result = res.data;

  if (!result.success) {
    console.error('[useWhatsApp] Erro completo:', result);
    console.log('[useWhatsApp] Payload foi:', result.payloadEnviado);
  }

  return result;
}

export function useWhatsApp() {
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ atual: 0, total: 0 });
  const [results, setResults] = useState([]);

  const sendIndividual = async ({ talento, templateSid }) => {
    setSending(true);
    const resultado = await sendMessage({
      to: talento.whatsapp,
      templateSid,
    });
    setSending(false);
    return resultado;
  };

  const sendDisparo = async ({ destinatarios, templateSid }) => {
    setSending(true);
    setProgress({ atual: 0, total: destinatarios.length });

    const resultados = [];
    for (let i = 0; i < destinatarios.length; i++) {
      const dest = destinatarios[i];
      setProgress({ atual: i + 1, total: destinatarios.length });

      const resultado = await sendMessage({
        to: dest.whatsapp,
        templateSid,
      });

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