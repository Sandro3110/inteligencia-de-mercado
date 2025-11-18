import { useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Upload, FileSpreadsheet } from 'lucide-react';
import { EnrichmentProgress, EnrichmentStep } from '@/components/EnrichmentProgress';
import { useEnrichmentProgress } from '@/hooks/useEnrichmentProgress';
import { TemplateSelector } from '@/components/TemplateSelector';
import { useLocation } from 'wouter';
import * as XLSX from 'xlsx';

export default function EnrichmentFlow() {
  const [, setLocation] = useLocation();
  const [projectName, setProjectName] = useState('');
  const [clientesText, setClientesText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const { steps: enrichmentSteps, currentStep, totalProgress, isComplete, error: sseError } = useEnrichmentProgress(jobId);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>();
  const [templateConfig, setTemplateConfig] = useState<any>(null);
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const enrichmentMutation = trpc.enrichment.execute.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setResult(null);
    setJobId(null);

    try {
      // Parsear texto de clientes (formato: nome|cnpj|site|produto por linha)
      const clientes = clientesText
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [nome, cnpj, site, produto] = line.split('|').map(s => s.trim());
          return { nome, cnpj, site, produto };
        });

      // Executar enriquecimento (progresso via SSE)
      const response = await enrichmentMutation.mutateAsync({ projectName, clientes });
      
      // Extrair jobId da resposta
      if ((response as any).jobId) {
        setJobId((response as any).jobId);
      }

      setResult(response);
    } catch (error) {
      setResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

      // Mapear colunas automaticamente
      const clientesFromFile = jsonData.map((row: any) => ({
        nome: row.Nome || row.nome || row.NOME || row['Razão Social'] || '',
        cnpj: row.CNPJ || row.cnpj || '',
        site: row.Site || row.site || row.Website || row.website || '',
        produto: row.Produto || row.produto || row.PRODUTO || '',
      }));

      // Converter para formato de texto
      const text = clientesFromFile
        .map(c => `${c.nome}|${c.cnpj}|${c.site}|${c.produto}`)
        .join('\n');
      
      setClientesText(text);
    } catch (error) {
      console.error('Erro ao ler arquivo:', error);
      alert('Erro ao processar arquivo. Verifique o formato.');
    }
  };

  const handleViewProject = () => {
    if (result?.data?.projectId) {
      // Redirecionar para o projeto criado
      setLocation('/');
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Enriquecimento Automatizado</h1>
          <p className="text-muted-foreground mt-2">
            Insira uma lista de clientes e crie automaticamente um novo projeto com dados enriquecidos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Escolha um Template</CardTitle>
            <CardDescription>
              Selecione um template pré-configurado para otimizar o processamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TemplateSelector
              selectedTemplateId={selectedTemplateId}
              onSelect={(templateId, config) => {
                setSelectedTemplateId(templateId);
                setTemplateConfig(config);
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuração do Projeto</CardTitle>
            <CardDescription>
              Defina o nome do projeto e insira os clientes para processamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectName">Nome do Projeto</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ex: Embalagens 2024"
                  required
                  disabled={isProcessing}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="clientes">Lista de Clientes</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={uploadMode === 'text' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUploadMode('text')}
                      disabled={isProcessing}
                    >
                      Texto
                    </Button>
                    <Button
                      type="button"
                      variant={uploadMode === 'file' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUploadMode('file')}
                      disabled={isProcessing}
                    >
                      <FileSpreadsheet className="mr-1 h-4 w-4" />
                      Arquivo
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {uploadMode === 'text'
                    ? 'Formato: Nome|CNPJ|Site|Produto (um por linha)'
                    : 'Upload de arquivo Excel (.xlsx) ou CSV'}
                </p>
                {uploadMode === 'text' ? (
                  <textarea
                    id="clientes"
                    value={clientesText}
                    onChange={(e) => setClientesText(e.target.value)}
                    placeholder={`Empresa ABC|12.345.678/0001-90|www.empresaabc.com.br|Embalagens plásticas
Indústria XYZ|98.765.432/0001-10|www.industriaxyz.com|Caixas de papelão
Fábrica 123||www.fabrica123.com|Embalagens metálicas`}
                    className="w-full h-48 p-3 border rounded-md font-mono text-sm"
                    required
                    disabled={isProcessing}
                  />
                ) : (
                  <div className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isProcessing}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar Arquivo Excel/CSV
                    </Button>
                    {clientesText && (
                      <div className="p-3 border rounded-md bg-muted">
                        <p className="text-sm font-medium mb-2">Prévia dos dados:</p>
                        <pre className="text-xs overflow-auto max-h-32">{clientesText}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={isProcessing} className="w-full">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Iniciar Processamento
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Progresso em Tempo Real */}
        {isProcessing && (
          <Card>
            <CardHeader>
              <CardTitle>Processamento em Andamento</CardTitle>
              <CardDescription>
                Acompanhe o progresso do enriquecimento automatizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnrichmentProgress 
                steps={enrichmentSteps}
                currentStep={currentStep}
                totalProgress={totalProgress}
              />
            </CardContent>
          </Card>
        )}

        {result && (
          <Alert variant={result.status === 'completed' ? 'default' : 'destructive'}>
            {result.status === 'completed' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">{result.message}</p>
                
                {result.data && (
                  <div className="mt-4 space-y-1 text-sm">
                    <p>✅ Projeto ID: {result.data.projectId}</p>
                    <p>✅ Mercados identificados: {result.data.mercadosCount}</p>
                    <p>✅ Clientes processados: {result.data.clientesCount}</p>
                    <p>✅ Concorrentes encontrados: {result.data.concorrentesCount}</p>
                    <p>✅ Leads identificados: {result.data.leadsCount}</p>
                    <p>✅ Score médio de qualidade: {result.data.avgQualityScore}/100</p>
                    
                    <Button 
                      onClick={handleViewProject} 
                      className="mt-4"
                      variant="outline"
                    >
                      Ver Projeto Criado
                    </Button>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">1. Identificação de Mercados</h3>
              <p className="text-muted-foreground">
                O sistema usa LLM para identificar automaticamente os mercados/setores a partir dos produtos dos clientes
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">2. Enriquecimento de Dados</h3>
              <p className="text-muted-foreground">
                Dados dos clientes são enriquecidos via APIs públicas (ReceitaWS, etc.) para completar informações faltantes
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">3. Busca de Concorrentes e Leads</h3>
              <p className="text-muted-foreground">
                Para cada mercado identificado, o sistema busca concorrentes e leads qualificados automaticamente
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">4. Cálculo de Qualidade</h3>
              <p className="text-muted-foreground">
                Cada entidade recebe um score de qualidade (0-100) baseado na completude e validação dos dados
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">5. Criação do Projeto</h3>
              <p className="text-muted-foreground">
                Um novo projeto é criado com todos os dados processados, pronto para análise e validação
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
