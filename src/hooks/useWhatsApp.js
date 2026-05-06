import { useState } from "react";

const WA_API_URL = 'http://3.94.244.240:3001/api/whatsapp/messages';
const WA_TOKEN = 'f3d229842c424848cfeb3239a8eaf3385369a9678b4b3107a324f100e12368eb';
const WA_SYSTEM_ID = 'f141105d-2090-4023-9e16-71bea2d3b3d8';
const WA_ACCOUNT_ID = '4c53300b-6879-4370-93cd-4cfa0752693e';
const WA_DEFAULT_TEMPLATE_SID = 'HXce43d376230cc7aada1ceef67d307ace';

function formatNumber(num = '') {
  const digits = num.replace(/\D/g, '');
  return digits.startsWith('55') ? digits : '55' + digits;
}

export function substituirVariaveis(template, talento) {
  return template
    .replace(/\[Nome\]/g, talento.nome || '')
    .replace(/\[Area\]/g, talento.area || talento.areaInteresse || '')
    .replace(/\[LinkSite\]/g, 'https://log-lab-careers.base44.app')
    .replace(/\[NomeVaga\]/g, talento.nomeVaga || '')
    .replace(/\[LinkVaga\]/g, talento.linkVaga || '')
    .replace(/\[Data\]/g, new Date().toLocaleDateString('pt-BR'));
}

function sendMessage({ to, templateSid, contentVariables }) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', WA_API_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('x-system-id', WA_SYSTEM_ID);
    xhr.setRequestHeader('Authorization', `Bearer ${WA_TOKEN}`);
    xhr.timeout = 15000;

    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText || '{}');
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ success: true, data });
      } else {
        console.error('[WhatsApp] Erro:', xhr.status, data);
        resolve({
          success: false,
          error: data.detail || data.message || `Erro ${xhr.status}`,
          status: xhr.status,
        });
      }
    };
    xhr.onerror = () => resolve({ success: false, error: 'Erro de rede' });
    xhr.ontimeout = () => resolve({ success: false, error: 'Timeout' });

    xhr.send(JSON.stringify({
      whatsapp_account_id: WA_ACCOUNT_ID,
      template_sid: templateSid || WA_DEFAULT_TEMPLATE_SID,
      to: formatNumber(to),
      content_variables: contentVariables || {},
    }));
  });
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