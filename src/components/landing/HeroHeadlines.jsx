import React from "react";
import useTypewriter from "@/hooks/useTypewriter";

const TYPED_TEXTS = [
  "seja #log.",
  "construa o futuro.",
  "inove com propósito.",
  "faça história.",
  "trabalhe com impacto.",
  "cresça de verdade.",
  "transforme o mercado.",
];

export default function HeroHeadlines() {
  const typed = useTypewriter(TYPED_TEXTS, 60, 2000, 30);

  return (
    <div>
      <style>{`
        @media (max-width: 767px) {
          .hero-badge { font-size: 12px !important; padding: 5px 14px !important; margin-bottom: 16px !important; }
          .hero-h1 { font-size: 36px !important; word-break: keep-all; overflow-wrap: break-word; }
          .hero-typewriter { font-size: 36px !important; }
          .hero-typewriter-wrap { min-height: 50px !important; margin-bottom: 0 !important; }
        }
      `}</style>

      {/* Badge */}
      <div
        className="hero-badge inline-block font-inter font-semibold"
        style={{
          fontSize: "13px",
          color: "#F5B800",
          border: "1px solid rgba(245,184,0,0.4)",
          backgroundColor: "rgba(245,184,0,0.15)",
          borderRadius: "20px",
          padding: "6px 16px",
          marginBottom: "20px",
        }}
      >
        ✦ Venha ser #log
      </div>

      {/* Fixed headline */}
      <h1
        className="hero-h1 font-inter font-bold"
        style={{ fontSize: "62px", color: "#FFFFFF", lineHeight: "1.15", margin: 0 }}
      >
        Venha fazer parte
        <br />
        de algo maior,
      </h1>

      {/* Typewriter line — fixed height to prevent layout shift */}
      <div className="hero-typewriter-wrap" style={{ minHeight: "72px", display: "flex", alignItems: "center" }}>
        <span
          className="hero-typewriter font-inter font-bold"
          style={{ fontSize: "62px", color: "#F5B800", lineHeight: "1.1" }}
        >
          {typed}
          <span className="cursor-blink">|</span>
        </span>
      </div>
    </div>
  );
}