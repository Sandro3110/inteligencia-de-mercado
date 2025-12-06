/**
 * Re-export all tables from schema with explicit named exports
 * This ensures proper module resolution in Next.js/Webpack builds
 * 
 * Note: Using explicit exports instead of export * to avoid
 * Webpack module resolution issues in Vercel builds
 */

import 'server-only';

export {
  // Audit tables (2)
  audit_logs,
  data_audit_logs,
  
  // Dimension tables (13)
  dim_canal,
  dim_concorrente,
  dim_entidade,
  dim_geografia,
  dim_importacao,
  dim_lead,
  dim_mercado,
  dim_pesquisa,
  dim_produto,
  dim_produto_catalogo,
  dim_produto_old_backup,
  dim_projeto,
  dim_status_qualificacao,
  dim_tempo,
  
  // Fact tables (3)
  fato_entidade_competidor,
  fato_entidade_contexto,
  fato_entidade_produto,
  
  // IA tables (5)
  ia_alertas,
  ia_cache,
  ia_config,
  ia_config_historico,
  ia_usage,
  
  // System tables (9)
  alertas_seguranca,
  cidades_brasil,
  importacao_erros,
  rate_limits,
  roles,
  system_settings,
  user_profiles,
  users,
  usuarios_bloqueados,
} from './schema';
