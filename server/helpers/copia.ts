/**
 * Helpers de Cópia
 * Formatos: Texto, Markdown, JSON, CSV
 * 100% Funcional
 */

import { formatarMoeda, formatarData, formatarPercentual, formatarNumero } from '../../shared/helpers/formatacao';
import type { CopiaInput, CopiaOutput } from '../../shared/types/dimensional';

// ============================================================================
// TEXTO SIMPLES
// ============================================================================

export function copiarTexto(dados: any): string {
  if (typeof dados === 'string') {
    return dados;
  }
  
  if (typeof dados === 'number') {
    return dados.toString();
  }
  
  if (typeof dados === 'boolean') {
    return dados ? 'Sim' : 'Não';
  }
  
  if (dados === null || dados === undefined) {
    return 'N/A';
  }
  
  if (Array.isArray(dados)) {
    return dados.map((item, index) => {
      if (typeof item === 'object') {
        return `${index + 1}. ${Object.values(item).join(' - ')}`;
      }
      return `${index + 1}. ${item}`;
    }).join('\n');
  }
  
  if (typeof dados === 'object') {
    return Object.entries(dados)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }
  
  return String(dados);
}

// ============================================================================
// MARKDOWN
// ============================================================================

export function copiarMarkdown(dados: any): string {
  if (typeof dados === 'string' || typeof dados === 'number' || typeof dados === 'boolean') {
    return String(dados);
  }
  
  if (dados === null || dados === undefined) {
    return 'N/A';
  }
  
  if (Array.isArray(dados)) {
    // Se é array de objetos, criar tabela
    if (dados.length > 0 && typeof dados[0] === 'object') {
      const keys = Object.keys(dados[0]);
      
      let md = `| ${keys.join(' | ')} |\n`;
      md += `| ${keys.map(() => '---').join(' | ')} |\n`;
      
      dados.forEach(item => {
        const valores = keys.map(key => item[key] || 'N/A');
        md += `| ${valores.join(' | ')} |\n`;
      });
      
      return md;
    }
    
    // Se é array simples, criar lista
    return dados.map(item => `- ${item}`).join('\n');
  }
  
  if (typeof dados === 'object') {
    // Criar lista de definições
    return Object.entries(dados)
      .map(([key, value]) => `**${key}:** ${value}`)
      .join('\n\n');
  }
  
  return String(dados);
}

// ============================================================================
// JSON
// ============================================================================

export function copiarJSON(dados: any): string {
  return JSON.stringify(dados, null, 2);
}

// ============================================================================
// CSV
// ============================================================================

export function copiarCSV(dados: any): string {
  if (!Array.isArray(dados)) {
    // Converter objeto único em array
    dados = [dados];
  }
  
  if (dados.length === 0) {
    return '';
  }
  
  // Se é array de objetos
  if (typeof dados[0] === 'object') {
    const keys = Object.keys(dados[0]);
    
    // Cabeçalho
    const linhas: string[] = [];
    linhas.push(keys.map(k => `"${k}"`).join(';'));
    
    // Dados
    dados.forEach(item => {
      const valores = keys.map(key => {
        const valor = item[key];
        
        if (valor === null || valor === undefined) {
          return '""';
        }
        
        return `"${String(valor).replace(/"/g, '""')}"`;
      });
      
      linhas.push(valores.join(';'));
    });
    
    // Adicionar BOM para Excel
    return '\uFEFF' + linhas.join('\n');
  }
  
  // Se é array simples
  return '\uFEFF' + dados.map(item => `"${item}"`).join('\n');
}

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

export function copiar(input: CopiaInput): CopiaOutput {
  let conteudo: string;
  
  switch (input.formato) {
    case 'texto':
      conteudo = copiarTexto(input.dados);
      break;
    case 'markdown':
      conteudo = copiarMarkdown(input.dados);
      break;
    case 'json':
      conteudo = copiarJSON(input.dados);
      break;
    case 'csv':
      conteudo = copiarCSV(input.dados);
      break;
    default:
      throw new Error(`Formato não suportado: ${input.formato}`);
  }
  
  return {
    conteudo,
    formato: input.formato
  };
}

// ============================================================================
// HELPERS ESPECÍFICOS
// ============================================================================

/**
 * Copia um KPI formatado
 */
export function copiarKPI(nome: string, valor: number | string, formato: 'numero' | 'moeda' | 'percentual' | 'texto'): string {
  let valorFormatado: string;
  
  switch (formato) {
    case 'moeda':
      valorFormatado = typeof valor === 'number' ? formatarMoeda(valor) : valor;
      break;
    case 'numero':
      valorFormatado = typeof valor === 'number' ? formatarNumero(valor) : valor;
      break;
    case 'percentual':
      valorFormatado = typeof valor === 'number' ? formatarPercentual(valor) : valor;
      break;
    default:
      valorFormatado = String(valor);
  }
  
  return `${nome}: ${valorFormatado}`;
}

/**
 * Copia uma entidade formatada
 */
export function copiarEntidade(entidade: any): string {
  const linhas: string[] = [];
  
  linhas.push(`🏢 ${entidade.nome || 'N/A'}`);
  
  if (entidade.cnpj) {
    linhas.push(`CNPJ: ${entidade.cnpj}`);
  }
  
  if (entidade.cidade && entidade.estado) {
    linhas.push(`📍 ${entidade.cidade}, ${entidade.estado}`);
  }
  
  if (entidade.receitaPotencial) {
    linhas.push(`💰 ${formatarMoeda(entidade.receitaPotencial)}/ano`);
  }
  
  if (entidade.scoreFit) {
    linhas.push(`🎯 Score: ${entidade.scoreFit}/100`);
  }
  
  if (entidade.segmento) {
    linhas.push(`📊 Segmento: ${entidade.segmento}`);
  }
  
  if (entidade.recomendacoes) {
    linhas.push(`\n💡 ${entidade.recomendacoes}`);
  }
  
  return linhas.join('\n');
}

/**
 * Copia uma lista de entidades formatada
 */
export function copiarListaEntidades(entidades: any[]): string {
  return entidades.map((entidade, index) => {
    return `${index + 1}. ${entidade.nome} - ${formatarMoeda(entidade.receitaPotencial || 0)} - Score: ${entidade.scoreFit || 0}/100`;
  }).join('\n');
}

/**
 * Copia um resumo formatado
 */
export function copiarResumo(dados: {
  total: number;
  receita: number;
  scoreMedia: number;
  breakdown?: Record<string, number>;
}): string {
  const linhas: string[] = [];
  
  linhas.push('📊 RESUMO');
  linhas.push('');
  linhas.push(`Total de entidades: ${formatarNumero(dados.total)}`);
  linhas.push(`Receita potencial: ${formatarMoeda(dados.receita)}`);
  linhas.push(`Score médio: ${dados.scoreMedia.toFixed(1)}/100`);
  
  if (dados.breakdown) {
    linhas.push('');
    linhas.push('Breakdown:');
    Object.entries(dados.breakdown).forEach(([key, value]) => {
      linhas.push(`  • ${key}: ${formatarNumero(value)}`);
    });
  }
  
  return linhas.join('\n');
}
