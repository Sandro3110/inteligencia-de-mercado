import { useParams, useLocation, Link } from 'wouter';
import { trpc } from '../../lib/trpc';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';
import { ArrowLeft, Play, Pause, XCircle, Trash2, Calendar, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_MAP = {
  pendente: { label: 'Pendente', variant: 'secondary' as const, icon: AlertCircle },
  em_progresso: { label: 'Em Progresso', variant: 'default' as const, icon: TrendingUp },
  concluida: { label: 'Concluída', variant: 'success' as const, icon: Target },
  falhou: { label: 'Falhou', variant: 'destructive' as const, icon: XCircle },
  cancelada: { label: 'Cancelada', variant: 'outline' as const, icon: Pause },
};

export default function PesquisaDetalhesPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const pesquisaId = parseInt(params.id || '0');

  const { data: pesquisa, isLoading, error, refetch } = trpc.pesquisas.getById.useQuery(
    { id: pesquisaId },
    { enabled: !!pesquisaId }
  );

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

  const deleteMutation = trpc.pesquisas.delete.useMutation({
    onSuccess: () => {
      toast.success('Pesquisa deletada com sucesso!');
      navigate('/pesquisas');
    },
    onError: (error) => {
      toast.error('Erro ao deletar pesquisa', {
        description: error.message
      });
    },
  });

  const handleStart = () => {
    if (confirm('Deseja iniciar esta pesquisa?')) {
      startMutation.mutate({ id: pesquisaId });
    }
  };

  const handleCancel = () => {
    if (confirm('Deseja cancelar esta pesquisa?')) {
      cancelMutation.mutate({ id: pesquisaId });
    }
  };

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja deletar a pesquisa "${pesquisa?.nome}"?`)) {
      deleteMutation.mutate({ id: pesquisaId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !pesquisa) {
    return (
      <ErrorState
        title="Erro ao carregar pesquisa"
        message={error?.message || 'Pesquisa não encontrada'}
        action={{
          label: 'Voltar para pesquisas',
          onClick: () => navigate('/pesquisas')
        }}
      />
    );
  }

  const statusInfo = STATUS_MAP[pesquisa.status as keyof typeof STATUS_MAP] || STATUS_MAP.pendente;
  const StatusIcon = statusInfo.icon;

  const canStart = pesquisa.status === 'pendente';
  const canCancel = pesquisa.status === 'em_progresso';
  const canDelete = pesquisa.status !== 'em_progresso';

  return (
    <div className="space-y-6">
      <PageHeader
        title={pesquisa.nome}
        description={pesquisa.descricao || 'Detalhes da pesquisa'}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/pesquisas">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            
            {canStart && (
              <Button 
                size="sm" 
                onClick={handleStart}
                disabled={startMutation.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar
              </Button>
            )}
            
            {canCancel && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                <Pause className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
            
            {canDelete && (
              <Button 
                size="sm" 
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informações Básicas */}
        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={statusInfo.variant} className="gap-1.5">
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusInfo.label}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Projeto</label>
              <p className="mt-1 font-medium">
                {pesquisa.projeto_nome || 'N/A'}
                {pesquisa.projeto_codigo && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({pesquisa.projeto_codigo})
                  </span>
                )}
              </p>
            </div>

            {pesquisa.objetivo && (
              <div>
                <label className="text-sm text-muted-foreground">Objetivo</label>
                <p className="mt-1">{pesquisa.objetivo}</p>
              </div>
            )}

            {pesquisa.descricao && (
              <div>
                <label className="text-sm text-muted-foreground">Descrição</label>
                <p className="mt-1 text-sm">{pesquisa.descricao}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Criada em
                </label>
                <p className="mt-1 text-sm">
                  {new Date(pesquisa.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
              
              {pesquisa.started_at && (
                <div>
                  <label className="text-sm text-muted-foreground">Iniciada em</label>
                  <p className="mt-1 text-sm">
                    {new Date(pesquisa.started_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
              
              {pesquisa.completed_at && (
                <div>
                  <label className="text-sm text-muted-foreground">Concluída em</label>
                  <p className="mt-1 text-sm">
                    {new Date(pesquisa.completed_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
              
              {pesquisa.duration_seconds && (
                <div>
                  <label className="text-sm text-muted-foreground">Duração</label>
                  <p className="mt-1 text-sm">
                    {Math.floor(pesquisa.duration_seconds / 60)} minutos
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Métricas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Métricas</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Total de Entidades</label>
              <p className="mt-1 text-2xl font-bold">{pesquisa.total_entidades || 0}</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Enriquecidas</label>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {pesquisa.entidades_enriquecidas || 0}
              </p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Falhadas</label>
              <p className="mt-1 text-2xl font-bold text-red-600">
                {pesquisa.entidades_falhadas || 0}
              </p>
            </div>

            {pesquisa.qualidade_media !== null && (
              <div className="pt-4 border-t">
                <label className="text-sm text-muted-foreground">Qualidade Média</label>
                <p className="mt-1 text-2xl font-bold">
                  {(pesquisa.qualidade_media * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Mensagem de Erro */}
      {pesquisa.error_message && (
        <Card className="p-6 border-destructive">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Erro na Execução</h3>
              <p className="text-sm text-muted-foreground">{pesquisa.error_message}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
