import { Link } from 'wouter';
import { trpc } from '../../lib/trpc';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ProjetosPage() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo' | 'arquivado' | undefined>();

  const { data, isLoading, refetch } = trpc.projetos.list.useQuery({
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
      toast.error(`Erro ao deletar: ${error.message}`);
    },
  });

  const archiveMutation = trpc.projetos.archive.useMutation({
    onSuccess: () => {
      toast.success('Projeto arquivado!');
      refetch();
    },
  });

  const activateMutation = trpc.projetos.activate.useMutation({
    onSuccess: () => {
      toast.success('Projeto ativado!');
      refetch();
    },
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projetos</h1>
          <p className="text-muted-foreground">
            Gerencie seus projetos de inteligência de mercado
          </p>
        </div>
        <Link href="/projetos/novo">
          <a className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Novo Projeto
          </a>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar projetos..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg bg-background"
        />
        <select
          value={status || ''}
          onChange={(e) =>
            setStatus(e.target.value as 'ativo' | 'inativo' | 'arquivado' | undefined)
          }
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="arquivado">Arquivado</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : !data?.projetos || data.projetos.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Nenhum projeto encontrado</p>
            <Link href="/projetos/novo">
              <a className="text-primary hover:underline">Criar primeiro projeto</a>
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-medium">Nome</th>
                <th className="text-left p-4 font-medium">Código</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Centro de Custo</th>
                <th className="text-left p-4 font-medium">Criado em</th>
                <th className="text-right p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.projetos.map((projeto) => (
                <tr key={projeto.id} className="border-b last:border-0 hover:bg-accent/50">
                  <td className="p-4 font-medium">{projeto.nome}</td>
                  <td className="p-4 text-muted-foreground">{projeto.codigo || '-'}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        projeto.status === 'ativo'
                          ? 'bg-green-500/10 text-green-500'
                          : projeto.status === 'inativo'
                          ? 'bg-gray-500/10 text-gray-500'
                          : 'bg-orange-500/10 text-orange-500'
                      }`}
                    >
                      {projeto.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {projeto.centro_custo || '-'}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(projeto.created_at!).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {projeto.status === 'ativo' && (
                        <button
                          onClick={() => archiveMutation.mutate({ id: projeto.id })}
                          className="p-2 hover:bg-accent rounded"
                          title="Arquivar"
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
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                            />
                          </svg>
                        </button>
                      )}
                      {projeto.status !== 'ativo' && (
                        <button
                          onClick={() => activateMutation.mutate({ id: projeto.id })}
                          className="p-2 hover:bg-accent rounded"
                          title="Ativar"
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja deletar este projeto?')) {
                            deleteMutation.mutate({ id: projeto.id });
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
            projetos
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
