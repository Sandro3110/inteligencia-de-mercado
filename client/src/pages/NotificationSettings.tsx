import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Bell, Volume2, Monitor, RotateCcw, Loader2 } from 'lucide-react';

/**
 * Página de Configurações de Notificações
 * Fase 69: Sistema Completo de Notificações em Tempo Real
 */
export default function NotificationSettings() {
  const { data: preferences, isLoading, refetch } = trpc.preferences.get.useQuery();
  const updateMutation = trpc.preferences.update.useMutation({
    onSuccess: () => {
      toast.success('Preferências atualizadas com sucesso!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar preferências: ${error.message}`);
    },
  });
  const resetMutation = trpc.preferences.reset.useMutation({
    onSuccess: () => {
      toast.success('Preferências resetadas para padrão!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao resetar preferências: ${error.message}`);
    },
  });

  const [soundEnabled, setSoundEnabled] = useState(preferences?.notificationSoundEnabled === 1);
  const [volume, setVolume] = useState(preferences?.notificationVolume || 50);
  const [desktopEnabled, setDesktopEnabled] = useState(preferences?.desktopNotificationsEnabled === 1);

  // Atualizar estados quando preferências carregarem
  if (preferences && !isLoading) {
    if (soundEnabled !== (preferences.notificationSoundEnabled === 1)) {
      setSoundEnabled(preferences.notificationSoundEnabled === 1);
    }
    if (volume !== preferences.notificationVolume) {
      setVolume(preferences.notificationVolume);
    }
    if (desktopEnabled !== (preferences.desktopNotificationsEnabled === 1)) {
      setDesktopEnabled(preferences.desktopNotificationsEnabled === 1);
    }
  }

  const handleSave = () => {
    updateMutation.mutate({
      notificationSoundEnabled: soundEnabled,
      notificationVolume: volume,
      desktopNotificationsEnabled: desktopEnabled,
    });
  };

  const handleReset = () => {
    resetMutation.mutate();
  };

  const handleTestSound = () => {
    // Tocar som de notificação
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = volume / 100;
    audio.play().catch((error) => {
      console.error('Erro ao tocar som:', error);
      toast.error('Erro ao tocar som de notificação');
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações de Notificações</h1>
        <p className="text-muted-foreground mt-2">
          Personalize como você recebe notificações do sistema
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Sons de Notificação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Sons de Notificação
            </CardTitle>
            <CardDescription>
              Configure alertas sonoros para novas notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-enabled">Ativar Sons</Label>
                <p className="text-sm text-muted-foreground">
                  Reproduzir som quando receber notificações
                </p>
              </div>
              <Switch
                id="sound-enabled"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>

            {soundEnabled && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Volume: {volume}%</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTestSound}
                      >
                        Testar Som
                      </Button>
                    </div>
                    <Slider
                      value={[volume]}
                      onValueChange={(values) => setVolume(values[0])}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notificações Desktop */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Notificações Desktop
            </CardTitle>
            <CardDescription>
              Exibir notificações do navegador (requer permissão)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="desktop-enabled">Ativar Notificações Desktop</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar notificações mesmo quando a aba não estiver ativa
                </p>
              </div>
              <Switch
                id="desktop-enabled"
                checked={desktopEnabled}
                onCheckedChange={(checked) => {
                  if (checked && Notification.permission === 'default') {
                    Notification.requestPermission().then((permission) => {
                      if (permission === 'granted') {
                        setDesktopEnabled(true);
                        toast.success('Permissão concedida!');
                      } else {
                        toast.error('Permissão negada');
                      }
                    });
                  } else {
                    setDesktopEnabled(checked);
                  }
                }}
              />
            </div>
            {desktopEnabled && Notification.permission === 'denied' && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Permissão de notificações bloqueada. Habilite nas configurações do navegador.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tipos de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Tipos de Notificações
            </CardTitle>
            <CardDescription>
              Eventos que geram notificações em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
                <div>
                  <p className="font-medium">Enriquecimento Concluído</p>
                  <p className="text-muted-foreground">Quando processamento de dados termina</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                <div>
                  <p className="font-medium">Nova Pesquisa Criada</p>
                  <p className="text-muted-foreground">Quando uma pesquisa é adicionada</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500 mt-1.5" />
                <div>
                  <p className="font-medium">Validação em Lote</p>
                  <p className="text-muted-foreground">Quando múltiplos itens são validados</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500 mt-1.5" />
                <div>
                  <p className="font-medium">Exportação Concluída</p>
                  <p className="text-muted-foreground">Quando arquivo de exportação é gerado</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mt-1.5" />
                <div>
                  <p className="font-medium">Alertas de Qualidade</p>
                  <p className="text-muted-foreground">Quando detectados problemas de qualidade</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex-1"
          >
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Configurações
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
