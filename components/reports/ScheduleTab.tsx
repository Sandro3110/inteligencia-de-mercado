'use client';

/**
 * ScheduleTab - Aba de Agendamentos de Pesquisas
 * Gerencia agendamento de execuções automáticas de pesquisas
 */

import { useState, useCallback, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { Calendar, Clock, Trash2, X, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================================
// CONSTANTS
// ============================================================================

const RECURRENCE_OPTIONS = {
  ONCE: 'once',
  DAILY: 'daily',
  WEEKLY: 'weekly',
} as const;

const RECURRENCE_LABELS: Record<string, string> = {
  [RECURRENCE_OPTIONS.ONCE]: 'Uma vez',
  [RECURRENCE_OPTIONS.DAILY]: 'Diário',
  [RECURRENCE_OPTIONS.WEEKLY]: 'Semanal',
} as const;

const SCHEDULE_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ERROR: 'error',
} as const;

const STATUS_LABELS: Record<string, string> = {
  [SCHEDULE_STATUS.PENDING]: 'Pendente',
  [SCHEDULE_STATUS.RUNNING]: 'Executando',
  [SCHEDULE_STATUS.COMPLETED]: 'Concluído',
  [SCHEDULE_STATUS.CANCELLED]: 'Cancelado',
  [SCHEDULE_STATUS.ERROR]: 'Erro',
} as const;

const STATUS_COLORS: Record<string, string> = {
  [SCHEDULE_STATUS.PENDING]: 'bg-blue-100 text-blue-800',
  [SCHEDULE_STATUS.RUNNING]: 'bg-yellow-100 text-yellow-800',
  [SCHEDULE_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [SCHEDULE_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800',
  [SCHEDULE_STATUS.ERROR]: 'bg-red-100 text-red-800',
} as const;

const DEFAULT_STATUS_COLOR = 'bg-gray-100 text-gray-800';

const BATCH_SIZE = {
  DEFAULT: '50',
  MIN: 1,
  MAX: 1000,
} as const;

const LABELS = {
  PAGE_TITLE: 'Agendamentos de Pesquisas',
  PAGE_DESCRIPTION: 'Agende execuções automáticas de pesquisas',
  NEW_SCHEDULE: 'Novo Agendamento',
  CANCEL: 'Cancelar',
  NO_PROJECT_SELECTED: 'Selecione um projeto para gerenciar agendamentos',
  NO_SCHEDULES: 'Nenhum agendamento encontrado',
  FORM_TITLE: 'Novo Agendamento',
  FIELD_DATETIME: 'Data e Hora *',
  FIELD_RECURRENCE: 'Recorrência *',
  FIELD_BATCH_SIZE: 'Tamanho do Lote',
  BUTTON_CREATE: 'Criar Agendamento',
  BATCH_SIZE_LABEL: 'Tamanho do lote:',
  EXECUTED_AT: 'Executado em:',
} as const;

const TOAST_MESSAGES = {
  SUCCESS_CREATE: 'Agendamento criado com sucesso!',
  SUCCESS_CANCEL: 'Agendamento cancelado!',
  SUCCESS_DELETE: 'Agendamento excluído!',
  ERROR_CREATE: (message: string) => `Erro ao criar agendamento: ${message}`,
  ERROR_REQUIRED_FIELDS: 'Preencha todos os campos obrigatórios',
} as const;

const ICON_SIZES = {
  SMALL: 'w-4 h-4',
  LARGE: 'w-8 h-8',
} as const;

// ============================================================================
// TYPES
// ============================================================================

type Recurrence = 'once' | 'daily' | 'weekly';
type ScheduleStatus = 'pending' | 'running' | 'completed' | 'cancelled' | 'error';

interface Schedule {
  id: number;
  projectId: number;
  scheduledAt: string;
  recurrence: string;
  batchSize: number | null;
  maxClients?: number | null;
  timeout?: number | null;
  status: string;
  errorMessage?: string | null;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  createdAt: string | null;
  updatedAt?: string | null;
  executedAt?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRecurrenceLabel(recurrence: string): string {
  return RECURRENCE_LABELS[recurrence] || recurrence;
}

function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || DEFAULT_STATUS_COLOR;
}

function parseIntOrDefault(value: string, defaultValue: number): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ScheduleTab() {
  // ============================================================================
  // HOOKS
  // ============================================================================

  const { selectedProjectId } = useSelectedProject();

  // ============================================================================
  // STATE
  // ============================================================================

  const [showForm, setShowForm] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>(RECURRENCE_OPTIONS.ONCE);
  const [batchSize, setBatchSize] = useState(BATCH_SIZE.DEFAULT);

  // ============================================================================
  // QUERIES
  // ============================================================================

  const {
    data: schedules,
    refetch,
    isLoading,
  } = trpc.schedule.list.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createMutation = trpc.schedule.create.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.SUCCESS_CREATE);
      setShowForm(false);
      setScheduledAt('');
      setRecurrence(RECURRENCE_OPTIONS.ONCE);
      setBatchSize(BATCH_SIZE.DEFAULT);
      refetch();
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.ERROR_CREATE(error.message));
    },
  });

  const cancelMutation = trpc.schedule.cancel.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.SUCCESS_CANCEL);
      refetch();
    },
  });

  const deleteMutation = trpc.schedule.delete.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.SUCCESS_DELETE);
      refetch();
    },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasSchedules = useMemo(
    () => schedules && schedules.length > 0,
    [schedules]
  );

  const isCreating = useMemo(
    () => createMutation.isPending,
    [createMutation.isPending]
  );

  const isCancelling = useMemo(
    () => cancelMutation.isPending,
    [cancelMutation.isPending]
  );

  const isDeleting = useMemo(
    () => deleteMutation.isPending,
    [deleteMutation.isPending]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProjectId || !scheduledAt) {
        toast.error(TOAST_MESSAGES.ERROR_REQUIRED_FIELDS);
        return;
      }

      createMutation.mutate({
        projectId: selectedProjectId,
        scheduledAt,
        recurrence,
        batchSize: parseIntOrDefault(batchSize, parseInt(BATCH_SIZE.DEFAULT, 10)),
      });
    },
    [selectedProjectId, scheduledAt, recurrence, batchSize, createMutation]
  );

  const handleToggleForm = useCallback(() => {
    setShowForm((prev) => !prev);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
  }, []);

  const handleScheduledAtChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setScheduledAt(e.target.value);
    },
    []
  );

  const handleRecurrenceChange = useCallback((value: string) => {
    setRecurrence(value as Recurrence);
  }, []);

  const handleBatchSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBatchSize(e.target.value as typeof BATCH_SIZE.DEFAULT);
    },
    []
  );

  const handleCancelSchedule = useCallback(
    (id: number) => {
      cancelMutation.mutate({ id });
    },
    [cancelMutation]
  );

  const handleDeleteSchedule = useCallback(
    (id: number) => {
      deleteMutation.mutate({ id });
    },
    [deleteMutation]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderScheduleCard = useCallback(
    (schedule: Schedule) => (
      <Card key={schedule.id}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(schedule.status)}>
                  {getStatusLabel(schedule.status)}
                </Badge>
                <Badge variant="outline">
                  {getRecurrenceLabel(schedule.recurrence)}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className={ICON_SIZES.SMALL} />
                  {new Date(schedule.scheduledAt).toLocaleString('pt-BR')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className={ICON_SIZES.SMALL} />
                  {schedule.createdAt ? formatDistanceToNow(new Date(schedule.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  }) : 'N/A'}
                </span>
              </div>

              <div className="text-sm">
                <span className="font-medium">{LABELS.BATCH_SIZE_LABEL}</span>{' '}
                {schedule.batchSize}
              </div>

              {schedule.executedAt && (
                <div className="text-sm text-muted-foreground">
                  {LABELS.EXECUTED_AT}{' '}
                  {new Date(schedule.executedAt).toLocaleString('pt-BR')}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {schedule.status === SCHEDULE_STATUS.PENDING && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancelSchedule(schedule.id)}
                  disabled={isCancelling}
                >
                  <X className={ICON_SIZES.SMALL} />
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteSchedule(schedule.id)}
                disabled={isDeleting}
              >
                <Trash2 className={ICON_SIZES.SMALL} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    [handleCancelSchedule, handleDeleteSchedule, isCancelling, isDeleting]
  );

  const renderEmptyState = useCallback(
    () => (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {LABELS.NO_SCHEDULES}
        </CardContent>
      </Card>
    ),
    []
  );

  const renderLoadingState = useCallback(
    () => (
      <div className="flex items-center justify-center py-12">
        <Loader2 className={`${ICON_SIZES.LARGE} animate-spin text-primary`} />
      </div>
    ),
    []
  );

  const renderForm = useCallback(
    () => (
      <Card>
        <CardHeader>
          <CardTitle>{LABELS.FORM_TITLE}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">{LABELS.FIELD_DATETIME}</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={handleScheduledAtChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurrence">{LABELS.FIELD_RECURRENCE}</Label>
                <Select value={recurrence} onValueChange={handleRecurrenceChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RECURRENCE_OPTIONS.ONCE}>
                      {RECURRENCE_LABELS[RECURRENCE_OPTIONS.ONCE]}
                    </SelectItem>
                    <SelectItem value={RECURRENCE_OPTIONS.DAILY}>
                      {RECURRENCE_LABELS[RECURRENCE_OPTIONS.DAILY]}
                    </SelectItem>
                    <SelectItem value={RECURRENCE_OPTIONS.WEEKLY}>
                      {RECURRENCE_LABELS[RECURRENCE_OPTIONS.WEEKLY]}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchSize">{LABELS.FIELD_BATCH_SIZE}</Label>
                <Input
                  id="batchSize"
                  type="number"
                  value={batchSize}
                  onChange={handleBatchSizeChange}
                  min={BATCH_SIZE.MIN}
                  max={BATCH_SIZE.MAX}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                {LABELS.CANCEL}
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && (
                  <Loader2 className={`${ICON_SIZES.SMALL} mr-2 animate-spin`} />
                )}
                {LABELS.BUTTON_CREATE}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    ),
    [
      handleSubmit,
      scheduledAt,
      handleScheduledAtChange,
      recurrence,
      handleRecurrenceChange,
      batchSize,
      handleBatchSizeChange,
      handleCloseForm,
      isCreating,
    ]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!selectedProjectId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {LABELS.NO_PROJECT_SELECTED}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{LABELS.PAGE_TITLE}</h3>
          <p className="text-sm text-muted-foreground">{LABELS.PAGE_DESCRIPTION}</p>
        </div>
        <Button onClick={handleToggleForm} className="gap-2">
          {showForm ? (
            <>
              <X className={ICON_SIZES.SMALL} />
              {LABELS.CANCEL}
            </>
          ) : (
            <>
              <Plus className={ICON_SIZES.SMALL} />
              {LABELS.NEW_SCHEDULE}
            </>
          )}
        </Button>
      </div>

      {/* Formulário de Criação */}
      {showForm && renderForm()}

      {/* Lista de Agendamentos */}
      {isLoading
        ? renderLoadingState()
        : !hasSchedules
          ? renderEmptyState()
          : <div className="grid gap-4">{schedules!.map(renderScheduleCard)}</div>}
    </div>
  );
}
