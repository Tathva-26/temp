"use client";
import { createContext, useContext, useState, useEffect } from "react";

const PerformanceContext = createContext();

export function PerformanceProvider({ children }) {
  const [lowPowerMode, setLowPowerMode] = useState(false);

  useEffect(() => {
    // Auto-detect system accessibility preferences for reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setLowPowerMode(true);
    }
  }, []);

  return (
    <PerformanceContext.Provider value={{ lowPowerMode, setLowPowerMode }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export const usePerformance = () => useContext(PerformanceContext);
