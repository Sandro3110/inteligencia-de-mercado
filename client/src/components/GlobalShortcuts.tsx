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
  const [gPressed, setGPressed] = useState(false);

  // Reset G key after 1 second
  useEffect(() => {
    if (gPressed) {
      const timer = setTimeout(() => setGPressed(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [gPressed]);

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
    // Gmail-style navigation (G + key)
    {
      key: "g",
      handler: (e) => {
        e.preventDefault();
        setGPressed(true);
      },
      description: "Ativar modo de navegação rápida"
    },
    {
      key: "h",
      handler: (e) => {
        if (gPressed) {
          e.preventDefault();
          setLocation("/");
          setGPressed(false);
        }
      },
      description: "G+H: Ir para Home"
    },
    {
      key: "p",
      handler: (e) => {
        if (gPressed) {
          e.preventDefault();
          setLocation("/projetos");
          setGPressed(false);
        }
      },
      description: "G+P: Ir para Projetos"
    },
    {
      key: "m",
      handler: (e) => {
        if (gPressed) {
          e.preventDefault();
          setLocation("/mercados");
          setGPressed(false);
        }
      },
      description: "G+M: Ir para Mercados"
    },
    {
      key: "a",
      handler: (e) => {
        if (gPressed) {
          e.preventDefault();
          setLocation("/analytics");
          setGPressed(false);
        }
      },
      description: "G+A: Ir para Analytics"
    },
    {
      key: "e",
      handler: (e) => {
        if (gPressed) {
          e.preventDefault();
          setLocation("/enrichment");
          setGPressed(false);
        }
      },
      description: "G+E: Ir para Enriquecimento"
    },
    {
      key: "r",
      handler: (e) => {
        if (gPressed) {
          e.preventDefault();
          setLocation("/relatorios");
          setGPressed(false);
        }
      },
      description: "G+R: Ir para Relatórios"
    },
    {
      key: "n",
      handler: (e) => {
        if (gPressed) {
          e.preventDefault();
          setLocation("/notificacoes");
          setGPressed(false);
        }
      },
      description: "G+N: Ir para Notificações"
    },
    {
      key: "s",
      handler: (e) => {
        if (gPressed) {
          e.preventDefault();
          setLocation("/configuracoes/sistema");
          setGPressed(false);
        }
      },
      description: "G+S: Ir para Configurações"
    },
  ]);

  const shortcuts = [
    { category: "Navegação Rápida", items: [
      { keys: ["G", "H"], description: "Ir para Home" },
      { keys: ["G", "P"], description: "Ir para Projetos" },
      { keys: ["G", "M"], description: "Ir para Mercados" },
      { keys: ["G", "A"], description: "Ir para Analytics" },
      { keys: ["G", "E"], description: "Ir para Enriquecimento" },
      { keys: ["G", "R"], description: "Ir para Relatórios" },
      { keys: ["G", "N"], description: "Ir para Notificações" },
      { keys: ["G", "S"], description: "Ir para Configurações" },
    ]},
    { category: "Navegação Numérica", items: [
      { keys: ["Ctrl", "1"], description: "Dashboard" },
      { keys: ["Ctrl", "2"], description: "Mercados" },
      { keys: ["Ctrl", "3"], description: "Analytics" },
      { keys: ["Ctrl", "4"], description: "ROI" },
    ]},
    { category: "Ações", items: [
      { keys: ["Ctrl", "K"], description: "Busca global" },
      { keys: ["Ctrl", "N"], description: "Novo projeto de enriquecimento" },
      { keys: ["Ctrl", "B"], description: "Toggle sidebar" },
    ]},
    { category: "Ajuda", items: [
      { keys: ["Ctrl", "/"], description: "Mostrar atalhos" },
      { keys: ["?"], description: "Mostrar atalhos" },
      { keys: ["Esc"], description: "Fechar modal/dialog" },
    ]},
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
          {shortcuts.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="text-sm font-semibold text-foreground mb-3">{section.category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.items.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-muted-foreground text-xs">→</span>}
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
