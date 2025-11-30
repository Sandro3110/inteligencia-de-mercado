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
  // Total de clientes
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(clientes)
    .where(eq(clientes.pesquisaId, pesquisaId));
  const total = Number(totalResult[0]?.count || 0);

  // Distribuição por estado
  const porEstadoResult = await db
    .select({
      uf: clientes.uf,
      count: sql<number>`count(*)`,
    })
    .from(clientes)
    .where(eq(clientes.pesquisaId, pesquisaId))
    .groupBy(clientes.uf)
    .orderBy(sql`count(*) DESC`);

  const porEstado: Record<string, number> = {};
  for (const row of porEstadoResult) {
    if (row.uf) {
      porEstado[row.uf] = Number(row.count);
    }
  }

  // Distribuição por cidade
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

  const porCidade = porCidadeResult.map((row) => ({
    cidade: row.cidade || 'Não informado',
    uf: row.uf || '',
    count: Number(row.count),
  }));

  // Top 50 clientes
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

  // Para cada cliente, buscar mercados
  const topClientes: ClienteData[] = [];

  for (const cliente of topClientesResult) {
    // Buscar mercados do cliente
    const mercadosResult = await db
      .select({
        mercadoNome: mercadosUnicos.nome,
      })
      .from(clientesMercados)
      .innerJoin(mercadosUnicos, eq(clientesMercados.mercadoId, mercadosUnicos.id))
      .where(eq(clientesMercados.clienteId, cliente.id))
      .limit(5);

    topClientes.push({
      nome: cliente.nome,
      cidade: cliente.cidade || 'Não informado',
      uf: cliente.uf || '',
      mercados: mercadosResult.map((m) => m.mercadoNome),
    });
  }

  return {
    total,
    porEstado,
    porCidade,
    topClientes,
  };
}
