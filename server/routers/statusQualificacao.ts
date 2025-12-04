import { router, publicProcedure } from './index';
import { db } from '../db';
import { dimStatusQualificacao } from '../../drizzle/schema';
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
      .from(dimStatusQualificacao)
      .orderBy(asc(dimStatusQualificacao.ordem));

    return statusList;
  }),
});
