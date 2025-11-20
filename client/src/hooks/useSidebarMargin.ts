import { useEffect, useState } from "react";

const STORAGE_KEY = 'sidebar-collapsed';

/**
 * Hook para obter a margem esquerda adequada baseado no estado do sidebar
 * Sincroniza com o estado do sidebar via localStorage e eventos
 */
export function useSidebarMargin() {
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent<{ collapsed: boolean }>) => {
      setCollapsed(e.detail.collapsed);
    };

    window.addEventListener('sidebar-toggle' as any, handleSidebarToggle);
    return () => window.removeEventListener('sidebar-toggle' as any, handleSidebarToggle);
  }, []);

  // Retorna classes Tailwind apropriadas
  return collapsed ? 'ml-16' : 'ml-60';
}
