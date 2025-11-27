'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'wouter';
import {
  LayoutDashboard,
  FolderKanban,
  Search,
  Globe,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'sidebar-collapsed';
const APP_INFO = {
  NAME: 'IntelMarket',
  SUBTITLE: 'Inteligência de Mercado',
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

// ============================================================================
// NAVIGATION ITEMS (6 PÁGINAS PRINCIPAIS)
// ============================================================================

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral e analytics',
  },
  {
    href: '/projects',
    label: 'Projetos',
    icon: FolderKanban,
    description: 'Gestão de projetos',
  },
  {
    href: '/pesquisas',
    label: 'Pesquisas',
    icon: Search,
    description: 'Pesquisas de mercado',
  },
  {
    href: '/markets',
    label: 'Mercados',
    icon: Globe,
    description: 'Análise de mercados',
  },
  {
    href: '/leads',
    label: 'Leads',
    icon: Users,
    description: 'Gestão de leads',
  },
  {
    href: '/system',
    label: 'Sistema',
    icon: Settings,
    description: 'Configurações',
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

function isActiveRoute(href: string, location: string): boolean {
  const cleanHref = href.split('?')[0];
  const cleanLocation = location.split('?')[0];
  return cleanLocation === cleanHref || cleanLocation.startsWith(cleanHref + '/');
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AppSidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsedState);

  // Persistir estado collapsed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    }
  }, [isCollapsed]);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return (
    <aside
      className={cn(
        'h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-blue-600">{APP_INFO.NAME}</h1>
            <p className="text-xs text-gray-500">{APP_INFO.SUBTITLE}</p>
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.href, location);

          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg transition-all',
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                  isCollapsed && 'justify-center'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-blue-600' : 'text-gray-500')} />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{item.label}</div>
                    <div className="text-xs text-gray-500 truncate">{item.description}</div>
                  </div>
                )}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            v1.0.0 • © 2025 IntelMarket
          </div>
        </div>
      )}
    </aside>
  );
}

export default AppSidebar;
