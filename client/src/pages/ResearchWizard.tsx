/**
 * Wizard de Criação de Pesquisa - 7 Steps
 * Fase 39.3 - Wizard de Criação de Pesquisa
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Save,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Steps
import {
  Step1SelectProject,
  Step2NameResearch,
  Step3ConfigureParams,
  Step4ChooseMethod,
  Step5InsertData,
  Step6ValidateData,
  Step7Summary,
} from "@/components/research-wizard";
import { StepPreview } from "@/components/research-wizard/StepPreview";

import type { ResearchWizardData } from "@/types/research-wizard";

// Re-export para compatibilidade
export type { ResearchWizardData };

// Removido: interface movida para @/types/research-wizard
/*
interface ResearchWizardData {
  // Step 1
  projectId: number | null;
  projectName: string;
  
  // Step 2
  researchName: string;
  researchDescription: string;
  
  // Step 3
  qtdConcorrentes: number;
  qtdLeads: number;
  qtdProdutos: number;
  
  // Step 4
  inputMethod: 'manual' | 'spreadsheet' | 'pre-research';
  
  // Step 5
  mercados: any[];
  clientes: any[];
  
  // Step 6
  validatedData: {
    mercados: any[];
    clientes: any[];
  };
}
*/

const STEPS = [
  { id: 1, title: "Projeto", description: "Selecionar ou criar projeto" },
  { id: 2, title: "Pesquisa", description: "Nomear e descrever" },
  { id: 3, title: "Parâmetros", description: "Configurar quantidades" },
  { id: 4, title: "Método", description: "Escolher forma de entrada" },
  { id: 5, title: "Dados", description: "Inserir ou importar" },
  { id: 6, title: "Validação", description: "Revisar e aprovar" },
  { id: 7, title: "Resumo", description: "Confirmar e iniciar" },
];

