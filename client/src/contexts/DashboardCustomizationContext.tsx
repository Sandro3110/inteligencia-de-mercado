import React, { createContext, useContext, useState, useEffect } from "react";
import { Layout } from "react-grid-layout";

export interface DashboardWidget {
  id: string;
  title: string;
  visible: boolean;
}

interface DashboardCustomizationContextType {
  layout: Layout[];
  setLayout: (layout: Layout[]) => void;
  widgets: DashboardWidget[];
  toggleWidget: (id: string) => void;
  resetLayout: () => void;
}

const DashboardCustomizationContext = createContext<DashboardCustomizationContextType | undefined>(undefined);

const LAYOUT_KEY = "gestor-pav-dashboard-layout";
const WIDGETS_KEY = "gestor-pav-dashboard-widgets";

// Layout padrão
const defaultLayout: Layout[] = [
  { i: "mercados", x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "clientes", x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "concorrentes", x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "leads", x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: "chart-evolution", x: 0, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
  { i: "chart-distribution", x: 6, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
];

const defaultWidgets: DashboardWidget[] = [
  { id: "mercados", title: "Mercados", visible: true },
  { id: "clientes", title: "Clientes", visible: true },
  { id: "concorrentes", title: "Concorrentes", visible: true },
  { id: "leads", title: "Leads", visible: true },
  { id: "chart-evolution", title: "Evolução Temporal", visible: true },
  { id: "chart-distribution", title: "Distribuição Geográfica", visible: true },
];

export function DashboardCustomizationProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayoutState] = useState<Layout[]>(() => {
    const saved = localStorage.getItem(LAYOUT_KEY);
    return saved ? JSON.parse(saved) : defaultLayout;
  });

  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    const saved = localStorage.getItem(WIDGETS_KEY);
    return saved ? JSON.parse(saved) : defaultWidgets;
  });

  // Salvar layout no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  }, [layout]);

  // Salvar widgets no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem(WIDGETS_KEY, JSON.stringify(widgets));
  }, [widgets]);

  const setLayout = (newLayout: Layout[]) => {
    setLayoutState(newLayout);
  };

  const toggleWidget = (id: string) => {
    setWidgets(prev =>
      prev.map(w => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  };

  const resetLayout = () => {
    setLayoutState(defaultLayout);
    setWidgets(defaultWidgets);
    localStorage.removeItem(LAYOUT_KEY);
    localStorage.removeItem(WIDGETS_KEY);
  };

  return (
    <DashboardCustomizationContext.Provider
      value={{
        layout,
        setLayout,
        widgets,
        toggleWidget,
        resetLayout,
      }}
    >
      {children}
    </DashboardCustomizationContext.Provider>
  );
}

export function useDashboardCustomization() {
  const context = useContext(DashboardCustomizationContext);
  if (!context) {
    throw new Error("useDashboardCustomization must be used within DashboardCustomizationProvider");
  }
  return context;
}
