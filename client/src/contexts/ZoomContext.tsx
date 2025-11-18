import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ZoomLevel = 80 | 90 | 100 | 110;

interface ZoomContextType {
  zoomLevel: ZoomLevel;
  setZoomLevel: (level: ZoomLevel) => void;
}

const ZoomContext = createContext<ZoomContextType | undefined>(undefined);

export function ZoomProvider({ children }: { children: ReactNode }) {
  const [zoomLevel, setZoomLevelState] = useState<ZoomLevel>(() => {
    const stored = localStorage.getItem("zoomLevel");
    return (stored ? parseInt(stored) : 100) as ZoomLevel;
  });

  useEffect(() => {
    localStorage.setItem("zoomLevel", String(zoomLevel));
    
    // Aplicar zoom no root
    document.documentElement.style.fontSize = `${zoomLevel}%`;
  }, [zoomLevel]);

  const setZoomLevel = (level: ZoomLevel) => {
    setZoomLevelState(level);
  };

  return (
    <ZoomContext.Provider value={{ zoomLevel, setZoomLevel }}>
      {children}
    </ZoomContext.Provider>
  );
}

export function useZoom() {
  const context = useContext(ZoomContext);
  if (!context) {
    throw new Error("useZoom must be used within ZoomProvider");
  }
  return context;
}
