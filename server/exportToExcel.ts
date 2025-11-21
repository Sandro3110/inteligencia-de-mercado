import * as XLSX from 'xlsx';
import { getDb } from './db';
import { mercadosUnicos, leads } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Exporta mercados para Excel
 */
export async function exportMercadosToExcel(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const mercados = await db
    .select()
    .from(mercadosUnicos)
    .where(eq(mercadosUnicos.projectId, projectId));
  
  // Formatar dados para Excel
  const data = mercados.map(m => ({
    'ID': m.id,
    'Nome': m.nome,
    'Segmentação': m.segmentacao || '',
    'Categoria': m.categoria || '',
    'Tamanho do Mercado': m.tamanhoMercado || '',
    'Crescimento Anual': m.crescimentoAnual || '',
    'Tendências': m.tendencias || '',
    'Principais Players': m.principaisPlayers || '',
    'Quantidade de Clientes': m.quantidadeClientes || 0,
    'Criado em': m.createdAt ? new Date(m.createdAt).toLocaleDateString('pt-BR') : '',
  }));
  
  // Criar workbook e worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Ajustar largura das colunas
  const colWidths = [
    { wch: 8 },  // ID
    { wch: 40 }, // Nome
    { wch: 30 }, // Segmento
    { wch: 20 }, // Quantidade
    { wch: 20 }, // Status
    { wch: 15 }, // Criado em
    { wch: 15 }, // Atualizado em
  ];
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Mercados');
  
  // Gerar buffer
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

/**
 * Exporta leads para Excel
 */
export async function exportLeadsToExcel(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const leadsData = await db
    .select()
    .from(leads)
    .where(eq(leads.projectId, projectId));
  
  // Formatar dados para Excel
  const data = leadsData.map(l => ({
    'ID': l.id,
    'Nome': l.nome || '',
    'CNPJ': l.cnpj || '',
    'Site': l.site || '',
    'Email': l.email || '',
    'Telefone': l.telefone || '',
    'Tipo': l.tipo || '',
    'Porte': l.porte || '',
    'Região': l.regiao || '',
    'Setor': l.setor || '',
    'Mercado ID': l.mercadoId,
    'Score de Qualidade': l.qualidadeScore || 0,
    'Classificação': l.qualidadeClassificacao || '',
    'Estágio': l.stage || 'novo',
    'Status de Validação': l.validationStatus || 'pending',
    'Criado em': l.createdAt ? new Date(l.createdAt).toLocaleDateString('pt-BR') : '',
  }));
  
  // Criar workbook e worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Ajustar largura das colunas
  const colWidths = [
    { wch: 8 },  // ID
    { wch: 30 }, // Nome
    { wch: 30 }, // Empresa
    { wch: 25 }, // Cargo
    { wch: 30 }, // Email
    { wch: 18 }, // Telefone
    { wch: 35 }, // LinkedIn
    { wch: 10 }, // Mercado ID
    { wch: 15 }, // Score
    { wch: 40 }, // Motivo
    { wch: 20 }, // Status
    { wch: 15 }, // Criado em
    { wch: 15 }, // Atualizado em
  ];
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');
  
  // Gerar buffer
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}
