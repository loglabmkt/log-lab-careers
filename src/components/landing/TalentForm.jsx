import React, { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, User, Phone, ChevronDown, Loader2, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const AREAS = ["Tecnologia", "Design", "Marketing", "Comercial", "Operações", "RH", "Outros"];

const inputStyle = {
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.6)",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.04)",
  borderRadius: "10px",
};

const inputHoverStyle = {
  background: "rgba(255,255,255,0.95)",
  borderColor: "rgba(255,255,255,0.9)",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02), 0 0 0 3px rgba(255,255,255,0.3)",
};

function GlassInput({ type = "text", placeholder, value, onChange, icon: Icon, hasError }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999] z-10" />}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full pl-11 pr-4 py-3.5 font-inter text-sm text-[#0A0A0A] placeholder:text-[#999] focus:outline-none transition"
        style={{
          ...inputStyle,
          ...(focused ? inputHoverStyle : {}),
          ...(hasError ? { boxShadow: "0 0 0 2px rgba(239,68,68,0.5)" } : {}),
        }}
      />
    </div>
  );
}

export default function TalentForm() {
  const [form, setForm] = useState({ name: "", phone: "", area: "", consent: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nome é obrigatório";
    if (!form.phone.trim()) e.phone = "Telefone é obrigatório";
    if (!form.area) e.area = "Selecione uma área";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setErrors({});
    setSubmitError("");
    setLoading(true);
    const res = await base44.functions.invoke("saveTalento", {
      nome: form.name,
      whatsapp: form.phone,
      areaInteresse: form.area,
      aceitaWhatsapp: form.consent,
    });
    setLoading(false);
    if (res.data?.success) {
      setSuccess(true);
    } else {
      setSubmitError(res.data?.error || "Erro ao enviar. Tente novamente.");
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[380px]"
        style={{
          background: "linear-gradient(145deg, #F5B800 0%, #f0a800 100%)",
          boxShadow: "0 32px 80px rgba(245,184,0,0.35), 0 8px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <CheckCircle size={48} className="text-[#0A0A0A] mb-4" />
        <p className="font-inter font-bold text-xl text-[#0A0A0A]">Cadastro realizado!</p>
        <p className="font-inter text-sm text-[#3a3a3a] mt-2">Em breve entraremos em contato.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
      className="talent-form-card rounded-2xl p-8"
      style={{
        background: "linear-gradient(145deg, #F5B800 0%, #f0a800 100%)",
        boxShadow: "0 32px 80px rgba(245,184,0,0.35), 0 8px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      <style>{`
        @media (max-width: 767px) {
          .talent-form-card { padding: 24px 20px !important; border-radius: 20px !important; }
          .talent-form-header { font-size: 14px !important; margin-bottom: 16px !important; }
          .talent-form-input { padding: 14px 16px !important; font-size: 16px !important; border-radius: 10px !important; }
          .talent-form-input-wrap { margin-bottom: 12px !important; }
          .talent-consent-label { min-height: 44px; }
          .talent-consent-text { font-size: 13px !important; line-height: 1.5 !important; }
          .talent-submit-btn { padding: 16px !important; font-size: 15px !important; margin-top: 16px !important; }
        }
      `}</style>

      <div className="talent-form-header flex items-center gap-3 mb-5">
        <Briefcase size={20} className="text-[#0A0A0A]" />
        <span className="font-inter font-semibold text-base text-[#0A0A0A]">
          Receba nossas vagas
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="talent-form-input-wrap">
          <GlassInput
            placeholder="Seu nome completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            icon={User}
            hasError={!!errors.name}
          />
          {errors.name && <p className="font-inter text-xs text-red-600 mt-1">{errors.name}</p>}
        </div>

        <div className="talent-form-input-wrap">
          <GlassInput
            type="tel"
            placeholder="(00) 00000-0000"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            icon={Phone}
            hasError={!!errors.phone}
          />
          {errors.phone && <p className="font-inter text-xs text-red-600 mt-1">{errors.phone}</p>}
        </div>

        <div className="talent-form-input-wrap">
          <div className="relative">
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none z-10" />
            <select
              className="talent-form-input w-full pl-4 pr-10 py-3.5 font-inter text-sm focus:outline-none transition appearance-none"
              style={{
                ...inputStyle,
                color: !form.area ? "#999" : "#0A0A0A",
                ...(errors.area ? { boxShadow: "0 0 0 2px rgba(239,68,68,0.5)" } : {}),
              }}
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
            >
              <option value="" disabled>Área de interesse</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {errors.area && <p className="font-inter text-xs text-red-600 mt-1">{errors.area}</p>}
        </div>

        <label className="talent-consent-label flex items-start gap-3 cursor-pointer">
          <div
            className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition ${
              form.consent ? "bg-[#0A0A0A] border-[#0A0A0A]" : "border-[#0A0A0A]/40 bg-white"
            }`}
            onClick={() => setForm({ ...form, consent: !form.consent })}
          >
            {form.consent && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="talent-consent-text font-inter text-xs text-[#0A0A0A]/80 leading-tight">
            Concordo em receber mensagens de vagas disponíveis via WhatsApp
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="talent-submit-btn w-full py-4 rounded-lg font-inter font-bold text-base text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 flex items-center justify-center gap-2"
          style={{ backgroundColor: "#0A0A0A" }}
        >
          {loading ? <><Loader2 size={20} className="animate-spin" /> Enviando...</> : "Finalizar Cadastro"}
        </button>
        {submitError && (
          <p className="font-inter text-center" style={{ fontSize: "13px", color: "#ff4444", marginTop: "4px" }}>
            {submitError}
          </p>
        )}
      </form>
    </motion.div>
  );
}