export default function ResearchWizard() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<ResearchWizardData>({
    projectId: null,
    projectName: "",
    researchName: "",
    researchDescription: "",
    qtdConcorrentes: 5,
    qtdLeads: 10,
    qtdProdutos: 3,
    inputMethod: "manual",
    mercados: [],
    clientes: [],
    validatedData: {
      mercados: [],
      clientes: [],
    },
  });
  const [draftId, setDraftId] = useState<number | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Carregar draft salvo ao iniciar
  const { data: savedDraft } = trpc.drafts.get.useQuery(
    { projectId: null },
    { enabled: !draftLoaded }
  );

  useEffect(() => {
    if (savedDraft && !draftLoaded) {
      setWizardData(savedDraft.draftData);
      setCurrentStep(savedDraft.currentStep);
      setDraftId(savedDraft.id);
      setDraftLoaded(true);
      toast.success("Rascunho anterior carregado!");
    }
  }, [savedDraft, draftLoaded]);

  // Salvar draft automaticamente
  const saveDraftMutation = trpc.drafts.save.useMutation();

  useEffect(() => {
    if (draftLoaded) {
      const timer = setTimeout(() => {
        saveDraftMutation.mutate(
          {
            draftData: wizardData,
            currentStep,
            projectId: wizardData.projectId,
          },
          {
            onSuccess: draft => {
              if (draft) {
                setDraftId(draft.id);
              }
            },
          }
        );
      }, 2000); // Auto-save após 2 segundos de inatividade

      return () => clearTimeout(timer);
    }
  }, [wizardData, currentStep, draftLoaded]);

  const deleteDraftMutation = trpc.drafts.delete.useMutation();

  const createPesquisaMutation = trpc.pesquisas.create.useMutation({
    onSuccess: pesquisa => {
      // Deletar draft após criar pesquisa com sucesso
      if (draftId) {
        deleteDraftMutation.mutate({ draftId });
      }
      toast.success(
        `Pesquisa "${pesquisa.nome}" criada com sucesso! Iniciando enriquecimento...`
      );
      setLocation("/enrichment-progress");
    },
    onError: error => {
      toast.error(`Erro ao criar pesquisa: ${error.message}`);
    },
  });

  const updateWizardData = (data: Partial<ResearchWizardData>) => {
    setWizardData(prev => ({ ...prev, ...data }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return wizardData.projectId !== null;
      case 2:
        return wizardData.researchName.trim().length >= 3;
      case 3:
        return true; // Sempre pode prosseguir (valores padrão)
      case 4:
        return true; // Sempre pode prosseguir (método selecionado)
      case 5:
        return wizardData.mercados.length > 0 || wizardData.clientes.length > 0;
      case 6:
        return (
          wizardData.validatedData.mercados.length > 0 ||
          wizardData.validatedData.clientes.length > 0
        );
      case 7:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    console.log("[Wizard] handleNext chamado - Step atual:", currentStep);
    console.log("[Wizard] Dados atuais:", wizardData);

    const canProceedResult = canProceed();
    console.log("[Wizard] canProceed():", canProceedResult);

    if (!canProceedResult) {
      // Mensagens específicas por step
      let errorMessage =
        "Preencha todos os campos obrigatórios antes de continuar";

      switch (currentStep) {
        case 1:
          errorMessage = "Selecione um projeto antes de continuar";
          break;
        case 2:
          errorMessage = "Digite um nome para a pesquisa (mínimo 3 caracteres)";
          break;
        case 5:
          errorMessage =
            "Adicione pelo menos um mercado ou cliente antes de continuar";
          break;
        case 6:
          errorMessage = "Valide os dados antes de continuar";
          break;
      }

      console.log("[Wizard] Navegação bloqueada:", errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (currentStep < 7) {
      console.log("[Wizard] Avançando para step:", currentStep + 1);
      setCurrentStep(currentStep + 1);
      toast.success(`Avançado para: ${STEPS[currentStep].title}`);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    if (
      confirm("Tem certeza que deseja cancelar? Todos os dados serão perdidos.")
    ) {
      setLocation("/enrichment");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1SelectProject data={wizardData} updateData={updateWizardData} />
        );
      case 2:
        return (
          <Step2NameResearch data={wizardData} updateData={updateWizardData} />
        );
      case 3:
        return (
          <Step3ConfigureParams
            data={wizardData}
            updateData={updateWizardData}
          />
        );
      case 4:
        return (
          <Step4ChooseMethod data={wizardData} updateData={updateWizardData} />
        );
      case 5:
        return (
          <Step5InsertData data={wizardData} updateData={updateWizardData} />
        );
      case 6:
        return (
          <Step6ValidateData data={wizardData} updateData={updateWizardData} />
        );
      case 7:
        return <Step7Summary data={wizardData} updateData={updateWizardData} />;
      default:
        return null;
    }
  };

  const progress = (currentStep / 7) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Nova Pesquisa de Mercado
              </h1>
              <p className="text-muted-foreground">
                Siga os 7 passos para criar uma pesquisa completa com
                enriquecimento automático
              </p>
            </div>
            {draftLoaded && (
              <div className="flex items-center gap-2 text-sm">
                {saveDraftMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-muted-foreground">Salvando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">
                      Salvo automaticamente
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Passo {currentStep} de 7: {STEPS[currentStep - 1].title}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% completo
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                      ${
                        step.id < currentStep
                          ? "bg-green-500 text-white"
                          : step.id === currentStep
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-500"
                      }
                    `}
                  >
                    {step.id < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-xs font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`
                      w-12 h-1 mx-2 mt-[-24px]
                      ${step.id < currentStep ? "bg-green-500" : "bg-gray-200"}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8 mb-8">
          {renderStep()}
          <StepPreview step={currentStep} data={wizardData} />
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {currentStep < 7 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className={!canProceed() ? "opacity-50 cursor-not-allowed" : ""}
                title={
                  !canProceed()
                    ? "Preencha os campos obrigatórios"
                    : "Avançar para o próximo passo"
                }
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (!wizardData.projectId) {
                    toast.error("Projeto não selecionado");
                    return;
                  }

                  createPesquisaMutation.mutate({
                    projectId: wizardData.projectId,
                    nome: wizardData.researchName,
                    descricao: wizardData.researchDescription || undefined,
                    qtdConcorrentesPorMercado: wizardData.qtdConcorrentes,
                    qtdLeadsPorMercado: wizardData.qtdLeads,
                    qtdProdutosPorCliente: wizardData.qtdProdutos,
                    mercados: wizardData.validatedData.mercados.map(m => ({
                      nome: m.nome,
                      descricao: m.descricao,
                    })),
                    clientes: wizardData.validatedData.clientes.map(c => ({
                      nome: c.nome,
                      cnpj: c.cnpj,
                      mercadoNome: c.mercadoNome,
                    })),
                  });
                }}
                disabled={createPesquisaMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createPesquisaMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Criar e Iniciar Enriquecimento
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
