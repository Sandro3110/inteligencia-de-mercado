import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Bell, Mail, Smartphone, Monitor, RotateCcw, Save } from "lucide-react";
import { DynamicBreadcrumbs } from "@/components/DynamicBreadcrumbs";

interface NotificationChannel {
  email?: boolean;
  push?: boolean;
  inApp?: boolean;
}

interface NotificationPreference {
  id: number;
  userId: string;
  type: string;
  enabled: number;
  channels: NotificationChannel;
  createdAt: string;
  updatedAt: string;
}

const NOTIFICATION_TYPES = [
  { value: 'lead_quality', label: 'Qualidade de Lead', description: 'Notificações sobre leads de alta qualidade identificados' },
  { value: 'lead_closed', label: 'Lead Fechado', description: 'Quando um lead é marcado como fechado/convertido' },
  { value: 'new_competitor', label: 'Novo Concorrente', description: 'Quando um novo concorrente é identificado no mercado' },
  { value: 'market_threshold', label: 'Limite de Mercado', description: 'Alertas quando mercados atingem limites configurados' },
  { value: 'data_incomplete', label: 'Dados Incompletos', description: 'Quando dados importantes estão faltando' },
  { value: 'enrichment', label: 'Enriquecimento', description: 'Status e conclusão de processos de enriquecimento' },
  { value: 'validation', label: 'Validação', description: 'Solicitações e status de validação de dados' },
  { value: 'export', label: 'Exportação', description: 'Conclusão de exportações e relatórios' },
];

export default function NotificationPreferences() {
  const { data: preferences, isLoading, refetch } = trpc.notifications.getPreferences.useQuery();
  const updatePreference = trpc.notifications.updatePreference.useMutation();
  const resetPreferences = trpc.notifications.resetPreferences.useMutation();
  
  const [hasChanges, setHasChanges] = useState(false);
  const [localPreferences, setLocalPreferences] = useState<Record<string, { enabled: boolean; channels: NotificationChannel }>>({});

  // Inicializar preferências locais quando os dados chegarem
  useState(() => {
    if (preferences) {
      const prefs: Record<string, { enabled: boolean; channels: NotificationChannel }> = {};
      preferences.forEach((pref: NotificationPreference) => {
        prefs[pref.type] = {
          enabled: pref.enabled === 1,
          channels: pref.channels || { inApp: true },
        };
      });
      setLocalPreferences(prefs);
    }
  });

  const getPreference = (type: string) => {
    return localPreferences[type] || { enabled: true, channels: { inApp: true } };
  };

  const handleToggleEnabled = (type: string, enabled: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      [type]: { ...getPreference(type), enabled },
    }));
    setHasChanges(true);
  };

  const handleToggleChannel = (type: string, channel: keyof NotificationChannel, value: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      [type]: {
        ...getPreference(type),
        channels: { ...getPreference(type).channels, [channel]: value },
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const updates = Object.entries(localPreferences).map(([type, pref]) =>
        updatePreference.mutateAsync({
          type,
          enabled: pref.enabled,
          channels: pref.channels,
        })
      );

      await Promise.all(updates);
      
      toast.success("Preferências salvas com sucesso!");
      setHasChanges(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar preferências");
      console.error(error);
    }
  };

  const handleReset = async () => {
    try {
      await resetPreferences.mutateAsync();
      toast.success("Preferências restauradas para os padrões");
      setHasChanges(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao restaurar preferências");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <DynamicBreadcrumbs />
      
      <div className="max-w-4xl mx-auto space-y-6 mt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-600" />
              Preferências de Notificações
            </h1>
            <p className="text-slate-600 mt-2">
              Configure como e quando você deseja receber notificações
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={resetPreferences.isPending}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restaurar Padrões
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updatePreference.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>

        {/* Tipos de Notificação */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Notificação</CardTitle>
            <CardDescription>
              Escolha quais notificações você deseja receber e por quais canais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {NOTIFICATION_TYPES.map((notifType, index) => {
              const pref = getPreference(notifType.value);
              
              return (
                <div key={notifType.value}>
                  {index > 0 && <Separator className="my-4" />}
                  
                  <div className="space-y-4">
                    {/* Header do Tipo */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={pref.enabled}
                            onCheckedChange={(checked) => handleToggleEnabled(notifType.value, checked)}
                          />
                          <div>
                            <Label className="text-base font-semibold cursor-pointer">
                              {notifType.label}
                            </Label>
                            <p className="text-sm text-slate-600 mt-1">
                              {notifType.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Canais (só aparecem se estiver ativado) */}
                    {pref.enabled && (
                      <div className="ml-11 space-y-3 bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-slate-700 mb-3">
                          Canais de Notificação:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* In-App */}
                          <div className="flex items-center gap-3 p-3 bg-white rounded-md border border-slate-200">
                            <Switch
                              checked={pref.channels.inApp ?? true}
                              onCheckedChange={(checked) => handleToggleChannel(notifType.value, 'inApp', checked)}
                            />
                            <Monitor className="w-4 h-4 text-blue-600" />
                            <Label className="cursor-pointer">No Sistema</Label>
                          </div>

                          {/* Email */}
                          <div className="flex items-center gap-3 p-3 bg-white rounded-md border border-slate-200">
                            <Switch
                              checked={pref.channels.email ?? false}
                              onCheckedChange={(checked) => handleToggleChannel(notifType.value, 'email', checked)}
                            />
                            <Mail className="w-4 h-4 text-green-600" />
                            <Label className="cursor-pointer">E-mail</Label>
                          </div>

                          {/* Push */}
                          <div className="flex items-center gap-3 p-3 bg-white rounded-md border border-slate-200">
                            <Switch
                              checked={pref.channels.push ?? false}
                              onCheckedChange={(checked) => handleToggleChannel(notifType.value, 'push', checked)}
                            />
                            <Smartphone className="w-4 h-4 text-purple-600" />
                            <Label className="cursor-pointer">Push</Label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Sobre os Canais de Notificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <Monitor className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">No Sistema</p>
                <p>Notificações aparecem dentro da plataforma, no ícone de sino do menu</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">E-mail</p>
                <p>Notificações enviadas para o e-mail cadastrado na sua conta</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">Push</p>
                <p>Notificações push no navegador (requer permissão do navegador)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
