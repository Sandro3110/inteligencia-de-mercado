import { router, publicProcedure } from './trpc';
import { db } from '../db';
import { dim_status_qualificacao } from '../../drizzle/schema';
import { asc } from 'drizzle-orm';

/**
 * Status Qualificação Router - Gerenciamento de status de qualificação de entidades
 */
export const statusQualificacaoRouter = router({
  /**
   * Listar todos os status de qualificação ordenados por ordem
   */
  list: publicProcedure.query(async () => {
    const statusList = await db
      .select()
      .from(dim_status_qualificacao)
      .orderBy(asc(dim_status_qualificacao.ordem));

    return statusList;
  }),
});
