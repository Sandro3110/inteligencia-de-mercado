/**
 * RBAC (Role-Based Access Control)
 * Sistema de controle de acesso baseado em papéis e permissões
 * 
 * FASE 1 - Sessão 1.2
 */

export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ANALYST = 'analyst',
  VIEWER = 'viewer'
}

export enum Permission {
  // Projetos
  PROJETO_CREATE = 'projeto:create',
  PROJETO_READ = 'projeto:read',
  PROJETO_UPDATE = 'projeto:update',
  PROJETO_DELETE = 'projeto:delete',
  
  // Pesquisas
  PESQUISA_CREATE = 'pesquisa:create',
  PESQUISA_READ = 'pesquisa:read',
  PESQUISA_UPDATE = 'pesquisa:update',
  PESQUISA_DELETE = 'pesquisa:delete',
  PESQUISA_START = 'pesquisa:start',
  PESQUISA_STOP = 'pesquisa:stop',
  
  // Importação
  IMPORTACAO_CREATE = 'importacao:create',
  IMPORTACAO_READ = 'importacao:read',
  IMPORTACAO_DELETE = 'importacao:delete',
  
  // Enriquecimento
  ENRIQUECIMENTO_EXECUTE = 'enriquecimento:execute',
  ENRIQUECIMENTO_READ = 'enriquecimento:read',
  
  // Entidades
  ENTIDADE_READ = 'entidade:read',
  ENTIDADE_UPDATE = 'entidade:update',
  ENTIDADE_DELETE = 'entidade:delete',
  ENTIDADE_EXPORT = 'entidade:export',
  
  // Análises
  ANALISE_READ = 'analise:read',
  ANALISE_EXPORT = 'analise:export',
  
  // Administração
  USER_READ = 'user:read',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  ROLE_MANAGE = 'role:manage',
  AUDIT_READ = 'audit:read',
  SETTINGS_MANAGE = 'settings:manage'
}

/**
 * Mapeamento de papéis para permissões
 * Define quais permissões cada papel possui
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  /**
   * ADMIN: Acesso total ao sistema
   * Pode fazer tudo, incluindo gerenciar usuários e configurações
   */
  [Role.ADMIN]: Object.values(Permission),
  
  /**
   * MANAGER: Gerente de projetos
   * Pode criar, editar e deletar projetos, pesquisas e entidades
   * Não pode gerenciar usuários ou acessar auditoria
   */
  [Role.MANAGER]: [
    // Projetos
    Permission.PROJETO_CREATE,
    Permission.PROJETO_READ,
    Permission.PROJETO_UPDATE,
    Permission.PROJETO_DELETE,
    
    // Pesquisas
    Permission.PESQUISA_CREATE,
    Permission.PESQUISA_READ,
    Permission.PESQUISA_UPDATE,
    Permission.PESQUISA_DELETE,
    Permission.PESQUISA_START,
    Permission.PESQUISA_STOP,
    
    // Importação
    Permission.IMPORTACAO_CREATE,
    Permission.IMPORTACAO_READ,
    Permission.IMPORTACAO_DELETE,
    
    // Enriquecimento
    Permission.ENRIQUECIMENTO_EXECUTE,
    Permission.ENRIQUECIMENTO_READ,
    
    // Entidades
    Permission.ENTIDADE_READ,
    Permission.ENTIDADE_UPDATE,
    Permission.ENTIDADE_EXPORT,
    
    // Análises
    Permission.ANALISE_READ,
    Permission.ANALISE_EXPORT,
    
    // Admin limitado
    Permission.USER_READ
  ],
  
  /**
   * ANALYST: Analista de dados
   * Pode visualizar tudo e exportar dados
   * Não pode criar, editar ou deletar
   */
  [Role.ANALYST]: [
    Permission.PROJETO_READ,
    Permission.PESQUISA_READ,
    Permission.IMPORTACAO_READ,
    Permission.ENRIQUECIMENTO_READ,
    Permission.ENTIDADE_READ,
    Permission.ENTIDADE_EXPORT,
    Permission.ANALISE_READ,
    Permission.ANALISE_EXPORT
  ],
  
  /**
   * VIEWER: Visualizador
   * Pode apenas visualizar dados
   * Não pode exportar, criar, editar ou deletar
   */
  [Role.VIEWER]: [
    Permission.PROJETO_READ,
    Permission.PESQUISA_READ,
    Permission.ENTIDADE_READ,
    Permission.ANALISE_READ
  ]
};

/**
 * Descrições amigáveis dos papéis
 */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  [Role.ADMIN]: 'Administrador - Acesso total ao sistema',
  [Role.MANAGER]: 'Gerente - Pode criar e gerenciar projetos e pesquisas',
  [Role.ANALYST]: 'Analista - Pode visualizar e exportar dados',
  [Role.VIEWER]: 'Visualizador - Pode apenas visualizar dados'
};

/**
 * Descrições amigáveis das permissões
 */
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  [Permission.PROJETO_CREATE]: 'Criar projetos',
  [Permission.PROJETO_READ]: 'Visualizar projetos',
  [Permission.PROJETO_UPDATE]: 'Editar projetos',
  [Permission.PROJETO_DELETE]: 'Deletar projetos',
  
  [Permission.PESQUISA_CREATE]: 'Criar pesquisas',
  [Permission.PESQUISA_READ]: 'Visualizar pesquisas',
  [Permission.PESQUISA_UPDATE]: 'Editar pesquisas',
  [Permission.PESQUISA_DELETE]: 'Deletar pesquisas',
  [Permission.PESQUISA_START]: 'Iniciar pesquisas',
  [Permission.PESQUISA_STOP]: 'Parar pesquisas',
  
  [Permission.IMPORTACAO_CREATE]: 'Importar dados',
  [Permission.IMPORTACAO_READ]: 'Visualizar importações',
  [Permission.IMPORTACAO_DELETE]: 'Deletar importações',
  
  [Permission.ENRIQUECIMENTO_EXECUTE]: 'Executar enriquecimento',
  [Permission.ENRIQUECIMENTO_READ]: 'Visualizar enriquecimentos',
  
  [Permission.ENTIDADE_READ]: 'Visualizar entidades',
  [Permission.ENTIDADE_UPDATE]: 'Editar entidades',
  [Permission.ENTIDADE_DELETE]: 'Deletar entidades',
  [Permission.ENTIDADE_EXPORT]: 'Exportar entidades',
  
  [Permission.ANALISE_READ]: 'Visualizar análises',
  [Permission.ANALISE_EXPORT]: 'Exportar análises',
  
  [Permission.USER_READ]: 'Visualizar usuários',
  [Permission.USER_CREATE]: 'Criar usuários',
  [Permission.USER_UPDATE]: 'Editar usuários',
  [Permission.USER_DELETE]: 'Deletar usuários',
  [Permission.ROLE_MANAGE]: 'Gerenciar papéis',
  [Permission.AUDIT_READ]: 'Visualizar auditoria',
  [Permission.SETTINGS_MANAGE]: 'Gerenciar configurações'
};
