import React, { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, User, Phone, ChevronDown, Loader2, CheckCircle } from "lucide-react";

const AREAS = [
  "Tecnologia",
  "Design",
  "Marketing",
  "Comercial",
  "Operações",
  "RH",
  "Outros",
];

export default function TalentForm() {
  const [form, setForm] = useState({ name: "", phone: "", area: "", consent: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    setErrors({});
    setLoading(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
  };

  const inputClass = (field) =>
    `w-full pl-11 pr-4 py-3.5 rounded-lg font-titillium text-sm text-[#0A0A0A] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]/20 transition ${
      errors[field] ? "ring-2 ring-red-400" : ""
    }`;

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[380px]"
        style={{ backgroundColor: "#F5B800", boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}
      >
        <CheckCircle size={48} className="text-[#0A0A0A] mb-4" />
        <p className="font-titillium font-bold text-xl text-[#0A0A0A]">
          Cadastro realizado!
        </p>
        <p className="font-titillium text-sm text-[#3a3a3a] mt-2">
          Em breve entraremos em contato.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
      className="rounded-2xl p-8"
      style={{ backgroundColor: "#F5B800", boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Briefcase size={20} className="text-[#0A0A0A]" />
        <span className="font-titillium font-semibold text-base text-[#0A0A0A]">
          Cadastre-se em nosso banco de talentos
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              placeholder="Seu nome completo"
              className={inputClass("name")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          {errors.name && (
            <p className="font-titillium text-xs text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <div className="relative">
            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              type="tel"
              placeholder="(00) 00000-0000"
              className={inputClass("phone")}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          {errors.phone && (
            <p className="font-titillium text-xs text-red-600 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Area dropdown */}
        <div>
          <div className="relative">
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
            <select
              className={`${inputClass("area")} appearance-none pl-4 ${
                !form.area ? "text-[#999]" : "text-[#0A0A0A]"
              }`}
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
            >
              <option value="" disabled>
                Área de interesse
              </option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          {errors.area && (
            <p className="font-titillium text-xs text-red-600 mt-1">{errors.area}</p>
          )}
        </div>

        {/* Consent */}
        <label className="flex items-start gap-3 cursor-pointer">
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
          <span className="font-titillium text-xs text-[#0A0A0A]/80 leading-tight">
            Concordo em receber mensagens de vagas disponíveis via WhatsApp
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-lg font-titillium font-bold text-base text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 flex items-center justify-center gap-2"
          style={{ backgroundColor: "#0A0A0A" }}
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            "Finalizar Cadastro"
          )}
        </button>
      </form>
    </motion.div>
  );
}