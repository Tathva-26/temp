"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { usePerformance } from "@/context/PerformanceContext";

export default function Template({ children }) {
  const containerRef = useRef(null);
  const { lowPowerMode } = usePerformance();

  useEffect(() => {
    // Skip animation if Low Power Mode is on
    if (lowPowerMode) {
      gsap.set(containerRef.current, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, [lowPowerMode]);

  return (
    <div ref={containerRef} className="w-full">
      {children}
    </div>
  );
}
