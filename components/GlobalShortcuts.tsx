'use client';

/**
 * GlobalShortcuts - Atalhos Globais de Teclado
 * Gerencia atalhos de teclado para navegação rápida e ações do sistema
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { GlobalSearch } from './GlobalSearch';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';

// ============================================================================
// CONSTANTS
// ============================================================================

const G_KEY_TIMEOUT = 1000; // ms

const CUSTOM_EVENTS = {
  SHOW_SHORTCUTS_HELP: 'show-shortcuts-help',
  TOGGLE_SIDEBAR: 'toggle-sidebar',
} as const;

const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  MERCADOS: '/mercados',
  ANALYTICS: '/analytics',
  ROI: '/roi',
  PROJETOS: '/projetos',
  ENRICHMENT: '/enrichment',
  RELATORIOS: '/relatorios',
  NOTIFICACOES: '/notificacoes',
  CONFIGURACOES: '/configuracoes/sistema',
} as const;

const SHORTCUT_CATEGORIES = {
  QUICK_NAV: 'Navegação Rápida',
  NUMERIC_NAV: 'Navegação Numérica',
  ACTIONS: 'Ações',
  HELP: 'Ajuda',
} as const;

const LABELS = {
  DIALOG_TITLE: 'Atalhos de Teclado',
  DIALOG_DESCRIPTION:
    'Use estes atalhos para navegar mais rapidamente pelo sistema',
  CLOSE_HINT: 'Pressione',
  CLOSE_HINT_END: 'para fechar esta janela',
  SEPARATOR: '→',
} as const;

const DIALOG_CONFIG = {
  MAX_WIDTH: 'max-w-2xl',
  GRID_COLS: 'grid grid-cols-1 md:grid-cols-2 gap-3',
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  category: string;
  items: ShortcutItem[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function dispatchCustomEvent(eventName: string): void {
  const event = new CustomEvent(eventName);
  window.dispatchEvent(event);
}

function createNavigationHandler(
  setLocation: (path: string) => void,
  path: string
) {
  return (e: KeyboardEvent) => {
    e.preventDefault();
    setLocation(path);
  };
}

function createGNavigationHandler(
  gPressed: boolean,
  setGPressed: (value: boolean) => void,
  setLocation: (path: string) => void,
  path: string
) {
  return (e: KeyboardEvent) => {
    if (gPressed) {
      e.preventDefault();
      setLocation(path);
      setGPressed(false);
    }
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function GlobalShortcuts() {
  // ============================================================================
  // STATE
  // ============================================================================

  const [, setLocation] = useLocation();
  const [showHelp, setShowHelp] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [gPressed, setGPressed] = useState(false);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Reset G key after timeout
  useEffect(() => {
    if (gPressed) {
      const timer = setTimeout(() => setGPressed(false), G_KEY_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [gPressed]);

  // Listener para evento customizado de mostrar ajuda
  useEffect(() => {
    const handleShowHelp = () => setShowHelp(true);
    window.addEventListener(CUSTOM_EVENTS.SHOW_SHORTCUTS_HELP, handleShowHelp);
    return () =>
      window.removeEventListener(
        CUSTOM_EVENTS.SHOW_SHORTCUTS_HELP,
        handleShowHelp
      );
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const shortcutSections = useMemo<ShortcutSection[]>(
    () => [
      {
        category: SHORTCUT_CATEGORIES.QUICK_NAV,
        items: [
          { keys: ['G', 'H'], description: 'Ir para Home' },
          { keys: ['G', 'P'], description: 'Ir para Projetos' },
          { keys: ['G', 'M'], description: 'Ir para Mercados' },
          { keys: ['G', 'A'], description: 'Ir para Analytics' },
          { keys: ['G', 'E'], description: 'Ir para Enriquecimento' },
          { keys: ['G', 'R'], description: 'Ir para Relatórios' },
          { keys: ['G', 'N'], description: 'Ir para Notificações' },
          { keys: ['G', 'S'], description: 'Ir para Configurações' },
        ],
      },
      {
        category: SHORTCUT_CATEGORIES.NUMERIC_NAV,
        items: [
          { keys: ['Ctrl', '1'], description: 'Dashboard' },
          { keys: ['Ctrl', '2'], description: 'Mercados' },
          { keys: ['Ctrl', '3'], description: 'Analytics' },
          { keys: ['Ctrl', '4'], description: 'ROI' },
        ],
      },
      {
        category: SHORTCUT_CATEGORIES.ACTIONS,
        items: [
          { keys: ['Ctrl', 'K'], description: 'Busca global' },
          { keys: ['Ctrl', 'N'], description: 'Novo projeto de enriquecimento' },
          { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
        ],
      },
      {
        category: SHORTCUT_CATEGORIES.HELP,
        items: [
          { keys: ['Ctrl', '/'], description: 'Mostrar atalhos' },
          { keys: ['?'], description: 'Mostrar atalhos' },
          { keys: ['Esc'], description: 'Fechar modal/dialog' },
        ],
      },
    ],
    []
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleShowSearch = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    setShowSearch(true);
  }, []);

  const handleShowHelp = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    setShowHelp(true);
  }, []);

  const handleToggleSidebar = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    dispatchCustomEvent(CUSTOM_EVENTS.TOGGLE_SIDEBAR);
  }, []);

  const handleGPress = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    setGPressed(true);
  }, []);

  const handleSearchChange = useCallback((open: boolean) => {
    setShowSearch(open);
  }, []);

  const handleHelpChange = useCallback((open: boolean) => {
    setShowHelp(open);
  }, []);

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      callback: handleShowSearch,
      description: 'Busca global',
    },
    {
      key: 'n',
      ctrl: true,
      callback: createNavigationHandler(setLocation, ROUTES.ENRICHMENT),
      description: 'Novo projeto de enriquecimento',
    },
    {
      key: '/',
      ctrl: true,
      callback: handleShowHelp,
      description: 'Mostrar atalhos disponíveis',
    },
    {
      key: '?',
      callback: handleShowHelp,
      description: 'Mostrar atalhos disponíveis',
    },
    {
      key: '1',
      ctrl: true,
      callback: createNavigationHandler(setLocation, ROUTES.DASHBOARD),
      description: 'Navegar para Dashboard',
    },
    {
      key: '2',
      ctrl: true,
      callback: createNavigationHandler(setLocation, ROUTES.MERCADOS),
      description: 'Navegar para Mercados',
    },
    {
      key: '3',
      ctrl: true,
      callback: createNavigationHandler(setLocation, ROUTES.ANALYTICS),
      description: 'Navegar para Analytics',
    },
    {
      key: '4',
      ctrl: true,
      callback: createNavigationHandler(setLocation, ROUTES.ROI),
      description: 'Navegar para ROI',
    },
    {
      key: 'b',
      ctrl: true,
      callback: handleToggleSidebar,
      description: 'Toggle sidebar (expandir/colapsar)',
    },
    // Gmail-style navigation (G + key)
    {
      key: 'g',
      callback: handleGPress,
      description: 'Ativar modo de navegação rápida',
    },
    {
      key: 'h',
      callback: createGNavigationHandler(
        gPressed,
        setGPressed,
        setLocation,
        ROUTES.HOME
      ),
      description: 'G+H: Ir para Home',
    },
    {
      key: 'p',
      callback: createGNavigationHandler(
        gPressed,
        setGPressed,
        setLocation,
        ROUTES.PROJETOS
      ),
      description: 'G+P: Ir para Projetos',
    },
    {
      key: 'm',
      callback: createGNavigationHandler(
        gPressed,
        setGPressed,
        setLocation,
        ROUTES.MERCADOS
      ),
      description: 'G+M: Ir para Mercados',
    },
    {
      key: 'a',
      callback: createGNavigationHandler(
        gPressed,
        setGPressed,
        setLocation,
        ROUTES.ANALYTICS
      ),
      description: 'G+A: Ir para Analytics',
    },
    {
      key: 'e',
      callback: createGNavigationHandler(
        gPressed,
        setGPressed,
        setLocation,
        ROUTES.ENRICHMENT
      ),
      description: 'G+E: Ir para Enriquecimento',
    },
    {
      key: 'r',
      callback: createGNavigationHandler(
        gPressed,
        setGPressed,
        setLocation,
        ROUTES.RELATORIOS
      ),
      description: 'G+R: Ir para Relatórios',
    },
    {
      key: 'n',
      callback: createGNavigationHandler(
        gPressed,
        setGPressed,
        setLocation,
        ROUTES.NOTIFICACOES
      ),
      description: 'G+N: Ir para Notificações',
    },
    {
      key: 's',
      callback: createGNavigationHandler(
        gPressed,
        setGPressed,
        setLocation,
        ROUTES.CONFIGURACOES
      ),
      description: 'G+S: Ir para Configurações',
    },
  ]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderShortcutKey = useCallback(
    (key: string, index: number, totalKeys: number) => (
      <span key={index} className="flex items-center gap-1">
        {index > 0 && (
          <span className="text-muted-foreground text-xs">
            {LABELS.SEPARATOR}
          </span>
        )}
        <Kbd>{key}</Kbd>
      </span>
    ),
    []
  );

  const renderShortcutItem = useCallback(
    (shortcut: ShortcutItem, index: number) => (
      <div
        key={index}
        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
      >
        <span className="text-sm text-foreground">{shortcut.description}</span>
        <div className="flex items-center gap-1">
          {shortcut.keys.map((key, i) =>
            renderShortcutKey(key, i, shortcut.keys.length)
          )}
        </div>
      </div>
    ),
    [renderShortcutKey]
  );

  const renderShortcutSection = useCallback(
    (section: ShortcutSection, sectionIndex: number) => (
      <div key={sectionIndex}>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          {section.category}
        </h3>
        <div className={DIALOG_CONFIG.GRID_COLS}>
          {section.items.map(renderShortcutItem)}
        </div>
      </div>
    ),
    [renderShortcutItem]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <GlobalSearch open={showSearch} onOpenChange={handleSearchChange} />
      <Dialog open={showHelp} onOpenChange={handleHelpChange}>
        <DialogContent className={DIALOG_CONFIG.MAX_WIDTH}>
          <DialogHeader>
            <DialogTitle>{LABELS.DIALOG_TITLE}</DialogTitle>
            <DialogDescription>{LABELS.DIALOG_DESCRIPTION}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {shortcutSections.map(renderShortcutSection)}
          </div>

          <div className="mt-4 text-xs text-muted-foreground text-center">
            {LABELS.CLOSE_HINT} <Kbd>Esc</Kbd> {LABELS.CLOSE_HINT_END}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
