import { Database } from '@/server/db';
import { fetchMetadata, ReportMetadata } from './fetchMetadata';
import { fetchMercados, MercadoData } from './fetchMercados';
import { fetchProdutos, ProdutoData } from './fetchProdutos';
import { fetchClientes, ClientesData } from './fetchClientes';
import { fetchLeads, LeadsData } from './fetchLeads';
import { fetchConcorrentes, ConcorrentesData } from './fetchConcorrentes';

export interface EnhancedReportData {
  // Metadados
  metadata: ReportMetadata;

  // Dados agregados
  totalMercados: number;
  totalProdutos: number;
  totalLeads: number;
  totalConcorrentes: number;

  // Dados detalhados
  mercados: MercadoData[];
  produtos: ProdutoData[];
  clientes: ClientesData;
  leads: LeadsData;
  concorrentes: ConcorrentesData;

  // Timestamps
  enrichmentStartedAt?: string;
  enrichmentCompletedAt?: string;
  enrichmentDuration?: string;
}

/**
 * Busca todos os dados necessários para o relatório enhanced
 */
export async function fetchEnhancedReportData(
  db: Database,
  pesquisaId: number,
  enrichmentStartedAt?: string,
  enrichmentCompletedAt?: string,
  enrichmentDuration?: string
): Promise<EnhancedReportData> {
  console.log('[ReportData] Iniciando busca de dados para pesquisa:', pesquisaId);

  // Buscar metadata
  const metadata = await fetchMetadata(db, pesquisaId);
  console.log('[ReportData] Metadata fetched');

  // Buscar mercados
  const mercados = await fetchMercados(db, pesquisaId);
  console.log('[ReportData] Mercados fetched:', mercados.length);

  // Buscar produtos
  const produtos = await fetchProdutos(db, pesquisaId);
  console.log('[ReportData] Produtos fetched:', produtos.length);

  // Buscar clientes
  const clientes = await fetchClientes(db, pesquisaId);
  console.log('[ReportData] Clientes fetched:', clientes.total);

  // Buscar leads
  const leads = await fetchLeads(db, pesquisaId);
  console.log('[ReportData] Leads fetched:', leads.total);

  // Buscar concorrentes
  const concorrentes = await fetchConcorrentes(db, pesquisaId);
  console.log('[ReportData] Concorrentes fetched:', concorrentes.total);

  console.log('[ReportData] Todos os dados buscados com sucesso');

  return {
    metadata,
    totalMercados: mercados.length,
    totalProdutos: produtos.length,
    totalLeads: leads.total,
    totalConcorrentes: concorrentes.total,
    mercados,
    produtos,
    clientes,
    leads,
    concorrentes,
    enrichmentStartedAt,
    enrichmentCompletedAt,
    enrichmentDuration,
  };
}
