import React, { useState, useEffect } from "react";
import { X, Check, CheckCircle2, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TalentoDrawer({ talento, onClose, onUpdate }) {
  const [obs, setObs] = useState(talento?.observacoes || "");
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTplId, setSelectedTplId] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null); // null | 'ok' | 'error' | string

  useEffect(() => {
    base44.functions.invoke("getTemplates", {}).then(res => {
      const ativos = (res.data?.items || []).filter(t => t.ativo);
      setTemplates(ativos);
      if (ativos.length > 0) setSelectedTplId(ativos[0].id);
    });
  }, []);

  const handleSendWhatsApp = async () => {
    const tpl = templates.find(t => t.id === selectedTplId);
    if (!tpl) return;
    setSending(true);
    setSendResult(null);
    const mensagem = (tpl.conteudo || "")
      .replace(/\[Nome\]/g, talento.nome || "")
      .replace(/\[Area\]/g, talento.areaInteresse || "")
      .replace(/\[LinkSite\]/g, "https://log-lab-careers.base44.app")
      .replace(/\[[^\]]+\]/g, m => m);

    const res = await base44.functions.invoke("sendWhatsAppMessage", {
      to: talento.whatsapp,
      mensagem,
      templateSid: tpl.templateSid || null,
    });
    setSending(false);
    setSendResult(res.data?.success ? "ok" : (res.data?.error || "Erro desconhecido"));
  };

  const handleSaveObs = async () => {
    setSaving(true);
    await base44.functions.invoke("updateTalentoObservacoes", { id: talento.id, observacoes: obs });
    setSaving(false);
    onUpdate({ ...talento, observacoes: obs });
  };

  if (!talento) return null;

  const fmt = (d) => d ? format(new Date(d), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-";

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "400px",
        background: "#1a1a1a", zIndex: 50, overflowY: "auto",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        animation: "slideIn 0.25s ease",
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "18px", color: "#FFFFFF", margin: 0 }}>
            Detalhes do Talento
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Avatar + nome */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#F5B800", color: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "20px", flexShrink: 0 }}>
              {(talento.nome || "?")[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "18px", color: "#FFFFFF" }}>{talento.nome}</div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{talento.areaInteresse}</div>
            </div>
          </div>

          {/* Campos */}
          {[
            { label: "WhatsApp", value: talento.whatsapp },
            { label: "Área de interesse", value: talento.areaInteresse },
            { label: "Status", value: talento.status?.replace("_", " ") },
            { label: "Origem", value: talento.origem },
            { label: "Aceita WhatsApp", value: talento.aceitaWhatsapp ? "Sim" : "Não" },
            { label: "Data de cadastro", value: fmt(talento.dataCandidatura || talento.created_date) },
            { label: "Última atualização", value: fmt(talento.updated_date) },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>{label}</div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#FFFFFF" }}>{value || "-"}</div>
            </div>
          ))}

          {/* Enviar WhatsApp */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
            <div style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>Enviar Mensagem WhatsApp</div>
            <select
              value={selectedTplId}
              onChange={e => { setSelectedTplId(e.target.value); setSendResult(null); }}
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "9px 12px", color: "#FFFFFF", fontFamily: "var(--font-inter)", fontSize: "14px", outline: "none", marginBottom: "10px", cursor: "pointer" }}
            >
              {templates.length === 0 && <option value="">Nenhum template disponível</option>}
              {templates.map(t => <option key={t.id} value={t.id} style={{ background: "#1a1a1a" }}>{t.nome}</option>)}
            </select>
            <button
              onClick={handleSendWhatsApp}
              disabled={sending || !selectedTplId}
              style={{ width: "100%", padding: "10px", background: sending ? "rgba(37,211,102,0.15)" : "#25D366", border: "none", borderRadius: "8px", color: "#fff", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px", cursor: sending || !selectedTplId ? "default" : "pointer", opacity: !selectedTplId ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}
            >
              {sending ? "Enviando..." : "Enviar Mensagem"}
            </button>
            {sendResult === "ok" && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", color: "#4ade80", fontFamily: "var(--font-inter)", fontSize: "13px" }}>
                <CheckCircle2 size={16} /> Mensagem enviada com sucesso!
              </div>
            )}
            {sendResult && sendResult !== "ok" && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", color: "#f87171", fontFamily: "var(--font-inter)", fontSize: "13px" }}>
                <XCircle size={16} /> {sendResult}
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <div style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>Observações</div>
            <textarea
              value={obs}
              onChange={e => setObs(e.target.value)}
              placeholder="Adicione observações internas..."
              rows={4}
              style={{
                width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px", padding: "12px", color: "#FFFFFF", fontFamily: "var(--font-inter)", fontSize: "14px",
                resize: "vertical", outline: "none", boxSizing: "border-box",
              }}
            />
            <button
              onClick={handleSaveObs}
              disabled={saving}
              style={{
                marginTop: "8px", background: "#F5B800", color: "#0A0A0A", border: "none",
                borderRadius: "8px", padding: "10px 20px", fontFamily: "var(--font-inter)",
                fontWeight: 600, fontSize: "13px", cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Salvando..." : "Salvar observações"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}