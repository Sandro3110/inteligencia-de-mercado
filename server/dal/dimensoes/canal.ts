/**
 * DAL para dim_canal
 */

import { db } from '../db';
import { dimCanal } from '../../../drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * Buscar canal por ID
 */
export async function getCanalById(id: number) {
  const result = await db
    .select()
    .from(dimCanal)
    .where(eq(dimCanal.id, id))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Buscar canal por código
 */
export async function getCanalByCodigo(codigo: string) {
  const result = await db
    .select()
    .from(dimCanal)
    .where(eq(dimCanal.codigo, codigo))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Listar todos os canais ativos
 */
export async function listCanaisAtivos() {
  return await db
    .select()
    .from(dimCanal)
    .where(eq(dimCanal.ativo, true))
    .orderBy(dimCanal.nome);
}

/**
 * Listar todos os canais
 */
export async function listCanais() {
  return await db
    .select()
    .from(dimCanal)
    .orderBy(dimCanal.nome);
}

/**
 * Listar canais por tipo
 */
export async function listCanaisByTipo(tipo: string) {
  return await db
    .select()
    .from(dimCanal)
    .where(
      and(
        eq(dimCanal.tipo, tipo),
        eq(dimCanal.ativo, true)
      )
    )
    .orderBy(dimCanal.nome);
}

/**
 * Criar novo canal
 */
export async function createCanal(data: {
  codigo: string;
  nome: string;
  tipo: string;
  descricao?: string;
  custoMedio?: number;
  taxaConversaoMedia?: number;
  createdBy?: number;
}) {
  const result = await db
    .insert(dimCanal)
    .values({
      codigo: data.codigo,
      nome: data.nome,
      tipo: data.tipo,
      descricao: data.descricao,
      custoMedio: data.custoMedio?.toString(),
      taxaConversaoMedia: data.taxaConversaoMedia?.toString(),
      createdBy: data.createdBy,
    })
    .returning();
  
  return result[0];
}

/**
 * Atualizar canal
 */
export async function updateCanal(
  id: number,
  data: {
    nome?: string;
    descricao?: string;
    custoMedio?: number;
    taxaConversaoMedia?: number;
    ativo?: boolean;
    updatedBy?: number;
  }
) {
  const updateData: any = {
    updatedAt: new Date(),
  };
  
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.descricao !== undefined) updateData.descricao = data.descricao;
  if (data.custoMedio !== undefined) updateData.custoMedio = data.custoMedio.toString();
  if (data.taxaConversaoMedia !== undefined) updateData.taxaConversaoMedia = data.taxaConversaoMedia.toString();
  if (data.ativo !== undefined) updateData.ativo = data.ativo;
  if (data.updatedBy !== undefined) updateData.updatedBy = data.updatedBy;
  
  const result = await db
    .update(dimCanal)
    .set(updateData)
    .where(eq(dimCanal.id, id))
    .returning();
  
  return result[0];
}

/**
 * Desativar canal
 */
export async function desativarCanal(id: number, updatedBy?: number) {
  return await updateCanal(id, { ativo: false, updatedBy });
}

/**
 * Ativar canal
 */
export async function ativarCanal(id: number, updatedBy?: number) {
  return await updateCanal(id, { ativo: true, updatedBy });
}

/**
 * Obter canal padrão para importação
 */
export async function getCanalImportacaoPadrao() {
  return await getCanalByCodigo('import-csv');
}

/**
 * Obter canal para enriquecimento IA
 */
export async function getCanalEnriquecimentoIA() {
  return await getCanalByCodigo('enrich-ai');
}

/**
 * Estatísticas de canais
 */
export async function getCanalStats() {
  const stats = await db
    .select({
      totalCanais: sql<number>`COUNT(*)`,
      canaisAtivos: sql<number>`SUM(CASE WHEN ${dimCanal.ativo} THEN 1 ELSE 0 END)`,
      custoMedioGeral: sql<number>`AVG(${dimCanal.custoMedio})`,
      taxaConversaoMediaGeral: sql<number>`AVG(${dimCanal.taxaConversaoMedia})`,
    })
    .from(dimCanal);
  
  return stats[0];
}
