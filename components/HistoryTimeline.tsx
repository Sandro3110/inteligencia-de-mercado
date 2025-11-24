import { Clock, Plus, Edit, CheckCircle, Sparkles, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

// ============================================================================
// CONSTANTS
// ============================================================================

const CHANGE_TYPE_CONFIG = {
  created: {
    icon: Plus,
    label: 'Criado',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  updated: {
    icon: Edit,
    label: 'Atualizado',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  enriched: {
    icon: Sparkles,
    label: 'Enriquecido',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  validated: {
    icon: CheckCircle,
    label: 'Validado',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
} as const;

const FIELD_LABELS: Record<string, string> = {
  nome: 'Nome',
  cnpj: 'CNPJ',
  email: 'Email',
  telefone: 'Telefone',
  site: 'Site',
  siteOficial: 'Site Oficial',
  cidade: 'Cidade',
  uf: 'UF',
  produto: 'Produto',
  produtoPrincipal: 'Produto Principal',
  categoria: 'Categoria',
  segmentacao: 'Segmentação',
  tamanhoMercado: 'Tamanho do Mercado',
  crescimentoAnual: 'Crescimento Anual',
  tendencias: 'Tendências',
  principaisPlayers: 'Principais Players',
  porte: 'Porte',
  faturamentoEstimado: 'Faturamento Estimado',
  tipo: 'Tipo',
  regiao: 'Região',
  setor: 'Setor',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  cnae: 'CNAE',
  _created: 'Registro Criado',
} as const;

const ICON_SIZES = {
  LARGE: 'w-12 h-12',
  SMALL: 'w-4 h-4',
  MEDIUM: 'w-6 h-6',
} as const;

const TIMELINE_DIMENSIONS = {
  ICON_SIZE: 'w-6 h-6',
  LINE_WIDTH: 'w-px',
  LEFT_PADDING: 'pl-8',
  ICON_LEFT: 'left-0',
  ICON_TOP: 'top-1',
  LINE_LEFT: 'left-3',
  LINE_TOP: 'top-8',
} as const;

const LABELS = {
  EMPTY_STATE: 'Nenhuma mudança registrada ainda',
  PREVIOUS: 'Anterior',
  NEW: 'Novo',
  BY: 'Por:',
  CREATED_MESSAGE: 'Registro criado no sistema',
} as const;

const VALUE_FORMAT = {
  EMPTY: '(vazio)',
  NULL: 'null',
  MAX_LENGTH: 100,
  TRUNCATE_SUFFIX: '...',
} as const;

const SYSTEM_USER = 'system';
const CREATED_FIELD = '_created';

// ============================================================================
// TYPES
// ============================================================================

type ChangeType = keyof typeof CHANGE_TYPE_CONFIG;

interface HistoryEntry {
  id: number;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  changeType: ChangeType;
  changedBy: string | null;
  changedAt: Date | string;
}

interface HistoryTimelineProps {
  history: HistoryEntry[];
}

interface ChangeTypeConfig {
  icon: LucideIcon;
  label: string;
  color: string;
  bgColor: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function formatValue(value: string | null): string {
  if (value === null || value === VALUE_FORMAT.NULL) {
    return VALUE_FORMAT.EMPTY;
  }
  if (value.length > VALUE_FORMAT.MAX_LENGTH) {
    return value.substring(0, VALUE_FORMAT.MAX_LENGTH) + VALUE_FORMAT.TRUNCATE_SUFFIX;
  }
  return value;
}

function getFieldLabel(field: string | null): string {
  if (!field) return '';
  return FIELD_LABELS[field] || field;
}

function getChangeTypeConfig(changeType: ChangeType): ChangeTypeConfig {
  return CHANGE_TYPE_CONFIG[changeType];
}

function isCreatedField(field: string | null): boolean {
  return field === CREATED_FIELD;
}

function isSystemUser(changedBy: string | null): boolean {
  return !changedBy || changedBy === SYSTEM_USER;
}

function shouldShowFieldLabel(field: string | null): boolean {
  return !!field && !isCreatedField(field);
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function EmptyState() {
  return (
    <Card className="p-8 text-center text-muted-foreground">
      <Clock className={`${ICON_SIZES.LARGE} mx-auto mb-3 opacity-50`} />
      <p>{LABELS.EMPTY_STATE}</p>
    </Card>
  );
}

function TimelineIcon({
  config,
  index,
  totalEntries,
}: {
  config: ChangeTypeConfig;
  index: number;
  totalEntries: number;
}) {
  const Icon = config.icon;
  const showLine = index < totalEntries - 1;

  return (
    <>
      {/* Linha vertical */}
      {showLine && (
        <div
          className={`absolute ${TIMELINE_DIMENSIONS.LINE_LEFT} ${TIMELINE_DIMENSIONS.LINE_TOP} bottom-0 ${TIMELINE_DIMENSIONS.LINE_WIDTH} bg-border`}
        />
      )}

      {/* Ícone */}
      <div
        className={`absolute ${TIMELINE_DIMENSIONS.ICON_LEFT} ${TIMELINE_DIMENSIONS.ICON_TOP} ${TIMELINE_DIMENSIONS.ICON_SIZE} rounded-full flex items-center justify-center ${config.bgColor}`}
      >
        <Icon className={`${ICON_SIZES.SMALL} ${config.color}`} />
      </div>
    </>
  );
}

function TimelineHeader({
  config,
  field,
  changedAt,
}: {
  config: ChangeTypeConfig;
  field: string | null;
  changedAt: Date | string;
}) {
  const fieldLabel = getFieldLabel(field);

  return (
    <div className="flex items-start justify-between gap-4 mb-2">
      <div>
        <span className={`font-medium ${config.color}`}>{config.label}</span>
        {shouldShowFieldLabel(field) && (
          <span className="text-sm text-muted-foreground ml-2">• {fieldLabel}</span>
        )}
      </div>
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(changedAt)}
      </div>
    </div>
  );
}

function CreatedContent() {
  return (
    <div className="text-sm text-muted-foreground">{LABELS.CREATED_MESSAGE}</div>
  );
}

function ValueChangeContent({
  oldValue,
  newValue,
}: {
  oldValue: string | null;
  newValue: string | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <div className="text-xs text-muted-foreground mb-1">{LABELS.PREVIOUS}</div>
        <div className="font-mono text-xs bg-muted/50 p-2 rounded">
          {formatValue(oldValue)}
        </div>
      </div>
      <div>
        <div className="text-xs text-muted-foreground mb-1">{LABELS.NEW}</div>
        <div className="font-mono text-xs bg-muted/50 p-2 rounded">
          {formatValue(newValue)}
        </div>
      </div>
    </div>
  );
}

function ChangedByFooter({ changedBy }: { changedBy: string | null }) {
  if (isSystemUser(changedBy)) return null;

  return (
    <div className="text-xs text-muted-foreground mt-2">
      {LABELS.BY} {changedBy}
    </div>
  );
}

function TimelineEntry({
  entry,
  index,
  totalEntries,
}: {
  entry: HistoryEntry;
  index: number;
  totalEntries: number;
}) {
  const config = getChangeTypeConfig(entry.changeType);

  return (
    <div key={entry.id} className={`relative ${TIMELINE_DIMENSIONS.LEFT_PADDING}`}>
      <TimelineIcon config={config} index={index} totalEntries={totalEntries} />

      <Card className="p-4">
        <TimelineHeader
          config={config}
          field={entry.field}
          changedAt={entry.changedAt}
        />

        {isCreatedField(entry.field) ? (
          <CreatedContent />
        ) : (
          <ValueChangeContent oldValue={entry.oldValue} newValue={entry.newValue} />
        )}

        <ChangedByFooter changedBy={entry.changedBy} />
      </Card>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HistoryTimeline({ history }: HistoryTimelineProps) {
  if (history.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {history.map((entry, index) => (
        <TimelineEntry
          key={entry.id}
          entry={entry}
          index={index}
          totalEntries={history.length}
        />
      ))}
    </div>
  );
}
