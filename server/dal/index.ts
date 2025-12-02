/**
 * Data Access Layer (DAL) - IntelMarket v3.0
 * 
 * Camada de acesso a dados com validações, business logic e helpers
 * 
 * @module server/dal
 */

// ============================================================================
// DIMENSÕES
// ============================================================================

export * as Projeto from './dimensoes/projeto';
export * as Pesquisa from './dimensoes/pesquisa';
export * as Entidade from './dimensoes/entidade';
export * as Geografia from './dimensoes/geografia';
export * as Mercado from './dimensoes/mercado';
export * as Produto from './dimensoes/produto';
export * as StatusQualificacao from './dimensoes/statusQualificacao';

// ============================================================================
// FATOS
// ============================================================================

export * as EntidadeContexto from './fatos/entidadeContexto';
export * as EntidadeProduto from './fatos/entidadeProduto';
export * as EntidadeCompetidor from './fatos/entidadeCompetidor';

// ============================================================================
// HELPERS
// ============================================================================

export * as Helpers from './helpers';

// ============================================================================
// EXEMPLOS DE USO
// ============================================================================

/**
 * @example
 * // Importar DAL
 * import * as DAL from '@/server/dal';
 * 
 * // Criar projeto
 * const projeto = await DAL.Projeto.createProjeto({
 *   nome: 'Meu Projeto',
 *   ownerId: 1,
 *   createdBy: 'user-123',
 * });
 * 
 * // Buscar projetos ativos
 * const { data: projetos } = await DAL.Projeto.getProjetosAtivos(1);
 * 
 * // Criar entidade com validação de CNPJ
 * const entidade = await DAL.Entidade.createEntidade({
 *   tipoEntidade: 'cliente',
 *   nome: 'Empresa XYZ',
 *   cnpj: '12.345.678/0001-90',
 *   origemTipo: 'manual',
 *   createdBy: 'user-123',
 * });
 * 
 * // Buscar ou criar mercado (upsert)
 * const { mercado, criado } = await DAL.Mercado.buscarOuCriarMercado({
 *   nome: 'Tecnologia',
 *   categoria: 'Software',
 * });
 * 
 * // Criar contexto completo
 * const contexto = await DAL.EntidadeContexto.createContexto({
 *   entidadeId: entidade.id,
 *   projetoId: projeto.id,
 *   pesquisaId: 1,
 *   mercadoId: mercado.id,
 *   createdBy: 'user-123',
 * });
 * 
 * // Buscar contexto completo com JOINs
 * const contextoCompleto = await DAL.EntidadeContexto.getContextoCompleto(contexto.id);
 * 
 * // Calcular similaridade entre entidades
 * const similaridade = DAL.Helpers.calcularSimilaridadeEntidades(
 *   entidade1,
 *   entidade2
 * );
 * 
 * // Validar CNPJ
 * const cnpjValido = DAL.Helpers.validarCNPJ('12.345.678/0001-90');
 */
