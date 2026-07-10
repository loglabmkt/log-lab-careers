import React, { useState, useEffect, useRef } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import AuthShell, { authInputStyle, authSubmitStyle } from "./AuthShell";

export default function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [step, setStep] = useState("form"); // form | otp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [resendIn, setResendIn] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) navigate("/admin", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startResendCooldown = () => {
    setResendIn(60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendIn(v => {
        if (v <= 1) { clearInterval(timerRef.current); return 0; }
        return v - 1;
      });
    }, 1000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("A senha precisa ter pelo menos 8 caracteres"); return; }
    if (password !== confirm) { setError("As senhas não coincidem"); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setInfo(`Enviamos um código de verificação para ${email}`);
      setStep("otp");
      startResendCooldown();
    } catch (err) {
      if (err.status === 409) setError("Este email já está cadastrado. Tente entrar.");
      else if (err.status === 400 || err.status === 422) setError("Dados inválidos. Verifique o email e use uma senha mais forte.");
      else if (err.status === 429) setError("Muitas tentativas. Aguarde um momento e tente novamente.");
      else setError("Não foi possível criar a conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await base44.auth.verifyOtp({ email, otpCode: otp.trim() });
      // Email verificado — loga direto e recarrega para o cliente nascer com o token
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/admin";
    } catch (err) {
      if (err.status === 400) setError("Código inválido ou expirado");
      else if (err.status === 429) setError("Muitas tentativas. Aguarde um momento.");
      else setError("Não foi possível verificar o código. Tente novamente.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    setError(null);
    try {
      await base44.auth.resendOtp(email);
      setInfo(`Código reenviado para ${email}`);
      startResendCooldown();
    } catch (err) {
      if (err.status === 429) setError("Muitas solicitações. Aguarde antes de reenviar.");
      else setError("Não foi possível reenviar o código.");
    }
  };

  return (
    <AuthShell>
      {step === "form" ? (
        <>
          <h1 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "22px", color: "#0A0A0A", textAlign: "center", margin: "0 0 6px" }}>
            Criar conta
          </h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.5)", textAlign: "center", margin: "0 0 28px" }}>
            Acesso ao portal administrativo
          </p>

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(10,10,10,0.35)" }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="ll-input" style={authInputStyle} />
            </div>

            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(10,10,10,0.35)" }} />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha (mín. 8 caracteres)" required className="ll-input" style={{ ...authInputStyle, paddingRight: "40px" }} />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(10,10,10,0.35)", padding: "4px", display: "flex", alignItems: "center" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(10,10,10,0.35)" }} />
              <input type={showPassword ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirmar senha" required className="ll-input" style={authInputStyle} />
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px", padding: "10px 14px" }}>
                <AlertCircle size={15} style={{ color: "#ef4444", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#dc2626" }}>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="ll-submit-btn" style={{ ...authSubmitStyle, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.8 : 1 }}>
              {loading ? (<><Loader2 size={16} className="animate-spin" /> Criando conta...</>) : ("Criar conta")}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.4)" }}>
              Já tem conta?{" "}
              <Link to="/login" className="ll-link" style={{ fontWeight: 600, color: "rgba(10,10,10,0.6)", textDecoration: "none", transition: "color 200ms" }}>
                Entrar
              </Link>
            </span>
          </div>
        </>
      ) : (
        <>
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <ShieldCheck size={32} style={{ color: "#F5B600" }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "22px", color: "#0A0A0A", textAlign: "center", margin: "0 0 6px" }}>
            Verifique seu email
          </h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.5)", textAlign: "center", margin: "0 0 24px" }}>
            {info || `Enviamos um código de verificação para ${email}`}
          </p>

          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="______"
              inputMode="numeric"
              autoFocus
              required
              className="ll-input"
              style={{
                ...authInputStyle, paddingLeft: "12px", textAlign: "center",
                fontFamily: "monospace", fontSize: "24px", letterSpacing: "10px", fontWeight: 700,
              }}
            />

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px", padding: "10px 14px" }}>
                <AlertCircle size={15} style={{ color: "#ef4444", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#dc2626" }}>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading || otp.length < 6} className="ll-submit-btn" style={{ ...authSubmitStyle, cursor: loading || otp.length < 6 ? "not-allowed" : "pointer", opacity: loading || otp.length < 6 ? 0.7 : 1 }}>
              {loading ? (<><Loader2 size={16} className="animate-spin" /> Verificando...</>) : ("Verificar e entrar")}
            </button>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", marginTop: "24px" }}>
            <button onClick={handleResend} disabled={resendIn > 0} className="ll-link" style={{ background: "none", border: "none", fontFamily: "var(--font-inter)", fontSize: "13px", color: resendIn > 0 ? "rgba(10,10,10,0.3)" : "rgba(10,10,10,0.5)", cursor: resendIn > 0 ? "default" : "pointer", transition: "color 200ms" }}>
              {resendIn > 0 ? `Reenviar código em ${resendIn}s` : "Reenviar código"}
            </button>
            <button onClick={() => { setStep("form"); setError(null); setOtp(""); }} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: "5px", fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.4)", cursor: "pointer" }}>
              <ArrowLeft size={13} /> Voltar
            </button>
          </div>
        </>
      )}
    </AuthShell>
  );
}
