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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Mail,
  Plus,
  Trash2,
  Edit,
  Play,
  Pause,
  FileText,
} from "lucide-react";

export default function ReportSchedules() {
  const { selectedProjectId } = useSelectedProject();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);

  // Form state
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("weekly");
  const [recipients, setRecipients] = useState("");
  const [nextRunDate, setNextRunDate] = useState("");

  const utils = trpc.useUtils();

  // Queries
  const { data: schedules, isLoading } = trpc.reports.getSchedules.useQuery(
    { projectId: selectedProjectId ?? undefined },
    { enabled: !!selectedProjectId }
  );

  // Mutations
  const createMutation = trpc.reports.createSchedule.useMutation({
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso!");
      utils.reports.getSchedules.invalidate();
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: error => {
      toast.error(`Erro ao criar agendamento: ${error.message}`);
    },
  });

  const updateMutation = trpc.reports.updateSchedule.useMutation({
    onSuccess: () => {
      toast.success("Agendamento atualizado com sucesso!");
      utils.reports.getSchedules.invalidate();
      setEditingSchedule(null);
    },
    onError: error => {
      toast.error(`Erro ao atualizar agendamento: ${error.message}`);
    },
  });

  const deleteMutation = trpc.reports.deleteSchedule.useMutation({
    onSuccess: () => {
      toast.success("Agendamento deletado com sucesso!");
      utils.reports.getSchedules.invalidate();
    },
    onError: error => {
      toast.error(`Erro ao deletar agendamento: ${error.message}`);
    },
  });

  const resetForm = () => {
    setName("");
    setFrequency("weekly");
    setRecipients("");
    setNextRunDate("");
  };

  const handleCreate = () => {
    if (!selectedProjectId) {
      toast.error("Selecione um projeto");
      return;
    }

    if (!name || !recipients || !nextRunDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const emailList = recipients
      .split(",")
      .map(e => e.trim())
      .filter(Boolean);
    if (emailList.length === 0) {
      toast.error("Adicione pelo menos um email");
      return;
    }

    // Validar emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter(e => !emailRegex.test(e));
    if (invalidEmails.length > 0) {
      toast.error(`Emails inválidos: ${invalidEmails.join(", ")}`);
      return;
    }

    // Converter data para formato MySQL timestamp
    const nextRunTimestamp = new Date(nextRunDate)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    createMutation.mutate({
      projectId: selectedProjectId,
      name,
      frequency,
      recipients: emailList,
      config: {
        format: "pdf",
        includeCharts: true,
      },
      nextRunAt: nextRunTimestamp,
    });
  };

  const handleToggleEnabled = (schedule: any) => {
    updateMutation.mutate({
      id: schedule.id,
      enabled: !schedule.enabled,
    });
  };

  const handleDelete = (scheduleId: number) => {
    if (confirm("Tem certeza que deseja deletar este agendamento?")) {
      deleteMutation.mutate({ id: scheduleId });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR");
  };

  const getFrequencyLabel = (freq: string) => {
    return freq === "weekly" ? "Semanal" : "Mensal";
  };

  if (!selectedProjectId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-slate-600">
              Selecione um projeto para gerenciar agendamentos
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-500" />
            Agendamentos de Relatórios
          </h1>
          <p className="text-slate-600 mt-1">
            Configure envios automáticos de relatórios territoriais por email
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Lista de Agendamentos */}
      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-slate-600">
              Carregando agendamentos...
            </p>
          </CardContent>
        </Card>
      ) : schedules && schedules.length > 0 ? (
        <div className="grid gap-4">
          {schedules.map((schedule: any) => (
            <Card
              key={schedule.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      {schedule.name}
                      {schedule.enabled ? (
                        <Badge variant="default" className="bg-green-500">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pausado</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Frequência: {getFrequencyLabel(schedule.frequency)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleEnabled(schedule)}
                      title={schedule.enabled ? "Pausar" : "Ativar"}
                    >
                      {schedule.enabled ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(schedule.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span>Destinatários: {schedule.recipients.join(", ")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    Próxima execução: {formatDate(schedule.nextRunAt)}
                  </span>
                </div>
                {schedule.lastRunAt && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Última execução: {formatDate(schedule.lastRunAt)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto" />
              <div>
                <p className="text-lg font-medium text-slate-900">
                  Nenhum agendamento configurado
                </p>
                <p className="text-slate-600 mt-1">
                  Crie seu primeiro agendamento para receber relatórios
                  automaticamente
                </p>
              </div>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Primeiro Agendamento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Criação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Novo Agendamento de Relatório</DialogTitle>
            <DialogDescription>
              Configure o envio automático de relatórios territoriais por email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Agendamento *</Label>
              <Input
                id="name"
                placeholder="Ex: Relatório Semanal de Vendas"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência *</Label>
              <Select
                value={frequency}
                onValueChange={(v: any) => setFrequency(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipients">
                Destinatários (emails separados por vírgula) *
              </Label>
              <Input
                id="recipients"
                placeholder="email1@example.com, email2@example.com"
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Separe múltiplos emails com vírgula
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextRunDate">Data da Primeira Execução *</Label>
              <Input
                id="nextRunDate"
                type="datetime-local"
                value={nextRunDate}
                onChange={e => setNextRunDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Criando..." : "Criar Agendamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
