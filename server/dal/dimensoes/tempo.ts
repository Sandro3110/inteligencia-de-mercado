/**
 * DAL para dim_tempo
 */

import { db } from '../../db';
import { dimTempo } from '../../../drizzle/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

/**
 * Buscar tempo por data
 */
export async function getTempoByData(data: Date) {
  const dataStr = data.toISOString().split('T')[0]; // YYYY-MM-DD
  
  const result = await db
    .select()
    .from(dimTempo)
    .where(eq(dimTempo.data, dataStr))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Buscar tempo por ID
 */
export async function getTempoById(id: number) {
  const result = await db
    .select()
    .from(dimTempo)
    .where(eq(dimTempo.id, id))
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
    .from(dimTempo)
    .where(
      and(
        gte(dimTempo.data, dataInicioStr),
        lte(dimTempo.data, dataFimStr)
      )
    )
    .orderBy(dimTempo.data);
}

/**
 * Buscar tempos por ano e mês
 */
export async function getTemposByAnoMes(ano: number, mes: number) {
  return await db
    .select()
    .from(dimTempo)
    .where(
      and(
        eq(dimTempo.ano, ano),
        eq(dimTempo.mes, mes)
      )
    )
    .orderBy(dimTempo.data);
}

/**
 * Buscar tempos por ano e trimestre
 */
export async function getTemposByAnoTrimestre(ano: number, trimestre: number) {
  return await db
    .select()
    .from(dimTempo)
    .where(
      and(
        eq(dimTempo.ano, ano),
        eq(dimTempo.trimestre, trimestre)
      )
    )
    .orderBy(dimTempo.data);
}

/**
 * Buscar apenas dias úteis
 */
export async function getDiasUteis(dataInicio: Date, dataFim: Date) {
  const dataInicioStr = dataInicio.toISOString().split('T')[0];
  const dataFimStr = dataFim.toISOString().split('T')[0];
  
  return await db
    .select()
    .from(dimTempo)
    .where(
      and(
        gte(dimTempo.data, dataInicioStr),
        lte(dimTempo.data, dataFimStr),
        eq(dimTempo.ehDiaUtil, true)
      )
    )
    .orderBy(dimTempo.data);
}

/**
 * Buscar feriados
 */
export async function getFeriados(ano: number) {
  return await db
    .select()
    .from(dimTempo)
    .where(
      and(
        eq(dimTempo.ano, ano),
        eq(dimTempo.ehFeriado, true)
      )
    )
    .orderBy(dimTempo.data);
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
      diasUteis: sql<number>`SUM(CASE WHEN ${dimTempo.ehDiaUtil} THEN 1 ELSE 0 END)`,
      feriados: sql<number>`SUM(CASE WHEN ${dimTempo.ehFeriado} THEN 1 ELSE 0 END)`,
      fimSemana: sql<number>`SUM(CASE WHEN ${dimTempo.ehFimSemana} THEN 1 ELSE 0 END)`,
      anoMin: sql<number>`MIN(${dimTempo.ano})`,
      anoMax: sql<number>`MAX(${dimTempo.ano})`,
    })
    .from(dimTempo);
  
  return stats[0];
}
