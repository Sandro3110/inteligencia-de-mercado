/**
 * Aba de Atividades - Dashboard de Atividade de Projetos
 * Monitora atividade e inatividade dos projetos
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  Moon, 
  AlertCircle, 
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  Trash2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PostponeHibernationDialog } from '@/components/PostponeHibernationDialog';

export function ActivityTab() {
  const [selectedPeriod, setSelectedPeriod] = useState<30 | 60 | 90>(30);
  const [postponeDialogOpen, setPostponeDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{ id: number; nome: string } | null>(null);
  const utils = trpc.useUtils();

  const { data: activityData, isLoading } = trpc.projects.getActivity.useQuery();
  
  const autoHibernateMutation = trpc.projects.autoHibernate.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.hibernated} projeto(s) hibernado(s) com sucesso!`);
      utils.projects.getActivity.invalidate();
      utils.projects.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao hibernar projetos: ${error.message}`);
    }
  });

  const postponeMutation = trpc.projects.postponeHibernation.useMutation({
    onSuccess: () => {
      toast.success(`Hibernação adiada com sucesso!`);
      utils.projects.getActivity.invalidate();
      utils.projects.list.invalidate();
      setPostponeDialogOpen(false);
      setSelectedProject(null);
    },
    onError: (error) => {
      toast.error(`Erro ao adiar hibernação: ${error.message}`);
    }
  });

  const handleAutoHibernate = () => {
    if (!confirm(`Deseja hibernar todos os projetos inativos há mais de ${selectedPeriod} dias?`)) {
      return;
    }
    autoHibernateMutation.mutate({ days: selectedPeriod });
  };

  const handlePostpone = (projectId: number, projectName: string) => {
    setSelectedProject({ id: projectId, nome: projectName });
    setPostponeDialogOpen(true);
  };

  const handleConfirmPostpone = (days: number) => {
    if (!selectedProject) return;
    postponeMutation.mutate({ projectId: selectedProject.id, postponeDays: days });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'updated': return <FileEdit className="h-4 w-4 text-blue-600" />;
      case 'hibernated': return <Moon className="h-4 w-4 text-purple-600" />;
      case 'reactivated': return <RefreshCw className="h-4 w-4 text-green-600" />;
      case 'deleted': return <Trash2 className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: 'Criado',
      updated: 'Atualizado',
      hibernated: 'Hibernado',
      reactivated: 'Reativado',
      deleted: 'Deletado'
    };
    return labels[action] || action;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando atividades...</p>
        </div>
      </div>
    );
  }

  if (!activityData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Nenhum dado de atividade disponível</p>
      </div>
    );
  }

  const inactiveCount = selectedPeriod === 30 
    ? activityData.inactiveProjects30 
    : selectedPeriod === 60 
    ? activityData.inactiveProjects60 
    : activityData.inactiveProjects90;

  const inactiveProjects = activityData.projectsWithActivity.filter(p => {
    if (p.status !== 'active') return false;
    return p.hasWarning || (p.daysSinceActivity && p.daysSinceActivity >= selectedPeriod);
  });

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityData.totalProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os projetos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activityData.activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((activityData.activeProjects / activityData.totalProjects) * 100).toFixed(0)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Hibernados</CardTitle>
            <Moon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{activityData.hibernatedProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((activityData.hibernatedProjects / activityData.totalProjects) * 100).toFixed(0)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos ({selectedPeriod}+ dias)</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{inactiveCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sem atividade recente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Controle de Inatividade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Período de Inatividade
              </label>
              <Select
                value={selectedPeriod.toString()}
                onValueChange={(v) => setSelectedPeriod(parseInt(v) as 30 | 60 | 90)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="60">60 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Ação em Lote
              </label>
              <Button
                onClick={handleAutoHibernate}
                disabled={autoHibernateMutation.isPending || inactiveCount === 0}
                variant="outline"
                className="w-full"
              >
                {autoHibernateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Moon className="h-4 w-4 mr-2" />
                Hibernar Inativos ({inactiveCount})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Projetos Inativos */}
      {inactiveProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Projetos Inativos (últimos {selectedPeriod} dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{project.nome}</h4>
                      {project.hasWarning && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Aviso Pendente
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {project.daysSinceActivity} dias sem atividade
                      </span>
                      {project.lastActivityAt && (
                        <span>
                          Última atividade: {formatDistanceToNow(new Date(project.lastActivityAt), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePostpone(project.id, project.nome)}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Adiar Hibernação
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}



      {/* Dialog de Adiamento */}
      <PostponeHibernationDialog
        open={postponeDialogOpen}
        onOpenChange={setPostponeDialogOpen}
        projectName={selectedProject?.nome || ''}
        onConfirm={handleConfirmPostpone}
        isLoading={postponeMutation.isPending}
      />
    </div>
  );
}
