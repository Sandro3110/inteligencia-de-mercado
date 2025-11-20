import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, TrendingUp, Users, Target, Clock, AlertTriangle } from "lucide-react";

export default function AlertHistoryPage() {
  const { selectedProjectId } = useSelectedProject();
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data: history, isLoading } = trpc.alert.history.useQuery(
    {
      projectId: selectedProjectId!,
      limit: pageSize,
      offset: page * pageSize,
    },
    { enabled: !!selectedProjectId }
  );

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error_rate":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "high_quality_lead":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "market_threshold":
        return <Target className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getAlertTypeName = (type: string) => {
    switch (type) {
      case "error_rate":
        return "Taxa de Erro";
      case "high_quality_lead":
        return "Lead de Alta Qualidade";
      case "market_threshold":
        return "Limite de Mercado";
      default:
        return type;
    }
  };

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case "error_rate":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high_quality_lead":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "market_threshold":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="min-h-screen ml-60 bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Alertas" },
            { label: "Histórico" },
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-500" />
              Histórico de Alertas
            </h2>
            <p className="text-slate-400 mt-1">
              Timeline completa de todos os alertas disparados
            </p>
          </div>
        </div>

        {/* Timeline */}
        {isLoading ? (
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <p className="text-slate-400">Carregando histórico...</p>
            </CardContent>
          </Card>
        ) : !history || history.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum alerta foi disparado ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => {
              const condition = JSON.parse(item.condition);
              
              return (
                <Card
                  key={item.id}
                  className="glass-card border-l-4"
                  style={{
                    borderLeftColor:
                      item.alertType === "error_rate"
                        ? "#ef4444"
                        : item.alertType === "high_quality_lead"
                        ? "#10b981"
                        : "#3b82f6",
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getAlertIcon(item.alertType)}
                        <div>
                          <CardTitle className="text-white text-base">
                            {getAlertTypeName(item.alertType)}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {new Date(item.triggeredAt).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={getAlertBadgeColor(item.alertType)}
                      >
                        {getAlertTypeName(item.alertType)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Mensagem */}
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <p className="text-sm text-slate-300 whitespace-pre-line">
                          {item.message}
                        </p>
                      </div>

                      {/* Condição */}
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>Condição:</span>
                        <code className="px-2 py-1 rounded bg-slate-800 text-blue-400">
                          valor {condition.operator || ">="} {condition.value}
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Paginação */}
            {history.length === pageSize && (
              <div className="flex justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={history.length < pageSize}
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
