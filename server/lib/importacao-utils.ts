/**
 * Utilitários para importação de entidades
 * Parsers, validators e auto-detecção
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { validarCNPJ } from '../dal/helpers/validators';
import { buscarGeografiaFuzzy } from '../dal/dimensoes/geografia';

// ============================================================================
// TYPES
// ============================================================================

export interface LinhaImportacao {
  numero: number;
  dados: Record<string, any>;
  erros: ErroValidacao[];
  valida: boolean;
}

export interface ErroValidacao {
  campo: string;
  tipo: 'validacao' | 'duplicata' | 'fk' | 'geografia' | 'outro';
  mensagem: string;
  sugestao?: any;
}

export interface MapeamentoColunas {
  nome?: string;
  status?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  uf?: string;
  [key: string]: string | undefined;
}

// ============================================================================
// PARSERS
// ============================================================================

export async function parseCSV(file: File | Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
}

export async function parseExcel(buffer: Buffer): Promise<any[]> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
}

// ============================================================================
// AUTO-DETECÇÃO DE COLUNAS
// ============================================================================

export function autoDetectColumns(headers: string[]): MapeamentoColunas {
  const mapeamento: MapeamentoColunas = {};

  headers.forEach((header) => {
    const normalized = header.toLowerCase().trim();

    // Nome
    if (
      normalized.includes('nome') ||
      normalized.includes('razao') ||
      normalized.includes('empresa')
    ) {
      mapeamento.nome = header;
    }

    // Status
    if (
      normalized.includes('status') ||
      normalized.includes('qualificacao') ||
      normalized.includes('situacao')
    ) {
      mapeamento.status = header;
    }

    // CNPJ
    if (normalized.includes('cnpj')) {
      mapeamento.cnpj = header;
    }

    // Email
    if (normalized.includes('email') || normalized.includes('e-mail')) {
      mapeamento.email = header;
    }

    // Telefone
    if (normalized.includes('telefone') || normalized.includes('fone') || normalized.includes('celular')) {
      mapeamento.telefone = header;
    }

    // Cidade
    if (normalized.includes('cidade') || normalized.includes('municipio')) {
      mapeamento.cidade = header;
    }

    // UF
    if (normalized === 'uf' || normalized === 'estado' || normalized.includes('estado')) {
      mapeamento.uf = header;
    }
  });

  return mapeamento;
}

// ============================================================================
// VALIDADORES
// ============================================================================

export async function validarLinha(
  linha: Record<string, any>,
  mapeamento: MapeamentoColunas,
  cnpjsExistentes: Set<string>
): Promise<ErroValidacao[]> {
  const erros: ErroValidacao[] = [];

  // 1. Nome obrigatório
  const nome = mapeamento.nome ? linha[mapeamento.nome] : null;
  if (!nome || nome.trim() === '') {
    erros.push({
      campo: 'nome',
      tipo: 'validacao',
      mensagem: 'Nome é obrigatório',
    });
  }

  // 2. Status obrigatório
  const status = mapeamento.status ? linha[mapeamento.status] : null;
  if (!status || status.trim() === '') {
    erros.push({
      campo: 'status',
      tipo: 'validacao',
      mensagem: 'Status é obrigatório',
    });
  } else {
    // Validar se status é válido
    const statusValidos = ['ativo', 'inativo', 'prospect'];
    const statusNorm = status.toLowerCase().trim();
    if (!statusValidos.includes(statusNorm)) {
      erros.push({
        campo: 'status',
        tipo: 'validacao',
        mensagem: `Status inválido. Use: ${statusValidos.join(', ')}`,
      });
    }
  }

  // 3. CNPJ (opcional, mas se fornecido deve ser válido)
  const cnpj = mapeamento.cnpj ? linha[mapeamento.cnpj] : null;
  if (cnpj && cnpj.trim() !== '') {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    // Validar formato
    if (!validarCNPJ(cnpjLimpo)) {
      erros.push({
        campo: 'cnpj',
        tipo: 'validacao',
        mensagem: 'CNPJ inválido',
      });
    }
    
    // Verificar duplicata
    if (cnpjsExistentes.has(cnpjLimpo)) {
      erros.push({
        campo: 'cnpj',
        tipo: 'duplicata',
        mensagem: 'CNPJ já existe no banco de dados',
      });
    }
  }

  // 4. Geografia (fuzzy match)
  const cidade = mapeamento.cidade ? linha[mapeamento.cidade] : null;
  const uf = mapeamento.uf ? linha[mapeamento.uf] : null;
  
  if (cidade && uf) {
    const resultado = await buscarGeografiaFuzzy(cidade, uf, 0.8);
    if (!resultado) {
      erros.push({
        campo: 'cidade',
        tipo: 'geografia',
        mensagem: `Cidade "${cidade}" não encontrada em ${uf}`,
      });
    } else if (resultado.similaridade < 1.0) {
      // Fuzzy match encontrado (similaridade entre 0.8 e 1.0)
      erros.push({
        campo: 'cidade',
        tipo: 'geografia',
        mensagem: `Cidade "${cidade}" corrigida para "${resultado.geografia.cidade}"`,
        sugestao: resultado.geografia,
      });
    }
  }

  return erros;
}

// ============================================================================
// MAPEAR STATUS
// ============================================================================

export function mapearStatusQualificacao(statusTexto: string): number {
  const mapa: Record<string, number> = {
    ativo: 1,
    inativo: 2,
    prospect: 3,
  };

  const normalizado = statusTexto.toLowerCase().trim();
  const statusId = mapa[normalizado];

  if (!statusId) {
    throw new Error(`Status "${statusTexto}" não reconhecido`);
  }

  return statusId;
}

// ============================================================================
// PROCESSAR ARQUIVO
// ============================================================================

export async function processarArquivo(
  buffer: Buffer,
  tipoArquivo: 'csv' | 'xlsx',
  mapeamento: MapeamentoColunas,
  cnpjsExistentes: Set<string>
): Promise<LinhaImportacao[]> {
  // 1. Parse
  const dados = tipoArquivo === 'csv' 
    ? await parseCSV(buffer) 
    : await parseExcel(buffer);

  // 2. Validar cada linha
  const linhas: LinhaImportacao[] = [];
  
  for (let i = 0; i < dados.length; i++) {
    const linha = dados[i];
    const erros = await validarLinha(linha, mapeamento, cnpjsExistentes);
    
    linhas.push({
      numero: i + 1,
      dados: linha,
      erros,
      valida: erros.length === 0,
    });
  }

  return linhas;
}

// ============================================================================
// ESTATÍSTICAS
// ============================================================================

export function calcularEstatisticas(linhas: LinhaImportacao[]) {
  const total = linhas.length;
  const validas = linhas.filter((l) => l.valida).length;
  const invalidas = linhas.filter((l) => !l.valida).length;
  
  const errosPorTipo: Record<string, number> = {};
  linhas.forEach((linha) => {
    linha.erros.forEach((erro) => {
      errosPorTipo[erro.tipo] = (errosPorTipo[erro.tipo] || 0) + 1;
    });
  });

  return {
    total,
    validas,
    invalidas,
    taxaSucesso: total > 0 ? Math.floor((validas / total) * 100) : 0,
    errosPorTipo,
  };
}
