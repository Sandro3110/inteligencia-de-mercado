'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { useSidebar } from '@/lib/contexts/SidebarContext';
import { useUser } from '@/lib/auth/supabase';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  Map,
  BarChart3,
  Package,
  Activity,
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

// Menu completo - 8 itens
const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Projetos',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    name: 'Geoposição',
    href: '/map',
    icon: Map,
  },
  {
    name: 'Setores',
    href: '/sectors',
    icon: BarChart3,
  },
  {
    name: 'Produtos',
    href: '/products',
    icon: Package,
  },
  {
    name: 'Métricas',
    href: '/admin/metrics',
    icon: Activity,
    adminOnly: true,
  },
  {
    name: 'Usuários',
    href: '/admin/users',
    icon: Users,
    adminOnly: true,
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { selectedProject } = useSelectedProject();
  const { isCollapsed, collapseSidebar } = useSidebar();
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  // Filtrar itens de menu baseado em permissões
  const visibleMenuItems = menuItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <Tooltip.Provider delayDuration={300}>
      <>
        {/* Mobile Backdrop */}
        {!isCollapsed && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={collapseSidebar} />
        )}

        {/* Sidebar */}
        <aside
          className={`
            bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out
            fixed lg:relative inset-y-0 left-0 z-50
            ${isCollapsed ? 'w-16 -translate-x-full lg:translate-x-0' : 'w-64 translate-x-0'}
          `}
        >
          {/* Header */}
          <div className={`p-6 border-b border-gray-200 ${isCollapsed ? 'px-3' : ''}`}>
            {isCollapsed ? (
              <div className="flex justify-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">IM</span>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900">IntelMarket</h1>
                {selectedProject && (
                  <p className="text-sm text-gray-600 mt-1 truncate">{selectedProject.nome}</p>
                )}
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {visibleMenuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                const Icon = item.icon;

                const linkContent = (
                  <Link
                    href={item.href}
                    className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                );

                return (
                  <li key={item.href}>
                    {isCollapsed ? (
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>{linkContent}</Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            side="right"
                            sideOffset={10}
                            className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg z-50"
                          >
                            {item.name}
                            <Tooltip.Arrow className="fill-gray-900" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    ) : (
                      linkContent
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            {isCollapsed ? (
              <div className="flex justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full" title="v2.0"></div>
              </div>
            ) : (
              <div className="text-xs text-gray-500 text-center">IntelMarket v2.0</div>
            )}
          </div>
        </aside>
      </>
    </Tooltip.Provider>
  );
}
