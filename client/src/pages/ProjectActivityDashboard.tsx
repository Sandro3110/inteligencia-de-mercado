import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PostponeHibernationDialog } from "@/components/PostponeHibernationDialog";

export default function ProjectActivityDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<30 | 60 | 90>(30);
  const [postponeDialogOpen, setPostponeDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{
    id: number;
    nome: string;
  } | null>(null);
  const utils = trpc.useUtils();

  const { data: activityData, isLoading } =
    trpc.projects.getActivity.useQuery();

  const autoHibernateMutation = trpc.projects.autoHibernate.useMutation({
    onSuccess: data => {
      toast.success(`${data.hibernated} projeto(s) hibernado(s) com sucesso!`);
      utils.projects.getActivity.invalidate();
      utils.projects.list.invalidate();
    },
    onError: error => {
      toast.error(`Erro ao hibernar projetos: ${error.message}`);
    },
  });

  const postponeMutation = trpc.projects.postponeHibernation.useMutation({
    onSuccess: () => {
      toast.success(`Hibernação adiada com sucesso!`);
      utils.projects.getActivity.invalidate();
      utils.projects.list.invalidate();
      setPostponeDialogOpen(false);
      setSelectedProject(null);
    },
    onError: error => {
      toast.error(`Erro ao adiar hibernação: ${error.message}`);
    },
  });

  const handleAutoHibernate = () => {
    if (
      !confirm(
        `Deseja hibernar todos os projetos inativos há mais de ${selectedPeriod} dias?`
      )
    ) {
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
    postponeMutation.mutate({
      projectId: selectedProject.id,
      postponeDays: days,
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "updated":
        return <FileEdit className="h-4 w-4 text-blue-600" />;
      case "hibernated":
        return <Moon className="h-4 w-4 text-purple-600" />;
      case "reactivated":
        return <RefreshCw className="h-4 w-4 text-green-600" />;
      case "deleted":
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: "Criado",
      updated: "Atualizado",
      hibernated: "Hibernado",
      reactivated: "Reativado",
      deleted: "Deletado",
    };
    return labels[action] || action;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando atividades...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!activityData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Nenhum dado de atividade disponível
          </p>
        </div>
      </div>
    );
  }

  const inactiveCount =
    selectedPeriod === 30
      ? activityData.inactiveProjects30
      : selectedPeriod === 60
        ? activityData.inactiveProjects60
        : activityData.inactiveProjects90;

  const inactiveProjects = activityData.projectsWithActivity.filter(p => {
    if (p.status !== "active") return false;
    // Incluir projetos com avisos pendentes OU inativos pelo período selecionado
    return (
      p.hasWarning ||
      (p.daysSinceActivity && p.daysSinceActivity >= selectedPeriod)
    );
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Dashboard de Atividade de Projetos
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitore a atividade e inatividade dos seus projetos
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Projetos
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityData.totalProjects}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os projetos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projetos Ativos
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activityData.activeProjects}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(
                (activityData.activeProjects / activityData.totalProjects) *
                100
              ).toFixed(0)}
              % do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projetos Hibernados
            </CardTitle>
            <Moon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {activityData.hibernatedProjects}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(
                (activityData.hibernatedProjects / activityData.totalProjects) *
                100
              ).toFixed(0)}
              % do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inativos ({selectedPeriod}+ dias)
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {inactiveCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sem atividade recente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Períodos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Projetos Inativos</CardTitle>
              <CardDescription>
                Projetos sem atividade há mais de {selectedPeriod} dias
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tabs
                value={selectedPeriod.toString()}
                onValueChange={v =>
                  setSelectedPeriod(Number(v) as 30 | 60 | 90)
                }
              >
                <TabsList>
                  <TabsTrigger value="30">30 dias</TabsTrigger>
                  <TabsTrigger value="60">60 dias</TabsTrigger>
                  <TabsTrigger value="90">90 dias</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                onClick={handleAutoHibernate}
                disabled={
                  inactiveCount === 0 || autoHibernateMutation.isPending
                }
                variant="destructive"
                size="sm"
              >
                {autoHibernateMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Hibernando...
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Hibernar Inativos
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {inactiveProjects.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <p className="text-muted-foreground">
                Nenhum projeto inativo há mais de {selectedPeriod} dias! 🎉
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {inactiveProjects.map(project => (
                <Card
                  key={project.id}
                  className="border-orange-200 bg-orange-50/50"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {project.nome}
                          <Badge
                            variant={
                              project.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {project.status === "active"
                              ? "Ativo"
                              : "Hibernado"}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          {project.daysSinceActivity !== null ? (
                            <span className="text-orange-600 font-medium">
                              {project.daysSinceActivity} dias sem atividade
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Sem registro de atividade
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {project.hasWarning && (
                      <div className="flex items-center justify-between mb-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handlePostpone(project.id, project.nome)
                          }
                          className="flex items-center gap-2"
                        >
                          <Clock className="h-4 w-4" />
                          Adiar Hibernação
                        </Button>
                        <Badge variant="destructive" className="text-xs">
                          Aviso Pendente
                        </Badge>
                      </div>
                    )}
                    {project.recentActions.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Últimas ações:
                        </p>
                        {project.recentActions.map((action, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm"
                          >
                            {getActionIcon(action.action)}
                            <span className="font-medium">
                              {getActionLabel(action.action)}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">
                              {formatDistanceToNow(new Date(action.createdAt), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                            {action.userName && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">
                                  {action.userName}
                                </span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma ação registrada
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Todos os Projetos com Atividade */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Projetos</CardTitle>
          <CardDescription>
            Ordenados por inatividade (mais inativos primeiro)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activityData.projectsWithActivity.map(project => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{project.nome}</span>
                    <Badge
                      variant={
                        project.status === "active" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {project.status === "active" ? "Ativo" : "Hibernado"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    {project.daysSinceActivity !== null ? (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {project.daysSinceActivity} dias sem atividade
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Sem registro de atividade
                      </span>
                    )}
                    {project.recentActions.length > 0 && (
                      <span className="flex items-center gap-1">
                        {getActionIcon(project.recentActions[0].action)}
                        Última ação:{" "}
                        {getActionLabel(project.recentActions[0].action)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Adiamento */}
      {selectedProject && (
        <PostponeHibernationDialog
          open={postponeDialogOpen}
          onOpenChange={setPostponeDialogOpen}
          projectName={selectedProject.nome}
          onConfirm={handleConfirmPostpone}
          isLoading={postponeMutation.isPending}
        />
      )}
    </div>
  );
}
