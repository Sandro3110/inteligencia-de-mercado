'use client';

/**
 * Componente de Preview/Resumo para cada Step do Wizard
 */

import { useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Info, type LucideIcon } from 'lucide-react';
import type { ResearchWizardData } from '@/types/research-wizard';

// ============================================================================
// CONSTANTS
// ============================================================================

const STEP_TITLES = {
  1: 'Projeto Selecionado',
  2: 'Informações da Pesquisa',
  3: 'Parâmetros Configurados',
  4: 'Método de Entrada',
  5: 'Dados Inseridos',
  6: 'Dados Validados',
} as const;

const INPUT_METHOD_LABELS = {
  manual: 'Entrada Manual',
  spreadsheet: 'Importação de Planilha',
  'pre-research': 'Pré-Pesquisa Automática',
} as const;

const INPUT_METHOD_VARIANTS = {
  manual: 'default',
  spreadsheet: 'secondary',
  'pre-research': 'outline',
} as const;

const PARAMETER_LABELS = {
  concorrentes: 'Concorrentes/Mercado',
  leads: 'Leads/Mercado',
  produtos: 'Produtos/Cliente',
} as const;

const PARAMETER_COLORS = {
  concorrentes: 'text-blue-600',
  leads: 'text-green-600',
  produtos: 'text-purple-600',
} as const;

const DATA_LABELS = {
  mercados: 'Mercados',
  clientes: 'Clientes',
  mercadosAprovados: 'Mercados Aprovados',
  clientesAprovados: 'Clientes Aprovados',
} as const;

const MAX_PREVIEW_ITEMS = 3;
const FINAL_STEP = 7;

const FALLBACK_TEXT = {
  projectName: 'Não selecionado',
  researchName: 'Não definido',
} as const;

// ============================================================================
// TYPES
// ============================================================================

type InputMethod = keyof typeof INPUT_METHOD_LABELS;

interface Market {
  nome: string;
  segmentacao?: string;
}

interface Client {
  nome: string;
  razaoSocial?: string;
}

interface StepPreviewProps {
  step: number;
  data: ResearchWizardData;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface PreviewHeaderProps {
  title: string;
}

function PreviewHeader({ title }: PreviewHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="w-4 h-4 text-green-500" />
      <span className="font-medium">{title}:</span>
    </div>
  );
}

interface ParameterCardProps {
  label: string;
  value: number;
  colorClass: string;
}

function ParameterCard({ label, value, colorClass }: ParameterCardProps) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}

interface DataCountCardProps {
  label: string;
  count: number;
  items: Market[] | Client[];
}

