/**
 * Wizard de Criação de Pesquisa - 7 Steps
 * Fase 39.3 - Wizard de Criação de Pesquisa
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner';

// Steps
import {
  Step1SelectProject,
  Step2NameResearch,
  Step3ConfigureParams,
  Step4ChooseMethod,
  Step5InsertData,
  Step6ValidateData,
  Step7Summary
} from '@/components/research-wizard';

import type { ResearchWizardData } from '@/types/research-wizard';

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
  { id: 1, title: 'Projeto', description: 'Selecionar ou criar projeto' },
  { id: 2, title: 'Pesquisa', description: 'Nomear e descrever' },
  { id: 3, title: 'Parâmetros', description: 'Configurar quantidades' },
  { id: 4, title: 'Método', description: 'Escolher forma de entrada' },
  { id: 5, title: 'Dados', description: 'Inserir ou importar' },
  { id: 6, title: 'Validação', description: 'Revisar e aprovar' },
  { id: 7, title: 'Resumo', description: 'Confirmar e iniciar' },
];

export default function ResearchWizard() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<ResearchWizardData>({
    projectId: null,
    projectName: '',
    researchName: '',
    researchDescription: '',
    qtdConcorrentes: 5,
    qtdLeads: 10,
    qtdProdutos: 3,
    inputMethod: 'manual',
    mercados: [],
    clientes: [],
    validatedData: {
      mercados: [],
      clientes: [],
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
        return wizardData.validatedData.mercados.length > 0 || wizardData.validatedData.clientes.length > 0;
      case 7:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error('Preencha todos os campos obrigatórios antes de continuar');
      return;
    }

    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    if (confirm('Tem certeza que deseja cancelar? Todos os dados serão perdidos.')) {
      setLocation('/enrichment');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1SelectProject data={wizardData} updateData={updateWizardData} />;
      case 2:
        return <Step2NameResearch data={wizardData} updateData={updateWizardData} />;
      case 3:
        return <Step3ConfigureParams data={wizardData} updateData={updateWizardData} />;
      case 4:
        return <Step4ChooseMethod data={wizardData} updateData={updateWizardData} />;
      case 5:
        return <Step5InsertData data={wizardData} updateData={updateWizardData} />;
      case 6:
        return <Step6ValidateData data={wizardData} updateData={updateWizardData} />;
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
          <h1 className="text-3xl font-bold mb-2">Nova Pesquisa de Mercado</h1>
          <p className="text-muted-foreground">
            Siga os 7 passos para criar uma pesquisa completa com enriquecimento automático
          </p>
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
                          ? 'bg-green-500 text-white'
                          : step.id === currentStep
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
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
                      ${step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'}
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
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
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
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  toast.success('Pesquisa criada com sucesso!');
                  setLocation('/enrichment/progress');
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Criar e Iniciar Enriquecimento
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
