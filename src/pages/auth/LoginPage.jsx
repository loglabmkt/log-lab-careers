import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const LOGO_URL = "https://www.loglabdigital.com.br/wp-content/uploads/2026/07/log_full_.svg";

function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, checkAppState } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const returnTo = location.state?.returnTo || "/admin";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, returnTo, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = returnTo;
    } catch (err) {
      if (err.status === 401) {
        setError("Email ou senha incorretos");
      } else if (err.status === 403) {
        setError("Email ainda não verificado");
      } else {
        setError("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    base44.auth.loginWithProvider("google", window.location.origin + "/admin");
  };

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

        <h1 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "22px", color: "#0A0A0A", textAlign: "center", margin: "0 0 6px" }}>
          Bem-vindo de volta
        </h1>
        <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.5)", textAlign: "center", margin: "0 0 28px" }}>
          Acesse o portal administrativo
        </p>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          className="ll-google-btn"
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            background: "rgba(255,255,255,0.7)", border: "1px solid rgba(10,10,10,0.08)",
            borderRadius: "12px", padding: "11px 16px", color: "#0A0A0A",
            fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "14px",
            cursor: "pointer", transition: "all 200ms",
          }}
        >
          <GoogleIcon size={18} /> Continuar com Google
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(10,10,10,0.08)" }} />
          <span style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(10,10,10,0.4)" }}>ou</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(10,10,10,0.08)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ position: "relative" }}>
            <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(10,10,10,0.35)" }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="ll-input"
              style={{
                width: "100%", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(10,10,10,0.08)",
                borderRadius: "12px", padding: "12px 12px 12px 40px", color: "#0A0A0A",
                fontFamily: "var(--font-inter)", fontSize: "14px", outline: "none",
                boxSizing: "border-box", transition: "border-color 200ms, box-shadow 200ms",
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(10,10,10,0.35)" }} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              className="ll-input"
              style={{
                width: "100%", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(10,10,10,0.08)",
                borderRadius: "12px", padding: "12px 40px 12px 40px", color: "#0A0A0A",
                fontFamily: "var(--font-inter)", fontSize: "14px", outline: "none",
                boxSizing: "border-box", transition: "border-color 200ms, box-shadow 200ms",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(10,10,10,0.35)", padding: "4px", display: "flex", alignItems: "center" }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px", padding: "10px 14px" }}>
              <AlertCircle size={15} style={{ color: "#ef4444", flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#dc2626" }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="ll-submit-btn"
            style={{
              width: "100%", background: "#F5B600", color: "#0A0A0A", border: "none",
              borderRadius: "12px", padding: "12px 16px", fontFamily: "var(--font-inter)",
              fontWeight: 700, fontSize: "15px", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.8 : 1, display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px", transition: "all 200ms", marginTop: "4px",
            }}
          >
            {loading ? (<><Loader2 size={16} className="animate-spin" /> Entrando...</>) : ("Entrar")}
          </button>
        </form>

        {/* Footer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", marginTop: "24px" }}>
          <Link to="/esqueci-senha" className="ll-link" style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.5)", textDecoration: "none", transition: "color 200ms" }}>
            Esqueci minha senha
          </Link>
          <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.4)" }}>
            Não tem conta?{" "}
            <Link to="/cadastro" className="ll-link" style={{ fontWeight: 600, color: "rgba(10,10,10,0.6)", textDecoration: "none", transition: "color 200ms" }}>
              Criar conta
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}