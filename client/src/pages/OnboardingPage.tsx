import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Check,
  Database,
  BarChart3,
  Target,
  Sparkles,
  Home,
} from "lucide-react";

interface TourStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  targetRoute: string;
}

const tourSteps: TourStep[] = [
  {
    id: 1,
    title: "Bem-vindo ao Gestor PAV",
    description: "Sistema completo de inteligência de mercado para análise de pesquisas, clientes, concorrentes e leads.",
    icon: Home,
    features: [
      "Navegação intuitiva com sidebar lateral",
      "Estatísticas em tempo real",
      "Atalhos de teclado (Ctrl+1-4, Ctrl+B)",
    ],
    targetRoute: "/",
  },
  {
    id: 2,
    title: "Gerenciamento de Dados",
    description: "Organize e visualize mercados, clientes, concorrentes e leads em uma interface cascata intuitiva.",
    icon: Database,
    features: [
      "Visualização cascata: Mercados → Clientes → Concorrentes → Leads",
      "Filtros avançados por tags, segmentação, UF e porte",
      "Busca global em múltiplos campos",
      "Exportação de dados filtrados",
    ],
    targetRoute: "/",
  },
  {
    id: 3,
    title: "Enriquecimento Automatizado",
    description: "Enriqueça sua base de dados automaticamente com informações de concorrentes e leads qualificados.",
    icon: Sparkles,
    features: [
      "Enriquecimento em lote ou individual",
      "Monitoramento de progresso em tempo real",
      "Validação automática de qualidade",
      "Resultados detalhados com scores",
    ],
    targetRoute: "/enrichment",
  },
  {
    id: 4,
    title: "Análise e Relatórios",
    description: "Tome decisões baseadas em dados com dashboards interativos e relatórios personalizados.",
    icon: BarChart3,
    features: [
      "Dashboard com métricas principais",
      "Analytics avançado com gráficos interativos",
      "ROI e análise de conversão",
      "Funil de vendas visual",
      "Relatórios exportáveis",
    ],
    targetRoute: "/analytics",
  },
];

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (!completedSteps.includes(step.id)) {
      setCompletedSteps([...completedSteps, step.id]);
    }

    if (isLastStep) {
      // Marcar tour como completado
      localStorage.setItem("onboarding-completed", "true");
      setLocation("/dashboard");
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding-completed", "true");
    setLocation("/dashboard");
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Passo {currentStep + 1} de {tourSteps.length}
            </span>
            <span className="text-sm text-slate-500">
              {Math.round(((currentStep + 1) / tourSteps.length) * 100)}% completo
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {tourSteps.map((s, index) => (
            <button
              key={s.id}
              onClick={() => handleGoToStep(index)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                index === currentStep
                  ? "bg-blue-600 text-white scale-110 shadow-lg"
                  : completedSteps.includes(s.id)
                  ? "bg-green-500 text-white"
                  : "bg-slate-200 text-slate-400 hover:bg-slate-300"
              }`}
            >
              {completedSteps.includes(s.id) ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </button>
          ))}
        </div>

        {/* Main Content Card */}
        <Card className="p-8 shadow-2xl border-0">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Icon className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">{step.title}</h1>
            <p className="text-lg text-slate-600 max-w-2xl">{step.description}</p>
          </div>

          {/* Features List */}
          <div className="grid gap-3 mb-8">
            {step.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-700 text-left">{feature}</span>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-slate-600 hover:text-slate-900"
            >
              Pular Tour
            </Button>

            <div className="flex items-center gap-3">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="px-6"
                >
                  Voltar
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="px-8"
              >
                {isLastStep ? (
                  <>
                    Começar
                    <Target className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-500">
          Você pode acessar este tour novamente em Configurações
        </div>
      </div>
    </div>
  );
}
