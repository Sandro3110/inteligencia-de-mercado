'use client';

import { useState } from 'react';
import { MapPin, Navigation, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

// Importar MiniMap dinamicamente para evitar SSR
const MiniMap = dynamic(() => import('@/components/MiniMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />,
});

export default function GeocodingPage() {
  const [activeTab, setActiveTab] = useState<'cockpit' | 'minimap'>('minimap');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <MapPin className="w-8 h-8 text-blue-600" />
          Validação de Coordenadas
        </h1>
        <p className="text-gray-600">
          Valide e ajuste coordenadas geográficas de mercados e clientes
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('minimap')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'minimap'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPin className="w-5 h-5" />
          MiniMap
        </button>
      </div>

      {/* Content */}
      {activeTab === 'minimap' && (
        <div className="bg-white rounded-lg shadow p-6">
          <MiniMap />
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <div className="text-sm text-gray-600">Coordenadas Válidas</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">-</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <Navigation className="w-6 h-6 text-yellow-600" />
            <div className="text-sm text-gray-600">Aguardando Validação</div>
          </div>
          <div className="text-2xl font-bold text-yellow-600">-</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div className="text-sm text-gray-600">Validadas Hoje</div>
          </div>
          <div className="text-2xl font-bold text-green-600">-</div>
        </div>
      </div>
    </div>
  );
}
