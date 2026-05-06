import React, { useState } from "react";
import { ChevronLeft, AlertTriangle, ExternalLink, X } from "lucide-react";

function fmtWA(n = "") {
  const d = n.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return n;
}

function waLink(whatsapp, mensagem) {
  const num = whatsapp.replace(/\D/g, "");
  const intl = num.startsWith("55") ? num : `55${num}`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(mensagem)}`;
}

export default function MensagensStep3({ destinatarios, template, mensagem, onBack, onFinish }) {
  const [saving, setSaving] = useState(false);
  const [linksModal, setLinksModal] = useState(false);

  const personalizar = (dest) => mensagem
    .replace(/\[Nome\]/g, dest.nome || "")
    .replace(/\[Area\]/g, dest.area || "")
    .replace(/\[[^\]]+\]/g, m => m);

  const handleEnviar = async () => {
    setSaving(true);
    await onFinish();
    setSaving(false);
    setLinksModal(true);
  };

  return (
    <div>
      {/* Resumo */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px" }}>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px" }}>Destinatários</div>
          <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "28px", color: "#F5B800" }}>{destinatarios.length}</div>
        </div>
        <div style={{ flex: 2, minWidth: "200px", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px" }}>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px" }}>Template</div>
          <div style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "16px", color: "#FFFFFF" }}>{template?.nome || "Mensagem personalizada"}</div>
        </div>
      </div>

      {/* Lista destinatários */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "10px" }}>Destinatários:</div>
        <div style={{ maxHeight: "260px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "8px" }}>
          {destinatarios.map((d, i) => (
            <div key={d.id || i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "6px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#F5B800", color: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>
                {(d.nome || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#FFFFFF" }}>{d.nome}</div>
                <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{fmtWA(d.whatsapp)} · {d.area}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview final */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "10px" }}>Preview da mensagem:</div>
        <div style={{ background: "#075e54", borderRadius: "12px", padding: "16px" }}>
          <div style={{ background: "#dcf8c6", borderRadius: "8px", padding: "12px 14px", maxWidth: "85%", marginLeft: "auto", fontFamily: "var(--font-inter)", fontSize: "13px", color: "#111", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
            {destinatarios[0] ? personalizar(destinatarios[0]) : mensagem}
          </div>
        </div>
      </div>

      {/* Aviso */}
      <div style={{ background: "rgba(245,184,0,0.08)", border: "1px solid rgba(245,184,0,0.25)", borderRadius: "10px", padding: "14px 16px", marginBottom: "24px", display: "flex", gap: "10px" }}>
        <AlertTriangle size={18} color="#F5B800" style={{ flexShrink: 0, marginTop: "1px" }} />
        <p style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: "1.6" }}>
          <strong style={{ color: "#F5B800" }}>Integração WhatsApp em breve.</strong> Por ora, o disparo será salvo como rascunho e você poderá usar os links wa.me para envio manual enquanto a API não está configurada.
        </p>
      </div>

      {/* Botões */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#FFFFFF", fontFamily: "var(--font-inter)", cursor: "pointer" }}>
          <ChevronLeft size={16} /> Voltar
        </button>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={async () => { setSaving(true); await onFinish(); setSaving(false); }} disabled={saving} style={{ padding: "10px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#FFFFFF", fontFamily: "var(--font-inter)", cursor: "pointer" }}>
            Salvar Rascunho
          </button>
          <button onClick={handleEnviar} disabled={saving} style={{ padding: "10px 20px", background: "#F5B800", border: "none", borderRadius: "8px", color: "#0A0A0A", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "14px", cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Salvando..." : "Enviar Agora"}
          </button>
        </div>
      </div>

      {/* Modal links manuais */}
      {linksModal && (
        <>
          <div onClick={() => setLinksModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "540px", maxWidth: "95vw", maxHeight: "80vh", overflowY: "auto", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", zIndex: 50, padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "17px", color: "#FFFFFF", margin: 0 }}>Links para envio manual</h3>
              <button onClick={() => setLinksModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}><X size={18} /></button>
            </div>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "16px", lineHeight: "1.5" }}>
              Enquanto a API de WhatsApp não está configurada, use os links abaixo para envio manual:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {destinatarios.map((d, i) => (
                <div key={d.id || i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#FFFFFF" }}>{d.nome}</div>
                    <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{fmtWA(d.whatsapp)}</div>
                  </div>
                  <a href={waLink(d.whatsapp, personalizar(d))} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", background: "#25D366", borderRadius: "6px", color: "#fff", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "12px", textDecoration: "none" }}>
                    Abrir <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}