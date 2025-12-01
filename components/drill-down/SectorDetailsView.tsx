'use client';

import { useState } from 'react';
import { ArrowLeft, Users, UserPlus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { DrillDownBreadcrumb } from './DrillDownBreadcrumb';
import { DrillDownTable, type DrillDownColumn } from './DrillDownTable';
import { DataActionsBar } from '../export-actions/DataActionsBar';
import type { ExcelColumn } from '@/lib/excel-exporter';

interface SectorDetailsViewProps {
  setorNome: string;
  categoria: string;
  tipo: 'clientes' | 'leads' | 'concorrentes';
  pesquisaIds: number[];
  onBack: () => void;
  onBackToCategories: () => void;
}

/**
 * NÍVEL 3: Visualização de detalhes (clientes/leads/concorrentes) de um setor
 * Mostra lista completa com exportação
 */
export function SectorDetailsView({
  setorNome,
  categoria,
  tipo,
  pesquisaIds,
  onBack,
  onBackToCategories,
}: SectorDetailsViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Query baseada no tipo
  const clientesQuery = trpc.sectorDrillDown.getClientesBySetor.useQuery(
    {
      setorNome,
      categoria,
      pesquisaIds,
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    },
    { enabled: tipo === 'clientes' }
  );

  const leadsQuery = trpc.sectorDrillDown.getLeadsBySetor.useQuery(
    {
      setorNome,
      categoria,
      pesquisaIds,
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    },
    { enabled: tipo === 'leads' }
  );

  const concorrentesQuery = trpc.sectorDrillDown.getConcorrentesBySetor.useQuery(
    {
      setorNome,
      categoria,
      pesquisaIds,
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    },
    { enabled: tipo === 'concorrentes' }
  );

  // Selecionar query ativa
  const activeQuery =
    tipo === 'clientes' ? clientesQuery : tipo === 'leads' ? leadsQuery : concorrentesQuery;
  const items = activeQuery.data?.items || [];
  const total = activeQuery.data?.total || 0;
  const isLoading = activeQuery.isLoading;

  // Configuração por tipo
  const config = {
    clientes: {
      icon: Users,
      label: 'Clientes',
      color: 'bg-green-500',
      columns: [
        { key: 'nome', label: 'Nome', width: '25%' },
        { key: 'setor', label: 'Setor', width: '15%' },
        { key: 'cidade', label: 'Cidade', width: '15%' },
        { key: 'uf', label: 'UF', width: '8%' },
        {
          key: 'qualidadeClassificacao',
          label: 'Qualidade',
          width: '12%',
          render: (value: string) => (
            <Badge
              variant={value === 'Alta' ? 'default' : value === 'Média' ? 'secondary' : 'outline'}
            >
              {value || 'N/A'}
            </Badge>
          ),
        },
        { key: 'telefone', label: 'Telefone', width: '12%' },
        { key: 'email', label: 'Email', width: '13%' },
      ] as DrillDownColumn[],
    },
    leads: {
      icon: UserPlus,
      label: 'Leads',
      color: 'bg-orange-500',
      columns: [
        { key: 'nome', label: 'Nome', width: '25%' },
        { key: 'setor', label: 'Setor', width: '15%' },
        { key: 'cidade', label: 'Cidade', width: '15%' },
        { key: 'uf', label: 'UF', width: '8%' },
        {
          key: 'qualidadeScore',
          label: 'Score',
          width: '12%',
          render: (value: number) => <span className="font-medium">{value || 0}</span>,
        },
        { key: 'telefone', label: 'Telefone', width: '12%' },
        { key: 'email', label: 'Email', width: '13%' },
      ] as DrillDownColumn[],
    },
    concorrentes: {
      icon: Building2,
      label: 'Concorrentes',
      color: 'bg-red-500',
      columns: [
        { key: 'nome', label: 'Nome', width: '30%' },
        { key: 'setor', label: 'Setor', width: '15%' },
        { key: 'cidade', label: 'Cidade', width: '15%' },
        { key: 'uf', label: 'UF', width: '8%' },
        { key: 'porte', label: 'Porte', width: '12%' },
        { key: 'faturamentoEstimado', label: 'Faturamento', width: '20%' },
      ] as DrillDownColumn[],
    },
  };

  const currentConfig = config[tipo];
  const Icon = currentConfig.icon;

  // Colunas para exportação
  const excelColumns: ExcelColumn[] = currentConfig.columns.map((col) => ({
    key: col.key,
    label: col.label,
    width: 20,
  }));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <DrillDownBreadcrumb
        items={[
          { label: 'Categorias', onClick: onBackToCategories },
          { label: categoria, onClick: onBack },
          { label: setorNome, onClick: onBack },
          { label: currentConfig.label },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${currentConfig.color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{setorNome}</h2>
            <p className="text-muted-foreground">
              {total} {currentConfig.label.toLowerCase()} encontrado{total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Barra de ações (exportação) */}
      <DataActionsBar
        currentData={items}
        currentColumns={excelColumns}
        currentType={tipo}
        setorNome={setorNome}
        categoria={categoria}
        pesquisaIds={pesquisaIds}
        analysisType="setor"
        filename={`${setorNome}_${currentConfig.label}`}
        sheetName={currentConfig.label}
        title={`${setorNome} - ${currentConfig.label}`}
        showMultiSheetExport={true}
      />

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>{currentConfig.label}</CardTitle>
          <CardDescription>
            Lista completa de {currentConfig.label.toLowerCase()} do setor "{setorNome}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DrillDownTable
            columns={currentConfig.columns}
            data={items}
            isLoading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            total={total}
            onPageChange={setCurrentPage}
            emptyMessage={`Nenhum ${tipo} encontrado para este setor`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
