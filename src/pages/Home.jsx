import React from "react";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import CulturaSection from "../components/landing/CulturaSection";
import VagasSection from "../components/landing/VagasSection";
import LoggerSection from "../components/landing/LoggerSection";
import DepoimentosSection from "../components/landing/DepoimentosSection";

export default function Home() {
  return (
    <div className="font-inter">
      <Navbar />

      <section id="inicio">
        <HeroSection />
      </section>

      <section id="cultura" style={{ minHeight: "100vh", display: "flex", alignItems: "stretch", background: "linear-gradient(135deg, #faf8f2 0%, #fff8e7 50%, #faf8f2 100%)", margin: 0, padding: 0 }}>
        <CulturaSection />
      </section>

      <section id="vagas" style={{ margin: 0, padding: 0 }}>
        <VagasSection />
      </section>

      <section id="logger" style={{ margin: 0, padding: 0 }}>
        <LoggerSection />
      </section>

      <section id="depoimentos" style={{ margin: 0, padding: 0 }}>
        <DepoimentosSection />
      </section>
    </div>
  );
}