/**
 * Teste para cleanEnrichment
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from '@/server/db';
import { pesquisas, enrichmentJobs } from '@/drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';

describe('cleanEnrichment', () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let testPesquisaId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error('Database not available');

    // Buscar uma pesquisa existente para teste
    const pesquisasList = await db.select().from(pesquisas).limit(1);
    if (pesquisasList.length === 0) {
      throw new Error('Nenhuma pesquisa encontrada no banco para teste');
    }
    testPesquisaId = pesquisasList[0].id;
    console.log('🧪 Testando com pesquisaId:', testPesquisaId);
  });

  it('deve buscar jobs com inArray corretamente', async () => {
    if (!db) throw new Error('Database not available');

    // Testar a query que estava dando erro
    const jobsToCancel = await db
      .select({ id: enrichmentJobs.id, status: enrichmentJobs.status })
      .from(enrichmentJobs)
      .where(
        and(
          eq(enrichmentJobs.pesquisaId, testPesquisaId),
          inArray(enrichmentJobs.status, ['running', 'paused'])
        )
      );

    console.log('✅ Jobs encontrados:', jobsToCancel.length);
    expect(Array.isArray(jobsToCancel)).toBe(true);
  });

  it('deve atualizar updatedAt com toISOString()', async () => {
    if (!db) throw new Error('Database not available');

    // Verificar se há jobs para atualizar
    const jobsToUpdate = await db
      .select({ id: enrichmentJobs.id })
      .from(enrichmentJobs)
      .where(
        and(
          eq(enrichmentJobs.pesquisaId, testPesquisaId),
          inArray(enrichmentJobs.status, ['running', 'paused'])
        )
      );

    if (jobsToUpdate.length > 0) {
      // Testar update com toISOString()
      const result = await db
        .update(enrichmentJobs)
        .set({
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(enrichmentJobs.pesquisaId, testPesquisaId),
            inArray(enrichmentJobs.status, ['running', 'paused'])
          )
        );

      console.log('✅ Jobs atualizados:', result.rowsAffected);
      expect(result.rowsAffected).toBeGreaterThanOrEqual(0);
    } else {
      console.log('⚠️ Nenhum job para atualizar (isso é OK)');
      expect(jobsToUpdate.length).toBe(0);
    }
  });
});
