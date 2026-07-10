import React, { useState } from "react";
import { Mail, AlertCircle, Loader2, MailCheck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AuthShell, { authInputStyle, authSubmitStyle } from "./AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
      setSent(true);
    } catch (err) {
      if (err.status === 429) setError("Muitas solicitações. Aguarde um momento e tente novamente.");
      else setSent(true); // por segurança, não revelar se o email existe
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      {!sent ? (
        <>
          <h1 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "22px", color: "#0A0A0A", textAlign: "center", margin: "0 0 6px" }}>
            Esqueci minha senha
          </h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.5)", textAlign: "center", margin: "0 0 28px" }}>
            Informe seu email e enviaremos as instruções de redefinição
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(10,10,10,0.35)" }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required autoFocus className="ll-input" style={authInputStyle} />
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px", padding: "10px 14px" }}>
                <AlertCircle size={15} style={{ color: "#ef4444", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#dc2626" }}>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="ll-submit-btn" style={{ ...authSubmitStyle, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.8 : 1 }}>
              {loading ? (<><Loader2 size={16} className="animate-spin" /> Enviando...</>) : ("Enviar instruções")}
            </button>
          </form>
        </>
      ) : (
        <>
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <MailCheck size={32} style={{ color: "#F5B600" }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "22px", color: "#0A0A0A", textAlign: "center", margin: "0 0 6px" }}>
            Verifique seu email
          </h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.5)", textAlign: "center", margin: "0 0 8px", lineHeight: 1.6 }}>
            Se <strong style={{ color: "#0A0A0A" }}>{email}</strong> estiver cadastrado, você receberá as instruções para redefinir a senha.
          </p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.45)", textAlign: "center", margin: "0 0 8px" }}>
            Recebeu o código? <Link to="/redefinir-senha" className="ll-link" style={{ fontWeight: 600, color: "rgba(10,10,10,0.6)", textDecoration: "none" }}>Redefinir senha agora</Link>
          </p>
        </>
      )}

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <Link to="/login" className="ll-link" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.5)", textDecoration: "none", transition: "color 200ms" }}>
          <ArrowLeft size={13} /> Voltar para o login
        </Link>
      </div>
    </AuthShell>
  );
}
