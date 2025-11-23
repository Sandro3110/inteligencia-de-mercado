import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { clientes, concorrentes, leads } from "../drizzle/schema";

/**
 * Geocodifica um registro usando o cache de cidades brasileiras
 * @param cidade Nome da cidade
 * @param uf Sigla do estado (2 letras)
 * @returns Coordenadas {latitude, longitude} ou null se não encontrado
 */
export async function geocodeFromCache(
  cidade: string,
  uf: string
): Promise<{ latitude: number; longitude: number } | null> {
  if (!cidade || !uf) return null;

  const db = await getDb();
  if (!db) return null;

  try {
    // Normalizar cidade (remover acentos, maiúsculas)
    const cidadeNorm = cidade
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();

    const ufNorm = uf.toUpperCase().trim();

    // Buscar no cache usando query SQL direta
    const result = (await db.execute(
      `SELECT latitude, longitude FROM cities_cache 
       WHERE UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u')) = '${cidadeNorm}' 
       AND uf = '${ufNorm}' LIMIT 1`
    )) as any;

    if (result && Array.isArray(result) && result.length > 0) {
      const row = result[0] as any;
      return {
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
      };
    }

    return null;
  } catch (error) {
    console.error("Erro ao geocodificar:", error);
    return null;
  }
}

/**
 * Atualiza coordenadas de um cliente
 */
export async function geocodeCliente(
  clienteId: number,
  cidade: string,
  uf: string
): Promise<boolean> {
  const coords = await geocodeFromCache(cidade, uf);
  if (!coords) return false;

  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(clientes)
      .set({
        latitude: coords.latitude.toString(),
        longitude: coords.longitude.toString(),
        geocodedAt: new Date().toISOString(),
      })
      .where(eq(clientes.id, clienteId));
    return true;
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return false;
  }
}

/**
 * Atualiza coordenadas de um concorrente
 */
export async function geocodeConcorrente(
  concorrenteId: number,
  cidade: string,
  uf: string
): Promise<boolean> {
  const coords = await geocodeFromCache(cidade, uf);
  if (!coords) return false;

  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(concorrentes)
      .set({
        latitude: coords.latitude.toString(),
        longitude: coords.longitude.toString(),
        geocodedAt: new Date().toISOString(),
      })
      .where(eq(concorrentes.id, concorrenteId));
    return true;
  } catch (error) {
    console.error("Erro ao atualizar concorrente:", error);
    return false;
  }
}

/**
 * Atualiza coordenadas de um lead
 */
export async function geocodeLead(
  leadId: number,
  cidade: string,
  uf: string
): Promise<boolean> {
  const coords = await geocodeFromCache(cidade, uf);
  if (!coords) return false;

  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(leads)
      .set({
        latitude: coords.latitude.toString(),
        longitude: coords.longitude.toString(),
        geocodedAt: new Date().toISOString(),
      })
      .where(eq(leads.id, leadId));
    return true;
  } catch (error) {
    console.error("Erro ao atualizar lead:", error);
    return false;
  }
}
