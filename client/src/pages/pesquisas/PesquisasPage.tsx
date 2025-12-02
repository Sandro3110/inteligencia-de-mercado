import { Link } from 'wouter';
import { trpc } from '../../lib/trpc';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PesquisasPage() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState<
    'pendente' | 'em_progresso' | 'concluida' | 'falhou' | 'cancelada' | undefined
  >();

  const { data, isLoading, refetch } = trpc.pesquisas.list.useQuery({
    page,
    limit: 20,
    busca: busca || undefined,
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
      toast.error(`Erro ao deletar: ${error.message}`);
    },
  });

  const startMutation = trpc.pesquisas.start.useMutation({
    onSuccess: () => {
      toast.success('Pesquisa iniciada!');
      refetch();
    },
  });

  const cancelMutation = trpc.pesquisas.cancel.useMutation({
    onSuccess: () => {
      toast.success('Pesquisa cancelada!');
      refetch();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-gray-500/10 text-gray-500';
      case 'em_progresso':
        return 'bg-blue-500/10 text-blue-500';
      case 'concluida':
        return 'bg-green-500/10 text-green-500';
      case 'falhou':
        return 'bg-red-500/10 text-red-500';
      case 'cancelada':
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pesquisas</h1>
          <p className="text-muted-foreground">
            Gerencie suas pesquisas de inteligência de mercado
          </p>
        </div>
        <Link href="/pesquisas/novo">
          <a className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nova Pesquisa
          </a>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar pesquisas..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg bg-background"
        />
        <select
          value={status || ''}
          onChange={(e) =>
            setStatus(
              e.target.value as
                | 'pendente'
                | 'em_progresso'
                | 'concluida'
                | 'falhou'
                | 'cancelada'
                | undefined
            )
          }
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="em_progresso">Em Progresso</option>
          <option value="concluida">Concluída</option>
          <option value="falhou">Falhou</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : !data?.pesquisas || data.pesquisas.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma pesquisa encontrada</p>
            <Link href="/pesquisas/novo">
              <a className="text-primary hover:underline">Criar primeira pesquisa</a>
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-medium">Nome</th>
                <th className="text-left p-4 font-medium">Projeto</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Entidades</th>
                <th className="text-left p-4 font-medium">Criado em</th>
                <th className="text-right p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.pesquisas.map((pesquisa) => (
                <tr key={pesquisa.id} className="border-b last:border-0 hover:bg-accent/50">
                  <td className="p-4 font-medium">{pesquisa.nome}</td>
                  <td className="p-4 text-muted-foreground">Projeto #{pesquisa.projeto_id}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        pesquisa.status
                      )}`}
                    >
                      {pesquisa.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {pesquisa.total_entidades || 0}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(pesquisa.created_at!).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {pesquisa.status === 'pendente' && (
                        <button
                          onClick={() => startMutation.mutate({ id: pesquisa.id })}
                          className="p-2 hover:bg-accent rounded"
                          title="Iniciar"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      )}
                      {pesquisa.status === 'em_progresso' && (
                        <button
                          onClick={() => cancelMutation.mutate({ id: pesquisa.id })}
                          className="p-2 hover:bg-accent rounded"
                          title="Cancelar"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja deletar esta pesquisa?')) {
                            deleteMutation.mutate({ id: pesquisa.id });
                          }
                        }}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded"
                        title="Deletar"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.total > 20 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * 20 + 1} a {Math.min(page * 20, data.total)} de {data.total}{' '}
            pesquisas
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= data.total}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
