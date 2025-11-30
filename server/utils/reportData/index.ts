import { Database } from '@/server/db';
import { fetchMetadata, ReportMetadata } from './fetchMetadata';
import { fetchMercados, MercadoData } from './fetchMercados';
import { fetchProdutos, ProdutoData } from './fetchProdutos';
import { fetchClientes, ClientesData } from './fetchClientes';
import { fetchLeads, LeadsData } from './fetchLeads';
import { fetchConcorrentes, ConcorrentesData } from './fetchConcorrentes';

export interface EnhancedReportData {
  // Metadados
  projectId: number;
  projectNome: string;
  pesquisaId: number;
  pesquisaNome: string;
  status: 'in_progress' | 'completed';

  // Datas (se disponível)
  enrichmentStartedAt?: string;
  enrichmentCompletedAt?: string;
  enrichmentDuration?: string;

  // Estatísticas Gerais
  totalPesquisas: number;
  totalClientes: number;
  clientesEnriquecidos: number;
  enrichmentProgress: number;

  // Entidades
  totalLeads: number;
  totalConcorrentes: number;
  totalMercados: number;
  totalProdutos: number;

  // Dados detalhados
  mercados: MercadoData[];
  produtos: ProdutoData[];
  clientes: ClientesData;
  leads: LeadsData;
  concorrentes: ConcorrentesData;
}

/**
 * Busca TODOS os dados necessários para o relatório melhorado
 */
export async function fetchEnhancedReportData(
  db: Database,
  pesquisaId: number,
  status: 'in_progress' | 'completed',
  enrichmentStartedAt?: string,
  enrichmentCompletedAt?: string,
  enrichmentDuration?: string
): Promise<EnhancedReportData> {
  let metadata, mercados, produtos, clientes, leads, concorrentes;

  try {
    console.log('[ReportData] Fetching metadata...');
    metadata = await fetchMetadata(db, pesquisaId);
    console.log('[ReportData] Metadata fetched:', metadata);
  } catch (err) {
    console.error('[ReportData] ERROR in fetchMetadata:', err);
    throw new Error(`fetchMetadata failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    console.log('[ReportData] Fetching mercados...');
    mercados = await fetchMercados(db, pesquisaId);
    console.log('[ReportData] Mercados fetched:', mercados.length);
  } catch (err) {
    console.error('[ReportData] ERROR in fetchMercados:', err);
    throw new Error(`fetchMercados failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    console.log('[ReportData] Fetching produtos...');
    produtos = await fetchProdutos(db, pesquisaId);
    console.log('[ReportData] Produtos fetched:', produtos.length);
  } catch (err) {
    console.error('[ReportData] ERROR in fetchProdutos:', err);
    throw new Error(`fetchProdutos failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    console.log('[ReportData] Fetching clientes...');
    clientes = await fetchClientes(db, pesquisaId);
    console.log('[ReportData] Clientes fetched:', clientes.total);
  } catch (err) {
    console.error('[ReportData] ERROR in fetchClientes:', err);
    throw new Error(`fetchClientes failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    console.log('[ReportData] Fetching leads...');
    leads = await fetchLeads(db, pesquisaId);
    console.log('[ReportData] Leads fetched:', leads.total);
  } catch (err) {
    console.error('[ReportData] ERROR in fetchLeads:', err);
    throw new Error(`fetchLeads failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    console.log('[ReportData] Fetching concorrentes...');
    concorrentes = await fetchConcorrentes(db, pesquisaId);
    console.log('[ReportData] Concorrentes fetched:', concorrentes.total);
  } catch (err) {
    console.error('[ReportData] ERROR in fetchConcorrentes:', err);
    throw new Error(
      `fetchConcorrentes failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  console.log('[ReportData] All data fetched successfully');

  return {
    // Metadados
    projectId: metadata.projectId,
    projectNome: metadata.projectNome,
    pesquisaId: metadata.pesquisaId,
    pesquisaNome: metadata.pesquisaNome,
    status,

    // Datas
    enrichmentStartedAt,
    enrichmentCompletedAt,
    enrichmentDuration,

    // Estatísticas Gerais
    totalPesquisas: 1, // Sempre 1 (relatório de uma pesquisa)
    totalClientes: metadata.totalClientes,
    clientesEnriquecidos: metadata.clientesEnriquecidos,
    enrichmentProgress: metadata.enrichmentProgress,

    // Entidades
    totalLeads: leads.total,
    totalConcorrentes: concorrentes.total,
    totalMercados: mercados.length,
    totalProdutos: produtos.length,

    // Dados detalhados
    mercados,
    produtos,
    clientes,
    leads,
    concorrentes,
  };
}

// Re-export types
export type { MercadoData, ProdutoData, ClientesData, LeadsData, ConcorrentesData };
