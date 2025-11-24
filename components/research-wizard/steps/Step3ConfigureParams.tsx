'use client';

/**
 * Step3ConfigureParams - Configurar Parâmetros
 * Define quantidades de concorrentes, leads e produtos
 */

import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import type { ResearchWizardData } from '@/types/research-wizard';

// ============================================================================
// CONSTANTS
// ============================================================================

const PARAM_LIMITS = {
  CONCORRENTES: {
    MIN: 0,
    MAX: 50,
    RECOMMENDED: '5-10',
  },
  LEADS: {
    MIN: 0,
    MAX: 100,
    RECOMMENDED: '10-20',
  },
  PRODUTOS: {
    MIN: 0,
    MAX: 20,
    RECOMMENDED: '3-5',
  },
} as const;

const LABELS = {
  PAGE_TITLE: 'Configurar Parâmetros',
  PAGE_DESCRIPTION: 'Defina quantos concorrentes, leads e produtos deseja enriquecer',
  FIELD_CONCORRENTES: 'Concorrentes por Mercado',
  FIELD_LEADS: 'Leads por Mercado',
  FIELD_PRODUTOS: 'Produtos por Cliente',
  RECOMMENDED: (value: string) => `Recomendado: ${value}`,
  TIP: '💡 Dica: Valores maiores resultam em pesquisas mais completas, mas levam mais tempo para processar.',
} as const;

const COLORS = {
  INFO: {
    BG: 'bg-blue-50',
    BORDER: 'border-blue-200',
    TEXT: 'text-blue-800',
  },
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface Step3Props {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseIntOrZero(value: string): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Step3ConfigureParams({ data, updateData }: Step3Props) {
  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleConcorrentesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateData({ qtdConcorrentes: parseIntOrZero(e.target.value) });
    },
    [updateData]
  );

  const handleLeadsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateData({ qtdLeads: parseIntOrZero(e.target.value) });
    },
    [updateData]
  );

  const handleProdutosChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateData({ qtdProdutos: parseIntOrZero(e.target.value) });
    },
    [updateData]
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <Label>{LABELS.FIELD_CONCORRENTES}</Label>
          <Input
            type="number"
            min={PARAM_LIMITS.CONCORRENTES.MIN}
            max={PARAM_LIMITS.CONCORRENTES.MAX}
            value={data.qtdConcorrentes}
            onChange={handleConcorrentesChange}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {LABELS.RECOMMENDED(PARAM_LIMITS.CONCORRENTES.RECOMMENDED)}
          </p>
        </Card>

        <Card className="p-4">
          <Label>{LABELS.FIELD_LEADS}</Label>
          <Input
            type="number"
            min={PARAM_LIMITS.LEADS.MIN}
            max={PARAM_LIMITS.LEADS.MAX}
            value={data.qtdLeads}
            onChange={handleLeadsChange}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {LABELS.RECOMMENDED(PARAM_LIMITS.LEADS.RECOMMENDED)}
          </p>
        </Card>

        <Card className="p-4">
          <Label>{LABELS.FIELD_PRODUTOS}</Label>
          <Input
            type="number"
            min={PARAM_LIMITS.PRODUTOS.MIN}
            max={PARAM_LIMITS.PRODUTOS.MAX}
            value={data.qtdProdutos}
            onChange={handleProdutosChange}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {LABELS.RECOMMENDED(PARAM_LIMITS.PRODUTOS.RECOMMENDED)}
          </p>
        </Card>
      </div>

      <div className={`p-4 ${COLORS.INFO.BG} border ${COLORS.INFO.BORDER} rounded-lg`}>
        <p className={`text-sm ${COLORS.INFO.TEXT}`}>
          <strong>{LABELS.TIP}</strong>
        </p>
      </div>
    </div>
  );
}
