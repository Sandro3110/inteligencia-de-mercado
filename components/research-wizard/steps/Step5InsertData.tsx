'use client';

/**
 * Step5InsertData - Inserir Dados
 * Permite inserir dados via manual, planilha ou pré-pesquisa
 */

import { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ResearchWizardData } from '@/types/research-wizard';
import PreResearchInterface from '../PreResearchInterface';
import FileUploadZone from '../FileUploadZone';

// ============================================================================
// CONSTANTS
// ============================================================================

const INPUT_METHODS = {
  MANUAL: 'manual',
  SPREADSHEET: 'spreadsheet',
  PRE_RESEARCH: 'pre-research',
} as const;

const METHOD_LABELS = {
  [INPUT_METHODS.MANUAL]: 'Entrada Manual',
  [INPUT_METHODS.SPREADSHEET]: 'Upload de Planilha',
  [INPUT_METHODS.PRE_RESEARCH]: 'Pré-Pesquisa com IA',
} as const;

const DEFAULT_SEGMENTATION = 'B2B' as const;

const LABELS = {
  PAGE_TITLE: 'Inserir Dados',
  PAGE_DESCRIPTION: 'Método selecionado:',
  BUTTON_ADD: 'Adicionar',
  PLACEHOLDER_MERCADO: 'Nome do mercado...',
  EMPTY_STATE_TITLE: 'Nenhum mercado adicionado ainda',
  EMPTY_STATE_DESC: 'Adicione pelo menos um mercado para continuar',
  SUCCESS_STATE: (count: number) =>
    `${count} mercado${count > 1 ? 's' : ''} adicionado${count > 1 ? 's' : ''} - Pronto para continuar!`,
} as const;

const ICON_SIZES = {
  SMALL: 'w-4 h-4',
  MEDIUM: 'w-5 h-5',
  LARGE: 'w-8 h-8',
} as const;

const COLORS = {
  WARNING: {
    BG: 'bg-yellow-50',
    BORDER: 'border-yellow-300',
    TEXT: 'text-yellow-800',
    TEXT_SECONDARY: 'text-yellow-700',
    ICON: 'text-yellow-600',
  },
  SUCCESS: {
    BG: 'bg-green-50',
    BORDER: 'border-green-300',
    TEXT: 'text-green-800',
    ICON: 'text-green-600',
  },
  NEUTRAL: {
    BG: 'bg-gray-50',
  },
} as const;

// ============================================================================
// TYPES
// ============================================================================

type InputMethod = typeof INPUT_METHODS[keyof typeof INPUT_METHODS];

interface Mercado {
  nome: string;
  segmentacao?: string;
}

interface Step5Props {
  data: ResearchWizardData;
  updateData: (d: Partial<ResearchWizardData>) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getMethodLabel(method: InputMethod | undefined): string {
  if (!method) return '';
  return METHOD_LABELS[method] || '';
}

function createMercado(nome: string): Mercado {
  return {
    nome,
    segmentacao: DEFAULT_SEGMENTATION,
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Step5InsertData({ data, updateData }: Step5Props) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [newMercado, setNewMercado] = useState('');

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const methodLabel = useMemo(
    () => getMethodLabel(data.inputMethod as InputMethod),
    [data.inputMethod]
  );

  const hasMercados = useMemo(() => data.mercados.length > 0, [data.mercados.length]);

  const mercadoCount = useMemo(() => data.mercados.length, [data.mercados.length]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleNewMercadoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewMercado(e.target.value);
    },
    []
  );

  const handleAddMercado = useCallback(() => {
    if (newMercado.trim()) {
      updateData({
        mercados: [...data.mercados, createMercado(newMercado)],
      });
      setNewMercado('');
    }
  }, [newMercado, data.mercados, updateData]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleAddMercado();
      }
    },
    [handleAddMercado]
  );

  const handleRemoveMercado = useCallback(
    (index: number) => {
      updateData({
        mercados: data.mercados.filter((_, idx) => idx !== index),
      });
    },
    [data.mercados, updateData]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderMercadoItem = useCallback(
    (mercado: Mercado, index: number) => (
      <div
        key={index}
        className={`flex items-center justify-between p-3 ${COLORS.NEUTRAL.BG} rounded-lg`}
      >
        <span>{mercado.nome}</span>
        <Button variant="ghost" size="sm" onClick={() => handleRemoveMercado(index)}>
          <Trash2 className={ICON_SIZES.SMALL} />
        </Button>
      </div>
    ),
    [handleRemoveMercado]
  );

  const renderEmptyState = useCallback(
    () => (
      <div
        className={`p-6 border-2 border-dashed ${COLORS.WARNING.BORDER} rounded-lg ${COLORS.WARNING.BG}`}
      >
        <div className="text-center space-y-2">
          <AlertCircle
            className={`${ICON_SIZES.LARGE} ${COLORS.WARNING.ICON} mx-auto`}
          />
          <p className={`text-sm font-semibold ${COLORS.WARNING.TEXT}`}>
            {LABELS.EMPTY_STATE_TITLE}
          </p>
          <p className={`text-xs ${COLORS.WARNING.TEXT_SECONDARY}`}>
            {LABELS.EMPTY_STATE_DESC}
          </p>
        </div>
      </div>
    ),
    []
  );

  const renderSuccessState = useCallback(
    () => (
      <div
        className={`p-4 border-2 ${COLORS.SUCCESS.BORDER} rounded-lg ${COLORS.SUCCESS.BG}`}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className={`${ICON_SIZES.MEDIUM} ${COLORS.SUCCESS.ICON}`} />
          <p className={`text-sm font-semibold ${COLORS.SUCCESS.TEXT}`}>
            {LABELS.SUCCESS_STATE(mercadoCount)}
          </p>
        </div>
      </div>
    ),
    [mercadoCount]
  );

  const renderManualInput = useCallback(
    () => (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={LABELS.PLACEHOLDER_MERCADO}
            value={newMercado}
            onChange={handleNewMercadoChange}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleAddMercado}>
            <Plus className={`${ICON_SIZES.SMALL} mr-2`} />
            {LABELS.BUTTON_ADD}
          </Button>
        </div>

        <div className="space-y-2">{data.mercados.map(renderMercadoItem)}</div>

        {!hasMercados && renderEmptyState()}
        {hasMercados && renderSuccessState()}
      </div>
    ),
    [
      newMercado,
      data.mercados,
      hasMercados,
      handleNewMercadoChange,
      handleKeyPress,
      handleAddMercado,
      renderMercadoItem,
      renderEmptyState,
      renderSuccessState,
    ]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{LABELS.PAGE_TITLE}</h2>
        <p className="text-muted-foreground">
          {LABELS.PAGE_DESCRIPTION} <strong>{methodLabel}</strong>
        </p>
      </div>

      {data.inputMethod === INPUT_METHODS.MANUAL && renderManualInput()}

      {data.inputMethod === INPUT_METHODS.SPREADSHEET && (
        <FileUploadZone data={data} updateData={updateData} tipo="mercado" />
      )}

      {data.inputMethod === INPUT_METHODS.PRE_RESEARCH && (
        <PreResearchInterface data={data} updateData={updateData} />
      )}
    </div>
  );
}
