import React, { useState, useEffect } from "react";
import { Plus, Edit2, Send, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import TemplateModal from "@/components/admin/TemplateModal";
import { useNavigate } from "react-router-dom";

const CAT_STYLE = {
  "Vaga aberta": { color: "#2563eb", bg: "rgba(59,130,246,0.12)" },
  "Boas-vindas": { color: "#15803d", bg: "rgba(34,197,94,0.12)" },
  "Entrevista": { color: "#7c3aed", bg: "rgba(139,92,246,0.12)" },
  "Follow-up": { color: "#8a6d00", bg: "rgba(245,182,0,0.14)" },
  "Aprovação": { color: "#15803d", bg: "rgba(34,197,94,0.12)" },
  "Personalizado": { color: "rgba(10,10,10,0.55)", bg: "rgba(10,10,10,0.06)" },
};

const glassCard = {
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.65)",
  borderRadius: "18px", padding: "20px",
  boxShadow: "0 8px 32px rgba(10,10,10,0.06), inset 1px 1px 0 rgba(255,255,255,0.75), inset -1px -1px 1px rgba(10,10,10,0.03)",
  display: "flex", flexDirection: "column", gap: "12px",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | template object
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    // Seed on first load
    await base44.functions.invoke("seedTemplates", {});
    const res = await base44.functions.invoke("getTemplates", {});
    setTemplates(res.data?.items || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    await base44.functions.invoke("saveTemplate", data);
    setModal(null);
    load();
  };

  const handleToggleAtivo = async (t) => {
    await base44.functions.invoke("saveTemplate", { id: t.id, nome: t.nome, categoria: t.categoria, conteudo: t.conteudo, ativo: !t.ativo });
    setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, ativo: !x.ativo } : x));
  };

  const handleDelete = async (id) => {
    await base44.functions.invoke("deleteTemplate", { id });
    setDeleteConfirm(null);
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleUsar = (t) => {
    navigate("/admin/mensagens", { state: { templateId: t.id } });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "24px", color: "#0A0A0A", margin: 0 }}>Templates</h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.55)", margin: "4px 0 0" }}>Modelos de mensagem para WhatsApp</p>
        </div>
        <button onClick={() => setModal("new")} style={{
          display: "flex", alignItems: "center", gap: "7px",
          background: "#F5B600", border: "none", borderRadius: "10px",
          padding: "10px 18px", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "14px",
          color: "#0A0A0A", cursor: "pointer", boxShadow: "0 4px 14px rgba(245,182,0,0.3)",
          transition: "all 180ms ease",
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(245,182,0,0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(245,182,0,0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <Plus size={16} /> Novo Template
        </button>
      </div>

      <div style={{ height: "1px", background: "rgba(10,10,10,0.05)", marginBottom: "28px" }} />

      {loading ? (
        <p style={{ fontFamily: "var(--font-inter)", color: "rgba(10,10,10,0.45)", textAlign: "center", padding: "60px 0" }}>Carregando templates...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {templates.map(t => {
            const preview = t.conteudo?.split("\n").slice(0, 2).join(" ").slice(0, 120);
            const vars = t.variaveis || [];
            const cat = CAT_STYLE[t.categoria] || CAT_STYLE["Personalizado"];
            return (
              <div key={t.id} style={glassCard}>
                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    fontSize: "11px", fontFamily: "var(--font-inter)", fontWeight: 600,
                    padding: "3px 10px", borderRadius: "20px",
                    background: cat.bg, color: cat.color,
                  }}>
                    {t.categoria}
                  </span>
                  <button onClick={() => handleToggleAtivo(t)} style={{
                    width: "36px", height: "20px", borderRadius: "10px", border: "none", cursor: "pointer",
                    background: t.ativo ? "#22c55e" : "rgba(10,10,10,0.15)",
                    position: "relative", transition: "background 200ms", flexShrink: 0,
                  }}>
                    <span style={{
                      position: "absolute", top: "2px", left: t.ativo ? "18px" : "2px",
                      width: "16px", height: "16px", borderRadius: "50%", background: "#fff",
                      boxShadow: "0 1px 3px rgba(10,10,10,0.2)",
                      transition: "left 200ms",
                    }} />
                  </button>
                </div>

                {/* Nome */}
                <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "16px", color: "#0A0A0A" }}>{t.nome}</div>

                {/* Preview */}
                <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.5)", lineHeight: "1.5" }}>
                  {preview}{t.conteudo?.length > 120 ? "..." : ""}
                </div>

                {/* Variáveis */}
                {vars.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {vars.map(v => (
                      <span key={v} style={{ background: "rgba(245,182,0,0.12)", color: "#8a6d00", borderRadius: "20px", padding: "2px 8px", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "11px" }}>
                        {v}
                      </span>
                    ))}
                  </div>
                )}

                {/* Ações */}
                <div style={{ display: "flex", gap: "8px", marginTop: "4px", borderTop: "1px solid rgba(10,10,10,0.05)", paddingTop: "12px" }}>
                  <button onClick={() => setModal(t)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(10,10,10,0.08)", borderRadius: "9px", color: "rgba(10,10,10,0.65)", fontFamily: "var(--font-inter)", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 150ms" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(10,10,10,0.2)"; e.currentTarget.style.color = "#0A0A0A"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(10,10,10,0.08)"; e.currentTarget.style.color = "rgba(10,10,10,0.65)"; }}
                  >
                    <Edit2 size={13} /> Editar
                  </button>
                  <button onClick={() => handleUsar(t)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px", background: "rgba(245,182,0,0.12)", border: "1px solid rgba(245,182,0,0.4)", borderRadius: "9px", color: "#8a6d00", fontFamily: "var(--font-inter)", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 150ms" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,182,0,0.22)"; e.currentTarget.style.color = "#0A0A0A"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(245,182,0,0.12)"; e.currentTarget.style.color = "#8a6d00"; }}
                  >
                    <Send size={13} /> Usar
                  </button>
                  <button onClick={() => setDeleteConfirm(t.id)} style={{ padding: "8px 12px", background: "transparent", border: "1px solid rgba(10,10,10,0.08)", borderRadius: "9px", color: "rgba(10,10,10,0.35)", cursor: "pointer", transition: "all 150ms" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(10,10,10,0.35)"; e.currentTarget.style.borderColor = "rgba(10,10,10,0.08)"; }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal criar/editar */}
      {modal && (
        <TemplateModal
          template={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.25)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: "18px", padding: "28px", width: "360px", boxShadow: "0 24px 64px rgba(10,10,10,0.18), inset 1px 1px 0 rgba(255,255,255,0.8)" }}>
            <h3 style={{ fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "17px", color: "#0A0A0A", marginBottom: "8px" }}>Excluir template?</h3>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.55)", marginBottom: "24px" }}>Esta ação não pode ser desfeita.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(10,10,10,0.08)", borderRadius: "10px", color: "#0A0A0A", fontFamily: "var(--font-inter)", fontWeight: 500, cursor: "pointer" }}>Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: "10px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", color: "#dc2626", fontFamily: "var(--font-inter)", fontWeight: 600, cursor: "pointer" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
