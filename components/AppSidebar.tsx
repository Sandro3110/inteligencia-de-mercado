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
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { useUnreadNotificationsCount } from '@/hooks/useUnreadNotificationsCount';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  NAME: 'Gestor PAV',
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
      { title: 'Cockpit Unificado', href: '/', icon: Home, shortcut: 'Ctrl+H' },
      {
        title: 'Nova Pesquisa',
        href: '/research/new',
        icon: Plus,
        badge: 'Criar',
      },
      { title: 'Pesquisas', href: '/pesquisas', icon: FileStack },
      {
        title: 'Enriquecer Dados',
        href: '/enrichment',
        icon: Sparkles,
        shortcut: 'Ctrl+E',
      },
      {
        title: 'Acompanhar Progresso',
        href: '/enrichment-progress',
        icon: Activity,
      },
      {
        title: 'Ver Resultados',
        href: '/resultados-enriquecimento',
        icon: CheckCircle,
      },
      {
        title: 'Exportar Dados',
        href: '/export',
        icon: Download,
        shortcut: 'Ctrl+X',
      },
      { title: 'Gerenciar Projetos', href: '/projetos', icon: FolderOpen },
    ],
  },

  // 📊 ANÁLISE E INTELIGÊNCIA
  {
    title: '📊 Análise',
    icon: BarChart3,
    priority: PRIORITY_TYPES.HIGH,
    defaultOpen: false,
    items: [
      {
        title: 'Analytics Unificado',
        href: '/analytics',
        icon: BarChart3,
        shortcut: 'Ctrl+A',
      },
      { title: 'Tendências', href: '/tendencias', icon: TrendingUp },
      {
        title: 'Performance e Conversão',
        href: '/performance',
        icon: DollarSign,
        shortcut: 'Ctrl+R',
      },
    ],
  },

  // ⚙️ CONFIGURAÇÕES E AUTOMAÇÃO
  {
    title: '⚙️ Configurações',
    icon: Settings,
    priority: PRIORITY_TYPES.MEDIUM,
    defaultOpen: false,
    items: [
      {
        title: 'Configurações do Sistema',
        href: '/configuracoes/sistema',
        icon: Settings,
      },
      {
        title: 'Parâmetros Enriquecimento',
        href: '/enrichment-settings',
        icon: Settings,
      },
      { title: 'Configurar Alertas', href: '/alertas', icon: Bell },
      { title: 'Relatórios e Automação', href: '/relatorios', icon: FileText },
      { title: 'Configurar IA (LLM)', href: '/admin/llm', icon: Zap },
    ],
  },

  // 📁 SISTEMA E HISTÓRICO
  {
    title: '📁 Sistema',
    icon: FileStack,
    priority: PRIORITY_TYPES.LOW,
    defaultOpen: false,
    items: [
      { title: 'Central de Notificações', href: '/notificacoes', icon: Bell },
      {
        title: 'Configurações de Notificações',
        href: '/notificacoes/config',
        icon: Settings,
      },
      { title: 'Geocodificação', href: '/geocodificacao', icon: MapPin },
      { title: 'Gerenciar Geocodificação', href: '/geo-admin', icon: Settings },
      { title: 'Monitoramento', href: '/monitoring', icon: Activity },
      {
        title: 'Central de Ajuda',
        href: '/ajuda',
        icon: HelpCircle,
        shortcut: '?',
      },
    ],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getInitialCollapsedState(): boolean {
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
  return priority === PRIORITY_TYPES.CORE
    ? SECTION_COLORS.CORE
    : SECTION_COLORS.DEFAULT;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AppSidebar() {
  const [location] = useLocation();
  const { count: unreadCount } = useUnreadNotificationsCount();
  const [collapsed, setCollapsed] = useState(getInitialCollapsedState);
  const [openSections, setOpenSections] = useState(getInitialOpenSections);

  const { selectedProjectId } = useSelectedProject();
  const { data: stats } = trpc.dashboard.stats.useQuery(
    { projectId: selectedProjectId ?? undefined },
    { enabled: !!selectedProjectId }
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const sidebarWidth = useMemo(
    () => (collapsed ? SIDEBAR_WIDTH.COLLAPSED : SIDEBAR_WIDTH.EXPANDED),
    [collapsed]
  );

  const tooltipText = useMemo(
    () => (collapsed ? TOOLTIPS.EXPAND : TOOLTIPS.COLLAPSE),
    [collapsed]
  );

  const hasProject = useMemo(
    () => !!selectedProjectId && !!stats,
    [selectedProjectId, stats]
  );

  const projectStatsLabel = useMemo(() => {
    if (!stats) return '';
    return `${stats.totals.mercados} ${LABELS.MARKETS} • ${stats.totals.leads} ${LABELS.LEADS}`;
  }, [stats]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(newValue));
      window.dispatchEvent(
        new CustomEvent('sidebar-toggle', { detail: { collapsed: newValue } })
      );
      return newValue;
    });
  }, []);

  const toggleSection = useCallback(
    (title: string) => {
      if (!collapsed) {
        setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
      }
    },
    [collapsed]
  );

  const isActive = useCallback(
    (href: string) => isActiveRoute(href, location),
    [location]
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Listener para evento de toggle sidebar
  useEffect(() => {
    const handleToggle = () => toggleSidebar();
    window.addEventListener('toggle-sidebar', handleToggle as EventListener);
    return () => {
      window.removeEventListener(
        'toggle-sidebar',
        handleToggle as EventListener
      );
    };
  }, [toggleSidebar]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderLogo = useCallback(
    () => (
      <Link href="/">
        {collapsed ? (
          <BarChart3 className="w-6 h-6 text-blue-600 cursor-pointer mx-auto" />
        ) : (
          <span className="flex items-center gap-2 cursor-pointer">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">
                {APP_INFO.NAME}
              </span>
              <span className="text-xs text-slate-500">
                {APP_INFO.SUBTITLE}
              </span>
            </div>
          </span>
        )}
      </Link>
    ),
    [collapsed]
  );

  const renderToggleButton = useCallback(
    () => (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn('h-8 w-8', collapsed && 'mx-auto')}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{tooltipText}</TooltipContent>
      </Tooltip>
    ),
    [collapsed, tooltipText, toggleSidebar]
  );

  const renderProjectInfo = useCallback(
    () => (
      <div className="p-3 border-b border-slate-200 bg-slate-50">
        <div className="text-xs font-semibold text-slate-600 mb-1">
          {LABELS.ACTIVE_PROJECT}
        </div>
        <div className="text-sm font-medium text-slate-900">
          Projeto #{selectedProjectId}
        </div>
        <div className="flex gap-2 mt-2 text-xs text-slate-600">
          {projectStatsLabel}
        </div>
      </div>
    ),
    [selectedProjectId, projectStatsLabel]
  );

  const renderNotificationBadge = useCallback(
    (isCollapsed: boolean) => {
      if (unreadCount === 0) return null;

      const displayCount = formatBadgeCount(unreadCount);
      const badgeSize = isCollapsed ? 'h-4 w-4' : 'h-5 w-5';
      const fontSize = isCollapsed ? 'text-[10px]' : 'text-xs';
      const position = isCollapsed ? '-top-1 -right-1' : '';

      return (
        <span className={cn('relative flex', badgeSize, position)}>
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              NOTIFICATION_BADGE_COLORS.PING
            )}
          ></span>
          <span
            className={cn(
              'relative inline-flex items-center justify-center rounded-full font-bold',
              badgeSize,
              fontSize,
              NOTIFICATION_BADGE_COLORS.SOLID,
              NOTIFICATION_BADGE_COLORS.TEXT
            )}
          >
            {displayCount}
          </span>
        </span>
      );
    },
    [unreadCount]
  );

  const renderSectionHeader = useCallback(
    (section: NavSection) => {
      const isOpen = openSections[section.title];
      const SectionIcon = section.icon;
      const colors = getSectionColors(section.priority);

      if (collapsed) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <SectionIcon className={cn('w-5 h-5', colors.ICON)} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">{section.title}</TooltipContent>
          </Tooltip>
        );
      }

      return (
        <>
          <div className="flex items-center gap-2">
            <SectionIcon className={cn('w-4 h-4', colors.ICON)} />
            <span className={cn('text-sm font-semibold', colors.TEXT)}>
              {section.title}
            </span>
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </>
      );
    },
    [collapsed, openSections]
  );

  const renderNavItem = useCallback(
    (item: NavItem, sectionPriority?: Priority) => {
      const ItemIcon = item.icon;
      const active = isActive(item.href);
      const colors = getSectionColors(sectionPriority);
      const isNotificationItem = item.href === '/notificacoes';

      if (collapsed) {
        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link href={item.href}>
                <a
                  className={cn(
                    'flex items-center justify-center p-2 rounded-md transition-colors relative',
                    active ? colors.ACTIVE : `text-slate-600 ${colors.HOVER}`
                  )}
                >
                  <ItemIcon className="w-5 h-5" />
                  {isNotificationItem && renderNotificationBadge(true)}
                </a>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div>
                {item.title}
                {item.shortcut && (
                  <div className="text-xs text-slate-400 mt-1">
                    {item.shortcut}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      }

      return (
        <Link key={item.href} href={item.href}>
          <a
            className={cn(
              'flex items-center justify-between px-3 py-2 rounded-md transition-colors group',
              active
                ? `${colors.ACTIVE} font-medium`
                : `text-slate-600 ${colors.HOVER}`
            )}
          >
            <div className="flex items-center gap-2">
              <ItemIcon className="w-4 h-4" />
              <span className="text-sm">{item.title}</span>
            </div>
            {isNotificationItem && unreadCount > 0 ? (
              renderNotificationBadge(false)
            ) : item.badge ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                {item.badge}
              </span>
            ) : null}
            {item.shortcut && !item.badge && (
              <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.shortcut}
              </span>
            )}
          </a>
        </Link>
      );
    },
    [collapsed, isActive, unreadCount, renderNotificationBadge]
  );

  const renderSection = useCallback(
    (section: NavSection) => {
      const isOpen = openSections[section.title];
      const colors = getSectionColors(section.priority);

      return (
        <div key={section.title} className="mb-1">
          {/* Section Header */}
          <button
            onClick={() => toggleSection(section.title)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors',
              collapsed ? 'justify-center' : '',
              colors.HOVER
            )}
          >
            {renderSectionHeader(section)}
          </button>

          {/* Section Items */}
          {(isOpen || collapsed) && (
            <div
              className={cn(
                'mt-1',
                collapsed ? 'space-y-1' : 'ml-2 space-y-0.5'
              )}
            >
              {section.items.map((item) =>
                renderNavItem(item, section.priority)
              )}
            </div>
          )}
        </div>
      );
    },
    [
      collapsed,
      openSections,
      toggleSection,
      renderSectionHeader,
      renderNavItem,
    ]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-slate-200 overflow-y-auto z-50 transition-all duration-300',
        sidebarWidth
      )}
    >
      {/* Logo + Toggle */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        {renderLogo()}
        {renderToggleButton()}
      </div>

      {/* Project Selector */}
      {!collapsed && hasProject && renderProjectInfo()}

      {/* Navigation */}
      <nav className="p-2">{NAV_SECTIONS.map(renderSection)}</nav>
    </aside>
  );
}
