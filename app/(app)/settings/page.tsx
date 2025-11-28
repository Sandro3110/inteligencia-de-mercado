'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Settings, Key, Save, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);

  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');

  const trpcUtils = trpc.useUtils();

  // Queries
  const { data: settings, isLoading } = trpc.settings.getAll.useQuery(undefined, {
    onSuccess: (data) => {
      const openai = data.find((s) => s.settingKey === 'OPENAI_API_KEY');
      const gemini = data.find((s) => s.settingKey === 'GEMINI_API_KEY');
      const anthropic = data.find((s) => s.settingKey === 'ANTHROPIC_API_KEY');

      if (openai?.settingValue) setOpenaiKey(openai.settingValue);
      if (gemini?.settingValue) setGeminiKey(gemini.settingValue);
      if (anthropic?.settingValue) setAnthropicKey(anthropic.settingValue);
    },
  });

  // Mutations
  const saveMutation = trpc.settings.set.useMutation({
    onSuccess: () => {
      toast.success('Configurações salvas com sucesso!');
      trpcUtils.settings.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  const handleSave = async () => {
    try {
      await Promise.all([
        openaiKey &&
          saveMutation.mutateAsync({
            key: 'OPENAI_API_KEY',
            value: openaiKey,
            description: 'OpenAI API Key para enriquecimento',
          }),
        geminiKey &&
          saveMutation.mutateAsync({
            key: 'GEMINI_API_KEY',
            value: geminiKey,
            description: 'Google Gemini API Key',
          }),
        anthropicKey &&
          saveMutation.mutateAsync({
            key: 'ANTHROPIC_API_KEY',
            value: anthropicKey,
            description: 'Anthropic Claude API Key',
          }),
      ]);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8" />
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
            <div className="h-10 bg-gray-200 rounded mb-4" />
            <div className="h-10 bg-gray-200 rounded mb-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" />
          Configurações
        </h1>
        <p className="text-gray-600">Gerencie as configurações do sistema</p>
      </div>

      {/* API Keys Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys de IA
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure as chaves de API para os serviços de inteligência artificial
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* OpenAI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">OpenAI API Key *</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type={showOpenAI ? 'text' : 'password'}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenAI(!showOpenAI)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOpenAI ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Obtenha sua chave em{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                platform.openai.com
              </a>
            </p>
          </div>

          {/* Gemini */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Gemini API Key
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type={showGemini ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIza..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Obtenha sua chave em{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                makersuite.google.com
              </a>
            </p>
          </div>

          {/* Anthropic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anthropic Claude API Key
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type={showAnthropic ? 'text' : 'password'}
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowAnthropic(!showAnthropic)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showAnthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Obtenha sua chave em{' '}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                console.anthropic.com
              </a>
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || !openaiKey}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
            {!openaiKey && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ A chave OpenAI é obrigatória para o enriquecimento funcionar
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Sobre as API Keys</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• As chaves são armazenadas de forma segura no banco de dados</li>
          <li>• A chave OpenAI é usada para o enriquecimento de dados com IA</li>
          <li>• As chaves Gemini e Claude são opcionais (futuro)</li>
          <li>• Você pode alterar as chaves a qualquer momento</li>
        </ul>
      </div>
    </div>
  );
}
