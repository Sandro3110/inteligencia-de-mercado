import { toast } from 'sonner';

/**
 * Hook global para feedback consistente em toda aplicação
 * 
 * Padroniza mensagens de sucesso, erro, info e warning
 * com ações customizáveis e analytics integrado
 */
export function useFeedback() {
  
  /**
   * Feedback de sucesso
   */
  const success = (message: string, options?: {
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
    duration?: number;
  }) => {
    toast.success(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 4000,
    });
    
    // Analytics (opcional)
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Feedback Success', { message });
    }
  };

  /**
   * Feedback de erro
   */
  const error = (message: string, options?: {
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
    duration?: number;
  }) => {
    toast.error(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 6000,
    });
    
    // Analytics (opcional)
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Feedback Error', { message });
    }
  };

  /**
   * Feedback informativo
   */
  const info = (message: string, options?: {
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
    duration?: number;
  }) => {
    toast.info(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 4000,
    });
  };

  /**
   * Feedback de aviso
   */
  const warning = (message: string, options?: {
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
    duration?: number;
  }) => {
    toast.warning(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 5000,
    });
  };

  /**
   * Feedback de loading com promise
   */
  const promise = <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  };

  /**
   * Feedback de loading manual
   */
  const loading = (message: string) => {
    return toast.loading(message);
  };

  /**
   * Atualizar toast existente
   */
  const update = (toastId: string | number, options: {
    type?: 'success' | 'error' | 'info' | 'warning';
    message?: string;
    description?: string;
  }) => {
    const { type = 'info', message, description } = options;
    
    if (type === 'success') {
      toast.success(message || '', { id: toastId, description });
    } else if (type === 'error') {
      toast.error(message || '', { id: toastId, description });
    } else if (type === 'warning') {
      toast.warning(message || '', { id: toastId, description });
    } else {
      toast.info(message || '', { id: toastId, description });
    }
  };

  /**
   * Dismiss toast
   */
  const dismiss = (toastId?: string | number) => {
    toast.dismiss(toastId);
  };

  return {
    success,
    error,
    info,
    warning,
    promise,
    loading,
    update,
    dismiss,
  };
}

/**
 * Mensagens de erro padronizadas
 */
export const ErrorMessages = {
  // Rede
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  TIMEOUT: 'Tempo esgotado. Tente novamente.',
  SERVER_ERROR: 'Erro no servidor. Tente mais tarde.',
  
  // Autenticação
  UNAUTHORIZED: 'Você não tem permissão para esta ação.',
  SESSION_EXPIRED: 'Sessão expirada. Faça login novamente.',
  
  // Validação
  REQUIRED_FIELDS: 'Preencha todos os campos obrigatórios.',
  INVALID_FORMAT: 'Formato inválido. Verifique os dados.',
  INVALID_CNPJ: 'CNPJ inválido. Verifique os dígitos.',
  INVALID_EMAIL: 'Email inválido.',
  
  // Rate Limit
  RATE_LIMIT: 'Muitas requisições. Aguarde alguns minutos.',
  BLOCKED: 'Usuário bloqueado temporariamente.',
  
  // Genérico
  UNKNOWN: 'Erro desconhecido. Contate o suporte.',
};

/**
 * Mensagens de sucesso padronizadas
 */
export const SuccessMessages = {
  // CRUD
  CREATED: 'Criado com sucesso!',
  UPDATED: 'Atualizado com sucesso!',
  DELETED: 'Deletado com sucesso!',
  SAVED: 'Salvo com sucesso!',
  
  // Importação
  IMPORTED: 'Dados importados com sucesso!',
  EXPORTED: 'Dados exportados com sucesso!',
  
  // Enriquecimento
  ENRICHED: 'Dados enriquecidos com sucesso!',
  PROCESSED: 'Processamento concluído!',
  
  // Genérico
  SUCCESS: 'Operação concluída com sucesso!',
};
