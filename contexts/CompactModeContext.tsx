"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CompactModeContextType {
  isCompact: boolean;
  toggleCompact: () => void;
  setCompact: (value: boolean) => void;
}

const CompactModeContext = createContext<CompactModeContextType | undefined>(undefined);

export function CompactModeProvider({ children }: { children: ReactNode }) {
  const [isCompactMode, setIsCompactMode] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem("compactMode");
    if (stored) {
      setIsCompactMode(stored === "true");
    }
  }, []);

  const toggleCompactMode = () => {
    setIsCompactMode((prev) => {
      const newValue = !prev;
      localStorage.setItem("compactMode", String(newValue));
      return newValue;
    });
  };

  const setCompactMode = (value: boolean) => {
    setIsCompactMode(value);
    localStorage.setItem("compactMode", String(value));
  };

  return (
    <CompactModeContext.Provider value={{ isCompact: isCompactMode, toggleCompact: toggleCompactMode, setCompact: setCompactMode }}>
      {children}
    </CompactModeContext.Provider>
  );
}

export function useCompactMode() {
  const context = useContext(CompactModeContext);
  if (context === undefined) {
    throw new Error("useCompactMode must be used within a CompactModeProvider");
  }
  return context;
}
