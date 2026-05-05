import React from "react";

export default function VideoBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      <iframe
        src="https://www.youtube.com/embed/N4EdIDdHOZQ?autoplay=1&mute=1&loop=1&playlist=N4EdIDdHOZQ&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
        title="Log Lab Background"
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          transform: "scale(1.4)",
          transformOrigin: "center center",
          border: "none",
        }}
      />
      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1 }}
      />
    </div>
  );
}