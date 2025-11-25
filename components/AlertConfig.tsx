'use client';

/**
 * AlertConfig - Configuração de Alertas Personalizados
 * Gerenciamento de alertas automáticos para eventos importantes
 */

import { useState, useCallback, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  TrendingUp,
  Target,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const ALERT_TYPE_KEYS = {
  ERROR_RATE: 'error_rate',
  HIGH_QUALITY_LEAD: 'high_quality_lead',
  MARKET_THRESHOLD: 'market_threshold',
} as const;

type AlertType = (typeof ALERT_TYPE_KEYS)[keyof typeof ALERT_TYPE_KEYS];

const FORM_DEFAULTS = {
  NAME: '',
  TYPE: ALERT_TYPE_KEYS.ERROR_RATE as AlertType,
  THRESHOLD: 10,
  ENABLED: true,
} as const;

const CONDITION_OPERATOR = '>';

const LABELS = {
  TITLE: 'Alertas Personalizados',
  SUBTITLE: 'Configure alertas automáticos para eventos importantes',
  NEW_ALERT: 'Novo Alerta',
  CREATE_TITLE: 'Criar Novo Alerta',
  EDIT_TITLE: 'Editar Alerta',
  FORM_DESCRIPTION: 'Configure os parâmetros do alerta',
  ALERT_NAME: 'Nome do Alerta',
  ALERT_TYPE: 'Tipo de Alerta',
  ALERT_ACTIVE: 'Alerta Ativo',
  ALERT_ACTIVE_DESCRIPTION: 'Desative temporariamente sem deletar',
  CREATE_BUTTON: 'Criar Alerta',
  UPDATE_BUTTON: 'Atualizar Alerta',
  CANCEL_BUTTON: 'Cancelar',
  EMPTY_STATE: 'Nenhum alerta configurado. Clique em "Novo Alerta" para começar.',
} as const;

const PLACEHOLDERS = {
  ALERT_NAME: 'Ex: Alerta de Taxa de Erro Alta',
} as const;

const TOAST_MESSAGES = {
  NO_PROJECT: 'Nenhum projeto selecionado',
  CREATE_SUCCESS: 'Alerta criado com sucesso!',
  CREATE_ERROR: (message: string) => `Erro ao criar alerta: ${message}`,
  UPDATE_SUCCESS: 'Alerta atualizado com sucesso!',
  UPDATE_ERROR: (message: string) => `Erro ao atualizar alerta: ${message}`,
  DELETE_SUCCESS: 'Alerta deletado com sucesso!',
  DELETE_ERROR: (message: string) => `Erro ao deletar alerta: ${message}`,
} as const;

const CONFIRM_MESSAGES = {
  DELETE: 'Tem certeza que deseja deletar este alerta?',
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface AlertTypeInfo {
  label: string;
  description: string;
  icon: React.ReactNode;
  thresholdLabel: string;
  thresholdUnit: string;
}

interface AlertFormData {
  name: string;
  type: AlertType;
  threshold: number;
  enabled: boolean;
}

interface AlertCondition {
  operator: string;
  value: number;
}

interface Alert {
  id: number;
  name: string;
  alertType: string;
  condition: string;
  enabled: boolean;
}

// ============================================================================
// ALERT TYPES CONFIGURATION
// ============================================================================

const ALERT_TYPES: Record<AlertType, AlertTypeInfo> = {
  [ALERT_TYPE_KEYS.ERROR_RATE]: {
    label: 'Taxa de Erro',
    description: 'Alerta quando a taxa de erro no enriquecimento ultrapassar o limite',
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    thresholdLabel: 'Taxa de erro máxima',
    thresholdUnit: '%',
  },
  [ALERT_TYPE_KEYS.HIGH_QUALITY_LEAD]: {
    label: 'Lead de Alta Qualidade',
    description: 'Alerta quando um lead com score alto for identificado',
    icon: <TrendingUp className="w-5 h-5 text-green-500" />,
    thresholdLabel: 'Score mínimo',
    thresholdUnit: 'pontos',
  },
  [ALERT_TYPE_KEYS.MARKET_THRESHOLD]: {
    label: 'Limite de Mercado',
    description: 'Alerta quando um mercado atingir número mínimo de leads',
    icon: <Target className="w-5 h-5 text-blue-500" />,
    thresholdLabel: 'Número mínimo de leads',
    thresholdUnit: 'leads',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getInitialFormData(): AlertFormData {
  return {
    name: FORM_DEFAULTS.NAME,
    type: FORM_DEFAULTS.TYPE,
    threshold: FORM_DEFAULTS.THRESHOLD,
    enabled: FORM_DEFAULTS.ENABLED,
  };
}

function serializeCondition(threshold: number): string {
  return JSON.stringify({
    operator: CONDITION_OPERATOR,
    value: threshold,
  });
}

function parseCondition(conditionJson: string): AlertCondition {
  return JSON.parse(conditionJson);
}

function getAlertTypeInfo(type: string): AlertTypeInfo {
  return ALERT_TYPES[type as AlertType];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AlertConfig() {
  const { selectedProjectId } = useSelectedProject();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AlertFormData>(getInitialFormData);

  // ============================================================================
  // QUERIES
  // ============================================================================

  const { data: alerts, refetch } = trpc.alert.list.useQuery(
    { projectId: Number(selectedProjectId!) },
    { enabled: !!selectedProjectId }
  );

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createMutation = trpc.alert.create.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.CREATE_SUCCESS);
      refetch();
      setIsCreating(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.CREATE_ERROR(error.message));
    },
  });

  const updateMutation = trpc.alert.update.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.UPDATE_SUCCESS);
      refetch();
      setEditingId(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.UPDATE_ERROR(error.message));
    },
  });

  const deleteMutation = trpc.alert.delete.useMutation({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.DELETE_SUCCESS);
      refetch();
    },
    onError: (error) => {
      toast.error(TOAST_MESSAGES.DELETE_ERROR(error.message));
    },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const selectedTypeInfo = useMemo(() => ALERT_TYPES[formData.type], [formData.type]);

  const formTitle = useMemo(
    () => (editingId ? LABELS.EDIT_TITLE : LABELS.CREATE_TITLE),
    [editingId]
  );

  const submitButtonText = useMemo(
    () => (editingId ? LABELS.UPDATE_BUTTON : LABELS.CREATE_BUTTON),
    [editingId]
  );

  const isSubmitting = useMemo(
    () => createMutation.isPending || updateMutation.isPending,
    [createMutation.isPending, updateMutation.isPending]
  );

  const hasAlerts = useMemo(() => alerts && alerts.length > 0, [alerts]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!selectedProjectId) {
        toast.error(TOAST_MESSAGES.NO_PROJECT);
        return;
      }

      const condition = serializeCondition(formData.threshold);

      if (editingId) {
        updateMutation.mutate({
          id: editingId,
          name: formData.name,
          type: formData.type,
          condition,
          enabled: formData.enabled,
        });
      } else {
        createMutation.mutate({
          projectId: Number(selectedProjectId),
          name: formData.name,
          type: formData.type,
          condition,
          enabled: formData.enabled,
        });
      }
    },
    [selectedProjectId, formData, editingId, createMutation, updateMutation]
  );

  const handleEdit = useCallback((alert: Alert) => {
    setEditingId(alert.id);
    const condition = parseCondition(alert.condition);
    setFormData({
      name: alert.name,
      type: alert.alertType as AlertType,
      threshold: condition.value,
      enabled: alert.enabled,
    });
    setIsCreating(true);
  }, []);

  const handleDelete = useCallback(
    (id: number) => {
      if (confirm(CONFIRM_MESSAGES.DELETE)) {
        deleteMutation.mutate({ id });
      }
    },
    [deleteMutation]
  );

  const handleCancel = useCallback(() => {
    setIsCreating(false);
    setEditingId(null);
    resetForm();
  }, [resetForm]);

  const handleNewAlert = useCallback(() => {
    setIsCreating(true);
  }, []);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, name: e.target.value });
    },
    [formData]
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      setFormData({ ...formData, type: value as AlertType });
    },
    [formData]
  );

  const handleThresholdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, threshold: Number(e.target.value) });
    },
    [formData]
  );

  const handleEnabledChange = useCallback(
    (checked: boolean) => {
      setFormData({ ...formData, enabled: checked });
    },
    [formData]
  );

  const handleToggleAlert = useCallback(
    (alertId: number, checked: boolean) => {
      updateMutation.mutate({
        id: alertId,
        enabled: checked,
      });
    },
    [updateMutation]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = useCallback(
    () => (
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-500" />
            {LABELS.TITLE}
          </h2>
          <p className="text-slate-400 mt-1">{LABELS.SUBTITLE}</p>
        </div>
        {!isCreating && (
          <Button onClick={handleNewAlert} className="gap-2">
            <Plus className="w-4 h-4" />
            {LABELS.NEW_ALERT}
          </Button>
        )}
      </div>
    ),
    [isCreating, handleNewAlert]
  );

  const renderAlertTypeOption = useCallback(
    ([key, info]: [string, AlertTypeInfo]) => (
      <SelectItem key={key} value={key}>
        <div className="flex items-center gap-2">
          {info.icon}
          <span>{info.label}</span>
        </div>
      </SelectItem>
    ),
    []
  );

  const renderForm = useCallback(
    () => (
      <Card className="bg-white border-slate-200 shadow-sm border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-slate-900">{formTitle}</CardTitle>
          <CardDescription>{LABELS.FORM_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome do Alerta */}
            <div className="space-y-2">
              <Label htmlFor="name">{LABELS.ALERT_NAME}</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder={PLACEHOLDERS.ALERT_NAME}
                required
              />
            </div>

            {/* Tipo de Alerta */}
            <div className="space-y-2">
              <Label htmlFor="type">{LABELS.ALERT_TYPE}</Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ALERT_TYPES).map(renderAlertTypeOption)}
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-400">{selectedTypeInfo.description}</p>
            </div>

            {/* Threshold */}
            <div className="space-y-2">
              <Label htmlFor="threshold">{selectedTypeInfo.thresholdLabel}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="threshold"
                  type="number"
                  value={formData.threshold}
                  onChange={handleThresholdChange}
                  min={0}
                  required
                />
                <span className="text-sm text-slate-400">{selectedTypeInfo.thresholdUnit}</span>
              </div>
            </div>

            {/* Enabled */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enabled">{LABELS.ALERT_ACTIVE}</Label>
                <p className="text-sm text-slate-400">{LABELS.ALERT_ACTIVE_DESCRIPTION}</p>
              </div>
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={handleEnabledChange}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {submitButtonText}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                {LABELS.CANCEL_BUTTON}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    ),
    [
      formTitle,
      formData,
      selectedTypeInfo,
      isSubmitting,
      submitButtonText,
      handleSubmit,
      handleNameChange,
      handleTypeChange,
      handleThresholdChange,
      handleEnabledChange,
      handleCancel,
      renderAlertTypeOption,
    ]
  );

  const renderAlertCard = useCallback(
    (alert: Alert) => {
      const typeInfo = getAlertTypeInfo(alert.alertType);
      const condition = parseCondition(alert.condition);

      return (
        <Card key={alert.id} className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {typeInfo.icon}
                <div>
                  <h3 className="font-medium text-slate-900">{alert.name}</h3>
                  <p className="text-sm text-slate-400">
                    {typeInfo.label} - Limite: {condition.value} {typeInfo.thresholdUnit}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!alert.enabled}
                  onCheckedChange={(checked) => handleToggleAlert(alert.id, checked)}
                />
                <Button variant="ghost" size="sm" onClick={() => handleEdit(alert)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(alert.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    },
    [handleToggleAlert, handleEdit, handleDelete]
  );

  const renderEmptyState = useCallback(
    () => (
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-8 text-center">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">{LABELS.EMPTY_STATE}</p>
        </CardContent>
      </Card>
    ),
    []
  );

  const renderAlertsList = useCallback(
    () => (
      <div className="space-y-3">
        {hasAlerts
          ? alerts!.map((alert) => renderAlertCard({ ...alert, enabled: Boolean(alert.enabled) }))
          : renderEmptyState()}
      </div>
    ),
    [hasAlerts, alerts, renderAlertCard, renderEmptyState]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      {renderHeader()}

      {/* Formulário de Criação/Edição */}
      {isCreating && renderForm()}

      {/* Lista de Alertas */}
      {renderAlertsList()}
    </div>
  );
}
