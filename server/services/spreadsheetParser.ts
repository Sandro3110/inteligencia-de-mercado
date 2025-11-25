/**
 * Parser de planilhas CSV e Excel
 * Fase 39.2 - Upload de Planilha CSV/Excel
 */

import * as XLSX from 'xlsx'; // TODO: Migrate to exceljs (complex parser)
import { validateMercado, validateCliente, type ValidationResult } from './validationSchemas';

export interface ParsedRow {
  rowNumber: number;
  data: unknown;
  valid: boolean;
  errors?: Array<{ field: string; message: string }>;
}

export interface ParseResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: ParsedRow[];
  columns: string[];
}

// ============================================
// MAPEAMENTO DE COLUNAS
// ============================================

const MERCADO_COLUMN_MAPPING: Record<string, string> = {
  // Variações de "nome"
  nome: 'nome',
  name: 'nome',
  mercado: 'nome',
  market: 'nome',

  // Variações de "descrição"
  descricao: 'descricao',
  descrição: 'descricao',
  description: 'descricao',
  desc: 'descricao',

  // Variações de "segmentação"
  segmentacao: 'segmentacao',
  segmentação: 'segmentacao',
  segmentation: 'segmentacao',
  tipo: 'segmentacao',
  type: 'segmentacao',

  // Variações de "categoria"
  categoria: 'categoria',
  category: 'categoria',
  cat: 'categoria',

  // Variações de "tamanho"
  tamanho: 'tamanhoEstimado',
  'tamanho estimado': 'tamanhoEstimado',
  size: 'tamanhoEstimado',

  // Variações de "tendência"
  tendencia: 'tendenciaCrescimento',
  tendência: 'tendenciaCrescimento',
  trend: 'tendenciaCrescimento',
  crescimento: 'tendenciaCrescimento',
};

const CLIENTE_COLUMN_MAPPING: Record<string, string> = {
  // Nome
  nome: 'nome',
  name: 'nome',
  cliente: 'nome',
  company: 'nome',
  empresa: 'nome',

  // Razão Social
  'razao social': 'razaoSocial',
  'razão social': 'razaoSocial',
  razaosocial: 'razaoSocial',
  'legal name': 'razaoSocial',

  // CNPJ
  cnpj: 'cnpj',
  'cpf/cnpj': 'cnpj',
  'tax id': 'cnpj',

  // Site
  site: 'site',
  website: 'site',
  url: 'site',
  web: 'site',

  // Email
  email: 'email',
  'e-mail': 'email',
  mail: 'email',

  // Telefone
  telefone: 'telefone',
  phone: 'telefone',
  tel: 'telefone',
  fone: 'telefone',

  // Endereço
  endereco: 'endereco',
  endereço: 'endereco',
  address: 'endereco',
  rua: 'endereco',

  // Cidade
  cidade: 'cidade',
  city: 'cidade',

  // Estado
  estado: 'estado',
  uf: 'estado',
  state: 'estado',

  // CEP
  cep: 'cep',
  zip: 'cep',
  'postal code': 'cep',

  // Porte
  porte: 'porte',
  size: 'porte',
  tamanho: 'porte',

  // Setor
  setor: 'setor',
  sector: 'setor',
  industry: 'setor',
  ramo: 'setor',

  // Descrição
  descricao: 'descricao',
  descrição: 'descricao',
  description: 'descricao',
};

// ============================================
// FUNÇÕES DE PARSING
// ============================================

function normalizeColumnName(col: string): string {
  return col.toLowerCase().trim();
}

function mapColumns(headers: string[], mapping: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};

  headers.forEach((header, index) => {
    const normalized = normalizeColumnName(header);
    const mapped = mapping[normalized];

    if (mapped) {
      result[index.toString()] = mapped;
    }
  });

  return result;
}

function parseRow(row: unknown[], columnMap: Record<string, string>): Record<string, unknown> {
  const parsed: unknown = {};

  Object.entries(columnMap).forEach(([index, fieldName]) => {
    const value = row[parseInt(index)];
    if (value !== undefined && value !== null && value !== '') {
      // @ts-ignore - TODO: Fix TypeScript error
      parsed[fieldName] = String(value).trim();
    }
  });

  // @ts-ignore - TODO: Fix TypeScript error
  return parsed;
}

// ============================================
// PARSER CSV
// ============================================

