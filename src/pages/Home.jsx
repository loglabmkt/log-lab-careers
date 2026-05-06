import React from "react";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import CulturaSection from "../components/landing/CulturaSection";

export default function Home() {
  return (
    <div className="font-titillium">
      <Navbar />
      <HeroSection />
      <CulturaSection />
    </div>
  );
}