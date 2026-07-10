import React, { useState, useEffect } from "react";
import { Search, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

const AREAS = ["Tecnologia", "Design", "Marketing", "Comercial", "Operações", "RH", "Administrativo", "Outros"];
const STATUS_OPTS = [
  { value: "novo", label: "Novo" },
  { value: "em_contato", label: "Em contato" },
  { value: "entrevista_agendada", label: "Entrevista agendada" },
  { value: "aprovado", label: "Aprovado" },
  { value: "descartado", label: "Descartado" },
];

const inputStyle = {
  background: "rgba(255,255,255,0.7)", border: "1px solid rgba(10,10,10,0.08)",
  borderRadius: "10px", padding: "9px 12px", color: "#0A0A0A",
  fontFamily: "var(--font-inter)", fontSize: "14px", outline: "none",
};

export default function MensagensStep1({ selected, onNext }) {
  const [tab, setTab] = useState("area");
  const [allTalentos, setAllTalentos] = useState([]);
  const [search, setSearch] = useState("");
  const [areasSel, setAreasSel] = useState([]);
  const [statusSel, setStatusSel] = useState([]);
  const [apenasWA, setApenasWA] = useState(true);
  const [indivSel, setIndivSel] = useState(new Set(selected.map(d => d.id)));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke("getTalentos", { page: 1, limit: 1000 }).then(res => {
      setAllTalentos(res.data?.items || []);
      setLoading(false);
    });
  }, []);

  const toggleArea = (a) => setAreasSel(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  const toggleStatus = (s) => setStatusSel(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  // Filtrar por área — talentos com areaInteresse === "Todas" recebem vagas de qualquer área
  const byArea = allTalentos.filter(t => {
    if (apenasWA && !t.aceitaWhatsapp) return false;
    if (statusSel.length > 0 && !statusSel.includes(t.status)) return false;
    if (areasSel.length > 0 && !areasSel.includes(t.areaInteresse) && t.areaInteresse !== "Todas") return false;
    return true;
  });

  // Filtrar individual
  const byIndiv = allTalentos.filter(t => {
    const s = search.toLowerCase();
    if (s && !t.nome?.toLowerCase().includes(s) && !t.whatsapp?.includes(s)) return false;
    if (apenasWA && !t.aceitaWhatsapp) return false;
    if (statusSel.length > 0 && !statusSel.includes(t.status)) return false;
    if (areasSel.length > 0 && !areasSel.includes(t.areaInteresse) && t.areaInteresse !== "Todas") return false;
    return true;
  });

  const countByArea = (area) => allTalentos.filter(t => {
    if (apenasWA && !t.aceitaWhatsapp) return false;
    if (statusSel.length > 0 && !statusSel.includes(t.status)) return false;
    return t.areaInteresse === area || t.areaInteresse === "Todas";
  }).length;

  const getSelected = () => {
    if (tab === "area") return byArea;
    return allTalentos.filter(t => indivSel.has(t.id));
  };

  const handleNext = () => {
    const list = getSelected().map(t => ({ id: t.id, nome: t.nome, whatsapp: t.whatsapp, area: t.areaInteresse }));
    onNext(list);
  };

  const total = tab === "area" ? byArea.length : indivSel.size;

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "rgba(10,10,10,0.05)", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
        {[["area", "Por Área"], ["individual", "Individual"]].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            padding: "7px 18px", borderRadius: "7px", border: "none", cursor: "pointer",
            background: tab === v ? "#F5B600" : "transparent",
            color: tab === v ? "#0A0A0A" : "rgba(10,10,10,0.5)",
            fontFamily: "var(--font-inter)", fontWeight: tab === v ? 600 : 400, fontSize: "13px",
            boxShadow: tab === v ? "0 2px 8px rgba(245,182,0,0.3)" : "none",
            transition: "all 180ms ease",
          }}>
            {l}
          </button>
        ))}
      </div>

      {/* Filtros comuns */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <div
            onClick={() => setApenasWA(v => !v)}
            style={{ width: "36px", height: "20px", borderRadius: "10px", background: apenasWA ? "#F5B600" : "rgba(10,10,10,0.15)", position: "relative", cursor: "pointer", transition: "background 200ms", flexShrink: 0 }}
          >
            <span style={{ position: "absolute", top: "2px", left: apenasWA ? "18px" : "2px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(10,10,10,0.2)", transition: "left 200ms" }} />
          </div>
          <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.65)" }}>Apenas quem aceitou WhatsApp</span>
        </label>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "rgba(10,10,10,0.45)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Filtrar por status</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {STATUS_OPTS.map(s => (
              <button key={s.value} onClick={() => toggleStatus(s.value)} style={{
                padding: "4px 10px", borderRadius: "20px", border: "1px solid",
                borderColor: statusSel.includes(s.value) ? "#F5B600" : "rgba(10,10,10,0.12)",
                background: statusSel.includes(s.value) ? "rgba(245,182,0,0.15)" : "rgba(255,255,255,0.5)",
                color: statusSel.includes(s.value) ? "#8a6d00" : "rgba(10,10,10,0.5)",
                fontFamily: "var(--font-inter)", fontSize: "12px", fontWeight: statusSel.includes(s.value) ? 600 : 400, cursor: "pointer",
                transition: "all 150ms ease",
              }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab conteúdo */}
      {tab === "area" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
          {loading ? <p style={{ color: "rgba(10,10,10,0.45)", fontFamily: "var(--font-inter)" }}>Carregando...</p> : (
            AREAS.map(area => {
              const count = countByArea(area);
              const checked = areasSel.includes(area);
              return (
                <label key={area} onClick={() => toggleArea(area)} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 16px", borderRadius: "12px", cursor: "pointer",
                  background: checked ? "rgba(245,182,0,0.10)" : "rgba(255,255,255,0.5)",
                  border: `1px solid ${checked ? "rgba(245,182,0,0.45)" : "rgba(10,10,10,0.06)"}`,
                  transition: "all 150ms",
                }}>
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "5px", border: `2px solid ${checked ? "#F5B600" : "rgba(10,10,10,0.25)"}`,
                    background: checked ? "#F5B600" : "transparent", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 150ms",
                  }}>
                    {checked && <span style={{ color: "#0A0A0A", fontSize: "11px", fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#0A0A0A", flex: 1, fontWeight: checked ? 600 : 400 }}>{area}</span>
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.45)" }}>{count} cadastro{count !== 1 ? "s" : ""}</span>
                </label>
              );
            })
          )}
        </div>
      ) : (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ position: "relative", marginBottom: "14px" }}>
            <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "rgba(10,10,10,0.35)" }} />
            <input placeholder="Buscar por nome ou WhatsApp..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: "34px", width: "100%", boxSizing: "border-box" }} />
          </div>
          <div style={{ maxHeight: "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
            {loading ? <p style={{ color: "rgba(10,10,10,0.45)", fontFamily: "var(--font-inter)" }}>Carregando...</p> :
              byIndiv.map(t => {
                const sel = indivSel.has(t.id);
                return (
                  <label key={t.id} onClick={() => setIndivSel(prev => { const n = new Set(prev); sel ? n.delete(t.id) : n.add(t.id); return n; })} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px", borderRadius: "10px", cursor: "pointer",
                    background: sel ? "rgba(245,182,0,0.10)" : "transparent",
                    transition: "background 150ms",
                  }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "5px", border: `2px solid ${sel ? "#F5B600" : "rgba(10,10,10,0.25)"}`, background: sel ? "#F5B600" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 150ms" }}>
                      {sel && <span style={{ color: "#0A0A0A", fontSize: "10px", fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#F5B600", color: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>
                      {(t.nome || "?")[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#0A0A0A" }}>{t.nome}</div>
                      <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(10,10,10,0.45)" }}>{t.whatsapp} · {t.areaInteresse}</div>
                    </div>
                  </label>
                );
              })
            }
          </div>
        </div>
      )}

      {/* Counter + Botão */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: total > 0 ? "#8a6d00" : "rgba(10,10,10,0.45)", fontWeight: total > 0 ? 600 : 400 }}>
          {total} destinatário{total !== 1 ? "s" : ""} selecionado{total !== 1 ? "s" : ""}
        </div>
        <button onClick={handleNext} disabled={total === 0} style={{
          display: "flex", alignItems: "center", gap: "7px",
          background: total > 0 ? "#F5B600" : "rgba(10,10,10,0.06)",
          border: "none", borderRadius: "10px", padding: "10px 20px",
          color: total > 0 ? "#0A0A0A" : "rgba(10,10,10,0.3)",
          fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "14px",
          cursor: total > 0 ? "pointer" : "not-allowed",
          boxShadow: total > 0 ? "0 4px 14px rgba(245,182,0,0.3)" : "none",
          transition: "all 180ms ease",
        }}>
          Próximo <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
