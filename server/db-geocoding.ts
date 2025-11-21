/**
 * Funções de banco de dados para geocodificação
 */

import { eq, and, isNull, or, inArray, sql } from "drizzle-orm";
import { getDb } from "./db";
import { clientes, concorrentes, leads } from "../drizzle/schema";
import { toMySQLTimestamp } from "./_core/dateUtils";

// Interface para registro sem coordenadas
export interface RecordSemCoordenadas {
  id: number;
  nome: string;
  cidade: string;
  uf: string;
  tipo: "cliente" | "concorrente" | "lead";
  mercadoNome?: string;
}

/**
 * Busca todos os registros sem coordenadas
 */
export async function getRecordsSemCoordenadas(
  projetoId: number,
  tipo?: "cliente" | "concorrente" | "lead"
): Promise<RecordSemCoordenadas[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const records: RecordSemCoordenadas[] = [];

  try {
    // Buscar clientes sem coordenadas
    if (!tipo || tipo === "cliente") {
      const clientesSemCoord = await db
        .select({
          id: clientes.id,
          nome: clientes.nome,
          cidade: clientes.cidade,
          uf: clientes.uf,
        })
        .from(clientes)
        .where(
          and(
            eq(clientes.projectId, projetoId),
            or(isNull(clientes.latitude), isNull(clientes.longitude))
          )
        );

      records.push(
        ...clientesSemCoord.map(c => ({
          ...c,
          tipo: "cliente" as const,
          cidade: c.cidade || "",
          uf: c.uf || "",
        }))
      );
    }

    // Buscar concorrentes sem coordenadas
    if (!tipo || tipo === "concorrente") {
      const concorrentesSemCoord = await db
        .select({
          id: concorrentes.id,
          nome: concorrentes.nome,
          cidade: concorrentes.cidade,
          uf: concorrentes.uf,
        })
        .from(concorrentes)
        .where(
          and(
            eq(concorrentes.projectId, projetoId),
            or(isNull(concorrentes.latitude), isNull(concorrentes.longitude))
          )
        );

      records.push(
        ...concorrentesSemCoord.map(c => ({
          ...c,
          tipo: "concorrente" as const,
          cidade: c.cidade || "",
          uf: c.uf || "",
        }))
      );
    }

    // Buscar leads sem coordenadas
    if (!tipo || tipo === "lead") {
      const leadsSemCoord = await db
        .select({
          id: leads.id,
          nome: leads.nome,
          cidade: leads.cidade,
          uf: leads.uf,
        })
        .from(leads)
        .where(
          and(
            eq(leads.projectId, projetoId),
            or(isNull(leads.latitude), isNull(leads.longitude))
          )
        );

      records.push(
        ...leadsSemCoord.map(l => ({
          ...l,
          tipo: "lead" as const,
          cidade: l.cidade || "",
          uf: l.uf || "",
        }))
      );
    }

    console.log(`[DB] Encontrados ${records.length} registros sem coordenadas`);
    return records;
  } catch (error) {
    console.error("[DB] Erro ao buscar registros sem coordenadas:", error);
    return [];
  }
}

/**
 * Atualiza coordenadas de um cliente
 */
export async function updateClienteCoordinates(
  id: number,
  latitude: number,
  longitude: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  try {
    await db
      .update(clientes)
      .set({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        geocodedAt: toMySQLTimestamp(new Date()),
      })
      .where(eq(clientes.id, id));

    console.log(`[DB] Coordenadas atualizadas para cliente ${id}`);
    return true;
  } catch (error) {
    console.error(
      `[DB] Erro ao atualizar coordenadas do cliente ${id}:`,
      error
    );
    return false;
  }
}

/**
 * Atualiza coordenadas de um concorrente
 */
export async function updateConcorrenteCoordinates(
  id: number,
  latitude: number,
  longitude: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  try {
    await db
      .update(concorrentes)
      .set({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        geocodedAt: toMySQLTimestamp(new Date()),
      })
      .where(eq(concorrentes.id, id));

    console.log(`[DB] Coordenadas atualizadas para concorrente ${id}`);
    return true;
  } catch (error) {
    console.error(
      `[DB] Erro ao atualizar coordenadas do concorrente ${id}:`,
      error
    );
    return false;
  }
}

/**
 * Atualiza coordenadas de um lead
 */
export async function updateLeadCoordinates(
  id: number,
  latitude: number,
  longitude: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  try {
    await db
      .update(leads)
      .set({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        geocodedAt: toMySQLTimestamp(new Date()),
      })
      .where(eq(leads.id, id));

    console.log(`[DB] Coordenadas atualizadas para lead ${id}`);
    return true;
  } catch (error) {
    console.error(`[DB] Erro ao atualizar coordenadas do lead ${id}:`, error);
    return false;
  }
}

/**
 * Estatísticas de cobertura geográfica
 */
