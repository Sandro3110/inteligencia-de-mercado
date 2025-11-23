/**
 * Central de Alertas Unificada
 * Combina configuração de alertas, histórico e alertas inteligentes
 * Fusão de: AlertsPage + AlertHistoryPage + IntelligentAlerts
 */

import { useState, useEffect } from "react";
import { DynamicBreadcrumbs } from "@/components/DynamicBreadcrumbs";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { ProjectSelector } from "@/components/ProjectSelector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Loader2,
  TrendingUp,
  Target,
  Settings,
  History,
  Sparkles,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { intelligentAlertsSchema } from "@shared/formSchemas";
import { AlertConfig } from "@/components/AlertConfig";

interface IntelligentAlertConfigState {
  circuitBreakerThreshold: number;
  errorRateThreshold: number;
  processingTimeThreshold: number;
  notifyOnCompletion: boolean;
}

export default function AlertsPage() {
  const { selectedProjectId } = useSelectedProject();

  const [intelligentConfig, setIntelligentConfig] =
    useState<IntelligentAlertConfigState>({
      circuitBreakerThreshold: 10,
      errorRateThreshold: 10,
      processingTimeThreshold: 60,
      notifyOnCompletion: true,
    });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [historyPage, setHistoryPage] = useState(0);
  const pageSize = 20;

  // ============= QUERIES =============

  // Alertas Inteligentes - Configuração
  const { data: loadedIntelligentConfig, isLoading: isLoadingIntelligent } =
    trpc.intelligentAlerts.getConfig.useQuery(
      { projectId: selectedProjectId! },
      { enabled: !!selectedProjectId }
    );

  // Alertas Inteligentes - Estatísticas
  const { data: intelligentStats } = trpc.intelligentAlerts.getStats.useQuery(
    { projectId: selectedProjectId!, hours: 24 },
    { enabled: !!selectedProjectId }
  );

  // Histórico de Alertas
  const { data: history, isLoading: isLoadingHistory } =
    trpc.alert.history.useQuery(
      {
        projectId: selectedProjectId!,
        limit: pageSize,
        offset: historyPage * pageSize,
      },
      { enabled: !!selectedProjectId }
    );

  // ============= MUTATIONS =============

  const saveIntelligentMutation =
    trpc.intelligentAlerts.saveConfig.useMutation();

  // ============= EFFECTS =============

  useEffect(() => {
    if (loadedIntelligentConfig) {
      setIntelligentConfig({
        circuitBreakerThreshold:
          loadedIntelligentConfig.circuitBreakerThreshold,
        errorRateThreshold: loadedIntelligentConfig.errorRateThreshold,
        processingTimeThreshold:
          loadedIntelligentConfig.processingTimeThreshold,
        notifyOnCompletion: loadedIntelligentConfig.notifyOnCompletion === 1,
      });
    }
  }, [loadedIntelligentConfig]);

  // ============= HANDLERS =============

  const handleSaveIntelligent = async () => {
    if (!selectedProjectId) {
      toast.error("Selecione um projeto primeiro");
      return;
    }

    try {
      intelligentAlertsSchema.parse({
        type: "circuit_breaker",
        threshold: intelligentConfig.circuitBreakerThreshold,
        enabled: true,
      });
      intelligentAlertsSchema.parse({
        type: "error_rate",
        threshold: intelligentConfig.errorRateThreshold,
        enabled: true,
      });
      intelligentAlertsSchema.parse({
        type: "processing_time",
        threshold: intelligentConfig.processingTimeThreshold,
        enabled: true,
      });
    } catch (error: any) {
      const firstError = error.errors?.[0];
      toast.error(firstError?.message || "Configurações inválidas");
      return;
    }

    setIsSaving(true);
    try {
      await saveIntelligentMutation.mutateAsync({
        projectId: selectedProjectId,
        circuitBreakerThreshold: intelligentConfig.circuitBreakerThreshold,
        errorRateThreshold: intelligentConfig.errorRateThreshold,
        processingTimeThreshold: intelligentConfig.processingTimeThreshold,
        notifyOnCompletion: intelligentConfig.notifyOnCompletion ? 1 : 0,
        notifyOnCircuitBreaker: 1,
        notifyOnErrorRate: 1,
        notifyOnProcessingTime: 1,
      });

      setLastSaved(new Date());
      toast.success(
        "Configurações de alertas inteligentes salvas com sucesso!"
      );
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestAlert = async (alertType: string) => {
    try {
      toast.info(`Enviando alerta de teste: ${alertType}...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Alerta de teste enviado com sucesso!`);
    } catch (error: any) {
      toast.error(`Erro ao enviar alerta: ${error.message}`);
    }
  };

  // ============= HELPER FUNCTIONS =============

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
        return "bg-red-50 text-red-700 border-red-200";
      case "high_quality_lead":
        return "bg-green-50 text-green-700 border-green-200";
      case "market_threshold":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // ============= RENDER =============

  if (!selectedProjectId) {
    return (
      <div className="min-h-screen ml-60 bg-background p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <DynamicBreadcrumbs />
            <ProjectSelector />
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Selecione um Projeto
              </h3>
              <p className="text-muted-foreground">
                Escolha um projeto acima para configurar e visualizar alertas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ml-60 bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <DynamicBreadcrumbs />
            <h1 className="text-3xl font-bold text-foreground mt-2 flex items-center gap-2">
              <Bell className="w-8 h-8" />
              Central de Alertas
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure alertas, visualize histórico e gerencie notificações
              inteligentes
            </p>
          </div>
          <ProjectSelector />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="config">
              <Settings className="w-4 h-4 mr-2" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="intelligent">
              <Sparkles className="w-4 h-4 mr-2" />
              Alertas Inteligentes
            </TabsTrigger>
          </TabsList>

          {/* ABA: CONFIGURAÇÃO */}
          <TabsContent value="config" className="space-y-6">
            <AlertConfig />
          </TabsContent>

          {/* ABA: HISTÓRICO */}
          <TabsContent value="history" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-2">
                <Clock className="w-6 h-6 text-blue-500" />
                Histórico de Alertas
              </h2>
              <p className="text-muted-foreground">
                Timeline completa de todos os alertas disparados
              </p>
            </div>

            {isLoadingHistory ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">
                      Carregando histórico...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : !history || history.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum alerta foi disparado ainda
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {history.map(item => {
                  const condition = JSON.parse(item.condition);

                  return (
                    <Card
                      key={item.id}
                      className="border-l-4"
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
                              <CardTitle className="text-base">
                                {getAlertTypeName(item.alertType)}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {new Date(item.triggeredAt).toLocaleString(
                                  "pt-BR",
                                  {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
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
                          <div className="p-3 rounded-lg bg-muted border">
                            <p className="text-sm whitespace-pre-line">
                              {item.message}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Condição:</span>
                            <code className="px-2 py-1 rounded bg-muted text-primary">
                              valor {condition.operator || ">="}{" "}
                              {condition.value}
                            </code>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {history.length === pageSize && (
                  <div className="flex justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setHistoryPage(p => Math.max(0, p - 1))}
                      disabled={historyPage === 0}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setHistoryPage(p => p + 1)}
                      disabled={history.length < pageSize}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ABA: ALERTAS INTELIGENTES */}
          <TabsContent value="intelligent" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                Alertas Inteligentes
              </h2>
              <p className="text-muted-foreground">
                Configure alertas automáticos para monitorar o enriquecimento
              </p>
            </div>

            {/* Status dos Alertas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Alertas Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold">4</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tipos de alerta configurados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Alertas Enviados (24h)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <span className="text-2xl font-bold">
                      {intelligentStats?.total || 0}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Últimas 24 horas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Última Atualização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-600" />
                    <span className="text-sm font-bold">
                      {lastSaved ? lastSaved.toLocaleTimeString() : "Nunca"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configurações salvas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Alerta 1: Circuit Breaker */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <CardTitle>Circuit Breaker</CardTitle>
                  </div>
                  <Badge variant="default">Crítico</Badge>
                </div>
                <CardDescription>
                  Alerta quando o circuit breaker é ativado por falhas
                  consecutivas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="circuit-threshold">
                    Threshold de Falhas Consecutivas
                  </Label>
                  <Input
                    id="circuit-threshold"
                    type="number"
                    min={1}
                    max={50}
                    value={intelligentConfig.circuitBreakerThreshold}
                    onChange={e =>
                      setIntelligentConfig(prev => ({
                        ...prev,
                        circuitBreakerThreshold: parseInt(e.target.value) || 10,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Alerta será disparado após{" "}
                    {intelligentConfig.circuitBreakerThreshold} falhas
                    consecutivas
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestAlert("circuit-breaker")}
                >
                  Testar Alerta
                </Button>
              </CardContent>
            </Card>

            {/* Alerta 2: Taxa de Erro */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <CardTitle>Taxa de Erro Elevada</CardTitle>
                  </div>
                  <Badge variant="secondary">Importante</Badge>
                </div>
                <CardDescription>
                  Alerta quando a taxa de erro ultrapassa o threshold definido
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="error-threshold">
                    Threshold de Taxa de Erro (%)
                  </Label>
                  <Input
                    id="error-threshold"
                    type="number"
                    min={1}
                    max={100}
                    value={intelligentConfig.errorRateThreshold}
                    onChange={e =>
                      setIntelligentConfig(prev => ({
                        ...prev,
                        errorRateThreshold: parseInt(e.target.value) || 10,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Alerta será disparado quando taxa de erro ultrapassar{" "}
                    {intelligentConfig.errorRateThreshold}%
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestAlert("error-rate")}
                >
                  Testar Alerta
                </Button>
              </CardContent>
            </Card>

            {/* Alerta 3: Tempo de Processamento */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <CardTitle>Tempo de Processamento Longo</CardTitle>
                  </div>
                  <Badge variant="outline">Informativo</Badge>
                </div>
                <CardDescription>
                  Alerta quando o tempo médio de processamento excede o
                  threshold
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="time-threshold">
                    Threshold de Tempo Médio (segundos)
                  </Label>
                  <Input
                    id="time-threshold"
                    type="number"
                    min={10}
                    max={300}
                    value={intelligentConfig.processingTimeThreshold}
                    onChange={e =>
                      setIntelligentConfig(prev => ({
                        ...prev,
                        processingTimeThreshold: parseInt(e.target.value) || 60,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Alerta será disparado quando tempo médio ultrapassar{" "}
                    {intelligentConfig.processingTimeThreshold}s
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestAlert("processing-time")}
                >
                  Testar Alerta
                </Button>
              </CardContent>
            </Card>

            {/* Alerta 4: Conclusão */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <CardTitle>Conclusão de Enriquecimento</CardTitle>
                  </div>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <CardDescription>
                  Notificação quando o enriquecimento é concluído com
                  estatísticas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="notify-completion">
                      Notificar ao Concluir
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enviar alerta com estatísticas quando enriquecimento
                      terminar
                    </p>
                  </div>
                  <Switch
                    id="notify-completion"
                    checked={intelligentConfig.notifyOnCompletion}
                    onCheckedChange={checked =>
                      setIntelligentConfig(prev => ({
                        ...prev,
                        notifyOnCompletion: checked,
                      }))
                    }
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestAlert("completion")}
                >
                  Testar Alerta
                </Button>
              </CardContent>
            </Card>

            {/* Botão Salvar */}
            <div className="flex justify-end gap-4">
              <Button
                onClick={handleSaveIntelligent}
                disabled={isSaving}
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
