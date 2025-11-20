import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Repeat, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleEnrichmentProps {
  projectId: number;
  onClose?: () => void;
}

export function ScheduleEnrichment({ projectId, onClose }: ScheduleEnrichmentProps) {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [recurrence, setRecurrence] = useState<'once' | 'daily' | 'weekly'>('once');
  const [batchSize, setBatchSize] = useState(50);
  const [maxClients, setMaxClients] = useState<number | undefined>();

  const utils = trpc.useUtils();
  const { data: schedules, isLoading } = trpc.enrichment.listSchedules.useQuery({ projectId });
  
  const createMutation = trpc.enrichment.createSchedule.useMutation({
    onSuccess: () => {
      toast.success('Agendamento criado com sucesso!');
      utils.enrichment.listSchedules.invalidate();
      // Reset form
      setScheduledDate('');
      setScheduledTime('');
      setRecurrence('once');
      setBatchSize(50);
      setMaxClients(undefined);
    },
    onError: (error) => {
      toast.error(`Erro ao criar agendamento: ${error.message}`);
    },
  });

  const cancelMutation = trpc.enrichment.cancelSchedule.useMutation({
    onSuccess: () => {
      toast.success('Agendamento cancelado');
      utils.enrichment.listSchedules.invalidate();
    },
  });

  const deleteMutation = trpc.enrichment.deleteSchedule.useMutation({
    onSuccess: () => {
      toast.success('Agendamento deletado');
      utils.enrichment.listSchedules.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduledDate || !scheduledTime) {
      toast.error('Por favor, preencha data e hora');
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
    
    if (scheduledAt < new Date()) {
      toast.error('Data/hora deve ser no futuro');
      return;
    }

    createMutation.mutate({
      projectId,
      scheduledAt,
      recurrence,
      batchSize,
      maxClients,
    });
  };

  const getRecurrenceLabel = (rec: string) => {
    const labels: Record<string, string> = {
      once: 'Única',
      daily: 'Diária',
      weekly: 'Semanal',
    };
    return labels[rec] || rec;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-blue-500/20 text-blue-400',
      running: 'bg-green-500/20 text-green-400',
      completed: 'bg-gray-500/20 text-gray-400',
      cancelled: 'bg-red-500/20 text-red-400',
      error: 'bg-red-500/20 text-red-400',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-6">
      {/* Form de Agendamento */}
      <Card className="bg-white/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl text-slate-100">Agendar Enriquecimento</CardTitle>
            <CardDescription>Configure quando e como executar o enriquecimento</CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  className="bg-slate-50 border-slate-700"
                />
              </div>

              {/* Hora */}
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Hora
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                  className="bg-slate-50 border-slate-700"
                />
              </div>

              {/* Recorrência */}
              <div className="space-y-2">
                <Label htmlFor="recurrence" className="flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Recorrência
                </Label>
                <Select value={recurrence} onValueChange={(v: any) => setRecurrence(v)}>
                  <SelectTrigger className="bg-slate-50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Única</SelectItem>
                    <SelectItem value="daily">Diária</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tamanho do Lote */}
              <div className="space-y-2">
                <Label htmlFor="batchSize">Tamanho do Lote</Label>
                <Input
                  id="batchSize"
                  type="number"
                  min={1}
                  max={100}
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  className="bg-slate-50 border-slate-700"
                />
              </div>

              {/* Máximo de Clientes */}
              <div className="space-y-2">
                <Label htmlFor="maxClients">Máximo de Clientes (opcional)</Label>
                <Input
                  id="maxClients"
                  type="number"
                  min={1}
                  value={maxClients || ''}
                  onChange={(e) => setMaxClients(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Todos"
                  className="bg-slate-50 border-slate-700"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Agendando...' : 'Agendar Enriquecimento'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      <Card className="bg-white/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl text-slate-100">Agendamentos Futuros</CardTitle>
          <CardDescription>Próximas execuções programadas</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-slate-400">Carregando...</div>
          ) : !schedules || schedules.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              Nenhum agendamento configurado
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule: any) => (
                <div 
                  key={schedule.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50/50 border border-slate-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(schedule.status)}`}>
                        {schedule.status}
                      </span>
                      <span className="text-slate-300">
                        {new Date(schedule.scheduledAt).toLocaleString('pt-BR')}
                      </span>
                      <span className="text-slate-500 text-sm">
                        • {getRecurrenceLabel(schedule.recurrence)}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                      Lote: {schedule.batchSize} clientes
                      {schedule.maxClients && ` • Máximo: ${schedule.maxClients}`}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {schedule.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelMutation.mutate({ id: schedule.id })}
                        disabled={cancelMutation.isPending}
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate({ id: schedule.id })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
