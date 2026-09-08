"use client";
import { usePerformance } from "@/context/PerformanceContext";
import { Zap, ZapOff } from "lucide-react";

export default function PowerToggle() {
  const { lowPowerMode, setLowPowerMode } = usePerformance();

  return (
    <button
      onClick={() => setLowPowerMode(!lowPowerMode)}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900/80 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-zinc-800 border border-zinc-800 shadow-xl"
      title={lowPowerMode ? "Enable High Performance (WebGL)" : "Enable Low Power Mode (CSS Only)"}
    >
      {lowPowerMode ? <ZapOff className="text-zinc-500" size={20} /> : <Zap className="text-yellow-400" size={20} />}
    </button>
  );
}
