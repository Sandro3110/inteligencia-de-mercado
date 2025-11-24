'use client';

/**
 * AutomationTab - Aba de Automação de Relatórios
 * Gerencia agendamento de relatórios recorrentes com envio automático por email
 */

import { useState, useCallback, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useSelectedProject } from '@/hooks/useSelectedProject';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Mail,
  Plus,
  Trash2,
  Edit,
  Loader2,
  FileText,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================================
// CONSTANTS
// ============================================================================

const FREQUENCY_OPTIONS = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const;

const FREQUENCY_LABELS: Record<string, string> = {
  [FREQUENCY_OPTIONS.WEEKLY]: 'Semanal',
  [FREQUENCY_OPTIONS.MONTHLY]: 'Mensal',
} as const;

const STATUS_VARIANTS = {
  ACTIVE: 'default',
  PENDING: 'secondary',
  INACTIVE: 'outline',
} as const;

const STATUS_LABELS = {
  ACTIVE: 'Ativo',
  PENDING: 'Aguardando execução',
  INACTIVE: 'Inativo',
} as const;

const LABELS = {
  PAGE_TITLE: 'Automação de Relatórios',
  PAGE_DESCRIPTION: 'Configure envio automático de relatórios por email',
  NEW_AUTOMATION: 'Nova Automação',
  NO_PROJECT_SELECTED: 'Selecione um projeto para gerenciar automações de relatórios',
  NO_AUTOMATIONS: 'Nenhuma automação configurada',
  CREATE_FIRST: 'Crie sua primeira automação de relatórios',
  DIALOG_CREATE_TITLE: 'Nova Automação de Relatório',
  DIALOG_CREATE_DESCRIPTION: 'Configure o envio automático de relatórios por email',
  DIALOG_EDIT_TITLE: 'Editar Automação',
  DIALOG_EDIT_DESCRIPTION: 'Atualize as configurações da automação',
  FIELD_NAME: 'Nome da Automação *',
  FIELD_FREQUENCY: 'Frequência *',
  FIELD_NEXT_RUN: 'Próxima Execução *',
  FIELD_RECIPIENTS: 'Destinatários (separados por vírgula) *',
  PLACEHOLDER_NAME: 'Ex: Relatório Semanal de Vendas',
  PLACEHOLDER_RECIPIENTS: 'email1@example.com, email2@example.com',
  HINT_RECIPIENTS: 'Adicione um ou mais emails separados por vírgula',
  BUTTON_CANCEL: 'Cancelar',
  BUTTON_CREATE: 'Criar Automação',
  BUTTON_SAVE: 'Salvar Alterações',
  NEXT_EXECUTION: 'Próxima execução:',
  RECIPIENTS_COUNT: (count: number) => `${count} destinatário(s)`,
  LAST_EXECUTION: 'Última execução:',
  RECIPIENTS_LABEL: 'Destinatários:',
} as const;

const TOAST_MESSAGES = {
  SUCCESS_CREATE: 'Agendamento criado com sucesso!',
  SUCCESS_UPDATE: 'Agendamento atualizado com sucesso!',
  SUCCESS_DELETE: 'Agendamento deletado com sucesso!',
  ERROR_CREATE: (message: string) => `Erro ao criar agendamento: ${message}`,
  ERROR_UPDATE: (message: string) => `Erro ao atualizar agendamento: ${message}`,
  ERROR_DELETE: (message: string) => `Erro ao deletar agendamento: ${message}`,
  ERROR_NO_PROJECT: 'Selecione um projeto',
  ERROR_REQUIRED_FIELDS: 'Preencha todos os campos obrigatórios',
  ERROR_NO_EMAILS: 'Adicione pelo menos um email',
  ERROR_INVALID_EMAILS: (emails: string[]) => `Emails inválidos: ${emails.join(', ')}`,
} as const;

const CONFIRM_MESSAGES = {
  DELETE: 'Tem certeza que deseja deletar este agendamento?',
} as const;

