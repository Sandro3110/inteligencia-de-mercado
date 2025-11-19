import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { mercadosUnicos } from "../drizzle/schema";

/**
 * Buscar mercado existente por nome e projectId
 */
export async function getMercadoByNome(
  projectId: number,
  nome: string
): Promise<{ id: number; nome: string } | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get mercado: database not available");
    return undefined;
  }

  const result = await db
    .select({
      id: mercadosUnicos.id,
      nome: mercadosUnicos.nome,
    })
    .from(mercadosUnicos)
    .where(
      and(
        eq(mercadosUnicos.projectId, projectId),
        eq(mercadosUnicos.nome, nome)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}
