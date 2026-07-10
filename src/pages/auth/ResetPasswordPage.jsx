import React, { useState } from "react";
import { Lock, KeyRound, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AuthShell, { authInputStyle, authSubmitStyle } from "./AuthShell";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get("token") || searchParams.get("resetToken") || "";

  const [token, setToken] = useState(urlToken);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("A senha precisa ter pelo menos 8 caracteres"); return; }
    if (password !== confirm) { setError("As senhas não coincidem"); return; }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken: token.trim(), newPassword: password });
      setDone(true);
    } catch (err) {
      if (err.status === 400) setError("Código inválido ou expirado. Solicite uma nova redefinição.");
      else if (err.status === 422) setError("A senha não atende aos requisitos. Tente uma senha mais forte.");
      else setError("Não foi possível redefinir a senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      {!done ? (
        <>
          <h1 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "22px", color: "#0A0A0A", textAlign: "center", margin: "0 0 6px" }}>
            Redefinir senha
          </h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.5)", textAlign: "center", margin: "0 0 28px" }}>
            {urlToken ? "Escolha sua nova senha" : "Cole o código recebido por email e escolha a nova senha"}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {!urlToken && (
              <div style={{ position: "relative" }}>
                <KeyRound size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(10,10,10,0.35)" }} />
                <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Código de redefinição" required className="ll-input" style={authInputStyle} />
              </div>
            )}

            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(10,10,10,0.35)" }} />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nova senha (mín. 8 caracteres)" required className="ll-input" style={{ ...authInputStyle, paddingRight: "40px" }} />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(10,10,10,0.35)", padding: "4px", display: "flex", alignItems: "center" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(10,10,10,0.35)" }} />
              <input type={showPassword ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirmar nova senha" required className="ll-input" style={authInputStyle} />
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px", padding: "10px 14px" }}>
                <AlertCircle size={15} style={{ color: "#ef4444", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#dc2626" }}>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="ll-submit-btn" style={{ ...authSubmitStyle, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.8 : 1 }}>
              {loading ? (<><Loader2 size={16} className="animate-spin" /> Redefinindo...</>) : ("Redefinir senha")}
            </button>
          </form>
        </>
      ) : (
        <>
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <CheckCircle2 size={32} style={{ color: "#22c55e" }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "22px", color: "#0A0A0A", textAlign: "center", margin: "0 0 6px" }}>
            Senha redefinida!
          </h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.5)", textAlign: "center", margin: "0 0 20px" }}>
            Sua senha foi alterada com sucesso. Faça login com a nova senha.
          </p>
          <Link to="/login" className="ll-submit-btn" style={{ ...authSubmitStyle, textDecoration: "none", cursor: "pointer" }}>
            Ir para o login
          </Link>
        </>
      )}

      {!done && (
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link to="/login" className="ll-link" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.5)", textDecoration: "none", transition: "color 200ms" }}>
            <ArrowLeft size={13} /> Voltar para o login
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
