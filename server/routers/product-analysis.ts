import { z } from 'zod';
import { eq, inArray, and, isNotNull, sql } from 'drizzle-orm';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import {
  produtos,
  clientes,
  leads,
  concorrentes,
  mercadosUnicos,
  pesquisas,
} from '../../drizzle/schema';

/**
 * Router para Análise de Produtos
 *
 * Fornece:
 * 1. Ranking de produtos
 * 2. Matriz Produto × Mercado
 * 3. Distribuição geográfica de produtos
 */
export const productAnalysisRouter = router({
  /**
   * Obter ranking de produtos
   *
   * Ordena produtos por número de clientes (decrescente)
   */
  getProductRanking: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
        pesquisaId: z.number().nullable().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { projectId, pesquisaId } = input;

      // Buscar pesquisaIds
      let pesquisaIds: number[] = [];
      if (pesquisaId) {
        pesquisaIds = [pesquisaId];
      } else {
        const pesquisasResult = await db
          .select({ id: pesquisas.id })
          .from(pesquisas)
          .where(eq(pesquisas.projectId, projectId));
        pesquisaIds = pesquisasResult.map((p) => p.id);

        if (pesquisaIds.length === 0) {
          return { products: [] };
        }
      }

      // Agregar produtos por nome
      const produtosData = await db
        .select({
          nome: produtos.nome,
          categoria: produtos.categoria,
          count: sql<number>`COUNT(DISTINCT ${produtos.clienteId})::INTEGER`,
        })
        .from(produtos)
        .innerJoin(clientes, eq(produtos.clienteId, clientes.id))
        .where(and(eq(produtos.projectId, projectId), inArray(clientes.pesquisaId, pesquisaIds)))
        .groupBy(produtos.nome, produtos.categoria)
        .orderBy(sql`COUNT(DISTINCT ${produtos.clienteId}) DESC`);

      const products = produtosData.map((p) => ({
        nome: p.nome,
        categoria: p.categoria || 'Sem categoria',
        clientes: p.count,
      }));

      return { products };
    }),

  /**
   * Obter matriz Produto × Mercado
   *
   * Mostra quantos clientes cada produto tem em cada mercado
   */
  getProductMarketMatrix: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
        pesquisaId: z.number().nullable().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { projectId, pesquisaId } = input;

      // Buscar pesquisaIds
      let pesquisaIds: number[] = [];
      if (pesquisaId) {
        pesquisaIds = [pesquisaId];
      } else {
        const pesquisasResult = await db
          .select({ id: pesquisas.id })
          .from(pesquisas)
          .where(eq(pesquisas.projectId, projectId));
        pesquisaIds = pesquisasResult.map((p) => p.id);

        if (pesquisaIds.length === 0) {
          return { matrix: [], markets: [], products: [] };
        }
      }

      // Buscar dados de produtos × mercados
      const matrixData = await db
        .select({
          produtoNome: produtos.nome,
          mercadoId: produtos.mercadoId,
          mercadoNome: mercadosUnicos.nome,
          count: sql<number>`COUNT(DISTINCT ${produtos.clienteId})::INTEGER`,
        })
        .from(produtos)
        .innerJoin(clientes, eq(produtos.clienteId, clientes.id))
        .innerJoin(mercadosUnicos, eq(produtos.mercadoId, mercadosUnicos.id))
        .where(and(eq(produtos.projectId, projectId), inArray(clientes.pesquisaId, pesquisaIds)))
        .groupBy(produtos.nome, produtos.mercadoId, mercadosUnicos.nome);

      // Extrair lista única de produtos e mercados
      const productsSet = new Set<string>();
      const marketsMap = new Map<number, string>();

      matrixData.forEach((row) => {
        productsSet.add(row.produtoNome);
        marketsMap.set(row.mercadoId, row.mercadoNome);
      });

      const products = Array.from(productsSet);
      const markets = Array.from(marketsMap.entries()).map(([id, nome]) => ({ id, nome }));

      // Criar matriz
      const matrix = products.map((produto) => {
        const row: Record<string, number | string> = { produto };

        markets.forEach((mercado) => {
          const cell = matrixData.find(
            (d) => d.produtoNome === produto && d.mercadoId === mercado.id
          );
          row[mercado.nome] = cell ? cell.count : 0;
        });

        return row;
      });

      return { matrix, markets, products };
    }),

  /**
   * Obter distribuição geográfica de um produto
   *
   * Reutiliza lógica de Geoposição com filtro de produto
   */
  getProductGeoDistribution: publicProcedure
    .input(
      z.object({
        produtoNome: z.string(),
        projectId: z.number(),
        pesquisaId: z.number().nullable().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { produtoNome, projectId, pesquisaId } = input;

      // Buscar pesquisaIds
      let pesquisaIds: number[] = [];
      if (pesquisaId) {
        pesquisaIds = [pesquisaId];
      } else {
        const pesquisasResult = await db
          .select({ id: pesquisas.id })
          .from(pesquisas)
          .where(eq(pesquisas.projectId, projectId));
        pesquisaIds = pesquisasResult.map((p) => p.id);

        if (pesquisaIds.length === 0) {
          return { regions: [], totals: { total: 0 } };
        }
      }

      // Buscar clientes que têm o produto
      const clientesComProduto = await db
        .select({
          clienteId: produtos.clienteId,
        })
        .from(produtos)
        .where(and(eq(produtos.nome, produtoNome), eq(produtos.projectId, projectId)));

      const clienteIds = clientesComProduto.map((p) => p.clienteId);

      if (clienteIds.length === 0) {
        return { regions: [], totals: { total: 0 } };
      }

      // Agregar por região/estado/cidade
      const geoData = await db
        .select({
          uf: clientes.uf,
          cidade: clientes.cidade,
          count: sql<number>`COUNT(*)::INTEGER`,
        })
        .from(clientes)
        .where(
          and(
            isNotNull(clientes.uf),
            isNotNull(clientes.cidade),
            inArray(clientes.id, clienteIds),
            inArray(clientes.pesquisaId, pesquisaIds)
          )
        )
        .groupBy(clientes.uf, clientes.cidade);

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