function DataCountCard({ label, count, items }: DataCountCardProps) {
  const previewItems = useMemo(
    () => items.slice(0, MAX_PREVIEW_ITEMS),
    [items]
  );

  const remainingCount = useMemo(
    () => count - MAX_PREVIEW_ITEMS,
    [count]
  );

  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{count}</p>
      {count > 0 && (
        <ul className="mt-2 space-y-1">
          {previewItems.map((item, i) => (
            <li key={i} className="text-xs text-muted-foreground">
              • {item.nome}
            </li>
          ))}
          {remainingCount > 0 && (
            <li className="text-xs text-muted-foreground">
              ... e mais {remainingCount}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StepPreview({ step, data }: StepPreviewProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const shouldShowPreview = useMemo(() => step < FINAL_STEP, [step]);

  const inputMethodLabel = useMemo(() => {
    if (!data.inputMethod) return '';
    return INPUT_METHOD_LABELS[data.inputMethod as InputMethod] || '';
  }, [data.inputMethod]);

  const inputMethodVariant = useMemo(() => {
    if (!data.inputMethod) return 'outline';
    return INPUT_METHOD_VARIANTS[data.inputMethod as InputMethod] || 'outline';
  }, [data.inputMethod]);

  const mercadosCount = useMemo(() => data.mercados.length, [data.mercados]);
  const clientesCount = useMemo(() => data.clientes.length, [data.clientes]);

  const validatedMercadosCount = useMemo(
    () => data.validatedData?.mercados?.length || 0,
    [data.validatedData]
  );

  const validatedClientesCount = useMemo(
    () => data.validatedData?.clientes?.length || 0,
    [data.validatedData]
  );

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderStep1 = useCallback(() => {
    return (
      <div className="space-y-2">
        <PreviewHeader title={STEP_TITLES[1]} />
        <div className="ml-6 text-sm">
          <p className="font-semibold">
            {data.projectName || FALLBACK_TEXT.projectName}
          </p>
          {data.projectId && (
            <p className="text-muted-foreground">ID: {data.projectId}</p>
          )}
        </div>
      </div>
    );
  }, [data.projectName, data.projectId]);

  const renderStep2 = useCallback(() => {
    return (
      <div className="space-y-2">
        <PreviewHeader title={STEP_TITLES[2]} />
        <div className="ml-6 text-sm space-y-1">
          <p>
            <strong>Nome:</strong>{' '}
            {data.researchName || FALLBACK_TEXT.researchName}
          </p>
          {data.researchDescription && (
            <p>
              <strong>Descrição:</strong> {data.researchDescription}
            </p>
          )}
        </div>
      </div>
    );
  }, [data.researchName, data.researchDescription]);

  const renderStep3 = useCallback(() => {
    return (
      <div className="space-y-2">
        <PreviewHeader title={STEP_TITLES[3]} />
        <div className="ml-6 grid grid-cols-3 gap-4 text-sm">
          <ParameterCard
            label={PARAMETER_LABELS.concorrentes}
            value={data.qtdConcorrentes}
            colorClass={PARAMETER_COLORS.concorrentes}
          />
          <ParameterCard
            label={PARAMETER_LABELS.leads}
            value={data.qtdLeads}
            colorClass={PARAMETER_COLORS.leads}
          />
          <ParameterCard
            label={PARAMETER_LABELS.produtos}
            value={data.qtdProdutos}
            colorClass={PARAMETER_COLORS.produtos}
          />
        </div>
      </div>
    );
  }, [data.qtdConcorrentes, data.qtdLeads, data.qtdProdutos]);

  const renderStep4 = useCallback(() => {
    return (
      <div className="space-y-2">
        <PreviewHeader title={STEP_TITLES[4]} />
        <div className="ml-6">
          <Badge variant={inputMethodVariant as 'default' | 'secondary' | 'outline'}>
            {inputMethodLabel}
          </Badge>
        </div>
      </div>
    );
  }, [inputMethodLabel, inputMethodVariant]);

  const renderStep5 = useCallback(() => {
    return (
      <div className="space-y-2">
        <PreviewHeader title={STEP_TITLES[5]} />
        <div className="ml-6 grid grid-cols-2 gap-4 text-sm">
          <DataCountCard
            label={DATA_LABELS.mercados}
            count={mercadosCount}
            items={data.mercados}
          />
          <DataCountCard
            label={DATA_LABELS.clientes}
            count={clientesCount}
            items={data.clientes}
          />
        </div>
      </div>
    );
  }, [mercadosCount, clientesCount, data.mercados, data.clientes]);

  const renderStep6 = useCallback(() => {
    return (
      <div className="space-y-2">
        <PreviewHeader title={STEP_TITLES[6]} />
        <div className="ml-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">
              {DATA_LABELS.mercadosAprovados}
            </p>
            <p className="text-xl font-bold text-green-600">
              {validatedMercadosCount}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">
              {DATA_LABELS.clientesAprovados}
            </p>
            <p className="text-xl font-bold text-green-600">
              {validatedClientesCount}
            </p>
          </div>
        </div>
      </div>
    );
  }, [validatedMercadosCount, validatedClientesCount]);

  const renderPreview = useCallback(() => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      default:
        return null;
    }
  }, [
    step,
    renderStep1,
    renderStep2,
    renderStep3,
    renderStep4,
    renderStep5,
    renderStep6,
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!shouldShowPreview) return null;

  return (
    <Card className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Resumo do Passo {step}
          </h3>
          {renderPreview()}
        </div>
      </div>
    </Card>
  );
}
