'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSelectedProject } from '@/hooks/useSelectedProject';

interface MenuItem {
  name: string;
  href: string;
  icon: string;
  section: 'analysis' | 'intelligence' | 'operations';
}

// Menu items organizados por seção
const menuItems: MenuItem[] = [
  // ANÁLISE E PESQUISA
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    section: 'analysis',
  },
  {
    name: 'Projetos',
    href: '/projects',
    icon: '📂',
    section: 'analysis',
  },
  {
    name: 'Pesquisas',
    href: '/pesquisas',
    icon: '🔎',
    section: 'analysis',
  },
  {
    name: 'Mapas',
    href: '/maps',
    icon: '🗺️',
    section: 'analysis',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: '📈',
    section: 'analysis',
  },
  // INTELIGÊNCIA DE DADOS
  {
    name: 'Mercados',
    href: '/markets',
    icon: '🌍',
    section: 'intelligence',
  },
  {
    name: 'Leads',
    href: '/leads',
    icon: '👥',
    section: 'intelligence',
  },
  {
    name: 'Enriquecimento',
    href: '/enrichment',
    icon: '✨',
    section: 'intelligence',
  },
  // GESTÃO E OPERAÇÕES
  {
    name: 'Sistema',
    href: '/system',
    icon: '⚙️',
    section: 'operations',
  },
  {
    name: 'Usuários',
    href: '/admin/users',
    icon: '👥',
    section: 'operations',
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: '⚙️',
    section: 'operations',
  },
];

const sectionTitles = {
  analysis: 'Análise e Pesquisa',
  intelligence: 'Inteligência de Dados',
  operations: 'Gestão e Operações',
};

export default function Sidebar() {
  const pathname = usePathname();
  const { selectedProject } = useSelectedProject();

  // Agrupar itens por seção
  const sections = {
    analysis: menuItems.filter((item) => item.section === 'analysis'),
    intelligence: menuItems.filter((item) => item.section === 'intelligence'),
    operations: menuItems.filter((item) => item.section === 'operations'),
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">IntelMarket</h1>
        {selectedProject && (
          <p className="text-sm text-gray-600 mt-1 truncate">{selectedProject.nome}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {Object.entries(sections).map(([sectionKey, items]) => (
          <div key={sectionKey} className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
              {sectionTitles[sectionKey as keyof typeof sectionTitles]}
            </h2>
            <ul className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.href;
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
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">IntelMarket v1.0.0</div>
      </div>
    </aside>
  );
}
