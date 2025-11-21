/**
 * Helper de Retry com Backoff Exponencial
 * 
 * Implementa retry automático para chamadas de API com:
 * - Backoff exponencial (2^tentativa * baseDelay)
 * - Jitter aleatório para evitar thundering herd
 * - Limite configurável de tentativas
 * - Logs detalhados de cada tentativa
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number; // ms
  maxDelay?: number; // ms
  onRetry?: (error: Error, attempt: number, nextDelay: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 segundo
  maxDelay: 30000, // 30 segundos
  onRetry: () => {},
};

/**
 * Calcula delay com backoff exponencial e jitter
 */
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  // Backoff exponencial: 2^attempt * baseDelay
  const exponentialDelay = Math.pow(2, attempt) * baseDelay;
  
  // Adicionar jitter aleatório (±25%)
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  
  // Aplicar limite máximo
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Executa função com retry automático
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Se é a última tentativa, lançar erro
      if (attempt === opts.maxRetries) {
        console.error(`[Retry] Falha após ${opts.maxRetries + 1} tentativas:`, lastError);
        throw lastError;
      }

      // Calcular delay para próxima tentativa
      const delay = calculateDelay(attempt, opts.baseDelay, opts.maxDelay);
      
      console.warn(
        `[Retry] Tentativa ${attempt + 1}/${opts.maxRetries + 1} falhou. ` +
        `Aguardando ${Math.round(delay)}ms antes de tentar novamente...`,
        { error: lastError.message }
      );

      // Callback opcional
      opts.onRetry(lastError, attempt + 1, delay);

      // Aguardar antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Nunca deve chegar aqui, mas TypeScript precisa
  throw lastError || new Error('Retry failed');
}

/**
 * Wrapper específico para chamadas LLM
 */
export async function withLLMRetry<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T> {
  return withRetry(fn, {
    maxRetries: 3,
    baseDelay: 2000, // LLM pode demorar mais
    maxDelay: 60000, // 1 minuto
    onRetry: (error, attempt, delay) => {
      console.warn(
        `[LLM Retry] ${context} - Tentativa ${attempt} falhou. ` +
        `Próxima tentativa em ${Math.round(delay / 1000)}s`,
        { error: error.message }
      );
    },
  });
}

/**
 * Wrapper específico para chamadas de API externa (SERPAPI, ReceitaWS)
 */
export async function withAPIRetry<T>(
  fn: () => Promise<T>,
  apiName: string,
  context: string
): Promise<T> {
  return withRetry(fn, {
    maxRetries: 2, // APIs externas são mais instáveis
    baseDelay: 1500,
    maxDelay: 30000,
    onRetry: (error, attempt, delay) => {
      console.warn(
        `[${apiName} Retry] ${context} - Tentativa ${attempt} falhou. ` +
        `Próxima tentativa em ${Math.round(delay / 1000)}s`,
        { error: error.message }
      );
    },
  });
}
