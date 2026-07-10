import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import MensagensStep1 from "@/components/admin/mensagens/MensagensStep1";
import MensagensStep2 from "@/components/admin/mensagens/MensagensStep2";
import MensagensStep3 from "@/components/admin/mensagens/MensagensStep3";
import DisparosHistorico from "@/components/admin/mensagens/DisparosHistorico";

const STEPS = ["Destinatários", "Mensagem", "Confirmar"];

const glassPanel = {
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.65)",
  borderRadius: "20px", padding: "28px",
  boxShadow: "0 8px 32px rgba(10,10,10,0.06), inset 1px 1px 0 rgba(255,255,255,0.75), inset -1px -1px 1px rgba(10,10,10,0.03)",
};

export default function MensagensPage() {
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [destinatarios, setDestinatarios] = useState([]);
  const [template, setTemplate] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [vaga, setVaga] = useState(null);
  const [disparos, setDisparos] = useState([]);
  const [loadingDisparos, setLoadingDisparos] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    base44.functions.invoke("getDisparos", { page: 1, limit: 20 }).then(res => {
      setDisparos(res.data?.items || []);
      setLoadingDisparos(false);
    });
  }, [refresh]);

  // Se vier de TemplatesPage com templateId
  useEffect(() => {
    if (location.state?.templateId) {
      // será tratado no Step2
    }
  }, [location.state]);

  const handleFinish = async ({ status = "rascunho" } = {}) => {
    const res = await base44.functions.invoke("createDisparo", {
      templateId: template?.id || null,
      templateNome: template?.nome || "Mensagem personalizada",
      mensagemFinal: mensagem,
      destinatarios,
      status,
    });
    if (status === "rascunho") {
      setRefresh(r => r + 1);
      setStep(1);
      setDestinatarios([]);
      setTemplate(null);
      setMensagem("");
      setVaga(null);
    }
    return res.data;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "24px", color: "#0A0A0A", margin: 0 }}>Mensagens</h1>
        <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(10,10,10,0.55)", margin: "4px 0 0" }}>Disparos de WhatsApp para talentos cadastrados</p>
      </div>

      <div style={{ height: "1px", background: "rgba(10,10,10,0.05)", marginBottom: "28px" }} />

      {/* Stepper */}
      <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "28px" }}>
        {STEPS.map((s, i) => {
          const num = i + 1;
          const active = step === num;
          const done = step > num;
          return (
            <React.Fragment key={s}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                  background: done ? "#22c55e" : active ? "#F5B600" : "rgba(10,10,10,0.07)",
                  color: done ? "#FFFFFF" : active ? "#0A0A0A" : "rgba(10,10,10,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "13px",
                  boxShadow: active ? "0 4px 14px rgba(245,182,0,0.35)" : "none",
                  transition: "all 200ms ease",
                }}>
                  {done ? "✓" : num}
                </div>
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "14px", fontWeight: active ? 600 : 400, color: active ? "#0A0A0A" : done ? "#15803d" : "rgba(10,10,10,0.4)" }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: "1px", background: done ? "#22c55e" : "rgba(10,10,10,0.1)", margin: "0 12px" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Steps */}
      <div style={glassPanel}>
        {step === 1 && (
          <MensagensStep1
            selected={destinatarios}
            onNext={(list) => { setDestinatarios(list); setStep(2); }}
          />
        )}
        {step === 2 && (
          <MensagensStep2
            destinatarios={destinatarios}
            initialTemplateId={location.state?.templateId}
            onNext={(tpl, msg, vg) => { setTemplate(tpl); setMensagem(msg); setVaga(vg); setStep(3); }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <MensagensStep3
            destinatarios={destinatarios}
            template={template}
            mensagem={mensagem}
            vaga={vaga}
            onBack={() => setStep(2)}
            onFinish={handleFinish}
          />
        )}
      </div>

      {/* Histórico */}
      <div style={{ marginTop: "48px" }}>
        <div style={{ height: "1px", background: "rgba(10,10,10,0.05)", marginBottom: "24px" }} />
        <h2 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "18px", color: "#0A0A0A", marginBottom: "16px" }}>Histórico de Disparos</h2>
        <DisparosHistorico items={disparos} loading={loadingDisparos} />
      </div>
    </div>
  );
}
