import React, { useState, useEffect, useCallback } from "react";
import { Search, Download, Check, X, Eye, Trash2, Pencil } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import TalentoDrawer from "@/components/admin/TalentoDrawer";
import EditTalentoModal from "@/components/admin/EditTalentoModal";

const STATUS_OPTS = [
  { value: "", label: "Todos os status" },
  { value: "novo", label: "Novo" },
  { value: "em_contato", label: "Em contato" },
  { value: "entrevista_agendada", label: "Entrevista agendada" },
  { value: "aprovado", label: "Aprovado" },
  { value: "descartado", label: "Descartado" },
];

const STATUS_STYLE = {
  novo: { bg: "rgba(59,130,246,0.12)", color: "#2563eb" },
  em_contato: { bg: "rgba(245,184,0,0.12)", color: "#b8860b" },
  entrevista_agendada: { bg: "rgba(139,92,246,0.12)", color: "#7c3aed" },
  aprovado: { bg: "rgba(34,197,94,0.12)", color: "#15803d" },
  descartado: { bg: "rgba(239,68,68,0.12)", color: "#dc2626" },
};

const inputStyle = {
  background: "rgba(255,255,255,0.7)", border: "1px solid rgba(10,10,10,0.08)",
  borderRadius: "10px", padding: "9px 12px", color: "#0A0A0A",
  fontFamily: "var(--font-inter)", fontSize: "14px", outline: "none",
  transition: "border-color 180ms ease, box-shadow 180ms ease",
};

const focusInput = (e) => { e.currentTarget.style.borderColor = "#F5B800"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,182,0,0.15)"; };
const blurInput = (e) => { e.currentTarget.style.borderColor = "rgba(10,10,10,0.08)"; e.currentTarget.style.boxShadow = "none"; };

