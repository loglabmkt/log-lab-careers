import React from "react";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import CulturaSection from "../components/landing/CulturaSection";

export default function Home() {
  return (
    <div className="font-inter">
      <Navbar />

      <section id="inicio">
        <HeroSection />
      </section>

      <section id="cultura" style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <CulturaSection />
      </section>
    </div>
  );
}