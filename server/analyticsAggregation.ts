import { eq, and, sql, gte, lte, desc } from "drizzle-orm";
import { getDb } from "./db";
import { toMySQLTimestamp, toMySQLTimestampOrNull, now } from "./dateUtils";
import {
  analyticsMercados,
  analyticsPesquisas,
  analyticsDimensoes,
  analyticsTimeline,
  leads,
  clientes,
  concorrentes,
  mercadosUnicos,
  pesquisas,
} from "../drizzle/schema";
import type {
  InsertAnalyticsMercado,
  InsertAnalyticsPesquisa,
  InsertAnalyticsDimensao,
  InsertAnalyticsTimeline,
} from "../drizzle/schema";

/**
 * Motor de Agregação - Calcula métricas de analytics
 * Deve ser executado diariamente via cron job
 */

/**
 * Agrega métricas por mercado
 */
export async function aggregateMercadoMetrics(
  projectId: number,
  pesquisaId?: number,
  periodo?: Date
): Promise<void> {
  const db = await getDb();
  if (!db) {
    return;
  }

  const periodoRef = toMySQLTimestamp(periodo || new Date());

  // Buscar todos os mercados do projeto/pesquisa
  const whereClause = pesquisaId
    ? and(
        eq(mercadosUnicos.projectId, projectId),
        eq(mercadosUnicos.pesquisaId, pesquisaId)
      )
    : eq(mercadosUnicos.projectId, projectId);

  const mercados = await db.select().from(mercadosUnicos).where(whereClause);

  for (const mercado of mercados) {
    // Buscar leads do mercado
    const leadsDoMercado = await db
      .select()
      .from(leads)
      .where(
        and(
          eq(leads.projectId, projectId),
          eq(leads.mercadoId, mercado.id),
          pesquisaId ? eq(leads.pesquisaId, pesquisaId) : sql`1=1`
        )
      );

    // Calcular métricas
    const totalLeadsGerados = leadsDoMercado.length;
    const leadsAltaQualidade = leadsDoMercado.filter(
      l => (l.qualidadeScore || 0) >= 80
    ).length;
    const leadsMediaQualidade = leadsDoMercado.filter(
      l => (l.qualidadeScore || 0) >= 50 && (l.qualidadeScore || 0) < 80
    ).length;
    const leadsBaixaQualidade = leadsDoMercado.filter(
      l => (l.qualidadeScore || 0) < 50
    ).length;

    const qualidadeMedia =
      totalLeadsGerados > 0
        ? leadsDoMercado.reduce((sum, l) => sum + (l.qualidadeScore || 0), 0) /
          totalLeadsGerados
        : 0;

    const leadsValidados = leadsDoMercado.filter(
      l => l.validationStatus && l.validationStatus !== "pending"
    ).length;
    const leadsAprovados = leadsDoMercado.filter(
      l => l.validationStatus === "rich"
    ).length;
    const leadsDescartados = leadsDoMercado.filter(
      l => l.validationStatus === "discarded"
    ).length;
    const taxaAprovacao =
      leadsValidados > 0 ? (leadsAprovados / leadsValidados) * 100 : 0;

    // Buscar clientes e concorrentes do mercado
    const clientesDoMercado = await db
      .select()
      .from(clientes)
      .where(
        and(
          eq(clientes.projectId, projectId),
          pesquisaId ? eq(clientes.pesquisaId, pesquisaId) : sql`1=1`
        )
      );

    const concorrentesDoMercado = await db
      .select()
      .from(concorrentes)
      .where(
        and(
          eq(concorrentes.projectId, projectId),
          eq(concorrentes.mercadoId, mercado.id),
          pesquisaId ? eq(concorrentes.pesquisaId, pesquisaId) : sql`1=1`
        )
      );

    // Inserir/atualizar métricas
    const metricas: InsertAnalyticsMercado = {
      projectId,
      pesquisaId: pesquisaId || null,
      mercadoId: mercado.id,
      periodo: periodoRef,
      totalClientes: clientesDoMercado.length,
      totalConcorrentes: concorrentesDoMercado.length,
      totalLeadsGerados,
      qualidadeMediaLeads: Math.round(qualidadeMedia * 100),
      leadsAltaQualidade,
      leadsMediaQualidade,
      leadsBaixaQualidade,
      leadsValidados,
      leadsAprovados,
      leadsDescartados,
      taxaAprovacao: Math.round(taxaAprovacao * 100),
    };

    await db.insert(analyticsMercados).values(metricas);
  }
}

