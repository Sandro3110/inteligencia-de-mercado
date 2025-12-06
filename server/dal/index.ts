/**
 * Index principal de DALs (Data Access Layer)
 * Exporta todos os 33 DALs do projeto
 * 
 * Estrutura:
 * - Dimensões: 13 DALs
 * - Fatos: 3 DALs
 * - IA: 5 DALs
 * - Sistema: 9 DALs
 * - Audit: 2 DALs
 * - Backup: 1 DAL
 */

// ========== DIMENSÕES (13) ==========
export * as Entidade from './dimensoes/entidade';
export * as Geografia from './dimensoes/geografia';
export * as Mercado from './dimensoes/mercado';
export * as Produto from './dimensoes/produto';
export * as Projeto from './dimensoes/projeto';
export * as Pesquisa from './dimensoes/pesquisa';
export * as Concorrente from './dimensoes/concorrente';
export * as Canal from './dimensoes/canal';
export * as Lead from './dimensoes/lead';
export * as Tempo from './dimensoes/tempo';
export * as Importacao from './dimensoes/importacao';
export * as StatusQualificacao from './dimensoes/status-qualificacao';
export * as ProdutoCatalogo from './dimensoes/produto-catalogo';

// ========== FATOS (3) ==========
export * as entidadeProduto from './fatos/entidade-produto';
export * as entidadeCompetidor from './fatos/entidade-competidor';
export * as entidadeContexto from './fatos/entidade-contexto';

// ========== IA (5) ==========
export * as iaAlertas from './ia/alertas';
export * as iaCache from './ia/cache';
export * as iaConfig from './ia/config';
export * as iaConfigHistorico from './ia/config-historico';
export * as iaUsage from './ia/usage';

// ========== SISTEMA (9) ==========
export * as users from './sistema/users';
export * as userProfiles from './sistema/user-profiles';
export * as roles from './sistema/roles';
export * as systemSettings from './sistema/system-settings';
export * as rateLimits from './sistema/rate-limits';
export * as alertasSeguranca from './sistema/alertas-seguranca';
export * as usuariosBloqueados from './sistema/usuarios-bloqueados';
export * as importacaoErros from './sistema/importacao-erros';
export * as cidadesBrasil from './sistema/cidades-brasil';

// ========== AUDIT (2) ==========
export * as auditLogs from './audit/audit-logs';
export * as dataAuditLogs from './audit/data-audit-logs';

// ========== BACKUP (1) ==========
export * as produtoOldBackup from './backup/produto-old-backup';
