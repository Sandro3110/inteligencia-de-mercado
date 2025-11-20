import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Download, Loader2 } from "lucide-react";
import Step1Context from "@/components/export/Step1Context";
import Step2Filters from "@/components/export/Step2Filters";
import Step3Fields from "@/components/export/Step3Fields";
import Step4Output from "@/components/export/Step4Output";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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

  const interpretMutation = trpc.export.interpretContext.useMutation();
  const validateMutation = trpc.export.validateFilters.useMutation();
  const executeMutation = trpc.export.executeQuery.useMutation();
  const insightsMutation = trpc.export.generateInsights.useMutation();
  const renderMutation = trpc.export.renderOutput.useMutation();

  const steps = [
    { id: 1, title: 'Contexto', description: 'Defina o que deseja exportar' },
    { id: 2, title: 'Filtros', description: 'Refine os critérios' },
    { id: 3, title: 'Campos', description: 'Selecione os dados' },
    { id: 4, title: 'Formato', description: 'Escolha a saída' }
  ];

  const progress = (currentStep / steps.length) * 100;

  const handleNext = async () => {
    if (currentStep === 1) {
      // Interpreta contexto com IA
      if (exportState.context.trim()) {
        try {
          const result = await interpretMutation.mutateAsync({
            context: exportState.context,
            projectId: exportState.projectId
          });

          // Atualiza estado com entidades extraídas
          setExportState(prev => ({
            ...prev,
            entityType: result.entities.entityType,
            filters: {
              geography: result.entities.geography,
              quality: result.entities.quality,
              size: result.entities.size,
              segmentation: result.entities.segmentation,
              temporal: result.entities.temporal
            }
          }));

          toast.success(`Contexto interpretado! ${result.estimatedRecords} registros estimados.`);
        } catch (error) {
          toast.error('Erro ao interpretar contexto');
          return;
        }
      }
    }

    if (currentStep === 2) {
      // Valida filtros
      try {
        const result = await validateMutation.mutateAsync({
          entityType: exportState.entityType,
          filters: exportState.filters,
          projectId: exportState.projectId
        });

        if (!result.isValid) {
          toast.error(result.errors.join(', '));
          return;
        }

        if (result.warnings.length > 0) {
          toast.warning(result.warnings[0]);
        }

        toast.success(`${result.estimatedRecords} registros serão exportados`);
      } catch (error) {
        toast.error('Erro ao validar filtros');
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // 1. Executa query
      toast.info('Buscando dados...');
      const queryResult = await executeMutation.mutateAsync({
        entityType: exportState.entityType,
        filters: exportState.filters,
        selectedFields: exportState.selectedFields,
        projectId: exportState.projectId
      });

      if (queryResult.data.length === 0) {
        toast.error('Nenhum dado encontrado com os filtros aplicados');
        setIsGenerating(false);
        return;
      }

      // 2. Gera insights (se for relatório)
      let analysis = undefined;
      if (exportState.outputType === 'report' && exportState.templateType) {
        toast.info('Gerando insights com IA...');
        analysis = await insightsMutation.mutateAsync({
          data: queryResult.data,
          templateType: exportState.templateType,
          context: exportState.context
        });
      }

      // 3. Renderiza saída
      toast.info('Gerando arquivo...');
      const renderResult = await renderMutation.mutateAsync({
        data: queryResult.data,
        format: exportState.format,
        outputType: exportState.outputType,
        selectedFields: exportState.selectedFields,
        title: exportState.title,
        analysis
      });

      // 4. Sucesso!
      toast.success(`Exportação concluída em ${renderResult.generationTime}s!`);

      // Abre arquivo em nova aba
      window.open(renderResult.url, '_blank');

      // Reset wizard
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
    } catch (error) {
      console.error('Erro ao gerar exportação:', error);
      toast.error('Erro ao gerar exportação');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Exportação Inteligente
          </h1>
          <p className="text-slate-600">
            Exporte dados com inteligência artificial e análises contextualizadas
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  step.id === currentStep
                    ? 'text-blue-600 font-semibold'
                    : step.id < currentStep
                    ? 'text-green-600'
                    : 'text-slate-400'
                }`}
              >
                <div className="text-sm mb-1">{step.title}</div>
                <div className="text-xs">{step.description}</div>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <Card className="p-8 mb-6 shadow-lg">
          {currentStep === 1 && (
            <Step1Context state={exportState} setState={setExportState} />
          )}
          {currentStep === 2 && (
            <Step2Filters state={exportState} setState={setExportState} />
          )}
          {currentStep === 3 && (
            <Step3Fields state={exportState} setState={setExportState} />
          )}
          {currentStep === 4 && (
            <Step4Output state={exportState} setState={setExportState} />
          )}
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isGenerating}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={interpretMutation.isPending || validateMutation.isPending}
            >
              {interpretMutation.isPending || validateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || exportState.selectedFields.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Exportação
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
