import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player/youtube";

function FallbackBackground() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: "linear-gradient(135deg, #0A0A0A 0%, #1a1a2e 40%, #16213e 100%)",
        backgroundImage: `
          linear-gradient(135deg, #0A0A0A 0%, #1a1a2e 40%, #16213e 100%),
          radial-gradient(circle, rgba(245,184,0,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 28px 28px",
        backgroundBlendMode: "normal",
      }}
    />
  );
}

export default function VideoBackground() {
  const [error, setError] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (!wrapperRef.current) return;
      const offset = window.scrollY * 0.4;
      wrapperRef.current.style.transform = `translate(-50%, -50%) scale(1.5) translateY(${offset}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {error ? (
        <FallbackBackground />
      ) : (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <div
            ref={wrapperRef}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) scale(1.5)",
              width: "100%",
              height: "100%",
              minWidth: "100%",
              minHeight: "100%",
            }}
          >
            <ReactPlayer
              url="https://www.youtube.com/watch?v=N4EdIDdHOZQ"
              playing={true}
              muted={true}
              loop={true}
              playsinline={true}
              controls={false}
              width="100%"
              height="100%"
              onError={() => setError(true)}
              config={{
                youtube: {
                  playerVars: {
                    autoplay: 1,
                    mute: 1,
                    loop: 1,
                    controls: 0,
                    showinfo: 0,
                    rel: 0,
                    modestbranding: 1,
                    playlist: "N4EdIDdHOZQ",
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Scan line texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
          pointerEvents: "none",
          opacity: 0.4,
          zIndex: 1,
        }}
      />

      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 2 }} />

      {/* Top vignette */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "120px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Bottom vignette */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "200px",
          background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />
    </div>
  );
}