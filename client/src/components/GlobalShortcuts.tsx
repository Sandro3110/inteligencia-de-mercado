import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { GlobalSearch } from "./GlobalSearch";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useGlobalRefresh } from "@/hooks/useGlobalRefresh";
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
  const { refreshAll } = useGlobalRefresh({ enableKeyboardShortcut: false }); // Desabilita Ctrl+R interno do hook

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
    {
      key: "r",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        refreshAll(false); // Refresh com feedback visual
      },
      description: "Atualizar dados (refresh manual)"
    },
    {
      key: "p",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        // Dispara evento para abrir seletor de projetos
        const event = new CustomEvent('open-project-selector');
        window.dispatchEvent(event);
      },
      description: "Abrir seletor de projetos"
    },
    {
      key: "s",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        // Dispara evento para abrir seletor de pesquisas
        const event = new CustomEvent('open-pesquisa-selector');
        window.dispatchEvent(event);
      },
      description: "Abrir seletor de pesquisas"
    },
    {
      key: "m",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        setLocation("/mercados");
      },
      description: "Ir para Mercados"
    },
    {
      key: "e",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        setLocation("/export-history");
      },
      description: "Ir para Exportação"
    },
    {
      key: "g",
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        setLocation("/projetos");
      },
      description: "Ir para Gerenciar Projetos"
    },
  ]);

  const shortcuts = [
    // Navegação Principal
    { keys: ["Ctrl", "1"], description: "Navegar para Dashboard", category: "Navegação" },
    { keys: ["Ctrl", "M"], description: "Ir para Mercados", category: "Navegação" },
    { keys: ["Ctrl", "3"], description: "Navegar para Analytics", category: "Navegação" },
    { keys: ["Ctrl", "4"], description: "Navegar para ROI", category: "Navegação" },
    { keys: ["Ctrl", "E"], description: "Ir para Exportação", category: "Navegação" },
    { keys: ["Ctrl", "G"], description: "Ir para Gerenciar Projetos", category: "Navegação" },
    
    // Ações Rápidas
    { keys: ["Ctrl", "R"], description: "Atualizar dados (refresh manual)", category: "Ações" },
    { keys: ["Ctrl", "K"], description: "Busca global", category: "Ações" },
    { keys: ["Ctrl", "N"], description: "Novo projeto de enriquecimento", category: "Ações" },
    { keys: ["Ctrl", "P"], description: "Abrir seletor de projetos", category: "Ações" },
    { keys: ["Ctrl", "S"], description: "Abrir seletor de pesquisas", category: "Ações" },
    
    // Interface
    { keys: ["Ctrl", "B"], description: "Toggle sidebar (expandir/colapsar)", category: "Interface" },
    { keys: ["Ctrl", "/"], description: "Mostrar atalhos", category: "Interface" },
    { keys: ["?"], description: "Mostrar atalhos", category: "Interface" },
    { keys: ["Esc"], description: "Fechar modal/dialog", category: "Interface" },
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
        
        <div className="space-y-6 mt-4">
          {/* Agrupar por categoria */}
          {["Navegação", "Ações", "Interface"].map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                {category === "Navegação" && "🧭"}
                {category === "Ações" && "⚡"}
                {category === "Interface" && "🏛️"}
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
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
