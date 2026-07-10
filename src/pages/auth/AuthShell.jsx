import React from "react";

export const LOGO_URL = "https://www.loglabdigital.com.br/wp-content/uploads/2026/07/log_full_.svg";

export const authInputStyle = {
  width: "100%", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(10,10,10,0.08)",
  borderRadius: "12px", padding: "12px 12px 12px 40px", color: "#0A0A0A",
  fontFamily: "var(--font-inter)", fontSize: "14px", outline: "none",
  boxSizing: "border-box", transition: "border-color 200ms, box-shadow 200ms",
};

export const authSubmitStyle = {
  width: "100%", background: "#F5B600", color: "#0A0A0A", border: "none",
  borderRadius: "12px", padding: "12px 16px", fontFamily: "var(--font-inter)",
  fontWeight: 700, fontSize: "15px", display: "flex", alignItems: "center",
  justifyContent: "center", gap: "8px", transition: "all 200ms", marginTop: "4px",
};

export default function AuthShell({ children }) {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #fbfaf7 0%, #fff6dd 45%, #faf9f6 100%)", padding: "24px", "--font-inter": "'Google Sans Flex', 'Inter', -apple-system, sans-serif" }}
    >
      <style>{`
        .ll-input:focus { border-color: #F5B600 !important; box-shadow: 0 0 0 3px rgba(245,182,0,0.15) !important; }
        .ll-google-btn:hover { background: rgba(255,255,255,0.85) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.08) !important; }
        .ll-submit-btn:hover:not(:disabled) { box-shadow: 0 6px 24px rgba(245,182,0,0.4) !important; transform: translateY(-1px); }
        .ll-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .ll-link:hover { color: #F5B600 !important; }
      `}</style>

      {/* Blobs */}
      <div style={{ position: "absolute", top: "-100px", left: "-80px", width: "400px", height: "400px", background: "#F5B600", opacity: 0.14, filter: "blur(90px)", borderRadius: "50% 60% 40% 70% / 60% 30% 70% 40%", animation: "blobFloat 32s ease-in-out infinite", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "-120px", right: "-60px", width: "380px", height: "380px", background: "#F5B600", opacity: 0.12, filter: "blur(100px)", borderRadius: "60% 40% 70% 30% / 40% 70% 30% 60%", animation: "blobFloat 38s ease-in-out infinite reverse", zIndex: 0 }} />
      <div style={{ position: "absolute", top: "25%", right: "15%", width: "250px", height: "250px", background: "#F5B600", opacity: 0.1, filter: "blur(70px)", borderRadius: "50%", animation: "blobFloat 35s ease-in-out infinite", zIndex: 0 }} />
      <div style={{ position: "absolute", top: "50%", left: "8%", width: "300px", height: "300px", background: "#0A0A0A", opacity: 0.04, filter: "blur(80px)", borderRadius: "50%", animation: "blobFloat 40s ease-in-out infinite", zIndex: 0 }} />

      {/* Glass card */}
      <div
        className="relative"
        style={{
          width: "100%", maxWidth: "420px",
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.7)",
          borderRadius: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255,255,255,0.8), inset 0 8px 24px rgba(255,255,255,0.25)",
          padding: "40px 32px",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <img src={LOGO_URL} alt="Log Lab" style={{ height: "36px", display: "inline-block" }} />
        </div>
        {children}
      </div>
    </div>
  );
}
