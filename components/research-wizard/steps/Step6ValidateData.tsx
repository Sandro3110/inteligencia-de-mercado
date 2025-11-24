'use client';

/**
 * Step6ValidateData - Validar Dados
 * Revisa e valida os dados antes de prosseguir
 */

import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { ResearchWizardData } from '@/types/research-wizard';

// ============================================================================
// CONSTANTS
// ============================================================================

const VALIDATION = {
  MIN_NAME_LENGTH: 3,
} as const;

const LABELS = {
  PAGE_TITLE: 'Validar Dados',
  PAGE_DESCRIPTION: 'Revise os dados antes de prosseguir',
  VALID_DATA: (count: number) => `Dados Válidos (${count})`,
  INVALID_DATA: (count: number) => `Dados Inválidos (${count})`,
  NO_VALID_DATA: 'Nenhum dado válido para validar',
  NO_VALID_DATA_DESC: 'Volte ao passo anterior e adicione dados',
  BUTTON_APPROVE: 'Aprovar Dados Válidos',
  BUTTON_REVALIDATE: '✓ Dados Já Validados - Clicar para Revalidar',
  SUCCESS_MESSAGE: 'Dados validados - Pronto para continuar!',
  INVALID_REASON: (name: string) => `${name || '(vazio)'} - Nome muito curto`,
} as const;

const TOAST_MESSAGES = {
  SUCCESS: (count: number) => `${count} mercado(s) validado(s) com sucesso!`,
} as const;

const ICON_SIZES = {
  MEDIUM: 'w-5 h-5',
  LARGE: 'w-8 h-8',
} as const;

const COLORS = {
  SUCCESS: {
    BG: 'bg-green-50',
    BORDER: 'border-green-200',
    TEXT: 'text-green-800',
    TEXT_SECONDARY: 'text-green-700',
    ICON: 'text-green-600',
  },
  ERROR: {
    BG: 'bg-red-50',
    BORDER: 'border-red-200',
    TEXT: 'text-red-800',
    TEXT_SECONDARY: 'text-red-700',
    ICON: 'text-red-600',
  },
  WARNING: {
    BG: 'bg-yellow-50',
    BORDER: 'border-yellow-200',
    TEXT: 'text-yellow-800',
    TEXT_SECONDARY: 'text-yellow-700',
    ICON: 'text-yellow-600',
  },
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface Mercado {
  nome: string;
  segmentacao?: string;
}

interface Step6Props {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isMercadoValid(mercado: Mercado): boolean {
  return mercado.nome?.trim().length >= VALIDATION.MIN_NAME_LENGTH;
}

function filterValidMercados(mercados: Mercado[]): Mercado[] {
  return mercados.filter(isMercadoValid);
}

function filterInvalidMercados(mercados: Mercado[]): Mercado[] {
  return mercados.filter((m) => !isMercadoValid(m));
}

function isDataValidated(data: ResearchWizardData): boolean {
  return (
    data.validatedData.mercados.length > 0 || data.validatedData.clientes.length > 0
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Step6ValidateData({ data, updateData }: Step6Props) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const validMercados = useMemo(
    () => filterValidMercados(data.mercados),
    [data.mercados]
  );

  const invalidMercados = useMemo(
    () => filterInvalidMercados(data.mercados),
    [data.mercados]
  );

  const hasValidMercados = useMemo(
    () => validMercados.length > 0,
    [validMercados.length]
  );

  const hasInvalidMercados = useMemo(
    () => invalidMercados.length > 0,
    [invalidMercados.length]
  );

  const isValidated = useMemo(() => isDataValidated(data), [data]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleApprove = useCallback(() => {
    updateData({
      validatedData: {
        mercados: validMercados,
        clientes: [],
      },
    });
    toast.success(TOAST_MESSAGES.SUCCESS(validMercados.length));
  }, [validMercados, updateData]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderValidMercado = useCallback(
    (mercado: Mercado, index: number) => (
      <div key={index} className={`text-sm ${COLORS.SUCCESS.TEXT_SECONDARY}`}>
        ✓ {mercado.nome}
      </div>
    ),
    []
  );

  const renderInvalidMercado = useCallback(
    (mercado: Mercado, index: number) => (
      <div key={index} className={`text-sm ${COLORS.ERROR.TEXT_SECONDARY}`}>
        ✗ {LABELS.INVALID_REASON(mercado.nome)}
      </div>
    ),
    []
  );

  const renderValidDataCard = useCallback(
    () => (
      <Card className={`p-4 ${COLORS.SUCCESS.BG} ${COLORS.SUCCESS.BORDER}`}>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className={`${ICON_SIZES.MEDIUM} ${COLORS.SUCCESS.ICON}`} />
          <h3 className={`font-semibold ${COLORS.SUCCESS.TEXT}`}>
            {LABELS.VALID_DATA(validMercados.length)}
          </h3>
        </div>
        <div className="space-y-2">{validMercados.map(renderValidMercado)}</div>
      </Card>
    ),
    [validMercados, renderValidMercado]
  );

  const renderInvalidDataCard = useCallback(
    () => (
      <Card className={`p-4 ${COLORS.ERROR.BG} ${COLORS.ERROR.BORDER}`}>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className={`${ICON_SIZES.MEDIUM} ${COLORS.ERROR.ICON}`} />
          <h3 className={`font-semibold ${COLORS.ERROR.TEXT}`}>
            {LABELS.INVALID_DATA(invalidMercados.length)}
          </h3>
        </div>
        <div className="space-y-2">{invalidMercados.map(renderInvalidMercado)}</div>
      </Card>
    ),
    [invalidMercados, renderInvalidMercado]
  );

  const renderNoDataCard = useCallback(
    () => (
      <Card className={`p-6 ${COLORS.WARNING.BG} ${COLORS.WARNING.BORDER}`}>
        <div className="text-center space-y-2">
          <AlertCircle
            className={`${ICON_SIZES.LARGE} ${COLORS.WARNING.ICON} mx-auto`}
          />
          <p className={`text-sm font-semibold ${COLORS.WARNING.TEXT}`}>
            {LABELS.NO_VALID_DATA}
          </p>
          <p className={`text-xs ${COLORS.WARNING.TEXT_SECONDARY}`}>
            {LABELS.NO_VALID_DATA_DESC}
          </p>
        </div>
      </Card>
    ),
    []
  );

  const renderValidatedState = useCallback(
    () => (
      <div
        className={`p-4 border-2 ${COLORS.SUCCESS.BORDER} rounded-lg ${COLORS.SUCCESS.BG}`}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className={`${ICON_SIZES.MEDIUM} ${COLORS.SUCCESS.ICON}`} />
          <p className={`text-sm font-semibold ${COLORS.SUCCESS.TEXT}`}>
            {LABELS.SUCCESS_MESSAGE}
          </p>
        </div>
      </div>
    ),
    []
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
        {hasValidMercados && renderValidDataCard()}
        {hasInvalidMercados && renderInvalidDataCard()}
        {!hasValidMercados && renderNoDataCard()}

        <Button
          onClick={handleApprove}
          disabled={!hasValidMercados}
          className="w-full"
        >
          {isValidated ? LABELS.BUTTON_REVALIDATE : LABELS.BUTTON_APPROVE}
        </Button>

        {isValidated && renderValidatedState()}
      </div>
    </div>
  );
}
