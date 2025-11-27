'use client';

/**
 * Aba de Atividades - Dashboard de Atividade de Projetos
 * Monitora atividade e inatividade dos projetos
 */

import { useState, useCallback, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
// PostponeHibernationDialog removido - usar dialog inline

// ============================================================================
// CONSTANTS
// ============================================================================

const PERIOD_OPTIONS = [30, 60, 90] as const;
const DEFAULT_PERIOD = 30;

const ACTION_ICONS: Record<string, React.ReactNode> = {
  created: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  updated: <FileEdit className="h-4 w-4 text-blue-600" />,
  hibernated: <Moon className="h-4 w-4 text-purple-600" />,
  reactivated: <RefreshCw className="h-4 w-4 text-green-600" />,
  deleted: <Trash2 className="h-4 w-4 text-red-600" />,
};

const ACTION_LABELS: Record<string, string> = {
  created: 'Criado',
  updated: 'Atualizado',
  hibernated: 'Hibernado',
  reactivated: 'Reativado',
  deleted: 'Deletado',
};

const MESSAGES = {
  LOADING: 'Carregando atividades...',
  NO_DATA: 'Nenhum dado de atividade disponível',
  CONFIRM_HIBERNATE: (days: number) =>
    `Deseja hibernar todos os projetos inativos há mais de ${days} dias?`,
  SUCCESS_HIBERNATE: (count: number) =>
    `${count} projeto(s) hibernado(s) com sucesso!`,
  ERROR_HIBERNATE: (error: string) => `Erro ao hibernar projetos: ${error}`,
  SUCCESS_POSTPONE: 'Hibernação adiada com sucesso!',
  ERROR_POSTPONE: (error: string) => `Erro ao adiar hibernação: ${error}`,
};

const CARD_LABELS = {
  TOTAL: 'Total de Projetos',
  ACTIVE: 'Projetos Ativos',
  HIBERNATED: 'Projetos Hibernados',
  INACTIVE: 'Inativos',
  ALL_PROJECTS: 'Todos os projetos cadastrados',
  OF_TOTAL: '% do total',
  NO_RECENT_ACTIVITY: 'Sem atividade recente',
};

const SECTION_TITLES = {
  INACTIVITY_CONTROL: 'Controle de Inatividade',
  INACTIVE_PROJECTS: 'Projetos Inativos',
  PERIOD_LABEL: 'Período de Inatividade',
  BATCH_ACTION: 'Ação em Lote',
};

// ============================================================================
// TYPES
// ============================================================================

type Period = (typeof PERIOD_OPTIONS)[number];

interface ProjectWithActivity {
  id: number;
  nome: string;
  status: string;
  hasWarning: boolean;
  daysSinceActivity?: number | null;
  lastActivityAt?: string | Date | null;
}

interface ActivityData {
  totalProjects: number;
  activeProjects: number;
  hibernatedProjects: number;
  inactiveProjects30: number;
  inactiveProjects60: number;
  inactiveProjects90: number;
  projectsWithActivity: ProjectWithActivity[];
}

interface SelectedProject {
  id: number;
  nome: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getActionIcon(action: string): React.ReactNode {
  return (
    ACTION_ICONS[action] || <Activity className="h-4 w-4 text-gray-600" />
  );
}

function getActionLabel(action: string): string {
  return ACTION_LABELS[action] || action;
}

function getInactiveCount(
  activityData: ActivityData,
  period: Period
): number {
  switch (period) {
    case 30:
      return activityData.inactiveProjects30;
    case 60:
      return activityData.inactiveProjects60;
    case 90:
      return activityData.inactiveProjects90;
    default:
      return 0;
  }
}

function filterInactiveProjects(
  projects: ProjectWithActivity[],
  period: Period
): ProjectWithActivity[] {
  return projects.filter((p) => {
    if (p.status !== 'active') return false;
    return (
      p.hasWarning || (p.daysSinceActivity && p.daysSinceActivity >= period)
    );
  });
}

function calculatePercentage(value: number, total: number): string {
  if (total === 0) return '0';
  return ((value / total) * 100).toFixed(0);
}

// ============================================================================
// COMPONENT
// ============================================================================

function ActivityTab() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(DEFAULT_PERIOD);
  const [postponeDialogOpen, setPostponeDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<SelectedProject | null>(null);

  const utils = trpc.useUtils();

  const { data: activityData, isLoading } =
    trpc.projects.getActivity.useQuery();

  const autoHibernateMutation = trpc.projects.autoHibernate.useMutation({
    onSuccess: (data) => {
      toast.success(MESSAGES.SUCCESS_HIBERNATE(data.hibernated));
      utils.projects.getActivity.invalidate();
      utils.projects.list.invalidate();
    },
    onError: (error) => {
      toast.error(MESSAGES.ERROR_HIBERNATE(error.message));
    },
  });

  const postponeMutation = trpc.projects.postponeHibernation.useMutation({
    onSuccess: () => {
      toast.success(MESSAGES.SUCCESS_POSTPONE);
      utils.projects.getActivity.invalidate();
      utils.projects.list.invalidate();
      setPostponeDialogOpen(false);
      setSelectedProject(null);
    },
    onError: (error) => {
      toast.error(MESSAGES.ERROR_POSTPONE(error.message));
    },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const inactiveCount = useMemo(() => {
    if (!activityData) return 0;
    return getInactiveCount(activityData, selectedPeriod);
  }, [activityData, selectedPeriod]);

  const inactiveProjects = useMemo(() => {
    if (!activityData) return [];
    return filterInactiveProjects(
      activityData.projectsWithActivity,
      selectedPeriod
    );
  }, [activityData, selectedPeriod]);

  const activePercentage = useMemo(() => {
    if (!activityData) return '0';
    return calculatePercentage(
      activityData.activeProjects,
      activityData.totalProjects
    );
  }, [activityData]);

  const hibernatedPercentage = useMemo(() => {
    if (!activityData) return '0';
    return calculatePercentage(
      activityData.hibernatedProjects,
      activityData.totalProjects
    );
  }, [activityData]);

  const hasInactiveProjects = useMemo(
    () => inactiveProjects.length > 0,
    [inactiveProjects]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAutoHibernate = useCallback(() => {
    if (!confirm(MESSAGES.CONFIRM_HIBERNATE(selectedPeriod))) {
      return;
    }
    autoHibernateMutation.mutate({ days: selectedPeriod });
  }, [selectedPeriod, autoHibernateMutation]);

  const handlePostpone = useCallback(
    (projectId: number, projectName: string) => {
      setSelectedProject({ id: projectId, nome: projectName });
      setPostponeDialogOpen(true);
    },
    []
  );

  const handleConfirmPostpone = useCallback(
    (days: number) => {
      if (!selectedProject) return;
      postponeMutation.mutate({
        projectId: selectedProject.id,
        postponeDays: days,
      });
    },
    [selectedProject, postponeMutation]
  );

  const handlePeriodChange = useCallback((value: string) => {
    setSelectedPeriod(parseInt(value) as Period);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{MESSAGES.LOADING}</p>
        </div>
      </div>
    );
  }

  if (!activityData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">{MESSAGES.NO_DATA}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {CARD_LABELS.TOTAL}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityData.totalProjects}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {CARD_LABELS.ALL_PROJECTS}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {CARD_LABELS.ACTIVE}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activityData.activeProjects}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activePercentage}
              {CARD_LABELS.OF_TOTAL}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {CARD_LABELS.HIBERNATED}
            </CardTitle>
            <Moon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {activityData.hibernatedProjects}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {hibernatedPercentage}
              {CARD_LABELS.OF_TOTAL}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {CARD_LABELS.INACTIVE} ({selectedPeriod}+ dias)
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {inactiveCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {CARD_LABELS.NO_RECENT_ACTIVITY}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>{SECTION_TITLES.INACTIVITY_CONTROL}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                {SECTION_TITLES.PERIOD_LABEL}
              </label>
              <Select
                value={selectedPeriod.toString()}
                onValueChange={handlePeriodChange}
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
                {SECTION_TITLES.BATCH_ACTION}
              </label>
              <Button
                onClick={handleAutoHibernate}
                disabled={
                  autoHibernateMutation.isPending || inactiveCount === 0
                }
                variant="outline"
                className="w-full"
              >
                {autoHibernateMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Moon className="h-4 w-4 mr-2" />
                Hibernar Inativos ({inactiveCount})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Projetos Inativos */}
      {hasInactiveProjects && (
        <Card>
          <CardHeader>
            <CardTitle>
              {SECTION_TITLES.INACTIVE_PROJECTS} (últimos {selectedPeriod}{' '}
              dias)
            </CardTitle>
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
                          Última atividade:{' '}
                          {formatDistanceToNow(
                            new Date(project.lastActivityAt),
                            {
                              addSuffix: true,
                              locale: ptBR,
                            }
                          )}
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

      {/* Dialog de Adiamento - Removido */}
    </div>
  );
}

export default ActivityTab;
