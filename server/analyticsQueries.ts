import { eq, and, sql, gte, lte, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  analyticsMercados,
  analyticsPesquisas,
  analyticsDimensoes,
  analyticsTimeline,
  mercadosUnicos,
  pesquisas,
} from "../drizzle/schema";

/**
 * Consultas de Analytics para alimentar dashboards
 */

/**
 * Buscar métricas agregadas por mercado
 */
export async function getAnalyticsByMercado(params: {
  projectId: number;
  mercadoId?: number;
  pesquisaId?: number;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const db = await getDb();
  if (!db) return [];

  const { projectId, mercadoId, pesquisaId, dateFrom, dateTo } = params;

  const conditions = [eq(analyticsMercados.projectId, projectId)];
  
  if (mercadoId) conditions.push(eq(analyticsMercados.mercadoId, mercadoId));
  if (pesquisaId) conditions.push(eq(analyticsMercados.pesquisaId, pesquisaId));
  if (dateFrom) conditions.push(gte(analyticsMercados.periodo, dateFrom));
  if (dateTo) conditions.push(lte(analyticsMercados.periodo, dateTo));

  const metricas = await db
    .select()
    .from(analyticsMercados)
    .where(and(...conditions))
    .orderBy(desc(analyticsMercados.periodo));

  return metricas;
}

/**
 * Buscar métricas agregadas por pesquisa
 */
export async function getAnalyticsByPesquisa(params: {
  projectId: number;
  pesquisaId?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const { projectId, pesquisaId } = params;

  const conditions = [eq(analyticsPesquisas.projectId, projectId)];
  if (pesquisaId) conditions.push(eq(analyticsPesquisas.pesquisaId, pesquisaId));

  const metricas = await db
    .select()
    .from(analyticsPesquisas)
    .where(and(...conditions))
    .orderBy(desc(analyticsPesquisas.createdAt));

  return metricas;
}

/**
 * Buscar métricas agregadas por dimensão
 */
export async function getAnalyticsByDimensao(params: {
  projectId: number;
  dimensaoTipo?: "uf" | "porte" | "segmentacao" | "categoria";
  dimensaoValor?: string;
  pesquisaId?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const { projectId, dimensaoTipo, dimensaoValor, pesquisaId } = params;

  const conditions = [eq(analyticsDimensoes.projectId, projectId)];
  
  if (dimensaoTipo) conditions.push(eq(analyticsDimensoes.dimensaoTipo, dimensaoTipo));
  if (dimensaoValor) conditions.push(eq(analyticsDimensoes.dimensaoValor, dimensaoValor));
  if (pesquisaId) conditions.push(eq(analyticsDimensoes.pesquisaId, pesquisaId));

  const metricas = await db
    .select()
    .from(analyticsDimensoes)
    .where(and(...conditions))
    .orderBy(desc(analyticsDimensoes.totalLeads));

  return metricas;
}

/**
 * Buscar evolução temporal (timeline)
 */
export async function getAnalyticsTimeline(params: {
  projectId: number;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const { projectId, dateFrom, dateTo, limit = 30 } = params;

  const conditions = [eq(analyticsTimeline.projectId, projectId)];
  
  if (dateFrom) conditions.push(gte(analyticsTimeline.data, dateFrom));
  if (dateTo) conditions.push(lte(analyticsTimeline.data, dateTo));

  const timeline = await db
    .select()
    .from(analyticsTimeline)
    .where(and(...conditions))
    .orderBy(desc(analyticsTimeline.data))
    .limit(limit);

  return timeline.reverse(); // Ordem cronológica
}

/**
 * Buscar métricas consolidadas para Research Overview Dashboard
 */
export async function getResearchOverviewMetrics(params: {
  projectId: number;
  pesquisaId?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  const { projectId, pesquisaId } = params;

  // Buscar métricas da pesquisa
  const pesquisaConditions = [eq(analyticsPesquisas.projectId, projectId)];
  if (pesquisaId) pesquisaConditions.push(eq(analyticsPesquisas.pesquisaId, pesquisaId));

  const [pesquisaMetrics] = await db
    .select()
    .from(analyticsPesquisas)
    .where(and(...pesquisaConditions))
    .orderBy(desc(analyticsPesquisas.createdAt))
    .limit(1);

  // Buscar métricas por mercado
  const mercadoConditions = [eq(analyticsMercados.projectId, projectId)];
  if (pesquisaId) mercadoConditions.push(eq(analyticsMercados.pesquisaId, pesquisaId));

  const mercadosMetrics = await db
    .select()
    .from(analyticsMercados)
    .where(and(...mercadoConditions));

  // Calcular totais agregados
  const totalMercados = mercadosMetrics.length;
  const totalLeads = mercadosMetrics.reduce((sum, m) => sum + (m.totalLeadsGerados || 0), 0);
  const totalValidados = mercadosMetrics.reduce((sum, m) => sum + (m.leadsValidados || 0), 0);
  const totalAprovados = mercadosMetrics.reduce((sum, m) => sum + (m.leadsAprovados || 0), 0);
  const totalDescartados = mercadosMetrics.reduce((sum, m) => sum + (m.leadsDescartados || 0), 0);

  const qualidadeMedia = totalLeads > 0
    ? mercadosMetrics.reduce((sum, m) => sum + (m.qualidadeMediaLeads || 0) * (m.totalLeadsGerados || 0), 0) / totalLeads
    : 0;

  const taxaAprovacao = totalValidados > 0 ? (totalAprovados / totalValidados) * 100 : 0;

  // Distribuição de qualidade
  const leadsAlta = mercadosMetrics.reduce((sum, m) => sum + (m.leadsAltaQualidade || 0), 0);
  const leadsMedia = mercadosMetrics.reduce((sum, m) => sum + (m.leadsMediaQualidade || 0), 0);
  const leadsBaixa = mercadosMetrics.reduce((sum, m) => sum + (m.leadsBaixaQualidade || 0), 0);

  // Top 10 mercados por volume
  const topMercados = await db
    .select({
      mercadoId: analyticsMercados.mercadoId,
      mercadoNome: mercadosUnicos.nome,
      totalLeads: analyticsMercados.totalLeadsGerados,
      qualidadeMedia: analyticsMercados.qualidadeMediaLeads,
      taxaAprovacao: analyticsMercados.taxaAprovacao,
    })
    .from(analyticsMercados)
    .leftJoin(mercadosUnicos, eq(analyticsMercados.mercadoId, mercadosUnicos.id))
    .where(and(...mercadoConditions))
    .orderBy(desc(analyticsMercados.totalLeadsGerados))
    .limit(10);

  return {
    pesquisaMetrics,
    kpis: {
      totalMercados,
      totalLeads,
      totalValidados,
      totalAprovados,
      totalDescartados,
      qualidadeMedia: Math.round(qualidadeMedia),
      taxaAprovacao: Math.round(taxaAprovacao * 100) / 100,
    },
    distribuicaoQualidade: {
      alta: leadsAlta,
      media: leadsMedia,
      baixa: leadsBaixa,
    },
    topMercados,
  };
}

/**
 * Buscar evolução temporal para gráfico de linha
 */
export async function getTimelineEvolution(params: {
  projectId: number;
  days?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const { projectId, days = 30 } = params;

  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  const timeline = await db
    .select({
      data: analyticsTimeline.data,
      leadsGerados: analyticsTimeline.leadsGeradosDia,
      leadsValidados: analyticsTimeline.leadsValidadosDia,
      qualidadeMedia: analyticsTimeline.qualidadeMediaDia,
      leadsAcumulados: analyticsTimeline.leadsAcumulados,
    })
    .from(analyticsTimeline)
    .where(
      and(
        eq(analyticsTimeline.projectId, projectId),
        gte(analyticsTimeline.data, dateFrom)
      )
    )
    .orderBy(analyticsTimeline.data);

  return timeline;
}
