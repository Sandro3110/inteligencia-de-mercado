'use client';

import { useState } from 'react';
import { ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { DrillDownBreadcrumb } from './DrillDownBreadcrumb';
import { DrillDownTable, type DrillDownColumn } from './DrillDownTable';

interface ProductsViewProps {
  categoria: string;
  pesquisaIds: number[];
  onBack: () => void;
  onDrillDown: (produtoNome: string, tipo: 'clientes' | 'leads' | 'concorrentes') => void;
}

/**
 * NÍVEL 2: Visualização de produtos de uma categoria
 * Mostra lista de produtos com contadores e botões para drill-down
 */
export function ProductsView({ categoria, pesquisaIds, onBack, onDrillDown }: ProductsViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const { data, isLoading } = trpc.productDrillDown.getProducts.useQuery({
    categoria,
    pesquisaIds,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  });

  const produtos = data?.items || [];
  const total = data?.total || 0;

  // Definir colunas da tabela
  const columns: DrillDownColumn[] = [
    {
      key: 'nome',
      label: 'Produto',
      width: '30%',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'clientes',
      label: 'Clientes',
      width: '15%',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span>{value}</span>
          {value > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onDrillDown(row.nome, 'clientes')}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'leads',
      label: 'Leads',
      width: '15%',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span>{value}</span>
          {value > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onDrillDown(row.nome, 'leads')}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'concorrentes',
      label: 'Concorrentes',
      width: '15%',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span>{value}</span>
          {value > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onDrillDown(row.nome, 'concorrentes')}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      width: '25%',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.clientes > 0 && (
            <Button variant="outline" size="sm" onClick={() => onDrillDown(row.nome, 'clientes')}>
              Ver Clientes
            </Button>
          )}
          {row.leads > 0 && (
            <Button variant="outline" size="sm" onClick={() => onDrillDown(row.nome, 'leads')}>
              Ver Leads
            </Button>
          )}
          {row.concorrentes > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDrillDown(row.nome, 'concorrentes')}
            >
              Ver Concorrentes
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <DrillDownBreadcrumb
        items={[{ label: 'Categorias', onClick: onBack }, { label: categoria }]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{categoria}</h2>
          <p className="text-muted-foreground">
            {total} produto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>

        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
          <CardDescription>
            Clique nos botões "Ver" para explorar clientes, leads ou concorrentes de cada produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DrillDownTable
            columns={columns}
            data={produtos}
            isLoading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            total={total}
            onPageChange={setCurrentPage}
            emptyMessage="Nenhum produto encontrado nesta categoria"
          />
        </CardContent>
      </Card>
    </div>
  );
}
