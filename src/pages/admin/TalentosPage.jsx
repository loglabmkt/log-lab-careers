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
  novo: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
  em_contato: { bg: "rgba(245,184,0,0.15)", color: "#F5B800" },
  entrevista_agendada: { bg: "rgba(139,92,246,0.15)", color: "#a78bfa" },
  aprovado: { bg: "rgba(34,197,94,0.15)", color: "#4ade80" },
  descartado: { bg: "rgba(239,68,68,0.15)", color: "#f87171" },
};

const inputStyle = {
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px", padding: "9px 12px", color: "#FFFFFF",
  fontFamily: "var(--font-inter)", fontSize: "14px", outline: "none",
};

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
          <h1 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "24px", color: "#FFFFFF", margin: 0 }}>Talentos</h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>Gestão de candidatos do banco de talentos</p>
        </div>
        {!loading && (
          <div style={{ background: "rgba(245,184,0,0.15)", color: "#F5B800", borderRadius: "20px", padding: "6px 14px", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px" }}>
            {total} cadastro{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "24px" }} />

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
          <input
            placeholder="Buscar por nome ou WhatsApp..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: "34px", width: "300px" }}
          />
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
          {STATUS_OPTS.map(o => <option key={o.value} value={o.value} style={{ background: "#1a1a1a" }}>{o.label}</option>)}
        </select>

        <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
          <option value="" style={{ background: "#1a1a1a" }}>Todas as áreas</option>
          {areas.map(a => <option key={a} value={a} style={{ background: "#1a1a1a" }}>{a}</option>)}
        </select>

        <button onClick={handleExportCSV} style={{
          ...inputStyle, cursor: "pointer", border: "1px solid rgba(255,255,255,0.15)",
          fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px",
          display: "flex", alignItems: "center", gap: "6px",
        }}>
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Tabela */}
      <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)" }}>
              {["Nome", "WhatsApp", "E-mail", "Área", "Data", "Status", "WA", "Ações"].map(h => (
                <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontFamily: "var(--font-inter)", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-inter)" }}>Carregando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-inter)" }}>Nenhum talento encontrado.</td></tr>
            ) : items.map(t => (
              <tr
                key={t.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 150ms" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* Nome */}
                <td style={{ padding: "0 16px", height: "56px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#F5B800", color: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
                      {(t.nome || "?")[0].toUpperCase()}
                    </div>
                    <span style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "14px", color: "#FFFFFF", whiteSpace: "nowrap" }}>{t.nome}</span>
                  </div>
                </td>

                {/* WhatsApp */}
                <td style={{ padding: "0 16px" }}>
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>{fmtWA(t.whatsapp)}</span>
                </td>

                {/* E-mail */}
                <td style={{ padding: "0 16px" }}>
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: t.email ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.2)" }}>
                    {t.email || "—"}
                  </span>
                </td>

                {/* Área */}
                <td style={{ padding: "0 16px" }}>
                  <span style={{ background: "rgba(245,184,0,0.1)", color: "#F5B800", borderRadius: "20px", padding: "3px 10px", fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "12px", whiteSpace: "nowrap" }}>
                    {t.areaInteresse}
                  </span>
                </td>

                {/* Data */}
                <td style={{ padding: "0 16px" }}>
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>
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
                      fontFamily: "var(--font-inter)", fontSize: "12px", fontWeight: 500,
                      cursor: "pointer", outline: "none",
                    }}
                  >
                    <option value="novo" style={{ background: "#1a1a1a", color: "#fff" }}>Novo</option>
                    <option value="em_contato" style={{ background: "#1a1a1a", color: "#fff" }}>Em contato</option>
                    <option value="entrevista_agendada" style={{ background: "#1a1a1a", color: "#fff" }}>Entrevista agendada</option>
                    <option value="aprovado" style={{ background: "#1a1a1a", color: "#fff" }}>Aprovado</option>
                    <option value="descartado" style={{ background: "#1a1a1a", color: "#fff" }}>Descartado</option>
                  </select>
                </td>

                {/* Aceita WA */}
                <td style={{ padding: "0 16px", textAlign: "center" }}>
                  {t.aceitaWhatsapp
                    ? <Check size={16} color="#4ade80" />
                    : <X size={16} color="rgba(255,255,255,0.25)" />}
                </td>

                {/* Ações */}
                <td style={{ padding: "0 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button onClick={() => setDrawer(t)} title="Ver detalhes" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "4px" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#FFFFFF"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
                    >
                      <Eye size={16} />
                    </button>
                    <button onClick={() => setEditTalento(t)} title="Editar" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "4px" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#F5B800"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
                    >
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setDeleteConfirm(t.id)} title="Excluir" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "4px" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
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
          <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(255,255,255,0.5)", padding: "0 8px" }}>
            {page} / {pages}
          </span>
          <button disabled={page === pages} onClick={() => load(page + 1)} style={{ ...inputStyle, cursor: page === pages ? "default" : "pointer", opacity: page === pages ? 0.4 : 1, padding: "8px 14px", fontSize: "13px" }}>
            Próxima
          </button>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "28px", width: "360px" }}>
            <h3 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "17px", color: "#FFFFFF", marginBottom: "8px" }}>Excluir talento?</h3>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "24px" }}>Esta ação não pode ser desfeita.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#FFFFFF", fontFamily: "var(--font-inter)", cursor: "pointer" }}>Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: "10px", background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "8px", color: "#f87171", fontFamily: "var(--font-inter)", fontWeight: 600, cursor: "pointer" }}>Excluir</button>
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