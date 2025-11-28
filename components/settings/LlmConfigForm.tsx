'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useApp } from '@/lib/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function LlmConfigForm() {
  const { selectedProjectId } = useApp();
  const [activeProvider, setActiveProvider] = useState<'openai' | 'gemini' | 'anthropic'>('openai');

  // OpenAI
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o');
  const [openaiEnabled, setOpenaiEnabled] = useState(true);

  // Gemini
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-2.0-flash-exp');
  const [geminiEnabled, setGeminiEnabled] = useState(false);

  // Anthropic
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
  const [anthropicModel, setAnthropicModel] = useState('claude-3-5-sonnet-20241022');
  const [anthropicEnabled, setAnthropicEnabled] = useState(false);

  const [testing, setTesting] = useState(false);

  // Buscar configuração existente
  const {
    data: config,
    isLoading,
    refetch,
  } = trpc.settings.getLlmConfig.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  // Mutation para salvar
  const saveMutation = trpc.settings.saveLlmConfig.useMutation({
    onSuccess: () => {
      toast.success('Configurações salvas com sucesso!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  // Mutation para testar conexão
  const testMutation = trpc.settings.testLlmConnection.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
      setTesting(false);
    },
    onError: (error) => {
      toast.error(`Erro ao testar: ${error.message}`);
      setTesting(false);
    },
  });

  // Carregar dados quando config mudar
  useEffect(() => {
    if (!config) return;

    const provider = config.activeProvider as 'openai' | 'gemini' | 'anthropic';
    setActiveProvider(provider);
    setOpenaiApiKey(config.openaiApiKey || '');
    setOpenaiModel(config.openaiModel || 'gpt-4o');
    setOpenaiEnabled(config.openaiEnabled === 1);
    setGeminiApiKey(config.geminiApiKey || '');
    setGeminiModel(config.geminiModel || 'gemini-2.0-flash-exp');
    setGeminiEnabled(config.geminiEnabled === 1);
    setAnthropicApiKey(config.anthropicApiKey || '');
    setAnthropicModel(config.anthropicModel || 'claude-3-5-sonnet-20241022');
    setAnthropicEnabled(config.anthropicEnabled === 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.id]);

  const handleSave = () => {
    if (!selectedProjectId) {
      toast.error('Selecione um projeto primeiro');
      return;
    }

    saveMutation.mutate({
      projectId: selectedProjectId,
      activeProvider,
      openaiApiKey,
      openaiModel,
      openaiEnabled,
      geminiApiKey,
      geminiModel,
      geminiEnabled,
      anthropicApiKey,
      anthropicModel,
      anthropicEnabled,
    });
  };

  const handleTest = (provider: 'openai' | 'gemini' | 'anthropic') => {
    let apiKey = '';

    if (provider === 'openai') apiKey = openaiApiKey;
    else if (provider === 'gemini') apiKey = geminiApiKey;
    else if (provider === 'anthropic') apiKey = anthropicApiKey;

    if (!apiKey) {
      toast.error('Informe a API Key primeiro');
      return;
    }

    setTesting(true);
    testMutation.mutate({ provider, apiKey });
  };

  if (!selectedProjectId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações de IA</CardTitle>
          <CardDescription>Selecione um projeto no topo direito para configurar</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Provedores de IA</CardTitle>
        <CardDescription>
          Configure as API keys e modelos para enriquecimento automático de dados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeProvider}
          onValueChange={(v) => setActiveProvider(v as 'openai' | 'gemini' | 'anthropic')}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="gemini">Google Gemini</TabsTrigger>
            <TabsTrigger value="anthropic">Anthropic Claude</TabsTrigger>
          </TabsList>

          {/* OpenAI */}
          <TabsContent value="openai" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="openai-enabled">Habilitar OpenAI</Label>
              <Switch
                id="openai-enabled"
                checked={openaiEnabled}
                onCheckedChange={setOpenaiEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="openai-key">API Key</Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-proj-..."
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                disabled={!openaiEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="openai-model">Modelo</Label>
              <Input
                id="openai-model"
                placeholder="gpt-4o"
                value={openaiModel}
                onChange={(e) => setOpenaiModel(e.target.value)}
                disabled={!openaiEnabled}
              />
            </div>

            <Button
              variant="outline"
              onClick={() => handleTest('openai')}
              disabled={!openaiEnabled || !openaiApiKey || testing}
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Testar Conexão
            </Button>
          </TabsContent>

          {/* Gemini */}
          <TabsContent value="gemini" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="gemini-enabled">Habilitar Gemini</Label>
              <Switch
                id="gemini-enabled"
                checked={geminiEnabled}
                onCheckedChange={setGeminiEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gemini-key">API Key</Label>
              <Input
                id="gemini-key"
                type="password"
                placeholder="AIza..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                disabled={!geminiEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gemini-model">Modelo</Label>
              <Input
                id="gemini-model"
                placeholder="gemini-2.0-flash-exp"
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                disabled={!geminiEnabled}
              />
            </div>

            <Button
              variant="outline"
              onClick={() => handleTest('gemini')}
              disabled={!geminiEnabled || !geminiApiKey || testing}
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Testar Conexão
            </Button>
          </TabsContent>

          {/* Anthropic */}
          <TabsContent value="anthropic" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="anthropic-enabled">Habilitar Claude</Label>
              <Switch
                id="anthropic-enabled"
                checked={anthropicEnabled}
                onCheckedChange={setAnthropicEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anthropic-key">API Key</Label>
              <Input
                id="anthropic-key"
                type="password"
                placeholder="sk-ant-..."
                value={anthropicApiKey}
                onChange={(e) => setAnthropicApiKey(e.target.value)}
                disabled={!anthropicEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anthropic-model">Modelo</Label>
              <Input
                id="anthropic-model"
                placeholder="claude-3-5-sonnet-20241022"
                value={anthropicModel}
                onChange={(e) => setAnthropicModel(e.target.value)}
                disabled={!anthropicEnabled}
              />
            </div>

            <Button
              variant="outline"
              onClick={() => handleTest('anthropic')}
              disabled={!anthropicEnabled || !anthropicApiKey || testing}
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Testar Conexão
            </Button>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
