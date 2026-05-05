import React from "react";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";

export default function Home() {
  return (
    <div className="font-titillium">
      <Navbar />
      <HeroSection />
    </div>
  );
}