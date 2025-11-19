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
      key: "h",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        setLocation("/");
      },
      description: "Ir para Início"
    },
    {
      key: "d",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        setLocation("/dashboard");
      },
      description: "Ir para Dashboard"
    },
    {
      key: "a",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        setLocation("/analytics");
      },
      description: "Ir para Analytics"
    },
    {
      key: "r",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        setLocation("/roi");
      },
      description: "Ir para ROI"
    },
    {
      key: "f",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        setLocation("/funil");
      },
      description: "Ir para Funil"
    },
  ]);

  const shortcuts = [
    { keys: ["Ctrl", "K"], description: "Busca global" },
    { keys: ["Ctrl", "N"], description: "Novo projeto de enriquecimento" },
    { keys: ["Ctrl", "H"], description: "Ir para Início" },
    { keys: ["Ctrl", "D"], description: "Ir para Dashboard" },
    { keys: ["Ctrl", "A"], description: "Ir para Analytics" },
    { keys: ["Ctrl", "R"], description: "Ir para ROI" },
    { keys: ["Ctrl", "F"], description: "Ir para Funil" },
    { keys: ["Ctrl", "/"], description: "Mostrar atalhos" },
    { keys: ["?"], description: "Mostrar atalhos" },
    { keys: ["Esc"], description: "Fechar modal/dialog" },
    { keys: ["↑", "↓"], description: "Navegar em listas" },
    { keys: ["Enter"], description: "Confirmar ação" },
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
