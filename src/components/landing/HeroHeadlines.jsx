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
      {/* Badge */}
      <div
        className="inline-block font-inter font-semibold"
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
        className="font-inter font-bold"
        style={{ fontSize: "62px", color: "#FFFFFF", lineHeight: "1.1", margin: 0 }}
      >
        Venha fazer parte
        <br />
        de algo maior,
      </h1>

      {/* Typewriter line — fixed height to prevent layout shift */}
      <div style={{ minHeight: "72px", display: "flex", alignItems: "center" }}>
        <span
          className="font-inter font-bold"
          style={{ fontSize: "62px", color: "#F5B800", lineHeight: "1.1" }}
        >
          {typed}
          <span className="cursor-blink">|</span>
        </span>
      </div>
    </div>
  );
}