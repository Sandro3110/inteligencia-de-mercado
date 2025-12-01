'use client';

import { useDrillDown } from '@/hooks/useDrillDown';
import { SectorCategoriesView } from './SectorCategoriesView';
import { SectorsView } from './SectorsView';
import { SectorDetailsView } from './SectorDetailsView';

interface SectorDrillDownProps {
  projectId: number;
  surveyId: number;
  pesquisaIds: number[];
}

/**
 * Componente principal de drill-down de setores
 * Orquestra os 3 níveis de navegação
 */
export function SectorDrillDown({ projectId, surveyId, pesquisaIds }: SectorDrillDownProps) {
  const basePath = `/projects/${projectId}/surveys/${surveyId}/sectors`;

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
    return <SectorCategoriesView pesquisaIds={pesquisaIds} onDrillDown={navigateToLevel2} />;
  }

  // NÍVEL 2: Setores
  if (level === 2 && categoria) {
    return (
      <SectorsView
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
      <SectorDetailsView
        setorNome={item}
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
