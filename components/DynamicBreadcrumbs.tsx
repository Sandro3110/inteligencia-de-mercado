'use client';

import { useMemo, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ChevronRight,
  Home,
  BarChart3,
  Target,
  TrendingUp,
  Filter,
  FileText,
  Activity,
  Bell,
  Calendar,
  Settings,
  Zap,
  ArrowLeft,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZES = {
  SMALL: 'w-4 h-4',
} as const;

const CLASSES = {
  NAV: 'flex items-center gap-3 text-sm',
  BACK_BUTTON: 'h-7 px-2 text-muted-foreground hover:text-foreground',
  BREADCRUMBS_CONTAINER: 'flex items-center gap-2 text-muted-foreground',
  BREADCRUMB_ITEM: 'flex items-center gap-2',
  CHEVRON: 'text-slate-400',
  CURRENT_ITEM: 'font-medium text-foreground flex items-center gap-1.5',
  LINK_ITEM: 'hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1.5 hover:underline',
} as const;

const LABELS = {
  HOME: 'Início',
} as const;

const ROUTES = {
  HOME: '/',
} as const;

const MIN_LEVELS_FOR_BACK = 2;

interface RouteInfo {
  label: string;
  icon?: LucideIcon;
}

const ROUTE_MAP: Record<string, RouteInfo> = {
  '/': { label: 'Início', icon: Home },
  '/dashboard': { label: 'Dashboard', icon: BarChart3 },
  '/dashboard-avancado': { label: 'Dashboard Avançado', icon: BarChart3 },
  '/mercados': { label: 'Mercados', icon: Target },
  '/enrichment': { label: 'Novo Enriquecimento', icon: Zap },
  '/enrichment-progress': { label: 'Monitorar Progresso', icon: Activity },
  '/enrichment-settings': { label: 'Configurações', icon: Settings },
  '/resultados-enriquecimento': { label: 'Resultados', icon: FileText },
  '/analytics': { label: 'Analytics', icon: BarChart3 },
  '/analytics-dashboard': { label: 'Analytics Dashboard', icon: BarChart3 },
  '/roi': { label: 'ROI & Conversão', icon: TrendingUp },
  '/funil': { label: 'Funil de Vendas', icon: Filter },
  '/relatorios': { label: 'Relatórios', icon: FileText },
  '/atividade': { label: 'Atividades', icon: Activity },
  '/alertas': { label: 'Alertas', icon: Bell },
  '/alertas/historico': { label: 'Histórico de Alertas', icon: Bell },
  '/agendamento': { label: 'Agendamentos', icon: Calendar },
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbLinkProps {
  item: BreadcrumbItem;
  isLast: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRouteLabel(path: string, segment: string): string {
  const routeInfo = ROUTE_MAP[path];
  return routeInfo?.label || capitalizeFirstLetter(segment);
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildBreadcrumbs(location: string): BreadcrumbItem[] {
  const pathSegments = location.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: LABELS.HOME, href: ROUTES.HOME },
  ];

  let currentPath = '';
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    const label = getRouteLabel(currentPath, segment);
    breadcrumbs.push({ label, href: currentPath });
  }

  return breadcrumbs;
}

function canShowBackButton(breadcrumbsCount: number): boolean {
  return breadcrumbsCount > MIN_LEVELS_FOR_BACK;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function BackButton() {
  const handleClick = useCallback(() => {
    window.history.back();
  }, []);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={CLASSES.BACK_BUTTON}
    >
      <ArrowLeft className={ICON_SIZES.SMALL} />
    </Button>
  );
}

function BreadcrumbLink({ item, isLast }: BreadcrumbLinkProps) {
  const routeInfo = ROUTE_MAP[item.href];
  const Icon = routeInfo?.icon;

  if (isLast) {
    return (
      <span className={CLASSES.CURRENT_ITEM}>
        {Icon && <Icon className={ICON_SIZES.SMALL} />}
        {item.label}
      </span>
    );
  }

  return (
    <Link href={item.href}>
      <span className={cn(CLASSES.LINK_ITEM)}>
        {Icon && <Icon className={ICON_SIZES.SMALL} />}
        {item.label}
      </span>
    </Link>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DynamicBreadcrumbs
 * 
 * Breadcrumbs dinâmicos baseados na rota atual.
 * Exibe o caminho de navegação com ícones e links.
 * Inclui botão "Voltar" quando há mais de 2 níveis.
 */
function DynamicBreadcrumbs() {
  // Hooks
  const [location] = useLocation();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const breadcrumbs = useMemo(() => buildBreadcrumbs(location), [location]);

  const showBackButton = useMemo(
    () => canShowBackButton(breadcrumbs.length),
    [breadcrumbs.length]
  );

  const shouldRender = useMemo(() => location !== ROUTES.HOME, [location]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!shouldRender) {
    return null;
  }

  return (
    <nav className={CLASSES.NAV}>
      {showBackButton && <BackButton />}

      <div className={CLASSES.BREADCRUMBS_CONTAINER}>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const showChevron = index > 0;

          return (
            <div key={item.href} className={CLASSES.BREADCRUMB_ITEM}>
              {showChevron && (
                <ChevronRight className={`${ICON_SIZES.SMALL} ${CLASSES.CHEVRON}`} />
              )}
              <BreadcrumbLink item={item} isLast={isLast} />
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export default DynamicBreadcrumbs;
