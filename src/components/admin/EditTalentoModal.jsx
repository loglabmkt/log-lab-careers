import React, { useState } from "react";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const AREAS = ["Tecnologia", "Design", "Marketing", "Comercial", "Operações", "RH", "Outro"];

const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(10,10,10,0.08)",
  borderRadius: "10px", padding: "10px 12px", color: "#0A0A0A",
  fontFamily: "var(--font-inter)", fontSize: "14px", outline: "none", boxSizing: "border-box",
  transition: "border-color 180ms ease, box-shadow 180ms ease",
};

const labelStyle = {
  fontFamily: "var(--font-inter)", fontSize: "11px", color: "rgba(10,10,10,0.45)",
  textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px", display: "block",
};

const focusInput = (e) => { e.currentTarget.style.borderColor = "#F5B800"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,182,0,0.15)"; };
const blurInput = (e) => { e.currentTarget.style.borderColor = "rgba(10,10,10,0.08)"; e.currentTarget.style.boxShadow = "none"; };

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
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.25)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", zIndex: 60 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)",
        border: "1px solid rgba(10,10,10,0.06)",
        borderRadius: "16px", padding: "28px", width: "440px", maxWidth: "95vw",
        zIndex: 61, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 8px 32px rgba(10,10,10,0.12)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "18px", color: "#0A0A0A", margin: 0 }}>
            Editar Talento
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(10,10,10,0.45)", transition: "color 180ms ease" }}
            onMouseEnter={e => e.currentTarget.style.color = "#0A0A0A"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(10,10,10,0.45)"}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Nome completo</label>
            <input style={inputStyle} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} onFocus={focusInput} onBlur={blurInput} placeholder="Nome completo" />
          </div>

          <div>
            <label style={labelStyle}>WhatsApp</label>
            <input style={inputStyle} value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} onFocus={focusInput} onBlur={blurInput} placeholder="(00) 00000-0000" />
          </div>

          <div>
            <label style={labelStyle}>E-mail (opcional)</label>
            <input style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onFocus={focusInput} onBlur={blurInput} placeholder="email@exemplo.com" type="email" />
          </div>

          <div>
            <label style={labelStyle}>Área de interesse</label>
            <select
              value={form.areaInteresse}
              onChange={e => setForm(f => ({ ...f, areaInteresse: e.target.value }))}
              onFocus={focusInput}
              onBlur={blurInput}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">Selecione...</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
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
          <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(10,10,10,0.08)", borderRadius: "10px", color: "#0A0A0A", fontFamily: "var(--font-inter)", fontWeight: 500, cursor: "pointer", transition: "all 180ms ease" }}>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ flex: 1, padding: "11px", background: "#F5B800", border: "none", borderRadius: "10px", color: "#0A0A0A", fontFamily: "var(--font-inter)", fontWeight: 700, cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1, transition: "all 180ms ease" }}
            onMouseEnter={e => { if (!saving) { e.currentTarget.style.boxShadow = "0 6px 24px rgba(245,182,0,0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </>
  );
}