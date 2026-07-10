import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useInHireJobs } from "@/hooks/useInHireJobs";
import { substituirVariaveis } from "@/hooks/useWhatsApp";
import { buildVagaData, hasVagaVariables } from "@/utils/vaga";

const EXEMPLOS = {
  "[Nome]": "João Silva", "[Area]": "Tecnologia", "[NomeVaga]": "Dev Front-end",
  "[LinkVaga]": "https://loglab.com/vagas/123", "[Modalidade]": "Remoto", "[Cidade]": "Cuiabá",
  "[LinkSite]": "https://loglab.com/carreiras", "[Data]": "10/06/2025", "[Hora]": "14:00",
};
const VARIAVEIS = Object.keys(EXEMPLOS);

const CAT_STYLE = {
  "Vaga aberta": { color: "#2563eb", bg: "rgba(59,130,246,0.12)" },
  "Boas-vindas": { color: "#15803d", bg: "rgba(34,197,94,0.12)" },
  "Entrevista": { color: "#7c3aed", bg: "rgba(139,92,246,0.12)" },
  "Follow-up": { color: "#8a6d00", bg: "rgba(245,182,0,0.14)" },
  "Aprovação": { color: "#15803d", bg: "rgba(34,197,94,0.12)" },
  "Personalizado": { color: "rgba(10,10,10,0.55)", bg: "rgba(10,10,10,0.06)" },
};

