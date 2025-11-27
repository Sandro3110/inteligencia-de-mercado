'use client';

import { useState } from 'react';
import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';
import { Target, MapPin, TrendingUp, Users, Map as MapIcon, Layers, Filter } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load componentes de mapa
const MapContainer = dynamic(() => import('@/components/maps/MapContainer'), { ssr: false });
const MapControls = dynamic(() => import('@/components/maps/MapControls'), { ssr: false });
const MapFilters = dynamic(() => import('@/components/maps/MapFilters'), { ssr: false });
const MapLegend = dynamic(() => import('@/components/maps/MapLegend'), { ssr: false });
const CustomMarker = dynamic(() => import('@/components/maps/CustomMarker'), { ssr: false });
const EntityMarker = dynamic(() => import('@/components/maps/EntityMarker'), { ssr: false });

export default function MarketsPage() {
  const { selectedProjectId } = useProject();
  const [activeTab, setActiveTab] = useState<'list' | 'map' | 'compare' | 'geocoding' | 'enrichment'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  
  const { data: mercados, isLoading } = trpc.mercados.list.useQuery({
    projectId: selectedProjectId || undefined,
  });

  if (!selectedProjectId) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-700">Selecione um projeto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Target className="w-8 h-8 text-purple-600" />
          Mercados
        </h1>
        <p className="text-gray-600">Análise completa de mercados e territórios</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'list', label: 'Lista', icon: Target },
            { id: 'map', label: 'Mapa', icon: MapIcon },
            { id: 'compare', label: 'Comparar', icon: TrendingUp },
            { id: 'geocoding', label: 'Geocoding', icon: MapPin },
            { id: 'enrichment', label: 'Enriquecimento', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'list' && (
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4" />
                  <div className="h-4 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : mercados && mercados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mercados.map((mercado: any) => (
                <div key={mercado.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{mercado.nome}</h3>
                    {mercado.categoria && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                        {mercado.categoria}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{mercado.totalClientes || 0} clientes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{mercado.cidade || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">Nenhum mercado encontrado</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'map' && (
        <div className="relative">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition-shadow flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="bg-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition-shadow flex items-center gap-2"
            >
              <Layers className="w-5 h-5" />
              Legenda
            </button>
          </div>
          
          {showFilters && (
            <div className="absolute top-16 right-4 z-10 bg-white rounded-lg shadow-lg p-4 w-64">
              <h3 className="font-semibold mb-2">Filtros de Mapa</h3>
              <p className="text-sm text-gray-600">Filtros avançados disponíveis</p>
            </div>
          )}

          {showLegend && (
            <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold mb-2">Legenda</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full" />
                  <span>Clientes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full" />
                  <span>Concorrentes</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-4">
            <MapContainer markers={mercados || []} />
          </div>
        </div>
      )}

      {activeTab === 'compare' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Comparar Mercados</h3>
          <p className="text-gray-600">Compare mercados lado a lado</p>
        </div>
      )}

      {activeTab === 'geocoding' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Geocoding</h3>
          <p className="text-gray-600">Validação e correção de endereços</p>
        </div>
      )}

      {activeTab === 'enrichment' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Enriquecimento</h3>
          <p className="text-gray-600">Jobs de enriquecimento de dados</p>
        </div>
      )}
    </div>
  );
}
