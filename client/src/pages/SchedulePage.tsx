import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { Calendar, Clock, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export default function SchedulePage() {
  const { selectedProjectId } = useSelectedProject();
  const [showForm, setShowForm] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [recurrence, setRecurrence] = useState<"once" | "daily" | "weekly">(
    "once"
  );
  const [batchSize, setBatchSize] = useState("50");

  const { data: schedules, refetch } = trpc.schedule.list.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  const createMutation = trpc.schedule.create.useMutation({
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso!");
      setShowForm(false);
      setScheduledAt("");
      setRecurrence("once");
      setBatchSize("50");
      refetch();
    },
    onError: error => {
      toast.error(`Erro ao criar agendamento: ${error.message}`);
    },
  });

  const cancelMutation = trpc.schedule.cancel.useMutation({
    onSuccess: () => {
      toast.success("Agendamento cancelado!");
      refetch();
    },
  });

  const deleteMutation = trpc.schedule.delete.useMutation({
    onSuccess: () => {
      toast.success("Agendamento excluído!");
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !scheduledAt) return;

    createMutation.mutate({
      projectId: selectedProjectId,
      scheduledAt,
      recurrence,
      batchSize: parseInt(batchSize),
    });
  };

  function getRecurrenceLabel(rec: string) {
    const labels: Record<string, string> = {
      once: "Uma vez",
      daily: "Diário",
      weekly: "Semanal",
    };
    return labels[rec] || rec;
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      pending: "Pendente",
      running: "Executando",
      completed: "Concluído",
      cancelled: "Cancelado",
      error: "Erro",
    };
    return labels[status] || status;
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      pending: "bg-blue-100 text-blue-800",
      running: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
      error: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }

  return (
    <div className="min-h-screen ml-60 bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Agendamentos" }]} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Agendamentos de Enriquecimento
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure execuções automáticas de enriquecimento
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Novo Agendamento
              </>
            )}
          </Button>
        </div>

        {/* Formulário de Criação */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Agendamento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduledAt">Data e Hora</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={e => setScheduledAt(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="recurrence">Recorrência</Label>
                    <Select
                      value={recurrence}
                      onValueChange={(v: any) => setRecurrence(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Uma vez</SelectItem>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="batchSize">Tamanho do Lote</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      value={batchSize}
                      onChange={e => setBatchSize(e.target.value)}
                      min="1"
                      max="200"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending
                    ? "Criando..."
                    : "Criar Agendamento"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {!schedules || schedules.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhum agendamento criado ainda
              </div>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule: any) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {new Date(schedule.scheduledAt).toLocaleString(
                            "pt-BR"
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getRecurrenceLabel(schedule.recurrence)} • Lote:{" "}
                          {schedule.batchSize}
                        </div>
                        {schedule.lastRunAt && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Última execução:{" "}
                            {new Date(schedule.lastRunAt).toLocaleString(
                              "pt-BR"
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          schedule.status
                        )}`}
                      >
                        {getStatusLabel(schedule.status)}
                      </span>
                      {schedule.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            cancelMutation.mutate({ id: schedule.id })
                          }
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          deleteMutation.mutate({ id: schedule.id })
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
