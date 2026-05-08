import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEPOIMENTOS — edite os dados abaixo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const depoimentos = [
  {
    id: 1,
    nome: "Marina Costa",
    cargo: "Desenvolvedora Full Stack",
    tempoEmpresa: "3 anos na Log",
    foto: "https://i.pravatar.cc/150?img=47",
    texto: "A Log me deu espaço pra crescer de júnior a sênior em projetos que realmente importam. Aqui você não é mais um número.",
  },
  {
    id: 2,
    nome: "Rafael Mendes",
    cargo: "Tech Lead",
    tempoEmpresa: "5 anos na Log",
    foto: "https://i.pravatar.cc/150?img=12",
    texto: "O que mais me marca é a liberdade pra propor ideias e ver elas saindo do papel. Tem gestão que escuta de verdade.",
  },
  {
    id: 3,
    nome: "Juliana Santos",
    cargo: "Designer UX",
    tempoEmpresa: "2 anos na Log",
    foto: "https://i.pravatar.cc/150?img=32",
    texto: "Cheguei tímida e hoje lidero discussões de produto. O ambiente acolhedor faz toda a diferença pra quem está construindo carreira.",
  },
  {
    id: 4,
    nome: "Pedro Oliveira",
    cargo: "Analista de Sistemas",
    tempoEmpresa: "4 anos na Log",
    foto: "https://i.pravatar.cc/150?img=68",
    texto: "Aprendo algo novo todo dia. Trabalhar com tecnologia pública é desafiador e gratificante — sentir que o código que escrevo impacta milhões.",
  },
  {
    id: 5,
    nome: "Camila Ferreira",
    cargo: "Product Manager",
    tempoEmpresa: "1 ano na Log",
    foto: "https://i.pravatar.cc/150?img=45",
    texto: "Migrei de outra empresa e a diferença na cultura é gritante. Aqui as pessoas se importam — e isso reflete no resultado dos projetos.",
  },
  {
    id: 6,
    nome: "Thiago Almeida",
    cargo: "DevOps Engineer",
    tempoEmpresa: "6 anos na Log",
    foto: "https://i.pravatar.cc/150?img=15",
    texto: "A Log foi minha primeira empresa e me formou como profissional. Ver a empresa crescer e crescer junto é algo que não tem preço.",
  },
  {
    id: 7,
    nome: "Larissa Souza",
    cargo: "Analista de Dados",
    tempoEmpresa: "2 anos na Log",
    foto: "https://i.pravatar.cc/150?img=49",
    texto: "Plano de carreira claro, mentoria de qualidade e um time que vibra com nossas conquistas. Não tem coisa melhor pra começar uma carreira em dados.",
  },
  {
    id: 8,
    nome: "Eduardo Lima",
    cargo: "Arquiteto de Software",
    tempoEmpresa: "7 anos na Log",
    foto: "https://i.pravatar.cc/150?img=11",
    texto: "Já passei por outras empresas grandes e voltei pra Log. Aqui tem propósito, tem liberdade técnica e tem gente boa de verdade.",
  },
  {
    id: 9,
    nome: "Beatriz Rocha",
    cargo: "Recrutadora Tech",
    tempoEmpresa: "3 anos na Log",
    foto: "https://i.pravatar.cc/150?img=44",
    texto: 'Recruto pra Log Lab e converso com candidatos todos os dias. O que mais ouço de quem entra é: "achei que era marketing, mas é real".',
  },
];

