import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, XCircle, X } from "lucide-react";

const API_NAMES = {
  openai: "OpenAI",
  serpapi: "SERPAPI",
  receitaws: "ReceitaWS",
} as const;

type APIName = keyof typeof API_NAMES;

interface APIAlert {
  id: string;
  apiName: APIName;
  type: "critical" | "warning" | "recovered";
  message: string;
  timestamp: Date;
}

export function APIHealthAlerts() {
  const [alerts, setAlerts] = useState<APIAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  );

  const { data: stats } = trpc.apiHealth.stats.useQuery(
    { days: 1 },
    {
      refetchInterval: 30000, // Atualiza a cada 30 segundos
    }
  );

  useEffect(() => {
    if (!stats) {
      return;
    }

    const newAlerts: APIAlert[] = [];

    stats.forEach(stat => {
      const apiName = stat.apiName as APIName;
      const alertId = `${apiName}-${Date.now()}`;

      // Alerta crítico: taxa de sucesso < 60%
      if (stat.successRate < 60) {
        newAlerts.push({
          id: alertId,
          apiName,
          type: "critical",
          message: `Taxa de sucesso crítica: ${stat.successRate}% (${stat.errorCount} erros nas últimas 24h)`,
          timestamp: new Date(),
        });
      }
      // Alerta de atenção: taxa de sucesso entre 60-80%
      else if (stat.successRate < 80) {
        newAlerts.push({
          id: alertId,
          apiName,
          type: "warning",
          message: `Taxa de sucesso abaixo do esperado: ${stat.successRate}% (${stat.errorCount} erros nas últimas 24h)`,
          timestamp: new Date(),
        });
      }
      // Alerta de recuperação: taxa de sucesso >= 95% após problemas
      else if (stat.successRate >= 95 && stat.errorCount > 0) {
        newAlerts.push({
          id: alertId,
          apiName,
          type: "recovered",
          message: `API recuperada! Taxa de sucesso: ${stat.successRate}%`,
          timestamp: new Date(),
        });
      }
    });

    // Atualizar apenas se houver novos alertas
    if (newAlerts.length > 0) {
      setAlerts(prev => {
        // Manter apenas os últimos 5 alertas
        const combined = [...newAlerts, ...prev].slice(0, 5);
        return combined;
      });
    }
  }, [stats]);

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => {
      const newSet = new Set(prev);
      newSet.add(alertId);
      return newSet;
    });
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md">
      {visibleAlerts.map(alert => {
        const variant = alert.type === "critical" ? "destructive" : "default";
        const Icon =
          alert.type === "critical"
            ? XCircle
            : alert.type === "warning"
              ? AlertTriangle
              : CheckCircle2;
        const iconColor =
          alert.type === "critical"
            ? "text-red-500"
            : alert.type === "warning"
              ? "text-yellow-500"
              : "text-green-500";

        return (
          <Alert
            key={alert.id}
            variant={variant}
            className="relative pr-12 shadow-lg border-2"
          >
            <Icon className={`h-4 w-4 ${iconColor}`} />
            <AlertTitle className="flex items-center gap-2">
              <span>{API_NAMES[alert.apiName]}</span>
              <Badge
                variant={
                  alert.type === "critical" ? "destructive" : "secondary"
                }
                className="text-xs"
              >
                {alert.type === "critical"
                  ? "Crítico"
                  : alert.type === "warning"
                    ? "Atenção"
                    : "Recuperado"}
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-sm mt-1">
              {alert.message}
            </AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => handleDismiss(alert.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        );
      })}
    </div>
  );
}
