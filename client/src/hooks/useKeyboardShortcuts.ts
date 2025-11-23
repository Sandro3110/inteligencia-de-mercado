import { useEffect } from "react";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
}

/**
 * Hook para gerenciar atalhos de teclado globais
 *
 * Exemplo de uso:
 * ```ts
 * useKeyboardShortcuts([
 *   { key: 'k', ctrl: true, handler: () => openSearch(), description: 'Abrir busca' },
 *   { key: '/', handler: () => focusSearch(), description: 'Focar na busca' },
 * ]);
 * ```
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch =
          shortcut.ctrl === undefined ||
          shortcut.ctrl === (event.ctrlKey || event.metaKey);
        const shiftMatch =
          shortcut.shift === undefined || shortcut.shift === event.shiftKey;
        const altMatch =
          shortcut.alt === undefined || shortcut.alt === event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          // Prevenir comportamento padrão apenas se não for input/textarea
          const target = event.target as HTMLElement;
          const isInput =
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable;

          // Permitir Ctrl+K mesmo em inputs
          if (shortcut.ctrl && shortcut.key === "k") {
            event.preventDefault();
            shortcut.handler(event);
            return;
          }

          // Para outros atalhos, não executar se estiver em input
          if (!isInput) {
            event.preventDefault();
            shortcut.handler(event);
            return;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

/**
 * Hook para gerenciar navegação por setas em listas
 */
export function useListNavigation(options: {
  itemCount: number;
  onSelect: (index: number) => void;
  onActivate: (index: number) => void;
  enabled?: boolean;
}) {
  const { itemCount, onSelect, onActivate, enabled = true } = options;

  useEffect(() => {
    if (!enabled || itemCount === 0) return;

    let selectedIndex = -1;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isInput) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, itemCount - 1);
          onSelect(selectedIndex);
          break;

        case "ArrowUp":
          event.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, 0);
          onSelect(selectedIndex);
          break;

        case "Enter":
          if (selectedIndex >= 0) {
            event.preventDefault();
            onActivate(selectedIndex);
          }
          break;

        case "Escape":
          selectedIndex = -1;
          onSelect(-1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [itemCount, onSelect, onActivate, enabled]);
}

/**
 * Lista de todos os atalhos disponíveis no sistema
 */
export const KEYBOARD_SHORTCUTS = [
  { key: "k", ctrl: true, description: "Abrir busca rápida" },
  { key: "/", description: "Focar no campo de busca" },
  { key: "Escape", description: "Fechar modals e popups" },
  { key: "?", description: "Mostrar ajuda de atalhos" },
  { key: "ArrowUp", description: "Navegar para item anterior" },
  { key: "ArrowDown", description: "Navegar para próximo item" },
  { key: "ArrowLeft", description: "Voltar página" },
  { key: "ArrowRight", description: "Avançar página" },
  { key: "Enter", description: "Abrir item selecionado" },
  { key: "Space", description: "Marcar/desmarcar checkbox" },
] as const;
