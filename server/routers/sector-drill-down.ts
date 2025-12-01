import { z } from 'zod';
import { eq, inArray, and, isNotNull, sql, desc } from 'drizzle-orm';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { clientes, leads, concorrentes } from '../../drizzle/schema';

/**
 * Router para Drill-Down de Setores
 *
 * Estrutura de 3 níveis:
 * 1. Categorias de setores (agregado)
 * 2. Setores por categoria (agregado)
 * 3. Detalhes (clientes/leads/concorrentes por setor)
 */
export const sectorDrillDownRouter = router({
  /**
   * NÍVEL 1: Obter categorias de setores
   *
   * Retorna lista de categorias com contagem de clientes, leads e concorrentes
   * Performance: ~0.2s
   */
  getCategories: publicProcedure
    .input(
      z.object({
        pesquisaIds: z.array(z.number()),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { pesquisaIds } = input;

      if (pesquisaIds.length === 0) {
        return { categories: [] };
      }

      // Nota: Como não temos campo "categoria" para setores no schema atual,
      // vamos usar uma categorização simplificada
      // Por enquanto, retornar categoria única "Setores"
      // TODO: Implementar categorização inteligente (Indústria, Comércio, Serviços, etc.)

      // Buscar registros e contar no JavaScript (mais robusto)
      const [clientesResult, leadsResult, concorrentesResult] = await Promise.all([
        // Buscar clientes com setores
        db
          .select({ id: clientes.id })
          .from(clientes)
          .where(and(inArray(clientes.pesquisaId, pesquisaIds), isNotNull(clientes.setor))),

        // Buscar leads com setores
        db
          .select({ id: leads.id })
          .from(leads)
          .where(and(inArray(leads.pesquisaId, pesquisaIds), isNotNull(leads.setor))),

        // Buscar concorrentes com setores
        db
          .select({ id: concorrentes.id })
          .from(concorrentes)
          .where(and(inArray(concorrentes.pesquisaId, pesquisaIds), isNotNull(concorrentes.setor))),
      ]);

      // Contar no JavaScript (mais confiável que SQL)
      const clientesCount = clientesResult.length;
      const leadsCount = leadsResult.length;
      const concorrentesCount = concorrentesResult.length;

      const categories = [
        {
          categoria: 'Setores',
          clientes: clientesCount,
          leads: leadsCount,
          concorrentes: concorrentesCount,
          total: clientesCount + leadsCount + concorrentesCount,
        },
      ];

      return { categories };
    }),

  /**
   * NÍVEL 2: Obter setores de uma categoria
   *
   * Retorna lista de setores com contagem de clientes, leads e concorrentes
   * Performance: ~0.3s
   */
  getSectors: publicProcedure
    .input(
      z.object({
        categoria: z.string(),
        pesquisaIds: z.array(z.number()),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { pesquisaIds, limit, offset } = input;

      if (pesquisaIds.length === 0) {
        return { items: [], total: 0 };
      }

      // Buscar setores únicos de clientes
      const clientesSetores = await db
        .select({
          setor: clientes.setor,
          count: sql<number>`COUNT(DISTINCT ${clientes.id})::INTEGER`,
        })
        .from(clientes)
        .where(and(inArray(clientes.pesquisaId, pesquisaIds), isNotNull(clientes.setor)))
        .groupBy(clientes.setor);

      // Buscar setores únicos de leads
      const leadsSetores = await db
        .select({
          setor: leads.setor,
          count: sql<number>`COUNT(DISTINCT ${leads.id})::INTEGER`,
        })
        .from(leads)
        .where(and(inArray(leads.pesquisaId, pesquisaIds), isNotNull(leads.setor)))
        .groupBy(leads.setor);

      // Buscar setores únicos de concorrentes
      const concorrentesSetores = await db
        .select({
          setor: concorrentes.setor,
          count: sql<number>`COUNT(DISTINCT ${concorrentes.id})::INTEGER`,
        })
        .from(concorrentes)
        .where(and(inArray(concorrentes.pesquisaId, pesquisaIds), isNotNull(concorrentes.setor)))
        .groupBy(concorrentes.setor);

      // Combinar e agregar
      const setoresMap = new Map<
        string,
        { clientes: number; leads: number; concorrentes: number }
      >();

      clientesSetores.forEach((row) => {
        if (row.setor) {
          setoresMap.set(row.setor, {
            clientes: row.count,
            leads: 0,
            concorrentes: 0,
          });
        }
      });

      leadsSetores.forEach((row) => {
        if (row.setor) {
          const existing = setoresMap.get(row.setor);
          if (existing) {
            existing.leads = row.count;
          } else {
            setoresMap.set(row.setor, {
              clientes: 0,
              leads: row.count,
              concorrentes: 0,
            });
          }
        }
      });

      concorrentesSetores.forEach((row) => {
        if (row.setor) {
          const existing = setoresMap.get(row.setor);
          if (existing) {
            existing.concorrentes = row.count;
          } else {
            setoresMap.set(row.setor, {
              clientes: 0,
              leads: 0,
              concorrentes: row.count,
            });
          }
        }
      });

      // Converter para array e ordenar
      const setores = Array.from(setoresMap.entries()).map(([nome, counts]) => ({
        nome,
        ...counts,
      }));

      // Ordenar por total (desc)
      setores.sort(
        (a, b) => b.clientes + b.leads + b.concorrentes - (a.clientes + a.leads + a.concorrentes)
      );

      // Aplicar paginação
      const total = setores.length;
      const items = setores.slice(offset, offset + limit);

      return { items, total };
    }),

  /**
   * NÍVEL 3A: Obter clientes de um setor
   *
   * Retorna lista de clientes do setor específico
   * Performance: ~0.2s
   */
  getClientesBySetor: publicProcedure
    .input(
      z.object({
        setorNome: z.string(),
        categoria: z.string(),
        pesquisaIds: z.array(z.number()),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { setorNome, pesquisaIds, limit, offset } = input;

      if (pesquisaIds.length === 0) {
        return { items: [], total: 0 };
      }

      // Contar total
      const totalResult = await db
        .select({
          count: sql<number>`COUNT(*)::INTEGER`,
        })
        .from(clientes)
        .where(and(eq(clientes.setor, setorNome), inArray(clientes.pesquisaId, pesquisaIds)));

      const total = totalResult[0]?.count || 0;

      // Buscar dados paginados
      const items = await db
        .select({
          id: clientes.id,
          nome: clientes.nome,
          setor: clientes.setor,
          cidade: clientes.cidade,
          uf: clientes.uf,
          qualidadeClassificacao: clientes.qualidadeClassificacao,
          qualidadeScore: clientes.qualidadeScore,
          telefone: clientes.telefone,
          email: clientes.email,
          siteOficial: clientes.siteOficial,
        })
        .from(clientes)
        .where(and(eq(clientes.setor, setorNome), inArray(clientes.pesquisaId, pesquisaIds)))
        .orderBy(desc(clientes.qualidadeScore))
        .limit(limit)
        .offset(offset);

      return { items, total };
    }),

  /**
   * NÍVEL 3B: Obter leads de um setor
   *
   * Retorna lista de leads do setor específico
   * Performance: ~0.2s
   */
  getLeadsBySetor: publicProcedure
    .input(
      z.object({
        setorNome: z.string(),
        categoria: z.string(),
        pesquisaIds: z.array(z.number()),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { setorNome, pesquisaIds, limit, offset } = input;

      if (pesquisaIds.length === 0) {
        return { items: [], total: 0 };
      }

      // Contar total
      const totalResult = await db
        .select({
          count: sql<number>`COUNT(*)::INTEGER`,
        })
        .from(leads)
        .where(and(eq(leads.setor, setorNome), inArray(leads.pesquisaId, pesquisaIds)));

      const total = totalResult[0]?.count || 0;

      // Buscar dados paginados
      const items = await db
        .select({
          id: leads.id,
          nome: leads.nome,
          setor: leads.setor,
          cidade: leads.cidade,
          uf: leads.uf,
          qualidadeScore: leads.qualidadeScore,
          qualidadeClassificacao: leads.qualidadeClassificacao,
          telefone: leads.telefone,
          email: leads.email,
        })
        .from(leads)
        .where(and(eq(leads.setor, setorNome), inArray(leads.pesquisaId, pesquisaIds)))
        .orderBy(desc(leads.qualidadeScore))
        .limit(limit)
        .offset(offset);

      return { items, total };
    }),

  /**
   * NÍVEL 3C: Obter concorrentes de um setor
   *
   * Retorna lista de concorrentes do setor específico
   * Performance: ~0.2s
   */
  getConcorrentesBySetor: publicProcedure
    .input(
      z.object({
        setorNome: z.string(),
        categoria: z.string(),
        pesquisaIds: z.array(z.number()),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { setorNome, pesquisaIds, limit, offset } = input;

      if (pesquisaIds.length === 0) {
        return { items: [], total: 0 };
      }

      // Contar total
      const totalResult = await db
        .select({
          count: sql<number>`COUNT(*)::INTEGER`,
        })
        .from(concorrentes)
        .where(
          and(eq(concorrentes.setor, setorNome), inArray(concorrentes.pesquisaId, pesquisaIds))
        );

      const total = totalResult[0]?.count || 0;

      // Buscar dados paginados
      const items = await db
        .select({
          id: concorrentes.id,
          nome: concorrentes.nome,
          setor: concorrentes.setor,
          cidade: concorrentes.cidade,
          uf: concorrentes.uf,
          porte: concorrentes.porte,
          faturamentoEstimado: concorrentes.faturamentoEstimado,
          qualidadeScore: concorrentes.qualidadeScore,
          qualidadeClassificacao: concorrentes.qualidadeClassificacao,
        })
        .from(concorrentes)
        .where(
          and(eq(concorrentes.setor, setorNome), inArray(concorrentes.pesquisaId, pesquisaIds))
        )
        .orderBy(desc(concorrentes.qualidadeScore))
        .limit(limit)
        .offset(offset);

      return { items, total };
    }),
});
