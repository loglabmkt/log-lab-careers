import React, { useState } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_STYLE = {
  rascunho: { bg: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" },
  agendado: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
  enviando: { bg: "rgba(245,184,0,0.15)", color: "#F5B800" },
  concluido: { bg: "rgba(34,197,94,0.15)", color: "#4ade80" },
  erro: { bg: "rgba(239,68,68,0.15)", color: "#f87171" },
};

const STATUS_LABEL = {
  rascunho: "Rascunho", agendado: "Agendado", enviando: "Enviando",
  concluido: "Concluído", erro: "Erro",
};

export default function DisparosHistorico({ items, loading }) {
  const [detail, setDetail] = useState(null);

  if (loading) return <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-inter)" }}>Carregando...</p>;
  if (!items.length) return <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-inter)" }}>Nenhum disparo realizado ainda.</p>;

  return (
    <>
      <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)" }}>
              {["Template", "Destinatários", "Status", "Data", "Ações"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "var(--font-inter)", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(d => (
              <tr key={d.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "14px 16px", fontFamily: "var(--font-inter)", fontSize: "14px", color: "#FFFFFF" }}>{d.templateNome}</td>
                <td style={{ padding: "14px 16px", fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>{d.destinatarios?.length || 0}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ ...STATUS_STYLE[d.status], borderRadius: "20px", padding: "3px 10px", fontFamily: "var(--font-inter)", fontSize: "12px", fontWeight: 500 }}>
                    {STATUS_LABEL[d.status] || d.status}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                  {d.created_date ? format(new Date(d.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <button onClick={() => setDetail(d)} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-inter)", fontSize: "12px", cursor: "pointer" }}>
                    Ver detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal detalhes */}
      {detail && (
        <>
          <div onClick={() => setDetail(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "500px", maxWidth: "95vw", maxHeight: "80vh", overflowY: "auto", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", zIndex: 50, padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "17px", color: "#FFFFFF", margin: 0 }}>Detalhes do Disparo</h3>
              <button onClick={() => setDetail(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Template", value: detail.templateNome },
                { label: "Status", value: STATUS_LABEL[detail.status] },
                { label: "Criado por", value: detail.criadoPor },
                { label: "Data", value: detail.created_date ? format(new Date(detail.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "3px" }}>{label}</div>
                  <div style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#FFFFFF" }}>{value || "-"}</div>
                </div>
              ))}
              <div>
                <div style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>Destinatários ({detail.destinatarios?.length || 0})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "200px", overflowY: "auto" }}>
                  {(detail.destinatarios || []).map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", background: "rgba(255,255,255,0.03)", borderRadius: "6px" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#F5B800", color: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "10px", flexShrink: 0 }}>
                        {(d.nome || "?")[0].toUpperCase()}
                      </div>
                      <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#FFFFFF" }}>{d.nome}</div>
                      <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginLeft: "auto" }}>{d.area}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}