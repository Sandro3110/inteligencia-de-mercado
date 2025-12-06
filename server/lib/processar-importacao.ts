/**
 * Processamento de Importação de Entidades
 * Função que REALMENTE insere entidades no banco
 */

import { db } from '../db';
import { dim_entidade, fato_entidade_contexto, dim_importacao } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { validarCNPJ } from '../dal/helpers/validators';
import { buscarGeografiaFuzzy } from '../dal/dimensoes/geografia';
import { createErro, atualizarProgresso, concluirImportacao, falharImportacao } from '../dal/importacao';
import crypto from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

export interface DadosEntidade {
  nome: string;
  tipo_entidade: 'cliente' | 'lead' | 'concorrente';
  cnpj?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  uf?: string;
  endereco?: string;
  website?: string;
  porte?: string;
  setor?: string;
  faturamento_estimado?: number;
  num_funcionarios?: number;
  [key: string]: any;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Criar hash SHA256 de um valor
 */
function criarHash(valor: string | null | undefined): string | null {
  if (!valor || valor.trim() === '') return null;
  return crypto.createHash('sha256').update(valor.trim().toLowerCase()).digest('hex');
}

/**
 * Limpar CNPJ (remover formatação)
 */
function limparCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Calcular score de qualidade baseado em completude
 */
function calcularScoreQualidade(dados: DadosEntidade): number {
  let score = 0;
  const campos = [
    'nome', 'cnpj', 'email', 'telefone', 'cidade', 'uf',
    'endereco', 'website', 'porte', 'setor', 'faturamento_estimado', 'num_funcionarios'
  ];
  
  campos.forEach(campo => {
    if (dados[campo] && dados[campo] !== '') {
      score += (100 / campos.length);
    }
  });
  
  return Math.round(score);
}

/**
 * Listar campos faltantes
 */
function listarCamposFaltantes(dados: DadosEntidade): string[] {
  const campos = [
    'cnpj', 'email', 'telefone', 'cidade', 'uf',
    'endereco', 'website', 'porte', 'setor', 'faturamento_estimado', 'num_funcionarios'
  ];
  
  return campos.filter(campo => !dados[campo] || dados[campo] === '');
}

// ============================================================================
// PROCESSAMENTO
// ============================================================================

/**
 * Processar uma linha de importação e inserir entidade
 */
export async function processarLinhaImportacao(
  dados: DadosEntidade,
  importacaoId: number,
  userId: number,
  linhaNumero: number
): Promise<{ sucesso: boolean; entidadeId?: number; erro?: string }> {
  try {
    // 1. Validar CNPJ se fornecido
    let cnpjLimpo: string | null = null;
    if (dados.cnpj) {
      cnpjLimpo = limparCNPJ(dados.cnpj);
      if (!validarCNPJ(cnpjLimpo)) {
        throw new Error('CNPJ inválido');
      }
      
      // Verificar duplicata
      const existente = await db.query.dim_entidade.findFirst({
        where: eq(dim_entidade.cnpj, cnpjLimpo)
      });
      
      if (existente) {
        throw new Error('CNPJ já existe no banco de dados');
      }
    }

    // 2. Buscar geografia (fuzzy match)
    let geografiaId: number | null = null;
    if (dados.cidade && dados.uf) {
      const resultado = await buscarGeografiaFuzzy(dados.cidade, dados.uf, 0.8);
      if (resultado) {
        geografiaId = resultado.geografia.id;
      }
    }

    // 3. Criar hashes de segurança
    const cnpjHash = criarHash(cnpjLimpo);
    const cpfHash = criarHash(dados.cpf);
    const emailHash = criarHash(dados.email);
    const telefoneHash = criarHash(dados.telefone);

    // 4. Calcular score de qualidade
    const scoreQualidadeDados = calcularScoreQualidade(dados);
    const camposFaltantes = listarCamposFaltantes(dados);

    // 5. Inserir entidade
    const [entidade] = await db
      .insert(dim_entidade)
      .values({
        // Dados básicos
        nome: dados.nome,
        tipo_entidade: dados.tipo_entidade,
        cnpj: cnpjLimpo,
        cpf: dados.cpf || null,
        email: dados.email || null,
        telefone: dados.telefone || null,
        
        // Geografia
        cidade: dados.cidade || null,
        uf: dados.uf || null,
        endereco: dados.endereco || null,
        
        // Dados complementares
        website: dados.website || null,
        porte: dados.porte || null,
        setor: dados.setor || null,
        faturamento_estimado: dados.faturamento_estimado || null,
        num_funcionarios: dados.num_funcionarios || null,
        
        // Hashes de segurança
        cnpj_hash: cnpjHash,
        cpf_hash: cpfHash,
        email_hash: emailHash,
        telefone_hash: telefoneHash,
        
        // Qualidade
        score_qualidade_dados: scoreQualidadeDados,
        campos_faltantes: camposFaltantes.length > 0 ? camposFaltantes.join(',') : null,
        
        // Origem
        origem: 'importacao',
        importacao_id: importacaoId,
        origem_usuario_id: userId,
        
        // Enriquecimento (inicialmente false)
        enriquecido: false,
        enriquecido_em: null,
        enriquecido_por: null,
        
        // Auditoria
        created_at: new Date(),
        created_by: userId,
        updated_at: new Date(),
        updated_by: null,
        deleted_at: null,
        deleted_by: null,
      })
      .returning();

    return { sucesso: true, entidadeId: entidade.id };
    
  } catch (error: any) {
    // Registrar erro
    await createErro({
      importacaoId,
      linhaNumero,
      linhaDados: dados,
      tipoErro: error.message.includes('CNPJ') ? 'duplicata' : 'validacao',
      mensagemErro: error.message,
    });
    
    return { sucesso: false, erro: error.message };
  }
}

/**
 * Processar importação completa
 */
export async function processarImportacaoCompleta(
  importacaoId: number,
  linhas: DadosEntidade[],
  userId: number
): Promise<{ sucesso: number; erro: number; duplicadas: number }> {
  let sucesso = 0;
  let erro = 0;
  let duplicadas = 0;

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const resultado = await processarLinhaImportacao(linha, importacaoId, userId, i + 1);
    
    if (resultado.sucesso) {
      sucesso++;
    } else {
      if (resultado.erro?.includes('já existe')) {
        duplicadas++;
      } else {
        erro++;
      }
    }
    
    // Atualizar progresso a cada 10 linhas
    if ((i + 1) % 10 === 0 || i === linhas.length - 1) {
      await atualizarProgresso(
        importacaoId,
        i + 1,
        sucesso,
        erro,
        duplicadas
      );
    }
  }

  // Concluir importação
  await concluirImportacao(importacaoId, userId.toString());

  return { sucesso, erro, duplicadas };
}
