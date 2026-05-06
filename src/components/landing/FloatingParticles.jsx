import React, { useMemo } from "react";

const N = 20;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: N }, (_, i) => ({
      id: i,
      size: randomBetween(2, 5),
      top: randomBetween(5, 90),
      left: randomBetween(2, 98),
      opacity: randomBetween(0.2, 0.5),
      duration: randomBetween(4, 9),
      delay: randomBetween(0, 5),
      blink: i % 4 === 0,
    }));
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2,
        overflow: "hidden",
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            backgroundColor: "#F5B800",
            opacity: p.opacity,
            animation: p.blink
              ? `particleFloat ${p.duration}s ${p.delay}s ease-in-out infinite, particleBlink ${p.duration * 0.7}s ${p.delay}s ease-in-out infinite`
              : `particleFloat ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}

      <style>{`
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes particleBlink {
          0%, 100% { opacity: var(--op, 0.3); }
          50% { opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}