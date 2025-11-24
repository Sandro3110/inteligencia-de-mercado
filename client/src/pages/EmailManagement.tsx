import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Settings,
  TestTube,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function EmailManagement() {
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Query para configuração de email
  const { data: emailConfig, isLoading, refetch } = trpc.emailConfig.get.useQuery();

  // Mutation para testar configuração
  const testConfigMutation = trpc.emailConfig.test.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSuccess("Email de teste enviado com sucesso!");
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.error || "Erro ao enviar email");
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Mutation para enviar email de teste customizado
  const sendTestMutation = trpc.emailConfig.sendTest.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSuccess(`Email enviado para ${testEmail}!`);
        setTestDialogOpen(false);
        setTestEmail("");
        setTestName("");
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.error || "Erro ao enviar email");
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleTestConfig = () => {
    setError("");
    testConfigMutation.mutate();
  };

  const handleSendTest = () => {
    setError("");
    if (!testEmail || !testName) {
      setError("Por favor, preencha todos os campos");
      return;
    }
    sendTestMutation.mutate({
      recipientEmail: testEmail,
      recipientName: testName,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gerenciamento de Emails
        </h1>
        <p className="text-gray-600">
          Configure e teste o sistema de envio de emails transacionais
        </p>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="test">Testes</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Aba Status */}
        <TabsContent value="status" className="space-y-6">
          {/* Card de Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle>Status da Configuração</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
              <CardDescription>
                Informações sobre a configuração atual do Resend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Geral */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                {emailConfig?.configured ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-600">
                        Resend Configurado
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sistema pronto para enviar emails
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-600">
                        Resend Não Configurado
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Configure RESEND_API_KEY nas variáveis de ambiente
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Detalhes da Configuração */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">API Key</Label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={emailConfig?.apiKeyConfigured ? "default" : "secondary"}
                      className={
                        emailConfig?.apiKeyConfigured
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {emailConfig?.apiKeyConfigured ? "Configurada" : "Não Configurada"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email Remetente</Label>
                  <p className="text-sm text-muted-foreground">
                    {emailConfig?.fromEmail || "Não configurado"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">URL da Aplicação</Label>
                  <p className="text-sm text-muted-foreground">
                    {emailConfig?.appUrl || "Não configurado"}
                  </p>
                </div>
              </div>

              {/* Instruções */}
              {!emailConfig?.configured && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-sm text-blue-900 mb-2">
                    📋 Como Configurar:
                  </h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>
                      Crie uma conta em{" "}
                      <a
                        href="https://resend.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-600"
                      >
                        resend.com
                      </a>
                    </li>
                    <li>Adicione e verifique seu domínio</li>
                    <li>Gere uma API Key no dashboard</li>
                    <li>Configure as variáveis de ambiente no servidor</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Testes */}
        <TabsContent value="test" className="space-y-6">
          {/* Teste Rápido */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-primary" />
                <CardTitle>Teste Rápido</CardTitle>
              </div>
              <CardDescription>
                Envia um email de teste para o endereço configurado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleTestConfig}
                disabled={testConfigMutation.isPending || !emailConfig?.configured}
                className="w-full sm:w-auto"
              >
                {testConfigMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Email de Teste
                  </>
                )}
              </Button>
              {!emailConfig?.configured && (
                <p className="text-sm text-muted-foreground mt-2">
                  Configure o Resend primeiro para enviar emails de teste
                </p>
              )}
            </CardContent>
          </Card>

          {/* Teste Customizado */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>Teste Customizado</CardTitle>
              </div>
              <CardDescription>
                Envie um email de boas-vindas para um destinatário específico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setTestDialogOpen(true)}
                disabled={!emailConfig?.configured}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviar Email Customizado
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Templates */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Templates Disponíveis</CardTitle>
              <CardDescription>
                Templates de email configurados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Template de Convite */}
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Email de Convite</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enviado quando um admin convida um novo usuário para o sistema
                  </p>
                  <Badge variant="secondary">Automático</Badge>
                </div>

                {/* Template de Aprovação */}
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium">Email de Aprovação</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enviado quando um admin aprova o cadastro de um usuário
                  </p>
                  <Badge variant="secondary">Automático</Badge>
                </div>

                {/* Template de Rejeição */}
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <h3 className="font-medium">Email de Rejeição</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enviado quando um cadastro é rejeitado (opcional)
                  </p>
                  <Badge variant="secondary">Manual</Badge>
                </div>

                {/* Template de Boas-vindas */}
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-purple-600" />
                    <h3 className="font-medium">Email de Boas-vindas</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enviado no primeiro login do usuário no sistema
                  </p>
                  <Badge variant="secondary">Futuro</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Teste Customizado */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Email de Teste</DialogTitle>
            <DialogDescription>
              Envie um email de boas-vindas para testar a configuração
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="test-email">Email do Destinatário</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                disabled={sendTestMutation.isPending}
              />
            </div>

            <div>
              <Label htmlFor="test-name">Nome do Destinatário</Label>
              <Input
                id="test-name"
                type="text"
                placeholder="João Silva"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                disabled={sendTestMutation.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTestDialogOpen(false)}
              disabled={sendTestMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendTest}
              disabled={sendTestMutation.isPending}
            >
              {sendTestMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