export async function getGeocodeStats(projetoId: number) {
  const db = await getDb();
  if (!db) {
    return {
      clientes: {
        total: 0,
        comCoordenadas: 0,
        semCoordenadas: 0,
        percentual: 0,
      },
      concorrentes: {
        total: 0,
        comCoordenadas: 0,
        semCoordenadas: 0,
        percentual: 0,
      },
      leads: { total: 0, comCoordenadas: 0, semCoordenadas: 0, percentual: 0 },
      total: { total: 0, comCoordenadas: 0, semCoordenadas: 0, percentual: 0 },
    };
  }

  try {
    // Estatísticas de clientes
    const clientesTotal = await db
      .select({ count: sql<number>`count(*)` })
      .from(clientes)
      .where(eq(clientes.projectId, projetoId));

    const clientesComCoord = await db
      .select({ count: sql<number>`count(*)` })
      .from(clientes)
      .where(
        and(
          eq(clientes.projectId, projetoId),
          sql`${clientes.latitude} IS NOT NULL`,
          sql`${clientes.longitude} IS NOT NULL`
        )
      );

    const clientesTotalNum = Number(clientesTotal[0]?.count || 0);
    const clientesComCoordNum = Number(clientesComCoord[0]?.count || 0);
    const clientesSemCoordNum = clientesTotalNum - clientesComCoordNum;

    // Estatísticas de concorrentes
    const concorrentesTotal = await db
      .select({ count: sql<number>`count(*)` })
      .from(concorrentes)
      .where(eq(concorrentes.projectId, projetoId));

    const concorrentesComCoord = await db
      .select({ count: sql<number>`count(*)` })
      .from(concorrentes)
      .where(
        and(
          eq(concorrentes.projectId, projetoId),
          sql`${concorrentes.latitude} IS NOT NULL`,
          sql`${concorrentes.longitude} IS NOT NULL`
        )
      );

    const concorrentesTotalNum = Number(concorrentesTotal[0]?.count || 0);
    const concorrentesComCoordNum = Number(concorrentesComCoord[0]?.count || 0);
    const concorrentesSemCoordNum =
      concorrentesTotalNum - concorrentesComCoordNum;

    // Estatísticas de leads
    const leadsTotal = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(eq(leads.projectId, projetoId));

    const leadsComCoord = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(
        and(
          eq(leads.projectId, projetoId),
          sql`${leads.latitude} IS NOT NULL`,
          sql`${leads.longitude} IS NOT NULL`
        )
      );

    const leadsTotalNum = Number(leadsTotal[0]?.count || 0);
    const leadsComCoordNum = Number(leadsComCoord[0]?.count || 0);
    const leadsSemCoordNum = leadsTotalNum - leadsComCoordNum;

    // Totais gerais
    const totalGeral = clientesTotalNum + concorrentesTotalNum + leadsTotalNum;
    const totalComCoord =
      clientesComCoordNum + concorrentesComCoordNum + leadsComCoordNum;
    const totalSemCoord = totalGeral - totalComCoord;

    return {
      clientes: {
        total: clientesTotalNum,
        comCoordenadas: clientesComCoordNum,
        semCoordenadas: clientesSemCoordNum,
        percentual:
          clientesTotalNum > 0
            ? Math.round((clientesComCoordNum / clientesTotalNum) * 100)
            : 0,
      },
      concorrentes: {
        total: concorrentesTotalNum,
        comCoordenadas: concorrentesComCoordNum,
        semCoordenadas: concorrentesSemCoordNum,
        percentual:
          concorrentesTotalNum > 0
            ? Math.round((concorrentesComCoordNum / concorrentesTotalNum) * 100)
            : 0,
      },
      leads: {
        total: leadsTotalNum,
        comCoordenadas: leadsComCoordNum,
        semCoordenadas: leadsSemCoordNum,
        percentual:
          leadsTotalNum > 0
            ? Math.round((leadsComCoordNum / leadsTotalNum) * 100)
            : 0,
      },
      total: {
        total: totalGeral,
        comCoordenadas: totalComCoord,
        semCoordenadas: totalSemCoord,
        percentual:
          totalGeral > 0 ? Math.round((totalComCoord / totalGeral) * 100) : 0,
      },
    };
  } catch (error) {
    console.error("[DB] Erro ao buscar estatísticas de geocodificação:", error);
    return {
      clientes: {
        total: 0,
        comCoordenadas: 0,
        semCoordenadas: 0,
        percentual: 0,
      },
      concorrentes: {
        total: 0,
        comCoordenadas: 0,
        semCoordenadas: 0,
        percentual: 0,
      },
      leads: { total: 0, comCoordenadas: 0, semCoordenadas: 0, percentual: 0 },
      total: { total: 0, comCoordenadas: 0, semCoordenadas: 0, percentual: 0 },
    };
  }
}
