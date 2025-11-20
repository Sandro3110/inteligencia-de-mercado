import { getDb } from './db';
import { mercadosUnicos, clientes, concorrentes, leads } from '../drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface ExecutiveReportData {
  projectId: number;
  projectName: string;
  generatedAt: Date;
  summary: {
    totalMercados: number;
    totalClientes: number;
    totalConcorrentes: number;
    totalLeads: number;
    leadsHighQuality: number; // score >= 80
  };
  topMercados: Array<{
    nome: string;
    segmentacao: string;
    totalClientes: number;
    totalConcorrentes: number;
    totalLeads: number;
    densidadeCompetitiva: number; // concorrentes por cliente
  }>;
  analiseCompetitiva: {
    mercadoMaisCompetitivo: string;
    mercadoMenosCompetitivo: string;
    mediaConcorrentesPorMercado: number;
  };
  leadsPrioritarios: Array<{
    nome: string;
    mercado: string;
    score: number;
    cnpj?: string;
    email?: string;
    telefone?: string;
  }>;
  insights: string[];
}

export interface ReportFilters {
  pesquisaId?: number;
  dateFrom?: string;
  dateTo?: string;
  mercadoIds?: number[];
}

export async function generateExecutiveReportData(
  projectId: number,
  filters?: ReportFilters
): Promise<ExecutiveReportData> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // 1. Buscar nome do projeto
  const { projects } = await import('../drizzle/schema');
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  const projectName = project[0]?.nome || 'Projeto Desconhecido';

  // 2. Estatísticas Gerais
  // Construir WHERE clauses baseadas em filtros
  const whereConditions = [eq(mercadosUnicos.projectId, projectId)];
  
  if (filters?.mercadoIds && filters.mercadoIds.length > 0) {
    whereConditions.push(sql`${mercadosUnicos.id} IN (${sql.join(filters.mercadoIds.map(id => sql`${id}`), sql`, `)})`);
  }
  
  const mercadosResult = await db.select({ count: sql<number>`count(*)` })
    .from(mercadosUnicos)
    .where(and(...whereConditions));
  
  const clientesResult = await db.select({ count: sql<number>`count(*)` })
    .from(clientes)
    .where(eq(clientes.projectId, projectId));
  
  const concorrentesResult = await db.select({ count: sql<number>`count(*)` })
    .from(concorrentes)
    .where(eq(concorrentes.projectId, projectId));
  
  const leadsResult = await db.select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(eq(leads.projectId, projectId));
  
  const leadsHighQualityResult = await db.select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(and(
      eq(leads.projectId, projectId),
      sql`${leads.qualidadeScore} >= 80`
    ));

  const summary = {
    totalMercados: Number(mercadosResult[0]?.count || 0),
    totalClientes: Number(clientesResult[0]?.count || 0),
    totalConcorrentes: Number(concorrentesResult[0]?.count || 0),
    totalLeads: Number(leadsResult[0]?.count || 0),
    leadsHighQuality: Number(leadsHighQualityResult[0]?.count || 0),
  };

  // 3. Top 10 Mercados (por volume de leads)
  const { clientesMercados } = await import('../drizzle/schema');
  
  const topMercadosRaw = await db
    .select({
      mercadoId: mercadosUnicos.id,
      nome: mercadosUnicos.nome,
      segmentacao: mercadosUnicos.segmentacao,
    })
    .from(mercadosUnicos)
    .where(eq(mercadosUnicos.projectId, projectId))
    .limit(100); // Buscar todos os mercados

  // Para cada mercado, contar clientes, concorrentes e leads
  const topMercados = await Promise.all(
    topMercadosRaw.map(async (mercado) => {
      const clientesCount = await db.select({ count: sql<number>`count(*)` })
        .from(clientesMercados)
        .where(eq(clientesMercados.mercadoId, mercado.mercadoId));
      
      const concorrentesCount = await db.select({ count: sql<number>`count(*)` })
        .from(concorrentes)
        .where(eq(concorrentes.mercadoId, mercado.mercadoId));
      
      const leadsCount = await db.select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(eq(leads.mercadoId, mercado.mercadoId));

      const totalClientes = Number(clientesCount[0]?.count || 0);
      const totalConcorrentes = Number(concorrentesCount[0]?.count || 0);
      const totalLeads = Number(leadsCount[0]?.count || 0);
      const densidadeCompetitiva = totalClientes > 0 ? totalConcorrentes / totalClientes : 0;

      return {
        nome: mercado.nome,
        segmentacao: mercado.segmentacao || 'N/A',
        totalClientes,
        totalConcorrentes,
        totalLeads,
        densidadeCompetitiva,
      };
    })
  );

  // Ordenar por totalLeads e pegar top 10
  topMercados.sort((a, b) => b.totalLeads - a.totalLeads);
  const top10Mercados = topMercados.slice(0, 10);

  // 4. Análise Competitiva
  const mercadoMaisCompetitivo = topMercados.reduce((prev, current) => 
    current.densidadeCompetitiva > prev.densidadeCompetitiva ? current : prev
  , topMercados[0] || { nome: 'N/A', densidadeCompetitiva: 0 });

  const mercadoMenosCompetitivo = topMercados.reduce((prev, current) => 
    current.densidadeCompetitiva < prev.densidadeCompetitiva && current.densidadeCompetitiva > 0 ? current : prev
  , topMercados[0] || { nome: 'N/A', densidadeCompetitiva: 0 });

  const mediaConcorrentes = topMercados.length > 0
    ? topMercados.reduce((sum, m) => sum + m.totalConcorrentes, 0) / topMercados.length
    : 0;

  const analiseCompetitiva = {
    mercadoMaisCompetitivo: mercadoMaisCompetitivo.nome,
    mercadoMenosCompetitivo: mercadoMenosCompetitivo.nome,
    mediaConcorrentesPorMercado: Math.round(mediaConcorrentes * 10) / 10,
  };

  // 5. Leads Prioritários (score >= 80)
  const leadsPrioritariosRaw = await db
    .select({
      nome: leads.nome,
      mercadoId: leads.mercadoId,
      score: leads.qualidadeScore,
      cnpj: leads.cnpj,
      email: leads.email,
      telefone: leads.telefone,
    })
    .from(leads)
    .where(and(
      eq(leads.projectId, projectId),
      sql`${leads.qualidadeScore} >= 80`
    ))
    .orderBy(desc(leads.qualidadeScore))
    .limit(20);

  const leadsPrioritarios = await Promise.all(
    leadsPrioritariosRaw.map(async (lead) => {
      const mercadoResult = await db.select({ nome: mercadosUnicos.nome })
        .from(mercadosUnicos)
        .where(eq(mercadosUnicos.id, lead.mercadoId))
        .limit(1);

      return {
        nome: lead.nome,
        mercado: mercadoResult[0]?.nome || 'Desconhecido',
        score: lead.score || 0,
        cnpj: lead.cnpj || undefined,
        email: lead.email || undefined,
        telefone: lead.telefone || undefined,
      };
    })
  );

  // 6. Insights Estratégicos
  const insights: string[] = [];
  
  if (summary.leadsHighQuality > 0) {
    const percentualHighQuality = (summary.leadsHighQuality / summary.totalLeads * 100).toFixed(1);
    insights.push(`${percentualHighQuality}% dos leads (${summary.leadsHighQuality}) possuem alta qualidade (score ≥ 80), indicando forte potencial de conversão.`);
  }

  if (topMercados.length > 0) {
    const top3Mercados = topMercados.slice(0, 3).map(m => m.nome).join(', ');
    insights.push(`Os 3 mercados com maior volume de leads são: ${top3Mercados}. Recomenda-se priorizar esforços comerciais nessas áreas.`);
  }

  if (mercadoMaisCompetitivo.densidadeCompetitiva > 5) {
    insights.push(`O mercado "${mercadoMaisCompetitivo.nome}" apresenta alta densidade competitiva (${mercadoMaisCompetitivo.densidadeCompetitiva.toFixed(1)} concorrentes por cliente). Estratégias de diferenciação são essenciais.`);
  }

  if (mercadoMenosCompetitivo.densidadeCompetitiva < 2 && mercadoMenosCompetitivo.totalLeads > 5) {
    insights.push(`O mercado "${mercadoMenosCompetitivo.nome}" possui baixa concorrência (${mercadoMenosCompetitivo.densidadeCompetitiva.toFixed(1)} concorrentes por cliente) e representa uma oportunidade de entrada facilitada.`);
  }

  const mercadosComLeads = topMercados.filter(m => m.totalLeads > 0).length;
  if (mercadosComLeads < summary.totalMercados * 0.5) {
    insights.push(`Apenas ${mercadosComLeads} de ${summary.totalMercados} mercados possuem leads identificados. Recomenda-se expandir a prospecção nos mercados restantes.`);
  }

  return {
    projectId,
    projectName,
    generatedAt: new Date(),
    summary,
    topMercados: top10Mercados,
    analiseCompetitiva,
    leadsPrioritarios,
    insights,
  };
}
