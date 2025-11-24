/**
 * Aba de Automação - Agendamento de Relatórios Recorrentes
 * Migrado de ReportSchedules.tsx
 */

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
  Loader2,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AutomationTab() {
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
      config: {},
      nextRunAt: nextRunTimestamp,
    });
  };

  const handleEdit = (schedule: any) => {
    setEditingSchedule(schedule);
    setName(schedule.name);
    setFrequency(schedule.frequency);
    setRecipients(schedule.recipients.join(", "));
    setNextRunDate(new Date(schedule.nextRun).toISOString().slice(0, 16));
  };

  const handleUpdate = () => {
    if (!editingSchedule) return;

    if (!name || !recipients || !nextRunDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const emailList = recipients
      .split(",")
      .map(e => e.trim())
      .filter(Boolean);
    const nextRunTimestamp = new Date(nextRunDate)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    updateMutation.mutate({
      id: editingSchedule.id,
      name,
      frequency,
      recipients: emailList,
      nextRunAt: nextRunTimestamp,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este agendamento?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      weekly: "Semanal",
      monthly: "Mensal",
    };
    return labels[freq] || freq;
  };

  const getStatusBadge = (schedule: any) => {
    const now = new Date();
    const nextRun = new Date(schedule.nextRun);

    if (schedule.isActive) {
      if (nextRun > now) {
        return <Badge variant="default">Ativo</Badge>;
      } else {
        return <Badge variant="secondary">Aguardando execução</Badge>;
      }
    } else {
      return <Badge variant="outline">Inativo</Badge>;
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Selecione um projeto para gerenciar automações de relatórios
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Automação de Relatórios</h3>
          <p className="text-sm text-muted-foreground">
            Configure envio automático de relatórios por email
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Automação
        </Button>
      </div>

      {/* Lista de Agendamentos */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !schedules || schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma automação configurada</p>
            <p className="text-sm mt-2">
              Crie sua primeira automação de relatórios
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {schedules.map((schedule: any) => (
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
                          <Calendar className="w-3 h-3" />
                          {getFrequencyLabel(schedule.frequency)} - Próxima
                          execução:{" "}
                          {new Date(schedule.nextRun).toLocaleString("pt-BR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {schedule.recipients.length} destinatário(s)
                        </span>
                        {schedule.lastRun && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Última execução:{" "}
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(schedule)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(schedule.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Destinatários:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {schedule.recipients.map((email: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {email}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog: Criar Automação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Automação de Relatório</DialogTitle>
            <DialogDescription>
              Configure o envio automático de relatórios por email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Automação *</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Relatório Semanal de Vendas"
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
              <Label htmlFor="nextRun">Próxima Execução *</Label>
              <Input
                id="nextRun"
                type="datetime-local"
                value={nextRunDate}
                onChange={e => setNextRunDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipients">
                Destinatários (separados por vírgula) *
              </Label>
              <Input
                id="recipients"
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Adicione um ou mais emails separados por vírgula
              </p>
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
              {createMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Criar Automação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Automação */}
      <Dialog
        open={!!editingSchedule}
        onOpenChange={() => setEditingSchedule(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Automação</DialogTitle>
            <DialogDescription>
              Atualize as configurações da automação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Automação *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-frequency">Frequência *</Label>
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
              <Label htmlFor="edit-nextRun">Próxima Execução *</Label>
              <Input
                id="edit-nextRun"
                type="datetime-local"
                value={nextRunDate}
                onChange={e => setNextRunDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-recipients">Destinatários *</Label>
              <Input
                id="edit-recipients"
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSchedule(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
