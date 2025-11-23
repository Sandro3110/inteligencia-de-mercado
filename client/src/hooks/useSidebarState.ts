import { useState, useEffect } from "react";

const STORAGE_KEY = "sidebar-collapsed";

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "true";
  });

  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent<{ collapsed: boolean }>) => {
      setCollapsed(e.detail.collapsed);
    };

    window.addEventListener(
      "sidebar-toggle",
      handleSidebarToggle as EventListener
    );
    return () =>
      window.removeEventListener(
        "sidebar-toggle",
        handleSidebarToggle as EventListener
      );
  }, []);

  return { collapsed, sidebarClass: collapsed ? "ml-16" : "ml-60" };
}
