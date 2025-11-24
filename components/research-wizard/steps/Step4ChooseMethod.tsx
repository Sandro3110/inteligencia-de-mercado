'use client';

/**
 * Step4ChooseMethod - Escolher Método de Entrada
 * Seleciona entre entrada manual, upload de planilha ou pré-pesquisa com IA
 */

import { useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileSpreadsheet, Sparkles, type LucideIcon } from 'lucide-react';
import type { ResearchWizardData } from '@/types/research-wizard';

// ============================================================================
// CONSTANTS
// ============================================================================

const INPUT_METHODS = {
  MANUAL: 'manual',
  SPREADSHEET: 'spreadsheet',
  PRE_RESEARCH: 'pre-research',
} as const;

const METHOD_CONFIG = [
  {
    id: INPUT_METHODS.MANUAL,
    icon: Plus,
    title: 'Entrada Manual',
    description: 'Adicione mercados e clientes um por um através de formulários',
    recommended: 'Ideal para 1-10 registros',
  },
  {
    id: INPUT_METHODS.SPREADSHEET,
    icon: FileSpreadsheet,
    title: 'Upload de Planilha',
    description: 'Importe dados em massa via CSV ou Excel',
    recommended: 'Ideal para 10+ registros',
  },
  {
    id: INPUT_METHODS.PRE_RESEARCH,
    icon: Sparkles,
    title: 'Pré-Pesquisa com IA',
    description: 'Descreva em linguagem natural e a IA busca os dados',
    recommended: 'Ideal para pesquisas exploratórias',
  },
] as const;

const LABELS = {
  PAGE_TITLE: 'Escolha o Método de Entrada',
  PAGE_DESCRIPTION: 'Como você deseja inserir os dados desta pesquisa?',
} as const;

const ICON_SIZES = {
  LARGE: 'w-6 h-6',
} as const;

const COLORS = {
  SELECTED: {
    BORDER: 'border-2 border-blue-500',
    BG: 'bg-blue-50',
    ICON_BG: 'bg-blue-500',
    ICON_TEXT: 'text-white',
  },
  UNSELECTED: {
    BORDER: 'hover:border-gray-400',
    ICON_BG: 'bg-gray-200',
    ICON_TEXT: 'text-gray-600',
  },
} as const;

// ============================================================================
// TYPES
// ============================================================================

type InputMethod = typeof INPUT_METHODS[keyof typeof INPUT_METHODS];

interface MethodOption {
  id: InputMethod;
  icon: LucideIcon;
  title: string;
  description: string;
  recommended: string;
}

interface Step4Props {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCardClasses(isSelected: boolean): string {
  const baseClasses = 'p-6 cursor-pointer transition-all';
  const selectedClasses = isSelected
    ? `${COLORS.SELECTED.BORDER} ${COLORS.SELECTED.BG}`
    : COLORS.UNSELECTED.BORDER;
  return `${baseClasses} ${selectedClasses}`;
}

function getIconClasses(isSelected: boolean): string {
  const baseClasses = 'p-3 rounded-full';
  const colorClasses = isSelected
    ? `${COLORS.SELECTED.ICON_BG} ${COLORS.SELECTED.ICON_TEXT}`
    : `${COLORS.UNSELECTED.ICON_BG} ${COLORS.UNSELECTED.ICON_TEXT}`;
  return `${baseClasses} ${colorClasses}`;
}

function getBadgeVariant(isSelected: boolean): 'default' | 'outline' {
  return isSelected ? 'default' : 'outline';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Step4ChooseMethod({ data, updateData }: Step4Props) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const methods = useMemo(() => METHOD_CONFIG, []);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleMethodSelect = useCallback(
    (methodId: InputMethod) => {
      updateData({ inputMethod: methodId });
    },
    [updateData]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderMethodCard = useCallback(
    (method: MethodOption) => {
      const Icon = method.icon;
      const isSelected = data.inputMethod === method.id;

      return (
        <Card
          key={method.id}
          className={getCardClasses(isSelected)}
          onClick={() => handleMethodSelect(method.id)}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className={getIconClasses(isSelected)}>
              <Icon className={ICON_SIZES.LARGE} />
            </div>
            <h3 className="font-semibold">{method.title}</h3>
            <p className="text-sm text-muted-foreground">{method.description}</p>
            <Badge variant={getBadgeVariant(isSelected)}>{method.recommended}</Badge>
          </div>
        </Card>
      );
    },
    [data.inputMethod, handleMethodSelect]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{LABELS.PAGE_TITLE}</h2>
        <p className="text-muted-foreground">{LABELS.PAGE_DESCRIPTION}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {methods.map(renderMethodCard)}
      </div>
    </div>
  );
}
