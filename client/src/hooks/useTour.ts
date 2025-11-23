import { useState, useEffect } from "react";
import { Step } from "react-joyride";

export type TourType =
  | "onboarding"
  | "project-creation"
  | "research-wizard"
  | "enrichment"
  | "analytics"
  | "export"
  | "geocockpit"
  | "alerts";

interface TourConfig {
  id: TourType;
  steps: Step[];
  autoStart?: boolean;
}

const TOUR_STORAGE_PREFIX = "tour-completed-";

/**
 * Hook para gerenciar tours contextuais
 * Cada tour é executado apenas uma vez por usuário
 */
export function useTour(tourId: TourType) {
  const [isRunning, setIsRunning] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const completed =
      localStorage.getItem(`${TOUR_STORAGE_PREFIX}${tourId}`) === "true";
    setHasCompleted(completed);
  }, [tourId]);

  const startTour = () => {
    setIsRunning(true);
  };

  const stopTour = () => {
    setIsRunning(false);
  };

  const completeTour = () => {
    localStorage.setItem(`${TOUR_STORAGE_PREFIX}${tourId}`, "true");
    setHasCompleted(true);
    setIsRunning(false);
  };

  const resetTour = () => {
    localStorage.removeItem(`${TOUR_STORAGE_PREFIX}${tourId}`);
    setHasCompleted(false);
  };

  return {
    isRunning,
    hasCompleted,
    startTour,
    stopTour,
    completeTour,
    resetTour,
  };
}

/**
 * Tours disponíveis no sistema
 */
