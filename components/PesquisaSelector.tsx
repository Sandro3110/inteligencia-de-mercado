'use client';

import { useCallback, useMemo } from 'react';
import { useSelectedPesquisa } from '@/hooks/useSelectedPesquisa';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Loader2 } from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZES = {
  SMALL: 'h-4 w-4',
} as const;

const DIMENSIONS = {
  SELECT_WIDTH: 'w-[220px]',
  SELECT_HEIGHT: 'h-9',
} as const;

const CLASSES = {
  CONTAINER: 'flex items-center gap-2',
  EMPTY_STATE: 'flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground',
  ICON: 'text-muted-foreground',
  ICON_ANIMATED: 'animate-spin',
  PESQUISA_ITEM: 'flex items-center gap-2',
  CLIENT_COUNT: 'text-xs text-muted-foreground',
  ALL_OPTION: 'text-muted-foreground',
} as const;

const LABELS = {
  SELECT_PROJECT: 'Selecione um projeto',
  LOADING: 'Carregando pesquisas...',
  NO_PESQUISAS: 'Nenhuma pesquisa',
  ALL_PESQUISAS: 'Todas as pesquisas',
  CLIENT_COUNT: (count: number) => `(${count} clientes)`,
} as const;

const ALL_VALUE = 'all';
const RADIX = 10;

// ============================================================================
// TYPES
// ============================================================================

export interface PesquisaSelectorProps {
  projectId?: number | null;
}

interface Pesquisa {
  id: number;
  nome: string;
  totalClientes: number | null;
}

interface PesquisaItemProps {
  pesquisa: Pesquisa;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parsePesquisaId(value: string): number {
  return parseInt(value, RADIX);
}

function isAllValue(value: string): boolean {
  return value === ALL_VALUE;
}

function hasClientCount(pesquisa: Pesquisa): boolean {
  return pesquisa.totalClientes !== null;
}

function formatClientCount(count: number): string {
  return LABELS.CLIENT_COUNT(count);
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function NoProjectState() {
  return (
    <div className={CLASSES.EMPTY_STATE}>
      <FileText className={ICON_SIZES.SMALL} />
      <span>{LABELS.SELECT_PROJECT}</span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className={CLASSES.EMPTY_STATE}>
      <Loader2 className={`${ICON_SIZES.SMALL} ${CLASSES.ICON_ANIMATED}`} />
      <span>{LABELS.LOADING}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={CLASSES.EMPTY_STATE}>
      <FileText className={ICON_SIZES.SMALL} />
      <span>{LABELS.NO_PESQUISAS}</span>
    </div>
  );
}

function PesquisaItem({ pesquisa }: PesquisaItemProps) {
  const showClientCount = useMemo(
    () => hasClientCount(pesquisa),
    [pesquisa]
  );

  const clientCountText = useMemo(
    () => pesquisa.totalClientes !== null ? formatClientCount(pesquisa.totalClientes) : '',
    [pesquisa.totalClientes]
  );

  return (
    <div className={CLASSES.PESQUISA_ITEM}>
      <span>{pesquisa.nome}</span>
      {showClientCount && (
        <span className={CLASSES.CLIENT_COUNT}>{clientCountText}</span>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * PesquisaSelector
 * 
 * Seletor de pesquisas com suporte para "Todas as pesquisas".
 * Exibe estados de loading, vazio e sem projeto selecionado.
 * 
 * @example
 * ```tsx
 * <PesquisaSelector projectId={123} />
 * ```
 */
export function PesquisaSelector({ projectId }: PesquisaSelectorProps) {
  // Hooks
  const {
    selectedPesquisaId,
    pesquisas,
    selectPesquisa,
    isLoading,
  } = useSelectedPesquisa(projectId);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasProject = useMemo(() => !!projectId, [projectId]);

  const hasPesquisas = useMemo(() => pesquisas.length > 0, [pesquisas.length]);

  const selectedValue = useMemo(
    () => selectedPesquisaId?.toString() || ALL_VALUE,
    [selectedPesquisaId]
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleValueChange = useCallback(
    (value: string) => {
      if (isAllValue(value)) {
        selectPesquisa(null);
      } else {
        const pesquisaId = parsePesquisaId(value);
        selectPesquisa(pesquisaId);
      }
    },
    [selectPesquisa]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!hasProject) {
    return <NoProjectState />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!hasPesquisas) {
    return <EmptyState />;
  }

  return (
    <div className={CLASSES.CONTAINER}>
      <FileText className={`${ICON_SIZES.SMALL} ${CLASSES.ICON}`} />

      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger className={`${DIMENSIONS.SELECT_WIDTH} ${DIMENSIONS.SELECT_HEIGHT}`}>
          <SelectValue placeholder={LABELS.ALL_PESQUISAS} />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={ALL_VALUE}>
            <span className={CLASSES.ALL_OPTION}>{LABELS.ALL_PESQUISAS}</span>
          </SelectItem>

          {pesquisas.map((pesquisa) => (
            <SelectItem key={pesquisa.id} value={pesquisa.id.toString()}>
              <PesquisaItem pesquisa={pesquisa} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
