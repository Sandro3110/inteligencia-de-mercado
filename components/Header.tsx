'use client';

import { ProjectSelector } from '@/components/ProjectSelector';
import GlobalSearch from '@/components/GlobalSearch';
import { useState } from 'react';

export default function Header({ children }: { children?: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left Side - Logo */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">IntelMarket</h1>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-2xl mx-8">
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </div>

      {/* Right Side - Project Selector */}
      <div className="flex items-center gap-4">
        <ProjectSelector />
      </div>
    </header>
  );
}
