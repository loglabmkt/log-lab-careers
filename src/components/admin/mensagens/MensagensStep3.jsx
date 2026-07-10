import React, { useState } from "react";
import { ChevronLeft, CheckCircle2, AlertTriangle, XCircle, Copy } from "lucide-react";
import { useWhatsApp, substituirVariaveis } from "../../../hooks/useWhatsApp";
import { buildVagaData } from "@/utils/vaga";
import { base44 } from "@/api/base44Client";

function fmtWA(n = "") {
  let d = n.replace(/\D/g, "");
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return n;
}

const btnGhost = {
  display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px",
  background: "rgba(255,255,255,0.6)", border: "1px solid rgba(10,10,10,0.08)",
  borderRadius: "10px", color: "#0A0A0A", fontFamily: "var(--font-inter)", cursor: "pointer",
  transition: "all 150ms",
};

export default function MensagensStep3({ destinatarios, template, mensagem, vaga, onBack, onFinish }) {
  const [state, setState] = useState("idle"); // idle | sending | done | error
  const [resultado, setResultado] = useState(null);
  const [saving, setSaving] = useState(false);
  const { sendDisparo, progress: waProgress } = useWhatsApp();
  const progress = waProgress.total > 0 ? Math.round((waProgress.atual / waProgress.total) * 100) : 0;

  const vagaData = vaga ? buildVagaData(vaga) : null;
  const destComVaga = vagaData ? destinatarios.map(d => ({ ...d, ...vagaData })) : destinatarios;

  const personalizar = (dest) => substituirVariaveis(mensagem, dest);

  const handleSalvarRascunho = async () => {
    setSaving(true);
    await onFinish({ status: "rascunho" });
    setSaving(false);
  };

  const handleEnviar = async () => {
    setState("sending");

    // Salvar disparo antes de enviar (captura o id para rastrear status por mensagem)
    const disparo = await onFinish({ status: "enviando" });
    const disparoId = disparo?.id || null;

    const data = await sendDisparo({
      destinatarios: destComVaga,
      conteudo: mensagem,
      disparoId,
    });

    // Persistir o resultado no registro do disparo
    if (disparoId) {
      try {
        await base44.functions.invoke("updateDisparo", {
          id: disparoId,
          status: data.enviados === 0 ? "erro" : "concluido",
          totalEnviados: data.enviados,
          totalErros: data.erros,
          enviadoEm: new Date().toISOString(),
        });
      } catch (e) {
        console.error("[MensagensStep3] Falha ao atualizar disparo:", e);
      }
    }

    setResultado({
      totalEnviados: data.enviados,
      totalErros: data.erros,
      resultados: data.resultados,
    });
    setState("done");
  };

  // ── Estado: enviando ──
  if (state === "sending") {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "18px", color: "#0A0A0A", marginBottom: "24px" }}>
          Enviando mensagens...
        </div>
        <div style={{ background: "rgba(10,10,10,0.07)", borderRadius: "100px", height: "8px", width: "100%", maxWidth: "420px", margin: "0 auto 12px", overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#F5B600", borderRadius: "100px", width: `${progress}%`, transition: "width 200ms ease", boxShadow: "0 0 8px rgba(245,182,0,0.5)" }} />
        </div>
        <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.5)" }}>
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
            <CheckCircle2 size={56} color="#22c55e" style={{ margin: "0 auto 16px" }} />
            <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "20px", color: "#0A0A0A", marginBottom: "8px" }}>
              {totalEnviados} mensage{totalEnviados !== 1 ? "ns enviadas" : "m enviada"} com sucesso!
            </div>
          </>
        ) : totalEnviados === 0 ? (
          <>
            <XCircle size={56} color="#ef4444" style={{ margin: "0 auto 16px" }} />
            <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "20px", color: "#0A0A0A", marginBottom: "8px" }}>
              Falha no envio. Verifique a conexão com a API.
            </div>
            <button onClick={handleEnviar} style={{ marginTop: "16px", padding: "10px 24px", background: "#F5B600", border: "none", borderRadius: "10px", color: "#0A0A0A", fontFamily: "var(--font-inter)", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(245,182,0,0.3)" }}>
              Tentar novamente
            </button>
          </>
        ) : (
          <>
            <AlertTriangle size={56} color="#F5B600" style={{ margin: "0 auto 16px" }} />
            <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "20px", color: "#0A0A0A", marginBottom: "8px" }}>
              {totalEnviados} enviada{totalEnviados !== 1 ? "s" : ""} · {totalErros} com erro
            </div>
            <div style={{ maxWidth: "520px", margin: "16px auto 0", display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
              {falhos.map((f, i) => (
                <div key={i} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: "10px", padding: "10px 14px" }}>
                  <div style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#0A0A0A" }}>
                    {f.nome} <span style={{ color: "rgba(10,10,10,0.45)", fontSize: "12px" }}>· {fmtWA(f.whatsapp)}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "#dc2626" }}>{f.error}</div>
                </div>
              ))}
              <button onClick={() => {
                const text = falhos.map(f => `${f.nome} | ${fmtWA(f.whatsapp)} | ${f.error}`).join('\n');
                navigator.clipboard.writeText(text);
              }} style={{
                display: "flex", alignItems: "center", gap: "6px", alignSelf: "center", marginTop: "6px",
                background: "rgba(255,255,255,0.6)", border: "1px solid rgba(10,10,10,0.08)", borderRadius: "10px",
                padding: "8px 14px", fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.65)", cursor: "pointer",
                transition: "all 150ms",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#F5B600"; e.currentTarget.style.color = "#0A0A0A"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(10,10,10,0.08)"; e.currentTarget.style.color = "rgba(10,10,10,0.65)"; }}
              >
                <Copy size={13} /> Copiar lista de erros
              </button>
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
        <XCircle size={56} color="#ef4444" style={{ margin: "0 auto 16px" }} />
        <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "20px", color: "#0A0A0A", marginBottom: "8px" }}>
          Erro ao conectar com a API.
        </div>
        <button onClick={() => setState("idle")} style={{ marginTop: "16px", padding: "10px 24px", background: "#F5B600", border: "none", borderRadius: "10px", color: "#0A0A0A", fontFamily: "var(--font-inter)", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(245,182,0,0.3)" }}>
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
        <div style={{ flex: 1, minWidth: "200px", background: "rgba(255,255,255,0.55)", border: "1px solid rgba(10,10,10,0.06)", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(10,10,10,0.03)" }}>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(10,10,10,0.45)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px" }}>Destinatários</div>
          <div style={{ fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "28px", color: "#0A0A0A" }}>{destinatarios.length}</div>
        </div>
        <div style={{ flex: 2, minWidth: "200px", background: "rgba(255,255,255,0.55)", border: "1px solid rgba(10,10,10,0.06)", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(10,10,10,0.03)" }}>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(10,10,10,0.45)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px" }}>Template</div>
          <div style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "16px", color: "#0A0A0A" }}>{template?.nome || "Mensagem personalizada"}</div>
        </div>
      </div>

      {/* Lista destinatários */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.45)", marginBottom: "10px" }}>Destinatários:</div>
        <div style={{ maxHeight: "260px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px", border: "1px solid rgba(10,10,10,0.06)", borderRadius: "12px", padding: "8px", background: "rgba(255,255,255,0.4)" }}>
          {destinatarios.map((d, i) => (
            <div key={d.id || i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#F5B600", color: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>
                {(d.nome || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#0A0A0A" }}>{d.nome}</div>
                <div style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "rgba(10,10,10,0.45)" }}>{fmtWA(d.whatsapp)} · {d.area}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "rgba(10,10,10,0.45)", marginBottom: "10px" }}>Preview da mensagem:</div>
        <div style={{ background: "#e5ddd5", borderRadius: "14px", padding: "16px", border: "1px solid rgba(10,10,10,0.06)" }}>
          <div style={{ background: "#dcf8c6", borderRadius: "10px", padding: "12px 14px", maxWidth: "85%", marginLeft: "auto", fontFamily: "var(--font-inter)", fontSize: "13px", color: "#111", whiteSpace: "pre-wrap", lineHeight: "1.6", boxShadow: "0 1px 2px rgba(10,10,10,0.12)" }}>
            {destComVaga[0] ? personalizar(destComVaga[0]) : mensagem}
          </div>
        </div>
      </div>

      {/* Botões */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onBack} style={btnGhost}>
          <ChevronLeft size={16} /> Voltar
        </button>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleSalvarRascunho} disabled={saving} style={{ ...btnGhost, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Salvando..." : "Salvar Rascunho"}
          </button>
          <button onClick={handleEnviar} style={{ padding: "10px 20px", background: "#F5B600", border: "none", borderRadius: "10px", color: "#0A0A0A", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 14px rgba(245,182,0,0.3)", transition: "all 180ms" }}>
            Enviar Agora
          </button>
        </div>
      </div>
    </div>
  );
}
