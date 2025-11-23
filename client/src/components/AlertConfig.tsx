import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  TrendingUp,
  Target,
} from "lucide-react";

type AlertType = "error_rate" | "high_quality_lead" | "market_threshold";

interface AlertTypeInfo {
  label: string;
  description: string;
  icon: React.ReactNode;
  thresholdLabel: string;
  thresholdUnit: string;
}

const ALERT_TYPES: Record<AlertType, AlertTypeInfo> = {
  error_rate: {
    label: "Taxa de Erro",
    description:
      "Alerta quando a taxa de erro no enriquecimento ultrapassar o limite",
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    thresholdLabel: "Taxa de erro máxima",
    thresholdUnit: "%",
  },
  high_quality_lead: {
    label: "Lead de Alta Qualidade",
    description: "Alerta quando um lead com score alto for identificado",
    icon: <TrendingUp className="w-5 h-5 text-green-500" />,
    thresholdLabel: "Score mínimo",
    thresholdUnit: "pontos",
  },
  market_threshold: {
    label: "Limite de Mercado",
    description: "Alerta quando um mercado atingir número mínimo de leads",
    icon: <Target className="w-5 h-5 text-blue-500" />,
    thresholdLabel: "Número mínimo de leads",
    thresholdUnit: "leads",
  },
};

export function AlertConfig() {
  const { selectedProjectId } = useSelectedProject();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    type: AlertType;
    threshold: number;
    enabled: boolean;
  }>({
    name: "",
    type: "error_rate",
    threshold: 10,
    enabled: true,
  });

  // Queries
  const { data: alerts, refetch } = trpc.alert.list.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  // Mutations
  const createMutation = trpc.alert.create.useMutation({
    onSuccess: () => {
      toast.success("Alerta criado com sucesso!");
      refetch();
      setIsCreating(false);
      resetForm();
    },
    onError: error => {
      toast.error(`Erro ao criar alerta: ${error.message}`);
    },
  });

  const updateMutation = trpc.alert.update.useMutation({
    onSuccess: () => {
      toast.success("Alerta atualizado com sucesso!");
      refetch();
      setEditingId(null);
      resetForm();
    },
    onError: error => {
      toast.error(`Erro ao atualizar alerta: ${error.message}`);
    },
  });

  const deleteMutation = trpc.alert.delete.useMutation({
    onSuccess: () => {
      toast.success("Alerta deletado com sucesso!");
      refetch();
    },
    onError: error => {
      toast.error(`Erro ao deletar alerta: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "error_rate",
      threshold: 10,
      enabled: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId) {
      toast.error("Nenhum projeto selecionado");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name: formData.name,
        type: formData.type,
        condition: JSON.stringify({ operator: ">", value: formData.threshold }),
        enabled: formData.enabled,
      });
    } else {
      createMutation.mutate({
        projectId: selectedProjectId,
        name: formData.name,
        type: formData.type,
        condition: JSON.stringify({ operator: ">", value: formData.threshold }),
        enabled: formData.enabled,
      });
    }
  };

  const handleEdit = (alert: any) => {
    setEditingId(alert.id);
    const condition = JSON.parse(alert.condition);
    setFormData({
      name: alert.name,
      type: alert.type as AlertType,
      threshold: condition.value,
      enabled: alert.enabled,
    });
    setIsCreating(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este alerta?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  const selectedTypeInfo = ALERT_TYPES[formData.type];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-500" />
            Alertas Personalizados
          </h2>
          <p className="text-slate-400 mt-1">
            Configure alertas automáticos para eventos importantes
          </p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Alerta
          </Button>
        )}
      </div>

      {/* Formulário de Criação/Edição */}
      {isCreating && (
        <Card className="bg-white border-slate-200 shadow-sm border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-slate-900">
              {editingId ? "Editar Alerta" : "Criar Novo Alerta"}
            </CardTitle>
            <CardDescription>Configure os parâmetros do alerta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome do Alerta */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Alerta</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Alerta de Taxa de Erro Alta"
                  required
                />
              </div>

              {/* Tipo de Alerta */}
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Alerta</Label>
                <Select
                  value={formData.type}
                  onValueChange={value =>
                    setFormData({ ...formData, type: value as AlertType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ALERT_TYPES).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {info.icon}
                          <span>{info.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-400">
                  {selectedTypeInfo.description}
                </p>
              </div>

              {/* Threshold */}
              <div className="space-y-2">
                <Label htmlFor="threshold">
                  {selectedTypeInfo.thresholdLabel}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="threshold"
                    type="number"
                    value={formData.threshold}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        threshold: Number(e.target.value),
                      })
                    }
                    min={0}
                    required
                  />
                  <span className="text-sm text-slate-400">
                    {selectedTypeInfo.thresholdUnit}
                  </span>
                </div>
              </div>

              {/* Enabled */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enabled">Alerta Ativo</Label>
                  <p className="text-sm text-slate-400">
                    Desative temporariamente sem deletar
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={checked =>
                    setFormData({ ...formData, enabled: checked })
                  }
                />
              </div>

              {/* Botões */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editingId ? "Atualizar" : "Criar"} Alerta
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Alertas */}
      <div className="space-y-3">
        {alerts && alerts.length > 0 ? (
          alerts.map(alert => {
            const typeInfo = ALERT_TYPES[alert.alertType as AlertType];
            const condition = JSON.parse(alert.condition);
            return (
              <Card
                key={alert.id}
                className="bg-white border-slate-200 shadow-sm"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {typeInfo.icon}
                      <div>
                        <h3 className="font-medium text-slate-900">
                          {alert.name}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {typeInfo.label} - Limite: {condition.value}{" "}
                          {typeInfo.thresholdUnit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!!alert.enabled}
                        onCheckedChange={checked =>
                          updateMutation.mutate({
                            id: alert.id,
                            enabled: checked,
                          })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(alert)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(alert.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">
                Nenhum alerta configurado. Clique em "Novo Alerta" para começar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
