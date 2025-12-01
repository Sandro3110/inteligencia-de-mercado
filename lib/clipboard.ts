/**
 * Utilitário para copiar dados de tabelas para clipboard
 * Formato TSV (Tab-Separated Values) compatível com Excel, Google Sheets, etc.
 */

export interface ClipboardColumn {
  key: string;
  label: string;
}

/**
 * Copia dados de tabela para clipboard em formato TSV
 *
 * @param data - Array de objetos com os dados
 * @param columns - Definição das colunas (key e label)
 * @returns Promise que resolve quando dados forem copiados
 */
export async function copyTableToClipboard(
  data: Record<string, any>[],
  columns: ClipboardColumn[]
): Promise<void> {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API não disponível neste navegador');
  }

  if (data.length === 0) {
    throw new Error('Nenhum dado para copiar');
  }

  // Criar cabeçalho
  const header = columns.map((col) => col.label).join('\t');

  // Criar linhas
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];

        // Tratar valores nulos/undefined
        if (value === null || value === undefined) {
          return '';
        }

        // Tratar números
        if (typeof value === 'number') {
          return value.toString();
        }

        // Tratar booleanos
        if (typeof value === 'boolean') {
          return value ? 'Sim' : 'Não';
        }

        // Tratar datas
        if (value instanceof Date) {
          return value.toLocaleDateString('pt-BR');
        }

        // Tratar strings (escapar tabs e newlines)
        const stringValue = String(value);
        return stringValue
          .replace(/\t/g, ' ') // Substituir tabs por espaços
          .replace(/\n/g, ' ') // Substituir newlines por espaços
          .replace(/\r/g, ''); // Remover carriage returns
      })
      .join('\t')
  );

  // Combinar tudo
  const tsv = [header, ...rows].join('\n');

  // Copiar para clipboard
  await navigator.clipboard.writeText(tsv);
}

/**
 * Formata número para exibição (separador de milhares)
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR');
}

/**
 * Formata moeda para exibição
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Formata data para exibição
 */
export function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString('pt-BR');
}

/**
 * Formata data e hora para exibição
 */
export function formatDateTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString('pt-BR');
}
