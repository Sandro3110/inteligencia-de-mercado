import { Database } from '@/server/db';
import { leads, mercadosUnicos } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';

export interface LeadData {
  nome: string;
  mercado: string;
  potencial: string;
}

export interface LeadsData {
  total: number;
  porMercado: Record<string, number>;
  porPotencial: Record<string, number>;
  topLeads: LeadData[];
}

/**
 * Busca dados completos de leads
 */
export async function fetchLeads(db: Database, pesquisaId: number): Promise<LeadsData> {
  // Total de leads
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads)
    .innerJoin(mercadosUnicos, eq(leads.mercadoId, mercadosUnicos.id))
    .where(eq(mercadosUnicos.pesquisaId, pesquisaId));
  const total = Number(totalResult[0]?.count || 0);

  // Distribuição por mercado
  const porMercadoResult = await db
    .select({
      mercado: mercadosUnicos.nome,
      count: sql<number>`count(*)`,
    })
    .from(leads)
    .innerJoin(mercadosUnicos, eq(leads.mercadoId, mercadosUnicos.id))
    .where(eq(mercadosUnicos.pesquisaId, pesquisaId))
    .groupBy(mercadosUnicos.nome)
    .orderBy(sql`count(*) DESC`);

  const porMercado: Record<string, number> = {};
  for (const row of porMercadoResult) {
    if (row.mercado && row.mercado.trim() !== '') {
      porMercado[row.mercado] = Number(row.count);
    }
  }

  // Distribuição por potencial
  const porPotencialResult = await db
    .select({
      potencial: leads.potencial,
      count: sql<number>`count(*)`,
    })
    .from(leads)
    .innerJoin(mercadosUnicos, eq(leads.mercadoId, mercadosUnicos.id))
    .where(eq(mercadosUnicos.pesquisaId, pesquisaId))
    .groupBy(leads.potencial)
    .orderBy(sql`count(*) DESC`);

  const porPotencial: Record<string, number> = {};
  for (const row of porPotencialResult) {
    if (row.potencial) {
      porPotencial[row.potencial] = Number(row.count);
    }
  }

  // Top 30 leads
  const topLeadsResult = await db
    .select({
      nome: leads.nome,
      mercado: mercadosUnicos.nome,
      potencial: leads.potencial,
    })
    .from(leads)
    .innerJoin(mercadosUnicos, eq(leads.mercadoId, mercadosUnicos.id))
    .where(eq(mercadosUnicos.pesquisaId, pesquisaId))
    .limit(30);

  const topLeads = topLeadsResult.map((row) => ({
    nome: row.nome || 'Sem nome',
    mercado: row.mercado || 'Desconhecido',
    potencial: row.potencial || 'Não especificado',
  }));

  return {
    total,
    porMercado,
    porPotencial,
    topLeads,
  };
}
