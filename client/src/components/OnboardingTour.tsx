import Joyride, { Step, CallBackProps, STATUS, EVENTS } from "react-joyride";
import { useOnboarding } from "@/contexts/OnboardingContext";

const steps: Step[] = [
  {
    target: "body",
    content:
      "Bem-vindo ao Gestor PAV! Vamos fazer um tour rápido pelas funcionalidades principais.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[href="/"]',
    content:
      "Esta é a página inicial com visão em cascata de mercados, clientes, concorrentes e leads.",
    placement: "bottom",
  },
  {
    target: '[href="/dashboard"]',
    content:
      "No Dashboard você encontra estatísticas e métricas gerais do seu projeto.",
    placement: "bottom",
  },
  {
    target: '[href="/analytics"]',
    content:
      "Analytics oferece gráficos interativos e análises avançadas dos seus dados.",
    placement: "bottom",
  },
  {
    target: '[title="Alertas e notificações"]',
    content: "Aqui você recebe alertas e notificações importantes do sistema.",
    placement: "bottom",
  },
  {
    target: ".compact-mode-toggle",
    content:
      "Use este botão para alternar entre modo normal e compacto, ajustando a densidade da interface.",
    placement: "bottom",
    spotlightClicks: true,
  },
  {
    target: "body",
    content:
      "Pressione Ctrl+K a qualquer momento para abrir a busca global e encontrar rapidamente mercados, clientes, concorrentes e leads.",
    placement: "center",
  },
  {
    target: "body",
    content:
      "Use Ctrl+/ ou ? para ver todos os atalhos de teclado disponíveis. Isso vai acelerar muito seu trabalho!",
    placement: "center",
  },
  {
    target: '[data-tour="filter-tags"]',
    content:
      "Filtre seus dados por tags personalizadas para organizar melhor suas informações.",
    placement: "bottom",
  },
  {
    target: '[data-tour="export-filters"]',
    content: "Exporte seus filtros salvos para reutilizar em análises futuras.",
    placement: "bottom",
  },
  {
    target: "body",
    content:
      "Pronto! Agora você conhece as principais funcionalidades. Explore e aproveite o Gestor PAV!",
    placement: "center",
  },
];

export function OnboardingTour() {
  const { isOnboarding, stopOnboarding, markOnboardingComplete } =
    useOnboarding();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      markOnboardingComplete();
    }

    // Fechar tour se usuário clicar fora ou pressionar ESC
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Continuar normalmente
    }
  };

  return (
    <Joyride
      steps={steps}
      run={isOnboarding}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#3b82f6",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 14,
        },
        buttonNext: {
          backgroundColor: "#3b82f6",
          borderRadius: 6,
          padding: "8px 16px",
        },
        buttonBack: {
          color: "#64748b",
          marginRight: 8,
        },
        buttonSkip: {
          color: "#64748b",
        },
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        open: "Abrir",
        skip: "Pular tour",
      }}
    />
  );
}
