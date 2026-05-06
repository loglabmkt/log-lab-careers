import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import MensagensStep1 from "@/components/admin/mensagens/MensagensStep1";
import MensagensStep2 from "@/components/admin/mensagens/MensagensStep2";
import MensagensStep3 from "@/components/admin/mensagens/MensagensStep3";
import DisparosHistorico from "@/components/admin/mensagens/DisparosHistorico";

const STEPS = ["Destinatários", "Mensagem", "Confirmar"];

export default function MensagensPage() {
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [destinatarios, setDestinatarios] = useState([]);
  const [template, setTemplate] = useState(null);
  const [mensagem, setMensagem] = useState("");
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
    }
    return res.data;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "24px", color: "#FFFFFF", margin: 0 }}>Mensagens</h1>
        <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>Disparos de WhatsApp para talentos cadastrados</p>
      </div>

      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "28px" }} />

      {/* Stepper */}
      <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "32px" }}>
        {STEPS.map((s, i) => {
          const num = i + 1;
          const active = step === num;
          const done = step > num;
          return (
            <React.Fragment key={s}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                  background: done ? "#4ade80" : active ? "#F5B800" : "rgba(255,255,255,0.1)",
                  color: done || active ? "#0A0A0A" : "rgba(255,255,255,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "13px",
                }}>
                  {done ? "✓" : num}
                </div>
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "14px", fontWeight: active ? 600 : 400, color: active ? "#FFFFFF" : done ? "#4ade80" : "rgba(255,255,255,0.4)" }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: "1px", background: done ? "#4ade80" : "rgba(255,255,255,0.1)", margin: "0 12px" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Steps */}
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
          onNext={(tpl, msg) => { setTemplate(tpl); setMensagem(msg); setStep(3); }}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <MensagensStep3
          destinatarios={destinatarios}
          template={template}
          mensagem={mensagem}
          onBack={() => setStep(2)}
          onFinish={handleFinish}
        />
      )}

      {/* Histórico */}
      <div style={{ marginTop: "48px" }}>
        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "24px" }} />
        <h2 style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "18px", color: "#FFFFFF", marginBottom: "16px" }}>Histórico de Disparos</h2>
        <DisparosHistorico items={disparos} loading={loadingDisparos} />
      </div>
    </div>
  );
}