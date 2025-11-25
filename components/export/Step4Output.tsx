/**
 * Step4Output Component
 * Step 4: Output - Format and output type selection
 * Interactive component with events
 */

'use client';

import { useCallback, useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileJson,
  Download,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import type { ExportState } from '@/lib/types/export';

// ============================================================================
// TYPES
// ============================================================================

interface Step4OutputProps {
  state: ExportState;
  setState: React.Dispatch<React.SetStateAction<ExportState>>;
}

interface FormatOption {
  value: ExportState['format'];
  label: string;
  icon: LucideIcon;
  description: string;
}

interface OutputTypeOption {
  value: ExportState['outputType'];
  label: string;
  description: string;
  icon: LucideIcon;
  requiresTemplate?: boolean;
}

interface TemplateOption {
  value: ExportState['templateType'];
  label: string;
  description: string;
}

interface DepthOption {
  value: NonNullable<ExportState['depth']>;
  label: string;
  description: string;
  id: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FORMATS: FormatOption[] = [
  {
    value: 'csv',
    label: 'CSV',
    icon: FileText,
    description: 'Arquivo de texto separado por vírgulas',
  },
  {
    value: 'excel',
    label: 'Excel',
    icon: FileSpreadsheet,
    description: 'Planilha XLSX com múltiplas abas',
  },
  {
    value: 'pdf',
    label: 'PDF',
    icon: FileText,
    description: 'Documento formatado para impressão',
  },
  {
    value: 'json',
    label: 'JSON',
    icon: FileJson,
    description: 'Formato estruturado para APIs',
  },
] as const;

const OUTPUT_TYPES: OutputTypeOption[] = [
  {
    value: 'simple',
    label: 'Lista Simples',
    description: 'Dados brutos formatados (~5s)',
    icon: Download,
  },
  {
    value: 'complete',
    label: 'Lista Completa',
    description: 'Dados + relacionamentos + gráficos (~15s)',
    icon: FileSpreadsheet,
  },
  {
    value: 'report',
    label: 'Relatório Contextualizado',
    description: 'Análise completa com insights IA (~60s)',
    icon: Sparkles,
    requiresTemplate: true,
  },
] as const;

const TEMPLATES: TemplateOption[] = [
  {
    value: 'market',
    label: 'Análise de Mercado',
    description: 'Tendências, oportunidades, SWOT',
  },
  {
    value: 'client',
    label: 'Análise de Clientes',
    description: 'Perfil, segmentação, potencial',
  },
  {
    value: 'competitive',
    label: 'Análise Competitiva',
    description: 'Concorrentes, market share, posicionamento',
  },
  {
    value: 'lead',
    label: 'Análise de Leads',
    description: 'Qualificação, conversão, priorização',
  },
] as const;

const DEPTH_OPTIONS: DepthOption[] = [
  {
    value: 'quick',
    label: 'Rápida',
    description: '~30s, 2-3 páginas',
    id: 'quick',
  },
  {
    value: 'standard',
    label: 'Padrão',
    description: '~60s, 5-7 páginas',
    id: 'standard',
  },
  {
    value: 'deep',
    label: 'Profunda',
    description: '~120s, 10-15 páginas',
    id: 'deep',
  },
] as const;

const LABELS = {
  TITLE: 'Escolha o Formato',
  SUBTITLE: 'Defina como deseja receber os dados exportados.',
  EXPORT_TITLE: 'Título da Exportação',
  EXPORT_TITLE_PLACEHOLDER: 'Ex: Leads Qualificados - Embalagens SP',
  FILE_FORMAT: 'Formato do Arquivo',
  OUTPUT_TYPE: 'Tipo de Saída',
  ANALYSIS_DEPTH: 'Profundidade da Análise',
  ANALYSIS_TEMPLATE: 'Template de Análise',
  SUMMARY_TITLE: 'Resumo da Exportação',
  SUMMARY_TITLE_LABEL: 'Título:',
  SUMMARY_DATA_TYPE: 'Tipo de Dados:',
  SUMMARY_FIELDS: 'Campos:',
  SUMMARY_FORMAT: 'Formato:',
  SUMMARY_TYPE: 'Tipo:',
  SUMMARY_TEMPLATE: 'Template:',
  SUMMARY_NOT_DEFINED: 'Não definido',
  SUMMARY_FIELDS_COUNT: (count: number) => `${count} selecionados`,
  REQUIRES_AI_BADGE: 'Requer IA',
  TIME_WARNING:
    '⏱️ Relatórios contextualizados levam ~60-90 segundos para gerar pois incluem análise profunda com IA.',
} as const;

const CLASSES = {
  CONTAINER: 'space-y-6',
  SECTION: 'space-y-3',
  INPUT_SECTION: 'space-y-2',
  GRID_2_COLS: 'grid grid-cols-2 gap-3',
  GRID_3_COLS: 'grid grid-cols-3 gap-3',
  RADIO_VERTICAL: 'space-y-3',
  RADIO_LABEL_BASE:
    'flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
  RADIO_LABEL_SELECTED: 'border-blue-600 bg-blue-50',
  RADIO_LABEL_UNSELECTED: 'border-slate-200 hover:border-slate-300',
  RADIO_LABEL_TEMPLATE_SELECTED: 'border-green-600 bg-green-50',
  RADIO_LABEL_DEPTH: 'flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all',
  ICON_CONTAINER: 'flex items-center gap-2 mb-1',
  ICON_SIZE: 'h-4 w-4',
  BADGE: 'text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded',
  DESCRIPTION: 'text-xs text-slate-600',
  SUMMARY_CARD: 'p-4 bg-slate-50',
  SUMMARY_ROW: 'flex justify-between',
  SUMMARY_LABEL: 'text-slate-600',
  SUMMARY_VALUE: 'font-medium',
  WARNING_BOX: 'bg-yellow-50 border border-yellow-200 rounded-lg p-4',
  WARNING_TEXT: 'text-sm text-yellow-800',
} as const;

const DEFAULT_DEPTH = 'standard' as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get CSS classes for radio label based on selection state
 */
function getRadioLabelClasses(isSelected: boolean, isTemplate: boolean = false): string {
  const baseClasses = CLASSES.RADIO_LABEL_BASE;
  const selectedClasses = isTemplate
    ? CLASSES.RADIO_LABEL_TEMPLATE_SELECTED
    : CLASSES.RADIO_LABEL_SELECTED;
  const unselectedClasses = CLASSES.RADIO_LABEL_UNSELECTED;

  return `${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`;
}

/**
 * Get CSS classes for depth radio label
 */
function getDepthLabelClasses(isSelected: boolean): string {
  return `${CLASSES.RADIO_LABEL_DEPTH} ${
    isSelected ? CLASSES.RADIO_LABEL_SELECTED : CLASSES.RADIO_LABEL_UNSELECTED
  }`;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Format option card
 */
interface FormatCardProps {
  format: FormatOption;
  isSelected: boolean;
}

function FormatCard({ format, isSelected }: FormatCardProps) {
  const Icon = format.icon;

  return (
    <label htmlFor={format.value!} className={getRadioLabelClasses(isSelected)}>
      <RadioGroupItem value={format.value!} id={format.value!} />
      <div className="flex-1">
        <div className={CLASSES.ICON_CONTAINER}>
          <Icon className={CLASSES.ICON_SIZE} />
          <span className="font-semibold">{format.label}</span>
        </div>
        <p className={CLASSES.DESCRIPTION}>{format.description}</p>
      </div>
    </label>
  );
}

/**
 * Output type option card
 */
interface OutputTypeCardProps {
  type: OutputTypeOption;
  isSelected: boolean;
}

function OutputTypeCard({ type, isSelected }: OutputTypeCardProps) {
  const Icon = type.icon;

  return (
    <label htmlFor={type.value!} className={getRadioLabelClasses(isSelected)}>
      <RadioGroupItem value={type.value!} id={type.value!} />
      <div className="flex-1">
        <div className={CLASSES.ICON_CONTAINER}>
          <Icon className={CLASSES.ICON_SIZE} />
          <span className="font-semibold">{type.label}</span>
          {type.requiresTemplate && (
            <span className={CLASSES.BADGE}>{LABELS.REQUIRES_AI_BADGE}</span>
          )}
        </div>
        <p className={CLASSES.DESCRIPTION}>{type.description}</p>
      </div>
    </label>
  );
}

/**
 * Template option card
 */
interface TemplateCardProps {
  template: TemplateOption;
  isSelected: boolean;
}

function TemplateCard({ template, isSelected }: TemplateCardProps) {
  return (
    <label htmlFor={template.value!} className={getRadioLabelClasses(isSelected, true)}>
      <RadioGroupItem value={template.value!} id={template.value!} />
      <div className="flex-1">
        <div className="font-semibold mb-1">{template.label}</div>
        <p className={CLASSES.DESCRIPTION}>{template.description}</p>
      </div>
    </label>
  );
}

/**
 * Depth option card
 */
interface DepthCardProps {
  depth: DepthOption;
  isSelected: boolean;
}

function DepthCard({ depth, isSelected }: DepthCardProps) {
  return (
    <label htmlFor={depth.id} className={getDepthLabelClasses(isSelected)}>
      <RadioGroupItem value={depth.value} id={depth.id} className="mb-2" />
      <div className="font-semibold mb-1">{depth.label}</div>
      <p className={CLASSES.DESCRIPTION}>{depth.description}</p>
    </label>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Step 4: Output format and type selection
 */
export default function Step4Output({ state, setState }: Step4OutputProps) {
  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({ ...prev, title: e.target.value }));
    },
    [setState]
  );

  const handleFormatChange = useCallback(
    (value: string) => {
      setState((prev) => ({ ...prev, format: value as ExportState['format'] }));
    },
    [setState]
  );

  const handleOutputTypeChange = useCallback(
    (value: string) => {
      setState((prev) => ({ ...prev, outputType: value as ExportState['outputType'] }));
    },
    [setState]
  );

  const handleDepthChange = useCallback(
    (value: string) => {
      setState((prev) => ({ ...prev, depth: value as ExportState['depth'] }));
    },
    [setState]
  );

  const handleTemplateChange = useCallback(
    (value: string) => {
      setState((prev) => ({ ...prev, templateType: value as ExportState['templateType'] }));
    },
    [setState]
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isReportMode = useMemo(() => state.outputType === 'report', [state.outputType]);

  const currentDepth = useMemo(() => state.depth || DEFAULT_DEPTH, [state.depth]);

  const selectedOutputTypeLabel = useMemo(
    () => OUTPUT_TYPES.find((t) => t.value === state.outputType)?.label,
    [state.outputType]
  );

  const selectedTemplateLabel = useMemo(
    () => TEMPLATES.find((t) => t.value === state.templateType)?.label,
    [state.templateType]
  );

  const fieldsCount = useMemo(
    () => state.selectedFields?.length || 0,
    [state.selectedFields?.length]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={CLASSES.CONTAINER}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{LABELS.TITLE}</h2>
        <p className="text-slate-600">{LABELS.SUBTITLE}</p>
      </div>

      {/* Export Title */}
      <div className={CLASSES.INPUT_SECTION}>
        <Label htmlFor="title">{LABELS.EXPORT_TITLE}</Label>
        <Input
          id="title"
          placeholder={LABELS.EXPORT_TITLE_PLACEHOLDER}
          value={state.title || ''}
          onChange={handleTitleChange}
        />
      </div>

      {/* File Format */}
      <div className={CLASSES.SECTION}>
        <Label>{LABELS.FILE_FORMAT}</Label>
        <RadioGroup value={state.format} onValueChange={handleFormatChange}>
          <div className={CLASSES.GRID_2_COLS}>
            {FORMATS.map((format) => (
              <FormatCard
                key={format.value}
                format={format}
                isSelected={state.format === format.value}
              />
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Output Type */}
      <div className={CLASSES.SECTION}>
        <Label>{LABELS.OUTPUT_TYPE}</Label>
        <RadioGroup value={state.outputType} onValueChange={handleOutputTypeChange}>
          <div className={CLASSES.RADIO_VERTICAL}>
            {OUTPUT_TYPES.map((type) => (
              <OutputTypeCard
                key={type.value}
                type={type}
                isSelected={state.outputType === type.value}
              />
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Analysis Depth (if report mode) */}
      {isReportMode && (
        <div className={CLASSES.SECTION}>
          <Label>{LABELS.ANALYSIS_DEPTH}</Label>
          <RadioGroup value={currentDepth} onValueChange={handleDepthChange}>
            <div className={CLASSES.GRID_3_COLS}>
              {DEPTH_OPTIONS.map((depth) => (
                <DepthCard
                  key={depth.value}
                  depth={depth}
                  isSelected={currentDepth === depth.value}
                />
              ))}
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Analysis Template (if report mode) */}
      {isReportMode && (
        <div className={CLASSES.SECTION}>
          <Label>{LABELS.ANALYSIS_TEMPLATE}</Label>
          <RadioGroup value={state.templateType} onValueChange={handleTemplateChange}>
            <div className={CLASSES.GRID_2_COLS}>
              {TEMPLATES.map((template) => (
                <TemplateCard
                  key={template.value}
                  template={template}
                  isSelected={state.templateType === template.value}
                />
              ))}
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Export Summary */}
      <Card className={CLASSES.SUMMARY_CARD}>
        <h4 className="font-semibold text-slate-900 mb-3">{LABELS.SUMMARY_TITLE}</h4>
        <div className="space-y-2 text-sm">
          <div className={CLASSES.SUMMARY_ROW}>
            <span className={CLASSES.SUMMARY_LABEL}>{LABELS.SUMMARY_TITLE_LABEL}</span>
            <span className={CLASSES.SUMMARY_VALUE}>
              {state.title || LABELS.SUMMARY_NOT_DEFINED}
            </span>
          </div>
          <div className={CLASSES.SUMMARY_ROW}>
            <span className={CLASSES.SUMMARY_LABEL}>{LABELS.SUMMARY_DATA_TYPE}</span>
            <span className={`${CLASSES.SUMMARY_VALUE} capitalize`}>{state.entityType}</span>
          </div>
          <div className={CLASSES.SUMMARY_ROW}>
            <span className={CLASSES.SUMMARY_LABEL}>{LABELS.SUMMARY_FIELDS}</span>
            <span className={CLASSES.SUMMARY_VALUE}>{LABELS.SUMMARY_FIELDS_COUNT(fieldsCount)}</span>
          </div>
          <div className={CLASSES.SUMMARY_ROW}>
            <span className={CLASSES.SUMMARY_LABEL}>{LABELS.SUMMARY_FORMAT}</span>
            <span className={`${CLASSES.SUMMARY_VALUE} uppercase`}>{state.format}</span>
          </div>
          <div className={CLASSES.SUMMARY_ROW}>
            <span className={CLASSES.SUMMARY_LABEL}>{LABELS.SUMMARY_TYPE}</span>
            <span className={CLASSES.SUMMARY_VALUE}>{selectedOutputTypeLabel}</span>
          </div>
          {isReportMode && state.templateType && (
            <div className={CLASSES.SUMMARY_ROW}>
              <span className={CLASSES.SUMMARY_LABEL}>{LABELS.SUMMARY_TEMPLATE}</span>
              <span className={CLASSES.SUMMARY_VALUE}>{selectedTemplateLabel}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Time Warning (if report mode) */}
      {isReportMode && (
        <div className={CLASSES.WARNING_BOX}>
          <p className={CLASSES.WARNING_TEXT}>{LABELS.TIME_WARNING}</p>
        </div>
      )}
    </div>
  );
}
