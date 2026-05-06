import React, { useState, useEffect } from "react";
import { Plus, Edit2, Send, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import TemplateModal from "@/components/admin/TemplateModal";
import { useNavigate } from "react-router-dom";

const CAT_COLORS = {
  "Vaga aberta": "#60a5fa",
  "Boas-vindas": "#4ade80",
  "Entrevista": "#a78bfa",
  "Follow-up": "#F5B800",
  "Aprovação": "#4ade80",
  "Personalizado": "rgba(255,255,255,0.5)",
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
          <h1 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "24px", color: "#FFFFFF", margin: 0 }}>Templates</h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>Modelos de mensagem para WhatsApp</p>
        </div>
        <button onClick={() => setModal("new")} style={{
          display: "flex", alignItems: "center", gap: "7px",
          background: "#F5B800", border: "none", borderRadius: "8px",
          padding: "10px 18px", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "14px",
          color: "#0A0A0A", cursor: "pointer",
        }}>
          <Plus size={16} /> Novo Template
        </button>
      </div>

      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "28px" }} />

      {loading ? (
        <p style={{ fontFamily: "var(--font-inter)", color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "60px 0" }}>Carregando templates...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {templates.map(t => {
            const preview = t.conteudo?.split("\n").slice(0, 2).join(" ").slice(0, 120);
            const vars = t.variaveis || [];
            return (
              <div key={t.id} style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    fontSize: "11px", fontFamily: "var(--font-inter)", fontWeight: 500,
                    padding: "3px 10px", borderRadius: "20px",
                    background: `${CAT_COLORS[t.categoria] || "#fff"}20`,
                    color: CAT_COLORS[t.categoria] || "rgba(255,255,255,0.5)",
                  }}>
                    {t.categoria}
                  </span>
                  <button onClick={() => handleToggleAtivo(t)} style={{
                    width: "36px", height: "20px", borderRadius: "10px", border: "none", cursor: "pointer",
                    background: t.ativo ? "#4ade80" : "rgba(255,255,255,0.15)",
                    position: "relative", transition: "background 200ms", flexShrink: 0,
                  }}>
                    <span style={{
                      position: "absolute", top: "2px", left: t.ativo ? "18px" : "2px",
                      width: "16px", height: "16px", borderRadius: "50%", background: "#fff",
                      transition: "left 200ms",
                    }} />
                  </button>
                </div>

                {/* Nome */}
                <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "16px", color: "#FFFFFF" }}>{t.nome}</div>

                {/* Preview */}
                <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: "1.5" }}>
                  {preview}{t.conteudo?.length > 120 ? "..." : ""}
                </div>

                {/* Variáveis */}
                {vars.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {vars.map(v => (
                      <span key={v} style={{ background: "rgba(245,184,0,0.1)", color: "#F5B800", borderRadius: "20px", padding: "2px 8px", fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "11px" }}>
                        {v}
                      </span>
                    ))}
                  </div>
                )}

                {/* Ações */}
                <div style={{ display: "flex", gap: "8px", marginTop: "4px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
                  <button onClick={() => setModal(t)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-inter)", fontSize: "13px", cursor: "pointer" }}>
                    <Edit2 size={13} /> Editar
                  </button>
                  <button onClick={() => handleUsar(t)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px", background: "rgba(245,184,0,0.1)", border: "1px solid rgba(245,184,0,0.3)", borderRadius: "8px", color: "#F5B800", fontFamily: "var(--font-inter)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    <Send size={13} /> Usar
                  </button>
                  <button onClick={() => setDeleteConfirm(t.id)} style={{ padding: "8px 12px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "28px", width: "360px" }}>
            <h3 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "17px", color: "#FFFFFF", marginBottom: "8px" }}>Excluir template?</h3>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "24px" }}>Esta ação não pode ser desfeita.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#FFFFFF", fontFamily: "var(--font-inter)", cursor: "pointer" }}>Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: "10px", background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "8px", color: "#f87171", fontFamily: "var(--font-inter)", fontWeight: 600, cursor: "pointer" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}