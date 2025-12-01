'use client';

import { useDrillDown } from '@/hooks/useDrillDown';
import { trpc } from '@/lib/trpc/client';
import { ProductCategoriesView } from './ProductCategoriesView';
import { ProductsView } from './ProductsView';
import { ProductDetailsView } from './ProductDetailsView';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ProductDrillDownStandaloneProps {
  projectId?: number;
  pesquisaId?: number;
  filters?: {
    setor?: string;
    porte?: string;
    qualidade?: string;
  };
}

/**
 * Componente standalone de drill-down de produtos
 * Aceita filtros externos via props
 */
export function ProductDrillDownStandalone({
  projectId,
  pesquisaId,
  filters,
}: ProductDrillDownStandaloneProps) {
  // Buscar pesquisas do projeto selecionado
  const { data: pesquisas } = trpc.pesquisas.list.useQuery(
    { projectId: projectId ?? 0 },
    { enabled: !!projectId }
  );

  const basePath = '/products';

  const {
    level,
    categoria,
    item,
    tipo,
    navigateToLevel1,
    navigateToLevel2,
    navigateToLevel3,
    goBack,
  } = useDrillDown({ basePath });

  // Validações
  if (!projectId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum projeto selecionado</h3>
            <p className="text-muted-foreground">
              Selecione um projeto nos filtros acima para visualizar produtos
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pesquisas || pesquisas.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma pesquisa encontrada</h3>
            <p className="text-muted-foreground">Este projeto não possui pesquisas cadastradas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Usar pesquisa específica ou todas as pesquisas do projeto
  const pesquisaIds = pesquisaId ? [pesquisaId] : pesquisas.map((p) => p.id);

  // NÍVEL 1: Categorias
  if (level === 1) {
    return (
      <ProductCategoriesView
        pesquisaIds={pesquisaIds}
        filters={filters}
        onDrillDown={navigateToLevel2}
      />
    );
  }

  // NÍVEL 2: Produtos
  if (level === 2 && categoria) {
    return (
      <ProductsView
        categoria={categoria}
        pesquisaIds={pesquisaIds}
        filters={filters}
        onBack={goBack}
        onDrillDown={navigateToLevel3}
      />
    );
  }

  // NÍVEL 3: Detalhes
  if (level === 3 && categoria && item && tipo) {
    return (
      <ProductDetailsView
        produtoNome={item}
        categoria={categoria}
        tipo={tipo as 'clientes' | 'leads' | 'concorrentes'}
        pesquisaIds={pesquisaIds}
        filters={filters}
        onBack={goBack}
        onBackToCategories={navigateToLevel1}
      />
    );
  }

  // Fallback
  return (
    <Card>
      <CardContent className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Estado inválido</p>
      </CardContent>
    </Card>
  );
}
