import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  "Conheça a Log",
  "Cultura",
  "Log Blog",
  "Institucional",
  "Faça Parte",
  "Eventos",
];

function NavLink({ label }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="#"
      className="relative font-titillium font-semibold text-sm flex items-center justify-center"
      style={{
        color: hovered ? "#F5B800" : "#0A0A0A",
        padding: "6px 14px",
        transition: "color 220ms ease-out",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pill border overlay — animates on hover */}
      <motion.span
        aria-hidden
        initial={false}
        animate={
          hovered
            ? { scale: 1, opacity: 1 }
            : { scale: 0.7, opacity: 0 }
        }
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

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-50 h-16 flex items-center"
        style={{
          backgroundColor: "#FFFFFF",
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        }}
      >
        {/* Boxed container — same max-width as HeroSection */}
        <div
          className="w-full flex items-center justify-between"
          style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 48px" }}
        >
          {/* Logo */}
          <div className="flex flex-col leading-tight">
            <span className="font-titillium font-bold text-[26px] text-[#0A0A0A]">
              log.lab.
            </span>
            <span className="font-titillium text-[10px] -mt-1" style={{ color: "#666666" }}>
              Tecnologia que transforma
            </span>
          </div>

          {/* Desktop: links + CTA */}
          <div className="hidden md:flex items-center">
            {NAV_LINKS.map((link) => (
              <NavLink key={link} label={link} />
            ))}

            <a
              href="#vagas"
              className="font-titillium font-semibold text-sm transition-all duration-[250ms]"
              style={{
                backgroundColor: "#F5B800",
                color: "#0A0A0A",
                borderRadius: "8px",
                padding: "10px 22px",
                marginLeft: "24px",
                textDecoration: "none",
                border: "none",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0A0A0A";
                e.currentTarget.style.color = "#F5B800";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#F5B800";
                e.currentTarget.style.color = "#0A0A0A";
              }}
            >
              Ver todas as vagas
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-[#0A0A0A]"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-72 z-50 p-8 flex flex-col bg-white"
            >
              <button
                className="self-end mb-8 text-[#0A0A0A]"
                onClick={() => setDrawerOpen(false)}
              >
                <X size={28} />
              </button>
              <div className="flex flex-col gap-6">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="font-titillium font-semibold text-lg text-[#0A0A0A]"
                    onClick={() => setDrawerOpen(false)}
                  >
                    {link}
                  </a>
                ))}
                <a
                  href="#vagas"
                  className="font-titillium font-semibold text-base text-center rounded-lg transition-all duration-[250ms]"
                  style={{
                    backgroundColor: "#F5B800",
                    color: "#0A0A0A",
                    padding: "12px 22px",
                    marginTop: "16px",
                    textDecoration: "none",
                    width: "100%",
                    display: "block",
                  }}
                  onClick={() => setDrawerOpen(false)}
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