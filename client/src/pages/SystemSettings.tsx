import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, MapPin, Key, Mail, Send, CheckCircle } from "lucide-react";

export default function SystemSettings() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados para configuração de email
  const [resendApiKey, setResendApiKey] = useState("");
  const [emailFrom, setEmailFrom] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Query para buscar API Key atual
  const { data: currentSettings, isLoading } =
    trpc.settings.getGoogleMapsApiKey.useQuery(undefined, {
      enabled: isAuthenticated,
    });
  
  // Query para buscar configuração de email
  const { data: emailConfig, isLoading: isLoadingEmail } =
    trpc.emailConfig.get.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  // Atualizar estado quando dados chegarem
  useEffect(() => {
    if (currentSettings?.apiKey) {
      setApiKey(currentSettings.apiKey);
    }
  }, [currentSettings]);
  
  useEffect(() => {
    if (emailConfig) {
      setEmailFrom(emailConfig.fromEmail || "");
      setAppUrl(emailConfig.appUrl || "");
    }
  }, [emailConfig]);

  // Mutation para salvar API Key
  const saveMutation = trpc.settings.setGoogleMapsApiKey.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
      setIsSaving(false);
    },
    onError: error => {
      toast.error(`Erro ao salvar: ${error.message}`);
      setIsSaving(false);
    },
  });
  
  // Mutation para testar email
  const testEmailMutation = trpc.emailConfig.test.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Email de teste enviado com sucesso!");
      } else {
        toast.error(`Erro ao enviar email: ${data.error}`);
      }
      setIsTesting(false);
    },
    onError: (error) => {
      toast.error(`Erro ao testar email: ${error.message}`);
      setIsTesting(false);
    },
  });

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("Por favor, insira uma API Key válida");
      return;
    }

    setIsSaving(true);
    saveMutation.mutate({ apiKey: apiKey.trim() });
  };
  
  const handleTestEmail = () => {
    if (!emailConfig?.configured) {
      toast.error("Configure a API Key do Resend primeiro nas variáveis de ambiente");
      return;
    }
    
    setIsTesting(true);
    testEmailMutation.mutate();
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você precisa estar autenticado para acessar as configurações do
              sistema.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
        <p className="text-muted-foreground mt-2">
          Configure integrações e APIs externas
        </p>
      </div>

      {/* Google Maps API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>Google Maps API</CardTitle>
          </div>
          <CardDescription>
            Configure a API Key do Google Maps para habilitar geocodificação e
            visualização de mapas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="googleMapsApiKey"
              className="flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              API Key
            </Label>
            <Input
              id="googleMapsApiKey"
              type="text"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Obtenha sua API Key em:{" "}
              <a
                href="https://console.cloud.google.com/google/maps-apis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Cloud Console
              </a>
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">📋 Instruções:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Acesse o Google Cloud Console</li>
              <li>Crie um novo projeto ou selecione um existente</li>
              <li>Ative a API "Geocoding API" e "Maps JavaScript API"</li>
              <li>Crie uma credencial do tipo "API Key"</li>
              <li>Cole a chave gerada no campo acima</li>
            </ol>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || !apiKey.trim()}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resend Email Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Configuração de Email (Resend)</CardTitle>
          </div>
          <CardDescription>
            Configure o serviço Resend para envio de emails transacionais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status da Configuração */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            {emailConfig?.configured ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Resend configurado e pronto para uso
                </span>
              </>
            ) : (
              <>
                <Mail className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">
                  Resend não configurado - Configure RESEND_API_KEY nas variáveis de ambiente
                </span>
              </>
            )}
          </div>

          {/* Informações Atuais */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Email Remetente</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {emailConfig?.fromEmail || "Não configurado"}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">URL da Aplicação</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {emailConfig?.appUrl || "Não configurado"}
              </p>
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">📋 Como Configurar:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Crie uma conta em <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com</a></li>
              <li>Adicione e verifique seu domínio</li>
              <li>Gere uma API Key no dashboard</li>
              <li>Configure as variáveis de ambiente no servidor:</li>
            </ol>
            <div className="mt-2 p-3 bg-background rounded border font-mono text-xs">
              <div>RESEND_API_KEY=re_sua_api_key_aqui</div>
              <div>EMAIL_FROM=Intelmarket &lt;noreply@seudominio.com&gt;</div>
              <div>APP_URL=https://seudominio.com</div>
            </div>
          </div>

          {/* Botão de Teste */}
          <div className="flex gap-2">
            <Button
              onClick={handleTestEmail}
              disabled={isTesting || !emailConfig?.configured}
              variant="outline"
            >
              {isTesting ? (
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
          </div>

          {emailConfig?.configured && (
            <p className="text-xs text-muted-foreground">
              O email de teste será enviado para o endereço configurado em EMAIL_FROM
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
