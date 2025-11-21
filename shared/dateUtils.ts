/**
 * Utilitários centralizados para conversão e manipulação de datas
 *
 * Este módulo fornece funções consistentes para trabalhar com datas
 * no formato MySQL (string) e objetos Date do JavaScript.
 */

/**
 * Converte um objeto Date para string no formato MySQL (YYYY-MM-DD HH:MM:SS)
 *
 * @param date - Objeto Date a ser convertido
 * @returns String no formato MySQL ou null se a data for inválida
 *
 * @example
 * ```ts
 * const now = new Date();
 * const mysqlDate = dateToMySQLString(now);
 * // => "2025-11-21 15:30:45"
 * ```
 */
export function dateToMySQLString(
  date: Date | null | undefined
): string | null {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 19).replace("T", " ");
}

/**
 * Converte uma string MySQL para objeto Date
 *
 * @param mysqlDate - String no formato MySQL (YYYY-MM-DD HH:MM:SS)
 * @returns Objeto Date ou null se a string for inválida
 *
 * @example
 * ```ts
 * const date = mysqlStringToDate("2025-11-21 15:30:45");
 * // => Date object
 * ```
 */
export function mysqlStringToDate(
  mysqlDate: string | null | undefined
): Date | null {
  if (!mysqlDate || typeof mysqlDate !== "string") {
    return null;
  }

  const date = new Date(mysqlDate.replace(" ", "T") + "Z");
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Retorna a data/hora atual no formato MySQL
 *
 * @returns String no formato MySQL representando o momento atual
 *
 * @example
 * ```ts
 * const now = getCurrentMySQLTimestamp();
 * // => "2025-11-21 15:30:45"
 * ```
 */
export function getCurrentMySQLTimestamp(): string {
  return dateToMySQLString(new Date())!;
}

/**
 * Formata uma data para exibição amigável ao usuário
 *
 * @param date - Data a ser formatada (Date ou string MySQL)
 * @param locale - Locale para formatação (padrão: 'pt-BR')
 * @returns String formatada ou null se a data for inválida
 *
 * @example
 * ```ts
 * const formatted = formatDateForDisplay(new Date());
 * // => "21/11/2025 15:30"
 * ```
 */
export function formatDateForDisplay(
  date: Date | string | null | undefined,
  locale = "pt-BR"
): string | null {
  if (!date) {
    return null;
  }

  const dateObj = typeof date === "string" ? mysqlStringToDate(date) : date;
  if (!dateObj) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

/**
 * Calcula a diferença em dias entre duas datas
 *
 * @param date1 - Primeira data
 * @param date2 - Segunda data (padrão: agora)
 * @returns Número de dias de diferença (positivo se date1 > date2)
 *
 * @example
 * ```ts
 * const daysSince = getDaysDifference(oldDate);
 * // => 30 (se oldDate foi há 30 dias)
 * ```
 */
export function getDaysDifference(
  date1: Date | string,
  date2: Date | string = new Date()
): number {
  const d1 = typeof date1 === "string" ? mysqlStringToDate(date1) : date1;
  const d2 = typeof date2 === "string" ? mysqlStringToDate(date2) : date2;

  if (!d1 || !d2) {
    return 0;
  }

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Adiciona dias a uma data
 *
 * @param date - Data base
 * @param days - Número de dias a adicionar (pode ser negativo)
 * @returns Nova data ou null se a data base for inválida
 *
 * @example
 * ```ts
 * const futureDate = addDays(new Date(), 7);
 * // => Date 7 dias no futuro
 * ```
 */
export function addDays(date: Date | string, days: number): Date | null {
  const baseDate = typeof date === "string" ? mysqlStringToDate(date) : date;
  if (!baseDate || isNaN(baseDate.getTime())) {
    return null;
  }

  const result = new Date(baseDate);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Verifica se uma data está dentro de um período de dias
 *
 * @param date - Data a verificar
 * @param days - Número de dias do período
 * @param reference - Data de referência (padrão: agora)
 * @returns true se a data está dentro do período
 *
 * @example
 * ```ts
 * const isRecent = isWithinDays(someDate, 30);
 * // => true se someDate foi nos últimos 30 dias
 * ```
 */
export function isWithinDays(
  date: Date | string,
  days: number,
  reference: Date | string = new Date()
): boolean {
  const diff = getDaysDifference(date, reference);
  return diff <= days;
}
