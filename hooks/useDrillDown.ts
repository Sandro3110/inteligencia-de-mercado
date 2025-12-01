/**
 * Hook para gerenciar navegação drill-down
 * Controla os 3 níveis: Categorias → Itens → Detalhes
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface UseDrillDownOptions {
  basePath: string; // Ex: '/projects/[id]/surveys/[surveyId]/products'
}

export interface DrillDownState {
  level: 1 | 2 | 3;
  categoria: string | null;
  item: string | null;
  tipo: 'clientes' | 'leads' | 'concorrentes' | null;
}

export interface UseDrillDownReturn extends DrillDownState {
  navigateToLevel1: () => void;
  navigateToLevel2: (categoriaId: string) => void;
  navigateToLevel3: (itemNome: string, tipoData: 'clientes' | 'leads' | 'concorrentes') => void;
  goBack: () => void;
  canGoBack: boolean;
}

/**
 * Hook para gerenciar estado e navegação do drill-down
 *
 * @example
 * ```tsx
 * const { level, categoria, item, tipo, navigateToLevel2, goBack } = useDrillDown({
 *   basePath: `/projects/${projectId}/surveys/${surveyId}/products`
 * });
 *
 * if (level === 1) return <CategoriesView onDrillDown={navigateToLevel2} />;
 * if (level === 2) return <ItemsView categoria={categoria!} onBack={goBack} />;
 * if (level === 3) return <DetailsView item={item!} tipo={tipo!} onBack={goBack} />;
 * ```
 */
export function useDrillDown({ basePath }: UseDrillDownOptions): UseDrillDownReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado atual do drill-down
  const state: DrillDownState = useMemo(() => {
    const levelParam = searchParams.get('level');
    const level = (levelParam ? parseInt(levelParam) : 1) as 1 | 2 | 3;

    return {
      level: level >= 1 && level <= 3 ? level : 1,
      categoria: searchParams.get('categoria'),
      item: searchParams.get('item'),
      tipo: searchParams.get('tipo') as 'clientes' | 'leads' | 'concorrentes' | null,
    };
  }, [searchParams]);

  // Navegar para nível 1 (Categorias)
  const navigateToLevel1 = useCallback(() => {
    router.push(basePath);
  }, [router, basePath]);

  // Navegar para nível 2 (Itens)
  const navigateToLevel2 = useCallback(
    (categoriaId: string) => {
      const params = new URLSearchParams();
      params.set('level', '2');
      params.set('categoria', categoriaId);

      router.push(`${basePath}?${params.toString()}`);
    },
    [router, basePath]
  );

  // Navegar para nível 3 (Detalhes)
  const navigateToLevel3 = useCallback(
    (itemNome: string, tipoData: 'clientes' | 'leads' | 'concorrentes') => {
      if (!state.categoria) {
        console.error('Categoria não definida ao navegar para nível 3');
        return;
      }

      const params = new URLSearchParams();
      params.set('level', '3');
      params.set('categoria', state.categoria);
      params.set('item', itemNome);
      params.set('tipo', tipoData);

      router.push(`${basePath}?${params.toString()}`);
    },
    [router, basePath, state.categoria]
  );

  // Voltar um nível
  const goBack = useCallback(() => {
    if (state.level === 3) {
      // Nível 3 → Nível 2
      navigateToLevel2(state.categoria!);
    } else if (state.level === 2) {
      // Nível 2 → Nível 1
      navigateToLevel1();
    }
    // Nível 1 não tem volta (já está no início)
  }, [state.level, state.categoria, navigateToLevel1, navigateToLevel2]);

  // Verificar se pode voltar
  const canGoBack = state.level > 1;

  return {
    ...state,
    navigateToLevel1,
    navigateToLevel2,
    navigateToLevel3,
    goBack,
    canGoBack,
  };
}

/**
 * Helper para construir breadcrumb baseado no estado do drill-down
 */
export function buildBreadcrumb(state: DrillDownState): { label: string; onClick?: () => void }[] {
  const breadcrumb: { label: string; onClick?: () => void }[] = [];

  // Nível 1: Categorias
  breadcrumb.push({ label: 'Categorias' });

  // Nível 2: Item específico
  if (state.level >= 2 && state.categoria) {
    breadcrumb.push({ label: state.categoria });
  }

  // Nível 3: Detalhes
  if (state.level === 3 && state.item && state.tipo) {
    breadcrumb.push({ label: state.item });

    const tipoLabel = {
      clientes: 'Clientes',
      leads: 'Leads',
      concorrentes: 'Concorrentes',
    }[state.tipo];

    breadcrumb.push({ label: tipoLabel });
  }

  return breadcrumb;
}
