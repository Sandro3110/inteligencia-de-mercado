'use client';

import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

interface MenuItem {
  name: string;
  href: string;
  icon: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
  },
  {
    name: 'Projetos',
    href: '/projects',
    icon: '📁',
  },
  {
    name: 'Leads',
    href: '/leads',
    icon: '👥',
  },
  {
    name: 'Mercados',
    href: '/markets',
    icon: '🌍',
    children: [
      { name: 'Explorar', href: '/markets', icon: '🔍' },
      { name: 'Análise', href: '/markets/analysis', icon: '📈' },
      { name: 'Comparar', href: '/markets/compare', icon: '⚖️' },
    ],
  },
  {
    name: 'Mapas',
    href: '/maps',
    icon: '🗺️',
  },
  {
    name: 'Pesquisas',
    href: '/pesquisas',
    icon: '🔎',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: '📈',
  },
  {
    name: 'Enriquecimento',
    href: '/enrichment',
    icon: '✨',
  },
  {
    name: 'Relatórios',
    href: '/reports',
    icon: '📄',
  },
  {
    name: 'ROI & Funil',
    href: '/roi',
    icon: '💰',
  },
  {
    name: 'Alertas',
    href: '/alerts',
    icon: '🔔',
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: '⚙️',
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleExpand = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">IntelMarket</h1>
        <p className="text-sm text-gray-500">Inteligência de Mercado</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <div>
                <button
                  onClick={() => {
                    if (item.children) {
                      toggleExpand(item.name);
                    } else {
                      router.push(item.href);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  {item.children && (
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        expandedItems.includes(item.name) ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </button>
                {item.children && expandedItems.includes(item.name) && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.name}>
                        <button
                          onClick={() => router.push(child.href)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive(child.href)
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span>{child.icon}</span>
                          <span>{child.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-200">
        {user && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.email}
            </p>
            <p className="text-xs text-gray-500">Usuário Admin</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
