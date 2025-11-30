import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { clientes, leads, concorrentes } from '../../drizzle/schema';
import { and, eq, isNotNull, sql } from 'drizzle-orm';

/**
 * Mapeamento de UF para Região (IBGE)
 */
const UF_TO_REGION: Record<string, string> = {
  // Norte
  AC: 'Norte',
  AM: 'Norte',
  AP: 'Norte',
  PA: 'Norte',
  RO: 'Norte',
  RR: 'Norte',
  TO: 'Norte',
  // Nordeste
  AL: 'Nordeste',
  BA: 'Nordeste',
  CE: 'Nordeste',
  MA: 'Nordeste',
  PB: 'Nordeste',
  PE: 'Nordeste',
  PI: 'Nordeste',
  RN: 'Nordeste',
  SE: 'Nordeste',
  // Centro-Oeste
  DF: 'Centro-Oeste',
  GO: 'Centro-Oeste',
  MS: 'Centro-Oeste',
  MT: 'Centro-Oeste',
  // Sudeste
  ES: 'Sudeste',
  MG: 'Sudeste',
  RJ: 'Sudeste',
  SP: 'Sudeste',
  // Sul
  PR: 'Sul',
  RS: 'Sul',
  SC: 'Sul',
};

/**
 * Ordem das regiões para exibição
 */
const REGION_ORDER = ['Sul', 'Sudeste', 'Centro-Oeste', 'Nordeste', 'Norte'];

interface EntityCount {
  clientes: number;
  leads: number;
  concorrentes: number;
}

interface CityData {
  name: string;
  uf: string;
  totals: EntityCount;
}

interface StateData {
  uf: string;
  cities: CityData[];
  totals: EntityCount;
}

interface RegionData {
  name: string;
  states: StateData[];
  totals: EntityCount;
}

/**
 * Map Hierarchical Router
 * Queries para visualização hierárquica (Região → Estado → Cidade)
 */
