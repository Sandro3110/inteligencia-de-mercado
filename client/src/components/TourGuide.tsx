import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

/**
 * Tours disponíveis na aplicação
 */
export const tours = {
  /**
   * TOUR COMPLETO - Percorre todas as seções (12 passos)
   * Duração estimada: 3-4 minutos
   */
  complete: [
    {
      element: 'a[href="/"]',
      popover: {
        title: '👋 Bem-vindo ao Intelmarket!',
        description: 'Vamos fazer um tour completo pela plataforma. Você pode pular a qualquer momento.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: 'a[href="/"]',
      popover: {
        title: '🏠 Dashboard',
        description: 'Sua central de comando. Aqui você visualiza métricas gerais, projetos ativos e atividades recentes.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/entidades"]',
      popover: {
        title: '🗄️ Base de Dados',
        description: 'Consulte e gerencie todas as entidades (empresas, clientes, leads) cadastradas no sistema.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/projetos"]',
      popover: {
        title: '📁 Projetos',
        description: 'Organize seu trabalho em projetos de inteligência de mercado. Cada projeto pode ter múltiplas pesquisas.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/pesquisas"]',
      popover: {
        title: '🔍 Pesquisas',
        description: 'Configure pesquisas de mercado e segmentação. Defina critérios e filtros para análise.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/importacao"]',
      popover: {
        title: '📤 Importar Dados',
        description: 'Importe dados de clientes, leads e empresas a partir de arquivos CSV ou Excel.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/enriquecimento"]',
      popover: {
        title: '✨ Enriquecer com IA',
        description: 'Use inteligência artificial para enriquecer automaticamente dados de empresas: mercado, produtos, concorrentes e leads.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/processamento-ia"]',
      popover: {
        title: '🖥️ Processamento Avançado',
        description: 'Processe lotes de dados e gere insights automatizados com IA em escala.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/cubo"]',
      popover: {
        title: '🔷 Explorador Multidimensional',
        description: 'Análise interativa por múltiplas dimensões: setor, porte, região, produtos e mais.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/analise/temporal"]',
      popover: {
        title: '📈 Análise Temporal',
        description: 'Identifique tendências e padrões ao longo do tempo. Visualize evolução de métricas.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/analise/geografica"]',
      popover: {
        title: '🗺️ Análise Geográfica',
        description: 'Visualize distribuição geográfica de empresas e identifique oportunidades por região.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/analise/mercado"]',
      popover: {
        title: '🌐 Análise de Mercado',
        description: 'Explore hierarquia de mercados, segmentos de atuação e posicionamento competitivo.',
        side: 'right',
        align: 'start'
      }
    },
    {
      popover: {
        title: '🎉 Tour Concluído!',
        description: 'Parabéns! Você conheceu todas as funcionalidades principais. Explore à vontade e conte com nossa ajuda sempre que precisar!',
      }
    }
  ] as DriveStep[],

  /**
   * TOUR: PRIMEIROS PASSOS - Fluxo básico (5 passos)
   * Duração estimada: 1-2 minutos
   */
  firstSteps: [
    {
      element: 'a[href="/"]',
      popover: {
        title: '🚀 Primeiros Passos',
        description: 'Vamos te guiar pelo fluxo básico para começar a usar a plataforma.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: 'a[href="/"]',
      popover: {
        title: '1️⃣ Dashboard',
        description: 'Sua central de comando. Aqui você vê o que está acontecendo.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/projetos"]',
      popover: {
        title: '2️⃣ Crie um Projeto',
        description: 'Primeiro passo: criar um projeto para organizar seu trabalho.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/importacao"]',
      popover: {
        title: '3️⃣ Importe Dados',
        description: 'Traga seus dados de empresas/clientes via CSV ou Excel.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/entidades"]',
      popover: {
        title: '4️⃣ Visualize seus Dados',
        description: 'Aqui você vê todos os dados importados e pode gerenciá-los.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/enriquecimento"]',
      popover: {
        title: '5️⃣ Enriqueça com IA',
        description: 'Próximo passo: enriquecer seus dados automaticamente com inteligência artificial!',
        side: 'right',
        align: 'start'
      }
    }
  ] as DriveStep[],

  /**
   * TOUR: ANÁLISES - Foco em inteligência (4 passos)
   * Duração estimada: 1 minuto
   */
  analytics: [
    {
      popover: {
        title: '🧠 Tour de Análises',
        description: 'Conheça as ferramentas de inteligência e análise de dados.',
      }
    },
    {
      element: 'a[href="/cubo"]',
      popover: {
        title: '🔷 Explorador Multidimensional',
        description: 'Análise interativa: cruze dimensões como setor, porte, região e produtos para descobrir insights.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/analise/temporal"]',
      popover: {
        title: '📈 Análise Temporal',
        description: 'Identifique padrões e tendências ao longo do tempo. Perfeito para prever comportamentos.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/analise/geografica"]',
      popover: {
        title: '🗺️ Análise Geográfica',
        description: 'Visualize distribuição geográfica em mapas interativos. Encontre oportunidades por região.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/analise/mercado"]',
      popover: {
        title: '🌐 Análise de Mercado',
        description: 'Explore hierarquia de mercados e segmentos. Entenda o posicionamento competitivo.',
        side: 'right',
        align: 'start'
      }
    }
  ] as DriveStep[],

  /**
   * TOUR: ENRIQUECIMENTO COM IA - Foco em IA (3 passos)
   * Duração estimada: 1 minuto
   */
  aiEnrichment: [
    {
      popover: {
        title: '✨ Tour de Enriquecimento com IA',
        description: 'Descubra como a inteligência artificial pode melhorar seus dados automaticamente.',
      }
    },
    {
      element: 'a[href="/enriquecimento"]',
      popover: {
        title: '✨ Enriquecer com IA',
        description: 'Enriqueça dados de empresas individuais: mercado, produtos, concorrentes e leads potenciais.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/processamento-ia"]',
      popover: {
        title: '🖥️ Processamento em Lote',
        description: 'Processe múltiplas empresas de uma vez. Ideal para grandes volumes de dados.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: 'a[href="/gestao-ia"]',
      popover: {
        title: '🛡️ Gestão de IA',
        description: 'Monitore uso, custos e segurança da inteligência artificial. Controle total sobre o consumo.',
        side: 'right',
        align: 'start'
      }
    }
  ] as DriveStep[],
};

/**
 * Configuração padrão do Driver.js
 */
const defaultConfig = {
  showProgress: true,
  showButtons: ['next', 'previous', 'close'],
  nextBtnText: 'Próximo →',
  prevBtnText: '← Anterior',
  doneBtnText: 'Concluir',
  closeBtnText: '✕',
  progressText: '{{current}} de {{total}}',
  allowClose: true,
  overlayClickNext: false,
  smoothScroll: true,
  animate: true,
  popoverClass: 'tour-popover',
  onDestroyed: () => {
    // Salvar que completou o tour
    const tourCompleted = localStorage.getItem('tour_completed') || '[]';
    const completed = JSON.parse(tourCompleted);
    if (!completed.includes('any')) {
      completed.push('any');
      localStorage.setItem('tour_completed', JSON.stringify(completed));
    }
  }
};

/**
 * Iniciar tour específico
 */
export function startTour(tourName: keyof typeof tours) {
  const driverObj = driver({
    ...defaultConfig,
    steps: tours[tourName],
    onDestroyed: () => {
      // Salvar tour específico como completo
      const tourCompleted = localStorage.getItem('tour_completed') || '[]';
      const completed = JSON.parse(tourCompleted);
      if (!completed.includes(tourName)) {
        completed.push(tourName);
        localStorage.setItem('tour_completed', JSON.stringify(completed));
      }
    }
  });

  driverObj.drive();
}

/**
 * Verificar se tour já foi completado
 */
export function isTourCompleted(tourName: keyof typeof tours): boolean {
  const tourCompleted = localStorage.getItem('tour_completed') || '[]';
  const completed = JSON.parse(tourCompleted);
  return completed.includes(tourName);
}

/**
 * Resetar tours (para testes ou usuário quer refazer)
 */
export function resetTours() {
  localStorage.removeItem('tour_completed');
}

/**
 * Mostrar tour para novos usuários automaticamente
 */
export function showTourForNewUsers() {
  // Verificar se é primeira vez
  const isFirstTime = !localStorage.getItem('tour_completed');
  
  if (isFirstTime) {
    // Aguardar 2 segundos após carregar página
    setTimeout(() => {
      startTour('firstSteps');
    }, 2000);
  }
}
