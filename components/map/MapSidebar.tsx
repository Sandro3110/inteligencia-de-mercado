'use client';

import { Building2, Target, TrendingUp, Search } from 'lucide-react';
import { useState } from 'react';

interface MapEntity {
  id: number;
  type: 'cliente' | 'lead' | 'concorrente';
  nome: string;
  cidade: string;
  uf: string;
  setor?: string;
  qualidadeClassificacao?: string;
  [key: string]: unknown;
}

interface MapSidebarProps {
  entities: MapEntity[];
  selectedEntity: MapEntity | null;
  onEntityClick: (entity: MapEntity) => void;
  stats?: {
    clientes: number;
    leads: number;
    concorrentes: number;
  };
}

export function MapSidebar({
  entities,
  selectedEntity,
  onEntityClick,
  stats: propStats,
}: MapSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Usar stats da prop ou calcular baseado em entities (fallback)
  const stats = propStats || {
    clientes: entities.filter((e) => e.type === 'cliente').length,
    leads: entities.filter((e) => e.type === 'lead').length,
    concorrentes: entities.filter((e) => e.type === 'concorrente').length,
  };

  // Filtrar entidades por busca
  const filteredEntities = entities.filter(
    (entity) =>
      entity.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.cidade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.uf.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Stats Cards */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Estatísticas</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Clientes</span>
            </div>
            <span className="text-lg font-bold text-blue-600">{stats.clientes}</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Leads</span>
            </div>
            <span className="text-lg font-bold text-green-600">{stats.leads}</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-red-50 rounded">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-gray-700">Concorrentes</span>
            </div>
            <span className="text-lg font-bold text-red-600">{stats.concorrentes}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Entity List */}
      <div className="flex-1 overflow-y-auto">
        {filteredEntities.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">Nenhuma entidade encontrada</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEntities.map((entity) => {
              const isSelected =
                selectedEntity?.id === entity.id && selectedEntity?.type === entity.type;

              return (
                <button
                  key={`${entity.type}-${entity.id}`}
                  onClick={() => onEntityClick(entity)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-xl">
                      {entity.type === 'cliente' ? '🏢' : entity.type === 'lead' ? '🎯' : '📈'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                            entity.type === 'cliente'
                              ? 'bg-blue-100 text-blue-700'
                              : entity.type === 'lead'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {entity.type}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {entity.nome}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {entity.cidade} - {entity.uf}
                      </p>
                      {entity.setor && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{entity.setor}</p>
                      )}
                      {entity.type === 'lead' && entity.qualidadeClassificacao && (
                        <div className="mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              entity.qualidadeClassificacao.toLowerCase() === 'alto'
                                ? 'bg-green-100 text-green-700'
                                : entity.qualidadeClassificacao.toLowerCase() === 'medio'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {entity.qualidadeClassificacao}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
