import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HEADLINES = [
  { before: "Junte-se a nós,", highlight: "seja #log" },
  { before: "Construa o futuro,", highlight: "seja #log" },
  { before: "Inove com propósito,", highlight: "seja #log" },
  { before: "Faça parte da mudança,", highlight: "seja #log" },
  { before: "Tecnologia com alma,", highlight: "seja #log" },
];

export default function HeroHeadlines() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HEADLINES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[130px] md:h-[140px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <h1
            className="font-titillium font-bold text-[32px] md:text-[52px] text-white leading-[1.1]"
          >
            {HEADLINES[index].before}
            <br />
            <span style={{ color: "#F5B800" }}>
              {HEADLINES[index].highlight}
            </span>
          </h1>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}