export const TOURS: Record<TourType, Step[]> = {
  onboarding: [
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
      target: '[href="/projetos"]',
      content:
        "Gerencie seus projetos: crie, edite, hiberne ou reative projetos conforme necessário.",
      placement: "bottom",
    },
    {
      target: '[href="/enrichment"]',
      content:
        "Enriqueça seus dados automaticamente com informações de APIs externas e IA.",
      placement: "bottom",
    },
    {
      target: '[href="/analytics"]',
      content:
        "Analise seus dados com gráficos interativos e métricas avançadas.",
      placement: "bottom",
    },
    {
      target: "body",
      content:
        "Pressione Ctrl+K para busca global ou ? para ver todos os atalhos. Bom trabalho!",
      placement: "center",
    },
  ],

  "project-creation": [
    {
      target: "body",
      content:
        "Vamos criar seu primeiro projeto! Siga os passos para configurar tudo corretamente.",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[name="name"]',
      content:
        "Dê um nome descritivo ao seu projeto. Ex: 'Pesquisa Embalagens Q1 2024'",
      placement: "bottom",
    },
    {
      target: '[name="description"]',
      content:
        "Adicione uma descrição opcional para documentar o objetivo do projeto.",
      placement: "bottom",
    },
    {
      target: '[data-tour="color-picker"]',
      content:
        "Escolha uma cor para identificar visualmente este projeto no sistema.",
      placement: "bottom",
    },
    {
      target: '[data-tour="submit-button"]',
      content:
        "Clique em 'Criar Projeto' para finalizar. Você poderá editar essas informações depois.",
      placement: "bottom",
    },
  ],

  "research-wizard": [
    {
      target: "body",
      content:
        "O Wizard de Pesquisa guia você em 4 etapas para criar uma nova pesquisa de mercado.",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tour="project-selector"]',
      content:
        "Selecione o projeto ao qual esta pesquisa pertence. Você pode criar um novo projeto aqui também.",
      placement: "bottom",
    },
    {
      target: '[data-tour="step-2"]',
      content:
        "Configure parâmetros como número de produtos, concorrentes e leads por mercado.",
      placement: "bottom",
    },
    {
      target: '[data-tour="step-3"]',
      content:
        "Escolha o método de entrada: upload de planilha, API ou entrada manual.",
      placement: "bottom",
    },
    {
      target: '[data-tour="step-4"]',
      content:
        "Insira os dados dos mercados e clientes. O sistema validará automaticamente.",
      placement: "bottom",
    },
    {
      target: "body",
      content:
        "Seus dados são salvos automaticamente como rascunho. Você pode retomar depois!",
      placement: "center",
    },
  ],

  enrichment: [
    {
      target: "body",
      content:
        "O Enriquecimento complementa dados básicos com informações detalhadas de APIs e IA.",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tour="select-entities"]',
      content:
        "Selecione quais entidades enriquecer: clientes, concorrentes ou leads.",
      placement: "bottom",
    },
    {
      target: '[data-tour="batch-size"]',
      content:
        "Configure o tamanho do lote. Lotes menores são mais seguros, maiores são mais rápidos.",
      placement: "bottom",
    },
    {
      target: '[data-tour="quality-score"]',
      content:
        "Ative o cálculo de qualidade para classificar automaticamente os dados enriquecidos.",
      placement: "bottom",
    },
    {
      target: '[data-tour="start-button"]',
      content:
        "Clique em 'Iniciar Enriquecimento' e acompanhe o progresso em tempo real.",
      placement: "bottom",
    },
    {
      target: "body",
      content:
        "O processo pode levar alguns minutos. Você receberá uma notificação ao concluir!",
      placement: "center",
    },
  ],

  analytics: [
    {
      target: "body",
      content:
        "O Analytics oferece visualizações poderosas dos seus dados de pesquisa.",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tour="filters"]',
      content:
        "Use filtros para segmentar dados por período, mercado, qualidade ou status.",
      placement: "bottom",
    },
    {
      target: '[data-tour="charts"]',
      content:
        "Gráficos interativos mostram tendências, distribuições e comparações.",
      placement: "bottom",
    },
    {
      target: '[data-tour="metrics"]',
      content:
        "Cards de métricas resumem KPIs importantes como ROI, taxa de conversão e qualidade média.",
      placement: "bottom",
    },
    {
      target: '[data-tour="export-chart"]',
      content:
        "Exporte gráficos como imagem ou dados como CSV para usar em apresentações.",
      placement: "bottom",
    },
  ],

  export: [
    {
      target: "body",
      content:
        "Exporte seus dados em múltiplos formatos respeitando filtros ativos.",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tour="format-selector"]',
      content:
        "Escolha o formato: CSV para análise, Excel para relatórios ou PDF para apresentações.",
      placement: "bottom",
    },
    {
      target: '[data-tour="filters-summary"]',
      content:
        "Veja quais filtros estão ativos. Apenas dados filtrados serão exportados.",
      placement: "bottom",
    },
    {
      target: '[data-tour="template-selector"]',
      content: "Use templates pré-configurados para exportações recorrentes.",
      placement: "bottom",
    },
    {
      target: '[data-tour="export-button"]',
      content: "Clique para exportar. O arquivo será baixado automaticamente.",
      placement: "bottom",
    },
  ],

  geocockpit: [
    {
      target: "body",
      content:
        "O GeoCockpit visualiza seus dados em mapas interativos com análise territorial.",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tour="map-view"]',
      content:
        "Marcadores coloridos representam empresas. Verde = alta qualidade, Vermelho = baixa.",
      placement: "bottom",
    },
    {
      target: '[data-tour="cluster-toggle"]',
      content:
        "Ative clustering para agrupar marcadores próximos e melhorar a visualização.",
      placement: "bottom",
    },
    {
      target: '[data-tour="heatmap-toggle"]',
      content:
        "Ative o mapa de calor para identificar regiões com maior concentração de dados.",
      placement: "bottom",
    },
    {
      target: '[data-tour="marker-click"]',
      content:
        "Clique em marcadores para ver detalhes e ações rápidas (validar, editar, exportar).",
      placement: "bottom",
    },
    {
      target: '[data-tour="territory-analysis"]',
      content:
        "Use análise territorial para identificar oportunidades por região, estado ou cidade.",
      placement: "bottom",
    },
  ],

  alerts: [
    {
      target: "body",
      content:
        "Configure alertas inteligentes para ser notificado automaticamente sobre eventos importantes.",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tour="alert-type"]',
      content:
        "Escolha o tipo: taxa de erro, leads de alta qualidade ou limites de mercado.",
      placement: "bottom",
    },
    {
      target: '[data-tour="condition"]',
      content:
        "Defina a condição que dispara o alerta. Ex: 'taxa de erro > 10%'",
      placement: "bottom",
    },
    {
      target: '[data-tour="notification-channel"]',
      content:
        "Escolha como ser notificado: email, push notification ou ambos.",
      placement: "bottom",
    },
    {
      target: '[data-tour="alert-history"]',
      content: "Veja o histórico de alertas disparados e suas ações tomadas.",
      placement: "bottom",
    },
  ],
};