/**
 * Agrega métricas por pesquisa
 */
export async function aggregatePesquisaMetrics(
  projectId: number,
  pesquisaId: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    return;
  }

  // Buscar pesquisa
  const [pesquisa] = await db
    .select()
    .from(pesquisas)
    .where(
      and(eq(pesquisas.id, pesquisaId), eq(pesquisas.projectId, projectId))
    )
    .limit(1);

  if (!pesquisa) {
    return;
  }

  // Buscar mercados mapeados
  const mercadosMapeados = await db
    .select()
    .from(mercadosUnicos)
    .where(
      and(
        eq(mercadosUnicos.projectId, projectId),
        eq(mercadosUnicos.pesquisaId, pesquisaId)
      )
    );

  // Buscar clientes base
  const clientesBase = await db
    .select()
    .from(clientes)
    .where(
      and(
        eq(clientes.projectId, projectId),
        eq(clientes.pesquisaId, pesquisaId)
      )
    );

  // Buscar leads gerados
  const leadsGerados = await db
    .select()
    .from(leads)
    .where(
      and(eq(leads.projectId, projectId), eq(leads.pesquisaId, pesquisaId))
    );

  // Calcular métricas
  const totalLeadsGerados = leadsGerados.length;
  const totalClientesBase = clientesBase.length;
  const taxaConversao =
    totalClientesBase > 0 ? (totalLeadsGerados / totalClientesBase) * 100 : 0;

  const qualidadeMedia =
    totalLeadsGerados > 0
      ? leadsGerados.reduce((sum, l) => sum + (l.qualidadeScore || 0), 0) /
        totalLeadsGerados
      : 0;

  const leadsAlta = leadsGerados.filter(
    l => (l.qualidadeScore || 0) >= 80
  ).length;
  const leadsMedia = leadsGerados.filter(
    l => (l.qualidadeScore || 0) >= 50 && (l.qualidadeScore || 0) < 80
  ).length;
  const leadsBaixa = leadsGerados.filter(
    l => (l.qualidadeScore || 0) < 50
  ).length;

  const distribuicaoQualidade = JSON.stringify({
    alta: leadsAlta,
    media: leadsMedia,
    baixa: leadsBaixa,
  });

  // Calcular duração
  const dataInicioRaw = pesquisa.dataImportacao || pesquisa.createdAt;
  const dataConclusaoRaw =
    pesquisa.status === "concluido" ? pesquisa.updatedAt : new Date();

  const dataInicioDate =
    typeof dataInicioRaw === "string" ? new Date(dataInicioRaw) : dataInicioRaw;
  const dataConclusaoDate =
    typeof dataConclusaoRaw === "string"
      ? new Date(dataConclusaoRaw)
      : dataConclusaoRaw;

  const duracaoDias =
    dataInicioDate && dataConclusaoDate
      ? Math.ceil(
          (dataConclusaoDate.getTime() - dataInicioDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  // Inserir/atualizar métricas
  const metricas: InsertAnalyticsPesquisa = {
    projectId,
    pesquisaId,
    totalMercadosMapeados: mercadosMapeados.length,
    totalClientesBase,
    totalLeadsGerados,
    taxaConversaoClienteLead: Math.round(taxaConversao * 100),
    qualidadeMediaGeral: Math.round(qualidadeMedia * 100),
    distribuicaoQualidade,
    dataInicio: dataInicioRaw
      ? typeof dataInicioRaw === "string"
        ? dataInicioRaw
        : toMySQLTimestamp(dataInicioRaw)
      : undefined,
    dataConclusao: dataConclusaoRaw
      ? typeof dataConclusaoRaw === "string"
        ? dataConclusaoRaw
        : toMySQLTimestamp(dataConclusaoRaw)
      : undefined,
    duracaoDias,
  };

  await db.insert(analyticsPesquisas).values(metricas);
}

/**
 * Agrega métricas por dimensão (UF, Porte, Segmentação)
 */
export async function aggregateDimensaoMetrics(
  projectId: number,
  pesquisaId?: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    return;
  }

  const dimensoes: Array<{
    tipo: "uf" | "porte" | "segmentacao" | "categoria";
    campo: string;
  }> = [
    { tipo: "uf", campo: "uf" },
    { tipo: "porte", campo: "porte" },
    { tipo: "segmentacao", campo: "tipo" },
  ];

  for (const { tipo, campo } of dimensoes) {
    // Buscar leads agrupados por dimensão
    const whereClause = pesquisaId
      ? and(eq(leads.projectId, projectId), eq(leads.pesquisaId, pesquisaId))
      : eq(leads.projectId, projectId);

    const leadsAgrupados = await db
      .select({
        valor: sql<string>`${leads[campo as keyof typeof leads]}`,
        totalLeads: sql<number>`COUNT(*)`,
        qualidadeMedia: sql<number>`AVG(${leads.qualidadeScore})`,
      })
      .from(leads)
      .where(whereClause)
      .groupBy(sql`${leads[campo as keyof typeof leads]}`);

    for (const grupo of leadsAgrupados) {
      if (!grupo.valor) {
        continue;
      }

      const metricas: InsertAnalyticsDimensao = {
        projectId,
        pesquisaId: pesquisaId || null,
        dimensaoTipo: tipo,
        dimensaoValor: grupo.valor,
        totalLeads: Number(grupo.totalLeads),
        qualidadeMedia: Math.round((grupo.qualidadeMedia || 0) * 100),
      };

      await db.insert(analyticsDimensoes).values(metricas);
    }
  }
}

