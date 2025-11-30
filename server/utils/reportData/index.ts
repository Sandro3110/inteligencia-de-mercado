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
  console.log('[ReportData] Fetching metadata...');
  const metadata = await fetchMetadata(db, pesquisaId);
  console.log('[ReportData] Metadata fetched:', metadata);

  console.log('[ReportData] Fetching mercados...');
  const mercados = await fetchMercados(db, pesquisaId);
  console.log('[ReportData] Mercados fetched:', mercados.length);

  console.log('[ReportData] Fetching produtos...');
  const produtos = await fetchProdutos(db, pesquisaId);
  console.log('[ReportData] Produtos fetched:', produtos.length);

  console.log('[ReportData] Fetching clientes...');
  const clientes = await fetchClientes(db, pesquisaId);
  console.log('[ReportData] Clientes fetched:', clientes.total);

  console.log('[ReportData] Fetching leads...');
  const leads = await fetchLeads(db, pesquisaId);
  console.log('[ReportData] Leads fetched:', leads.total);

  console.log('[ReportData] Fetching concorrentes...');
  const concorrentes = await fetchConcorrentes(db, pesquisaId);
  console.log('[ReportData] Concorrentes fetched:', concorrentes.total);

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
