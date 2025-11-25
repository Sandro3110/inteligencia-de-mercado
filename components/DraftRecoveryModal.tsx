'use client';

/**
 * DraftRecoveryModal - Modal de Recuperação de Rascunhos
 * Permite listar, visualizar e gerenciar rascunhos salvos de pesquisas
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { trpc } from '@/lib/trpc/client';
import {
  FileText,
  Trash2,
  Clock,
  FolderOpen,
  Loader2,
  AlertCircle,
  PlayCircle,
  Filter,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================================
// CONSTANTS
// ============================================================================

const PROGRESS_STATUS = {
  STARTED: 'started',
  IN_PROGRESS: 'in_progress',
  ALMOST_DONE: 'almost_done',
} as const;

type ProgressStatus = (typeof PROGRESS_STATUS)[keyof typeof PROGRESS_STATUS];

const TOTAL_STEPS = 4;

const STEP_LABELS: Record<number, string> = {
  1: 'Seleção de Projeto',
  2: 'Parâmetros',
  3: 'Método de Entrada',
  4: 'Dados',
} as const;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: PROGRESS_STATUS.STARTED, label: 'Iniciado' },
  { value: PROGRESS_STATUS.IN_PROGRESS, label: 'Em Progresso' },
  { value: PROGRESS_STATUS.ALMOST_DONE, label: 'Quase Pronto' },
] as const;

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
] as const;

const LABELS = {
  TITLE: 'Recuperar Rascunhos',
  DESCRIPTION: 'Retome pesquisas que você começou mas não finalizou',
  FILTERS_BUTTON: 'Filtros',
  HIDE_FILTERS: 'Ocultar',
  ADVANCED_FILTERS: 'Filtros Avançados',
  CLEAR: 'Limpar',
  PROJECT: 'Projeto',
  STATUS: 'Status de Progresso',
  PERIOD: 'Período',
  SEARCH: 'Buscar',
  PROJECT_PLACEHOLDER: 'ID do projeto',
  SEARCH_PLACEHOLDER: 'Buscar no conteúdo...',
  RESULTS_COUNT: (count: number) => `${count} rascunho(s) encontrado(s)`,
  EMPTY_TITLE: 'Nenhum rascunho encontrado',
  EMPTY_DESCRIPTION:
    'Quando você iniciar uma nova pesquisa, ela será salva automaticamente aqui.',
  DRAFT_TITLE: 'Pesquisa em Andamento',
  STEP_LABEL: (current: number, total: number) => `Passo ${current}/${total}`,
  PROGRESS_PERCENTAGE: (value: number) => `${value.toFixed(0)}%`,
  PROJECT_ID: (id: number) => `Projeto ID: ${id}`,
  METHOD: (method: string) => `Método: ${method}`,
  CONTINUE: 'Continuar',
  DELETE: 'Excluir',
  CLOSE: 'Fechar',
  UNKNOWN_DATE: 'Data desconhecida',
  UNKNOWN_STEP: (step: number) => `Passo ${step}`,
} as const;

const TOAST_MESSAGES = {
  DELETE_SUCCESS: 'Rascunho excluído com sucesso!',
  DELETE_ERROR: 'Erro ao excluir rascunho',
  CONTINUE_SUCCESS: 'Rascunho carregado!',
  CONTINUE_DESCRIPTION: 'Continue de onde parou.',
} as const;

const CONFIRM_DELETE = {
  TITLE: 'Confirmar Exclusão',
  DESCRIPTION:
    'Tem certeza que deseja excluir este rascunho? Esta ação não pode ser desfeita.',
  CANCEL: 'Cancelar',
  CONFIRM: 'Excluir',
} as const;

const LAYOUT = {
  MAX_WIDTH: 'max-w-3xl',
  MAX_HEIGHT: 'max-h-[80vh]',
  SCROLL_HEIGHT: 'max-h-[50vh]',
  PROGRESS_HEIGHT: 'h-2',
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface DraftRecoveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueDraft?: (draftData: DraftData) => void;
}

interface DraftData {
  projectId?: number;
  method?: string;
  currentStep: number;
  [key: string]: unknown;
}

interface Draft {
  id: number;
  projectId: number | null;
  currentStep: number;
  draftData: unknown;
  updatedAt?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStepLabel(step: number): string {
  return STEP_LABELS[step] || LABELS.UNKNOWN_STEP(step);
}

function calculateProgressPercentage(step: number): number {
  return (step / TOTAL_STEPS) * 100;
}

function parseNumberOrUndefined(value: string): number | undefined {
  return value ? Number(value) : undefined;
}

function parseStatusOrUndefined(value: string): ProgressStatus | undefined {
  return value === 'all' ? undefined : (value as ProgressStatus);
}

function parsePeriodOrUndefined(value: string): number | undefined {
  return value === 'all' ? undefined : Number(value);
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DraftRecoveryModal({
  open,
  onOpenChange,
  onContinueDraft,
}: DraftRecoveryModalProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [draftToDelete, setDraftToDelete] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filtros
  const [projectIdFilter, setProjectIdFilter] = useState<number | undefined>();
  const [progressStatusFilter, setProgressStatusFilter] = useState<
    ProgressStatus | undefined
  >();
  const [daysAgoFilter, setDaysAgoFilter] = useState<number | undefined>();
  const [searchText, setSearchText] = useState('');

  // ============================================================================
  // QUERIES
  // ============================================================================

  const {
    data: drafts,
    isLoading,
    refetch,
  } = trpc.drafts.getFiltered.useQuery(
    {
      projectId: projectIdFilter,
      progressStatus: progressStatusFilter,
      daysAgo: daysAgoFilter,
      searchText: searchText || undefined,
    },
    {
      enabled: open,
    }
  );

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const deleteDraft = trpc.drafts.delete.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.DELETE_SUCCESS);
      refetch();
      setDraftToDelete(null);
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.DELETE_ERROR, {
        description: error.message,
      });
    },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasDrafts = useMemo(
    () => drafts && drafts.length > 0,
    [drafts]
  );

  const draftsCount = useMemo(
    () => (drafts ? drafts.length : 0),
    [drafts]
  );

  const resultsCountText = useMemo(
    () => LABELS.RESULTS_COUNT(draftsCount),
    [draftsCount]
  );

  const filtersButtonText = useMemo(
    () => (showFilters ? LABELS.HIDE_FILTERS : LABELS.FILTERS_BUTTON),
    [showFilters]
  );

  const showDeleteDialog = useMemo(
    () => draftToDelete !== null,
    [draftToDelete]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleContinue = useCallback(
    (draft: Draft) => {
      if (onContinueDraft) {
        onContinueDraft(draft.draftData as DraftData);
        onOpenChange(false);
        toast.success(TOAST_MESSAGES.CONTINUE_SUCCESS, {
          description: TOAST_MESSAGES.CONTINUE_DESCRIPTION,
        });
      }
    },
    [onContinueDraft, onOpenChange]
  );

  const handleDelete = useCallback((draftId: number) => {
    setDraftToDelete(draftId);
  }, []);

  const confirmDelete = useCallback(() => {
    if (draftToDelete) {
      deleteDraft.mutate({ draftId: draftToDelete });
    }
  }, [draftToDelete, deleteDraft]);

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleClearFilters = useCallback(() => {
    setProjectIdFilter(undefined);
    setProgressStatusFilter(undefined);
    setDaysAgoFilter(undefined);
    setSearchText('');
  }, []);

  const handleProjectIdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProjectIdFilter(parseNumberOrUndefined(e.target.value));
    },
    []
  );

  const handleStatusChange = useCallback((value: string) => {
    setProgressStatusFilter(parseStatusOrUndefined(value));
  }, []);

  const handlePeriodChange = useCallback((value: string) => {
    setDaysAgoFilter(parsePeriodOrUndefined(value));
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
    },
    []
  );

  const handleCloseDialog = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleCloseDeleteDialog = useCallback(() => {
    setDraftToDelete(null);
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderStatusOption = useCallback(
    (option: (typeof STATUS_OPTIONS)[number]) => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ),
    []
  );

  const renderPeriodOption = useCallback(
    (option: (typeof PERIOD_OPTIONS)[number]) => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ),
    []
  );

  const renderFiltersPanel = useCallback(
    () => (
      <div className="border rounded-lg p-4 space-y-4 bg-slate-50">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">{LABELS.ADVANCED_FILTERS}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="gap-2 text-xs"
          >
            <X className="w-3 h-3" />
            {LABELS.CLEAR}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="projectFilter" className="text-xs">
              {LABELS.PROJECT}
            </Label>
            <Input
              id="projectFilter"
              type="number"
              placeholder={LABELS.PROJECT_PLACEHOLDER}
              value={projectIdFilter ?? ''}
              onChange={handleProjectIdChange}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="statusFilter" className="text-xs">
              {LABELS.STATUS}
            </Label>
            <Select
              value={progressStatusFilter ?? 'all'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{STATUS_OPTIONS.map(renderStatusOption)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="daysFilter" className="text-xs">
              {LABELS.PERIOD}
            </Label>
            <Select
              value={daysAgoFilter?.toString() ?? 'all'}
              onValueChange={handlePeriodChange}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{PERIOD_OPTIONS.map(renderPeriodOption)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="searchFilter" className="text-xs">
              {LABELS.SEARCH}
            </Label>
            <Input
              id="searchFilter"
              placeholder={LABELS.SEARCH_PLACEHOLDER}
              value={searchText}
              onChange={handleSearchChange}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="text-xs text-slate-600">{resultsCountText}</div>
      </div>
    ),
    [
      projectIdFilter,
      progressStatusFilter,
      daysAgoFilter,
      searchText,
      resultsCountText,
      handleClearFilters,
      handleProjectIdChange,
      handleStatusChange,
      handlePeriodChange,
      handleSearchChange,
      renderStatusOption,
      renderPeriodOption,
    ]
  );

  const renderDraftCard = useCallback(
    (draft: any) => {
      const progressPercentage = calculateProgressPercentage(draft.currentStep);
      const stepLabel = getStepLabel(draft.currentStep);
      const formattedDate = draft.updatedAt
        ? formatDistanceToNow(new Date(draft.updatedAt), {
            addSuffix: true,
            locale: ptBR,
          })
        : LABELS.UNKNOWN_DATE;

      return (
        <Card
          key={draft.id}
          className="hover:border-primary/50 transition-colors"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {LABELS.DRAFT_TITLE}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formattedDate}
                </div>
              </div>
              <Badge variant="outline">
                {LABELS.STEP_LABEL(draft.currentStep, TOTAL_STEPS)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Barra de Progresso */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{stepLabel}</span>
                <span>{LABELS.PROGRESS_PERCENTAGE(progressPercentage)}</span>
              </div>
              <div className={`w-full bg-secondary rounded-full ${LAYOUT.PROGRESS_HEIGHT}`}>
                <div
                  className={`bg-primary rounded-full ${LAYOUT.PROGRESS_HEIGHT} transition-all`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Preview dos Dados */}
            {draft.draftData && (
              <div className="text-xs text-muted-foreground space-y-1">
                {draft.projectId && (
                  <div className="flex items-center gap-1">
                    <FolderOpen className="w-3 h-3" />
                    <span>{LABELS.PROJECT_ID(draft.projectId)}</span>
                  </div>
                )}
                {draft.draftData.method && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{LABELS.METHOD(draft.draftData.method as string)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                className="flex-1 gap-2"
                onClick={() => handleContinue(draft)}
              >
                <PlayCircle className="w-4 h-4" />
                {LABELS.CONTINUE}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => handleDelete(draft.id)}
              >
                <Trash2 className="w-4 h-4" />
                {LABELS.DELETE}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    },
    [handleContinue, handleDelete]
  );

  const renderLoadingState = useCallback(
    () => (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ),
    []
  );

  const renderEmptyState = useCallback(
    () => (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FolderOpen className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{LABELS.EMPTY_TITLE}</h3>
        <p className="text-muted-foreground text-sm">
          {LABELS.EMPTY_DESCRIPTION}
        </p>
      </div>
    ),
    []
  );

  const renderDraftsList = useCallback(
    () => (
      <ScrollArea className={`${LAYOUT.SCROLL_HEIGHT} pr-4`}>
        <div className="space-y-3">{drafts!.map(renderDraftCard)}</div>
      </ScrollArea>
    ),
    [drafts, renderDraftCard]
  );

  const renderContent = useCallback(() => {
    if (isLoading) return renderLoadingState();
    if (!hasDrafts) return renderEmptyState();
    return renderDraftsList();
  }, [isLoading, hasDrafts, renderLoadingState, renderEmptyState, renderDraftsList]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={`${LAYOUT.MAX_WIDTH} ${LAYOUT.MAX_HEIGHT}`}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {LABELS.TITLE}
                </DialogTitle>
                <DialogDescription>{LABELS.DESCRIPTION}</DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFilters}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                {filtersButtonText}
              </Button>
            </div>
          </DialogHeader>

          {/* Painel de Filtros */}
          {showFilters && renderFiltersPanel()}

          {/* Conteúdo */}
          {renderContent()}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              {LABELS.CLOSE}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={handleCloseDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{CONFIRM_DELETE.TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {CONFIRM_DELETE.DESCRIPTION}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{CONFIRM_DELETE.CANCEL}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {CONFIRM_DELETE.CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
