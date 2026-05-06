import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Briefcase, AlertCircle, Search, Loader2 } from "lucide-react";
import { useInHireJobs } from "@/hooks/useInHireJobs";

const AREAS = ["Todas", "Tecnologia", "Design", "Marketing", "Comercial", "Operações", "RH"];

const toSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const SENIORITY_MAP = {
  junior: "Júnior",
  "mid-level": "Pleno",
  senior: "Sênior",
  specialist: "Especialista",
  leadership: "Liderança",
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "Publicada hoje";
  if (diff === 1) return "Publicada há 1 dia";
  return `Publicada há ${diff} dias`;
}

function SkeletonCard() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "20px", padding: "28px", minHeight: "220px",
    }}>
      {[60, 180, 120, 90].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? "20px" : "14px", width: `${w}px`, maxWidth: "100%",
          borderRadius: "6px", marginBottom: "16px",
          background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)",
          backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
        }} />
      ))}
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

function JobCard({ job, index }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const seniority = SENIORITY_MAP[job.seniority] || job.seniority || "";

  const getModalidade = (job) => {
    if (job.workModel) return job.workModel;
    if (job.contractType?.includes('Remoto')) return 'Remoto';
    if (job.locationRequired === false) return 'Remoto';
    if (job.locationRequired === true) return 'Presencial';
    return 'A combinar';
  };

  const modalidade = getModalidade(job);
  const locationLabel = `${modalidade}${job.city ? ` · ${job.city}` : ''}`;



  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: (index % 9) * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(245,184,0,0.08)" : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: `1px solid ${hovered ? "rgba(245,184,0,0.4)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "20px", padding: "28px",
        transition: "all 350ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? "0 20px 60px rgba(245,184,0,0.12)" : "none",
        cursor: "pointer", position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}
    >
      {hovered && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, transparent, #F5B800, transparent)",
        }} />
      )}

      {(job.area || job.department) && (
        <div style={{
          display: "inline-block", background: "rgba(245,184,0,0.12)", color: "#F5B800",
          fontSize: "11px", fontWeight: 500, borderRadius: "12px", padding: "4px 10px",
          marginBottom: "16px", alignSelf: "flex-start", fontFamily: "var(--font-inter)",
        }}>
          {job.area || job.department}
        </div>
      )}

      <p className="font-inter font-bold" style={{
        fontSize: "18px", color: "#FFFFFF", lineHeight: "1.3", marginBottom: "12px",
        overflow: "hidden", display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical", textOverflow: "ellipsis",
      }}>
        {job.title || job.name}
      </p>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
        <span className="font-inter" style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: "5px" }}>
          <MapPin size={13} /> {locationLabel}
        </span>
        {seniority && (
          <span className="font-inter" style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: "5px" }}>
            <Briefcase size={13} /> {seniority}
          </span>
        )}
      </div>



      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "20px" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
        <span className="font-inter" style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
          {timeAgo(job.createdAt || job.created_at)}
        </span>
        <a
          href={`https://loglabdigital.inhire.app/vagas/${job.id}/${toSlug(job.title || job.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: hovered ? "#F5B800" : "transparent",
            border: "1px solid rgba(245,184,0,0.4)",
            color: hovered ? "#0A0A0A" : "#F5B800",
            fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px",
            borderRadius: "8px", padding: "8px 16px", cursor: "pointer",
            transition: "all 200ms ease", textDecoration: "none", display: "inline-block",
          }}
        >
          Ver vaga →
        </a>
      </div>
    </motion.div>
  );
}

export default function VagasSection() {
  const { jobs, loading, loadingMore, error, hasMore, loadMore, activeFilter, setFilter, totalJobs, retry } = useInHireJobs();

  return (
    <section id="vagas" style={{
      width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0A0A0A 0%, #1a1200 50%, #0A0A0A 100%)",
      position: "relative", overflow: "hidden", padding: "80px 0",
    }}>
      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(245,184,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,184,0,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Blobs */}
      <div className="blob-float" style={{
        position: "absolute", top: "-100px", right: "-100px", width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(245,184,0,0.06) 0%, transparent 70%)",
        filter: "blur(100px)", pointerEvents: "none", zIndex: 0,
      }} />
      <div className="blob-float" style={{
        position: "absolute", bottom: "-80px", left: "-80px", width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(245,184,0,0.04) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none", zIndex: 0,
        animationDuration: "14s", animationDirection: "reverse",
      }} />

      <div style={{ maxWidth: "1280px", width: "100%", margin: "0 auto", padding: "0 48px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
            <div className="inline-block font-inter font-semibold" style={{
              fontSize: "13px", color: "#F5B800",
              border: "1px solid rgba(245,184,0,0.3)", backgroundColor: "rgba(245,184,0,0.1)",
              borderRadius: "20px", padding: "6px 16px",
            }}>
              ✦ Oportunidades Abertas
            </div>
            {!loading && totalJobs > 0 && (
              <div className="font-inter" style={{
                fontSize: "12px", fontWeight: 500, color: "#0A0A0A",
                backgroundColor: "#F5B800", borderRadius: "20px", padding: "4px 12px",
              }}>
                · {totalJobs} vagas abertas
              </div>
            )}
          </div>

          <h2 className="font-inter font-bold" style={{ fontSize: "52px", color: "#FFFFFF", lineHeight: "1.1", marginBottom: "16px" }}>
            Sua próxima grande<br />
            oportunidade está{" "}
            <span style={{ color: "#F5B800" }}>aqui.</span>
          </h2>

          <p className="font-inter" style={{ fontSize: "18px", color: "rgba(255,255,255,0.6)", lineHeight: "1.7", maxWidth: "560px" }}>
            Encontre a vaga ideal e faça parte de um time que transforma o mercado com tecnologia e propósito.
          </p>
        </div>

        {/* Area filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "40px" }}>
          {AREAS.map((area) => (
            <button
              key={area}
              onClick={() => setFilter(area)}
              className="font-inter"
              style={{
                background: activeFilter === area ? "#F5B800" : "rgba(255,255,255,0.05)",
                border: `1px solid ${activeFilter === area ? "#F5B800" : "rgba(255,255,255,0.1)"}`,
                color: activeFilter === area ? "#0A0A0A" : "rgba(255,255,255,0.6)",
                fontWeight: activeFilter === area ? 600 : 500,
                fontSize: "13px", borderRadius: "20px", padding: "8px 20px",
                cursor: "pointer", transition: "all 200ms ease",
              }}
            >
              {area}
            </button>
          ))}
        </div>

        {/* States */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <AlertCircle size={48} color="#F5B800" style={{ margin: "0 auto 16px" }} />
            <p className="font-inter" style={{ color: "rgba(255,255,255,0.7)", fontSize: "18px", marginBottom: "24px" }}>
              {error}
            </p>
            <button
              onClick={retry}
              className="font-inter font-semibold"
              style={{
                background: "transparent", border: "1px solid rgba(245,184,0,0.4)",
                color: "#F5B800", fontSize: "14px", borderRadius: "10px",
                padding: "12px 28px", cursor: "pointer",
              }}
            >
              Tentar novamente
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Search size={48} color="#F5B800" style={{ margin: "0 auto 16px" }} />
            <p className="font-inter font-bold" style={{ color: "#FFFFFF", fontSize: "20px", marginBottom: "8px" }}>
              Nenhuma vaga aberta no momento.
            </p>
            <p className="font-inter" style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", marginBottom: "24px" }}>
              Cadastre-se no banco de talentos e seja avisado!
            </p>
            <a href="#inicio" className="font-inter font-semibold" style={{
              background: "#F5B800", color: "#0A0A0A", borderRadius: "10px",
              padding: "12px 28px", textDecoration: "none", display: "inline-block",
            }}>
              Ir para o banco de talentos
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job, i) => (
              <JobCard key={job.id || job._id || i} job={job} index={i} />
            ))}
          </div>
        )}

        {/* Load more */}
        {!loading && !error && hasMore && (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="font-inter font-semibold"
              style={{
                background: loadingMore ? "rgba(245,184,0,0.1)" : "transparent",
                border: "1px solid rgba(245,184,0,0.3)", color: "#F5B800",
                fontSize: "14px", borderRadius: "10px", padding: "14px 32px",
                cursor: loadingMore ? "default" : "pointer",
                display: "inline-flex", alignItems: "center", gap: "8px",
                transition: "background 200ms ease",
              }}
            >
              {loadingMore ? <><Loader2 size={16} className="animate-spin" /> Carregando...</> : "Carregar mais vagas"}
            </button>
          </div>
        )}

        {/* Footer CTA */}
        <div style={{ textAlign: "center", marginTop: "60px", padding: "40px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="font-inter" style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px", marginBottom: "12px" }}>
            Não encontrou sua vaga?<br />
            Cadastre-se no banco de talentos e avisaremos quando surgir algo para você.
          </p>
          <a href="#inicio" className="font-inter font-semibold" style={{ color: "#F5B800", fontSize: "14px", textDecoration: "underline" }}>
            Ir para o banco de talentos →
          </a>
        </div>
      </div>
    </section>
  );
}