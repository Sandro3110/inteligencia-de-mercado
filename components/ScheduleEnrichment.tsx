'use client';

/**
 * ScheduleEnrichment - Agendamento de Enriquecimento
 * Configuração e gerenciamento de agendamentos de enriquecimento
 */

import { useState, useCallback, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Calendar, Clock, Repeat, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// CONSTANTS
// ============================================================================

const RECURRENCE_TYPES = {
  ONCE: 'once',
  DAILY: 'daily',
  WEEKLY: 'weekly',
} as const;

type RecurrenceType = (typeof RECURRENCE_TYPES)[keyof typeof RECURRENCE_TYPES];

const SCHEDULE_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ERROR: 'error',
} as const;

type ScheduleStatus = (typeof SCHEDULE_STATUS)[keyof typeof SCHEDULE_STATUS];

const FORM_DEFAULTS = {
  DATE: '',
  TIME: '',
  RECURRENCE: RECURRENCE_TYPES.ONCE as RecurrenceType,
  BATCH_SIZE: 50,
  MAX_CLIENTS: undefined as number | undefined,
} as const;

const BATCH_SIZE_LIMITS = {
  MIN: 1,
  MAX: 100,
} as const;

const LABELS = {
  TITLE: 'Agendar Enriquecimento',
  DESCRIPTION: 'Configure quando e como executar o enriquecimento',
  SCHEDULES_TITLE: 'Agendamentos Futuros',
  SCHEDULES_DESCRIPTION: 'Próximas execuções programadas',
  DATE: 'Data',
  TIME: 'Hora',
  RECURRENCE: 'Recorrência',
  BATCH_SIZE: 'Tamanho do Lote',
  MAX_CLIENTS: 'Máximo de Clientes (opcional)',
  SUBMIT_BUTTON: 'Agendar Enriquecimento',
  SUBMITTING: 'Agendando...',
  CANCEL_BUTTON: 'Cancelar',
  LOADING: 'Carregando...',
  EMPTY_STATE: 'Nenhum agendamento configurado',
  BATCH_INFO: (size: number | null) => `Lote: ${size ?? 0} clientes`,
  MAX_INFO: (max: number) => ` • Máximo: ${max}`,
} as const;

const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  [RECURRENCE_TYPES.ONCE]: 'Única',
  [RECURRENCE_TYPES.DAILY]: 'Diária',
  [RECURRENCE_TYPES.WEEKLY]: 'Semanal',
};

const STATUS_COLORS: Record<ScheduleStatus, string> = {
  [SCHEDULE_STATUS.PENDING]: 'bg-blue-500/20 text-blue-400',
  [SCHEDULE_STATUS.RUNNING]: 'bg-green-500/20 text-green-400',
  [SCHEDULE_STATUS.COMPLETED]: 'bg-gray-500/20 text-gray-400',
  [SCHEDULE_STATUS.CANCELLED]: 'bg-red-500/20 text-red-400',
  [SCHEDULE_STATUS.ERROR]: 'bg-red-500/20 text-red-400',
};

const TOAST_MESSAGES = {
  CREATE_SUCCESS: 'Agendamento criado com sucesso!',
  CREATE_ERROR: (message: string) => `Erro ao criar agendamento: ${message}`,
  CANCEL_SUCCESS: 'Agendamento cancelado',
  DELETE_SUCCESS: 'Agendamento deletado',
  VALIDATION_REQUIRED: 'Por favor, preencha data e hora',
  VALIDATION_FUTURE: 'Data/hora deve ser no futuro',
} as const;

const PLACEHOLDERS = {
  MAX_CLIENTS: 'Todos',
} as const;

const DATE_LOCALE = 'pt-BR';

// ============================================================================
// TYPES
// ============================================================================

interface ScheduleEnrichmentProps {
  projectId: number;
  onClose?: () => void;
}

interface Schedule {
  id: number;
  scheduledAt: string;
  recurrence: string;
  batchSize: number | null;
  maxClients: number | null;
  status: string;
  errorMessage?: string | null;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  projectId?: number;
  timeout?: number | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRecurrenceLabel(recurrence: string): string {
  return RECURRENCE_LABELS[recurrence as RecurrenceType] || recurrence;
}

function getStatusBadgeColor(status: string): string {
  return STATUS_COLORS[status as ScheduleStatus] || STATUS_COLORS.pending;
}

function formatScheduledDate(dateString: string): string {
  return new Date(dateString).toLocaleString(DATE_LOCALE);
}

function createScheduledDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}

