"use client";
import Image from "next/image";
import { usePerformance } from "@/context/PerformanceContext";
import AsteriaBackground from "./AsteriaBackground"; // Adjust path if needed

export default function DynamicBackground() {
  const { lowPowerMode } = usePerformance();
  
  if (lowPowerMode) {
    return <div className="fixed inset-0 z-0 bg-gradient-to-br from-zinc-950 to-zinc-900" />;
  }
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#0a0510]">
      {/* Hyper-realistic Milky Way Background */}
      <Image 
        src="/images/milky_way_bg.jpg"
        alt="Milky Way Galaxy Background"
        fill
        className="object-cover opacity-60"
        priority
      />
      <AsteriaBackground />
    </div>
  );
}
