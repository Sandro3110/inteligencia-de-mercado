'use client';

import { ProjectSelector } from '@/components/ProjectSelector';

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left Side - Logo */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">IntelMarket</h1>
      </div>

      {/* Center - Placeholder for Search */}
      <div className="flex-1 max-w-2xl mx-8">
        <div className="text-sm text-gray-500 text-center">
          Busca global em desenvolvimento...
        </div>
      </div>

      {/* Right Side - Project Selector */}
      <div className="flex items-center gap-4">
        <ProjectSelector />
      </div>
    </header>
  );
}
