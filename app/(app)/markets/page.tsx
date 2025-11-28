'use client';

import { useState } from 'react';
import { useApp } from '@/lib/contexts/AppContext';
import { trpc } from '@/lib/trpc/client';
import { Target, MapPin, TrendingUp, Users, Map as MapIcon, Layers, Filter, Clock, DollarSign } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load componentes de mapa
const MapContainer = dynamic(() => import('@/components/maps/MapContainer'), { ssr: false });
const MapControls = dynamic(() => import('@/components/maps/MapControls'), { ssr: false });
const MapFilters = dynamic(() => import('@/components/maps/MapFilters'), { ssr: false });
const MapLegend = dynamic(() => import('@/components/maps/MapLegend'), { ssr: false });
const CustomMarker = dynamic(() => import('@/components/maps/CustomMarker'), { ssr: false });
const EntityMarker = dynamic(() => import('@/components/maps/EntityMarker'), { ssr: false });
const EntityPopupCard = dynamic(() => import('@/components/maps/EntityPopupCard'), { ssr: false });
const HeatmapLayer = dynamic(() => import('@/components/maps/HeatmapLayer'), { ssr: false });
const MiniMap = dynamic(() => import('@/components/MiniMap'), { ssr: false });
const CompararMercadosModal = dynamic(() => import('@/components/CompararMercadosModal'), { ssr: false });
const GeoCockpit = dynamic(() => import('@/components/GeoCockpit'), { ssr: false });
const EnrichmentProgress = dynamic(() => import('@/components/EnrichmentProgress'), { ssr: false });
const ScheduleEnrichment = dynamic(() => import('@/components/ScheduleEnrichment'), { ssr: false });
const CostEstimator = dynamic(() => import('@/components/CostEstimator'), { ssr: false });
const MercadoAccordionCard = dynamic(() => import('@/components/MercadoAccordionCard'), { ssr: false });

export default function MarketsPage() {
  const { selectedProjectId } = useApp();
  const [activeTab, setActiveTab] = useState<'list' | 'map' | 'compare' | 'geocoding' | 'enrichment' | 'schedule' | 'costs'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);

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
            { id: 'schedule', label: 'Agendamento', icon: Clock },
            { id: 'costs', label: 'Custos', icon: DollarSign },
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
            <div className="space-y-4">
              {mercados.map((mercado: any) => (
                <MercadoAccordionCard key={mercado.id} mercado={mercado} />
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
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-4 py-2 rounded-lg shadow hover:shadow-lg transition-shadow flex items-center gap-2 ${
                showHeatmap ? 'bg-purple-600 text-white' : 'bg-white'
              }`}
            >
              <Layers className="w-5 h-5" />
              Heatmap
            </button>
            <button
              onClick={() => setShowMiniMap(!showMiniMap)}
              className={`px-4 py-2 rounded-lg shadow hover:shadow-lg transition-shadow flex items-center gap-2 ${
                showMiniMap ? 'bg-purple-600 text-white' : 'bg-white'
              }`}
            >
              <MapIcon className="w-5 h-5" />
              MiniMap
            </button>
          </div>

          {showFilters && <MapFilters onClose={() => setShowFilters(false)} />}
          {showLegend && <MapLegend />}
          {showMiniMap && (
            <div className="absolute bottom-4 right-4 z-10">
              <MiniMap markers={mercados || []} />
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-4">
            <MapContainer
              markers={mercados || []}
              showHeatmap={showHeatmap}
              MarkerComponent={EntityMarker}
              PopupComponent={EntityPopupCard}
            />
          </div>
        </div>
      )}

      {activeTab === 'compare' && <CompararMercadosModal />}
      {activeTab === 'geocoding' && <GeoCockpit />}
      {activeTab === 'enrichment' && <EnrichmentProgress />}
      {activeTab === 'schedule' && <ScheduleEnrichment />}
      {activeTab === 'costs' && <CostEstimator />}
    </div>
  );
}
