'use client';

import { useCallback, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { CompactModeToggle } from './CompactModeToggle';
import { useOnboarding } from '@/contexts/OnboardingContext';
import {
  HelpCircle,
  Home,
  BarChart3,
  Database,
  TrendingUp,
  Settings,
  Clock,
  FileText,
  Bell,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// CONSTANTS
// ============================================================================

const APP_NAME = 'Inteligência de Mercado';

const NAV_ITEMS = [
  {
    title: 'Início',
    href: '/',
    icon: Home,
    description: 'Visão geral e seleção de mercados',
  },
  {
    title: 'Mercados',
    href: '/mercados',
    icon: Database,
    description: 'Explorar mercados identificados',
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Estatísticas e métricas gerais',
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
    description: 'Análises avançadas e insights',
  },
  {
    title: 'Enriquecimento',
    href: '/enrichment',
    icon: Settings,
    description: 'Configurar e executar enriquecimento',
  },
  {
    title: 'Configurações',
    href: '/enrichment-settings',
    icon: Settings,
    description: 'API keys e critérios de enriquecimento',
  },
  {
    title: 'Monitoramento',
    href: '/enrichment-progress',
    icon: Clock,
    description: 'Acompanhar progresso em tempo real',
  },
  {
    title: 'Alertas',
    href: '/alertas',
    icon: Bell,
    description: 'Configurar alertas personalizados',
  },
  {
    title: 'Relatórios',
    href: '/relatorios',
    icon: FileText,
    description: 'Gerar relatórios executivos em PDF',
  },
  {
    title: 'ROI',
    href: '/roi',
    icon: TrendingUp,
    description: 'Dashboard de ROI e conversões',
  },
  {
    title: 'Funil',
    href: '/funil',
    icon: BarChart3,
    description: 'Visualizar funil de vendas',
  },
  {
    title: 'Agendamento',
    href: '/agendamento',
    icon: Clock,
    description: 'Agendar enriquecimentos recorrentes',
  },
  {
    title: 'Atividade',
    href: '/atividade',
    icon: Activity,
    description: 'Timeline de atividades do sistema',
  },
] as const;

const ICON_SIZES = {
  SMALL: 'h-4 w-4',
  MEDIUM: 'h-5 w-5',
  LARGE: 'h-6 w-6',
} as const;

const BADGE_SIZE = {
  WIDTH: 'w-2',
  HEIGHT: 'h-2',
} as const;

const LABELS = {
  TOUR: 'Tour',
  NOTIFICATIONS: 'Alertas e notificações',
} as const;

const CSS_CLASSES = {
  NAV_ITEM_BASE:
    'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer',
  NAV_ITEM_HOVER: 'hover:bg-accent hover:text-accent-foreground',
  NAV_ITEM_ACTIVE: 'bg-accent text-accent-foreground',
  NAV_ITEM_INACTIVE: 'text-muted-foreground',
  NOTIFICATION_BADGE: 'absolute top-1 right-1 bg-red-500 rounded-full',
} as const;

const ROOT_PATH = '/';

// ============================================================================
// TYPES
// ============================================================================

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isActiveRoute(currentPath: string, itemPath: string): boolean {
  if (currentPath === itemPath) return true;
  if (itemPath !== ROOT_PATH && currentPath.startsWith(itemPath)) return true;
  return false;
}

function getNavItemClasses(isActive: boolean): string {
  return cn(
    CSS_CLASSES.NAV_ITEM_BASE,
    CSS_CLASSES.NAV_ITEM_HOVER,
    isActive ? CSS_CLASSES.NAV_ITEM_ACTIVE : CSS_CLASSES.NAV_ITEM_INACTIVE
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function BrandLogo() {
  return (
    <div className="mr-8 flex items-center space-x-2">
      <FileText className={`${ICON_SIZES.LARGE} text-primary`} />
      <span className="text-xl font-bold">{APP_NAME}</span>
    </div>
  );
}

function NavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;

  return (
    <Link key={item.href} href={item.href}>
      <span className={getNavItemClasses(isActive)} title={item.description}>
        <Icon className={ICON_SIZES.SMALL} />
        <span className="hidden md:inline">{item.title}</span>
      </span>
    </Link>
  );
}

function OnboardingButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="text-xs">
      <HelpCircle className={`${ICON_SIZES.SMALL} mr-1`} />
      {LABELS.TOUR}
    </Button>
  );
}

function NotificationBell() {
  return (
    <button
      className="relative p-2 rounded-md hover:bg-accent transition-colors"
      title={LABELS.NOTIFICATIONS}
    >
      <Bell className={ICON_SIZES.MEDIUM} />
      <span
        className={`${CSS_CLASSES.NOTIFICATION_BADGE} ${BADGE_SIZE.HEIGHT} ${BADGE_SIZE.WIDTH}`}
      />
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MainNav() {
  // Hooks
  const [location] = useLocation();
  const { startOnboarding, hasCompletedOnboarding } = useOnboarding();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleStartOnboarding = useCallback(() => {
    startOnboarding();
  }, [startOnboarding]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const activeStates = useMemo(
    () =>
      NAV_ITEMS.map((item) => ({
        href: item.href,
        isActive: isActiveRoute(location, item.href),
      })),
    [location]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderNavItems = useCallback(
    () =>
      NAV_ITEMS.map((item, index) => {
        const activeState = activeStates[index];
        return (
          <NavItem key={item.href} item={item} isActive={activeState.isActive} />
        );
      }),
    [activeStates]
  );

  const renderActions = useCallback(
    () => (
      <div className="flex items-center gap-2">
        {!hasCompletedOnboarding && (
          <OnboardingButton onClick={handleStartOnboarding} />
        )}
        <div className="compact-mode-toggle">
          <CompactModeToggle />
        </div>
        <NotificationBell />
      </div>
    ),
    [hasCompletedOnboarding, handleStartOnboarding]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <BrandLogo />

        <div className="flex flex-1 items-center space-x-1">{renderNavItems()}</div>

        {renderActions()}
      </div>
    </nav>
  );
}
