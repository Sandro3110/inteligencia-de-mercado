/**
 * Converte Date para string no formato PostgreSQL timestamp
 * Necessário porque o schema usa timestamp({ mode: 'string' })
 */
export function toPostgresTimestamp(
  date: Date | string | null | undefined
): string | null {
  if (!date) return null;

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return null;

  // Formato: YYYY-MM-DD HH:MM:SS
  return d.toISOString().slice(0, 19).replace("T", " ");
}

/**
 * Converte string PostgreSQL timestamp para Date
 */
export function fromPostgresTimestamp(
  timestamp: string | null | undefined
): Date | null {
  if (!timestamp) return null;

  const d = new Date(timestamp);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Retorna timestamp atual no formato PostgreSQL
 */
export function nowPostgresTimestamp(): string {
  return toPostgresTimestamp(new Date())!;
}

/**
 * Converte Date para string ou retorna null (alias para compatibilidade)
 */
export function toPostgresTimestampOrNull(
  date: Date | null | undefined
): string | null {
  return toPostgresTimestamp(date);
}

/**
 * Retorna timestamp atual (alias para compatibilidade)
 */
export function now(): string {
  return nowPostgresTimestamp();
}
