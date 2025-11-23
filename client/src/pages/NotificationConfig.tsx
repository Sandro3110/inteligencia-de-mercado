import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Bell,
  BellOff,
  Mail,
  Smartphone,
  Monitor,
  RotateCcw,
  Save,
  CheckCircle2,
  XCircle,
  Send,
  Settings,
  TestTube,
  Loader2,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

interface NotificationChannel {
  email?: boolean;
  push?: boolean;
  inApp?: boolean;
}

interface NotificationPreference {
  id: number;
  userId: string;
  type:
    | "lead_quality"
    | "lead_closed"
    | "new_competitor"
    | "market_threshold"
    | "data_incomplete"
    | "enrichment"
    | "validation"
    | "export"
    | "all";
  enabled: number;
  channels: NotificationChannel | null;
  createdAt: string | null;
  updatedAt: string | null;
}

const NOTIFICATION_TYPES = [
  {
    value: "lead_quality",
    label: "Qualidade de Lead",
    description: "Notificações sobre leads de alta qualidade identificados",
  },
  {
    value: "lead_closed",
    label: "Lead Fechado",
    description: "Quando um lead é marcado como fechado/convertido",
  },
  {
    value: "new_competitor",
    label: "Novo Concorrente",
    description: "Quando um novo concorrente é identificado no mercado",
  },
  {
    value: "market_threshold",
    label: "Limite de Mercado",
    description: "Alertas quando mercados atingem limites configurados",
  },
  {
    value: "data_incomplete",
    label: "Dados Incompletos",
    description: "Quando dados importantes estão faltando",
  },
  {
    value: "enrichment",
    label: "Enriquecimento",
    description: "Status e conclusão de processos de enriquecimento",
  },
  {
    value: "validation",
    label: "Validação",
    description: "Solicitações e status de validação de dados",
  },
  {
    value: "export",
    label: "Exportação",
    description: "Conclusão de exportações e relatórios",
  },
];

