/**
 * Aba de Agendamentos - Agendamento de Pesquisas Automáticas
 * Migrado de SchedulePage.tsx
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { Calendar, Clock, Trash2, X, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ScheduleTab() {
  const { selectedProjectId } = useSelectedProject();
  const [showForm, setShowForm] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [recurrence, setRecurrence] = useState<'once' | 'daily' | 'weekly'>('once');
  const [batchSize, setBatchSize] = useState('50');

  const { data: schedules, refetch, isLoading } = trpc.schedule.list.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  const createMutation = trpc.schedule.create.useMutation({
    onSuccess: () => {
      toast.success('Agendamento criado com sucesso!');
      setShowForm(false);
      setScheduledAt('');
      setRecurrence('once');
      setBatchSize('50');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao criar agendamento: ${error.message}`);
    },
  });

  const cancelMutation = trpc.schedule.cancel.useMutation({
    onSuccess: () => {
      toast.success('Agendamento cancelado!');
      refetch();
    },
  });

  const deleteMutation = trpc.schedule.delete.useMutation({
    onSuccess: () => {
      toast.success('Agendamento excluído!');
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !scheduledAt) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    createMutation.mutate({
      projectId: selectedProjectId,
      scheduledAt,
      recurrence,
      batchSize: parseInt(batchSize),
    });
  };

  function getRecurrenceLabel(rec: string) {
    const labels: Record<string, string> = {
      once: 'Uma vez',
      daily: 'Diário',
      weekly: 'Semanal',
    };
    return labels[rec] || rec;
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      running: 'Executando',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      error: 'Erro',
    };
    return labels[status] || status;
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      pending: 'bg-blue-100 text-blue-800',
      running: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  if (!selectedProjectId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Selecione um projeto para gerenciar agendamentos
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Agendamentos de Pesquisas</h3>
          <p className="text-sm text-muted-foreground">
            Agende execuções automáticas de pesquisas
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          {showForm ? (
            <>
              <X className="w-4 h-4" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Novo Agendamento
            </>
          )}
        </Button>
      </div>

      {/* Formulário de Criação */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Data e Hora *</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurrence">Recorrência *</Label>
                  <Select value={recurrence} onValueChange={(v: any) => setRecurrence(v)}>
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

                <div className="space-y-2">
                  <Label htmlFor="batchSize">Tamanho do Lote</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    min="1"
                    max="1000"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Criar Agendamento
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Agendamentos */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !schedules || schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum agendamento encontrado
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {schedules.map((schedule: any) => (
            <Card key={schedule.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(schedule.status)}>
                        {getStatusLabel(schedule.status)}
                      </Badge>
                      <Badge variant="outline">{getRecurrenceLabel(schedule.recurrence)}</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(schedule.scheduledAt).toLocaleString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDistanceToNow(new Date(schedule.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">Tamanho do lote:</span> {schedule.batchSize}
                    </div>

                    {schedule.executedAt && (
                      <div className="text-sm text-muted-foreground">
                        Executado em: {new Date(schedule.executedAt).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {schedule.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelMutation.mutate(schedule.id)}
                        disabled={cancelMutation.isPending}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(schedule.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
