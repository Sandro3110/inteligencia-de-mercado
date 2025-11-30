import { Database } from '@/server/db';
import { clientes, clientesMercados, mercadosUnicos } from '@/drizzle/schema';
import { eq, sql, and } from 'drizzle-orm';

export interface ClienteData {
  nome: string;
  cidade: string;
  uf: string;
  mercados: string[];
}

export interface ClientesData {
  total: number;
  porEstado: Record<string, number>;
  porCidade: Array<{ cidade: string; uf: string; count: number }>;
  topClientes: ClienteData[];
}

/**
 * Busca dados completos de clientes com distribuição geográfica
 */
export async function fetchClientes(db: Database, pesquisaId: number): Promise<ClientesData> {
  try {
    // Total de clientes
    let total = 0;
    try {
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(clientes)
        .where(eq(clientes.pesquisaId, pesquisaId));
      total = Number(totalResult?.[0]?.count ?? 0);
    } catch (err) {
      console.error('[fetchClientes] Erro ao contar total:', err);
    }

    // Distribuição por estado
    const porEstado: Record<string, number> = {};
    try {
      const porEstadoResult = await db
        .select({
          uf: clientes.uf,
          count: sql<number>`count(*)`,
        })
        .from(clientes)
        .where(eq(clientes.pesquisaId, pesquisaId))
        .groupBy(clientes.uf)
        .orderBy(sql`count(*) DESC`);

      if (Array.isArray(porEstadoResult)) {
        for (const row of porEstadoResult) {
          if (row?.uf) {
            porEstado[row.uf] = Number(row.count ?? 0);
          }
        }
      }
    } catch (err) {
      console.error('[fetchClientes] Erro ao buscar por estado:', err);
    }

    // Distribuição por cidade
    let porCidade: Array<{ cidade: string; uf: string; count: number }> = [];
    try {
      const porCidadeResult = await db
        .select({
          cidade: clientes.cidade,
          uf: clientes.uf,
          count: sql<number>`count(*)`,
        })
        .from(clientes)
        .where(eq(clientes.pesquisaId, pesquisaId))
        .groupBy(clientes.cidade, clientes.uf)
        .orderBy(sql`count(*) DESC`)
        .limit(30);

      if (Array.isArray(porCidadeResult)) {
        porCidade = porCidadeResult.map((row) => ({
          cidade: row?.cidade ?? 'Não informado',
          uf: row?.uf ?? '',
          count: Number(row?.count ?? 0),
        }));
      }
    } catch (err) {
      console.error('[fetchClientes] Erro ao buscar por cidade:', err);
    }

    // Top 50 clientes
    const topClientes: ClienteData[] = [];
    try {
      const topClientesResult = await db
        .select({
          id: clientes.id,
          nome: clientes.nome,
          cidade: clientes.cidade,
          uf: clientes.uf,
        })
        .from(clientes)
        .where(eq(clientes.pesquisaId, pesquisaId))
        .limit(50);

      if (Array.isArray(topClientesResult)) {
        for (const cliente of topClientesResult) {
          if (!cliente || typeof cliente.id !== 'number') continue;

          // Buscar mercados do cliente
          let mercados: string[] = [];
          try {
            const mercadosResult = await db
              .select({
                mercadoNome: mercadosUnicos.nome,
              })
              .from(clientesMercados)
              .innerJoin(mercadosUnicos, eq(clientesMercados.mercadoId, mercadosUnicos.id))
              .where(eq(clientesMercados.clienteId, cliente.id))
              .limit(5);

            if (Array.isArray(mercadosResult)) {
              mercados = mercadosResult
                .map((m) => m?.mercadoNome)
                .filter((nome): nome is string => typeof nome === 'string' && nome.length > 0);
            }
          } catch (err) {
            console.error('[fetchClientes] Erro ao buscar mercados do cliente:', err);
          }

          topClientes.push({
            nome: cliente.nome ?? 'Sem nome',
            cidade: cliente.cidade ?? 'Não informado',
            uf: cliente.uf ?? '',
            mercados,
          });
        }
      }
    } catch (err) {
      console.error('[fetchClientes] Erro ao buscar top clientes:', err);
    }

    return {
      total,
      porEstado,
      porCidade,
      topClientes,
    };
  } catch (error) {
    console.error('[fetchClientes] Erro fatal:', error);
    return {
      total: 0,
      porEstado: {},
      porCidade: [],
      topClientes: [],
    };
  }
}
