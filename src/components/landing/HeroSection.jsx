import React from "react";
import { motion } from "framer-motion";
import VideoBackground from "./VideoBackground";
import HeroHeadlines from "./HeroHeadlines";
import TalentForm from "./TalentForm";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center">
      <VideoBackground />

      {/* Content — pt-16 to clear navbar, items-center for vertical centering */}
      <div
        className="relative z-10 w-full flex items-center px-6 md:px-12"
        style={{ paddingTop: "64px", minHeight: "100vh" }}
      >
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16 py-12">
          {/* Left column */}
          <div className="flex-[3] flex flex-col justify-center">
            <HeroHeadlines />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="font-titillium text-lg text-[#E5E5E5] mt-4"
            >
              Venha transformar o mercado com a gente.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8"
            >
              <a
                href="#vagas"
                className="inline-block font-titillium font-semibold text-base px-7 py-3.5 rounded-lg transition-all duration-300 hover:bg-[#0A0A0A] hover:text-[#F5B800]"
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

          {/* Right column — max-w-[420px], vertically centered */}
          <div className="flex-[2] w-full flex items-center justify-center md:justify-end">
            <div className="w-full" style={{ maxWidth: "420px" }}>
              <TalentForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}