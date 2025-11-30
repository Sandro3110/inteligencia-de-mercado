'use client';

import React, { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { MapPin, Filter, X, Download, Building2, Target, Users } from 'lucide-react';
import { GeoTable } from '@/components/map/GeoTable';
import { EntityDetailCard } from '@/components/map/EntityDetailCard';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface MapEntity {
  id: number;
  type: 'cliente' | 'lead' | 'concorrente';
  nome: string;
  latitude: number;
  longitude: number;
  cidade: string;
  uf: string;
  [key: string]: unknown;
}

type EntityType = 'clientes' | 'leads' | 'concorrentes';

export default function GeoposicaoPage() {
  const [activeTab, setActiveTab] = useState<EntityType>('clientes');
  const [selectedCity, setSelectedCity] = useState<{ cidade: string; uf: string } | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<MapEntity | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    projectId: undefined as number | undefined,
    pesquisaId: undefined as number | undefined,
    setor: undefined as string | undefined,
    porte: undefined as string | undefined,
    qualidade: undefined as string | undefined,
  });

  // Queries
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: pesquisas } = trpc.pesquisas.list.useQuery(
    { projectId: filters.projectId ?? 0 },
    { enabled: !!filters.projectId }
  );
  const { data: availableFilters } = trpc.unifiedMap.getAvailableFilters.useQuery({
    projectId: filters.projectId,
    pesquisaId: filters.pesquisaId,
  });

  // Query para buscar entidades de uma cidade específica
  const { data: cityEntities, isLoading: isLoadingEntities } =
    trpc.mapHierarchical.getCityEntities.useQuery(
      {
        cidade: selectedCity?.cidade || '',
        uf: selectedCity?.uf || '',
        entityType: activeTab,
        projectId: filters.projectId ?? null,
        pesquisaId: filters.pesquisaId ?? null,
        page: 1,
        pageSize: 100,
      },
      {
        enabled: !!selectedCity,
      }
    );

  const handleCityClick = (cidade: string, uf: string) => {
    setSelectedCity({ cidade, uf });
  };

  const handleEntityClick = (entity: any) => {
    // Transformar entidade para o formato esperado
    const mapEntity: MapEntity = {
      id: entity.id,
      type: activeTab === 'clientes' ? 'cliente' : activeTab === 'leads' ? 'lead' : 'concorrente',
      nome: entity.nome,
      latitude: entity.latitude ? Number(entity.latitude) : 0,
      longitude: entity.longitude ? Number(entity.longitude) : 0,
      cidade: entity.cidade || '',
      uf: entity.uf || '',
      ...entity,
    };
    setSelectedEntity(mapEntity);
  };

  const clearFilters = () => {
    setFilters({
      projectId: undefined,
      pesquisaId: undefined,
      setor: undefined,
      porte: undefined,
      qualidade: undefined,
    });
  };

  const hasActiveFilters =
    filters.projectId || filters.pesquisaId || filters.setor || filters.porte || filters.qualidade;

  const handleExportExcel = () => {
    toast.error('Funcionalidade de exportação em desenvolvimento');
  };

  const handleExportCSV = () => {
    toast.error('Funcionalidade de exportação em desenvolvimento');
  };

  /*
  const handleExportExcelOLD = async () => {
    try {
      toast.info('Gerando planilha Excel...');

      // Buscar dados completos da API
      const data = await trpc.mapHierarchical.getHierarchicalData.useQuery({
        projectId: filters.projectId ?? null,
        pesquisaId: filters.pesquisaId ?? null,
        entityType: activeTab,
        filters: {
          setor: filters.setor ?? null,
          porte: filters.porte ?? null,
          qualidade: filters.qualidade ?? null,
        },
      });

      if (!data) {
        toast.error('Nenhum dado para exportar');
        return;
      }

      // Preparar dados para Excel
      const rows: any[] = [];

      data.regions.forEach((region) => {
        region.states.forEach((state) => {
          state.cities.forEach((city) => {
            rows.push({
              Região: region.name,
              UF: state.uf,
              Cidade: city.name,
              Quantidade: city.totals[activeTab],
            });
          });
        });
      });

      // Criar workbook
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Geoposição');

      // Download
      const fileName = `geoposicao_${activeTab}_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Planilha exportada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar planilha');
    }
  };

  const handleExportCSVOLD = async () => {
    try {
      toast.info('Gerando arquivo CSV...');

      // Buscar dados completos da API
      const data = await trpc.mapHierarchical.getHierarchicalData.useQuery({
        projectId: filters.projectId ?? null,
        pesquisaId: filters.pesquisaId ?? null,
        entityType: activeTab,
        filters: {
          setor: filters.setor ?? null,
          porte: filters.porte ?? null,
          qualidade: filters.qualidade ?? null,
        },
      });

      if (!data) {
        toast.error('Nenhum dado para exportar');
        return;
      }

      // Preparar dados para CSV
      const rows: string[] = ['Região,UF,Cidade,Quantidade'];

      data.regions.forEach((region) => {
        region.states.forEach((state) => {
          state.cities.forEach((city) => {
            rows.push(`${region.name},${state.uf},${city.name},${city.totals[activeTab]}`);
          });
        });
      });

      // Download
      const csv = rows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `geoposicao_${activeTab}_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('CSV exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar CSV');
    }
  };
  */

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Geoposição</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Filtros Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showFilters
                  ? 'bg-blue-600 text-white'
                  : hasActiveFilters
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">•</span>
              )}
            </button>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* Filtros Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Projeto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
                <select
                  value={filters.projectId || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    setFilters((prev) => ({ ...prev, projectId: value, pesquisaId: undefined }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {projects?.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pesquisa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesquisa</label>
                <select
                  value={filters.pesquisaId || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    setFilters((prev) => ({ ...prev, pesquisaId: value }));
                  }}
                  disabled={!filters.projectId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Todas</option>
                  {pesquisas?.map((pesquisa) => (
                    <option key={pesquisa.id} value={pesquisa.id}>
                      {pesquisa.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Setor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
                <select
                  value={filters.setor || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, setor: e.target.value || undefined }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {availableFilters?.setores?.map((setor) => (
                    <option key={setor} value={setor}>
                      {setor}
                    </option>
                  ))}
                </select>
              </div>

              {/* Porte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Porte</label>
                <select
                  value={filters.porte || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, porte: e.target.value || undefined }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {availableFilters?.portes?.map((porte) => (
                    <option key={porte} value={porte}>
                      {porte}
                    </option>
                  ))}
                </select>
              </div>

              {/* Qualidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualidade</label>
                <select
                  value={filters.qualidade || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, qualidade: e.target.value || undefined }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  {availableFilters?.qualidades?.map((qualidade) => (
                    <option key={qualidade} value={qualidade}>
                      {qualidade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
                >
                  <X className="w-4 h-4" />
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('clientes')}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'clientes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Clientes
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'leads'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Target className="w-4 h-4" />
            Leads
          </button>
          <button
            onClick={() => setActiveTab('concorrentes')}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'concorrentes'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Concorrentes
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <GeoTable
          projectId={filters.projectId}
          pesquisaId={filters.pesquisaId}
          entityType={activeTab}
          filters={{
            setor: filters.setor,
            porte: filters.porte,
            qualidade: filters.qualidade,
          }}
          onCityClick={handleCityClick}
        />
      </div>

      {/* Modal de Entidades da Cidade */}
      {selectedCity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedCity.cidade} - {selectedCity.uf}
              </h2>
              <button
                onClick={() => setSelectedCity(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-auto max-h-[60vh]">
              {isLoadingEntities ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : cityEntities && cityEntities.data.length > 0 ? (
                <div className="space-y-2">
                  {cityEntities.data.map((entity: any) => (
                    <div
                      key={entity.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onDoubleClick={() => handleEntityClick(entity)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{entity.nome}</h3>
                          <p className="text-sm text-gray-600">
                            {entity.setor && `${entity.setor} • `}
                            {entity.porte && `${entity.porte}`}
                          </p>
                        </div>
                        {entity.qualidadeClassificacao && (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              entity.qualidadeClassificacao === 'Alta'
                                ? 'bg-green-100 text-green-800'
                                : entity.qualidadeClassificacao === 'Média'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {entity.qualidadeClassificacao}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">Nenhuma entidade encontrada</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Entidade */}
      {selectedEntity && (
        <EntityDetailCard entity={selectedEntity} onClose={() => setSelectedEntity(null)} />
      )}
    </div>
  );
}
