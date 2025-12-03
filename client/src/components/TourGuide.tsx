/**
 * Tour Guiado - Sistema de onboarding interativo
 * Usa importação dinâmica do driver.js para compatibilidade com SSR/build
 */

// Tipos do driver.js
type DriveStep = {
  element?: string;
  popover?: {
    title?: string;
    description?: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
  };
};

type DriverConfig = {
  showProgress?: boolean;
  showButtons?: string[];
  nextBtnText?: string;
  prevBtnText?: string;
  doneBtnText?: string;
  closeBtnText?: string;
  progressText?: string;
  allowClose?: boolean;
  overlayClickNext?: boolean;
  smoothScroll?: boolean;
  animate?: boolean;
  popoverClass?: string;
  steps?: DriveStep[];
  onDestroyed?: () => void;
};

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
        side: 'bottom' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/"]',
      popover: {
        title: '🏠 Dashboard',
        description: 'Sua central de comando. Aqui você visualiza métricas gerais, projetos ativos e atividades recentes.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/entidades"]',
      popover: {
        title: '🗄️ Base de Dados',
        description: 'Consulte e gerencie todas as entidades (empresas, clientes, leads) cadastradas no sistema.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/projetos"]',
      popover: {
        title: '📁 Projetos',
        description: 'Organize seu trabalho em projetos de inteligência de mercado. Cada projeto pode ter múltiplas pesquisas.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/pesquisas"]',
      popover: {
        title: '🔍 Pesquisas',
        description: 'Configure pesquisas de mercado e segmentação. Defina critérios e filtros para análise.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/importacao"]',
      popover: {
        title: '📤 Importar Dados',
        description: 'Importe dados de clientes, leads e empresas a partir de arquivos CSV ou Excel.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/enriquecimento"]',
      popover: {
        title: '✨ Enriquecer com IA',
        description: 'Use inteligência artificial para enriquecer automaticamente dados de empresas: mercado, produtos, concorrentes e leads.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/processamento-ia"]',
      popover: {
        title: '🖥️ Processamento Avançado',
        description: 'Processe lotes de dados e gere insights automatizados com IA em escala.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/cubo"]',
      popover: {
        title: '🔷 Explorador Multidimensional',
        description: 'Análise interativa por múltiplas dimensões: setor, porte, região, produtos e mais.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/analise/temporal"]',
      popover: {
        title: '📈 Análise Temporal',
        description: 'Identifique tendências e padrões ao longo do tempo. Visualize evolução de métricas.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/analise/geografica"]',
      popover: {
        title: '🗺️ Análise Geográfica',
        description: 'Visualize distribuição geográfica de empresas e identifique oportunidades por região.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/analise/mercado"]',
      popover: {
        title: '🌐 Análise de Mercado',
        description: 'Explore hierarquia de mercados, segmentos de atuação e posicionamento competitivo.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      popover: {
        title: '🎉 Tour Concluído!',
        description: 'Parabéns! Você conheceu todas as funcionalidades principais. Explore à vontade e conte com nossa ajuda sempre que precisar!',
      }
    }
  ],

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
        side: 'bottom' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/"]',
      popover: {
        title: '1️⃣ Dashboard',
        description: 'Sua central de comando. Aqui você vê o que está acontecendo.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/projetos"]',
      popover: {
        title: '2️⃣ Crie um Projeto',
        description: 'Primeiro passo: criar um projeto para organizar seu trabalho.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/importacao"]',
      popover: {
        title: '3️⃣ Importe Dados',
        description: 'Traga seus dados de empresas/clientes via CSV ou Excel.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/entidades"]',
      popover: {
        title: '4️⃣ Visualize seus Dados',
        description: 'Aqui você vê todos os dados importados e pode gerenciá-los.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/enriquecimento"]',
      popover: {
        title: '5️⃣ Enriqueça com IA',
        description: 'Próximo passo: enriquecer seus dados automaticamente com inteligência artificial!',
        side: 'right' as const,
        align: 'start' as const
      }
    }
  ],

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
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/analise/temporal"]',
      popover: {
        title: '📈 Análise Temporal',
        description: 'Identifique padrões e tendências ao longo do tempo. Perfeito para prever comportamentos.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/analise/geografica"]',
      popover: {
        title: '🗺️ Análise Geográfica',
        description: 'Visualize distribuição geográfica em mapas interativos. Encontre oportunidades por região.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/analise/mercado"]',
      popover: {
        title: '🌐 Análise de Mercado',
        description: 'Explore hierarquia de mercados e segmentos. Entenda o posicionamento competitivo.',
        side: 'right' as const,
        align: 'start' as const
      }
    }
  ],

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
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/processamento-ia"]',
      popover: {
        title: '🖥️ Processamento em Lote',
        description: 'Processe múltiplas empresas de uma vez. Ideal para grandes volumes de dados.',
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: 'a[href="/gestao-ia"]',
      popover: {
        title: '🛡️ Gestão de IA',
        description: 'Monitore uso, custos e segurança da inteligência artificial. Controle total sobre o consumo.',
        side: 'right' as const,
        align: 'start' as const
      }
    }
  ],
};

/**
 * Configuração padrão do Driver.js
 */
const defaultConfig: DriverConfig = {
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
};

/**
 * Iniciar tour específico
 */
export async function startTour(tourName: keyof typeof tours) {
  try {
    // Importação dinâmica do driver.js
    const { driver } = await import('driver.js');
    
    // Importar CSS
    await import('driver.js/dist/driver.css');

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
  } catch (error) {
    console.error('Erro ao carregar tour:', error);
  }
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
