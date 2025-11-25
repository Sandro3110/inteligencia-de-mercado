'use client';

/**
 * Step7Summary - Resumo da Pesquisa
 * Exibe resumo completo antes de iniciar o enriquecimento
 */

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import type { ResearchWizardData } from '@/types/research-wizard';

// ============================================================================
// CONSTANTS
// ============================================================================

const LABELS = {
  PAGE_TITLE: 'Resumo da Pesquisa',
  PAGE_DESCRIPTION: 'Revise todas as configurações antes de iniciar o enriquecimento',
  SECTION_PROJECT: 'Projeto',
  SECTION_NAME: 'Nome da Pesquisa',
  SECTION_PARAMS: 'Parâmetros',
  SECTION_DATA: 'Dados',
  PARAM_CONCORRENTES: 'Concorrentes',
  PARAM_LEADS: 'Leads',
  PARAM_PRODUTOS: 'Produtos',
  DATA_MERCADOS: (count: number) => `${count} mercados validados`,
  DATA_CLIENTES: (count: number) => `${count} clientes validados`,
  WARNING: '⚠️ Atenção: O processo de enriquecimento pode levar vários minutos dependendo da quantidade de dados.',
} as const;

const COLORS = {
  WARNING: {
    BG: 'bg-yellow-50',
    BORDER: 'border-yellow-200',
    TEXT: 'text-yellow-800',
  },
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface Step7Props {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getMercadosCount(data: ResearchWizardData): number {
  return data.validatedData?.mercados?.length || 0;
}

function getClientesCount(data: ResearchWizardData): number {
  return data.validatedData?.clientes?.length || 0;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Step7Summary({ data }: Step7Props) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const mercadosCount = useMemo(() => getMercadosCount(data), [data]);

  const clientesCount = useMemo(() => getClientesCount(data), [data]);

  const hasDescription = useMemo(
    () => Boolean(data.researchDescription),
    [data.researchDescription]
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

      <div className="space-y-4">
        {/* Projeto */}
        <Card className="p-4">
          <h3 className="font-semibold mb-2">{LABELS.SECTION_PROJECT}</h3>
          <p>{data.projectName}</p>
        </Card>

        {/* Nome da Pesquisa */}
        <Card className="p-4">
          <h3 className="font-semibold mb-2">{LABELS.SECTION_NAME}</h3>
          <p>{data.researchName}</p>
          {hasDescription && (
            <p className="text-sm text-muted-foreground mt-2">
              {data.researchDescription}
            </p>
          )}
        </Card>

        {/* Parâmetros */}
        <Card className="p-4">
          <h3 className="font-semibold mb-2">{LABELS.SECTION_PARAMS}</h3>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div>
              <p className="text-sm text-muted-foreground">
                {LABELS.PARAM_CONCORRENTES}
              </p>
              <p className="text-2xl font-bold">{data.qtdConcorrentes}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{LABELS.PARAM_LEADS}</p>
              <p className="text-2xl font-bold">{data.qtdLeads}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{LABELS.PARAM_PRODUTOS}</p>
              <p className="text-2xl font-bold">{data.qtdProdutos}</p>
            </div>
          </div>
        </Card>

        {/* Dados */}
        <Card className="p-4">
          <h3 className="font-semibold mb-2">{LABELS.SECTION_DATA}</h3>
          <p>{LABELS.DATA_MERCADOS(mercadosCount)}</p>
          <p>{LABELS.DATA_CLIENTES(clientesCount)}</p>
        </Card>

        {/* Aviso */}
        <div
          className={`p-4 ${COLORS.WARNING.BG} border ${COLORS.WARNING.BORDER} rounded-lg`}
        >
          <p className={`text-sm ${COLORS.WARNING.TEXT}`}>
            <strong>{LABELS.WARNING}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
