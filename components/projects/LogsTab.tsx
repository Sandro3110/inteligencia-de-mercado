/**
 * Aba de Logs - Registro de Atividades do Sistema
 * Exibe atividades recentes do sistema (leads, conversões, alertas, enriquecimento)
 */

import { useSelectedProject } from "@/hooks/useSelectedProject";
import { ProjectSelector } from "@/components/ProjectSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Users,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const activityIcons: Record<string, any> = {
  lead_created: TrendingUp,
  conversion: CheckCircle,
  alert: AlertCircle,
  enrichment: Users,
};

const activityColors: Record<string, string> = {
  lead_created: "text-blue-500",
  conversion: "text-green-500",
  alert: "text-orange-500",
  enrichment: "text-purple-500",
};

export function LogsTab() {
  const { selectedProjectId } = useSelectedProject();

  const { data: activities, isLoading } = trpc.activity.recent.useQuery(
    { projectId: selectedProjectId || 0, limit: 50 },
    { enabled: !!selectedProjectId }
  );

  if (!selectedProjectId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">
          Selecione um projeto para visualizar as atividades
        </p>
        <ProjectSelector />
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Atividade Recente</h3>
          <p className="text-sm text-muted-foreground">
            Últimas 50 atividades do sistema
          </p>
        </div>
        <ProjectSelector />
      </div>

      {/* Lista de Atividades */}
      <div className="space-y-4">
        {activities?.map((activity: any) => {
          const Icon = activityIcons[activity.activityType] || Activity;
          const colorClass =
            activityColors[activity.activityType] || "text-gray-500";

          return (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-muted ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.createdAt &&
                        formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {!activities || activities.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nenhuma atividade registrada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                As atividades do sistema aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