export const mapHierarchicalRouter = router({
  /**
   * Buscar dados hierárquicos (Região → Estado → Cidade)
   */
  getHierarchicalData: publicProcedure
    .input(
      z.object({
        projectId: z.number().nullable().optional(),
        pesquisaId: z.number().nullable().optional(),
        entityType: z.enum(['clientes', 'leads', 'concorrentes']).default('clientes'),
        filters: z
          .object({
            setor: z.string().nullable().optional(),
            porte: z.string().nullable().optional(),
            qualidade: z.string().nullable().optional(),
          })
          .optional()
          .default({}),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Tratar null como undefined
      const projectId = input.projectId ?? undefined;
      const pesquisaId = input.pesquisaId ?? undefined;
      const setor = input.filters?.setor ?? undefined;
      const porte = input.filters?.porte ?? undefined;
      const qualidade = input.filters?.qualidade ?? undefined;

      // Construir condições de filtro
      const buildConditions = (table: typeof clientes | typeof leads | typeof concorrentes) => {
        const conditions = [isNotNull(table.uf), isNotNull(table.cidade)];

        // Filtro por projeto/pesquisa
        if (pesquisaId) {
          conditions.push(eq(table.pesquisaId, pesquisaId));
        } else if (projectId) {
          // Se não tem pesquisaId, buscar todas as pesquisas do projeto
          conditions.push(
            sql`${table.pesquisaId} IN (SELECT id FROM pesquisas WHERE "projectId" = ${projectId})`
          );
        }

        // Filtros adicionais
        if (setor) conditions.push(eq(table.setor, setor));
        if (porte) conditions.push(eq(table.porte, porte));

        // Qualidade só para leads (campo qualidadeClassificacao)
        if (qualidade && 'qualidadeClassificacao' in table) {
          conditions.push(eq((table as typeof leads).qualidadeClassificacao, qualidade));
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
      };

      // Buscar dados agrupados por UF e Cidade
      const getData = async (entityType: 'clientes' | 'leads' | 'concorrentes') => {
        const table =
          entityType === 'clientes' ? clientes : entityType === 'leads' ? leads : concorrentes;
        const conditions = buildConditions(table);

        const result = await db
          .select({
            uf: table.uf,
            cidade: table.cidade,
            count: sql<number>`COUNT(*)::int`,
          })
          .from(table)
          .where(conditions)
          .groupBy(table.uf, table.cidade)
          .orderBy(table.uf, table.cidade);

        return result;
      };

      // Buscar dados do tipo selecionado
      const data = await getData(input.entityType);

      // Organizar dados hierarquicamente
      const regionMap = new Map<string, RegionData>();

      for (const row of data) {
        const uf = row.uf as string;
        const cidade = row.cidade as string;
        const count = row.count;
        const region = UF_TO_REGION[uf] || 'Outros';

        // Criar região se não existir
        if (!regionMap.has(region)) {
          regionMap.set(region, {
            name: region,
            states: [],
            totals: { clientes: 0, leads: 0, concorrentes: 0 },
          });
        }

        const regionData = regionMap.get(region)!;

        // Criar estado se não existir
        let stateData = regionData.states.find((s) => s.uf === uf);
        if (!stateData) {
          stateData = {
            uf,
            cities: [],
            totals: { clientes: 0, leads: 0, concorrentes: 0 },
          };
          regionData.states.push(stateData);
        }

        // Adicionar cidade
        stateData.cities.push({
          name: cidade,
          uf,
          totals: {
            clientes: input.entityType === 'clientes' ? count : 0,
            leads: input.entityType === 'leads' ? count : 0,
            concorrentes: input.entityType === 'concorrentes' ? count : 0,
          },
        });

        // Atualizar totais
        stateData.totals[input.entityType] += count;
        regionData.totals[input.entityType] += count;
      }

      // Converter para array e ordenar
      const regions = Array.from(regionMap.values())
        .sort((a, b) => {
          const aIndex = REGION_ORDER.indexOf(a.name);
          const bIndex = REGION_ORDER.indexOf(b.name);
          return aIndex - bIndex;
        })
        .map((region) => ({
          ...region,
          states: region.states
            .sort((a, b) => a.uf.localeCompare(b.uf))
            .map((state) => ({
              ...state,
              cities: state.cities.sort((a, b) => a.name.localeCompare(b.name)),
            })),
        }));

      // Calcular totais gerais
      const grandTotals: EntityCount = {
        clientes: 0,
        leads: 0,
        concorrentes: 0,
      };

      for (const region of regions) {
        grandTotals[input.entityType] += region.totals[input.entityType];
      }

      return {
        regions,
        grandTotals,
      };
    }),

  /**
   * Buscar entidades de uma cidade específica
   */
  getCityEntities: publicProcedure
    .input(
      z.object({
        cidade: z.string(),
        uf: z.string(),
        entityType: z.enum(['clientes', 'leads', 'concorrentes']),
        projectId: z.number().nullable().optional(),
        pesquisaId: z.number().nullable().optional(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const projectId = input.projectId ?? undefined;
      const pesquisaId = input.pesquisaId ?? undefined;

      const table =
        input.entityType === 'clientes'
          ? clientes
          : input.entityType === 'leads'
            ? leads
            : concorrentes;

      // Construir condições
      const conditions = [eq(table.cidade, input.cidade), eq(table.uf, input.uf)];

      if (pesquisaId) {
        conditions.push(eq(table.pesquisaId, pesquisaId));
      } else if (projectId) {
        conditions.push(
          sql`${table.pesquisaId} IN (SELECT id FROM pesquisas WHERE "projectId" = ${projectId})`
        );
      }

      // Buscar entidades
      const offset = (input.page - 1) * input.pageSize;
      const entities = await db
        .select()
        .from(table)
        .where(and(...conditions))
        .limit(input.pageSize)
        .offset(offset);

      // Contar total
      const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(table)
        .where(and(...conditions));

      return {
        data: entities,
        total: count,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(count / input.pageSize),
      };
    }),
});
