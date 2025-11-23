import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface CompactModeContextType {
  isCompact: boolean;
  toggleCompact: () => void;
}

const CompactModeContext = createContext<CompactModeContextType | undefined>(
  undefined
);

export function CompactModeProvider({ children }: { children: ReactNode }) {
  const [isCompact, setIsCompact] = useState(() => {
    const stored = localStorage.getItem("compactMode");
    return stored === "true";
  });

  useEffect(() => {
    localStorage.setItem("compactMode", String(isCompact));

    // Aplicar classe no root para ajustar espaçamentos globalmente
    if (isCompact) {
      document.documentElement.classList.add("compact-mode");
    } else {
      document.documentElement.classList.remove("compact-mode");
    }
  }, [isCompact]);

  const toggleCompact = () => setIsCompact(prev => !prev);

  return (
    <CompactModeContext.Provider value={{ isCompact, toggleCompact }}>
      {children}
    </CompactModeContext.Provider>
  );
}

export function useCompactMode() {
  const context = useContext(CompactModeContext);
  if (!context) {
    throw new Error("useCompactMode must be used within CompactModeProvider");
  }
  return context;
}
