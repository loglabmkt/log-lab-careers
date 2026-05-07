import React, { useState, useRef, useEffect, useCallback } from "react";
import { Heart, Target, GraduationCap, Coffee, ChevronLeft, ChevronRight, X } from "lucide-react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GALLERY — Substitua as URLs aqui
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const galleryImages = [
  { id: 1, url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80", titulo: "Time em ação" },
  { id: 2, url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80", titulo: "Reunião colaborativa" },
  { id: 3, url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80", titulo: "Workshop de inovação" },
  { id: 4, url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80", titulo: "Brainstorm" },
  { id: 5, url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80", titulo: "Confraternização" },
  { id: 6, url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80", titulo: "Espaço de trabalho" },
  { id: 7, url: "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=800&q=80", titulo: "Cerimônia ágil" },
  { id: 8, url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80", titulo: "Celebração de conquistas" },
];

const CARDS = [
  {
    icon: Heart,
    titulo: "Conexões reais",
    texto: "Time unido que vibra junto nas vitórias e se apoia nos desafios",
  },
  {
    icon: Target,
    titulo: "Propósito que move",
    texto: "Cada projeto entregue impacta empresas e transforma realidades",
  },
  {
    icon: GraduationCap,
    titulo: "Mentoria de verdade",
    texto: "Aprendizado contínuo com profissionais experientes que querem te ver crescer",
  },
  {
    icon: Coffee,
    titulo: "Vida em equilíbrio",
    texto: "Flexibilidade real para trabalhar bem e viver melhor",
  },
];

// ── Feature Card ──
function FeatureCard({ card, index }) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const Icon = card.icon;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: `1px solid ${hovered ? "rgba(245,184,0,0.5)" : "rgba(255,255,255,0.4)"}`,
        borderRadius: "20px",
        padding: "28px",
        boxShadow: hovered ? "0 20px 60px rgba(245,184,0,0.18)" : "0 8px 32px rgba(0,0,0,0.08)",
        transform: visible
          ? hovered ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)"
          : "translateY(30px) scale(1)",
        opacity: visible ? 1 : 0,
        transition: `opacity 500ms ease ${index * 100}ms, transform ${hovered ? "400ms cubic-bezier(0.34, 1.56, 0.64, 1)" : `500ms ease ${index * 100}ms`}, box-shadow 400ms ease, border-color 400ms ease`,
      }}
    >
      <div
        style={{
          width: "48px", height: "48px", borderRadius: "12px",
          background: "rgba(245,184,0,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "16px",
          transition: "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: hovered ? "rotate(0deg) scale(1.15)" : "rotate(-8deg) scale(1)",
        }}
      >
        <Icon size={24} color="#F5B800" />
      </div>
      <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "17px", color: "#0A0A0A", marginBottom: "8px" }}>
        {card.titulo}
      </div>
      <div style={{ fontFamily: "var(--font-inter)", fontWeight: 400, fontSize: "13px", color: "#555555", lineHeight: "1.6" }}>
        {card.texto}
      </div>
    </div>
  );
}

// ── Gallery Item ──
function GalleryItem({ image, isMobile, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onClick(image)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: isMobile ? "80%" : "calc((100% - 40px) / 3)",
        flexShrink: 0,
        aspectRatio: "16/10",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        scrollSnapAlign: "start",
      }}
    >
      <img
        src={image.url}
        alt={image.titulo}
        loading="lazy"
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          transition: "transform 600ms ease",
          transform: hovered ? "scale(1.08)" : "scale(1)",
          display: "block",
        }}
      />
      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 300ms ease",
        }}
      />
      <div
        style={{
          position: "absolute", bottom: "16px", left: "16px",
          color: "#FFFFFF", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "14px",
          transform: hovered ? "translateY(0)" : "translateY(10px)",
          opacity: hovered ? 1 : 0,
          transition: "all 300ms ease",
        }}
      >
        {image.titulo}
      </div>
    </div>
  );
}

