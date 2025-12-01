'use client';

import { useDrillDown } from '@/hooks/useDrillDown';
import { ProductCategoriesView } from './ProductCategoriesView';
import { ProductsView } from './ProductsView';
import { ProductDetailsView } from './ProductDetailsView';

interface ProductDrillDownProps {
  projectId: number;
  surveyId: number;
  pesquisaIds: number[];
}

/**
 * Componente principal de drill-down de produtos
 * Orquestra os 3 níveis de navegação
 */
export function ProductDrillDown({ projectId, surveyId, pesquisaIds }: ProductDrillDownProps) {
  const basePath = `/projects/${projectId}/surveys/${surveyId}/products`;

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

  // NÍVEL 1: Categorias
  if (level === 1) {
    return <ProductCategoriesView pesquisaIds={pesquisaIds} onDrillDown={navigateToLevel2} />;
  }

  // NÍVEL 2: Produtos
  if (level === 2 && categoria) {
    return (
      <ProductsView
        categoria={categoria}
        pesquisaIds={pesquisaIds}
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
        onBack={goBack}
        onBackToCategories={navigateToLevel1}
      />
    );
  }

  // Fallback (não deveria acontecer)
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">Estado inválido</p>
    </div>
  );
}
