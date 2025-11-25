import { logger } from '@/lib/logger';

/**
 * Módulo de Re-enriquecimento de Pesquisas
 *
 * Permite refazer o enriquecimento de uma pesquisa existente com 3 modos:
 * - TOTAL: Limpa tudo e refaz do zero
 * - INCREMENTAL: Apenas adiciona novos dados
 * - PARCIAL: Refaz apenas categorias específicas
 */

import { eq, and } from 'drizzle-orm';
import { getDb } from './db';
import { clientes, mercadosUnicos, concorrentes, leads } from '../drizzle/schema';

export type ReEnrichmentMode = 'total' | 'incremental' | 'parcial';

export type ReEnrichmentOptions = {
  pesquisaId: number;
  projectId: number;
  mode: ReEnrichmentMode;
  // Para modo parcial
  categories?: {
    mercados?: boolean;
    clientes?: boolean;
    concorrentes?: boolean;
    leads?: boolean;
  };
  // Novos clientes para adicionar (modo incremental)
  novosClientes?: Array<{
    nome: string;
    cnpj?: string;
    site?: string;
    produto?: string;
  }>;
};

export type ReEnrichmentProgress = {
  status: 'processing' | 'completed' | 'error';
  message: string;
  currentStep: number;
  totalSteps: number;
  data?: {
    deletedCounts?: {
      mercados: number;
      clientes: number;
      concorrentes: number;
      leads: number;
    };
    newCounts?: {
      mercados: number;
      clientes: number;
      concorrentes: number;
      leads: number;
    };
  };
};

/**
 * Executa re-enriquecimento de uma pesquisa
 */
