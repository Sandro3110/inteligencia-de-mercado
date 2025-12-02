import { Link } from 'wouter';
import { trpc } from '../../lib/trpc';
import { useState } from 'react';
import { toast } from 'sonner';
import { FolderKanban, Plus, Archive, Check, Trash2, Search as SearchIcon } from 'lucide-react';
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

export default function ProjetosPage() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo' | 'arquivado' | undefined>();

  const { data, isLoading, error, refetch } = trpc.projetos.list.useQuery({
    page,
    limit: 20,
    busca: busca || undefined,
    status,
    orderBy: 'created_at',
    orderDirection: 'desc',
  });

  const deleteMutation = trpc.projetos.delete.useMutation({
    onSuccess: () => {
      toast.success('Projeto deletado com sucesso!');
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao deletar projeto', {
        description: error.message
      });
    },
  });

  const archiveMutation = trpc.projetos.archive.useMutation({
    onSuccess: () => {
      toast.success('Projeto arquivado com sucesso!');
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao arquivar projeto', {
        description: error.message
      });
    },
  });

  const activateMutation = trpc.projetos.activate.useMutation({
    onSuccess: () => {
      toast.success('Projeto ativado com sucesso!');
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao ativar projeto', {
        description: error.message
      });
    },
  });

  const handleDelete = (id: number, nome: string) => {
    if (confirm(`Tem certeza que deseja deletar o projeto "${nome}"? Esta ação não pode ser desfeita.`)) {
      toast.promise(
        deleteMutation.mutateAsync({ id }),
        {
          loading: 'Deletando projeto...',
          success: 'Projeto deletado!',
          error: 'Erro ao deletar'
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Carregando projetos..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar projetos"
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Projetos"
        description="Gerencie seus projetos de inteligência de mercado"
        icon={FolderKanban}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Projetos' }
        ]}
        actions={
          <Link href="/projetos/novo">
            <a>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
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
              placeholder="Buscar projetos por nome ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={status || 'all'}
            onValueChange={(value) => setStatus(value === 'all' ? undefined : value as any)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="arquivado">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {!data?.projetos || data.projetos.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Nenhum projeto encontrado"
            description="Comece criando seu primeiro projeto para organizar suas análises de mercado."
            action={{
              label: 'Criar Primeiro Projeto',
              onClick: () => window.location.href = '/projetos/novo'
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-sm">Nome</th>
                  <th className="text-left p-4 font-semibold text-sm">Código</th>
                  <th className="text-left p-4 font-semibold text-sm">Status</th>
                  <th className="text-left p-4 font-semibold text-sm">Centro de Custo</th>
                  <th className="text-left p-4 font-semibold text-sm">Criado em</th>
                  <th className="text-right p-4 font-semibold text-sm">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.projetos.map((projeto) => (
                  <tr 
                    key={projeto.id} 
                    className="border-b last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium">{projeto.nome}</div>
                      {projeto.descricao && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {projeto.descricao}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {projeto.codigo || '-'}
                      </code>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          projeto.status === 'ativo' 
                            ? 'default' 
                            : projeto.status === 'inativo'
                            ? 'secondary'
                            : 'outline'
                        }
                        className={
                          projeto.status === 'ativo'
                            ? 'bg-success hover:bg-success/90'
                            : projeto.status === 'arquivado'
                            ? 'bg-warning hover:bg-warning/90'
                            : ''
                        }
                      >
                        {projeto.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {projeto.centro_custo || '-'}
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">
                      {new Date(projeto.created_at!).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {projeto.status === 'ativo' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => archiveMutation.mutate({ id: projeto.id })}
                            title="Arquivar projeto"
                            disabled={archiveMutation.isPending}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                        {projeto.status !== 'ativo' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => activateMutation.mutate({ id: projeto.id })}
                            title="Ativar projeto"
                            disabled={activateMutation.isPending}
                            className="text-success hover:text-success hover:bg-success/10"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(projeto.id, projeto.nome)}
                          title="Deletar projeto"
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
            <span className="font-medium">{data.total}</span> projetos
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
