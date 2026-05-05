import React, { useState, useEffect } from "react";
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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 h-16 flex items-center justify-between px-6 md:px-12 transition-shadow duration-300 ${
          scrolled ? "shadow-lg" : ""
        }`}
        style={{ backgroundColor: "#F5B800" }}
      >
        {/* Logo */}
        <div className="flex flex-col leading-tight">
          <span className="font-titillium font-bold text-[26px] text-[#0A0A0A]">
            log.lab<span style={{ color: scrolled ? "#F5B800" : "#0A0A0A" }}>.</span>
          </span>
          <span className="font-titillium text-[10px] text-[#3a3a3a] -mt-1">
            Tecnologia que transforma
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="font-titillium font-semibold text-sm text-[#0A0A0A] relative group"
            >
              {link}
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#0A0A0A] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#0A0A0A]"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={28} />
        </button>
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
              className="fixed top-0 right-0 h-full w-72 z-50 p-8 flex flex-col"
              style={{ backgroundColor: "#F5B800" }}
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}