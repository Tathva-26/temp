"use client";
import { useState } from "react";

export default function TiltCard(props) {
  const [state, setState] = useState({
    rotateX: 0,
    rotateY: 0,
    mouseX: 0,
    mouseY: 0,
    isHovered: false,
  });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Max 15 degree tilt
    const rotateX = -((y - centerY) / centerY) * 15;
    const rotateY = ((x - centerX) / centerX) * 15;
    
    setState({ rotateX, rotateY, mouseX: x, mouseY: y, isHovered: true });
  };

  const handleMouseLeave = () => {
    setState({ rotateX: 0, rotateY: 0, mouseX: 0, mouseY: 0, isHovered: false });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px" }}
      className="w-full"
    >
      <div
        style={{
          transform: `rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg)`,
        }}
        className="relative w-full h-[400px] bg-zinc-950/60 backdrop-blur-md border border-cyan-500/30 rounded-2xl overflow-hidden transition-transform duration-200 ease-out flex flex-col justify-end p-8"
      >
        {/* Smart-Glass Glare */}
        <div
          className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 ${
            state.isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: `radial-gradient(circle at ${state.mouseX}px ${state.mouseY}px, rgba(0, 255, 255, 0.15) 0%, transparent 60%)`,
          }}
        />
        
        {/* Content */}
        <div className="relative z-20">
          <h3 className="text-2xl font-bold text-white mb-2">{props.title}</h3>
          <p className="text-cyan-400 text-sm font-mono mb-4">
            {props.category}
          </p>
          <p className="text-zinc-400">{props.description}</p>
        </div>
      </div>
    </div>
  );
}