/**
 * Agrega métricas diárias (timeline)
 */
export async function aggregateTimelineMetrics(
  projectId: number,
  data?: Date
): Promise<void> {
  const db = await getDb();
  if (!db) {
    return;
  }

  const dataRef = toMySQLTimestamp(data || new Date());
  const inicioDia = new Date(dataRef);
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date(dataRef);
  fimDia.setHours(23, 59, 59, 999);

  // Converter para strings ISO para comparação com timestamp do banco
  const inicioDiaStr = toMySQLTimestamp(inicioDia);
  const fimDiaStr = toMySQLTimestamp(fimDia);

  // Leads gerados no dia
  const leadsGeradosDia = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(leads)
    .where(
      and(
        eq(leads.projectId, projectId),
        gte(leads.createdAt, inicioDiaStr),
        lte(leads.createdAt, fimDiaStr)
      )
    );

  // Leads validados no dia
  const leadsValidadosDia = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(leads)
    .where(
      and(
        eq(leads.projectId, projectId),
        gte(leads.validatedAt, inicioDiaStr),
        lte(leads.validatedAt, fimDiaStr)
      )
    );

  // Qualidade média do dia
  const qualidadeMediaDia = await db
    .select({ avg: sql<number>`AVG(${leads.qualidadeScore})` })
    .from(leads)
    .where(
      and(
        eq(leads.projectId, projectId),
        gte(leads.createdAt, inicioDiaStr),
        lte(leads.createdAt, fimDiaStr)
      )
    );

  // Leads acumulados até o dia
  const leadsAcumulados = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(leads)
    .where(
      and(eq(leads.projectId, projectId), lte(leads.createdAt, fimDiaStr))
    );

  const metricas: InsertAnalyticsTimeline = {
    projectId,
    data: dataRef,
    leadsGeradosDia: Number(leadsGeradosDia[0]?.count || 0),
    leadsValidadosDia: Number(leadsValidadosDia[0]?.count || 0),
    qualidadeMediaDia: Math.round((qualidadeMediaDia[0]?.avg || 0) * 100),
    leadsAcumulados: Number(leadsAcumulados[0]?.count || 0),
  };

  await db.insert(analyticsTimeline).values(metricas);
}

/**
 * Executa todas as agregações para um projeto
 */
export async function runFullAggregation(
  projectId: number,
  pesquisaId?: number
): Promise<void> {
  console.log(
    `[Analytics] Iniciando agregação para projeto ${projectId}${pesquisaId ? `, pesquisa ${pesquisaId}` : ""}`
  );

  try {
    await aggregateMercadoMetrics(projectId, pesquisaId);
    console.log(`[Analytics] ✓ Métricas por mercado agregadas`);

    if (pesquisaId) {
      await aggregatePesquisaMetrics(projectId, pesquisaId);
      console.log(`[Analytics] ✓ Métricas por pesquisa agregadas`);
    }

    await aggregateDimensaoMetrics(projectId, pesquisaId);
    console.log(`[Analytics] ✓ Métricas por dimensão agregadas`);

    await aggregateTimelineMetrics(projectId);
    console.log(`[Analytics] ✓ Métricas de timeline agregadas`);

    console.log(`[Analytics] Agregação concluída com sucesso`);
  } catch (error) {
    console.error(`[Analytics] Erro na agregação:`, error);
    throw error;
  }
}
