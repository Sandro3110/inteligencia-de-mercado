import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { clientes, leads, concorrentes, pesquisas } from '../../drizzle/schema';
import { eq, and, isNotNull, inArray, sql } from 'drizzle-orm';

/**
 * Map Router
 * Queries para visualização geográfica de entidades
 */
export const mapRouter = router({
  /**
   * Buscar todas as entidades com coordenadas geográficas
   */
  getMapData: publicProcedure
    .input(
      z
        .object({
          projectId: z.number().optional(),
          pesquisaId: z.number().optional(),
          entityTypes: z
            .array(z.enum(['clientes', 'leads', 'concorrentes']))
            .default(['clientes', 'leads', 'concorrentes']),
          filters: z
            .object({
              uf: z.string().optional(),
              cidade: z.string().optional(),
              setor: z.string().optional(),
              porte: z.string().optional(),
              qualidade: z.string().optional(),
            })
            .optional(),
        })
        .optional()
        .default({})
    )
    .query(async ({ input }) => {
      console.log('🔍 [getMapData] Input:', JSON.stringify(input, null, 2));
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const results: Array<Record<string, unknown>> = [];

      // Se projectId foi fornecido mas pesquisaId não, buscar todas as pesquisas do projeto
      let pesquisaIds: number[] | undefined;
      if (input.projectId && !input.pesquisaId) {
        const projectPesquisas = await db
          .select({ id: pesquisas.id })
          .from(pesquisas)
          .where(eq(pesquisas.projectId, input.projectId));
        pesquisaIds = projectPesquisas.map((p) => p.id);
      }

      // Buscar clientes
      if (input.entityTypes.includes('clientes')) {
        const clientesQuery = db
          .select({
            id: clientes.id,
            nome: clientes.nome,
            cnpj: clientes.cnpj,
            cidade: clientes.cidade,
            uf: clientes.uf,
            setor: clientes.setor,
            produtoPrincipal: clientes.produtoPrincipal,
            telefone: clientes.telefone,
            email: clientes.email,
            latitude: clientes.latitude,
            longitude: clientes.longitude,
            validationStatus: clientes.validationStatus,
            pesquisaId: clientes.pesquisaId,
          })
          .from(clientes)
          .where(
            and(
              isNotNull(clientes.latitude),
              isNotNull(clientes.longitude),
              // Filtro de pesquisa: se fornecido pesquisaId, filtra; se fornecido projectId, filtra por pesquisas do projeto; senão, busca TODAS
              input.pesquisaId
                ? eq(clientes.pesquisaId, input.pesquisaId)
                : pesquisaIds && pesquisaIds.length > 0
                  ? inArray(clientes.pesquisaId, pesquisaIds)
                  : sql`1=1`, // Buscar TODAS as entidades quando não houver filtro
              input.filters?.uf ? eq(clientes.uf, input.filters.uf) : undefined,
              input.filters?.cidade ? eq(clientes.cidade, input.filters.cidade) : undefined,
              input.filters?.setor ? eq(clientes.setor, input.filters.setor) : undefined
            )
          );

        const clientesData = await clientesQuery;
        results.push(
          ...clientesData.map((c) => ({
            ...c,
            type: 'cliente' as const,
            latitude: parseFloat(c.latitude as string),
            longitude: parseFloat(c.longitude as string),
          }))
        );
      }

      // Buscar leads
      if (input.entityTypes.includes('leads')) {
        const leadsQuery = db
          .select({
            id: leads.id,
            nome: leads.nome,
            cidade: leads.cidade,
            uf: leads.uf,
            setor: leads.setor,
            porte: leads.porte,
            telefone: leads.telefone,
            email: leads.email,
            latitude: leads.latitude,
            longitude: leads.longitude,
            qualidadeClassificacao: leads.qualidadeClassificacao,
            qualidadeScore: leads.qualidadeScore,
            justificativa: leads.justificativa,
            stage: leads.stage,
            pesquisaId: leads.pesquisaId,
          })
          .from(leads)
          .where(
            and(
              isNotNull(leads.latitude),
              isNotNull(leads.longitude),
              input.pesquisaId
                ? eq(leads.pesquisaId, input.pesquisaId)
                : pesquisaIds && pesquisaIds.length > 0
                  ? inArray(leads.pesquisaId, pesquisaIds)
                  : sql`1=1`, // Buscar TODAS as entidades quando não houver filtro
              input.filters?.uf ? eq(leads.uf, input.filters.uf) : undefined,
              input.filters?.cidade ? eq(leads.cidade, input.filters.cidade) : undefined,
              input.filters?.setor ? eq(leads.setor, input.filters.setor) : undefined,
              input.filters?.porte ? eq(leads.porte, input.filters.porte) : undefined,
              input.filters?.qualidade
                ? eq(leads.qualidadeClassificacao, input.filters.qualidade)
                : undefined
            )
          );

        const leadsData = await leadsQuery;
        results.push(
          ...leadsData.map((l) => ({
            ...l,
            type: 'lead' as const,
            latitude: parseFloat(l.latitude as string),
            longitude: parseFloat(l.longitude as string),
          }))
        );
      }

      // Buscar concorrentes
      if (input.entityTypes.includes('concorrentes')) {
        const concorrentesQuery = db
          .select({
            id: concorrentes.id,
            nome: concorrentes.nome,
            cidade: concorrentes.cidade,
            uf: concorrentes.uf,
            regiao: concorrentes.regiao,
            porte: concorrentes.porte,
            descricao: concorrentes.descricao,
            latitude: concorrentes.latitude,
            longitude: concorrentes.longitude,
            pesquisaId: concorrentes.pesquisaId,
          })
          .from(concorrentes)
          .where(
            and(
              isNotNull(concorrentes.latitude),
              isNotNull(concorrentes.longitude),
              input.pesquisaId
                ? eq(concorrentes.pesquisaId, input.pesquisaId)
                : pesquisaIds && pesquisaIds.length > 0
                  ? inArray(concorrentes.pesquisaId, pesquisaIds)
                  : sql`1=1`, // Buscar TODAS as entidades quando não houver filtro
              input.filters?.uf ? eq(concorrentes.uf, input.filters.uf) : undefined,
              input.filters?.cidade ? eq(concorrentes.cidade, input.filters.cidade) : undefined,
              input.filters?.porte ? eq(concorrentes.porte, input.filters.porte) : undefined
            )
          );

        const concorrentesData = await concorrentesQuery;
        results.push(
          ...concorrentesData.map((c) => ({
            ...c,
            type: 'concorrente' as const,
            latitude: parseFloat(c.latitude as string),
            longitude: parseFloat(c.longitude as string),
          }))
        );
      }

      console.log('🔍 [getMapData] Results count:', results.length);
      return results;
    }),

  /**
   * Buscar detalhes completos de uma entidade
   */
  getEntityDetails: publicProcedure
    .input(
      z.object({
        id: z.number(),
        type: z.enum(['cliente', 'lead', 'concorrente']),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      if (input.type === 'cliente') {
        const [cliente] = await db
          .select()
          .from(clientes)
          .where(eq(clientes.id, input.id))
          .limit(1);
        return cliente ? { ...cliente, type: 'cliente' as const } : null;
      }

      if (input.type === 'lead') {
        const [lead] = await db.select().from(leads).where(eq(leads.id, input.id)).limit(1);
        return lead ? { ...lead, type: 'lead' as const } : null;
      }

      if (input.type === 'concorrente') {
        const [concorrente] = await db
          .select()
          .from(concorrentes)
          .where(eq(concorrentes.id, input.id))
          .limit(1);
        return concorrente ? { ...concorrente, type: 'concorrente' as const } : null;
      }

      return null;
    }),

  /**
   * Análise de densidade por estado
   */
  getDensityAnalysis: publicProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
        pesquisaId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Contar por UF
      const clientesByUF = await db
        .select({
          uf: clientes.uf,
          count: sql<number>`count(*)::int`,
        })
        .from(clientes)
        .where(
          and(
            isNotNull(clientes.latitude),
            isNotNull(clientes.longitude),
            input.pesquisaId ? eq(clientes.pesquisaId, input.pesquisaId) : undefined
          )
        )
        .groupBy(clientes.uf);

      const leadsByUF = await db
        .select({
          uf: leads.uf,
          count: sql<number>`count(*)::int`,
        })
        .from(leads)
        .where(
          and(
            isNotNull(leads.latitude),
            isNotNull(leads.longitude),
            input.pesquisaId ? eq(leads.pesquisaId, input.pesquisaId) : undefined
          )
        )
        .groupBy(leads.uf);

      const concorrentesByUF = await db
        .select({
          uf: concorrentes.uf,
          count: sql<number>`count(*)::int`,
        })
        .from(concorrentes)
        .where(
          and(
            isNotNull(concorrentes.latitude),
            isNotNull(concorrentes.longitude),
            input.pesquisaId ? eq(concorrentes.pesquisaId, input.pesquisaId) : undefined
          )
        )
        .groupBy(concorrentes.uf);

      // Consolidar
      const ufMap = new Map<string, { clientes: number; leads: number; concorrentes: number }>();

      clientesByUF.forEach((row) => {
        if (!ufMap.has(row.uf)) {
          ufMap.set(row.uf, { clientes: 0, leads: 0, concorrentes: 0 });
        }
        ufMap.get(row.uf)!.clientes = row.count;
      });

      leadsByUF.forEach((row) => {
        if (!ufMap.has(row.uf)) {
          ufMap.set(row.uf, { clientes: 0, leads: 0, concorrentes: 0 });
        }
        ufMap.get(row.uf)!.leads = row.count;
      });

      concorrentesByUF.forEach((row) => {
        if (!ufMap.has(row.uf)) {
          ufMap.set(row.uf, { clientes: 0, leads: 0, concorrentes: 0 });
        }
        ufMap.get(row.uf)!.concorrentes = row.count;
      });

      const result = Array.from(ufMap.entries()).map(([uf, counts]) => ({
        uf,
        ...counts,
        total: counts.clientes + counts.leads + counts.concorrentes,
      }));

      return result.sort((a, b) => b.total - a.total);
    }),

  /**
   * Buscar filtros disponíveis
   */
  getAvailableFilters: publicProcedure
    .input(
      z
        .object({
          projectId: z.number().optional(),
          pesquisaId: z.number().optional(),
        })
        .optional()
        .default({})
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Se projectId foi fornecido mas pesquisaId não, buscar todas as pesquisas do projeto
      let pesquisaIds: number[] | undefined;
      if (input.projectId && !input.pesquisaId) {
        const projectPesquisas = await db
          .select({ id: pesquisas.id })
          .from(pesquisas)
          .where(and(eq(pesquisas.projectId, input.projectId), eq(pesquisas.ativo, 1)));
        pesquisaIds = projectPesquisas.map((p) => p.id);
      }

      // Construir condição de filtro
      const pesquisaCondition = input.pesquisaId
        ? eq(clientes.pesquisaId, input.pesquisaId)
        : pesquisaIds && pesquisaIds.length > 0
          ? inArray(clientes.pesquisaId, pesquisaIds)
          : undefined;

      // Buscar UFs únicas
      const ufs = await db
        .selectDistinct({ uf: clientes.uf })
        .from(clientes)
        .where(and(isNotNull(clientes.uf), pesquisaCondition));

      // Buscar cidades únicas
      const cidades = await db
        .selectDistinct({ cidade: clientes.cidade })
        .from(clientes)
        .where(and(isNotNull(clientes.cidade), pesquisaCondition));

      // Buscar CNAEs únicos (ao invés de setores)
      const cnaes = await db
        .selectDistinct({ cnae: clientes.cnae })
        .from(clientes)
        .where(and(isNotNull(clientes.cnae), pesquisaCondition));

      // Buscar portes únicos
      const portes = await db
        .selectDistinct({ porte: clientes.porte })
        .from(clientes)
        .where(and(isNotNull(clientes.porte), pesquisaCondition));

      // Buscar qualidades únicas
      const qualidades = await db
        .selectDistinct({ qualidade: clientes.qualidadeClassificacao })
        .from(clientes)
        .where(and(isNotNull(clientes.qualidadeClassificacao), pesquisaCondition));

      return {
        ufs: ufs
          .map((u) => u.uf)
          .filter(Boolean)
          .sort(),
        cidades: cidades
          .map((c) => c.cidade)
          .filter(Boolean)
          .sort(),
        setores: cnaes
          .map((c) => c.cnae)
          .filter(Boolean)
          .sort(),
        portes: portes
          .map((p) => p.porte)
          .filter(Boolean)
          .sort(),
        qualidades: qualidades
          .map((q) => q.qualidade)
          .filter(Boolean)
          .sort(),
      };
    }),

  /**
   * Buscar estatísticas (totalizadores) independente de coordenadas
   */
  getMapStats: publicProcedure
    .input(
      z
        .object({
          projectId: z.number().optional(),
          pesquisaId: z.number().optional(),
        })
        .optional()
        .default({})
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Se projectId foi fornecido mas pesquisaId não, buscar todas as pesquisas do projeto
      let pesquisaIds: number[] | undefined;
      if (input.projectId && !input.pesquisaId) {
        const projectPesquisas = await db
          .select({ id: pesquisas.id })
          .from(pesquisas)
          .where(and(eq(pesquisas.projectId, input.projectId), eq(pesquisas.ativo, 1)));
        pesquisaIds = projectPesquisas.map((p) => p.id);
      }

      // Contar clientes
      const clientesCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(clientes)
        .where(
          input.pesquisaId
            ? eq(clientes.pesquisaId, input.pesquisaId)
            : pesquisaIds && pesquisaIds.length > 0
              ? inArray(clientes.pesquisaId, pesquisaIds)
              : undefined
        );

      // Contar leads
      const leadsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(
          input.pesquisaId
            ? eq(leads.pesquisaId, input.pesquisaId)
            : pesquisaIds && pesquisaIds.length > 0
              ? inArray(leads.pesquisaId, pesquisaIds)
              : undefined
        );

      // Contar concorrentes
      const concorrentesCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(concorrentes)
        .where(
          input.pesquisaId
            ? eq(concorrentes.pesquisaId, input.pesquisaId)
            : pesquisaIds && pesquisaIds.length > 0
              ? inArray(concorrentes.pesquisaId, pesquisaIds)
              : undefined
        );

      return {
        clientes: Number(clientesCount[0]?.count || 0),
        leads: Number(leadsCount[0]?.count || 0),
        concorrentes: Number(concorrentesCount[0]?.count || 0),
      };
    }),
});
