import * as XLSX from 'xlsx';

export interface ExportData {
  headers: string[];
  rows: any[][];
  sheetName: string;
}

/**
 * Exporta dados para Excel (.xlsx)
 */
export function exportToExcel(data: ExportData | ExportData[], filename: string = 'export') {
  const wb = XLSX.utils.book_new();
  
  const datasets = Array.isArray(data) ? data : [data];
  
  datasets.forEach((dataset) => {
    const ws = XLSX.utils.aoa_to_sheet([dataset.headers, ...dataset.rows]);
    
    // Auto-ajustar largura das colunas
    const colWidths = dataset.headers.map((header, i) => {
      const maxLength = Math.max(
        header.length,
        ...dataset.rows.map(row => String(row[i] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, dataset.sheetName);
  });
  
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
}

/**
 * Exporta dados para CSV
 */
export function exportToCSV(data: ExportData, filename: string = 'export') {
  const csv = [
    data.headers.join(';'),
    ...data.rows.map(row => row.map(cell => `"${cell || ''}"`).join(';'))
  ].join('\n');
  
  const bom = '\uFEFF'; // UTF-8 BOM para compatibilidade com Excel
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copia dados para clipboard (formato Markdown)
 */
export async function copyToClipboard(data: ExportData): Promise<boolean> {
  const markdown = [
    `| ${data.headers.join(' | ')} |`,
    `| ${data.headers.map(() => '---').join(' | ')} |`,
    ...data.rows.map(row => `| ${row.join(' | ')} |`)
  ].join('\n');
  
  try {
    await navigator.clipboard.writeText(markdown);
    return true;
  } catch (err) {
    console.error('Erro ao copiar:', err);
    return false;
  }
}

/**
 * Gera mensagem formatada para WhatsApp/Telegram
 */
export function generateShareMessage(title: string, data: Record<string, any>): string {
  const lines = [
    `📊 *${title}*`,
    `Data: ${new Date().toLocaleDateString('pt-BR')}`,
    '',
  ];
  
  Object.entries(data).forEach(([key, value]) => {
    lines.push(`${key}: ${value}`);
  });
  
  lines.push('', '_Gerado por Intelmarket_');
  
  return lines.join('\n');
}

/**
 * Abre WhatsApp Web com mensagem pré-preenchida
 */
export function shareToWhatsApp(message: string) {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}

/**
 * Abre Telegram com mensagem pré-preenchida
 */
export function shareToTelegram(message: string) {
  const encoded = encodeURIComponent(message);
  window.open(`https://t.me/share/url?text=${encoded}`, '_blank');
}
