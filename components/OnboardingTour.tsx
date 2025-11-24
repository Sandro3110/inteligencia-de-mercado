'use client';

import { useCallback } from 'react';
import Joyride, { Step, CallBackProps, STATUS, EVENTS, Styles, Locale } from 'react-joyride';
import { useOnboarding } from '@/contexts/OnboardingContext';

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#64748b',
} as const;

const Z_INDEX = {
  TOUR: 10000,
} as const;

const SPACING = {
  BUTTON_PADDING: '8px 16px',
  BUTTON_MARGIN: 8,
} as const;

const BORDER_RADIUS = {
  TOOLTIP: 8,
  BUTTON: 6,
} as const;

const FONT_SIZE = {
  TOOLTIP: 14,
} as const;

const JOYRIDE_STYLES: Styles = {
  options: {
    primaryColor: COLORS.PRIMARY,
    zIndex: Z_INDEX.TOUR,
  },
  tooltip: {
    borderRadius: BORDER_RADIUS.TOOLTIP,
    fontSize: FONT_SIZE.TOOLTIP,
  },
  buttonNext: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.BUTTON,
    padding: SPACING.BUTTON_PADDING,
  },
  buttonBack: {
    color: COLORS.SECONDARY,
    marginRight: SPACING.BUTTON_MARGIN,
  },
  buttonSkip: {
    color: COLORS.SECONDARY,
  },
} as const;

const JOYRIDE_LOCALE: Locale = {
  back: 'Voltar',
  close: 'Fechar',
  last: 'Finalizar',
  next: 'Próximo',
  open: 'Abrir',
  skip: 'Pular tour',
} as const;

const FINISHED_STATUSES = [STATUS.FINISHED, STATUS.SKIPPED] as const;

const TOUR_STEPS: Step[] = [
  {
    target: 'body',
    content:
      'Bem-vindo ao Gestor PAV! Vamos fazer um tour rápido pelas funcionalidades principais.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[href="/"]',
    content:
      'Esta é a página inicial com visão em cascata de mercados, clientes, concorrentes e leads.',
    placement: 'bottom',
  },
  {
    target: '[href="/dashboard"]',
    content:
      'No Dashboard você encontra estatísticas e métricas gerais do seu projeto.',
    placement: 'bottom',
  },
  {
    target: '[href="/analytics"]',
    content:
      'Analytics oferece gráficos interativos e análises avançadas dos seus dados.',
    placement: 'bottom',
  },
  {
    target: '[title="Alertas e notificações"]',
    content: 'Aqui você recebe alertas e notificações importantes do sistema.',
    placement: 'bottom',
  },
  {
    target: '.compact-mode-toggle',
    content:
      'Use este botão para alternar entre modo normal e compacto, ajustando a densidade da interface.',
    placement: 'bottom',
    spotlightClicks: true,
  },
  {
    target: 'body',
    content:
      'Pressione Ctrl+K a qualquer momento para abrir a busca global e encontrar rapidamente mercados, clientes, concorrentes e leads.',
    placement: 'center',
  },
  {
    target: 'body',
    content:
      'Use Ctrl+/ ou ? para ver todos os atalhos de teclado disponíveis. Isso vai acelerar muito seu trabalho!',
    placement: 'center',
  },
  {
    target: '[data-tour="filter-tags"]',
    content:
      'Filtre seus dados por tags personalizadas para organizar melhor suas informações.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="export-filters"]',
    content: 'Exporte seus filtros salvos para reutilizar em análises futuras.',
    placement: 'bottom',
  },
  {
    target: 'body',
    content:
      'Pronto! Agora você conhece as principais funcionalidades. Explore e aproveite o Gestor PAV!',
    placement: 'center',
  },
] as const;

// ============================================================================
// TYPES
// ============================================================================

type FinishedStatus = typeof FINISHED_STATUSES[number];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isTourFinished(status: string): boolean {
  return FINISHED_STATUSES.includes(status as FinishedStatus);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * OnboardingTour
 * 
 * Tour de onboarding usando react-joyride.
 * Guia o usuário pelas principais funcionalidades do sistema.
 * 
 * @example
 * ```tsx
 * <OnboardingTour />
 * ```
 */
export function OnboardingTour() {
  // Context
  const { isOnboarding, markOnboardingComplete } = useOnboarding();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, type } = data;

      if (isTourFinished(status)) {
        markOnboardingComplete();
      }

      // Log para debug de targets não encontrados
      if (type === EVENTS.TARGET_NOT_FOUND) {
        console.warn('[OnboardingTour] Target not found:', data.step.target);
      }
    },
    [markOnboardingComplete]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={isOnboarding}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={JOYRIDE_STYLES}
      locale={JOYRIDE_LOCALE}
    />
  );
}
