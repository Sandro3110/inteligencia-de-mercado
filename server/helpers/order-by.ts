/**
 * Helper tipado para orderBy dinâmico
 * Substitui (table as any)[orderBy] por getOrderColumn(table, orderBy)
 */

import { PgTable } from 'drizzle-orm/pg-core';

/**
 * Obtém coluna de ordenação de forma tipada
 * @param table - Tabela Drizzle
 * @param orderBy - Nome da coluna (string)
 * @param defaultColumn - Coluna padrão se orderBy inválido
 * @returns Coluna para usar em asc() ou desc()
 */
export function getOrderColumn<T extends PgTable>(
  table: T,
  orderBy: string,
  defaultColumn: any
): any {
  // Verificar se a coluna existe na tabela
  if (orderBy in table) {
    return (table as any)[orderBy];
  }
  
  return defaultColumn;
}
