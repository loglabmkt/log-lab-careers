import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

const CATEGORIAS = ["Vaga aberta", "Boas-vindas", "Entrevista", "Follow-up", "Aprovação", "Personalizado"];
const VARIAVEIS = ["[Nome]", "[Area]", "[NomeVaga]", "[LinkVaga]", "[Modalidade]", "[LinkSite]", "[Data]", "[Hora]"];

const EXEMPLOS = {
  "[Nome]": "João Silva",
  "[Area]": "Tecnologia",
  "[NomeVaga]": "Dev Front-end",
  "[LinkVaga]": "https://loglab.com/vagas/123",
  "[Modalidade]": "Remoto",
  "[LinkSite]": "https://loglab.com/carreiras",
  "[Data]": "10/06/2025",
  "[Hora]": "14:00",
};

const s = {
  input: {
    width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px", padding: "10px 14px", color: "#FFFFFF",
    fontFamily: "var(--font-inter)", fontSize: "14px", outline: "none", boxSizing: "border-box",
  },
};

export default function TemplateModal({ template, onClose, onSave }) {
  const [form, setForm] = useState({
    nome: template?.nome || "",
    categoria: template?.categoria || "Vaga aberta",
    conteudo: template?.conteudo || "",
    ativo: template?.ativo !== false,
  });
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);

  const handleVarClick = (v) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newVal = form.conteudo.slice(0, start) + v + form.conteudo.slice(end);
    setForm(f => ({ ...f, conteudo: newVal }));
    setTimeout(() => { el.focus(); el.setSelectionRange(start + v.length, start + v.length); }, 0);
  };

  const preview = form.conteudo.replace(/\[([^\]]+)\]/g, (match) => {
    return EXEMPLOS[match] || match;
  });

  const handleSubmit = async () => {
    if (!form.nome || !form.conteudo) return;
    setSaving(true);
    await onSave({ id: template?.id, ...form });
    setSaving(false);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "680px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto",
        background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px", zIndex: 50, padding: "28px",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "18px", color: "#FFFFFF", margin: 0 }}>
            {template ? "Editar Template" : "Novo Template"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Nome */}
          <div>
            <label style={{ display: "block", fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Nome do template</label>
            <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Vaga de Desenvolvedor" style={s.input} />
          </div>

          {/* Categoria */}
          <div>
            <label style={{ display: "block", fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Categoria</label>
            <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} style={{ ...s.input, cursor: "pointer" }}>
              {CATEGORIAS.map(c => <option key={c} value={c} style={{ background: "#1a1a1a" }}>{c}</option>)}
            </select>
          </div>

          {/* Conteúdo */}
          <div>
            <label style={{ display: "block", fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Conteúdo da mensagem</label>
            <textarea
              ref={textareaRef}
              value={form.conteudo}
              onChange={e => setForm(f => ({ ...f, conteudo: e.target.value }))}
              placeholder="Olá, [Nome]! ..."
              rows={8}
              style={{ ...s.input, fontFamily: "monospace", fontSize: "13px", resize: "vertical" }}
            />
          </div>

          {/* Variáveis */}
          <div>
            <label style={{ display: "block", fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              Inserir variável (clique para inserir no cursor)
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {VARIAVEIS.map(v => (
                <button key={v} onClick={() => handleVarClick(v)} style={{
                  background: "rgba(245,184,0,0.1)", color: "#F5B800", border: "1px solid rgba(245,184,0,0.3)",
                  borderRadius: "20px", padding: "4px 10px", fontFamily: "var(--font-inter)", fontSize: "12px",
                  fontWeight: 500, cursor: "pointer", transition: "background 150ms",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(245,184,0,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(245,184,0,0.1)"}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {form.conteudo && (
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Preview (com valores de exemplo)</label>
              <div style={{ background: "#075e54", borderRadius: "12px", padding: "16px", maxHeight: "180px", overflowY: "auto" }}>
                <div style={{
                  background: "#dcf8c6", borderRadius: "8px", padding: "12px 14px",
                  fontFamily: "var(--font-inter)", fontSize: "13px", color: "#111",
                  whiteSpace: "pre-wrap", lineHeight: "1.6", maxWidth: "90%", marginLeft: "auto",
                }}>
                  {form.conteudo.replace(/\[([^\]]+)\]/g, (match) => {
                    const val = EXEMPLOS[match] || match;
                    return val;
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button onClick={onClose} style={{ padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#FFFFFF", fontFamily: "var(--font-inter)", cursor: "pointer" }}>
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={saving || !form.nome || !form.conteudo} style={{
              padding: "10px 24px", background: "#F5B800", border: "none", borderRadius: "8px",
              color: "#0A0A0A", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "14px",
              cursor: saving ? "default" : "pointer", opacity: (!form.nome || !form.conteudo) ? 0.5 : 1,
            }}>
              {saving ? "Salvando..." : "Salvar Template"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}