import { z } from 'zod';
import { eq, inArray, and, isNotNull, sql } from 'drizzle-orm';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { clientes, leads, concorrentes, pesquisas } from '../../drizzle/schema';

/**
 * Router para Análise de Setores
 *
 * Fornece visão simplificada de setores com score de oportunidade
 * Reutiliza módulo de Geoposição para drill-down detalhado
 */
export const sectorAnalysisRouter = router({
  /**
   * Obter resumo de setores com score de oportunidade
   *
   * Score = (leads / max(concorrentes, 1)) * peso_qualidade
   * - Alto score = muitos leads, poucos concorrentes (oportunidade!)
   * - Baixo score = poucos leads, muitos concorrentes (evitar)
   */
  getSectorSummary: publicProcedure
    .input(
      z.object({
        projectId: z.number().nullable().optional(),
        pesquisaId: z.number().nullable().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { projectId, pesquisaId } = input;

      // Buscar pesquisaIds (reutiliza lógica de Geoposição)
      let pesquisaIds: number[] = [];
      if (pesquisaId) {
        pesquisaIds = [pesquisaId];
      } else if (projectId) {
        const pesquisasResult = await db
          .select({ id: pesquisas.id })
          .from(pesquisas)
          .where(eq(pesquisas.projectId, projectId));
        pesquisaIds = pesquisasResult.map((p) => p.id);

        if (pesquisaIds.length === 0) {
          return { sectors: [], totals: { clientes: 0, leads: 0, concorrentes: 0 } };
        }
      }

      // Agregar clientes por setor
      const clientesData = await db
        .select({
          setor: clientes.setor,
          count: sql<number>`COUNT(*)::INTEGER`,
        })
        .from(clientes)
        .where(and(isNotNull(clientes.setor), inArray(clientes.pesquisaId, pesquisaIds)))
        .groupBy(clientes.setor);

      // Agregar leads por setor
      const leadsData = await db
        .select({
          setor: leads.setor,
          count: sql<number>`COUNT(*)::INTEGER`,
        })
        .from(leads)
        .where(and(isNotNull(leads.setor), inArray(leads.pesquisaId, pesquisaIds)))
        .groupBy(leads.setor);

      // Agregar concorrentes por setor
      const concorrentesData = await db
        .select({
          setor: concorrentes.setor,
          count: sql<number>`COUNT(*)::INTEGER`,
        })
        .from(concorrentes)
        .where(and(isNotNull(concorrentes.setor), inArray(concorrentes.pesquisaId, pesquisaIds)))
        .groupBy(concorrentes.setor);

      // Consolidar dados
      const sectorMap = new Map<
        string,
        { clientes: number; leads: number; concorrentes: number }
      >();

      // Adicionar clientes
      clientesData.forEach((row) => {
        if (!sectorMap.has(row.setor!)) {
          sectorMap.set(row.setor!, { clientes: 0, leads: 0, concorrentes: 0 });
        }
        sectorMap.get(row.setor!)!.clientes = row.count;
      });

      // Adicionar leads
      leadsData.forEach((row) => {
        if (!sectorMap.has(row.setor!)) {
          sectorMap.set(row.setor!, { clientes: 0, leads: 0, concorrentes: 0 });
        }
        sectorMap.get(row.setor!)!.leads = row.count;
      });

      // Adicionar concorrentes
      concorrentesData.forEach((row) => {
        if (!sectorMap.has(row.setor!)) {
          sectorMap.set(row.setor!, { clientes: 0, leads: 0, concorrentes: 0 });
        }
        sectorMap.get(row.setor!)!.concorrentes = row.count;
      });

      // Calcular score e criar array de setores
      const sectors = Array.from(sectorMap.entries()).map(([setor, counts]) => {
        // Score = (leads / max(concorrentes, 1)) * fator_clientes
        // Quanto maior o score, melhor a oportunidade
        const competitionRatio = counts.leads / Math.max(counts.concorrentes, 1);
        const clientFactor = counts.clientes > 0 ? 1.5 : 1.0; // Boost se já tem clientes
        const score = competitionRatio * clientFactor;

        return {
          setor,
          clientes: counts.clientes,
          leads: counts.leads,
          concorrentes: counts.concorrentes,
          score: Math.round(score * 100) / 100, // 2 casas decimais
        };
      });

      // Ordenar por score (maior primeiro)
      sectors.sort((a, b) => b.score - a.score);

      // Calcular totais
      const totals = {
        clientes: sectors.reduce((sum, s) => sum + s.clientes, 0),
        leads: sectors.reduce((sum, s) => sum + s.leads, 0),
        concorrentes: sectors.reduce((sum, s) => sum + s.concorrentes, 0),
      };

      return { sectors, totals };
    }),

  /**
   * Obter distribuição geográfica de um setor específico
   *
   * Reutiliza query de Geoposição com filtro de setor
   */
  getSectorGeoDistribution: publicProcedure
    .input(
      z.object({
        setor: z.string(),
        entityType: z.enum(['clientes', 'leads', 'concorrentes']).default('clientes'),
        projectId: z.number().nullable().optional(),
        pesquisaId: z.number().nullable().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { setor, entityType, projectId, pesquisaId } = input;

      // Buscar pesquisaIds
      let pesquisaIds: number[] = [];
      if (pesquisaId) {
        pesquisaIds = [pesquisaId];
      } else if (projectId) {
        const pesquisasResult = await db
          .select({ id: pesquisas.id })
          .from(pesquisas)
          .where(eq(pesquisas.projectId, projectId));
        pesquisaIds = pesquisasResult.map((p) => p.id);

        if (pesquisaIds.length === 0) {
          return { regions: [], totals: { total: 0 } };
        }
      }

      // Selecionar tabela baseado em entityType
      const table =
        entityType === 'clientes' ? clientes : entityType === 'leads' ? leads : concorrentes;

      // Agregar por região/estado/cidade
      const geoData = await db
        .select({
          uf: table.uf,
          cidade: table.cidade,
          count: sql<number>`COUNT(*)::INTEGER`,
        })
        .from(table)
        .where(
          and(
            isNotNull(table.uf),
            isNotNull(table.cidade),
            eq(table.setor, setor),
            inArray(table.pesquisaId, pesquisaIds)
          )
        )
        .groupBy(table.uf, table.cidade);

      // Mapear UF para região
      const ufToRegion: Record<string, string> = {
        PR: 'Sul',
        RS: 'Sul',
        SC: 'Sul',
        ES: 'Sudeste',
        MG: 'Sudeste',
        RJ: 'Sudeste',
        SP: 'Sudeste',
        DF: 'Centro-Oeste',
        GO: 'Centro-Oeste',
        MS: 'Centro-Oeste',
        MT: 'Centro-Oeste',
        AL: 'Nordeste',
        BA: 'Nordeste',
        CE: 'Nordeste',
        MA: 'Nordeste',
        PB: 'Nordeste',
        PE: 'Nordeste',
        PI: 'Nordeste',
        RN: 'Nordeste',
        SE: 'Nordeste',
        AC: 'Norte',
        AM: 'Norte',
        AP: 'Norte',
        PA: 'Norte',
        RO: 'Norte',
        RR: 'Norte',
        TO: 'Norte',
      };

      // Agrupar por região
      const regionMap = new Map<string, { uf: string; cidade: string; count: number }[]>();

      geoData.forEach((row) => {
        const regiao = ufToRegion[row.uf!] || 'Outros';
        if (!regionMap.has(regiao)) {
          regionMap.set(regiao, []);
        }
        regionMap.get(regiao)!.push({
          uf: row.uf!,
          cidade: row.cidade!,
          count: row.count,
        });
      });

      // Criar array de regiões
      const regions = Array.from(regionMap.entries()).map(([regiao, cities]) => ({
        regiao,
        total: cities.reduce((sum, c) => sum + c.count, 0),
        cities,
      }));

      // Ordenar regiões
      const regionOrder = ['Sul', 'Sudeste', 'Centro-Oeste', 'Nordeste', 'Norte', 'Outros'];
      regions.sort((a, b) => regionOrder.indexOf(a.regiao) - regionOrder.indexOf(b.regiao));

      const totals = {
        total: regions.reduce((sum, r) => sum + r.total, 0),
      };

      return { regions, totals };
    }),
});
