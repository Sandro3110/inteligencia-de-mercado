/**
 * Converte Date para string no formato MySQL timestamp
 * Necessário porque o schema usa timestamp({ mode: 'string' })
 */
export function toMySQLTimestamp(
  date: Date | string | null | undefined
): string | null {
  if (!date) {
    return null;
  }

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return null;
  }

  // Formato: YYYY-MM-DD HH:MM:SS
  return d.toISOString().slice(0, 19).replace("T", " ");
}

/**
 * Converte string MySQL timestamp para Date
 */
export function fromMySQLTimestamp(
  timestamp: string | null | undefined
): Date | null {
  if (!timestamp) {
    return null;
  }

  const d = new Date(timestamp);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Retorna timestamp atual no formato MySQL
 */
export function nowMySQLTimestamp(): string {
  return toMySQLTimestamp(new Date())!;
}

/**
 * Converte Date para string ou retorna null (alias para compatibilidade)
 */
export function toMySQLTimestampOrNull(
  date: Date | null | undefined
): string | null {
  return toMySQLTimestamp(date);
}

/**
 * Retorna timestamp atual (alias para compatibilidade)
 */
export function now(): string {
  return nowMySQLTimestamp();
}