// ── Lightbox ──
function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => setCurrent((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, onClose]);

  const image = images[current];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "lbFadeIn 200ms ease",
      }}
    >
      <style>{`@keyframes lbFadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

      {/* Counter */}
      <div style={{ position: "absolute", top: "24px", left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-inter)", fontSize: "13px" }}>
        {current + 1} / {images.length}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: "20px", right: "20px",
          width: "44px", height: "44px", borderRadius: "50%",
          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
          color: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 200ms ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#F5B800"; e.currentTarget.style.color = "#0A0A0A"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#FFFFFF"; }}
      >
        <X size={20} />
      </button>

      {/* Prev arrow */}
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        style={{
          position: "absolute", left: "24px",
          width: "52px", height: "52px", borderRadius: "50%",
          ...(window.innerWidth < 768 ? { bottom: "20px", top: "auto", left: "calc(50% - 60px)" } : {}),
          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
          color: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 200ms ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#F5B800"; e.currentTarget.style.color = "#0A0A0A"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#FFFFFF"; }}
      >
        <ChevronLeft size={24} />
      </button>

      {/* Image */}
      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img
          src={image.url}
          alt={image.titulo}
          style={{
            maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain",
            borderRadius: "16px",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
            animation: "lbFadeIn 200ms ease",
          }}
        />
        <div style={{ color: "#FFFFFF", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "18px", textAlign: "center", marginTop: "20px" }}>
          {image.titulo}
        </div>
      </div>

      {/* Next arrow */}
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        style={{
          position: "absolute", right: "24px",
          width: "52px", height: "52px", borderRadius: "50%",
          ...(window.innerWidth < 768 ? { bottom: "20px", top: "auto", right: "calc(50% - 60px)" } : {}),
          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
          color: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 200ms ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#F5B800"; e.currentTarget.style.color = "#0A0A0A"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#FFFFFF"; }}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}

// ── Main Component ──
export default function LoggerSection() {
  const scrollRef = useRef(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [lightbox, setLightbox] = useState(null); // null | index

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const itemsVisible = isMobile ? 1 : 3;
  const totalPages = Math.ceil(galleryImages.length / itemsVisible);
  const currentPage = Math.round(scrollPos / (scrollRef.current?.clientWidth || 1));

  const scrollTo = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth;
    el.scrollBy({ left: direction === "next" ? amount : -amount, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (scrollRef.current) setScrollPos(scrollRef.current.scrollLeft);
  };

  const atStart = scrollPos <= 10;
  const atEnd = scrollRef.current
    ? scrollPos >= scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10
    : false;

  return (
    <>
      <style>{`
        .logger-carousel::-webkit-scrollbar { height: 4px; }
        .logger-carousel::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 4px; }
        .logger-carousel::-webkit-scrollbar-thumb { background: #F5B800; border-radius: 4px; }
        @media (max-width: 767px) {
          .logger-section { padding: 60px 0 !important; }
          .logger-container { padding: 0 20px !important; }
          .logger-headline { font-size: 30px !important; line-height: 1.2 !important; margin-bottom: 12px !important; }
          .logger-subtitle { font-size: 14px !important; line-height: 1.6 !important; margin-bottom: 40px !important; }
          .logger-badge { font-size: 12px !important; }
          .logger-card { padding: 20px !important; }
          .logger-carousel-arrow { display: none !important; }
          .logger-dot { min-height: 24px; min-width: 24px; display: flex; align-items: center; justify-content: center; }
        }
      `}</style>

      <section
        className="logger-section"
        style={{
          width: "100%", minHeight: "100vh",
          background: "linear-gradient(135deg, #fafafa 0%, #fff8e7 50%, #fafafa 100%)",
          position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "100px 0",
        }}
      >
        {/* Blobs */}
        <div className="blob-float" style={{
          position: "absolute", top: "-80px", left: "-80px",
          width: "500px", height: "500px",
          background: "radial-gradient(circle, rgba(245,184,0,0.08) 0%, transparent 70%)",
          filter: "blur(80px)", pointerEvents: "none", zIndex: 0,
        }} />
        <div className="blob-float" style={{
          position: "absolute", bottom: "-80px", right: "-80px",
          width: "400px", height: "400px",
          background: "radial-gradient(circle, rgba(245,184,0,0.05) 0%, transparent 70%)",
          filter: "blur(70px)", pointerEvents: "none", zIndex: 0,
          animationDuration: "15s", animationDirection: "reverse",
        }} />

        <div className="logger-container" style={{ maxWidth: "1280px", width: "100%", margin: "0 auto", padding: "0 48px", position: "relative", zIndex: 1 }}>

          {/* ── Header ── */}
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <div className="logger-badge" style={{
              display: "inline-block",
              background: "rgba(245,184,0,0.1)", border: "1px solid rgba(245,184,0,0.4)",
              color: "#F5B800", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px",
              borderRadius: "20px", padding: "6px 16px", marginBottom: "16px",
            }}>
              ✦ A Vida na Log
            </div>

            <h2 className="logger-headline" style={{
              fontFamily: "var(--font-inter)", fontWeight: 700,
              fontSize: isMobile ? "30px" : "48px",
              lineHeight: "1.1", color: "#0A0A0A",
              margin: "0 0 16px",
            }}>
              Por que ser{" "}
              <span style={{ color: "#F5B800" }}>um logger</span>
              {" "}é incrível
            </h2>

            <p className="logger-subtitle" style={{
              fontFamily: "var(--font-inter)", fontWeight: 400, fontSize: "17px",
              color: "#555555", lineHeight: "1.6",
              maxWidth: "600px", margin: "0 auto",
            }}>
              Mais do que um time, somos uma família de profissionais apaixonados
              por construir tecnologia com propósito.
            </p>
          </div>

          {/* ── Cards Grid ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            gap: "20px",
            marginBottom: "80px",
            ...(isMobile ? {} : { gridTemplateColumns: "repeat(4, 1fr)" }),
          }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {CARDS.map((card, i) => (
              <FeatureCard key={card.titulo} card={card} index={i} />
            ))}
          </div>

          {/* ── Carousel ── */}
          <div style={{ position: "relative" }}>

            {/* Prev button */}
            <button
              onClick={() => scrollTo("prev")}
              disabled={atStart}
              className="logger-carousel-arrow"
              style={{
                position: "absolute", left: "-24px", top: "50%", transform: "translateY(-50%)",
                width: "48px", height: "48px", borderRadius: "50%", zIndex: 2,
                background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                cursor: atStart ? "default" : "pointer",
                opacity: atStart ? 0.4 : 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 200ms ease",
              }}
              onMouseEnter={(e) => { if (!atStart) { e.currentTarget.style.background = "#F5B800"; e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.95)"; e.currentTarget.style.transform = "translateY(-50%) scale(1)"; }}
            >
              <ChevronLeft size={20} color="#0A0A0A" />
            </button>

            {/* Scrollable track */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="logger-carousel"
              style={{
                display: "flex", gap: "20px",
                overflowX: "auto", scrollBehavior: "smooth",
                scrollSnapType: "x mandatory",
              }}
            >
              {galleryImages.map((img, i) => (
                <GalleryItem
                  key={img.id}
                  image={img}
                  isMobile={isMobile}
                  onClick={() => setLightbox(i)}
                />
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={() => scrollTo("next")}
              disabled={atEnd}
              className="logger-carousel-arrow"
              style={{
                position: "absolute", right: "-24px", top: "50%", transform: "translateY(-50%)",
                width: "48px", height: "48px", borderRadius: "50%", zIndex: 2,
                background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                cursor: atEnd ? "default" : "pointer",
                opacity: atEnd ? 0.4 : 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 200ms ease",
              }}
              onMouseEnter={(e) => { if (!atEnd) { e.currentTarget.style.background = "#F5B800"; e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.95)"; e.currentTarget.style.transform = "translateY(-50%) scale(1)"; }}
            >
              <ChevronRight size={20} color="#0A0A0A" />
            </button>
          </div>

          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                onClick={() => {
                  if (scrollRef.current) {
                    scrollRef.current.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: "smooth" });
                  }
                }}
                style={{
                  height: "8px",
                  width: i === currentPage ? "24px" : "8px",
                  borderRadius: "4px",
                  background: i === currentPage ? "#F5B800" : "rgba(0,0,0,0.15)",
                  transition: "all 300ms ease",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox
          images={galleryImages}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}