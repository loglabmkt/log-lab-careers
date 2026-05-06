import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Conheça a Log", id: "inicio" },
  { label: "Cultura", id: "cultura" },
  { label: "Log Blog", id: null },
  { label: "Institucional", id: null },
  { label: "Faça Parte", id: "vagas" },

  { label: "Eventos", id: null },
];

const SECTION_IDS = NAV_LINKS.filter((l) => l.id).map((l) => l.id);

function NavLink({ label, id, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isHighlighted = active || hovered;

  return (
    <a
      href={id ? `#${id}` : "#"}
      onClick={(e) => { e.preventDefault(); if (id) onClick(id); }}
      className="relative font-inter font-semibold text-sm flex items-center justify-center"
      style={{
        color: isHighlighted ? "#F5B800" : "#0A0A0A",
        padding: "6px 14px",
        transition: "color 220ms ease-out",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.span
        aria-hidden
        initial={false}
        animate={isHighlighted ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        style={{
          position: "absolute",
          inset: 0,
          border: "2px solid #F5B800",
          borderRadius: "50px",
          pointerEvents: "none",
        }}
      />
      {label}
    </a>
  );
}

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // IntersectionObserver — threshold 0.5 for accurate active detection
  useEffect(() => {
    const timeout = setTimeout(() => {
      const observers = [];
      SECTION_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const obs = new IntersectionObserver(
          ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
          { threshold: 0.5 }
        );
        obs.observe(el);
        observers.push(obs);
      });
      return () => observers.forEach((o) => o.disconnect());
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setDrawerOpen(false);
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-50 flex items-center"
        style={{
          height: "72px",
          backgroundColor: scrolled ? "rgba(255,255,255,0.80)" : "#FFFFFF",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.08)" : "0 2px 16px rgba(0,0,0,0.08)",
          transition: "all 300ms ease",
        }}
      >
        <div
          className="w-full flex items-center justify-between"
          style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 64px" }}
        >
          {/* Logo image */}
          <img
            src="https://media.base44.com/images/public/69fa5b5b0d141e515c1300c5/20903d9b8_fb3797ffe_logotipo_loglab1.png"
            alt="Log Lab"
            style={{ height: "44px", width: "auto", cursor: "pointer" }}
            onClick={(e) => handleNavClick(e, "inicio")}
          />

          {/* Desktop: links + CTA */}
          <div className="hidden md:flex items-center">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                label={link.label}
                id={link.id}
                active={link.id === activeSection}
                onClick={(id) => {
                  const el = document.getElementById(id);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            ))}
            <a
              href="#vagas"
              onClick={(e) => handleNavClick(e, "vagas")}
              className="font-inter font-semibold text-sm"
              style={{
                backgroundColor: "#F5B800",
                color: "#0A0A0A",
                borderRadius: "8px",
                padding: "10px 22px",
                marginLeft: "24px",
                textDecoration: "none",
                display: "inline-block",
                transition: "background-color 250ms, color 250ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0A0A0A"; e.currentTarget.style.color = "#F5B800"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F5B800"; e.currentTarget.style.color = "#0A0A0A"; }}
            >
              Ver todas as vagas
            </a>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-[#0A0A0A]" onClick={() => setDrawerOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-72 z-50 p-8 flex flex-col bg-white"
            >
              <button className="self-end mb-8 text-[#0A0A0A]" onClick={() => setDrawerOpen(false)}>
                <X size={28} />
              </button>
              <div className="flex flex-col gap-6">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.id ? `#${link.id}` : "#"}
                    className="font-inter font-semibold text-lg text-[#0A0A0A]"
                    onClick={(e) => { if (link.id) { handleNavClick(e, link.id); } else setDrawerOpen(false); }}
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="#vagas"
                  onClick={(e) => handleNavClick(e, "vagas")}
                  className="font-inter font-semibold text-base text-center rounded-lg"
                  style={{ backgroundColor: "#F5B800", color: "#0A0A0A", padding: "12px 22px", marginTop: "16px", textDecoration: "none", display: "block" }}
                >
                  Ver todas as vagas
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}