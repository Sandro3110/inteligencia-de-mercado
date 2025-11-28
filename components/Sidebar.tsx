'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { LayoutDashboard, FolderKanban, Users, Settings } from 'lucide-react';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Menu simplificado - apenas 4 itens essenciais
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
    name: 'Usuários',
    href: '/admin/users',
    icon: Users,
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

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">IntelMarket</h1>
        {selectedProject && (
          <p className="text-sm text-gray-600 mt-1 truncate">{selectedProject.nome}</p>
        )}
      </div>

      {/* Navigation - Simplificado */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">IntelMarket v2.0 - Simplificado</div>
      </div>
    </aside>
  );
}
