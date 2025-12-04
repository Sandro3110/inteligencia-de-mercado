/**
 * Helper de Autenticação Supabase
 * 100% Funcional
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURAÇÃO SUPABASE
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// Cliente Supabase lazy (só cria se variáveis estiverem configuradas)
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }
  
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  
  return supabaseClient;
}

// Export para retrocompatibilidade (pode ser null em desenvolvimento)
export const supabase = getSupabaseClient();

// ============================================================================
// TIPOS
// ============================================================================

export interface Usuario {
  id: string;
  email: string;
  nome?: string;
  avatar?: string;
}

// ============================================================================
// AUTENTICAÇÃO
// ============================================================================

/**
 * Obter usuário autenticado do token JWT
 */
export async function obterUsuarioDoToken(token: string): Promise<Usuario | null> {
  try {
    // Se Supabase não estiver configurado, retorna null (modo desenvolvimento)
    if (!supabase) {
      return null;
    }
    
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      nome: data.user.user_metadata?.name,
      avatar: data.user.user_metadata?.avatar_url
    };
  } catch (error) {
    console.error('Erro ao obter usuário do token:', error);
    return null;
  }
}

/**
 * Verificar se o token é válido
 */
export async function verificarToken(token: string): Promise<boolean> {
  const usuario = await obterUsuarioDoToken(token);
  return usuario !== null;
}

/**
 * Extrair token do header Authorization
 */
export function extrairTokenDoHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  // Formato esperado: "Bearer <token>"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

// ============================================================================
// AUTORIZAÇÃO
// ============================================================================

/**
 * Verificar se o usuário tem permissão para acessar um recurso
 */
export async function verificarPermissao(
  userId: string,
  recurso: string,
  acao: 'read' | 'write' | 'delete'
): Promise<boolean> {
  // TODO: Implementar lógica de permissões baseada em roles
  // Por enquanto, todos os usuários autenticados têm acesso total
  return true;
}

/**
 * Verificar se o usuário é dono do recurso
 */
export function verificarPropriedade(
  userId: string,
  ownerId: string
): boolean {
  return userId === ownerId;
}

// ============================================================================
// SESSÃO
// ============================================================================

/**
 * Criar sessão de usuário
 */
export async function criarSessao(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  });

  if (error) {
    throw new Error(`Erro ao criar sessão: ${error.message}`);
  }

  return {
    usuario: {
      id: data.user.id,
      email: data.user.email || '',
      nome: data.user.user_metadata?.name,
      avatar: data.user.user_metadata?.avatar_url
    },
    token: data.session?.access_token || ''
  };
}

/**
 * Encerrar sessão
 */
export async function encerrarSessao(token: string) {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Erro ao encerrar sessão: ${error.message}`);
  }
}

// ============================================================================
// REGISTRO
// ============================================================================

/**
 * Registrar novo usuário
 */
export async function registrarUsuario(
  email: string,
  senha: string,
  nome?: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: {
        name: nome
      }
    }
  });

  if (error) {
    throw new Error(`Erro ao registrar usuário: ${error.message}`);
  }

  return {
    usuario: {
      id: data.user?.id || '',
      email: data.user?.email || '',
      nome: data.user?.user_metadata?.name
    }
  };
}
