'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, MapPin, Building2, Target, Users } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

interface EntityCount {
  clientes: number;
  leads: number;
  concorrentes: number;
}

interface CityData {
  name: string;
  uf: string;
  totals: EntityCount;
}

interface StateData {
  uf: string;
  cities: CityData[];
  totals: EntityCount;
}

interface RegionData {
  name: string;
  states: StateData[];
  totals: EntityCount;
}

interface GeoTableProps {
  projectId?: number;
  pesquisaId?: number;
  entityType: 'clientes' | 'leads' | 'concorrentes';
  filters?: {
    setor?: string;
    porte?: string;
    qualidade?: string;
  };
  onCityClick?: (cidade: string, uf: string) => void;
}

export function GeoTable({
  projectId,
  pesquisaId,
  entityType,
  filters,
  onCityClick,
}: GeoTableProps) {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = trpc.mapHierarchical.getHierarchicalData.useQuery({
    projectId: projectId ?? null,
    pesquisaId: pesquisaId ?? null,
    entityType,
    filters: {
      setor: filters?.setor ?? null,
      porte: filters?.porte ?? null,
      qualidade: filters?.qualidade ?? null,
    },
  });

  const toggleRegion = (regionName: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(regionName)) {
        next.delete(regionName);
        // Fechar todos os estados dessa região
        data?.regions
          .find((r) => r.name === regionName)
          ?.states.forEach((s) => {
            expandedStates.delete(`${regionName}-${s.uf}`);
          });
        setExpandedStates(new Set(expandedStates));
      } else {
        next.add(regionName);
      }
      return next;
    });
  };

  const toggleState = (regionName: string, uf: string) => {
    const key = `${regionName}-${uf}`;
    setExpandedStates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleCityDoubleClick = (cidade: string, uf: string) => {
    if (onCityClick) {
      onCityClick(cidade, uf);
    }
  };

  const getEntityIcon = () => {
    switch (entityType) {
      case 'clientes':
        return <Building2 className="w-4 h-4" />;
      case 'leads':
        return <Target className="w-4 h-4" />;
      case 'concorrentes':
        return <Users className="w-4 h-4" />;
    }
  };

  const getEntityColor = () => {
    switch (entityType) {
      case 'clientes':
        return 'text-blue-600 bg-blue-50';
      case 'leads':
        return 'text-green-600 bg-green-50';
      case 'concorrentes':
        return 'text-red-600 bg-red-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <p className="font-semibold">Erro ao carregar dados</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data || data.regions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-semibold">Nenhum dado encontrado</p>
          <p className="text-sm">Tente ajustar os filtros</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getEntityColor()}`}>{getEntityIcon()}</div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {entityType === 'clientes'
                  ? 'Clientes'
                  : entityType === 'leads'
                    ? 'Leads'
                    : 'Concorrentes'}
              </h3>
              <p className="text-sm text-gray-600">
                Total: {data.grandTotals[entityType].toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Localização
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantidade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.regions.map((region) => (
              <React.Fragment key={region.name}>
                {/* Linha da Região */}
                <tr
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleRegion(region.name)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {expandedRegions.has(region.name) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="font-semibold text-gray-900">{region.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-gray-900">
                      {region.totals[entityType].toLocaleString('pt-BR')}
                    </span>
                  </td>
                </tr>

                {/* Estados da Região */}
                {expandedRegions.has(region.name) &&
                  region.states.map((state) => (
                    <React.Fragment key={`${region.name}-${state.uf}`}>
                      {/* Linha do Estado */}
                      <tr
                        className="hover:bg-blue-50 cursor-pointer transition-colors bg-gray-50"
                        onClick={() => toggleState(region.name, state.uf)}
                      >
                        <td className="px-6 py-3 pl-12">
                          <div className="flex items-center gap-2">
                            {expandedStates.has(`${region.name}-${state.uf}`) ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="font-medium text-gray-800">{state.uf}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="font-medium text-gray-800">
                            {state.totals[entityType].toLocaleString('pt-BR')}
                          </span>
                        </td>
                      </tr>

                      {/* Cidades do Estado */}
                      {expandedStates.has(`${region.name}-${state.uf}`) &&
                        state.cities.map((city) => (
                          <tr
                            key={`${state.uf}-${city.name}`}
                            className="hover:bg-blue-100 cursor-pointer transition-colors"
                            onDoubleClick={() => handleCityDoubleClick(city.name, city.uf)}
                            title="Clique duas vezes para ver detalhes"
                          >
                            <td className="px-6 py-2 pl-20">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-700">{city.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-2 text-right">
                              <span className="text-sm text-gray-700">
                                {city.totals[entityType].toLocaleString('pt-BR')}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer com dica */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500">
          💡 Clique nas regiões e estados para expandir. Clique duas vezes nas cidades para ver
          detalhes.
        </p>
      </div>
    </div>
  );
}