export default function MensagensStep2({ destinatarios, initialTemplateId, onNext, onBack }) {
  const [templates, setTemplates] = useState([]);
  const [selTemplate, setSelTemplate] = useState(null);
  const [customMode, setCustomMode] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [vagaSel, setVagaSel] = useState(null);
  const { jobs: vagas, loading: loadingVagas } = useInHireJobs();

  useEffect(() => {
    base44.functions.invoke("getTemplates", {}).then(res => {
      const items = (res.data?.items || []).filter(t => t.ativo);
      setTemplates(items);
      if (initialTemplateId) {
        const found = items.find(t => t.id === initialTemplateId);
        if (found) { setSelTemplate(found); setMensagem(found.conteudo); }
      }
      setLoading(false);
    });
  }, [initialTemplateId]);

  const handleSelectTemplate = (t) => {
    setSelTemplate(t);
    setMensagem(t.conteudo);
    setCustomMode(false);
  };

  const firstDest = destinatarios[0];
  const previewDest = {
    nome: firstDest?.nome || "João",
    area: firstDest?.area || "Tecnologia",
    ...(vagaSel ? buildVagaData(vagaSel) : {}),
  };
  const preview = substituirVariaveis(mensagem, previewDest);

  const handleNext = () => {
    if (!mensagem.trim()) return;
    onNext(customMode ? null : selTemplate, mensagem, vagaSel);
  };

  return (
    <div>
      {/* Toggle custom */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <span style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.65)" }}>Usar template</span>
        <div onClick={() => { setCustomMode(v => !v); if (!customMode) { setSelTemplate(null); setMensagem(""); } }} style={{ width: "36px", height: "20px", borderRadius: "10px", background: customMode ? "#F5B600" : "rgba(10,10,10,0.15)", position: "relative", cursor: "pointer", transition: "background 200ms" }}>
          <span style={{ position: "absolute", top: "2px", left: customMode ? "18px" : "2px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(10,10,10,0.2)", transition: "left 200ms" }} />
        </div>
        <span style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.65)" }}>Mensagem personalizada</span>
      </div>

      {!customMode ? (
        <div>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.45)", marginBottom: "12px" }}>Selecione um template:</div>
          {loading ? <p style={{ color: "rgba(10,10,10,0.45)", fontFamily: "var(--font-inter)" }}>Carregando templates...</p> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px", marginBottom: "24px" }}>
              {templates.map(t => {
                const sel = selTemplate?.id === t.id;
                const cat = CAT_STYLE[t.categoria] || CAT_STYLE["Personalizado"];
                return (
                  <div key={t.id} onClick={() => handleSelectTemplate(t)} style={{
                    background: sel ? "rgba(245,182,0,0.10)" : "rgba(255,255,255,0.55)",
                    border: `1px solid ${sel ? "#F5B600" : "rgba(10,10,10,0.07)"}`,
                    borderRadius: "14px", padding: "16px", cursor: "pointer",
                    boxShadow: sel ? "0 4px 16px rgba(245,182,0,0.18)" : "0 2px 8px rgba(10,10,10,0.03)",
                    transition: "all 150ms",
                  }}>
                    <span style={{ fontSize: "11px", fontFamily: "var(--font-inter)", fontWeight: 600, color: cat.color, background: cat.bg, padding: "2px 8px", borderRadius: "20px", display: "inline-block", marginBottom: "8px" }}>{t.categoria}</span>
                    <div style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "14px", color: "#0A0A0A", marginBottom: "6px" }}>{t.nome}</div>
                    <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(10,10,10,0.5)", lineHeight: "1.5" }}>
                      {t.conteudo?.split("\n")[0]?.slice(0, 80)}...
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.45)", marginBottom: "8px" }}>Variáveis disponíveis (clique para inserir):</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
            {VARIAVEIS.map(v => (
              <button key={v} onClick={() => setMensagem(m => m + v)} style={{ background: "rgba(245,182,0,0.12)", color: "#8a6d00", border: "1px solid rgba(245,182,0,0.35)", borderRadius: "20px", padding: "3px 10px", fontFamily: "var(--font-inter)", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 150ms" }}>{v}</button>
            ))}
          </div>
          <textarea value={mensagem} onChange={e => setMensagem(e.target.value)} placeholder="Digite sua mensagem aqui..." rows={8} style={{ width: "100%", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(10,10,10,0.08)", borderRadius: "12px", padding: "12px", color: "#0A0A0A", fontFamily: "monospace", fontSize: "13px", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        </div>
      )}

      {/* Seletor de vaga */}
      {hasVagaVariables(mensagem) && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.45)", marginBottom: "8px" }}>
            Selecione a vaga (preenche Vaga, Local, Modalidade e Link no envio):
          </div>
          {loadingVagas ? (
            <p style={{ color: "rgba(10,10,10,0.45)", fontFamily: "var(--font-inter)", fontSize: "13px" }}>Carregando vagas...</p>
          ) : vagas.length === 0 ? (
            <p style={{ color: "rgba(10,10,10,0.45)", fontFamily: "var(--font-inter)", fontSize: "13px" }}>Nenhuma vaga aberta no momento.</p>
          ) : (
            <select
              value={vagaSel?.id || ""}
              onChange={e => { const j = vagas.find(v => v.id === e.target.value); setVagaSel(j || null); }}
              style={{ width: "100%", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(10,10,10,0.08)", borderRadius: "10px", padding: "10px 12px", color: "#0A0A0A", fontFamily: "var(--font-inter)", fontSize: "14px", outline: "none", cursor: "pointer" }}
            >
              <option value="">— Selecione uma vaga —</option>
              {vagas.map(v => (
                <option key={v.id} value={v.id}>
                  {v.title || v.name}{v.city ? ` · ${v.city}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Preview WhatsApp */}
      {mensagem && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(10,10,10,0.45)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
            Preview — exemplo com {firstDest?.nome || "destinatário"}
          </div>
          <div style={{ background: "#e5ddd5", borderRadius: "14px", padding: "16px", border: "1px solid rgba(10,10,10,0.06)" }}>
            <div style={{ background: "#dcf8c6", borderRadius: "10px", padding: "12px 14px", maxWidth: "85%", marginLeft: "auto", fontFamily: "var(--font-inter)", fontSize: "13px", color: "#111", whiteSpace: "pre-wrap", lineHeight: "1.6", boxShadow: "0 1px 2px rgba(10,10,10,0.12)" }}>
              {preview}
            </div>
          </div>
        </div>
      )}

      {/* Botões */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(10,10,10,0.08)", borderRadius: "10px", color: "#0A0A0A", fontFamily: "var(--font-inter)", cursor: "pointer", transition: "all 150ms" }}>
          <ChevronLeft size={16} /> Voltar
        </button>
        <button onClick={handleNext} disabled={!mensagem.trim()} style={{ display: "flex", alignItems: "center", gap: "7px", background: mensagem.trim() ? "#F5B600" : "rgba(10,10,10,0.06)", border: "none", borderRadius: "10px", padding: "10px 20px", color: mensagem.trim() ? "#0A0A0A" : "rgba(10,10,10,0.3)", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "14px", cursor: mensagem.trim() ? "pointer" : "not-allowed", boxShadow: mensagem.trim() ? "0 4px 14px rgba(245,182,0,0.3)" : "none", transition: "all 180ms" }}>
          Próximo <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