export function parseCSV(csvContent: string, type: 'mercado' | 'cliente'): ParseResult {
  try {
    // Parse CSV usando xlsx
    const workbook = XLSX.read(csvContent, { type: 'string' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length === 0) {
      return {
        success: false,
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        rows: [],
        columns: [],
      };
    }

    // Primeira linha = cabeçalhos
    const headers = data[0].map((h) => String(h));
    const mapping = type === 'mercado' ? MERCADO_COLUMN_MAPPING : CLIENTE_COLUMN_MAPPING;
    const columnMap = mapColumns(headers, mapping);

    // Parse e valida cada linha
    const rows: ParsedRow[] = [];
    let validCount = 0;
    let invalidCount = 0;

    for (let i = 1; i < data.length; i++) {
      const rowData = parseRow(data[i], columnMap);

      // Validar
      let validation: ValidationResult<any>;
      if (type === 'mercado') {
        validation = validateMercado(rowData);
      } else {
        validation = validateCliente(rowData);
      }

      if (validation.success) {
        validCount++;
        rows.push({
          rowNumber: i + 1,
          data: validation.data,
          valid: true,
        });
      } else {
        invalidCount++;
        rows.push({
          rowNumber: i + 1,
          data: rowData,
          valid: false,
          errors: validation.errors,
        });
      }
    }

    return {
      success: true,
      totalRows: data.length - 1,
      validRows: validCount,
      invalidRows: invalidCount,
      rows,
      columns: headers,
    };
  } catch (error: unknown) {
    console.error('[SpreadsheetParser] CSV parse error:', error);
    return {
      success: false,
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      rows: [],
      columns: [],
    };
  }
}

// ============================================
// PARSER EXCEL
// ============================================

export function parseExcel(
  buffer: Buffer,
  type: 'mercado' | 'cliente',
  sheetIndex: number = 0
): ParseResult {
  try {
    // Parse Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[sheetIndex];

    if (!sheetName) {
      return {
        success: false,
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        rows: [],
        columns: [],
      };
    }

    const worksheet = workbook.Sheets[sheetName];
    const data: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length === 0) {
      return {
        success: false,
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        rows: [],
        columns: [],
      };
    }

    // Primeira linha = cabeçalhos
    const headers = data[0].map((h) => String(h));
    const mapping = type === 'mercado' ? MERCADO_COLUMN_MAPPING : CLIENTE_COLUMN_MAPPING;
    const columnMap = mapColumns(headers, mapping);

    // Parse e valida cada linha
    const rows: ParsedRow[] = [];
    let validCount = 0;
    let invalidCount = 0;

    for (let i = 1; i < data.length; i++) {
      const rowData = parseRow(data[i], columnMap);

      // Validar
      let validation: ValidationResult<any>;
      if (type === 'mercado') {
        validation = validateMercado(rowData);
      } else {
        validation = validateCliente(rowData);
      }

      if (validation.success) {
        validCount++;
        rows.push({
          rowNumber: i + 1,
          data: validation.data,
          valid: true,
        });
      } else {
        invalidCount++;
        rows.push({
          rowNumber: i + 1,
          data: rowData,
          valid: false,
          errors: validation.errors,
        });
      }
    }

    return {
      success: true,
      totalRows: data.length - 1,
      validRows: validCount,
      invalidRows: invalidCount,
      rows,
      columns: headers,
    };
  } catch (error: unknown) {
    console.error('[SpreadsheetParser] Excel parse error:', error);
    return {
      success: false,
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      rows: [],
      columns: [],
    };
  }
}

// ============================================
// HELPER: GERAR TEMPLATE
// ============================================

export function generateTemplate(type: 'mercado' | 'cliente'): Buffer {
  const headers =
    type === 'mercado'
      ? ['Nome', 'Descrição', 'Segmentação', 'Categoria', 'Tamanho Estimado', 'Tendência']
      : [
          'Nome',
          'Razão Social',
          'CNPJ',
          'Site',
          'Email',
          'Telefone',
          'Endereço',
          'Cidade',
          'Estado',
          'CEP',
          'Porte',
          'Setor',
          'Descrição',
        ];

  const exampleRow =
    type === 'mercado'
      ? [
          'Embalagens Plásticas para Indústria Alimentícia',
          'Indústrias que precisam de embalagens',
          'B2B',
          'Embalagens',
          'R$ 2B/ano',
          'Crescimento 5% a.a.',
        ]
      : [
          'Empresa Exemplo Ltda',
          'Empresa Exemplo Indústria e Comércio Ltda',
          '12345678000190',
          'https://exemplo.com.br',
          'contato@exemplo.com.br',
          '11987654321',
          'Rua Exemplo, 123',
          'São Paulo',
          'SP',
          '01234567',
          'Médio',
          'Indústria',
          'Empresa de exemplo',
        ];

  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, type === 'mercado' ? 'Mercados' : 'Clientes');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