function isDateInFuture(date: Date): boolean {
  return date > new Date();
}

function parseIntOrUndefined(value: string): number | undefined {
  return value ? parseInt(value, 10) : undefined;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ScheduleEnrichment({
  projectId,
  onClose,
}: ScheduleEnrichmentProps) {
  const [scheduledDate, setScheduledDate] = useState<string>(FORM_DEFAULTS.DATE);
  const [scheduledTime, setScheduledTime] = useState<string>(FORM_DEFAULTS.TIME);
  const [recurrence, setRecurrence] = useState<RecurrenceType>(
    FORM_DEFAULTS.RECURRENCE
  );
  const [batchSize, setBatchSize] = useState<number>(FORM_DEFAULTS.BATCH_SIZE);
  const [maxClients, setMaxClients] = useState<number | undefined>(
    FORM_DEFAULTS.MAX_CLIENTS
  );

  const utils = trpc.useUtils();

  // ============================================================================
  // QUERIES
  // ============================================================================

  const { data: schedules, isLoading } = trpc.enrichment.listSchedules.useQuery(
    { projectId }
  );

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createMutation = trpc.enrichment.createSchedule.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.CREATE_SUCCESS);
      utils.enrichment.listSchedules.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.CREATE_ERROR(error.message));
    },
  });

  const cancelMutation = trpc.enrichment.cancelSchedule.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.CANCEL_SUCCESS);
      utils.enrichment.listSchedules.invalidate();
    },
  });

  const deleteMutation = trpc.enrichment.deleteSchedule.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.DELETE_SUCCESS);
      utils.enrichment.listSchedules.invalidate();
    },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasSchedules = useMemo(
    () => schedules && schedules.length > 0,
    [schedules]
  );

  const submitButtonText = useMemo(
    () =>
      createMutation.isPending ? LABELS.SUBMITTING : LABELS.SUBMIT_BUTTON,
    [createMutation.isPending]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const resetForm = useCallback(() => {
    setScheduledDate(FORM_DEFAULTS.DATE);
    setScheduledTime(FORM_DEFAULTS.TIME);
    setRecurrence(FORM_DEFAULTS.RECURRENCE);
    setBatchSize(FORM_DEFAULTS.BATCH_SIZE);
    setMaxClients(FORM_DEFAULTS.MAX_CLIENTS);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!scheduledDate || !scheduledTime) {
        toast.error(TOAST_MESSAGES.VALIDATION_REQUIRED);
        return;
      }

      const scheduledAt = createScheduledDateTime(scheduledDate, scheduledTime);

      if (!isDateInFuture(scheduledAt)) {
        toast.error(TOAST_MESSAGES.VALIDATION_FUTURE);
        return;
      }

      createMutation.mutate({
        projectId,
        scheduledAt,
        recurrence,
        batchSize,
        maxClients,
      });
    },
    [
      scheduledDate,
      scheduledTime,
      projectId,
      recurrence,
      batchSize,
      maxClients,
      createMutation,
    ]
  );

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setScheduledDate(e.target.value);
    },
    []
  );

  const handleTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setScheduledTime(e.target.value);
    },
    []
  );

  const handleRecurrenceChange = useCallback((value: string) => {
    setRecurrence(value as RecurrenceType);
  }, []);

  const handleBatchSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBatchSize(parseInt(e.target.value, 10));
    },
    []
  );

  const handleMaxClientsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMaxClients(parseIntOrUndefined(e.target.value));
    },
    []
  );

  const handleCancelSchedule = useCallback(
    (scheduleId: number) => {
      cancelMutation.mutate({ id: scheduleId });
    },
    [cancelMutation]
  );

  const handleDeleteSchedule = useCallback(
    (scheduleId: number) => {
      deleteMutation.mutate({ id: scheduleId });
    },
    [deleteMutation]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = useCallback(
    () => (
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl text-slate-100">
            {LABELS.TITLE}
          </CardTitle>
          <CardDescription>{LABELS.DESCRIPTION}</CardDescription>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
    ),
    [onClose]
  );

  const renderRecurrenceOption = useCallback(
    (value: RecurrenceType, label: string) => (
      <SelectItem key={value} value={value}>
        {label}
      </SelectItem>
    ),
    []
  );

  const renderForm = useCallback(
    () => (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {LABELS.DATE}
            </Label>
            <Input
              id="date"
              type="date"
              value={scheduledDate}
              onChange={handleDateChange}
              required
              className="bg-slate-50 border-slate-700"
            />
          </div>

          {/* Hora */}
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {LABELS.TIME}
            </Label>
            <Input
              id="time"
              type="time"
              value={scheduledTime}
              onChange={handleTimeChange}
              required
              className="bg-slate-50 border-slate-700"
            />
          </div>

          {/* Recorrência */}
          <div className="space-y-2">
            <Label htmlFor="recurrence" className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              {LABELS.RECURRENCE}
            </Label>
            <Select value={recurrence} onValueChange={handleRecurrenceChange}>
              <SelectTrigger className="bg-slate-50 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RECURRENCE_LABELS).map(([value, label]) =>
                  renderRecurrenceOption(value as RecurrenceType, label)
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Tamanho do Lote */}
          <div className="space-y-2">
            <Label htmlFor="batchSize">{LABELS.BATCH_SIZE}</Label>
            <Input
              id="batchSize"
              type="number"
              min={BATCH_SIZE_LIMITS.MIN}
              max={BATCH_SIZE_LIMITS.MAX}
              value={batchSize}
              onChange={handleBatchSizeChange}
              className="bg-slate-50 border-slate-700"
            />
          </div>

          {/* Máximo de Clientes */}
          <div className="space-y-2">
            <Label htmlFor="maxClients">{LABELS.MAX_CLIENTS}</Label>
            <Input
              id="maxClients"
              type="number"
              min={1}
              value={maxClients || ''}
              onChange={handleMaxClientsChange}
              placeholder={PLACEHOLDERS.MAX_CLIENTS}
              className="bg-slate-50 border-slate-700"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={createMutation.isPending}
        >
          {submitButtonText}
        </Button>
      </form>
    ),
    [
      scheduledDate,
      scheduledTime,
      recurrence,
      batchSize,
      maxClients,
      submitButtonText,
      handleSubmit,
      handleDateChange,
      handleTimeChange,
      handleRecurrenceChange,
      handleBatchSizeChange,
      handleMaxClientsChange,
      renderRecurrenceOption,
      createMutation.isPending,
    ]
  );

  const renderScheduleCard = useCallback(
    (schedule: Schedule) => {
      const isPending = schedule.status === SCHEDULE_STATUS.PENDING;

      return (
        <div
          key={schedule.id}
          className="flex items-center justify-between p-4 rounded-lg bg-slate-50/50 border border-slate-700"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(schedule.status)}`}
              >
                {schedule.status}
              </span>
              <span className="text-slate-300">
                {formatScheduledDate(schedule.scheduledAt)}
              </span>
              <span className="text-slate-500 text-sm">
                • {getRecurrenceLabel(schedule.recurrence)}
              </span>
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {LABELS.BATCH_INFO(schedule.batchSize)}
              {schedule.maxClients && LABELS.MAX_INFO(schedule.maxClients)}
            </div>
          </div>

          <div className="flex gap-2">
            {isPending && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancelSchedule(schedule.id)}
                disabled={cancelMutation.isPending}
              >
                {LABELS.CANCEL_BUTTON}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteSchedule(schedule.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </Button>
          </div>
        </div>
      );
    },
    [
      handleCancelSchedule,
      handleDeleteSchedule,
      cancelMutation.isPending,
      deleteMutation.isPending,
    ]
  );

  const renderSchedulesList = useCallback(() => {
    if (isLoading) {
      return (
        <div className="text-center text-slate-400">{LABELS.LOADING}</div>
      );
    }

    if (!hasSchedules) {
      return (
        <div className="text-center text-slate-400 py-8">
          {LABELS.EMPTY_STATE}
        </div>
      );
    }

    return (
      <div className="space-y-3">{schedules!.map(renderScheduleCard)}</div>
    );
  }, [isLoading, hasSchedules, schedules, renderScheduleCard]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Form de Agendamento */}
      <Card className="bg-white/50 border-slate-700">
        {renderHeader()}
        <CardContent>{renderForm()}</CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      <Card className="bg-white/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl text-slate-100">
            {LABELS.SCHEDULES_TITLE}
          </CardTitle>
          <CardDescription>{LABELS.SCHEDULES_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent>{renderSchedulesList()}</CardContent>
      </Card>
    </div>
  );
}
