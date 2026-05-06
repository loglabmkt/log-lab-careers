import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import VideoBackground from "./VideoBackground";
import HeroHeadlines from "./HeroHeadlines";
import TalentForm from "./TalentForm";
import FloatingParticles from "./FloatingParticles";

export default function HeroSection() {
  const [showScroll, setShowScroll] = useState(true);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY < 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center" style={{ width: "100%" }}>
      <VideoBackground />
      <FloatingParticles />

      <div
        className="relative w-full flex items-center"
        style={{ paddingTop: "72px", minHeight: "100vh", zIndex: 10 }}
      >
        <div
          className="w-full flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 py-12 px-6 md:px-16"
          style={{ maxWidth: "1280px", margin: "0 auto" }}
        >
          {/* Left column */}
          <div className="flex flex-col" style={{ flex: 1, maxWidth: "540px" }}>
            <HeroHeadlines />

            <p
              className="font-inter"
              style={{
                fontSize: "18px",
                color: "rgba(255,255,255,0.80)",
                lineHeight: "1.7",
                maxWidth: "460px",
                marginTop: "20px",
              }}
            >
              Mais de 200 pessoas já escolheram construir uma carreira com propósito aqui. Chegou a sua vez.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              style={{ marginTop: "32px" }}
            >
              <a
                href="#vagas"
                className="inline-block font-inter font-semibold text-base px-7 py-3.5 rounded-lg transition-all duration-300 hover:bg-[#0A0A0A] hover:text-[#F5B800]"
                style={{
                  backgroundColor: "#F5B800",
                  color: "#0A0A0A",
                  animation: "pulse-cta 2s ease-in-out infinite",
                }}
              >
                Ver vagas abertas →
              </a>
            </motion.div>
          </div>

          {/* Right column */}
          <div style={{ width: "420px", flexShrink: 0 }} className="w-full md:w-auto">
            <TalentForm />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "36px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          zIndex: 10,
          opacity: showScroll ? 1 : 0,
          transition: "opacity 300ms ease",
          pointerEvents: "none",
        }}
      >
        <span className="font-inter" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
          Role para explorar
        </span>
        <ChevronDown
          size={18}
          color="rgba(255,255,255,0.5)"
          style={{ animation: "bounce 1.5s ease-in-out infinite" }}
        />
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </section>
  );
}