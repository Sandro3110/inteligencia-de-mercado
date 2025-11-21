import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Bell, CheckCircle2, Loader2 } from 'lucide-react';

export default function TestNotifications() {
  const [title, setTitle] = useState('🧪 Notificação de Teste');
  const [message, setMessage] = useState('Sistema de notificações em tempo real funcionando perfeitamente!');

  const sendTestMutation = trpc.notifications.sendTestNotification.useMutation({
    onSuccess: (data) => {
      toast.success(data.message, {
        description: 'A notificação deve aparecer no badge e no toast em instantes!',
        duration: 5000,
      });
    },
    onError: (error) => {
      toast.error('Erro ao enviar notificação', {
        description: error.message,
      });
    },
  });

  const handleSendTest = () => {
    sendTestMutation.mutate({ title, message });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500 rounded-lg">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Teste de Notificações</h1>
            <p className="text-muted-foreground">Valide o sistema de notificações em tempo real</p>
          </div>
        </div>

        {/* Instruções */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">Como funciona?</CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Este teste valida o fluxo completo de notificações em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">1. Criação no Backend</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  A notificação é salva no banco de dados via tRPC
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">2. Transmissão SSE</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  O servidor envia via Server-Sent Events para o frontend
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">3. Toast Interativo</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Um toast aparece na tela com a mensagem
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">4. Atualização do Badge</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  O contador de notificações no header é atualizado automaticamente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Teste */}
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título da notificação"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Input
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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

        {/* Resultado */}
        {sendTestMutation.isSuccess && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Notificação Enviada!
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Verifique o badge de notificações no header e aguarde o toast aparecer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-white dark:bg-slate-900 p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(sendTestMutation.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
