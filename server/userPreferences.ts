/**
 * Gerenciamento de Preferências de Usuário
 * Fase 69: Sistema Completo de Notificações em Tempo Real
 */

import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { userPreferences } from '../drizzle/schema';

export interface UserPreferences {
  id: number;
  userId: string;
  notificationSoundEnabled: number; // 0 ou 1
  notificationVolume: number; // 0-100
  desktopNotificationsEnabled: number; // 0 ou 1
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePreferencesInput {
  notificationSoundEnabled?: boolean;
  notificationVolume?: number;
  desktopNotificationsEnabled?: boolean;
}

/**
 * Busca preferências do usuário (cria com valores padrão se não existir)
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const db = await getDb();
  if (!db) {
    console.warn('[UserPreferences] Database not available');
    return null;
  }

  try {
    // Buscar preferências existentes
    const result = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (result.length > 0) {
      return result[0] as UserPreferences;
    }

    // Criar preferências padrão se não existir
    await db.insert(userPreferences).values({
      userId,
      notificationSoundEnabled: 1,
      notificationVolume: 50,
      desktopNotificationsEnabled: 1,
    });

    // Buscar novamente
    const newResult = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    return newResult.length > 0 ? (newResult[0] as UserPreferences) : null;
  } catch (error) {
    console.error('[UserPreferences] Failed to get preferences:', error);
    return null;
  }
}

/**
 * Atualiza preferências do usuário
 */
export async function updateUserPreferences(
  userId: string,
  updates: UpdatePreferencesInput
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Garantir que preferências existem
    await getUserPreferences(userId);

    // Converter boolean para tinyint
    const dbUpdates: any = {};
    if (updates.notificationSoundEnabled !== undefined) {
      dbUpdates.notificationSoundEnabled = updates.notificationSoundEnabled ? 1 : 0;
    }
    if (updates.notificationVolume !== undefined) {
      // Validar range 0-100
      const volume = Math.max(0, Math.min(100, updates.notificationVolume));
      dbUpdates.notificationVolume = volume;
    }
    if (updates.desktopNotificationsEnabled !== undefined) {
      dbUpdates.desktopNotificationsEnabled = updates.desktopNotificationsEnabled ? 1 : 0;
    }

    // Atualizar
    await db
      .update(userPreferences)
      .set(dbUpdates)
      .where(eq(userPreferences.userId, userId));

    console.log(`[UserPreferences] Updated preferences for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('[UserPreferences] Failed to update preferences:', error);
    return { success: false, error: 'Failed to update preferences' };
  }
}

/**
 * Reseta preferências para valores padrão
 */
export async function resetUserPreferences(userId: string): Promise<{ success: boolean; error?: string }> {
  return updateUserPreferences(userId, {
    notificationSoundEnabled: true,
    notificationVolume: 50,
    desktopNotificationsEnabled: true,
  });
}
