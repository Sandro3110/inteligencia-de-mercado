'use client';

import React, { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Package, Filter, X, Download, Building2, Target, Users } from 'lucide-react';
import { EntityDetailCard } from '@/components/map/EntityDetailCard';
import { toast } from 'sonner';
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

interface ProductEntity {
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

export default function ProdutosPage() {
  const [activeTab, setActiveTab] = useState<EntityType>('clientes');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<ProductEntity | null>(null);
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

  // Buscar ranking de produtos
  const { data: rankingData, isLoading } = trpc.productAnalysis.getProductRanking.useQuery(
    {
      projectId: filters.projectId ?? null,
      pesquisaId: filters.pesquisaId ?? null,
    },
    {
      enabled: !!filters.projectId,
    }
  );

  // Buscar entidades de um produto específico
  const { data: productEntities, isLoading: isLoadingEntities } =
    trpc.mapHierarchical.getCityEntities.useQuery(
      {
        cidade: '', // Não filtrar por cidade
        uf: '', // Não filtrar por UF
        entityType: 'clientes', // Produtos só existem em clientes
        projectId: filters.projectId ?? null,
        pesquisaId: filters.pesquisaId ?? null,
        page: 1,
        pageSize: 1000,
        produto: selectedProduct ?? undefined,
      },
      {
        enabled: !!selectedProduct && !!filters.projectId,
      }
    );

  const handleEntityClick = (entity: any) => {
    const productEntity: ProductEntity = {
      id: entity.id,
      type: 'cliente',
      nome: entity.nome,
      latitude: entity.latitude ? Number(entity.latitude) : 0,
      longitude: entity.longitude ? Number(entity.longitude) : 0,
      cidade: entity.cidade || '',
      uf: entity.uf || '',
      ...entity,
    };
    setSelectedEntity(productEntity);
  };

  const clearFilters = () => {
    setFilters({
      projectId: undefined,
      pesquisaId: undefined,
      setor: undefined,
      porte: undefined,
      qualidade: undefined,
    });
    setSelectedProduct(null);
  };

  const hasActiveFilters =
    filters.projectId || filters.pesquisaId || filters.setor || filters.porte || filters.qualidade;

  const handleExportExcel = () => {
    toast.error('Funcionalidade de exportação em desenvolvimento');
  };

  const handleExportCSV = () => {
    toast.error('Funcionalidade de exportação em desenvolvimento');
  };

  const { products = [] } = rankingData || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-8 h-8 text-blue-600" />
                Análise de Produtos
              </h1>
              <p className="text-gray-600 mt-1">Ranking de produtos por número de clientes</p>
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
            disabled
            className="flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 border-transparent text-gray-400 cursor-not-allowed"
          >
            <Target className="w-4 h-4" />
            Leads
            <Badge variant="secondary" className="ml-2 text-xs">
              N/A
            </Badge>
          </button>
          <button
            onClick={() => setActiveTab('concorrentes')}
            disabled
            className="flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 border-transparent text-gray-400 cursor-not-allowed"
          >
            <Users className="w-4 h-4" />
            Concorrentes
            <Badge variant="secondary" className="ml-2 text-xs">
              N/A
            </Badge>
          </button>
        </div>

        {/* Content */}
        {!filters.projectId ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">
              Selecione um projeto nos filtros para visualizar produtos
            </p>
          </Card>
        ) : isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">Carregando...</p>
          </Card>
        ) : selectedProduct ? (
          // Lista de clientes do produto selecionado
          <Card>
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold">{selectedProduct} - Clientes</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {isLoadingEntities ? (
                <p className="text-center text-gray-600">Carregando clientes...</p>
              ) : productEntities && productEntities.entities.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>UF</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productEntities.entities.map((entity: any) => (
                      <TableRow key={entity.id}>
                        <TableCell className="font-medium">{entity.nome}</TableCell>
                        <TableCell>{entity.cidade}</TableCell>
                        <TableCell>{entity.uf}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{entity.setor || '-'}</Badge>
                        </TableCell>
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
                <p className="text-center text-gray-600">Nenhum cliente encontrado</p>
              )}
            </div>
          </Card>
        ) : (
          // Tabela de produtos
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-center">Clientes</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-600 py-8">
                      Nenhum produto encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product: any) => (
                    <TableRow key={product.nome}>
                      <TableCell className="font-medium">{product.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.categoria}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{product.clientes}</TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => setSelectedProduct(product.nome)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver Clientes
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
