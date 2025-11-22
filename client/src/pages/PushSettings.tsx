import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, BellOff, CheckCircle2, XCircle, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function PushSettings() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const utils = trpc.useUtils();

  // Mutation para salvar subscrição
  const subscribe = trpc.push.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Subscrição de push salva com sucesso!");
      setIsSubscribed(true);
    },
    onError: (error: any) => {
      toast.error(`Erro ao salvar subscrição: ${error.message}`);
    },
  });

  // Mutation para remover subscrição
  const unsubscribe = trpc.push.unsubscribe.useMutation({
    onSuccess: () => {
      toast.success("Subscrição de push removida!");
      setIsSubscribed(false);
    },
  });

  // Mutation para testar envio de push
  const testPush = trpc.push.sendTest.useMutation({
    onSuccess: () => {
      toast.success("Notificação de teste enviada!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao enviar teste: ${error.message}`);
    },
  });

  // Query para obter chave pública VAPID
  const { data: vapidKey } = trpc.push.getPublicKey.useQuery();

  // Verificar suporte e permissão
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Registrar Service Worker
  useEffect(() => {
    if (!isSupported) return;

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[Push] Service Worker registrado:', reg);
        setRegistration(reg);

        // Verificar se já está subscrito
        return reg.pushManager.getSubscription();
      })
      .then((sub) => {
        if (sub) {
          setIsSubscribed(true);
        }
      })
      .catch((error) => {
        console.error('[Push] Erro ao registrar Service Worker:', error);
        toast.error('Erro ao registrar Service Worker');
      });
  }, [isSupported]);

  const requestPermission = async () => {
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        toast.success('Permissão concedida!');
      } else if (perm === 'denied') {
        toast.error('Permissão negada. Habilite nas configurações do navegador.');
      }
    } catch (error) {
      console.error('[Push] Erro ao solicitar permissão:', error);
      toast.error('Erro ao solicitar permissão');
    }
  };

  const subscribeToPush = async () => {
    if (!registration || !vapidKey) {
      toast.error('Service Worker ou chave VAPID não disponível');
      return;
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const subscriptionJSON = subscription.toJSON();

      // Enviar subscrição ao backend
      await subscribe.mutateAsync({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscriptionJSON.keys?.p256dh || '',
          auth: subscriptionJSON.keys?.auth || '',
        },
      });
    } catch (error) {
      console.error('[Push] Erro ao subscrever:', error);
      toast.error('Erro ao subscrever push notifications');
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
      console.error('[Push] Erro ao desinscrever:', error);
      toast.error('Erro ao remover subscrição');
    }
  };

  const sendTestNotification = () => {
    testPush.mutate();
  };

  // Converter chave VAPID de base64url para Uint8Array
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>Faça login para configurar notificações push.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações de Web Push</h1>
        <p className="text-muted-foreground">
          Configure notificações push para receber alertas mesmo quando o app estiver fechado
        </p>
      </div>

      {/* Status do Suporte */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Navegador</CardTitle>
          <CardDescription>Verificação de compatibilidade</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Suporte a Push Notifications</span>
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
                permission === 'granted'
                  ? 'default'
                  : permission === 'denied'
                  ? 'destructive'
                  : 'secondary'
              }
            >
              {permission === 'granted'
                ? 'Concedida'
                : permission === 'denied'
                ? 'Negada'
                : 'Não Solicitada'}
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

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Subscrição</CardTitle>
          <CardDescription>Ative ou desative notificações push</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSupported && (
            <Alert>
              <AlertDescription>
                Seu navegador não suporta Web Push Notifications. Use Chrome, Firefox, Edge ou Safari.
              </AlertDescription>
            </Alert>
          )}

          {isSupported && permission === 'default' && (
            <Button onClick={requestPermission} className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              Solicitar Permissão
            </Button>
          )}

          {isSupported && permission === 'denied' && (
            <Alert>
              <AlertDescription>
                Permissão negada. Habilite notificações nas configurações do navegador para este site.
              </AlertDescription>
            </Alert>
          )}

          {isSupported && permission === 'granted' && !isSubscribed && (
            <Button onClick={subscribeToPush} disabled={subscribe.isPending} className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              {subscribe.isPending ? 'Inscrevendo...' : 'Ativar Notificações Push'}
            </Button>
          )}

          {isSupported && permission === 'granted' && isSubscribed && (
            <>
              <Button
                onClick={unsubscribeFromPush}
                disabled={unsubscribe.isPending}
                variant="outline"
                className="w-full"
              >
                <BellOff className="h-4 w-4 mr-2" />
                {unsubscribe.isPending ? 'Removendo...' : 'Desativar Notificações Push'}
              </Button>

              <Button
                onClick={sendTestNotification}
                disabled={testPush.isPending}
                variant="secondary"
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {testPush.isPending ? 'Enviando...' : 'Enviar Notificação de Teste'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Informações */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>Web Push API</strong> permite que o servidor envie notificações mesmo quando o app está fechado
          </p>
          <p>
            • <strong>Service Worker</strong> roda em segundo plano e recebe as notificações
          </p>
          <p>
            • <strong>VAPID</strong> (Voluntary Application Server Identification) autentica o servidor
          </p>
          <p>
            • As notificações aparecem no sistema operacional, não apenas no navegador
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
