/**
 * Central de Exportação Unificada - Fusão de 3 páginas em 1
 * 
 * Abas disponíveis:
 * - Nova Exportação: Wizard de exportação em 4 steps
 * - Templates: Gerenciamento de templates de exportação
 * - Histórico: Exportações anteriores
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  FileText,
  FileSpreadsheet,
  FileIcon,
  Calendar,
  Clock,
  HardDrive,
  FileDown,
  History,
  LayoutTemplate,
} from "lucide-react";
import Step1Context from "@/components/export/Step1Context";
import Step2Filters from "@/components/export/Step2Filters";
import Step3Fields from "@/components/export/Step3Fields";
import Step4Output from "@/components/export/Step4Output";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import DashboardLayout from '@/components/DashboardLayout';

export interface ExportState {
  // Step 1: Contexto
  context: string;
  entityType: 'mercados' | 'clientes' | 'concorrentes' | 'leads' | 'produtos';
  projectId?: string;
  
  // Step 2: Filtros
  filters: {
    geography?: {
      states?: string[];
      cities?: string[];
      regions?: string[];
    };
    quality?: {
      minScore?: number;
      status?: string[];
      completeness?: number;
    };
    size?: {
      porte?: string[];
      revenue?: { min?: number; max?: number };
    };
    segmentation?: {
      type?: string[];
      cnae?: string[];
    };
    temporal?: {
      createdAfter?: Date;
      createdBefore?: Date;
      updatedWithin?: number;
    };
  };
  
  // Step 3: Campos
  selectedFields: string[];
  includeRelationships: boolean;
  
  // Step 4: Saída
  format: 'csv' | 'excel' | 'pdf' | 'json';
  outputType: 'simple' | 'complete' | 'report';
  templateType?: 'market' | 'client' | 'competitive' | 'lead';
  title: string;
}

export default function ExportWizard() {
  const [activeTab, setActiveTab] = useState('export');

  // Estados do Wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportState, setExportState] = useState<ExportState>({
    context: '',
    entityType: 'clientes',
    filters: {},
    selectedFields: [],
    includeRelationships: false,
    format: 'csv',
    outputType: 'simple',
    title: 'Exportação'
  });

  // Estados do Templates
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Estados do Histórico
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Mutations do Wizard
  const interpretMutation = trpc.export.interpretContext.useMutation();
  const validateMutation = trpc.export.validateFilters.useMutation();
  const executeMutation = trpc.export.executeQuery.useMutation();
  const insightsMutation = trpc.export.generateInsights.useMutation();
  const renderMutation = trpc.export.renderOutput.useMutation();

  // Queries do Histórico
  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = trpc.export.listHistory.useQuery({
    limit: pageSize,
    offset: page * pageSize,
  }, { enabled: activeTab === 'history' });

  const deleteHistoryMutation = trpc.export.deleteHistory.useMutation({
    onSuccess: () => {
      toast.success("Histórico deletado com sucesso!");
      refetchHistory();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(`Erro ao deletar: ${error.message}`);
    },
  });

  const steps = [
    { id: 1, title: 'Contexto', description: 'Defina o que deseja exportar' },
    { id: 2, title: 'Filtros', description: 'Refine os critérios' },
    { id: 3, title: 'Campos', description: 'Selecione os dados' },
    { id: 4, title: 'Saída', description: 'Configure o formato' },
  ];

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleExport();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      const result = await renderMutation.mutateAsync({
        data: [],
        format: exportState.format,
        outputType: exportState.outputType,
        selectedFields: exportState.selectedFields,
        title: exportState.title,
      });
      
      if (result.url) {
        window.open(result.url, '_blank');
        toast.success('Exportação concluída!');
        setCurrentStep(1);
        setExportState({
          context: '',
          entityType: 'clientes',
          filters: {},
          selectedFields: [],
          includeRelationships: false,
          format: 'csv',
          outputType: 'simple',
          title: 'Exportação'
        });
      }
    } catch (error: any) {
      toast.error(`Erro na exportação: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <FileText className="h-4 w-4" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      default:
        return <FileIcon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      market: 'bg-green-100 text-green-800',
      client: 'bg-blue-100 text-blue-800',
      competitive: 'bg-orange-100 text-orange-800',
      lead: 'bg-purple-100 text-purple-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Templates simulados (implementar tRPC real)
  const templates = [
    {
      id: '1',
      name: 'Análise de Mercado Completa',
      description: 'Template para análise detalhada de mercados com insights estratégicos',
      templateType: 'market',
      isSystem: true,
      usageCount: 45,
      createdAt: new Date('2025-01-01')
    },
    {
      id: '2',
      name: 'Relatório de Clientes',
      description: 'Exportação de clientes com produtos e mercados associados',
      templateType: 'client',
      isSystem: false,
      usageCount: 23,
      createdAt: new Date('2025-01-15')
    },
    {
      id: '3',
      name: 'Análise Competitiva',
      description: 'Comparação de concorrentes por mercado e segmento',
      templateType: 'competitive',
      isSystem: true,
      usageCount: 67,
      createdAt: new Date('2025-01-10')
    },
    {
      id: '4',
      name: 'Leads Qualificados',
      description: 'Exportação de leads com score alto e análise de conversão',
      templateType: 'lead',
      isSystem: false,
      usageCount: 12,
      createdAt: new Date('2025-01-20')
    }
  ];

  // Renderizar Aba de Exportação
  const renderExportTab = () => (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso da Exportação</CardTitle>
          <CardDescription>
            Passo {currentStep} de {steps.length}: {steps[currentStep - 1].title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(currentStep / steps.length) * 100} className="mb-4" />
          <div className="grid grid-cols-4 gap-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`text-center p-2 rounded ${
                  currentStep === step.id
                    ? 'bg-primary text-primary-foreground'
                    : currentStep > step.id
                    ? 'bg-green-100 text-green-800'
                    : 'bg-muted'
                }`}
              >
                <div className="font-semibold">{step.title}</div>
                <div className="text-xs">{step.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <Step1Context
              state={exportState}
              setState={setExportState}
            />
          )}
          {currentStep === 2 && (
            <Step2Filters
              state={exportState}
              setState={setExportState}
            />
          )}
          {currentStep === 3 && (
            <Step3Fields
              state={exportState}
              setState={setExportState}
            />
          )}
          {currentStep === 4 && (
            <Step4Output
              state={exportState}
              setState={setExportState}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isGenerating}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={handleNext}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : currentStep === 4 ? (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </>
          ) : (
            <>
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Renderizar Aba de Templates
  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Templates de Exportação</h2>
          <p className="text-muted-foreground">
            Gerencie templates reutilizáveis para exportações
          </p>
        </div>
        <Button onClick={() => setShowEditor(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {template.name}
                    {template.isSystem && (
                      <Badge variant="secondary" className="text-xs">
                        Sistema
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <Badge className={getTypeColor(template.templateType)}>
                  {template.templateType}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>Usado {template.usageCount}x</span>
                <span>{template.createdAt.toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar
                </Button>
                {!template.isSystem && (
                  <>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Renderizar Aba de Histórico
  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Histórico de Exportações</h2>
        <p className="text-muted-foreground">
          Visualize e gerencie suas exportações anteriores
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {historyLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : historyData && historyData.history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.history.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getFormatIcon(item.format)}
                        {item.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.format.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <HardDrive className="h-3 w-3" />
                        {formatFileSize(item.fileSize || 0)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === 'completed'
                            ? 'default'
                            : item.status === 'processing'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {item.status === 'completed'
                          ? 'Concluído'
                          : item.status === 'processing'
                          ? 'Processando'
                          : 'Erro'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {item.downloadUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(item.downloadUrl, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Nenhuma exportação encontrada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {historyData && historyData.total > pageSize && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page + 1} de {Math.ceil(historyData.total / pageSize)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={(page + 1) * pageSize >= historyData.total}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este histórico de exportação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteHistoryMutation.mutate({ historyId: deleteId });
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Central de Exportação</h1>
          <p className="text-muted-foreground">
            Exporte dados, gerencie templates e visualize histórico
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export">
              <FileDown className="h-4 w-4 mr-2" />
              Nova Exportação
            </TabsTrigger>
            <TabsTrigger value="templates">
              <LayoutTemplate className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="mt-6">
            {renderExportTab()}
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            {renderTemplatesTab()}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            {renderHistoryTab()}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