export async function executeReEnrichment(
  options: ReEnrichmentOptions,
  onProgress: (progress: ReEnrichmentProgress) => void
): Promise<ReEnrichmentProgress> {
  try {
    const { pesquisaId, projectId, mode, categories, novosClientes } = options;

    // Validar pesquisa existe
    const { getPesquisaById } = await import('./db');
    const pesquisa = await getPesquisaById(pesquisaId);
    if (!pesquisa) {
      throw new Error(`Pesquisa ${pesquisaId} não encontrada`);
    }

    let totalSteps = 0;
    let currentStep = 0;

    // Calcular total de passos baseado no modo
    if (mode === 'total') {
      totalSteps = 6; // Limpar tudo + refazer tudo
    } else if (mode === 'incremental') {
      totalSteps = 4; // Apenas adicionar novos dados
    } else if (mode === 'parcial') {
      const categoriasAtivas = Object.values(categories || {}).filter(Boolean).length;
      totalSteps = categoriasAtivas * 2; // Limpar + refazer cada categoria
    }

    onProgress({
      status: 'processing',
      message: `Iniciando re-enriquecimento (modo: ${mode})...`,
      currentStep: ++currentStep,
      totalSteps,
    });

    const deletedCounts = {
      mercados: 0,
      clientes: 0,
      concorrentes: 0,
      leads: 0,
    };

    // MODO TOTAL: Limpar tudo
    if (mode === 'total') {
      onProgress({
        status: 'processing',
        message: 'Limpando dados antigos...',
        currentStep: ++currentStep,
        totalSteps,
      });

      deletedCounts.mercados = await deleteMercadosByPesquisa(pesquisaId);
      deletedCounts.clientes = await deleteClientesByPesquisa(pesquisaId);
      deletedCounts.concorrentes = await deleteConcorrentesByPesquisa(pesquisaId);
      deletedCounts.leads = await deleteLeadsByPesquisa(pesquisaId);

      logger.debug(`[ReEnrichment] Dados removidos:`, deletedCounts);
    }

    // MODO PARCIAL: Limpar apenas categorias selecionadas
    if (mode === 'parcial' && categories) {
      onProgress({
        status: 'processing',
        message: 'Limpando categorias selecionadas...',
        currentStep: ++currentStep,
        totalSteps,
      });

      if (categories.mercados) {
        deletedCounts.mercados = await deleteMercadosByPesquisa(pesquisaId);
      }
      if (categories.clientes) {
        deletedCounts.clientes = await deleteClientesByPesquisa(pesquisaId);
      }
      if (categories.concorrentes) {
        deletedCounts.concorrentes = await deleteConcorrentesByPesquisa(pesquisaId);
      }
      if (categories.leads) {
        deletedCounts.leads = await deleteLeadsByPesquisa(pesquisaId);
      }

      logger.debug(`[ReEnrichment] Categorias removidas:`, deletedCounts);
    }

    // Preparar dados para re-enriquecimento
    let clientesParaEnriquecer: Array<{
      nome: string;
      cnpj?: string;
      site?: string;
      produto?: string;
    }> = [];

    if (mode === 'incremental' && novosClientes) {
      // Modo incremental: apenas novos clientes
      clientesParaEnriquecer = novosClientes;
    } else {
      // Modos total/parcial: buscar clientes originais da pesquisa
      // (assumindo que temos os dados originais salvos)
      onProgress({
        status: 'processing',
        message: 'Recuperando dados originais da pesquisa...',
        currentStep: ++currentStep,
        totalSteps,
      });

      // TODO: Implementar recuperação de dados originais
      // Por enquanto, vamos assumir que os clientes ainda existem
      const db = await getDb();
      if (db) {
        const clientesExistentes = await db
          .select()
          .from(clientes)
          .where(eq(clientes.pesquisaId, pesquisaId));

        clientesParaEnriquecer = clientesExistentes.map((c) => ({
          nome: c.nome,
          cnpj: c.cnpj || undefined,
          site: c.siteOficial || undefined,
          produto: c.produtoPrincipal || undefined,
        }));
      }
    }

    // Executar fluxo de enriquecimento
    onProgress({
      status: 'processing',
      message: `Executando enriquecimento de ${clientesParaEnriquecer.length} clientes...`,
      currentStep: ++currentStep,
      totalSteps,
    });

    const { executeEnrichmentFlow } = await import('./enrichmentFlow');

    const result = await executeEnrichmentFlow(
      {
        clientes: clientesParaEnriquecer,
        projectId,
        projectName: pesquisa.nome,
      },
      (flowProgress) => {
        // Repassar progresso do fluxo
        onProgress({
          status: 'processing',
          message: flowProgress.message,
          currentStep: currentStep + flowProgress.currentStep,
          totalSteps: totalSteps + flowProgress.totalSteps,
        });
      }
    );

    if (result.status === 'error') {
      throw new Error(result.message);
    }

    // Atualizar status da pesquisa
    const { updatePesquisaStatus } = await import('./db');
    await updatePesquisaStatus(pesquisaId, 'concluido');

    return {
      status: 'completed',
      message: 'Re-enriquecimento concluído com sucesso!',
      currentStep: totalSteps,
      totalSteps,
      data: {
        deletedCounts,
        newCounts: result.data?.stats
          ? {
              mercados: result.data.stats.mercadosCount || 0,
              clientes: result.data.stats.clientesCount || 0,
              concorrentes: result.data.stats.concorrentesCount || 0,
              leads: result.data.stats.leadsCount || 0,
            }
          : undefined,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[ReEnrichment] Erro:', errorMessage);

    return {
      status: 'error',
      message: `Erro no re-enriquecimento: ${errorMessage}`,
      currentStep: 0,
      totalSteps: 0,
    };
  }
}

/**
 * Funções auxiliares de limpeza
 */

async function deleteMercadosByPesquisa(pesquisaId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.delete(mercadosUnicos).where(eq(mercadosUnicos.pesquisaId, pesquisaId));

  // PostgreSQL delete returns deleted rows, count them
  return Array.isArray(result) ? result.length : 0;
}

async function deleteClientesByPesquisa(pesquisaId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.delete(clientes).where(eq(clientes.pesquisaId, pesquisaId));

  // PostgreSQL delete returns deleted rows, count them
  return Array.isArray(result) ? result.length : 0;
}

async function deleteConcorrentesByPesquisa(pesquisaId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.delete(concorrentes).where(eq(concorrentes.pesquisaId, pesquisaId));

  // PostgreSQL delete returns deleted rows, count them
  return Array.isArray(result) ? result.length : 0;
}

async function deleteLeadsByPesquisa(pesquisaId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.delete(leads).where(eq(leads.pesquisaId, pesquisaId));

  // PostgreSQL delete returns deleted rows, count them
  return Array.isArray(result) ? result.length : 0;
}
