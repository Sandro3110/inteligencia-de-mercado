import { logger } from '@/lib/logger';

/**
 * Helper para rastrear mudanças em entidades
 */

import { and, eq } from 'drizzle-orm';
import { getDb } from '../db';
import {
  mercadosHistory,
  clientesHistory,
  concorrentesHistory,
  leadsHistory,
} from '../../drizzle/schema';

type ChangeType = 'created' | 'updated' | 'enriched' | 'validated';

interface Change {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

/**
 * Compara dois objetos e retorna lista de mudanças
 */
export function detectChanges(
  oldData: Record<string, any>,
  newData: Record<string, any>,
  fieldsToTrack: string[]
): Change[] {
  const changes: Change[] = [];

  for (const field of fieldsToTrack) {
    const oldValue = oldData[field];
    const newValue = newData[field];

    // Ignorar se ambos são null/undefined
    if (oldValue == null && newValue == null) continue;

    // Detectar mudança
    if (oldValue !== newValue) {
      changes.push({
        field,
        oldValue: oldValue != null ? String(oldValue) : null,
        newValue: newValue != null ? String(newValue) : null,
      });
    }
  }

  return changes;
}

/**
 * Registra mudanças de mercado no histórico
 */
export async function trackMercadoChanges(
  mercadoId: number,
  changes: Change[],
  changeType: ChangeType = 'updated',
  changedBy: string = 'system'
) {
  if (changes.length === 0) return;

  const db = await getDb();
  if (!db) return;

  const records = changes.map((change) => ({
    mercadoId,
    field: change.field,
    oldValue: change.oldValue,
    newValue: change.newValue,
    changeType,
    changedBy,
  }));

  await db.insert(mercadosHistory).values(records);
  logger.debug(`[History] Registradas ${changes.length} mudanças para mercado ${mercadoId}`);
}

/**
 * Registra mudanças de cliente no histórico
 */
export async function trackClienteChanges(
  clienteId: number,
  changes: Change[],
  changeType: ChangeType = 'updated',
  changedBy: string = 'system'
) {
  if (changes.length === 0) return;

  const db = await getDb();
  if (!db) return;

  const records = changes.map((change) => ({
    clienteId,
    field: change.field,
    oldValue: change.oldValue,
    newValue: change.newValue,
    changeType,
    changedBy,
  }));

  await db.insert(clientesHistory).values(records);
  logger.debug(`[History] Registradas ${changes.length} mudanças para cliente ${clienteId}`);
}

/**
 * Registra mudanças de concorrente no histórico
 */
export async function trackConcorrenteChanges(
  concorrenteId: number,
  changes: Change[],
  changeType: ChangeType = 'updated',
  changedBy: string = 'system'
) {
  if (changes.length === 0) return;

  const db = await getDb();
  if (!db) return;

  const records = changes.map((change) => ({
    concorrenteId,
    field: change.field,
    oldValue: change.oldValue,
    newValue: change.newValue,
    changeType,
    changedBy,
  }));

  await db.insert(concorrentesHistory).values(records);
  logger.debug(
    `[History] Registradas ${changes.length} mudanças para concorrente ${concorrenteId}`
  );
}

/**
 * Registra mudanças de lead no histórico
 */
export async function trackLeadChanges(
  leadId: number,
  changes: Change[],
  changeType: ChangeType = 'updated',
  changedBy: string = 'system'
) {
  if (changes.length === 0) return;

  const db = await getDb();
  if (!db) return;

  const records = changes.map((change) => ({
    leadId,
    field: change.field,
    oldValue: change.oldValue,
    newValue: change.newValue,
    changeType,
    changedBy,
  }));

  await db.insert(leadsHistory).values(records);
  logger.debug(`[History] Registradas ${changes.length} mudanças para lead ${leadId}`);
}

/**
 * Registra criação de entidade
 */
export async function trackCreation(
  entityType: 'mercado' | 'cliente' | 'concorrente' | 'lead',
  entityId: number,
  initialData: Record<string, any>,
  changedBy: string = 'system'
) {
  const db = await getDb();
  if (!db) return;

  const change = {
    field: '_created',
    oldValue: null,
    newValue: JSON.stringify(initialData),
    changeType: 'created' as const,
    changedBy,
  };

  switch (entityType) {
    case 'mercado':
      await db.insert(mercadosHistory).values({ ...change, mercadoId: entityId });
      break;
    case 'cliente':
      await db.insert(clientesHistory).values({ ...change, clienteId: entityId });
      break;
    case 'concorrente':
      await db.insert(concorrentesHistory).values({ ...change, concorrenteId: entityId });
      break;
    case 'lead':
      await db.insert(leadsHistory).values({ ...change, leadId: entityId });
      break;
  }

  logger.debug(`[History] Criação de ${entityType} ${entityId} registrada`);
}
