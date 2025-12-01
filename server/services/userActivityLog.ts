/**
 * Serviço de Log de Auditoria de Usuários
 * Registra ações de admin sobre usuários
 */

interface LogActivityParams {
  userId: string;
  adminId: string;
  action: 'approved' | 'rejected' | 'role_changed' | 'status_changed';
  details?: Record<string, unknown>;
}

export async function logUserActivity(params: LogActivityParams): Promise<void> {
  const { getDb } = await import('../db');
  const db = await getDb();
  if (!db) {
    console.error('[UserActivityLog] Database not available');
    return;
  }

  try {
    await db.execute({
      sql: `
        INSERT INTO user_activity_log (user_id, admin_id, action, details)
        VALUES ($1, $2, $3, $4)
      `,
      args: [params.userId, params.adminId, params.action, JSON.stringify(params.details || {})],
    });

    console.log('[UserActivityLog] Atividade registrada:', {
      userId: params.userId,
      adminId: params.adminId,
      action: params.action,
    });
  } catch (error) {
    console.error('[UserActivityLog] Erro ao registrar atividade:', error);
    // Não lançar erro para não quebrar o fluxo principal
  }
}

/**
 * Busca histórico de atividades de um usuário
 */
export async function getUserActivityHistory(userId: string, limit = 50) {
  const { getDb } = await import('../db');
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const result = await db.execute({
    sql: `
      SELECT 
        id,
        user_id,
        admin_id,
        action,
        details,
        created_at
      FROM user_activity_log
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `,
    args: [userId, limit],
  });

  return result.rows;
}
