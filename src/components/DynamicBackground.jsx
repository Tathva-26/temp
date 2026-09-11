"use client";
import { usePerformance } from "@/context/PerformanceContext";
import AsteriaBackground from "./AsteriaBackground"; // Adjust path if needed

export default function DynamicBackground() {
  const { lowPowerMode } = usePerformance();
  
  if (lowPowerMode) {
    return <div className="fixed inset-0 z-0 bg-gradient-to-br from-zinc-950 to-zinc-900" />;
  }
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Subtle Milky Way / Nebula Background Wash */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          background: `
            linear-gradient(150deg, rgba(10, 5, 20, 0) 35%, rgba(60, 20, 120, 0.25) 45%, rgba(120, 40, 200, 0.3) 50%, rgba(40, 100, 220, 0.25) 55%, rgba(10, 5, 20, 0) 65%),
            radial-gradient(ellipse 100% 30% at 50% 50%, rgba(180, 50, 150, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 70% 30%, rgba(40, 120, 220, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 30% 70%, rgba(120, 40, 200, 0.15) 0%, transparent 50%)
          `,
          filter: 'blur(40px)',
          transform: 'scale(1.2)'
        }}
      />
      <AsteriaBackground />
    </div>
  );
}