export default function NotificationConfig() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Estados para aba Preferências
  const [hasChanges, setHasChanges] = useState(false);
  const [localPreferences, setLocalPreferences] = useState<
    Record<string, { enabled: boolean; channels: NotificationChannel }>
  >({});

  // Estados para aba Web Push
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  // Estados para aba Teste
  const [testTitle, setTestTitle] = useState("🧪 Notificação de Teste");
  const [testMessage, setTestMessage] = useState(
    "Sistema de notificações em tempo real funcionando perfeitamente!"
  );

  // Queries
  const {
    data: preferences,
    isLoading,
    refetch,
  } = trpc.notifications.getPreferences.useQuery();
  const { data: vapidKey } = trpc.push.getPublicKey.useQuery();

  // Mutations - Preferências
  const updatePreference = trpc.notifications.updatePreference.useMutation();
  const resetPreferences = trpc.notifications.resetPreferences.useMutation();

  // Mutations - Web Push
  const subscribe = trpc.push.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Subscrição de push salva com sucesso!");
      setIsSubscribed(true);
    },
    onError: (error: any) => {
      toast.error(`Erro ao salvar subscrição: ${error.message}`);
    },
  });

  const unsubscribe = trpc.push.unsubscribe.useMutation({
    onSuccess: () => {
      toast.success("Subscrição de push removida!");
      setIsSubscribed(false);
    },
  });

  const testPush = trpc.push.sendTest.useMutation({
    onSuccess: () => {
      toast.success("Notificação de teste enviada!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao enviar teste: ${error.message}`);
    },
  });

  // Mutations - Teste
  const sendTestMutation = trpc.notifications.sendTestNotification.useMutation({
    onSuccess: data => {
      toast.success(data.message, {
        description:
          "A notificação deve aparecer no badge e no toast em instantes!",
        duration: 5000,
      });
    },
    onError: error => {
      toast.error("Erro ao enviar notificação", {
        description: error.message,
      });
    },
  });

  // Inicializar preferências locais quando os dados chegarem
  useEffect(() => {
    if (preferences) {
      const prefs: Record<
        string,
        { enabled: boolean; channels: NotificationChannel }
      > = {};
      preferences.forEach((pref: NotificationPreference) => {
        prefs[pref.type] = {
          enabled: pref.enabled === 1,
          channels: pref.channels || { inApp: true },
        };
      });
      setLocalPreferences(prefs);
    }
  }, [preferences]);

  // Verificar suporte e permissão para Web Push
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Registrar Service Worker
  useEffect(() => {
    if (!isSupported) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then(reg => {
        console.log("[Push] Service Worker registrado:", reg);
        setRegistration(reg);

        return reg.pushManager.getSubscription();
      })
      .then(sub => {
        if (sub) {
          setIsSubscribed(true);
        }
      })
      .catch(error => {
        console.error("[Push] Erro ao registrar Service Worker:", error);
        toast.error("Erro ao registrar Service Worker");
      });
  }, [isSupported]);

  const getPreference = (type: string) => {
    return (
      localPreferences[type] || { enabled: true, channels: { inApp: true } }
    );
  };

  const handleToggleEnabled = (type: string, enabled: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      [type]: { ...getPreference(type), enabled },
    }));
    setHasChanges(true);
  };

  const handleToggleChannel = (
    type: string,
    channel: keyof NotificationChannel,
    value: boolean
  ) => {
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

  const requestPermission = async () => {
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "granted") {
        toast.success("Permissão concedida!");
      } else if (perm === "denied") {
        toast.error(
          "Permissão negada. Habilite nas configurações do navegador."
        );
      }
    } catch (error) {
      console.error("[Push] Erro ao solicitar permissão:", error);
      toast.error("Erro ao solicitar permissão");
    }
  };

  const subscribeToPush = async () => {
    if (!registration || !vapidKey) {
      toast.error("Service Worker ou chave VAPID não disponível");
      return;
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const subscriptionJSON = subscription.toJSON();

      await subscribe.mutateAsync({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscriptionJSON.keys?.p256dh || "",
          auth: subscriptionJSON.keys?.auth || "",
        },
      });
    } catch (error) {
      console.error("[Push] Erro ao subscrever:", error);
      toast.error("Erro ao subscrever push notifications");
    }
  };

  const unsubscribeFromPush = async () => {
    if (!registration) return;

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await unsubscribe.mutateAsync({ endpoint: subscription.endpoint });
      }
    } catch (error) {
      console.error("[Push] Erro ao desinscrever:", error);
      toast.error("Erro ao remover subscrição");
    }
  };

  const sendTestNotification = () => {
    testPush.mutate();
  };

  const handleSendTest = () => {
    sendTestMutation.mutate({ title: testTitle, message: testMessage });
  };

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8">
          <Alert>
            <AlertDescription>
              Faça login para configurar notificações.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="h-8 w-8" />
              Configurações de Notificações
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure preferências, web push e teste o sistema de notificações
            </p>
          </div>
        </div>

        <Tabs defaultValue="preferencias" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preferencias">
              <Bell className="h-4 w-4 mr-2" />
              Preferências
            </TabsTrigger>
            <TabsTrigger value="webpush">
              <Smartphone className="h-4 w-4 mr-2" />
              Web Push
            </TabsTrigger>
            <TabsTrigger value="teste">
              <TestTube className="h-4 w-4 mr-2" />
              Teste
            </TabsTrigger>
          </TabsList>

          {/* ABA 1: PREFERÊNCIAS */}
          <TabsContent value="preferencias" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Preferências de Notificações
                </h2>
                <p className="text-muted-foreground mt-1">
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

            <Card>
              <CardHeader>
                <CardTitle>Tipos de Notificação</CardTitle>
                <CardDescription>
                  Escolha quais notificações você deseja receber e por quais
                  canais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {NOTIFICATION_TYPES.map((notifType, index) => {
                  const pref = getPreference(notifType.value);

                  return (
                    <div key={notifType.value}>
                      {index > 0 && <Separator className="my-4" />}

                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={pref.enabled}
                                onCheckedChange={checked =>
                                  handleToggleEnabled(notifType.value, checked)
                                }
                              />
                              <div>
                                <Label className="text-base font-semibold cursor-pointer">
                                  {notifType.label}
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notifType.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {pref.enabled && (
                          <div className="ml-11 space-y-3 bg-muted/30 p-4 rounded-lg">
                            <p className="text-sm font-medium mb-3">
                              Canais de Notificação:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="flex items-center gap-3 p-3 bg-background rounded-md border">
                                <Switch
                                  checked={pref.channels.inApp ?? true}
                                  onCheckedChange={checked =>
                                    handleToggleChannel(
                                      notifType.value,
                                      "inApp",
                                      checked
                                    )
                                  }
                                />
                                <Monitor className="w-4 h-4 text-blue-600" />
                                <Label className="cursor-pointer">
                                  No Sistema
                                </Label>
                              </div>

                              <div className="flex items-center gap-3 p-3 bg-background rounded-md border">
                                <Switch
                                  checked={pref.channels.email ?? false}
                                  onCheckedChange={checked =>
                                    handleToggleChannel(
                                      notifType.value,
                                      "email",
                                      checked
                                    )
                                  }
                                />
                                <Mail className="w-4 h-4 text-green-600" />
                                <Label className="cursor-pointer">E-mail</Label>
                              </div>

                              <div className="flex items-center gap-3 p-3 bg-background rounded-md border">
                                <Switch
                                  checked={pref.channels.push ?? false}
                                  onCheckedChange={checked =>
                                    handleToggleChannel(
                                      notifType.value,
                                      "push",
                                      checked
                                    )
                                  }
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

            <Card>
              <CardHeader>
                <CardTitle>Sobre os Canais de Notificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Monitor className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">No Sistema</p>
                    <p>
                      Notificações aparecem dentro da plataforma, no ícone de
                      sino do menu
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">E-mail</p>
                    <p>
                      Notificações enviadas para o e-mail cadastrado na sua
                      conta
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Push</p>
                    <p>
                      Notificações push no navegador (requer permissão do
                      navegador)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 2: WEB PUSH */}
          <TabsContent value="webpush" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Configurações de Web Push</h2>
              <p className="text-muted-foreground mt-1">
                Configure notificações push para receber alertas mesmo quando o
                app estiver fechado
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Status do Navegador</CardTitle>
                <CardDescription>
                  Verificação de compatibilidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    Suporte a Push Notifications
                  </span>
                  {isSupported ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Suportado
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Não Suportado
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Permissão de Notificações</span>
                  <Badge
                    variant={
                      permission === "granted"
                        ? "default"
                        : permission === "denied"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {permission === "granted"
                      ? "Concedida"
                      : permission === "denied"
                        ? "Negada"
                        : "Não Solicitada"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Status da Subscrição</span>
                  {isSubscribed ? (
                    <Badge variant="default" className="gap-1">
                      <Bell className="h-3 w-3" />
                      Inscrito
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <BellOff className="h-3 w-3" />
                      Não Inscrito
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Subscrição</CardTitle>
                <CardDescription>
                  Ative ou desative notificações push
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isSupported && (
                  <Alert>
                    <AlertDescription>
                      Seu navegador não suporta Web Push Notifications. Use
                      Chrome, Firefox, Edge ou Safari.
                    </AlertDescription>
                  </Alert>
                )}

                {isSupported && permission === "default" && (
                  <Button onClick={requestPermission} className="w-full">
                    <Bell className="h-4 w-4 mr-2" />
                    Solicitar Permissão
                  </Button>
                )}

                {isSupported && permission === "denied" && (
                  <Alert>
                    <AlertDescription>
                      Permissão negada. Habilite notificações nas configurações
                      do navegador para este site.
                    </AlertDescription>
                  </Alert>
                )}

                {isSupported && permission === "granted" && !isSubscribed && (
                  <Button
                    onClick={subscribeToPush}
                    disabled={subscribe.isPending}
                    className="w-full"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    {subscribe.isPending
                      ? "Inscrevendo..."
                      : "Ativar Notificações Push"}
                  </Button>
                )}

                {isSupported && permission === "granted" && isSubscribed && (
                  <>
                    <Button
                      onClick={unsubscribeFromPush}
                      disabled={unsubscribe.isPending}
                      variant="outline"
                      className="w-full"
                    >
                      <BellOff className="h-4 w-4 mr-2" />
                      {unsubscribe.isPending
                        ? "Removendo..."
                        : "Desativar Notificações Push"}
                    </Button>

                    <Button
                      onClick={sendTestNotification}
                      disabled={testPush.isPending}
                      variant="secondary"
                      className="w-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {testPush.isPending
                        ? "Enviando..."
                        : "Enviar Notificação de Teste"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Como Funciona</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  • <strong>Web Push API</strong> permite que o servidor envie
                  notificações mesmo quando o app está fechado
                </p>
                <p>
                  • <strong>Service Worker</strong> roda em segundo plano e
                  recebe as notificações
                </p>
                <p>
                  • <strong>VAPID</strong> (Voluntary Application Server
                  Identification) autentica o servidor
                </p>
                <p>
                  • As notificações aparecem no sistema operacional, não apenas
                  no navegador
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 3: TESTE */}
          <TabsContent value="teste" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-lg">
                <TestTube className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Teste de Notificações</h2>
                <p className="text-muted-foreground">
                  Valide o sistema de notificações em tempo real
                </p>
              </div>
            </div>

            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">
                  Como funciona?
                </CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Este teste valida o fluxo completo de notificações em tempo
                  real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      1. Criação no Backend
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      A notificação é salva no banco de dados via tRPC
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      2. Transmissão SSE
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      O servidor envia via Server-Sent Events para o frontend
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      3. Toast Interativo
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Um toast aparece na tela com a mensagem
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      4. Atualização do Badge
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      O contador de notificações no header é atualizado
                      automaticamente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enviar Notificação de Teste</CardTitle>
                <CardDescription>
                  Personalize a mensagem e dispare uma notificação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={testTitle}
                    onChange={e => setTestTitle(e.target.value)}
                    placeholder="Digite o título da notificação"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Input
                    id="message"
                    value={testMessage}
                    onChange={e => setTestMessage(e.target.value)}
                    placeholder="Digite a mensagem da notificação"
                  />
                </div>

                <Button
                  onClick={handleSendTest}
                  disabled={sendTestMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {sendTestMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Enviar Notificação de Teste
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {sendTestMutation.isSuccess && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Notificação Enviada!
                  </CardTitle>
                  <CardDescription className="text-green-700 dark:text-green-300">
                    Verifique o badge de notificações no header e aguarde o
                    toast aparecer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-white dark:bg-slate-900 p-4 rounded-lg text-sm overflow-auto">
                    {JSON.stringify(sendTestMutation.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
