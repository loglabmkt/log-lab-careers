import React, { useState } from "react";
import { ChevronLeft, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

function fmtWA(n = "") {
  const d = n.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return n;
}

export default function MensagensStep3({ destinatarios, template, mensagem, onBack, onFinish }) {
  const [state, setState] = useState("idle"); // idle | sending | done | error
  const [progress, setProgress] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [saving, setSaving] = useState(false);

  const personalizar = (dest) => mensagem
    .replace(/\[Nome\]/g, dest.nome || "")
    .replace(/\[Area\]/g, dest.area || "")
    .replace(/\[[^\]]+\]/g, m => m);

  const handleSalvarRascunho = async () => {
    setSaving(true);
    await onFinish({ status: "rascunho" });
    setSaving(false);
  };

  const handleEnviar = async () => {
    setState("sending");
    setProgress(0);

    // Salvar disparo antes de enviar
    const disparoRes = await onFinish({ status: "enviando" });
    const disparoId = disparoRes?.id || null;

    // Simular progresso animado enquanto envia
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 2, 90));
    }, 200);

    const res = await base44.functions.invoke("sendDisparoWhatsApp", {
      disparoId,
      destinatarios,
      mensagemTemplate: mensagem,
      templateSid: template?.templateSid || null,
    });

    clearInterval(progressInterval);
    setProgress(100);

    const data = res.data;
    setResultado(data);

    if (!data || data.error) {
      setState("error");
    } else {
      setState("done");
    }
  };

  // ── Estado: enviando ──
  if (state === "sending") {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "18px", color: "#FFFFFF", marginBottom: "24px" }}>
          Enviando mensagens...
        </div>
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "100px", height: "8px", width: "100%", maxWidth: "420px", margin: "0 auto 12px", overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#F5B800", borderRadius: "100px", width: `${progress}%`, transition: "width 200ms ease" }} />
        </div>
        <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
          {Math.round(progress)}% — aguarde...
        </div>
      </div>
    );
  }

  // ── Estado: concluído ──
  if (state === "done" && resultado) {
    const { totalEnviados, totalErros, resultados } = resultado;
    const falhos = (resultados || []).filter(r => !r.success);

    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        {totalErros === 0 ? (
          <>
            <CheckCircle2 size={56} color="#4ade80" style={{ margin: "0 auto 16px" }} />
            <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "20px", color: "#FFFFFF", marginBottom: "8px" }}>
              {totalEnviados} mensage{totalEnviados !== 1 ? "ns enviadas" : "m enviada"} com sucesso!
            </div>
          </>
        ) : totalEnviados === 0 ? (
          <>
            <XCircle size={56} color="#f87171" style={{ margin: "0 auto 16px" }} />
            <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "20px", color: "#FFFFFF", marginBottom: "8px" }}>
              Falha no envio. Verifique a conexão com a API.
            </div>
            <button onClick={handleEnviar} style={{ marginTop: "16px", padding: "10px 24px", background: "#F5B800", border: "none", borderRadius: "8px", color: "#0A0A0A", fontFamily: "var(--font-inter)", fontWeight: 700, cursor: "pointer" }}>
              Tentar novamente
            </button>
          </>
        ) : (
          <>
            <AlertTriangle size={56} color="#F5B800" style={{ margin: "0 auto 16px" }} />
            <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "20px", color: "#FFFFFF", marginBottom: "8px" }}>
              {totalEnviados} enviada{totalEnviados !== 1 ? "s" : ""} · {totalErros} com erro
            </div>
            <div style={{ maxWidth: "480px", margin: "16px auto 0", display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
              {falhos.map((f, i) => (
                <div key={i} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "10px 14px" }}>
                  <div style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#FFFFFF" }}>{f.nome}</div>
                  <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "#f87171" }}>{f.error}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Estado: erro geral ──
  if (state === "error") {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <XCircle size={56} color="#f87171" style={{ margin: "0 auto 16px" }} />
        <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "20px", color: "#FFFFFF", marginBottom: "8px" }}>
          Erro ao conectar com a API.
        </div>
        <button onClick={() => setState("idle")} style={{ marginTop: "16px", padding: "10px 24px", background: "#F5B800", border: "none", borderRadius: "8px", color: "#0A0A0A", fontFamily: "var(--font-inter)", fontWeight: 700, cursor: "pointer" }}>
          Tentar novamente
        </button>
      </div>
    );
  }

  // ── Estado: idle (padrão) ──
  return (
    <div>
      {/* Resumo */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px" }}>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px" }}>Destinatários</div>
          <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "28px", color: "#F5B800" }}>{destinatarios.length}</div>
        </div>
        <div style={{ flex: 2, minWidth: "200px", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px" }}>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px" }}>Template</div>
          <div style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "16px", color: "#FFFFFF" }}>{template?.nome || "Mensagem personalizada"}</div>
        </div>
      </div>

      {/* Lista destinatários */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "10px" }}>Destinatários:</div>
        <div style={{ maxHeight: "260px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "8px" }}>
          {destinatarios.map((d, i) => (
            <div key={d.id || i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "6px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#F5B800", color: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>
                {(d.nome || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#FFFFFF" }}>{d.nome}</div>
                <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{fmtWA(d.whatsapp)} · {d.area}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "10px" }}>Preview da mensagem:</div>
        <div style={{ background: "#075e54", borderRadius: "12px", padding: "16px" }}>
          <div style={{ background: "#dcf8c6", borderRadius: "8px", padding: "12px 14px", maxWidth: "85%", marginLeft: "auto", fontFamily: "var(--font-inter)", fontSize: "13px", color: "#111", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
            {destinatarios[0] ? personalizar(destinatarios[0]) : mensagem}
          </div>
        </div>
      </div>

      {/* Botões */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#FFFFFF", fontFamily: "var(--font-inter)", cursor: "pointer" }}>
          <ChevronLeft size={16} /> Voltar
        </button>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleSalvarRascunho} disabled={saving} style={{ padding: "10px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#FFFFFF", fontFamily: "var(--font-inter)", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Salvando..." : "Salvar Rascunho"}
          </button>
          <button onClick={handleEnviar} style={{ padding: "10px 20px", background: "#F5B800", border: "none", borderRadius: "8px", color: "#0A0A0A", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
            Enviar Agora
          </button>
        </div>
      </div>
    </div>
  );
}