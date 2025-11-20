import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { GlobalSearch } from "./GlobalSearch";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

export function GlobalShortcuts() {
  const [, setLocation] = useLocation();
  const [showHelp, setShowHelp] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Listener para evento customizado de mostrar ajuda
  useEffect(() => {
    const handleShowHelp = () => setShowHelp(true);
    window.addEventListener("show-shortcuts-help" as any, handleShowHelp);
    return () => window.removeEventListener("show-shortcuts-help" as any, handleShowHelp);
  }, []);

  useKeyboardShortcuts([
    {
      key: "k",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        setShowSearch(true);
      },
      description: "Busca global"
    },
    {
      key: "n",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        setLocation("/enrichment");
      },
      description: "Novo projeto de enriquecimento"
    },
    {
      key: "/",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        setShowHelp(true);
      },
      description: "Mostrar atalhos disponíveis"
    },
    {
      key: "?",
      handler: (e) => {
        e.preventDefault();
        setShowHelp(true);
      },
      description: "Mostrar atalhos disponíveis"
    },
    {
      key: "1",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        setLocation("/dashboard");
      },
      description: "Navegar para Dashboard"
    },
    {
      key: "2",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        setLocation("/mercados");
      },
      description: "Navegar para Mercados"
    },
    {
      key: "3",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        setLocation("/analytics");
      },
      description: "Navegar para Analytics"
    },
    {
      key: "4",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        setLocation("/roi");
      },
      description: "Navegar para ROI"
    },
    {
      key: "b",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        const event = new CustomEvent('toggle-sidebar');
        window.dispatchEvent(event);
      },
      description: "Toggle sidebar (expandir/colapsar)"
    },
  ]);

  const shortcuts = [
    { keys: ["Ctrl", "1"], description: "Navegar para Dashboard" },
    { keys: ["Ctrl", "2"], description: "Navegar para Mercados" },
    { keys: ["Ctrl", "3"], description: "Navegar para Analytics" },
    { keys: ["Ctrl", "4"], description: "Navegar para ROI" },
    { keys: ["Ctrl", "B"], description: "Toggle sidebar (expandir/colapsar)" },
    { keys: ["Ctrl", "K"], description: "Busca global" },
    { keys: ["Ctrl", "N"], description: "Novo projeto de enriquecimento" },
    { keys: ["Ctrl", "/"], description: "Mostrar atalhos" },
    { keys: ["?"], description: "Mostrar atalhos" },
    { keys: ["Esc"], description: "Fechar modal/dialog" },
  ];

  return (
    <>
      <GlobalSearch open={showSearch} onOpenChange={setShowSearch} />
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Atalhos de Teclado</DialogTitle>
          <DialogDescription>
            Use estes atalhos para navegar mais rapidamente pelo sistema
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-foreground">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <span className="text-muted-foreground text-xs">+</span>}
                    <Kbd>{key}</Kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          Pressione <Kbd>Esc</Kbd> para fechar esta janela
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
