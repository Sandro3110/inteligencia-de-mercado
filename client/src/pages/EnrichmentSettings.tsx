import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useState } from "react";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { useEnrichmentConfig } from "@/hooks/useEnrichmentConfig";
import { ProjectSelector } from "@/components/ProjectSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings, Key, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function EnrichmentSettings() {
  const { selectedProjectId } = useSelectedProject();
  const { config, isLoading, saveConfig, isSaving, testKeys, isTesting, testResults } = useEnrichmentConfig(selectedProjectId || undefined);

  // Form state
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [serpapiKey, setSerpapiKey] = useState("");
  const [receitawsKey, setReceitawsKey] = useState("");
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState("");
  const [produtosPorMercado, setProdutosPorMercado] = useState(3);
  const [concorrentesPorMercado, setConcorrentesPorMercado] = useState(5);
  const [leadsPorMercado, setLeadsPorMercado] = useState(5);
  const [batchSize, setBatchSize] = useState(50);
  const [checkpointInterval, setCheckpointInterval] = useState(100);
  const [enableDeduplication, setEnableDeduplication] = useState(true);
  const [enableQualityScore, setEnableQualityScore] = useState(true);
  const [enableAutoRetry, setEnableAutoRetry] = useState(true);
  const [maxRetries, setMaxRetries] = useState(2);

  // Carregar config quando disponível
  useState(() => {
    if (config) {
      setOpenaiApiKey(config.openaiApiKey || "");
      setSerpapiKey(config.serpapiKey || "");
      setReceitawsKey(config.receitawsKey || "");
      setGoogleMapsApiKey(config.googleMapsApiKey || "");
      setProdutosPorMercado(config.produtosPorMercado || 3);
      setConcorrentesPorMercado(config.concorrentesPorMercado || 5);
      setLeadsPorMercado(config.leadsPorMercado || 5);
      setBatchSize(config.batchSize || 50);
      setCheckpointInterval(config.checkpointInterval || 100);
      setEnableDeduplication(config.enableDeduplication === 1);
      setEnableQualityScore(config.enableQualityScore === 1);
      setEnableAutoRetry(config.enableAutoRetry === 1);
      setMaxRetries(config.maxRetries || 2);
    }
  });

  const handleTestKeys = () => {
    if (!openaiApiKey) {
      toast.error("OpenAI API Key é obrigatória");
      return;
    }

    testKeys({ openaiApiKey, serpapiKey: serpapiKey || undefined });
  };

  const handleSave = () => {
    if (!selectedProjectId) {
      toast.error("Selecione um projeto primeiro");
      return;
    }

    if (!openaiApiKey) {
      toast.error("OpenAI API Key é obrigatória");
      return;
    }

    saveConfig({
      projectId: selectedProjectId,
      openaiApiKey,
      serpapiKey: serpapiKey || undefined,
      receitawsKey: receitawsKey || undefined,
      googleMapsApiKey: googleMapsApiKey || undefined,
      produtosPorMercado,
      concorrentesPorMercado,
      leadsPorMercado,
      batchSize,
      checkpointInterval,
      enableDeduplication: enableDeduplication ? 1 : 0,
      enableQualityScore: enableQualityScore ? 1 : 0,
      enableAutoRetry: enableAutoRetry ? 1 : 0,
      maxRetries,
    }, {
      onSuccess: () => {
        toast.success("Configurações salvas com sucesso!");
      },
      onError: (error: any) => {
        toast.error(`Erro ao salvar: ${error.message}`);
      },
    });
  };

  if (!selectedProjectId) {
    return (
      <div className="min-h-screen ml-60 bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Breadcrumbs items={[{ label: "Configurações de Enriquecimento" }]} />
            <ProjectSelector />
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Selecione um projeto para configurar o enriquecimento</p>
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
            <Breadcrumbs items={[{ label: "Configurações de Enriquecimento" }]} />
            <h1 className="text-3xl font-bold text-foreground mt-2">
              <Settings className="inline-block w-8 h-8 mr-2" />
              Configurações de Enriquecimento
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure API keys e critérios para o enriquecimento de dados
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
            {/* API Keys */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Configure suas chaves de API para os serviços de enriquecimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* OpenAI API Key */}
                <div className="space-y-2">
                  <Label htmlFor="openai-key">
                    OpenAI API Key <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Obrigatória. Usada para gerar dados de mercado, produtos, concorrentes e leads.
                  </p>
                </div>

                {/* SerpAPI Key */}
                <div className="space-y-2">
                  <Label htmlFor="serpapi-key">SerpAPI Key (Opcional)</Label>
                  <Input
                    id="serpapi-key"
                    type="password"
                    placeholder="..."
                    value={serpapiKey}
                    onChange={(e) => setSerpapiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Opcional. Usada para buscar informações adicionais na web.
                  </p>
                </div>

                {/* ReceitaWS Key */}
                <div className="space-y-2">
                  <Label htmlFor="receitaws-key">ReceitaWS API Key (Opcional)</Label>
                  <Input
                    id="receitaws-key"
                    type="password"
                    placeholder="..."
                    value={receitawsKey}
                    onChange={(e) => setReceitawsKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Opcional. Usada para validar e enriquecer dados de CNPJ.
                  </p>
                </div>

                {/* Google Maps API Key */}
                <div className="space-y-2">
                  <Label htmlFor="googlemaps-key">Google Maps API Key (Opcional)</Label>
                  <Input
                    id="googlemaps-key"
                    type="password"
                    placeholder="AIza..."
                    value={googleMapsApiKey}
                    onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Opcional. Usada para geocodificar endereços (adicionar coordenadas lat/lng) quando a IA não conseguir.
                  </p>
                </div>

                {/* Testar Conexão */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button
                    onClick={handleTestKeys}
                    disabled={isTesting || !openaiApiKey}
                    variant="outline"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      "Testar Conexão"
                    )}
                  </Button>

                  {testResults && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {testResults.openai ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )}
                        <span className="text-sm">
                          OpenAI: {testResults.openaiMessage}
                        </span>
                      </div>

                      {serpapiKey && (
                        <div className="flex items-center gap-2">
                          {testResults.serpapi ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                          <span className="text-sm">
                            SerpAPI: {testResults.serpapiMessage}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Critérios de Enriquecimento */}
            <Card>
              <CardHeader>
                <CardTitle>Critérios de Enriquecimento</CardTitle>
                <CardDescription>
                  Defina quantos itens devem ser gerados para cada cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Produtos por Mercado */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Produtos por Mercado</Label>
                    <span className="text-sm font-medium">{produtosPorMercado}</span>
                  </div>
                  <Slider
                    value={[produtosPorMercado]}
                    onValueChange={([value]) => setProdutosPorMercado(value)}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>

                {/* Concorrentes por Mercado */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Concorrentes por Mercado</Label>
                    <span className="text-sm font-medium">{concorrentesPorMercado}</span>
                  </div>
                  <Slider
                    value={[concorrentesPorMercado]}
                    onValueChange={([value]) => setConcorrentesPorMercado(value)}
                    min={1}
                    max={20}
                    step={1}
                  />
                </div>

                {/* Leads por Mercado */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Leads por Mercado</Label>
                    <span className="text-sm font-medium">{leadsPorMercado}</span>
                  </div>
                  <Slider
                    value={[leadsPorMercado]}
                    onValueChange={([value]) => setLeadsPorMercado(value)}
                    min={1}
                    max={20}
                    step={1}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Processamento */}
            <Card>
              <CardHeader>
                <CardTitle>Processamento</CardTitle>
                <CardDescription>
                  Configure o comportamento do processamento em lote
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Batch Size */}
                <div className="space-y-2">
                  <Label htmlFor="batch-size">Tamanho do Lote</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    min={1}
                    max={100}
                    value={batchSize}
                    onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Quantos clientes processar por vez (recomendado: 50)
                  </p>
                </div>

                {/* Checkpoint Interval */}
                <div className="space-y-2">
                  <Label htmlFor="checkpoint-interval">Intervalo de Checkpoint</Label>
                  <Input
                    id="checkpoint-interval"
                    type="number"
                    min={10}
                    max={500}
                    value={checkpointInterval}
                    onChange={(e) => setCheckpointInterval(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Salvar progresso a cada X clientes (recomendado: 100)
                  </p>
                </div>

                {/* Flags */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Deduplicação de Mercados</Label>
                      <p className="text-xs text-muted-foreground">
                        Reusar mercados já existentes ao invés de criar duplicados
                      </p>
                    </div>
                    <Switch
                      checked={enableDeduplication}
                      onCheckedChange={setEnableDeduplication}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Quality Score</Label>
                      <p className="text-xs text-muted-foreground">
                        Calcular score de qualidade dos dados gerados
                      </p>
                    </div>
                    <Switch
                      checked={enableQualityScore}
                      onCheckedChange={setEnableQualityScore}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Retry Automático</Label>
                      <p className="text-xs text-muted-foreground">
                        Tentar novamente em caso de erro
                      </p>
                    </div>
                    <Switch
                      checked={enableAutoRetry}
                      onCheckedChange={setEnableAutoRetry}
                    />
                  </div>

                  {enableAutoRetry && (
                    <div className="space-y-2 ml-4">
                      <Label htmlFor="max-retries">Máximo de Tentativas</Label>
                      <Input
                        id="max-retries"
                        type="number"
                        min={1}
                        max={5}
                        value={maxRetries}
                        onChange={(e) => setMaxRetries(parseInt(e.target.value))}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Botão Salvar */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving || !openaiApiKey}
                size="lg"
              >
                {isSaving ? (
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
