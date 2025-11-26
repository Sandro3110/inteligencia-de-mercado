'use client';

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left Side - Logo */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">IntelMarket</h1>
        <span className="text-sm text-gray-500">Dashboard de Inteligência de Mercado</span>
      </div>

      {/* Right Side - User Info */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Sistema Operacional
        </span>
      </div>
    </header>
  );
}