const fmtDate = (d) => d ? format(new Date(d), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-";
const fmtWA = (n = "") => {
  const d = n.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return n;
};

export default function TalentosPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [areas, setAreas] = useState([]);
  const [drawer, setDrawer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editTalento, setEditTalento] = useState(null);

  const load = useCallback(async (pg = 1) => {
    setLoading(true);
    const res = await base44.functions.invoke("getTalentos", { page: pg, limit: 20, search, status: statusFilter, area: areaFilter });
    const data = res.data;
    setItems(data.items || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setPage(pg);
    setLoading(false);
  }, [search, statusFilter, areaFilter]);

  useEffect(() => { load(1); }, [load]);

  // Carregar áreas únicas
  useEffect(() => {
    base44.functions.invoke("getTalentos", { page: 1, limit: 1000 }).then(res => {
      const all = res.data?.items || [];
      const unique = [...new Set(all.map(t => t.areaInteresse).filter(Boolean))].sort();
      setAreas(unique);
    });
  }, []);

  const handleStatusChange = async (id, status) => {
    setItems(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    await base44.functions.invoke("updateTalentoStatus", { id, status });
  };

  const handleDelete = async (id) => {
    await base44.functions.invoke("deleteTalento", { id });
    setDeleteConfirm(null);
    load(page);
  };

  const handleExportCSV = () => {
    const header = ["Nome", "WhatsApp", "Email", "Área", "Data", "Status", "AceitaWhatsapp"];
    const rows = items.map(t => [
      t.nome, fmtWA(t.whatsapp), t.email || "",
      t.areaInteresse,
      fmtDate(t.dataCandidatura || t.created_date),
      t.status, t.aceitaWhatsapp ? "Sim" : "Não",
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${v ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `talentos-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "24px", color: "#0A0A0A", margin: 0 }}>Talentos</h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.55)", margin: "4px 0 0" }}>Gestão de candidatos do banco de talentos</p>
        </div>
        {!loading && (
          <div style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)", border: "1px solid rgba(10,10,10,0.06)", color: "#0A0A0A", borderRadius: "20px", padding: "6px 14px", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px", boxShadow: "0 8px 32px rgba(10,10,10,0.06)" }}>
            {total} cadastro{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      <div style={{ height: "1px", background: "rgba(10,10,10,0.05)", marginBottom: "24px" }} />

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "rgba(10,10,10,0.35)" }} />
          <input
            placeholder="Buscar por nome ou WhatsApp..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={focusInput}
            onBlur={blurInput}
            style={{ ...inputStyle, paddingLeft: "34px", width: "300px" }}
          />
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} onFocus={focusInput} onBlur={blurInput} style={{ ...inputStyle, cursor: "pointer" }}>
          {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)} onFocus={focusInput} onBlur={blurInput} style={{ ...inputStyle, cursor: "pointer" }}>
          <option value="">Todas as áreas</option>
          {areas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <button onClick={handleExportCSV} style={{
          ...inputStyle, cursor: "pointer", border: "1px solid rgba(10,10,10,0.08)",
          background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)",
          fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px",
          display: "flex", alignItems: "center", gap: "6px", transition: "all 180ms ease",
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(10,10,10,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Tabela */}
      <div style={{
        background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)",
        border: "1px solid rgba(10,10,10,0.06)", borderRadius: "16px", overflowX: "auto",
        boxShadow: "0 8px 32px rgba(10,10,10,0.06)",
      }}>
        <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Nome", "WhatsApp", "E-mail", "Área", "Data", "Status", "WA", "Ações"].map(h => (
                <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontFamily: "var(--font-inter)", fontSize: "11px", fontWeight: 600, color: "rgba(10,10,10,0.45)", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid rgba(10,10,10,0.05)", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "rgba(10,10,10,0.45)", fontFamily: "var(--font-inter)" }}>Carregando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "rgba(10,10,10,0.45)", fontFamily: "var(--font-inter)" }}>Nenhum talento encontrado.</td></tr>
            ) : items.map(t => (
              <tr
                key={t.id}
                style={{ borderBottom: "1px solid rgba(10,10,10,0.05)", transition: "background 180ms ease" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(245,182,0,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* Nome */}
                <td style={{ padding: "0 16px", height: "56px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#F5B800", color: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
                      {(t.nome || "?")[0].toUpperCase()}
                    </div>
                    <span style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "14px", color: "#0A0A0A", whiteSpace: "nowrap" }}>{t.nome}</span>
                  </div>
                </td>

                {/* WhatsApp */}
                <td style={{ padding: "0 16px" }}>
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.65)" }}>{fmtWA(t.whatsapp)}</span>
                </td>

                {/* E-mail */}
                <td style={{ padding: "0 16px" }}>
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: t.email ? "rgba(10,10,10,0.65)" : "rgba(10,10,10,0.25)" }}>
                    {t.email || "—"}
                  </span>
                </td>

                {/* Área */}
                <td style={{ padding: "0 16px" }}>
                  <span style={{ background: "rgba(245,184,0,0.12)", color: "#b8860b", borderRadius: "20px", padding: "3px 10px", fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "12px", whiteSpace: "nowrap" }}>
                    {t.areaInteresse}
                  </span>
                </td>

                {/* Data */}
                <td style={{ padding: "0 16px" }}>
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.55)", whiteSpace: "nowrap" }}>
                    {fmtDate(t.dataCandidatura || t.created_date)}
                  </span>
                </td>

                {/* Status */}
                <td style={{ padding: "0 16px" }}>
                  <select
                    value={t.status || "novo"}
                    onChange={e => handleStatusChange(t.id, e.target.value)}
                    style={{
                      background: STATUS_STYLE[t.status]?.bg || STATUS_STYLE.novo.bg,
                      color: STATUS_STYLE[t.status]?.color || STATUS_STYLE.novo.color,
                      border: "none", borderRadius: "20px", padding: "4px 10px",
                      fontFamily: "var(--font-inter)", fontSize: "12px", fontWeight: 600,
                      cursor: "pointer", outline: "none",
                    }}
                  >
                    <option value="novo">Novo</option>
                    <option value="em_contato">Em contato</option>
                    <option value="entrevista_agendada">Entrevista agendada</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="descartado">Descartado</option>
                  </select>
                </td>

                {/* Aceita WA */}
                <td style={{ padding: "0 16px", textAlign: "center" }}>
                  {t.aceitaWhatsapp
                    ? <Check size={16} color="#15803d" />
                    : <X size={16} color="rgba(10,10,10,0.25)" />}
                </td>

                {/* Ações */}
                <td style={{ padding: "0 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button onClick={() => setDrawer(t)} title="Ver detalhes" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(10,10,10,0.45)", padding: "4px", transition: "color 180ms ease" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#0A0A0A"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(10,10,10,0.45)"}
                    >
                      <Eye size={16} />
                    </button>
                    <button onClick={() => setEditTalento(t)} title="Editar" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(10,10,10,0.45)", padding: "4px", transition: "color 180ms ease" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#F5B800"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(10,10,10,0.45)"}
                    >
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setDeleteConfirm(t.id)} title="Excluir" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(10,10,10,0.45)", padding: "4px", transition: "color 180ms ease" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#dc2626"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(10,10,10,0.45)"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {pages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
          <button disabled={page === 1} onClick={() => load(page - 1)} style={{ ...inputStyle, cursor: page === 1 ? "default" : "pointer", opacity: page === 1 ? 0.4 : 1, padding: "8px 14px", fontSize: "13px" }}>
            Anterior
          </button>
          <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.55)", padding: "0 8px" }}>
            {page} / {pages}
          </span>
          <button disabled={page === pages} onClick={() => load(page + 1)} style={{ ...inputStyle, cursor: page === pages ? "default" : "pointer", opacity: page === pages ? 0.4 : 1, padding: "8px 14px", fontSize: "13px" }}>
            Próxima
          </button>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.25)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)",
            border: "1px solid rgba(10,10,10,0.06)", borderRadius: "16px", padding: "28px", width: "360px",
            boxShadow: "0 8px 32px rgba(10,10,10,0.12)",
          }}>
            <h3 style={{ fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "17px", color: "#0A0A0A", marginBottom: "8px" }}>Excluir talento?</h3>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.55)", marginBottom: "24px" }}>Esta ação não pode ser desfeita.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(10,10,10,0.08)", borderRadius: "10px", color: "#0A0A0A", fontFamily: "var(--font-inter)", fontWeight: 500, cursor: "pointer", transition: "all 180ms ease" }}>Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: "10px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", color: "#dc2626", fontFamily: "var(--font-inter)", fontWeight: 600, cursor: "pointer", transition: "all 180ms ease" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTalento && (
        <EditTalentoModal
          talento={editTalento}
          onClose={() => setEditTalento(null)}
          onSaved={updated => {
            setItems(prev => prev.map(t => t.id === updated.id ? updated : t));
            setEditTalento(null);
          }}
        />
      )}

      {/* Drawer */}
      {drawer && (
        <TalentoDrawer
          talento={drawer}
          onClose={() => setDrawer(null)}
          onUpdate={updated => setItems(prev => prev.map(t => t.id === updated.id ? updated : t))}
        />
      )}
    </div>
  );
}