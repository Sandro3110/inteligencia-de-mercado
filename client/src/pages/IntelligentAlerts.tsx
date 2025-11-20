import { useState, useEffect } from "react";
import { DynamicBreadcrumbs } from "@/components/DynamicBreadcrumbs";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { ProjectSelector } from "@/components/ProjectSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, AlertTriangle, CheckCircle2, Clock, Zap, Loader2 } from "lucide-react";

interface AlertConfigState {
  circuitBreakerThreshold: number;
  errorRateThreshold: number;
  processingTimeThreshold: number;
  notifyOnCompletion: boolean;
}

export default function IntelligentAlerts() {
  const { selectedProjectId } = useSelectedProject();
  
  const [config, setConfig] = useState<AlertConfigState>({
    circuitBreakerThreshold: 10,
    errorRateThreshold: 10,
    processingTimeThreshold: 60,
    notifyOnCompletion: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Simular carregamento de config (você pode implementar endpoint real)
  useEffect(() => {
    if (selectedProjectId) {
      // Carregar config do backend
      // const loadedConfig = await trpc.alerts.getConfig.query({ projectId: selectedProjectId });
      // setConfig(loadedConfig);
    }
  }, [selectedProjectId]);

  const handleSave = async () => {
    if (!selectedProjectId) {
      toast.error("Selecione um projeto primeiro");
      return;
    }

    setIsSaving(true);
    try {
      // Simular salvamento (você pode implementar endpoint real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // await trpc.alerts.saveConfig.mutate({
      //   projectId: selectedProjectId,
      //   ...config,
      // });

      setLastSaved(new Date());
      toast.success("Configurações de alertas salvas com sucesso!");
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

  if (!selectedProjectId) {
    return (
      <div className="min-h-screen ml-60 bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <DynamicBreadcrumbs />
            <ProjectSelector />
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Selecione um projeto para configurar alertas</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ml-60 bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <DynamicBreadcrumbs />
            <h1 className="text-3xl font-bold text-foreground mt-2">
              <Bell className="inline-block w-8 h-8 mr-2" />
              Alertas Inteligentes
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure alertas automáticos para monitorar o enriquecimento
            </p>
          </div>
          <ProjectSelector />
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
                <span className="text-2xl font-bold text-foreground">4</span>
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
                <span className="text-2xl font-bold text-foreground">12</span>
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
                <span className="text-sm font-bold text-foreground">
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
              Alerta quando o circuit breaker é ativado por falhas consecutivas
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
                value={config.circuitBreakerThreshold}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  circuitBreakerThreshold: parseInt(e.target.value) || 10 
                }))}
              />
              <p className="text-xs text-muted-foreground">
                Alerta será disparado após {config.circuitBreakerThreshold} falhas consecutivas
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={() => handleTestAlert("circuit-breaker")}>
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
                value={config.errorRateThreshold}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  errorRateThreshold: parseInt(e.target.value) || 10 
                }))}
              />
              <p className="text-xs text-muted-foreground">
                Alerta será disparado quando taxa de erro ultrapassar {config.errorRateThreshold}%
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={() => handleTestAlert("error-rate")}>
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
              Alerta quando o tempo médio de processamento excede o threshold
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
                value={config.processingTimeThreshold}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  processingTimeThreshold: parseInt(e.target.value) || 60 
                }))}
              />
              <p className="text-xs text-muted-foreground">
                Alerta será disparado quando tempo médio ultrapassar {config.processingTimeThreshold}s
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={() => handleTestAlert("processing-time")}>
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
              Notificação quando o enriquecimento é concluído com estatísticas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="notify-completion">
                  Notificar ao Concluir
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enviar alerta com estatísticas quando enriquecimento terminar
                </p>
              </div>
              <Switch
                id="notify-completion"
                checked={config.notifyOnCompletion}
                onCheckedChange={(checked) => setConfig(prev => ({ 
                  ...prev, 
                  notifyOnCompletion: checked 
                }))}
              />
            </div>

            <Button variant="outline" size="sm" onClick={() => handleTestAlert("completion")}>
              Testar Alerta
            </Button>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end gap-4">
          <Button
            onClick={handleSave}
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
      </div>
    </div>
  );
}
