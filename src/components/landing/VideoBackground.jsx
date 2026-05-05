import React, { useState } from "react";
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

  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {error ? (
        <FallbackBackground />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
          }}
        >
          <div
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

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1 }}
      />
    </div>
  );
}