const ICON_SIZES = {
  SMALL: 'w-3 h-3',
  MEDIUM: 'w-4 h-4',
  LARGE: 'w-8 h-8',
  XLARGE: 'w-12 h-12',
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================================
// TYPES
// ============================================================================

type Frequency = 'weekly' | 'monthly';

interface Schedule {
  id: number;
  name: string;
  frequency: Frequency;
  recipients: string[];
  nextRun: string;
  lastRun?: string;
  isActive: boolean;
}

interface EditingSchedule {
  id: number;
  name: string;
  frequency: Frequency;
  recipients: string[];
  nextRun: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseEmailList(emailString: string): string[] {
  return emailString
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
}

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function validateEmails(emails: string[]): { valid: boolean; invalid: string[] } {
  const invalid = emails.filter((e) => !validateEmail(e));
  return { valid: invalid.length === 0, invalid };
}

function formatDateToMySQLTimestamp(dateString: string): string {
  return new Date(dateString).toISOString().slice(0, 19).replace('T', ' ');
}

function formatDateToInputValue(dateString: string): string {
  return new Date(dateString).toISOString().slice(0, 16);
}

function getFrequencyLabel(frequency: string): string {
  return FREQUENCY_LABELS[frequency] || frequency;
}

function isSchedulePending(schedule: Schedule): boolean {
  const now = new Date();
  const nextRun = new Date(schedule.nextRun);
  return schedule.isActive && nextRun <= now;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AutomationTab() {
  // ============================================================================
  // HOOKS
  // ============================================================================

  const { selectedProjectId } = useSelectedProject();

  // ============================================================================
  // STATE
  // ============================================================================

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<EditingSchedule | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<Frequency>(FREQUENCY_OPTIONS.WEEKLY);
  const [recipients, setRecipients] = useState('');
  const [nextRunDate, setNextRunDate] = useState('');

  // ============================================================================
  // QUERIES
  // ============================================================================

  const utils = trpc.useUtils();

  const { data: schedules, isLoading } = trpc.reports.getSchedules.useQuery(
    { projectId: selectedProjectId ?? undefined },
    { enabled: !!selectedProjectId }
  );

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createMutation = trpc.reports.createSchedule.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.SUCCESS_CREATE);
      utils.reports.getSchedules.invalidate();
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.ERROR_CREATE(error.message));
    },
  });

  const updateMutation = trpc.reports.updateSchedule.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.SUCCESS_UPDATE);
      utils.reports.getSchedules.invalidate();
      setEditingSchedule(null);
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.ERROR_UPDATE(error.message));
    },
  });

  const deleteMutation = trpc.reports.deleteSchedule.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.SUCCESS_DELETE);
      utils.reports.getSchedules.invalidate();
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.ERROR_DELETE(error.message));
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

  const isUpdating = useMemo(
    () => updateMutation.isPending,
    [updateMutation.isPending]
  );

  const isDeleting = useMemo(
    () => deleteMutation.isPending,
    [deleteMutation.isPending]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const resetForm = useCallback(() => {
    setName('');
    setFrequency(FREQUENCY_OPTIONS.WEEKLY);
    setRecipients('');
    setNextRunDate('');
  }, []);

  const handleCreate = useCallback(() => {
    if (!selectedProjectId) {
      toast.error(TOAST_MESSAGES.ERROR_NO_PROJECT);
      return;
    }

    if (!name || !recipients || !nextRunDate) {
      toast.error(TOAST_MESSAGES.ERROR_REQUIRED_FIELDS);
      return;
    }

    const emailList = parseEmailList(recipients);
    if (emailList.length === 0) {
      toast.error(TOAST_MESSAGES.ERROR_NO_EMAILS);
      return;
    }

    const validation = validateEmails(emailList);
    if (!validation.valid) {
      toast.error(TOAST_MESSAGES.ERROR_INVALID_EMAILS(validation.invalid));
      return;
    }

    const nextRunTimestamp = formatDateToMySQLTimestamp(nextRunDate);

    createMutation.mutate({
      projectId: selectedProjectId,
      name,
      frequency,
      recipients: emailList,
      config: {},
      nextRunAt: nextRunTimestamp,
    });
  }, [selectedProjectId, name, recipients, nextRunDate, frequency, createMutation]);

  const handleEdit = useCallback((schedule: Schedule) => {
    setEditingSchedule(schedule);
    setName(schedule.name);
    setFrequency(schedule.frequency);
    setRecipients(schedule.recipients.join(', '));
    setNextRunDate(formatDateToInputValue(schedule.nextRun));
  }, []);

  const handleUpdate = useCallback(() => {
    if (!editingSchedule) return;

    if (!name || !recipients || !nextRunDate) {
      toast.error(TOAST_MESSAGES.ERROR_REQUIRED_FIELDS);
      return;
    }

    const emailList = parseEmailList(recipients);
    const nextRunTimestamp = formatDateToMySQLTimestamp(nextRunDate);

    updateMutation.mutate({
      id: editingSchedule.id,
      name,
      frequency,
      recipients: emailList,
      nextRunAt: nextRunTimestamp,
    });
  }, [editingSchedule, name, recipients, nextRunDate, frequency, updateMutation]);

  const handleDelete = useCallback(
    (id: number) => {
      if (confirm(CONFIRM_MESSAGES.DELETE)) {
        deleteMutation.mutate({ id });
      }
    },
    [deleteMutation]
  );

  const handleOpenCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  const handleCloseCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setEditingSchedule(null);
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleFrequencyChange = useCallback((value: string) => {
    setFrequency(value as Frequency);
  }, []);

  const handleRecipientsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRecipients(e.target.value);
    },
    []
  );

  const handleNextRunChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNextRunDate(e.target.value);
    },
    []
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getStatusBadge = useCallback((schedule: Schedule) => {
    if (schedule.isActive) {
      if (isSchedulePending(schedule)) {
        return <Badge variant={STATUS_VARIANTS.PENDING}>{STATUS_LABELS.PENDING}</Badge>;
      }
      return <Badge variant={STATUS_VARIANTS.ACTIVE}>{STATUS_LABELS.ACTIVE}</Badge>;
    }
    return <Badge variant={STATUS_VARIANTS.INACTIVE}>{STATUS_LABELS.INACTIVE}</Badge>;
  }, []);

  const renderScheduleCard = useCallback(
    (schedule: Schedule) => (
      <Card key={schedule.id}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {schedule.name}
                {getStatusBadge(schedule)}
              </CardTitle>
              <CardDescription className="mt-2">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1">
                    <Calendar className={ICON_SIZES.SMALL} />
                    {getFrequencyLabel(schedule.frequency)} - {LABELS.NEXT_EXECUTION}{' '}
                    {new Date(schedule.nextRun).toLocaleString('pt-BR')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className={ICON_SIZES.SMALL} />
                    {LABELS.RECIPIENTS_COUNT(schedule.recipients.length)}
                  </span>
                  {schedule.lastRun && (
                    <span className="flex items-center gap-1">
                      <Clock className={ICON_SIZES.SMALL} />
                      {LABELS.LAST_EXECUTION}{' '}
                      {formatDistanceToNow(new Date(schedule.lastRun), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  )}
                </div>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(schedule)}>
                <Edit className={ICON_SIZES.MEDIUM} />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(schedule.id)}
                disabled={isDeleting}
              >
                <Trash2 className={ICON_SIZES.MEDIUM} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">{LABELS.RECIPIENTS_LABEL}</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {schedule.recipients.map((email, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {email}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    [getStatusBadge, handleEdit, handleDelete, isDeleting]
  );

  const renderEmptyState = useCallback(
    () => (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <FileText className={`${ICON_SIZES.XLARGE} mx-auto mb-4 opacity-50`} />
          <p>{LABELS.NO_AUTOMATIONS}</p>
          <p className="text-sm mt-2">{LABELS.CREATE_FIRST}</p>
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

  const renderFormFields = useCallback(
    (isEdit: boolean) => (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={isEdit ? 'edit-name' : 'name'}>{LABELS.FIELD_NAME}</Label>
          <Input
            id={isEdit ? 'edit-name' : 'name'}
            value={name}
            onChange={handleNameChange}
            placeholder={LABELS.PLACEHOLDER_NAME}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={isEdit ? 'edit-frequency' : 'frequency'}>
            {LABELS.FIELD_FREQUENCY}
          </Label>
          <Select value={frequency} onValueChange={handleFrequencyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FREQUENCY_OPTIONS.WEEKLY}>
                {FREQUENCY_LABELS[FREQUENCY_OPTIONS.WEEKLY]}
              </SelectItem>
              <SelectItem value={FREQUENCY_OPTIONS.MONTHLY}>
                {FREQUENCY_LABELS[FREQUENCY_OPTIONS.MONTHLY]}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={isEdit ? 'edit-nextRun' : 'nextRun'}>
            {LABELS.FIELD_NEXT_RUN}
          </Label>
          <Input
            id={isEdit ? 'edit-nextRun' : 'nextRun'}
            type="datetime-local"
            value={nextRunDate}
            onChange={handleNextRunChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={isEdit ? 'edit-recipients' : 'recipients'}>
            {LABELS.FIELD_RECIPIENTS}
          </Label>
          <Input
            id={isEdit ? 'edit-recipients' : 'recipients'}
            value={recipients}
            onChange={handleRecipientsChange}
            placeholder={LABELS.PLACEHOLDER_RECIPIENTS}
          />
          <p className="text-xs text-muted-foreground">{LABELS.HINT_RECIPIENTS}</p>
        </div>
      </div>
    ),
    [
      name,
      frequency,
      nextRunDate,
      recipients,
      handleNameChange,
      handleFrequencyChange,
      handleNextRunChange,
      handleRecipientsChange,
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
        <Button onClick={handleOpenCreateDialog} className="gap-2">
          <Plus className={ICON_SIZES.MEDIUM} />
          {LABELS.NEW_AUTOMATION}
        </Button>
      </div>

      {/* Lista de Agendamentos */}
      {isLoading
        ? renderLoadingState()
        : !hasSchedules
          ? renderEmptyState()
          : <div className="grid gap-4">{schedules!.map(renderScheduleCard)}</div>}

      {/* Dialog: Criar Automação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{LABELS.DIALOG_CREATE_TITLE}</DialogTitle>
            <DialogDescription>{LABELS.DIALOG_CREATE_DESCRIPTION}</DialogDescription>
          </DialogHeader>
          {renderFormFields(false)}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCreateDialog}>
              {LABELS.BUTTON_CANCEL}
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating && (
                <Loader2 className={`${ICON_SIZES.MEDIUM} mr-2 animate-spin`} />
              )}
              {LABELS.BUTTON_CREATE}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Automação */}
      <Dialog open={!!editingSchedule} onOpenChange={handleCloseEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{LABELS.DIALOG_EDIT_TITLE}</DialogTitle>
            <DialogDescription>{LABELS.DIALOG_EDIT_DESCRIPTION}</DialogDescription>
          </DialogHeader>
          {renderFormFields(true)}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditDialog}>
              {LABELS.BUTTON_CANCEL}
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating && (
                <Loader2 className={`${ICON_SIZES.MEDIUM} mr-2 animate-spin`} />
              )}
              {LABELS.BUTTON_SAVE}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
