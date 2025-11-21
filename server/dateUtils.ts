/**
 * Utilitários para conversão de datas para formato MySQL
 *
 * MySQL timestamp espera formato: 'YYYY-MM-DD HH:MM:SS'
 * Drizzle com mode: 'string' espera string, não Date
 */

/**
 * Converte Date para string no formato MySQL timestamp
 * @param date Data a converter (padrão: agora)
 * @returns String no formato 'YYYY-MM-DD HH:MM:SS'
 */
export function toMySQLTimestamp(date: Date = new Date()): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

/**
 * Converte Date para string no formato MySQL timestamp ou retorna null
 * @param date Data a converter ou null/undefined
 * @returns String no formato 'YYYY-MM-DD HH:MM:SS' ou null
 */
export function toMySQLTimestampOrNull(
  date: Date | null | undefined
): string | null {
  if (!date) {
    return null;
  }
  return toMySQLTimestamp(date);
}

/**
 * Retorna timestamp atual no formato MySQL
 * @returns String no formato 'YYYY-MM-DD HH:MM:SS'
 */
export function now(): string {
  return toMySQLTimestamp();
}

/**
 * Converte Date para string no formato de data brasileira (DD/MM/YYYY)
 * @param date Data a converter
 * @returns String no formato 'DD/MM/YYYY'
 */
export function toDateBR(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

/**
 * Converte Date para string no formato de data e hora brasileira (DD/MM/YYYY HH:MM:SS)
 * @param date Data a converter
 * @returns String no formato 'DD/MM/YYYY HH:MM:SS'
 */
export function toDateTimeBR(date: Date): string {
  return date.toLocaleString("pt-BR");
}

/**
 * Converte Date para string no formato ISO de data (YYYY-MM-DD)
 * @param date Data a converter
 * @returns String no formato 'YYYY-MM-DD'
 */
export function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Converte Date para string no formato ISO completo
 * @param date Data a converter
 * @returns String no formato ISO completo
 */
export function toISO(date: Date): string {
  return date.toISOString();
}
