'use client';

import { useCallback, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles } from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZES = {
  SMALL: 'w-3 h-3',
  MEDIUM: 'w-5 h-5',
} as const;

const SPACING = {
  ICON_MARGIN: 'mr-1',
} as const;

const CLASSES = {
  CONTAINER: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  LOADING: 'text-center text-muted-foreground',
  CARD_BASE: 'cursor-pointer transition-all hover:shadow-md',
  CARD_SELECTED: 'border-primary border-2 bg-primary/5',
  HEADER_CONTAINER: 'flex items-start justify-between',
  HEADER_CONTENT: 'flex-1',
  TITLE: 'text-base flex items-center gap-2',
  DESCRIPTION: 'text-xs mt-1',
  CHECK_ICON: 'text-primary flex-shrink-0',
  CONTENT: 'space-y-2 text-xs',
  INFO_ROW: 'flex items-center justify-between',
  INFO_LABEL: 'text-muted-foreground',
  INFO_VALUE: 'font-medium',
} as const;

const LABELS = {
  LOADING: 'Carregando templates...',
  NO_TEMPLATES: 'Nenhum template disponível',
  DEFAULT_BADGE: 'Padrão',
  SEGMENTATION: 'Segmentação:',
  MIN_SCORE: 'Score mínimo:',
  APIS: 'APIs:',
  SOURCES: (count: number) => `${count} fontes`,
  SCORE_FORMAT: (score: number) => `${score}/100`,
} as const;

const DEFAULT_IS_DEFAULT_VALUE = 1;
const PLACEHOLDER_TEMPLATE_ID = 1;

// ============================================================================
// TYPES
// ============================================================================

export interface TemplateSelectorProps {
  onSelect: (templateId: number, config: unknown) => void;
  selectedTemplateId?: number;
}

interface TemplateConfig {
  targetSegmentation: string;
  minQualityScore: number;
  dataApis?: unknown[];
}

interface Template {
  id: number;
  name: string;
  description: string | null;
  isDefault: number;
  config: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: (templateId: number, config: unknown) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseTemplateConfig(configString: string): TemplateConfig {
  try {
    return JSON.parse(configString);
  } catch (e) {
    console.error('Error parsing template config:', e);
    return {
      targetSegmentation: '',
      minQualityScore: 0,
      dataApis: [],
    };
  }
}

function isDefaultTemplate(template: Template): boolean {
  return template.isDefault === DEFAULT_IS_DEFAULT_VALUE;
}

function getCardClasses(isSelected: boolean): string {
  return `${CLASSES.CARD_BASE} ${isSelected ? CLASSES.CARD_SELECTED : ''}`;
}

function getApiCount(config: TemplateConfig): number {
  return config.dataApis?.length || 0;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function LoadingState() {
  return <div className={CLASSES.LOADING}>{LABELS.LOADING}</div>;
}

function EmptyState() {
  return <div className={CLASSES.LOADING}>{LABELS.NO_TEMPLATES}</div>;
}

function DefaultBadge() {
  return (
    <Badge variant="secondary" className={CLASSES.DESCRIPTION}>
      <Sparkles className={`${ICON_SIZES.SMALL} ${SPACING.ICON_MARGIN}`} />
      {LABELS.DEFAULT_BADGE}
    </Badge>
  );
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  const config = useMemo(() => parseTemplateConfig(template.config), [template.config]);

  const isDefault = useMemo(() => isDefaultTemplate(template), [template]);

  const cardClasses = useMemo(() => getCardClasses(isSelected), [isSelected]);

  const apiCount = useMemo(() => getApiCount(config), [config]);

  const handleClick = useCallback(() => {
    onSelect(template.id, config);
  }, [template.id, config, onSelect]);

  return (
    <Card className={cardClasses} onClick={handleClick}>
      <CardHeader>
        <div className={CLASSES.HEADER_CONTAINER}>
          <div className={CLASSES.HEADER_CONTENT}>
            <CardTitle className={CLASSES.TITLE}>
              {template.name}
              {isDefault && <DefaultBadge />}
            </CardTitle>
            <CardDescription className={CLASSES.DESCRIPTION}>
              {template.description}
            </CardDescription>
          </div>
          {isSelected && (
            <CheckCircle2 className={`${ICON_SIZES.MEDIUM} ${CLASSES.CHECK_ICON}`} />
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className={CLASSES.CONTENT}>
          <div className={CLASSES.INFO_ROW}>
            <span className={CLASSES.INFO_LABEL}>{LABELS.SEGMENTATION}</span>
            <Badge variant="outline">{config.targetSegmentation}</Badge>
          </div>

          <div className={CLASSES.INFO_ROW}>
            <span className={CLASSES.INFO_LABEL}>{LABELS.MIN_SCORE}</span>
            <span className={CLASSES.INFO_VALUE}>
              {LABELS.SCORE_FORMAT(config.minQualityScore)}
            </span>
          </div>

          <div className={CLASSES.INFO_ROW}>
            <span className={CLASSES.INFO_LABEL}>{LABELS.APIS}</span>
            <span className={CLASSES.INFO_VALUE}>{LABELS.SOURCES(apiCount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * TemplateSelector
 * 
 * Componente para seleção de templates de configuração.
 * Exibe cards com informações de cada template e permite seleção.
 * 
 * ⚠️ Nota: O router de templates ainda não existe, usando placeholder.
 * 
 * @example
 * ```tsx
 * <TemplateSelector
 *   onSelect={handleTemplateSelect}
 *   selectedTemplateId={currentTemplateId}
 * />
 * ```
 */
export function TemplateSelector({
  onSelect,
  selectedTemplateId,
}: TemplateSelectorProps) {
  // Query - Placeholder: templates router não existe
  const { data: templates, isLoading } = trpc.templates.byId.useQuery(
    PLACEHOLDER_TEMPLATE_ID
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasTemplates = useMemo(() => !!templates, [templates]);

  const templatesList = useMemo(
    () => (templates ? [templates] : []),
    [templates]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return <LoadingState />;
  }

  if (!hasTemplates) {
    return <EmptyState />;
  }

  return (
    <div className={CLASSES.CONTAINER}>
      {templatesList.map((template) => {
        const isSelected = selectedTemplateId === template.id;

        return (
          <TemplateCard
            key={template.id}
            template={template as Template}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}
