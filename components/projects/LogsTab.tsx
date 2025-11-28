'use client';

/**
 * Aba de Logs - Registro de Atividades do Sistema
 * Exibe atividades recentes do sistema (leads, conversões, alertas, enriquecimento)
 */

import { useMemo } from 'react';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import ProjectSelector from '@/components/ProjectSelector';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Users,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================================
// CONSTANTS
// ============================================================================

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  lead_created: TrendingUp,
  conversion: CheckCircle,
  alert: AlertCircle,
  enrichment: Users,
};

const ACTIVITY_COLORS: Record<string, string> = {
  lead_created: 'text-blue-500',
  conversion: 'text-green-500',
  alert: 'text-orange-500',
  enrichment: 'text-purple-500',
};

const DEFAULT_ICON = Activity;
const DEFAULT_COLOR = 'text-gray-500';
const ACTIVITY_LIMIT = 50;

const MESSAGES = {
  NO_PROJECT: 'Selecione um projeto para visualizar as atividades',
  LOADING: 'Carregando atividades...',
  RECENT_ACTIVITY: 'Atividade Recente',
  LAST_ACTIVITIES: `Últimas ${ACTIVITY_LIMIT} atividades do sistema`,
  NO_ACTIVITIES: 'Nenhuma atividade registrada',
  NO_ACTIVITIES_DESC: 'As atividades do sistema aparecerão aqui.',
};

// ============================================================================
// TYPES
// ============================================================================

interface ActivityRecord {
  id: number;
  activityType: string;
  description: string | null;
  createdAt?: string | null;
  metadata?: unknown;
  projectId?: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getActivityIcon(activityType: string): LucideIcon {
  return ACTIVITY_ICONS[activityType] || DEFAULT_ICON;
}

function getActivityColor(activityType: string): string {
  return ACTIVITY_COLORS[activityType] || DEFAULT_COLOR;
}

// ============================================================================
// COMPONENT
// ============================================================================

function LogsTab() {
  const { selectedProjectId } = useSelectedProject();

  const { data: activities, isLoading } = trpc.activity.recent.useQuery(
    { projectId: selectedProjectId || 0, limit: ACTIVITY_LIMIT },
    { enabled: !!selectedProjectId }
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasActivities = useMemo(
    () => activities && activities.length > 0,
    [activities]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!selectedProjectId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">{MESSAGES.NO_PROJECT}</p>
        <ProjectSelector />
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {MESSAGES.RECENT_ACTIVITY}
          </h3>
          <p className="text-sm text-muted-foreground">
            {MESSAGES.LAST_ACTIVITIES}
          </p>
        </div>
        <ProjectSelector />
      </div>

      {/* Lista de Atividades */}
      <div className="space-y-4">
        {hasActivities ? (
          activities?.map((activity: ActivityRecord) => {
            const Icon = getActivityIcon(activity.activityType);
            const colorClass = getActivityColor(activity.activityType);

            return (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg bg-muted ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.description}</p>
                      {activity.createdAt && (
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{MESSAGES.NO_ACTIVITIES}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {MESSAGES.NO_ACTIVITIES_DESC}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default LogsTab;
