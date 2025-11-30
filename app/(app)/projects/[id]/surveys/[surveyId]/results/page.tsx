'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Users, Target, TrendingUp, MapPin, Download } from 'lucide-react';
import { DataTable } from '@/components/results/DataTable';
import { FilterBar } from '@/components/results/FilterBar';
import { DetailModal, type DetailModalType } from '@/components/results/DetailModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type TabType = 'clientes' | 'leads' | 'concorrentes' | 'mercados';

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.id as string);
  const surveyId = parseInt(params.surveyId as string);

  const [activeTab, setActiveTab] = useState<TabType>('clientes');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Modal de detalhes
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Record<string, unknown> | null>(null);
  const [modalType, setModalType] = useState<DetailModalType>('cliente');

  const pageSize = 20;

  // Queries
  console.log('[ResultsPage] surveyId from URL:', surveyId);
  const { data: pesquisa } = trpc.pesquisas.getById.useQuery(surveyId);
  console.log('[ResultsPage] pesquisa data:', pesquisa);
  const { data: kpis } = trpc.results.getKPIs.useQuery({ pesquisaId: surveyId });

  const {
    data: clientesData,
    isLoading: loadingClientes,
    error: clientesError,
  } = trpc.results.getClientes.useQuery(
    {
      pesquisaId: surveyId,
      page,
      pageSize,
      searchQuery: searchQuery || undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    },
    { enabled: activeTab === 'clientes' }
  );
  console.log('[ResultsPage] clientesData:', clientesData);
  console.log('[ResultsPage] clientesError:', clientesError);
  console.log('[ResultsPage] loadingClientes:', loadingClientes);

  const { data: leadsData, isLoading: loadingLeads } = trpc.results.getLeads.useQuery(
    {
      pesquisaId: surveyId,
      page,
      pageSize,
      searchQuery: searchQuery || undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    },
    { enabled: activeTab === 'leads' }
  );

  const { data: concorrentesData, isLoading: loadingConcorrentes } =
    trpc.results.getConcorrentes.useQuery(
      {
        pesquisaId: surveyId,
        page,
        pageSize,
        searchQuery: searchQuery || undefined,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      },
      { enabled: activeTab === 'concorrentes' }
    );

  const { data: mercadosData, isLoading: loadingMercados } = trpc.results.getMercados.useQuery(
    {
      pesquisaId: surveyId,
      page,
      pageSize,
      searchQuery: searchQuery || undefined,
    },
    { enabled: activeTab === 'mercados' }
  );

  // Export mutation - usar a mesma do projeto (Excel com 5 abas)
  const exportProjectMutation = trpc.export.exportProject.useMutation();

  // Handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleRowDoubleClick = (item: Record<string, unknown>) => {
    setSelectedItem(item);
    setModalType(
      activeTab === 'clientes'
        ? 'cliente'
        : activeTab === 'leads'
          ? 'lead'
          : activeTab === 'concorrentes'
            ? 'concorrente'
            : 'mercado'
    );
    setIsModalOpen(true);
  };

  const handleExport = async () => {
    try {
      toast.info('Gerando arquivo Excel...');

      // Usar a mesma exportação Excel do projeto (5 abas)
      const result = await exportProjectMutation.mutateAsync({ projectId });

      if (result) {
        // Converter base64 para Blob (compatível com browser)
        const binaryString = atob(result.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        toast.success('Excel exportado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao exportar Excel');
      console.error('Export error:', error);
    }
  };

  const tabs = [
    { id: 'clientes', label: 'Clientes', icon: Users, count: kpis?.totalClientes || 0 },
    { id: 'leads', label: 'Leads', icon: Target, count: kpis?.totalLeads || 0 },
    {
      id: 'concorrentes',
      label: 'Concorrentes',
      icon: TrendingUp,
      count: kpis?.totalConcorrentes || 0,
    },
    { id: 'mercados', label: 'Mercados', icon: MapPin, count: kpis?.totalMercados || 0 },
  ] as const;

  // Columns definitions
  const clientesColumns = [
    { key: 'nome', label: 'Nome' },
    { key: 'cnpj', label: 'CNPJ' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'uf', label: 'UF' },
    { key: 'produtoPrincipal', label: 'Produto' },
    {
      key: 'validationStatus',
      label: 'Status',
      render: (item: Record<string, unknown>) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            item.validationStatus === 'approved'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {item.validationStatus === 'approved' ? 'Aprovado' : 'Pendente'}
        </span>
      ),
    },
  ];

  const leadsColumns = [
    { key: 'nome', label: 'Nome' },
    { key: 'setor', label: 'Setor' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'uf', label: 'UF' },
    {
      key: 'qualidadeClassificacao',
      label: 'Potencial',
      render: (item: Record<string, unknown>) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            item.qualidadeClassificacao === 'Alto'
              ? 'bg-green-100 text-green-800'
              : item.qualidadeClassificacao === 'Médio'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {item.qualidadeClassificacao}
        </span>
      ),
    },
    { key: 'justificativa', label: 'Justificativa' },
  ];

  const concorrentesColumns = [
    { key: 'nome', label: 'Nome' },
    { key: 'descricao', label: 'Descrição' },
    { key: 'porte', label: 'Porte' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'uf', label: 'UF' },
  ];

  const mercadosColumns = [
    { key: 'nome', label: 'Nome' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'segmentacao', label: 'Segmentação' },
    { key: 'tamanhoEstimado', label: 'Tamanho Estimado' },
    { key: 'quantidadeClientes', label: 'Clientes' },
  ];

  // Filter options
  const clientesFilterOptions = [
    { key: 'setor', label: 'Setor', options: ['Indústria', 'Comércio', 'Serviços'] },
    { key: 'uf', label: 'Estado', options: ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC'] },
    {
      key: 'validationStatus',
      label: 'Status',
      options: ['approved', 'pending', 'rejected'],
    },
  ];

  const leadsFilterOptions = [
    { key: 'setor', label: 'Setor', options: ['Indústria', 'Comércio', 'Serviços'] },
    { key: 'uf', label: 'Estado', options: ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC'] },
    {
      key: 'qualidadeClassificacao',
      label: 'Potencial',
      options: ['Alto', 'Médio', 'Baixo'],
    },
  ];

  const concorrentesFilterOptions = [
    { key: 'porte', label: 'Porte', options: ['Pequeno', 'Médio', 'Grande'] },
    { key: 'uf', label: 'Estado', options: ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC'] },
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'clientes':
        return clientesData;
      case 'leads':
        return leadsData;
      case 'concorrentes':
        return concorrentesData;
      case 'mercados':
        return mercadosData;
      default:
        return null;
    }
  };

  const getCurrentColumns = () => {
    switch (activeTab) {
      case 'clientes':
        return clientesColumns;
      case 'leads':
        return leadsColumns;
      case 'concorrentes':
        return concorrentesColumns;
      case 'mercados':
        return mercadosColumns;
      default:
        return [];
    }
  };

  const getCurrentFilterOptions = () => {
    switch (activeTab) {
      case 'clientes':
        return clientesFilterOptions;
      case 'leads':
        return leadsFilterOptions;
      case 'concorrentes':
        return concorrentesFilterOptions;
      default:
        return [];
    }
  };

  const isLoading = loadingClientes || loadingLeads || loadingConcorrentes || loadingMercados;
  const currentData = getCurrentData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/projects/${projectId}`)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para Projeto
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Resultados</h1>
            <p className="text-gray-600 dark:text-gray-400">Pesquisa: {pesquisa?.nome}</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              disabled={exportProjectMutation.isPending}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {exportProjectMutation.isPending ? 'Exportando...' : 'Exportar Excel'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setPage(1);
                    setFilters({});
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  <span className="ml-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Filters */}
          {activeTab !== 'mercados' && (
            <div className="mb-6">
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                filterOptions={getCurrentFilterOptions()}
              />
            </div>
          )}

          {/* Table */}
          <DataTable
            data={currentData?.data || []}
            columns={getCurrentColumns()}
            currentPage={currentData?.page || 1}
            totalPages={currentData?.totalPages || 1}
            pageSize={pageSize}
            total={currentData?.total || 0}
            onPageChange={setPage}
            isLoading={isLoading}
            onRowDoubleClick={handleRowDoubleClick}
          />
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedItem && (
        <DetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          type={modalType}
          data={selectedItem}
        />
      )}
    </div>
  );
}
