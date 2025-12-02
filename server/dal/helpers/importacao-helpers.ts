/**
 * Helpers para importação
 * Funções auxiliares para preencher campos automáticos durante importação
 */

import { getOrCreateTempoByData } from '../dimensoes/tempo';
import { getCanalImportacaoPadrao } from '../dimensoes/canal';

/**
 * Obter tempo_id para data de qualificação
 * Se não fornecida, usa data atual
 */
export async function getTempoIdForImportacao(dataQualificacao?: Date): Promise<number> {
  const data = dataQualificacao || new Date();
  
  try {
    return await getOrCreateTempoByData(data);
  } catch (error) {
    // Se data fora do range, usar data atual
    console.warn(`Data ${data.toISOString()} fora do range, usando data atual`);
    return await getOrCreateTempoByData(new Date());
  }
}

/**
 * Obter canal_id padrão para importação
 */
export async function getCanalIdForImportacao(): Promise<number> {
  const canal = await getCanalImportacaoPadrao();
  
  if (!canal) {
    throw new Error('Canal de importação padrão não encontrado');
  }
  
  return canal.id;
}

/**
 * Preparar dados de contexto para importação
 * Adiciona campos automáticos (tempo_id, canal_id, data_qualificacao)
 */
export async function prepararDadosImportacao(data: {
  dataQualificacao?: Date;
  [key: string]: any;
}) {
  const dataQualificacao = data.dataQualificacao || new Date();
  const tempoId = await getTempoIdForImportacao(dataQualificacao);
  const canalId = await getCanalIdForImportacao();
  
  return {
    ...data,
    dataQualificacao,
    tempoId,
    canalId,
  };
}

/**
 * Calcular métricas iniciais para importação
 * Pode ser expandido futuramente com lógica de cálculo
 */
export function calcularMetricasIniciais(data: {
  porte?: string;
  faturamentoEstimado?: number;
  numFuncionarios?: number;
  [key: string]: any;
}) {
  // Por enquanto, retorna valores padrão
  // Futuramente pode ter lógica de cálculo baseada em porte, setor, etc
  
  const metricas: any = {};
  
  // Score fit inicial baseado em completude de dados
  let completude = 0;
  if (data.porte) completude += 25;
  if (data.faturamentoEstimado) completude += 25;
  if (data.numFuncionarios) completude += 25;
  if (data.cnae) completude += 25;
  
  metricas.scoreFit = completude;
  
  // Segmentação ABC inicial baseada em faturamento
  if (data.faturamentoEstimado) {
    if (data.faturamentoEstimado > 50000000) {
      metricas.segmentoAbc = 'A';
    } else if (data.faturamentoEstimado > 10000000) {
      metricas.segmentoAbc = 'B';
    } else {
      metricas.segmentoAbc = 'C';
    }
  }
  
  return metricas;
}
