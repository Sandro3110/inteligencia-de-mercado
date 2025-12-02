import { Link } from 'wouter';
import { 
  FolderKanban, 
  Search, 
  Upload, 
  Sparkles,
  TrendingUp,
  Database,
  Activity
} from 'lucide-react';
import { trpc } from '../lib/trpc';
import { CardSkeleton } from '@/components/CardSkeleton';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';

export default function HomePage() {
  const { data: projetos, isLoading: loadingProjetos, error: errorProjetos, refetch: refetchProjetos } = trpc.projetos.listAtivos.useQuery();
  const { data: pesquisasEmProgresso, isLoading: loadingPesquisas, error: errorPesquisas } = trpc.pesquisas.listEmProgresso.useQuery();

  const isLoading = loadingProjetos || loadingPesquisas;
  const hasError = errorProjetos || errorPesquisas;

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Dashboard"
          description="Visão geral do sistema de inteligência de mercado"
          icon={Activity}
        />
        <CardSkeleton count={3} variant="stat" />
        <div className="mt-6">
          <CardSkeleton count={4} variant="default" />
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <ErrorState
        title="Erro ao carregar dashboard"
        message={errorProjetos?.message || errorPesquisas?.message || "Não foi possível carregar os dados do dashboard."}
        onRetry={refetchProjetos}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Visão geral do sistema de inteligência de mercado"
        icon={Activity}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Projetos Ativos"
          value={projetos?.length || 0}
          icon={FolderKanban}
          color="primary"
          change={12}
          trend="up"
        />

        <StatCard
          title="Pesquisas em Andamento"
          value={pesquisasEmProgresso?.length || 0}
          icon={Search}
          color="secondary"
          change={8}
          trend="up"
        />

        <StatCard
          title="Cidades no Banco"
          value="5.570"
          icon={Database}
          color="success"
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Ações Rápidas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/projetos/novo">
            <a className="group">
              <Card className="p-6 hover-lift cursor-pointer transition-all border-2 hover:border-primary">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FolderKanban className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Novo Projeto</p>
                    <p className="text-xs text-muted-foreground">Criar projeto de análise</p>
                  </div>
                </div>
              </Card>
            </a>
          </Link>

          <Link href="/pesquisas/novo">
            <a className="group">
              <Card className="p-6 hover-lift cursor-pointer transition-all border-2 hover:border-secondary">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search className="h-7 w-7 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Nova Pesquisa</p>
                    <p className="text-xs text-muted-foreground">Iniciar pesquisa de mercado</p>
                  </div>
                </div>
              </Card>
            </a>
          </Link>

          <Link href="/importacao">
            <a className="group">
              <Card className="p-6 hover-lift cursor-pointer transition-all border-2 hover:border-info">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-info/10 to-info/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="h-7 w-7 text-info" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Importar Dados</p>
                    <p className="text-xs text-muted-foreground">Upload CSV/Excel</p>
                  </div>
                </div>
              </Card>
            </a>
          </Link>

          <Link href="/enriquecimento">
            <a className="group">
              <Card className="p-6 hover-lift cursor-pointer transition-all border-2 hover:border-warning">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="h-7 w-7 text-warning" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Processar com IA</p>
                    <p className="text-xs text-muted-foreground">Enriquecer dados</p>
                  </div>
                </div>
              </Card>
            </a>
          </Link>
        </div>
      </Card>

      {/* Recent Activity */}
      {projetos && projetos.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Projetos Recentes</h2>
          <div className="space-y-4">
            {projetos.slice(0, 5).map((projeto) => (
              <Link key={projeto.id} href={`/projetos/${projeto.id}`}>
                <a className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                      <FolderKanban className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{projeto.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {projeto.descricao || 'Sem descrição'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver Detalhes
                  </Button>
                </a>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
