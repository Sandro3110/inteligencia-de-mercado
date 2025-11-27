'use client';

/**
 * AppSidebar - Sidebar Principal da Aplicação
 * Menu de navegação com seções colapsáveis e priorização de funcionalidades
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, Link } from 'wouter';
import {
  BarChart3,
  Home,
  FileText,
  Zap,
  Activity,
  TrendingUp,
  DollarSign,
  Settings,
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  Download,
  Sparkles,
  FolderOpen,
  FileStack,
  MapPin,
  HelpCircle,
  CheckCircle,
  Users,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { useUnreadNotificationsCount } from '@/hooks/useUnreadNotificationsCount';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'sidebar-collapsed';

const SIDEBAR_WIDTH = {
  EXPANDED: 'w-64',
  COLLAPSED: 'w-16',
} as const;

const APP_INFO = {
  NAME: 'IntelMarket',
  SUBTITLE: 'Inteligência de Mercado',
} as const;

const TOOLTIPS = {
  EXPAND: 'Expandir menu',
  COLLAPSE: 'Recolher menu',
} as const;

const LABELS = {
  ACTIVE_PROJECT: 'Projeto Ativo',
  MARKETS: 'mercados',
  LEADS: 'leads',
} as const;

const BADGE_LIMITS = {
  MAX_DISPLAY: 9,
  OVERFLOW_SUFFIX: '+',
} as const;

const PRIORITY_TYPES = {
  CORE: 'core',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

type Priority = (typeof PRIORITY_TYPES)[keyof typeof PRIORITY_TYPES];

const PRIORITY_COLORS: Record<Priority, string> = {
  [PRIORITY_TYPES.CORE]: 'text-blue-600 bg-blue-50 border-blue-200',
  [PRIORITY_TYPES.HIGH]: 'text-green-600 bg-green-50 border-green-200',
  [PRIORITY_TYPES.MEDIUM]: 'text-purple-600 bg-purple-50 border-purple-200',
  [PRIORITY_TYPES.LOW]: 'text-gray-600 bg-gray-50 border-gray-200',
};

const SECTION_COLORS = {
  CORE: {
    ICON: 'text-blue-600',
    TEXT: 'text-blue-700',
    HOVER: 'hover:bg-blue-50',
    ACTIVE: 'bg-blue-100 text-blue-700',
  },
  DEFAULT: {
    ICON: 'text-slate-600',
    TEXT: 'text-slate-700',
    HOVER: 'hover:bg-slate-100',
    ACTIVE: 'bg-blue-100 text-blue-700',
  },
} as const;

const NOTIFICATION_BADGE_COLORS = {
  PING: 'bg-red-400',
  SOLID: 'bg-red-500',
  TEXT: 'text-white',
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  shortcut?: string;
  badge?: string;
}

interface NavSection {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
  defaultOpen?: boolean;
  priority?: Priority;
}

interface DashboardStats {
  totals: {
    mercados: number;
    leads: number;
  };
}

// ============================================================================
// NAVIGATION SECTIONS
// ============================================================================

const NAV_SECTIONS: NavSection[] = [
  // 🎯 CORE DO SISTEMA (Prioridade Máxima)
  {
    title: '🎯 Core',
    icon: Zap,
    priority: PRIORITY_TYPES.CORE,
    defaultOpen: true,
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: Home, shortcut: 'Ctrl+H' },
      { title: 'Projetos', href: '/projects', icon: FolderOpen },
      { title: 'Pesquisas', href: '/pesquisas', icon: FileStack },
      { title: 'Mercados', href: '/markets', icon: Globe },
      { title: 'Leads', href: '/leads', icon: Users },
    ],
  },

  // 📊 ANÁLISE E INTELIGÊNCIA
  {
    title: '📊 Análise',
    icon: BarChart3,
    priority: PRIORITY_TYPES.HIGH,
    defaultOpen: false,
    items: [
      { title: 'Analytics', href: '/analytics', icon: BarChart3, shortcut: 'Ctrl+A' },
      { title: 'Enriquecimento', href: '/enrichment', icon: Sparkles, shortcut: 'Ctrl+E' },
      { title: 'Exportar Dados', href: '/export', icon: Download, shortcut: 'Ctrl+X' },
    ],
  },

  // ⚙️ AUTOMAÇÃO E RELATÓRIOS
  {
    title: '⚙️ Automação',
    icon: Settings,
    priority: PRIORITY_TYPES.MEDIUM,
    defaultOpen: false,
    items: [
      { title: 'Relatórios', href: '/reports', icon: FileText },
      { title: 'Alertas', href: '/alerts', icon: Bell },
    ],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getInitialCollapsedState(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'true';
}

function getInitialOpenSections(): Record<string, boolean> {
  return NAV_SECTIONS.reduce(
    (acc, section) => {
      acc[section.title] = section.defaultOpen ?? false;
      return acc;
    },
    {} as Record<string, boolean>
  );
}

function getPriorityColor(priority?: Priority): string {
  if (!priority) return PRIORITY_COLORS[PRIORITY_TYPES.LOW];
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS[PRIORITY_TYPES.LOW];
}

function isActiveRoute(href: string, location: string): boolean {
  const cleanHref = href.split('?')[0];
  const cleanLocation = location.split('?')[0];
  return cleanLocation === cleanHref;
}

function formatBadgeCount(count: number): string {
  if (count > BADGE_LIMITS.MAX_DISPLAY) {
    return `${BADGE_LIMITS.MAX_DISPLAY}${BADGE_LIMITS.OVERFLOW_SUFFIX}`;
  }
  return String(count);
}

function getSectionColors(priority?: Priority) {
  return priority === PRIORITY_TYPES.CORE ? SECTION_COLORS.CORE : SECTION_COLORS.DEFAULT;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AppSidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsedState);
  const [openSections, setOpenSections] = useState(getInitialOpenSections);

  // Persistir estado collapsed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    }
  }, [isCollapsed]);

  const toggleSection = useCallback((sectionTitle: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  }, []);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return (
    <aside
      className={cn(
        'h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
        isCollapsed ? SIDEBAR_WIDTH.COLLAPSED : SIDEBAR_WIDTH.EXPANDED
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h1 className="text-lg font-bold text-gray-900">{APP_INFO.NAME}</h1>
            <p className="text-xs text-gray-500">{APP_INFO.SUBTITLE}</p>
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={isCollapsed ? TOOLTIPS.EXPAND : TOOLTIPS.COLLAPSE}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {NAV_SECTIONS.map((section) => {
          const isOpen = openSections[section.title];
          const colors = getSectionColors(section.priority);

          return (
            <div key={section.title} className="mb-2">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.title)}
                className={cn(
                  'w-full flex items-center justify-between p-2 rounded-lg transition-colors',
                  colors.HOVER
                )}
              >
                <div className="flex items-center gap-2">
                  <section.icon className={cn('w-5 h-5', colors.ICON)} />
                  {!isCollapsed && (
                    <span className={cn('text-sm font-medium', colors.TEXT)}>
                      {section.title}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      isOpen ? 'rotate-180' : '',
                      colors.ICON
                    )}
                  />
                )}
              </button>

              {/* Section Items */}
              {isOpen && (
                <div className="mt-1 space-y-1">
                  {section.items.map((item) => {
                    const isActive = isActiveRoute(item.href, location);

                    return (
                      <Link key={item.href} href={item.href}>
                        <a
                          className={cn(
                            'flex items-center gap-3 p-2 rounded-lg transition-colors',
                            isActive ? colors.ACTIVE : colors.HOVER,
                            isCollapsed ? 'justify-center' : 'pl-9'
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          {!isCollapsed && (
                            <span className="text-sm flex-1">{item.title}</span>
                          )}
                          {!isCollapsed && item.badge && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </a>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
