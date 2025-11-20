import { useSelectedProject } from "@/hooks/useSelectedProject";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProjectSelector } from "@/components/ProjectSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity, AlertCircle, CheckCircle, TrendingUp, Users } from "lucide-react";
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

export default function AtividadePage() {
  const { selectedProjectId } = useSelectedProject();
  const { data: activities, isLoading } = trpc.activity.recent.useQuery(
    { projectId: selectedProjectId || 0, limit: 50 },
    { enabled: !!selectedProjectId }
  );

  if (isLoading) {
    return (
      <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <Breadcrumbs items={[{ label: "Atividades" }]} />
        <ProjectSelector />
      </div>
        <p className="text-muted-foreground">Carregando atividades...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <Breadcrumbs items={[{ label: "Atividades" }]} />
        <ProjectSelector />
      </div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Atividade Recente</h1>
        <p className="text-muted-foreground">Últimas 50 atividades do sistema</p>
      </div>

      <div className="space-y-4">
        {activities?.map((activity) => {
          const Icon = activityIcons[activity.activityType] || Activity;
          const colorClass = activityColors[activity.activityType] || "text-gray-500";

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

        {!activities || activities.length === 0 && (
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
        )}
      </div>
    </div>
  );
}
