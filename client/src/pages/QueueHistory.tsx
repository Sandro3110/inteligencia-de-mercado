import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { DateRangePicker, DateRange } from '@/components/DateRangePicker';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function QueueHistory() {
  const { selectedProjectId } = useSelectedProject();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data, isLoading, refetch } = trpc.queue.history.useQuery({
    projectId: selectedProjectId || undefined,
    status: statusFilter === 'all' ? undefined : (statusFilter as any),
    dateFrom: dateRange?.from,
    dateTo: dateRange?.to,
    page,
    pageSize,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', icon: Clock, color: 'text-yellow-500' },
      processing: { variant: 'default', icon: Loader2, color: 'text-blue-500' },
      completed: { variant: 'default', icon: CheckCircle2, color: 'text-green-500' },
      error: { variant: 'destructive', icon: XCircle, color: 'text-red-500' },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status === 'pending' && 'Pendente'}
        {status === 'processing' && 'Processando'}
        {status === 'completed' && 'Concluído'}
        {status === 'error' && 'Erro'}
      </Badge>
    );
  };

  const formatDuration = (start?: Date | null, end?: Date | null) => {
    if (!start || !end) return '-';
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(duration / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Visualize todos os jobs processados na fila
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Jobs ({data?.total || 0})
          </CardTitle>
          <CardDescription>
            Página {page} de {data?.totalPages || 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum job encontrado
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Criado</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Tentativas</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((job: any) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-sm">
                        #{job.id}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(job.status)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {job.clienteData?.nome || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {job.createdAt
                          ? formatDistanceToNow(new Date(job.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })
                          : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDuration(job.startedAt, job.completedAt)}
                      </TableCell>
                      <TableCell>
                        {job.retryCount > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {job.retryCount}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {job.status === 'error' && job.errorMessage && (
                          <div className="max-w-xs truncate text-sm text-red-600">
                            {job.errorMessage}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {((page - 1) * pageSize) + 1} a{' '}
                  {Math.min(page * pageSize, data.total)} de {data.total} jobs
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= (data.totalPages || 1)}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
