import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Award, Zap, Heart, TrendingUp } from "lucide-react";
import useTypewriter from "@/hooks/useTypewriter";

const CARDS = [
  { icon: Award, title: "GPTW Certificado", text: "Reconhecidos como um excelente lugar para trabalhar" },
  { icon: Zap, title: "Inovação constante", text: "Tecnologia de ponta com certificação CMMI Nível 5" },
  { icon: Heart, title: "Cultura que acolhe", text: "Ambiente colaborativo onde cada pessoa é valorizada" },
  { icon: TrendingUp, title: "Crescimento real", text: "Cresça profissionalmente com aprendizado no dia a dia" },
];

const STATS = [
  { value: 200, prefix: "+", suffix: "", label: "Loggers" },
  { value: null, display: "CMMI 5", label: "Certificação" },
  { value: null, display: "GPTW", label: "Certificado" },
];

function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function AnimatedCount({ value, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);
  return (
    <span ref={ref} className="cultura-stat-num font-inter font-bold" style={{ fontSize: "40px", color: "#F5B800" }}>
      {prefix}{count}{suffix}
    </span>
  );
}

function StaticStat({ display }) {
  return <span className="cultura-stat-num font-inter font-bold" style={{ fontSize: "40px", color: "#F5B800" }}>{display}</span>;
}

function DifferentialCard({ icon: Icon, title, text, delay }) {
  const [hovered, setHovered] = useState(false);
  const [iconHovered, setIconHovered] = useState(false);
  const [ref, inView] = useInView(0.1);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      onMouseEnter={() => { setHovered(true); setIconHovered(true); }}
      onMouseLeave={() => { setHovered(false); setIconHovered(false); }}
      className="cultura-card"
      style={{
        background: hovered ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.65)",
        backdropFilter: hovered ? "blur(30px) saturate(200%)" : "blur(20px) saturate(180%)",
        WebkitBackdropFilter: hovered ? "blur(30px) saturate(200%)" : "blur(20px) saturate(180%)",
        border: `1px solid ${hovered ? "rgba(245,184,0,0.5)" : "rgba(255,255,255,0.4)"}`,
        borderRadius: "20px",
        padding: "28px",
        boxShadow: hovered
          ? "0 20px 60px rgba(245,184,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)"
          : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
        transform: hovered ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        cursor: "default",
        minHeight: "180px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      <div
        className="cultura-card-icon"
        style={{
          width: "48px",
          height: "48px",
          backgroundColor: "rgba(245,184,0,0.1)",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
          transform: iconHovered ? "rotate(-8deg) scale(1.15)" : "rotate(0deg) scale(1)",
          transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <Icon size={24} color="#F5B800" />
      </div>
      <p className="cultura-card-title font-inter font-bold" style={{ fontSize: "18px", color: "#0A0A0A", marginBottom: "8px" }}>
        {title}
      </p>
      <p className="cultura-card-text font-inter" style={{ fontSize: "14px", color: "#777777", lineHeight: "1.6" }}>
        {text}
      </p>
    </motion.div>
  );
}

function CulturaHeadline() {
  const [ref, inView] = useInView(0.3);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setStarted(true), 500);
      return () => clearTimeout(t);
    }
  }, [inView]);

  const typed = useTypewriter(started ? ["logger."] : [""], 60, 3000, 30);

  return (
    <h2 ref={ref} className="cultura-headline font-inter font-bold" style={{ fontSize: "44px", lineHeight: "1.15", color: "#0A0A0A", marginBottom: "20px" }}>
      Encontre seu lugar,<br />
      seja um{" "}
      <span style={{ color: "#F5B800" }}>
        {typed}
        {started && <span className="cursor-blink">|</span>}
      </span>
    </h2>
  );
}

