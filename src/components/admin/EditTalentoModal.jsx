import React, { useState } from "react";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const AREAS = ["Tecnologia", "Design", "Marketing", "Comercial", "Operações", "RH", "Outro"];

const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px", padding: "10px 12px", color: "#FFFFFF",
  fontFamily: "var(--font-inter)", fontSize: "14px", outline: "none", boxSizing: "border-box",
};

const labelStyle = {
  fontFamily: "var(--font-inter)", fontSize: "11px", color: "rgba(255,255,255,0.35)",
  textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px", display: "block",
};

export default function EditTalentoModal({ talento, onClose, onSaved }) {
  const [form, setForm] = useState({
    nome: talento.nome || "",
    whatsapp: talento.whatsapp || "",
    email: talento.email || "",
    areaInteresse: talento.areaInteresse || "",
    aceitaWhatsapp: talento.aceitaWhatsapp || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.functions.invoke("updateTalento", { id: talento.id, ...form });
    onSaved({ ...talento, ...form });
    setSaving(false);
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 60 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px", padding: "28px", width: "440px", maxWidth: "95vw",
        zIndex: 61, maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "18px", color: "#FFFFFF", margin: 0 }}>
            Editar Talento
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Nome completo</label>
            <input style={inputStyle} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome completo" />
          </div>

          <div>
            <label style={labelStyle}>WhatsApp</label>
            <input style={inputStyle} value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="(00) 00000-0000" />
          </div>

          <div>
            <label style={labelStyle}>E-mail (opcional)</label>
            <input style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" type="email" />
          </div>

          <div>
            <label style={labelStyle}>Área de interesse</label>
            <select
              value={form.areaInteresse}
              onChange={e => setForm(f => ({ ...f, areaInteresse: e.target.value }))}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="" style={{ background: "#1a1a1a" }}>Selecione...</option>
              {AREAS.map(a => <option key={a} value={a} style={{ background: "#1a1a1a" }}>{a}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              id="aceitaWA"
              checked={form.aceitaWhatsapp}
              onChange={e => setForm(f => ({ ...f, aceitaWhatsapp: e.target.checked }))}
              style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#F5B800" }}
            />
            <label htmlFor="aceitaWA" style={{ ...labelStyle, margin: 0, textTransform: "none", letterSpacing: 0, fontSize: "14px", cursor: "pointer" }}>
              Aceita receber mensagens via WhatsApp
            </label>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#FFFFFF", fontFamily: "var(--font-inter)", cursor: "pointer" }}>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ flex: 1, padding: "11px", background: "#F5B800", border: "none", borderRadius: "8px", color: "#0A0A0A", fontFamily: "var(--font-inter)", fontWeight: 700, cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </>
  );
}