function TestimonialCard({ dep }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#FFFFFF",
        border: `1px solid ${hovered ? "rgba(245,184,0,0.3)" : "rgba(0,0,0,0.06)"}`,
        borderRadius: "20px",
        padding: "32px 28px",
        boxShadow: hovered
          ? "0 16px 40px rgba(245,184,0,0.12)"
          : "0 4px 24px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 300ms ease",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Quote icon */}
      <Quote size={32} style={{ color: "#F5B800", opacity: 0.3, marginBottom: "16px", flexShrink: 0 }} />

      {/* Texto */}
      <p className="dep-texto font-inter" style={{
        fontSize: "15px", lineHeight: "1.7", color: "#333333",
        marginBottom: "24px", flex: 1,
      }}>
        {dep.texto}
      </p>

      {/* Estrelas */}
      <div style={{ display: "flex", gap: "2px", marginBottom: "20px" }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={14} fill="#F5B800" color="#F5B800" />
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(0,0,0,0.06)", marginBottom: "20px" }} />

      {/* Autor */}
      <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
        <img
          src={dep.foto}
          alt={dep.nome}
          style={{
            width: "48px", height: "48px", borderRadius: "50%",
            border: "2px solid #F5B800", objectFit: "cover", flexShrink: 0,
          }}
        />
        <div>
          <div className="dep-nome font-inter" style={{ fontWeight: 700, fontSize: "15px", color: "#0A0A0A" }}>
            {dep.nome}
          </div>
          <div className="dep-cargo font-inter" style={{ fontSize: "12px", color: "#777777" }}>
            {dep.cargo}
          </div>
          <div className="font-inter" style={{ fontSize: "11px", color: "#F5B800", fontWeight: 500, marginTop: "2px" }}>
            {dep.tempoEmpresa}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DepoimentosSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("next");
  const [visible, setVisible] = useState(true);
  const scrollRef = useRef(null);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const perPage = isMobile ? 1 : 3;
  const totalPages = Math.ceil(depoimentos.length / perPage);
  const visibleCards = depoimentos.slice(currentIndex * perPage, currentIndex * perPage + perPage);

  const navigate = (dir) => {
    if (animating) return;
    const next = dir === "next" ? currentIndex + 1 : currentIndex - 1;
    if (next < 0 || next >= totalPages) return;
    setDirection(dir);
    setAnimating(true);
    setVisible(false);
    setTimeout(() => {
      setCurrentIndex(next);
      setVisible(true);
      setTimeout(() => setAnimating(false), 300);
    }, 200);
  };

  const goTo = (idx) => {
    if (animating || idx === currentIndex) return;
    setDirection(idx > currentIndex ? "next" : "prev");
    setAnimating(true);
    setVisible(false);
    setTimeout(() => {
      setCurrentIndex(idx);
      setVisible(true);
      setTimeout(() => setAnimating(false), 300);
    }, 200);
  };

  const slideOut = direction === "next" ? "-20px" : "20px";
  const slideIn = direction === "next" ? "20px" : "-20px";

  return (
    <section
      id="depoimentos"
      style={{
        width: "100%",
        background: "linear-gradient(180deg, #FFFFFF 0%, #fefaee 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @media (min-width: 768px) {
          .dep-container { padding: 80px 48px !important; }
          .dep-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 480px) and (max-width: 767px) {
          .dep-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 767px) {
          .dep-container { padding: 48px 20px !important; }
          .dep-headline { font-size: 28px !important; }
          .dep-subtitle { font-size: 14px !important; margin-bottom: 32px !important; }
          .dep-texto { font-size: 14px !important; }
          .dep-nome { font-size: 14px !important; }
          .dep-cargo { font-size: 11px !important; }
        }
      `}</style>

      {/* Aspas decorativas */}
      <div style={{
        position: "absolute", top: "40px", left: "-40px",
        width: "200px", color: "rgba(245,184,0,0.06)",
        pointerEvents: "none", zIndex: 0,
      }}>
        <svg viewBox="0 0 100 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80V48C0 21.5 17 5.8 51 0l6 11C38 14.3 29.3 23 28 36h20v44H0zm52 0V48C52 21.5 69 5.8 103 0l6 11C90 14.3 81.3 23 80 36h20v44H52z"/>
        </svg>
      </div>

      {/* Blob */}
      <div className="blob-float" style={{
        position: "absolute", bottom: "-80px", right: "-80px",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(245,184,0,0.05) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none", zIndex: 0,
        animationDuration: "12s",
      }} />

      <div className="dep-container" style={{
        maxWidth: "1280px", width: "100%", margin: "0 auto",
        padding: "80px 48px", position: "relative", zIndex: 1,
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div className="font-inter" style={{
            display: "inline-block", background: "rgba(245,184,0,0.1)",
            border: "1px solid rgba(245,184,0,0.4)", color: "#F5B800",
            fontWeight: 600, fontSize: "13px", borderRadius: "20px",
            padding: "6px 16px", marginBottom: "16px",
          }}>
            ✦ Vozes da Log Lab
          </div>

          <h2 className="dep-headline font-inter" style={{
            fontWeight: 700, fontSize: "44px", lineHeight: "1.15",
            color: "#0A0A0A", margin: "0 0 16px", textAlign: "center",
          }}>
            O que dizem{" "}
            <span style={{ color: "#F5B800" }}>quem faz</span>{" "}
            a Log Lab acontecer.
          </h2>

          <p className="dep-subtitle font-inter" style={{
            fontSize: "16px", color: "#555555", lineHeight: "1.7",
            maxWidth: "540px", margin: "0 auto 56px", textAlign: "center",
          }}>
            Histórias reais de pessoas que escolheram construir suas carreiras com a gente.
          </p>
        </div>

        {/* Grid com animação */}
        <div
          className="dep-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "24px",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : `translateX(${slideOut})`,
            transition: visible
              ? "opacity 300ms ease-out, transform 300ms ease-out"
              : "opacity 200ms ease-out, transform 200ms ease-out",
          }}
        >
          {visibleCards.map((dep) => (
            <TestimonialCard key={dep.id} dep={dep} />
          ))}
        </div>

        {/* Controles */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "48px", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {/* Prev */}
            <button
              onClick={() => navigate("prev")}
              disabled={currentIndex === 0}
              style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                cursor: currentIndex === 0 ? "default" : "pointer",
                opacity: currentIndex === 0 ? 0.4 : 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 200ms ease",
              }}
              onMouseEnter={(e) => { if (currentIndex !== 0) { e.currentTarget.style.background = "#F5B800"; e.currentTarget.style.transform = "scale(1.05)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <ChevronLeft size={20} color="#0A0A0A" />
            </button>

            {/* Dots */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <div
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    height: "8px",
                    width: i === currentIndex ? "28px" : "8px",
                    borderRadius: "4px",
                    background: i === currentIndex ? "#F5B800" : "rgba(0,0,0,0.15)",
                    transition: "all 300ms ease",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>

            {/* Next */}
            <button
              onClick={() => navigate("next")}
              disabled={currentIndex === totalPages - 1}
              style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                cursor: currentIndex === totalPages - 1 ? "default" : "pointer",
                opacity: currentIndex === totalPages - 1 ? 0.4 : 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 200ms ease",
              }}
              onMouseEnter={(e) => { if (currentIndex !== totalPages - 1) { e.currentTarget.style.background = "#F5B800"; e.currentTarget.style.transform = "scale(1.05)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <ChevronRight size={20} color="#0A0A0A" />
            </button>
          </div>

          {/* Contador */}
          <p className="font-inter" style={{ fontSize: "12px", color: "#888888", margin: 0 }}>
            Página {currentIndex + 1} de {totalPages}
          </p>
        </div>
      </div>
    </section>
  );
}