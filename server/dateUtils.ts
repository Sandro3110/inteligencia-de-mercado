/**
 * Utilitários para conversão de datas para formato PostgreSQL
 *
 * PostgreSQL timestamp espera formato: 'YYYY-MM-DD HH:MM:SS'
 * Drizzle com mode: 'string' espera string, não Date
 */

/**
 * Converte Date para string no formato PostgreSQL timestamp
 * @param date Data a converter (padrão: agora)
 * @returns String no formato 'YYYY-MM-DD HH:MM:SS'
 */
export function toPostgresTimestamp(date: Date = new Date()): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

/**
 * Converte Date para string no formato PostgreSQL timestamp ou retorna null
 * @param date Data a converter ou null/undefined
 * @returns String no formato 'YYYY-MM-DD HH:MM:SS' ou null
 */
export function toPostgresTimestampOrNull(
  date: Date | null | undefined
): string | null {
  if (!date) return null;
  return toPostgresTimestamp(date);
}

/**
 * Retorna timestamp atual no formato PostgreSQL
 * @returns String no formato 'YYYY-MM-DD HH:MM:SS'
 */
export function now(): string {
  return toPostgresTimestamp();
}
