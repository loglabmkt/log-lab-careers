import React from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { useInHireJobs } from "@/hooks/useInHireJobs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const toSlug = (name = "") =>
  name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");

const glassCard = {
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.65)",
  borderRadius: "18px", padding: "20px",
  boxShadow: "0 8px 32px rgba(10,10,10,0.06), inset 1px 1px 0 rgba(255,255,255,0.75), inset -1px -1px 1px rgba(10,10,10,0.03)",
  transition: "transform 200ms ease, box-shadow 200ms ease",
};

export default function VagasPage() {
  const { jobs, loading, error, totalJobs } = useInHireJobs();

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "24px", color: "#0A0A0A", margin: 0 }}>Vagas</h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.55)", margin: "4px 0 0" }}>Vagas abertas no InHire</p>
        </div>
        {!loading && (
          <div style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)", border: "1px solid rgba(255,255,255,0.65)", color: "#0A0A0A", borderRadius: "20px", padding: "6px 14px", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px", boxShadow: "0 8px 32px rgba(10,10,10,0.06)" }}>
            {totalJobs} vaga{totalJobs !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      <div style={{ height: "1px", background: "rgba(10,10,10,0.05)", marginBottom: "24px" }} />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <Loader2 size={28} color="#F5B600" className="animate-spin" />
        </div>
      ) : error ? (
        <p style={{ fontFamily: "var(--font-inter)", color: "rgba(10,10,10,0.5)", textAlign: "center", padding: "60px 0" }}>{error}</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {jobs.map(job => (
            <div
              key={job.id}
              style={glassCard}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(10,10,10,0.10), inset 1px 1px 0 rgba(255,255,255,0.75)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = glassCard.boxShadow; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ background: "rgba(34,197,94,0.12)", color: "#15803d", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontFamily: "var(--font-inter)", fontWeight: 600 }}>
                  Aberta
                </span>
                {job.category && (
                  <span style={{ background: "rgba(245,182,0,0.14)", color: "#8a6d00", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontFamily: "var(--font-inter)", fontWeight: 600 }}>
                    {job.category}
                  </span>
                )}
              </div>

              <h3 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "15px", color: "#0A0A0A", margin: "0 0 8px", lineHeight: "1.3" }}>
                {job.title || job.name}
              </h3>

              <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.5)", marginBottom: "16px" }}>
                {job.workModel || "A combinar"}{job.city ? ` · ${job.city}` : ""}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(10,10,10,0.35)" }}>
                  {job.createdAt ? format(new Date(job.createdAt), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                </span>
                <a
                  href={`https://loglabdigital.inhire.app/vagas/${job.id}/${toSlug(job.title || job.name)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px", color: "#8a6d00", textDecoration: "none", transition: "color 180ms ease" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#0A0A0A"}
                  onMouseLeave={e => e.currentTarget.style.color = "#8a6d00"}
                >
                  Ver no InHire <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
