'use client';

import { useState } from 'react';
import { useProject } from '@/lib/contexts/ProjectContext';
import { Download, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import Step1Context from '@/components/export/Step1Context';
import Step2Filters from '@/components/export/Step2Filters';
import Step3Fields from '@/components/export/Step3Fields';
import Step4Output from '@/components/export/Step4Output';
import type { ExportState } from '@/lib/types/export';

export default function ExportPage() {
  const { selectedProjectId } = useProject();
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<ExportState>({
    projectId: selectedProjectId ? String(selectedProjectId) : undefined,
    entityType: 'mercados',
    context: '',
    filters: {},
    selectedFields: [],
    format: 'excel',
    includeRelationships: false,
  });

  const steps = [
    { id: 1, title: 'Contexto', component: Step1Context },
    { id: 2, title: 'Filtros', component: Step2Filters },
    { id: 3, title: 'Campos', component: Step3Fields },
    { id: 4, title: 'Exportar', component: Step4Output },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;

  const canGoNext = () => {
    if (currentStep === 1) return state.entityType && (state.context?.length || 0) > 10;
    if (currentStep === 2) return true;
    if (currentStep === 3) return (state.selectedFields?.length || 0) > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Download className="w-8 h-8 text-blue-600" />
          Exportar Dados
        </h1>
        <p className="text-gray-600">
          Wizard inteligente de exportação com IA para criar filtros automaticamente
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    currentStep > step.id
                      ? 'bg-green-600 text-white'
                      : currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    currentStep === step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 transition-colors ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-8 mb-6">
        <CurrentStepComponent state={state} setState={setState} />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="text-sm text-gray-500">
          Passo {currentStep} de {steps.length}
        </div>

        {currentStep < steps.length ? (
          <button
            onClick={() => setCurrentStep((prev) => prev + 1)}
            disabled={!canGoNext()}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Próximo
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
            <Download className="w-5 h-5" />
            Exportar Agora
          </button>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">💡 Dica</p>
        <p>
          Use linguagem natural no passo 1. Nossa IA vai interpretar e criar filtros automaticamente
          para você.
        </p>
      </div>
    </div>
  );
}
