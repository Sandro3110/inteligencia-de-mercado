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
  try {
    // Total de leads
    let total = 0;
    try {
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .innerJoin(mercadosUnicos, eq(leads.mercadoId, mercadosUnicos.id))
        .where(eq(mercadosUnicos.pesquisaId, pesquisaId));
      total = Number(totalResult?.[0]?.count ?? 0);
    } catch (err) {
      console.error('[fetchLeads] Erro ao contar total:', err);
    }

    // Distribuição por mercado
    const porMercado: Record<string, number> = {};
    try {
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

      if (Array.isArray(porMercadoResult)) {
        for (const row of porMercadoResult) {
          const mercado = row?.mercado;
          if (mercado && typeof mercado === 'string' && mercado.trim().length > 0) {
            porMercado[mercado] = Number(row.count ?? 0);
          }
        }
      }
    } catch (err) {
      console.error('[fetchLeads] Erro ao buscar por mercado:', err);
    }

    // Distribuição por potencial
    const porPotencial: Record<string, number> = {};
    try {
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

      if (Array.isArray(porPotencialResult)) {
        for (const row of porPotencialResult) {
          const potencial = row?.potencial;
          if (potencial && typeof potencial === 'string') {
            porPotencial[potencial] = Number(row.count ?? 0);
          }
        }
      }
    } catch (err) {
      console.error('[fetchLeads] Erro ao buscar por potencial:', err);
    }

    // Top 30 leads
    let topLeads: LeadData[] = [];
    try {
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

      if (Array.isArray(topLeadsResult)) {
        topLeads = topLeadsResult.map((row) => ({
          nome: row?.nome ?? 'Sem nome',
          mercado: row?.mercado ?? 'Desconhecido',
          potencial: row?.potencial ?? 'Não especificado',
        }));
      }
    } catch (err) {
      console.error('[fetchLeads] Erro ao buscar top leads:', err);
    }

    return {
      total,
      porMercado,
      porPotencial,
      topLeads,
    };
  } catch (error) {
    console.error('[fetchLeads] Erro fatal:', error);
    return {
      total: 0,
      porMercado: {},
      porPotencial: {},
      topLeads: [],
    };
  }
}
