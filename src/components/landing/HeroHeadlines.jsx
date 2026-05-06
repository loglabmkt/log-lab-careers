import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import useTypewriter from "@/hooks/useTypewriter";

const FIXED_PARTS = [
  "Junte-se a nós,",
  "Construa o futuro,",
  "Inove com propósito,",
  "Faça parte da mudança,",
  "Tecnologia com alma,",
];

const TYPED_PARTS = [
  "seja #log",
  "seja #log",
  "seja #log",
  "seja #log",
  "seja #log",
];

export default function HeroHeadlines() {
  const typed = useTypewriter(TYPED_PARTS, 60, 2000, 30);

  return (
    <div className="min-h-[130px] md:min-h-[140px]">
      <h1 className="font-inter font-bold text-[36px] md:text-[58px] text-white leading-[1.1]">
        <AnimatePresence mode="wait">
          <motion.span
            key={typed.length > 0 ? typed[0] : "empty"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="block"
          >
            {FIXED_PARTS[0]}
          </motion.span>
        </AnimatePresence>
        <span style={{ color: "#F5B800" }}>
          {typed}
          <span className="cursor-blink">|</span>
        </span>
      </h1>
    </div>
  );
}