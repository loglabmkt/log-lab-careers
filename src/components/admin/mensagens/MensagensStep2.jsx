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

const CAT_COLORS = {
  "Vaga aberta": "#60a5fa", "Boas-vindas": "#4ade80", "Entrevista": "#a78bfa",
  "Follow-up": "#F5B800", "Aprovação": "#4ade80", "Personalizado": "rgba(255,255,255,0.5)",
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
        <span style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Usar template</span>
        <div onClick={() => { setCustomMode(v => !v); if (!customMode) { setSelTemplate(null); setMensagem(""); } }} style={{ width: "36px", height: "20px", borderRadius: "10px", background: customMode ? "#F5B800" : "rgba(255,255,255,0.15)", position: "relative", cursor: "pointer", transition: "background 200ms" }}>
          <span style={{ position: "absolute", top: "2px", left: customMode ? "18px" : "2px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", transition: "left 200ms" }} />
        </div>
        <span style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Mensagem personalizada</span>
      </div>

      {!customMode ? (
        <div>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "12px" }}>Selecione um template:</div>
          {loading ? <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-inter)" }}>Carregando templates...</p> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px", marginBottom: "24px" }}>
              {templates.map(t => {
                const sel = selTemplate?.id === t.id;
                return (
                  <div key={t.id} onClick={() => handleSelectTemplate(t)} style={{
                    background: sel ? "rgba(245,184,0,0.05)" : "#1a1a1a",
                    border: `1px solid ${sel ? "#F5B800" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "12px", padding: "16px", cursor: "pointer",
                    transition: "all 150ms",
                  }}>
                    <span style={{ fontSize: "11px", fontFamily: "var(--font-inter)", color: CAT_COLORS[t.categoria] || "#fff", background: `${CAT_COLORS[t.categoria] || "#fff"}20`, padding: "2px 8px", borderRadius: "20px", display: "inline-block", marginBottom: "8px" }}>{t.categoria}</span>
                    <div style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "14px", color: "#FFFFFF", marginBottom: "6px" }}>{t.nome}</div>
                    <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: "1.5" }}>
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
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Variáveis disponíveis (clique para inserir):</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
            {VARIAVEIS.map(v => (
              <button key={v} onClick={() => setMensagem(m => m + v)} style={{ background: "rgba(245,184,0,0.1)", color: "#F5B800", border: "1px solid rgba(245,184,0,0.3)", borderRadius: "20px", padding: "3px 10px", fontFamily: "var(--font-inter)", fontSize: "12px", cursor: "pointer" }}>{v}</button>
            ))}
          </div>
          <textarea value={mensagem} onChange={e => setMensagem(e.target.value)} placeholder="Digite sua mensagem aqui..." rows={8} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px", color: "#FFFFFF", fontFamily: "monospace", fontSize: "13px", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        </div>
      )}

      {/* Seletor de vaga */}
      {hasVagaVariables(mensagem) && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>
            Selecione a vaga (preenche Vaga, Local, Modalidade e Link no envio):
          </div>
          {loadingVagas ? (
            <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-inter)", fontSize: "13px" }}>Carregando vagas...</p>
          ) : vagas.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-inter)", fontSize: "13px" }}>Nenhuma vaga aberta no momento.</p>
          ) : (
            <select
              value={vagaSel?.id || ""}
              onChange={e => { const j = vagas.find(v => v.id === e.target.value); setVagaSel(j || null); }}
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 12px", color: "#FFFFFF", fontFamily: "var(--font-inter)", fontSize: "14px", outline: "none", cursor: "pointer" }}
            >
              <option value="" style={{ background: "#1a1a1a" }}>— Selecione uma vaga —</option>
              {vagas.map(v => (
                <option key={v.id} value={v.id} style={{ background: "#1a1a1a" }}>
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
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
            Preview — exemplo com {firstDest?.nome || "destinatário"}
          </div>
          <div style={{ background: "#075e54", borderRadius: "12px", padding: "16px" }}>
            <div style={{ background: "#dcf8c6", borderRadius: "8px", padding: "12px 14px", maxWidth: "85%", marginLeft: "auto", fontFamily: "var(--font-inter)", fontSize: "13px", color: "#111", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
              {preview}
            </div>
          </div>
        </div>
      )}

      {/* Botões */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#FFFFFF", fontFamily: "var(--font-inter)", cursor: "pointer" }}>
          <ChevronLeft size={16} /> Voltar
        </button>
        <button onClick={handleNext} disabled={!mensagem.trim()} style={{ display: "flex", alignItems: "center", gap: "7px", background: mensagem.trim() ? "#F5B800" : "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px", padding: "10px 20px", color: mensagem.trim() ? "#0A0A0A" : "rgba(255,255,255,0.3)", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "14px", cursor: mensagem.trim() ? "pointer" : "not-allowed" }}>
          Próximo <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}