import { Link } from 'wouter';
import { trpc } from '../../lib/trpc';
import { useState } from 'react';
import { TableSkeleton } from '@/components/TableSkeleton';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { toast } from 'sonner';
import { Search as SearchIcon, Plus, Play, X as XIcon, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PesquisaStatus = 'pendente' | 'em_progresso' | 'concluida' | 'falhou' | 'cancelada';

export default function PesquisasPage() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const debouncedBusca = useDebouncedValue(busca, 500);
  const [status, setStatus] = useState<PesquisaStatus | undefined>();

  const { data, isLoading, error, refetch } = trpc.pesquisas.list.useQuery({
    page,
    limit: 20,
    busca: debouncedBusca || undefined,
    status,
    orderBy: 'created_at',
    orderDirection: 'desc',
  });

  const deleteMutation = trpc.pesquisas.delete.useMutation({
    onSuccess: () => {
      toast.success('Pesquisa deletada com sucesso!');
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao deletar pesquisa', {
        description: error.message
      });
    },
  });

  const startMutation = trpc.pesquisas.start.useMutation({
    onSuccess: () => {
      toast.success('Pesquisa iniciada com sucesso!');
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao iniciar pesquisa', {
        description: error.message
      });
    },
  });

  const cancelMutation = trpc.pesquisas.cancel.useMutation({
    onSuccess: () => {
      toast.success('Pesquisa cancelada!');
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao cancelar pesquisa', {
        description: error.message
      });
    },
  });

  const handleDelete = (id: number, nome: string) => {
    if (confirm(`Tem certeza que deseja deletar a pesquisa "${nome}"?`)) {
      toast.promise(
        deleteMutation.mutateAsync({ id }),
        {
          loading: 'Deletando pesquisa...',
          success: 'Pesquisa deletada!',
          error: 'Erro ao deletar'
        }
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string; label: string }> = {
      pendente: { variant: 'secondary', className: 'bg-muted', label: 'Pendente' },
      em_progresso: { variant: 'default', className: 'bg-info hover:bg-info/90', label: 'Em Progresso' },
      concluida: { variant: 'default', className: 'bg-success hover:bg-success/90', label: 'Concluída' },
      falhou: { variant: 'destructive', className: '', label: 'Falhou' },
      cancelada: { variant: 'default', className: 'bg-warning hover:bg-warning/90', label: 'Cancelada' }
    };

    const config = variants[status] || variants.pendente;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Pesquisas"
          description="Gerencie suas pesquisas de inteligência de mercado"
          icon={SearchIcon}
          breadcrumbs={[
            { label: 'Dashboard', path: '/' },
            { label: 'Pesquisas' }
          ]}
        />
        <TableSkeleton rows={6} columns={6} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar pesquisas"
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Pesquisas"
        description="Gerencie suas pesquisas de inteligência de mercado"
        icon={SearchIcon}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Pesquisas' }
        ]}
        actions={
          <Link href="/pesquisas/novo">
            <a>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Pesquisa
              </Button>
            </a>
          </Link>
        }
      />

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar pesquisas por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={status || 'all'}
            onValueChange={(value) => setStatus(value === 'all' ? undefined : value as PesquisaStatus)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em_progresso">Em Progresso</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
              <SelectItem value="falhou">Falhou</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {!data?.pesquisas || data.pesquisas.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title="Nenhuma pesquisa encontrada"
            description="Comece criando sua primeira pesquisa de mercado para coletar e analisar dados."
            action={{
              label: 'Criar Primeira Pesquisa',
              onClick: () => window.location.href = '/pesquisas/novo'
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-sm">Nome</th>
                  <th className="text-left p-4 font-semibold text-sm">Projeto</th>
                  <th className="text-left p-4 font-semibold text-sm">Status</th>
                  <th className="text-left p-4 font-semibold text-sm">Progresso</th>
                  <th className="text-left p-4 font-semibold text-sm">Criada em</th>
                  <th className="text-right p-4 font-semibold text-sm">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.pesquisas.map((pesquisa) => (
                  <tr 
                    key={pesquisa.id} 
                    className="border-b last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="p-4">
                      <Link href={`/pesquisas/${pesquisa.id}`}>
                        <a className="font-medium hover:text-primary hover:underline cursor-pointer">
                          {pesquisa.nome}
                        </a>
                      </Link>
                      {pesquisa.descricao && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {pesquisa.descricao}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {pesquisa.projeto?.nome || '-'}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(pesquisa.status)}
                    </td>
                    <td className="p-4">
                      {pesquisa.progresso !== null && pesquisa.progresso !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${pesquisa.progresso}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {pesquisa.progresso}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">
                      {new Date(pesquisa.created_at!).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {pesquisa.status === 'pendente' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startMutation.mutate({ id: pesquisa.id })}
                            title="Iniciar pesquisa"
                            disabled={startMutation.isPending}
                            className="text-success hover:text-success hover:bg-success/10"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {pesquisa.status === 'em_progresso' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => cancelMutation.mutate({ id: pesquisa.id })}
                            title="Cancelar pesquisa"
                            disabled={cancelMutation.isPending}
                            className="text-warning hover:text-warning hover:bg-warning/10"
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(pesquisa.id, pesquisa.nome)}
                          title="Deletar pesquisa"
                          disabled={deleteMutation.isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {data && data.total > 20 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium">{(page - 1) * 20 + 1}</span> a{' '}
            <span className="font-medium">{Math.min(page * 20, data.total)}</span> de{' '}
            <span className="font-medium">{data.total}</span> pesquisas
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= data.total}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
