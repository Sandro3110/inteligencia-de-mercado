import { getDb } from '../db';
import { pesquisas, enrichmentJobs, enrichmentConfigs } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  details?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Valida se um enriquecimento pode ser iniciado
 */
export async function validateEnrichmentStart(pesquisaId: number): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  try {
    const db = await getDb();
    if (!db) {
      errors.push({
        type: 'error',
        message: 'Falha na conexão com o banco de dados',
        details:
          'Não foi possível estabelecer conexão com o banco. Tente novamente em alguns instantes.',
      });
      return { isValid: false, errors, warnings };
    }

    // 1. Verificar se a pesquisa existe
    const [pesquisa] = await db
      .select()
      .from(pesquisas)
      .where(eq(pesquisas.id, pesquisaId))
      .limit(1);

    if (!pesquisa) {
      errors.push({
        type: 'error',
        message: 'Pesquisa não encontrada',
        details: 'A pesquisa solicitada não existe no banco de dados.',
      });
      return { isValid: false, errors, warnings };
    }

    // 2. Verificar se possui clientes
    if (pesquisa.totalClientes === 0) {
      errors.push({
        type: 'error',
        message: 'Pesquisa sem clientes',
        details: 'Esta pesquisa não possui clientes importados. Importe um arquivo CSV primeiro.',
      });
      return { isValid: false, errors, warnings };
    }

    // 3. Verificar se já existe job ativo
    const [activeJob] = await db
      .select()
      .from(enrichmentJobs)
      .where(and(eq(enrichmentJobs.projectId, pesquisaId), eq(enrichmentJobs.status, 'running')))
      .limit(1);

    if (activeJob) {
      errors.push({
        type: 'error',
        message: 'Enriquecimento já em andamento',
        details: `Já existe um enriquecimento ativo para esta pesquisa (Job ID: ${activeJob.id}). Aguarde a conclusão ou pause o job atual.`,
      });
      return { isValid: false, errors, warnings };
    }

    // 4. Verificar configuração de enriquecimento
    const [config] = await db
      .select()
      .from(enrichmentConfigs)
      .where(eq(enrichmentConfigs.pesquisaId, pesquisaId))
      .limit(1);

    if (!config) {
      errors.push({
        type: 'error',
        message: 'Configuração de enriquecimento não encontrada',
        details: 'Configure os parâmetros de enriquecimento antes de iniciar.',
      });
      return { isValid: false, errors, warnings };
    }

    // 5. Verificar API Key da OpenAI
    if (!process.env.OPENAI_API_KEY) {
      errors.push({
        type: 'error',
        message: 'Chave da API OpenAI não configurada',
        details: 'A variável de ambiente OPENAI_API_KEY não está definida.',
      });
      return { isValid: false, errors, warnings };
    }

    // 6. Avisos (não impedem início)

    // 6.1 Verificar se todos os clientes já foram enriquecidos
    if (pesquisa.clientesEnriquecidos === pesquisa.totalClientes) {
      warnings.push({
        type: 'warning',
        message: 'Todos os clientes já foram enriquecidos',
        details: `Esta pesquisa já possui ${pesquisa.totalClientes} clientes enriquecidos (100%). Continuar irá re-enriquecer todos os clientes.`,
      });
    }

    // 6.2 Verificar se está parcialmente enriquecido
    if (
      pesquisa.clientesEnriquecidos > 0 &&
      pesquisa.clientesEnriquecidos < pesquisa.totalClientes
    ) {
      warnings.push({
        type: 'warning',
        message: 'Pesquisa parcialmente enriquecida',
        details: `Esta pesquisa possui ${pesquisa.clientesEnriquecidos} de ${pesquisa.totalClientes} clientes já enriquecidos (${Math.round((pesquisa.clientesEnriquecidos / pesquisa.totalClientes) * 100)}%). Continuar irá processar apenas os clientes restantes.`,
      });
    }

    // 6.3 Verificar custo estimado (se muitos clientes)
    if (pesquisa.totalClientes > 500) {
      const estimatedCost = (pesquisa.totalClientes * 0.05).toFixed(2);
      warnings.push({
        type: 'warning',
        message: 'Alto volume de clientes',
        details: `Esta pesquisa possui ${pesquisa.totalClientes} clientes. O custo estimado de API é de aproximadamente $${estimatedCost} USD. O processamento pode levar várias horas.`,
      });
    }

    // Se chegou aqui, validação passou
    return {
      isValid: true,
      errors,
      warnings,
    };
  } catch (error) {
    console.error('[ValidationError]', error);
    errors.push({
      type: 'error',
      message: 'Erro ao validar enriquecimento',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
    return { isValid: false, errors, warnings };
  }
}
