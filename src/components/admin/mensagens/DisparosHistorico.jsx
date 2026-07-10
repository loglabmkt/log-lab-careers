import React, { useState, useEffect, useCallback } from "react";
import { X, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { base44 } from "@/api/base44Client";

const STATUS_STYLE = {
  rascunho: { bg: "rgba(10,10,10,0.06)", color: "rgba(10,10,10,0.55)" },
  agendado: { bg: "rgba(59,130,246,0.12)", color: "#2563eb" },
  enviando: { bg: "rgba(245,182,0,0.14)", color: "#8a6d00" },
  concluido: { bg: "rgba(34,197,94,0.12)", color: "#15803d" },
  erro: { bg: "rgba(239,68,68,0.12)", color: "#dc2626" },
};

const STATUS_LABEL = {
  rascunho: "Rascunho", agendado: "Agendado", enviando: "Enviando",
  concluido: "Concluído", erro: "Erro",
};

// Status de entrega por mensagem (via webhook Z-API)
const ENVIO_STATUS = {
  enviado: { label: "Enviado ✓", bg: "rgba(10,10,10,0.06)", color: "rgba(10,10,10,0.55)" },
  entregue: { label: "Entregue ✓✓", bg: "rgba(59,130,246,0.12)", color: "#2563eb" },
  lido: { label: "Lido ✓✓", bg: "rgba(34,197,94,0.12)", color: "#15803d" },
  erro: { label: "Erro", bg: "rgba(239,68,68,0.12)", color: "#dc2626" },
};

const soDigitos = (n = "") => String(n).replace(/\D/g, "");

const glass = {
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.65)",
  boxShadow: "0 8px 32px rgba(10,10,10,0.06), inset 1px 1px 0 rgba(255,255,255,0.75), inset -1px -1px 1px rgba(10,10,10,0.03)",
};

export default function DisparosHistorico({ items, loading }) {
  const [detail, setDetail] = useState(null);
  const [envioLogs, setEnvioLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const loadLogs = useCallback(async (disparoId) => {
    if (!disparoId) return;
    setLoadingLogs(true);
    try {
      const res = await base44.functions.invoke("getEnvioLogs", { disparoId });
      setEnvioLogs(res.data?.items || []);
    } catch {
      setEnvioLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    if (detail?.id) loadLogs(detail.id);
    else setEnvioLogs([]);
  }, [detail?.id, loadLogs]);

  // Log mais recente por destinatário (talentoId, com fallback por número)
  const logDoDest = (d) => {
    return envioLogs.find(l => d.id && l.talentoId === d.id)
      || envioLogs.find(l => soDigitos(l.whatsapp).endsWith(soDigitos(d.whatsapp).slice(-8)) && soDigitos(d.whatsapp).length > 0);
  };

  if (loading) return <p style={{ color: "rgba(10,10,10,0.45)", fontFamily: "var(--font-inter)" }}>Carregando...</p>;
  if (!items.length) return <p style={{ color: "rgba(10,10,10,0.45)", fontFamily: "var(--font-inter)" }}>Nenhum disparo realizado ainda.</p>;

  return (
    <>
      <div style={{ ...glass, borderRadius: "16px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Template", "Destinatários", "Status", "Data", "Ações"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "var(--font-inter)", fontSize: "11px", fontWeight: 600, color: "rgba(10,10,10,0.45)", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid rgba(10,10,10,0.05)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(d => (
              <tr key={d.id} style={{ borderBottom: "1px solid rgba(10,10,10,0.05)", transition: "background 150ms" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(245,182,0,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "14px 16px", fontFamily: "var(--font-inter)", fontSize: "14px", fontWeight: 600, color: "#0A0A0A" }}>{d.templateNome}</td>
                <td style={{ padding: "14px 16px", fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.65)" }}>{d.destinatarios?.length || 0}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ ...STATUS_STYLE[d.status], borderRadius: "20px", padding: "3px 10px", fontFamily: "var(--font-inter)", fontSize: "12px", fontWeight: 600 }}>
                    {STATUS_LABEL[d.status] || d.status}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.5)" }}>
                  {d.created_date ? format(new Date(d.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <button onClick={() => setDetail(d)} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(10,10,10,0.08)", borderRadius: "8px", color: "rgba(10,10,10,0.65)", fontFamily: "var(--font-inter)", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 150ms" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#F5B600"; e.currentTarget.style.color = "#0A0A0A"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(10,10,10,0.08)"; e.currentTarget.style.color = "rgba(10,10,10,0.65)"; }}
                  >
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
          <div onClick={() => setDetail(null)} style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.25)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", zIndex: 40 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "500px", maxWidth: "95vw", maxHeight: "80vh", overflowY: "auto", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: "20px", zIndex: 50, padding: "24px", boxShadow: "0 24px 64px rgba(10,10,10,0.18), inset 1px 1px 0 rgba(255,255,255,0.8)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "17px", color: "#0A0A0A", margin: 0 }}>Detalhes do Disparo</h3>
              <button onClick={() => setDetail(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(10,10,10,0.45)" }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Template", value: detail.templateNome },
                { label: "Status", value: STATUS_LABEL[detail.status] },
                { label: "Criado por", value: detail.criadoPor },
                { label: "Data", value: detail.created_date ? format(new Date(detail.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "rgba(10,10,10,0.4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "3px" }}>{label}</div>
                  <div style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#0A0A0A" }}>{value || "-"}</div>
                </div>
              ))}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "rgba(10,10,10,0.4)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Destinatários ({detail.destinatarios?.length || 0})</div>
                  <button onClick={() => loadLogs(detail.id)} disabled={loadingLogs} title="Atualizar status de entrega" style={{ display: "flex", alignItems: "center", gap: "5px", background: "none", border: "none", cursor: loadingLogs ? "default" : "pointer", color: "rgba(10,10,10,0.45)", fontFamily: "var(--font-inter)", fontSize: "12px", padding: "2px 4px", transition: "color 150ms" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#0A0A0A"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(10,10,10,0.45)"}
                  >
                    <RefreshCw size={12} className={loadingLogs ? "animate-spin" : ""} /> Atualizar
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "200px", overflowY: "auto" }}>
                  {(detail.destinatarios || []).map((d, i) => {
                    const log = logDoDest(d);
                    const st = log ? ENVIO_STATUS[log.status] : null;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", background: "rgba(10,10,10,0.03)", borderRadius: "8px" }}>
                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#F5B600", color: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "10px", flexShrink: 0 }}>
                          {(d.nome || "?")[0].toUpperCase()}
                        </div>
                        <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#0A0A0A", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.nome}</div>
                        {st && (
                          <span title={log.status === "erro" ? (log.erro || "Erro no envio") : undefined} style={{ background: st.bg, color: st.color, borderRadius: "20px", padding: "2px 8px", fontFamily: "var(--font-inter)", fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
                            {st.label}
                          </span>
                        )}
                        <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(10,10,10,0.45)", flexShrink: 0 }}>{d.area}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
