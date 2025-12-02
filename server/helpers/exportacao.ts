/**
 * Helpers de Exportação
 * Formatos: Excel, CSV, JSON, Markdown
 * 100% Funcional
 */

import ExcelJS from 'exceljs';
import { formatarMoeda, formatarData, formatarPercentual } from '../../shared/helpers/formatacao';
import type { ExportacaoInput, ExportacaoOutput } from '../../shared/types/dimensional';

// ============================================================================
// EXCEL FORMATADO
// ============================================================================

export async function exportarExcel(input: ExportacaoInput): Promise<ExportacaoOutput> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Dados');
  
  // Configurar colunas
  if (input.colunas) {
    worksheet.columns = input.colunas.map(col => ({
      header: col.label,
      key: col.campo,
      width: 20
    }));
    
    // Estilo do cabeçalho
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;
    
    // Adicionar dados
    input.dados.forEach((row, index) => {
      const excelRow = worksheet.addRow(row);
      
      // Aplicar formatação por tipo
      input.colunas?.forEach((col, colIndex) => {
        const cell = excelRow.getCell(colIndex + 1);
        
        switch (col.formato) {
          case 'moeda':
            cell.numFmt = 'R$ #,##0.00';
            break;
          case 'numero':
            cell.numFmt = '#,##0';
            break;
          case 'percentual':
            cell.numFmt = '0.0"%"';
            break;
          case 'data':
            cell.numFmt = 'dd/mm/yyyy';
            break;
        }
      });
      
      // Zebrado
      if (index % 2 === 0) {
        excelRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' }
        };
      }
    });
    
    // Adicionar resumo
    if (input.incluirResumo) {
      const resumoRow = worksheet.addRow([]);
      resumoRow.height = 5;
      
      const totalRow = worksheet.addRow(['TOTAL']);
      totalRow.font = { bold: true };
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' }
      };
      
      // Calcular totais
      input.colunas?.forEach((col, colIndex) => {
        if (col.formato === 'moeda' || col.formato === 'numero') {
          const colLetter = String.fromCharCode(65 + colIndex);
          const formula = `SUM(${colLetter}2:${colLetter}${input.dados.length + 1})`;
          totalRow.getCell(colIndex + 1).value = { formula };
          
          if (col.formato === 'moeda') {
            totalRow.getCell(colIndex + 1).numFmt = 'R$ #,##0.00';
          } else {
            totalRow.getCell(colIndex + 1).numFmt = '#,##0';
          }
        }
      });
    }
  }
  
  // Gerar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Salvar arquivo (em produção, usar S3)
  const nome = `${input.titulo || 'exportacao'}_${Date.now()}.xlsx`;
  const caminho = `/tmp/${nome}`;
  
  const fs = await import('fs/promises');
  await fs.writeFile(caminho, buffer);
  
  return {
    url: caminho,
    nome,
    tamanho: buffer.byteLength,
    formato: 'excel'
  };
}

// ============================================================================
// CSV FORMATADO
// ============================================================================

export async function exportarCSV(input: ExportacaoInput): Promise<ExportacaoOutput> {
  // Preparar dados
  const linhas: string[] = [];
  
  // Cabeçalho
  if (input.colunas) {
    linhas.push(input.colunas.map(col => `"${col.label}"`).join(';'));
    
    // Dados
    input.dados.forEach(row => {
      const valores = input.colunas!.map(col => {
        const valor = row[col.campo];
        
        // Formatar valor
        let valorFormatado: string;
        switch (col.formato) {
          case 'moeda':
            valorFormatado = formatarMoeda(valor);
            break;
          case 'numero':
            valorFormatado = valor?.toLocaleString('pt-BR') || '';
            break;
          case 'percentual':
            valorFormatado = formatarPercentual(valor);
            break;
          case 'data':
            valorFormatado = formatarData(valor);
            break;
          default:
            valorFormatado = valor?.toString() || '';
        }
        
        return `"${valorFormatado}"`;
      });
      
      linhas.push(valores.join(';'));
    });
  }
  
  // Adicionar BOM para Excel reconhecer UTF-8
  const bom = '\uFEFF';
  const conteudo = bom + linhas.join('\n');
  
  // Salvar arquivo
  const nome = `${input.titulo || 'exportacao'}_${Date.now()}.csv`;
  const caminho = `/tmp/${nome}`;
  
  const fs = await import('fs/promises');
  await fs.writeFile(caminho, conteudo, 'utf-8');
  
  return {
    url: caminho,
    nome,
    tamanho: Buffer.byteLength(conteudo, 'utf-8'),
    formato: 'csv'
  };
}

