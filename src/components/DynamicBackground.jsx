"use client";
import { usePerformance } from "@/context/PerformanceContext";
import AsteriaBackground from "./AsteriaBackground"; // Adjust path if needed

export default function DynamicBackground() {
  const { lowPowerMode } = usePerformance();
  
  if (lowPowerMode) {
    return <div className="fixed inset-0 -z-50 bg-gradient-to-br from-zinc-950 to-zinc-900" />;
  }
  return <AsteriaBackground />;
}
