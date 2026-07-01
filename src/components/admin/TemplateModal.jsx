import React, { useState, useRef, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const CATEGORIAS = ["Vaga aberta", "Boas-vindas", "Entrevista", "Follow-up", "Aprovação", "Personalizado"];
const VARIAVEIS = ["[Nome]", "[Area]", "[NomeVaga]", "[LinkVaga]", "[Modalidade]", "[LinkSite]", "[Data]", "[Hora]"];

// Campos disponíveis para mapear às variáveis Twilio ({{1}}, {{2}}...)
const TWILIO_CAMPOS = [
  { value: "nome", label: "Nome" },
  { value: "area", label: "Área" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "nomeVaga", label: "Nome da vaga" },
  { value: "linkVaga", label: "Link da vaga" },
  { value: "modalidade", label: "Modalidade" },
  { value: "empresa", label: "Empresa (fixo: Log Lab)" },
  { value: "data", label: "Data (hoje)" },
  { value: "hora", label: "Hora (agora)" },
  { value: "textoLivre", label: "Texto livre" },
];

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
    templateSid: template?.templateSid || "",
    ativo: template?.ativo !== false,
  });
  // Linhas de mapeamento Twilio: [{ numero, campo }]
  const [varRows, setVarRows] = useState(() => {
    const map = template?.contentVariablesTemplate || {};
    return Object.entries(map).map(([numero, campo]) => ({ numero, campo }));
  });
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);

  const addVarRow = () => setVarRows(prev => [...prev, { numero: "", campo: "nome" }]);
  const updateVarRow = (i, key, value) => setVarRows(prev => prev.map((r, idx) => idx === i ? { ...r, [key]: value } : r));
  const removeVarRow = (i) => setVarRows(prev => prev.filter((_, idx) => idx !== i));

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
    // Converte as linhas em objeto { "1": "nome", "2": "area" }
    const contentVariablesTemplate = {};
    varRows.forEach(r => {
      if (r.numero && r.campo) contentVariablesTemplate[r.numero] = r.campo;
    });
    await onSave({
      id: template?.id,
      ...form,
      templateSid: form.templateSid || null,
      contentVariablesTemplate: Object.keys(contentVariablesTemplate).length > 0 ? contentVariablesTemplate : null,
    });
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

          {/* Template SID */}
          <div>
            <label style={{ display: "block", fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Template SID (WhatsApp API)</label>
            <input value={form.templateSid} onChange={e => setForm(f => ({ ...f, templateSid: e.target.value }))} placeholder="HXce43d376230cc7aada1ceef67d307ace" style={s.input} />
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>Opcional. Deixe vazio para usar o template padrão.</p>
          </div>

          {/* Mapeamento de variáveis Twilio */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
            <label style={{ display: "block", fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Mapeamento de variáveis (opcional)</label>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "0 0 12px", lineHeight: 1.5 }}>
              Se seu template Twilio usa <span style={{ color: "#F5B800", fontFamily: "monospace" }}>{"{{1}}"}</span>, <span style={{ color: "#F5B800", fontFamily: "monospace" }}>{"{{2}}"}</span>, etc., mapeie cada variável ao campo correspondente.
            </p>

            {varRows.length === 0 && (
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: "0 0 10px" }}>
                Nenhuma variável mapeada. O envio usará <span style={{ fontFamily: "monospace" }}>content_variables: {"{}"}</span>.
              </p>
            )}

            {varRows.map((row, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", background: "rgba(245,184,0,0.1)", border: "1px solid rgba(245,184,0,0.3)", borderRadius: "8px", padding: "0 10px", flexShrink: 0 }}>
                  <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#F5B800" }}>{"{{"}</span>
                  <input
                    value={row.numero}
                    onChange={e => updateVarRow(i, "numero", e.target.value.replace(/\D/g, ""))}
                    placeholder="1"
                    style={{ width: "28px", background: "transparent", border: "none", color: "#F5B800", fontFamily: "monospace", fontSize: "13px", textAlign: "center", outline: "none", padding: "8px 0" }}
                  />
                  <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#F5B800" }}>{"}}"}</span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-inter)" }}>→</span>
                <select
                  value={row.campo}
                  onChange={e => updateVarRow(i, "campo", e.target.value)}
                  style={{ ...s.input, flex: 1, cursor: "pointer" }}
                >
                  {TWILIO_CAMPOS.map(c => <option key={c.value} value={c.value} style={{ background: "#1a1a1a" }}>{c.label}</option>)}
                </select>
                <button onClick={() => removeVarRow(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(239,68,68,0.6)", padding: "4px", flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(239,68,68,0.6)"}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <button onClick={addVarRow} style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.2)",
              borderRadius: "8px", padding: "8px 14px", fontFamily: "var(--font-inter)", fontSize: "13px",
              color: "rgba(255,255,255,0.7)", cursor: "pointer", transition: "all 150ms",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(245,184,0,0.4)"; e.currentTarget.style.color = "#F5B800"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            >
              <Plus size={14} /> Adicionar variável
            </button>
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