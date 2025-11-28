'use client';

import GlobalSearch from '@/components/GlobalSearch';
import { useSidebar } from '@/lib/contexts/SidebarContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const DynamicBreadcrumbs = dynamic(() => import('@/components/DynamicBreadcrumbs'), {
  ssr: false,
});

export default function Header({ children }: { children?: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left Side - Toggle + Breadcrumbs */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5 text-gray-600" />
          ) : (
            <X className="w-5 h-5 text-gray-600" />
          )}
        </button>

        <div className="min-w-0 flex-1 hidden md:block">
          <DynamicBreadcrumbs />
        </div>
      </div>

      {/* Right Side - Search + Project Selector + Actions */}
      <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
        <div className="hidden md:block md:w-48 lg:w-64">
          <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
        </div>

        {children}
      </div>
    </header>
  );
}
