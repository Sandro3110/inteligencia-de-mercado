import { Link } from 'wouter';
import { trpc } from '../lib/trpc';

export default function HomePage() {
  const { data: projetos } = trpc.projetos.listAtivos.useQuery();
  const { data: pesquisasEmProgresso } = trpc.pesquisas.listEmProgresso.useQuery();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de inteligência de mercado
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Projetos Ativos</p>
              <p className="text-3xl font-bold">{projetos?.length || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pesquisas em Andamento</p>
              <p className="text-3xl font-bold">{pesquisasEmProgresso?.length || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Banco de Dados</p>
              <p className="text-3xl font-bold">5.570</p>
              <p className="text-xs text-muted-foreground">cidades brasileiras</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/projetos/novo">
            <a className="flex flex-col items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-medium">Novo Projeto</p>
                <p className="text-xs text-muted-foreground">Criar projeto</p>
              </div>
            </a>
          </Link>

          <Link href="/pesquisas/novo">
            <a className="flex flex-col items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-medium">Nova Pesquisa</p>
                <p className="text-xs text-muted-foreground">Iniciar pesquisa</p>
              </div>
            </a>
          </Link>

          <Link href="/importacao">
            <a className="flex flex-col items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-medium">Importar Dados</p>
                <p className="text-xs text-muted-foreground">Upload CSV/Excel</p>
              </div>
            </a>
          </Link>

          <Link href="/enriquecimento">
            <a className="flex flex-col items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors">
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-medium">Enriquecer com IA</p>
                <p className="text-xs text-muted-foreground">Processar dados</p>
              </div>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