// ============================================================================
// JSON
// ============================================================================

export async function exportarJSON(input: ExportacaoInput): Promise<ExportacaoOutput> {
  const json = JSON.stringify(input.dados, null, 2);
  
  // Salvar arquivo
  const nome = `${input.titulo || 'exportacao'}_${Date.now()}.json`;
  const caminho = `/tmp/${nome}`;
  
  const fs = await import('fs/promises');
  await fs.writeFile(caminho, json, 'utf-8');
  
  return {
    url: caminho,
    nome,
    tamanho: Buffer.byteLength(json, 'utf-8'),
    formato: 'json'
  };
}

// ============================================================================
// MARKDOWN
// ============================================================================

export async function exportarMarkdown(input: ExportacaoInput): Promise<ExportacaoOutput> {
  let md = `# ${input.titulo || 'Relatório de Inteligência de Mercado'}\n\n`;
  md += `**Data:** ${formatarData(new Date())}\n\n`;
  
  // Resumo
  if (input.incluirResumo) {
    md += `## Resumo\n\n`;
    md += `- Total de registros: ${input.dados.length}\n`;
    
    // Calcular totais
    input.colunas?.forEach(col => {
      if (col.formato === 'moeda' || col.formato === 'numero') {
        const total = input.dados.reduce((acc, row) => acc + (row[col.campo] || 0), 0);
        
        if (col.formato === 'moeda') {
          md += `- ${col.label}: ${formatarMoeda(total)}\n`;
        } else {
          md += `- ${col.label}: ${total.toLocaleString('pt-BR')}\n`;
        }
      }
    });
    
    md += `\n`;
  }
  
  // Tabela
  md += `## Dados\n\n`;
  
  if (input.colunas) {
    // Cabeçalho
    md += `| ${input.colunas.map(col => col.label).join(' | ')} |\n`;
    md += `| ${input.colunas.map(() => '---').join(' | ')} |\n`;
    
    // Linhas
    input.dados.forEach(row => {
      const valores = input.colunas!.map(col => {
        const valor = row[col.campo];
        
        switch (col.formato) {
          case 'moeda':
            return formatarMoeda(valor);
          case 'numero':
            return valor?.toLocaleString('pt-BR') || 'N/A';
          case 'percentual':
            return formatarPercentual(valor);
          case 'data':
            return formatarData(valor);
          default:
            return valor || 'N/A';
        }
      });
      
      md += `| ${valores.join(' | ')} |\n`;
    });
  }
  
  md += `\n---\n\n`;
  md += `*Gerado em ${formatarData(new Date())} às ${new Date().toLocaleTimeString('pt-BR')}*\n`;
  
  // Salvar arquivo
  const nome = `${input.titulo || 'exportacao'}_${Date.now()}.md`;
  const caminho = `/tmp/${nome}`;
  
  const fs = await import('fs/promises');
  await fs.writeFile(caminho, md, 'utf-8');
  
  return {
    url: caminho,
    nome,
    tamanho: Buffer.byteLength(md, 'utf-8'),
    formato: 'markdown'
  };
}

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

export async function exportar(input: ExportacaoInput): Promise<ExportacaoOutput> {
  switch (input.formato) {
    case 'excel':
      return exportarExcel(input);
    case 'csv':
      return exportarCSV(input);
    case 'json':
      return exportarJSON(input);
    case 'markdown':
      return exportarMarkdown(input);
    default:
      throw new Error(`Formato não suportado: ${input.formato}`);
  }
}
