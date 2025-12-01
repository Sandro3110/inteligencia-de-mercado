'use client';

import React, { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { BarChart3, Filter, X, Download, Building2, Target, Users } from 'lucide-react';
import { EntityDetailCard } from '@/components/map/EntityDetailCard';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface SectorEntity {
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

export default function SetoresPage() {
  const [activeTab, setActiveTab] = useState<EntityType>('clientes');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<SectorEntity | null>(null);
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

  // Buscar resumo de setores
  const { data: sectorsData, isLoading } = trpc.sectorAnalysis.getSectorSummary.useQuery(
    {
      projectId: filters.projectId ?? null,
      pesquisaId: filters.pesquisaId ?? null,
    },
    {
      enabled: !!filters.projectId,
    }
  );

  // Buscar entidades de um setor específico
  const { data: sectorEntities, isLoading: isLoadingEntities } =
    trpc.mapHierarchical.getCityEntities.useQuery(
      {
        cidade: '', // Não filtrar por cidade
        uf: '', // Não filtrar por UF
        entityType: activeTab,
        projectId: filters.projectId ?? null,
        pesquisaId: filters.pesquisaId ?? null,
        page: 1,
        pageSize: 1000,
        setor: selectedSector ?? undefined,
      },
      {
        enabled: !!selectedSector && !!filters.projectId,
      }
    );

  const handleEntityClick = (entity: any) => {
    const sectorEntity: SectorEntity = {
      id: entity.id,
      type: activeTab === 'clientes' ? 'cliente' : activeTab === 'leads' ? 'lead' : 'concorrente',
      nome: entity.nome,
      latitude: entity.latitude ? Number(entity.latitude) : 0,
      longitude: entity.longitude ? Number(entity.longitude) : 0,
      cidade: entity.cidade || '',
      uf: entity.uf || '',
      ...entity,
    };
    setSelectedEntity(sectorEntity);
  };

  const clearFilters = () => {
    setFilters({
      projectId: undefined,
      pesquisaId: undefined,
      setor: undefined,
      porte: undefined,
      qualidade: undefined,
    });
    setSelectedSector(null);
  };

  const hasActiveFilters =
    filters.projectId || filters.pesquisaId || filters.setor || filters.porte || filters.qualidade;

  const handleExportExcel = () => {
    if (!sectorsData || sectors.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    try {
      const exportData = sectors.map((sector: any) => ({
        Setor: sector.setor,
        Clientes: sector.clientes,
        Leads: sector.leads,
        Concorrentes: sector.concorrentes,
        Score: sector.score.toFixed(2),
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Setores');
      XLSX.writeFile(wb, `setores_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Arquivo Excel exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar arquivo Excel');
    }
  };

  const handleExportCSV = () => {
    if (!sectorsData || sectors.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    try {
      const exportData = sectors.map((sector: any) => ({
        Setor: sector.setor,
        Clientes: sector.clientes,
        Leads: sector.leads,
        Concorrentes: sector.concorrentes,
        Score: sector.score.toFixed(2),
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `setores_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('Arquivo CSV exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar arquivo CSV');
    }
  };

  const { sectors = [], totals } = sectorsData || {};

  // Função para calcular estrelas baseado no score
  const getScoreStars = (score: number) => {
    if (score >= 2.0) return '⭐⭐⭐⭐⭐';
    if (score >= 1.5) return '⭐⭐⭐⭐';
    if (score >= 1.0) return '⭐⭐⭐';
    if (score >= 0.5) return '⭐⭐';
    return '⭐';
  };

  // Função para cor do badge baseado no score
  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
    if (score >= 1.5) return 'default';
    if (score >= 0.8) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                Análise de Setores
              </h1>
              <p className="text-gray-600 mt-1">
                Visão agregada de setores com score de oportunidade
              </p>
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

              {/* Limpar Filtros */}
              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
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
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('clientes')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
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
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
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
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'concorrentes'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Concorrentes
          </button>
        </div>

        {/* Content */}
        {!filters.projectId ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">
              Selecione um projeto nos filtros para visualizar setores
            </p>
          </Card>
        ) : isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">Carregando...</p>
          </Card>
        ) : selectedSector ? (
          // Lista de entidades do setor selecionado
          <Card>
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold">
                {selectedSector} - {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h3>
              <button
                onClick={() => setSelectedSector(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {isLoadingEntities ? (
                <p className="text-center text-gray-600">Carregando entidades...</p>
              ) : sectorEntities && sectorEntities.entities.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>UF</TableHead>
                      {activeTab === 'leads' && <TableHead>Qualidade</TableHead>}
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectorEntities.entities.map((entity: any) => (
                      <TableRow key={entity.id}>
                        <TableCell className="font-medium">{entity.nome}</TableCell>
                        <TableCell>{entity.cidade}</TableCell>
                        <TableCell>{entity.uf}</TableCell>
                        {activeTab === 'leads' && (
                          <TableCell>
                            <Badge variant="outline">{entity.qualidadeClassificacao || '-'}</Badge>
                          </TableCell>
                        )}
                        <TableCell>
                          <button
                            onClick={() => handleEntityClick(entity)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Ver Detalhes
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-600">Nenhuma entidade encontrada</p>
              )}
            </div>
          </Card>
        ) : (
          // Tabela de setores
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Setor</TableHead>
                  <TableHead className="text-center">Clientes</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="text-center">Concorrentes</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-600 py-8">
                      Nenhum setor encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  sectors.map((sector: any) => (
                    <TableRow key={sector.setor}>
                      <TableCell className="font-medium">{sector.setor}</TableCell>
                      <TableCell className="text-center">{sector.clientes}</TableCell>
                      <TableCell className="text-center">{sector.leads}</TableCell>
                      <TableCell className="text-center">{sector.concorrentes}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getScoreBadgeVariant(sector.score)}>
                          {getScoreStars(sector.score)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => setSelectedSector(sector.setor)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver Entidades
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Entity Detail Modal */}
      {selectedEntity && (
        <EntityDetailCard
          entity={selectedEntity}
          onClose={() => setSelectedEntity(null)}
          entityType={selectedEntity.type}
        />
      )}
    </div>
  );
}