export default function CulturaSection() {
  const [leftRef, leftInView] = useInView(0.2);

  return (
    <section
      style={{
        width: "100%",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "linear-gradient(135deg, #faf8f2 0%, #fff8e7 50%, #faf8f2 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @media (max-width: 767px) {
          .cultura-container { padding: 60px 20px !important; }
          .cultura-badge { font-size: 12px !important; }
          .cultura-headline { font-size: 32px !important; line-height: 1.2 !important; margin-bottom: 16px !important; word-wrap: break-word; overflow-wrap: break-word; hyphens: none; }
          .cultura-body { font-size: 14px !important; line-height: 1.7 !important; margin-bottom: 32px !important; max-width: 100% !important; }
          .cultura-stat-num { font-size: 28px !important; }
          .cultura-stat-label { font-size: 10px !important; }
          .cultura-stat-item { padding-left: 16px !important; padding-right: 16px !important; }
          .cultura-stat-item:first-child { padding-left: 0 !important; }
          .cultura-cards-col { margin-top: 40px !important; }
          .cultura-card { padding: 20px !important; border-radius: 16px !important; min-height: unset !important; }
          .cultura-card-icon { width: 40px !important; height: 40px !important; border-radius: 10px !important; margin-bottom: 12px !important; }
          .cultura-card-title { font-size: 15px !important; }
          .cultura-card-text { font-size: 13px !important; }
        }
      `}</style>
      {/* Decorative top line */}
      <div style={{ height: "4px", background: "linear-gradient(90deg, #F5B800 0%, transparent 100%)", width: "80px", position: "absolute", top: 0, left: "48px" }} />

      {/* Blob 1 — top left */}
      <div
        className="blob-float"
        style={{
          position: "absolute", top: "-100px", left: "-100px",
          width: "400px", height: "400px",
          background: "radial-gradient(circle, rgba(245,184,0,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none", zIndex: 0,
        }}
      />

      {/* Blob 2 — bottom right */}
      <div
        className="blob-float"
        style={{
          position: "absolute", bottom: "-60px", right: "-60px",
          width: "300px", height: "300px",
          background: "radial-gradient(circle, rgba(0,0,0,0.04) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none", zIndex: 0,
          animationDelay: "3s",
        }}
      />

      {/* Old decorative circle kept as additional layer */}
      <div
        style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "300px", height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #F5B800, transparent)",
          opacity: 0.07, pointerEvents: "none", zIndex: 0,
        }}
      />

      {/* Container */}
      <div className="cultura-container" style={{ maxWidth: "1280px", width: "100%", margin: "0 auto", padding: "60px 48px", position: "relative", zIndex: 1 }}>
        <div className="flex flex-col md:flex-row gap-20 items-center">

          {/* LEFT COLUMN */}
          <motion.div
            ref={leftRef}
            initial={{ opacity: 0, x: -40 }}
            animate={leftInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            style={{ flex: "0 0 45%" }}
          >
            <div
              className="cultura-badge inline-block font-inter font-semibold"
              style={{ fontSize: "13px", color: "#F5B800", border: "1px solid #F5B800", backgroundColor: "rgba(245,184,0,0.08)", borderRadius: "20px", padding: "6px 16px", marginBottom: "16px" }}
            >
              Nossa Cultura
            </div>

            <CulturaHeadline />

            <p className="cultura-body font-inter" style={{ fontSize: "17px", color: "#555555", lineHeight: "1.7", maxWidth: "420px", marginBottom: "48px" }}>
              Aqui na Log Lab, mais de 200 pessoas fazem parte de nossos diversos times e especialidades. Cada conhecimento e cada forma de diversidade se complementam, criando um ambiente onde você pode trabalhar no que mais ama.
            </p>

            {/* Stats */}
            <div className="flex items-center flex-wrap gap-y-4">
              {STATS.map((stat, i) => (
                <React.Fragment key={stat.label}>
                  <div className="cultura-stat-item" style={{ paddingLeft: i === 0 ? 0 : "24px", paddingRight: "24px" }}>
                    <div>
                      {stat.value !== null
                        ? <AnimatedCount value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                        : <StaticStat display={stat.display} />
                      }
                    </div>
                    <p className="cultura-stat-label font-inter" style={{ fontSize: "13px", color: "#888888", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>
                      {stat.label}
                    </p>
                  </div>
                  {i < STATS.length - 1 && <div style={{ width: "1px", height: "48px", backgroundColor: "#E5E5E5" }} />}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* RIGHT COLUMN — 2x2 grid */}
          <div className="cultura-cards-col" style={{ flex: "0 0 55%", alignSelf: "stretch", display: "flex", alignItems: "center" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
            {CARDS.map((card, i) => (
              <DifferentialCard key={card.title} icon={card.icon} title={card.title} text={card.text} delay={i * 100} />
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}