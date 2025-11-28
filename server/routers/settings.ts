import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { systemSettings } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Settings Router - Gerenciamento de configurações do sistema
 */
export const settingsRouter = createTRPCRouter({
  /**
   * Buscar todas as configurações
   */
  getAll: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    return await db.select().from(systemSettings);
  }),

  /**
   * Buscar configuração específica
   */
  get: protectedProcedure.input(z.object({ key: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.settingKey, input.key))
      .limit(1);

    return setting || null;
  }),

  /**
   * Salvar/atualizar configuração
   */
  set: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      // Verificar se já existe
      const [existing] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.settingKey, input.key))
        .limit(1);

      if (existing) {
        // Update
        const [updated] = await db
          .update(systemSettings)
          .set({
            settingValue: input.value,
            description: input.description || existing.description,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(systemSettings.settingKey, input.key))
          .returning();

        return updated;
      } else {
        // Insert
        const [created] = await db
          .insert(systemSettings)
          .values({
            settingKey: input.key,
            settingValue: input.value,
            description: input.description,
          })
          .returning();

        return created;
      }
    }),

  /**
   * Deletar configuração
   */
  delete: protectedProcedure.input(z.object({ key: z.string() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    await db.delete(systemSettings).where(eq(systemSettings.settingKey, input.key));

    return { success: true };
  }),
});
