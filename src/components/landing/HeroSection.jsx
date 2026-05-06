import React from "react";
import { motion } from "framer-motion";
import VideoBackground from "./VideoBackground";
import HeroHeadlines from "./HeroHeadlines";
import TalentForm from "./TalentForm";

export default function HeroSection() {
  return (
    <section id="inicio" className="relative w-full min-h-screen overflow-hidden flex items-center">
      <VideoBackground />

      <div
        className="relative z-10 w-full flex items-center"
        style={{ paddingTop: "64px", minHeight: "100vh" }}
      >
        <div
          className="w-full flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 py-12 px-6 md:px-12"
          style={{ maxWidth: "1280px", margin: "0 auto" }}
        >
          {/* Left column */}
          <div style={{ flex: 1, maxWidth: "520px" }}>
            <HeroHeadlines />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="font-inter text-lg text-[#E5E5E5] mt-4"
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
    </section>
  );
}