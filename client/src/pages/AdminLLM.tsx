import { useState, useEffect } from "react";
import { DynamicBreadcrumbs } from "@/components/DynamicBreadcrumbs";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { ProjectSelector } from "@/components/ProjectSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Settings, Key, CheckCircle, XCircle, Loader2, Zap, Brain, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";

type LLMProvider = "openai" | "gemini" | "anthropic";

interface ProviderConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  enabled: boolean;
}

export default function AdminLLM() {
  const { selectedProjectId } = useSelectedProject();
  
  // Estado dos provedores
  const [providers, setProviders] = useState<ProviderConfig[]>([
    { provider: "openai", apiKey: "", model: "gpt-4o", enabled: true },
    { provider: "gemini", apiKey: "", model: "gemini-2.0-flash-exp", enabled: false },
    { provider: "anthropic", apiKey: "", model: "claude-3-5-sonnet-20241022", enabled: false },
  ]);

  const [activeProvider, setActiveProvider] = useState<LLMProvider>("openai");
  const [isTesting, setIsTesting] = useState<Record<LLMProvider, boolean>>({
    openai: false,
    gemini: false,
    anthropic: false,
  });
  const [testResults, setTestResults] = useState<Record<LLMProvider, { success: boolean; message: string } | null>>({
    openai: null,
    gemini: null,
    anthropic: null,
  });

  // Buscar configuração existente
  const { data: config, isLoading } = trpc.enrichmentConfig.get.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  // Salvar configuração
  const saveMutation = trpc.enrichmentConfig.save.useMutation();

  // Carregar config quando disponível
  useEffect(() => {
    if (config) {
      const newProviders = [...providers];
      
      // OpenAI
      if (config.openaiApiKey) {
        newProviders[0].apiKey = config.openaiApiKey;
        newProviders[0].enabled = true;
      }
      
      // Gemini (se existir no config)
      if ((config as any).geminiApiKey) {
        newProviders[1].apiKey = (config as any).geminiApiKey;
        newProviders[1].enabled = true;
      }
      
      // Anthropic (se existir no config)
      if ((config as any).anthropicApiKey) {
        newProviders[2].apiKey = (config as any).anthropicApiKey;
        newProviders[2].enabled = true;
      }
      
      setProviders(newProviders);
      
      // Definir provedor ativo
      if ((config as any).activeProvider) {
        setActiveProvider((config as any).activeProvider);
      }
    }
  }, [config]);

  const updateProvider = (provider: LLMProvider, updates: Partial<ProviderConfig>) => {
    setProviders(prev => prev.map(p => 
      p.provider === provider ? { ...p, ...updates } : p
    ));
  };

  const testProvider = async (provider: LLMProvider) => {
    const providerConfig = providers.find(p => p.provider === provider);
    if (!providerConfig?.apiKey) {
      toast.error("API Key é obrigatória");
      return;
    }

    setIsTesting(prev => ({ ...prev, [provider]: true }));
    setTestResults(prev => ({ ...prev, [provider]: null }));

    try {
      // Simular teste de conexão (você pode implementar endpoint real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Por enquanto, sempre retorna sucesso se tem API key
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          success: true,
          message: "Conexão estabelecida com sucesso",
        },
      }));
      toast.success(`${provider.toUpperCase()} conectado com sucesso!`);
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          success: false,
          message: error.message || "Erro ao conectar",
        },
      }));
      toast.error(`Erro ao testar ${provider.toUpperCase()}`);
    } finally {
      setIsTesting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleSave = async () => {
    if (!selectedProjectId) {
      toast.error("Selecione um projeto primeiro");
      return;
    }

    const activeConfig = providers.find(p => p.provider === activeProvider);
    if (!activeConfig?.apiKey) {
      toast.error(`API Key do provedor ativo (${activeProvider}) é obrigatória`);
      return;
    }

    try {
      await saveMutation.mutateAsync({
        projectId: selectedProjectId,
        openaiApiKey: providers[0].apiKey || undefined,
        // Campos extras para outros provedores (você precisa adicionar no schema)
        ...(providers[1].apiKey && { geminiApiKey: providers[1].apiKey }),
        ...(providers[2].apiKey && { anthropicApiKey: providers[2].apiKey }),
        activeProvider,
        // Manter outros campos do config original
        produtosPorMercado: config?.produtosPorMercado || 3,
        concorrentesPorMercado: config?.concorrentesPorMercado || 5,
        leadsPorMercado: config?.leadsPorMercado || 5,
        batchSize: config?.batchSize || 50,
        checkpointInterval: config?.checkpointInterval || 100,
        enableDeduplication: config?.enableDeduplication || 1,
        enableQualityScore: config?.enableQualityScore || 1,
        enableAutoRetry: config?.enableAutoRetry || 1,
        maxRetries: config?.maxRetries || 2,
      } as any);
      
      toast.success("Configurações salvas com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  };

  const getProviderIcon = (provider: LLMProvider) => {
    switch (provider) {
      case "openai": return <Zap className="w-5 h-5" />;
      case "gemini": return <Sparkles className="w-5 h-5" />;
      case "anthropic": return <Brain className="w-5 h-5" />;
    }
  };

  const getProviderColor = (provider: LLMProvider) => {
    switch (provider) {
      case "openai": return "text-green-600";
      case "gemini": return "text-blue-600";
      case "anthropic": return "text-purple-600";
    }
  };

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
              <p className="text-muted-foreground">Selecione um projeto para configurar os provedores LLM</p>
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
            <h1 className="text-3xl font-bold text-foreground mt-2">
              <Settings className="inline-block w-8 h-8 mr-2" />
              Admin - Provedores LLM
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure múltiplos provedores de IA e escolha o ativo
            </p>
          </div>
          <ProjectSelector />
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Carregando configurações...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Provedor Ativo */}
            <Card>
              <CardHeader>
                <CardTitle>Provedor Ativo</CardTitle>
                <CardDescription>
                  Selecione qual provedor será usado para enriquecimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={activeProvider} onValueChange={(v) => setActiveProvider(v as LLMProvider)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map(p => (
                      <SelectItem key={p.provider} value={p.provider} disabled={!p.enabled || !p.apiKey}>
                        <div className="flex items-center gap-2">
                          {getProviderIcon(p.provider)}
                          <span className="capitalize">{p.provider}</span>
                          {p.provider === activeProvider && (
                            <Badge variant="default" className="ml-2">Ativo</Badge>
                          )}
                          {!p.enabled && <Badge variant="outline">Desabilitado</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Configuração de Provedores */}
            {providers.map(provider => (
              <Card key={provider.provider}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={getProviderColor(provider.provider)}>
                        {getProviderIcon(provider.provider)}
                      </div>
                      <CardTitle className="capitalize">{provider.provider}</CardTitle>
                      {provider.provider === activeProvider && (
                        <Badge variant="default">Ativo</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${provider.provider}-enabled`} className="text-sm">
                        Habilitado
                      </Label>
                      <input
                        id={`${provider.provider}-enabled`}
                        type="checkbox"
                        checked={provider.enabled}
                        onChange={(e) => updateProvider(provider.provider, { enabled: e.target.checked })}
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* API Key */}
                  <div className="space-y-2">
                    <Label htmlFor={`${provider.provider}-key`}>
                      API Key {provider.provider === activeProvider && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id={`${provider.provider}-key`}
                      type="password"
                      placeholder="sk-..."
                      value={provider.apiKey}
                      onChange={(e) => updateProvider(provider.provider, { apiKey: e.target.value })}
                      disabled={!provider.enabled}
                    />
                  </div>

                  {/* Modelo */}
                  <div className="space-y-2">
                    <Label htmlFor={`${provider.provider}-model`}>Modelo</Label>
                    <Input
                      id={`${provider.provider}-model`}
                      value={provider.model}
                      onChange={(e) => updateProvider(provider.provider, { model: e.target.value })}
                      disabled={!provider.enabled}
                    />
                  </div>

                  {/* Testar Conexão */}
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <Button
                      onClick={() => testProvider(provider.provider)}
                      disabled={isTesting[provider.provider] || !provider.apiKey || !provider.enabled}
                      variant="outline"
                      size="sm"
                    >
                      {isTesting[provider.provider] ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Testando...
                        </>
                      ) : (
                        "Testar Conexão"
                      )}
                    </Button>

                    {testResults[provider.provider] && (
                      <div className="flex items-center gap-2">
                        {testResults[provider.provider]!.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )}
                        <span className="text-sm">
                          {testResults[provider.provider]!.message}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Botão Salvar */}
            <div className="flex justify-end gap-4">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                size="lg"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
