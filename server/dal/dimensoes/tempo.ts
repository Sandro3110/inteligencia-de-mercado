/**
 * DAL para dim_tempo
 */

import { db } from '../../db';
import { dim_tempo } from '../../../drizzle/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

/**
 * Buscar tempo por data
 */
export async function getTempoByData(data: Date) {
  const dataStr = data.toISOString().split('T')[0]; // YYYY-MM-DD
  
  const result = await db
    .select()
    .from(dim_tempo)
    .where(eq(dim_tempo.data, dataStr))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Buscar tempo por ID
 */
export async function getTempoById(id: number) {
  const result = await db
    .select()
    .from(dim_tempo)
    .where(eq(dim_tempo.id, id))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Buscar tempos por período
 */
export async function getTemposByPeriodo(dataInicio: Date, dataFim: Date) {
  const dataInicioStr = dataInicio.toISOString().split('T')[0];
  const dataFimStr = dataFim.toISOString().split('T')[0];
  
  return await db
    .select()
    .from(dim_tempo)
    .where(
      and(
        gte(dim_tempo.data, dataInicioStr),
        lte(dim_tempo.data, dataFimStr)
      )
    )
    .orderBy(dim_tempo.data);
}

/**
 * Buscar tempos por ano e mês
 */
export async function getTemposByAnoMes(ano: number, mes: number) {
  return await db
    .select()
    .from(dim_tempo)
    .where(
      and(
        eq(dim_tempo.ano, ano),
        eq(dim_tempo.mes, mes)
      )
    )
    .orderBy(dim_tempo.data);
}

/**
 * Buscar tempos por ano e trimestre
 */
export async function getTemposByAnoTrimestre(ano: number, trimestre: number) {
  return await db
    .select()
    .from(dim_tempo)
    .where(
      and(
        eq(dim_tempo.ano, ano),
        eq(dim_tempo.trimestre, trimestre)
      )
    )
    .orderBy(dim_tempo.data);
}

/**
 * Buscar apenas dias úteis
 */
export async function getDiasUteis(dataInicio: Date, dataFim: Date) {
  const dataInicioStr = dataInicio.toISOString().split('T')[0];
  const dataFimStr = dataFim.toISOString().split('T')[0];
  
  return await db
    .select()
    .from(dim_tempo)
    .where(
      and(
        gte(dim_tempo.data, dataInicioStr),
        lte(dim_tempo.data, dataFimStr),
        eq(dim_tempo.ehDiaUtil, true)
      )
    )
    .orderBy(dim_tempo.data);
}

/**
 * Buscar feriados
 */
export async function getFeriados(ano: number) {
  return await db
    .select()
    .from(dim_tempo)
    .where(
      and(
        eq(dim_tempo.ano, ano),
        eq(dim_tempo.ehFeriado, true)
      )
    )
    .orderBy(dim_tempo.data);
}

/**
 * Obter ou criar tempo para data (helper para importação)
 */
export async function getOrCreateTempoByData(data: Date): Promise<number> {
  // Tentar buscar existente
  const existing = await getTempoByData(data);
  if (existing) {
    return existing.id;
  }
  
  // Se não existe, a data está fora do range 2020-2030
  // Retornar null ou lançar erro
  throw new Error(`Data ${data.toISOString()} fora do range suportado (2020-2030)`);
}

/**
 * Estatísticas de uso
 */
export async function getTempoStats() {
  const stats = await db
    .select({
      totalDias: sql<number>`COUNT(*)`,
      diasUteis: sql<number>`SUM(CASE WHEN ${dim_tempo.ehDiaUtil} THEN 1 ELSE 0 END)`,
      feriados: sql<number>`SUM(CASE WHEN ${dim_tempo.ehFeriado} THEN 1 ELSE 0 END)`,
      fimSemana: sql<number>`SUM(CASE WHEN ${dim_tempo.ehFimSemana} THEN 1 ELSE 0 END)`,
      anoMin: sql<number>`MIN(${dim_tempo.ano})`,
      anoMax: sql<number>`MAX(${dim_tempo.ano})`,
    })
    .from(dim_tempo);
  
  return stats[0];
}
